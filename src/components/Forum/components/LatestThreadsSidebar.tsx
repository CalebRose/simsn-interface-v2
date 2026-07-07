import React from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../../_design/Typography";
import { Thread } from "../../../models/forumModels";
import routes from "../../../_constants/routes";
import { useResponsive } from "../../../_hooks/useMobile";

interface LatestThreadsSidebarProps {
  threads: Thread[];
  isLoading: boolean;
}

function formatRelativeTime(
  ts: { seconds: number } | null | undefined,
): string {
  if (!ts) return "—";
  const diff = Math.floor((Date.now() - ts.seconds * 1000) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export const LatestThreadsSidebar: React.FC<LatestThreadsSidebarProps> = ({
  threads,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 mt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 rounded bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <Text variant="secondary" classes="text-xs mt-3">
        No threads yet.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 mt-3">
      {threads.map((thread, index) => {
        if (isMobile && index >= 5) {
          return <></>;
        }
        return (
          <div
            key={thread.id}
            className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/5 transition-colors"
            onClick={() => navigate(`${routes.FORUM_THREAD}/${thread.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              navigate(`${routes.FORUM_THREAD}/${thread.id}`)
            }
          >
            <Text
              variant="body-small"
              classes="font-medium line-clamp-2 text-start leading-tight"
            >
              {thread.title}
            </Text>
            <div className="flex items-center gap-1 mt-0.5">
              <Text variant="xs" classes="text-gray-500 text-start truncate">
                {thread.latestActivityBy?.username ?? thread.author.username}
              </Text>
              <Text variant="xs" classes="text-gray-600 shrink-0">
                ·
              </Text>
              <Text variant="xs" classes="text-gray-500 shrink-0">
                {formatRelativeTime(thread.latestActivityAt)}
              </Text>
              <Text variant="xs" classes="text-gray-600 shrink-0">
                ·
              </Text>
              <Text variant="xs" classes="text-gray-600 shrink-0">
                {thread.replyCount} replies
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
};
