import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "./AuthContext";
import {
  LacrosseAdminService,
  LacrosseNewsService,
  LacrosseRecruitingService,
  LacrosseService,
  LacrosseStatisticsService,
  LaxAdminStatus,
  LaxGameplan,
  LaxLineupAssignment,
  LaxNewsResponse,
  LaxPlayerCareerStatistics,
  LaxRecruitingAISettings,
  LaxRecruitingBoard,
  LaxRecruitingOverview,
  LaxRecruitingRankings,
  LaxRosterResponse,
  LaxScheduleResponse,
  LaxStatisticsCategory,
  LaxStatisticsResponse,
  LaxStatisticsType,
  LaxTeam,
} from "../_services/lacrosseService";

export const claxScheduleKey = (teamId?: number, season?: number) => `${teamId ?? "default"}:${season ?? "current"}`;
export const claxGameplanKey = (teamId: number, adminMode = false) => `${teamId}:${adminMode ? "admin" : "owner"}`;
export const claxStatsKey = (season: number | undefined, week: number | undefined, category: LaxStatisticsCategory, type: LaxStatisticsType) =>
  `${season ?? "current"}:${week ?? "season"}:${category}:${type}`;

interface SimLAXContextValue {
  claxTeam: LaxTeam | null;
  claxTeamLoading: boolean;
  claxTeams: LaxTeam[];
  claxTeamsError: string;
  laxAdminStatus: LaxAdminStatus | null;
  laxAdminChecked: boolean;
  claxNews: LaxNewsResponse | null;
  claxNewsError: string;
  claxSchedules: Record<string, LaxScheduleResponse>;
  claxRosters: Record<number, LaxRosterResponse>;
  claxGameplans: Record<string, LaxGameplan>;
  claxRecruitingOverview: LaxRecruitingOverview | null;
  claxRecruitingBoard: LaxRecruitingBoard | null;
  claxRecruitingRankings: LaxRecruitingRankings | null;
  claxRecruitingTeam: LaxRecruitingOverview["team"] | null;
  claxStatistics: Record<string, LaxStatisticsResponse>;
  claxPlayerCareerStatistics: Record<number, LaxPlayerCareerStatistics>;
  refreshClaxTeam: () => Promise<void>;
  refreshClaxTeams: () => Promise<void>;
  refreshLaxAdminStatus: () => Promise<void>;
  refreshClaxNews: () => Promise<void>;
  refreshClaxSchedule: (teamId?: number, season?: number) => Promise<LaxScheduleResponse>;
  refreshClaxRoster: (teamId: number) => Promise<LaxRosterResponse>;
  refreshClaxGameplan: (teamId: number, adminMode?: boolean) => Promise<LaxGameplan>;
  saveClaxLineup: (teamId: number, assignments: LaxLineupAssignment[], adminMode?: boolean) => Promise<LaxRosterResponse>;
  autoClaxLineup: (teamId: number, adminMode?: boolean) => Promise<LaxRosterResponse>;
  setClaxAiControl: (teamId: number, enabled: boolean, adminMode?: boolean) => Promise<LaxRosterResponse>;
  saveClaxGameplan: (teamId: number, gameplan: Omit<LaxGameplan, "teamId">, adminMode?: boolean) => Promise<LaxGameplan>;
  cutClaxPlayer: (teamId: number, playerId: number) => Promise<void>;
  refreshClaxRecruitingOverview: () => Promise<LaxRecruitingOverview>;
  refreshClaxRecruitingBoard: () => Promise<LaxRecruitingBoard>;
  refreshClaxRecruitingRankings: () => Promise<LaxRecruitingRankings>;
  addClaxRecruitToBoard: (recruitId: number) => Promise<void>;
  removeClaxRecruitFromBoard: (recruitId: number) => Promise<void>;
  toggleClaxScholarship: (recruitId: number) => Promise<void>;
  saveClaxRecruitingPoints: (allocations: Array<{ recruitId: number; points: number }>) => Promise<void>;
  saveClaxRecruitingAiSettings: (settings: LaxRecruitingAISettings) => Promise<void>;
  refreshClaxStatistics: (season: number | undefined, week: number | undefined, category: LaxStatisticsCategory, type: LaxStatisticsType) => Promise<LaxStatisticsResponse>;
  refreshClaxPlayerCareerStatistics: (playerId: number) => Promise<LaxPlayerCareerStatistics>;
}

