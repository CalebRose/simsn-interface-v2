import { useMemo } from "react";
import { League, SimPHL } from "../../_constants/constants";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { getLogo } from "../../_utility/getLogo";
import { useAdminPage } from "../../context/AdminPageContext";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { ProfessionalTeam, TradeProposal } from "../../models/hockeyModels";
import { AdminTradeCard } from "./AdminCards";
import {
  mapTradeOptions,
  mapHCKTradeProposals,
} from "../Team/Helpers/tradeModalHelper";

export const AdminTradesTab = () => {
  const { selectedLeague } = useLeagueStore();
  const { hckTradeProposals } = useAdminPage();
  const hkStore = useSimHCKStore();
  const { phlTeamMap } = hkStore;
  const hkLoading = hkStore.isLoading;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full p-4`}
    >
      {selectedLeague === SimPHL &&
        !hkLoading &&
        hckTradeProposals.map((trade) => (
          <PHLTradeCard
            trade={trade}
            sendingTeam={phlTeamMap[trade.TeamID]}
            key={trade.ID}
            receivingTeam={phlTeamMap[trade.RecepientTeamID]}
            oneItem={hckTradeProposals.length === 1}
          />
        ))}
    </div>
  );
};

interface PHLTradeCardProps {
  trade: TradeProposal;
  sendingTeam: ProfessionalTeam;
  receivingTeam: ProfessionalTeam;
  oneItem: boolean;
}

export const PHLTradeCard: React.FC<PHLTradeCardProps> = ({
  trade,
  sendingTeam,
  receivingTeam,
  oneItem,
}) => {
  const { proPlayerMap, individualDraftPickMap, syncAcceptedTrade, vetoTrade } =
    useSimHCKStore();
  const { refreshHCKTradeProposals } = useAdminPage();
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const sendingTeamLogo = getLogo(
    SimPHL as League,
    sendingTeam.ID,
    currentUser?.isRetro
  );
  const receivingTeamLogo = getLogo(
    SimPHL as League,
    receivingTeam.ID,
    currentUser?.isRetro
  );
  const teamColors = useTeamColors(
    sendingTeam.ColorOne,
    sendingTeam.ColorTwo,
    sendingTeam.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const accept = async () => {
    await syncAcceptedTrade(trade);
    refreshHCKTradeProposals(trade.ID);
  };
  const reject = async () => {
    await vetoTrade(trade);
    refreshHCKTradeProposals(trade.ID);
  };

  const sentTradeOptions = useMemo(() => {
    return mapTradeOptions(trade.TeamTradeOptions, trade.TeamID);
  }, [trade]);

  const recepientTradeOptions = useMemo(() => {
    return mapTradeOptions(trade.TeamTradeOptions, trade.RecepientTeamID);
  }, [trade]);

  return (
    <AdminTradeCard
      sendingTradeOptions={sentTradeOptions}
      receivingTradeOptions={recepientTradeOptions}
      sendingTeamLabel={`${sendingTeam.TeamName} ${sendingTeam.Mascot}`}
      receivingTeamLabel={`${receivingTeam.TeamName} ${receivingTeam.Mascot}`}
      sendingTeamLogo={sendingTeamLogo}
      receivingTeamLogo={receivingTeamLogo}
      accept={accept}
      veto={reject}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      proPlayerMap={proPlayerMap}
      draftPickMap={individualDraftPickMap}
    />
  );
};
