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

export interface ProcessAcceptedTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  approvedRequests: AnyTradeProposal[];
  processTrade: (trade: AnyTradeProposal) => Promise<void>;
  vetoTrade: (trade: AnyTradeProposal) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

export const ProcessAcceptedTradesModal: FC<
  ProcessAcceptedTradesModalProps
> = ({
  isOpen,
  onClose,
  league,
  approvedRequests,
  processTrade,
  vetoTrade,
}) => {
  const { proTeamMap } = useSimFBAStore();
  const { phlTeamMap } = useSimHCKStore();

  const getTeam = (teamID: number): NFLTeam | ProfessionalTeam | null => {
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
      title="Process Accepted Draft Trades"
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[75vw]"
      actions={<></>}
    >
      {approvedRequests.length === 0 && (
        <Border classes="p-6">
          <Text as="h4">No accepted trades are pending processing.</Text>
        </Border>
      )}
      <div className="flex flex-col gap-y-4">
        {approvedRequests.map((trade, idx) => {
          const proposal = trade as any;
          // Normalize field names — Firestore proposals may use TeamID (plain object)
          // or NFLTeamID (class instance)
          const senderTeamID = proposal.NFLTeamID ?? proposal.TeamID ?? 0;
          const recipientTeamID = proposal.RecepientTeamID ?? 0;
          const senderTeam = getTeam(senderTeamID);
          const recipientTeam = getTeam(recipientTeamID);

          return (
            <AcceptedTradeCard
              key={proposal.ID ?? idx}
              trade={trade}
              senderTeam={senderTeam}
              recipientTeam={recipientTeam}
              league={league}
              processTrade={processTrade}
              vetoTrade={vetoTrade}
            />
          );
        })}
      </div>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Individual trade card
// ---------------------------------------------------------------------------

interface AcceptedTradeCardProps {
  trade: AnyTradeProposal;
  senderTeam: NFLTeam | ProfessionalTeam | null;
  recipientTeam: NFLTeam | ProfessionalTeam | null;
  league: League;
  processTrade: (trade: AnyTradeProposal) => Promise<void>;
  vetoTrade: (trade: AnyTradeProposal) => Promise<void>;
}

const AcceptedTradeCard: FC<AcceptedTradeCardProps> = ({
  trade,
  senderTeam,
  recipientTeam,
  league,
  processTrade,
  vetoTrade,
}) => {
  const proposal = trade as any;

  const senderLabel = useMemo(() => {
    if (!senderTeam) return "Unknown";
    if (league === SimPHL) return (senderTeam as ProfessionalTeam).Abbreviation;
    if (league === SimNFL) return (senderTeam as NFLTeam).TeamAbbr;
    return senderTeam.TeamName;
  }, [senderTeam, league]);

  const recipientLabel = useMemo(() => {
    if (!recipientTeam) return "Unknown";
    if (league === SimPHL)
      return (recipientTeam as ProfessionalTeam).Abbreviation;
    if (league === SimNFL) return (recipientTeam as NFLTeam).TeamAbbr;
    return recipientTeam.TeamName;
  }, [recipientTeam, league]);

  const senderLogo = senderTeam ? getLogo(league, senderTeam.ID, false) : "";
  const recipientLogo = recipientTeam
    ? getLogo(league, recipientTeam.ID, false)
    : "";

  // Options sent by the sender team and by the recipient team
  const senderOptions: any[] =
    proposal.NFLTeamTradeOptions ?? proposal.TeamTradeOptions ?? [];
  const recipientOptions: any[] = proposal.RecepientTeamTradeOptions ?? [];

  return (
    <Border direction="row" classes="p-4">
      <div className="flex flex-row items-center gap-x-4 w-full">
        {/* Sender logo */}
        <Logo url={senderLogo} label={senderLabel} textClass="text-center" />

        {/* Sender's assets */}
        <div className="flex flex-col gap-y-1 flex-1 justify-center text-center items-center">
          <Text variant="small" classes="font-semibold">
            {senderLabel} Sends
          </Text>
          {senderOptions.length === 0 && (
            <Text variant="xs" classes="text-gray-400">
              Nothing
            </Text>
          )}
          {senderOptions.map((opt: any, i: number) => (
            <TradeOptionLabel key={i} option={opt} />
          ))}
        </div>

        {/* VS divider */}
        <Text
          variant="small"
          classes="text-gray-400 font-semibold flex-shrink-0"
        >
          vs
        </Text>

        {/* Recipient's assets */}
        <div className="flex flex-col gap-y-1 flex-1 justify-center text-center items-center">
          <Text variant="small" classes="font-semibold">
            {recipientLabel} Sends
          </Text>
          {recipientOptions.length === 0 && (
            <Text variant="xs" classes="text-gray-400">
              Nothing
            </Text>
          )}
          {recipientOptions.map((opt: any, i: number) => (
            <TradeOptionLabel key={i} option={opt} />
          ))}
        </div>

        {/* Recipient logo */}
        <Logo
          url={recipientLogo}
          label={recipientLabel}
          textClass="text-center"
        />

        {/* Actions */}
        <div className="flex flex-row gap-x-2 items-center flex-shrink-0 ml-2">
          <Button
            size="sm"
            variant="success"
            classes="w-[6rem]"
            onClick={() => processTrade(trade)}
          >
            Process
          </Button>
          <Button
            size="sm"
            variant="danger"
            classes="w-[6rem]"
            onClick={() => vetoTrade(trade)}
          >
            Veto
          </Button>
        </div>
      </div>
    </Border>
  );
};

// ---------------------------------------------------------------------------
// Single trade option label
// ---------------------------------------------------------------------------

interface TradeOptionLabelProps {
  option: any;
}

const TradeOptionLabel: FC<TradeOptionLabelProps> = ({ option }) => {
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
    // Fallback when embedded objects are absent
    if (isPlayer) {
      return `Player ID ${option.NFLPlayerID ?? option.PlayerID ?? "?"}`;
    }
    return `Pick ID ${option.NFLDraftPickID ?? option.DraftPickID ?? "?"}`;
  }, [isPlayer, option]);

  return (
    <Text variant="xs" classes="text-start">
      {label}
    </Text>
  );
};
