import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuthStore } from "./AuthContext";
import { 
  NBATeam,
  Team,
  CollegeStandings, 
  Timestamp,
  CollegePlayer,
  Croot,
  TeamRecruitingProfile,
  Match,
  NewsLog, 
  Notification,
  NBAStandings,
  NBAPlayer,
  NBAMatch,
  FreeAgencyResponse,
  NBACapsheet, 
  Gameplan,
  NBAGameplan,
  TransferPlayerResponse,
  FaceDataResponse,
  NBAContract,
  NBAExtensionOffer
} from "../models/basketballModels";
import { useWebSockets } from "../_hooks/useWebsockets";
import { BootstrapService } from "../_services/bootstrapService";
import { bba_ws } from "../_constants/urls";
import { SimBBA } from "../_constants/constants";

// ✅ Define Types for Context
interface SimBBAContextProps {
  cbb_Timestamp: Timestamp | null;
  isLoading: boolean;
  isLoadingTwo: boolean;
  isLoadingThree: boolean;
  cbbTeam: Team | null;
  cbbTeams: Team[];
  cbbTeamOptions: { label: string; value: string }[];
  cbbConferenceOptions: { label: string; value: string }[];
  nbaTeam: NBATeam | null;
  nbaTeams: NBATeam[];
  nbaTeamOptions: { label: string; value: string }[];
  nbaConferenceOptions: { label: string; value: string }[];
  cbbTeamMap: Record<number, Team> | null;
  currentCBBStandings: CollegeStandings[],
  cbbStandingsMap: Record<number, CollegeStandings> | null;
  cbbRosterMap: Record<number, CollegePlayer[]> | null;
  recruits: Croot[];
  teamProfileMap: Record<number, TeamRecruitingProfile> | null;
  portalPlayers: TransferPlayerResponse[];
  collegeInjuryReport: CollegePlayer[];
  allCBBStandings: CollegeStandings[];
  allCollegeGames: Match[];
  currentCollegeSeasonGames: Match[];
  collegeTeamsGames: Match[];
  collegeNews: NewsLog[];
  collegeNotifications: Notification[];
  nbaTeamMap: Record<number, NBATeam> | null;
  allProStandings: NBAStandings[];
  currentProStandings: NBAStandings[];
  proRosterMap: {
    [key: number]: NBAPlayer[];
  } | null;
  freeAgency: FreeAgencyResponse | null;
  capsheetMap: Record<number, NBACapsheet> | null;
  proInjuryReport: NBAPlayer[];
  proNews: NewsLog[];
  allProGames: NBAMatch[];
  currentProSeasonGames: NBAMatch[];
  proNotifications: Notification[];
  collegeGameplan: Gameplan[];
  nbaGameplan: NBAGameplan[];
  topCBBPoints: CollegePlayer[];
  topCBBAssists: CollegePlayer[];
  topCBBRebounds: CollegePlayer[];
  topNBAPoints: NBAPlayer[];
  topNBAAssists: NBAPlayer[];
  topNBARebounds: NBAPlayer[];
  playerFaces: {
    [key: number]: FaceDataResponse;
  };
  proContractMap: Record<number, NBAContract> | null;
  proExtensionMap: Record<number, NBAExtensionOffer> | null;
}

// ✅ Initial Context State
const defaultContext: SimBBAContextProps = {
  cbb_Timestamp: null,
  isLoading: true,
  isLoadingTwo: true,
  isLoadingThree: true,
  cbbTeam: null,
  cbbTeams: [],
  cbbTeamOptions: [],
  cbbConferenceOptions: [],
  nbaTeam: null,
  nbaTeams: [],
  nbaTeamOptions: [],
  nbaConferenceOptions: [],
  cbbTeamMap: {},
  currentCBBStandings: [],
  cbbStandingsMap: {},
  cbbRosterMap: {},
  recruits: [],
  teamProfileMap: {},
  portalPlayers: [],
  collegeInjuryReport: [],
  allCBBStandings: [],
  allCollegeGames: [],
  currentCollegeSeasonGames: [],
  collegeTeamsGames: [],
  collegeNews: [],
  collegeNotifications: [],
  nbaTeamMap: {},
  allProStandings: [],
  currentProStandings: [],
  proRosterMap: {},
  freeAgency: null,
  capsheetMap: {},
  proInjuryReport: [],
  proNews: [],
  allProGames: [],
  currentProSeasonGames: [],
  proNotifications: [],
  collegeGameplan: [],
  nbaGameplan: [],
  topCBBPoints: [],
  topCBBAssists: [],
  topCBBRebounds: [],
  topNBAPoints: [],
  topNBAAssists: [],
  topNBARebounds: [],
  playerFaces: {},
  proContractMap: {},
  proExtensionMap: {},
};

