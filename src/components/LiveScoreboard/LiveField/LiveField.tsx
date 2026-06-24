import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLeagueStore } from '../../../context/LeagueContext';
import { useAuthStore } from '../../../context/AuthContext';
import { SimCFB, SimNFL, League } from '../../../_constants/constants';
import { PillButton, ButtonGroup } from '../../../_design/Buttons';
import { fbaUrl } from '../../../_constants/urls';

// --- CONSTANTS & CONFIG ---
const TIMESLOT_ORDER = [
  "Thursday Night", 
  "Friday Night", 
  "Saturday Morning", 
  "Saturday Afternoon", 
  "Saturday Evening", 
  "Saturday Night",
  "Sunday Noon", 
  "Sunday Afternoon", 
  "Sunday Night", 
  "Monday Night"
];

// --- HELPER FUNCTIONS ---
const getQuarterName = (q: number) => {
  if (q > 4) return `OT${q - 4}`;
  if (q === 0) return "1st";
  if (q === 1) return "1st";
  if (q === 2) return "2nd";
  if (q === 3) return "3rd";
  if (q === 4) return "4th";
  return `Q${q}`;
};

const formatClock = (seconds: number | string) => {
  if (typeof seconds === 'string') return seconds; 
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const parseYardLine = (losStr: string, homeAbbr: string): number => {
  if (!losStr || losStr === "50") return 50;
  const parts = losStr.split(" ");
  if (parts.length < 2) return 50;
  const team = parts[0];
  const yard = parseInt(parts[1], 10);
  return team === homeAbbr ? yard : 100 - yard;
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
          const isComplete = game.GameComplete || game.Finished || game.GameFinished || (game.HomeTeamScore > 0 || game.AwayTeamScore > 0);
          const homeScore = game.HomeTeamScore ?? 0;
          const awayScore = game.AwayTeamScore ?? 0;
          const homeName = game.HomeTeam ?? "HOME";
          const awayName = game.AwayTeam ?? "AWAY";

          return (
            <div 
              key={game.GameID} 
              onClick={() => onSelect(game.GameID)}
              className={`bg-[var(--bg-secondary)] border ${isMyTeam ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'border-[var(--border-primary)]'} rounded p-3 shadow-sm hover:border-[var(--text-muted)] hover:bg-white/5 transition-all text-left cursor-pointer shrink-0`}
            >
              <div className="flex justify-between text-[1vh] font-bold text-[var(--text-muted)] mb-1 uppercase">
                  <div className="flex items-center gap-2">
                    <span>{isComplete ? 'FINAL' : game.Quarter > 0 ? `Q${game.Quarter}` : 'SCHEDULED'}</span>
                    {isMyTeam && <span className="bg-yellow-500/20 text-yellow-500 px-1 rounded">MY TEAM</span>}
                  </div>
                  <span>ID: {game.GameID}</span>
              </div>
              <div className="flex justify-between items-center text-[1.4vh] font-black text-[var(--text-primary)]">
                  <span className={game.HomeTeamID === userTeamID ? "text-yellow-400" : ""}>{homeName}</span>
                  <span className="text-[var(--text-muted)] font-normal px-2 text-[1vh]">@</span>
                  <span className={game.AwayTeamID === userTeamID ? "text-yellow-400" : ""}>{awayName}</span>
              </div>
              {isComplete && (
                  <div className="mt-1 text-right text-[1.6vh] font-mono font-bold text-[var(--accent-success)]">
                    {homeScore} - {awayScore}
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
        <span className="text-[var(--text-muted)] w-10 text-right">{secondary}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg h-full flex flex-col min-h-0 shadow-sm overflow-hidden py-4">
      <div className="px-3 pb-3 border-b border-[var(--border-primary)] shrink-0">
        <h3 className="text-[1.3vh] font-black text-white uppercase tracking-widest text-left">{title}</h3>
        <p className="text-[1vh] text-[var(--accent-error)] font-bold text-left uppercase">{teamName}</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-4">
        {!stats ? (
           <div className="mt-4 p-3 opacity-30 italic text-[1vh] text-center">No Data</div>
        ) : (
          <>
            <SectionHeader label="Passing" />
            {stats.Passing?.map((p: any, i: number) => (
                <StatRow key={`qb-${i}`} name={p.Name} primary={`${p.PassingYards} Yds`} secondary={`${p.PassingTDs} TD`} />
            ))}
            <SectionHeader label="Rushing" />
            {stats.Rushing?.map((p: any, i: number) => (
                <StatRow key={`rb-${i}`} name={p.Name} primary={`${p.RushingYards} Yds`} secondary={`${p.RushingTDs} TD`} />
            ))}
            <SectionHeader label="Receiving" />
            {stats.Receiving?.map((p: any, i: number) => (
                <StatRow key={`wr-${i}`} name={p.Name} primary={`${p.ReceivingYards} Yds`} secondary={`${p.Catches} Rec`} />
            ))}
            <SectionHeader label="Defense" />
            {stats.Defense?.map((p: any, i: number) => (
                <StatRow key={`def-${i}`} name={p.Name} primary={`${p.SoloTackles} Tck`} secondary={`${p.SacksMade} Sck`} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const GridironVisualizer = ({ los, possession, homeAbbr, awayAbbr, playAnimation }: { los: number, possession: string, homeAbbr: string, awayAbbr: string, playAnimation: string }) => {
  const markers = [10, 20, 30, 40, 50, 40, 30, 20, 10];
  const ballLeftPos = `${10 + (los * 0.8)}%`; 

  let ballClass = "transition-all duration-1000 ease-in-out";
  if (playAnimation === 'pass') ballClass += " -translate-y-8 scale-125 shadow-2xl"; 
  else if (playAnimation === 'incomplete') ballClass += " translate-y-4 opacity-50"; 
  else if (playAnimation === 'run') ballClass += " translate-y-0"; 

  return (
    <div className="bg-[var(--bg-surface)] p-2 border-x border-b border-[var(--border-primary)] rounded-b-lg shrink-0">
      <div className="flex w-full h-[25vh] lg:h-[32vh] bg-green-800 border-2 border-gray-400 rounded-lg overflow-hidden relative shadow-inner">
        {/* Endzones */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-blue-900 border-r-2 border-white flex items-center justify-center">
          <span className="text-white font-bold rotate-[-90deg] tracking-widest opacity-50 text-[2vh]">{homeAbbr}</span>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-red-900 border-l-2 border-white flex items-center justify-center">
          <span className="text-white font-bold rotate-[90deg] tracking-widest opacity-50 text-[2vh]">{awayAbbr}</span>
        </div>

        {/* Field Lines */}
        <div className="absolute left-[10%] right-[10%] top-0 bottom-0 flex justify-between px-4">
          {markers.map((m, i) => (
            <div key={i} className="h-full border-l border-white/30 flex flex-col justify-between py-2 relative">
              <span className="text-white/60 text-[1.2vh] font-bold -ml-2.5">{m}</span>
              <span className="text-white/60 text-[1.2vh] font-bold -ml-2.5 rotate-180">{m}</span>
            </div>
          ))}
        </div>

        {/* Line of Scrimmage */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-blue-500 z-10 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          style={{ left: ballLeftPos }}
        />

        {/* RedZone Alert Marker */}
        {(los <= 20 || los >= 80) && (
          <div className="absolute top-2 left-1/2 -ml-8 bg-red-600/80 text-white px-2 py-0.5 rounded text-[1vh] font-bold uppercase tracking-wider z-10 animate-pulse border border-red-400">
            RedZone
          </div>
        )}

        {/* The Ball */}
        <div 
          className={`absolute top-1/2 -mt-[1vh] w-[2.5vh] h-[1.5vh] bg-yellow-700 rounded-[50%] border border-black shadow-md z-20 ${ballClass}`}
          style={{ left: ballLeftPos, marginLeft: '-1.25vh' }}
        >
          <div className="absolute top-1/2 left-1/2 -mt-[1px] -ml-[0.5vh] w-[1vh] h-[2px] bg-white rounded" />
          {playAnimation === 'incomplete' && <span className="absolute -top-3 -left-1 text-red-500 font-bold text-xs">X</span>}
        </div>

        {/* Possession Arrow */}
        <div className="absolute bottom-2 left-1/2 -ml-12 bg-black/70 text-white px-3 py-1 rounded text-[1vh] font-bold uppercase tracking-wider z-10 border border-white/20">
          {possession === 'Home' ? `◀ ${homeAbbr} Ball` : `${awayAbbr} Ball ▶`}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const LiveField = () => {
  const { currentUser } = useAuthStore();
  const { ts } = useLeagueStore();
  const [selectedLeague, setSelectedLeague] = useState<League>(SimCFB);
  const [games, setGames] = useState<Record<number, any>>({});
  const [gameDetails, setGameDetails] = useState<any>(null); 
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [scoreFlash, setScoreFlash] = useState<Record<number, 'home' | 'away' | null>>({});
  const [isSpoofing, setIsSpoofing] = useState(false);
  const [broadcastState, setBroadcastState] = useState<'IDLE' | 'GENERATING' | 'BROADCASTING'>('IDLE');
  const [selectedTimeslot, setSelectedTimeslot] = useState<string>(TIMESLOT_ORDER[0]);
  const [liveBoxScores, setLiveBoxScores] = useState<Record<number, any>>({});
  const [playAnimation, setPlayAnimation] = useState('idle');

  const bulkPlaysRef = useRef<Record<number, any[]>>({}); 
  const currentPlaysRef = useRef<Record<number, any[]>>({}); 
  const gameCooldowns = useRef<Record<number, number>>({}); 
  const MAX_CONCURRENT_GAMES = 8; 

  const fbTs = ts as any;

  // --- HARDCODED 2023 SEASON SETTINGS ---
  const rawSeasonID = 3; 
  const currentSeason = 2023; 
  const currentWeek = 1; 

  const userTeamID = useMemo(() => {
    return selectedLeague === SimCFB ? currentUser?.teamId : currentUser?.NFLTeamID;
  }, [selectedLeague, currentUser]);
  
  // --- TEST MODE FORCE ACTION BAR ---
  const isAdmin = true; 
  // ----------------------------------

  const getStatsForGame = (gameId: number) => {
    if (liveBoxScores[gameId]) return liveBoxScores[gameId];
    return gameDetails;
  };

  const updateLocalStats = (game: any, play: any, homeScored: boolean, awayScored: boolean) => {
    const playText = play.PlayText || play.Result || "";
    const textLower = playText.toLowerCase();
    
    if (textLower.includes("incomplete")) setPlayAnimation('incomplete');
    else if (textLower.includes("pass")) setPlayAnimation('pass');
    else if (textLower.includes("rush") || textLower.includes("run")) setPlayAnimation('run');
    else setPlayAnimation('idle');

    const yardsMatch = playText.match(/for (-?\d+) yard/);
    const yards = yardsMatch ? parseInt(yardsMatch[1], 10) : 0;
    const isPass = textLower.includes("pass complete");
    const isRush = textLower.includes("rush") || textLower.includes("run");

    if (yards !== 0 || homeScored || awayScored) {
        setLiveBoxScores(prev => {
            const gameStats = prev[game.GameID];
            if (!gameStats) return prev;
            const newStats = JSON.parse(JSON.stringify(gameStats));

            const isHomePoss = play.Possession === 'Home' || play.Possession === game.HomeTeam;
            const offenseStats = isHomePoss ? newStats.HomeStats : newStats.AwayStats;

            if (offenseStats) {
              if (isPass && offenseStats.Passing && offenseStats.Passing.length > 0) {
                offenseStats.Passing[0].PassingYards += yards;
                if (homeScored || awayScored) offenseStats.Passing[0].PassingTDs += 1;
              }
              if (isRush && offenseStats.Rushing && offenseStats.Rushing.length > 0) {
                offenseStats.Rushing[0].RushingYards += yards;
                if (homeScored || awayScored) offenseStats.Rushing[0].RushingTDs += 1;
              }
            }
            return { ...prev, [game.GameID]: newStats };
        });
    }
  };

  // Accommodates explicit spacing configurations for legacy schema row properties
  useEffect(() => {
    if (!currentWeek || !rawSeasonID) return;
    const isCollege = selectedLeague === SimCFB;
    
    const fetchUrl = isCollege
      ? `${fbaUrl}games/college/season/${rawSeasonID}`
      : `${fbaUrl}games/nfl/season/${rawSeasonID}`;

    fetch(fetchUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const stitchedGames: Record<number, any> = {};
          
          data.forEach((g: any) => {
            if (!g) return;
            // Supports spaced names, standard notation, and custom ID attributes cleanly
            const gameId = g.GameID ?? g.id ?? g.GameId ?? g["Game ID"] ?? g["ID"];
            if (!gameId) return;

            const targetWeek = g.Week ?? g.WeekID ?? g["Week"] ?? 0;
            if (targetWeek !== currentWeek) return;

            const rawTimeslot = g.Timeslot ?? g.TimeSlot ?? g["Timeslot"] ?? g["Time Slot"] ?? "";

           if (!stitchedGames[gameId]) {
              stitchedGames[gameId] = {
                GameID: gameId,
                Week: targetWeek,
                Timeslot: rawTimeslot,
                HomeTeam: g.HomeTeam ?? g.HomeTeamAbbreviation ?? g.HomeTeamName ?? g["Home Team"] ?? g.Home ?? "",
                AwayTeam: g.AwayTeam ?? g.AwayTeamAbbreviation ?? g.AwayTeamName ?? g["Away Team"] ?? g.Away ?? "",
                
                // --- SPOOF LIVE BROADCAST MODE ---
                // We overwrite the historic final scores and force the dashboard variables to 'Upcoming'
                HomeTeamScore: 0,
                AwayTeamScore: 0,
                Quarter: 0,
                TimeRemaining: "15:00",
                GameComplete: false,
                LineOfScrimmage: "50",
                Possession: "Home",
                Down: 1,
                Distance: 10
                // ---------------------------------
              };


            } else {
              // Patch additional values cleanly if historical iterations provide details down the line
              if (g.HomeTeamScore || g.HomeScore || g["Home Score"]) {
                stitchedGames[gameId].HomeTeamScore = g.HomeTeamScore ?? g.HomeScore ?? g["Home Score"];
              }
              if (g.AwayTeamScore || g.AwayScore || g["Away Score"]) {
                stitchedGames[gameId].AwayTeamScore = g.AwayTeamScore ?? g.AwayScore ?? g["Away Score"];
              }
              if (rawTimeslot) stitchedGames[gameId].Timeslot = rawTimeslot;
            }
          });

          const filteredMap: Record<number, any> = {};
          Object.values(stitchedGames).forEach((game: any) => {
            const dbSlot = String(game.Timeslot).toLowerCase().trim();
            const uiSlot = selectedTimeslot.toLowerCase().trim();

            let matches = dbSlot === uiSlot || dbSlot.includes(uiSlot) || uiSlot.includes(dbSlot);
            
            if (uiSlot === "thursday night" && dbSlot.includes("thursday")) matches = true;
            if (uiSlot === "sunday night" && dbSlot.includes("sunday")) matches = true;
            if (uiSlot === "monday night" && dbSlot.includes("monday")) matches = true;

            if (matches) {
              filteredMap[game.GameID] = game;
            }
          });

          setGames(filteredMap);
        } else {
          setGames(data || {});
        }
      })
      .catch(err => console.error("Error fetching live games:", err));
  }, [selectedLeague, rawSeasonID, currentWeek, selectedTimeslot]);

  useEffect(() => {
    if (selectedGameId !== null) {
      const isCollege = selectedLeague === SimCFB;
      const detailEndpoint = isCollege 
        ? `${fbaUrl}games/result/cfb/${selectedGameId}`
        : `${fbaUrl}games/result/nfl/${selectedGameId}`;

      fetch(detailEndpoint)
        .then(res => res.json())
        .then(data => {
          if (isSpoofing) setGameDetails({ ...data, Feeds: currentPlaysRef.current[selectedGameId] || [] });
          else setGameDetails(data);
        })
        .catch(err => console.error("Error fetching game details:", err));
    }
  }, [selectedGameId, isSpoofing, selectedLeague]);

  const triggerScore = (gameId: number, side: 'home' | 'away') => {
    setScoreFlash(prev => ({ ...prev, [gameId]: side }));
    setTimeout(() => setScoreFlash(prev => ({ ...prev, [gameId]: null })), 4000);
  };

  const triggerEngineAndBroadcast = async () => {
    if (Object.keys(games).length === 0) return;
    setBroadcastState('GENERATING');
    const isCollege = selectedLeague === SimCFB;

    try {
        // --- LOCAL PLAY-BY-PLAY SPOOF ---
        // We generate fake football sequences locally so you can test all animations instantly!
        const mockedPlays: Record<number, any[]> = {};
        
        Object.values(games).forEach((g: any) => {
          mockedPlays[g.GameID] = [
            { Quarter: 1, TimeRemaining: "14:45", HomeTeamScore: 0, AwayTeamScore: 0, LineOfScrimmage: "Home 25", Possession: "Home", Down: 1, Distance: 10, PlayText: "Kickoff! Touchback. First down and 10." },
            { Quarter: 1, TimeRemaining: "14:12", HomeTeamScore: 0, AwayTeamScore: 0, LineOfScrimmage: "Home 35", Possession: "Home", Down: 1, Distance: 10, PlayText: "Home Team passes complete to the WR for a 10 yard gain!" },
            { Quarter: 1, TimeRemaining: "13:30", HomeTeamScore: 0, AwayTeamScore: 0, LineOfScrimmage: "Home 42", Possession: "Home", Down: 1, Distance: 10, PlayText: "Home Team RB rushes up the middle for a 7 yard gain." },
            { Quarter: 1, TimeRemaining: "12:55", HomeTeamScore: 0, AwayTeamScore: 0, LineOfScrimmage: "Away 45", Possession: "Home", Down: 2, Distance: 3,  PlayText: "Pass complete deep down the left sideline for a 13 yard pickup!" },
            { Quarter: 1, TimeRemaining: "12:15", HomeTeamScore: 7, AwayTeamScore: 0, LineOfScrimmage: "Away 0",  Possession: "Home", Down: 1, Distance: 10, PlayText: "TOUCHDOWN HOME TEAM! Splendid pass coverage beaten over the top!" },
            { Quarter: 1, TimeRemaining: "11:50", HomeTeamScore: 7, AwayTeamScore: 3, LineOfScrimmage: "Away 30", Possession: "Away", Down: 4, Distance: 2,  PlayText: "Field Goal is GOOD by Away Team. Clean kick from 47 yards out." }
          ];
        });

        bulkPlaysRef.current = mockedPlays;
        setLiveBoxScores({}); 
        // ---------------------------------
        
        Object.keys(bulkPlaysRef.current).forEach(gId => {
          bulkPlaysRef.current[Number(gId)].reverse(); 
        });

        const resetGames: Record<number, any> = {};
        Object.values(games).forEach((g: any, i: number) => {
            resetGames[g.GameID] = { 
              ...g, HomeTeamScore: 0, AwayTeamScore: 0, 
              Quarter: i < MAX_CONCURRENT_GAMES ? 1 : 0, 
              TimeRemaining: "15:00", GameComplete: false, LineOfScrimmage: "50", Possession: "Home", Down: 1, Distance: 10
            };
            currentPlaysRef.current[g.GameID] = []; 
            gameCooldowns.current[g.GameID] = 0;
        });
        setGames(resetGames);
        
        setBroadcastState('BROADCASTING');
        setIsSpoofing(true);
    } catch (e) {
        console.error("Failed to run broadcast:", e);
        setBroadcastState('IDLE');
    }
  };

  useEffect(() => {
    if (!isSpoofing) return;
    const interval = setInterval(() => {
        setGames(prevGames => {
            const newGames = { ...prevGames };
            const now = Date.now();

            let activeCount = Object.values(newGames).filter((g: any) => !g.GameComplete && g.Quarter > 0).length;
            const upcomingList = Object.values(newGames).filter((g: any) => !g.GameComplete && g.Quarter === 0);

            while (activeCount < MAX_CONCURRENT_GAMES && upcomingList.length > 0) {
                const next = upcomingList.shift();
                if (next) { 
                    newGames[next.GameID].Quarter = 1; 
                    newGames[next.GameID].TimeRemaining = "15:00"; 
                    activeCount++; 
                }
            }

            let anyRunning = false;
            Object.values(newGames).forEach((g: any) => {
                if (g.GameComplete || g.Quarter === 0) return;
                anyRunning = true;
                if (now < (gameCooldowns.current[g.GameID] || 0)) return;
                
                const plays = bulkPlaysRef.current[g.GameID] || [];
                if (plays.length === 0) { 
                    g.GameComplete = true; 
                    g.TimeRemaining = "00:00"; 
                    return; 
                }
                
                const play = plays.pop()!;
                const homeScored = play.HomeTeamScore > g.HomeTeamScore;
                const awayScored = play.AwayTeamScore > g.AwayTeamScore;
                
                updateLocalStats(g, play, homeScored, awayScored);
                
                if (homeScored) triggerScore(g.GameID, 'home');
                if (awayScored) triggerScore(g.GameID, 'away');

                Object.assign(g, { 
                    Quarter: play.Quarter, TimeRemaining: play.TimeRemaining || play.TimeOnClock, 
                    HomeTeamScore: play.HomeTeamScore, AwayTeamScore: play.AwayTeamScore, 
                    LineOfScrimmage: play.LineOfScrimmage || "50",
                    Possession: play.Possession,
                    Down: play.Down,
                    Distance: play.Distance
                });
                currentPlaysRef.current[g.GameID].unshift(play);
                gameCooldowns.current[g.GameID] = now + (homeScored || awayScored ? 8000 : 3000);
                
                if (selectedGameId === g.GameID) {
                  setGameDetails((prev: any) => ({ ...prev, Feeds: [...currentPlaysRef.current[g.GameID]] }));
                }
            });

            if (!anyRunning && upcomingList.length === 0) {
                setIsSpoofing(false);
                setBroadcastState('IDLE');
                setPlayAnimation('idle');
            }
            return { ...newGames };
        });
    }, 250);
    return () => clearInterval(interval);
  }, [isSpoofing, selectedGameId, liveBoxScores]);

  const allGames = Object.values(games);
  const upcomingGames = allGames.filter(g => !g.GameComplete && (g.Quarter === 0 || !g.Quarter));
  const liveGames = allGames.filter(g => !g.GameComplete && g.Quarter > 0);
  const resultsGames = allGames.filter(g => g.GameComplete);

  if (selectedGameId === null) {
    return (
      <div className="h-screen w-full bg-[var(--bg-primary)] pt-[calc(8vh+10px)] flex flex-col overflow-hidden relative text-left">
        
        {isAdmin && (
            <div className="w-full bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] shadow-md flex items-center justify-between px-8 py-3 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${broadcastState === 'BROADCASTING' ? 'bg-green-500 animate-pulse' : broadcastState === 'GENERATING' ? 'bg-yellow-500 animate-spin' : 'bg-red-500'}`} />
                    <span className="text-[1.4vh] font-bold text-[var(--text-muted)] uppercase tracking-widest">Control Room</span>
                </div>
                <button 
                    onClick={triggerEngineAndBroadcast} 
                    disabled={broadcastState !== 'IDLE'} 
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded shadow-lg disabled:opacity-50 text-[1.2vh] uppercase tracking-wider transition-all"
                >
                    {broadcastState === 'GENERATING' ? '⚙️ ENGINE RUNNING...' : broadcastState === 'BROADCASTING' ? '📡 LIVE ON AIR' : '🟢 START LIVE BROADCAST'}
                </button>
            </div>
        )}

        <div className="flex-1 px-4 lg:px-8 pb-6 flex flex-col min-h-0 mt-8">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h1 className="text-[2.5vh] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
              Live Field Hub <span className="text-[var(--text-muted)] text-[1.5vh] tracking-widest ml-4">{currentSeason} - Week {currentWeek}</span>
            </h1>
            <div className="flex gap-4">
                <select 
                  className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded px-4 py-1 text-[1.4vh] uppercase tracking-wider font-bold shadow-sm outline-none cursor-pointer"
                  value={selectedTimeslot}
                  onChange={(e) => setSelectedTimeslot(e.target.value)}
                >
                  {TIMESLOT_ORDER.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                <ButtonGroup>
                    <PillButton isSelected={selectedLeague === SimCFB} onClick={() => setSelectedLeague(SimCFB)}>College</PillButton>
                    <PillButton isSelected={selectedLeague === SimNFL} onClick={() => setSelectedLeague(SimNFL)}>Pro</PillButton>
                </ButtonGroup>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
            <div className="lg:col-span-2 h-full min-h-0 border-r border-white/10 pr-2"><GameMiniList title="Upcoming" games={upcomingGames} color="border-blue-500" onSelect={setSelectedGameId} userTeamID={userTeamID} /></div>
            <div className="lg:col-span-8 flex flex-col h-full min-h-0 px-2 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 pb-10">
                    {liveGames.map(game => (
                        <div key={game.GameID} onClick={() => setSelectedGameId(game.GameID)} className={`border rounded-lg p-6 cursor-pointer bg-[var(--bg-secondary)] ${scoreFlash[game.GameID] ? 'bg-red-900 border-white animate-pulse' : 'border-white/10'}`}>
                            <div className="text-[1.1vh] text-[var(--text-muted)] font-bold mb-3 uppercase flex justify-between">
                              <span>{getQuarterName(game.Quarter)} | {formatClock(game.TimeRemaining)}</span>
                              <span>{game.Down} & {game.Distance}</span>
                            </div>
                            <div className="flex justify-between items-center text-[2.8vh] font-black text-white">
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
            <button onClick={() => setSelectedGameId(null)} className="text-[var(--text-muted)] hover:text-white uppercase font-bold mb-2 text-left">← BACK</button>
            <div className={`border rounded-t-lg p-4 flex justify-between items-center ${scoreFlash[selectedGameId] ? 'bg-red-800' : 'bg-[var(--bg-secondary)]'}`}>
                <div className="text-center w-1/3"><p className="text-[5.5vh] font-black text-white">{activeGame.HomeTeamScore}</p></div>
                <div className="text-center border-x px-8 border-white/10 w-1/3 flex flex-col">
                    <span className="text-[1.2vh] font-bold uppercase block text-white">{getQuarterName(activeGame.Quarter)}</span>
                    <span className="text-[4.5vh] font-mono font-bold text-white leading-none">{formatClock(activeGame.TimeRemaining)}</span>
                    <span className="text-[1vh] font-bold uppercase block text-[var(--text-muted)] mt-1">{activeGame.Down} Down & {activeGame.Distance}</span>
                </div>
                <div className="text-center w-1/3"><p className="text-[5.5vh] font-black text-white">{activeGame.AwayTeamScore}</p></div>
            </div>
            <GridironVisualizer 
              los={parseYardLine(activeGame.LineOfScrimmage, activeGame.HomeTeam)} 
              possession={activeGame.Possession} 
              homeAbbr={activeGame.HomeTeam} 
              awayAbbr={activeGame.AwayTeam}
              playAnimation={playAnimation}
            />
            <div className="bg-[var(--bg-secondary)] rounded-b-lg p-5 flex-1 overflow-y-auto custom-scrollbar">
                {currentPlaysRef.current[selectedGameId]?.map((play, idx) => (
                    <div key={idx} className="border-b border-white/5 py-2 text-[1.4vh] flex gap-4 text-left">
                        <span className="text-red-500 font-mono shrink-0">[{formatClock(play.TimeRemaining)}]</span>
                        <span className="text-white">{play.PlayText || play.Result}</span>
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

export default LiveField;