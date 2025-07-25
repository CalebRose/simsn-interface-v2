import { FC } from "react";
import {
  AddRecruitType,
  Affiliate,
  CancelOffer,
  Cut,
  InfoType,
  League,
  ModalAction,
  PracticeSquad,
  Promise,
  RecruitInfoType,
  Redshirt,
  RemoveRecruitType,
  ScholarshipOffered,
  ScholarshipRevoked,
  ScoutAttributeType,
  SimPHL,
  ToggleScholarshipType,
  TradeBlock,
} from "../../_constants/constants";
import { Modal } from "../../_design/Modal";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { PlayerInfoModalBody, RecruitInfoModalBody } from "./Modals";
import { useSnackbar } from "notistack";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerID?: number;
  teamID?: number;
  playerLabel?: string;
  league: League;
  modalAction: ModalAction;
  player: any;
  attribute?: string;
  capsheet?: any;
  contract?: any;
  offer?: any;
  cutPlayer?: (playerID: number, teamID: number) => Promise<void>;
  sendToPracticeSquad?: (playerID: number, teamID: number) => Promise<void>;
  affiliatePlayer?: (playerID: number, teamID: number) => Promise<void>;
  redshirtPlayer?: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer?: (playerID: number, teamID: number) => Promise<void>;
  tradeBlockPlayer?: (playerID: number, teamID: number) => Promise<void>;
  addPlayerToBoard?: (dto: any) => Promise<void>;
  removePlayerFromBoard?: (dto: any) => Promise<void>;
  toggleScholarship?: (dto: any) => Promise<void>;
  scoutAttribute?: (dto: any) => Promise<void>;
  cancelFAOffer?: (dto: any) => Promise<void>;
}

