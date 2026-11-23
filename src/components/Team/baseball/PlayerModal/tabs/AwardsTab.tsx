import { FC, memo, useMemo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import type {
  PlayerAward,
  PlayerAwardsResponse,
} from "../../../../../models/baseball/baseballStatsModels";
import {
  awardCategoryClass,
  awardQualifiedLabel,
  useLeagueYearLabels,
} from "../../Awards/awardsDisplay";

interface AwardsTabProps {
  awards: PlayerAwardsResponse | null;
  awardsLoading: boolean;
}

type ShelfGroup = "trophies" | "championships" | "selections";

const groupOf = (category: string | undefined): ShelfGroup =>
  category === "selection"
    ? "selections"
    : category === "championship"
      ? "championships"
      : "trophies";

export const AwardsTab: FC<AwardsTabProps> = memo(
  ({ awards, awardsLoading }) => {
    // Season labels (league_year_id → year) come from the session-cached
    // awards history; only fetched once this tab has something to show.
    const hasAwards = (awards?.awards.length ?? 0) > 0;
    const years = useLeagueYearLabels(hasAwards);

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

    // Headline lines from the career summary: "3× MVP · 2× Silver Slugger",
    // split into trophies, championships and selections, most wins first.
    const headline = useMemo(() => {
      const categoryByCode = new Map<string, string>();
      for (const a of awards?.awards ?? []) categoryByCode.set(a.award_code, a.category);
      const lines: Record<ShelfGroup, string[]> = {
        trophies: [],
        championships: [],
        selections: [],
      };
      Object.entries(awards?.summary ?? {})
        .filter(([, e]) => e.wins > 0)
        .sort(([, a], [, b]) => b.wins - a.wins)
        .forEach(([code, e]) => {
          lines[groupOf(categoryByCode.get(code))].push(`${e.wins}× ${e.name}`);
        });
      return lines;
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

    const headlineRows: [ShelfGroup, string][] = [
      ["trophies", "Trophies"],
      ["championships", "Championships"],
      ["selections", "Selections"],
    ];

    return (
      <Border classes="p-3">
        {/* Headline summary */}
        <div className="flex flex-col gap-0.5 mb-3 text-start">
          {headlineRows
            .filter(([key]) => headline[key].length > 0)
            .map(([key, label]) => (
              <Text key={key} variant="small">
                <span className="text-gray-400 mr-1.5">{label}:</span>
                <span className="font-semibold">{headline[key].join(" · ")}</span>
              </Text>
            ))}
        </div>

        {/* Timeline grouped by season */}
        <div className="flex flex-col gap-3">
          {seasons.map((season) => (
            <div key={season.leagueYearId}>
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                {years.has(season.leagueYearId)
                  ? years.get(season.leagueYearId)
                  : `Season ${season.leagueYearId}`}
              </Text>
              <div className="flex flex-col gap-1">
                {season.awards.map((a) => (
                  <div
                    key={a.award_id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-medium capitalize shrink-0 ${awardCategoryClass(
                          a.category,
                        )}`}
                      >
                        {a.category}
                      </span>
                      <Text variant="xs" classes="truncate">
                        {awardQualifiedLabel(a)}
                        {a.team_abbrev ? (
                          <span className="text-gray-400"> · {a.team_abbrev}</span>
                        ) : null}
                      </Text>
                    </div>
                    <span className="shrink-0">
                      {a.is_winner ? (
                        a.vote_share != null ? (
                          <Text variant="xs" classes="text-gray-400 whitespace-nowrap">
                            {Math.round(a.vote_share * 100)}%
                          </Text>
                        ) : null
                      ) : (
                        <Text variant="xs" classes="text-gray-400 whitespace-nowrap">
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
