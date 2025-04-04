import { FC } from "react";
import { Cut, InfoType, League, ModalAction, Promise, RecruitInfoType, Redshirt } from "../../_constants/constants";
import { Modal } from "../../_design/Modal";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { PlayerInfoModalBody, RecruitInfoModalBody } from "./Modals";

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerID?: number;
    teamID?: number;
    capsheet?: any;
    playerLabel?: string;
    contract?: any;
    league: League;
    modalAction: ModalAction;
    player: any;
    cutPlayer?: (playerID: number, teamID: number) => Promise<void>;
    redshirtPlayer?: (playerID: number, teamID: number) => Promise<void>;
    promisePlayer?: (playerID: number, teamID: number) => Promise<void>;
    addPlayerToBoard?: () => Promise<void>;
    removePlayerFromBoard?: () => Promise<void>;
    toggleScholarship?: ()=> Promise<void>;
  }
  
  export const ActionModal: FC<ActionModalProps> = ({
    isOpen,
    onClose,
    playerID,
    teamID,
    playerLabel,
    league,
    contract,
    modalAction,
    player,
    redshirtPlayer,
    cutPlayer,
    promisePlayer,
  }) => {
    const action = async () => {
      switch (modalAction) {
        case Cut:
          if (cutPlayer) {
            await cutPlayer(playerID!, teamID!);
          }
          break;
        case Redshirt:
          if (redshirtPlayer) {
            await redshirtPlayer(playerID!, teamID!);
          }
          break;
        case Promise:
          if (promisePlayer) {
            await promisePlayer(playerID!, teamID!);
          }
          break;
        case InfoType:
          break;
      }
    };
    let title = "";
    switch (modalAction) {
      case Cut:
        title = `Cut ${playerLabel}?`;
        break;
      case Redshirt:
        title = `Redshirt ${playerLabel}?`;
        break;
      case Promise:
        title = `Promise ${playerLabel}?`;
        break;
      case InfoType:
      case RecruitInfoType:
        title = `${playerID} ${playerLabel}`;
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
                {(modalAction === InfoType || modalAction === RecruitInfoType) && (
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
                WARNING: By confirming this action, {playerLabel} will not be able
                to participate for the remaining length of the {league} season.
                They will watch from the bench as their team players, possibly
                succeeding or failing, and wondering if them playing could have
                made a significant impact on their season. Sure, they will develop
                a bit more, but you're delaying what each player really wants -
                playing time.
              </Text>
              <Text className="mb-4 text-start">
                Are you sure you want to redshirt to this player?
              </Text>
            </>
          )}
          {modalAction === Cut && (
            <>
              <Text className="mb4 text-start">
                WARNING! Once you've confirmed, {playerLabel} will be cut from
                your team's roster.
              </Text>
              <Text className="mb4 text-start">
                Are you sure you want to cut this player?
              </Text>
            </>
          )}
          {modalAction === Promise && (
            <Text className="mb4 text-start">
              Are you sure you want to send a promise to this player?
            </Text>
          )}
          {modalAction === InfoType && (
            <PlayerInfoModalBody league={league} player={player} contract={contract} />
          )}
          {modalAction === RecruitInfoType && (
            <RecruitInfoModalBody league={league} player={player}/>
        )}
        </Modal>
      </>
    );
  };
  