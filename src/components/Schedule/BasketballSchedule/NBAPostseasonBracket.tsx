import { FC, ReactNode, useMemo, useState } from "react";
import { SimNBA } from "../../../_constants/constants";
import { SelectDropdown } from "../../../_design/Select";
import type { Match, Team } from "../../../models/basketballModels";
import {
  TournamentBracketView,
  TournamentEntry,
  useRevealedGames,
} from "./CBBConferenceTournamentBracket";
import {
  buildSeries,
  isPlayInGame,
  layoutPlayIn,
  splitLeagues,
} from "./nbaPostseasonLayout";
import { splitTournaments } from "./cbbBracketLayout";

interface Props {
  mode: "nba" | "isl";
  games: any[];
  teamMap: Record<number, any> | null;
  ts: any;
  playerMap: any;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  topControls?: ReactNode;
}

export const NBAPostseasonBracket: FC<Props> = ({
  mode,
  games: allGames,
  teamMap,
  ts,
  topControls,
  ...style
}) => {
  const games = useRevealedGames(allGames as Match[], ts);

  const entries = useMemo<TournamentEntry[]>(() => {
    const series = buildSeries(games);
    const { nba, isl } = splitLeagues(series, splitTournaments(series));

    const result: TournamentEntry[] = [];

    if (mode === "isl") {
      if (isl.length)
        result.push({
          key: "isl",
          name: "ISL Playoffs",
          games: isl,
          labelFromMatchName: true,
          noClick: true,
        });
      return result;
    }

    // Play-in games sit outside any series; show them per conference, under
    // the playoff bracket.
    const byConference = new Map<string, Match[]>();
    games.filter(isPlayInGame).forEach((g) => {
      const conf =
        teamMap?.[g.HomeTeamID]?.Conference ??
        teamMap?.[g.AwayTeamID]?.Conference ??
        "Play-In";
      byConference.set(conf, [...(byConference.get(conf) || []), g]);
    });
    const playIn: TournamentEntry[] = Array.from(byConference.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([conf, confGames]) => ({
        key: `playin-${conf}`,
        name: `${conf} Play-In`,
        games: confGames,
        layout: layoutPlayIn(confGames),
        roundLabels: ["Play-In", "Play-In Final"],
        hideWinner: true,
      }));

    if (nba.length || playIn.length)
      result.push({
        key: "nba",
        name: "NBA Playoffs",
        games: nba,
        labelFromMatchName: true,
        noClick: true,
        below: playIn,
      });
    return result;
  }, [games, teamMap, mode]);

  return (
    <TournamentBracketView
      entries={entries}
      heading={(entry) => entry?.name ?? "Playoffs"}
      placeholder="Select Bracket..."
      emptyText="No playoff games found for this season."
      winnerLabel="Champion"
      topControls={topControls}
      league={SimNBA}
      teamMap={teamMap as Record<number, Team> | null}
      ts={ts}
      {...style}
    />
  );
};

const PLAYOFFS = [
  { value: "nba", label: "NBA Playoffs" },
  { value: "isl", label: "ISL Playoffs" },
];

// One page for both playoffs: pick NBA or ISL from a dropdown.
export const NBAPostseasonPage: FC<Omit<Props, "mode" | "topControls">> = (
  props,
) => {
  const [mode, setMode] = useState<"nba" | "isl">("nba");
  return (
    <NBAPostseasonBracket
      key={mode}
      mode={mode}
      topControls={
        <div className="w-full max-w-md">
          <SelectDropdown
            options={PLAYOFFS}
            value={PLAYOFFS.find((p) => p.value === mode)}
            placeholder="Select Playoffs..."
            onChange={(option) =>
              setMode(option?.value === "isl" ? "isl" : "nba")
            }
          />
        </div>
      }
      {...props}
    />
  );
};
