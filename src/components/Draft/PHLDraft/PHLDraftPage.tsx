import { FC, useMemo } from "react";
import {
  DraftablePlayer,
  ProfessionalTeam as PHLTeam,
  ScoutingProfile,
} from "../../../models/hockeyModels";
import { Button, ButtonGrid, ButtonGroup } from "../../../_design/Buttons";
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
} from "../common";
import { PHL_PICKS_PER_ROUND, usePHLDraft } from "./usePHLDraft";
import { Border } from "../../../_design/Borders";
import { useAuthStore } from "../../../context/AuthContext";
import { SelectDropdown } from "../../../_design/Select";
import { ActionModal } from "../../Common/ActionModal";
import { DraftAdminBoard } from "../common/AdminBoard";

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
    formattedTime,
    isDraftComplete,
    togglePause,
    resetTimer,
    startDraft,
    seconds,
  } = usePHLDraft();

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
            {isAdmin && (
              <>
                <hr className="border-gray-700 my-2" />
                <div className="mt-2">
                  <Text variant="body" classes="text-gray-200">
                    Admin Controls
                  </Text>
                </div>
                <div className="mt-2">
                  <ButtonGrid>
                    <Button
                      variant={draftState.isPaused ? "primary" : "warning"}
                      onClick={togglePause}
                      size="xs"
                    >
                      Pause
                    </Button>
                    <Button variant="secondary" onClick={resetTimer} size="xs">
                      Reset
                    </Button>
                    <Button
                      variant={isDraftComplete ? "primary" : "secondary"}
                      onClick={handleExportDraftPicks}
                      size="xs"
                      disabled={!isDraftComplete}
                    >
                      Export
                    </Button>
                  </ButtonGrid>
                </div>
                <hr className="border-gray-700 my-2" />
                <div className="mt-2">
                  <Text variant="body" classes="text-gray-200">
                    Select Team
                  </Text>
                </div>
                <div className="mt-2">
                  <SelectDropdown
                    options={phlTeamOptions}
                    onChange={selectTeamOption}
                  />
                </div>
              </>
            )}
            <hr className="border-gray-700 my-2" />
            <div className="mt-2">
              <Text variant="body" classes="text-gray-200">
                Team Needs
              </Text>
            </div>
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
            <div className="mt-2">
              {teamNeedsList.map((need) => (
                <Text key={need} variant="xs" classes="text-gray-400">
                  {need}
                </Text>
              ))}
            </div>
          </Border>
        </div>
        <div className="flex flex-col gap-2">
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
                  recentPicks={recentPicks.map((pick) => ({ pick }))}
                  teamColors={teamColors}
                  backgroundColor={backgroundColor}
                  league={league}
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
                isUserTurn={isUserTurn}
                teamColors={teamColors}
                backgroundColor={backgroundColor}
                teamScoutingPoints={teamWarRoom?.ScoutingPoints || 0}
                spentPoints={teamWarRoom?.SpentPoints || 0}
                league={league}
                draftablePlayers={
                  proDraftablePlayers as unknown as CommonDraftee[]
                }
                offensiveSystemsInformation={offensiveSystemsInformation}
                defensiveSystemsInformation={defensiveSystemsInformation}
              />
            )}
            {activeTab === WarRoomBoard && <></>}
            {activeTab === BigBoard && <></>}
            {activeTab === AdminBoard && (
              <>
                <DraftAdminBoard
                  draftState={draftState}
                  resyncDraftData={resyncDraftData}
                  handleManualDraftStateUpdate={handleManualDraftStateUpdate}
                  league={SimPHL}
                  backgroundColor={backgroundColor}
                  formattedTime={formattedTime}
                  isDraftComplete={isDraftComplete}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
