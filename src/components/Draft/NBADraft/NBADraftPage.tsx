import React, { useMemo } from "react";
import {
  AdminBoard,
  BigBoard,
  DraftBoardStr,
  League,
  ScoutBoard,
  SimNBA,
  WarRoomBoard,
} from "../../../_constants/constants";
import { useNBADraftPage } from "./useNBADraftPage";
import { useAuthStore } from "../../../context/AuthContext";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { getSecondsByRound } from "../PHLDraft/utils/draftHelpers";
import {
  DraftPick,
  NBADraftee,
  NBATeam,
  ScoutingProfile,
} from "../../../models/basketballModels";
import { Text } from "../../../_design/Typography";
import { ActionModal } from "../../Common/ActionModal";
import { DraftAdminBoard } from "../common/AdminBoard";
import { BigDraftBoard } from "../common/BigBoard";
import { DraftWarRoom } from "../common/WarRoom";
import {
  DraftBoard,
  DraftClock,
  Draftee,
  DraftTicker,
  ScoutingBoard,
  ScoutingProfile as CommonScoutingProfile,
  UpcomingPicks,
} from "../common";
import { DraftSidebar } from "../common/DraftSidebar";

interface NBADraftPageProps {
  league: League;
}

export const NBADraftPage: React.FC<NBADraftPageProps> = ({ league }) => {
  const { currentUser, isAdmin } = useAuthStore();
  const {
    selectedTeam,
    nbaDraftees,
    teamScoutProfiles,
    currentSeasonDraftPicks,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    draftState,
    updateDraftState,
    handleManualDraftStateUpdate,
    selectedScoutProfile,
    isScoutingModalOpen,
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
    closeScoutingModal,
    handleExportDraftPicks,
    refreshDraftData,
    formatDraftPosition,
    getTimeForPick,
    PICKS_PER_ROUND: NBA_PICKS_PER_ROUND,
    selectTeamOption,
    nbaTeamOptions,
    teamNeedsList,
    modalPlayer,
    handleCloseModal,
    handlePlayerModal,
    modalAction,
    isModalOpen,
    isPaused,
    seconds,
    draftPicksFromState,
    resyncDraftData,
    isDraftStateLoading,
    formattedTime,
    isDraftComplete,
    togglePause,
    startDraft,
    resetTimer,
    teamDraftPicks,
    draftablePlayerMap,
    nbaDraftPicks,
    exportNBADraftees,
  } = useNBADraftPage();

  const isCommissioner = useMemo(() => {
    if (!currentUser) return false;
    if (!currentUser.roleID) return false;
    return isAdmin || currentUser?.roleID?.includes("NBA Commissioner");
  }, [currentUser, isAdmin]);

  const rawTeamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
  );
  const teamColors = {
    primary: rawTeamColors.One,
    secondary: rawTeamColors.Two,
  };
  const backgroundColor = "#1f2937";

  const onAddToScoutBoard = async (player: NBADraftee) => {
    await handleAddToScoutBoard(player);
  };

  const onRemoveFromScoutBoard = async (profile: CommonScoutingProfile) => {
    await handleRemoveFromScoutBoard(profile as ScoutingProfile);
  };

  const onRevealAttribute = async (
    profileId: number,
    attribute: string,
    points: number,
  ) => {
    await handleRevealAttribute(profileId, attribute, points);
  };

  const onViewDetails = (profile: CommonScoutingProfile) => {
    handleViewScoutDetails(profile as ScoutingProfile);
  };

  const onDraftPlayer = async (player: NBADraftee) => {
    // Logic to draft player from the current pick
    const draftPickMap = { ...draftState.allDraftPicks };
    const roundKey = draftState.currentRound;
    const picksInRound = draftPickMap[roundKey] || [];
    if (picksInRound.length === 0) return; // No picks in this round
    const currentPickIndex = picksInRound.findIndex(
      (pick) => pick.DraftNumber === draftState.currentPick,
    );
    if (currentPickIndex === -1) return; // Pick not found
    draftPickMap[roundKey][currentPickIndex].DrafteeID = player.ID;
    const newDraftState = draftState;
    newDraftState.advanceToNextPick(SimNBA);
    const curr = newDraftState.currentPick;
    const round = newDraftState.currentRound;
    const next = newDraftState.nextPick;
    const draftComplete = newDraftState.isDraftComplete?.() || false;

    const newSeconds = getSecondsByRound(round);
    const newEndTime = new Date(Date.now() + newSeconds * 1000);

    await handleManualDraftStateUpdate({
      currentPick: curr,
      currentRound: round,
      nextPick: next,
      draftComplete,
      recentlyDraftedPlayerID: player.ID,
      allDraftPicks: draftPickMap,
      endTime: newEndTime,
      seconds: newSeconds, // Reset to original timer value
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
          <div className="text-red-500 text-6xl mb-4">!</div>
          <Text variant="h3" classes="text-white mb-2">
            Error Loading Draft Room
          </Text>
          <Text variant="body" classes="text-gray-400 mb-4">
            {error}
          </Text>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
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
          league={league}
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
          isAdmin={isCommissioner}
          teamNeedsList={teamNeedsList}
          league={SimNBA}
          currentPick={currentPick}
          currentRound={draftState.currentRound}
          pickNumber={draftState.currentPick}
          timeLeft={seconds}
          isPaused={draftState.isPaused}
        />
        <div className="flex flex-col gap-2">
          {activeTab !== BigBoard && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-2 h-full">
              <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
                <div className="flex-1">
                  <DraftClock
                    currentPick={currentPick}
                    currentRound={draftState.currentRound}
                    pickNumber={draftState.currentPick}
                    timeLeft={seconds}
                    isPaused={draftState.isPaused}
                    teamColors={teamColors}
                    league={league}
                  />
                </div>
                <div className="flex-1">
                  <DraftTicker
                    onPickClick={handlePlayerModal}
                    draftablePlayerMap={draftablePlayerMap}
                    recentPicks={recentPicks.map((pick) => ({ pick }))}
                    teamColors={teamColors}
                    backgroundColor={backgroundColor}
                    league={SimNBA}
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
                  league={league}
                />
              </div>
            </div>
          )}
          <div>
            {activeTab === DraftBoardStr && (
              <DraftBoard
                draftees={nbaDraftees as unknown as Draftee[]}
                draftedPlayerIds={draftedPlayerIds}
                scoutedPlayerIds={scoutedPlayerIds}
                onAddToScoutBoard={(player) =>
                  onAddToScoutBoard(player as unknown as NBADraftee)
                }
                onDraftPlayer={
                  isUserTurn
                    ? (player) => onDraftPlayer(player as unknown as NBADraftee)
                    : undefined
                }
                isUserTurn={isUserTurn}
                teamColors={teamColors}
                backgroundColor={backgroundColor}
                scoutingPoints={teamWarRoom?.ScoutingPoints || 0}
                spentPoints={teamWarRoom?.SpentPoints || 0}
                league={league}
                openModal={handlePlayerModal}
                exportDraftBoard={exportNBADraftees}
              />
            )}
            {activeTab === ScoutBoard && (
              <ScoutingBoard
                scoutProfiles={
                  teamScoutProfiles as unknown as CommonScoutingProfile[]
                }
                draftedPlayerIds={draftedPlayerIds}
                onRemoveFromBoard={(profile) =>
                  onRemoveFromScoutBoard(
                    profile as unknown as CommonScoutingProfile,
                  )
                }
                onDraftPlayer={
                  isUserTurn
                    ? (player) => onDraftPlayer(player as unknown as NBADraftee)
                    : undefined
                }
                onViewDetails={(profile) =>
                  onViewDetails(profile as unknown as CommonScoutingProfile)
                }
                onRevealAttribute={onRevealAttribute}
                handlePlayerModal={handlePlayerModal}
                isUserTurn={isUserTurn}
                teamColors={teamColors}
                backgroundColor={backgroundColor}
                teamScoutingPoints={teamWarRoom?.ScoutingPoints || 0}
                spentPoints={teamWarRoom?.SpentPoints || 0}
                league={league}
                draftablePlayerMap={draftablePlayerMap}
              />
            )}
            {activeTab === WarRoomBoard && (
              <>
                <DraftWarRoom
                  league={SimNBA}
                  backgroundColor={backgroundColor}
                  teamDraftPicks={teamDraftPicks as DraftPick[]}
                  selectedTeam={selectedTeam as NBATeam | null}
                  draftablePlayerMap={draftablePlayerMap}
                />
              </>
            )}
            {activeTab === BigBoard && (
              <>
                <BigDraftBoard
                  handlePlayerModal={handlePlayerModal}
                  draftPicks={draftPicksFromState as DraftPick[]}
                  selectedTeam={selectedTeam as NBATeam | null}
                  draftablePlayerMap={draftablePlayerMap}
                  league={SimNBA}
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
                  league={SimNBA}
                  backgroundColor={backgroundColor}
                  isDraftComplete={isDraftComplete}
                  teamOptions={nbaTeamOptions}
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
