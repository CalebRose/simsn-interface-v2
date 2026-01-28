import React, { FC } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { getLogo } from "../../../_utility/getLogo";
import { DraftLeague, DraftPick, TeamColors, getLeagueConstant } from "./types";

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
    if (index === 0) return "next";
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
        {upcomingPicks.map((pick, index) => {
          const status = getPickStatus(pick, index);
          const statusLabel = getStatusLabel(status);
          const teamLogo = getLogo(leagueConstant, pick.TeamID, false);

          return (
            <div
              key={pick.ID}
              className={`
                relative rounded-lg border p-1 transition-colors duration-300
                ${getStatusStyles(status)}
              `}
              style={{
                contain: "layout style",
                willChange: status === "current" ? "background-color" : "auto",
              }}
            >
              {statusLabel && (
                <div className="absolute -top-3 left-3 px-2 py-0.5 bg-gray-900 rounded z-10">
                  <Text
                    variant="small"
                    classes={`font-bold ${statusLabel.color}`}
                  >
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
                    {pick.DraftNumber}
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
                  <Text
                    variant="body-small"
                    classes={`
                      font-semibold text-left
                      ${status === "current" || status === "user" ? "text-white" : "text-gray-200"}
                    `}
                  >
                    {pick.Team}
                  </Text>
                  <div className="flex items-center justify-start space-x-2 text-xs">
                    <Text variant="small" className="text-gray-400">
                      Round {pick.DraftRound}
                    </Text>
                    {pick.PreviousTeamID > 0 && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-yellow-500">
                          via {pick.PreviousTeam}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {status === "current" && (
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ contain: "strict" }}
                >
                  <div
                    className="absolute inset-0 rounded-lg bg-blue-500 opacity-5"
                    style={{
                      animation:
                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      contain: "strict",
                    }}
                  />
                </div>
              )}
              {status === "user" && (
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ contain: "strict" }}
                >
                  <div
                    className="absolute inset-0 rounded-lg bg-green-500 opacity-10"
                    style={{
                      animation:
                        "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      contain: "strict",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
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
