import {
  createContext,
  ReactNode,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuthStore } from "./AuthContext";
import { BootstrapService } from "../_services/bootstrapService";
import {
  CollegeGame,
  CollegePlayer,
  CollegeStandings,
  CollegeTeam,
  CollegeTeamDepthChart,
  Croot,
  FreeAgencyResponse,
  NewsLog,
  NFLCapsheet,
  NFLDepthChart,
  NFLGame,
  NFLPlayer,
  NFLStandings,
  NFLTeam,
  Notification,
  RecruitingTeamProfile,
  Timestamp,
  FaceDataResponse,
  NFLContract,
  NFLExtensionOffer
} from "../models/footballModels";
import { useLeagueStore } from "./LeagueContext";
import { useWebSockets } from "../_hooks/useWebsockets";
import { fba_ws } from "../_constants/urls";
import { SimFBA } from "../_constants/constants";
import { PlayerService } from "../_services/playerService";

// ✅ Define Types for Context
interface SimFBAContextProps {
  cfb_Timestamp: Timestamp | null;
  isLoading: boolean;
  isLoadingTwo: boolean;
  isLoadingThree: boolean;
  cfbTeam: CollegeTeam | null;
  cfbTeams: CollegeTeam[];
  cfbTeamMap: Record<number, CollegeTeam> | null;
  cfbTeamOptions: { label: string; value: string }[];
  cfbConferenceOptions: { label: string; value: string }[];
  currentCFBStandings: CollegeStandings[];
  cfbStandingsMap: Record<number, CollegeStandings> | null;
  cfbRosterMap: Record<number, CollegePlayer[]> | null;
  recruits: Croot[];
  teamProfileMap: Record<number, RecruitingTeamProfile> | null;
  portalPlayers: CollegePlayer[];
  collegeInjuryReport: CollegePlayer[];
  allCFBStandings: CollegeStandings[];
  allCollegeGames: CollegeGame[];
  currentCollegeSeasonGames: CollegeGame[];
  collegeTeamsGames: CollegeGame[];
  collegeNews: NewsLog[];
  collegeNotifications: Notification[];
  cfbDepthchartMap: Record<number, CollegeTeamDepthChart> | null;
  nflTeam: NFLTeam | null;
  nflTeams: NFLTeam[];
  nflTeamOptions: { label: string; value: string }[];
  proTeamMap: Record<number, NFLTeam> | null;
  allProStandings: NFLStandings[];
  currentProStandings: NFLStandings[];
  nflConferenceOptions: { label: string; value: string }[];
  proStandingsMap: Record<number, NFLStandings> | null;
  nflDepthchartMap: Record<number, NFLDepthChart> | null;
  proRosterMap: {
    [key: number]: NFLPlayer[];
  } | null;
  freeAgency: FreeAgencyResponse | null;
  capsheetMap: Record<number, NFLCapsheet> | null;
  proInjuryReport: NFLPlayer[];
  proNews: NewsLog[];
  allProGames: NFLGame[];
  currentProSeasonGames: NFLGame[];
  proNotifications: Notification[];
  topCFBPassers: CollegePlayer[];
  topCFBRushers: CollegePlayer[];
  topCFBReceivers: CollegePlayer[];
  topNFLPassers: NFLPlayer[];
  topNFLRushers: NFLPlayer[];
  topNFLReceivers: NFLPlayer[];
  cutCFBPlayer: (playerID: number, teamID: number) => Promise<void>;
  cutNFLPlayer: (playerID: number, teamID: number) => Promise<void>;
  redshirtPlayer: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer: (playerID: number, teamID: number) => Promise<void>;
  updateCFBRosterMap: (newMap: Record<number, CollegePlayer[]>) => void;
  playerFaces: {
    [key: number]: FaceDataResponse;
  };
  proContractMap: Record<number, NFLContract> | null;
  proExtensionMap: Record<number, NFLExtensionOffer> | null;
}

