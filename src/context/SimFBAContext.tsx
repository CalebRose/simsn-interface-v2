import {
  createContext,
  ReactNode,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useAuthStore } from "./AuthContext";
import { BootstrapService } from "../_services/bootstrapService";
import { DepthChartService } from "../_services/depthChartService";
import { GameplanService } from "../_services/gameplanService";
import {
  CollegeGame,
  CollegePlayer,
  CollegeStandings,
  CollegeTeam,
  CollegeTeamDepthChart,
  CollegeGameplan,
  Croot,
  NewsLog,
  NFLCapsheet,
  NFLDepthChart,
  NFLGame,
  NFLPlayer,
  NFLStandings,
  NFLTeam,
  NFLGameplan,
  Notification,
  RecruitingTeamProfile,
  Timestamp,
  FaceDataResponse,
  NFLContract,
  NFLExtensionOffer,
  FreeAgencyOffer,
  NFLWaiverOffer,
  CollegeTeamProfileData as CFBTeamProfileData,
  RecruitPlayerProfile,
  UpdateRecruitingBoardDTO,
  NFLWaiverOffDTO,
  FreeAgencyOfferDTO,
  NFLRequest,
  NFLDraftee,
} from "../models/footballModels";
import { useLeagueStore } from "./LeagueContext";
import { useWebSockets } from "../_hooks/useWebsockets";
import { fba_ws } from "../_constants/urls";
import { CloseToHome, SimFBA } from "../_constants/constants";
import { PlayerService } from "../_services/playerService";
import { useSnackbar } from "notistack";
import FBATeamHistoryService from "../_services/teamHistoryService";
import { RecruitService } from "../_services/recruitService";
import { GenerateNumberFromRange } from "../_helper/utilHelper";
import {
  ValidateAffinity,
  ValidateCloseToHome,
} from "../_helper/recruitingHelper";
import { FreeAgencyService } from "../_services/freeAgencyService";
import { TeamService } from "../_services/teamService";

// ✅ Define Types for Context
interface SimFBAContextProps {
  cfb_Timestamp: Timestamp | null;
  isLoading: boolean;
  isLoadingTwo: boolean;
  isLoadingThree: boolean;
  isLoadingFour: boolean;
  cfbTeam: CollegeTeam | null;
  cfbTeams: CollegeTeam[];
  cfbTeamMap: Record<number, CollegeTeam> | null;
  cfbTeamOptions: { label: string; value: string }[];
  cfbConferenceOptions: { label: string; value: string }[];
  currentCFBStandings: CollegeStandings[];
  cfbStandingsMap: Record<number, CollegeStandings> | null;
  cfbRosterMap: Record<number, CollegePlayer[]> | null;
  recruits: Croot[];
  recruitProfiles: RecruitPlayerProfile[];
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
  freeAgentOffers: FreeAgencyOffer[];
  waiverOffers: NFLWaiverOffer[];
  capsheetMap: Record<number, NFLCapsheet> | null;
  proInjuryReport: NFLPlayer[];
  practiceSquadPlayers: NFLPlayer[];
  freeAgents: NFLPlayer[];
  waiverPlayers: NFLPlayer[];
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
  nflDraftees: NFLDraftee[];
  removeUserfromCFBTeamCall: (teamID: number) => Promise<void>;
  removeUserfromNFLTeamCall: (request: NFLRequest) => Promise<void>;
  addUserToCFBTeam: (teamID: number, user: string) => void;
  addUserToNFLTeam: (teamID: number, user: string, role: string) => void;
  cutCFBPlayer: (playerID: number, teamID: number) => Promise<void>;
  cutNFLPlayer: (playerID: number, teamID: number) => Promise<void>;
  sendNFLPlayerToPracticeSquad: (
    playerID: number,
    teamID: number
  ) => Promise<void>;
  placeNFLPlayerOnTradeBlock: (
    playerID: number,
    teamID: number
  ) => Promise<void>;
  redshirtPlayer: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer: (playerID: number, teamID: number) => Promise<void>;
  updateCFBRosterMap: (newMap: Record<number, CollegePlayer[]>) => void;
  saveCFBDepthChart: (
    dto: any,
    updatedDepthChart?: CollegeTeamDepthChart
  ) => Promise<void>;
  saveNFLDepthChart: (
    dto: any,
    updatedDepthChart?: NFLDepthChart
  ) => Promise<void>;
  saveCFBGameplan: (
    dto: any,
    updatedGameplan?: CollegeGameplan
  ) => Promise<{ success: boolean; error?: unknown }>;
  saveNFLGameplan: (
    dto: any,
    updatedGameplan?: NFLGameplan
  ) => Promise<{ success: boolean; error?: unknown }>;
  addRecruitToBoard: (dto: any) => Promise<void>;
  removeRecruitFromBoard: (dto: any) => Promise<void>;
  toggleScholarship: (dto: any) => Promise<void>;
  updatePointsOnRecruit: (id: number, name: string, points: number) => void;
  SaveRecruitingBoard: () => Promise<void>;
  SaveAIRecruitingSettings: (dto: UpdateRecruitingBoardDTO) => Promise<void>;
  ExportCFBRecruits: () => Promise<void>;
  SaveFreeAgencyOffer: (dto: any) => Promise<void>;
  CancelFreeAgencyOffer: (dto: any) => Promise<void>;
  SaveWaiverWireOffer: (dto: any) => Promise<void>;
  CancelWaiverWireOffer: (dto: any) => Promise<void>;
  playerFaces: {
    [key: number]: FaceDataResponse;
  };
  proContractMap: Record<number, NFLContract> | null;
  proExtensionMap: Record<number, NFLExtensionOffer> | null;
  proPlayerMap: Record<number, NFLPlayer>;
  allCFBTeamHistory: { [key: number]: CFBTeamProfileData };
  collegeGameplan: CollegeGameplan | null;
  nflGameplan: NFLGameplan | null;
  collegeDepthChart: CollegeTeamDepthChart | null;
  nflDepthChart: NFLDepthChart | null;
}

