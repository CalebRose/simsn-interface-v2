import React, { FC } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { DraftLeague, DraftPick, TeamColors, getLeagueConstant } from "./types";
import { UpcomingPick } from "./DraftPick";

interface UpcomingPicksProps {
  upcomingPicks: DraftPick[];
  currentPick: DraftPick | null;
  userTeamId?: number;
  teamColors: TeamColors;
  backgroundColor: string;
  league: DraftLeague;
}

export const UpcomingPicks: FC<UpcomingPicksProps> = ({
  upcomingPicks,
  currentPick,
  userTeamId,
  teamColors,
  backgroundColor,
  league,
}) => {
  const leagueConstant = getLeagueConstant(league);

  const getPickStatus = (pick: DraftPick, index: number) => {
    if (pick.TeamID === userTeamId) return "user";
    if (currentPick && pick.ID === currentPick.ID) return "current";
    if (index === 1) return "next";
    return "upcoming";
  };

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
          <UpcomingPick
            key={pick.ID}
            pick={pick}
            index={index}
            currentPick={currentPick}
            userTeamId={userTeamId}
            league={leagueConstant}
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
          {upcomingPicks.slice(0, 10).map((pick, index) => {
            const status = getPickStatus(pick, index);
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
