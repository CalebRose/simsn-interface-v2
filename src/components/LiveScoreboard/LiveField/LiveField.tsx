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
  const MAX_CONCURRENT_GAMES = 8;

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

  // isSpringGame check
  const isSpringGame = useMemo(() => {
    if (isCFB) {
      return cfb_Timestamp?.CFBSpringGames ?? false;
    }
    return cfb_Timestamp?.NFLPreseason ?? false;
  }, [isCFB, cfb_Timestamp]);

  // Seed local games state from Firebase docs whenever they change.
  // Only used by the manual broadcast engine when isFirebaseMode is false.
  useEffect(() => {
    if (!rawSeasonID || firebaseRawGames.length === 0) return;
    const stitched: Record<number, any> = {};
    firebaseRawGames.forEach((fg) => {
      stitched[fg.GameID] = {
        GameID: fg.GameID,
        HomeTeam: fg.HomeTeam,
        AwayTeam: fg.AwayTeam,
        HomeTeamScore: 0,
        AwayTeamScore: 0,
        Period: 0,
        TimeOnClock: 900,
        GameComplete: false,
        IsRevealed: false,
        Zone: "50",
      };
    });
    setGames(stitched);
  }, [firebaseRawGames, rawSeasonID]);

// Broadcast Engine
  const triggerEngine = async () => {
    setBroadcastState("GENERATING");
    try {
      const endpoint = selectedLeague === SimCFB ? "cfb" : "nfl";
      const isCFB = selectedLeague === SimCFB;
      const url = `${fbaUrl}games/plays/bulk/${endpoint}?isCollege=${isCFB}&season=${rawSeasonID}&week=${currentWeek}&is_spring_game=${isSpringGame}`;

      console.log("🏈 1. FETCHING FROM URL:", url);
      const playsRes = await fetch(url);

      if (playsRes.ok) {
        const playData = await playsRes.json();
        
        bulkPlaysRef.current = playData.Plays || playData || {};

        const apiGameIds = Object.keys(bulkPlaysRef.current);
        const firebaseGameIds = Object.keys(games);

        console.log("🏈 2. RAW PLAY DATA RECEIVED:", playData);
        console.log("🏈 3. API GAME IDs WITH PLAYS:", apiGameIds);
        console.log("🏈 4. FIREBASE GAME IDs WAITING FOR PLAYS:", firebaseGameIds);
        console.log("🏈 5. PLAYS FOR GAME 9933:", bulkPlaysRef.current['9933']);

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

  // Simulation Loop
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
          // If the play has a quarter, use it. Otherwise, force it to 1 so the UI sees it as "Live".
          g.Period = play.Quarter || (g.Period === 0 ? 1 : g.Period);
          g.TimeOnClock = play.TimeRemaining || g.TimeOnClock;
          g.HomeTeamScore = play.HomeTeamScore ?? g.HomeTeamScore;
          g.AwayTeamScore = play.AwayTeamScore ?? g.AwayTeamScore;
          g.Zone = play.YardLine || g.Zone;
          currentPlaysRef.current[g.GameID] =
            currentPlaysRef.current[g.GameID] || [];
          currentPlaysRef.current[g.GameID].unshift(play);
          const isTouchdown =
            play.StreamResult?.findIndex(
              (result: any) => result === "TOUCHDOWN",
            ) !== -1;
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
    // Firebase Mode: Must not be revealed AND must have actually started (plays exist, or clock ticked, or Period > 1)
    if (isFirebaseMode && !isSpoofing) {
      return Object.values(liveGameStates).filter((g: any) => {
        if (g.IsRevealed) return false;
        const p = g.Period || g.Quarter || 0;
        const t = g.TimeOnClock;
        const plays = shownPlays[g.GameID] || [];
        // True if plays have fired, OR period > 1, OR it's period 1 but clock is no longer 15:00
        return plays.length > 0 || p > 1 || (p === 1 && t !== 900 && t !== "15:00");
      });
    }
    // Broadcast Mode
    return allGames.filter((g: any) => !g.GameComplete && (g.Period || 0) > 0);
  }, [isFirebaseMode, isSpoofing, liveGameStates, allGames, shownPlays]);

  const upcomingGames = useMemo(() => {
    // Firebase Mode: If missing from Firebase completely, OR present but hasn't met the "Live" criteria
    if (isFirebaseMode && !isSpoofing) {
      return allGames.filter((g: any) => {
        if (g.GameComplete) return false;
        
        const fbGame = liveGameStates[g.GameID] as any;
        if (!fbGame) return true; // No firebase data yet, so it's upcoming
        if (fbGame.IsRevealed) return false;
        
        const p = fbGame.Period || fbGame.Quarter || 0;
        const t = fbGame.TimeOnClock;
        const plays = shownPlays[g.GameID] || [];
        
        // If it meets the live conditions, it is NOT upcoming
        const isLive = plays.length > 0 || p > 1 || (p === 1 && t !== 900 && t !== "15:00");
        return !isLive;
      });
    }
    // Broadcast Mode
    return allGames.filter((g: any) => !g.GameComplete && (g.Period || 0) === 0);
  }, [isFirebaseMode, isSpoofing, liveGameStates, allGames, shownPlays]);

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
        
        {/* Flex-1 and min-h-0 to act as a proper flex boundary for scrolling */}
        <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 mt-4">
          
          {/* Flex flex-col min-h-0 to cage the column */}
          <div className="col-span-2 border-r border-white/10 flex flex-col min-h-0">
            <GameMiniList
              title="Upcoming"
              games={upcomingGames}
              color="border-blue-500"
              onSelect={setSelectedGameId}
              broadcastState={broadcastState}
            />
          </div>
          
          {/* Center Column with custom-scrollbar */}
          <div className="col-span-8 overflow-y-auto custom-scrollbar flex flex-col min-h-0 pb-4">
            <div className="grid grid-cols-2 gap-6 p-2">
              {liveGames.map((g: any) => (
                <div
                  key={g.GameID}
                  onClick={() => setSelectedGameId(g.GameID)}
                  className="bg-(--bg-secondary) p-6 border border-white/10 cursor-pointer"
                >
                  <div className="text-[1.1vh] text-(--text-muted) font-bold mb-3 uppercase flex justify-between">
                    <span>
                      {getPeriodName(g.Period)} | {formatClock(g.TimeOnClock)}
                    </span>
                    <span>{g.Zone} Yardline</span>
                  </div>{" "}
                  <div className="flex justify-between items-center font-black text-white">
                    <span className="text-[1.2vh] text-center">
                      <Logo
                        url={getLogo(
                          selectedLeague as League,
                          g.HomeTeamID,
                          currentUser?.IsRetro,
                        )}
                        label={`${g.HomeTeamRank > 0 ? `#${g.HomeTeamRank} ` : ""}${g.HomeTeam}`}
                      />
                    </span>
                    <span className="text-[2.8vh]">{g.HomeTeamScore}</span>
                    <span className="opacity-20 italic">VS</span>
                    <span className="text-[2.8vh]">{g.AwayTeamScore}</span>
                    <span className="text-[1.2vh] text-center">
                      <Logo
                        url={getLogo(
                          selectedLeague as League,
                          g.AwayTeamID,
                          currentUser?.IsRetro,
                        )}
                        label={`${g.AwayTeamRank > 0 ? `#${g.AwayTeamRank} ` : ""}${g.AwayTeam}`}
                      />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Flex flex-col min-h-0 to cage the column */}
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
  return (
    <div className="h-screen w-full bg-(--bg-primary) pt-[calc(8vh+10px)] flex flex-col p-8 overflow-hidden">
      <button
        onClick={() => setSelectedGameId(null)}
        className="text-(--text-muted) uppercase font-bold mb-4 flex shrink-0"
      >
        ← BACK
      </button>
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-10 flex flex-col min-h-0">
          <div className="bg-(--bg-secondary) border border-white/10 p-6 flex justify-between items-center text-white shrink-0">
            <h2>{activeGame.AwayTeam}</h2>
            <span className="text-5xl font-black">
              {activeGame.AwayTeamScore} - {activeGame.HomeTeamScore}
            </span>
            <h2>{activeGame.HomeTeam}</h2>
          </div>
          
          <div className="shrink-0 mt-4">
            <GridironVisualizer
              ballX={activeGame.Zone}
              playType="IDLE"
              homeName={activeGame.HomeTeam}
              awayName={activeGame.AwayTeam}
            />
          </div>
          
          <div className="p-4 bg-black/20 mt-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {(isFirebaseMode && !isSpoofing
              ? [...(shownPlays[activeGame.GameID] ?? [])].reverse()
              : (currentPlaysRef.current[activeGame.GameID] ?? [])
            ).map((p: any, i: number) => (
              <div
                key={i}
                className="text-white text-xs py-1 border-b border-white/5"
              >
                {isFirebaseMode && !isSpoofing ? getPlayText(p) : p.PlayText}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <TeamStatsSidebar
            title="Stats"
            teamName={activeGame.HomeTeam}
            stats={null}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveField;