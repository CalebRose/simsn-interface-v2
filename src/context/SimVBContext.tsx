import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthStore } from "./AuthContext";
import {
  isVolleyballConfigured,
  VbClaimRequest,
  VbClock,
  VbCoach,
  VbLeague,
  VbLeagueKind,
  VbMe,
  VbTeam,
  VolleyballCoachService,
  VolleyballService,
} from "../_services/volleyballService";

interface SimVBContextValue {
  /** False when the build has no volleyball API address. */
  vbAvailable: boolean;
  /** The one college league and the one pro league, found by Kind. */
  vbLeagues: Record<VbLeagueKind, VbLeague | null>;
  /** True once the league list has been answered (or has failed). */
  vbLeaguesChecked: boolean;
  /**
   * The user's coach at each level: two separate people. Each coaches at most
   * one team, at its own level, so a user can hold a college program and a
   * pro club at once.
   */
  vbCoaches: Record<VbLeagueKind, VbCoach | null>;
  cvbTeam: VbTeam | null;
  pvbTeam: VbTeam | null;
  vbRequests: VbClaimRequest[];
  vbLoading: boolean;
  /** League clocks keyed by LeagueID. Pages keep them fresh with useVbClock. */
  vbClocks: Record<number, VbClock>;
  /** Every team of a league, null until loaded. See useVbTeams. */
  vbTeams: Record<VbLeagueKind, VbTeam[] | null>;
  vbTeamsById: Record<number, VbTeam>;
  /**
   * Everything else a page loads, cached by key. Emptied when a league clock
   * advances or the user changes. Pages read it through useVbResource.
   */
  vbResources: Record<string, unknown>;
  /** Changes whenever vbResources is emptied. */
  vbResourceEpoch: number;
  refreshVbMe: () => Promise<void>;
  refreshVbClock: (leagueId: number) => Promise<VbClock>;
  refreshVbTeams: (kind: VbLeagueKind) => Promise<void>;
  loadVbResource: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
  /** Stores a value a save just returned, so the page shows it at once. */
  setVbResource: (key: string, data: unknown) => void;
}

const SimVBContext = createContext<SimVBContextValue | null>(null);

const noLeagues: Record<VbLeagueKind, VbLeague | null> = {
  college: null,
  pro: null,
};
const noTeams: Record<VbLeagueKind, VbTeam[] | null> = {
  college: null,
  pro: null,
};
const noCoaches: Record<VbLeagueKind, VbCoach | null> = {
  college: null,
  pro: null,
};

/** The coach at each level, from a new answer or an older one. */
const coachesOf = (me: VbMe): Record<VbLeagueKind, VbCoach | null> => {
  if (me.Coaches) {
    return { college: me.Coaches.College, pro: me.Coaches.Pro };
  }
  // Older answers had one coach: its level, else its team's, else college.
  const coach = me.Coach;
  if (!coach) return noCoaches;
  const level: VbLeagueKind =
    coach.Level ??
    me.Teams.find((team) => team.TeamID === coach.TeamID)?.Kind ??
    "college";
  return { ...noCoaches, [level]: coach };
};

