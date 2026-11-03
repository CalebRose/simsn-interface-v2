import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Forum } from "../../../models/forumModels";
import { ForumBorder } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import routes from "../../../_constants/routes";
import { useAuthStore } from "../../../context/AuthContext";
import { useForumLatestThread } from "../../../_hooks/useForumHooks";
import {
  LEAGUE_ACCENT_COLORS,
  formatRelativeTime,
  getForumDisplayName,
  getLeagueKey,
  isSystemGeneratedThread,
  pluralize,
} from "../forumUtils";
import { MetaText } from "../../../_design/MetaText";
import { IconButton } from "../../../_design/IconButton";

interface ForumCardProps {
  forum: Forum;
  subforums?: Forum[];
}

type Ts = { seconds: number };

export const ForumCard: React.FC<ForumCardProps> = ({
  forum,
  subforums = [],
}) => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const collapseKey = `forumCardCollapsed:${forum.id}`;
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(collapseKey) === "1";
    } catch {
      return false;
    }
  });
  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(collapseKey, prev ? "0" : "1");
      } catch {
        // storage unavailable; state just won't persist
      }
      return !prev;
    });
  };

  const isSubscriber = !!currentUser?.IsSubscribed;
  // Never surface titles from subscriber-only forums to non-subscribers.
  const visibleSubforums = useMemo(
    () =>
      subforums.filter((sf) => sf.visibility !== "subscriber" || isSubscriber),
    [subforums, isSubscriber],
  );
  const hiddenFromUser = forum.visibility === "subscriber" && !isSubscriber;

  const latestThread = useForumLatestThread(
    [forum, ...visibleSubforums],
    !hiddenFromUser,
  );

  const canNavigateToForum = useMemo(() => {
    if (!currentUser) return false;
    if (
      forum.name !== "welcome" &&
      forum.name !== "admin" &&
      currentUser.teamId === 0 &&
      currentUser.NFLTeamID === 0 &&
      currentUser.cbb_id === 0 &&
      currentUser.NBATeamID === 0 &&
      currentUser.CHLTeamID === 0 &&
      currentUser.PHLTeamID === 0 &&
      currentUser.CollegeBaseballOrgID === 0 &&
      currentUser.MLBOrgID === 0
    ) {
      return false;
    }
    return true;
  }, [currentUser, forum.name]);

  if (hiddenFromUser) return <></>;

  const handleNavigate = () => {
    if (!canNavigateToForum) return;
    navigate(`${routes.FORUMS}/${forum.slug}`);
  };

  const threadTotal =
    (forum.threadCount ?? 0) +
    visibleSubforums.reduce((sum, sf) => sum + (sf.threadCount ?? 0), 0);
  const postTotal =
    (forum.postCount ?? 0) +
    visibleSubforums.reduce((sum, sf) => sum + (sf.postCount ?? 0), 0);

  // Thread creation updates the subforum, so the parent must aggregate.
  const latest = [forum, ...visibleSubforums].reduce<{
    at: Ts | null;
    by: string | null;
  }>(
    (best, f) => {
      const at = f.latestActivityAt as unknown as Ts | null | undefined;
      if (at && (!best.at || at.seconds > best.at.seconds)) {
        return { at, by: f.latestActivityBy?.username ?? null };
      }
      return best;
    },
    { at: null, by: null },
  );

  const leagueKey = getLeagueKey(forum.id, forum.sportKey);
  const accent = leagueKey ? LEAGUE_ACCENT_COLORS[leagueKey] : "#475569";

  return (
    <ForumBorder
      classes={`flex flex-col h-full overflow-hidden p-0 transition-colors hover:bg-(--text-primary)/5 ${canNavigateToForum ? "cursor-pointer" : ""}`}
    >
      <div
        className="flex min-w-0 flex-1 flex-col p-4"
        style={{ borderLeft: `4px solid ${accent}` }}
        onClick={handleNavigate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
      >
        <div className="mb-1 flex items-center gap-2">
          <Text variant="h6" classes="text-start">
            {getForumDisplayName(forum.name)}
          </Text>
          {forum.isLocked && (
            <span className="rounded-sm bg-yellow-600 px-1.5 text-xs text-white">
              Locked
            </span>
          )}
          <IconButton
            label={collapsed ? "Expand category" : "Collapse category"}
            aria-expanded={!collapsed}
            classes="ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapsed();
            }}
          >
            {collapsed ? "▸" : "▾"}
          </IconButton>
        </div>
        {!collapsed && forum.description && (
          <Text
            variant="small"
            classes="mb-3 line-clamp-2 text-(--text-muted) text-start"
          >
            {forum.description}
          </Text>
        )}
        {!collapsed && visibleSubforums.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleSubforums.map((sf) => (
              <button
                key={sf.id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${routes.FORUMS}/${forum.slug}/${sf.slug}`);
                }}
                className="min-h-11 dark:text-white rounded-sm bg-(--bg-surface) px-3 py-1 text-sm text-(--accent-primary) border border-blue-400 transition-colors hover:bg-(--border-secondary) hover:text-(--accent-primary) focus-visible:ring-2 focus-visible:ring-blue-400 sm:min-h-8"
              >
                {getForumDisplayName(sf.name)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex w-full flex-col gap-1 border-t border-(--border-secondary) px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        onClick={handleNavigate}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
          <MetaText classes="uppercase tracking-wide shrink-0">Latest</MetaText>
          {threadTotal === 0 ? (
            <MetaText>No threads yet</MetaText>
          ) : latestThread ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${routes.FORUM_THREAD}/${latestThread.id}`);
                }}
                className="min-w-0 max-w-full truncate p-0 text-left text-sm font-medium text-(--accent-primary) hover:text-(--accent-primary) hover:underline focus-visible:ring-2 focus-visible:ring-blue-400"
                title={latestThread.title}
              >
                {latestThread.title}
              </button>
              <MetaText classes="shrink-0">
                {isSystemGeneratedThread(latestThread) && "Auto-post · "}
                {latestThread.author.username} ·{" "}
                {formatRelativeTime(
                  (latestThread.latestActivityAt ??
                    latestThread.createdAt) as unknown as Ts,
                )}
              </MetaText>
            </>
          ) : latest.at ? (
            <MetaText>
              {formatRelativeTime(latest.at)}
              {latest.by && ` by ${latest.by}`}
            </MetaText>
          ) : (
            <MetaText>No recent activity</MetaText>
          )}
        </div>
        <MetaText classes="shrink-0">
          {pluralize(threadTotal, "thread")} · {pluralize(postTotal, "post")}
        </MetaText>
      </div>
    </ForumBorder>
  );
};
