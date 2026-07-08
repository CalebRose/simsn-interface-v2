import React, { useState } from 'react';
import { useLeagueStore } from '../../../context/LeagueContext';
import { useAuthStore } from '../../../context/AuthContext';
import { SimCFB, SimNFL, League } from '../../../_constants/constants';
import { PillButton } from '../../../_design/Buttons';
import { useLiveFieldState } from '../../../_hooks/useLiveFieldState';
import { GridironVisualizer } from './GridironVisualizer';
import { TeamStatsSidebar } from './TeamStatsSidebar';

const LiveField: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const { liveGames } = useLiveFieldState(selectedLeague as League);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Cast to 'any' to bypass interface checks for CurrentPlay
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

            {/* Main Visualizer Dashboard */}
            <div className="bg-(--bg-secondary) rounded-lg border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-black/40 p-6 flex justify-between items-center border-b border-white/10">
                <div className="text-left">
                  <h2 className="text-white font-bold">{activeGame.AwayTeam}</h2>
                  <span className="text-4xl font-black text-white">{activeGame.AwayTeamScore || 0}</span>
                </div>
                <div className="text-center px-8 border-x border-white/10">
                  <div className="text-sm font-bold text-yellow-500 uppercase">Q{activeGame.Quarter || 1}</div>
                  <div className="text-2xl font-mono text-white">{activeGame.TimeRemaining || "15:00"}</div>
                </div>
                <div className="text-right">
                  <h2 className="text-white font-bold">{activeGame.HomeTeam}</h2>
                  <span className="text-4xl font-black text-white">{activeGame.HomeTeamScore || 0}</span>
                </div>
              </div>

              <GridironVisualizer 
               ballX={activeGame.CurrentPlay?.YardLine || 50} 
               playType={activeGame.CurrentPlay?.Type || 'IDLE'} 
               homeName={activeGame.HomeTeam || "HOME TEAM"}  // Fallback
               awayName={activeGame.AwayTeam || "AWAY TEAM"}  // Fallback
              />

              <div className="bg-black/60 p-4 border-t border-white/10">
                <div className="flex gap-4 text-xs font-mono text-gray-400 mb-2">
                  <span>LOS: {activeGame.CurrentPlay?.YardLine || 50}</span>
                  <span>{activeGame.CurrentPlay?.Type || 'IDLE'}</span>
                </div>
                <div className="text-white font-medium text-lg leading-tight">
                  {activeGame.CurrentPlay?.Description || "Waiting for snap..."}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <TeamStatsSidebar title="Stats" teamName={activeGame.HomeTeam} stats={null} />
          </div>
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <PillButton isSelected={selectedLeague === SimCFB} onClick={() => setSelectedLeague(SimCFB as League)}>CFB</PillButton>
            <PillButton isSelected={selectedLeague === SimNFL} onClick={() => setSelectedLeague(SimNFL as League)}>NFL</PillButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {liveGames.map((game) => (
              <div
                key={game.GameID}
                onClick={() => setSelectedGameId(game.GameID)}
                className="p-6 bg-(--bg-secondary) border border-white/10 rounded-lg cursor-pointer hover:border-yellow-500 transition-all text-white"
              >
                <div className="font-bold">{game.AwayTeam} @ {game.HomeTeam}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// THIS WAS THE MISSING PIECE:
export default LiveField;