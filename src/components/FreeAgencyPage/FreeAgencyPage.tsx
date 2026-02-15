import { FC, useEffect, useMemo } from "react";
import { League, SimNBA, SimNFL, SimPHL } from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { PageContainer } from "../../_design/Container";
import { PHLFreeAgency } from "./PHLFreeAgency/PHLFreeAgency";
import { NFLFreeAgency } from "./NFLFreeAgency/NFLFreeAgency";
import { NBAFreeAgency } from "./NBAFreeAgency/NBAFreeAgency";

interface FreeAgencyPageProps {
  league: League;
}

export const FreeAgencyPage: FC<FreeAgencyPageProps> = ({ league }) => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const { phlTeam } = useSimHCKStore();
  const { nflTeam, isLoading } = useSimFBAStore();
  const { nbaTeam } = useSimBBAStore();

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isFreeAgencyLoading = useMemo(() => {
    if (selectedLeague === SimPHL && phlTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    if (selectedLeague === SimNFL && nflTeam && !isLoading) {
      return false;
    }
    return true;
  }, [phlTeam, nflTeam, isLoading, selectedLeague]);

  return (
    <>
      <PageContainer
        direction="col"
        isLoading={isFreeAgencyLoading}
        title="Free Agency"
      >
        {selectedLeague === SimPHL && phlTeam && (
          <>
            <PHLFreeAgency />
          </>
        )}
        {selectedLeague === SimNBA && nbaTeam && (
          <>
            <NBAFreeAgency />
          </>
        )}
        {selectedLeague === SimNFL && nflTeam && (
          <>
            <NFLFreeAgency />
          </>
        )}
      </PageContainer>
    </>
  );
};
