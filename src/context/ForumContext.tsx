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
import { QueryDocumentSnapshot, collection, getDocs } from "firebase/firestore";
import { ForumService } from "../_services/forumService";
import {
  Forum,
  Thread,
  Post,
  Poll,
  PollVote,
  ForumNotification,
  GameReference,
  Achievement,
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

// ─────────────────────────────────────────────
// User activity cache types
// ─────────────────────────────────────────────

export interface UserActivity {
  threads: Thread[];
  posts: Post[];
  fetchedAt: number;
}

const USER_ACTIVITY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FORUMS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — forum list rarely changes
const THREAD_PAGE_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes — active forums update often
const THREAD_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes — thread metadata

interface CachedForums {
  forums: Forum[];
  fetchedAt: number;
}

interface CachedThreadPage {
  threads: Thread[];
  pinnedThreads: Thread[];
  lastDoc: QueryDocumentSnapshot | null;
  fetchedAt: number;
}

interface CachedThread {
  thread: Thread;
  fetchedAt: number;
}

interface CachedAchievements {
  achievements: Achievement[];
  fetchedAt: number;
}

const ACHIEVEMENTS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — achievements rarely change

interface CachedPosts {
  posts: Post[];
  cachedAt: number;
}

const POSTS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — pre-populate on return visits
import { parseForumBody } from "../components/Forum/forumUtils";
import { firestore } from "../firebase/firebase";

// ─────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────

/**
 * Forums where subscribers (logged-in users without a team) may always create
 * threads and reply, regardless of the Firestore `subscribersCanPost` flag.
 */
export const OPEN_FORUM_IDS: ReadonlySet<string> = new Set([
  "welcome",
  "welcome-intro-help",
  "welcome-job-applications",
]);

/**
 * Returns true when a guest (any logged-in user without a team) may post in
 * this forum. Checks the hardcoded open-forum list AND the Firestore
 * `visibility: "guest"` flag so either mechanism works.
 */
export function canGuestPostInForum(forum: Forum): boolean {
  return OPEN_FORUM_IDS.has(forum.id) || forum.visibility === "guest";
}

/**
 * Returns true if a subscriber (admin-granted role) may post in the given
 * forum. Subscribers inherit guest access and additionally gain access to
 * forums explicitly flagged with `subscribersCanPost`.
 */
export function canSubscriberPostInForum(forum: Forum): boolean {
  return canGuestPostInForum(forum) || forum.subscribersCanPost === true;
}

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
    (currentUser.MLBOrgID && currentUser.MLBOrgID > 0) ||
    (currentUser.CollegeBaseballOrgID && currentUser.CollegeBaseballOrgID > 0);
  if (hasMemberTeam) return "member";
  // Admin can explicitly grant subscriber status via roleID
  if (currentUser.roleID && currentUser.roleID.toLowerCase() === "subscriber")
    return "subscriber";
  // Logged-in users without a team default to guest
  return "guest";
}

