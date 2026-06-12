import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useAuthStore } from "../../../context/AuthContext";
import { SimCHL, SimPHL, League } from "../../../_constants/constants";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { hckUrl } from "../../../_constants/urls";
import { Timestamp } from "../../../models/hockeyModels";
import {
  useLiveRinkState,
  getPlayText,
  LivePlayDoc,
} from "../../../_hooks/useLiveRinkState";
import { Logo } from "../../../_design/Logo";
import { getLogo } from "../../../_utility/getLogo";

// --- HELPER FUNCTIONS ---
const getPeriodName = (p: number, isSO: boolean = false) => {
  if (isSO || p === 5) return "SO";
  if (p === 4) return "OT";
  if (p === 0) return "1st";
  if (p === 1) return "1st";
  if (p === 2) return "2nd";
  if (p === 3) return "3rd";
  return `P${p}`;
};

const formatClock = (seconds: number | string) => {
  if (typeof seconds === "string") {
    if (seconds.includes(":")) return seconds;
    seconds = parseInt(seconds, 10);
  }
  if (isNaN(seconds as number)) return "20:00";

  const m = Math.floor((seconds as number) / 60);
  const s = (seconds as number) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// --- SUB-COMPONENTS ---
const GameMiniList = React.memo(
  ({
    title,
    games,
    color,
    onSelect,
    userTeamID,
    broadcastState,
  }: {
    title: string;
    games: any[];
    color: string;
    onSelect: (id: number) => void;
    userTeamID?: number;
    broadcastState: "IDLE" | "GENERATING" | "BROADCASTING";
  }) => (
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
        {games.length === 0 ? (
          <p className="text-tiny text-(--text-muted) italic text-left opacity-40 px-3">
            No games found.
          </p>
        ) : (
          games.map((game) => {
            const isMyTeam =
              game.HomeTeamID === userTeamID || game.AwayTeamID === userTeamID;
            const isComplete =
              game.GameComplete || game.Finished || game.GameFinished || false;
            const homeScore = game.HomeTeamScore ?? game.HomeScore ?? 0;
            const awayScore = game.AwayTeamScore ?? game.AwayScore ?? 0;
            const homeName = game.HomeTeam ?? game.HomeTeamName ?? "HOME";
            const awayName = game.AwayTeam ?? game.AwayTeamName ?? "AWAY";

            return (
              <button
                key={game.GameID}
                disabled={broadcastState !== "BROADCASTING"}
                onClick={() => onSelect(game.GameID)}
                className={`w-full bg-(--bg-secondary) border ${isMyTeam ? "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]" : "border-(--border-primary)"} rounded p-3 shadow-sm hover:border-(--text-muted) hover:bg-white/5 transition-all text-left cursor-pointer shrink-0`}
              >
                <div>
                  <div className="flex justify-between text-[1vh] font-bold text-(--text-muted) mb-1 uppercase">
                    <div className="flex items-center gap-2">
                      <span>
                        {isComplete
                          ? "FINAL"
                          : game.Period > 0
                            ? getPeriodName(game.Period)
                            : "SCHEDULED"}
                      </span>
                      {isMyTeam && (
                        <span className="bg-yellow-500/20 text-yellow-500 px-1 rounded">
                          MY TEAM
                        </span>
                      )}
                    </div>
                    <span>ID: {game.GameID}</span>
                  </div>
                  <div className="flex justify-between items-center text-[1.4vh] font-black text-(--text-primary)">
                    <span
                      className={
                        game.HomeTeamID === userTeamID ? "text-yellow-400" : ""
                      }
                    >
                      {homeName}
                    </span>
                    <span className="text-(--text-muted) font-normal px-2 text-[1vh]">
                      @
                    </span>
                    <span
                      className={
                        game.AwayTeamID === userTeamID ? "text-yellow-400" : ""
                      }
                    >
                      {awayName}
                    </span>
                  </div>
                  {isComplete && (
                    <div className="mt-1 text-right text-[1.6vh] font-mono font-bold text-(--accent-success)">
                      {homeScore} - {awayScore}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  ),
);

const TeamStatsSidebar = React.memo(
  ({
    title,
    teamName,
    stats,
  }: {
    title: string;
    teamName: string;
    stats: any;
  }) => {
    const StatRow = ({
      name,
      value,
    }: {
      name: string;
      value: string | number;
    }) => (
      <div className="flex justify-between items-center py-2 px-3 border-b border-(--border-primary)/20 last:border-0 text-[1.2vh] shrink-0">
        <span className="text-(--text-primary) font-medium text-left">
          {name}
        </span>
        <span className="font-mono font-bold text-(--text-muted) text-right">
          {value}
        </span>
      </div>
    );

    return (
      <div className="bg-(--bg-secondary) border border-(--border-primary) rounded-lg h-full flex flex-col min-h-0 shadow-sm overflow-hidden py-4">
        <div className="px-3 pb-3 border-b border-(--border-primary) shrink-0">
          <h3 className="text-[1.3vh] font-black text-white uppercase tracking-widest text-left">
            {title}
          </h3>
          <p className="text-[1vh] text-(--accent-error) font-bold text-left uppercase">
            {teamName}
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-4 mt-2">
          {!stats ? (
            <div className="mt-4 p-3 opacity-30 italic text-[1vh] text-center">
              No Data
            </div>
          ) : (
            <>
              <StatRow name="Shots on Goal" value={stats.ShotsOnGoal || 0} />
              <StatRow name="Hits" value={stats.Hits || 0} />
              <StatRow name="Faceoffs Won" value={stats.FaceoffsWon || 0} />
              <StatRow
                name="Penalty Minutes"
                value={stats.PenaltyMinutes || 0}
              />
              <StatRow
                name="Powerplay Goals"
                value={stats.PowerplayGoals || 0}
              />
            </>
          )}
        </div>
      </div>
    );
  },
);

const RinkVisualizer = React.memo(
  ({
    currentZone,
    goalScored,
  }: {
    currentZone: string;
    goalScored: boolean;
  }) => {
    console.log({ currentZone, goalScored });
    let puckPosition = "50%";
    if (currentZone && currentZone.toLowerCase().includes("home") && goalScored)
      puckPosition = "98%";
    if (currentZone && currentZone.toLowerCase().includes("home zone"))
      puckPosition = "80%";
    if (currentZone && currentZone.toLowerCase().includes("home goal"))
      puckPosition = "90%";
    if (currentZone && currentZone.toLowerCase().includes("away zone"))
      puckPosition = "20%";
    if (currentZone && currentZone.toLowerCase().includes("away goal"))
      puckPosition = "10%";
    if (currentZone && currentZone.toLowerCase().includes("away") && goalScored)
      puckPosition = "2%";

    return (
      <div className="bg-(--bg-surface) p-2 border-x border-b border-(--border-primary) shrink-0 relative overflow-hidden">
        {goalScored && (
          <div className="absolute inset-0 bg-red-600/50 z-50 animate-ping flex items-center justify-center">
            <span className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-lg">
              GOAL!
            </span>
          </div>
        )}
        <div className="flex w-full h-[18vh] bg-blue-50/10 border-4 border-blue-900 rounded-[60px] overflow-hidden relative shadow-inner">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-red-600 -ml-0.5 z-10" />
          <div className="absolute left-1/2 top-1/2 w-12 h-12 border-2 border-blue-500 rounded-full -ml-6 -mt-6 z-10" />
          <div className="absolute left-[35%] top-0 bottom-0 w-1 bg-blue-600 z-10" />
          <div className="absolute right-[35%] top-0 bottom-0 w-1 bg-blue-600 z-10" />
          <div className="absolute left-0 top-1/2 w-8 h-12 bg-blue-500/30 border-2 border-red-500 rounded-r-full -mt-6 z-10" />
          <div className="absolute right-0 top-1/2 w-8 h-12 bg-blue-500/30 border-2 border-red-500 rounded-l-full -mt-6 z-10" />
          <div
            className="absolute top-1/2 -mt-2 w-4 h-4 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20 transition-all duration-700 ease-in-out"
            style={{ left: puckPosition, marginLeft: "-0.5rem" }}
          >
            <div className="absolute inset-1 bg-gray-800 rounded-full" />
          </div>
          <div className="absolute bottom-2 left-1/2 -ml-12 bg-black/70 text-white px-3 py-1 rounded text-[1vh] font-bold uppercase tracking-wider z-10 border border-white/20">
            {currentZone || "Neutral Zone"}
          </div>
        </div>
      </div>
    );
  },
);

// --- MAIN COMPONENT ---
const LiveRink = () => {
  const { currentUser, isModerator } = useAuthStore();
  const { ts } = useLeagueStore();
  const [selectedLeague, setSelectedLeague] = useState<League>(SimCHL);
  const [games, setGames] = useState<Record<number, any>>({});
  const [gameDetails, setGameDetails] = useState<any>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [goalFlash, setGoalFlash] = useState<Record<number, boolean>>({});
  const [isSpoofing, setIsSpoofing] = useState(false);
  const [broadcastState, setBroadcastState] = useState<
    "IDLE" | "GENERATING" | "BROADCASTING"
  >("IDLE");
  const [liveBoxScores, setLiveBoxScores] = useState<Record<number, any>>({});
  const bulkPlaysRef = useRef<Record<number, any[]>>({});
  const currentPlaysRef = useRef<Record<number, any[]>>({});
  const gameCooldowns = useRef<Record<number, number>>({});
  const MAX_CONCURRENT_GAMES = 8;

  // ── Firebase live stream ─────────────────────────────────────────────────
  const {
    isFirebaseMode,
    isReady,
    liveGameStates,
    shownPlays,
    goalFlashGames,
  } = useLiveRinkState(selectedLeague);
  // ─────────────────────────────────────────────────────────────────────────

  // --- DYNAMIC HOCKEY TIMESTAMP ---
  const chlTs = ts as any;
  const rawSeasonID = useMemo(() => {
    if (chlTs?.SeasonID && chlTs?.SeasonID < 100) return chlTs?.SeasonID;
    return 2;
  }, [chlTs]);
  const currentSeason = useMemo(() => 2024 + rawSeasonID, [rawSeasonID]);
  const currentWeek = useMemo(() => {
    return chlTs?.HockeyWeek || chlTs?.Week || chlTs?.CHLWeek || 8;
  }, [chlTs]);

  const userTeamID = useMemo(() => {
    return selectedLeague === SimCHL
      ? currentUser?.teamId
      : currentUser?.PHLTeamID;
  }, [selectedLeague, currentUser]);

  // --- TEST MODE FORCE ACTION BAR ---
  const isAdmin = isModerator || false;
  // ----------------------------------

  const getStatsForGame = useCallback(
    (gameId: number) => {
      if (liveBoxScores[gameId]) return liveBoxScores[gameId];
      return gameDetails;
    },
    [liveBoxScores, gameDetails],
  );

  // FETCH REAL HOCKEY DATA

  useEffect(() => {
    if (!currentWeek || !rawSeasonID) return;
    const isCHL = selectedLeague === SimCHL;
    const timestamp = ts as Timestamp;
    let gameDay = "A";
    if (timestamp?.GamesARan) gameDay = "B";
    if (timestamp?.GamesBRan) gameDay = "C";

    // Dynamic endpoint based on the selected league
    const leagueEndpoint = isCHL ? "chl" : "phl";
    const fetchUrl = `${hckUrl}games/live/${leagueEndpoint}?isCollege=${isCHL}&season=${rawSeasonID}&week=${currentWeek}&timeslot=${gameDay}`;
    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const stitchedGames: Record<number, any> = {};

          data.forEach((g: any) => {
            if (!g) return;
            const gameId = g.GameID ?? g.id ?? g.GameId;
            if (!gameId) return;

            const targetWeek = g.Week ?? g.WeekID ?? g["Week"] ?? 0;

            // Allow loose matching to catch "8a" edge cases
            if (String(targetWeek) !== String(currentWeek)) return;
            if (!stitchedGames[gameId]) {
              stitchedGames[gameId] = {
                GameID: gameId,
                Week: targetWeek,
                HomeTeam:
                  g.HomeTeam ??
                  g.HomeTeamAbbreviation ??
                  g.HomeTeamName ??
                  "HOME",
                AwayTeam:
                  g.AwayTeam ??
                  g.AwayTeamAbbreviation ??
                  g.AwayTeamName ??
                  "AWAY",

                // Real data passthrough
                HomeTeamScore: g.HomeTeamScore ?? g.HomeScore ?? 0,
                AwayTeamScore: g.AwayTeamScore ?? g.AwayScore ?? 0,
                Period: g.Period ?? 0,
                TimeOnClock: g.TimeOnClock ?? 1200,
                GameComplete:
                  g.GameComplete ?? g.Finished ?? g.GameFinished ?? false,
                Zone: g.Zone ?? "Neutral",
              };
            }
          });
          setGames(stitchedGames);
        } else {
          setGames(data || {});
        }
      })
      .catch((err) => console.error("Error fetching live hockey games:", err));
  }, [selectedLeague, rawSeasonID, currentWeek]);

  // Fetch Game Details on Selection
  useEffect(() => {
    if (selectedGameId !== null) {
      const isCHL = selectedLeague === SimCHL;
      const detailEndpoint = isCHL
        ? `${hckUrl}games/result/chl/${selectedGameId}`
        : `${hckUrl}games/result/phl/${selectedGameId}`;
      fetch(detailEndpoint)
        .then((res) => res.json())
        .then((data) => {
          if (isSpoofing)
            setGameDetails({
              ...data,
              Feeds: currentPlaysRef.current[selectedGameId] || [],
            });
          else setGameDetails(data);
        })
        .catch((err) => console.error("Error fetching game details:", err));
    }
  }, [selectedGameId, isSpoofing, selectedLeague]);

  const triggerScore = (gameId: number) => {
    setGoalFlash((prev) => ({ ...prev, [gameId]: true }));
    setTimeout(
      () => setGoalFlash((prev) => ({ ...prev, [gameId]: false })),
      4000,
    );
  };

  const triggerEngineAndBroadcast = async () => {
    if (Object.keys(games).length === 0) return;
    setBroadcastState("GENERATING");
    const isCHL = selectedLeague === SimCHL;

    try {
      // await fetch(`${hckUrl}admin/run-games`, { method: "POST" }).catch(() =>
      //   console.log("Engine run call finished."),
      // );

      let playData: any = null;
      try {
        const res = await fetch(
          `${hckUrl}games/plays/bulk/chl?isCollege=${isCHL}&season=${rawSeasonID}&week=${currentWeek}`,
        );
        if (res.ok) playData = await res.json();
      } catch (e) {
        console.log("Could not fetch real plays, falling back to mock data.");
      }

      // If your backend returned valid plays, use them. Otherwise, fall back to our local mocks for visual testing.
      if (
        playData &&
        playData.Plays &&
        Object.keys(playData.Plays).length > 0
      ) {
        bulkPlaysRef.current = playData.Plays;
        setLiveBoxScores(playData.Rosters || {});
        Object.keys(bulkPlaysRef.current).forEach((gId) => {
          bulkPlaysRef.current[Number(gId)].reverse();
        });
      } else {
        const mockedPlays: Record<number, any[]> = {};
        Object.values(games).forEach((g: any) => {
          mockedPlays[g.GameID] = [
            {
              Period: 1,
              TimeOnClock: 1200,
              HomeTeamScore: 0,
              AwayTeamScore: 0,
              Zone: "Neutral",
              PlayText: "Puck is dropped! Faceoff won by the home team.",
            },
            {
              Period: 1,
              TimeOnClock: 1145,
              HomeTeamScore: 0,
              AwayTeamScore: 0,
              Zone: "Offensive",
              PlayText: "Slapshot from the point... blocked by the defense.",
            },
            {
              Period: 1,
              TimeOnClock: 1020,
              HomeTeamScore: 1,
              AwayTeamScore: 0,
              Zone: "Offensive",
              PlayText:
                "GOAL!!! The home team strikes first on a beautiful cross-crease pass!",
            },
            {
              Period: 1,
              TimeOnClock: 980,
              HomeTeamScore: 1,
              AwayTeamScore: 0,
              Zone: "Defensive",
              PlayText: "Away team enters the zone, looking for an equalizer.",
            },
            {
              Period: 1,
              TimeOnClock: 850,
              HomeTeamScore: 1,
              AwayTeamScore: 1,
              Zone: "Defensive",
              PlayText:
                "GOAL! A quick wrist shot finds the back of the net. We are tied 1-1!",
            },
            {
              Period: 1,
              TimeOnClock: 500,
              HomeTeamScore: 1,
              AwayTeamScore: 1,
              Zone: "Neutral",
              PlayText:
                "End of the first period. Teams head to the locker room.",
            },
          ];
          mockedPlays[g.GameID].reverse();
        });
        bulkPlaysRef.current = mockedPlays;
        setLiveBoxScores({});
      }

      const resetGames: Record<number, any> = {};
      Object.values(games).forEach((g: any, i: number) => {
        resetGames[g.GameID] = {
          ...g,
          HomeTeamScore: 0,
          AwayTeamScore: 0,
          Period: i < MAX_CONCURRENT_GAMES ? 1 : 0,
          TimeOnClock: 1200,
          GameComplete: false,
          Zone: "Neutral",
        };
        currentPlaysRef.current[g.GameID] = [];
        gameCooldowns.current[g.GameID] = 0;
      });
      setGames(resetGames);

      setBroadcastState("BROADCASTING");
      setIsSpoofing(true);
    } catch (e) {
      console.error("Failed to run broadcast:", e);
      setBroadcastState("IDLE");
    }
  };

  // Hockey Simulation Loop
  useEffect(() => {
    if (!isSpoofing) return;
    const interval = setInterval(() => {
      setGames((prevGames) => {
        const newGames = { ...prevGames };
        const now = Date.now();

        let activeCount = Object.values(newGames).filter(
          (g: any) => !g.GameComplete && g.Period > 0,
        ).length;
        const upcomingList = Object.values(newGames).filter(
          (g: any) => !g.GameComplete && g.Period === 0,
        );

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
          const isGoal = play.PlayText && play.PlayText.includes("GOAL");

          if (isGoal) triggerScore(g.GameID);

          Object.assign(g, {
            Period: play.Period || g.Period,
            TimeOnClock: play.TimeOnClock || g.TimeOnClock,
            HomeTeamScore: play.HomeTeamScore ?? g.HomeTeamScore,
            AwayTeamScore: play.AwayTeamScore ?? g.AwayTeamScore,
            Zone: play.Zone || g.Zone,
          });

          currentPlaysRef.current[g.GameID].unshift(play);
          gameCooldowns.current[g.GameID] = now + (isGoal ? 6000 : 2500);

          if (selectedGameId === g.GameID) {
            setGameDetails((prev: any) => ({
              ...prev,
              Feeds: [...currentPlaysRef.current[g.GameID]],
            }));
          }
        });

        if (!anyRunning && upcomingList.length === 0) {
          setIsSpoofing(false);
          setBroadcastState("IDLE");
        }
        return { ...newGames };
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isSpoofing, selectedGameId]);

  // When Firebase has unrevealed games use that as the source of truth;
  // otherwise fall back to the local spoof state from triggerEngineAndBroadcast.
  const effectiveGames = useMemo<Record<number, any>>(
    () => (isFirebaseMode ? liveGameStates : games),
    [isFirebaseMode, liveGameStates, games],
  );
  const effectiveBroadcastState = isFirebaseMode
    ? ("BROADCASTING" as const)
    : broadcastState;
  const effectiveGoalFlash = useCallback(
    (gameId: number): boolean =>
      isFirebaseMode ? goalFlashGames.has(gameId) : !!goalFlash[gameId],
    [isFirebaseMode, goalFlashGames, goalFlash],
  );

  const allGames = useMemo(() => Object.values(games), [games]);
  const upcomingGames = useMemo(
    () =>
      allGames.filter(
        (g) =>
          !g.GameComplete &&
          (g.Period === 0 || !g.Period) &&
          effectiveGames[g.GameID] === undefined,
      ),
    [allGames, effectiveGames],
  );
  const liveGames = useMemo(
    () => Object.values(liveGameStates),
    [liveGameStates],
  );
  const resultsGames = useMemo(
    () => allGames.filter((g) => g.GameComplete),
    [allGames],
  );

  if (selectedGameId === null) {
    return (
      <div className="h-screen w-full bg-(--bg-primary) pt-[calc(8vh+10px)] flex flex-col overflow-hidden relative text-left">
        {isAdmin && (
          <div className="w-full bg-(--bg-secondary) border-b border-(--border-primary) shadow-md flex items-center justify-between px-8 py-3 shrink-0 relative z-20">
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${effectiveBroadcastState === "BROADCASTING" ? "bg-green-500 animate-pulse" : effectiveBroadcastState === "GENERATING" ? "bg-yellow-500 animate-spin" : "bg-red-500"}`}
              />
              <span className="text-[1.4vh] font-bold text-(--text-muted) uppercase tracking-widest">
                Control Room
              </span>
            </div>
            <button
              onClick={triggerEngineAndBroadcast}
              disabled={effectiveBroadcastState !== "IDLE"}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded shadow-lg disabled:opacity-50 text-[1.2vh] uppercase tracking-wider transition-all"
            >
              {effectiveBroadcastState === "GENERATING"
                ? "⚙️ ENGINE RUNNING..."
                : effectiveBroadcastState === "BROADCASTING"
                  ? isFirebaseMode
                    ? "📡 LIVE FROM FIREBASE"
                    : "📡 LIVE ON AIR"
                  : "🟢 START LIVE BROADCAST"}
            </button>
          </div>
        )}

        <div className="flex-1 px-4 lg:px-8 pb-6 flex flex-col min-h-0 mt-8">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h1 className="text-[2.5vh] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
              Live Rink Hub{" "}
              <span className="text-(--text-muted) text-[1.5vh] tracking-widest ml-4">
                {currentSeason} - Week {currentWeek}
              </span>
            </h1>
            <div className="flex gap-4">
              <ButtonGroup>
                <PillButton
                  isSelected={selectedLeague === SimCHL}
                  onClick={() => setSelectedLeague(SimCHL)}
                >
                  CHL
                </PillButton>
                <PillButton
                  isSelected={selectedLeague === SimPHL}
                  onClick={() => setSelectedLeague(SimPHL)}
                >
                  PHL
                </PillButton>
              </ButtonGroup>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
            <div className="lg:col-span-2 h-full min-h-0 border-r border-white/10 pr-2">
              <GameMiniList
                title="Upcoming"
                games={upcomingGames}
                color="border-blue-500"
                onSelect={setSelectedGameId}
                userTeamID={userTeamID}
                broadcastState={effectiveBroadcastState}
              />
            </div>
            <div className="lg:col-span-8 flex flex-col h-full min-h-0 px-2 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 pb-10">
                {liveGames.map((game) => (
                  <div
                    key={game.GameID}
                    onClick={() => setSelectedGameId(game.GameID)}
                    className={`border rounded-lg p-6 cursor-pointer bg-(--bg-secondary) ${effectiveGoalFlash(game.GameID) ? "bg-red-900 border-white animate-pulse" : "border-white/10"}`}
                  >
                    <div className="text-[1.1vh] text-(--text-muted) font-bold mb-3 uppercase flex justify-between">
                      <span>
                        {getPeriodName(game.Period)} |{" "}
                        {formatClock(game.TimeOnClock)}
                      </span>
                      <span>{game.Zone}</span>
                    </div>
                    <div className="flex justify-between items-center font-black text-white">
                      <span className="text-[1.2vh] text-center">
                        <Logo
                          url={getLogo(
                            selectedLeague,
                            game.HomeTeamID,
                            currentUser?.IsRetro,
                          )}
                          label={`${game.HomeTeamRank > 0 ? `#${game.HomeTeamRank} ` : ""}${game.HomeTeam}`}
                        />
                      </span>
                      <span className="text-[2.8vh]">{game.HomeTeamScore}</span>
                      <span className="opacity-20 italic">VS</span>
                      <span className="text-[2.8vh]">{game.AwayTeamScore}</span>
                      <span className="text-[1.2vh] text-center">
                        <Logo
                          url={getLogo(
                            selectedLeague,
                            game.AwayTeamID,
                            currentUser?.IsRetro,
                          )}
                          label={`${game.AwayTeamRank > 0 ? `#${game.AwayTeamRank} ` : ""}${game.AwayTeam}`}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 h-full min-h-0 border-l border-white/10 pl-2">
              <GameMiniList
                title="Results"
                games={resultsGames}
                color="border-green-500"
                onSelect={setSelectedGameId}
                userTeamID={userTeamID}
                broadcastState={effectiveBroadcastState}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeGame = effectiveGames[selectedGameId];
  const statsSource = getStatsForGame(selectedGameId);
  // Plays to render in the feed, newest first.
  const activePlays: any[] = isFirebaseMode
    ? [...(shownPlays[selectedGameId] ?? [])].reverse()
    : (currentPlaysRef.current[selectedGameId] ?? []);

  return (
    <div className="h-screen w-full bg-(--bg-primary) pt-[calc(8vh+10px)] flex flex-col overflow-hidden">
      <div className="flex-1 px-8 pb-4 flex flex-col min-h-0">
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-2 h-full">
            <TeamStatsSidebar
              title="Home Stats"
              teamName={activeGame.HomeTeam}
              stats={statsSource?.HomeStats}
            />
          </div>
          <div className="col-span-8 flex flex-col h-full">
            <button
              onClick={() => setSelectedGameId(null)}
              className="text-(--text-muted) hover:text-white uppercase font-bold mb-2 text-left"
            >
              ← BACK
            </button>
            <div
              className={`border rounded-t-lg p-4 flex justify-between items-center ${effectiveGoalFlash(selectedGameId) ? "bg-red-800" : "bg-(--bg-secondary)"}`}
            >
              <div className="text-center w-1/3 flex justify-around items-center">
                <div>
                  <Logo
                    url={getLogo(
                      selectedLeague,
                      activeGame.HomeTeamID,
                      currentUser?.IsRetro,
                    )}
                    label={`${activeGame.HomeTeamRank > 0 ? `#${activeGame.HomeTeamRank} ` : ""}${activeGame.HomeTeam}`}
                  />
                </div>
                <p className="text-[5.5vh] font-black text-white">
                  {activeGame.HomeTeamScore}
                </p>
              </div>
              <div className="text-center border-x px-8 border-white/10 w-1/3 flex flex-col">
                <span className="text-[1vh] uppercase block text-white">
                  {activeGame.Arena}, {activeGame.City}, {activeGame.State},{" "}
                  {activeGame.Country}
                </span>
                <span className="text-[1.2vh] font-bold uppercase block text-white">
                  {getPeriodName(activeGame.Period)}
                </span>
                <span className="text-[4.5vh] font-mono font-bold text-white leading-none">
                  {formatClock(activeGame.TimeOnClock)}
                </span>
              </div>
              <div className="text-center w-1/3 flex justify-around items-center">
                <p className="text-[5.5vh] font-black text-white">
                  {activeGame.AwayTeamScore}
                </p>
                <div>
                  <Logo
                    url={getLogo(
                      selectedLeague,
                      activeGame.AwayTeamID,
                      currentUser?.IsRetro,
                    )}
                    label={`${activeGame.AwayTeamRank > 0 ? `#${activeGame.AwayTeamRank} ` : ""}${activeGame.AwayTeam}`}
                  />
                </div>
              </div>
            </div>
            <RinkVisualizer
              currentZone={activeGame.Zone}
              goalScored={effectiveGoalFlash(selectedGameId)}
            />
            <div className="bg-(--bg-secondary) rounded-b-lg p-5 flex-1 overflow-y-auto max-h-[50vh] custom-scrollbar">
              {activePlays.map((play: any, idx: number) => (
                <div
                  key={idx}
                  className="border-b border-white/5 py-2 text-[1.4vh] flex gap-4 text-left"
                >
                  <span className="text-red-500 font-mono shrink-0">
                    [{formatClock(play.TimeOnClock)}]
                  </span>
                  <span className="text-white">
                    {isFirebaseMode
                      ? getPlayText(play as LivePlayDoc)
                      : play.PlayText}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 h-full">
            <TeamStatsSidebar
              title="Away Stats"
              teamName={activeGame.AwayTeam}
              stats={statsSource?.AwayStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRink;
