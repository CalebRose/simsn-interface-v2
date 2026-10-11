import type {
  BracketLayout,
  BracketNode,
} from "../BasketballSchedule/cbbBracketLayout";

// The NFL reseeds after the Wild Card round: the lowest remaining seed plays the
// one-seed, so a Wild Card winner doesn't go to one specific divisional game.
// - Drop the lines between the Wild Card and Divisional rounds.
// - Space each conference's Wild Card games evenly beside its divisional games.
// - Push the lower conference down by `conferenceGap` (in rows) so the two
//   halves don't run together, and re-centre the Super Bowl between them.
// Later rounds keep their lines.
export const detachFirstRound = (
  layout: BracketLayout,
  conferenceGap = 1,
): BracketLayout => {
  const byID = new Map(layout.nodes.map((n) => [n.game.ID, n]));
  const halfRound = layout.roundCount - 1; // the conference championships
  if (halfRound < 2) return layout;

  // Each game belongs to the conference championship it eventually feeds.
  const halfOf = (n: BracketNode): number | undefined => {
    let cur: BracketNode | undefined = n;
    while (cur && cur.round < halfRound)
      cur = cur.parentID ? byID.get(cur.parentID) : undefined;
    return cur && cur.round === halfRound ? cur.game.ID : undefined;
  };
  const halves = layout.nodes
    .filter((n) => n.round === halfRound)
    .sort((a, b) => a.y - b.y)
    .map((n) => n.game.ID);
  const halfIndex = new Map<number, number>(
    layout.nodes.map((n) => [n.game.ID, halves.indexOf(halfOf(n) ?? -1)]),
  );

  // 1. Shift lower halves down, and re-centre the final between its feeders.
  let nodes: BracketNode[] = layout.nodes.map((n) => {
    const i = halfIndex.get(n.game.ID) ?? -1;
    return i > 0 ? { ...n, y: n.y + i * conferenceGap } : n;
  });
  nodes = nodes.map((n) => {
    if (n.round !== layout.roundCount) return n;
    const feeders = nodes.filter((f) => f.parentID === n.game.ID);
    return feeders.length
      ? { ...n, y: feeders.reduce((s, f) => s + f.y, 0) / feeders.length }
      : n;
  });

  // 2. First-round games: no lines, evenly spaced within their conference.
  const placed = new Map<number, number>();
  halves.forEach((_, i) => {
    const inHalf = (n: BracketNode) => (halfIndex.get(n.game.ID) ?? -1) === i;
    const first = nodes.filter((n) => n.round === 1 && inHalf(n));
    const next = nodes.filter((n) => n.round === 2 && inHalf(n));
    if (!first.length || !next.length) return;
    first.sort((a, b) => a.y - b.y);
    const top = Math.min(...next.map((n) => n.y));
    const bottom = Math.max(...next.map((n) => n.y));
    const step =
      first.length > 1 ? Math.max((bottom - top) / (first.length - 1), 1) : 0;
    const start = (top + bottom) / 2 - (step * (first.length - 1)) / 2;
    first.forEach((n, k) => placed.set(n.game.ID, start + k * step));
  });
  nodes = nodes.map((n) =>
    n.round === 1
      ? {
          ...n,
          y: placed.get(n.game.ID) ?? n.y,
          parentID: undefined,
          side: undefined,
        }
      : n,
  );

  // Recompute the tightest vertical gap within a round.
  let minGap = Infinity;
  for (let r = 1; r <= layout.roundCount; r++) {
    const ys = nodes
      .filter((n) => n.round === r)
      .map((n) => n.y)
      .sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) {
      minGap = Math.min(minGap, ys[i] - ys[i - 1]);
    }
  }
  const groups = halves.map((_, i) => {
    const members = nodes.filter((n) => (halfIndex.get(n.game.ID) ?? -1) === i);
    const ys = members.map((n) => n.y);
    return {
      gameIDs: members.map((n) => n.game.ID),
      fromY: Math.min(...ys),
      toY: Math.max(...ys),
    };
  });
  return {
    ...layout,
    nodes,
    groups,
    minGap: isFinite(minGap) ? minGap : 1,
  };
};
