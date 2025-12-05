import { FC, useEffect, useMemo } from "react";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { PageContainer } from "../../_design/Container";
import { HockeyStatsPage } from "./HockeyStats/HockeyStatsPage";
import { FootballStatsPage } from "./FootballStats/FootballStatsPage";

export interface StatsPageProps {
  league: League;
}

export const StatsPage: FC<StatsPageProps> = ({ league }) => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const { phlTeam, chlTeam } = useSimHCKStore();
  const { nflTeam, cfbTeam } = useSimFBAStore();
  const { nbaTeam, cbbTeam } = useSimBBAStore();

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isLoading = useMemo(() => {
    if (selectedLeague === SimCHL && chlTeam) {
      return false;
    }
    if (selectedLeague === SimCFB && cfbTeam) {
      return false;
    }
    if (selectedLeague === SimCBB && cbbTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    if (selectedLeague === SimNFL && nflTeam) {
      return false;
    }
    if (selectedLeague === SimPHL && phlTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    if (selectedLeague === SimNFL && nflTeam) {
      return false;
    }
    return true;
  }, [phlTeam, nflTeam, nbaTeam, chlTeam, cbbTeam, cfbTeam, selectedLeague]);

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Statistics">
        {selectedLeague === SimCFB && cfbTeam && (
          <>
            <FootballStatsPage league={selectedLeague} />
          </>
        )}
        {selectedLeague === SimCBB && cbbTeam && (
          <>This page will be available when Guam wins a playoff game.</>
        )}
        {selectedLeague === SimCHL && chlTeam && (
          <>
            <HockeyStatsPage league={selectedLeague} />
          </>
        )}
        {selectedLeague === SimPHL && phlTeam && (
          <>
            <HockeyStatsPage league={selectedLeague} />
          </>
        )}
        {selectedLeague === SimNBA && nbaTeam && <></>}
        {selectedLeague === SimNFL && nflTeam && (
          <>
            <FootballStatsPage league={selectedLeague} />
          </>
        )}
      </PageContainer>
    </>
  );
};