const SimLAXContext = createContext<SimLAXContextValue | null>(null);

export const SimLAXProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuthStore();
  const userId = currentUser?.id;
  const identityRequest = useRef(0);
  const adminRequest = useRef(0);
  const newsRequest = useRef(0);
  const teamsRequest = useRef(0);
  const scheduleEpoch = useRef(0);
  const scheduleRequests = useRef<Record<string, number>>({});
  const rosterRequests = useRef<Record<number, number>>({});
  const gameplanRequests = useRef<Record<string, number>>({});
  const recruitingRequests = useRef({ overview: 0, board: 0, rankings: 0 });
  const statisticsRequests = useRef<Record<string, number>>({});
  const playerCareerRequests = useRef<Record<number, number>>({});
  const [claxTeam, setClaxTeam] = useState<LaxTeam | null>(null);
  const [claxTeamLoading, setClaxTeamLoading] = useState(Boolean(userId));
  const [claxTeams, setClaxTeams] = useState<LaxTeam[]>([]);
  const [claxTeamsError, setClaxTeamsError] = useState("");
  const [laxAdminStatus, setLaxAdminStatus] = useState<LaxAdminStatus | null>(null);
  const [laxAdminChecked, setLaxAdminChecked] = useState(false);
  const [claxNews, setClaxNews] = useState<LaxNewsResponse | null>(null);
  const [claxNewsError, setClaxNewsError] = useState("");
  const [claxSchedules, setClaxSchedules] = useState<Record<string, LaxScheduleResponse>>({});
  const [claxRosters, setClaxRosters] = useState<Record<number, LaxRosterResponse>>({});
  const [claxGameplans, setClaxGameplans] = useState<Record<string, LaxGameplan>>({});
  const [claxRecruitingOverview, setClaxRecruitingOverview] = useState<LaxRecruitingOverview | null>(null);
  const [claxRecruitingBoard, setClaxRecruitingBoard] = useState<LaxRecruitingBoard | null>(null);
  const [claxRecruitingRankings, setClaxRecruitingRankings] = useState<LaxRecruitingRankings | null>(null);
  const [claxRecruitingTeam, setClaxRecruitingTeam] = useState<LaxRecruitingOverview["team"] | null>(null);
  const [claxStatistics, setClaxStatistics] = useState<Record<string, LaxStatisticsResponse>>({});
  const [claxPlayerCareerStatistics, setClaxPlayerCareerStatistics] = useState<Record<number, LaxPlayerCareerStatistics>>({});

  const refreshClaxRecruitingOverview = useCallback(async () => {
    const epoch = scheduleEpoch.current;
    const request = ++recruitingRequests.current.overview;
    const response = await LacrosseRecruitingService.getOverview();
    if (epoch === scheduleEpoch.current && request === recruitingRequests.current.overview) {
      setClaxRecruitingOverview(response);
      setClaxRecruitingTeam(response.team);
    }
    return response;
  }, []);

  const refreshClaxRecruitingBoard = useCallback(async () => {
    const epoch = scheduleEpoch.current;
    const request = ++recruitingRequests.current.board;
    const response = await LacrosseRecruitingService.getBoard();
    if (epoch === scheduleEpoch.current && request === recruitingRequests.current.board) {
      setClaxRecruitingBoard(response);
      setClaxRecruitingTeam(response.team);
    }
    return response;
  }, []);

  const refreshClaxRecruitingRankings = useCallback(async () => {
    const epoch = scheduleEpoch.current;
    const request = ++recruitingRequests.current.rankings;
    const response = await LacrosseRecruitingService.getRankings();
    if (epoch === scheduleEpoch.current && request === recruitingRequests.current.rankings) setClaxRecruitingRankings(response);
    return response;
  }, []);

  const invalidateRecruiting = useCallback(() => {
    ++recruitingRequests.current.overview;
    ++recruitingRequests.current.board;
    ++recruitingRequests.current.rankings;
  }, []);

  const addClaxRecruitToBoard = useCallback(async (recruitId: number) => {
    await LacrosseRecruitingService.addToBoard(recruitId);
    invalidateRecruiting();
  }, [invalidateRecruiting]);

  const removeClaxRecruitFromBoard = useCallback(async (recruitId: number) => {
    await LacrosseRecruitingService.removeFromBoard(recruitId);
    invalidateRecruiting();
  }, [invalidateRecruiting]);

  const toggleClaxScholarship = useCallback(async (recruitId: number) => {
    await LacrosseRecruitingService.toggleScholarship(recruitId);
    invalidateRecruiting();
  }, [invalidateRecruiting]);

  const saveClaxRecruitingPoints = useCallback(async (allocations: Array<{ recruitId: number; points: number }>) => {
    await LacrosseRecruitingService.savePoints(allocations);
    invalidateRecruiting();
  }, [invalidateRecruiting]);

  const saveClaxRecruitingAiSettings = useCallback(async (settings: LaxRecruitingAISettings) => {
    await LacrosseRecruitingService.saveAiSettings(settings);
    invalidateRecruiting();
  }, [invalidateRecruiting]);

  const refreshClaxStatistics = useCallback(async (season: number | undefined, week: number | undefined, category: LaxStatisticsCategory, type: LaxStatisticsType) => {
    const key = claxStatsKey(season, week, category, type);
    const epoch = scheduleEpoch.current;
    const request = (statisticsRequests.current[key] ?? 0) + 1;
    statisticsRequests.current[key] = request;
    const response = await LacrosseStatisticsService.get(season, week, category, type);
    if (epoch === scheduleEpoch.current && request === statisticsRequests.current[key]) {
      setClaxStatistics((current) => ({ ...current, [key]: response }));
    }
    return response;
  }, []);

  const refreshClaxPlayerCareerStatistics = useCallback(async (playerId: number) => {
    const epoch = scheduleEpoch.current;
    const request = (playerCareerRequests.current[playerId] ?? 0) + 1;
    playerCareerRequests.current[playerId] = request;
    const response = await LacrosseStatisticsService.getPlayerCareer(playerId);
    if (epoch === scheduleEpoch.current && request === playerCareerRequests.current[playerId]) {
      setClaxPlayerCareerStatistics((current) => ({ ...current, [playerId]: response }));
    }
    return response;
  }, []);

  const refreshClaxSchedule = useCallback(async (teamId?: number, season?: number) => {
    const key = claxScheduleKey(teamId, season);
    const epoch = scheduleEpoch.current;
    const request = (scheduleRequests.current[key] ?? 0) + 1;
    scheduleRequests.current[key] = request;
    const schedule = await LacrosseService.getSchedule(teamId, season);
    if (epoch === scheduleEpoch.current && request === scheduleRequests.current[key]) {
      setClaxSchedules((current) => ({ ...current, [key]: schedule }));
    }
    return schedule;
  }, []);

  const refreshClaxRoster = useCallback(async (teamId: number) => {
    const epoch = scheduleEpoch.current;
    const request = (rosterRequests.current[teamId] ?? 0) + 1;
    rosterRequests.current[teamId] = request;
    const roster = await LacrosseService.getRoster(teamId);
    if (epoch === scheduleEpoch.current && request === rosterRequests.current[teamId]) {
      setClaxRosters((current) => ({ ...current, [teamId]: roster }));
    }
    return roster;
  }, []);

  const refreshClaxGameplan = useCallback(async (teamId: number, adminMode = false) => {
    const key = claxGameplanKey(teamId, adminMode);
    const epoch = scheduleEpoch.current;
    const request = (gameplanRequests.current[key] ?? 0) + 1;
    gameplanRequests.current[key] = request;
    const gameplan = await LacrosseService.getGameplan(teamId, adminMode);
    if (epoch === scheduleEpoch.current && request === gameplanRequests.current[key]) {
      setClaxGameplans((current) => ({ ...current, [key]: gameplan }));
    }
    return gameplan;
  }, []);

  const storeRoster = useCallback((teamId: number, roster: LaxRosterResponse) => {
    rosterRequests.current[teamId] = (rosterRequests.current[teamId] ?? 0) + 1;
    setClaxRosters((current) => ({ ...current, [teamId]: roster }));
    return roster;
  }, []);

  const saveClaxLineup = useCallback(async (teamId: number, assignments: LaxLineupAssignment[], adminMode = false) =>
    storeRoster(teamId, await LacrosseService.saveLineup(teamId, assignments, adminMode)), [storeRoster]);

  const autoClaxLineup = useCallback(async (teamId: number, adminMode = false) =>
    storeRoster(teamId, await LacrosseService.autoLineup(teamId, adminMode)), [storeRoster]);

  const setClaxAiControl = useCallback(async (teamId: number, enabled: boolean, adminMode = false) =>
    storeRoster(teamId, await LacrosseService.setAiControl(teamId, enabled, adminMode)), [storeRoster]);

  const saveClaxGameplan = useCallback(async (teamId: number, gameplan: Omit<LaxGameplan, "teamId">, adminMode = false) => {
    const saved = await LacrosseService.saveGameplan(teamId, gameplan, adminMode);
    const key = claxGameplanKey(teamId, adminMode);
    gameplanRequests.current[key] = (gameplanRequests.current[key] ?? 0) + 1;
    setClaxGameplans((current) => ({ ...current, [key]: saved }));
    return saved;
  }, []);

  const cutClaxPlayer = useCallback(async (teamId: number, playerId: number) => {
    await LacrosseService.cutPlayer(teamId, playerId);
    rosterRequests.current[teamId] = (rosterRequests.current[teamId] ?? 0) + 1;
    setClaxRosters((current) => {
      const roster = current[teamId];
      return roster ? { ...current, [teamId]: { ...roster, players: roster.players.filter((player) => player.id !== playerId) } } : current;
    });
  }, []);

  const refreshClaxTeam = useCallback(async () => {
    const request = ++identityRequest.current;
    if (!userId) { setClaxTeam(null); setClaxTeamLoading(false); return; }
    setClaxTeamLoading(true);
    try {
      const team = await LacrosseService.getUserTeam(userId);
      if (request === identityRequest.current) setClaxTeam(team);
    } catch { if (request === identityRequest.current) setClaxTeam(null); }
    finally { if (request === identityRequest.current) setClaxTeamLoading(false); }
  }, [userId]);

  const refreshClaxTeams = useCallback(async () => {
    const request = ++teamsRequest.current;
    try {
      const result = await LacrosseService.getTeams();
      if (request === teamsRequest.current) {
        setClaxTeams(result.teams);
        setClaxTeamsError("");
      }
    } catch {
      if (request === teamsRequest.current) {
        setClaxTeams([]);
        setClaxTeamsError("SimCLAX teams could not be loaded. Please refresh after the local database is running.");
      }
    }
  }, []);

  const refreshLaxAdminStatus = useCallback(async () => {
    const request = ++adminRequest.current;
    if (!userId) { setLaxAdminStatus(null); setLaxAdminChecked(true); return; }
    setLaxAdminChecked(false);
    try {
      const status = await LacrosseAdminService.getStatus();
      if (request === adminRequest.current) setLaxAdminStatus(status);
    } catch { if (request === adminRequest.current) setLaxAdminStatus(null); }
    finally { if (request === adminRequest.current) setLaxAdminChecked(true); }
  }, [userId]);

  const refreshClaxNews = useCallback(async () => {
    const request = ++newsRequest.current;
    try {
      const news = await LacrosseNewsService.get();
      if (request === newsRequest.current) { setClaxNews(news); setClaxNewsError(""); }
    } catch {
      if (request === newsRequest.current) {
        setClaxNews(null);
        setClaxNewsError("SimCLAX news could not be loaded.");
      }
    }
  }, []);

  useEffect(() => {
    ++identityRequest.current;
    ++adminRequest.current;
    ++newsRequest.current;
    ++teamsRequest.current;
    ++scheduleEpoch.current;
    scheduleRequests.current = {};
    rosterRequests.current = {};
    gameplanRequests.current = {};
    recruitingRequests.current = { overview: 0, board: 0, rankings: 0 };
    statisticsRequests.current = {};
    playerCareerRequests.current = {};
    setClaxTeam(null);
    setLaxAdminStatus(null);
    setClaxNews(null);
    setClaxTeams([]);
    setClaxSchedules({});
    setClaxRosters({});
    setClaxGameplans({});
    setClaxRecruitingOverview(null);
    setClaxRecruitingBoard(null);
    setClaxRecruitingRankings(null);
    setClaxRecruitingTeam(null);
    setClaxStatistics({});
    setClaxPlayerCareerStatistics({});
    setClaxNewsError("");
    setClaxTeamsError("");
    setClaxTeamLoading(Boolean(userId));
    setLaxAdminChecked(false);
    void refreshClaxTeam();
    void refreshLaxAdminStatus();
    return () => {
      ++identityRequest.current;
      ++adminRequest.current;
      ++newsRequest.current;
      ++teamsRequest.current;
      ++scheduleEpoch.current;
      scheduleRequests.current = {};
      rosterRequests.current = {};
      gameplanRequests.current = {};
      recruitingRequests.current = { overview: 0, board: 0, rankings: 0 };
      statisticsRequests.current = {};
      playerCareerRequests.current = {};
    };
  }, [userId, refreshClaxTeam, refreshLaxAdminStatus]);

  const value = useMemo(() => ({
    claxTeam, claxTeamLoading, claxTeams, claxTeamsError,
    laxAdminStatus, laxAdminChecked, claxNews, claxNewsError, claxSchedules, claxRosters, claxGameplans,
    claxRecruitingOverview, claxRecruitingBoard, claxRecruitingRankings, claxRecruitingTeam, claxStatistics,
    claxPlayerCareerStatistics,
    refreshClaxTeam, refreshClaxTeams, refreshLaxAdminStatus, refreshClaxNews, refreshClaxSchedule,
    refreshClaxRoster, refreshClaxGameplan, saveClaxLineup, autoClaxLineup, setClaxAiControl,
    saveClaxGameplan, cutClaxPlayer, refreshClaxRecruitingOverview, refreshClaxRecruitingBoard,
    refreshClaxRecruitingRankings, addClaxRecruitToBoard, removeClaxRecruitFromBoard,
    toggleClaxScholarship, saveClaxRecruitingPoints, saveClaxRecruitingAiSettings, refreshClaxStatistics,
    refreshClaxPlayerCareerStatistics,
  }), [claxTeam, claxTeamLoading, claxTeams, claxTeamsError, laxAdminStatus,
    laxAdminChecked, claxNews, claxNewsError, claxSchedules, claxRosters, claxGameplans,
    claxRecruitingOverview, claxRecruitingBoard, claxRecruitingRankings, claxRecruitingTeam, claxStatistics,
    claxPlayerCareerStatistics,
    refreshClaxTeam, refreshClaxTeams, refreshLaxAdminStatus, refreshClaxNews, refreshClaxSchedule,
    refreshClaxRoster, refreshClaxGameplan, saveClaxLineup, autoClaxLineup, setClaxAiControl,
    saveClaxGameplan, cutClaxPlayer, refreshClaxRecruitingOverview, refreshClaxRecruitingBoard,
    refreshClaxRecruitingRankings, addClaxRecruitToBoard, removeClaxRecruitFromBoard,
    toggleClaxScholarship, saveClaxRecruitingPoints, saveClaxRecruitingAiSettings, refreshClaxStatistics,
    refreshClaxPlayerCareerStatistics]);

  return <SimLAXContext.Provider value={value}>{children}</SimLAXContext.Provider>;
};

export const useSimLAXStore = () => {
  const context = useContext(SimLAXContext);
  if (!context) throw new Error("useSimLAXStore must be used within SimLAXProvider");
  return context;
};
