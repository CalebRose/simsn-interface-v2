import { FC, useMemo } from "react";
import { SimCHL } from "../../../_constants/constants";
import { RevealHCKResults } from "../../../_helper/teamHelper";
import type { Match, Team } from "../../../models/basketballModels";
import {
  TournamentBracketView,
  TournamentEntry,
  useRevealedGames,
} from "../BasketballSchedule/CBBConferenceTournamentBracket";
import { splitTournaments } from "../BasketballSchedule/cbbBracketLayout";
import { buildSeries } from "../BasketballSchedule/nbaPostseasonLayout";

interface Props {
  games: any[];
  teamMap: Record<number, any> | null;
  ts: any;
  playerMap: any;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
}

// Titles look like "Big Ten Conference Quarterfinals Game: 1",
// "AHA Conference Semifinals" and "ECAC Conference Finals".
const CONFERENCE_TITLE =
  /^(.*?)\s+Conference\s+(Quarterfinals|Semifinals|Finals)\b/i;
const conferenceOf = (g: { GameTitle?: string }) =>
  CONFERENCE_TITLE.exec(g.GameTitle ?? "")?.[1];

// Conference quarterfinals are best-of-3 series.
const QUARTERFINAL_WINS = 2;

// The shared bracket shows team.Abbr; hockey teams call it Abbreviation.
export const useHockeyAbbrMap = (teamMap: Record<number, any> | null) =>
  useMemo(
    () =>
      Object.fromEntries(
        Object.values(teamMap ?? {}).map((t: any) => [
          t.ID,
          { Abbr: t.Abbreviation },
        ]),
      ) as unknown as Record<number, Team>,
    [teamMap],
  );

export const CHLConferenceTournamentBracket: FC<Props> = ({
  games: allGames,
  teamMap,
  ts,
  ...style
}) => {
  const tournamentGames = useMemo(
    () => allGames.filter((g) => conferenceOf(g)) as Match[],
    [allGames],
  );
  const games = useRevealedGames(tournamentGames, ts, (g) =>
    RevealHCKResults(g as any, ts, false, SimCHL),
  );
  const abbrMap = useHockeyAbbrMap(teamMap);

  const entries = useMemo<TournamentEntry[]>(() => {
    const byConference = new Map<string, Match[]>();
    games.forEach((g) => {
      const name = conferenceOf(g as any) as string;
      byConference.set(name, [...(byConference.get(name) ?? []), g]);
    });
    return Array.from(byConference.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, list]) => {
        // Quarterfinal series become one box with the series record. Their IDs
        // are made negative so they can't collide with real game IDs.
        const series = buildSeries(list, {
          winsNeeded: QUARTERFINAL_WINS,
          include: (g) => ((g as any).SeriesID ?? 0) > 0,
        }).map(
          (s) =>
            Object.assign(Object.create(Object.getPrototypeOf(s)), s, {
              ID: -s.ID,
            }) as Match,
        );
        const singles = list.filter((g) => !((g as any).SeriesID > 0));
        return { key: name, name, games: [...series, ...singles] };
      });
  }, [games]);

  return (
    <TournamentBracketView
      entries={entries}
      heading={(entry) =>
        entry ? `${entry.name} Conference Tournament` : "Conference Tournament"
      }
      placeholder="Select Conference..."
      emptyText="No conference tournament games found for this season."
      league={SimCHL}
      teamMap={abbrMap}
      modalTeamMap={teamMap}
      ts={ts}
      {...style}
    />
  );
};

export const CHLNationalTournamentBracket: FC<Props> = ({
  games: allGames,
  teamMap,
  ts,
  ...style
}) => {
  // Playoff games that aren't part of a conference tournament. The year and
  // "SimCHL" are dropped from titles so round names read cleanly.
  const nationalGames = useMemo(
    () =>
      allGames
        .filter((g) => g.IsPlayoffGame && !conferenceOf(g))
        .map(
          (g) =>
            Object.assign(Object.create(Object.getPrototypeOf(g)), g, {
              MatchName: (g.GameTitle ?? "").replace(
                /^\d{4}\s+(SimCHL\s+)?/,
                "",
              ),
            }) as Match,
        ),
    [allGames],
  );
  const games = useRevealedGames(nationalGames, ts, (g) =>
    RevealHCKResults(g as any, ts, false, SimCHL),
  );
  const abbrMap = useHockeyAbbrMap(teamMap);

  const entries = useMemo<TournamentEntry[]>(() => {
    // The tournament is the largest set of linked games, which leaves out
    // one-off games such as the "Toilet Bowl".
    const main = splitTournaments(games).sort((a, b) => b.length - a.length)[0];
    return main
      ? [
          {
            key: "national",
            name: "National Tournament",
            games: main,
            labelFromMatchName: true,
          },
        ]
      : [];
  }, [games]);

  return (
    <TournamentBracketView
      entries={entries}
      heading={() => "National Tournament"}
      placeholder="Select Bracket..."
      emptyText="No national tournament games found for this season."
      winnerLabel="Champion"
      league={SimCHL}
      teamMap={abbrMap}
      modalTeamMap={teamMap}
      ts={ts}
      {...style}
    />
  );
};
