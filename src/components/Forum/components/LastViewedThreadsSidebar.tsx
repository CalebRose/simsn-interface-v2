import React from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../../_design/Typography";
import { ViewedThread } from "../../../_hooks/useForumHooks";
import routes from "../../../_constants/routes";
import { useResponsive } from "../../../_hooks/useMobile";

interface LastViewedThreadsSidebarProps {
  threads: ViewedThread[];
}

function formatRelativeTime(ms: number): string {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export const LastViewedThreadsSidebar: React.FC<
  LastViewedThreadsSidebarProps
> = ({ threads }) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  if (threads.length === 0) {
    return (
      <Text variant="secondary" classes="text-xs mt-3">
        No recently viewed threads.
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
            key={thread.threadId}
            className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/5 transition-colors"
            onClick={() =>
              navigate(`${routes.FORUM_THREAD}/${thread.threadId}`)
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              navigate(`${routes.FORUM_THREAD}/${thread.threadId}`)
            }
          >
            <Text
              variant="body-small"
              classes="font-medium line-clamp-2 text-start leading-tight"
            >
              {thread.title}
            </Text>
            <Text variant="xs" classes="text-gray-500 mt-0.5 text-start">
              {formatRelativeTime(thread.viewedAt)}
            </Text>
          </div>
        );
      })}
    </div>
  );
};
