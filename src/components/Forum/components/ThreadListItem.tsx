import React from "react";
import { useNavigate } from "react-router-dom";
import { Thread } from "../../../models/forumModels";
import { Text } from "../../../_design/Typography";
import routes from "../../../_constants/routes";

interface ThreadListItemProps {
  thread: Thread;
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
  });
}

export const ThreadListItem: React.FC<ThreadListItemProps> = ({ thread }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${routes.FORUM_THREAD}/${thread.id}`);
  };

  return (
    <div
      className="forum-thread-item flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 px-3 border-b last:border-b-0 cursor-pointer transition-colors rounded"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Left: badges + title + author */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          {thread.isPinned && (
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
              Pinned
            </span>
          )}
          {thread.isAnnouncement && (
            <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded font-medium">
              Announcement
            </span>
          )}
          {thread.isLocked && (
            <span className="text-xs bg-yellow-600 text-white px-1.5 py-0.5 rounded font-medium">
              🔒 Locked
            </span>
          )}
          {thread.threadType === "poll" && (
            <span className="text-xs bg-green-700 text-white px-1.5 py-0.5 rounded font-medium">
              Poll
            </span>
          )}
          {thread.threadType === "game_reference" && (
            <span className="text-xs bg-orange-700 text-white px-1.5 py-0.5 rounded font-medium">
              🎮 Game
            </span>
          )}
        </div>

        <Text variant="body-small" classes="font-semibold truncate text-start">
          {thread.title}
        </Text>
        <Text variant="small" classes="text-gray-400 mt-0.5 text-start">
          by {thread.author.username}
        </Text>
        {thread.contentPreview && (
          <Text
            variant="xs"
            classes="text-gray-500 mt-0.5 line-clamp-1 text-start"
          >
            {thread.contentPreview}
          </Text>
        )}
      </div>

      {/* Right: reply count + latest activity */}
      <div className="flex sm:flex-col items-end gap-4 sm:gap-0.5 shrink-0 text-right">
        <div>
          <Text variant="xs" classes="text-gray-400">
            Replies
          </Text>
          <Text variant="small">{thread.replyCount}</Text>
        </div>
        <div>
          <Text variant="xs" classes="text-gray-400">
            Last post
          </Text>
          <Text variant="xs">
            {formatRelativeTime(
              thread.latestActivityAt as unknown as { seconds: number },
            )}
          </Text>
          {thread.latestActivityBy && (
            <Text variant="xs" classes="text-gray-500">
              by {thread.latestActivityBy.username}
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};
