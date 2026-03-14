import React, {
  createContext,
  useContext,
  ReactNode,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Timestamp as BaseballTimestamp,
  BaseballOrganization,
  BaseballRosters,
  BaseballStanding,
  BaseballGame,
  BaseballNotification,
  BaseballNewsLog,
  BaseballBattingStats,
  BaseballPitchingStats,
  BaseballFieldingStats,
  BaseballInjury,
  BaseballTeam,
  BaseballSeasonContext,
  BaseballFinancials,
  Player,
} from "../models/baseball/baseballModels";
import { FaceDataResponse } from "../models/footballModels";
import { useAuthStore } from "./AuthContext";
import { BaseballService, normalizeFaceData } from "../_services/baseballService";
import { useEffect, useState } from "react";
import { useWebSockets } from "../_hooks/useWebsockets";
import { baseball_ws } from "../_constants/urls";
import { SimMLB } from "../_constants/constants";
import { normalizePlayer } from "../_utility/baseballHelpers";
import { BootstrapSpecialEvent } from "../models/baseball/baseballEventModels";

// ═══════════════════════════════════════════════
// Bootstrap cache shape (per-org)
// ═══════════════════════════════════════════════

interface BootstrapData {
  standings: BaseballStanding[];
  allGames: BaseballGame[];
  notifications: BaseballNotification[];
  news: BaseballNewsLog[];
  topBatter: BaseballBattingStats | null;
  topPitcher: BaseballPitchingStats | null;
  topFielder: BaseballFieldingStats | null;
  injuryReport: BaseballInjury[];
  allTeams: BaseballTeam[];
  seasonContext: BaseballSeasonContext | null;
  rosterMap: Record<string, Player[]>;
  financials: BaseballFinancials | null;
  playerFaces: { [key: number]: FaceDataResponse };
  specialEvents: BootstrapSpecialEvent[];
}

const emptyBootstrap: BootstrapData = {
  standings: [],
  allGames: [],
  notifications: [],
  news: [],
  topBatter: null,
  topPitcher: null,
  topFielder: null,
  injuryReport: [],
  allTeams: [],
  seasonContext: null,
  rosterMap: {},
  financials: null,
  playerFaces: {},
  specialEvents: [],
};

// ═══════════════════════════════════════════════
// SessionStorage cache helpers
// ═══════════════════════════════════════════════

const CACHE_KEY_PREFIX = "bb_bootstrap_";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CachedEntry {
  timestamp: number;
  data: any; // raw API response shape
}

