import { useEffect, useMemo, useState } from "react";
import { useForumStore } from "../context/ForumContext";
import { useAuthStore } from "../context/AuthContext";
import { ForumService } from "../_services/forumService";
import { Forum, Post, Thread } from "../models/forumModels";
import {
  buildForumEditorialItems,
  ForumEditorialItem,
} from "../components/Forum/forumUtils";

const MEDIA_FORUM_SLUG = "media";
const EDITORIAL_SPORT_FORUM_KEYS = new Set([
  "simcfb",
  "simnfl",
  "simcbb",
  "simnba",
  "simchl",
  "simmlb",
]);

function getLatestActivitySeconds(thread: Thread): number {
  return thread.latestActivityAt?.seconds ?? 0;
}

function selectEditorialThreads(threads: Thread[]): Thread[] {
  const threadsById = new Map<string, Thread>();

  for (const thread of threads) {
    const existing = threadsById.get(thread.id);
    if (
      !existing ||
      getLatestActivitySeconds(thread) > getLatestActivitySeconds(existing)
    ) {
      threadsById.set(thread.id, thread);
    }
  }

  return [...threadsById.values()]
    .sort((a, b) => getLatestActivitySeconds(b) - getLatestActivitySeconds(a))
    .slice(0, 3);
}

async function loadPostsById(threads: Thread[]): Promise<Map<string, Post>> {
  const posts = await Promise.all(
    threads.map((thread) =>
      thread.firstPostId
        ? ForumService.GetPostById(thread.firstPostId)
        : Promise.resolve(null),
    ),
  );

  return new Map(
    posts
      .filter((post): post is Post => post !== null)
      .map((post) => [post.id, post]),
  );
}

async function loadThreadsByForumId(forumId: string): Promise<Thread[]> {
  const [pinnedThreads, { threads }] = await Promise.all([
    ForumService.GetPinnedThreads(forumId),
    ForumService.GetThreadsByForum(forumId),
  ]);

  return [...pinnedThreads, ...threads];
}

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

export const useForumEditorialItems = (
  forums: Forum[],
  forumsLoading: boolean,
  canViewForums: boolean,
): {
  editorialItems: ForumEditorialItem[];
  editorialLoading: boolean;
} => {
  const [editorialItems, setEditorialItems] = useState<ForumEditorialItem[]>(
    [],
  );
  const [editorialLoading, setEditorialLoading] = useState(false);

  const { forumsById, editorialForumIds } = useMemo(() => {
    const forumsById = new Map<string, Forum>();
    let mediaForumId: string | null = null;

    for (const forum of forums) {
      forumsById.set(forum.id, forum);
      if (forum.slug.toLowerCase() === MEDIA_FORUM_SLUG) {
        mediaForumId = forum.id;
      }
    }

    const editorialForumIds = forums
      .filter((forum) => forum.parentForumId === mediaForumId)
      .filter((forum) => {
        const slug = forum.slug.toLowerCase();
        const name = forum.name.toLowerCase();
        const sportKey = forum.sportKey?.toLowerCase();

        return (
          EDITORIAL_SPORT_FORUM_KEYS.has(slug) ||
          EDITORIAL_SPORT_FORUM_KEYS.has(name) ||
          (!!sportKey && EDITORIAL_SPORT_FORUM_KEYS.has(sportKey))
        );
      })
      .map((forum) => forum.id);

    return { forumsById, editorialForumIds };
  }, [forums]);

  useEffect(() => {
    if (
      !canViewForums ||
      forumsById.size === 0 ||
      editorialForumIds.length === 0
    ) {
      setEditorialItems([]);
      setEditorialLoading(false);
      return;
    }

    if (forumsLoading) return;

    let isCancelled = false;

    const loadEditorialItems = async () => {
      setEditorialLoading(true);

      try {
        const threads = (
          await Promise.all(
            editorialForumIds.map((forumId) => loadThreadsByForumId(forumId)),
          )
        ).flat();
        const selectedThreads = selectEditorialThreads(threads);

        if (selectedThreads.length === 0) {
          if (!isCancelled) setEditorialItems([]);
          return;
        }

        const postsById = await loadPostsById(selectedThreads);
        if (!isCancelled) {
          setEditorialItems(
            buildForumEditorialItems(selectedThreads, forumsById, postsById),
          );
        }
      } catch (err) {
        console.error("useForumEditorialItems:", err);
        if (!isCancelled) {
          setEditorialItems([]);
        }
      } finally {
        if (!isCancelled) {
          setEditorialLoading(false);
        }
      }
    };

    void loadEditorialItems();

    return () => {
      isCancelled = true;
    };
  }, [canViewForums, editorialForumIds, forumsById, forumsLoading]);

  return {
    editorialItems,
    editorialLoading:
      editorialLoading || (forumsLoading && editorialItems.length === 0),
  };
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
