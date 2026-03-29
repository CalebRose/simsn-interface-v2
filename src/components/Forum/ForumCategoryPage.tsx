import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { ForumBreadcrumbs } from "./components/ForumBreadcrumbs";
import { ThreadList } from "./components/ThreadList";
import { useForumThreads } from "../../_hooks/useForumHooks";
import { useForumStore } from "../../context/ForumContext";
import { ForumService } from "../../_services/forumService";
import { Forum } from "../../models/forumModels";
import routes from "../../_constants/routes";

interface Params {
  forumSlug: string;
  subforumSlug?: string;
}

export const ForumCategoryPage: React.FC = () => {
  const { forumSlug, subforumSlug } = useParams<keyof Params>() as Params;
  const navigate = useNavigate();
  const { permissions } = useForumStore();

  const [forum, setForum] = useState<Forum | null>(null);
  const [forumLoading, setForumLoading] = useState(true);

  // Resolve the exact forum document (top-level or subforum)
  useEffect(() => {
    const slug = subforumSlug ?? forumSlug;
    setForumLoading(true);
    ForumService.GetForumBySlug(slug)
      .then(setForum)
      .catch(console.error)
      .finally(() => setForumLoading(false));
  }, [forumSlug, subforumSlug]);

  const { threads, pinnedThreads, threadsLoading, loadMore, hasMoreThreads } =
    useForumThreads(forum?.id);

  const crumbs = subforumSlug
    ? [
        { label: "Forums", href: routes.FORUMS },
        {
          label: forum?.name?.split(" ")[0] ?? forumSlug,
          href: `${routes.FORUMS}/${forumSlug}`,
        },
        { label: subforumSlug },
      ]
    : [
        { label: "Forums", href: routes.FORUMS },
        { label: forum?.name ?? forumSlug },
      ];

  const handleNewThread = () => {
    if (!forum) return;
    navigate(`${routes.FORUM_CREATE_THREAD}?forumId=${forum.id}`);
  };

  return (
    <PageContainer isLoading={forumLoading} title="">
      <div className="flex flex-col px-4 lg:w-[80vw]">
        <ForumBreadcrumbs crumbs={crumbs} />

        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div>
            <Text variant="h4">{forum?.name ?? forumSlug}</Text>
            {forum?.description && (
              <Text variant="secondary" classes="mt-0.5">
                {forum.description}
              </Text>
            )}
          </div>
          {permissions.canCreateThread && forum && !forum.isLocked && (
            <Button variant="primary" size="sm" onClick={handleNewThread}>
              + New Thread
            </Button>
          )}
        </div>

        {forum?.isLocked && (
          <div className="mb-3 p-2 bg-yellow-900/40 border border-yellow-700 rounded text-sm text-yellow-300">
            🔒 This forum is locked. No new threads can be posted.
          </div>
        )}

        <ThreadList
          threads={threads}
          pinnedThreads={pinnedThreads}
          isLoading={threadsLoading}
          hasMore={hasMoreThreads}
          onLoadMore={() => forum && loadMore()}
        />
      </div>
    </PageContainer>
  );
};
