import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useAuthStore } from "../../../context/AuthContext";
import { SimCFB, SimNFL, League } from "../../../_constants/constants";
import { PillButton, ButtonGrid } from "../../../_design/Buttons";
import { fbaUrl } from "../../../_constants/urls";
import {
  useLiveFieldState,
  getPlayText,
} from "../../../_hooks/useLiveFieldState";
import { TeamStatsSidebar } from "./TeamStatsSidebar";
import { GridironVisualizer } from "./GridironVisualizer";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { Logo } from "../../../_design/Logo";
import { getLogo } from "../../../_utility/getLogo";

// --- HELPERS ---
const getPeriodName = (p: number) => {
  if (p === 5) return "OT";
  return `Q${p || 1}`;
};

const formatClock = (seconds: number | string) => {
  if (typeof seconds === "string") {
    if (seconds.includes(":")) return seconds;
    seconds = parseInt(seconds, 10);
  }
  if (isNaN(seconds as number)) return "15:00";
  const m = Math.floor((seconds as number) / 60);
  const s = (seconds as number) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getOrdinalSuffix = (i: number) => {
  if (!i) return "";
  const j = i % 10, k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const isPossession = (possessionRaw: any, teamId: any, teamName: string) => {
  if (possessionRaw === undefined || possessionRaw === null) return false;
  const possStr = String(possessionRaw).toLowerCase();
  if (possStr === String(teamId).toLowerCase()) return true;
  if (String(teamName).toLowerCase().includes(possStr)) return true;
  return false;
};

// Translates "3 13" into "ILLI 3"
const formatYardlineText = (yardLineRaw: any, homeTeamId: any, awayTeamId: any, homeName: string, awayName: string) => {
  if (yardLineRaw === undefined || yardLineRaw === null) return "50";
  const str = String(yardLineRaw).trim();

  const parts = str.split(' ');
  if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      const yard = parts[0];
      const teamId = String(parts[1]);
      if (teamId === String(homeTeamId)) return `${homeName} ${yard}`;
      if (teamId === String(awayTeamId)) return `${awayName} ${yard}`;
      return `${yard}`;
  }
  return str.replace('Yardline', '').trim();
};

// Converts "3 13" into a 0-100 percentage for the dot
const parseBallX = (yardLineRaw: any, homeTeamId: any, awayTeamId: any) => {
  if (yardLineRaw === undefined || yardLineRaw === null) return 50;
  if (typeof yardLineRaw === "number") return yardLineRaw > 100 ? 50 : yardLineRaw;

  const str = String(yardLineRaw).trim();

  const parts = str.split(' ');
  if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      const yard = parseInt(parts[0], 10);
      const teamId = String(parts[1]);
      if (teamId === String(homeTeamId)) return 100 - yard;
      if (teamId === String(awayTeamId)) return yard;
      return yard; 
  }

  const num = parseInt(str, 10);
  return isNaN(num) ? 50 : num;
};


