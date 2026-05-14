import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLeagueStore } from '../../context/LeagueContext';
import { useAuthStore } from '../../context/AuthContext';
import { SimCHL, SimPHL, League } from '../../_constants/constants';
import { PillButton, ButtonGroup } from '../../_design/Buttons';
import { hckUrl } from '../../_constants/urls';

// --- HELPER FUNCTIONS ---
const getPeriodName = (p: number, isSO: boolean) => {
  if (isSO || p === 5) return "SO";
  if (p === 4) return "OT";
  if (p === 0) return "1st"; 
  return `P${p}`;
};

const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- SUB-COMPONENTS ---
const GameMiniList = ({ title, games, color, onSelect, userTeamID }: { title: string, games: any[], color: string, onSelect: (id: number) => void, userTeamID?: number }) => (
  <div className="flex flex-col h-full min-h-0 py-2">
    <h3 className={`text-[1.8vh] font-black text-white mb-4 uppercase tracking-[0.2em] border-l-4 ${color} pl-3 text-left shrink-0`}>
      {title} <span className="text-[var(--text-muted)] text-[1.4vh]">({games.length})</span>
    </h3>
    <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-4">
      {games.length === 0 ? (
        <p className="text-tiny text-[var(--text-muted)] italic text-left opacity-40 px-3">No games found.</p>
      ) : (
        games.map((game) => {
          const isMyTeam = game.HomeTeamID === userTeamID || game.AwayTeamID === userTeamID;
          return (
            <div 
              key={game.GameID} 
              onClick={() => onSelect(game.GameID)}
              className={`bg-[var(--bg-secondary)] border ${isMyTeam ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'border-[var(--border-primary)]'} rounded p-3 shadow-sm hover:border-[var(--text-muted)] hover:bg-white/5 transition-all text-left cursor-pointer shrink-0`}
            >
              <div className="flex justify-between text-[1vh] font-bold text-[var(--text-muted)] mb-1 uppercase">
                  <div className="flex items-center gap-2">
                    <span>{game.IsShootout || game.Period === 5 ? 'SO' : game.Period === 4 ? 'OT' : game.GameComplete ? 'FINAL' : 'SCHEDULED'}</span>
                    {isMyTeam && <span className="bg-yellow-500/20 text-yellow-500 px-1 rounded">MY TEAM</span>}
                  </div>
                  <span>ID: {game.GameID}</span>
              </div>
              <div className="flex justify-between items-center text-[1.4vh] font-black text-[var(--text-primary)]">
                  <span className={game.HomeTeamID === userTeamID ? "text-yellow-400" : ""}>{game.HomeTeam}</span>
                  <span className="text-[var(--text-muted)] font-normal px-2 text-[1vh]">@</span>
                  <span className={game.AwayTeamID === userTeamID ? "text-yellow-400" : ""}>{game.AwayTeam}</span>
              </div>
              {game.GameComplete && (
                  <div className="mt-1 text-right text-[1.6vh] font-mono font-bold text-[var(--accent-success)]">
                    {game.HomeTeamScore} - {game.AwayTeamScore}
                  </div>
              )}
            </div>
          )
        })
      )}
    </div>
  </div>
);

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
           <div className="mt-4 p-3 opacity-30 italic text-[1vh] text-center">No Data</div>
        ) : (
          <>
            <SectionHeader label="Forwards" />
            {stats.Forwards?.map((player: any, i: number) => (
                <StatRow key={`f-${i}`} name={player.Name} primary={`${player.Goals}G ${player.Assists}A`} secondary={player.PlusMinus || 0} />
            ))}
            <SectionHeader label="Defenders" />
            {stats.Defenders?.map((player: any, i: number) => (
                <StatRow key={`d-${i}`} name={player.Name} primary={`${player.Goals}G ${player.Assists}A`} secondary={player.PlusMinus || 0} />
            ))}
            <SectionHeader label="Goalies" />
            {stats.Goalies?.map((goalie: any, i: number) => (
                <StatRow key={`g-${i}`} name={goalie.Name} primary={`${goalie.Saves}/${goalie.ShotsAgainst}`} secondary={goalie.SavePercentage?.toFixed(3).replace('0.', '.') || '.000'} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const RinkVisualizer = ({ currentZone, goalScored }: { currentZone: number, goalScored: 'home' | 'away' | null }) => {
  const zones = [{ id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }];
  return (
    <div className="bg-[var(--bg-surface)] p-2 border-x border-b border-[var(--border-primary)] rounded-b-lg shrink-0">
      <div className="flex w-full h-[25vh] lg:h-[32vh] border-2 border-gray-400 rounded-[3rem] overflow-hidden bg-white relative shadow-inner">
        {goalScored === 'home' && <div className="absolute left-0 top-0 bottom-0 w-24 bg-red-600/40 animate-pulse blur-xl z-20" />}
        {goalScored === 'away' && <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-600/40 animate-pulse blur-xl z-20" />}
        <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-red-600/20 transform -translate-x-1/2" />
        {zones.map((zone) => (
          <div key={zone.id} className={`flex-1 flex items-center justify-center z-10 ${currentZone === zone.id ? 'bg-yellow-400/10' : ''}`}>
            {currentZone === zone.id && <div className="w-[1.8vh] h-[1.8vh] bg-black rounded-full border-2 border-white animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const LiveRink = () => {
  const { currentUser } = useAuthStore();
  const { ts } = useLeagueStore();
  const [selectedLeague, setSelectedLeague] = useState<League>(SimPHL);
  const [games, setGames] = useState<Record<number, any>>({});
  const [gameDetails, setGameDetails] = useState<any>(null); 
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [goalFlash, setGoalFlash] = useState<Record<number, 'home' | 'away' | null>>({});
  const [isSpoofing, setIsSpoofing] = useState(false);
  const [spoofLoading, setSpoofLoading] = useState(false);
  const [selectedTimeslot, setSelectedTimeslot] = useState<string>("B");

  const [liveBoxScores, setLiveBoxScores] = useState<Record<number, any>>({});

  const bulkPlaysRef = useRef<Record<number, any[]>>({}); 
  const currentPlaysRef = useRef<Record<number, any[]>>({}); 
  const gameCooldowns = useRef<Record<number, number>>({}); 
  const MAX_CONCURRENT_GAMES = 8; 

  const hckTs = ts as any;
  const rawSeasonID = useMemo(() => hckTs?.SeasonID || hckTs?.Season || 2, [hckTs]);
  const currentSeason = useMemo(() => 2025 + rawSeasonID, [rawSeasonID]);
  const currentWeek = useMemo(() => {
    if (selectedLeague === SimCHL) return hckTs?.CollegeWeek || hckTs?.Week || hckTs?.CollegeWeekID || 8;
    return hckTs?.ProWeek || hckTs?.Week || hckTs?.ProWeekID || 8;
  }, [selectedLeague, hckTs]);

  const userTeamID = useMemo(() => {
    return selectedLeague === SimCHL ? currentUser?.CHLTeamID : currentUser?.PHLTeamID;
  }, [selectedLeague, currentUser]);

  const getStatsForGame = (gameId: number) => {
    if (liveBoxScores[gameId]) return liveBoxScores[gameId];
    return gameDetails;
  };

  // --- SMART STAT PARSER ---
  const updateLocalStats = (game: any, play: any, homeScored: boolean, awayScored: boolean, recentPlays: any[]) => {
    const playText = play.PlayText;
    const textLower = playText.toLowerCase();
    
    // Fallback: If DB score didn't change but text explicitly says point, force a tally
    let isGoal = homeScored || awayScored;
    if (!isGoal && textLower.includes("point")) {
        isGoal = true;
        if (textLower.includes(game.HomeTeam.toLowerCase())) homeScored = true;
        else awayScored = true;
    }

    const isSave = textLower.includes("save") || textLower.includes("stops") || textLower.includes("blocked") || textLower.includes("denies");
    if (!isGoal && !isSave) return;

    setLiveBoxScores(prev => {
        const gameStats = prev[game.GameID];
        if (!gameStats) return prev;
        const newStats = JSON.parse(JSON.stringify(gameStats));

        const getLastName = (fullName: string) => {
            const parts = fullName.split('. ');
            return parts.length > 1 ? parts.slice(1).join(' ') : fullName;
        };

        if (isGoal) {
            const allSkaters = [
                ...newStats.HomeStats.Forwards, ...newStats.HomeStats.Defenders,
                ...newStats.AwayStats.Forwards, ...newStats.AwayStats.Defenders
            ];

            // 1. AWARD GOAL: Scan current text for any player's last name
            const playersInGoalText = allSkaters.filter(p => {
                const ln = getLastName(p.Name);
                return new RegExp(`\\b${ln}\\b`, 'i').test(playText);
            });

            if (playersInGoalText.length > 0) {
                playersInGoalText[0].Goals++;
            }

            // 2. AWARD ASSISTS: Look back at the last 2 lines of play-by-play for a pass
            const assistPlays = recentPlays.slice(0, 2); 
            let assistsAwarded = 0;
            for (const rp of assistPlays) {
                if (assistsAwarded >= 2) break;
                const rpTextLower = rp.PlayText.toLowerCase();
                
                if (rpTextLower.includes("pass") || rpTextLower.includes("finds") || rpTextLower.includes("moves")) {
                    const playersInPass = allSkaters.filter(p => {
                        const ln = getLastName(p.Name);
                        return new RegExp(`\\b${ln}\\b`, 'i').test(rp.PlayText);
                    });
                    
                    // Don't give an assist to the guy who scored
                    const assisters = playersInPass.filter(p => !playersInGoalText.some(scorer => scorer.Name === p.Name));
                    if (assisters.length > 0) {
                        assisters[0].Assists++;
                        assistsAwarded++;
                    }
                }
            }

            // 3. PENALIZE GOALIE: Increment Shots Against
            if (homeScored && newStats.AwayStats.Goalies.length > 0) {
                const g = newStats.AwayStats.Goalies[0];
                g.ShotsAgainst++;
                g.SavePercentage = g.Saves / g.ShotsAgainst;
            }
            if (awayScored && newStats.HomeStats.Goalies.length > 0) {
                const g = newStats.HomeStats.Goalies[0];
                g.ShotsAgainst++;
                g.SavePercentage = g.Saves / g.ShotsAgainst;
            }
        } 
        
        if (isSave) {
            const allGoalies = [...newStats.HomeStats.Goalies, ...newStats.AwayStats.Goalies];
            let foundGoalie = false;

            for (const g of allGoalies) {
                const ln = getLastName(g.Name);
                if (new RegExp(`\\b${ln}\\b`, 'i').test(playText)) {
                    g.Saves++;
                    g.ShotsAgainst++;
                    g.SavePercentage = g.Saves / g.ShotsAgainst;
                    foundGoalie = true;
                    break;
                }
            }

            if (!foundGoalie) {
                const targetGoalies = textLower.includes("away zone") ? newStats.HomeStats.Goalies : newStats.AwayStats.Goalies;
                if (targetGoalies.length > 0) {
                    targetGoalies[0].Saves++;
                    targetGoalies[0].ShotsAgainst++;
                    targetGoalies[0].SavePercentage = targetGoalies[0].Saves / targetGoalies[0].ShotsAgainst;
                }
            }
        }
        return { ...prev, [game.GameID]: newStats };
    });
  };

  useEffect(() => {
    if (!currentWeek || !rawSeasonID) return;
    const isCollege = selectedLeague === SimCHL;
    fetch(`${hckUrl}games/live/chl?isCollege=${isCollege}&season=${rawSeasonID}&week=${currentWeek}&timeslot=${selectedTimeslot}`)
      .then(res => res.json())
      .then(data => setGames(data || {}))
      .catch(err => console.error("Error fetching live games:", err));
  }, [selectedLeague, rawSeasonID, currentWeek, selectedTimeslot]);

  useEffect(() => {
    if (selectedGameId !== null) {
      const isCollege = selectedLeague === SimCHL;
      fetch(`${hckUrl}games/details/chl/${selectedGameId}?isCollege=${isCollege}`)
        .then(res => res.json())
        .then(data => {
          if (isSpoofing) setGameDetails({ ...data, Feeds: currentPlaysRef.current[selectedGameId] || [] });
          else setGameDetails(data);
        })
        .catch(err => console.error("Error fetching game details:", err));
    }
  }, [selectedGameId, isSpoofing, selectedLeague]);

  const triggerGoal = (gameId: number, side: 'home' | 'away') => {
    setGoalFlash(prev => ({ ...prev, [gameId]: side }));
    setTimeout(() => setGoalFlash(prev => ({ ...prev, [gameId]: null })), 4000);
  };

  const startSpoofLive = async () => {
    if (Object.keys(games).length === 0) return;
    setSpoofLoading(true);
    const isCollege = selectedLeague === SimCHL;
    try {
        const res = await fetch(`${hckUrl}games/plays/bulk/chl?isCollege=${isCollege}&season=${rawSeasonID}&week=${currentWeek}&timeslot=${selectedTimeslot}`);
        const bulkData = await res.json();
        
        bulkPlaysRef.current = bulkData.Plays;
        setLiveBoxScores(bulkData.Rosters); 
        
        Object.keys(bulkPlaysRef.current).forEach(gId => {
          bulkPlaysRef.current[Number(gId)].sort((a: any, b: any) => b.Period - a.Period || a.TimeOnClock - b.TimeOnClock);
        });

        const resetGames: Record<number, any> = {};
        Object.values(games).forEach((g: any, i: number) => {
            resetGames[g.GameID] = { 
              ...g, HomeTeamScore: 0, AwayTeamScore: 0, 
              Period: i < MAX_CONCURRENT_GAMES ? 1 : 0, 
              TimeOnClock: 1200, GameComplete: false, Zone: 11 
            };
            currentPlaysRef.current[g.GameID] = []; 
            gameCooldowns.current[g.GameID] = 0;
        });
        setGames(resetGames);
        setIsSpoofing(true);
    } catch (e) {
        console.error(e);
    } finally {
        setSpoofLoading(false);
    }
  };

  useEffect(() => {
    if (!isSpoofing) return;
    const interval = setInterval(() => {
        setGames(prevGames => {
            const newGames = { ...prevGames };
            const now = Date.now();

            let activeCount = Object.values(newGames).filter((g: any) => !g.GameComplete && g.Period > 0).length;
            const upcomingList = Object.values(newGames).filter((g: any) => !g.GameComplete && g.Period === 0);

            while (activeCount < MAX_CONCURRENT_GAMES && upcomingList.length > 0) {
                const next = upcomingList.shift();
                if (next) { 
                    newGames[next.GameID].Period = 1; 
                    newGames[next.GameID].TimeOnClock = 1200; 
                    activeCount++; 
                }
            }

            let anyRunning = false;
            Object.values(newGames).forEach((g: any) => {
                if (g.GameComplete || g.Period === 0) return;
                anyRunning = true;
                if (now < (gameCooldowns.current[g.GameID] || 0)) return;
                
                const plays = bulkPlaysRef.current[g.GameID] || [];
                if (plays.length === 0) { 
                    g.GameComplete = true; 
                    g.TimeOnClock = 0; 
                    return; 
                }
                
                const play = plays.pop()!;
                const homeScored = play.HomeScore > g.HomeTeamScore;
                const awayScored = play.AwayScore > g.AwayTeamScore;
                
                // CRITICAL: Call parser with the history passed in for Assist tracking
                updateLocalStats(g, play, homeScored, awayScored, currentPlaysRef.current[g.GameID] || []);
                
                if (homeScored) triggerGoal(g.GameID, 'home');
                if (awayScored) triggerGoal(g.GameID, 'away');

                Object.assign(g, { 
                    Period: play.Period, TimeOnClock: play.TimeOnClock, 
                    HomeTeamScore: play.HomeScore, AwayTeamScore: play.AwayScore, 
                    Zone: play.Zone || 11 
                });
                // Unshift happens AFTER the update, so recentPlays.slice(0, 2) in the parser accurately grabs the previous passes
                currentPlaysRef.current[g.GameID].unshift(play);
                gameCooldowns.current[g.GameID] = now + (homeScored || awayScored ? 10000 : 3000);
                
                if (selectedGameId === g.GameID) {
                  setGameDetails((prev: any) => ({ ...prev, Feeds: [...currentPlaysRef.current[g.GameID]] }));
                }
            });

            if (!anyRunning && upcomingList.length === 0) setIsSpoofing(false);
            return { ...newGames };
        });
    }, 250);
  }, [isSpoofing, selectedGameId]);

  const allGames = Object.values(games);
  const upcomingGames = allGames.filter(g => !g.GameComplete && g.Period === 0);
  const liveGames = allGames.filter(g => !g.GameComplete && g.Period > 0);
  const resultsGames = allGames.filter(g => g.GameComplete);

  if (selectedGameId === null) {
    return (
      <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden relative text-left">
        <button onClick={startSpoofLive} disabled={isSpoofing || spoofLoading} className="absolute top-4 right-8 bg-purple-600 text-white font-bold py-2 px-4 rounded z-50 text-[1.2vh] uppercase">{spoofLoading ? 'Loading...' : '🧪 Spoof Live Run'}</button>
        <div className="flex-1 px-4 lg:px-8 pb-6 flex flex-col min-h-0 mt-8">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h1 className="text-[2.5vh] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isSpoofing ? 'bg-purple-500 animate-bounce' : 'bg-red-600 animate-ping'}`}></span> 
              Live Hockey Hub <span className="text-[var(--text-muted)] text-[1.5vh] tracking-widest ml-4">{currentSeason} - Week {currentWeek}</span>
            </h1>
            <div className="flex gap-4">
                <ButtonGroup>{['A', 'B', 'C', 'D'].map(slot => (<PillButton key={slot} isSelected={selectedTimeslot === slot} onClick={() => setSelectedTimeslot(slot)}>{slot}</PillButton>))}</ButtonGroup>
                <ButtonGroup>
                    <PillButton isSelected={selectedLeague === SimCHL} onClick={() => setSelectedLeague(SimCHL)}>College</PillButton>
                    <PillButton isSelected={selectedLeague === SimPHL} onClick={() => setSelectedLeague(SimPHL)}>Pro</PillButton>
                </ButtonGroup>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
            <div className="lg:col-span-2 h-full min-h-0 border-r border-white/10 pr-2"><GameMiniList title="Upcoming" games={upcomingGames} color="border-blue-500" onSelect={setSelectedGameId} userTeamID={userTeamID} /></div>
            <div className="lg:col-span-8 flex flex-col h-full min-h-0 px-2 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 pb-10">
                    {liveGames.map(game => (
                        <div key={game.GameID} onClick={() => setSelectedGameId(game.GameID)} className={`border rounded-lg p-6 cursor-pointer bg-[var(--bg-secondary)] ${goalFlash[game.GameID] ? 'bg-red-900 border-white animate-pulse' : 'border-white/10'}`}>
                            <div className="text-[1.1vh] text-muted font-bold mb-3 uppercase flex justify-between"><span>{getPeriodName(game.Period, false)} | {formatClock(game.TimeOnClock)}</span></div>
                            <div className="flex justify-between items-center text-[2.8vh] font-black">
                                <span>{game.HomeTeam} {game.HomeTeamScore}</span>
                                <span className="opacity-20 italic">VS</span>
                                <span>{game.AwayTeamScore} {game.AwayTeam}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2 h-full min-h-0 border-l border-white/10 pl-2"><GameMiniList title="Results" games={resultsGames} color="border-green-500" onSelect={setSelectedGameId} userTeamID={userTeamID} /></div>
          </div>
        </div>
      </div>
    );
  }

  const activeGame = games[selectedGameId];
  const statsSource = getStatsForGame(selectedGameId);

  return (
    <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden">
      <div className="flex-1 px-8 pb-4 flex flex-col min-h-0">
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-2 h-full"><TeamStatsSidebar title="Home Stats" teamName={activeGame.HomeTeam} stats={statsSource?.HomeStats} /></div>
          <div className="col-span-8 flex flex-col h-full">
            <button onClick={() => setSelectedGameId(null)} className="text-muted hover:text-white uppercase font-bold mb-2 text-left">← BACK</button>
            <div className={`border rounded-t-lg p-4 flex justify-between items-center ${goalFlash[selectedGameId] ? 'bg-red-800' : 'bg-[var(--bg-secondary)]'}`}>
                <div className="text-center w-1/3"><p className="text-[5.5vh] font-black text-white">{activeGame.HomeTeamScore}</p></div>
                <div className="text-center border-x px-8 border-white/10">
                    <span className="text-[1.2vh] font-bold uppercase block text-white">{getPeriodName(activeGame.Period, false)}</span>
                    <span className="text-[4.5vh] font-mono font-bold text-white">{formatClock(activeGame.TimeOnClock)}</span>
                </div>
                <div className="text-center w-1/3"><p className="text-[5.5vh] font-black text-white">{activeGame.AwayTeamScore}</p></div>
            </div>
            <RinkVisualizer currentZone={activeGame.Zone} goalScored={goalFlash[selectedGameId]} />
            <div className="bg-[var(--bg-secondary)] rounded-b-lg p-5 flex-1 overflow-y-auto">
                {currentPlaysRef.current[selectedGameId]?.map((play, idx) => (
                    <div key={idx} className="border-b border-white/5 py-2 text-[1.4vh] flex gap-4 text-left">
                        <span className="text-red-500 font-mono">[{formatClock(play.TimeOnClock)}]</span>
                        <span className="text-white">{play.PlayText}</span>
                    </div>
                ))}
            </div>
          </div>
          <div className="col-span-2 h-full"><TeamStatsSidebar title="Away Stats" teamName={activeGame.AwayTeam} stats={statsSource?.AwayStats} /></div>
        </div>
      </div>
    </div>
  );
};

export default LiveRink;