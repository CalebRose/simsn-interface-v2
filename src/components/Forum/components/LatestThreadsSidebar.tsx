import React from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../../_design/Typography";
import { SkeletonRows } from "../../../_design/SkeletonRows";
import { Thread } from "../../../models/forumModels";
import routes from "../../../_constants/routes";
import { useResponsive } from "../../../_hooks/useMobile";
import { formatRelativeTime, pluralize } from "../forumUtils";
import { MetaText } from "../../../_design/MetaText";

interface LatestThreadsSidebarProps {
  threads: Thread[];
  isLoading: boolean;
}

export const LatestThreadsSidebar: React.FC<LatestThreadsSidebarProps> = ({
  threads,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const limit = isMobile ? 8 : 10;

  if (isLoading) {
    return <SkeletonRows count={6} classes="mt-3" />;
  }

  if (threads.length === 0) {
    return (
      <Text variant="secondary" classes="text-sm mt-3">
        No threads match this filter.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 mt-3">
      {threads.slice(0, limit).map((thread) => (
        <div
          key={thread.id}
          className="cursor-pointer rounded px-2 py-2 min-h-11 hover:bg-(--text-primary)/5 focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
          onClick={() => navigate(`${routes.FORUM_THREAD}/${thread.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && navigate(`${routes.FORUM_THREAD}/${thread.id}`)
          }
        >
          <Text
            variant="small"
            classes="font-medium line-clamp-2 text-start leading-tight"
          >
            {thread.title}
          </Text>
          <MetaText classes="mt-0.5 text-start truncate">
            {thread.latestActivityBy?.username ?? thread.author.username} ·{" "}
            {formatRelativeTime(thread.latestActivityAt)} ·{" "}
            {pluralize(thread.replyCount ?? 0, "reply", "replies")}
          </MetaText>
        </div>
      ))}
    </div>
  );
};
