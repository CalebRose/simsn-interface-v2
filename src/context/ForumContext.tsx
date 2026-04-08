import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { ForumService } from "../_services/forumService";
import {
  Forum,
  Thread,
  Post,
  Poll,
  PollVote,
  ForumNotification,
  GameReference,
  CreateThreadDTO,
  CreatePostDTO,
  UpdatePostDTO,
  CreateReportDTO,
  ForumRole,
  ForumPermissions,
  ReactionType,
} from "../models/forumModels";
import { CurrentUser } from "../_hooks/useCurrentUser";
import { getUserLogoUrl } from "../_utility/getLogo";
import { parseForumBody } from "../components/Forum/forumUtils";

// ─────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────

function deriveForumRole(currentUser: CurrentUser | null): ForumRole {
  if (!currentUser) return "guest";
  if (currentUser.roleID === "Admin" || currentUser.roleID === "admin")
    return "admin";
  if (
    currentUser.roleID &&
    currentUser.roleID.toLowerCase().includes("commissioner")
  )
    return "commissioner";
  const hasMemberTeam =
    (currentUser.teamId && currentUser.teamId > 0) ||
    (currentUser.NFLTeamID && currentUser.NFLTeamID > 0) ||
    (currentUser.cbb_id && currentUser.cbb_id > 0) ||
    (currentUser.NBATeamID && currentUser.NBATeamID > 0) ||
    (currentUser.CHLTeamID && currentUser.CHLTeamID > 0) ||
    (currentUser.PHLTeamID && currentUser.PHLTeamID > 0) ||
    currentUser.MLBOrgID != null ||
    currentUser.CollegeBaseballOrgID != null;
  return hasMemberTeam ? "member" : "guest";
}

export function derivePermissions(role: ForumRole): ForumPermissions {
  const isAdmin = role === "admin";
  const isCommish = role === "commissioner" || isAdmin;
  const isMember = role === "member" || isCommish;

  return {
    canRead: true,
    canCreateThread: isMember,
    canReply: isMember,
    canEditOwnPost: isMember,
    canDeleteOwnPost: isCommish,
    canVoteInPoll: isMember,
    canLockThread: isCommish,
    canDeleteAnyPost: isCommish,
    canEditAnyPost: isCommish,
    canPinThread: isAdmin,
    canManageForums: isAdmin,
    canMoveAnyThread: isCommish,
  };
}

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────

interface ForumContextProps {
  // State
  forums: Forum[];
  forumsLoading: boolean;
  threads: Thread[];
  pinnedThreads: Thread[];
  threadsLoading: boolean;
  activeThread: Thread | null;
  posts: Post[];
  postsLoading: boolean;
  activePoll: Poll | null;
  userPollVote: PollVote | null;
  notifications: ForumNotification[];
  unreadCount: number;
  forumRole: ForumRole;
  permissions: ForumPermissions;
  isMuted: boolean;
  muteExpiresAt: Date | null;
  threadsCursor: QueryDocumentSnapshot | null;
  hasMoreThreads: boolean;

