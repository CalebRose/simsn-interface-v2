import React, { FC, useMemo } from "react";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../../_constants/constants";
import {
  CollegePlayer as CHLPlayer,
  ProfessionalPlayer as PHLPlayer,
} from "../../../models/hockeyModels";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
} from "../../../models/footballModels";
import {
  CollegePlayer as CBBPlayer,
  NBAPlayer,
} from "../../../models/basketballModels";
import { Modal } from "../../../_design/Modal";
import { Text } from "../../../_design/Typography";

interface InjuryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  injuredPlayers:
    | CHLPlayer[]
    | PHLPlayer[]
    | CFBPlayer[]
    | NFLPlayer[]
    | CBBPlayer[]
    | NBAPlayer[];
  borderColor: string;
  backgroundColor: string;
  darkerBackgroundColor: string;
}

interface InjuredPlayerRowProps {
  player: CHLPlayer | PHLPlayer | CFBPlayer | NFLPlayer | CBBPlayer | NBAPlayer;
  idx: number;
  league: League;
  backgroundColor: string;
  darkerBackgroundColor: string;
  borderColor: string;
}

const InjuredPlayerRow: FC<InjuredPlayerRowProps> = ({
  player,
  idx,
  league,
  backgroundColor,
  darkerBackgroundColor,
  borderColor,
}) => {
  const isFootball = league === SimCFB || league === SimNFL;
  const recoveryValue = useMemo(() => {
    if (isFootball) {
      return "WeeksOfRecovery" in player
        ? (player as CFBPlayer | NFLPlayer).WeeksOfRecovery
        : "N/A";
    }
    if (league === SimCBB || league === SimNBA) {
      return "DaysOfRecovery" in player
        ? (player as CBBPlayer | NBAPlayer).WeeksOfRecovery
        : "N/A";
    }
    return "DaysOfRecovery" in player
      ? (player as CHLPlayer | PHLPlayer).DaysOfRecovery
      : "N/A";
  }, [player, league]);

  const teamValue = useMemo(() => {
    if (isFootball) {
      return "TeamAbbr" in player
        ? (player as CFBPlayer | NFLPlayer).TeamAbbr
        : "N/A";
    }
    if (league === SimCBB || league === SimNBA) {
      return "Team" in player ? (player as CBBPlayer | NBAPlayer).Team : "N/A";
    }
    return "Team" in player ? (player as CHLPlayer | PHLPlayer).Team : "N/A";
  }, [player, league]);

  return (
    <div
      className="grid grid-cols-12 py-2 border-b"
      style={{
        backgroundColor:
          idx % 2 === 0 ? backgroundColor : darkerBackgroundColor,
        borderColor,
      }}
    >
      <div className="col-span-2 text-left truncate">
        <Text variant="xs">{teamValue}</Text>
      </div>
      <div className="col-span-1 text-left">
        <Text variant="xs">{player.Position}</Text>
      </div>
      <div className="col-span-2 text-left truncate">
        <Text variant="xs">{player.Archetype}</Text>
      </div>
      <div className="col-span-3 text-left truncate">
        <Text variant="xs">
          {player.FirstName} {player.LastName}
        </Text>
      </div>
      {!isFootball && (
        <div className="col-span-3 text-left truncate">
          <Text variant="xs">{player.InjuryName}</Text>
        </div>
      )}
      {isFootball && (
        <div className="col-span-3 text-center">
          <Text variant="xs">{player.InjuryType}</Text>
        </div>
      )}
      <div className="col-span-1 text-center">
        <Text variant="xs">{recoveryValue}</Text>
      </div>
    </div>
  );
};

export const InjuryReportModal: FC<InjuryReportModalProps> = ({
  isOpen,
  onClose,
  league,
  injuredPlayers,
  borderColor,
  backgroundColor,
  darkerBackgroundColor,
}) => {
  /*Active Leagues: SimCFB, SimNFL, SimCBB, SimNBA, SimCHL, SimPHL */
  const isFootball = league === SimCFB || league === SimNFL;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${league} Injury Report`}
        classes="max-h-[75vh]"
      >
        <>
          <div
            className="grid grid-cols-12 border-b-2 pb-2 mb-1 px-2"
            style={{ borderColor }}
          >
            <div className="col-span-2 text-left">
              <Text variant="body-small" className="font-semibold">
                Team
              </Text>
            </div>
            <div className="col-span-1 text-left">
              <Text variant="body-small" className="font-semibold">
                Pos
              </Text>
            </div>
            <div className="col-span-2 text-left">
              <Text variant="body-small" className="font-semibold">
                Archetype
              </Text>
            </div>
            <div className="col-span-3 text-left">
              <Text variant="body-small" className="font-semibold">
                Name
              </Text>
            </div>
            <div className="col-span-3 text-left">
              <Text variant="body-small" className="font-semibold">
                Injury
              </Text>
            </div>
            <div className="col-span-1 text-center">
              <Text variant="body-small" className="font-semibold">
                {isFootball ? "Weeks" : "Games"}
              </Text>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[55vh]">
            {injuredPlayers.length === 0 && (
              <Text variant="h4" classes="my-4">
                There are no injured players.
              </Text>
            )}
            {injuredPlayers.length > 0 &&
              injuredPlayers.map((player: any, idx: number) => (
                <InjuredPlayerRow
                  key={idx}
                  player={player}
                  idx={idx}
                  league={league}
                  backgroundColor={backgroundColor}
                  darkerBackgroundColor={darkerBackgroundColor}
                  borderColor={borderColor}
                />
              ))}
          </div>
        </>
      </Modal>
    </>
  );
};
