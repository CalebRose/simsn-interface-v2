import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useAuthStore } from "../../../context/AuthContext";
import { SimCFB, SimNFL, League } from "../../../_constants/constants";
import { PillButton, ButtonGrid } from "../../../_design/Buttons";
import { fbaUrl } from "../../../_constants/urls";
import { useLiveFieldState } from "../../../_hooks/useLiveFieldState";
import { TeamStatsSidebar } from "./TeamStatsSidebar";
import { GridironVisualizer } from "./GridironVisualizer";
import { useSimFBAStore } from "../../../context/SimFBAContext";

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
  const { isModerator } = useAuthStore();
  const { ts, selectedLeague, setSelectedLeague } = useLeagueStore();
  const { allCollegeGames, allProGames, cfb_Timestamp } = useSimFBAStore();
  const { liveGames: firebaseGames } = useLiveFieldState(
    selectedLeague as League,
  );

  const [games, setGames] = useState<Record<number, any>>({});
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [isSpoofing, setIsSpoofing] = useState(false);
  const [broadcastState, setBroadcastState] = useState<
    "IDLE" | "GENERATING" | "BROADCASTING"
  >("IDLE");

  const bulkPlaysRef = useRef<Record<number, any[]>>({});
  const currentPlaysRef = useRef<Record<number, any[]>>({});

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

  // Setup a useMemo for college games/nfl games & filter by the current season and week && preseason game status (use timestamp to check if it's preseason)

  // Initialize and Merge Data
  useEffect(() => {
    const fetchAndStitch = async () => {
      if (!rawSeasonID) return;
      const endpoint = isCFB ? "cfb" : "nfl";
      const gamesToUse = isCFB ? allCollegeGames : allProGames;

      let apiResults: any[] = [];
      try {
        const res = await fetch(
          `${fbaUrl}games/${endpoint}/season/${rawSeasonID}`,
        );
        if (res.ok) apiResults = await res.json();
      } catch (e) {
        console.error("API Fetch Error:", e);
      }

      const stitched: Record<number, any> = {};
      firebaseGames.forEach((fg: any) => {
        const id = Number(fg.GameID || fg.ID);

        stitched[id] = {
          GameID: id,
          HomeTeam: fg.HomeTeam,
          AwayTeam: fg.AwayTeam,
          HomeTeamScore: 0,
          AwayTeamScore: 0,
          Period: 0,
          TimeOnClock: 900,
          GameComplete: false,
          IsRevealed: false,
          Zone: fg.YardLine || "50",
        };
      });
      setGames(stitched);
    };
    fetchAndStitch();
  }, [firebaseGames, selectedLeague, rawSeasonID, isCFB]);

  // Broadcast Engine
  const triggerEngine = async () => {
    setBroadcastState("GENERATING");
    try {
      await fetch(`${fbaUrl}admin/run/the/games/`);
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

  // Simulation Loop
  useEffect(() => {
    if (!isSpoofing) return;
    const interval = setInterval(() => {
      setGames((prev) => {
        const newGames = { ...prev };
        Object.values(newGames).forEach((g: any) => {
          if (g.GameComplete) return;
          const plays = bulkPlaysRef.current[g.GameID] || [];
          if (plays.length === 0) {
            g.GameComplete = true;
            g.IsRevealed = true;
            return;
          }
          const play = plays.pop()!;
          g.Period = play.Quarter || g.Period;
          g.TimeOnClock = play.TimeRemaining || g.TimeOnClock;
          g.HomeTeamScore = play.HomeTeamScore ?? g.HomeTeamScore;
          g.AwayTeamScore = play.AwayTeamScore ?? g.AwayTeamScore;
          g.Zone = play.YardLine || g.Zone;
          currentPlaysRef.current[g.GameID] =
            currentPlaysRef.current[g.GameID] || [];
          currentPlaysRef.current[g.GameID].unshift(play);
        });
        return { ...newGames };
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isSpoofing]);

  if (selectedGameId === null) {
    return (
      <div className="h-screen w-full bg-(--bg-primary) pt-[calc(8vh+10px)] flex flex-col overflow-hidden text-left p-8">
        {isModerator && (
          <div className="bg-(--bg-secondary) border border-(--border-primary) p-4 mb-6 flex justify-between items-center rounded">
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
        <div className="flex gap-4">
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
        <div className="grid grid-cols-12 gap-4 h-full mt-4">
          <div className="col-span-2 border-r border-white/10">
            <GameMiniList
              title="Upcoming"
              games={Object.values(games).filter(
                (g) => !g.GameComplete && !g.IsRevealed,
              )}
              color="border-blue-500"
              onSelect={setSelectedGameId}
              broadcastState={broadcastState}
            />
          </div>
          <div className="col-span-8 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              {Object.values(games)
                .filter((g) => !g.GameComplete && !g.IsRevealed && g.Period > 0)
                .map((g) => (
                  <div
                    key={g.GameID}
                    onClick={() => setSelectedGameId(g.GameID)}
                    className="bg-(--bg-secondary) p-6 border border-white/10 cursor-pointer"
                  >
                    <div className="text-white font-black text-2xl">
                      {g.AwayTeamScore} - {g.HomeTeamScore}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="col-span-2 border-l border-white/10">
            <GameMiniList
              title="Results"
              games={Object.values(games).filter(
                (g) => g.GameComplete || g.IsRevealed,
              )}
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
        className="text-(--text-muted) uppercase font-bold mb-4"
      >
        ← BACK
      </button>
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-10">
          <div className="bg-(--bg-secondary) border border-white/10 p-6 flex justify-between items-center text-white">
            <h2>{activeGame.AwayTeam}</h2>
            <span className="text-5xl font-black">
              {activeGame.AwayTeamScore} - {activeGame.HomeTeamScore}
            </span>
            <h2>{activeGame.HomeTeam}</h2>
          </div>
          <GridironVisualizer
            ballX={activeGame.Zone}
            playType="IDLE"
            homeName={activeGame.HomeTeam}
            awayName={activeGame.AwayTeam}
          />
          <div className="p-4 bg-black/20 mt-4 h-64 overflow-y-auto">
            {(currentPlaysRef.current[activeGame.GameID] || []).map(
              (p: any, i: number) => (
                <div
                  key={i}
                  className="text-white text-xs py-1 border-b border-white/5"
                >
                  {p.PlayText}
                </div>
              ),
            )}
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
