import React, { useState, useEffect, useRef } from 'react';

// --- HELPER: Display Period Name ---
const getPeriodName = (p: number, isSO: boolean) => {
  if (isSO) return "SO";
  if (p === 4) return "OT";
  return `P${p}`;
};

const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- RESTORED COMPONENT: Side Column List (Upcoming/Results) ---
const GameMiniList = ({ title, games, color }: { title: string, games: any[], color: string }) => (
  <div className="flex flex-col h-full overflow-hidden px-2 py-4">
    <h3 className={`text-[1.8vh] font-black text-white mb-6 uppercase tracking-[0.2em] border-l-4 ${color} pl-3 text-left`}>
      {title}
    </h3>
    <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar">
      {games.length === 0 ? (
        <p className="text-tiny text-[var(--text-muted)] italic text-left opacity-40 px-3">No games found</p>
      ) : (
        games.map((game) => (
          <div key={game.GameID} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-3 shadow-sm hover:border-[var(--text-muted)] transition-colors text-left">
             <div className="flex justify-between text-[1vh] font-bold text-[var(--text-muted)] mb-1 uppercase">
                <span>{game.IsShootout ? 'SO' : game.Period === 4 ? 'OT' : game.GameComplete ? 'FINAL' : 'SCHEDULED'}</span>
                <span>ID: {game.GameID}</span>
             </div>
             <div className="flex justify-between items-center text-[1.4vh] font-black text-[var(--text-primary)]">
                <span>{game.HomeTeam}</span>
                <span className="text-[var(--text-muted)] font-normal px-2 text-[1vh]">@</span>
                <span>{game.AwayTeam}</span>
             </div>
             {game.GameComplete && (
                <div className="mt-1 text-right text-[1.6vh] font-mono font-bold text-[var(--accent-success)]">
                   {game.HomeTeamScore} - {game.AwayTeamScore}
                </div>
             )}
          </div>
        ))
      )}
    </div>
  </div>
);

// --- COMPONENT: Team Stats Sidebar (Specific Game View) ---
const TeamStatsSidebar = ({ title, teamName }: { title: string, teamName: string }) => {
  const SectionHeader = ({ label }: { label: string }) => (
    <div className="bg-[var(--bg-surface)] py-1 px-2 border-y border-[var(--border-primary)] mt-3 first:mt-0">
      <span className="text-[1vh] font-black text-[var(--text-muted)] uppercase tracking-tighter">{label}</span>
    </div>
  );

  const StatRow = ({ name, primary, secondary }: { name: string, primary: string, secondary: string }) => (
    <div className="flex justify-between items-center py-1.5 px-2 border-b border-[var(--border-primary)]/20 last:border-0 text-[1.1vh]">
      <span className="text-[var(--text-primary)] font-medium truncate w-24 text-left">{name}</span>
      <div className="flex gap-3 font-mono font-bold">
        <span className="text-[var(--text-primary)]">{primary}</span>
        <span className="text-[var(--text-muted)] w-4 text-right">{secondary}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg h-full flex flex-col shadow-sm overflow-hidden py-4">
      <div className="px-3 pb-3 border-b border-[var(--border-primary)]">
        <h3 className="text-[1.3vh] font-black text-white uppercase tracking-widest text-left">{title}</h3>
        <p className="text-[1vh] text-[var(--accent-error)] font-bold text-left uppercase">{teamName}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar">
        <SectionHeader label="Forwards" />
        <StatRow name="P. Bergeron" primary="1G 1A" secondary="+2" />
        <StatRow name="B. Marchand" primary="0G 2A" secondary="+1" />
        <SectionHeader label="Defenders" />
        <StatRow name="C. McAvoy" primary="0G 1A" secondary="+2" />
        <SectionHeader label="Goalies" />
        <StatRow name="L. Ullmark" primary="28/30" secondary="933" />
        <div className="mt-4 p-3 opacity-30 italic text-[1vh] text-center">Engine data pending...</div>
      </div>
    </div>
  );
};

