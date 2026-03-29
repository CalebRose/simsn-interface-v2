import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  writeBatch,
  increment,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import {
  Forum,
  Thread,
  Post,
  Poll,
  PollVote,
  ForumNotification,
  ModerationLog,
  GameReference,
  CreateThreadDTO,
  CreatePostDTO,
  UpdatePostDTO,
  ModerationAction,
  ReactionType,
  RichTextDocument,
} from "../models/forumModels";

// ─────────────────────────────────────────────
// Collection references
// ─────────────────────────────────────────────

const forumsCol = () => collection(firestore, "forums");
const threadsCol = () => collection(firestore, "threads");
const postsCol = () => collection(firestore, "posts");
const pollsCol = () => collection(firestore, "polls");
const notificationsCol = () => collection(firestore, "notifications");
const moderationLogsCol = () => collection(firestore, "moderationLogs");
const gameReferencesCol = () => collection(firestore, "gameReferences");

const pollVotesCol = (pollId: string) =>
  collection(firestore, "polls", pollId, "votes");

// ─────────────────────────────────────────────
// Forums
// ─────────────────────────────────────────────

export const ForumService = {
  // Fetch all forums ordered by sortOrder
  GetAllForums: async (): Promise<Forum[]> => {
    const q = query(forumsCol(), orderBy("sortOrder", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Forum);
  },

  GetForumBySlug: async (slug: string): Promise<Forum | null> => {
    const q = query(forumsCol(), where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Forum;
  },

  // Use this for subforums — slug alone isn't unique across leagues
  GetForumBySlugAndParent: async (
    slug: string,
    parentForumId: string,
  ): Promise<Forum | null> => {
    const q = query(
      forumsCol(),
      where("slug", "==", slug),
      where("parentForumId", "==", parentForumId),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Forum;
  },

  GetForumById: async (id: string): Promise<Forum | null> => {
    const ref = doc(firestore, "forums", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Forum;
  },

  GetSubforums: async (parentForumId: string): Promise<Forum[]> => {
    const q = query(forumsCol(), where("parentForumId", "==", parentForumId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Forum)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },

  // ─────────────────────────────────────────────
  // Threads
  // ─────────────────────────────────────────────

  GetPinnedThreads: async (forumId: string): Promise<Thread[]> => {
    const q = query(
      threadsCol(),
      where("forumId", "==", forumId),
      where("isDeleted", "==", false),
      where("isPinned", "==", true),
      orderBy("latestActivityAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Thread);
  },

  GetThreadsByForum: async (
    forumId: string,
    pageSize = 25,
    cursor?: QueryDocumentSnapshot,
  ): Promise<{ threads: Thread[]; lastDoc: QueryDocumentSnapshot | null }> => {
    let q = query(
      threadsCol(),
      where("forumId", "==", forumId),
      where("isDeleted", "==", false),
      where("isPinned", "==", false),
      orderBy("latestActivityAt", "desc"),
      limit(pageSize),
    );

    if (cursor) {
      q = query(
        threadsCol(),
        where("forumId", "==", forumId),
        where("isDeleted", "==", false),
        where("isPinned", "==", false),
        orderBy("latestActivityAt", "desc"),
        startAfter(cursor),
        limit(pageSize),
      );
    }

    const snap = await getDocs(q);
    const threads = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Thread);
    const lastDoc =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    return { threads, lastDoc };
  },

  GetThreadById: async (threadId: string): Promise<Thread | null> => {
    const ref = doc(firestore, "threads", threadId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Thread;
  },

  CreateThread: async (
    dto: CreateThreadDTO,
    uid: string,
    username: string,
    displayName: string,
    logoUrl?: string,
  ): Promise<{ threadId: string; postId: string }> => {
    const now = serverTimestamp();
    const slug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);

    const authorSnapshot = {
      uid,
      username,
      displayName,
      ...(logoUrl ? { logoUrl } : {}),
    };

    // 1. Create the first post
    const postRef = await addDoc(postsCol(), {
      threadId: "", // will patch after thread creation
      forumId: dto.forumId,
      author: authorSnapshot,
      editorVersion: 1,
      body: dto.body,
      bodyText: dto.bodyText,
      quotedPostId: null,
      replyToPostId: null,
      mentions: [],
      reactions: {},
      isEdited: false,
      editedAt: null,
      editedBy: null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      moderationReason: null,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create the thread
    const threadRef = await addDoc(threadsCol(), {
      forumId: dto.forumId,
      forumPath: dto.forumPath,
      title: dto.title,
      slug,
      author: authorSnapshot,
      contentPreview: dto.bodyText.slice(0, 200),
      firstPostId: postRef.id,
      isPinned: false,
      isLocked: false,
      isAnnouncement: false,
      isDeleted: false,
      tags: dto.tags ?? [],
      threadType: dto.threadType,
      pollId: null,
      referencedGameId: dto.referencedGameId ?? null,
      referencedLeague: dto.referencedLeague ?? null,
      replyCount: 0,
      participantCount: 1,
      latestPostId: postRef.id,
      latestActivityAt: now,
      latestActivityBy: { uid, username },
      createdAt: now,
      updatedAt: now,
    });

    // 3. Patch post with threadId
    await updateDoc(postRef, { threadId: threadRef.id });

    // 4. Handle poll creation if applicable
    let pollId: string | null = null;
    if (dto.threadType === "poll" && dto.poll) {
      const pollRef = await addDoc(pollsCol(), {
        threadId: threadRef.id,
        question: dto.poll.question,
        options: dto.poll.options.map((label, i) => ({
          id: `opt_${i}`,
          label,
          voteCount: 0,
        })),
        allowsMultipleVotes: dto.poll.allowsMultipleVotes,
        maxSelectableOptions: dto.poll.maxSelectableOptions,
        totalVotes: 0,
        closesAt: dto.poll.closesAt ?? null,
        isClosed: false,
        createdBy: { uid, username },
        createdAt: now,
        updatedAt: now,
      });
      pollId = pollRef.id;
      await updateDoc(threadRef, { pollId });
    }

    // 5. Increment forum counters
    const forumRef = doc(firestore, "forums", dto.forumId);
    await updateDoc(forumRef, {
      threadCount: increment(1),
      postCount: increment(1),
      latestActivityAt: now,
      latestActivityBy: { uid, username },
      latestThreadId: threadRef.id,
    });

    return { threadId: threadRef.id, postId: postRef.id };
  },

  // ─────────────────────────────────────────────
  // Posts
  // ─────────────────────────────────────────────

  SubscribeToThreadPosts: (
    threadId: string,
    onUpdate: (posts: Post[]) => void,
  ): (() => void) => {
    const q = query(
      postsCol(),
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc"),
    );
    return onSnapshot(q, (snap) => {
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
      onUpdate(posts);
    });
  },

  GetPostsByThread: async (
    threadId: string,
    pageSize = 25,
    cursor?: DocumentSnapshot,
  ): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> => {
    let q = query(
      postsCol(),
      where("threadId", "==", threadId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "asc"),
      limit(pageSize),
    );

    if (cursor) {
      q = query(
        postsCol(),
        where("threadId", "==", threadId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "asc"),
        startAfter(cursor),
        limit(pageSize),
      );
    }

    const snap = await getDocs(q);
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
    const lastDoc =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    return { posts, lastDoc };
  },

  GetPostById: async (postId: string): Promise<Post | null> => {
    const ref = doc(firestore, "posts", postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Post;
  },

  CreatePost: async (
    dto: CreatePostDTO,
    uid: string,
    username: string,
    displayName: string,
    logoUrl?: string,
  ): Promise<string> => {
    const now = serverTimestamp();

    const authorSnapshot = {
      uid,
      username,
      displayName,
      ...(logoUrl ? { logoUrl } : {}),
    };

    const postRef = await addDoc(postsCol(), {
      threadId: dto.threadId,
      forumId: dto.forumId,
      author: authorSnapshot,
      editorVersion: 1,
      body: dto.body,
      bodyText: dto.bodyText,
      quotedPostId: dto.quotedPostId ?? null,
      replyToPostId: dto.replyToPostId ?? null,
      mentions: dto.mentions ?? [],
      reactions: {},
      isEdited: false,
      editedAt: null,
      editedBy: null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      moderationReason: null,
      createdAt: now,
      updatedAt: now,
    });

    // Update thread metadata
    const threadRef = doc(firestore, "threads", dto.threadId);
    await updateDoc(threadRef, {
      replyCount: increment(1),
      latestPostId: postRef.id,
      latestActivityAt: now,
      latestActivityBy: { uid, username },
      updatedAt: now,
    });

    // Update forum metadata
    const forumRef = doc(firestore, "forums", dto.forumId);
    await updateDoc(forumRef, {
      postCount: increment(1),
      latestActivityAt: now,
      latestActivityBy: { uid, username },
    });

    return postRef.id;
  },

  UpdatePost: async (
    postId: string,
    dto: UpdatePostDTO,
    editorUid: string,
  ): Promise<void> => {
    const ref = doc(firestore, "posts", postId);
    await updateDoc(ref, {
      body: dto.body,
      bodyText: dto.bodyText,
      mentions: dto.mentions ?? [],
      isEdited: true,
      editedAt: serverTimestamp(),
      editedBy: editorUid,
      updatedAt: serverTimestamp(),
    });
  },

  SoftDeletePost: async (
    postId: string,
    deletedByUid: string,
    reason?: string,
  ): Promise<void> => {
    const ref = doc(firestore, "posts", postId);
    await updateDoc(ref, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: deletedByUid,
      moderationReason: reason ?? null,
      updatedAt: serverTimestamp(),
    });
  },

  AddReaction: async (
    postId: string,
    reactionType: ReactionType,
    uid: string,
  ): Promise<void> => {
    const ref = doc(firestore, "posts", postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data() as Post;
    const reactions = { ...(data.reactions ?? {}) };
    const existing = reactions[reactionType] ?? [];

    if (existing.includes(uid)) {
      // Remove reaction (toggle)
      reactions[reactionType] = existing.filter((u) => u !== uid);
    } else {
      reactions[reactionType] = [...existing, uid];
    }

    await updateDoc(ref, { reactions, updatedAt: serverTimestamp() });
  },

  // ─────────────────────────────────────────────
  // Moderation
  // ─────────────────────────────────────────────

  LockThread: async (
    threadId: string,
    performedBy: { uid: string; username: string },
    reason?: string,
  ): Promise<void> => {
    const threadRef = doc(firestore, "threads", threadId);
    await updateDoc(threadRef, {
      isLocked: true,
      updatedAt: serverTimestamp(),
    });
    await ForumService._writeModerationLog(
      "thread",
      threadId,
      "lock",
      performedBy,
      reason,
    );
  },

  UnlockThread: async (
    threadId: string,
    performedBy: { uid: string; username: string },
    reason?: string,
  ): Promise<void> => {
    const threadRef = doc(firestore, "threads", threadId);
    await updateDoc(threadRef, {
      isLocked: false,
      updatedAt: serverTimestamp(),
    });
    await ForumService._writeModerationLog(
      "thread",
      threadId,
      "unlock",
      performedBy,
      reason,
    );
  },

  PinThread: async (
    threadId: string,
    performedBy: { uid: string; username: string },
  ): Promise<void> => {
    const threadRef = doc(firestore, "threads", threadId);
    await updateDoc(threadRef, {
      isPinned: true,
      updatedAt: serverTimestamp(),
    });
    await ForumService._writeModerationLog(
      "thread",
      threadId,
      "pin",
      performedBy,
    );
  },

  UnpinThread: async (
    threadId: string,
    performedBy: { uid: string; username: string },
  ): Promise<void> => {
    const threadRef = doc(firestore, "threads", threadId);
    await updateDoc(threadRef, {
      isPinned: false,
      updatedAt: serverTimestamp(),
    });
    await ForumService._writeModerationLog(
      "thread",
      threadId,
      "unpin",
      performedBy,
    );
  },

  SoftDeleteThread: async (
    threadId: string,
    performedBy: { uid: string; username: string },
    reason?: string,
  ): Promise<void> => {
    const threadRef = doc(firestore, "threads", threadId);
    await updateDoc(threadRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
    await ForumService._writeModerationLog(
      "thread",
      threadId,
      "delete",
      performedBy,
      reason,
    );
  },

  _writeModerationLog: async (
    targetType: "thread" | "post" | "forum",
    targetId: string,
    action: ModerationAction,
    performedBy: { uid: string; username: string },
    reason?: string,
  ): Promise<void> => {
    await addDoc(moderationLogsCol(), {
      targetType,
      targetId,
      action,
      performedBy,
      reason: reason ?? null,
      createdAt: serverTimestamp(),
    });
  },

  // ─────────────────────────────────────────────
  // Polls
  // ─────────────────────────────────────────────

  GetPollByThreadId: async (threadId: string): Promise<Poll | null> => {
    const q = query(pollsCol(), where("threadId", "==", threadId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Poll;
  },

  GetPollVoteForUser: async (
    pollId: string,
    uid: string,
  ): Promise<PollVote | null> => {
    const voteRef = doc(firestore, "polls", pollId, "votes", uid);
    const snap = await getDoc(voteRef);
    if (!snap.exists()) return null;
    return snap.data() as PollVote;
  },

  SubmitPollVote: async (
    pollId: string,
    uid: string,
    selectedOptionIds: string[],
  ): Promise<void> => {
    const pollRef = doc(firestore, "polls", pollId);
    const pollSnap = await getDoc(pollRef);

    if (!pollSnap.exists()) throw new Error("Poll not found");

    const poll = { id: pollSnap.id, ...pollSnap.data() } as Poll;

    if (poll.isClosed) throw new Error("Poll is closed");

    const existingVoteRef = doc(pollVotesCol(pollId), uid);
    const existing = await getDoc(existingVoteRef);
    if (existing.exists()) throw new Error("Already voted");

    const batch = writeBatch(firestore);

    // Write vote doc
    batch.set(existingVoteRef, {
      uid,
      selectedOptionIds,
      createdAt: serverTimestamp(),
    });

    // Update vote counts on each selected option
    const updatedOptions = poll.options.map((opt) =>
      selectedOptionIds.includes(opt.id)
        ? { ...opt, voteCount: opt.voteCount + 1 }
        : opt,
    );

    batch.update(pollRef, {
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  },

  // ─────────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────────

  GetNotificationsForUser: async (
    uid: string,
    pageSize = 20,
  ): Promise<ForumNotification[]> => {
    const q = query(
      notificationsCol(),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    );
    const snap = await getDocs(q);
    return snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ForumNotification,
    );
  },

  MarkNotificationRead: async (notificationId: string): Promise<void> => {
    const ref = doc(firestore, "notifications", notificationId);
    await updateDoc(ref, { isRead: true });
  },

  MarkAllNotificationsRead: async (uid: string): Promise<void> => {
    const q = query(
      notificationsCol(),
      where("uid", "==", uid),
      where("isRead", "==", false),
    );
    const snap = await getDocs(q);
    const batch = writeBatch(firestore);
    snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
    await batch.commit();
  },

  // ─────────────────────────────────────────────
  // Game References
  // ─────────────────────────────────────────────

  GetGameReferenceById: async (id: string): Promise<GameReference | null> => {
    const ref = doc(firestore, "gameReferences", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as GameReference;
  },

  GetGameReferencesByLeague: async (
    league: string,
  ): Promise<GameReference[]> => {
    const q = query(gameReferencesCol(), where("league", "==", league));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GameReference);
  },
};
