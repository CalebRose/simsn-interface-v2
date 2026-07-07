import React, { useState } from 'react';
import { useLeagueStore } from '../../../context/LeagueContext';
import { useAuthStore } from '../../../context/AuthContext';
import { SimCFB, SimNFL, League } from '../../../_constants/constants';
import { PillButton } from '../../../_design/Buttons';
import { useLiveFieldState } from '../../../_hooks/useLiveFieldState';
import { GridironVisualizer } from './GridironVisualizer';
import { TeamStatsSidebar } from './TeamStatsSidebar';

const getBallCoordinates = (play: any) => {
  const yardLine = play.YardLine || 50;
  return { x: yardLine, y: 50 };
};

const LiveField: React.FC = () => {
  const { currentUser, isModerator } = useAuthStore();
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const { liveGames, isLoading } = useLiveFieldState(selectedLeague as League);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Cast to 'any' here allows us to bypass the strict type check
  const activeGame = liveGames.find((g) => g.GameID === selectedGameId) as any;

  return (
    <div className="h-screen w-full bg-(--bg-primary) pt-[calc(8vh+10px)] flex flex-col p-8">
      {selectedGameId && activeGame ? (
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-10 flex flex-col gap-6">
            <button
              onClick={() => setSelectedGameId(null)}
              className="text-white underline w-fit"
            >
              ← Back to Hub
            </button>

            {(() => {
              // Access CurrentPlay safely using the casted activeGame
              const activePlay = activeGame?.CurrentPlay || {
                Type: 'IDLE',
                YardLine: 50,
                Description: 'Waiting for snap...',
              };
              const ballCoordinates = getBallCoordinates(activePlay);

              return (
                <GridironVisualizer
                  ballX={ballCoordinates.x}
                  ballY={ballCoordinates.y}
                  playType={activePlay.Type}
                  eventText={activePlay.Description}
                />
              );
            })()}
          </div>
          
          <div className="col-span-2">
            <TeamStatsSidebar
              title="Stats"
              teamName={activeGame.HomeTeam}
              stats={null}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <PillButton
              isSelected={selectedLeague === SimCFB}
              onClick={() => setSelectedLeague(SimCFB as League)}
            >
              CFB
            </PillButton>
            <PillButton
              isSelected={selectedLeague === SimNFL}
              onClick={() => setSelectedLeague(SimNFL as League)}
            >
              NFL
            </PillButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {liveGames.map((game) => (
              <div
                key={game.GameID}
                onClick={() => setSelectedGameId(game.GameID)}
                className="p-6 bg-(--bg-secondary) border border-white/10 rounded-lg cursor-pointer hover:border-yellow-500 transition-all text-white"
              >
                <div className="font-bold">
                  {game.AwayTeam} @ {game.HomeTeam}
                </div>
                <div className="text-sm text-gray-400">
                  Game ID: {game.GameID}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveField;