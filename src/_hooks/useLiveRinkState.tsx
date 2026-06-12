import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { League, SimCHL } from "../_constants/constants";
import { hckUrl } from "../_constants/urls";

// ── Firestore document shape (mirrors firebase/types.go LiveGameRecord) ──

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
  HomeTeamRank: number;
  AwayTeamRank: number;
  Arena: string;
  City: string;
  State: string;
  Country: string;
}

// ── API play shape (mirrors structs.PlayByPlayResponse from the Go backend) ──

export interface LivePlayDoc {
  PlayNumber: number;
  Period: number;
  /** Already formatted as "MM:SS" by the backend. */
  TimeOnClock: string;
  /** Wall-clock seconds this play occupies — drives the reveal schedule. */
  SecondsConsumed: number;
  Event: string;
  Zone: string;
  NextZone: string;
  Outcome: string;
  HomeTeamScore: number;
  AwayTeamScore: number;
  TeamID: number;
  PuckCarrierID: number;
  PassedPlayerID: number;
  AssistingPlayerID: number;
  DefenderID: number;
  GoalieID: number;
  InjuryID: number;
  InjuryType: number;
  InjuryDuration: number;
  Penalty: string;
  Severity: string;
  IsFight: string;
  IsBreakaway: boolean;
  IsShootout: boolean;
  Result: string;
  StreamResult: string[];
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
  HomeSOScore: number;
  AwaySOScore: number;
  /** 1-3 = regulation, 4 = OT, 5 = SO */
  Period: number;
  TimeOnClock: string;
  Zone: string;
  GameComplete: boolean;
  IsShootout: boolean;
  HomeTeamRank: number;
  AwayTeamRank: number;
  Arena: string;
  City: string;
  State: string;
  Country: string;
}

// ── Helpers ──

/** Returns the richest available display text from a LivePlayDoc. */
export const getPlayText = (play: LivePlayDoc): string => {
  if (play.StreamResult?.length > 0) return play.StreamResult.join(" ");
  return play.Result || `${play.Event} — ${play.Outcome}`;
};

const getGamesCollection = (league: League) =>
  league === SimCHL ? "live_chl_games" : "live_phl_games";

// ── Hook ──

interface UseLiveRinkStateReturn {
  /** True when at least one unrevealed game exists in Firebase. */
  isFirebaseMode: boolean;
  /** True once the initial Firestore snapshot has resolved (even if empty). */
  isReady: boolean;
  /** Derived current game state keyed by GameID. */
  liveGameStates: Record<number, LiveGameState>;
  /**
   * Plays revealed so far for each game, keyed by GameID.
   * Ordered oldest → newest.  Reverse before rendering to show newest on top.
   */
  shownPlays: Record<number, LivePlayDoc[]>;
  /** Set of game IDs currently showing a goal flash. */
  goalFlashGames: Set<number>;
}

