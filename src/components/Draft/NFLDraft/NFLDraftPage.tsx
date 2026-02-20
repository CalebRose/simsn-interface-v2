import { FC } from "react";
import {
  NFLDraftee,
  NFLTeam,
  ScoutingProfile,
} from "../../../models/footballModels";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { League } from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useAuthStore } from "../../../context/AuthContext";
import { useNFLDraft } from "./useNFLDraft";
import {
  DraftBoard,
  DraftClock,
  DraftTicker,
  ScoutingBoard,
  UpcomingPicks,
} from "../common";

interface NFLDraftPageProps {
  league: League;
  team: NFLTeam;
}

export const NFLDraftPage: FC<NFLDraftPageProps> = ({ team }) => {
  const { currentUser } = useAuthStore();

  const {
    nflDraftees,
    selectedTeam,
    teamScoutProfiles,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    draftState,
    currentPick,
    upcomingPicks,
    recentPicks,
    draftedPlayerIds,
    scoutedPlayerIds,
    teamWarRoom,
    isUserTurn,
    handleAddToScoutBoard,
    handleRemoveFromScoutBoard,
    handleRevealAttribute,
    handleViewScoutDetails,
    selectTeamOption,
    nflTeamOptions,
    // teamNeedsList,
    // offensiveSystemsInformation,
    // defensiveSystemsInformation,
    // offensiveSystem,
    // defensiveSystem,
    modalPlayer,
    handleCloseModal,
    handlePlayerModal,
    modalAction,
    isModalOpen,
    resyncDraftData,
    handleManualDraftStateUpdate,
    handleExportDraftPicks,
    isDraftComplete,
    togglePause,
    resetTimer,
    startDraft,
    seconds,
    teamDraftPicks,
    draftablePlayerMap,
    draftPicksFromState,
  } = useNFLDraft();

  const rawTeamColors = useTeamColors(team?.ColorOne, team?.ColorTwo);
  const teamColors = {
    primary: rawTeamColors.One,
    secondary: rawTeamColors.Two,
  };
  const backgroundColor = "#1f2937";

  const onAddToScoutBoard = async (player: NFLDraftee) => {
    await handleAddToScoutBoard(player);
  };

  const onRemoveFromScoutBoard = async (profile: ScoutingProfile) => {
    await handleRemoveFromScoutBoard(profile);
  };

  const onRevealAttribute = async (
    profileId: number,
    attribute: string,
    points: number,
  ) => {
    await handleRevealAttribute(profileId, attribute, points);
  };

  const onViewDetails = (profile: ScoutingProfile) => {
    handleViewScoutDetails(profile);
  };

  const onDraftPlayer = async (player: NFLDraftee) => {
    // Logic to draft player from the current pick
    const draftPickMap = { ...draftState.allDraftPicks };
    const roundKey = draftState.currentRound;
    const picksInRound = draftPickMap[roundKey] || [];
    if (picksInRound.length === 0) return; // No picks in this round
    const currentPickIndex = picksInRound.findIndex(
      (pick) => pick.ID === draftState.currentPick,
    );
    if (currentPickIndex === -1) return; // Pick not found
    draftPickMap[roundKey][currentPickIndex].DrafteeID = player.ID;

    const newDraftState = draftState;
    newDraftState.advanceToNextPick();
    const curr = newDraftState.currentPick;
    const round = newDraftState.currentRound;
    const next = newDraftState.nextPick;
    const draftComplete = newDraftState.isDraftComplete?.() || false;

    await handleManualDraftStateUpdate({
      currentPick: curr,
      currentRound: round,
      nextPick: next,
      draftComplete,
      recentlyDraftedPlayerID: player.ID,
      allDraftPicks: draftPickMap,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
          <Text variant="h3" classes="text-white">
            Loading Draft Room...
          </Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <Text variant="h3" classes="text-white mb-2">
            Error Loading Draft Room
          </Text>
          <Text variant="body" classes="text-gray-400 mb-4">
            {error}
          </Text>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 space-y-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
            <div className="flex-1">
              <DraftClock
                currentPick={currentPick}
                currentRound={draftState.currentRound}
                pickNumber={draftState.currentPick}
                timeLeft={draftState.timeLeft}
                isPaused={draftState.isPaused}
                teamColors={teamColors}
              />
            </div>
            <div className="flex-1">
              <DraftTicker
                recentPicks={recentPicks.map((pick) => ({ pick }))}
                teamColors={teamColors}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
          <div className="h-full">
            <UpcomingPicks
              upcomingPicks={upcomingPicks.slice(0, 5)}
              currentPick={currentPick}
              userTeamId={team.ID}
              teamColors={teamColors}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <ButtonGroup>
          <Button
            variant={activeTab === "board" ? "primary" : "secondary"}
            onClick={() => setActiveTab("board")}
          >
            Draft Board
          </Button>
          <Button
            variant={activeTab === "scout" ? "primary" : "secondary"}
            onClick={() => setActiveTab("scout")}
          >
            Scouting Board
          </Button>
        </ButtonGroup>
      </div>
      <div>
        {activeTab === "board" && (
          <DraftBoard
            draftees={nflDraftees}
            draftedPlayerIds={draftedPlayerIds}
            scoutedPlayerIds={scoutedPlayerIds}
            onAddToScoutBoard={handleAddToScoutBoard}
            onDraftPlayer={
              currentPick?.TeamID === team.ID ? handleDraftPlayer : undefined
            }
            isUserTurn={currentPick?.TeamID === team.ID}
            teamColors={teamColors}
            backgroundColor={backgroundColor}
            scoutingPoints={warRoom?.ScoutingPoints}
            spentPoints={warRoom?.SpentPoints}
          />
        )}
        {activeTab === "scout" && (
          <ScoutingBoard
            scoutProfiles={scoutProfiles}
            draftedPlayerIds={draftedPlayerIds}
            onRemoveFromBoard={handleRemoveFromScoutBoard}
            onDraftPlayer={
              currentPick?.TeamID === team.ID ? handleDraftPlayer : undefined
            }
            onViewDetails={handleViewScoutDetails}
            onRevealAttribute={handleRevealAttributeFromBoard}
            isUserTurn={currentPick?.TeamID === team.ID}
            teamColors={teamColors}
            backgroundColor={backgroundColor}
            teamScoutingPoints={warRoom?.ScoutingPoints || 0}
            spentPoints={warRoom?.SpentPoints || 0}
          />
        )}
      </div>
    </div>
  );
};
