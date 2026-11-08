import React from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../../_design/Typography";
import { ViewedThread } from "../../../_hooks/useForumHooks";
import routes from "../../../_constants/routes";
import { useResponsive } from "../../../_hooks/useMobile";
import { formatRelativeTime } from "../forumUtils";
import { MetaText } from "../../../_design/MetaText";

interface LastViewedThreadsSidebarProps {
  threads: ViewedThread[];
}

export const LastViewedThreadsSidebar: React.FC<
  LastViewedThreadsSidebarProps
> = ({ threads }) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  if (threads.length === 0) {
    return (
      <Text variant="secondary" classes="text-sm mt-3">
        No recently viewed threads.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 mt-3">
      {threads.slice(0, isMobile ? 5 : threads.length).map((thread) => (
        <div
          key={thread.threadId}
          className="cursor-pointer rounded px-2 py-2 min-h-11 hover:bg-(--text-primary)/5 focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
          onClick={() => navigate(`${routes.FORUM_THREAD}/${thread.threadId}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            navigate(`${routes.FORUM_THREAD}/${thread.threadId}`)
          }
        >
          <Text
            variant="small"
            classes="font-medium line-clamp-2 text-start leading-tight"
          >
            {thread.title}
          </Text>
          <MetaText classes="mt-0.5 text-start">
            {formatRelativeTime({ seconds: thread.viewedAt / 1000 })}
          </MetaText>
        </div>
      ))}
    </div>
  );
};