export const useLiveRinkState = (league: League): UseLiveRinkStateReturn => {
  const gamesCol = getGamesCollection(league);
  const leagueSlug = league === SimCHL ? "chl" : "phl";

  // ── State ──
  const [rawGames, setRawGames] = useState<LiveGameDoc[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [liveGameStates, setLiveGameStates] = useState<
    Record<number, LiveGameState>
  >({});
  const [shownPlays, setShownPlays] = useState<Record<number, LivePlayDoc[]>>(
    {},
  );
  const [goalFlashGames, setGoalFlashGames] = useState<Set<number>>(new Set());

  // ── Refs (not state — mutated inside setInterval without causing re-renders) ──
  /** Full ordered play list per game, fetched once from the API. */
  const playsRef = useRef<Record<number, LivePlayDoc[]>>({});
  /** Tracks which game IDs have had their plays fetched. */
  const fetchedRef = useRef<Set<number>>(new Set());
  /** How many plays were shown last tick — for goal detection. */
  const prevShownCountsRef = useRef<Record<number, number>>({});

  // ── Reset on league change ──
  useEffect(() => {
    setIsReady(false);
    setRawGames([]);
    setLiveGameStates({});
    setShownPlays({});
    setGoalFlashGames(new Set());
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

  // ── Fetch plays from the API whenever a new game appears ──
  useEffect(() => {
    for (const game of rawGames) {
      if (fetchedRef.current.has(game.GameID)) continue;
      fetchedRef.current.add(game.GameID);

      fetch(`${hckUrl}games/live-plays/${leagueSlug}/${game.GameID}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((plays: LivePlayDoc[]) => {
          if (Array.isArray(plays) && plays.length > 0) {
            playsRef.current[game.GameID] = plays;
          } else {
            // Remove from fetched so the tick loop will retry on the next pass.
            fetchedRef.current.delete(game.GameID);
          }
        })
        .catch(() => fetchedRef.current.delete(game.GameID));
    }
  }, [rawGames, leagueSlug]);

  // ── 250 ms tick loop: compute visible plays via StreamStartTime math ──
  useEffect(() => {
    if (rawGames.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newStates: Record<number, LiveGameState> = {};
      const newShownPlays: Record<number, LivePlayDoc[]> = {};
      const newGoalFlash: number[] = [];
      let anyCountChanged = false;

      for (const game of rawGames) {
        const gameID = game.GameID;
        const plays = playsRef.current[gameID];

        // Plays not yet fetched — show loading state (Period 1 / no plays).
        if (!plays || plays.length === 0) {
          newStates[gameID] = {
            GameID: gameID,
            HomeTeamID: game.HomeTeamID,
            AwayTeamID: game.AwayTeamID,
            HomeTeam: game.HomeTeam,
            AwayTeam: game.AwayTeam,
            HomeTeamScore: 0,
            AwayTeamScore: 0,
            HomeSOScore: 0,
            AwaySOScore: 0,
            Period: 1,
            TimeOnClock: "20:00",
            Zone: "Neutral Zone",
            GameComplete: false,
            IsShootout: false,
            HomeTeamRank: game.HomeTeamRank,
            AwayTeamRank: game.AwayTeamRank,
            Arena: game.Arena,
            City: game.City,
            State: game.State,
            Country: game.Country,
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
          cumulative += play.SecondsConsumed || 1;
        }

        const shown = plays.slice(0, visibleCount);
        newShownPlays[gameID] = shown;

        // Goal detection.
        const prevCount = prevShownCountsRef.current[gameID] ?? 0;
        if (visibleCount > prevCount && shown.length > 0) {
          for (let i = prevCount; i < visibleCount; i++) {
            const cur = plays[i];
            const prev = i > 0 ? plays[i - 1] : null;
            if (
              cur.HomeTeamScore > (prev?.HomeTeamScore ?? 0) ||
              cur.AwayTeamScore > (prev?.AwayTeamScore ?? 0)
            ) {
              newGoalFlash.push(gameID);
              break;
            }
          }
        }
        if (visibleCount !== prevCount) anyCountChanged = true;
        prevShownCountsRef.current[gameID] = visibleCount;

        const lastPlay = shown.length > 0 ? shown[shown.length - 1] : null;
        // A game is complete when StreamEndTime has passed or all plays shown.
        if (!game.StreamEndTime) continue; // Defensive check — should always be present.
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
          HomeSOScore: 0,
          AwaySOScore: 0,
          Period: lastPlay?.Period ?? 1,
          TimeOnClock: lastPlay?.TimeOnClock ?? "20:00",
          Zone: lastPlay?.NextZone || lastPlay?.Zone || "Neutral Zone",
          GameComplete: gameComplete,
          IsShootout: lastPlay?.IsShootout ?? false,
          HomeTeamRank: game.HomeTeamRank,
          AwayTeamRank: game.AwayTeamRank,
          Arena: game.Arena,
          City: game.City,
          State: game.State,
          Country: game.Country,
        };
      }

      if (anyCountChanged) {
        setLiveGameStates(newStates);
        setShownPlays(newShownPlays);
      }

      if (newGoalFlash.length > 0) {
        setGoalFlashGames((prev) => new Set([...prev, ...newGoalFlash]));
        newGoalFlash.forEach((id) =>
          setTimeout(
            () =>
              setGoalFlashGames((prev) => {
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
    liveGameStates,
    shownPlays,
    goalFlashGames,
  };
};