export const SimBBAContext = createContext<SimBBAContextProps>(defaultContext);

// ✅ Define Props for Provider
interface SimBBAProviderProps {
  children: ReactNode;
}

export const SimBBAProvider: React.FC<SimBBAProviderProps> = ({ children }) => {
  const { currentUser } = useAuthStore();
  const { cbb_Timestamp } = useWebSockets(bba_ws, SimBBA);
  const isFetching = useRef(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingTwo, setIsLoadingTwo] = useState<boolean>(true);
  const [isLoadingThree, setIsLoadingThree] = useState<boolean>(true);
  const [cbbTeam, setCBBTeam] = useState<Team | null>(null);
  const [cbbTeams, setCBBTeams] = useState<Team[]>([]);
  const [cbbTeamOptions, setCBBTeamOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [cbbConferenceOptions, setCBBConferenceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [nbaTeam, setNBATeam] = useState<NBATeam | null>(null);
  const [nbaTeams, setNBATeams] = useState<NBATeam[]>([]);
  const [nbaTeamOptions, setNBATeamOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [nbaConferenceOptions, setNBAConferenceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [allCBBStandings, setAllCBBStandings] = useState<CollegeStandings[]>(
    []
  );
  const [currentCBBStandings, setCurrentCBBStandings] = useState<
    CollegeStandings[]
  >([]);
  const [cbbStandingsMap, setCBBStandingsMap] = useState<Record<
    number,
    CollegeStandings
  > | null>({});
  const [cbbRosterMap, setCBBRosterMap] = useState<Record<
    number,
    CollegePlayer[]
  > | null>({});
  const [recruits, setRecruits] = useState<Croot[]>([]);
  const [teamProfileMap, setTeamProfileMap] = useState<Record<
    number,
    TeamRecruitingProfile
  > | null>({});
  const [portalPlayers, setPortalPlayers] = useState<TransferPlayerResponse[]>([]);
  const [collegeInjuryReport, setCollegeInjuryReport] = useState<
    CollegePlayer[]
  >([]);
  const [collegeNews, setCollegeNews] = useState<NewsLog[]>([]);
  const [allCollegeGames, setAllCollegeGames] = useState<Match[]>([]);
  const [currentCollegeSeasonGames, setCurrentCollegeSeasonGames] = useState<
    Match[]
  >([]);
  const [collegeTeamsGames, setCollegeTeamsGames] = useState<Match[]>([]);
  const [collegeNotifications, setCollegeNotifications] = useState<
    Notification[]
  >([]);
  const [cbbTeamMap, setCBBTeamMap] = useState<Record<number, Team>>({});
  const [nbaTeamMap, setProTeamMap] = useState<Record<number, NBATeam> | null>(
    {}
  );
  const [allProStandings, setAllProStandings] = useState<NBAStandings[]>([]);
  const [currentProStandings, setCurrentProStandings] = useState<
    NBAStandings[]
  >([]);
  const [proStandingsMap, setProStandingsMap] = useState<Record<
    number,
    NBAStandings
  > | null>({});
  const [proRosterMap, setProRosterMap] = useState<{
    [key: number]: NBAPlayer[];
  } | null>({});
  const [freeAgency, setFreeAgency] = useState<FreeAgencyResponse | null>(null);
  const [capsheetMap, setCapsheetMap] = useState<Record<
    number,
    NBACapsheet
  > | null>({});
  const [proInjuryReport, setProInjuryReport] = useState<NBAPlayer[]>([]);
  const [proNews, setProNews] = useState<NewsLog[]>([]);
  const [allProGames, setAllProGames] = useState<NBAMatch[]>([]);
  const [currentProSeasonGames, setCurrentProSeasonGames] = useState<NBAMatch[]>(
    []
  );
  const [collegeGameplan, setCollegeGameplan] = useState<Gameplan[]>([]);
  const [nbaGameplan, setNBAGameplan] = useState<NBAGameplan[]>([]);
  const [proTeamsGames, setProTeamsGames] = useState<NBAMatch[]>([]);
  const [proNotifications, setProNotifications] = useState<Notification[]>([]);
  const [topCBBPoints, setTopCBBPoints] = useState<CollegePlayer[]>([]);
  const [topCBBAssists, setTopCBBAssists] = useState<CollegePlayer[]>([]);
  const [topCBBRebounds, setTopCBBRebounds] = useState<CollegePlayer[]>([]);
  const [topNBAPoints, setTopNBAPoints] = useState<NBAPlayer[]>([]);
  const [topNBAAssists, setTopNBAAssists] = useState<NBAPlayer[]>([]);
  const [topNBARebounds, setTopNBARebounds] = useState<NBAPlayer[]>([]);
  const [playerFaces, setPlayerFaces] = useState<{
    [key: number]: FaceDataResponse;
  }>({});
  const [proContractMap, setProContractMap] = useState<Record<number, NBAContract> | null>({});
  const [proExtensionMap, setProExtensionMap] = useState<Record<number, NBAExtensionOffer> | null>({});
  

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
    let cbbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    const res = await BootstrapService.GetBBABootstrapData(cbbID, nbaID);
    console.log({ res });
    setCBBTeam(res.CollegeTeam);
    setCBBTeams(res.AllCollegeTeams);
    setNBATeam(res.NBATeam);
    setNBATeams(res.AllProTeams);
    setCollegeInjuryReport(res.CollegeInjuryReport);
    setCollegeNotifications(res.CollegeNotifications);
    setCBBRosterMap(res.CollegeRosterMap);
    setPortalPlayers(res.PortalPlayers);
    setProNotifications(res.ProNotifications);
    setCollegeGameplan(res.CollegeGameplan)
    setNBAGameplan(res.NBAGameplan)
    setTopCBBPoints(res.TopCBBPoints);
    setTopCBBAssists(res.TopCBBAssists);
    setTopCBBRebounds(res.TopCBBRebounds);
    setPlayerFaces(res.FaceData)

    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.Team.localeCompare(b.Team)
      );
      const teamOptionsList = sortedCollegeTeams.map((team) => ({
        label: team.Team,
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
      setCBBTeamOptions(teamOptionsList);
      setCBBConferenceOptions(conferenceOptions);
      const collegeTeamMap = Object.fromEntries(
        sortedCollegeTeams.map((team) => [team.ID, team])
      );
      setCBBTeamMap(collegeTeamMap);
    }
    if (res.AllProTeams.length > 0) {
      const sortedNBATeams = res.AllProTeams.sort((a, b) =>
        a.Team.localeCompare(b.Team)
      );
      const nbaTeamOptions = sortedNBATeams.map((team) => ({
        label: team.Team,
        value: team.ID.toString(),
      }));
      const nbaConferenceOptions = Array.from(
        new Map(
          sortedNBATeams.map((team) => [
            team.ConferenceID,
            { label: team.Conference, value: team.ConferenceID.toString() },
          ])
        ).values()
      ).sort((a, b) => a.label.localeCompare(b.label));
      setNBATeamOptions(nbaTeamOptions);
      setNBAConferenceOptions(nbaConferenceOptions);
      const nbaTeamMap = Object.fromEntries(
        sortedNBATeams.map((team) => [team.ID, team])
      );
      setProTeamMap(nbaTeamMap);
    }
    setIsLoading(false);
  };

  const getSecondBootstrapData = async () => {
    let cbbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    const res = await BootstrapService.GetSecondBBABootstrapData(cbbID, nbaID);
    console.log({ res });
    setCollegeNews(res.CollegeNews);
    setTeamProfileMap(res.TeamProfileMap);
    setTopNBAPoints(res.TopNBAPoints);
    setTopNBAAssists(res.TopNBAAssists);
    setTopNBARebounds(res.TopNBARebounds);
    setAllCBBStandings(res.CollegeStandings);
    if (res.CollegeStandings.length > 0 && cbb_Timestamp) {
      const currentSeasonStandings = res.CollegeStandings.filter(
        (x) => x.SeasonID === cbb_Timestamp.SeasonID
      );
      const collegeStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standings) => [standings.TeamID, standings])
      );
      setCurrentCBBStandings(currentSeasonStandings);
      setCBBStandingsMap(collegeStandingsMap);
    }
    setCapsheetMap(res.CapsheetMap);
    setProRosterMap(res.ProRosterMap);
    setProInjuryReport(res.ProInjuryReport);
    setAllProStandings(res.ProStandings);
    if (res.ProStandings.length > 0 && cbb_Timestamp) {
      const currentSeasonStandings = res.ProStandings.filter(
        (x) => x.SeasonID === cbb_Timestamp.SeasonID
      );
      const nbaStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standings) => [standings.TeamID, standings])
      );
      setCurrentProStandings(currentSeasonStandings);
      setProStandingsMap(nbaStandingsMap);
    }
    setIsLoadingTwo(false);
  };

  const getThirdBootstrapData = async () => {
    let cbbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    const res = await BootstrapService.GetThirdBBABootstrapData(cbbID, nbaID);
    console.log({ res });
    setProNews(res.ProNews);
    setRecruits(res.Recruits);
    setFreeAgency(res.FreeAgency);
    setAllCollegeGames(res.AllCollegeGames);
    setProContractMap(res.ContractMap);
    setProExtensionMap(res.ExtensionMap);
    
    if (res.AllCollegeGames.length > 0 && cbb_Timestamp) {
      const currentSeasonGames = res.AllCollegeGames.filter(
        (x) => x.SeasonID === cbb_Timestamp.SeasonID
      );
      setCurrentCollegeSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === cbbID || x.AwayTeamID === cbbID
      );
      setCollegeTeamsGames(teamGames);
    }
    setAllProGames(res.AllProGames);
    if (res.AllProGames.length > 0 && cbb_Timestamp) {
      const currentSeasonGames = res.AllProGames.filter(
        (x) => x.SeasonID === cbb_Timestamp.SeasonID
      );
      setCurrentProSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === nbaID || x.AwayTeamID === nbaID
      );
      setProTeamsGames(teamGames);
    }
    setIsLoadingThree(false);
  };

  return (
    <SimBBAContext.Provider
      value={{
        cbb_Timestamp,
        isLoading,
        isLoadingTwo,
        isLoadingThree,
        cbbTeam,
        cbbTeams,
        cbbTeamOptions,
        cbbConferenceOptions,
        nbaTeam,
        nbaTeams,
        nbaTeamOptions,
        nbaConferenceOptions,
        cbbTeamMap,
        currentCBBStandings,
        cbbStandingsMap,
        cbbRosterMap,
        recruits,
        teamProfileMap,
        portalPlayers,
        collegeInjuryReport,
        allCBBStandings,
        allCollegeGames,
        currentCollegeSeasonGames,
        collegeTeamsGames,
        collegeNews,
        collegeNotifications,
        nbaTeamMap,
        allProStandings,
        currentProStandings,
        proRosterMap,
        freeAgency,
        capsheetMap,
        proInjuryReport,
        proNews,
        allProGames,
        currentProSeasonGames,
        proNotifications,
        collegeGameplan,
        nbaGameplan,
        topCBBPoints,
        topCBBAssists,
        topCBBRebounds,
        topNBAPoints,
        topNBAAssists,
        topNBARebounds,
        playerFaces,
        proContractMap,
        proExtensionMap
      }}
    >
      {children}
    </SimBBAContext.Provider>
  );
};

export const useSimBBAStore = () => {
  const store = useContext(SimBBAContext);
  return store;
};
