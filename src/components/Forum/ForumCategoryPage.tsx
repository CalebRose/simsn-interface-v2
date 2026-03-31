import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { ForumBreadcrumbs } from "./components/ForumBreadcrumbs";
import { ThreadList } from "./components/ThreadList";
import { ForumBorder } from "../../_design/Borders";
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

  // `forum` = the forum whose threads we show (subforum if present, else top-level)
  // `parentForum` = the top-level forum (only set when viewing a subforum)
  // `subforums` = children of a top-level forum (only set when NOT viewing a subforum)
  const [forum, setForum] = useState<Forum | null>(null);
  const [parentForum, setParentForum] = useState<Forum | null>(null);
  const [subforums, setSubforums] = useState<Forum[]>([]);
  const [forumLoading, setForumLoading] = useState(true);

  useEffect(() => {
    setForumLoading(true);
    setParentForum(null);
    setSubforums([]);

    if (subforumSlug) {
      // Bug 1 fix: resolve parent first, then look up subforum by slug + parentId
      // so that shared slugs like "news" / "daily" don't collide across leagues
      ForumService.GetForumBySlug(forumSlug)
        .then(async (parent) => {
          if (!parent) {
            setForum(null);
            return;
          }
          setParentForum(parent);
          const sub = await ForumService.GetForumBySlugAndParent(
            subforumSlug,
            parent.id,
          );
          setForum(sub);
        })
        .catch(console.error)
        .finally(() => setForumLoading(false));
    } else {
      // Bug 2 fix: when viewing a top-level forum, also load its subforums
      ForumService.GetForumBySlug(forumSlug)
        .then(async (f) => {
          setForum(f);
          if (f) {
            const subs = await ForumService.GetSubforums(f.id);
            setSubforums(subs);
          }
        })
        .catch(console.error)
        .finally(() => setForumLoading(false));
    }
  }, [forumSlug, subforumSlug]);

  const { threads, pinnedThreads, threadsLoading, loadMore, hasMoreThreads } =
    useForumThreads(forum?.id);

  const crumbs = subforumSlug
    ? [
        { label: "Forums", href: routes.FORUMS },
        {
          label: parentForum?.name ?? forumSlug,
          href: `${routes.FORUMS}/${forumSlug}`,
        },
        { label: forum?.name ?? subforumSlug },
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
      <div className="flex flex-col w-[95vw] lg:w-[80vw]">
        <ForumBreadcrumbs crumbs={crumbs} />

        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="text-start justify-start">
            <Text variant="h4">{forum?.name ?? forumSlug}</Text>
            {forum?.description && (
              <Text variant="secondary" classes="mt-0.5">
                {forum.description}
              </Text>
            )}
          </div>
          {permissions.canCreateThread && forum && !forum.isLocked && (
            <div className="text-end">
              <Button variant="primary" size="sm" onClick={handleNewThread}>
                + New Thread
              </Button>
            </div>
          )}
        </div>

        {forum?.isLocked && (
          <div className="mb-3 p-2 bg-yellow-900/40 border border-yellow-700 rounded text-sm text-yellow-300">
            🔒 This forum is locked. No new threads can be posted.
          </div>
        )}

        {/* Subforums — shown when viewing a top-level forum */}
        {subforums.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-4 md:grid-cols-2">
            {subforums.map((sf) => (
              <div
                key={sf.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(`${routes.FORUMS}/${forumSlug}/${sf.slug}`)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate(`${routes.FORUMS}/${forumSlug}/${sf.slug}`)
                }
                className="cursor-pointer"
              >
                <ForumBorder classes="p-3 hover:opacity-90 transition-opacity mb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col text-start">
                      <Text variant="body-small" classes="font-semibold">
                        {sf.name}
                      </Text>
                      {sf.description && (
                        <Text variant="xs" classes="text-gray-400 mt-0.5">
                          {sf.description}
                        </Text>
                      )}
                    </div>
                    <div className="flex gap-4 shrink-0 text-right">
                      <div>
                        <Text variant="xs" classes="text-gray-400">
                          Threads
                        </Text>
                        <Text variant="small">{sf.threadCount}</Text>
                      </div>
                      <div>
                        <Text variant="xs" classes="text-gray-400">
                          Posts
                        </Text>
                        <Text variant="small">{sf.postCount}</Text>
                      </div>
                    </div>
                  </div>
                </ForumBorder>
              </div>
            ))}
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
