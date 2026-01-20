import { FC } from "react";
import {
  DraftablePlayer,
  ProfessionalTeam as PHLTeam,
  ScoutingProfile
} from "../../../models/hockeyModels";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { League } from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import {
  DraftClock,
  DraftTicker,
  UpcomingPicks,
  DraftBoard,
  ScoutingBoard,
  ScoutingProfile as CommonScoutingProfile,
  Draftee as CommonDraftee
} from '../common';
import { usePHLDraft } from './usePHLDraft';

interface PHLDraftPageProps {
  league: League;
  team: PHLTeam;
}

export const PHLDraftPage: FC<PHLDraftPageProps> = ({ team, league }) => {
  const {
    proDraftablePlayers,
    phlScoutProfiles,
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
    handleViewScoutDetails
  } = usePHLDraft();

  const rawTeamColors = useTeamColors(team?.ColorOne, team?.ColorTwo);
  const teamColors = {
    primary: rawTeamColors.One,
    secondary: rawTeamColors.Two
  };
  const backgroundColor = "#1f2937";

  const onAddToScoutBoard = async (player: DraftablePlayer) => {
    await handleAddToScoutBoard(player);
  };

  const onRemoveFromScoutBoard = async (profile: ScoutingProfile) => {
    await handleRemoveFromScoutBoard(profile);
  };

  const onRevealAttribute = async (profileId: number, attribute: string, points: number) => {
    await handleRevealAttribute(profileId, attribute, points);
  };

  const onViewDetails = (profile: ScoutingProfile) => {
    handleViewScoutDetails(profile);
  };

  const onDraftPlayer = async (player: DraftablePlayer) => {
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
          <Text variant="h3" classes="text-white">Loading Draft Room...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">!</div>
          <Text variant="h3" classes="text-white mb-2">Error Loading Draft Room</Text>
          <Text variant="body" classes="text-gray-400 mb-4">{error}</Text>
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
    <div className="max-w-[95vw] sm:max-w-full">
      <div className="mb-6 space-y-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
            <div className="flex-1">
              <DraftClock
                currentPick={currentPick}
                currentRound={draftState.currentRound}
                pickNumber={draftState.currentPickNumber}
                timeLeft={draftState.timeLeft}
                isPaused={draftState.isPaused}
                teamColors={teamColors}
                league={league}
              />
            </div>
            <div className="flex-1">
              <DraftTicker
                recentPicks={recentPicks.map(pick => ({ pick }))}
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
              userTeamId={team.ID}
              teamColors={teamColors}
              backgroundColor={backgroundColor}
              league={league}
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <ButtonGroup>
          <Button
            variant={activeTab === 'board' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('board')}
          >
            Draft Board
          </Button>
          <Button
            variant={activeTab === 'scout' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('scout')}
          >
            Scouting Board
          </Button>
        </ButtonGroup>
      </div>
      <div>
        {activeTab === 'board' && (
          <DraftBoard
            draftees={proDraftablePlayers as unknown as CommonDraftee[]}
            draftedPlayerIds={draftedPlayerIds}
            scoutedPlayerIds={scoutedPlayerIds}
            onAddToScoutBoard={(player) => onAddToScoutBoard(player as unknown as DraftablePlayer)}
            onDraftPlayer={isUserTurn ? (player) => onDraftPlayer(player as unknown as DraftablePlayer) : undefined}
            isUserTurn={isUserTurn}
            teamColors={teamColors}
            backgroundColor={backgroundColor}
            scoutingPoints={teamWarRoom?.ScoutingPoints || 0}
            spentPoints={teamWarRoom?.SpentPoints || 0}
            league={league}
          />
        )}
        {activeTab === 'scout' && (
          <ScoutingBoard
            scoutProfiles={phlScoutProfiles as unknown as CommonScoutingProfile[]}
            draftedPlayerIds={draftedPlayerIds}
            onRemoveFromBoard={(profile) => onRemoveFromScoutBoard(profile as unknown as ScoutingProfile)}
            onDraftPlayer={isUserTurn ? (player) => onDraftPlayer(player as unknown as DraftablePlayer) : undefined}
            onViewDetails={(profile) => onViewDetails(profile as unknown as ScoutingProfile)}
            onRevealAttribute={onRevealAttribute}
            isUserTurn={isUserTurn}
            teamColors={teamColors}
            backgroundColor={backgroundColor}
            teamScoutingPoints={teamWarRoom?.ScoutingPoints || 0}
            spentPoints={teamWarRoom?.SpentPoints || 0}
            league={league}
            draftablePlayers={proDraftablePlayers as unknown as CommonDraftee[]}
          />
        )}
      </div>
    </div>
  );
};
