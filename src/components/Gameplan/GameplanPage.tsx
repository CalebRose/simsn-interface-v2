import { FC, useEffect, useMemo } from "react";
import { 
  League, 
  SimCHL, 
  SimPHL,
  SimCFB,
  SimNFL
} from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { PageContainer } from "../../_design/Container";
import { CHLLineupPage, PHLLineupPage } from "./HockeyLineups/LineupPage";
import { CFBGameplanPage, NFLGameplanPage } from "./FootballGameplan/FootballGameplanPage"

interface GameplanPageProps {
  league: League;
}

export const GameplanPage: FC<GameplanPageProps> = ({ league }) => {
  const leagueStore = useLeagueStore();
  const fbStore = useSimFBAStore();
  const { selectedLeague, setSelectedLeague } = leagueStore;
  const { chlTeam, phlTeam } = useSimHCKStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const {
    collegeGameplanMap,
    collegeDepthChart,
    cfbDepthChartMap,
    nflGameplanMap,
    nflDepthChart,
    nflDepthChartMap,
    getBootstrapGameplanData,
  } = fbStore

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isLoading = useMemo(() => {
    if (selectedLeague === SimCHL && chlTeam) {
      return false;
    }
    if (selectedLeague === SimPHL && phlTeam) {
      return false;
    }
    if (selectedLeague === SimCFB) {
      if (cfbTeam && collegeGameplanMap && collegeDepthChart && cfbDepthChartMap) {
        return false;
      }
      getBootstrapGameplanData();
    }
    if (selectedLeague === SimNFL) {
      if (nflTeam && nflGameplanMap && nflDepthChart && nflDepthChartMap) {
        return false;
      }
      getBootstrapGameplanData();
    }
    return true;
  }, [chlTeam, phlTeam, cfbTeam, nflTeam, selectedLeague, collegeGameplanMap, collegeDepthChart, cfbDepthChartMap, nflGameplanMap, nflDepthChart, nflDepthChartMap]);

  const title = useMemo(() => {
    if (selectedLeague === SimCHL && chlTeam) {
      return `${chlTeam.TeamName} Lineups`;
    }
    if (selectedLeague === SimPHL && phlTeam) {
      return `${phlTeam.TeamName} Lineups`;
    }
    if (selectedLeague === SimCFB && cfbTeam) {
      return `${cfbTeam.TeamName} Gameplan`;
    }
    if (selectedLeague === SimNFL && nflTeam) {
      return `${nflTeam.TeamName} Gameplan`;
    }
    return "Gameplan";
  }, [chlTeam, phlTeam, selectedLeague]);

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title={title}>
        {selectedLeague === SimCHL && chlTeam && <CHLLineupPage />}
        {selectedLeague === SimPHL && phlTeam && <PHLLineupPage />}
        {selectedLeague === SimCFB && cfbTeam && <CFBGameplanPage />}
        {selectedLeague === SimNFL && nflTeam && <NFLGameplanPage />}
      </PageContainer>
    </>
  );
};