export const SimVBProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuthStore();
  const userId = currentUser?.id;
  const meRequest = useRef(0);
  const leaguesRequest = useRef(0);
  const clocksInFlight = useRef<Record<number, Promise<VbClock>>>({});
  const clockTicks = useRef<Record<number, number>>({});
  const teamsInFlight = useRef<Partial<Record<VbLeagueKind, Promise<void>>>>(
    {},
  );
  const resourcesInFlight = useRef<Record<string, Promise<unknown>>>({});
  const resourceEpoch = useRef(0);
  const [vbLeagues, setVbLeagues] = useState(noLeagues);
  const [vbLeaguesChecked, setVbLeaguesChecked] = useState(
    !isVolleyballConfigured,
  );
  const [vbCoaches, setVbCoaches] = useState(noCoaches);
  const [cvbTeam, setCvbTeam] = useState<VbTeam | null>(null);
  const [pvbTeam, setPvbTeam] = useState<VbTeam | null>(null);
  const [vbRequests, setVbRequests] = useState<VbClaimRequest[]>([]);
  const [vbLoading, setVbLoading] = useState(
    isVolleyballConfigured && Boolean(userId),
  );
  const [vbClocks, setVbClocks] = useState<Record<number, VbClock>>({});
  const [vbTeams, setVbTeams] = useState(noTeams);
  const [vbTeamsById, setVbTeamsById] = useState<Record<number, VbTeam>>({});
  const [vbResources, setVbResources] = useState<Record<string, unknown>>({});
  const [vbResourceEpoch, setVbResourceEpoch] = useState(0);

  const clearVbResources = useCallback(() => {
    resourcesInFlight.current = {};
    setVbResources({});
    setVbResourceEpoch(++resourceEpoch.current);
  }, []);

  // This provider is mounted for every user on every page, so any failure
  // here is swallowed: a volleyball outage must cost the rest of the site
  // nothing.
  const refreshVbMe = useCallback(async () => {
    const request = ++meRequest.current;
    const clear = () => {
      setVbCoaches(noCoaches);
      setCvbTeam(null);
      setPvbTeam(null);
      setVbRequests([]);
    };
    if (!isVolleyballConfigured || !userId) {
      clear();
      setVbLoading(false);
      return;
    }
    setVbLoading(true);
    try {
      const me = await VolleyballCoachService.getMe();
      const teamOf = (kind: VbLeagueKind) => {
        const managed = me.Teams.find((team) => team.Kind === kind);
        return managed ? VolleyballService.getTeam(managed.TeamID) : null;
      };
      const [college, pro] = await Promise.all([
        teamOf("college"),
        teamOf("pro"),
      ]);
      if (request !== meRequest.current) return;
      setVbCoaches(coachesOf(me));
      setVbRequests(me.Requests);
      setCvbTeam(college);
      setPvbTeam(pro);
    } catch {
      if (request === meRequest.current) clear();
    } finally {
      if (request === meRequest.current) setVbLoading(false);
    }
  }, [userId]);

  const refreshVbLeagues = useCallback(async () => {
    const request = ++leaguesRequest.current;
    if (!isVolleyballConfigured || !userId) return;
    try {
      const leagues = await VolleyballService.getLeagues();
      if (request !== leaguesRequest.current) return;
      setVbLeagues({
        college: leagues.find((league) => league.Kind === "college") ?? null,
        pro: leagues.find((league) => league.Kind === "pro") ?? null,
      });
    } catch {
      // Leave what we had; volleyball pages show their own unavailable state.
    } finally {
      if (request === leaguesRequest.current) setVbLeaguesChecked(true);
    }
  }, [userId]);

  const refreshVbClock = useCallback(
    (leagueId: number) => {
      // Several parts of one page watch the same clock; they share a request.
      const running = clocksInFlight.current[leagueId];
      if (running) return running;
      const request = VolleyballService.getClock(leagueId)
        .then((clock) => {
          // The league moved on: schedules, standings and rosters may all
          // have changed, so everything cached is dropped and pages reload.
          const lastTick = clockTicks.current[leagueId];
          clockTicks.current[leagueId] = clock.Tick;
          if (lastTick !== undefined && lastTick !== clock.Tick) {
            clearVbResources();
          }
          setVbClocks((current) => ({ ...current, [leagueId]: clock }));
          return clock;
        })
        .finally(() => {
          delete clocksInFlight.current[leagueId];
        });
      clocksInFlight.current[leagueId] = request;
      return request;
    },
    [clearVbResources],
  );

  const refreshVbTeams = useCallback(
    (kind: VbLeagueKind) => {
      const leagueId = vbLeagues[kind]?.LeagueID;
      if (!leagueId) return Promise.resolve();
      const running = teamsInFlight.current[kind];
      if (running) return running;
      const request = VolleyballService.getTeams(leagueId)
        .then((teams) => {
          setVbTeams((current) => ({ ...current, [kind]: teams }));
          setVbTeamsById((current) => ({
            ...current,
            ...Object.fromEntries(teams.map((team) => [team.TeamID, team])),
          }));
        })
        .finally(() => {
          delete teamsInFlight.current[kind];
        });
      teamsInFlight.current[kind] = request;
      return request;
    },
    [vbLeagues],
  );

  const loadVbResource = useCallback(
    <T,>(key: string, fetcher: () => Promise<T>): Promise<T> => {
      const running = resourcesInFlight.current[key];
      if (running) return running as Promise<T>;
      const epoch = resourceEpoch.current;
      const request = fetcher()
        .then((data) => {
          if (epoch === resourceEpoch.current) {
            setVbResources((current) => ({ ...current, [key]: data }));
          }
          return data;
        })
        .finally(() => {
          if (resourcesInFlight.current[key] === request) {
            delete resourcesInFlight.current[key];
          }
        });
      resourcesInFlight.current[key] = request;
      return request;
    },
    [],
  );

  const setVbResource = useCallback((key: string, data: unknown) => {
    // An older load of the same key must not overwrite what was just saved.
    delete resourcesInFlight.current[key];
    setVbResources((current) => ({ ...current, [key]: data }));
  }, []);

  useEffect(() => {
    void refreshVbMe();
    void refreshVbLeagues();
    return () => {
      // The user changed: drop any answer still in flight, and do not show
      // the previous user's coach, team or coach-only data to the next one.
      ++meRequest.current;
      ++leaguesRequest.current;
      setVbCoaches(noCoaches);
      setCvbTeam(null);
      setPvbTeam(null);
      setVbRequests([]);
      clearVbResources();
    };
  }, [refreshVbMe, refreshVbLeagues, clearVbResources]);

  const value = useMemo(
    () => ({
      vbAvailable: isVolleyballConfigured,
      vbLeagues,
      vbLeaguesChecked,
      vbCoaches,
      cvbTeam,
      pvbTeam,
      vbRequests,
      vbLoading,
      vbClocks,
      vbTeams,
      vbTeamsById,
      vbResources,
      vbResourceEpoch,
      refreshVbMe,
      refreshVbClock,
      refreshVbTeams,
      loadVbResource,
      setVbResource,
    }),
    [
      vbLeagues,
      vbLeaguesChecked,
      vbCoaches,
      cvbTeam,
      pvbTeam,
      vbRequests,
      vbLoading,
      vbClocks,
      vbTeams,
      vbTeamsById,
      vbResources,
      vbResourceEpoch,
      refreshVbMe,
      refreshVbClock,
      refreshVbTeams,
      loadVbResource,
      setVbResource,
    ],
  );

  return (
    <SimVBContext.Provider value={value}>{children}</SimVBContext.Provider>
  );
};

export const useSimVBStore = () => {
  const context = useContext(SimVBContext);
  if (!context)
    throw new Error("useSimVBStore must be used within SimVBProvider");
  return context;
};
