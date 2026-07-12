import { FC, useEffect, useMemo } from "react";
import {
  League,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
} from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { PageContainer } from "../../_design/Container";
import { CHLLineupPage, PHLLineupPage } from "./HockeyLineups/LineupPage";
import {
  CFBGameplanPage,
  NFLGameplanPage,
} from "./FootballGameplan/FootballGameplanPage";
import { BasketballGameplanPage } from "./BasketballGameplan/BasketballGamplanPage";
import { useSimBBAStore } from "../../context/SimBBAContext";

interface GameplanPageProps {
  league: League;
}

export const GameplanPage: FC<GameplanPageProps> = ({ league }) => {
  const leagueStore = useLeagueStore();
  const fbStore = useSimFBAStore();
  const { selectedLeague, setSelectedLeague } = leagueStore;
  const { chlTeam, phlTeam } = useSimHCKStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const { cbbTeam, nbaTeam } = useSimBBAStore();
  const {
    collegeGameplanMap,
    collegeDepthChart,
    cfbDepthChartMap,
    nflGameplanMap,
    nflDepthChart,
    nflDepthChartMap,
    getBootstrapGameplanData,
    getBootstrapPlayerData,
  } = fbStore;

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
    if (selectedLeague === SimCBB && cbbTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    if (selectedLeague === SimCFB) {
      if (
        cfbTeam &&
        collegeGameplanMap &&
        collegeDepthChart &&
        cfbDepthChartMap
      ) {
        return false;
      }
      getBootstrapGameplanData();
      getBootstrapPlayerData();
    }
    if (selectedLeague === SimNFL) {
      if (nflTeam && nflGameplanMap && nflDepthChart && nflDepthChartMap) {
        return false;
      }
      getBootstrapGameplanData();
      getBootstrapPlayerData();
    }
    return true;
  }, [
    chlTeam,
    phlTeam,
    cfbTeam,
    nflTeam,
    cbbTeam,
    nbaTeam,
    selectedLeague,
    collegeGameplanMap,
    collegeDepthChart,
    cfbDepthChartMap,
    nflGameplanMap,
    nflDepthChart,
    nflDepthChartMap,
  ]);

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
    if (selectedLeague === SimCBB && cbbTeam) {
      return `${cbbTeam.Team} Gameplan`;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return `${nbaTeam.Team} Gameplan`;
    }
    return "Gameplan";
  }, [chlTeam, phlTeam, cfbTeam, nflTeam, cbbTeam, nbaTeam, selectedLeague]);

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title={title}>
        {selectedLeague === SimCHL && chlTeam && <CHLLineupPage />}
        {selectedLeague === SimPHL && phlTeam && <PHLLineupPage />}
        {selectedLeague === SimCFB && cfbTeam && <CFBGameplanPage />}
        {selectedLeague === SimNFL && nflTeam && <NFLGameplanPage />}
        {selectedLeague === SimCBB && cbbTeam && <BasketballGameplanPage />}
        {selectedLeague === SimNBA && nbaTeam && <BasketballGameplanPage />}
      </PageContainer>
    </>
  );
};
