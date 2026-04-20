import { FC } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { Tab, TabGroup } from "../../../../_design/Tabs";
import { SimCollegeBaseball } from "../../../../_constants/constants";
import type { ScoutingBudget } from "../../../../models/baseball/baseballScoutingModels";
import type { FAPlayerDetailResponse } from "../../../../models/baseball/baseballFreeAgencyModels";
import type { IFAAuctionDetail } from "../../../../models/baseball/baseballIFAModels";

import { HSScoutingContent } from "../BaseballScouting/HSScoutingContent";
import { usePlayerModalData, type PlayerModalContext } from "./usePlayerModalData";
import { PlayerModalHeader } from "./PlayerModalHeader";
import { ScoutingActions } from "./sections/ScoutingActions";
import { FreeAgencyInfo } from "./sections/FreeAgencyInfo";
import { AttributesTab } from "./tabs/AttributesTab";
import { PotentialsTab } from "./tabs/PotentialsTab";
import { ContractTab } from "./tabs/ContractTab";
import { InjuriesTab } from "./tabs/InjuriesTab";
import { StatisticsTab } from "./tabs/StatisticsTab";
import { AuctionTab } from "./tabs/AuctionTab";
import "../baseballMobile.css";

export interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: number;
  orgId: number;
  leagueYearId: number;
  league: string;
  context: PlayerModalContext;
  // Scouting-specific
  scoutingBudget?: ScoutingBudget | null;
  onBudgetChanged?: () => void;
  // FA-specific
  faDetail?: FAPlayerDetailResponse | null;
  onMakeOffer?: (detail: FAPlayerDetailResponse) => void;
  onScouted?: (detail: FAPlayerDetailResponse) => void;
  gameWeekId?: number;
  availableBudget?: number | null;
  // IFA-specific
  auctionId?: number;
  ifaStatus?: "active" | "pending" | "complete";
  onMakeOfferIFA?: (detail: IFAAuctionDetail) => void;
  onWithdraw?: (auctionId: number) => void;
}

