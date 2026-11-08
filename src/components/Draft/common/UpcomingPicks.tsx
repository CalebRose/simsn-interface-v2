import React, { FC } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { DraftLeague, DraftPick, TeamColors } from "./types";
import { DraftPickCard, getPickStatus } from "./DraftPick";
import { SimPHL } from "../../../_constants/constants";

interface UpcomingPicksProps {
  upcomingPicks: DraftPick[];
  currentPick: DraftPick | null;
  userTeamId?: number;
  teamColors: TeamColors;
  backgroundColor: string;
  league: DraftLeague;
  currentRoundPickCount?: number;
}

export const UpcomingPicks: FC<UpcomingPicksProps> = ({
  upcomingPicks,
  currentPick,
  userTeamId,
  teamColors,
  backgroundColor,
  league,
  currentRoundPickCount,
}) => {
  const picksInRound = currentRoundPickCount || (league === SimPHL ? 28 : 32);

  return (
    <Border
      classes="p-4 border-2 h-full"
      styles={{
        borderColor: teamColors.primary,
        backgroundColor,
        contain: "layout style",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <Text variant="h5" classes="text-white font-semibold">
          Upcoming Picks
        </Text>
        <Text variant="xs" classes="text-gray-400">
          Next {upcomingPicks.length} selections
        </Text>
      </div>

      <div className="space-y-2">
        {upcomingPicks.map((pick, index) => (
          <DraftPickCard
            key={pick.ID}
            pick={pick}
            index={index}
            currentPick={currentPick}
            currentRoundPickCount={picksInRound}
            userTeamId={userTeamId}
            league={league}
          />
        ))}
      </div>
      <div
        className="mt-2 pt-4 border-t border-gray-700"
        style={{ contain: "layout style" }}
      >
        <div
          className="flex items-center space-x-1"
          style={{ contain: "layout" }}
        >
          {upcomingPicks.slice(0, 10).map((pick) => {
            const status = getPickStatus(pick, currentPick, userTeamId, picksInRound);
            return (
              <div
                key={pick.ID}
                className={`
                  flex-1 h-2 rounded-full transition-colors duration-300
                  ${status === "current" ? "bg-blue-500" : ""}
                  ${status === "user" ? "bg-green-500" : ""}
                  ${status === "next" ? "bg-yellow-500" : ""}
                  ${status === "upcoming" ? "bg-gray-600" : ""}
                `}
                style={{ contain: "layout style" }}
                title={`Pick ${pick.DraftNumber}: ${pick.Team}`}
              />
            );
          })}
        </div>
      </div>
    </Border>
  );
};