// ✅ Initial Context State
const defaultContext: SimFBAContextProps = {
  cfb_Timestamp: null,
  isLoading: true,
  isLoadingTwo: true,
  isLoadingThree: true,
  cfbTeam: null,
  cfbTeams: [],
  cfbTeamOptions: [],
  cfbTeamMap: {},
  cfbConferenceOptions: [],
  allCFBStandings: [],
  currentCFBStandings: [],
  cfbStandingsMap: {},
  cfbRosterMap: {},
  recruits: [],
  teamProfileMap: {},
  portalPlayers: [],
  collegeInjuryReport: [],
  currentCollegeSeasonGames: [],
  collegeTeamsGames: [],
  allCollegeGames: [],
  cfbDepthchartMap: {},
  collegeNews: [],
  collegeNotifications: [],
  nflTeam: null,
  nflTeams: [],
  nflTeamOptions: [],
  nflConferenceOptions: [],
  nflDepthchartMap: {},
  proTeamMap: {},
  allProStandings: [],
  currentProStandings: [],
  proStandingsMap: {},
  proRosterMap: {},
  freeAgency: null,
  capsheetMap: {},
  proInjuryReport: [],
  proNews: [],
  allProGames: [],
  currentProSeasonGames: [],
  proNotifications: [],
  topCFBPassers: [],
  topCFBRushers: [],
  topCFBReceivers: [],
  topNFLPassers: [],
  topNFLRushers: [],
  topNFLReceivers: [],
  cutCFBPlayer: async () => {},
  cutNFLPlayer: async () => {},
  redshirtPlayer: async () => {},
  promisePlayer: async () => {},
  updateCFBRosterMap: () => {},
  playerFaces: {},
  proContractMap: {},
  proExtensionMap: {},
};

export const SimFBAContext = createContext<SimFBAContextProps>(defaultContext);

// ✅ Define Props for Provider
interface SimFBAProviderProps {
  children: ReactNode;
}

