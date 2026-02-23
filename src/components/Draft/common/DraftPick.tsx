import React, { useCallback, useMemo } from "react";
import {
  DrafteeInfoType,
  League,
  ModalAction,
  SimPHL,
} from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { getLogo } from "../../../_utility/getLogo";
import { DraftPick as DraftPickType, Draftee } from "./types";

interface WarRoomDraftPickProps {
  pick: DraftPickType;
  league: League;
  draftablePlayerMap: Record<number, Draftee>;
}

export const WarRoomDraftPick: React.FC<WarRoomDraftPickProps> = ({
  pick,
  league,
  draftablePlayerMap,
}) => {
  const pickNumber = (pick.DraftRound - 1) * 24 + pick.DraftNumber;
  const teamLogo = getLogo(league, pick.TeamID, false);
  const draftee = draftablePlayerMap[pick.DrafteeID];

  const drafteeLabel = (() => {
    if (!draftee) return "";
    return `${draftee.Position} ${draftee.FirstName} ${draftee.LastName}`;
  })();

  return (
    <div
      key={pick.ID}
      className="p-2 border rounded-lg bg-gray-600"
      style={{ contain: "layout style" }}
    >
      <div className={`flex items-center space-x-4 gap-2`}>
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gray-700 text-gray-300`}
          >
            {pickNumber}
          </div>
        </div>
        <img
          src={teamLogo}
          alt={pick.Team}
          className={`
            w-8 h-8 object-contain transition-all duration-300
          `}
        />
        <div className="flex-1">
          <div className="flex items-center justify-start space-x-2 text-xs">
            <Text
              variant="body-small"
              classes={`font-semibold text-left text-gray-200`}
            >
              {pick.Team}
            </Text>
            {pick.PreviousTeamID > 0 && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-yellow-500">via {pick.PreviousTeam}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-start space-x-2 text-xs">
            <Text variant="small" className="text-gray-400">
              Round {pick.DraftRound}
            </Text>
            {pick.DrafteeID > 0 && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-green-500">{drafteeLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DraftPickCard: React.FC<{
  pick: DraftPickType;
  index: number;
  currentPick: DraftPickType | null;
  userTeamId?: number;
  league: any;
  view?: string;
  draftablePlayerMap?: Record<number, Draftee>;
  handlePlayerModal?: (action: ModalAction, player: Draftee) => void;
}> = ({
  pick,
  index,
  currentPick,
  userTeamId,
  league,
  view = "",
  draftablePlayerMap,
  handlePlayerModal,
}) => {
  const pickNumber = (pick.DraftRound - 1) * 24 + pick.DraftNumber;
  const currentPickNumber = currentPick
    ? (currentPick.DraftRound - 1) * 24 + currentPick.DraftNumber
    : 0;

  const getPickStatus = (pick: DraftPickType, index: number) => {
    if (pick.TeamID === userTeamId) return "user";
    if (currentPick && pick.ID === currentPick.ID) return "current";
    if (pickNumber === currentPickNumber + 1) return "next";
    return "upcoming";
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "current":
        return "bg-gradient-to-r from-[#1f2937] to-blue-900 border-blue-400 shadow-lg shadow-blue-500/25";
      case "user":
        return "bg-gradient-to-r from-[#189E5B] to-green-900 border-green-400";
      case "next":
        return "bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500";
      default:
        return "bg-gray-800 border-gray-600 opacity-75";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "current":
        return { text: "ON THE CLOCK", color: "text-blue-300" };
      case "user":
        return { text: "YOUR PICK", color: "text-green-300" };
      case "next":
        return { text: "NEXT UP", color: "text-yellow-300" };
      default:
        return null;
    }
  };

  const draftee = useMemo(() => {
    if (!draftablePlayerMap) return undefined;
    if (league === SimPHL) {
      return draftablePlayerMap[pick.DrafteeID];
    }
    return draftablePlayerMap[pick.SelectedPlayerID];
  }, [pick, draftablePlayerMap, league]);

  const viewPlayer = useCallback(
    (draftee: Draftee) => {
      if (handlePlayerModal) {
        handlePlayerModal(DrafteeInfoType, draftee!!);
      }
    },
    [handlePlayerModal],
  );

  const drafteeLabel = useMemo(() => {
    if (!draftee) return "";
    return `${draftee.Position} ${draftee.FirstName} ${draftee.LastName}`;
  }, [draftee]);

  const status = getPickStatus(pick, index);
  const statusLabel = getStatusLabel(status);
  const teamLogo = getLogo(league, pick.TeamID, false);

  const draftNumber = useMemo(() => {
    if (view === "") return pick.DraftNumber;
    return (pick.DraftRound - 1) * 24 + pick.DraftNumber;
  }, [view, pick]);

  return (
    <div
      key={pick.ID}
      className={`
        relative rounded-lg border p-1 ${view !== "bigboard" ? "transition-colors duration-300" : ""}
        ${getStatusStyles(status)}
        ${drafteeLabel.length > 0 ? "cursor-pointer" : ""}
      `}
      style={{
        contain: "layout style",
        willChange: status === "current" ? "background-color" : "auto",
      }}
      onClick={() => viewPlayer(draftee!!)}
    >
      {statusLabel && (
        <div className="absolute -top-3 left-3 px-2 py-0.5 bg-gray-900 rounded z-10">
          <Text variant="small" classes={`font-bold ${statusLabel.color}`}>
            {statusLabel.text}
          </Text>
        </div>
      )}
      <div
        className={`flex items-center space-x-4 gap-2 ${status === "current" ? "pt-1" : ""}`}
      >
        <div className="flex-shrink-0">
          <div
            className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
            ${status === "current" ? "bg-blue-500/20 text-blue-200" : "bg-gray-700 text-gray-300"}
          `}
          >
            {draftNumber}
          </div>
        </div>
        <img
          src={teamLogo}
          alt={pick.Team}
          className={`
            w-8 h-8 object-contain ${view !== "bigboard" ? "transition-all duration-300" : ""}
          `}
        />
        <div className="flex-1">
          <div className="flex items-center justify-start space-x-2 text-xs">
            <Text
              variant="body-small"
              classes={`
              font-semibold text-left
              ${status === "current" || status === "user" ? "text-white" : "text-gray-200"}
            `}
            >
              {pick.Team}
            </Text>
            {pick.PreviousTeamID > 0 && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-yellow-500">via {pick.PreviousTeam}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-start space-x-2 text-xs">
            <Text variant="small" className="text-gray-400">
              Round {pick.DraftRound}
            </Text>
            {((league === SimPHL && pick.DrafteeID > 0) ||
              (league !== SimPHL && pick.SelectedPlayerID > 0)) && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-green-500">{drafteeLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {status === "current" && view !== "bigboard" && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ contain: "strict" }}
        >
          <div
            className="absolute inset-0 rounded-lg bg-blue-500 opacity-5"
            style={{
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              contain: "strict",
            }}
          />
        </div>
      )}
      {status === "user" && view !== "bigboard" && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ contain: "strict" }}
        >
          <div
            className="absolute inset-0 rounded-lg bg-green-500 opacity-10"
            style={{
              animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              contain: "strict",
            }}
          />
        </div>
      )}
    </div>
  );
};
