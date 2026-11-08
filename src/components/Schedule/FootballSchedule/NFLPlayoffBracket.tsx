import { FC, useMemo } from "react";
import { SimNFL } from "../../../_constants/constants";
import { RevealFBResults } from "../../../_helper/teamHelper";
import type { Match, Team } from "../../../models/basketballModels";
import {
  TournamentBracketView,
  TournamentEntry,
  useRevealedGames,
} from "../BasketballSchedule/CBBConferenceTournamentBracket";
import {
  BracketLayout,
  layoutBracket,
} from "../BasketballSchedule/cbbBracketLayout";
import { findPlayoffGames } from "./cfbPlayoffGames";
import { detachFirstRound } from "./nflPlayoffLayout";

interface Props {
  games: any[];
  teamMap: Record<number, any> | null;
  ts: any;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
}

// Full 14-team NFL playoff: 6 Wild Card, 4 Divisional, 2 Conference
// Championship games and the Super Bowl. Game titles are blank in the data, so
// the round names come from the shape of the bracket.
const NFL_GAME_COUNT = 13;
const NFL_LABELS = [
  "Wild Card",
  "Divisional",
  "Conference Championships",
  "Super Bowl",
];

// "American Football Conference" / "AFC" -> "AFC", and likewise for the NFC.
const shortConference = (name: string) =>
  /AFC|American/i.test(name)
    ? "AFC"
    : /NFC|National/i.test(name)
      ? "NFC"
      : name;

// Label each conference's section with the conference most of its teams are in.
const labelConferences = (
  layout: BracketLayout,
  games: Match[],
  teamMap: Record<number, any> | null,
): BracketLayout => ({
  ...layout,
  groups: layout.groups?.map((group) => {
    const votes = new Map<string, number>();
    games
      .filter((g) => group.gameIDs.includes(g.ID))
      .forEach((g) =>
        [g.HomeTeamID, g.AwayTeamID].forEach((id) => {
          const conference = teamMap?.[id]?.Conference;
          if (conference)
            votes.set(conference, (votes.get(conference) ?? 0) + 1);
        }),
      );
    const top = Array.from(votes.entries()).sort((a, b) => b[1] - a[1])[0];
    return top ? { ...group, label: shortConference(top[0]) } : group;
  }),
});

export const NFLPlayoffBracket: FC<Props> = ({
  games: allGames,
  teamMap,
  ts,
  ...style
}) => {
  const playoffGames = useMemo(
    () =>
      findPlayoffGames(allGames.filter((g) => !g.IsPreseasonGame)).map(
        (g) =>
          Object.assign(Object.create(Object.getPrototypeOf(g)), g, {
            MatchName: g.GameTitle ?? "",
          }) as Match,
      ),
    [allGames],
  );
  const games = useRevealedGames(playoffGames, ts, (g) =>
    RevealFBResults(g as any, ts, SimNFL, false),
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

  const entries = useMemo<TournamentEntry[]>(
    () =>
      games.length
        ? [
            {
              key: "nfl",
              name: "NFL Playoffs",
              games,
              layout: labelConferences(
                detachFirstRound(layoutBracket(games)),
                games,
                teamMap,
              ),
              roundLabels:
                games.length === NFL_GAME_COUNT ? NFL_LABELS : undefined,
              hideSeeds: true,
            },
          ]
        : [],
    [games, teamMap],
  );

  return (
    <TournamentBracketView
      entries={entries}
      heading={(entry) => entry?.name ?? "NFL Playoffs"}
      placeholder="Select Bracket..."
      emptyText="No playoff games found for this season."
      winnerLabel="Champion"
      league={SimNFL}
      teamMap={abbrMap}
      modalTeamMap={teamMap}
      ts={ts}
      playerMap={undefined}
      {...style}
    />
  );
};