// ✅ Initial Context State
const defaultContext: SimFBAContextProps = {
  cfb_Timestamp: null,
  isLoading: true,
  isLoadingTwo: true,
  isLoadingThree: true,
  isLoadingFour: true,
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
  recruitProfiles: [],
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
  freeAgentOffers: [],
  waiverOffers: [],
  practiceSquadPlayers: [],
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
  freeAgents: [],
  waiverPlayers: [],
  nflDraftees: [],
  removeUserfromCFBTeamCall: async () => {},
  removeUserfromNFLTeamCall: async () => {},
  addUserToCFBTeam: async () => {},
  addUserToNFLTeam: async () => {},
  cutCFBPlayer: async () => {},
  cutNFLPlayer: async () => {},
  sendNFLPlayerToPracticeSquad: async () => {},
  placeNFLPlayerOnTradeBlock: async () => {},
  redshirtPlayer: async () => {},
  promisePlayer: async () => {},
  updateCFBRosterMap: () => {},
  saveCFBDepthChart: async () => {},
  saveNFLDepthChart: async () => {},
  saveCFBGameplan: async () => ({ success: false }),
  saveNFLGameplan: async () => ({ success: false }),
  addRecruitToBoard: async () => {},
  removeRecruitFromBoard: async () => {},
  toggleScholarship: async () => {},
  updatePointsOnRecruit: () => {},
  SaveRecruitingBoard: async () => {},
  SaveAIRecruitingSettings: async () => {},
  ExportCFBRecruits: async () => {},
  SaveFreeAgencyOffer: async () => {},
  CancelFreeAgencyOffer: async () => {},
  SaveWaiverWireOffer: async () => {},
  CancelWaiverWireOffer: async () => {},
  playerFaces: {},
  proContractMap: {},
  proExtensionMap: {},
  allCFBTeamHistory: {},
  proPlayerMap: {},
  collegeGameplan: null,
  nflGameplan: null,
  collegeDepthChart: null,
  nflDepthChart: null,
};

export const SimFBAContext = createContext<SimFBAContextProps>(defaultContext);

