import { FC, useEffect, useMemo } from "react";
import { League, SimPHL, SimNFL, SimNBA } from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { PageContainer } from "../../_design/Container";
import { PHLDraftPage } from "./PHLDraft/PHLDraftPage";

interface DraftPageProps {
  league: League;
}

export const DraftPage: FC<DraftPageProps> = ({ league }) => {
  const leagueStore = useLeagueStore();
  const { selectedLeague, setSelectedLeague } = leagueStore;
  const { nflTeam } = useSimFBAStore();
  const { phlTeam } = useSimHCKStore();
  const { nbaTeam } = useSimBBAStore();

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isLoading = useMemo(() => {
    if (selectedLeague === SimPHL && phlTeam) {
      return false;
    }
    if (selectedLeague === SimNFL && nflTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    return true;
  }, [nflTeam, phlTeam, nbaTeam, selectedLeague]);

  const title = useMemo(() => {
    if (selectedLeague === SimNFL && nflTeam) {
      return `${nflTeam.TeamName} Draft Room`;
    }
    if (selectedLeague === SimPHL && phlTeam) {
      return `${phlTeam.TeamName} Draft Room`;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return `${nbaTeam.Team} Draft Room`;
    }
    return "Draft Room";
  }, [nflTeam, phlTeam, nbaTeam, selectedLeague]);

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title={title}>
        {/* {selectedLeague === SimNFL && nflTeam && <NFLDraftPage league={league} team={nflTeam} />} */}
        {selectedLeague === SimPHL && phlTeam && (
          <PHLDraftPage league={SimPHL} />
        )}
        {/* {selectedLeague === SimNBA && nbaTeam && <NBADraftPage />} */}
      </PageContainer>
    </>
  );
};