export const SimFBAProvider: React.FC<SimFBAProviderProps> = ({ children }) => {
  const { currentUser } = useAuthStore();
  const { cfb_Timestamp } = useWebSockets(fba_ws, SimFBA);
  const isFetching = useRef(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingTwo, setIsLoadingTwo] = useState<boolean>(true);
  const [isLoadingThree, setIsLoadingThree] = useState<boolean>(true);
  const [cfbTeam, setCFBTeam] = useState<CollegeTeam | null>(null);
  const [cfbTeams, setCFBTeams] = useState<CollegeTeam[]>([]);
  const [cfbTeamMap, setCFBTeamMap] = useState<Record<number, CollegeTeam>>({});
  const [cfbDepthchartMap, setCFBDepthchartMap] = useState<Record<
    number,
    CollegeTeamDepthChart
  > | null>({});
  const [cfbTeamOptions, setCFBTeamOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [cfbConferenceOptions, setCFBConferenceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [allCFBStandings, setAllCFBStandings] = useState<CollegeStandings[]>(
    []
  );
  const [currentCFBStandings, setCurrentCFBStandings] = useState<
    CollegeStandings[]
  >([]);
  const [cfbStandingsMap, setCFBStandingsMap] = useState<Record<
    number,
    CollegeStandings
  > | null>({});
  const [cfbRosterMap, setCFBRosterMap] = useState<Record<
    number,
    CollegePlayer[]
  > | null>({});
  const [recruits, setRecruits] = useState<Croot[]>([]);
  const [teamProfileMap, setTeamProfileMap] = useState<Record<
    number,
    RecruitingTeamProfile
  > | null>({});
  const [portalPlayers, setPortalPlayers] = useState<CollegePlayer[]>([]);
  const [collegeInjuryReport, setCollegeInjuryReport] = useState<
    CollegePlayer[]
  >([]);
  const [collegeNews, setCollegeNews] = useState<NewsLog[]>([]);
  const [allCollegeGames, setAllCollegeGames] = useState<CollegeGame[]>([]);
  const [currentCollegeSeasonGames, setCurrentCollegeSeasonGames] = useState<
    CollegeGame[]
  >([]);
  const [collegeTeamsGames, setCollegeTeamsGames] = useState<CollegeGame[]>([]);
  const [collegeNotifications, setCollegeNotifications] = useState<
    Notification[]
  >([]);
  const [topCFBPassers, setTopCFBPassers] = useState<CollegePlayer[]>([]);
  const [topCFBRushers, setTopCFBRushers] = useState<CollegePlayer[]>([]);
  const [topCFBReceivers, setTopCFBReceivers] = useState<CollegePlayer[]>([]);
  const [topNFLPassers, setTopNFLPassers] = useState<NFLPlayer[]>([]);
  const [topNFLRushers, setTopNFLRushers] = useState<NFLPlayer[]>([]);
  const [topNFLReceivers, setTopNFLReceivers] = useState<NFLPlayer[]>([]);
  const [nflTeam, setNFLTeam] = useState<NFLTeam | null>(null);
  const [nflTeams, setNFLTeams] = useState<NFLTeam[]>([]);
  const [nflTeamOptions, setNFLTeamOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [nflConferenceOptions, setNFLConferenceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [proTeamMap, setProTeamMap] = useState<Record<number, NFLTeam> | null>(
    {}
  );
  const [nflDepthchartMap, setNFLDepthchartMap] = useState<Record<
    number,
    NFLDepthChart
  > | null>({});
  const [allProStandings, setAllProStandings] = useState<NFLStandings[]>([]);
  const [currentProStandings, setCurrentProStandings] = useState<
    NFLStandings[]
  >([]);
  const [proStandingsMap, setProStandingsMap] = useState<Record<
    number,
    NFLStandings
  > | null>({});
  const [proRosterMap, setProRosterMap] = useState<{
    [key: number]: NFLPlayer[];
  } | null>({});
  const [freeAgency, setFreeAgency] = useState<FreeAgencyResponse | null>(null);
  const [capsheetMap, setCapsheetMap] = useState<Record<
    number,
    NFLCapsheet
  > | null>({});
  const [proInjuryReport, setProInjuryReport] = useState<NFLPlayer[]>([]);
  const [proNews, setProNews] = useState<NewsLog[]>([]);
  const [allProGames, setAllProGames] = useState<NFLGame[]>([]);
  const [currentProSeasonGames, setCurrentProSeasonGames] = useState<NFLGame[]>(
    []
  );
  const [proTeamsGames, setProTeamsGames] = useState<NFLGame[]>([]);
  const [proNotifications, setProNotifications] = useState<Notification[]>([]);
  const [playerFaces, setPlayerFaces] = useState<{
    [key: number]: FaceDataResponse;
  }>({});
  const [proContractMap, setProContractMap] = useState<Record<number, NFLContract> | null>({});
  const [proExtensionMap, setProExtensionMap] = useState<Record<number, NFLExtensionOffer> | null>({});

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      isFetching.current = true;
      bootstrapAllData();
    }
  }, [currentUser]);

  const bootstrapAllData = async () => {
    await getFirstBootstrapData();
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    await getSecondBootstrapData();
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    await getThirdBootstrapData();
    isFetching.current = false;
  };

  const getFirstBootstrapData = async () => {
    let cfbID = 0;
    let nflID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    const res = await BootstrapService.GetFBABootstrapData(cfbID, nflID);
    console.log({ res });
    setCFBTeam(res.CollegeTeam);
    setCFBTeams(res.AllCollegeTeams);
    setNFLTeam(res.ProTeam);
    setNFLTeams(res.AllProTeams);
    setCollegeInjuryReport(res.CollegeInjuryReport);
    setCollegeNotifications(res.CollegeNotifications);
    setCFBRosterMap(res.CollegeRosterMap);
    setPortalPlayers(res.PortalPlayers);
    setProNotifications(res.ProNotifications);
    setTopCFBPassers(res.TopCFBPassers);
    setTopCFBRushers(res.TopCFBRushers);
    setTopCFBReceivers(res.TopCFBReceivers);
    setPlayerFaces(res.FaceData)

    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName)
      );
      const teamOptionsList = sortedCollegeTeams.map((team) => ({
        label: team.TeamName,
        value: team.ID.toString(),
      }));
      const conferenceOptions = Array.from(
        new Map(
          sortedCollegeTeams.map((team) => [
            team.ConferenceID,
            { label: team.Conference, value: team.ConferenceID.toString() },
          ])
        ).values()
      ).sort((a, b) => a.label.localeCompare(b.label));
      setCFBTeamOptions(teamOptionsList);
      setCFBConferenceOptions(conferenceOptions);
      const collegeTeamMap = Object.fromEntries(
        sortedCollegeTeams.map((team) => [team.ID, team])
      );
      setCFBTeamMap(collegeTeamMap);
    }
    if (res.AllProTeams.length > 0) {
      const sortedNFLTeams = res.AllProTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName)
      );
      const nflTeamOptions = sortedNFLTeams.map((team) => ({
        label: team.TeamName,
        value: team.ID.toString(),
      }));
      const nflConferenceOptions = Array.from(
        new Map(
          sortedNFLTeams.map((team) => [
            team.ConferenceID,
            { label: team.Conference, value: team.ConferenceID.toString() },
          ])
        ).values()
      ).sort((a, b) => a.label.localeCompare(b.label));
      setNFLTeamOptions(nflTeamOptions);
      setNFLConferenceOptions(nflConferenceOptions);
      const nflMap = Object.fromEntries(
        sortedNFLTeams.map((team) => [team.ID, team])
      );
      setProTeamMap(nflMap);
    }
    setIsLoading(false);
  };

  const getSecondBootstrapData = async () => {
    let cfbID = 0;
    let nflID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    const res = await BootstrapService.GetSecondFBABootstrapData(cfbID, nflID);
    setAllCollegeGames(res.AllCollegeGames);
    setCollegeNews(res.CollegeNews);
    setTeamProfileMap(res.TeamProfileMap);
    setAllCFBStandings(res.CollegeStandings);
    setTopNFLPassers(res.TopNFLPassers);
    setTopNFLRushers(res.TopNFLRushers);
    setTopNFLReceivers(res.TopNFLReceivers);

    if (res.AllCollegeGames.length > 0 && cfb_Timestamp) {
      const currentSeasonGames = res.AllCollegeGames.filter(
        (x) => x.SeasonID === cfb_Timestamp.CollegeSeasonID
      );
      setCurrentCollegeSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === cfbID || x.AwayTeamID === cfbID
      );
      setCollegeTeamsGames(teamGames);
    }

    if (res.CollegeStandings.length > 0 && cfb_Timestamp) {
      const currentSeasonStandings = res.CollegeStandings.filter(
        (x) => x.SeasonID === cfb_Timestamp.CollegeSeasonID
      );
      const collegeStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standings) => [standings.TeamID, standings])
      );
      setCurrentCFBStandings(currentSeasonStandings);
      setCFBStandingsMap(collegeStandingsMap);
    }

    setCapsheetMap(res.CapsheetMap);
    setAllProGames(res.AllProGames);
    setProRosterMap(res.ProRosterMap);
    setProInjuryReport(res.ProInjuryReport);
    setAllProStandings(res.ProStandings);
    if (res.AllProGames.length > 0 && cfb_Timestamp) {
      const currentSeasonGames = res.AllProGames.filter(
        (x) => x.SeasonID === cfb_Timestamp.NFLSeasonID
      );
      setCurrentProSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === cfbID || x.AwayTeamID === cfbID
      );
      setProTeamsGames(teamGames);
    }
    if (res.ProStandings.length > 0 && cfb_Timestamp) {
      const currentSeasonStandings = res.ProStandings.filter(
        (x) => x.SeasonID === cfb_Timestamp.NFLSeasonID
      );
      const nflStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standings) => [standings.TeamID, standings])
      );
      setCurrentProStandings(currentSeasonStandings);
      setProStandingsMap(nflStandingsMap);
    }
    setIsLoadingTwo(false);
  };

  const getThirdBootstrapData = async () => {
    let cfbID = 0;
    let nflID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    const res = await BootstrapService.GetThirdFBABootstrapData(cfbID, nflID);
    setProNews(res.ProNews);
    setRecruits(res.Recruits);
    setFreeAgency(res.FreeAgency);
    setCFBDepthchartMap(res.CollegeDepthChartMap);
    setNFLDepthchartMap(res.NFLDepthChartMap);
    setIsLoadingThree(false);
    setProContractMap(res.ContractMap);
    setProExtensionMap(res.ExtensionMap);
  };

    const cutCFBPlayer = useCallback(
      async (playerID: number, teamID: number) => {
        const res = await PlayerService.CutCFBPlayer(playerID);
        const rosterMap = { ...cfbRosterMap };
        rosterMap[teamID] = rosterMap[teamID].filter(
          (player) => player.ID !== playerID
        );
        setCFBRosterMap(rosterMap);
      },
      [cfbRosterMap]
    );
    const redshirtPlayer = useCallback(
      async (playerID: number, teamID: number) => {
        const res = await PlayerService.CutCFBPlayer(playerID);
        const rosterMap = { ...cfbRosterMap };
        const playerIDX = rosterMap[teamID].findIndex(
          (player) => player.ID === playerID
        );
        if (playerIDX > -1) {
          rosterMap[teamID][playerIDX].IsRedshirting = true;
          setCFBRosterMap(rosterMap);
        }
      },
      [cfbRosterMap]
    );
    const promisePlayer = useCallback(
      async (playerID: number, teamID: number) => {},
      [cfbRosterMap]
    );
    const cutNFLPlayer = useCallback(
      async (playerID: number, teamID: number) => {
        const res = await PlayerService.CutNFLPlayer(playerID);
        const rosterMap = { ...proRosterMap };
        rosterMap[teamID] = rosterMap[teamID].filter(
          (player) => player.ID !== playerID
        );
        setProRosterMap(rosterMap);
      },
      [proRosterMap]
    );

      const updateCFBRosterMap = (newMap: Record<number, CollegePlayer[]>) => {
        setCFBRosterMap(newMap);
      };

  return (
    <SimFBAContext.Provider
      value={{
        cfb_Timestamp,
        cfbTeam,
        cfbTeams,
        cfbTeamMap,
        cfbTeamOptions,
        cfbConferenceOptions,
        allCFBStandings,
        currentCFBStandings,
        cfbStandingsMap,
        cfbRosterMap,
        recruits,
        teamProfileMap,
        portalPlayers,
        collegeInjuryReport,
        currentCollegeSeasonGames,
        collegeTeamsGames,
        cfbDepthchartMap,
        collegeNews,
        allCollegeGames,
        collegeNotifications,
        nflTeam,
        nflTeams,
        proTeamMap,
        nflTeamOptions,
        nflConferenceOptions,
        nflDepthchartMap,
        allProStandings,
        currentProStandings,
        proStandingsMap,
        proRosterMap,
        freeAgency,
        capsheetMap,
        proInjuryReport,
        proNews,
        allProGames,
        currentProSeasonGames,
        proNotifications,
        isLoading,
        isLoadingTwo,
        isLoadingThree,
        topCFBPassers,
        topCFBRushers,
        topCFBReceivers,
        topNFLPassers,
        topNFLRushers,
        topNFLReceivers,
        cutCFBPlayer,
        redshirtPlayer,
        promisePlayer,
        cutNFLPlayer,
        updateCFBRosterMap,
        playerFaces,
        proContractMap,
        proExtensionMap,
      }}
    >
      {children}
    </SimFBAContext.Provider>
  );
};

export const useSimFBAStore = () => {
  const store = useContext(SimFBAContext);
  return store;
};
