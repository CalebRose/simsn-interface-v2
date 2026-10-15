import { FC, useMemo } from "react";
import { SimPHL } from "../../../_constants/constants";
import { RevealHCKResults } from "../../../_helper/teamHelper";
import type { Match } from "../../../models/basketballModels";
import {
  TournamentBracketView,
  TournamentEntry,
  useRevealedGames,
} from "../BasketballSchedule/CBBConferenceTournamentBracket";
import {
  labelHalves,
  layoutBracket,
  separateHalves,
} from "../BasketballSchedule/cbbBracketLayout";
import { buildSeries } from "../BasketballSchedule/nbaPostseasonLayout";
import { useHockeyAbbrMap } from "./CHLPlayoffBrackets";

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

// PHL playoff series are best-of-5.
const SERIES_WINS = 3;

export const PHLPlayoffBracket: FC<Props> = ({
  games: allGames,
  teamMap,
  ts,
  ...style
}) => {
  const playoffGames = useMemo(
    () =>
      allGames.filter(
        (g) => g.IsPlayoffGame && (g.SeriesID ?? 0) > 0,
      ) as Match[],
    [allGames],
  );
  const games = useRevealedGames(playoffGames, ts, (g) =>
    RevealHCKResults(g as any, ts, false, SimPHL),
  );
  const abbrMap = useHockeyAbbrMap(teamMap);

  const entries = useMemo<TournamentEntry[]>(() => {
    const series = buildSeries(games, { winsNeeded: SERIES_WINS });
    if (!series.length) return [];
    return [
      {
        key: "phl",
        name: "PHL Playoffs",
        games: series,
        layout: labelHalves(separateHalves(layoutBracket(series)), teamMap),
        hideSeeds: true,
      },
    ];
  }, [games, teamMap]);

  return (
    <TournamentBracketView
      entries={entries}
      heading={() => "PHL Playoffs"}
      placeholder="Select Bracket..."
      emptyText="No playoff games found for this season."
      winnerLabel="Champion"
      league={SimPHL}
      teamMap={abbrMap}
      modalTeamMap={teamMap}
      ts={ts}
      {...style}
    />
  );
};