const saveToSessionCache = (orgId: number, rawData: any) => {
  try {
    const entry: CachedEntry = { timestamp: Date.now(), data: rawData };
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${orgId}`, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — silently skip
  }
};

const loadFromSessionCache = (orgId: number): any | null => {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${orgId}`);
    if (!raw) return null;
    const entry: CachedEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(`${CACHE_KEY_PREFIX}${orgId}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════
// Context interface
// ═══════════════════════════════════════════════

interface SimBaseballContextProps {
  organizations: BaseballOrganization[] | null;
  collegeOrganization?: BaseballOrganization | null;
  mlbOrganization?: BaseballOrganization | null;
  mlbRoster?: BaseballRosters | null;
  collegeRoster?: BaseballRosters | null;
  isCollegeBaseballUser: boolean;
  isMlbUser: boolean;
  isCollegeOrgLoading?: boolean;
  isMlbOrgLoading?: boolean;
  baseball_Timestamp: BaseballTimestamp | null;
  isLoading?: boolean;
  // Bootstrap landing data (active org's data)
  standings: BaseballStanding[];
  allGames: BaseballGame[];
  notifications: BaseballNotification[];
  news: BaseballNewsLog[];
  topBatter: BaseballBattingStats | null;
  topPitcher: BaseballPitchingStats | null;
  topFielder: BaseballFieldingStats | null;
  injuryReport: BaseballInjury[];
  allTeams: BaseballTeam[];
  seasonContext: BaseballSeasonContext | null;
  rosterMap: Record<string, Player[]>;
  allRosters: BaseballRosters[];
  financials: BaseballFinancials | null;
  playerFaces: { [key: number]: FaceDataResponse };
  specialEvents: BootstrapSpecialEvent[];
  bootstrappedOrgId: number | null;
  isBootstrapLoading: boolean;
  // Actions
  loadBootstrapForOrg: (orgId: number, forceRefresh?: boolean) => Promise<any>;
  toggleNotificationAsRead: (notificationId: number) => void;
  deleteNotification: (notificationId: number) => void;
}

const defaultContext: SimBaseballContextProps = {
  organizations: null,
  collegeOrganization: null,
  mlbOrganization: null,
  mlbRoster: null,
  collegeRoster: null,
  isCollegeBaseballUser: false,
  isMlbUser: false,
  isCollegeOrgLoading: false,
  isMlbOrgLoading: false,
  baseball_Timestamp: null,
  isLoading: false,
  standings: [],
  allGames: [],
  notifications: [],
  news: [],
  topBatter: null,
  topPitcher: null,
  topFielder: null,
  injuryReport: [],
  allTeams: [],
  seasonContext: null,
  rosterMap: {},
  allRosters: [],
  financials: null,
  playerFaces: {},
  specialEvents: [],
  bootstrappedOrgId: null,
  isBootstrapLoading: false,
  loadBootstrapForOrg: async () => null,
  toggleNotificationAsRead: () => {},
  deleteNotification: () => {},
};

export const SimBaseballContext =
  createContext<SimBaseballContextProps>(defaultContext);

interface SimBaseballProviderProps {
  children: ReactNode;
}

export const SimBaseballProvider: React.FC<SimBaseballProviderProps> = ({
  children,
}) => {
  const { currentUser } = useAuthStore();
  const isFetching = useRef(false);
  const [organizations, setOrganizations] = useState<BaseballOrganization[]>(
    []
  );

  const [rosters, setRosters] = useState<BaseballRosters[]>([]);
  const [globalFaces, setGlobalFaces] = useState<{ [key: number]: FaceDataResponse }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { baseball_Timestamp, setBaseball_Timestamp } = useWebSockets(
    baseball_ws,
    SimMLB
  );

  // Per-org bootstrap cache — survives re-renders, no network call on cache hit
  const bootstrapCache = useRef<Map<number, BootstrapData>>(new Map());

  // Active bootstrap data (what consumers see)
  const [activeBootstrap, setActiveBootstrap] = useState<BootstrapData>(emptyBootstrap);
  const [bootstrappedOrgId, setBootstrappedOrgId] = useState<number | null>(null);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(false);
  // Tracks whether initial data load is complete (active org loaded)
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const mlbOrganization = useMemo(() => {
    if (!currentUser || !organizations || organizations.length === 0) return null;
    const username = currentUser.username;
    if (!username) return null;
    return organizations.find(
      (o) =>
        o.league === "mlb" &&
        (o.owner_name === username ||
          o.gm_name === username ||
          o.manager_name === username ||
          o.scout_name === username)
    ) || null;
  }, [currentUser, organizations]);

  const collegeOrganization = useMemo(() => {
    if (!currentUser || !organizations || organizations.length === 0) return null;
    const username = currentUser.username;
    if (!username) return null;
    return organizations.find(
      (o) => o.league === "college" && o.coach === username
    ) || null;
  }, [currentUser, organizations]);

  const isMlbUser = !!mlbOrganization;
  const isCollegeBaseballUser = !!collegeOrganization;

  const mlbRoster = useMemo(() => {
    if (!mlbOrganization || !rosters || rosters.length === 0) return null;
    return rosters.find((r) => r.org_id === mlbOrganization.id) || null;
  }, [mlbOrganization, rosters]);

  const collegeRoster = useMemo(() => {
    if (!collegeOrganization || !rosters || rosters.length === 0) return null;
    return rosters.find((r) => r.org_id === collegeOrganization.id) || null;
  }, [collegeOrganization, rosters]);

  // Load org list on mount
  useEffect(() => {
    getBaseballOrgData();
  }, []);

  // Once we have both currentUser and orgs, begin bootstrap for active org
  useEffect(() => {
    if (currentUser && organizations.length > 0 && !isFetching.current) {
      isFetching.current = true;
      const activeOrg = mlbOrganization || collegeOrganization;
      if (activeOrg) {
        loadActiveOrgFirst(activeOrg.id);
      } else {
        // User has no baseball org — just mark done
        setInitialLoadDone(true);
      }
    }
  }, [currentUser, organizations, mlbOrganization?.id, collegeOrganization?.id]);

  // Apply bootstrap for user's org once initial load + org detection are both ready
  useEffect(() => {
    const activeOrg = mlbOrganization || collegeOrganization;
    if (activeOrg && initialLoadDone && bootstrappedOrgId !== activeOrg.id) {
      loadBootstrapForOrg(activeOrg.id);
    }
  }, [mlbOrganization?.id, collegeOrganization?.id, initialLoadDone]);

  const getBaseballOrgData = useCallback(async () => {
    setIsLoading(true);
    try {
      const orgs = await BaseballService.GetAllOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to load organizations", error);
    }
    setIsLoading(false);
  }, []);

  /**
   * Convert a raw per-org API response into a BootstrapData object
   * and store in cache + sessionStorage.
   */
  const processAndCacheOrgData = useCallback((orgId: number, data: any): BootstrapData => {
    // Merge bootstrap org into organizations state
    if (data.Organization) {
      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, ...data.Organization } : o))
      );
    }

    const normalized: Record<string, Player[]> = {};
    if (data.RosterMap) {
      for (const [key, players] of Object.entries(data.RosterMap)) {
        normalized[key] = (players as any[]).map(normalizePlayer);
      }
    }

    const faces: { [key: number]: FaceDataResponse } = {};
    if (data.FaceData) {
      for (const [id, f] of Object.entries(data.FaceData)) {
        faces[Number(id)] = normalizeFaceData(f);
      }
    }

    const bootstrapData: BootstrapData = {
      standings: data.Standings ?? [],
      allGames: data.AllGames ?? [],
      notifications: data.Notifications ?? [],
      news: data.News ?? [],
      topBatter: data.TopBatter || null,
      topPitcher: data.TopPitcher || null,
      topFielder: data.TopFielder || null,
      injuryReport: data.InjuryReport ?? [],
      allTeams: data.AllTeams ?? [],
      seasonContext: data.SeasonContext ?? null,
      rosterMap: normalized,
      financials: data.Financials ?? null,
      playerFaces: faces,
      specialEvents: data.SpecialEvents ?? [],
    };

    bootstrapCache.current.set(orgId, bootstrapData);
    saveToSessionCache(orgId, data);

    return bootstrapData;
  }, []);

  /**
   * Phase 1: Load the active org's bootstrap data ASAP (fast path).
   * Phase 2: After dashboard renders, backfill the all-orgs cache + load rosters/faces.
   */
  const loadActiveOrgFirst = useCallback(async (activeOrgId: number) => {
    setIsBootstrapLoading(true);

    // ── Phase 1: Get the active org's data as fast as possible ──

    // Check sessionStorage first (stale-while-revalidate)
    const sessionCached = loadFromSessionCache(activeOrgId);
    let usedSessionCache = false;

    if (sessionCached) {
      // Render immediately from session cache
      const bootstrapData = processAndCacheOrgData(activeOrgId, sessionCached);
      applyBootstrap(activeOrgId, bootstrapData);
      setIsBootstrapLoading(false);
      setInitialLoadDone(true);
      usedSessionCache = true;
    }

    // Fetch fresh data for the active org (either as primary or revalidation)
    try {
      const data = await BaseballService.GetBootstrapLandingData(activeOrgId);
      const bootstrapData = processAndCacheOrgData(activeOrgId, data);

      if (!usedSessionCache) {
        // First load — apply and unblock dashboard
        applyBootstrap(activeOrgId, bootstrapData);
        setIsBootstrapLoading(false);
        setInitialLoadDone(true);
      } else {
        // Revalidation — silently update if data changed
        applyBootstrap(activeOrgId, bootstrapData);
      }
    } catch (error) {
      console.error("Active-org bootstrap failed:", error);
      if (!usedSessionCache) {
        // No session cache and network failed — unblock with empty state
        setIsBootstrapLoading(false);
        setInitialLoadDone(true);
      }
    }

    // ── Phase 2: Background work (after dashboard is rendered) ──

    // Backfill the all-orgs cache for instant org switching
    BaseballService.GetAllBootstrapData()
      .then((allData) => {
        const sharedStandings = allData.Standings ?? [];
        const sharedAllGames = allData.AllGames ?? [];
        const sharedAllTeams = allData.AllTeams ?? [];
        const sharedSeasonContext = allData.SeasonContext ?? null;
        const sharedSpecialEvents = allData.SpecialEvents ?? [];
        const sharedFaces: { [key: number]: FaceDataResponse } = {};
        if (allData.FaceData) {
          for (const [id, f] of Object.entries(allData.FaceData)) {
            sharedFaces[Number(id)] = normalizeFaceData(f);
          }
        }

        const orgUpdates: BaseballOrganization[] = [];

        if (allData.Orgs) {
          for (const [orgIdStr, orgEntry] of Object.entries(allData.Orgs)) {
            const orgId = Number(orgIdStr);

            // Don't overwrite the active org's fresh data with all-orgs data
            if (orgId === activeOrgId) continue;

            if (orgEntry.Organization) {
              orgUpdates.push(orgEntry.Organization);
            }

            const normalized: Record<string, Player[]> = {};
            if (orgEntry.RosterMap) {
              for (const [key, players] of Object.entries(orgEntry.RosterMap)) {
                normalized[key] = players.map(normalizePlayer);
              }
            }

            const bootstrapData: BootstrapData = {
              standings: sharedStandings,
              allGames: sharedAllGames,
              notifications: orgEntry.Notifications ?? [],
              news: orgEntry.News ?? [],
              topBatter: orgEntry.TopBatter || null,
              topPitcher: orgEntry.TopPitcher || null,
              topFielder: orgEntry.TopFielder || null,
              injuryReport: orgEntry.InjuryReport ?? [],
              allTeams: sharedAllTeams,
              seasonContext: sharedSeasonContext,
              rosterMap: normalized,
              financials: orgEntry.Financials ?? null,
              playerFaces: sharedFaces,
              specialEvents: sharedSpecialEvents,
            };

            bootstrapCache.current.set(orgId, bootstrapData);
          }
        }

        if (orgUpdates.length > 0) {
          setOrganizations((prev) => {
            const updated = [...prev];
            for (const orgUpdate of orgUpdates) {
              const idx = updated.findIndex((o) => o.id === orgUpdate.id);
              if (idx >= 0) {
                updated[idx] = { ...updated[idx], ...orgUpdate };
              }
            }
            return updated;
          });
        }
      })
      .catch((e) => console.error("Background all-orgs cache fill failed:", e));

    // Load rosters and faces AFTER bootstrap completes (don't compete for bandwidth)
    BaseballService.GetAllRosters(activeOrgId)
      .then((allRosters) => {
        const rostersArray: BaseballRosters[] = Array.isArray(allRosters)
          ? allRosters
          : Object.values(allRosters as Record<string, BaseballRosters>);
        setRosters(
          rostersArray.map((r) => ({
            ...r,
            players: r.players.map(normalizePlayer),
          }))
        );
      })
      .catch((e) => console.error("Failed to load baseball rosters", e));

    BaseballService.GetFaceData()
      .then((faceData) => {
        const normalizedGlobalFaces: { [key: number]: FaceDataResponse } = {};
        if (faceData.faces) {
          for (const [id, f] of Object.entries(faceData.faces)) {
            normalizedGlobalFaces[Number(id)] = normalizeFaceData(f);
          }
        }
        setGlobalFaces(normalizedGlobalFaces);
      })
      .catch((e) => console.error("Failed to load baseball face data", e));
  }, [processAndCacheOrgData]);

  /** Apply cached bootstrap data to active state (no network call). */
  const applyBootstrap = useCallback((orgId: number, data: BootstrapData) => {
    setBootstrappedOrgId(orgId);
    setActiveBootstrap(data);
  }, []);

  /**
   * Load bootstrap for an org. Uses cache when available (instant swap).
   * Pass forceRefresh=true to bypass cache (e.g. after a trade or sim advance).
   */
  const loadBootstrapForOrg = useCallback(async (orgId: number, forceRefresh?: boolean) => {
    // Cache hit — swap instantly, no network call
    if (!forceRefresh && bootstrapCache.current.has(orgId)) {
      const cached = bootstrapCache.current.get(orgId)!;
      applyBootstrap(orgId, cached);
      // Return PascalCase shape to match raw API response (consumed by processBootstrapResult in team pages)
      return {
        RosterMap: cached.rosterMap,
        AllTeams: cached.allTeams,
        Standings: cached.standings,
        AllGames: cached.allGames,
        Notifications: cached.notifications,
        News: cached.news,
        TopBatter: cached.topBatter,
        TopPitcher: cached.topPitcher,
        TopFielder: cached.topFielder,
        InjuryReport: cached.injuryReport,
        SeasonContext: cached.seasonContext,
        Financials: cached.financials,
        FaceData: cached.playerFaces,
      };
    }

    // Cache miss — fetch single org, cache, then apply
    try {
      setIsBootstrapLoading(true);
      const data = await BaseballService.GetBootstrapLandingData(orgId);
      const bootstrapData = processAndCacheOrgData(orgId, data);
      applyBootstrap(orgId, bootstrapData);
      setIsBootstrapLoading(false);
      return data;
    } catch (error) {
      console.error("Failed to load baseball bootstrap data", error);
      setIsBootstrapLoading(false);
      return null;
    }
  }, [applyBootstrap, processAndCacheOrgData]);

  const toggleNotificationAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await BaseballService.MarkNotificationRead(notificationId);
        // Update both active state and cache
        setActiveBootstrap((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
        }));
        if (bootstrappedOrgId != null && bootstrapCache.current.has(bootstrappedOrgId)) {
          const cached = bootstrapCache.current.get(bootstrappedOrgId)!;
          bootstrapCache.current.set(bootstrappedOrgId, {
            ...cached,
            notifications: cached.notifications.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            ),
          });
        }
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    },
    [bootstrappedOrgId]
  );

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await BaseballService.DeleteNotification(notificationId);
        // Update both active state and cache
        setActiveBootstrap((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== notificationId),
        }));
        if (bootstrappedOrgId != null && bootstrapCache.current.has(bootstrappedOrgId)) {
          const cached = bootstrapCache.current.get(bootstrappedOrgId)!;
          bootstrapCache.current.set(bootstrappedOrgId, {
            ...cached,
            notifications: cached.notifications.filter((n) => n.id !== notificationId),
          });
        }
      } catch (error) {
        console.error("Failed to delete notification", error);
      }
    },
    [bootstrappedOrgId]
  );

  // Merge global faces with any bootstrap-specific faces (global takes priority for coverage)
  const mergedFaces = useMemo(() => ({
    ...activeBootstrap.playerFaces,
    ...globalFaces,
  }), [activeBootstrap.playerFaces, globalFaces]);

  return (
    <SimBaseballContext.Provider
      value={{
        organizations,
        collegeOrganization,
        mlbOrganization,
        mlbRoster,
        collegeRoster,
        isCollegeBaseballUser,
        isMlbUser,
        isCollegeOrgLoading: isLoading,
        isMlbOrgLoading: isLoading,
        baseball_Timestamp,
        isLoading: isLoading,
        standings: activeBootstrap.standings,
        allGames: activeBootstrap.allGames,
        notifications: activeBootstrap.notifications,
        news: activeBootstrap.news,
        topBatter: activeBootstrap.topBatter,
        topPitcher: activeBootstrap.topPitcher,
        topFielder: activeBootstrap.topFielder,
        injuryReport: activeBootstrap.injuryReport,
        allTeams: activeBootstrap.allTeams,
        seasonContext: activeBootstrap.seasonContext,
        rosterMap: activeBootstrap.rosterMap,
        allRosters: rosters,
        financials: activeBootstrap.financials,
        playerFaces: mergedFaces,
        specialEvents: activeBootstrap.specialEvents,
        bootstrappedOrgId,
        isBootstrapLoading,
        loadBootstrapForOrg,
        toggleNotificationAsRead,
        deleteNotification,
      }}
    >
      {children}
    </SimBaseballContext.Provider>
  );
};

export const useSimBaseballStore = (): SimBaseballContextProps => {
  const context = useContext(SimBaseballContext);
  if (!context) {
    throw new Error(
      "useSimBaseballStore must be used within a SimBaseballProvider"
    );
  }
  return context;
};
