import { FC, useEffect, useMemo } from "react";
import { League, SimCBB, SimCFB, SimCHL } from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { PageContainer } from "../../_design/Container";
import { HCKTransferPortal } from "./HCKPortal/HCKTransferPortal";

interface TransferPortalPageProps {
  league: League;
}

export const TransferPortalPage: FC<TransferPortalPageProps> = ({ league }) => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const { chlTeam, portalPlayers: HCKPortalPlayers } = useSimHCKStore();
  const { cfbTeam, portalPlayers: CFBPortalPlayers } = useSimFBAStore();
  const { cbbTeam } = useSimBBAStore();

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isLoading = useMemo(() => {
    if (selectedLeague === SimCHL && chlTeam && HCKPortalPlayers) {
      return false;
    }
    if (selectedLeague === SimCBB && cbbTeam) {
      return false;
    }
    if (selectedLeague === SimCFB && cfbTeam && CFBPortalPlayers) {
      return false;
    }
    return true;
  }, [chlTeam, cfbTeam, HCKPortalPlayers, CFBPortalPlayers, selectedLeague]);

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Recruiting">
        {selectedLeague === SimCHL && chlTeam && <HCKTransferPortal />}
        {selectedLeague === SimCBB && cbbTeam && <>Not yet ready okay?</>}
        {selectedLeague === SimCFB && cfbTeam && (
          <>This will be added once Guam joins the FCS.</>
        )}
      </PageContainer>
    </>
  );
};
