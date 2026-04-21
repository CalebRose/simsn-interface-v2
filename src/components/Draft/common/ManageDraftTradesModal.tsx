import { FC, useMemo } from "react";
import { Modal } from "../../../_design/Modal";
import { Text } from "../../../_design/Typography";
import { Button } from "../../../_design/Buttons";
import { Border } from "../../../_design/Borders";
import { Logo } from "../../../_design/Logo";
import { League, SimNFL, SimPHL } from "../../../_constants/constants";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { AnyTradeProposal } from "../hooks/useDraftTradeState";
import { NFLTeam } from "../../../models/footballModels";
import { ProfessionalTeam } from "../../../models/hockeyModels";
import { getLogo } from "../../../_utility/getLogo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ManageDraftTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  userTeam: NFLTeam | ProfessionalTeam | null;
  sentRequests: AnyTradeProposal[];
  receivedRequests: AnyTradeProposal[];
  backgroundColor?: string;
  borderColor?: string;
  cancelTrade: (dto: AnyTradeProposal) => Promise<void>;
  acceptTrade: (dto: AnyTradeProposal) => Promise<void>;
  rejectTrade: (dto: AnyTradeProposal) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

export const ManageDraftTradesModal: FC<ManageDraftTradesModalProps> = ({
  isOpen,
  onClose,
  league,
  userTeam,
  sentRequests,
  receivedRequests,
  cancelTrade,
  acceptTrade,
  rejectTrade,
}) => {
  const { proTeamMap } = useSimFBAStore();
  const { phlTeamMap } = useSimHCKStore();

  const teamName = useMemo(() => {
    if (!userTeam) return "Your Team";
    return userTeam.TeamName;
  }, [userTeam]);

  const title = `${teamName} Draft Trade Manager`;

  const getOtherTeam = (teamID: number): NFLTeam | ProfessionalTeam | null => {
    if (league === SimNFL && proTeamMap) {
      return (proTeamMap[teamID] as NFLTeam) ?? null;
    }
    if (league === SimPHL && phlTeamMap) {
      return (phlTeamMap[teamID] as ProfessionalTeam) ?? null;
    }
    return null;
  };

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[85vw]"
      actions={<></>}
    >
      <div className="grid grid-cols-2 gap-x-6">
        {/* Sent trades */}
        <div className="flex flex-col gap-y-2">
          <Text as="h4" classes="mb-1">
            Sent
          </Text>
          {sentRequests.length === 0 && (
            <Border classes="mt-2 p-4">
              <Text as="h4">No pending sent trades</Text>
            </Border>
          )}
          {sentRequests.map((trade, idx) => {
            const proposal = trade as any;
            const recipientTeamID =
              proposal.RecepientTeamID ?? proposal.NFLRecepientTeamID ?? 0;
            const otherTeam = getOtherTeam(recipientTeamID);
            return (
              <DraftTradeSection
                key={proposal.ID ?? idx}
                trade={trade}
                otherTeam={otherTeam}
                league={league}
                isSentTrade
                cancelTrade={cancelTrade}
                acceptTrade={acceptTrade}
                rejectTrade={rejectTrade}
              />
            );
          })}
        </div>

        {/* Received trades */}
        <div className="flex flex-col gap-y-2">
          <Text as="h4" classes="mb-1">
            Received
          </Text>
          {receivedRequests.length === 0 && (
            <Border classes="mt-2 p-4">
              <Text as="h4">No pending received trades</Text>
            </Border>
          )}
          {receivedRequests.map((trade, idx) => {
            const proposal = trade as any;
            const senderTeamID = proposal.TeamID ?? proposal.NFLTeamID ?? 0;
            const otherTeam = getOtherTeam(senderTeamID);
            return (
              <DraftTradeSection
                key={proposal.ID ?? idx}
                trade={trade}
                otherTeam={otherTeam}
                league={league}
                isSentTrade={false}
                cancelTrade={cancelTrade}
                acceptTrade={acceptTrade}
                rejectTrade={rejectTrade}
              />
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Trade section card
// ---------------------------------------------------------------------------

interface DraftTradeSectionProps {
  trade: AnyTradeProposal;
  otherTeam: NFLTeam | ProfessionalTeam | null;
  league: League;
  isSentTrade: boolean;
  cancelTrade: (dto: AnyTradeProposal) => Promise<void>;
  acceptTrade: (dto: AnyTradeProposal) => Promise<void>;
  rejectTrade: (dto: AnyTradeProposal) => Promise<void>;
}

const DraftTradeSection: FC<DraftTradeSectionProps> = ({
  trade,
  otherTeam,
  league,
  isSentTrade,
  cancelTrade,
  acceptTrade,
  rejectTrade,
}) => {
  const proposal = trade as any;

  const teamLabel = useMemo(() => {
    if (!otherTeam) return "Unknown Team";
    if (league === SimPHL) return (otherTeam as ProfessionalTeam).Abbreviation;
    if (league === SimNFL) return (otherTeam as NFLTeam).TeamAbbr;
    return otherTeam.TeamName;
  }, [otherTeam, league]);

  const otherLogo = otherTeam ? getLogo(league, otherTeam.ID, false) : "";

  // Options sent by the user team and options sent by the other team
  const userSendingOptions: any[] =
    proposal.TeamTradeOptions ?? proposal.NFLTeamTradeOptions ?? [];
  const otherSendingOptions: any[] = proposal.RecepientTeamTradeOptions ?? [];

  const youSendLabel = isSentTrade ? "You Send" : `${teamLabel} Sends`;
  const theySendLabel = isSentTrade ? `${teamLabel} Sends` : "You Send";

  return (
    <Border direction="row" classes="p-4">
      <div className="grid grid-cols-4 w-full gap-x-2">
        {/* Other team logo */}
        <div className="flex flex-col items-start justify-center">
          <Logo url={otherLogo} label={teamLabel} textClass="text-center" />
        </div>

        {/* User-team's outgoing assets */}
        <div className="flex flex-col gap-y-1">
          <Text variant="small">{youSendLabel}</Text>
          {userSendingOptions.length === 0 && (
            <Text variant="xs" classes="text-gray-400">
              Nothing
            </Text>
          )}
          {userSendingOptions.map((opt: any, i: number) => (
            <DraftTradeOptionDisplay key={i} option={opt} />
          ))}
        </div>

        {/* Other team's outgoing assets */}
        <div className="flex flex-col gap-y-1">
          <Text variant="small">{theySendLabel}</Text>
          {otherSendingOptions.length === 0 && (
            <Text variant="xs" classes="text-gray-400">
              Nothing
            </Text>
          )}
          {otherSendingOptions.map((opt: any, i: number) => (
            <DraftTradeOptionDisplay key={i} option={opt} />
          ))}
        </div>

        {/* Action buttons */}
        {isSentTrade ? (
          <div className="flex flex-col items-end gap-y-2">
            <Button
              size="sm"
              classes="w-[5rem]"
              onClick={() => cancelTrade(trade)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-y-2">
            <Button
              size="sm"
              classes="w-[5rem]"
              onClick={() => acceptTrade(trade)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              classes="w-[5rem]"
              onClick={() => rejectTrade(trade)}
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </Border>
  );
};

// ---------------------------------------------------------------------------
// Trade option label
// ---------------------------------------------------------------------------

interface DraftTradeOptionDisplayProps {
  option: any;
}

const DraftTradeOptionDisplay: FC<DraftTradeOptionDisplayProps> = ({
  option,
}) => {
  const isPlayer = option.OptionType === "Player";

  const label = useMemo(() => {
    if (isPlayer && option.Player) {
      const p = option.Player;
      return `${p.Position} ${p.Archetype} ${p.FirstName} ${p.LastName} (Age ${p.Age})`;
    }
    if (!isPlayer && option.Draftpick) {
      const pk = option.Draftpick;
      return `${pk.Season} R${pk.DraftRound}, P${pk.DraftNumber}`;
    }
    // Fallback when embedded objects aren't present
    if (isPlayer)
      return `Player ID ${option.PlayerID ?? option.NFLPlayerID ?? "?"}`;
    return `Pick ID ${option.DraftPickID ?? option.NFLDraftPickID ?? "?"}`;
  }, [isPlayer, option]);

  return (
    <div className="flex flex-col">
      <Text variant="xs" classes="text-start">
        {label}
      </Text>
    </div>
  );
};
