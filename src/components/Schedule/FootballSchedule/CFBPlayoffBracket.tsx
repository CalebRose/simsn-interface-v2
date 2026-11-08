import { FC, useMemo } from "react";
import { SimCFB } from "../../../_constants/constants";
import { RevealFBResults } from "../../../_helper/teamHelper";
import type { Match, Team } from "../../../models/basketballModels";
import {
  TournamentBracketView,
  TournamentEntry,
  useRevealedGames,
} from "../BasketballSchedule/CBBConferenceTournamentBracket";
import { findPlayoffGames } from "./cfbPlayoffGames";

interface Props {
  games: any[];
  teamMap: Record<number, any> | null;
  ts: any;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
}

// Full 12-team College Football Playoff: 4 first-round games, then the four
// quarterfinal bowls, two semifinal bowls and the championship.
const CFP_GAME_COUNT = 11;
const CFP_LABELS = [
  "First Round",
  "Quarterfinals",
  "Semifinals",
  "National Championship",
];

export const CFBPlayoffBracket: FC<Props> = ({
  games: allGames,
  teamMap,
  ts,
  ...style
}) => {
  // The shared bracket reads MatchName; football games carry GameTitle.
  const playoffGames = useMemo(
    () =>
      findPlayoffGames(allGames).map(
        (g) =>
          Object.assign(Object.create(Object.getPrototypeOf(g)), g, {
            MatchName: (g.GameTitle ?? "").replace(/^\d{4}\s+/, ""),
          }) as Match,
      ),
    [allGames],
  );
  const games = useRevealedGames(playoffGames, ts, (g) =>
    RevealFBResults(g as any, ts, SimCFB, false),
  );

  // The shared bracket shows team.Abbr; football teams call it TeamAbbr.
  const abbrMap = useMemo(
    () =>
      Object.fromEntries(
        Object.values(teamMap ?? {}).map((t: any) => [
          t.ID,
          { Abbr: t.TeamAbbr },
        ]),
      ) as unknown as Record<number, Team>,
    [teamMap],
  );

  const entries = useMemo<TournamentEntry[]>(() => {
    // The bowl flag isn't reliable (some FCS playoff games carry it), so tell
    // the two playoffs apart by title: FCS ones are named "FCS ...".
    const isFCS = (g: Match) => /FCS/i.test(g.MatchName ?? "");
    const fbs = games.filter((g) => !isFCS(g));
    const fcs = games.filter(isFCS);
    const result: TournamentEntry[] = [];
    if (fbs.length)
      result.push({
        key: "cfp",
        name: "College Football Playoff",
        buttonLabel: "College Football Playoff",
        games: fbs,
        roundLabels: fbs.length === CFP_GAME_COUNT ? CFP_LABELS : undefined,
        showTitles: true,
        hideSeeds: true,
      });
    if (fcs.length)
      result.push({
        key: "fcs",
        name: "FCS Playoffs",
        buttonLabel: "FCS Playoffs",
        games: fcs,
        labelFromMatchName: true,
        hideSeeds: true,
      });
    return result;
  }, [games]);

  return (
    <TournamentBracketView
      entries={entries}
      heading={(entry) => entry?.name ?? "Playoffs"}
      placeholder="Select Bracket..."
      emptyText="No playoff games found for this season."
      winnerLabel="Champion"
      league={SimCFB}
      teamMap={abbrMap}
      modalTeamMap={teamMap}
      ts={ts}
      playerMap={undefined}
      {...style}
    />
  );
};