// --- COMPONENT: The Ice Rink ---
const RinkVisualizer = ({ currentZone, goalScored }: { currentZone: number, goalScored: 'home' | 'away' | null }) => {
  const zones = [{ id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }];
  return (
    <div className="bg-[var(--bg-surface)] p-2 border-x border-b border-[var(--border-primary)] rounded-b-lg">
      <div className="flex w-full h-[32vh] border-2 border-gray-400 rounded-[3rem] overflow-hidden bg-white relative shadow-inner">
        {goalScored === 'home' && <div className="absolute left-0 top-0 bottom-0 w-24 bg-red-600/40 animate-pulse blur-xl z-20" />}
        {goalScored === 'away' && <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-600/40 animate-pulse blur-xl z-20" />}
        <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-red-600/20 transform -translate-x-1/2" />
        <div className="absolute top-0 bottom-0 left-[30%] w-1 bg-blue-600/20" />
        <div className="absolute top-0 bottom-0 right-[30%] w-1 bg-blue-600/20" />
        {zones.map((zone) => (
          <div key={zone.id} className={`flex-1 flex items-center justify-center z-10 ${currentZone === zone.id ? 'bg-yellow-400/10' : ''}`}>
            {currentZone === zone.id && <div className="w-[1.8vh] h-[1.8vh] bg-black rounded-full border-2 border-white animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const LiveRink = () => {
  const [games, setGames] = useState<Record<number, any>>({});
  const [feeds, setFeeds] = useState<Record<number, any[]>>({});
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [goalFlash, setGoalFlash] = useState<Record<number, 'home' | 'away' | null>>({});
  const prevScores = useRef<Record<number, { home: number, away: number, homeSO: number, awaySO: number }>>({});

  useEffect(() => {
    const dummyGames = {
      101: { GameID: 101, HomeTeam: "BOS", AwayTeam: "TOR", HomeTeamScore: 0, AwayTeamScore: 0, Period: 0, TimeOnClock: 1200, GameComplete: false, IsShootout: false },
      102: { GameID: 102, HomeTeam: "MTL", AwayTeam: "OTT", HomeTeamScore: 0, AwayTeamScore: 0, Period: 0, TimeOnClock: 1200, GameComplete: false, IsShootout: false },
      201: { GameID: 201, HomeTeam: "NYR", AwayTeam: "NYI", HomeTeamScore: 2, AwayTeamScore: 1, Period: 2, TimeOnClock: 450, Zone: 12, GameComplete: false, IsShootout: false },
      203: { GameID: 203, HomeTeam: "EDM", AwayTeam: "CAL", HomeTeamScore: 3, AwayTeamScore: 3, HomeTeamShootoutScore: 2, AwayTeamShootoutScore: 1, Period: 5, TimeOnClock: 0, Zone: 13, GameComplete: false, IsShootout: true },
      301: { GameID: 301, HomeTeam: "CHI", AwayTeam: "DET", HomeTeamScore: 5, AwayTeamScore: 2, Period: 3, TimeOnClock: 0, GameComplete: true, IsShootout: false }
    };
    setGames(dummyGames);
  }, []);

  const triggerGoal = (gameId: number, side: 'home' | 'away') => {
    setGoalFlash(prev => ({ ...prev, [gameId]: side }));
    setTimeout(() => setGoalFlash(prev => ({ ...prev, [gameId]: null })), 4000);
  };

  useEffect(() => {
    const source = new EventSource('http://localhost:8080/api/stream/live/chl');
    source.onmessage = (event: MessageEvent) => {
      try {
        const play = JSON.parse(event.data);
        const gId = play.GameID;
        const prev = prevScores.current[gId];
        if (prev) {
          if (play.HomeTeamScore > prev.home || (play.HomeTeamShootoutScore || 0) > prev.homeSO) triggerGoal(gId, 'home');
          if (play.AwayTeamScore > prev.away || (play.AwayTeamShootoutScore || 0) > prev.awaySO) triggerGoal(gId, 'away');
        }
        prevScores.current[gId] = { home: play.HomeTeamScore, away: play.AwayTeamScore, homeSO: play.HomeTeamShootoutScore || 0, awaySO: play.AwayTeamShootoutScore || 0 };
        setGames((prevG: any) => ({ ...prevG, [gId]: play }));
      } catch (err) { console.error(err); }
    };
    return () => source.close();
  }, []);

  const allGames = Object.values(games);
  const liveGames = allGames.filter(g => !g.GameComplete && g.Period > 0);
  const upcomingGames = allGames.filter(g => !g.GameComplete && g.Period === 0);
  const resultsGames = allGames.filter(g => g.GameComplete);

  if (selectedGameId === null) {
    return (
      <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden">
        <div className="flex-1 px-4 lg:px-8 pb-6 overflow-hidden">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
            <div className="lg:col-span-2 h-full border-r border-[var(--border-primary)]/40 pr-4">
              <GameMiniList title="Upcoming" games={upcomingGames} color="border-blue-500" />
            </div>
            <div className="col-span-1 lg:col-span-8 flex flex-col h-full px-6">
              <h1 className="text-[2.5vh] font-black text-white mb-6 uppercase tracking-[0.4em] text-center flex items-center justify-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span> Live Hockey Hub
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 scrollbar max-h-full pb-10">
                {liveGames.map((game: any) => {
                  const isGoal = goalFlash[game.GameID];
                  return (
                    <div key={game.GameID} onClick={() => setSelectedGameId(game.GameID)} 
                      className={`relative border rounded-lg p-6 cursor-pointer transition-all duration-300 min-h-[14vh] flex flex-col justify-center shadow-lg
                        ${isGoal ? 'bg-red-700 border-white scale-[1.02] shadow-[0_0_40px_rgba(239,68,68,0.6)] z-10' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--accent-error)]'}`}>
                      {isGoal && <div className="absolute inset-0 flex items-center justify-center bg-red-700 z-20 rounded-lg"><span className="text-white font-black text-[4vh] italic animate-bounce">GOAL!</span></div>}
                      <div className="text-[1.1vh] text-[var(--text-muted)] font-bold mb-3 text-left uppercase flex justify-between border-b border-[var(--border-primary)]/30 pb-2">
                         <span>{getPeriodName(game.Period, game.IsShootout)} | {game.IsShootout ? 'SHOOTOUT' : formatClock(game.TimeOnClock)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[2.8vh] font-black text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                            <span>{game.HomeTeam} {game.HomeTeamScore}</span>
                            {game.IsShootout && <span className="text-[1.8vh] text-[var(--accent-warning)]">({game.HomeTeamShootoutScore})</span>}
                        </div>
                        <span className="text-[var(--text-muted)] text-[1.4vh] font-normal italic px-4 opacity-40">VS</span>
                        <div className="flex items-center gap-2">
                            {game.IsShootout && <span className="text-[1.8vh] text-[var(--accent-warning)]">({game.AwayTeamShootoutScore})</span>}
                            <span>{game.AwayTeamScore} {game.AwayTeam}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-2 h-full border-l border-[var(--border-primary)]/40 pl-4">
              <GameMiniList title="Results" games={resultsGames} color="border-[var(--accent-success)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeGame = games[selectedGameId];
  const activeFeed = feeds[selectedGameId] || [];
  const activeGoal = goalFlash[selectedGameId];

  return (
    <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden">
      <div className="flex-1 px-4 lg:px-8 pb-4 flex justify-center overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
          <div className="hidden lg:block lg:col-span-2 h-full">
            <TeamStatsSidebar title="Home Team Stats" teamName={activeGame?.HomeTeam || "Home"} />
          </div>
          <div className="col-span-1 lg:col-span-8 flex flex-col h-full overflow-hidden">
            <button onClick={() => setSelectedGameId(null)} className="text-tiny text-[var(--text-muted)] hover:text-white uppercase font-bold mb-2 text-left transition-colors">← ALL GAMES</button>
            <div className={`border rounded-t-lg p-4 flex justify-between items-center relative overflow-hidden transition-all duration-500 shadow-xl ${activeGoal ? 'bg-red-800 border-white' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'}`}>
              <div className="text-center w-1/3">
                <h2 className={`text-tiny font-bold uppercase mb-1 ${activeGoal ? 'text-white' : 'text-[var(--text-muted)]'}`}>Home</h2>
                <div className="flex items-center justify-center gap-2 text-white">
                    <p className="text-[5.5vh] font-black leading-none">{activeGame?.HomeTeamScore || 0}</p>
                    {activeGame?.IsShootout && <span className="text-[2.2vh] font-bold text-[var(--accent-warning)] animate-pulse">({activeGame.HomeTeamShootoutScore})</span>}
                </div>
              </div>
              <div className={`text-center border-x px-8 ${activeGoal ? 'border-red-400' : 'border-[var(--border-secondary)]'}`}>
                <span className={`text-[1.2vh] font-bold uppercase block mb-1 tracking-widest ${activeGoal ? 'text-white' : 'text-red-600'}`}>
                    {getPeriodName(activeGame?.Period, activeGame?.IsShootout)}
                </span>
                <span className={`text-[4.5vh] font-mono font-bold italic leading-none ${activeGoal ? 'text-white' : 'text-white'}`}>
                    {activeGame?.IsShootout ? '--' : formatClock(activeGame?.TimeOnClock || 1200)}
                </span>
              </div>
              <div className="text-center w-1/3">
                <h2 className={`text-tiny font-bold uppercase mb-1 ${activeGoal ? 'text-white' : 'text-[var(--text-muted)]'}`}>Away</h2>
                <div className="flex items-center justify-center gap-2 text-white">
                    {activeGame?.IsShootout && <span className="text-[2.2vh] font-bold text-[var(--accent-warning)] animate-pulse">({activeGame.AwayTeamShootoutScore})</span>}
                    <p className="text-[5.5vh] font-black leading-none">{activeGame?.AwayTeamScore || 0}</p>
                </div>
              </div>
            </div>
            <RinkVisualizer currentZone={activeGame?.Zone || 11} goalScored={activeGoal} />
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg mt-4 p-5 flex-1 flex flex-col min-h-0 shadow-lg">
              <h3 className="text-tiny font-black text-[var(--text-muted)] mb-3 uppercase tracking-[0.2em] text-left border-b border-[var(--border-primary)]/30 pb-2">Live Play-By-Play</h3>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar">
                {activeFeed.map((play, idx) => (
                  <div key={idx} className="border-b border-[var(--border-primary)]/20 pb-2 text-[1.4vh] flex gap-4 text-left py-2 hover:bg-white/5 px-2 rounded transition-colors">
                    <span className="text-red-600 font-bold font-mono whitespace-nowrap">[{formatClock(play.TimeOnClock)}]</span>
                    <span className="text-[var(--text-secondary)] font-medium leading-tight">{play.PlayText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-2 h-full">
            <TeamStatsSidebar title="Away Team Stats" teamName={activeGame?.AwayTeam || "Away"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRink;