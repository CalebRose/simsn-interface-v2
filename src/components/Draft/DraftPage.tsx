import { FC, useEffect, useMemo } from "react";
import { League, SimPHL, SimNFL, SimNBA, SimMLB } from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { PageContainer } from "../../_design/Container";
import { PHLDraftPage } from "./PHLDraft/PHLDraftPage";
import { NFLDraftPage } from "./NFLDraft/NFLDraftPage";
import { BaseballDraftPage } from "./BaseballDraft/BaseballDraftPage";

interface DraftPageProps {
  league: League;
}

export const DraftPage: FC<DraftPageProps> = ({ league }) => {
  const leagueStore = useLeagueStore();
  const { selectedLeague, setSelectedLeague } = leagueStore;
  const { nflTeam } = useSimFBAStore();
  const { phlTeam } = useSimHCKStore();
  const { nbaTeam } = useSimBBAStore();
  const { mlbOrganization } = useSimBaseballStore();

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
    if (selectedLeague === SimMLB && mlbOrganization) {
      return false;
    }
    return true;
  }, [nflTeam, phlTeam, nbaTeam, mlbOrganization, selectedLeague]);

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
    if (selectedLeague === SimMLB && mlbOrganization) {
      return `${mlbOrganization.org_abbrev} Draft Room`;
    }
    return "Draft Room";
  }, [nflTeam, phlTeam, nbaTeam, mlbOrganization, selectedLeague]);

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title={title}>
        {selectedLeague === SimNFL && nflTeam && (
          <NFLDraftPage league={league} />
        )}
        {selectedLeague === SimPHL && phlTeam && (
          <PHLDraftPage league={SimPHL} />
        )}
        {/* {selectedLeague === SimNBA && nbaTeam && <NBADraftPage />} */}
        {selectedLeague === SimMLB && mlbOrganization && (
          <BaseballDraftPage league={SimMLB} />
        )}
      </PageContainer>
    </>
  );
};
