import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { League, SimCFB } from "../_constants/constants";
import { fbaUrl } from "../_constants/urls";
import { useSimFBAStore } from "../context/SimFBAContext";

// ── Firestore document shape (mirrors the Go LiveGameRecord for football) ──

export interface LiveGameDoc {
  id: string;
  GameID: number;
  HomeTeamID: number;
  AwayTeamID: number;
  HomeTeam: string;
  AwayTeam: string;
  League: string;
  StreamStartTime: Timestamp;
  StreamEndTime: Timestamp;
  TotalPlays: number;
  IsRevealed: boolean;
}

// ── API play shape (mirrors PlayByPlayResponse from the Go backend) ──

export interface LivePlayDoc {
  PlayNumber: number;
  HomeTeamID: number;
  HomeTeamScore: number;
  AwayTeamID: number;
  AwayTeamScore: number;
  /** 1-4 = regulation, 5 = OT */
  Quarter: number;
  Possession: string;
  TimeRemaining: string;
  Down: number;
  Distance: number;
  LineOfScrimmage: string;
  PlayType: string;
  PlayName: string;
  OffensiveFormation: string;
  DefensiveFormation: string;
  PointOfAttack: string;
  DefensiveTendency: string;
  BlitzNumber: number;
  LBCoverage: string;
  CBCoverage: string;
  SCoverage: string;
  QBPlayerID: number;
  BallCarrierID: number;
  Tackler1ID: number;
  Tackler2ID: number;
  PresureID: number;
  ResultYards: number;
  Result: string;
  StreamResult: string[];
  /** Wall-clock seconds this play occupies — drives the reveal schedule. */
  SecondsConsumed?: number;
}

// ── Derived display state for a single game ──

export interface LiveGameState {
  GameID: number;
  HomeTeamID: number;
  AwayTeamID: number;
  HomeTeam: string;
  AwayTeam: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  Quarter: number;
  TimeOnClock: string;
  Zone: string;
  Down: number;
  Distance: number;
  Possession: string;
  IsRevealed?: boolean;
  GameComplete: boolean;
  StreamEndTime: Timestamp;
}

// ── Helpers ──

/** Returns the richest available display text from a LivePlayDoc. */
export const getPlayText = (play: LivePlayDoc): string => {
  if (play.StreamResult?.length > 0) return play.StreamResult.join(" ");
  return play.Result || `${play.PlayType} — ${play.PlayName}`;
};

const getGamesCollection = (league: League) =>
  league === SimCFB ? "live_cfb_games" : "live_nfl_games";

// ── Hook ──

interface UseLiveFieldStateReturn {
  /** True when at least one unrevealed game exists in Firebase. */
  isFirebaseMode: boolean;
  /** True once the initial Firestore snapshot has resolved (even if empty). */
  isReady: boolean;
  /** Raw Firestore game documents — used by LiveField to seed its local state. */
  rawGames: LiveGameDoc[];
  /** Derived current game state keyed by GameID. */
  liveGameStates: Record<number, LiveGameState>;
  /**
   * Plays revealed so far for each game, keyed by GameID.
   * Ordered oldest → newest. Reverse before rendering to show newest on top.
   */
  shownPlays: Record<number, LivePlayDoc[]>;
  /** Set of game IDs currently showing a touchdown/score flash. */
  touchdownFlashGames: Set<number>;
}

