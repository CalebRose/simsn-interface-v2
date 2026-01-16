import { FC, useEffect, useMemo, useState } from "react";
import {
  League,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
} from "../../_constants/constants";
import { useAuthStore } from "../../context/AuthContext";
import { getThemeColors } from "../../_utility/themeHelpers";
import { PageContainer } from "../../_design/Container";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import {
  CFBSchedulePage,
  NFLSchedulePage,
} from "./FootballSchedule/FootballSchedulePage";
import {
  CHLSchedulePage,
  PHLSchedulePage,
} from "./HockeySchedule/HockeySchedulePage";
import {
  CBBSchedulePage,
  NBASchedulePage,
} from "./BasketballSchedule/BasketballSchedulePage";

interface SchedulePageProps {
  league: League;
  ts?: any;
}

export const SchedulePage: FC<SchedulePageProps> = ({ league }) => {
  const { currentUser } = useAuthStore();
  const leagueStore = useLeagueStore();
  const { selectedLeague, setSelectedLeague, ts } = leagueStore;
  const { chlTeam, phlTeam } = useSimHCKStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const { cbbTeam, nbaTeam } = useSimBBAStore();

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
    if (selectedLeague === SimCFB && cfbTeam) {
      return false;
    }
    if (selectedLeague === SimNFL && nflTeam) {
      return false;
    }
    if (selectedLeague === SimCBB && cbbTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    return true;
  }, [chlTeam, phlTeam, cfbTeam, nflTeam, cbbTeam, nbaTeam, selectedLeague]);
  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Schedule">
        {selectedLeague === SimCFB && cfbTeam && (
          <CFBSchedulePage league={league} ts={ts} />
        )}
        {selectedLeague === SimNFL && nflTeam && (
          <NFLSchedulePage league={league} ts={ts} />
        )}
        {selectedLeague === SimCHL && chlTeam && (
          <CHLSchedulePage league={league} ts={ts} />
        )}
        {selectedLeague === SimPHL && phlTeam && (
          <PHLSchedulePage league={league} ts={ts} />
        )}
        {selectedLeague === SimCBB && cbbTeam && (
          <CBBSchedulePage league={league} ts={ts} />
        )}
        {selectedLeague === SimNBA && nbaTeam && (
          <NBASchedulePage league={league} ts={ts} />
        )}
      </PageContainer>
    </>
  );
};
