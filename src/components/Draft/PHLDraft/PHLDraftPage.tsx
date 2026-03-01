import { FC, useMemo } from "react";
import {
  DraftablePlayer,
  ProfessionalTeam as PHLTeam,
  ProfessionalPlayer,
  ProfessionalTeam,
  ScoutingProfile,
} from "../../../models/hockeyModels";
import {
  AdminBoard,
  BigBoard,
  DraftBoardStr,
  League,
  ScoutBoard,
  SimPHL,
  WarRoomBoard,
} from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import {
  DraftClock,
  DraftTicker,
  UpcomingPicks,
  DraftBoard,
  ScoutingBoard,
  ScoutingProfile as CommonScoutingProfile,
  Draftee as CommonDraftee,
  DraftPick,
} from "../common";
import { usePHLDraft } from "./usePHLDraft";
import { useAuthStore } from "../../../context/AuthContext";
import { ActionModal } from "../../Common/ActionModal";
import { DraftAdminBoard } from "../common/AdminBoard";
import { DraftSidebar } from "../common/DraftSidebar";
import { DraftWarRoom } from "../common/WarRoom";
import { BigDraftBoard } from "../common/BigBoard";
import { useModal } from "../../../_hooks/useModal";
import ProposeDraftTradeModal from "../common/ProposeDraftTradeModal";
import { getSecondsByRound } from "./utils/draftHelpers";

interface PHLDraftPageProps {
  league: League;
}

export const PHLDraftPage: FC<PHLDraftPageProps> = ({ league }) => {
  const { currentUser } = useAuthStore();
  const {
    proDraftablePlayers,
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
    phlTeamOptions,
    teamNeedsList,
    offensiveSystemsInformation,
    defensiveSystemsInformation,
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
    userTeam,
    tradePartnerTeam,
    selectTradePartner,
    teamOptions,
    userTradablePlayers,
    userTradablePicks,
    partnerTradablePlayers,
    partnerTradablePicks,
    userTradeProposals,
    userWarRoomData,
    approvedRequests,
    proposeTrade,
    acceptTrade,
    rejectTrade,
    vetoTrade,
    handleProcessTrade,
  } = usePHLDraft();

  const proposeTradeModal = useModal();
  const receiveTradeModal = useModal();
  const adminProposalsModal = useModal();

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

  const onAddToScoutBoard = async (player: DraftablePlayer) => {
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

  const onDraftPlayer = async (player: DraftablePlayer) => {
    // Logic to draft player from the current pick
    const draftPickMap = { ...draftState.allDraftPicks };
    const roundKey = draftState.currentRound;
    const picksInRound = draftPickMap[roundKey] || [];
    if (picksInRound.length === 0) return; // No picks in this round
    const currentPickIndex = picksInRound.findIndex(
      (pick) => pick.DraftNumber === draftState.currentPick,
    );
    console.log({
      roundKey,
      picksInRound,
      draftPickMap,
      draftState,
      currentPickIndex,
    });
    if (currentPickIndex === -1) return; // Pick not found
    draftPickMap[roundKey][currentPickIndex].DrafteeID = player.ID;
    const newDraftState = draftState;
    newDraftState.advanceToNextPick();
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
      <ProposeDraftTradeModal
        isOpen={proposeTradeModal.isModalOpen}
        onClose={proposeTradeModal.handleCloseModal}
        userTeam={userTeam as ProfessionalTeam}
        tradePartnerTeam={tradePartnerTeam as ProfessionalTeam}
        league={SimPHL}
        teamOptions={phlTeamOptions}
        selectTradePartner={selectTradePartner}
        userTradablePlayers={userTradablePlayers as ProfessionalPlayer[]}
        userTradablePicks={teamDraftPicks}
        partnerTradablePlayers={partnerTradablePlayers as ProfessionalPlayer[]}
        partnerTradablePicks={partnerTradablePicks as DraftPick[]}
        proposeTrade={proposeTrade}
        backgroundColor={backgroundColor}
        borderColor={teamColors?.secondary}
      />
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
          isAdmin={isAdmin}
          offensiveSystem={offensiveSystem}
          defensiveSystem={defensiveSystem}
          teamNeedsList={teamNeedsList}
          league={SimPHL}
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
                    league={SimPHL}
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
                draftees={proDraftablePlayers as unknown as CommonDraftee[]}
                draftedPlayerIds={draftedPlayerIds}
                scoutedPlayerIds={scoutedPlayerIds}
                onAddToScoutBoard={(player) =>
                  onAddToScoutBoard(player as unknown as DraftablePlayer)
                }
                onDraftPlayer={
                  isUserTurn
                    ? (player) =>
                        onDraftPlayer(player as unknown as DraftablePlayer)
                    : undefined
                }
                isUserTurn={isUserTurn}
                teamColors={teamColors}
                backgroundColor={backgroundColor}
                scoutingPoints={teamWarRoom?.ScoutingPoints || 0}
                spentPoints={teamWarRoom?.SpentPoints || 0}
                league={league}
                openModal={handlePlayerModal}
                offensiveSystemsInformation={offensiveSystemsInformation}
                defensiveSystemsInformation={defensiveSystemsInformation}
              />
            )}
            {activeTab === ScoutBoard && (
              <ScoutingBoard
                scoutProfiles={
                  teamScoutProfiles as unknown as CommonScoutingProfile[]
                }
                draftedPlayerIds={draftedPlayerIds}
                onRemoveFromBoard={(profile) =>
                  onRemoveFromScoutBoard(profile as unknown as ScoutingProfile)
                }
                onDraftPlayer={
                  isUserTurn
                    ? (player) =>
                        onDraftPlayer(player as unknown as DraftablePlayer)
                    : undefined
                }
                onViewDetails={(profile) =>
                  onViewDetails(profile as unknown as ScoutingProfile)
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
                offensiveSystemsInformation={offensiveSystemsInformation}
                defensiveSystemsInformation={defensiveSystemsInformation}
              />
            )}
            {activeTab === WarRoomBoard && (
              <>
                <DraftWarRoom
                  league={SimPHL}
                  backgroundColor={backgroundColor}
                  teamDraftPicks={teamDraftPicks as DraftPick[]}
                  selectedTeam={selectedTeam as PHLTeam | null}
                  draftablePlayerMap={draftablePlayerMap}
                  handleOpenProposeTradeModal={
                    proposeTradeModal.handleOpenModal
                  }
                  handleOpenReceiveTradeModal={
                    receiveTradeModal.handleOpenModal
                  }
                />
              </>
            )}
            {activeTab === BigBoard && (
              <>
                <BigDraftBoard
                  handlePlayerModal={handlePlayerModal}
                  draftPicks={draftPicksFromState as DraftPick[]}
                  selectedTeam={selectedTeam as PHLTeam | null}
                  draftablePlayerMap={draftablePlayerMap}
                  league={SimPHL}
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
                  league={SimPHL}
                  backgroundColor={backgroundColor}
                  isDraftComplete={isDraftComplete}
                  teamOptions={phlTeamOptions}
                  selectTeamOption={selectTeamOption}
                  resetTimer={resetTimer}
                  startDraft={startDraft}
                  pauseDraft={togglePause}
                  handleExportDraft={handleExportDraftPicks}
                  handleOpenAdminProposalsModal={
                    adminProposalsModal.handleOpenModal
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
