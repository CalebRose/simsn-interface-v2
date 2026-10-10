import type { Match } from "../../../models/basketballModels";
import { BracketLayout, resolveLinks } from "./cbbBracketLayout";

// NBA playoff games arrive one per game, grouped by SeriesID. A bracket box is a
// whole series, so each series is folded into one Match-shaped object whose
// "score" is the series record.
const WINS_NEEDED = 4;

// "First Round Game: 0" (2025) and "First Round: Phoenix Suns vs. Oklahoma City
// Thunder" (2024) both become "First Round".
const baseName = (name?: string) =>
  (name ?? "").split(":")[0].replace(/\s*Game\s*$/i, "").trim();

const swapSides = (m: Match): Match =>
  Object.assign(Object.create(Object.getPrototypeOf(m)), m, {
    HomeTeamID: m.AwayTeamID,
    AwayTeamID: m.HomeTeamID,
    HomeTeam: m.AwayTeam,
    AwayTeam: m.HomeTeam,
    HomeTeamRank: m.AwayTeamRank,
    AwayTeamRank: m.HomeTeamRank,
    HomeTeamScore: m.AwayTeamScore,
    AwayTeamScore: m.HomeTeamScore,
    HomeTeamWin: m.AwayTeamWin,
    AwayTeamWin: m.HomeTeamWin,
  }) as Match;

export const isSeriesGame = (g: Match) =>
  ((g as any).SeriesID ?? 0) > 0 && (g.IsPlayoffGame || (g as any).IsTheFinals);

// A play-in game is a postseason game that belongs to no series.
export const isPlayInGame = (g: Match) =>
  ((g as any).SeriesID ?? 0) === 0 &&
  (g.IsPlayoffGame || (g as any).IsPlayInGame);

export const buildSeries = (games: Match[]): Match[] => {
  const bySeries = new Map<number, Match[]>();
  games.filter(isSeriesGame).forEach((g) => {
    const id = (g as any).SeriesID as number;
    bySeries.set(id, [...(bySeries.get(id) || []), g]);
  });

  const series = Array.from(bySeries.entries()).map(([seriesID, list]) => {
    const ordered = [...list].sort((a, b) => a.Week - b.Week || a.ID - b.ID);
    const first = ordered[0];
    // Better seed (lower rank) on top; equal ranks keep game one's home team.
    const homeIsFirst =
      !first.HomeTeamRank ||
      !first.AwayTeamRank ||
      first.HomeTeamRank <= first.AwayTeamRank;
    const [homeID, awayID] = homeIsFirst
      ? [first.HomeTeamID, first.AwayTeamID]
      : [first.AwayTeamID, first.HomeTeamID];
    const rankOf = (id: number) =>
      id === first.HomeTeamID ? first.HomeTeamRank : first.AwayTeamRank;
    const nameOf = (id: number) =>
      id === first.HomeTeamID ? first.HomeTeam : first.AwayTeam;

    let homeWins = 0;
    let awayWins = 0;
    ordered.forEach((g) => {
      if (!g.GameComplete) return;
      const winner = g.HomeTeamWin ? g.HomeTeamID : g.AwayTeamID;
      if (winner === homeID) homeWins++;
      else if (winner === awayID) awayWins++;
    });

    return Object.assign(Object.create(Object.getPrototypeOf(first)), first, {
      ID: seriesID,
      MatchName: baseName(first.MatchName),
      Week: first.Week,
      NextGameID: 0,
      HomeTeamID: homeID,
      AwayTeamID: awayID,
      HomeTeam: nameOf(homeID),
      AwayTeam: nameOf(awayID),
      HomeTeamRank: rankOf(homeID),
      AwayTeamRank: rankOf(awayID),
      HomeTeamScore: homeWins,
      AwayTeamScore: awayWins,
      HomeTeamWin: homeWins >= WINS_NEEDED,
      AwayTeamWin: awayWins >= WINS_NEEDED,
      GameComplete: homeWins >= WINS_NEEDED || awayWins >= WINS_NEEDED,
    }) as Match;
  });

  // Where a series feeds the next round, put the winner of the lower-numbered
  // feeder on top, as a printed bracket would.
  const links = resolveLinks(series);
  const feeders = new Map<number, Match[]>();
  series.forEach((s) => {
    const to = links.get(s.ID);
    if (to !== undefined) feeders.set(to, [...(feeders.get(to) || []), s]);
  });
  return series.map((s) => {
    const kids = (feeders.get(s.ID) || []).sort((a, b) => a.ID - b.ID);
    if (kids.length < 2) return s;
    const topWinner = kids[0].HomeTeamWin ? kids[0].HomeTeamID : kids[0].AwayTeamID;
    return kids[0].GameComplete && topWinner === s.AwayTeamID ? swapSides(s) : s;
  });
};

// Play-in games for one conference: games between teams new to the group come
// first, games involving a team that already played come second.
export const layoutPlayIn = (games: Match[]): BracketLayout => {
  const ordered = [...games].sort((a, b) => a.Week - b.Week || a.ID - b.ID);
  const seen = new Set<number>();
  const rounds = ordered.map((g) => {
    const round = seen.has(g.HomeTeamID) || seen.has(g.AwayTeamID) ? 2 : 1;
    seen.add(g.HomeTeamID);
    seen.add(g.AwayTeamID);
    return round;
  });
  const first = ordered.filter((_, i) => rounds[i] === 1);
  const second = ordered.filter((_, i) => rounds[i] === 2);
  const nodes = [
    ...first.map((game, i) => ({ game, round: 1, y: i })),
    ...second.map((game, i) => ({
      game,
      round: 2,
      y: (first.length - second.length) / 2 + i,
    })),
  ];
  return {
    roundCount: second.length ? 2 : 1,
    nodes,
    minGap: 1,
    seeds: new Map(),
  };
};

// NBA franchises are team IDs 1-32; international (ISL) teams come after (see
// getNBALogo). The team map holds both, so it can't tell the leagues apart.
const NBA_MAX_TEAM_ID = 32;

// Splits series into the NBA and ISL playoffs. Each playoff is one connected
// tree; the ISL one has a series named "ISL ...". For a branch with no such
// series yet (a playoff still in progress), fall back to the team IDs.
export const splitLeagues = (
  series: Match[],
  groups: Match[][],
): { nba: Match[]; isl: Match[] } => {
  const nba: Match[] = [];
  const isl: Match[] = [];
  groups.forEach((group) => {
    const named = group.some((s) => /ISL/i.test(s.MatchName ?? ""));
    const nbaTeams = group.every(
      (s) => s.HomeTeamID <= NBA_MAX_TEAM_ID && s.AwayTeamID <= NBA_MAX_TEAM_ID,
    );
    (named || !nbaTeams ? isl : nba).push(...group);
  });
  return { nba, isl };
};
