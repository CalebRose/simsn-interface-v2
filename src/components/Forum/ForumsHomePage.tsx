import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { ForumCard } from "./components/ForumCard";
import { ForumEditorialSection } from "./components/ForumEditorialSection";
import { LastViewedThreadsSidebar } from "./components/LastViewedThreadsSidebar";
import { LatestThreadsSidebar } from "./components/LatestThreadsSidebar";
import {
  useForumEditorialItems,
  useForums,
  useLastViewedThreads,
  useLatestThreads,
} from "../../_hooks/useForumHooks";
import { useForumStore } from "../../context/ForumContext";
import {
  canGuestPostInForum,
  canSubscriberPostInForum,
} from "../../context/ForumContext";
import { Forum } from "../../models/forumModels";
import routes from "../../_constants/routes";
import { useAuthStore } from "../../context/AuthContext";
import { useResponsive } from "../../_hooks/useMobile";

export const ForumsHomePage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { forums, forumsLoading } = useForums();
  const { permissions, forumRole } = useForumStore();
  const navigate = useNavigate();

  const { isMobile } = useResponsive();

  const { topLevel, subforumMap } = useMemo(() => {
    const topLevel: Forum[] = [];
    const subforumMap: Map<string, Forum[]> = new Map();

    for (const f of forums) {
      if (f.type === "top_level" || !f.parentForumId) {
        topLevel.push(f);
      } else {
        const parent = f.parentForumId;
        if (!subforumMap.has(parent)) subforumMap.set(parent, []);
        subforumMap.get(parent)!.push(f);
      }
    }

    return { topLevel, subforumMap };
  }, [forums]);

  // All users that have at least one team can view the forums.
  const canViewForums = useMemo(() => {
    if (!currentUser) return false;
    return true;
  }, [currentUser]);

  const { editorialItems, editorialLoading } = useForumEditorialItems(
    forums,
    forumsLoading,
    canViewForums,
  );

  const lastViewedThreads = useLastViewedThreads(currentUser?.id);
  const { threads: latestThreads, loading: latestThreadsLoading } =
    useLatestThreads(canViewForums);

  if (!canViewForums)
    return (
      <PageContainer isLoading={forumsLoading} title="">
        <div className="w-full max-w-6xl mx-auto">
          <Text variant="h4" classes="mb-4">
            Community Forums
          </Text>
          <Text variant="secondary">
            Please log in or register to access the forums. New users can post
            in the Introductions &amp; Job Applications sections right away.
          </Text>
        </div>
      </PageContainer>
    );

  const subscriberCanPost =
    forumRole === "subscriber"
      ? forums.some((f) => canSubscriberPostInForum(f))
      : forumRole === "guest"
        ? forums.some((f) => canGuestPostInForum(f))
        : false;

  return (
    <PageContainer isLoading={forumsLoading} title="">
      <div className="mx-auto flex w-[95vw] flex-col lg:w-[80vw] py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 space-x-2">
          <Text variant="h4">Community Forums</Text>
          {(permissions.canCreateThread || subscriberCanPost) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(routes.FORUM_CREATE_THREAD)}
            >
              + New Thread
            </Button>
          )}
        </div>

        <ForumEditorialSection
          items={editorialItems}
          isLoading={editorialLoading}
        />

        {/* Forum grid */}
        {topLevel.length === 0 && !forumsLoading ? (
          <div className="py-12 text-center">
            <Text variant="secondary">No forums available.</Text>
          </div>
        ) : (
          <section className="flex w-full flex-col gap-0 text-left">
            {/* Header row — all three column headers share the same row */}
            {!isMobile && (
              <div className="grid grid-cols-12 gap-4 border-b border-white/10 pb-3">
                <div className="col-span-2 flex flex-col justify-end">
                  <Text variant="h5">Last Viewed Threads</Text>
                  <Text variant="secondary" classes="mt-1">
                    Your last viewed threads
                  </Text>
                </div>
                <div className="col-span-8 flex items-end justify-between">
                  <div>
                    <Text variant="h5">Forum Categories</Text>
                    <Text variant="secondary" classes="mt-1">
                      Browse every conference room, subforum, and discussion
                      hub.
                    </Text>
                  </div>
                  <Text
                    variant="body-small"
                    classes="hidden sm:block text-white/45 uppercase tracking-[0.2em]"
                  >
                    Directory
                  </Text>
                </div>
                <div className="col-span-2 flex flex-col justify-end">
                  <Text variant="h5">Latest Threads</Text>
                  <Text variant="secondary" classes="mt-1">
                    The most recent activity
                  </Text>
                </div>
              </div>
            )}

            {/* Content row */}
            <div
              className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-12"} ${isMobile ? "gap-2" : "gap-4"} items-start pt-4`}
            >
              {/* Last Viewed sidebar */}
              {isMobile && (
                <>
                  <div className="col-span-1 flex flex-col justify-end">
                    <Text variant="h6">Last Viewed Threads</Text>
                    <Text variant="body-small" classes="mt-1 text-gray-500">
                      Your last viewed threads
                    </Text>
                  </div>
                </>
              )}
              <div className={`${isMobile ? "col-span-1" : "col-span-2"}`}>
                <LastViewedThreadsSidebar threads={lastViewedThreads} />
              </div>

              {isMobile && (
                <>
                  <div className="col-span-1 flex flex-col justify-end">
                    <Text variant="h6">Latest Threads</Text>
                    <Text variant="body-small" classes="mt-1 text-gray-500">
                      The most recent activity
                    </Text>
                  </div>
                  <div className="col-span-1">
                    <LatestThreadsSidebar
                      threads={latestThreads}
                      isLoading={latestThreadsLoading}
                    />
                  </div>
                </>
              )}

              {/* Forum category cards */}
              {isMobile && (
                <>
                  <div className="col-span-1 flex items-end justify-between">
                    <div>
                      <Text variant="h6">Forum Categories</Text>
                      <Text variant="body-small" classes="mt-1 text-gray-500">
                        Browse every conference room, subforum, and discussion
                        hub.
                      </Text>
                    </div>
                  </div>
                </>
              )}
              <div className={`${isMobile ? "col-span-1" : "col-span-8"}`}>
                <div className="grid grid-cols-1 gap-4">
                  {topLevel.map((forum) => (
                    <ForumCard
                      key={forum.id}
                      forum={forum}
                      subforums={subforumMap.get(forum.id) ?? []}
                    />
                  ))}
                </div>
              </div>

              {/* Latest Threads sidebar */}
              {!isMobile && (
                <div className="col-span-2">
                  <LatestThreadsSidebar
                    threads={latestThreads}
                    isLoading={latestThreadsLoading}
                  />
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
};
