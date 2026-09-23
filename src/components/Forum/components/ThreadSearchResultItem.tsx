import React from "react";
import { useNavigate } from "react-router-dom";
import { Thread } from "../../../models/forumModels";
import { Text } from "../../../_design/Typography";
import routes from "../../../_constants/routes";

interface ThreadSearchResultItemProps {
  thread: Thread;
  forumName?: string;
}

function formatRelativeTime(
  ts: { seconds: number } | null | undefined,
): string {
  if (!ts) return "—";
  const now = Date.now();
  const then = ts.seconds * 1000;
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const ThreadSearchResultItem: React.FC<ThreadSearchResultItemProps> = ({
  thread,
  forumName,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${routes.FORUM_THREAD}/${thread.id}`);
  };

  return (
    <div
      className="flex flex-col gap-1 py-3 px-3 border-b border-white/10 last:border-b-0 cursor-pointer transition-colors rounded-sm hover:bg-white/5"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {forumName && (
          <span className="text-xs bg-white/10 text-white/70 px-1.5 py-0.5 rounded-sm font-medium">
            {forumName}
          </span>
        )}
        {thread.isLocked && (
          <span className="text-xs bg-yellow-600 text-white px-1.5 py-0.5 rounded-sm font-medium">
            🔒 Locked
          </span>
        )}
      </div>

      <Text variant="body-small" classes="font-semibold truncate text-start">
        {thread.title}
      </Text>

      {thread.contentPreview && (
        <Text variant="xs" classes="text-gray-500 line-clamp-1 text-start">
          {thread.contentPreview}
        </Text>
      )}

      <div className="flex items-center justify-between text-gray-400">
        <Text variant="small">by {thread.author.username}</Text>
        <Text variant="xs">
          {formatRelativeTime(
            thread.createdAt as unknown as { seconds: number },
          )}
        </Text>
      </div>
    </div>
  );
};