// --- SUB-COMPONENTS ---
const GameMiniList = React.memo(
  ({ title, games, color, onSelect, broadcastState }: any) => (
    <div className="flex flex-col h-full min-h-0 py-2">
      <h3
        className={`text-[1.8vh] font-black text-white mb-4 uppercase tracking-[0.2em] border-l-4 ${color} pl-3 text-left shrink-0`}
      >
        {title}{" "}
        <span className="text-(--text-muted) text-[1.4vh]">
          ({games.length})
        </span>
      </h3>
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-4">
        {games.map((game: any) => (
          <button
            key={game.GameID}
            disabled={broadcastState !== "BROADCASTING" && title !== "Results"}
            onClick={() => onSelect(game.GameID)}
            className="w-full bg-(--bg-secondary) border border-(--border-primary) rounded p-3 shadow-sm hover:border-(--text-muted) hover:bg-white/5 transition-all text-left"
          >
            <div className="text-[1.4vh] font-black text-(--text-primary)">
              {game.AwayTeam} @ {game.HomeTeam}
            </div>
            {(game.GameComplete || game.IsRevealed) && (
              <div className="text-[1.6vh] font-mono font-bold text-(--accent-success)">
                {game.AwayTeamScore} - {game.HomeTeamScore}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  ),
);

// --- MAIN COMPONENT ---
const LiveField = () => {
  const { isModerator, currentUser } = useAuthStore();
  const { ts, selectedLeague, setSelectedLeague } = useLeagueStore();
  const { cfb_Timestamp } = useSimFBAStore();
  const {
    liveGameStates,
    shownPlays,
    touchdownFlashGames,
    isFirebaseMode,
    isReady,
    rawGames: firebaseRawGames,
  } = useLiveFieldState(selectedLeague as League);

  const [games, setGames] = useState<Record<number, any>>({});
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [isSpoofing, setIsSpoofing] = useState(false);
  const [broadcastState, setBroadcastState] = useState<
    "IDLE" | "GENERATING" | "BROADCASTING"
  >("IDLE");

  const bulkPlaysRef = useRef<Record<number, any[]>>({});
  const currentPlaysRef = useRef<Record<number, any[]>>({});
  const gameCooldowns = useRef<Record<number, number>>({});

  const chlTs = ts as any;
  const rawSeasonID = useMemo(() => {
    return selectedLeague === SimCFB
      ? chlTs?.CollegeSeasonID
      : chlTs?.NFLSeasonID;
  }, [chlTs, selectedLeague]);

  const currentWeek = useMemo(() => {
    return selectedLeague === SimCFB
      ? (chlTs?.CollegeWeek ?? 0)
      : (chlTs?.NFLWeek ?? 0);
  }, [chlTs, selectedLeague]);

  const isCFB = useMemo(() => selectedLeague === SimCFB, [selectedLeague]);

  const isSpringGame = useMemo(() => {
    if (isCFB) {
      return cfb_Timestamp?.CFBSpringGames ?? false;
    }
    return cfb_Timestamp?.NFLPreseason ?? false;
  }, [isCFB, cfb_Timestamp]);

  useEffect(() => {
    if (!rawSeasonID || firebaseRawGames.length === 0) return;
    const stitched: Record<number, any> = {};
    firebaseRawGames.forEach((fg) => {
      stitched[fg.GameID] = {
        ...fg, 
        HomeTeamScore: 0,
        AwayTeamScore: 0,
        Period: 0,
        TimeOnClock: 900,
        GameComplete: false,
        IsRevealed: false,
        Zone: "50",
        Possession: null,
        Down: null,
        Distance: null,
        LastPlayType: null,
        LastPlayName: null,
        LastOffForm: null,
        LastDefForm: null,
        LastDefTend: null,
        LastYards: null,
      };
    });
    setGames(stitched);
  }, [firebaseRawGames, rawSeasonID]);

  const triggerEngine = async () => {
    setBroadcastState("GENERATING");
    try {
      const endpoint = selectedLeague === SimCFB ? "cfb" : "nfl";
      const isCFB = selectedLeague === SimCFB;
      const url = `${fbaUrl}games/plays/bulk/${endpoint}?isCollege=${isCFB}&season=${rawSeasonID}&week=${currentWeek}&is_spring_game=${isSpringGame}`;

      const playsRes = await fetch(url);

      if (playsRes.ok) {
        const playData = await playsRes.json();

        bulkPlaysRef.current = playData.Plays || playData || {};

        Object.keys(bulkPlaysRef.current).forEach((id) => {
          if (Array.isArray(bulkPlaysRef.current[Number(id)])) {
            bulkPlaysRef.current[Number(id)].reverse();
          }
        });

        setIsSpoofing(true);
        setBroadcastState("BROADCASTING");
      } else {
        console.error("Broadcast failed:", playsRes.status);
        setBroadcastState("IDLE");
      }
    } catch (e) {
      console.error("Broadcast trigger error:", e);
      setBroadcastState("IDLE");
    }
  };

  useEffect(() => {
    if (!isSpoofing) return;
    const interval = setInterval(() => {
      setGames((prev) => {
        const newGames = { ...prev };
        const now = Date.now();
        Object.values(newGames).forEach((g: any) => {
          if (g.GameComplete) return;
          if (now < (gameCooldowns.current[g.GameID] || 0)) return;
          const plays = bulkPlaysRef.current[g.GameID] || [];
          if (plays.length === 0) {
            g.GameComplete = true;
            g.IsRevealed = true;
            return;
          }
          const play = plays.pop()!;
          
          g.Period = play.Quarter || play.Period || play.quarter || (g.Period === 0 ? 1 : g.Period);
          g.TimeOnClock = play['Time Remaining'] ?? play.TimeRemaining ?? play.TimeOnClock ?? g.TimeOnClock;
          g.HomeTeamScore = play.HomeTeamScore ?? g.HomeTeamScore;
          g.AwayTeamScore = play.AwayTeamScore ?? g.AwayTeamScore;
          
          const newYardLine = play['Line of Scrimmage'] ?? play.LineOfScrimmage ?? play.YardLine;
          g.Zone = newYardLine !== undefined && newYardLine !== null ? newYardLine : g.Zone;
          
          g.Down = play.Down ?? play.down ?? g.Down;
          g.Distance = play.Distance ?? play.distance ?? play.DistanceToFirstDown ?? g.Distance;
          g.Possession = play.Possession ?? play.OffenseTeamID ?? play.OffenseID ?? g.Possession;

          const isValid = (val: any) => val && val !== "N/A" && val !== "nan" && String(val).trim() !== "";
          const newPlayType = play['Type of Play'] ?? play.PlayType;
          const newPlayName = play['Offensive Play'] ?? play.PlayName;
          const newOffForm = play['Offensive Formation'] ?? play.OffensiveFormation;
          const newDefForm = play['Defensive Formation'] ?? play.DefensiveFormation;
          const newDefTend = play['Defensive Tendency'] ?? play.DefensiveTendency;
          const newYards = play['Yards Gained'] ?? play.ResultYards;

          g.LastPlayType = isValid(newPlayType) ? newPlayType : g.LastPlayType;
          g.LastPlayName = isValid(newPlayName) ? newPlayName : g.LastPlayName;
          g.LastOffForm = isValid(newOffForm) ? newOffForm : g.LastOffForm;
          g.LastDefForm = isValid(newDefForm) ? newDefForm : g.LastDefForm;
          g.LastDefTend = isValid(newDefTend) ? newDefTend : g.LastDefTend;
          g.LastYards = newYards !== undefined && newYards !== null && !isNaN(newYards) ? newYards : g.LastYards;

          currentPlaysRef.current[g.GameID] = currentPlaysRef.current[g.GameID] || [];
          currentPlaysRef.current[g.GameID].unshift(play);
          const isTouchdown =
            play.StreamResult?.findIndex((result: any) => result === "TOUCHDOWN") !== -1;
          gameCooldowns.current[g.GameID] = now + (isTouchdown ? 10000 : 5000);
        });
        return { ...newGames };
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isSpoofing]);

  const allGames = useMemo(() => Object.values(games), [games]);

  const resultsGames = useMemo(() => {
    return allGames.filter((g: any) => g.GameComplete || g.IsRevealed === true);
  }, [allGames]);

  const liveGames = useMemo(() => {
    if (isFirebaseMode && !isSpoofing) {
      return Object.values(liveGameStates).filter((g: any) => {
        if (g.IsRevealed) return false;
        const p = g.Period || g.Quarter || 0;
        const t = g.TimeOnClock;
        const plays = shownPlays[g.GameID] || [];
        return plays.length > 0 || p > 1 || (p === 1 && t !== 900 && t !== "15:00");
      });
    }
    return allGames.filter((g: any) => !g.GameComplete && (g.Period || 0) > 0);
  }, [isFirebaseMode, isSpoofing, liveGameStates, allGames, shownPlays]);

  const upcomingGames = useMemo(() => {
    if (isFirebaseMode && !isSpoofing) {
      return allGames.filter((g: any) => {
        if (g.GameComplete) return false;
        const fbGame = liveGameStates[g.GameID] as any;
        if (!fbGame) return true; 
        if (fbGame.IsRevealed) return false;
        
        const p = fbGame.Period || fbGame.Quarter || 0;
        const t = fbGame.TimeOnClock;
        const plays = shownPlays[g.GameID] || [];
        
        const isLive = plays.length > 0 || p > 1 || (p === 1 && t !== 900 && t !== "15:00");
        return !isLive;
      });
    }
    return allGames.filter((g: any) => !g.GameComplete && (g.Period || 0) === 0);
  }, [isFirebaseMode, isSpoofing, liveGameStates, allGames, shownPlays]);


  // --- VISUALIZER DATA EXTRACTION ---
  let combinedPlayTypeStr = 'IDLE'; // The combined string used by physics engine
  let activeResultCategory = 'NONE';
  let activePlayCounter = 0;
  let activeYards = 0;

  if (selectedGameId !== null) {
      const currentPlays = isFirebaseMode && !isSpoofing 
          ? shownPlays[selectedGameId] 
          : currentPlaysRef.current[selectedGameId];
      
      activePlayCounter = currentPlays?.length || 0;

      if (currentPlays && currentPlays.length > 0) {
          const latestPlay = (isFirebaseMode && !isSpoofing) 
              ? currentPlays[currentPlays.length - 1] 
              : currentPlays[0];
          
          if (latestPlay) {
              const basePlayType = latestPlay['Type of Play'] || latestPlay.PlayType || 'IDLE';
              const specificPlayName = latestPlay['Offensive Play'] || latestPlay.PlayName || '';
              
              // NEW COMBINED STRING: "Run Outside Right"
              combinedPlayTypeStr = `${basePlayType} ${specificPlayName}`; 
              
              const rawYards = latestPlay['Yards Gained'] ?? latestPlay.ResultYards;
              activeYards = rawYards !== undefined && rawYards !== null && !isNaN(rawYards) ? parseInt(rawYards, 10) : 0;
              
              const streamRes = Array.isArray(latestPlay.StreamResult) ? latestPlay.StreamResult.join(' ') : latestPlay.StreamResult;
              const playText = isFirebaseMode && !isSpoofing ? getPlayText(latestPlay) : (streamRes || latestPlay.Result || latestPlay.PlayText || "");
              
              const pTextLower = String(playText).toLowerCase();
              const pTypeLower = String(combinedPlayTypeStr).toLowerCase();
              
              if (/(intercepted|picked off|interception|it flies)/.test(pTextLower)) {
                  activeResultCategory = 'INTERCEPTION';
              } else if (/(fumbled|fumble)/.test(pTextLower)) {
                  activeResultCategory = 'FUMBLE';
              } else if (/(incomplete)/.test(pTextLower)) {
                  activeResultCategory = 'INCOMPLETE';
              } else if (/(no good|missed|misses|blocked|wide)/.test(pTextLower)) {
                  activeResultCategory = 'NO_GOOD';
              } else if (/(is good|made|good)/.test(pTextLower) && /(kick|xp|field goal|fg)/.test(pTypeLower)) {
                  activeResultCategory = 'GOOD';
              } else if (pTypeLower.includes('pass')) {
                  activeResultCategory = 'COMPLETE';
              }
          }
      }
  }


  if (selectedGameId === null) {
    return (
      <div className="h-screen w-full bg-(--bg-primary) pt-[calc(8vh+10px)] flex flex-col overflow-hidden text-left p-8">
        {isModerator && (
          <div className="bg-(--bg-secondary) border border-(--border-primary) p-4 mb-6 flex justify-between items-center rounded shrink-0">
            <span className="text-white font-bold uppercase tracking-widest text-sm">
              Control Room
            </span>
            <button
              onClick={triggerEngine}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded uppercase text-xs"
            >
              {broadcastState === "IDLE"
                ? "🟢 START BROADCAST"
                : broadcastState}
            </button>
          </div>
        )}
        <div className="flex gap-4 shrink-0">
          <ButtonGrid>
            <PillButton
              isSelected={selectedLeague === SimCFB}
              onClick={() => setSelectedLeague(SimCFB)}
            >
              CFB
            </PillButton>
            <PillButton
              isSelected={selectedLeague === SimNFL}
              onClick={() => setSelectedLeague(SimNFL)}
            >
              NFL
            </PillButton>
          </ButtonGrid>
        </div>
        
        <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 mt-4">
          <div className="col-span-2 border-r border-white/10 flex flex-col min-h-0">
            <GameMiniList
              title="Upcoming"
              games={upcomingGames}
              color="border-blue-500"
              onSelect={setSelectedGameId}
              broadcastState={broadcastState}
            />
          </div>
          
          <div className="col-span-8 overflow-y-auto custom-scrollbar flex flex-col min-h-0 pb-4">
            <div className="grid grid-cols-2 gap-6 p-2">
              {liveGames.map((g: any) => (
                <div
                  key={g.GameID}
                  onClick={() => setSelectedGameId(g.GameID)}
                  className="bg-(--bg-secondary) p-6 border border-white/10 cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="text-[1.1vh] text-(--text-muted) font-bold mb-3 uppercase flex justify-between">
                    <span>
                      {getPeriodName(g.Period)} | {formatClock(g.TimeOnClock)}
                    </span>
                    <span>
                      {g.Down && g.Distance && g.Down > 0 ? `${g.Down}${getOrdinalSuffix(g.Down)} & ${g.Distance} at ` : ""}
                      {formatYardlineText(g.Zone, g.HomeTeamID, g.AwayTeamID, g.HomeTeam, g.AwayTeam)}
                    </span>
                  </div>{" "}
                  <div className="flex justify-between items-center font-black text-white relative">
                    <span className="text-[1.2vh] text-center flex items-center gap-2">
                      {isPossession(g.Possession, g.AwayTeamID, g.AwayTeam) && <span className="text-yellow-400 text-xs">🏈</span>}
                      <Logo
                        url={getLogo(
                          selectedLeague as League,
                          g.AwayTeamID,
                          currentUser?.IsRetro,
                        )}
                        label={`${g.AwayTeamRank > 0 ? `#${g.AwayTeamRank} ` : ""}${g.AwayTeam}`}
                      />
                    </span>
                    <span className="text-[2.8vh]">{g.AwayTeamScore}</span>
                    <span className="opacity-20 italic">VS</span>
                    <span className="text-[2.8vh]">{g.HomeTeamScore}</span>
                    <span className="text-[1.2vh] text-center flex items-center gap-2">
                      <Logo
                        url={getLogo(
                          selectedLeague as League,
                          g.HomeTeamID,
                          currentUser?.IsRetro,
                        )}
                        label={`${g.HomeTeamRank > 0 ? `#${g.HomeTeamRank} ` : ""}${g.HomeTeam}`}
                      />
                      {isPossession(g.Possession, g.HomeTeamID, g.HomeTeam) && <span className="text-yellow-400 text-xs">🏈</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-2 border-l border-white/10 flex flex-col min-h-0">
            <GameMiniList
              title="Results"
              games={resultsGames}
              color="border-green-500"
              onSelect={setSelectedGameId}
              broadcastState={broadcastState}
            />
          </div>
        </div>
      </div>
    );
  }

  const activeGame = games[selectedGameId];
  const awayIsOffense = isPossession(activeGame.Possession, activeGame.AwayTeamID, activeGame.AwayTeam);
  const homeIsOffense = isPossession(activeGame.Possession, activeGame.HomeTeamID, activeGame.HomeTeam);

  return (
    <div className="h-screen w-full bg-(--bg-primary) pt-[calc(8vh+10px)] flex flex-col p-8 overflow-hidden">
      <button
        onClick={() => setSelectedGameId(null)}
        className="text-(--text-muted) uppercase font-bold mb-4 flex shrink-0 w-fit"
      >
        ← BACK
      </button>
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-10 flex flex-col min-h-0">
          
          <div className="bg-(--bg-secondary) border border-white/10 p-6 flex justify-between items-center text-white shrink-0 shadow-lg z-10">
            <h2 className="flex items-center gap-4 text-2xl font-bold">
                {awayIsOffense && <span className="text-yellow-400">🏈</span>}
                <Logo
                    url={getLogo(selectedLeague as League, activeGame.AwayTeamID, currentUser?.IsRetro)}
                    label=""
                />
                {activeGame.AwayTeam}
            </h2>
            <div className="flex flex-col items-center">
                <span className="text-5xl font-black">
                  {activeGame.AwayTeamScore} - {activeGame.HomeTeamScore}
                </span>
                <span className="text-[1.4vh] text-(--text-muted) font-bold mt-2 uppercase tracking-widest bg-black/30 px-4 py-1 rounded-full">
                  {activeGame.Down && activeGame.Distance && activeGame.Down > 0 ? `${activeGame.Down}${getOrdinalSuffix(activeGame.Down)} & ${activeGame.Distance} | ` : ""}
                  {formatYardlineText(activeGame.Zone, activeGame.HomeTeamID, activeGame.AwayTeamID, activeGame.HomeTeam, activeGame.AwayTeam)}
                </span>
            </div>
            <h2 className="flex items-center gap-4 text-2xl font-bold">
                {activeGame.HomeTeam}
                <Logo
                    url={getLogo(selectedLeague as League, activeGame.HomeTeamID, currentUser?.IsRetro)}
                    label=""
                />
                {homeIsOffense && <span className="text-yellow-400">🏈</span>}
            </h2>
          </div>
          
          {/* Animated Visualizer passing the Combined Result string */}
          <div className="shrink-0 mt-6 flex justify-center w-full">
            <div className="w-2/3 max-w-3xl">
                <GridironVisualizer
                  ballX={parseBallX(activeGame.Zone, activeGame.HomeTeamID, activeGame.AwayTeamID)}
                  playType={combinedPlayTypeStr}
                  resultCategory={activeResultCategory as any}
                  playId={activePlayCounter}
                  homeName={activeGame.HomeTeam}
                  awayName={activeGame.AwayTeam}
                  yards={activeYards}
                  isHomeOffense={homeIsOffense}
                />
            </div>
          </div>
          
          <div className="p-4 bg-black/20 mt-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-white/5 shadow-inner">
            {(isFirebaseMode && !isSpoofing
              ? [...(shownPlays[activeGame.GameID] ?? [])].reverse()
              : (currentPlaysRef.current[activeGame.GameID] ?? [])
            ).map((p: any, i: number) => {
              
              const qtr = p.Quarter || p.Period || p.quarter || 1;
              const clock = p['Time Remaining'] || p.TimeRemaining || p.TimeOnClock || "15:00";

              const streamRes = Array.isArray(p.StreamResult) ? p.StreamResult.join(' ') : p.StreamResult;
              const resultText = isFirebaseMode && !isSpoofing ? getPlayText(p) : (streamRes || p.Result || p.PlayText || JSON.stringify(p));
              
              const type = p['Type of Play'] || p.PlayType;
              const offForm = p['Offensive Formation'] || p.OffensiveFormation;
              const defForm = p['Defensive Formation'] || p.DefensiveFormation;
              const yards = p['Yards Gained'] ?? p.ResultYards;

              return (
                <div
                  key={i}
                  className="text-white text-[1.4vh] py-3 border-b border-white/5 flex gap-4 items-start hover:bg-white/5 transition-colors px-2 rounded"
                >
                  <div className="font-bold text-(--text-muted) shrink-0 w-24 flex flex-col border-r border-white/10 pr-3 text-right">
                    <span>{getPeriodName(qtr)}</span>
                    <span className="text-(--text-primary)">{formatClock(clock)}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1">
                      <div className="leading-relaxed text-(--text-primary)">
                          {resultText}
                      </div>
                      
                      {!isFirebaseMode && isSpoofing && (type || offForm || defForm || yards !== undefined) && (
                          <div className="flex gap-4 text-[1.1vh] text-(--text-muted) font-bold uppercase tracking-widest mt-1 opacity-70">
                              {type && type !== "N/A" && type !== "nan" && <span>TYPE: {type}</span>}
                              {offForm && offForm !== "N/A" && offForm !== "nan" && <span>OFF: {offForm}</span>}
                              {defForm && defForm !== "N/A" && defForm !== "nan" && <span>DEF: {defForm}</span>}
                              {yards !== undefined && yards !== null && !isNaN(yards) && <span>YDS: {yards}</span>}
                          </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="col-span-2 flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <TeamStatsSidebar
              title="Away Team"
              teamName={activeGame.AwayTeam}
              stats={{
                isOffense: awayIsOffense,
                formation: awayIsOffense ? activeGame.LastOffForm : activeGame.LastDefForm,
                tendency: awayIsOffense ? null : activeGame.LastDefTend,
                lastPlay: activeGame.LastPlayType ? `${activeGame.LastPlayType} ${activeGame.LastPlayName ? `(${activeGame.LastPlayName})` : ''}` : null,
                yards: activeGame.LastYards
              }}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <TeamStatsSidebar
              title="Home Team"
              teamName={activeGame.HomeTeam}
              stats={{
                isOffense: homeIsOffense,
                formation: homeIsOffense ? activeGame.LastOffForm : activeGame.LastDefForm,
                tendency: homeIsOffense ? null : activeGame.LastDefTend,
                lastPlay: activeGame.LastPlayType ? `${activeGame.LastPlayType} ${activeGame.LastPlayName ? `(${activeGame.LastPlayName})` : ''}` : null,
                yards: activeGame.LastYards
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveField;