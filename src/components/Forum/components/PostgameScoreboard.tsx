import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../../_design/Typography";
import { FilterChip } from "../../../_design/FilterChip";
import { SkeletonRows } from "../../../_design/SkeletonRows";
import { Thread } from "../../../models/forumModels";
import routes from "../../../_constants/routes";
import { formatRelativeTime } from "../forumUtils";
import { MetaText } from "../../../_design/MetaText";

interface PostgameScoreboardProps {
  threads: Thread[];
  isLoading: boolean;
}

const TITLE_PATTERN =
  /^(?:postgame\s+thread:?\s*)?(.+?)\s+(?:at|vs\.?|@)\s+(.+?)(?:\s*[-–(].*)?$/i;
// Best effort: only used if the auto-post preview contains a "NN - NN" score.
const SCORE_PATTERN = /\b(\d{1,3})\s*[-–]\s*(\d{1,3})\b/;

interface Game {
  thread: Thread;
  away: string;
  home: string;
  awayScore: number | null;
  homeScore: number | null;
  weekLabel: string;
}

const weekLabelFor = (thread: Thread): string => {
  const seconds = thread.createdAt?.seconds ?? 0;
  if (!seconds) return "Earlier";
  const days = Math.floor((Date.now() / 1000 - seconds) / 86400);
  if (days < 1) return "Today";
  if (days < 7) return "This week";
  return "Earlier";
};

const parseGame = (thread: Thread): Game | null => {
  const match = TITLE_PATTERN.exec(thread.title.trim());
  if (!match) return null;
  const score = SCORE_PATTERN.exec(thread.contentPreview ?? "");
  return {
    thread,
    away: match[1],
    home: match[2],
    awayScore: score ? Number(score[1]) : null,
    homeScore: score ? Number(score[2]) : null,
    weekLabel: weekLabelFor(thread),
  };
};

const FILTERS = ["All", "Today", "This week"] as const;

export const PostgameScoreboard: React.FC<PostgameScoreboardProps> = ({
  threads,
  isLoading,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const games = useMemo(
    () =>
      threads
        .map(parseGame)
        .filter((g): g is Game => g !== null)
        .filter((g) => filter === "All" || g.weekLabel === filter),
    [threads, filter],
  );

  if (isLoading) {
    return <SkeletonRows count={5} heightClass="h-14" classes="mt-3" />;
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex gap-1" role="group" aria-label="Filter games">
        {FILTERS.map((f) => (
          <FilterChip
            key={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </FilterChip>
        ))}
      </div>

      {games.length === 0 && (
        <Text variant="secondary" classes="text-sm">
          No games to show.
        </Text>
      )}

      {games.map((g) => {
        const scored = g.awayScore !== null && g.homeScore !== null;
        const awayWon = scored && g.awayScore! > g.homeScore!;
        const homeWon = scored && g.homeScore! > g.awayScore!;
        const open = () => navigate(`${routes.FORUM_THREAD}/${g.thread.id}`);
        return (
          <div
            key={g.thread.id}
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={(e) => e.key === "Enter" && open()}
            className="min-h-11 cursor-pointer rounded border border-(--text-primary)/10 px-2 py-2 text-start transition-colors hover:bg-(--text-primary)/5 focus-visible:ring-2 focus-visible:ring-blue-400"
            title={g.thread.title}
          >
            <div
              className={`flex justify-between text-sm ${awayWon ? "font-bold text-(--text-primary)" : "text-(--text-secondary)"}`}
            >
              <span className="truncate">{g.away}</span>
              {scored && <span>{g.awayScore}</span>}
            </div>
            <div
              className={`flex justify-between text-sm ${homeWon ? "font-bold text-(--text-primary)" : "text-(--text-secondary)"}`}
            >
              <span className="truncate">{g.home}</span>
              {scored && <span>{g.homeScore}</span>}
            </div>
            <MetaText classes="mt-0.5">
              {formatRelativeTime(g.thread.createdAt)}
              {(g.thread.replyCount ?? 0) > 0 &&
                ` · ${g.thread.replyCount} replies`}
            </MetaText>
          </div>
        );
      })}
    </div>
  );
};
