import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../_constants/routes";
import { League } from "../../_constants/constants";
import { ForumService } from "../../_services/forumService";
import { Thread } from "../../models/forumModels";
import { formatRelativeTime, pluralize } from "../Forum/forumUtils";
import { SportChip, SportPanel } from "./SportKit";

// The forums on a baseball or volleyball home page, drawn as a sport panel.
// Other sports keep ForumPortal; this reads the same threads.

// A league whose forum is not named after the league in lower case.
const forumKeys: Partial<Record<League, string>> = {
  SimCollegeBaseball: "simcbl",
};

/** A league's five most recently active media threads, pinned ones included. */
export const useForumThreads = (league: League) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const forumId = `media-${forumKeys[league] ?? league.toLowerCase()}`;
    setLoading(true);
    Promise.all([
      ForumService.GetPinnedThreads(forumId),
      ForumService.GetThreadsByForum(forumId, 5),
    ])
      .then(([pinned, { threads: latest }]) => {
        if (cancelled) return;
        setThreads(
          [...pinned, ...latest]
            .sort(
              (a, b) =>
                (b.latestActivityAt?.seconds ?? 0) -
                (a.latestActivityAt?.seconds ?? 0),
            )
            .slice(0, 5),
        );
      })
      .catch(() => {
        if (!cancelled) setThreads([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [league]);

  return { threads, loading };
};

export const SportForumPanel: FC<{
  league: League;
  /** Your own team's colour, as the panel's top strip. */
  accent?: string;
  classes?: string;
}> = ({ league, accent, classes = "" }) => {
  const navigate = useNavigate();
  const { threads, loading } = useForumThreads(league);
  const open = (thread: Thread) =>
    navigate(`${routes.FORUM_THREAD}/${thread.id}`);

  return (
    <SportPanel
      title="Forums"
      accent={accent}
      classes={classes}
      actions={
        <span
          role="link"
          tabIndex={0}
          onClick={() => navigate(routes.FORUMS)}
          onKeyDown={(event) => event.key === "Enter" && navigate(routes.FORUMS)}
          className="cursor-pointer text-sm font-semibold transition-colors hover:text-(--accent-primary)"
        >
          All forums →
        </span>
      }
    >
      <div className="px-3 pb-3">
        {loading && (
          <div className="py-2 text-left text-sm text-(--text-muted)">
            Loading threads...
          </div>
        )}
        {!loading && !threads.length && (
          <div className="py-2 text-left text-sm text-(--text-muted)">
            No threads in this league's forum yet. Start one from the forums.
          </div>
        )}
        {threads.map((thread) => (
          <div
            key={thread.id}
            role="link"
            tabIndex={0}
            onClick={() => open(thread)}
            onKeyDown={(event) => event.key === "Enter" && open(thread)}
            className="flex cursor-pointer items-center gap-3 border-b border-(--sport-divider) py-2 text-left last:border-b-0 hover:text-(--accent-primary)"
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                {thread.isPinned && <SportChip>Pinned</SportChip>}
                {thread.isLocked && <SportChip>Locked</SportChip>}
                {thread.threadType === "poll" && <SportChip>Poll</SportChip>}
                <span className="truncate text-sm font-semibold">
                  {thread.title}
                </span>
              </div>
              <div className="text-xs text-(--text-muted)">
                by {thread.author.username}
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-(--text-muted)">
              <div>{pluralize(thread.replyCount, "reply", "replies")}</div>
              <div>
                {formatRelativeTime(
                  thread.latestActivityAt as unknown as { seconds: number },
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SportPanel>
  );
};