export const ActionModal: FC<ActionModalProps> = ({
  isOpen,
  onClose,
  playerID,
  teamID,
  playerLabel,
  league,
  modalAction,
  player,
  contract,
  capsheet,
  offer,
  redshirtPlayer,
  cutPlayer,
  promisePlayer,
  addPlayerToBoard,
  removePlayerFromBoard,
  toggleScholarship,
  scoutAttribute,
  cancelFAOffer,
  affiliatePlayer,
  tradeBlockPlayer,
  sendToPracticeSquad,
  attribute = "",
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const action = async () => {
    switch (modalAction) {
      case Cut:
        if (cutPlayer) {
          await cutPlayer(playerID!, teamID!);
        }
        break;
      case Affiliate:
        if (affiliatePlayer) {
          await affiliatePlayer(playerID!, teamID!);
        }
        break;
      case Redshirt:
        if (redshirtPlayer) {
          await redshirtPlayer(playerID!, teamID!);
          enqueueSnackbar(
            `Placed redshirt on ${player.Position} ${player.FirstName} ${player.LastName}!`,
            {
              variant: "success",
              autoHideDuration: 3000,
            }
          );
        }
        break;
      case Promise:
        if (promisePlayer) {
          await promisePlayer(playerID!, teamID!);
        }
        break;
      case TradeBlock:
        if (tradeBlockPlayer) {
          await tradeBlockPlayer(playerID!, teamID!);
        }
        break;
      case PracticeSquad:
        if (sendToPracticeSquad) {
          await sendToPracticeSquad(playerID!, teamID!);
        }
        break;
      case AddRecruitType:
        if (addPlayerToBoard) {
          const dto = {
            PlayerID: player.ID,
            RecruitID: player.ID,
            ProfileID: teamID,
            PlayerRecruit: player,
          };
          await addPlayerToBoard(dto);
          enqueueSnackbar(
            `${player.Position} ${player.FirstName} ${player.LastName} has been added to recruiting board!`,
            {
              variant: "success",
              autoHideDuration: 3000,
            }
          );
        }
        break;
      case RemoveRecruitType:
        if (removePlayerFromBoard) {
          const dto = {
            RecruitID: player.ID,
            ProfileID: teamID,
          };
          await removePlayerFromBoard(dto);
          enqueueSnackbar(
            `${player.Position} ${player.FirstName} ${player.LastName} has been removed from board!`,
            {
              variant: "success",
              autoHideDuration: 3000,
            }
          );
        }
        break;
      case ToggleScholarshipType:
        if (toggleScholarship) {
          const dto = {
            RecruitID: player.ID,
            ProfileID: teamID,
          };
          await toggleScholarship(dto);
          enqueueSnackbar(
            `Scholarship ${
              attribute === ScholarshipOffered ? "offered" : "revoked"
            } on ${player.Position} ${player.FirstName} ${player.LastName}!`,
            {
              variant: "success",
              autoHideDuration: 3000,
            }
          );
        }
        break;
      case ScoutAttributeType:
        if (scoutAttribute) {
          const dto = {
            RecruitID: player.ID,
            ProfileID: teamID,
            Attribute: attribute,
          };
          await scoutAttribute(dto);
          enqueueSnackbar(
            `Scouted ${attribute} Attribute for ${playerLabel}!`,
            {
              variant: "success",
              autoHideDuration: 3000,
            }
          );
        }
        break;
      case InfoType:
        break;
      case CancelOffer:
        if (cancelFAOffer) {
          const dto = {
            ...offer,
          };
          await cancelFAOffer(dto);
        }
        break;
    }
    onClose();
  };
  let title = "";
  switch (modalAction) {
    case Affiliate:
      title = `Send ${playerLabel} to Affiliate Team?`;
      break;
    case Cut:
      title = `Cut ${playerLabel}?`;
      break;
    case Redshirt:
      title = `Redshirt ${playerLabel}?`;
      break;
    case Promise:
      title = `Promise ${playerLabel}?`;
      break;
    case TradeBlock:
      title = `Change Trade Status for ${playerLabel}?`;
      break;
    case InfoType:
    case RecruitInfoType:
      title = `${playerID} ${playerLabel}`;
      break;
    case AddRecruitType:
      title = `Add Recruit ${playerLabel} to Board?`;
      break;
    case ToggleScholarshipType:
      title =
        attribute === ScholarshipOffered
          ? `Offer Scholarship on Recruit?`
          : `Revoke Scholarship on Recruit?`;
      break;
    case RemoveRecruitType:
      title = `Remove ${playerLabel} from Board?`;
      break;
    case ScoutAttributeType:
      title = `Scout ${attribute} Attribute?`;
      break;
    case CancelOffer:
      title = `Cancel FA Offer for ${playerLabel}?`;
      break;
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        actions={
          <>
            <ButtonGroup>
              {modalAction !== InfoType && modalAction !== RecruitInfoType && (
                <>
                  <Button size="sm" variant="danger" onClick={onClose}>
                    <Text variant="small">Cancel</Text>
                  </Button>
                  <Button size="sm" onClick={action}>
                    <Text variant="small">Confirm</Text>
                  </Button>
                </>
              )}
              {(modalAction === InfoType ||
                modalAction === RecruitInfoType) && (
                <Button size="sm" variant="primary" onClick={onClose}>
                  <Text variant="small">Close</Text>
                </Button>
              )}
            </ButtonGroup>
          </>
        }
      >
        {modalAction === Redshirt && (
          <>
            <Text className="mb-4 text-start">
              WARNING: By confirming this action,{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>{" "}
              will not be able to participate for the remaining length of the{" "}
              {league} season. They will watch from the bench as their team
              players, possibly succeeding or failing, and wondering if them
              playing could have made a significant impact on their season.
              Sure, they will develop a bit more, but you're delaying what each
              player really wants - playing time.
            </Text>
            <Text className="mb-4 text-start">
              Are you sure you want to redshirt to this player?
            </Text>
          </>
        )}
        {modalAction === Affiliate && (
          <>
            <Text className="mb4 text-start">
              WARNING! Once you've confirmed,{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>{" "}
              will be sent to your PHL Team's Affiliate Team. Other teams may
              attempt to pick up this player. If an offer is placed, you will
              have approximately 3 FA Syncs to make a decision to pick the
              player back up onto your roster. Once the player is claimed by
              another team or claimed by you, they cannot be placed back onto
              the Affiliate Team.
            </Text>
            <Text className="mb4 text-start">
              Are you sure you want to confirm this action?
            </Text>
          </>
        )}
        {modalAction === PracticeSquad && (
          <>
            <Text className="mb4 text-start">
              WARNING! Once you've confirmed,{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>{" "}
              will be sent to your NFL Team's Practice Squad. Other teams may
              attempt to pick up this player. If an offer is placed, you will
              have approximately 3 FA Syncs to make a decision to pick the
              player back up onto your roster. Once the player is claimed by
              another team or claimed by you, they cannot be placed back onto
              the NFL Team.
            </Text>
            <Text className="mb4 text-start">
              Are you sure you want to confirm this action?
            </Text>
          </>
        )}
        {modalAction === Cut && (
          <>
            <Text className="mb4 text-start">
              WARNING! Once you've confirmed,{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>{" "}
              will be cut from your team's roster.
            </Text>
            <Text className="mb4 text-start">
              Are you sure you want to cut this player?
            </Text>
          </>
        )}
        {modalAction === TradeBlock && (
          <>
            <Text className="mb4 text-start">
              WARNING! Once you've confirmed,{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>{" "}
              will be {player.IsOnTradeBlock ? "placed on" : "taken off"} your
              team's roster.
            </Text>
            <Text className="mb4 text-start">
              Are you sure you want to change the trade block status of this
              player?
            </Text>
          </>
        )}
        {modalAction === Promise && (
          <Text className="mb4 text-start">
            Are you sure you want to send a promise to this player?
          </Text>
        )}
        {modalAction === AddRecruitType && (
          <Text className="mb4 text-start">
            Are you sure you want to add{" "}
            <strong>
              {playerID} {playerLabel}
            </strong>{" "}
            to your recruiting board?
          </Text>
        )}
        {modalAction === RemoveRecruitType && (
          <Text className="mb4 text-start">
            Are you sure you want to remove{" "}
            <strong>
              {playerID} {playerLabel}
            </strong>{" "}
            from your recruiting board?
          </Text>
        )}
        {modalAction === ToggleScholarshipType && (
          <>
            <Text classes="mb-2">
              Warning! You are about to switch the toggle status on{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>
              .
            </Text>
            {attribute === ScholarshipOffered && (
              <Text classes="mb-2">
                By clicking "Confirm", you will be offering{" "}
                <strong>{playerLabel}</strong> a scholarship. This will show
                your intent to the recruit that you would like them to sign with
                your team. All points placed on <strong>{playerLabel}</strong>{" "}
                will be considered in the recruiting sync.
              </Text>
            )}
            {attribute === ScholarshipRevoked && (
              <Text>
                By clicking "Confirm", you will be revoking the scholarship
                offer on <strong>{playerLabel}</strong>. All points placed on{" "}
                <strong>{playerLabel}</strong> will no longer be considered in
                the recruiting sync, and they will seek other schools elsewhere.
                You will <strong>NOT</strong> be able to offer them a
                scholarship after confirming this action.
              </Text>
            )}
            <Text>Are you sure you want to do this?</Text>
          </>
        )}
        {modalAction === ScoutAttributeType && (
          <>
            <Text className="mb4 text-start">
              Are you sure you want to scout the {attribute} Attribute for{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>
              ?
            </Text>
          </>
        )}
        {modalAction === CancelOffer && (
          <>
            <Text className="mb4 text-start mb-1">
              Are you sure you want to cancel the following Free Agency Offer
              for{" "}
              <strong>
                {playerID} {playerLabel}
              </strong>
              ?
            </Text>
            {offer && league === SimPHL && (
              <>
                <div className="grid grid-cols-7">
                  <Text variant="body-small">Length</Text>
                  <Text variant="body-small">Y1</Text>
                  <Text variant="body-small">Y2</Text>
                  <Text variant="body-small">Y3</Text>
                  <Text variant="body-small">Y4</Text>
                  <Text variant="body-small">Y5</Text>
                  <Text variant="body-small">CV</Text>
                </div>
                <div className="grid grid-cols-7">
                  <Text variant="body-small">{offer.ContractLength}</Text>
                  <Text variant="body-small">{offer.Y1BaseSalary}</Text>
                  <Text variant="body-small">{offer.Y2BaseSalary}</Text>
                  <Text variant="body-small">{offer.Y3BaseSalary}</Text>
                  <Text variant="body-small">{offer.Y4BaseSalary}</Text>
                  <Text variant="body-small">{offer.Y5BaseSalary}</Text>
                  <Text variant="body-small">{offer.ContractValue}</Text>
                </div>
              </>
            )}
          </>
        )}
        {modalAction === InfoType && (
          <PlayerInfoModalBody
            league={league}
            player={player}
            contract={contract}
          />
        )}
        {modalAction === RecruitInfoType && (
          <RecruitInfoModalBody league={league} player={player} />
        )}
      </Modal>
    </>
  );
};
