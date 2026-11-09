import React from "react";
import { useNavigate } from "react-router-dom";
import { Thread } from "../../../models/forumModels";
import routes from "../../../_constants/routes";
import { MEDIA_TAG_MAP, MediaTag } from "../../../_constants/mediaTags";
import { cleanExcerpt, formatRelativeTime } from "../forumUtils";
import { MetaText } from "../../../_design/MetaText";
import { IconButton } from "../../../_design/IconButton";

interface ThreadListItemProps {
  thread: Thread;
  compact?: boolean;
  /** Epoch ms of the user's last view; used to flag threads with newer replies. */
  viewedAt?: number;
}

const HOT_REPLY_THRESHOLD = 25;

type Ts = { seconds: number };

const Badge: React.FC<{ color: string; children: React.ReactNode }> = ({
  color,
  children,
}) => (
  <span
    className={`${color} shrink-0 rounded-sm px-1.5 py-0.5 text-xs font-medium text-white`}
  >
    {children}
  </span>
);

export const ThreadListItem: React.FC<ThreadListItemProps> = ({
  thread,
  compact = false,
  viewedAt,
}) => {
  const navigate = useNavigate();
  const excerpt = compact ? "" : cleanExcerpt(thread.contentPreview);
  const replies = thread.replyCount ?? 0;
  const lastSeconds = (thread.latestActivityAt as unknown as Ts | null)
    ?.seconds;
  const hasNewActivity =
    viewedAt !== undefined &&
    lastSeconds !== undefined &&
    lastSeconds * 1000 > viewedAt;

  const handleClick = () => navigate(`${routes.FORUM_THREAD}/${thread.id}`);

  return (
    <div
      className="forum-thread-item flex min-h-16 cursor-pointer items-center gap-3 rounded-sm border-b px-3 py-2.5 transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-blue-400"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {!compact && (
        <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-md bg-(--text-primary)/5 sm:block">
          {thread.featureImageUrl ? (
            <img
              src={thread.featureImageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-(--text-muted)">
              {thread.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col text-start">
        <div className="flex min-w-0 items-center gap-1.5">
          {hasNewActivity && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-blue-400"
              title="New replies since you last viewed"
              aria-label="New replies since you last viewed"
            />
          )}
          {thread.isPinned && <Badge color="bg-blue-600">📌 Pinned</Badge>}
          {thread.isAnnouncement && (
            <Badge color="bg-purple-600">Announcement</Badge>
          )}
          {thread.isLocked && <Badge color="bg-yellow-700">🔒</Badge>}
          {thread.threadType === "poll" && (
            <Badge color="bg-green-700">Poll</Badge>
          )}
          {thread.threadType === "game_reference" && (
            <Badge color="bg-orange-700">🎮 Game</Badge>
          )}
          {thread.tags?.map((tag) => {
            const def = MEDIA_TAG_MAP[tag as MediaTag];
            return def ? (
              <Badge key={tag} color={def.color}>
                {def.label}
              </Badge>
            ) : null;
          })}
          <span
            className={`truncate text-sm sm:text-base ${hasNewActivity ? "font-bold" : "font-semibold"}`}
          >
            {thread.title}
          </span>
        </div>
        <MetaText classes="mt-0.5 truncate">
          {thread.author.username} ·{" "}
          {formatRelativeTime(thread.createdAt as unknown as Ts)}
          <span className="sm:hidden">
            {" · "}
            {replies} {replies === 1 ? "reply" : "replies"}
          </span>
        </MetaText>
        {excerpt && (
          <MetaText classes="mt-0.5 line-clamp-1 hidden sm:block">
            {excerpt}
          </MetaText>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-4 text-sm text-(--text-secondary) sm:flex">
        <span
          className={
            replies >= HOT_REPLY_THRESHOLD
              ? "font-semibold text-orange-400"
              : ""
          }
          title="Replies"
        >
          💬 {replies}
          {replies >= HOT_REPLY_THRESHOLD && " 🔥"}
        </span>
        <span title="Views">👁 {(thread.viewCount ?? 0).toLocaleString()}</span>
        <MetaText classes="w-24 text-right">
          {formatRelativeTime(thread.latestActivityAt as unknown as Ts)}
          {thread.latestActivityBy && (
            <span className="block truncate">
              {thread.latestActivityBy.username}
            </span>
          )}
        </MetaText>
        {replies > 0 && (
          <IconButton
            label="Jump to last post"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${routes.FORUM_THREAD}/${thread.id}#last`);
            }}
          >
            ⤓
          </IconButton>
        )}
      </div>
    </div>
  );
};
