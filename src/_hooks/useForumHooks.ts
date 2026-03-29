import { useEffect } from "react";
import { useForumStore } from "../context/ForumContext";
import { useAuthStore } from "../context/AuthContext";

/**
 * Load all top-level forums and subforums.
 * Call this on the ForumsHomePage.
 */
export const useForums = () => {
  const { forums, forumsLoading, loadForums } = useForumStore();

  useEffect(() => {
    loadForums();
  }, [loadForums]);

  return { forums, forumsLoading };
};

/**
 * Load threads for a specific forum, with support for pagination.
 */
export const useForumThreads = (forumId: string | undefined) => {
  const {
    threads,
    pinnedThreads,
    threadsLoading,
    loadThreadsForForum,
    loadMoreThreads,
    hasMoreThreads,
  } = useForumStore();

  useEffect(() => {
    if (!forumId) return;
    loadThreadsForForum(forumId, true);
  }, [forumId, loadThreadsForForum]);

  const loadMore = () => {
    if (forumId) loadMoreThreads(forumId);
  };

  return { threads, pinnedThreads, threadsLoading, loadMore, hasMoreThreads };
};

/**
 * Load a single thread and its posts.
 */
export const useThread = (threadId: string | undefined) => {
  const { currentUser } = useAuthStore();
  const {
    activeThread,
    posts,
    postsLoading,
    activePoll,
    userPollVote,
    loadThread,
    loadPostsForThread,
    loadPoll,
  } = useForumStore();

  useEffect(() => {
    if (!threadId) return;
    loadThread(threadId);
    loadPostsForThread(threadId, true);
  }, [threadId, loadThread, loadPostsForThread]);

  // Load poll if thread type is poll
  useEffect(() => {
    if (!activeThread || activeThread.threadType !== "poll" || !threadId)
      return;
    loadPoll(threadId, currentUser?.id ?? "");
  }, [activeThread, threadId, currentUser, loadPoll]);

  return { activeThread, posts, postsLoading, activePoll, userPollVote };
};

/**
 * Expose moderation actions gated by permissions.
 */
export const useModerationActions = () => {
  const {
    permissions,
    lockThread,
    unlockThread,
    pinThread,
    unpinThread,
    softDeleteThread,
    softDeletePost,
  } = useForumStore();

  return {
    permissions,
    lockThread,
    unlockThread,
    pinThread,
    unpinThread,
    softDeleteThread,
    softDeletePost,
  };
};

/**
 * Poll voting hook.
 */
export const usePollVote = () => {
  const { activePoll, userPollVote, submitPollVote } = useForumStore();

  return { activePoll, userPollVote, submitPollVote };
};

/**
 * Notifications hook.
 */
export const useNotifications = () => {
  const { currentUser } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useForumStore();

  useEffect(() => {
    if (!currentUser) return;
    loadNotifications(currentUser.id);
  }, [currentUser, loadNotifications]);

  const dismissAll = () => {
    if (!currentUser) return;
    markAllNotificationsRead(currentUser.id);
  };

  return {
    notifications,
    unreadCount,
    markNotificationRead,
    dismissAll,
  };
};

/**
 * Post creation convenience hook.
 */
export const useCreatePost = () => {
  const { createPost, permissions } = useForumStore();
  return { createPost, canReply: permissions.canReply };
};

/**
 * Thread creation convenience hook.
 */
export const useCreateThread = () => {
  const { createThread, permissions } = useForumStore();
  return { createThread, canCreate: permissions.canCreateThread };
};
