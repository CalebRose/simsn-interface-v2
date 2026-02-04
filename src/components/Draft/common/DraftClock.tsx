import { FC, useEffect, useMemo, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { getLogo } from "../../../_utility/getLogo";
import {
  DraftLeague,
  DraftPick,
  TeamColors,
  getLeagueConstant,
  isNFLLeague,
} from "./types";
import { formatDraftTime } from "../PHLDraft/utils/draftHelpers";

interface DraftClockProps {
  currentPick: DraftPick | null;
  currentRound: number;
  pickNumber: number;
  timeLeft: number;
  isPaused: boolean;
  teamColors: TeamColors;
  league: DraftLeague;
  picksPerRound?: number;
}

export const DraftClock: FC<DraftClockProps> = ({
  currentPick,
  currentRound,
  pickNumber,
  timeLeft,
  isPaused,
  teamColors,
  league,
}) => {
  const isUrgent = useMemo(() => {
    return !isPaused && timeLeft <= 30 && timeLeft > 0;
  }, [timeLeft, isPaused]);

  const formattedTime = useMemo(() => {
    return formatDraftTime(timeLeft);
  }, [timeLeft]);

  const getTimerColor = () => {
    if (isPaused) return "text-gray-400";
    if (isUrgent) return "text-red-500 animate-pulse";
    if (timeLeft <= 60) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressPercentage = () => {
    let totalTime: number;
    if (isNFLLeague(league)) {
      totalTime = currentRound === 1 ? 300 : currentRound <= 4 ? 180 : 120;
    } else {
      totalTime = currentRound === 1 ? 300 : currentRound <= 4 ? 180 : 120;
    }
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const leagueConstant = getLeagueConstant(league);

  if (!currentPick) {
    return (
      <Border
        classes="p-6 bg-gray-900 border-4"
        styles={{ borderColor: teamColors.primary }}
      >
        <div className="text-center">
          <Text variant="h3" classes="text-white mb-2">
            Draft Complete
          </Text>
          <Text variant="body" classes="text-gray-400">
            All picks have been made
          </Text>
        </div>
      </Border>
    );
  }

  const teamLogo = getLogo(leagueConstant, currentPick.TeamID, false);

  return (
    <Border
      classes={`p-4 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden border-4 h-full ${isUrgent ? "animate-pulse" : ""}`}
      styles={{
        borderColor: teamColors.primary,
        contain: "layout style",
        willChange: isUrgent ? "opacity" : "auto",
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${teamColors.primary} 0%, transparent 50%)`,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Text
              variant="body"
              classes="text-gray-400 uppercase tracking-wider text-xs"
            >
              On The Clock
            </Text>
            <Text variant="h4" classes="text-white font-bold">
              Round {currentRound} • Pick {pickNumber}
            </Text>
          </div>
          <div className="text-right">
            <Text
              variant="body"
              classes="text-gray-400 uppercase tracking-wider text-xs"
            >
              Time Remaining
            </Text>
            <Text
              variant="h2"
              classes={`font-mono font-bold ${getTimerColor()}`}
            >
              {formattedTime}
            </Text>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 mt-6">
          <img
            src={teamLogo}
            alt={currentPick.Team}
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
          <div className="text-center">
            <Text variant="h3" classes="text-white font-bold">
              {currentPick.Team}
            </Text>
            <Text variant="body" classes="text-gray-400">
              {currentPick.Notes || "Making selection..."}
            </Text>
          </div>
        </div>
        {isPaused && (
          <div className="flex justify-end items-top">
            <span className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>PAUSED</span>
            </span>
          </div>
        )}
      </div>
    </Border>
  );
};
