import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
  SimMLB,
  SimCollegeBaseball
} from "../_constants/constants";
import { GetLeagueTS } from "../_helper/teamHelper";
import { Timestamp as FBTimeStamp } from "../models/footballModels";
import { Timestamp as BKTimestamp } from "../models/basketballModels";
import { Timestamp as HKTimestamp } from "../models/hockeyModels";
import { Timestamp as BaseballTimestamp } from "../models/baseballModels";
import { useAuthStore } from "./AuthContext";
import { useSimHCKStore } from "./SimHockeyContext";
import { useSimFBAStore } from "./SimFBAContext";
import { useSimBBAStore } from "./SimBBAContext";
import { useSimBaseballStore } from "./SimBaseballContext";
import { teamByLeague } from "../_utility/useLeagueSelector";

interface LeagueContextProps {
  selectedLeague: string;
  setSelectedLeague: React.Dispatch<React.SetStateAction<League>>;
  ts: FBTimeStamp | BKTimestamp | HKTimestamp | BaseballTimestamp | null;
  selectedTeam?: any;
  SetTeam: (league: League, team: any) => void;
}

const defaultLeagueContext: LeagueContextProps = {
  selectedLeague: SimCFB,
  setSelectedLeague: () => {},
  ts: null,
  SetTeam: () => {},
  selectedTeam: null,
};

const LeagueContext = createContext<LeagueContextProps>(defaultLeagueContext);

interface LeagueProviderProps {
  children: ReactNode;
}

export const LeagueProvider = ({ children }: LeagueProviderProps) => {
  const { currentUser } = useAuthStore();
  const {
    hck_Timestamp,
    chlTeam,
    phlTeam,
    isLoading: hkLoading,
  } = useSimHCKStore();
  const {
    cfb_Timestamp,
    cfbTeam,
    nflTeam,
    isLoading: fbLoading,
  } = useSimFBAStore();
  const {
    cbb_Timestamp,
    cbbTeam,
    nbaTeam,
    isLoading: bkLoading,
  } = useSimBBAStore();
  const {
    baseball_Timestamp,
    collegeOrganization,
    mlbOrganization,
    isLoading: baseballLoading,
  } = useSimBaseballStore();
  
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState<League>(() => {
    if (currentUser && currentUser.DefaultLeague) {
      return currentUser.DefaultLeague as League;
    }
    return SimCFB;
  });

  const ts = useMemo<FBTimeStamp | BKTimestamp | HKTimestamp | BaseballTimestamp | null>(
    () =>
      GetLeagueTS(selectedLeague, cfb_Timestamp, cbb_Timestamp, hck_Timestamp, baseball_Timestamp ),
    [selectedLeague, cfb_Timestamp, cbb_Timestamp, hck_Timestamp, baseball_Timestamp]
  );

  useEffect(() => {
    // only run once all stores are done loading
    if (fbLoading || bkLoading || hkLoading) return;

    // Only set team if we don't have a selected team yet
    if (selectedTeam) return;

    // 1) Try the user's DefaultLeague
    const defaultLeague = currentUser?.DefaultLeague as League | undefined;
    if (defaultLeague) {
      const defaultTeam = teamByLeague({
        league: defaultLeague,
        cfbTeam,
        nflTeam,
        cbbTeam,
        nbaTeam,
        chlTeam,
        phlTeam,
      });
      if (defaultTeam) {
        setSelectedLeague(defaultLeague);
        setSelectedTeam(defaultTeam);
        return;
      }
    }

    // 2) Fallback priority: CFB → NFL → CBB → NBA → CHL → PHL
    const priority: League[] = [SimCFB, SimNFL, SimCBB, SimNBA, SimCHL, SimPHL];
    for (let league of priority) {
      const team = teamByLeague({
        league,
        cfbTeam,
        nflTeam,
        cbbTeam,
        nbaTeam,
        chlTeam,
        phlTeam,
      });
      if (team) {
        setSelectedLeague(league);
        setSelectedTeam(team);
        break;
      }
    }
  }, [
    fbLoading,
    bkLoading,
    hkLoading,
    cfbTeam,
    nflTeam,
    cbbTeam,
    nbaTeam,
    chlTeam,
    phlTeam,
    currentUser?.DefaultLeague,
    selectedTeam,
    setSelectedLeague,
  ]);

  const SetRunCron = () => {};

  const SetRunGames = () => {};

  const SetDraft = () => {};

  const SetTeam = (league: League, team: any) => {
    setSelectedLeague(league);
    setSelectedTeam(team);
  };

  return (
    <LeagueContext.Provider
      value={{ selectedLeague, setSelectedLeague, ts, selectedTeam, SetTeam }}
    >
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeagueStore = (): LeagueContextProps => {
  const store = useContext(LeagueContext);
  if (!store) {
    throw new Error("useAuthStore must be used within an AuthProvider");
  }
  return store;
};
