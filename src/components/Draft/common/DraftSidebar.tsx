import React from "react";
import { Button, ButtonGrid } from "../../../_design/Buttons";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import {
  AdminBoard,
  BigBoard,
  DraftBoardStr,
  DraftBoardType,
  League,
  ScoutBoard,
  SimNFL,
  SimPHL,
  WarRoomBoard,
} from "../../../_constants/constants";
import { DraftPick } from "./types";
import { DraftClock } from "./DraftClock";

interface DraftSidebarProps {
  selectedTeam?: {
    TeamName?: string;
  } | null;
  teamColors: {
    primary: string;
    secondary: string;
  };
  activeTab: DraftBoardType;
  setActiveTab: (tab: DraftBoardType) => void;
  isAdmin: boolean;
  offensiveSystem: string;
  defensiveSystem: string;
  teamNeedsList: string[];
  league: League;
  currentPick: DraftPick | null;
  currentRound: number;
  pickNumber: number;
  timeLeft: number;
  isPaused: boolean;
  picksPerRound?: number;
}

export const DraftSidebar: React.FC<DraftSidebarProps> = ({
  selectedTeam,
  teamColors,
  activeTab,
  setActiveTab,
  isAdmin,
  offensiveSystem,
  defensiveSystem,
  teamNeedsList,
  league,
  currentPick,
  currentRound,
  pickNumber,
  timeLeft,
  isPaused,
  picksPerRound,
}) => {
  return (
    <div className="flex flex-col mb-4">
      <Border
        classes="p-4 bg-gray-900 border-4"
        direction="col"
        styles={{ borderColor: teamColors.primary }}
      >
        <Text variant="h4" classes="text-white mb-4">
          {selectedTeam?.TeamName || "View"}
        </Text>
        <ButtonGrid>
          <Button
            variant={activeTab === DraftBoardStr ? "primary" : "secondary"}
            onClick={() => setActiveTab(DraftBoardStr)}
            size="xs"
          >
            Draft Board
          </Button>
          <Button
            variant={activeTab === ScoutBoard ? "primary" : "secondary"}
            onClick={() => setActiveTab(ScoutBoard)}
            size="xs"
          >
            Scouting Board
          </Button>
          <Button
            variant={activeTab === WarRoomBoard ? "primary" : "secondary"}
            onClick={() => setActiveTab(WarRoomBoard)}
            size="xs"
          >
            War Room
          </Button>
          <Button
            variant={activeTab === BigBoard ? "primary" : "secondary"}
            onClick={() => setActiveTab(BigBoard)}
            size="xs"
          >
            Big Mode
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === AdminBoard ? "primary" : "secondary"}
              onClick={() => setActiveTab(AdminBoard)}
              size="xs"
            >
              Admin
            </Button>
          )}
        </ButtonGrid>
        <hr className="border-gray-700 my-2" />{" "}
        {activeTab !== BigBoard && (
          <>
            <div className="mt-2">
              <Text variant="body" classes="text-gray-200">
                Team Needs
              </Text>
            </div>
            {league === SimPHL && (
              <>
                <div className="mt-2">
                  <Text variant="xs" classes="text-gray-200">
                    Offensive System: {offensiveSystem}
                  </Text>
                </div>
                <div className="">
                  <Text variant="xs" classes="text-gray-200">
                    Defensive System: {defensiveSystem}
                  </Text>
                </div>
              </>
            )}
            {league === SimNFL && (
              <>
                <div className="mt-2">
                  <Text variant="xs" classes="text-gray-200">
                    Offensive System: {offensiveSystem}
                  </Text>
                </div>
                <div className="">
                  <Text variant="xs" classes="text-gray-200">
                    Defensive System: {defensiveSystem}
                  </Text>
                </div>
              </>
            )}
            <div className="mt-2">
              {teamNeedsList.map((need) => (
                <Text key={need} variant="xs" classes="text-gray-400">
                  {need}
                </Text>
              ))}
            </div>
          </>
        )}
        {activeTab === BigBoard && (
          <>
            <DraftClock
              currentPick={currentPick}
              currentRound={currentRound}
              pickNumber={pickNumber}
              timeLeft={timeLeft}
              isPaused={isPaused}
              picksPerRound={picksPerRound}
              league={league}
              teamColors={teamColors}
              activeTab={activeTab}
            />
          </>
        )}
      </Border>
    </div>
  );
};
