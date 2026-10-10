import type { Match } from "../../../models/basketballModels";

export interface BracketNode {
  game: Match;
  round: number;
  // Vertical centre in abstract units; 1 unit = spacing of the deepest tree level.
  y: number;
  parentID?: number;
  // 0 = this game's winner is the parent's top (home) team, 1 = bottom (away).
  side?: 0 | 1;
}

export interface BracketLayout {
  roundCount: number;
  nodes: BracketNode[];
  // Smallest vertical gap (units) between two games in one round.
  minGap: number;
  seeds: Map<number, number>;
}

const winnerOf = (g: Match): number | undefined =>
  g.HomeTeamWin ? g.HomeTeamID : g.AwayTeamWin ? g.AwayTeamID : undefined;

// 1,2 -> 1,4,2,3 -> 1,8,4,5,2,7,3,6 (standard bracket order of the top seeds)
export const standardSeedOrder = (count: number): number[] => {
  let order = [1];
  while (order.length < count) {
    const total = order.length * 2;
    order = order.flatMap((s) => [s, total + 1 - s]);
  }
  return order;
};

const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

const chronological = (a: Match, b: Match) => a.Week - b.Week || a.ID - b.ID;

// child game ID -> the game its winner plays next. Uses NextGameID when it
// points at a game in the set; otherwise follows the winner to their next game.
export const resolveLinks = (games: Match[]): Map<number, number> => {
  const ids = new Set(games.map((g) => g.ID));
  const ordered = [...games].sort(chronological);
  const links = new Map<number, number>();
  ordered.forEach((g, i) => {
    if (g.NextGameID && ids.has(g.NextGameID)) {
      links.set(g.ID, g.NextGameID);
      return;
    }
    const winner = winnerOf(g);
    if (winner === undefined) return;
    const next = ordered
      .slice(i + 1)
      .find((o) => o.HomeTeamID === winner || o.AwayTeamID === winner);
    if (next) links.set(g.ID, next.ID);
  });
  return links;
};

// One group per tournament: games joined by advancement links.
export const splitTournaments = (games: Match[]): Match[][] => {
  const links = resolveLinks(games);
  const parent = new Map(games.map((g) => [g.ID, g.ID]));
  const find = (id: number): number => {
    while (parent.get(id) !== id) id = parent.get(id)!;
    return id;
  };
  links.forEach((to, from) => parent.set(find(from), find(to)));
  const groups = new Map<number, Match[]>();
  games.forEach((g) => {
    const root = find(g.ID);
    groups.set(root, [...(groups.get(root) || []), g]);
  });
  return Array.from(groups.values());
};

export const layoutBracket = (games: Match[]): BracketLayout => {
  const links = resolveLinks(games);
  const linked = games.filter((g) => links.has(g.ID));
  const useLinks = games.length > 1 && linked.length === games.length - 1;
  const nodes = new Map<number, BracketNode>();

  if (useLinks) {
    const feeders = new Map<number, Match[]>();
    linked.forEach((g) => {
      const to = links.get(g.ID)!;
      feeders.set(to, [...(feeders.get(to) || []), g]);
    });
    const root = games.find((g) => !links.has(g.ID))!;

    // Each feeder goes above or below depending on whether its winner is the
    // parent's home (top) or away (bottom) team; unknown results fall back to ID.
    const sides = (parent: Match): Array<[Match, 0 | 1]> => {
      const kids = (feeders.get(parent.ID) || []).sort((a, b) => a.ID - b.ID);
      const wanted: number[] = kids.map((k) => {
        const w = winnerOf(k);
        return w === parent.HomeTeamID ? 0 : w === parent.AwayTeamID ? 1 : -1;
      });
      const taken = new Set(wanted.filter((s) => s >= 0));
      return kids.map((k, i) => {
        let s = wanted[i];
        if (s < 0 || (wanted.indexOf(s) !== i && kids.length > 1)) {
          s = [0, 1].find((c) => !taken.has(c)) ?? 1;
        }
        taken.add(s);
        return [k, s as 0 | 1];
      });
    };

    const place = (g: Match, depth: number, index: number) => {
      nodes.set(g.ID, { game: g, round: depth, y: index });
      sides(g).forEach(([kid, side]) => {
        place(kid, depth + 1, index * 2 + side);
        const n = nodes.get(kid.ID)!;
        n.parentID = g.ID;
        n.side = side;
      });
    };
    place(root, 0, 0);

    const maxDepth = Math.max(...Array.from(nodes.values(), (n) => n.round));
    nodes.forEach((n) => {
      const depth = n.round;
      n.y = (n.y + 0.5) * Math.pow(2, maxDepth - depth);
      n.round = maxDepth - depth + 1;
    });
  } else {
    const weeks = Array.from(new Set(games.map((g) => g.Week))).sort(
      (a, b) => a - b,
    );
    const perRound = weeks.map((w) =>
      games.filter((g) => g.Week === w).sort((a, b) => a.ID - b.ID),
    );
    const widest = Math.max(...perRound.map((r) => r.length), 1);
    perRound.forEach((round, r) =>
      round.forEach((g, k) =>
        nodes.set(g.ID, {
          game: g,
          round: r + 1,
          y: (k + 0.5) * (widest / round.length),
        }),
      ),
    );
  }

  const list = Array.from(nodes.values());
  const roundCount = Math.max(...list.map((n) => n.round), 1);

  let minGap = Infinity;
  for (let r = 1; r <= roundCount; r++) {
    const ys = list
      .filter((n) => n.round === r)
      .map((n) => n.y)
      .sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) minGap = Math.min(minGap, ys[i] - ys[i - 1]);
  }
  if (!isFinite(minGap)) minGap = 1;

  return { roundCount, nodes: list, minGap, seeds: inferSeeds(list, roundCount) };
};

