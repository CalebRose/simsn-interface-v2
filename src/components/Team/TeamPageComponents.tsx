import { FC } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import {
  Cut,
  InfoType,
  League,
  ModalAction,
  Promise,
  Redshirt,
  SimPHL,
} from "../../_constants/constants";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
import { getLogo } from "../../_utility/getLogo";
import { Logo } from "../../_design/Logo";
import { Modal } from "../../_design/Modal";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { PlayerInfoModalBody } from "../Common/Modals";

interface TeamInfoProps {
  id?: number;
  TeamName?: string;
  Owner?: string;
  Coach?: string;
  GM?: string;
  Scout?: string;
  Marketing?: string;
  Conference?: string;
  Division?: string;
  Arena?: string;
  Capacity?: number;
  isPro: boolean;
  League: League;
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  isRetro?: boolean;
}

export const TeamInfo: FC<TeamInfoProps> = ({
  isPro,
  id,
  TeamName = "",
  Owner = "None",
  Coach = "None",
  GM = "None",
  Scout = "None",
  Marketing = "None",
  Division,
  Conference = "",
  Arena = "",
  Capacity = 0,
  League,
  colorOne = "",
  colorTwo = "",
  colorThree = "",
  isRetro = false,
}) => {
  const backgroundColor = colorOne;
  const borderColor = colorTwo;
  const darkerBorder = darkenColor(borderColor, -20)
  const secondaryBorderColor = colorThree;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const logo = getLogo(League, id!!, isRetro);
  return (
    <div className="flex flex-row w-full">
      <Border
        direction="col"
        classes="w-full px-4"
        styles={{
          backgroundColor,
          borderColor,
        }}
      >
        <div className="flex flex-col justify-center items-center w-full pb-2">
          <div className="flex flex-col max-w-1/4 p-2">
            <div className="max-w-[6rem] w-[5.5em] h-[5.5rem] rounded-lg border-2"
                 style={{ backgroundColor: darkerBorder, borderColor: borderColor }}>
              <Logo url={logo} variant="large" containerClass="" />
            </div>
          </div>
          <div className="flex flex-col max-w-1/2">
            <Text variant="h5" classes={`${textColorClass}`}>
              {TeamName}
            </Text>
            <div className="flex flex-col justify-center gap-x-2">
              {isPro && (
                <Text variant="body-small" classes={`${textColorClass}`}>
                  Owner: {Owner}
                </Text>
              )}
              <Text variant="body-small" classes={`${textColorClass}`}>
                Coach: {Coach}
              </Text>
              {isPro && (
                <Text variant="body-small" classes={`${textColorClass}`}>
                  GM: {GM}
                </Text>
              )}
              {isPro && (
                <Text variant="body-small" classes={`${textColorClass}`}>
                  Scout: {Scout}
                </Text>
              )}
              {isPro && League === SimPHL && (
                <Text variant="body-small" classes={`${textColorClass}`}>
                  Marketing: {Marketing}
                </Text>
              )}
            </div>
            <div className="flex flex-row justify-center">
              <Text variant="body-small" classes={`${textColorClass}`}>
                {Conference} Conference
              </Text>
              {Division && Division.length > 0 && (
                <Text variant="body-small" classes={`${textColorClass}`}>
                  {Division}
                </Text>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <Text variant="xs" classes={`${textColorClass}`}>
                {Arena}
              </Text>
              <Text variant="xs" classes={`${textColorClass}`}>
                Capacity: {Capacity}
              </Text>
            </div>
          </div>
        </div>
      </Border>
    </div>
  );
};

interface TeamDropdownSectionProps {
  teamOptions: { label: string; value: string }[];
  selectTeamOption: () => void;
  export: () => Promise<void>;
}

export const TeamDropdownSection: FC<TeamDropdownSectionProps> = ({}) => {
  return <></>;
};

export const CapsheetInfo = ({ capsheet, colorOne, colorTwo }: any) => {
  return (
    <>
      <div className="flex flex-row">
        <Border classes="w-full px-4">
          <Text variant="h5">Cap Info</Text>
          <Text variant="body">Y1</Text>
          <Text variant="body">Y2</Text>
          <Text variant="body">Y3</Text>
          <Text variant="body">Y4</Text>
          <Text variant="body">Y5</Text>
          <Text variant="body">Dead Cap</Text>
        </Border>
      </div>
    </>
  );
};

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerID?: number;
  teamID?: number;
  playerLabel?: string;
  league: League;
  modalAction: ModalAction;
  player: any;
  cutPlayer?: (playerID: number, teamID: number) => Promise<void>;
  redshirtPlayer?: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer?: (playerID: number, teamID: number) => Promise<void>;
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
              {modalAction !== InfoType && (
                <>
                  <Button size="sm" variant="danger" onClick={onClose}>
                    <Text variant="small">Cancel</Text>
                  </Button>
                  <Button size="sm" onClick={action}>
                    <Text variant="small">Confirm</Text>
                  </Button>
                </>
              )}
              {modalAction === InfoType && (
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
          <PlayerInfoModalBody league={league} player={player} />
        )}
      </Modal>
    </>
  );
};
