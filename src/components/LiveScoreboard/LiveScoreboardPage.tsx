// /components/LiveScoreboard/LiveScoreboardPage.tsx

import { FC, useEffect } from "react";
import { League, SimCFB, SimCHL, SimNFL, SimPHL } from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import LiveRink from "./LiveRink/LiveRink";
import LiveField from "./LiveField/LiveField";

interface LiveScoreboardPageProps {
  league: League;
}

export const LiveScoreboardPage: FC<LiveScoreboardPageProps> = ({ league }) => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();

  // Keep the global context in sync with the current route
  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague, league, setSelectedLeague]);

  return (
    <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden relative text-left">
      {/* Route to the correct sports visualizer based on the selected league */}
      {(selectedLeague === SimCHL || selectedLeague === SimPHL) && <LiveRink />}
      {(selectedLeague === SimCFB || selectedLeague === SimNFL) && <LiveField />}
    </div>
  );
};