  // Actions
  loadForums: () => Promise<void>;
  loadThreadsForForum: (forumId: string, reset?: boolean) => Promise<void>;
  loadMoreThreads: (forumId: string) => Promise<void>;
  loadThread: (threadId: string) => Promise<void>;
  loadPostsForThread: (threadId: string, reset?: boolean) => Promise<void>;
  loadPoll: (threadId: string, uid: string) => Promise<void>;
  createThread: (dto: CreateThreadDTO) => Promise<string | null>;
  createPost: (dto: CreatePostDTO) => Promise<string | null>;
  updatePost: (postId: string, dto: UpdatePostDTO) => Promise<void>;
  softDeletePost: (postId: string, reason?: string) => Promise<void>;
  lockThread: (threadId: string, reason?: string) => Promise<void>;
  unlockThread: (threadId: string, reason?: string) => Promise<void>;
  pinThread: (threadId: string) => Promise<void>;
  unpinThread: (threadId: string) => Promise<void>;
  softDeleteThread: (threadId: string, reason?: string) => Promise<void>;
  moveThread: (
    threadId: string,
    newForumId: string,
    reason?: string,
  ) => Promise<void>;
  submitPollVote: (
    pollId: string,
    selectedOptionIds: string[],
  ) => Promise<void>;
  changeVote: (pollId: string, selectedOptionIds: string[]) => Promise<void>;
  updatePollSettings: (
    pollId: string,
    updates: { allowResultsPreview?: boolean; allowVoteChange?: boolean },
  ) => Promise<void>;
  togglePoll: (pollId: string, close: boolean) => Promise<void>;
  reactToPost: (postId: string, reaction: ReactionType) => Promise<void>;
  reportPost: (dto: CreateReportDTO) => Promise<void>;
  loadNotifications: (uid: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: (uid: string) => Promise<void>;
  clearNotifications: (uid: string) => Promise<void>;
  setCurrentUser: (user: CurrentUser | null) => void;
}

// ─────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────

const defaultForumContext: ForumContextProps = {
  forums: [],
  forumsLoading: false,
  threads: [],
  pinnedThreads: [],
  threadsLoading: false,
  activeThread: null,
  posts: [],
  postsLoading: false,
  activePoll: null,
  userPollVote: null,
  notifications: [],
  unreadCount: 0,
  forumRole: "guest",
  permissions: derivePermissions("guest"),
  isMuted: false,
  muteExpiresAt: null,
  threadsCursor: null,
  hasMoreThreads: false,
  loadForums: async () => {},
  loadThreadsForForum: async () => {},
  loadMoreThreads: async () => {},
  loadThread: async () => {},
  loadPostsForThread: async () => {},
  loadPoll: async () => {},
  createThread: async () => null,
  createPost: async () => null,
  updatePost: async () => {},
  softDeletePost: async () => {},
  lockThread: async () => {},
  unlockThread: async () => {},
  pinThread: async () => {},
  unpinThread: async () => {},
  softDeleteThread: async () => {},
  moveThread: async () => {},
  submitPollVote: async () => {},
  changeVote: async () => {},
  updatePollSettings: async () => {},
  togglePoll: async () => {},
  reactToPost: async () => {},
  reportPost: async () => {},
  loadNotifications: async () => {},
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},
  clearNotifications: async () => {},
  setCurrentUser: () => {},
};

// ─────────────────────────────────────────────
// Context & Provider
// ─────────────────────────────────────────────

export const ForumContext =
  createContext<ForumContextProps>(defaultForumContext);

interface ForumProviderProps {
  children: ReactNode;
  currentUser: CurrentUser | null;
}