// ✅ Define Props for Provider
interface SimFBAProviderProps {
  children: ReactNode;
}

export const SimFBAProvider: React.FC<SimFBAProviderProps> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuthStore();
  const { cfb_Timestamp, setCFB_Timestamp } = useWebSockets(fba_ws, SimFBA);
  const isFetching = useRef(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingTwo, setIsLoadingTwo] = useState<boolean>(true);
  const [isLoadingThree, setIsLoadingThree] = useState<boolean>(true);
  const [isLoadingFour, setIsLoadingFour] = useState<boolean>(true);
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
  const [recruitProfiles, setRecruitProfiles] = useState<
    RecruitPlayerProfile[]
  >([]);
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
  const [freeAgentOffers, setFreeAgentOffers] = useState<FreeAgencyOffer[]>([]);
  const [waiverOffers, setWaiverOffers] = useState<NFLWaiverOffer[]>([]);
  const [capsheetMap, setCapsheetMap] = useState<Record<
    number,
    NFLCapsheet
  > | null>({});
  const [proInjuryReport, setProInjuryReport] = useState<NFLPlayer[]>([]);
  const [practiceSquadPlayers, setPracticeSquadPlayers] = useState<NFLPlayer[]>(
    []
  );
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
  const [proContractMap, setProContractMap] = useState<Record<
    number,
    NFLContract
  > | null>({});
  const [proExtensionMap, setProExtensionMap] = useState<Record<
    number,
    NFLExtensionOffer
  > | null>({});
  const [allCFBTeamHistory, setAllCFBTeamHistory] = useState<{
    [key: number]: CFBTeamProfileData;
  }>({});
  const [collegeGameplan, setCollegeGameplan] =
    useState<CollegeGameplan | null>(null);
  const [nflGameplan, setNFLGameplan] = useState<NFLGameplan | null>(null);
  const [collegeDepthChart, setCollegeDepthChart] =
    useState<CollegeTeamDepthChart | null>(null);
  const [nflDepthChart, setNFLDepthChart] = useState<NFLDepthChart | null>(
    null
  );
  const [freeAgents, setFreeAgents] = useState<NFLPlayer[]>([]);
  const [waiverPlayers, setWaiverPlayers] = useState<NFLPlayer[]>([]);
  const [nflDraftees, setNFLDraftees] = useState<NFLDraftee[]>([]);
  const proPlayerMap = useMemo(() => {
    const playerMap: Record<number, NFLPlayer> = {};

    if (proRosterMap && nflTeams) {
      for (let i = 0; i < nflTeams.length; i++) {
        const team = nflTeams[i];
        const roster = proRosterMap[team.ID];
        if (roster) {
          for (let j = 0; j < roster.length; j++) {
            const p = roster[j];
            playerMap[p.ID] = p;
          }
        }
      }
      const freeAgents = proRosterMap[0];
      if (freeAgents) {
        for (let i = 0; i < freeAgents.length; i++) {
          const p = freeAgents[i];
          playerMap[p.ID] = p;
        }
      }
    }

    return playerMap;
  }, [proRosterMap, nflTeams]);

  useEffect(() => {
    getBootstrapTeamData();
  }, []);

  const getBootstrapTeamData = async () => {
    const res = await BootstrapService.GetFBABootstrapTeamData();
    setCFBTeams(res.AllCollegeTeams);
    setNFLTeams(res.AllProTeams);

    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName)
      );
      const teamOptionsList = sortedCollegeTeams.map((team) => ({
        label: `${team.TeamName} | ${team.TeamAbbr}`,
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
        label: `${team.TeamName}${
          [4, 16, 18, 30].includes(team.ID) ? ` ${team.Mascot}` : ""
        }`,
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
  };

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      isFetching.current = true;
      bootstrapAllData();
    }
  }, [currentUser]);

  const bootstrapAllData = async () => {
    await getFirstBootstrapData();
    await new Promise((resolve) => setTimeout(resolve, 3500)); // Wait 5 seconds
    await getSecondBootstrapData();
    await new Promise((resolve) => setTimeout(resolve, 3500)); // Wait 5 seconds
    await getThirdBootstrapData();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    fetchAllHistory();
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

    if (cfbID > 0) {
      setCFBTeam(res.CollegeTeam);

      setCollegeInjuryReport(res.CollegeInjuryReport);
      setCollegeNotifications(res.CollegeNotifications);
      setTopCFBPassers(res.TopCFBPassers);
      setTopCFBRushers(res.TopCFBRushers);
      setTopCFBReceivers(res.TopCFBReceivers);
      setCFBRosterMap(res.CollegeRosterMap);
      setPortalPlayers(res.PortalPlayers);
      setCollegeGameplan(res.CollegeGameplan || null);
      setNFLGameplan(res.NFLGameplan || null);
      setCollegeDepthChart(res.CollegeDepthChart || null);
      setNFLDepthChart(res.NFLDepthChart || null);
    }

    if (nflID > 0) {
      setNFLTeam(res.ProTeam);
      setProNotifications(res.ProNotifications);
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
    if (cfbID > 0) {
      setCollegeNews(res.CollegeNews);
      setTeamProfileMap(res.TeamProfileMap);
      setAllCollegeGames(res.AllCollegeGames);
      setAllCFBStandings(res.CollegeStandings);
    }

    if (nflID > 0) {
      setTopNFLPassers(res.TopNFLPassers);
      setTopNFLRushers(res.TopNFLRushers);
      setTopNFLReceivers(res.TopNFLReceivers);
      setCapsheetMap(res.CapsheetMap);
      setProRosterMap(res.ProRosterMap);
      setPracticeSquadPlayers(res.PracticeSquadPlayers);
      setProInjuryReport(res.ProInjuryReport);
      setAllProGames(res.AllProGames);
      setAllProStandings(res.ProStandings);
    }

    if (
      res.AllCollegeGames &&
      res.AllCollegeGames.length > 0 &&
      cfb_Timestamp
    ) {
      const currentSeasonGames = res.AllCollegeGames.filter(
        (x) => x.SeasonID === cfb_Timestamp.CollegeSeasonID
      );
      setCurrentCollegeSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === cfbID || x.AwayTeamID === cfbID
      );
      setCollegeTeamsGames(teamGames);
    }

    if (
      res.CollegeStandings &&
      res.CollegeStandings.length > 0 &&
      cfb_Timestamp
    ) {
      const currentSeasonStandings = res.CollegeStandings.filter(
        (x) => x.SeasonID === cfb_Timestamp.CollegeSeasonID
      );
      const collegeStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standings) => [standings.TeamID, standings])
      );
      setCurrentCFBStandings(currentSeasonStandings);
      setCFBStandingsMap(collegeStandingsMap);
    }

    if (res.AllProGames && res.AllProGames.length > 0 && cfb_Timestamp) {
      const currentSeasonGames = res.AllProGames.filter(
        (x) => x.SeasonID === cfb_Timestamp.NFLSeasonID
      );
      setCurrentProSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === cfbID || x.AwayTeamID === cfbID
      );
      setProTeamsGames(teamGames);
    }

    if (res.ProStandings && res.ProStandings.length > 0 && cfb_Timestamp) {
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
    if (cfbID > 0) {
      setRecruits(res.Recruits);
      setCFBDepthchartMap(res.CollegeDepthChartMap);
      setRecruitProfiles(res.RecruitProfiles);
    }

    if (nflID > 0) {
      setProNews(res.ProNews);
      setFreeAgentOffers(res.FreeAgentOffers);
      setWaiverOffers(res.WaiverWireOffers);
      setNFLDepthchartMap(res.NFLDepthChartMap);
      setProContractMap(res.ContractMap);
      setProExtensionMap(res.ExtensionMap);
      setFreeAgents(res.FreeAgents);
      setWaiverPlayers(res.WaiverPlayers);
      setNFLDraftees(res.NFLDraftees);
    }

    setPlayerFaces(res.FaceData);
    setIsLoadingThree(false);
  };

  const teamHistoryService = new FBATeamHistoryService();
  const fetchAllHistory = async () => {
    const response = await teamHistoryService.GetCFBTeamHistory();
    setAllCFBTeamHistory(response);
    setIsLoadingFour(false);
  };

  const cutCFBPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const rosterMap = { ...cfbRosterMap };
      const playerCount = rosterMap[teamID].length;
      if (
        (cfbTeam!.IsFBS && playerCount < 81) ||
        (!cfbTeam!.IsFBS && playerCount < 61)
      ) {
        enqueueSnackbar(
          "You have reached the current minimum roster count and cannot cut any players.",
          { variant: "warning", autoHideDuration: 3000 }
        );
        return;
      }
      const res = await PlayerService.CutCFBPlayer(playerID);
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID
      );
      setCFBRosterMap(rosterMap);
    },
    [cfbRosterMap]
  );
  const redshirtPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const rosterMap = { ...cfbRosterMap };
      const redshirtCount = rosterMap[teamID].filter(
        (x) => x.IsRedshirting
      ).length;
      if (redshirtCount > 19) {
        enqueueSnackbar(
          "You have reached the current maximum allowed for redshirts.",
          { variant: "warning", autoHideDuration: 3000 }
        );
        return;
      }
      const res = await PlayerService.RedshirtCFBPlayer(playerID);
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

  const sendNFLPlayerToPracticeSquad = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.SendNFLPLayerToPracticeSquad(playerID);
      setProRosterMap((prevMap) => {
        const teamRoster = prevMap![teamID];
        if (!teamRoster) return prevMap;

        return {
          ...prevMap,
          [teamID]: teamRoster.map((player) =>
            player.ID === playerID
              ? new NFLPlayer({
                  ...player,
                  IsPracticeSquad: !player.IsPracticeSquad,
                })
              : player
          ),
        };
      });
    },
    [proRosterMap]
  );

  const placeNFLPlayerOnTradeBlock = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.SendPHLPlayerToTradeBlock(playerID);
      setProRosterMap((prevMap) => {
        const teamRoster = prevMap![teamID];
        if (!teamRoster) return prevMap;

        return {
          ...prevMap,
          [teamID]: teamRoster.map((player) =>
            player.ID === playerID
              ? new NFLPlayer({
                  ...player,
                  IsOnTradeBlock: !player.IsOnTradeBlock,
                })
              : player
          ),
        };
      });
    },
    [proRosterMap]
  );

  const updateCFBRosterMap = (newMap: Record<number, CollegePlayer[]>) => {
    setCFBRosterMap(newMap);
  };

  const saveCFBDepthChart = async (
    dto: any,
    updatedDepthChart?: CollegeTeamDepthChart
  ) => {
    try {
      await DepthChartService.SaveCFBDepthChart(dto);

      if (updatedDepthChart) {
        setCollegeDepthChart(updatedDepthChart);

        if (cfbTeam?.ID && cfbDepthchartMap) {
          setCFBDepthchartMap((prev) => ({
            ...prev,
            [cfbTeam.ID]: updatedDepthChart,
          }));
        }
      }

      enqueueSnackbar("Depth Chart saved!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error("Error saving CFB depth chart:", error);
      enqueueSnackbar("Failed to save depth chart. Please try again.", {
        variant: "error",
        autoHideDuration: 5000,
      });
      throw error;
    }
  };

  const saveNFLDepthChart = async (
    dto: any,
    updatedDepthChart?: NFLDepthChart
  ) => {
    try {
      await DepthChartService.SaveNFLDepthChart(dto);

      if (updatedDepthChart) {
        setNFLDepthChart(updatedDepthChart);

        if (nflTeam?.ID && nflDepthchartMap) {
          setNFLDepthchartMap((prev) => ({
            ...prev,
            [nflTeam.ID]: updatedDepthChart,
          }));
        }
      }

      enqueueSnackbar("Depth Chart saved!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error("Error saving NFL depth chart:", error);
      enqueueSnackbar("Failed to save depth chart. Please try again.", {
        variant: "error",
        autoHideDuration: 5000,
      });
      throw error;
    }
  };

  const saveCFBGameplan = async (
    dto: any,
    updatedGameplan?: CollegeGameplan
  ) => {
    try {
      await GameplanService.SaveCFBGameplan(dto);

      if (updatedGameplan) {
        setCollegeGameplan(updatedGameplan);
      }

      enqueueSnackbar("Gameplan saved!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving CFB gameplan:", error);
      enqueueSnackbar("Failed to save gameplan. Please try again.", {
        variant: "error",
        autoHideDuration: 5000,
      });
      return { success: false, error };
    }
  };

  const saveNFLGameplan = async (dto: any, updatedGameplan?: NFLGameplan) => {
    try {
      await GameplanService.SaveNFLGameplan(dto);

      if (updatedGameplan) {
        setNFLGameplan(updatedGameplan);
      }

      enqueueSnackbar("Gameplan saved!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving NFL gameplan:", error);
      enqueueSnackbar("Failed to save gameplan. Please try again.", {
        variant: "error",
        autoHideDuration: 5000,
      });
      return { success: false, error };
    }
  };

  const addRecruitToBoard = async (dto: any) => {
    // Validate Affinities
    const affinityOneValid =
      dto.PlayerRecruit.AffinityOne === CloseToHome
        ? ValidateCloseToHome(dto.PlayerRecruit, cfbTeam?.TeamAbbr)
        : ValidateAffinity(dto.PlayerRecruit, teamProfileMap![cfbTeam!.ID]);

    const affinityTwoValid =
      dto.PlayerRecruit.AffinityOne === CloseToHome
        ? ValidateCloseToHome(dto.PlayerRecruit, cfbTeam?.TeamAbbr)
        : ValidateAffinity(dto.PlayerRecruit, teamProfileMap![cfbTeam!.ID]);

    // Add RES
    const apiDTO = {
      ...dto,
      SeasonID: cfb_Timestamp?.CollegeSeasonID,
      Team: cfbTeam?.TeamAbbr,
      Recruiter: cfbTeam?.Coach,
      RES: teamProfileMap![cfbTeam!.ID].RecruitingEfficiencyScore,
      ProfileID: cfbTeam?.ID,
      AffinityOneEligible: affinityOneValid,
      AffinityTwoEligible: affinityTwoValid,
    };
    const profile = await RecruitService.FBACreateRecruitProfile(apiDTO);
    if (profile) {
      const newProfile = new RecruitPlayerProfile({
        ...profile,
        ID: GenerateNumberFromRange(500000, 1000000),
      });
      setRecruitProfiles((profiles) => [...profiles, newProfile]);
    }
  };

  const removeRecruitFromBoard = async (dto: any) => {
    const profile = await RecruitService.FBARemovePlayerFromBoard(dto);
    if (profile) {
      setRecruitProfiles((profiles) =>
        [...profiles].filter((p) => p.RecruitID != dto.RecruitID)
      );
    }
  };

  const toggleScholarship = async (dto: any) => {
    const profile = await RecruitService.FBAToggleScholarship(dto);
    if (profile) {
      setRecruitProfiles((profiles) =>
        [...profiles].map((p) =>
          p.RecruitID === profile.RecruitID
            ? new RecruitPlayerProfile({
                ...p,
                Scholarship: profile.Scholarship,
                ScholarshipRevoked: profile.ScholarshipRevoked,
              })
            : p
        )
      );
      setTeamProfileMap((prev) => {
        const currentProfile = prev![profile.ProfileID];
        if (!currentProfile) return prev;

        const adjustment = profile.Scholarship
          ? -1
          : profile.ScholarshipRevoked
          ? 1
          : 0;
        return {
          ...prev,
          [profile.ProfileID]: new RecruitingTeamProfile({
            ...currentProfile,
            ScholarshipsAvailable:
              currentProfile.ScholarshipsAvailable + adjustment,
          }),
        };
      });
    }
  };

  const updatePointsOnRecruit = (id: number, name: string, points: number) => {
    setRecruitProfiles((prevProfiles) => {
      // Update the profiles and get the new profiles array.
      const updatedProfiles = prevProfiles.map((profile) =>
        profile.ID === id && profile.ID > 0
          ? new RecruitPlayerProfile({ ...profile, [name]: points })
          : profile
      );

      // Calculate the total points from the updated profiles.
      const totalPoints = updatedProfiles.reduce(
        (sum, profile) => sum + (profile.CurrentWeeksPoints || 0),
        0
      );

      // Update the recruiting team profile based on the updated points.
      setTeamProfileMap((prevTeamProfiles) => {
        const currentProfile = prevTeamProfiles![cfbTeam!.ID];
        if (!currentProfile) return prevTeamProfiles;
        return {
          ...prevTeamProfiles,
          [cfbTeam!.ID]: new RecruitingTeamProfile({
            ...currentProfile,
            SpentPoints: totalPoints,
          }),
        };
      });

      return updatedProfiles;
    });
  };

  const SaveRecruitingBoard = useCallback(async () => {
    const dto = {
      Profile: teamProfileMap![cfbTeam!.ID],
      Recruits: recruitProfiles,
      TeamID: cfbTeam!.ID,
    };

    await RecruitService.FBASaveRecruitingBoard(dto);
    enqueueSnackbar("Recruiting Board Saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  }, [teamProfileMap, recruitProfiles, cfbTeam]);

  const SaveAIRecruitingSettings = useCallback(
    async (dto: UpdateRecruitingBoardDTO) => {
      const res = await RecruitService.FBAToggleAIBehavior(dto);
      if (res) {
        enqueueSnackbar("AI Recruiting Settings Saved!", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setTeamProfileMap((prevTeamProfiles) => {
          let currentProfile = prevTeamProfiles![dto.TeamID];
          if (!currentProfile) return prevTeamProfiles;
          return {
            ...prevTeamProfiles,
            [cfbTeam!.ID]: new RecruitingTeamProfile({
              ...currentProfile,
              ...dto.Profile,
            }),
          };
        });
      }
    },
    [cfbTeamMap]
  );

  const ExportCFBRecruits = useCallback(async () => {
    await RecruitService.ExportCFBCroots();
  }, []);

  const SaveFreeAgencyOffer = useCallback(async (dto: FreeAgencyOfferDTO) => {
    const res = await FreeAgencyService.FBASaveFreeAgencyOffer(dto);
    if (res) {
      enqueueSnackbar("Free Agency Offer Created!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setFreeAgentOffers((prevOffers) => {
        const offers = [...prevOffers];
        const index = offers.findIndex((offer) => offer.ID === res.ID);
        if (index > -1) {
          offers[index] = new FreeAgencyOffer({ ...res });
        } else {
          offers.push(res);
        }
        return offers;
      });
    }
  }, []);

  const CancelFreeAgencyOffer = useCallback(async (dto: FreeAgencyOfferDTO) => {
    const res = await FreeAgencyService.FBACancelFreeAgencyOffer(dto);
    if (res) {
      enqueueSnackbar("Free Agency Offer Cancelled!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setFreeAgentOffers((prevOffers) => {
        const offers = [...prevOffers].filter((offer) => offer.ID !== dto.ID);
        return offers;
      });
    }
  }, []);

  const SaveWaiverWireOffer = useCallback(async (dto: NFLWaiverOffDTO) => {
    const res = await FreeAgencyService.FBASaveWaiverWireOffer(dto);
    if (res) {
      enqueueSnackbar("Waiver Offer Created!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setWaiverOffers((prevOffers) => {
        const offers = [...prevOffers];
        const index = offers.findIndex((offer) => offer.ID === res.ID);
        if (index > -1) {
          offers[index] = new NFLWaiverOffer({ ...res });
        } else {
          offers.push(res);
        }
        return offers;
      });
    }
  }, []);

  const CancelWaiverWireOffer = useCallback(async (dto: NFLWaiverOffDTO) => {
    const res = await FreeAgencyService.FBACancelWaiverWireOffer(dto);
    if (res) {
      enqueueSnackbar("Waiver Offer Cancelled!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setWaiverOffers((prevOffers) => {
        const offers = [...prevOffers].filter((offer) => offer.ID !== res.ID);
        return offers;
      });
    }
  }, []);

  const removeUserfromCFBTeamCall = useCallback(
    async (teamID: number) => {
      const res = await TeamService.RemoveUserFromCFBTeam(teamID);
      const cfbTeamsList = [...cfbTeams];
      const teamIDX = cfbTeamsList.findIndex((x) => x.ID === teamID);
      if (teamIDX > -1) {
        cfbTeamsList[teamIDX].Coach = "";
      }
      setCFBTeams(cfbTeamsList);
    },
    [cfbTeams]
  );

  const removeUserfromNFLTeamCall = useCallback(
    async (request: NFLRequest) => {
      const res = await TeamService.RemoveUserFromNFLTeam(request);
      const nflTeamsList = [...nflTeams];
      const teamIDX = nflTeamsList.findIndex((x) => x.ID === request.NFLTeamID);
      if (request.IsOwner) {
        nflTeamsList[teamIDX].NFLOwnerName = "";
      } else if (request.IsCoach) {
        nflTeamsList[teamIDX].Coach = "";
      } else if (request.IsManager) {
        nflTeamsList[teamIDX].NFLGMName = "";
      } else if (request.IsAssistant) {
        nflTeamsList[teamIDX].NFLAssistantName = "";
      }
      setNFLTeams(nflTeamsList);
    },
    [nflTeams]
  );

  const addUserToCFBTeam = useCallback(
    (teamID: number, user: string) => {
      const teams = [...cfbTeams];
      const teamIDX = teams.findIndex((team) => team.ID === teamID);
      if (teamID > -1) {
        teams[teamIDX].Coach = user;
        enqueueSnackbar(
          `${user} has been added as the Head Coach for ${teams[teamIDX].TeamName} Organization`,
          {
            variant: "success",
            autoHideDuration: 3000,
          }
        );
      }
      setCFBTeams(teams);
    },
    [cfbTeams]
  );

  const addUserToNFLTeam = useCallback(
    (teamID: number, user: string, role: string) => {
      const teams = [...nflTeams];
      const teamIDX = teams.findIndex((team) => team.ID === teamID);
      if (teamID > -1) {
        if (role === "Owner") {
          teams[teamIDX].NFLOwnerName = user;
        } else if (role === "Coach") {
          teams[teamIDX].Coach = user;
        } else if (role === "GM") {
          teams[teamIDX].NFLGMName = user;
        } else if (role === "Assistant") {
          teams[teamIDX].NFLAssistantName = user;
        }
        enqueueSnackbar(
          `${user} has been added as a ${role} to the ${teams[teamIDX].Mascot} Organization`,
          {
            variant: "success",
            autoHideDuration: 3000,
          }
        );
      }
      setNFLTeams(teams);
    },
    [nflTeams]
  );

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
        recruitProfiles,
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
        freeAgentOffers,
        waiverOffers,
        practiceSquadPlayers,
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
        sendNFLPlayerToPracticeSquad,
        placeNFLPlayerOnTradeBlock,
        updateCFBRosterMap,
        saveCFBDepthChart,
        saveNFLDepthChart,
        saveCFBGameplan,
        saveNFLGameplan,
        addRecruitToBoard,
        removeRecruitFromBoard,
        toggleScholarship,
        updatePointsOnRecruit,
        SaveRecruitingBoard,
        SaveAIRecruitingSettings,
        ExportCFBRecruits,
        SaveFreeAgencyOffer,
        SaveWaiverWireOffer,
        CancelFreeAgencyOffer,
        CancelWaiverWireOffer,
        addUserToCFBTeam,
        addUserToNFLTeam,
        removeUserfromCFBTeamCall,
        removeUserfromNFLTeamCall,
        playerFaces,
        proContractMap,
        proExtensionMap,
        allCFBTeamHistory,
        isLoadingFour,
        proPlayerMap,
        freeAgents,
        waiverPlayers,
        collegeGameplan,
        nflGameplan,
        collegeDepthChart,
        nflDepthChart,
        nflDraftees,
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
