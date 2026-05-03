import React, { useState, useEffect, useRef } from 'react';

// --- HELPER: Display Period Name ---
const getPeriodName = (p: number, isSO: boolean) => {
  if (isSO || p === 5) return "SO";
  if (p === 4) return "OT";
  if (p === 0) return "1st"; // Default for scheduled
  return `P${p}`;
};

const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- COMPONENT: Side Column List (Upcoming/Results) ---
const GameMiniList = ({ title, games, color, onSelect }: { title: string, games: any[], color: string, onSelect: (id: number) => void }) => (
  <div className="flex flex-col h-full min-h-0 py-2">
    <h3 className={`text-[1.8vh] font-black text-white mb-4 uppercase tracking-[0.2em] border-l-4 ${color} pl-3 text-left shrink-0`}>
      {title} <span className="text-[var(--text-muted)] text-[1.4vh]">({games.length})</span>
    </h3>
    
    <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-4">
      {games.length === 0 ? (
        <p className="text-tiny text-[var(--text-muted)] italic text-left opacity-40 px-3">No games found.</p>
      ) : (
        games.map((game) => (
          <div 
            key={game.GameID} 
            onClick={() => onSelect(game.GameID)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-3 shadow-sm hover:border-[var(--text-muted)] hover:bg-white/5 transition-all text-left cursor-pointer shrink-0"
          >
             <div className="flex justify-between text-[1vh] font-bold text-[var(--text-muted)] mb-1 uppercase">
                <span>{game.IsShootout || game.Period === 5 ? 'SO' : game.Period === 4 ? 'OT' : game.GameComplete ? 'FINAL' : 'SCHEDULED'}</span>
                <span>ID: {game.GameID}</span>
             </div>
             <div className="flex justify-between items-center text-[1.4vh] font-black text-[var(--text-primary)]">
                <span>{game.HomeTeam}</span>
                <span className="text-[var(--text-muted)] font-normal px-2 text-[1vh]">@</span>
                <span>{game.AwayTeam}</span>
             </div>
             {game.GameComplete && (
                <div className="mt-1 text-right text-[1.6vh] font-mono font-bold text-[var(--accent-success)]">
                   {game.HomeTeamScore} {game.HomeTeamShootoutScore > 0 || game.AwayTeamShootoutScore > 0 ? `(${game.HomeTeamShootoutScore})` : ''} 
                   {" - "} 
                   {game.AwayTeamScore} {game.HomeTeamShootoutScore > 0 || game.AwayTeamShootoutScore > 0 ? `(${game.AwayTeamShootoutScore})` : ''}
                </div>
             )}
          </div>
        ))
      )}
    </div>
  </div>
);

// --- COMPONENT: Team Stats Sidebar (Specific Game View) ---
const TeamStatsSidebar = ({ title, teamName, stats }: { title: string, teamName: string, stats: any }) => {
  const SectionHeader = ({ label }: { label: string }) => (
    <div className="bg-[var(--bg-surface)] py-1 px-2 border-y border-[var(--border-primary)] mt-3 first:mt-0 shrink-0">
      <span className="text-[1vh] font-black text-[var(--text-muted)] uppercase tracking-tighter">{label}</span>
    </div>
  );

  const StatRow = ({ name, primary, secondary }: { name: string, primary: string, secondary: string | number }) => (
    <div className="flex justify-between items-center py-1.5 px-2 border-b border-[var(--border-primary)]/20 last:border-0 text-[1.1vh] shrink-0">
      <span className="text-[var(--text-primary)] font-medium truncate w-24 text-left">{name}</span>
      <div className="flex gap-3 font-mono font-bold">
        <span className="text-[var(--text-primary)]">{primary}</span>
        <span className="text-[var(--text-muted)] w-6 text-right">{secondary}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg h-full flex flex-col min-h-0 shadow-sm overflow-hidden py-4">
      <div className="px-3 pb-3 border-b border-[var(--border-primary)] shrink-0">
        <h3 className="text-[1.3vh] font-black text-white uppercase tracking-widest text-left">{title}</h3>
        <p className="text-[1vh] text-[var(--accent-error)] font-bold text-left uppercase">{teamName}</p>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar pb-4">
        {!stats ? (
           <div className="mt-4 p-3 opacity-30 italic text-[1vh] text-center">Loading Box Score...</div>
        ) : (
          <>
            <SectionHeader label="Forwards" />
            {stats.Forwards?.length === 0 && <p className="text-[1vh] text-center opacity-30 py-2">No stats available.</p>}
            {stats.Forwards?.map((p: any, i: number) => (
                <StatRow key={`f-${i}`} name={p.Name} primary={`${p.Goals}G ${p.Assists}A`} secondary={p.PlusMinus > 0 ? `+${p.PlusMinus}` : p.PlusMinus} />
            ))}
            
            <SectionHeader label="Defenders" />
            {stats.Defenders?.length === 0 && <p className="text-[1vh] text-center opacity-30 py-2">No stats available.</p>}
            {stats.Defenders?.map((p: any, i: number) => (
                <StatRow key={`d-${i}`} name={p.Name} primary={`${p.Goals}G ${p.Assists}A`} secondary={p.PlusMinus > 0 ? `+${p.PlusMinus}` : p.PlusMinus} />
            ))}
            
            <SectionHeader label="Goalies" />
            {stats.Goalies?.length === 0 && <p className="text-[1vh] text-center opacity-30 py-2">No stats available.</p>}
            {stats.Goalies?.length > 0 && (
              <div className="bg-[var(--bg-surface)]/30 pb-1">
                  <div className="flex justify-between text-[1vh] font-bold text-[var(--text-muted)] uppercase px-2 pt-2">
                      <span>Player</span>
                      <div className="flex gap-3"><span className="w-10 text-right">Svs/SA</span><span className="w-6 text-right">SV%</span></div>
                  </div>
                  {stats.Goalies?.map((g: any, i: number) => (
                      <StatRow key={`g-${i}`} name={g.Name} primary={`${g.Saves}/${g.ShotsAgainst}`} secondary={g.SavePercentage.toFixed(3).replace('0.', '.')} />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: The Ice Rink ---
const RinkVisualizer = ({ currentZone, goalScored }: { currentZone: number, goalScored: 'home' | 'away' | null }) => {
  const zones = [{ id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }];
  return (
    <div className="bg-[var(--bg-surface)] p-2 border-x border-b border-[var(--border-primary)] rounded-b-lg shrink-0">
      <div className="flex w-full h-[25vh] lg:h-[32vh] border-2 border-gray-400 rounded-[3rem] overflow-hidden bg-white relative shadow-inner">
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
  const [gameDetails, setGameDetails] = useState<any>(null); 
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [goalFlash, setGoalFlash] = useState<Record<number, 'home' | 'away' | null>>({});
  
  // Spoofing State
  const [isSpoofing, setIsSpoofing] = useState(false);
  const [spoofLoading, setSpoofLoading] = useState(false);
  const targetGamesRef = useRef<Record<number, any>>({});
  const bulkPlaysRef = useRef<Record<number, any[]>>({}); // Holds ALL plays for ALL games
  const currentPlaysRef = useRef<Record<number, any[]>>({}); // Holds plays that have "happened" so far in spoof
  
  const prevScores = useRef<Record<number, { home: number, away: number, homeSO: number, awaySO: number }>>({});

  const MAX_CONCURRENT_GAMES = 8; 
  const CLOCK_TICK_SECONDS = 1; // 1 second of game time per tick
  const TICK_SPEED_MS = 250; // How fast real-time passes (e.g. 250ms = 4x speed)

  // 1. Fetch Hub Data on Load
  useEffect(() => {
    fetch('http://localhost:8080/api/games/live/chl?week=2606B')
      .then(res => res.json())
      .then(data => {
         if (data && Object.keys(data).length > 0) {
            setGames(data);
         }
      })
      .catch(err => console.error("Error fetching live games:", err));
  }, []);

  // 2. Fetch Specific Game Details on Click (Only if NOT spoofing)
  useEffect(() => {
    if (selectedGameId !== null && !isSpoofing) {
      setGameDetails(null); 
      fetch(`http://localhost:8080/api/games/details/chl/${selectedGameId}`)
        .then(res => res.json())
        .then(data => setGameDetails(data))
        .catch(err => console.error("Error fetching game details:", err));
    } else if (selectedGameId !== null && isSpoofing) {
        // If spoofing, build a fake details object using the currentPlaysRef!
        setGameDetails({
            Feeds: currentPlaysRef.current[selectedGameId] || [],
            HomeStats: null, // Stats won't load dynamically during spoofing yet
            AwayStats: null
        });
    }
  }, [selectedGameId, isSpoofing]);

  const triggerGoal = (gameId: number, side: 'home' | 'away') => {
    setGoalFlash(prev => ({ ...prev, [gameId]: side }));
    setTimeout(() => setGoalFlash(prev => ({ ...prev, [gameId]: null })), 4000);
  };

  // --- REPLAY ENGINE LOGIC ---
  const startSpoofLive = async () => {
    if (Object.keys(games).length === 0) return;
    setSpoofLoading(true);
    
    // Fetch ALL plays for this week
    try {
        const res = await fetch('http://localhost:8080/api/games/plays/bulk/chl?week=2606B');
        const bulkData = await res.json();
        
        // Reverse the arrays so period 1, time 1200 is at the END (we will pop() off them)
        Object.keys(bulkData).forEach(gId => {
             // Assuming DB returns them chronological (or reverse). Let's sort to be safe:
             // We want the EARLIEST plays at the END of the array so we can pop()
             bulkData[gId].sort((a: any, b: any) => {
                 if (a.Period !== b.Period) return b.Period - a.Period; // Period 3 before Period 1
                 return a.TimeOnClock - b.TimeOnClock; // Time 0 before Time 1200
             });
        });
        
        bulkPlaysRef.current = bulkData;
    } catch (e) {
        console.error("Failed to load bulk plays", e);
        setSpoofLoading(false);
        return;
    }

    // 1. Save the historical "Final" targets
    targetGamesRef.current = JSON.parse(JSON.stringify(games));
    
    // 2. Reset the board to 0-0, queueing them up.
    const resetGames: Record<number, any> = {};
    let count = 0;
    
    Object.values(games).forEach((g: any) => {
        const isInitialLive = count < MAX_CONCURRENT_GAMES;
        resetGames[g.GameID] = {
            ...g,
            HomeTeamScore: 0,
            AwayTeamScore: 0,
            HomeTeamShootoutScore: 0,
            AwayTeamShootoutScore: 0,
            Period: isInitialLive ? 1 : 0, 
            TimeOnClock: 1200,
            GameComplete: false,
            IsShootout: false
        };
        currentPlaysRef.current[g.GameID] = []; // Reset visual ticker
        count++;
    });
    
    setGames(resetGames);
    setSpoofLoading(false);
    setIsSpoofing(true);
  };

  useEffect(() => {
    if (!isSpoofing) return;

    const interval = setInterval(() => {
        setGames(prevGames => {
            const newGames = { ...prevGames };
            let activeCount = 0;
            let upcomingIds: number[] = [];

            // Pass 1: Count active games and gather upcoming queue
            Object.values(newGames).forEach((g: any) => {
                if (!g.GameComplete && g.Period > 0) activeCount++;
                if (!g.GameComplete && g.Period === 0) upcomingIds.push(g.GameID);
            });

            // Pass 2: If we have room, activate upcoming games!
            while (activeCount < MAX_CONCURRENT_GAMES && upcomingIds.length > 0) {
                const nextId = upcomingIds.shift();
                if (nextId) {
                    newGames[nextId].Period = 1; 
                    newGames[nextId].TimeOnClock = 1200;
                    activeCount++;
                }
            }

            let anyActive = false;

            // Pass 3: Tick all currently live games
            Object.values(newGames).forEach((g: any) => {
                if (g.GameComplete || g.Period === 0) return;
                anyActive = true;

                // 1. Tick Clock
                g.TimeOnClock -= CLOCK_TICK_SECONDS;
                if (g.TimeOnClock < 0) g.TimeOnClock = 0;
                
                // Random zone movement for visuals
                g.Zone = [9, 10, 11, 12, 13][Math.floor(Math.random() * 5)];

                const playsToProcess = bulkPlaysRef.current[g.GameID] || [];
                
                // 2. Process ALL plays that occurred at or before this exact second in this period
                let updatedPlays = false;
                while (playsToProcess.length > 0) {
                    const nextPlay = playsToProcess[playsToProcess.length - 1]; // Peek
                    
                    // Stop processing if the play happens in the future or a future period
                    if (nextPlay.Period > g.Period) break;
                    if (nextPlay.Period === g.Period && nextPlay.TimeOnClock < g.TimeOnClock) break;

                    // Play occurred! Pop it and process
                    const play = playsToProcess.pop()!;
                    updatedPlays = true;

                    // Add to visible ticker (prepend so newest is on top)
                    currentPlaysRef.current[g.GameID].unshift(play);

                    // Did someone score?
                    const playText = play.PlayText.toLowerCase();
                    if (playText.includes("goal!")) {
                         if (playText.includes(g.HomeTeam.toLowerCase()) || playText.includes(targetGamesRef.current[g.GameID].HomeTeam.toLowerCase())) {
                            if (g.Period === 5) {
                                g.HomeTeamShootoutScore += 1;
                            } else {
                                g.HomeTeamScore += 1;
                            }
                            triggerGoal(g.GameID, 'home');
                         } else {
                            if (g.Period === 5) {
                                g.AwayTeamShootoutScore += 1;
                            } else {
                                g.AwayTeamScore += 1;
                            }
                            triggerGoal(g.GameID, 'away');
                         }
                    }
                }

                // If we are looking at this game, trigger a re-render of the details
                if (updatedPlays && selectedGameId === g.GameID) {
                     setGameDetails({ Feeds: [...currentPlaysRef.current[g.GameID]] });
                }

                // 3. Period / Game End Logic
                if (g.TimeOnClock === 0) {
                    // Are there any more plays left in the whole game?
                    if (playsToProcess.length === 0) {
                        g.GameComplete = true;
                    } else {
                        // Move to next period
                        const nextPlay = playsToProcess[playsToProcess.length - 1];
                        g.Period = nextPlay.Period;
                        // Period 4 is OT (usually 300s). Period 5 is SO.
                        g.TimeOnClock = g.Period === 4 ? 300 : (g.Period === 5 ? 0 : 1200); 
                    }
                }
            });

            if (!anyActive) setIsSpoofing(false); // Stop when all games are done
            return newGames;
        });
    }, TICK_SPEED_MS);

    return () => clearInterval(interval);
  }, [isSpoofing, selectedGameId]);

  // 3. Real Live SSE Stream (Hidden underneath, still perfectly active!)
  useEffect(() => {
    const source = new EventSource('http://localhost:8080/api/stream/live/chl');
    source.onmessage = (event: MessageEvent) => {
      if (isSpoofing) return; // Don't listen to real stream while spoofing
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
  }, [isSpoofing]);

  const allGames = Object.values(games);
  const liveGames = allGames.filter(g => !g.GameComplete && g.Period > 0);
  const upcomingGames = allGames.filter(g => !g.GameComplete && g.Period === 0);
  const resultsGames = allGames.filter(g => g.GameComplete);

  // VIEW 1: THE HUB (All Games)
  if (selectedGameId === null) {
    return (
      <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden relative">
        {/* THE SPOOF BUTTON */}
        <button 
          onClick={startSpoofLive} 
          disabled={isSpoofing || spoofLoading}
          className="absolute top-4 right-8 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg disabled:opacity-50 z-50 text-[1.2vh] uppercase tracking-wider transition-all"
        >
          {spoofLoading ? 'Loading Plays...' : isSpoofing ? 'Spoofing...' : '🧪 Spoof Live Run'}
        </button>

        <div className="flex-1 px-4 lg:px-8 pb-6 flex flex-col min-h-0 mt-8">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
            
            <div className="hidden lg:flex lg:col-span-2 flex-col h-full min-h-0 border-r border-[var(--border-primary)]/40 pr-2">
              <GameMiniList title="Upcoming" games={upcomingGames} color="border-blue-500" onSelect={setSelectedGameId} />
            </div>
            
            <div className="col-span-1 lg:col-span-8 flex flex-col h-full min-h-0 px-2">
              <h1 className="text-[2.5vh] font-black text-white mb-6 uppercase tracking-[0.4em] text-center flex items-center justify-center gap-3 shrink-0">
                <span className={`w-2 h-2 rounded-full ${isSpoofing ? 'bg-purple-500 animate-bounce' : 'bg-red-600 animate-ping'}`}></span> 
                {isSpoofing ? 'SPOOFED REPLAY HUB' : 'Live Hockey Hub'}
              </h1>
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 scrollbar pb-10">
                {liveGames.length === 0 && <div className="col-span-2 text-center text-[var(--text-muted)] italic mt-10">No live games currently broadcasting...</div>}
                {liveGames.map((game: any) => {
                  const isGoal = goalFlash[game.GameID];
                  return (
                    <div key={game.GameID} onClick={() => setSelectedGameId(game.GameID)} 
                      className={`relative border rounded-lg p-6 cursor-pointer transition-all duration-300 h-fit min-h-[14vh] flex flex-col justify-center shadow-lg
                        ${isGoal ? 'bg-red-700 border-white scale-[1.02] shadow-[0_0_40px_rgba(239,68,68,0.6)] z-10' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--accent-error)]'}`}>
                      {isGoal && <div className="absolute inset-0 flex items-center justify-center bg-red-700 z-20 rounded-lg"><span className="text-white font-black text-[4vh] italic animate-bounce">GOAL!</span></div>}
                      <div className="text-[1.1vh] text-[var(--text-muted)] font-bold mb-3 text-left uppercase flex justify-between border-b border-[var(--border-primary)]/30 pb-2">
                         <span>{getPeriodName(game.Period, game.IsShootout)} | {game.IsShootout || game.Period === 5 ? 'SHOOTOUT' : formatClock(game.TimeOnClock)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[2.8vh] font-black text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                            <span>{game.HomeTeam} {game.HomeTeamScore}</span>
                            {(game.HomeTeamShootoutScore > 0 || game.Period === 5) && <span className="text-[1.8vh] text-[var(--accent-warning)]">({game.HomeTeamShootoutScore})</span>}
                        </div>
                        <span className="text-[var(--text-muted)] text-[1.4vh] font-normal italic px-4 opacity-40">VS</span>
                        <div className="flex items-center gap-2">
                            {(game.AwayTeamShootoutScore > 0 || game.Period === 5) && <span className="text-[1.8vh] text-[var(--accent-warning)]">({game.AwayTeamShootoutScore})</span>}
                            <span>{game.AwayTeamScore} {game.AwayTeam}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="hidden lg:flex lg:col-span-2 flex-col h-full min-h-0 border-l border-[var(--border-primary)]/40 pl-2">
              <GameMiniList title="Results" games={resultsGames} color="border-[var(--accent-success)]" onSelect={setSelectedGameId} />
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: SPECIFIC GAME DETAILS
  const activeGame = games[selectedGameId];
  const activeFeed = gameDetails?.Feeds || [];
  const activeGoal = goalFlash[selectedGameId];

  return (
    <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden">
      <div className="flex-1 px-4 lg:px-8 pb-4 flex flex-col min-h-0 justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
          
          <div className="hidden lg:block lg:col-span-2 h-full min-h-0">
            <TeamStatsSidebar title="Home Team Stats" teamName={activeGame?.HomeTeam || "Home"} stats={gameDetails?.HomeStats} />
          </div>
          
          <div className="col-span-1 lg:col-span-8 flex flex-col h-full min-h-0">
            <button onClick={() => setSelectedGameId(null)} className="text-tiny text-[var(--text-muted)] hover:text-white uppercase font-bold mb-2 text-left transition-colors shrink-0">
              ← BACK TO ALL GAMES
            </button>
            <div className={`border rounded-t-lg p-4 flex justify-between items-center relative overflow-hidden transition-all duration-500 shadow-xl shrink-0 ${activeGoal ? 'bg-red-800 border-white' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'}`}>
              <div className="text-center w-1/3">
                <h2 className={`text-tiny font-bold uppercase mb-1 ${activeGoal ? 'text-white' : 'text-[var(--text-muted)]'}`}>Home</h2>
                <div className="flex items-center justify-center gap-2 text-white">
                    <p className="text-[5.5vh] font-black leading-none">{activeGame?.HomeTeamScore || 0}</p>
                    {(activeGame?.HomeTeamShootoutScore > 0 || activeGame?.Period === 5) && <span className="text-[2.2vh] font-bold text-[var(--accent-warning)] animate-pulse">({activeGame.HomeTeamShootoutScore})</span>}
                </div>
              </div>
              <div className={`text-center border-x px-8 ${activeGoal ? 'border-red-400' : 'border-[var(--border-secondary)]'}`}>
                <span className={`text-[1.2vh] font-bold uppercase block mb-1 tracking-widest ${activeGoal ? 'text-white' : 'text-red-600'}`}>
                    {getPeriodName(activeGame?.Period, activeGame?.IsShootout)}
                </span>
                <span className={`text-[4.5vh] font-mono font-bold italic leading-none ${activeGoal ? 'text-white' : 'text-white'}`}>
                    {activeGame?.IsShootout || activeGame?.Period === 5 ? '--' : formatClock(activeGame?.TimeOnClock || 1200)}
                </span>
              </div>
              <div className="text-center w-1/3">
                <h2 className={`text-tiny font-bold uppercase mb-1 ${activeGoal ? 'text-white' : 'text-[var(--text-muted)]'}`}>Away</h2>
                <div className="flex items-center justify-center gap-2 text-white">
                    {(activeGame?.AwayTeamShootoutScore > 0 || activeGame?.Period === 5) && <span className="text-[2.2vh] font-bold text-[var(--accent-warning)] animate-pulse">({activeGame.AwayTeamShootoutScore})</span>}
                    <p className="text-[5.5vh] font-black leading-none">{activeGame?.AwayTeamScore || 0}</p>
                </div>
              </div>
            </div>
            
            <RinkVisualizer currentZone={activeGame?.Zone || 11} goalScored={activeGoal} />
            
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg mt-4 p-5 flex-1 flex flex-col min-h-0 shadow-lg">
              <h3 className="text-tiny font-black text-[var(--text-muted)] mb-3 uppercase tracking-[0.2em] text-left border-b border-[var(--border-primary)]/30 pb-2 shrink-0">Live Play-By-Play</h3>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar pb-4">
                {activeFeed.length === 0 && <p className="text-tiny text-[var(--text-muted)] opacity-50 italic text-left">No plays found in database for this game.</p>}
                {activeFeed.map((play: any, idx: number) => (
                  <div key={idx} className="border-b border-[var(--border-primary)]/20 pb-2 text-[1.4vh] flex gap-4 text-left py-2 hover:bg-white/5 px-2 rounded transition-colors">
                    <span className="text-red-600 font-bold font-mono whitespace-nowrap">[{formatClock(play.TimeOnClock)}]</span>
                    <span className="text-[var(--text-secondary)] font-medium leading-tight">{play.PlayText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block lg:col-span-2 h-full min-h-0">
            <TeamStatsSidebar title="Away Team Stats" teamName={activeGame?.AwayTeam || "Away"} stats={gameDetails?.AwayStats} />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LiveRink;