export const ForumProvider: React.FC<ForumProviderProps> = ({
  children,
  currentUser: initialUser,
}) => {
  const [currentUserState, setCurrentUserState] = useState<CurrentUser | null>(
    initialUser,
  );
  const [forums, setForums] = useState<Forum[]>([]);
  const [forumsLoading, setForumsLoading] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [pinnedThreads, setPinnedThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [userPollVote, setUserPollVote] = useState<PollVote | null>(null);
  const [notifications, setNotifications] = useState<ForumNotification[]>([]);
  const [threadsCursor, setThreadsCursor] =
    useState<QueryDocumentSnapshot | null>(null);
  const [hasMoreThreads, setHasMoreThreads] = useState(false);

  const PAGE_SIZE = 25;

  const postsUnsubscribeRef = useRef<(() => void) | null>(null);
  const notificationsUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setCurrentUserState(initialUser);
  }, [initialUser]);

  // Subscribe to notifications in real-time whenever currentUser changes
  useEffect(() => {
    notificationsUnsubscribeRef.current?.();
    notificationsUnsubscribeRef.current = null;

    if (!initialUser?.id) {
      setNotifications([]);
      return;
    }

    notificationsUnsubscribeRef.current = ForumService.SubscribeToNotifications(
      initialUser.id,
      (incoming) => setNotifications(incoming),
    );

    return () => {
      notificationsUnsubscribeRef.current?.();
      notificationsUnsubscribeRef.current = null;
    };
  }, [initialUser?.id]);

  // Tear down all subscriptions on unmount
  useEffect(() => {
    return () => {
      postsUnsubscribeRef.current?.();
      notificationsUnsubscribeRef.current?.();
    };
  }, []);

  const forumRole = useMemo(
    () => deriveForumRole(currentUserState),
    [currentUserState],
  );

  const { isMuted, muteExpiresAt } = useMemo(() => {
    const raw = currentUserState?.forumMutedUntil;
    if (!raw) return { isMuted: false, muteExpiresAt: null };
    const expires = new Date(raw);
    const muted =
      expires > new Date() &&
      forumRole !== "admin" &&
      forumRole !== "commissioner";
    return { isMuted: muted, muteExpiresAt: muted ? expires : null };
  }, [currentUserState?.forumMutedUntil, forumRole]);

  const permissions = useMemo(() => {
    const base = derivePermissions(forumRole);
    if (isMuted) {
      return { ...base, canReply: false, canCreateThread: false };
    }
    return base;
  }, [forumRole, isMuted]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  // ─── Forums ───────────────────────────────────

  const loadForums = useCallback(async () => {
    setForumsLoading(true);
    try {
      const result = await ForumService.GetAllForums();
      setForums(result);
    } catch (err) {
      console.error("ForumContext.loadForums:", err);
    } finally {
      setForumsLoading(false);
    }
  }, []);

  // ─── Threads ──────────────────────────────────

  const loadThreadsForForum = useCallback(
    async (forumId: string, reset = true) => {
      setThreadsLoading(true);
      if (reset) {
        setThreads([]);
        setThreadsCursor(null);
      }
      try {
        const [pinned, { threads: normalThreads, lastDoc }] = await Promise.all(
          [
            ForumService.GetPinnedThreads(forumId),
            ForumService.GetThreadsByForum(forumId, PAGE_SIZE),
          ],
        );
        setPinnedThreads(pinned);
        setThreads(normalThreads);
        setThreadsCursor(lastDoc);
        setHasMoreThreads(normalThreads.length === PAGE_SIZE);
      } catch (err) {
        console.error("ForumContext.loadThreadsForForum:", err);
      } finally {
        setThreadsLoading(false);
      }
    },
    [],
  );

  const loadMoreThreads = useCallback(
    async (forumId: string) => {
      if (!threadsCursor) return;
      setThreadsLoading(true);
      try {
        const { threads: more, lastDoc } = await ForumService.GetThreadsByForum(
          forumId,
          PAGE_SIZE,
          threadsCursor,
        );
        setThreads((prev) => [...prev, ...more]);
        setThreadsCursor(lastDoc);
        setHasMoreThreads(more.length === PAGE_SIZE);
      } catch (err) {
        console.error("ForumContext.loadMoreThreads:", err);
      } finally {
        setThreadsLoading(false);
      }
    },
    [threadsCursor],
  );

  const loadThread = useCallback(async (threadId: string) => {
    try {
      const thread = await ForumService.GetThreadById(threadId);
      setActiveThread(thread);
    } catch (err) {
      console.error("ForumContext.loadThread:", err);
    }
  }, []);

  // ─── Posts ────────────────────────────────────

  const loadPostsForThread = useCallback(
    async (threadId: string, reset = true): Promise<void> => {
      // Tear down any existing subscription first
      if (postsUnsubscribeRef.current) {
        postsUnsubscribeRef.current();
        postsUnsubscribeRef.current = null;
      }
      if (reset) setPosts([]);
      setPostsLoading(true);

      postsUnsubscribeRef.current = ForumService.SubscribeToThreadPosts(
        threadId,
        (newPosts) => {
          setPosts(newPosts);
          setPostsLoading(false);
        },
      );
    },
    [],
  );

  // ─── Poll ─────────────────────────────────────

  const loadPoll = useCallback(async (threadId: string, uid: string) => {
    try {
      const poll = await ForumService.GetPollByThreadId(threadId);
      setActivePoll(poll);
      if (poll && uid) {
        const vote = await ForumService.GetPollVoteForUser(poll.id, uid);
        setUserPollVote(vote);
      }
    } catch (err) {
      console.error("ForumContext.loadPoll:", err);
    }
  }, []);

  // ─── Create Thread ────────────────────────────

  const createThread = useCallback(
    async (dto: CreateThreadDTO): Promise<string | null> => {
      if (!currentUserState) return null;
      try {
        const logoUrl = getUserLogoUrl(currentUserState);
        const { threadId, postId } = await ForumService.CreateThread(
          dto,
          currentUserState.id,
          currentUserState.username,
          currentUserState.username,
          logoUrl || undefined,
        );
        // Send mention notifications for the opening post (fire-and-forget)
        if (dto.mentions && dto.mentions.length > 0) {
          ForumService.SendMentionNotifications(
            dto.mentions,
            currentUserState.id,
            currentUserState.username,
            threadId,
            postId,
            dto.title,
          ).catch(console.error);
        }
        return threadId;
      } catch (err) {
        console.error("ForumContext.createThread:", err);
        return null;
      }
    },
    [currentUserState],
  );

  // ─── Create Post ─────────────────────────────

  const createPost = useCallback(
    async (dto: CreatePostDTO): Promise<string | null> => {
      if (!currentUserState) return null;
      try {
        const logoUrl = getUserLogoUrl(currentUserState);
        const postId = await ForumService.CreatePost(
          dto,
          currentUserState.id,
          currentUserState.username,
          currentUserState.username,
          logoUrl || undefined,
        );
        // Send mention notifications (fire-and-forget)
        if (postId && dto.mentions && dto.mentions.length > 0 && activeThread) {
          ForumService.SendMentionNotifications(
            dto.mentions,
            currentUserState.id,
            currentUserState.username,
            dto.threadId,
            postId,
            activeThread.title,
          ).catch(console.error);
        }
        // onSnapshot listener handles state update automatically
        return postId;
      } catch (err) {
        console.error("ForumContext.createPost:", err);
        return null;
      }
    },
    [currentUserState, activeThread],
  );

  // ─── Update Post ─────────────────────────────

  const updatePost = useCallback(
    async (postId: string, dto: UpdatePostDTO) => {
      if (!currentUserState) return;
      try {
        await ForumService.UpdatePost(
          postId,
          { ...dto, editorUsername: currentUserState.username },
          currentUserState.id,
        );
        const isFirstPost = activeThread?.firstPostId === postId;
        const parsedBody = isFirstPost ? parseForumBody(dto.body) : null;
        const nextBodyText =
          parsedBody?.bodyTextWithoutFeatureImage ?? dto.bodyText;

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  body: dto.body,
                  bodyText: nextBodyText,
                  isEdited: true,
                  editedByUsername: currentUserState.username,
                }
              : p,
          ),
        );
        if (isFirstPost) {
          setActiveThread((prev) =>
            prev
              ? {
                  ...prev,
                  contentPreview:
                    parsedBody?.previewWithoutFeatureImage ??
                    prev.contentPreview,
                  featureImageUrl:
                    parsedBody?.featureImageUrl ?? prev.featureImageUrl,
                }
              : prev,
          );
        }
      } catch (err) {
        console.error("ForumContext.updatePost:", err);
      }
    },
    [activeThread?.firstPostId, currentUserState],
  );

  // ─── Soft Delete Post ─────────────────────────

  const softDeletePost = useCallback(
    async (postId: string, reason?: string) => {
      if (!currentUserState) return;
      try {
        await ForumService.SoftDeletePost(postId, currentUserState.id, reason);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isDeleted: true } : p)),
        );
      } catch (err) {
        console.error("ForumContext.softDeletePost:", err);
      }
    },
    [currentUserState],
  );

  // ─── Moderation ───────────────────────────────

  const buildPerformedBy = () => ({
    uid: currentUserState?.id ?? "",
    username: currentUserState?.username ?? "",
  });

  const lockThread = useCallback(
    async (threadId: string, reason?: string) => {
      if (!currentUserState) return;
      await ForumService.LockThread(threadId, buildPerformedBy(), reason);
      setActiveThread((prev) =>
        prev && prev.id === threadId ? { ...prev, isLocked: true } : prev,
      );
    },
    [currentUserState],
  );

  const unlockThread = useCallback(
    async (threadId: string, reason?: string) => {
      if (!currentUserState) return;
      await ForumService.UnlockThread(threadId, buildPerformedBy(), reason);
      setActiveThread((prev) =>
        prev && prev.id === threadId ? { ...prev, isLocked: false } : prev,
      );
    },
    [currentUserState],
  );

  const pinThread = useCallback(
    async (threadId: string) => {
      if (!currentUserState) return;
      await ForumService.PinThread(threadId, buildPerformedBy());
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, isPinned: true } : t)),
      );
    },
    [currentUserState],
  );

  const unpinThread = useCallback(
    async (threadId: string) => {
      if (!currentUserState) return;
      await ForumService.UnpinThread(threadId, buildPerformedBy());
      setPinnedThreads((prev) => prev.filter((t) => t.id !== threadId));
    },
    [currentUserState],
  );

  const softDeleteThread = useCallback(
    async (threadId: string, reason?: string) => {
      if (!currentUserState) return;
      await ForumService.SoftDeleteThread(threadId, buildPerformedBy(), reason);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setPinnedThreads((prev) => prev.filter((t) => t.id !== threadId));
    },
    [currentUserState],
  );

  const moveThread = useCallback(
    async (threadId: string, newForumId: string, reason?: string) => {
      if (!currentUserState) return;
      await ForumService.MoveThread(
        threadId,
        newForumId,
        forums,
        buildPerformedBy(),
        reason,
      );
      // Re-fetch updated thread so breadcrumbs / forumPath reflect the move
      const updated = await ForumService.GetThreadById(threadId);
      setActiveThread(updated);
    },
    [currentUserState, forums],
  );

  // ─── Poll Voting ─────────────────────────────

  const submitPollVote = useCallback(
    async (pollId: string, selectedOptionIds: string[]) => {
      if (!currentUserState) return;
      try {
        await ForumService.SubmitPollVote(
          pollId,
          currentUserState.id,
          currentUserState.username,
          selectedOptionIds,
        );
        // Re-fetch updated poll
        if (activeThread) {
          await loadPoll(activeThread.id, currentUserState.id);
        }
      } catch (err) {
        console.error("ForumContext.submitPollVote:", err);
        throw err;
      }
    },
    [currentUserState, activeThread, loadPoll],
  );

  // ─── Toggle Poll ─────────────────────────────

  const togglePoll = useCallback(async (pollId: string, close: boolean) => {
    try {
      await ForumService.TogglePoll(pollId, close);
      setActivePoll((prev) => (prev ? { ...prev, isClosed: close } : prev));
    } catch (err) {
      console.error("ForumContext.togglePoll:", err);
    }
  }, []);

  // ─── Change Vote ─────────────────────────────

  const changeVote = useCallback(
    async (pollId: string, selectedOptionIds: string[]) => {
      if (!currentUserState) return;
      try {
        await ForumService.ChangeVote(
          pollId,
          currentUserState.id,
          currentUserState.username,
          selectedOptionIds,
        );
        if (activeThread) {
          await loadPoll(activeThread.id, currentUserState.id);
        }
      } catch (err) {
        console.error("ForumContext.changeVote:", err);
        throw err;
      }
    },
    [currentUserState, activeThread, loadPoll],
  );

  // ─── Update Poll Settings ────────────────────

  const updatePollSettings = useCallback(
    async (
      pollId: string,
      updates: { allowResultsPreview?: boolean; allowVoteChange?: boolean },
    ) => {
      try {
        await ForumService.UpdatePollSettings(pollId, updates);
        setActivePoll((prev) => (prev ? { ...prev, ...updates } : prev));
      } catch (err) {
        console.error("ForumContext.updatePollSettings:", err);
      }
    },
    [],
  );

  // ─── Reactions ───────────────────────────────

  const reactToPost = useCallback(
    async (postId: string, reaction: ReactionType) => {
      if (!currentUserState) return;
      try {
        const post = posts.find((p) => p.id === postId);
        const existingReactors = post?.reactions?.[reaction] ?? [];
        const isAdding = !existingReactors.includes(currentUserState.id);

        await ForumService.AddReaction(postId, reaction, currentUserState.id);

        if (isAdding && post && post.author.uid !== currentUserState.id) {
          await ForumService.SendReactionNotification(
            post.author.uid,
            currentUserState.id,
            currentUserState.username,
            activeThread?.id ?? "",
            postId,
            activeThread?.title ?? "",
            reaction,
          );
        }
      } catch (err) {
        console.error("ForumContext.reactToPost:", err);
      }
    },
    [currentUserState, posts, activeThread],
  );

  // ─── Report Post ─────────────────────────────

  const reportPost = useCallback(
    async (dto: CreateReportDTO) => {
      if (!currentUserState) return;
      try {
        await ForumService.ReportPost(
          dto,
          currentUserState.id,
          currentUserState.username,
        );
      } catch (err) {
        console.error("ForumContext.reportPost:", err);
        throw err;
      }
    },
    [currentUserState],
  );

  // ─── Notifications ───────────────────────────

  const loadNotifications = useCallback(async (uid: string) => {
    try {
      const result = await ForumService.GetNotificationsForUser(uid);
      setNotifications(result);
    } catch (err) {
      console.error("ForumContext.loadNotifications:", err);
    }
  }, []);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await ForumService.MarkNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("ForumContext.markNotificationRead:", err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async (uid: string) => {
    try {
      await ForumService.MarkAllNotificationsRead(uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("ForumContext.markAllNotificationsRead:", err);
    }
  }, []);

  const clearNotifications = useCallback(async (uid: string) => {
    try {
      await ForumService.ClearAllNotifications(uid);
      setNotifications([]);
    } catch (err) {
      console.error("ForumContext.clearNotifications:", err);
    }
  }, []);

  return (
    <ForumContext.Provider
      value={{
        forums,
        forumsLoading,
        threads,
        pinnedThreads,
        threadsLoading,
        activeThread,
        posts,
        postsLoading,
        activePoll,
        userPollVote,
        notifications,
        unreadCount,
        forumRole,
        permissions,
        isMuted,
        muteExpiresAt,
        threadsCursor,
        hasMoreThreads,
        loadForums,
        loadThreadsForForum,
        loadMoreThreads,
        loadThread,
        loadPostsForThread,
        loadPoll,
        createThread,
        createPost,
        updatePost,
        softDeletePost,
        lockThread,
        unlockThread,
        pinThread,
        unpinThread,
        softDeleteThread,
        moveThread,
        submitPollVote,
        changeVote,
        updatePollSettings,
        togglePoll,
        reactToPost,
        reportPost,
        loadNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        setCurrentUser: setCurrentUserState,
      }}
    >
      {children}
    </ForumContext.Provider>
  );
};

// ─────────────────────────────────────────────
// Custom hook
// ─────────────────────────────────────────────

export const useForumStore = (): ForumContextProps => {
  const store = useContext(ForumContext);
  if (!store) {
    throw new Error("useForumStore must be used within a ForumProvider");
  }
  return store;
};
