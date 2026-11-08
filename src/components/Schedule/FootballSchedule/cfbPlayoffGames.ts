interface PlayoffCandidate {
  ID: number;
  NextGameID: number;
  IsPlayoffGame: boolean;
}

// The playoff games for a season: every game flagged IsPlayoffGame, plus any
// game whose winner advances into one (followed back through earlier rounds).
// The extra step keeps a bracket intact when a data entry error leaves a real
// playoff game unflagged. Regular games and ordinary bowls have NextGameID 0, so
// they never match.
export const findPlayoffGames = <T extends PlayoffCandidate>(
  games: T[],
): T[] => {
  const ids = new Set(games.filter((g) => g.IsPlayoffGame).map((g) => g.ID));
  let grew = true;
  while (grew) {
    grew = false;
    games.forEach((g) => {
      if (!ids.has(g.ID) && g.NextGameID && ids.has(g.NextGameID)) {
        ids.add(g.ID);
        grew = true;
      }
    });
  }
  return games.filter((g) => ids.has(g.ID));
};
