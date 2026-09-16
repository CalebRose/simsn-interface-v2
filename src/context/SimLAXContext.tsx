import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "./AuthContext";
import {
  LacrosseAdminService,
  LacrosseNewsService,
  LacrosseService,
  LaxAdminStatus,
  LaxNewsResponse,
  LaxTeam,
} from "../_services/lacrosseService";

interface SimLAXContextValue {
  claxTeam: LaxTeam | null;
  claxTeamLoading: boolean;
  claxTeams: LaxTeam[];
  claxTeamsError: string;
  laxAdminStatus: LaxAdminStatus | null;
  laxAdminChecked: boolean;
  claxNews: LaxNewsResponse | null;
  claxNewsError: string;
  refreshClaxTeam: () => Promise<void>;
  refreshClaxTeams: () => Promise<void>;
  refreshLaxAdminStatus: () => Promise<void>;
  refreshClaxNews: () => Promise<void>;
}

const SimLAXContext = createContext<SimLAXContextValue | null>(null);

export const SimLAXProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuthStore();
  const userId = currentUser?.id;
  const identityRequest = useRef(0);
  const adminRequest = useRef(0);
  const newsRequest = useRef(0);
  const teamsRequest = useRef(0);
  const [claxTeam, setClaxTeam] = useState<LaxTeam | null>(null);
  const [claxTeamLoading, setClaxTeamLoading] = useState(Boolean(userId));
  const [claxTeams, setClaxTeams] = useState<LaxTeam[]>([]);
  const [claxTeamsError, setClaxTeamsError] = useState("");
  const [laxAdminStatus, setLaxAdminStatus] = useState<LaxAdminStatus | null>(null);
  const [laxAdminChecked, setLaxAdminChecked] = useState(false);
  const [claxNews, setClaxNews] = useState<LaxNewsResponse | null>(null);
  const [claxNewsError, setClaxNewsError] = useState("");

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
    setClaxTeam(null);
    setLaxAdminStatus(null);
    setClaxNews(null);
    setClaxTeams([]);
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
    };
  }, [userId, refreshClaxTeam, refreshLaxAdminStatus]);

  const value = useMemo(() => ({
    claxTeam, claxTeamLoading, claxTeams, claxTeamsError,
    laxAdminStatus, laxAdminChecked, claxNews, claxNewsError,
    refreshClaxTeam, refreshClaxTeams, refreshLaxAdminStatus, refreshClaxNews,
  }), [claxTeam, claxTeamLoading, claxTeams, claxTeamsError, laxAdminStatus,
    laxAdminChecked, claxNews, claxNewsError, refreshClaxTeam, refreshClaxTeams,
    refreshLaxAdminStatus, refreshClaxNews]);

  return <SimLAXContext.Provider value={value}>{children}</SimLAXContext.Provider>;
};

export const useSimLAXStore = () => {
  const context = useContext(SimLAXContext);
  if (!context) throw new Error("useSimLAXStore must be used within SimLAXProvider");
  return context;
};
