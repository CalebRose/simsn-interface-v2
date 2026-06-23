import { FC, memo, useMemo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import type {
  PlayerAward,
  PlayerAwardsResponse,
} from "../../../../../models/baseball/baseballStatsModels";

interface AwardsTabProps {
  awards: PlayerAwardsResponse | null;
  awardsLoading: boolean;
}

/** Tailwind classes per award category, used for the timeline badge. */
const CATEGORY_BADGE: Record<string, string> = {
  major: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  pitching: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  batting: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  fielding:
    "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  selection: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
};

const categoryClass = (category: string) =>
  CATEGORY_BADGE[category] ?? CATEGORY_BADGE.selection;

/** Build the display label for an award, e.g. "AL Silver Slugger (3B)". */
const awardLabel = (a: PlayerAward): string => {
  const prefix = a.sub_league ? `${a.sub_league} ` : "";
  const suffix = a.position_code ? ` (${a.position_code})` : "";
  return `${prefix}${a.award_name}${suffix}`;
};

export const AwardsTab: FC<AwardsTabProps> = memo(
  ({ awards, awardsLoading }) => {
    // Group awards by season (already newest-first from the API).
    const seasons = useMemo(() => {
      const groups: { leagueYearId: number; awards: PlayerAward[] }[] = [];
      const index = new Map<number, number>();
      for (const a of awards?.awards ?? []) {
        let i = index.get(a.league_year_id);
        if (i === undefined) {
          i = groups.length;
          index.set(a.league_year_id, i);
          groups.push({ leagueYearId: a.league_year_id, awards: [] });
        }
        groups[i].awards.push(a);
      }
      return groups;
    }, [awards]);

    // Headline summary: "3× MVP · 2× Silver Slugger · 4× All-Star", most wins first.
    const summaryParts = useMemo(() => {
      const entries = Object.values(awards?.summary ?? {});
      return entries
        .filter((e) => e.wins > 0)
        .sort((a, b) => b.wins - a.wins)
        .map((e) => `${e.wins}× ${e.name}`);
    }, [awards]);

    if (awardsLoading) {
      return (
        <Border classes="p-3">
          <Text variant="small" classes="text-gray-400 py-4 text-center">
            Loading awards...
          </Text>
        </Border>
      );
    }

    if (!awards || awards.awards.length === 0) {
      return (
        <Border classes="p-3">
          <Text variant="small" classes="text-gray-400 py-4 text-center">
            No awards yet.
          </Text>
        </Border>
      );
    }

    return (
      <Border classes="p-3">
        {/* Headline summary line */}
        {summaryParts.length > 0 && (
          <Text variant="small" classes="font-semibold mb-3">
            {summaryParts.join(" · ")}
          </Text>
        )}

        {/* Timeline grouped by season */}
        <div className="flex flex-col gap-3">
          {seasons.map((season) => (
            <div key={season.leagueYearId}>
              <Text
                variant="xs"
                classes="font-semibold text-gray-400 mb-1"
              >
                Season {season.leagueYearId}
              </Text>
              <div className="flex flex-col gap-1">
                {season.awards.map((a) => (
                  <div
                    key={a.award_id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-medium capitalize shrink-0 ${categoryClass(
                          a.category,
                        )}`}
                      >
                        {a.category}
                      </span>
                      <Text variant="xs" classes="truncate">
                        {awardLabel(a)}
                        {a.team_abbrev ? (
                          <span className="text-gray-400">
                            {" "}
                            · {a.team_abbrev}
                          </span>
                        ) : null}
                      </Text>
                    </div>
                    <span className="shrink-0">
                      {a.is_winner ? (
                        a.vote_share != null ? (
                          <Text
                            variant="xs"
                            classes="text-gray-400 whitespace-nowrap"
                          >
                            {Math.round(a.vote_share * 100)}%
                          </Text>
                        ) : null
                      ) : (
                        <Text
                          variant="xs"
                          classes="text-gray-400 whitespace-nowrap"
                        >
                          Finalist #{a.rank}
                        </Text>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Border>
    );
  },
);