// The rank on a game is the tournament seed for early-round games, but it is a
// poll rank for top seeds that enter late. Trust early-round ranks, and infer
// the bye teams' seeds (1..k) from where they sit in the bracket.
const inferSeeds = (nodes: BracketNode[], roundCount: number) => {
  const seeds = new Map<number, number>();
  const firstSeen = new Map<number, { round: number; y: number }>();
  const ordered = [...nodes].sort((a, b) => a.round - b.round || a.y - b.y);
  const trustedUpTo = Math.max(1, roundCount - 3);
  const firstRank = new Map<number, number>();

  ordered.forEach(({ game, round, y }) => {
    ([
      [game.HomeTeamID, game.HomeTeamRank],
      [game.AwayTeamID, game.AwayTeamRank],
    ] as Array<[number, number]>).forEach(([id, rank]) => {
      if (firstSeen.has(id)) return;
      firstSeen.set(id, { round, y });
      firstRank.set(id, rank);
      if (round <= trustedUpTo && rank > 0) seeds.set(id, rank);
    });
  });

  // If every team's first-game rank is exactly 1..N, they are all real seeds.
  const ranks = Array.from(firstRank.values()).sort((a, b) => a - b);
  if (ranks.every((r, i) => r === i + 1)) return new Map(firstRank);

  const byes = Array.from(firstSeen.entries())
    .filter(([id]) => !seeds.has(id))
    .sort((a, b) => a[1].round - b[1].round || a[1].y - b[1].y);
  const used = new Set(seeds.values());
  const free = byes.length > 0 &&
    isPowerOfTwo(byes.length) &&
    Array.from({ length: byes.length }, (_, i) => i + 1).every((s) => !used.has(s));
  if (free) {
    const order = standardSeedOrder(byes.length);
    byes.forEach(([id], i) => seeds.set(id, order[i]));
  }
  return seeds;
};

export const NCAA_ROUND_NAMES = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "NCAA National Championship",
];
const NIT_ROUND_NAMES = [
  "NIT First Round",
  "NIT Second Round",
  "NIT Quarterfinals",
  "NIT Semifinals",
  "NIT Championship",
];
const CBI_ROUND_NAMES = [
  "CBI First Round",
  "CBI Quarterfinals",
  "CBI Semifinals",
  "CBI Championship",
];

export const isNCAAGame = (g: Match) =>
  g.IsPlayoffGame && NCAA_ROUND_NAMES.includes(g.MatchName);
export const isNITGame = (g: Match) => NIT_ROUND_NAMES.includes(g.MatchName);
export const isCBIGame = (g: Match) => CBI_ROUND_NAMES.includes(g.MatchName);

// Conference tournament games are flagged, but not reliably (a few real ones
// come through unflagged), so also accept an unflagged game whose name shares
// a conference prefix with a flagged one in the same weeks.
const ROUND_SUFFIX =
  /\s+(First Round|Second Round|Third Round|Quarter ?finals|Semifinals|Finals)$/i;
export const findConferenceTournamentGames = (games: Match[]) => {
  const flagged = games.filter((g) => g.IsConferenceTournament);
  const prefixes = new Set(flagged.map((g) => (g.MatchName ?? "").replace(ROUND_SUFFIX, "")));
  const weeks = flagged.map((g) => g.Week);
  const [first, last] = [Math.min(...weeks), Math.max(...weeks)];
  return games.filter(
    (g) =>
      g.IsConferenceTournament ||
      (!g.IsPlayoffGame &&
        ROUND_SUFFIX.test(g.MatchName ?? "") &&
        g.Week >= first &&
        g.Week <= last &&
        prefixes.has((g.MatchName ?? "").replace(ROUND_SUFFIX, ""))),
  );
};

// Splits a regional tournament into its regions (one per game of `regionRound`,
// plus everything that fed it) and the games of the later rounds.
// `regions` is undefined until all expected region games exist.
export const splitRegionalTournament = (
  games: Match[],
  regionRound: string,
  regionCount: number,
  finalNames: string[],
) => {
  const links = resolveLinks(games);
  const feedersOf = (id: number) => games.filter((g) => links.get(g.ID) === id);
  const subtree = (root: Match): Match[] => [
    root,
    ...feedersOf(root.ID).flatMap(subtree),
  ];
  const regionRoots = games
    .filter((g) => g.MatchName === regionRound)
    .sort((a, b) => (links.get(a.ID) ?? 0) - (links.get(b.ID) ?? 0) || a.ID - b.ID);
  return {
    regions:
      regionRoots.length === regionCount ? regionRoots.map(subtree) : undefined,
    finals: games.filter((g) => finalNames.includes(g.MatchName)),
  };
};