export const useLiveFieldState = (league: League): UseLiveFieldStateReturn => {
  const { cfb_Timestamp } = useSimFBAStore();

  const gamesCol = getGamesCollection(league);
  const leagueSlug = league === SimCFB ? "cfb" : "nfl";

  // ── State ──
  const [rawGames, setRawGames] = useState<LiveGameDoc[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [liveGameStates, setLiveGameStates] = useState<
    Record<number, LiveGameState>
  >({});
  const [shownPlays, setShownPlays] = useState<Record<number, LivePlayDoc[]>>(
    {},
  );
  const [touchdownFlashGames, setTouchdownFlashGames] = useState<Set<number>>(
    new Set(),
  );

  // ── Refs (mutated inside setInterval without causing re-renders) ──
  /** Full ordered play list per game, fetched once from the API. */
  const playsRef = useRef<Record<number, LivePlayDoc[]>>({});
  /** Tracks which game IDs have had their plays fetched. */
  const fetchedRef = useRef<Set<number>>(new Set());
  /** How many plays were shown last tick — for touchdown detection. */
  const prevShownCountsRef = useRef<Record<number, number>>({});

  // ── Reset on league change ──
  useEffect(() => {
    setIsReady(false);
    setRawGames([]);
    setLiveGameStates({});
    setShownPlays({});
    setTouchdownFlashGames(new Set());
    playsRef.current = {};
    fetchedRef.current = new Set();
    prevShownCountsRef.current = {};
  }, [league]);

  // ── Subscribe to unrevealed game records ──
  useEffect(() => {
    const q = query(
      collection(firestore, gamesCol),
      where("IsRevealed", "==", false),
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs: LiveGameDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<LiveGameDoc, "id">),
      }));
      setRawGames(docs);
      setIsReady(true);
    });
    return () => unsubscribe();
  }, [gamesCol]);

  // Fetch for all play by plays on mount
  useEffect(() => {
    const isCFB = leagueSlug === "cfb";
    const url = `${fbaUrl}games/plays/bulk/${leagueSlug}?isCollege=${isCFB}&season=${cfb_Timestamp?.CollegeSeasonID}&week=${cfb_Timestamp?.CollegeWeek}&is_spring_game=${cfb_Timestamp?.CFBSpringGames}`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((plays: any) => {
        playsRef.current = plays.Plays;
      });
  }, [cfb_Timestamp, leagueSlug]);

  // ── 250 ms tick loop: compute visible plays via StreamStartTime math ──
  useEffect(() => {
    if (rawGames.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newStates: Record<number, LiveGameState> = {};
      const newShownPlays: Record<number, LivePlayDoc[]> = {};
      const newTouchdownFlash: number[] = [];
      let anyCountChanged = false;

      for (const game of rawGames) {
        const gameID = Number(game.id);
        const plays = playsRef.current[gameID];

        // Plays not yet fetched — show a loading/initial state.
        if (!plays || plays.length === 0) {
          newStates[gameID] = {
            GameID: gameID,
            HomeTeamID: game.HomeTeamID,
            AwayTeamID: game.AwayTeamID,
            HomeTeam: game.HomeTeam,
            AwayTeam: game.AwayTeam,
            HomeTeamScore: 0,
            AwayTeamScore: 0,
            Quarter: 1,
            TimeOnClock: "15:00",
            Zone: "50",
            Down: 1,
            Distance: 10,
            Possession: "",
            GameComplete: false,
            StreamEndTime: game.StreamEndTime,
          };
          newShownPlays[gameID] = [];
          continue;
        }

        // Compute elapsed seconds since StreamStartTime (set by the cron).
        const startMs = game.StreamStartTime.toMillis();
        const elapsedSeconds = (now - startMs) / 1000;

        // Walk the play list accumulating SecondsConsumed until we exceed elapsed.
        let cumulative = 0;
        let visibleCount = 0;
        for (const play of plays) {
          if (cumulative > elapsedSeconds) break;
          visibleCount++;
          cumulative += play.SecondsConsumed || 15; // default to 15s if not set
        }

        const shown = plays.slice(0, visibleCount);
        console.log({ gameID, visibleCount, shown });
        newShownPlays[gameID] = shown;

        // Touchdown / score detection.
        const prevCount = prevShownCountsRef.current[gameID] ?? 0;
        if (visibleCount > prevCount && shown.length > 0) {
          for (let i = prevCount; i < visibleCount; i++) {
            const cur = plays[i];
            const prev = i > 0 ? plays[i - 1] : null;
            if (
              cur.HomeTeamScore > (prev?.HomeTeamScore ?? 0) ||
              cur.AwayTeamScore > (prev?.AwayTeamScore ?? 0)
            ) {
              newTouchdownFlash.push(gameID);
              break;
            }
          }
        }
        if (visibleCount !== prevCount) anyCountChanged = true;
        prevShownCountsRef.current[gameID] = visibleCount;

        const lastPlay = shown.length > 0 ? shown[shown.length - 1] : null;
        if (!game.StreamEndTime) continue;
        const endMs = game.StreamEndTime.toMillis();
        const gameComplete = now >= endMs || visibleCount >= plays.length;

        newStates[gameID] = {
          GameID: gameID,
          HomeTeamID: game.HomeTeamID,
          AwayTeamID: game.AwayTeamID,
          HomeTeam: game.HomeTeam,
          AwayTeam: game.AwayTeam,
          HomeTeamScore: lastPlay?.HomeTeamScore ?? 0,
          AwayTeamScore: lastPlay?.AwayTeamScore ?? 0,
          Quarter: lastPlay?.Quarter ?? 1,
          TimeOnClock: lastPlay?.TimeRemaining ?? "15:00",
          Zone: lastPlay?.LineOfScrimmage ?? "50",
          Down: lastPlay?.Down ?? 1,
          Distance: lastPlay?.Distance ?? 10,
          Possession: lastPlay?.Possession ?? "",
          GameComplete: gameComplete,
          StreamEndTime: game.StreamEndTime,
        };
      }
      console.log({ newStates, newShownPlays });
      // Always push state when we have games — the loading placeholder states
      // also need to appear before plays arrive.
      if (Object.keys(newStates).length > 0) {
        setLiveGameStates(newStates);
        setShownPlays(newShownPlays);
      }

      if (newTouchdownFlash.length > 0) {
        setTouchdownFlashGames(
          (prev) => new Set([...prev, ...newTouchdownFlash]),
        );
        newTouchdownFlash.forEach((id) =>
          setTimeout(
            () =>
              setTouchdownFlashGames((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              }),
            4000,
          ),
        );
      }
    }, 250);

    return () => clearInterval(interval);
  }, [rawGames]);

  return {
    isFirebaseMode: rawGames.length > 0,
    isReady,
    rawGames,
    liveGameStates,
    shownPlays,
    touchdownFlashGames,
  };
};