export function derivePermissions(role: ForumRole): ForumPermissions {
  const isAdmin = role === "admin";
  const isCommish = role === "commissioner" || isAdmin;
  const isMember = role === "member" || isCommish;
  const isSubscriber = role === "subscriber" || isMember;
  // Both unauthenticated and logged-in-no-team users carry the "guest" role;
  // all higher roles inherit guest read access.
  const isGuest = role === "guest" || isSubscriber;

  return {
    canRead: isGuest,
    canCreateThread: isMember,
    canReply: isMember,
    canEditOwnPost: isMember,
    canDeleteOwnPost: isCommish,
    canVoteInPoll: isSubscriber,
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
  userMap: Record<string, CurrentUser>;
  userListOptions: { label: string; value: string }[];
  getOrFetchUserActivity: (
    uid: string,
    count?: number,
  ) => Promise<UserActivity>;
  getOrFetchAchievements: (uid: string) => Promise<Achievement[]>;

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
  userMap: {},
  userListOptions: [],
  getOrFetchUserActivity: async () => ({
    threads: [],
    posts: [],
    fetchedAt: 0,
  }),
  getOrFetchAchievements: async () => [],
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
  const [users, setUsers] = useState<(CurrentUser & { id: string })[] | null>(
    null,
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
  const userActivityCacheRef = useRef<Map<string, UserActivity>>(new Map());
  const forumsCacheRef = useRef<CachedForums | null>(null);
  const threadPageCacheRef = useRef<Map<string, CachedThreadPage>>(new Map());
  const threadCacheRef = useRef<Map<string, CachedThread>>(new Map());
  const achievementsCacheRef = useRef<Map<string, CachedAchievements>>(
    new Map(),
  );
  const postsCacheRef = useRef<Map<string, CachedPosts>>(new Map());

  // One-time fetch — user display data (names, logos) doesn't need real-time updates
  // and a live subscription on the whole collection is expensive.
  useEffect(() => {
    getDocs(collection(firestore, "users"))
      .then((snap) =>
        setUsers(
          snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as CurrentUser & { id: string },
          ),
        ),
      )
      .catch(console.error);
  }, []);

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

  const userMap = useMemo(() => {
    const map: Record<string, CurrentUser> = {};
    if (!users) return map;
    users.forEach((user) => {
      if (!user) return;
      map[user.id] = user;
    });
    return map;
  }, [users]);

  const userListOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];
    if (!users) return options;
    const sortedUsers = [...users].sort((a, b) => {
      const nameA = a.username?.toLowerCase() || "";
      const nameB = b.username?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });
    sortedUsers.forEach((user) => {
      if (!user) return;
      options.push({ label: user.username, value: user.id });
    });
    return options;
  }, [users]);

  // ─── Forums ───────────────────────────────────

  const loadForums = useCallback(async () => {
    const cached = forumsCacheRef.current;
    if (cached && Date.now() - cached.fetchedAt < FORUMS_CACHE_TTL_MS) {
      setForums(cached.forums);
      return;
    }
    setForumsLoading(true);
    try {
      const result = await ForumService.GetAllForums();
      forumsCacheRef.current = { forums: result, fetchedAt: Date.now() };
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
      if (reset) {
        const cached = threadPageCacheRef.current.get(forumId);
        if (
          cached &&
          Date.now() - cached.fetchedAt < THREAD_PAGE_CACHE_TTL_MS
        ) {
          setPinnedThreads(cached.pinnedThreads);
          setThreads(cached.threads);
          setThreadsCursor(cached.lastDoc);
          setHasMoreThreads(cached.threads.length === PAGE_SIZE);
          return;
        }
        setThreads([]);
        setThreadsCursor(null);
      }
      setThreadsLoading(true);
      try {
        const [pinned, { threads: normalThreads, lastDoc }] = await Promise.all(
          [
            ForumService.GetPinnedThreads(forumId),
            ForumService.GetThreadsByForum(forumId, PAGE_SIZE),
          ],
        );
        if (reset) {
          threadPageCacheRef.current.set(forumId, {
            threads: normalThreads,
            pinnedThreads: pinned,
            lastDoc,
            fetchedAt: Date.now(),
          });
        }
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
    const cached = threadCacheRef.current.get(threadId);
    if (cached && Date.now() - cached.fetchedAt < THREAD_CACHE_TTL_MS) {
      setActiveThread(cached.thread);
      return;
    }
    try {
      const thread = await ForumService.GetThreadById(threadId);
      if (thread) {
        threadCacheRef.current.set(threadId, { thread, fetchedAt: Date.now() });
      }
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

      if (reset) {
        // Pre-populate from cache so the thread page renders immediately on
        // return visits instead of showing a loading spinner.
        const cached = postsCacheRef.current.get(threadId);
        if (cached && Date.now() - cached.cachedAt < POSTS_CACHE_TTL_MS) {
          setPosts(cached.posts);
          setPostsLoading(false);
        } else {
          setPosts([]);
          setPostsLoading(true);
        }
      }

      postsUnsubscribeRef.current = ForumService.SubscribeToThreadPosts(
        threadId,
        (newPosts) => {
          postsCacheRef.current.set(threadId, {
            posts: newPosts,
            cachedAt: Date.now(),
          });
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
        // Invalidate forum thread page so the new thread appears on next visit
        threadPageCacheRef.current.delete(dto.forumId);
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
      threadCacheRef.current.delete(threadId);
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
      threadCacheRef.current.delete(threadId);
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
      threadPageCacheRef.current.clear();
    },
    [currentUserState],
  );

  const unpinThread = useCallback(
    async (threadId: string) => {
      if (!currentUserState) return;
      await ForumService.UnpinThread(threadId, buildPerformedBy());
      setPinnedThreads((prev) => prev.filter((t) => t.id !== threadId));
      threadPageCacheRef.current.clear();
    },
    [currentUserState],
  );

  const softDeleteThread = useCallback(
    async (threadId: string, reason?: string) => {
      if (!currentUserState) return;
      await ForumService.SoftDeleteThread(threadId, buildPerformedBy(), reason);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setPinnedThreads((prev) => prev.filter((t) => t.id !== threadId));
      threadCacheRef.current.delete(threadId);
      threadPageCacheRef.current.clear();
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
      if (updated) {
        threadCacheRef.current.set(threadId, {
          thread: updated,
          fetchedAt: Date.now(),
        });
      }
      setActiveThread(updated);
      threadPageCacheRef.current.clear();
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

        if (post && post.author.uid !== currentUserState.id) {
          if (isAdding) {
            await ForumService.SendReactionNotification(
              post.author.uid,
              currentUserState.id,
              currentUserState.username,
              activeThread?.id ?? "",
              postId,
              activeThread?.title ?? "",
              reaction,
            );
          } else {
            await ForumService.DeleteReactionNotification(
              currentUserState.id,
              postId,
              reaction,
            );
          }
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

  // ─── User Activity Cache ─────────────────────────────────────────

  const getOrFetchUserActivity = useCallback(
    async (uid: string, count = 5): Promise<UserActivity> => {
      const cached = userActivityCacheRef.current.get(uid);
      if (
        cached &&
        Date.now() - cached.fetchedAt < USER_ACTIVITY_CACHE_TTL_MS
      ) {
        return cached;
      }
      const [threads, posts] = await Promise.all([
        ForumService.GetThreadsByAuthor(uid, count),
        ForumService.GetPostsByAuthor(uid, count),
      ]);
      const entry: UserActivity = { threads, posts, fetchedAt: Date.now() };
      userActivityCacheRef.current.set(uid, entry);
      return entry;
    },
    [],
  );

  const getOrFetchAchievements = useCallback(
    async (uid: string): Promise<Achievement[]> => {
      const cached = achievementsCacheRef.current.get(uid);
      if (cached && Date.now() - cached.fetchedAt < ACHIEVEMENTS_CACHE_TTL_MS) {
        return cached.achievements;
      }
      const achievements = await ForumService.GetAchievementsByUser(uid);
      achievementsCacheRef.current.set(uid, {
        achievements,
        fetchedAt: Date.now(),
      });
      return achievements;
    },
    [],
  );

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
        userMap,
        userListOptions,
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
        getOrFetchUserActivity,
        getOrFetchAchievements,
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