export const PlayerModal: FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  playerId,
  orgId,
  leagueYearId,
  league,
  context,
  scoutingBudget,
  onBudgetChanged,
  faDetail: faDetailProp,
  onMakeOffer,
  onScouted,
  auctionId,
  ifaStatus,
  onMakeOfferIFA,
  onWithdraw,
}) => {
  const data = usePlayerModalData({
    playerId,
    orgId,
    leagueYearId,
    isOpen,
    context,
    auctionId,
    scoutingBudget: scoutingBudget ?? null,
    onBudgetChanged,
    onScouted,
  });

  const {
    player,
    faDetail: faDetailFetched,
    ifaDetail,
    injuryHistory,
    isLoading,
    isUnlocking,
    injuryLoading,
    scoutingAction,
    selectedTab,
    setSelectedTab,
    handleUnlock,
    handleScoutFA,
  } = data;

  // Use prop-provided faDetail when available, fall back to fetched
  const faDetail = faDetailProp ?? faDetailFetched;

  if (!isOpen) return null;

  const isCollege = league === SimCollegeBaseball;
  const bio = player?.bio;
  const vis = player?.visibility;

  // Build title
  let title = "Loading...";
  if (context === "ifa" && ifaDetail) {
    title = ifaDetail.player_name;
  } else if (bio) {
    title = `#${bio.id} ${bio.firstname} ${bio.lastname}`;
  } else if (context === "freeAgency" && faDetail) {
    title = `${faDetail.bio.firstname} ${faDetail.bio.lastname}`;
  }

  // Build footer actions
  const buildActions = () => {
    if (context === "ifa" && ifaDetail) {
      const myOffer = ifaDetail.offers.find((o) => o.is_mine);
      const canOffer =
        ifaStatus === "active" && ifaDetail.phase !== "completed";
      const canWithdraw =
        ifaStatus === "active" &&
        ifaDetail.phase === "open" &&
        myOffer?.status === "active";
      return (
        <ButtonGroup>
          <Button size="sm" variant="primaryOutline" onClick={onClose}>
            <Text variant="small">Close</Text>
          </Button>
          {canWithdraw && onWithdraw && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onWithdraw(ifaDetail.auction_id)}
            >
              <Text variant="small">Withdraw</Text>
            </Button>
          )}
          {canOffer && onMakeOfferIFA && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onMakeOfferIFA(ifaDetail)}
            >
              <Text variant="small">
                {myOffer ? "Update Offer" : "Make Offer"}
              </Text>
            </Button>
          )}
        </ButtonGroup>
      );
    }

    return (
      <ButtonGroup>
        <Button size="sm" variant="danger" onClick={onClose}>
          <Text variant="small">Close</Text>
        </Button>
        {onMakeOffer && faDetail?.auction && (
          <Button
            size="sm"
            variant="success"
            onClick={() => onMakeOffer(faDetail)}
          >
            <Text variant="small">
              {faDetail.auction.my_offer ? "Update Offer" : "Make Offer"}
            </Text>
          </Button>
        )}
      </ButtonGroup>
    );
  };

  // Determine maxWidth based on context
  const maxWidth =
    context === "ifa"
      ? "min-[1025px]:max-w-[50vw]"
      : context === "freeAgency" && !player
        ? "max-w-[48rem]"
        : "max-w-2xl";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      actions={buildActions()}
    >
      {isLoading || (!player && !ifaDetail && !faDetail) ? (
        <div className="flex items-center justify-center py-12">
          <Text variant="body" classes="text-gray-500 dark:text-gray-400">
            Loading player data...
          </Text>
        </div>
      ) : context === "ifa" && ifaDetail ? (
        /* IFA auction content */
        <div className="space-y-4">
          <PlayerModalHeader
            player={null}
            faDetail={null}
            ifaDetail={ifaDetail}
            context="ifa"
            league={league}
            playerId={playerId}
          />
          <AuctionTab detail={ifaDetail} />
        </div>
      ) : context === "freeAgency" && faDetail && !player ? (
        /* FA-only content (standalone FA modal, no scouting data) */
        <div className="space-y-4">
          <PlayerModalHeader
            player={null}
            faDetail={faDetail}
            ifaDetail={null}
            context="freeAgency"
            league={league}
            playerId={playerId}
          />
          <FreeAgencyInfo
            faDetail={faDetail}
            scoutingAction={scoutingAction}
            onScoutFA={handleScoutFA}
          />
        </div>
      ) : player && vis?.pool === "hs" ? (
        /* HS scouting content */
        <HSScoutingContent
          player={player}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget ?? null}
          isUnlocking={isUnlocking}
          onUnlock={handleUnlock}
        />
      ) : player ? (
        /* Standard scouting/FA+scouting content */
        <div className="flex flex-col gap-3">
          <PlayerModalHeader
            player={player}
            faDetail={faDetail}
            ifaDetail={null}
            context={context}
            league={league}
            playerId={playerId}
          />

          <ScoutingActions
            visibility={vis!}
            scoutingBudget={scoutingBudget ?? null}
            isUnlocking={isUnlocking}
            onUnlock={handleUnlock}
          />

          {/* Tab Bar */}
          <TabGroup classes="mb-0">
            <Tab
              label="Attributes"
              selected={selectedTab === "Attributes"}
              setSelected={setSelectedTab}
            />
            <Tab
              label="Potentials"
              selected={selectedTab === "Potentials"}
              setSelected={setSelectedTab}
            />
            <Tab
              label="Contract"
              selected={selectedTab === "Contract"}
              setSelected={setSelectedTab}
            />
            <Tab
              label="Injuries"
              selected={selectedTab === "Injuries"}
              setSelected={setSelectedTab}
            />
            <Tab
              label="Statistics"
              selected={selectedTab === "Statistics"}
              setSelected={setSelectedTab}
            />
          </TabGroup>

          {/* Tab Content */}
          {selectedTab === "Attributes" && (
            <AttributesTab
              pool={vis?.pool}
              letterGrades={player.letter_grades}
              attributes={player.attributes}
              ptype={bio?.ptype ?? "Position"}
              bio={bio!}
              visibilityContext={player.visibility_context}
              displayFormat={player.display_format}
              unlocked={vis?.unlocked}
            />
          )}

          {selectedTab === "Potentials" && (
            <PotentialsTab
              potentials={player.potentials}
              ptype={bio?.ptype ?? "Position"}
              bio={bio!}
              visibilityContext={player.visibility_context}
              displayFormat={player.display_format}
            />
          )}

          {selectedTab === "Contract" && (
            <ContractTab
              contract={player.contract}
              isCollege={isCollege}
              faDetail={faDetail}
            />
          )}

          {selectedTab === "Injuries" && (
            <InjuriesTab
              injuryHistory={injuryHistory}
              injuryLoading={injuryLoading}
            />
          )}

          {selectedTab === "Statistics" && (
            <StatisticsTab player={player} />
          )}
        </div>
      ) : null}
    </Modal>
  );
};
