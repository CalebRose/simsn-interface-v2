import { FC, useMemo } from "react";
import {
  NFLDraftee,
  NFLDraftPick,
  NFLTeam,
  ScoutingProfile,
} from "../../../models/footballModels";
import {
  AdminBoard,
  BigBoard,
  DraftBoardStr,
  League,
  ScoutBoard,
  SimNFL,
  WarRoomBoard,
} from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useAuthStore } from "../../../context/AuthContext";
import { NFL_PICKS_PER_ROUND, useNFLDraft } from "./useNFLDraft";
import {
  DraftBoard,
  DraftClock,
  DraftTicker,
  ScoutingBoard,
  UpcomingPicks,
} from "../common";
import { ActionModal } from "../../Common/ActionModal";
import { DraftSidebar } from "../common/DraftSidebar";
import { DraftWarRoom } from "../common/WarRoom";
import { BigDraftBoard } from "../common/BigBoard";
import { DraftAdminBoard } from "../common/AdminBoard";

interface NFLDraftPageProps {
  league: League;
}

export const NFLDraftPage: FC<NFLDraftPageProps> = () => {
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
    teamNeedsList,
    offensiveSystem,
    defensiveSystem,
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

  const isAdmin = useMemo(() => {
    return currentUser?.roleID === "Admin";
  }, [currentUser]);

  const rawTeamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
  );
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
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          league={SimNFL}
          teamID={modalPlayer.PreviousTeamID}
          modalAction={modalAction}
          player={modalPlayer}
        />
      )}
      <div className="grid sm:grid-flow-row grid-auto-rows-auto grid-cols-1 sm:grid-cols-[2fr_10fr] w-full h-full gap-y-2 gap-x-2 mb-2">
        <DraftSidebar
          selectedTeam={selectedTeam}
          teamColors={teamColors}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          offensiveSystem={offensiveSystem}
          defensiveSystem={defensiveSystem}
          teamNeedsList={teamNeedsList}
          league={SimNFL}
        />
        <div className="flex flex-col gap-2">
          {activeTab !== BigBoard && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-2 h-full">
              <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
                <div className="flex-1">
                  <DraftClock
                    currentPick={currentPick as NFLDraftPick}
                    currentRound={draftState.currentRound}
                    pickNumber={draftState.currentPick}
                    timeLeft={draftState.seconds}
                    isPaused={draftState.isPaused}
                    teamColors={teamColors}
                    league={SimNFL}
                    picksPerRound={NFL_PICKS_PER_ROUND}
                  />
                </div>
                <div className="flex-1">
                  <DraftTicker
                    recentPicks={recentPicks.map((pick) => ({ pick }))}
                    teamColors={teamColors}
                    backgroundColor={backgroundColor}
                    league={SimNFL}
                  />
                </div>
              </div>
              <div className="h-full">
                <UpcomingPicks
                  upcomingPicks={upcomingPicks.slice(0, 5)}
                  currentPick={currentPick}
                  userTeamId={selectedTeam?.ID}
                  teamColors={teamColors}
                  backgroundColor={backgroundColor}
                  league={SimNFL}
                />
              </div>
            </div>
          )}
          <div>
            {activeTab === DraftBoardStr && (
              <DraftBoard
                draftees={nflDraftees}
                draftedPlayerIds={draftedPlayerIds}
                scoutedPlayerIds={scoutedPlayerIds}
                onAddToScoutBoard={(player) =>
                  onAddToScoutBoard(player as unknown as NFLDraftee)
                }
                onDraftPlayer={
                  isUserTurn
                    ? (player) => onDraftPlayer(player as unknown as NFLDraftee)
                    : undefined
                }
                isUserTurn={isUserTurn}
                teamColors={teamColors}
                backgroundColor={backgroundColor}
                scoutingPoints={teamWarRoom?.ScoutingPoints || 0}
                spentPoints={teamWarRoom?.SpentPoints || 0}
                openModal={handlePlayerModal}
                league={SimNFL}
              />
            )}
            {activeTab === ScoutBoard && (
              <ScoutingBoard
                scoutProfiles={
                  teamScoutProfiles as unknown as ScoutingProfile[]
                }
                draftedPlayerIds={draftedPlayerIds}
                onRemoveFromBoard={(profile) =>
                  handleRemoveFromScoutBoard(
                    profile as unknown as ScoutingProfile,
                  )
                }
                onDraftPlayer={
                  currentPick?.TeamID === selectedTeam?.ID
                    ? (player) => onDraftPlayer(player as unknown as NFLDraftee)
                    : undefined
                }
                onViewDetails={(profile) =>
                  onViewDetails(profile as unknown as ScoutingProfile)
                }
                onRevealAttribute={onRevealAttribute}
                isUserTurn={isUserTurn}
                teamColors={teamColors}
                backgroundColor={backgroundColor}
                teamScoutingPoints={teamWarRoom?.ScoutingPoints || 0}
                spentPoints={teamWarRoom?.SpentPoints || 0}
                league={SimNFL}
                draftablePlayerMap={draftablePlayerMap}
              />
            )}
            {activeTab === WarRoomBoard && (
              <>
                <DraftWarRoom
                  league={SimNFL}
                  backgroundColor={backgroundColor}
                  teamDraftPicks={teamDraftPicks as NFLDraftPick[]}
                  selectedTeam={selectedTeam as NFLTeam | null}
                  draftablePlayerMap={draftablePlayerMap}
                />
              </>
            )}
            {activeTab === BigBoard && (
              <>
                <BigDraftBoard
                  draftPicks={draftPicksFromState as NFLDraftPick[]}
                  selectedTeam={selectedTeam as NFLTeam | null}
                  draftablePlayerMap={draftablePlayerMap}
                  league={SimNFL}
                  backgroundColor={backgroundColor}
                  currentPick={currentPick}
                />
              </>
            )}
            {activeTab === AdminBoard && (
              <>
                <DraftAdminBoard
                  draftState={draftState}
                  resyncDraftData={resyncDraftData}
                  handleManualDraftStateUpdate={handleManualDraftStateUpdate}
                  league={SimNFL}
                  backgroundColor={backgroundColor}
                  isDraftComplete={isDraftComplete}
                  teamOptions={nflTeamOptions}
                  selectTeamOption={selectTeamOption}
                  resetTimer={resetTimer}
                  startDraft={startDraft}
                  pauseDraft={togglePause}
                  handleExportDraft={handleExportDraftPicks}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
