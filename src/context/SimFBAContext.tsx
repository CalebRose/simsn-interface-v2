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
  CollegePlayerStats,
  CollegePlayerSeasonStats,
  CollegeTeamStats,
  CollegeTeamSeasonStats,
  NFLPlayerStats,
  NFLPlayerSeasonStats,
  NFLTeamStats,
  NFLTeamSeasonStats,
  NFLWaiverOffDTO,
  FreeAgencyOfferDTO,
  NFLRequest,
  NFLDraftee,
  HistoricCollegePlayer,
  NFLRetiredPlayer,
  CollegePollOfficial,
  CollegePollSubmission,
  NFLTradeProposal,
  NFLTradePreferences,
  NFLDraftPick,
  NFLTradeProposalDTO,
  CollegePromise,
  NFLWarRoom,
  ScoutingProfile,
  NFLTeamProposals,
  AwardsList,
  TransferPortalProfile,
} from "../models/footballModels";
import { useWebSockets } from "../_hooks/useWebsockets";
import { fba_ws } from "../_constants/urls";
import {
  CloseToHome,
  SEASON_VIEW,
  SimCFB,
  SimFBA,
} from "../_constants/constants";
import { PlayerService } from "../_services/playerService";
import { useSnackbar } from "notistack";
import { TeamHistoryService } from "../_services/teamHistoryService";
import { RecruitService } from "../_services/recruitService";
import { GenerateNumberFromRange } from "../_helper/utilHelper";
import {
  ValidateAffinity,
  ValidateCloseToHome,
} from "../_helper/recruitingHelper";
import { StatsService } from "../_services/statsService";
import { FreeAgencyService } from "../_services/freeAgencyService";
import { TeamService } from "../_services/teamService";
import {
  MakeCFBPlayerMapFromRosterMap,
  MakeNFLPlayerMapFromRosterMap,
} from "../_helper/statsPageHelper";
import { TradeService } from "../_services/tradeService";
import { CollegePollService } from "../_services/collegePollService";
import { FaceDataService } from "../_services/faceDataService";
import FBAScheduleService from "../_services/scheduleService";
import { notificationService } from "../_services/notificationService";
import { TransferPortalService } from "../_services/transferPortalService";

// ✅ Define Types for Context
interface SimFBAContextProps {
  cfb_Timestamp: Timestamp | null;
  isLoading: boolean;
  cfbTeam: CollegeTeam | null;
  cfbTeams: CollegeTeam[];
  cfbTeamMap: Record<number, CollegeTeam> | null;
  cfbTeamOptions: { label: string; value: string }[];
  cfbConferenceOptions: { label: string; value: string }[];
  currentCFBStandings: CollegeStandings[];
  cfbStandingsMap: Record<number, CollegeStandings> | null;
  cfbRosterMap: Record<number, CollegePlayer[]> | null;
  cfbPlayerMap: Record<number, CollegePlayer>;
  nflPlayerMap: Record<number, NFLPlayer>;
  recruits: Croot[];
  recruitProfiles: RecruitPlayerProfile[];
  collegePromises: CollegePromise[];
  collegePromiseMap: Record<number, CollegePromise>;
  transferProfileMapByPlayerID: Record<number, TransferPortalProfile[]>;
  transferPortalProfiles: TransferPortalProfile[];
  teamTransferPortalProfiles: TransferPortalProfile[];
  teamProfileMap: Record<number, RecruitingTeamProfile> | null;
  portalPlayers: CollegePlayer[];
  portalPlayerMap: Record<number, CollegePlayer>;
  historicCollegePlayers: HistoricCollegePlayer[];
  nflRetiredPlayers: NFLRetiredPlayer[];
  collegeInjuryReport: CollegePlayer[];
  allCFBStandings: CollegeStandings[];
  allCollegeGames: CollegeGame[];
  currentCollegeSeasonGames: CollegeGame[];
  collegeTeamsGames: CollegeGame[];
  collegeNews: NewsLog[];
  collegeNotifications: Notification[];
  cfbDepthChartMap: Record<number, CollegeTeamDepthChart> | null;
  nflTeam: NFLTeam | null;
  nflTeams: NFLTeam[];
  nflTeamOptions: { label: string; value: string }[];
  proTeamMap: Record<number, NFLTeam> | null;
  allProStandings: NFLStandings[];
  currentProStandings: NFLStandings[];
  nflConferenceOptions: { label: string; value: string }[];
  proStandingsMap: Record<number, NFLStandings> | null;
  nflDepthChartMap: Record<number, NFLDepthChart> | null;
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
  proTeamsGames: NFLGame[];
  proNotifications: Notification[];
  topCFBPassers: CollegePlayer[];
  topCFBRushers: CollegePlayer[];
  topCFBReceivers: CollegePlayer[];
  topNFLPassers: NFLPlayer[];
  topNFLRushers: NFLPlayer[];
  topNFLReceivers: NFLPlayer[];
  collegePolls: CollegePollOfficial[];
  collegePollSubmission: CollegePollSubmission;
  collegePollsMapBySeason: Record<number, CollegePollOfficial[]>;
  nflDraftees: NFLDraftee[];
  tradeProposalsMap: Record<number, NFLTradeProposal[]>;
  tradePreferencesMap: Record<number, NFLTradePreferences>;
  nflDraftPicks: NFLDraftPick[];
  nflDraftPickMap: Record<number, NFLDraftPick[]>;
  individualDraftPickMap: Record<number, NFLDraftPick>;
  removeUserfromCFBTeamCall: (teamID: number) => Promise<void>;
  removeUserfromNFLTeamCall: (request: NFLRequest) => Promise<void>;
  addUserToCFBTeam: (teamID: number, user: string) => void;
  addUserToNFLTeam: (teamID: number, user: string, role: string) => void;
  getBootstrapRosterData: () => void;
  getBootstrapRecruitingData: () => void;
  getBootstrapFreeAgencyData: () => void;
  getBootstrapScheduleData: () => void;
  getBootstrapDraftData: () => void;
  getBootstrapPortalData: () => void;
  getBootstrapGameplanData: () => void;
  getBootstrapNewsData: () => void;
  getBootstrapStatsData: () => void;
  cutCFBPlayer: (playerID: number, teamID: number) => Promise<void>;
  cutNFLPlayer: (playerID: number, teamID: number) => Promise<void>;
  sendNFLPlayerToPracticeSquad: (
    playerID: number,
    teamID: number,
  ) => Promise<void>;
  placeNFLPlayerOnTradeBlock: (
    playerID: number,
    teamID: number,
  ) => Promise<void>;
  redshirtPlayer: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer: (dto: any) => Promise<void>;
  updateCFBRosterMap: (newMap: Record<number, CollegePlayer[]>) => void;
  saveCFBDepthChart: (
    dto: any,
    updatedDepthChart?: CollegeTeamDepthChart,
  ) => Promise<void>;
  saveNFLDepthChart: (
    dto: any,
    updatedDepthChart?: NFLDepthChart,
  ) => Promise<void>;
  saveCFBGameplan: (
    dto: any,
    updatedGameplan?: CollegeGameplan,
  ) => Promise<{ success: boolean; error?: unknown }>;
  saveNFLGameplan: (
    dto: any,
    updatedGameplan?: NFLGameplan,
  ) => Promise<{ success: boolean; error?: unknown }>;
  addRecruitToBoard: (dto: any) => Promise<void>;
  removeRecruitFromBoard: (dto: any) => Promise<void>;
  toggleScholarship: (dto: any) => Promise<void>;
  updatePointsOnRecruit: (id: number, name: string, points: number) => void;
  SaveRecruitingBoard: () => Promise<void>;
  SaveAIRecruitingSettings: (dto: UpdateRecruitingBoardDTO) => Promise<void>;
  ExportCFBRecruits: () => Promise<void>;
  SearchFootballStats: (dto: any) => Promise<void>;
  ExportFootballStats: (dto: any) => Promise<void>;
  SaveFreeAgencyOffer: (dto: any) => Promise<void>;
  CancelFreeAgencyOffer: (dto: any) => Promise<void>;
  SaveWaiverWireOffer: (dto: any) => Promise<void>;
  CancelWaiverWireOffer: (dto: any) => Promise<void>;
  submitCollegePoll: (dto: any) => Promise<void>;
  proposeTrade: (dto: NFLTradeProposal) => Promise<void>;
  acceptTrade: (dto: NFLTradeProposal) => Promise<void>;
  rejectTrade: (dto: NFLTradeProposal) => Promise<void>;
  cancelTrade: (dto: NFLTradeProposal) => Promise<void>;
  syncAcceptedTrade: (dto: NFLTradeProposal) => Promise<void>;
  vetoTrade: (dto: NFLTradeProposal) => Promise<void>;
  ExportFootballSchedule: (dto: any) => Promise<void>;
  ExportPlayByPlay: (dto: any) => Promise<void>;
  SaveExtensionOffer: (dto: any) => Promise<void>;
  CancelExtensionOffer: (dto: any) => Promise<void>;
  cancelPromise: (dto: any) => Promise<void>;
  addTransferPlayerToBoard: (dto: any) => Promise<void>;
  removeTransferPlayerFromBoard: (dto: any) => Promise<void>;
  saveTransferPortalBoard: () => Promise<void>;
  exportTransferPortalPlayers: () => Promise<void>;
  updatePointsOnPortalPlayer: (
    id: number,
    name: string,
    points: number,
  ) => void;
  scoutPortalAttribute: (dto: any) => Promise<void>;
  playerFaces: {
    [key: number]: FaceDataResponse;
  };
  proContractMap: Record<number, NFLContract> | null;
  proExtensionMap: Record<number, NFLExtensionOffer> | null;
  proPlayerMap: Record<number, NFLPlayer>;
  allCFBTeamHistory: { [key: number]: CFBTeamProfileData };
  cfbPlayerGameStatsMap: Record<number, CollegePlayerStats[]>;
  cfbPlayerSeasonStatsMap: Record<number, CollegePlayerSeasonStats[]>;
  cfbTeamGameStatsMap: Record<number, CollegeTeamStats[]>;
  cfbTeamSeasonStatsMap: Record<number, CollegeTeamSeasonStats[]>;
  nflPlayerGameStatsMap: Record<number, NFLPlayerStats[]>;
  nflPlayerSeasonStatsMap: Record<number, NFLPlayerSeasonStats[]>;
  nflTeamGameStatsMap: Record<number, NFLTeamStats[]>;
  nflTeamSeasonStatsMap: Record<number, NFLTeamSeasonStats[]>;
  collegeGameplan: CollegeGameplan | null;
  nflGameplan: NFLGameplan | null;
  collegeDepthChart: CollegeTeamDepthChart | null;
  nflDepthChart: NFLDepthChart | null;
  collegeGameplanMap: Record<number, CollegeGameplan | null>;
  nflGameplanMap: Record<number, NFLGameplan | null>;
  nflWarRoomMap: Record<number, NFLWarRoom | null>;
  nflScoutingProfileMap: Record<number, ScoutingProfile | null>;
  cfbPostSeasonAwards: AwardsList;
  toggleNotificationAsRead: (
    notificationID: number,
    isPro: boolean,
  ) => Promise<void>;
  deleteNotification: (notificationID: number, isPro: boolean) => Promise<void>;
}

// ✅ Initial Context State
const defaultContext: SimFBAContextProps = {
  cfb_Timestamp: null,
  isLoading: true,
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
  collegePromises: [],
  collegePromiseMap: {},
  transferPortalProfiles: [],
  teamTransferPortalProfiles: [],
  transferProfileMapByPlayerID: {},
  teamProfileMap: {},
  portalPlayers: [],
  historicCollegePlayers: [],
  nflRetiredPlayers: [],
  cfbPlayerMap: {},
  nflPlayerMap: {},
  portalPlayerMap: {},
  collegeInjuryReport: [],
  currentCollegeSeasonGames: [],
  collegeTeamsGames: [],
  allCollegeGames: [],
  cfbDepthChartMap: {},
  collegeNews: [],
  collegeNotifications: [],
  nflTeam: null,
  nflTeams: [],
  nflTeamOptions: [],
  nflConferenceOptions: [],
  nflDepthChartMap: {},
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
  proTeamsGames: [],
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
  collegePolls: [],
  collegePollSubmission: {} as CollegePollSubmission,
  collegePollsMapBySeason: {},
  nflDraftPicks: [],
  nflDraftPickMap: {},
  individualDraftPickMap: {},
  tradePreferencesMap: {},
  tradeProposalsMap: {},
  cfbPostSeasonAwards: {} as AwardsList,
  removeUserfromCFBTeamCall: async () => {},
  removeUserfromNFLTeamCall: async () => {},
  addUserToCFBTeam: async () => {},
  addUserToNFLTeam: async () => {},
  getBootstrapRosterData: async () => {},
  getBootstrapRecruitingData: async () => {},
  getBootstrapFreeAgencyData: async () => {},
  getBootstrapScheduleData: async () => {},
  getBootstrapDraftData: async () => {},
  getBootstrapNewsData: async () => {},
  getBootstrapPortalData: async () => {},
  getBootstrapGameplanData: async () => {},
  getBootstrapStatsData: async () => {},
  cutCFBPlayer: async () => {},
  cutNFLPlayer: async () => {},
  sendNFLPlayerToPracticeSquad: async () => {},
  placeNFLPlayerOnTradeBlock: async () => {},
  redshirtPlayer: async () => {},
  addTransferPlayerToBoard: async () => {},
  removeTransferPlayerFromBoard: async () => {},
  saveTransferPortalBoard: async () => {},
  promisePlayer: async () => {},
  cancelPromise: async () => {},
  exportTransferPortalPlayers: async () => {},
  updatePointsOnPortalPlayer: () => {},
  scoutPortalAttribute: async () => {},
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
  SearchFootballStats: async () => {},
  ExportFootballStats: async () => {},
  SaveFreeAgencyOffer: async () => {},
  CancelFreeAgencyOffer: async () => {},
  SaveWaiverWireOffer: async () => {},
  CancelWaiverWireOffer: async () => {},
  submitCollegePoll: async () => {},
  proposeTrade: async () => {},
  acceptTrade: async () => {},
  rejectTrade: async () => {},
  cancelTrade: async () => {},
  syncAcceptedTrade: async () => {},
  vetoTrade: async () => {},
  SaveExtensionOffer: async () => {},
  CancelExtensionOffer: async () => {},
  ExportFootballSchedule: async () => {},
  ExportPlayByPlay: async () => {},
  playerFaces: {},
  proContractMap: {},
  proExtensionMap: {},
  allCFBTeamHistory: {},
  cfbPlayerGameStatsMap: {},
  cfbPlayerSeasonStatsMap: {},
  cfbTeamGameStatsMap: {},
  cfbTeamSeasonStatsMap: {},
  nflPlayerGameStatsMap: {},
  nflPlayerSeasonStatsMap: {},
  nflTeamGameStatsMap: {},
  nflTeamSeasonStatsMap: {},
  proPlayerMap: {},
  collegeGameplan: null,
  nflGameplan: null,
  collegeDepthChart: null,
  nflDepthChart: null,
  collegeGameplanMap: {},
  nflGameplanMap: {},
  nflWarRoomMap: {},
  nflScoutingProfileMap: {},
  toggleNotificationAsRead: async () => {},
  deleteNotification: async () => {},
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
  const isScheduleDataFetching = useRef(false);
  const isStatsDataFetching = useRef(false);
  const [transferPortalLoading, setTransferPortalLoading] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cfbTeam, setCFBTeam] = useState<CollegeTeam | null>(null);
  const [cfbTeams, setCFBTeams] = useState<CollegeTeam[]>([]);
  const [cfbTeamMap, setCFBTeamMap] = useState<Record<number, CollegeTeam>>({});
  const [cfbDepthChartMap, setCFBDepthChartMap] = useState<Record<
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
    [],
  );
  const [currentCFBStandings, setCurrentCFBStandings] = useState<
    CollegeStandings[]
  >([]);
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
  const [historicCollegePlayers, setHistoricCollegePlayers] = useState<
    HistoricCollegePlayer[]
  >([]);
  const [nflRetiredPlayers, setNFLRetiredPlayers] = useState<
    NFLRetiredPlayer[]
  >([]);
  const [collegeInjuryReport, setCollegeInjuryReport] = useState<
    CollegePlayer[]
  >([]);
  const [collegeNews, setCollegeNews] = useState<NewsLog[]>([]);
  const [allCollegeGames, setAllCollegeGames] = useState<CollegeGame[]>([]);
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
    {},
  );
  const [nflDepthChartMap, setNFLDepthChartMap] = useState<Record<
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
    [],
  );
  const [proNews, setProNews] = useState<NewsLog[]>([]);
  const [allProGames, setAllProGames] = useState<NFLGame[]>([]);
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
  const [cfbPlayerGameStatsMap, setCfbPlayerGameStatsMap] = useState<
    Record<number, CollegePlayerStats[]>
  >({});
  const [cfbPlayerSeasonStatsMap, setCfbPlayerSeasonStats] = useState<
    Record<number, CollegePlayerSeasonStats[]>
  >({});
  const [cfbTeamGameStatsMap, setCfbTeamGameStats] = useState<
    Record<number, CollegeTeamStats[]>
  >([]);
  const [cfbTeamSeasonStatsMap, setCfbTeamSeasonStats] = useState<
    Record<number, CollegeTeamSeasonStats[]>
  >([]);
  const [nflPlayerGameStatsMap, setNflPlayerGameStats] = useState<
    Record<number, NFLPlayerStats[]>
  >([]);
  const [nflPlayerSeasonStatsMap, setNflPlayerSeasonStats] = useState<
    Record<number, NFLPlayerSeasonStats[]>
  >([]);
  const [nflTeamGameStatsMap, setNflTeamGameStats] = useState<
    Record<number, NFLTeamStats[]>
  >([]);
  const [nflTeamSeasonStatsMap, setNflTeamSeasonStats] = useState<
    Record<number, NFLTeamSeasonStats[]>
  >([]);
  const [collegeGameplanMap, setCollegeGameplanMap] = useState<
    Record<number, CollegeGameplan | null>
  >({});
  const [nflGameplanMap, setNFLGameplanMap] = useState<
    Record<number, NFLGameplan | null>
  >({});
  const [collegeDepthChart, setCollegeDepthChart] =
    useState<CollegeTeamDepthChart | null>(null);
  const [nflDepthChart, setNFLDepthChart] = useState<NFLDepthChart | null>(
    null,
  );
  const [freeAgents, setFreeAgents] = useState<NFLPlayer[]>([]);
  const [waiverPlayers, setWaiverPlayers] = useState<NFLPlayer[]>([]);
  const [nflDraftees, setNFLDraftees] = useState<NFLDraftee[]>([]);
  const [collegePolls, setCollegePolls] = useState<CollegePollOfficial[]>([]);
  const [collegePollSubmission, setCollegePollSubmission] =
    useState<CollegePollSubmission>({} as CollegePollSubmission);
  const [tradeProposalsMap, setTradeProposalsMap] = useState<
    Record<number, NFLTradeProposal[]>
  >([]);
  const [tradePreferencesMap, setTradePreferencesMap] = useState<
    Record<number, NFLTradePreferences>
  >({});
  const [nflDraftPicks, setNFLDraftPicks] = useState<NFLDraftPick[]>([]);
  const [collegePromises, setCollegePromises] = useState<CollegePromise[]>([]);
  const [nflWarRoomMap, setNFLWarRoomMap] = useState<
    Record<number, NFLWarRoom | null>
  >({});
  const [nflScoutingProfileMap, setNFLScoutingProfileMap] = useState<
    Record<number, ScoutingProfile | null>
  >({});
  const [cfbPostSeasonAwards, setCFBPostSeasonAwards] = useState<AwardsList>(
    {} as AwardsList,
  );
  const [transferPortalProfiles, setTransferPortalProfiles] = useState<
    TransferPortalProfile[]
  >([]);

  // Loading states for double-click prevention
  const [recruitingLoading, setRecruitingLoading] = useState<boolean>(false);
  const [freeAgencyLoading, setFreeAgencyLoading] = useState<boolean>(false);

  const nflDraftPickMap = useMemo(() => {
    if (!nflDraftPicks) return {};
    const pickMap: Record<number, NFLDraftPick[]> = {};
    for (let i = 0; i < nflDraftPicks.length; i++) {
      const pick = nflDraftPicks[i];
      if (!pickMap[pick.TeamID]) {
        pickMap[pick.TeamID] = [pick];
      } else {
        pickMap[pick.TeamID].push(pick);
      }
    }
    return pickMap;
  }, [nflDraftPicks]);

  const individualDraftPickMap = useMemo(() => {
    if (!nflDraftPicks) return {};
    const pickMap: Record<number, NFLDraftPick> = {};

    for (let i = 0; i < nflDraftPicks.length; i++) {
      const pick = nflDraftPicks[i];
      pickMap[pick.ID] = pick;
    }

    return pickMap;
  }, [nflDraftPicks]);

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

  const collegeGameplan = useMemo(() => {
    if (cfbTeam && collegeGameplanMap) {
      const gameplan = collegeGameplanMap[cfbTeam.ID];
      if (!gameplan) return null;
      return new CollegeGameplan({
        ...gameplan,
        // Store Right% internally; invert LeftVsRight from backend (Left%)
        LeftVsRight:
          typeof (gameplan as any).LeftVsRight === "number"
            ? 100 - (gameplan as any).LeftVsRight
            : (gameplan as any).LeftVsRight,
      });
    }
    return null;
  }, [cfbTeam, collegeGameplanMap]);

  const nflGameplan = useMemo(() => {
    if (nflTeam && nflGameplanMap) {
      const gameplan = nflGameplanMap[nflTeam.ID];
      if (!gameplan) return null;
      return new NFLGameplan({
        ...gameplan,
        // Store Right% internally; invert LeftVsRight from backend (Left%)
        LeftVsRight:
          typeof (gameplan as any).LeftVsRight === "number"
            ? 100 - (gameplan as any).LeftVsRight
            : (gameplan as any).LeftVsRight,
      });
    }
    return null;
  }, [nflTeam, nflGameplanMap]);

  const collegePollsMapBySeason = useMemo(() => {
    const pollMap: Record<number, CollegePollOfficial[]> = {};
    if (!collegePolls) return pollMap;
    for (let i = 0; i < collegePolls.length; i++) {
      const poll = collegePolls[i];
      if (!pollMap[poll.SeasonID]) {
        pollMap[poll.SeasonID] = [poll];
      } else {
        pollMap[poll.SeasonID].push(poll);
      }
    }
    return pollMap;
  }, [collegePolls]);

  const cfbStandingsMap = useMemo(() => {
    if (!allCFBStandings) return {};
    const standingsMap = Object.fromEntries(
      allCFBStandings.map((standing) => [standing.TeamID, standing]),
    );
    return standingsMap;
  }, [allCFBStandings]);

  const teamTransferPortalProfiles = useMemo(() => {
    if (!cfbTeam) return [];
    return transferPortalProfiles.filter(
      (profile) => profile.ProfileID === cfbTeam.ID,
    );
  }, [cfbTeam, transferPortalProfiles]);

  const transferProfileMapByPlayerID = useMemo(() => {
    if (!portalPlayers || !transferPortalProfiles) return {};
    const transferProfileMap: Record<number, TransferPortalProfile[]> = {};
    for (let i = 0; i < portalPlayers.length; i++) {
      const p = portalPlayers[i];
      const profiles = transferPortalProfiles.filter(
        (profile) => profile.CollegePlayerID === p.ID,
      );
      transferProfileMap[p.ID] = profiles;
    }
    return transferProfileMap;
  }, [portalPlayers, transferPortalProfiles]);

  const teamCollegePromises = useMemo(() => {
    if (!cfbTeam || !collegePromises) return [];
    return collegePromises.filter((promise) => promise.TeamID === cfbTeam.ID);
  }, [cfbTeam, collegePromises]);

  const collegePromiseMap = useMemo(() => {
    const map: Record<number, CollegePromise> = {};
    for (let i = 0; i < teamCollegePromises.length; i++) {
      const promise = teamCollegePromises[i];
      map[promise.CollegePlayerID] = promise;
    }
    return map;
  }, [teamCollegePromises]);

  const portalPlayerMap = useMemo(() => {
    const playerMap: Record<number, CollegePlayer> = {};
    if (portalPlayers) {
      for (let i = 0; i < portalPlayers.length; i++) {
        const p = portalPlayers[i];
        playerMap[p.ID] = p;
      }
    }
    return playerMap;
  }, [portalPlayers]);

  useEffect(() => {
    getFaceData();
    getBootstrapTeamData();
  }, []);

  const getBootstrapTeamData = async () => {
    const res = await BootstrapService.GetFBABootstrapTeamData();
    setCFBTeams(res.AllCollegeTeams);
    setNFLTeams(res.AllProTeams);

    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName),
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
          ]),
        ).values(),
      ).sort((a, b) => a.label.localeCompare(b.label));
      setCFBTeamOptions(teamOptionsList);
      setCFBConferenceOptions(conferenceOptions);
      const collegeTeamMap = Object.fromEntries(
        sortedCollegeTeams.map((team) => [team.ID, team]),
      );
      setCFBTeamMap(collegeTeamMap);
    }
    if (res.AllProTeams.length > 0) {
      const sortedNFLTeams = res.AllProTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName),
      );
      const nflTeamOptions = sortedNFLTeams.map((team) => ({
        label: `${team.TeamName} ${team.Mascot}`,
        value: team.ID.toString(),
      }));
      const nflConferenceOptions = Array.from(
        new Map(
          sortedNFLTeams.map((team) => [
            team.ConferenceID,
            { label: team.Conference, value: team.ConferenceID.toString() },
          ]),
        ).values(),
      ).sort((a, b) => a.label.localeCompare(b.label));
      setNFLTeamOptions(nflTeamOptions);
      setNFLConferenceOptions(nflConferenceOptions);
      const nflMap = Object.fromEntries(
        sortedNFLTeams.map((team) => [team.ID, team]),
      );
      setProTeamMap(nflMap);
    }
  };

  const getFaceData = async () => {
    const res = await FaceDataService.GetFBAFaceData();
    setPlayerFaces(res);
  };

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      isFetching.current = true;
      bootstrapAllData();
    }
  }, [currentUser]);

  const cfbPlayerMap = useMemo(() => {
    if (!cfbRosterMap || !cfbTeams) return {};
    const initialMap = MakeCFBPlayerMapFromRosterMap(cfbTeams, cfbRosterMap);
    for (let i = 0; i < historicCollegePlayers.length; i++) {
      const player = new CollegePlayer(historicCollegePlayers[i]);
      initialMap[player.ID] = player;
    }
    return initialMap;
  }, [cfbTeams, cfbRosterMap, historicCollegePlayers]);

  const nflPlayerMap = useMemo(() => {
    if (!proRosterMap || !nflTeams) return {};
    const initialMap = MakeNFLPlayerMapFromRosterMap(nflTeams, proRosterMap!!);
    for (let i = 0; i < nflRetiredPlayers.length; i++) {
      const player = new NFLPlayer(nflRetiredPlayers[i]);
      initialMap[player.ID] = player;
    }
    return initialMap;
  }, [nflTeams, proRosterMap, nflRetiredPlayers]);

  const currentCollegeSeasonGames = useMemo(() => {
    if (allCollegeGames && allCollegeGames.length > 0 && cfb_Timestamp) {
      return allCollegeGames.filter(
        (x) => x.SeasonID === cfb_Timestamp.CollegeSeasonID,
      );
    }
    return [];
  }, [allCollegeGames, cfb_Timestamp]);

  const collegeTeamsGames = useMemo(() => {
    if (
      currentCollegeSeasonGames &&
      currentCollegeSeasonGames.length > 0 &&
      cfbTeam
    ) {
      return currentCollegeSeasonGames.filter(
        (x) => x.HomeTeamID === cfbTeam.ID || x.AwayTeamID === cfbTeam.ID,
      );
    }
    return [];
  }, [currentCollegeSeasonGames, cfbTeam]);

  const currentProSeasonGames = useMemo(() => {
    if (allProGames && allProGames.length > 0 && cfb_Timestamp) {
      return allProGames.filter(
        (x) => x.SeasonID === cfb_Timestamp.NFLSeasonID,
      );
    }
    return [];
  }, [allProGames, cfb_Timestamp]);

  const proTeamsGames = useMemo(() => {
    if (currentProSeasonGames && currentProSeasonGames.length > 0 && nflTeam) {
      return currentProSeasonGames.filter(
        (x) => x.HomeTeamID === nflTeam.ID || x.AwayTeamID === nflTeam.ID,
      );
    }
    return [];
  }, [currentProSeasonGames, nflTeam]);

  const bootstrapAllData = async () => {
    await getLandingBootstrapData();
    await fetchAllHistory();
    isFetching.current = false;
  };

  const getLandingBootstrapData = async () => {
    let cfbID = 0;
    let nflID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    // if the user has no football teams, skip FBA landing bootstrapping
    if (cfbID === 0 && nflID === 0) {
      setIsLoading(false);
      return;
    }
    const res = await BootstrapService.GetFBALandingBootstrapData(cfbID, nflID);

    if (cfbID > 0) {
      setCFBTeam(res.CollegeTeam);
      setCollegeInjuryReport(res.CollegeInjuryReport);
      setCollegeNotifications(res.CollegeNotifications);
      setTopCFBPassers(res.TopCFBPassers);
      setTopCFBRushers(res.TopCFBRushers);
      setTopCFBReceivers(res.TopCFBReceivers);
      setCFBRosterMap(res.CollegeRosterMap);
      setPortalPlayers(res.PortalPlayers);
      setCollegeGameplanMap(res.CollegeGameplanMap);
      setCollegeDepthChart(res.CollegeDepthChart || null);
      setRecruitProfiles(res.RecruitProfiles);
      setAllCollegeGames(res.AllCollegeGames);
      setAllCFBStandings(res.CollegeStandings);
    }

    if (nflID > 0) {
      setNFLTeam(res.ProTeam);
      setNFLGameplanMap(res.NFLGameplanMap);
      setProNotifications(res.ProNotifications);
      setTopNFLPassers(res.TopNFLPassers);
      setTopNFLRushers(res.TopNFLRushers);
      setTopNFLReceivers(res.TopNFLReceivers);
      setProRosterMap(res.ProRosterMap);
      setPracticeSquadPlayers(res.PracticeSquadPlayers);
      setProInjuryReport(res.ProInjuryReport);
      setAllProGames(res.AllProGames);
      setAllProStandings(res.ProStandings);
      setCapsheetMap(res.CapsheetMap);
    }

    setIsLoading(false);
  };

  const fetchAllHistory = async () => {
    const response = await TeamHistoryService.GetCFBTeamHistory();
    setAllCFBTeamHistory(response);
  };

  const getBootstrapRosterData = async () => {
    let cfbID = 0;
    let nflID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    if (cfbID === 0 && nflID === 0) {
      return;
    }
    const res = await BootstrapService.GetFBARosterBootstrapData(cfbID, nflID);
    setTradeProposalsMap(res.TradeProposals);
    setTradePreferencesMap(res.TradePreferences);
    setProContractMap(res.ContractMap);
    setProExtensionMap(res.ExtensionMap);
    setNFLDraftPicks(res.NFLDraftPicks);
  };

  const getBootstrapRecruitingData = async () => {
    let cfbID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (cfbID === 0) {
      return;
    }
    const res = await BootstrapService.GetFBARecruitingBootstrapData(cfbID);
    setRecruits(res.Recruits);
    setTeamProfileMap(res.TeamProfileMap);
    setRecruitProfiles(res.RecruitProfiles);
  };

  const getBootstrapFreeAgencyData = async () => {
    let nflID = 0;
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    if (nflID === 0) {
      return;
    }
    const res = await BootstrapService.GetFBAFreeAgencyBootstrapData(nflID);
    setFreeAgentOffers(res.FreeAgentOffers);
    setWaiverOffers(res.WaiverWireOffers);
    setFreeAgents(res.FreeAgents);
    setWaiverPlayers(res.WaiverPlayers);
  };

  const getBootstrapScheduleData = useCallback(async () => {
    if (isScheduleDataFetching.current) {
      console.log("Schedule data already fetching, skipping...");
      return;
    }

    let cfbID = 0;
    const seasonId = cfb_Timestamp?.CollegeSeasonID || 0;
    const username = currentUser?.username || "";
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (seasonId === 0 || username === "") {
      return;
    }

    isScheduleDataFetching.current = true;
    console.log("Starting bootstrap schedule data fetch...");

    try {
      const res = await BootstrapService.GetFBASchedulingBootstrapData(
        username,
        cfbID,
        seasonId,
      );
      setCollegePolls(res.OfficialPolls);
      setCollegePollSubmission(res.CollegePollSubmission);
      setHistoricCollegePlayers(res.HistoricCollegePlayers);
      setNFLRetiredPlayers(res.RetiredPlayers);
    } finally {
      isScheduleDataFetching.current = false;
    }
  }, [
    cfb_Timestamp?.CollegeSeasonID,
    currentUser?.username,
    currentUser?.teamId,
  ]);

  const getBootstrapStatsData = useCallback(async () => {
    if (isStatsDataFetching.current) {
      console.log("Stats data already fetching, skipping...");
      return;
    }

    let cfbID = 0;
    let nflID = 0;
    const seasonId = cfb_Timestamp?.CollegeSeasonID || 0;
    const username = currentUser?.username || "";
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    if ((cfbID === 0 && nflID === 0) || seasonId === 0 || username === "") {
      return;
    }

    isStatsDataFetching.current = true;
    console.log("Starting bootstrap stats data fetch...");

    try {
      const res = await BootstrapService.GetFBAStatsBootstrapData(cfbID, nflID);
      setCFBPostSeasonAwards(res.PostSeasonAwards);
      setHistoricCollegePlayers(res.HistoricCollegePlayers);
      setNFLRetiredPlayers(res.RetiredPlayers);
    } finally {
      isStatsDataFetching.current = false;
    }
  }, [
    currentUser?.teamId,
    currentUser?.NFLTeamID,
    cfb_Timestamp?.CollegeSeasonID,
    currentUser?.username,
  ]);

  // Use this once the draft page is finished
  const getBootstrapDraftData = async () => {
    let nflID = 0;
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    if (nflID === 0) {
      return;
    }
    const res = await BootstrapService.GetFBADraftBootstrapData(nflID);
    setNFLDraftees(res.NFLDraftees);
    setNFLWarRoomMap(res.NFLWarRoomMap);
    setNFLScoutingProfileMap(res.NFLScoutingProfileMap);
  };

  // use this once the portal page is finished
  const getBootstrapPortalData = async () => {
    let cfbID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (cfbID === 0) {
      return;
    }
    const res = await BootstrapService.GetFBAPortalBootstrapData(cfbID);
    setPortalPlayers(res.PortalPlayers);
    setTeamProfileMap(res.TeamProfileMap);
    setCollegePromises(res.CollegePromises);
    setTransferPortalProfiles(res.TransferPortalProfiles);
  };

  const getBootstrapGameplanData = async () => {
    let cfbID = 0;
    let nflID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    if (cfbID === 0 && nflID === 0) {
      return;
    }
    const res = await BootstrapService.GetFBAGameplanBootstrapData(
      cfbID,
      nflID,
    );
    setCollegeGameplanMap(res.CollegeGameplanMap);
    setCollegeDepthChart(res.CollegeDepthChart || null);
    setCFBDepthChartMap(res.CollegeDepthChartMap || {});
    setNFLGameplanMap(res.NFLGameplanMap);
    setNFLDepthChart(res.NFLDepthChart || null);
    setNFLDepthChartMap(res.NFLDepthChartMap || {});
  };

  const getBootstrapNewsData = useCallback(async () => {
    let cfbID = 0;
    let nflID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NFLTeamID) {
      nflID = currentUser.NFLTeamID;
    }
    if (cfbID === 0 && nflID === 0) {
      return;
    }
    const res = await BootstrapService.GetFBANewsBootstrapData(cfbID, nflID);

    if (cfbID > 0) {
      setCollegeNews(res.CollegeNews);
    }

    if (nflID > 0) {
      setProNews(res.ProNews);
    }
  }, [currentUser?.teamId, currentUser?.NFLTeamID]);

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
          { variant: "warning", autoHideDuration: 3000 },
        );
        return;
      }
      const res = await PlayerService.CutCFBPlayer(playerID);
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID,
      );
      setCFBRosterMap(rosterMap);
    },
    [cfbRosterMap],
  );

  const redshirtPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const rosterMap = { ...cfbRosterMap };
      const redshirtCount = rosterMap[teamID].filter(
        (x) => x.IsRedshirting,
      ).length;
      if (redshirtCount > 19) {
        enqueueSnackbar(
          "You have reached the current maximum allowed for redshirts.",
          { variant: "warning", autoHideDuration: 3000 },
        );
        return;
      }
      const gamesCompleted = collegeTeamsGames.filter(
        (game) =>
          (game.HomeTeamID === teamID || game.AwayTeamID === teamID) &&
          game.GameComplete,
      ).length;

      if (gamesCompleted > 4) {
        enqueueSnackbar(
          "You cannot redshirt players after 4 games have been completed.",
          { variant: "warning", autoHideDuration: 3000 },
        );
        return;
      }
      const res = await PlayerService.RedshirtCFBPlayer(playerID);
      const playerIDX = rosterMap[teamID].findIndex(
        (player) => player.ID === playerID,
      );
      if (playerIDX > -1) {
        rosterMap[teamID][playerIDX].IsRedshirting = true;
        setCFBRosterMap(rosterMap);
        const player = rosterMap[teamID][playerIDX];
        enqueueSnackbar(
          `Placed redshirt on ${player.Position} ${player.FirstName} ${player.LastName}!`,
          {
            variant: "success",
            autoHideDuration: 3000,
          },
        );
      }
    },
    [cfbRosterMap],
  );

  const cutNFLPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.CutNFLPlayer(playerID);
      const rosterMap = { ...proRosterMap };
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID,
      );
      setProRosterMap(rosterMap);
    },
    [proRosterMap],
  );

  const sendNFLPlayerToPracticeSquad = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.SendNFLPlayerToPracticeSquad(playerID);
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
              : player,
          ),
        };
      });
    },
    [proRosterMap],
  );

  const placeNFLPlayerOnTradeBlock = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.SendNFLPlayerToTradeBlock(playerID);
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
              : player,
          ),
        };
      });
    },
    [proRosterMap],
  );

  const updateCFBRosterMap = (newMap: Record<number, CollegePlayer[]>) => {
    setCFBRosterMap(newMap);
  };

  const saveCFBDepthChart = async (
    dto: any,
    updatedDepthChart?: CollegeTeamDepthChart,
  ) => {
    try {
      await DepthChartService.SaveCFBDepthChart(dto);

      if (updatedDepthChart) {
        setCollegeDepthChart(updatedDepthChart);

        if (cfbTeam?.ID && cfbDepthChartMap) {
          setCFBDepthChartMap((prev) => ({
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
    updatedDepthChart?: NFLDepthChart,
  ) => {
    try {
      await DepthChartService.SaveNFLDepthChart(dto);

      if (updatedDepthChart) {
        setNFLDepthChart(updatedDepthChart);

        if (nflTeam?.ID && nflDepthChartMap) {
          setNFLDepthChartMap((prev) => ({
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
    updatedGameplan?: CollegeGameplan,
  ) => {
    try {
      await GameplanService.SaveCFBGameplan(dto);

      if (dto?.UpdatedGameplan) {
        setCollegeGameplanMap((prev) => ({
          ...prev,
          [cfbTeam!.ID]: dto.UpdatedGameplan as CollegeGameplan,
        }));
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

      if (dto?.UpdatedNFLGameplan) {
        setNFLGameplanMap((prev) => ({
          ...prev,
          [nflTeam!.ID]: dto.UpdatedNFLGameplan as NFLGameplan,
        }));
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
    if (recruitingLoading) return;
    setRecruitingLoading(true);

    try {
      // Validate Affinities
      const affinityOneValid =
        dto.PlayerRecruit.AffinityOne === CloseToHome
          ? ValidateCloseToHome(dto.PlayerRecruit, cfbTeam?.TeamAbbr)
          : ValidateAffinity(
              dto.PlayerRecruit.AffinityOne,
              teamProfileMap![cfbTeam!.ID],
            );

      const affinityTwoValid =
        dto.PlayerRecruit.AffinityTwo === CloseToHome
          ? ValidateCloseToHome(dto.PlayerRecruit, cfbTeam?.TeamAbbr)
          : ValidateAffinity(
              dto.PlayerRecruit.AffinityTwo,
              teamProfileMap![cfbTeam!.ID],
            );

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
      enqueueSnackbar("Adding recruit...", {
        variant: "info",
        autoHideDuration: 1000,
      });
      const profile = await RecruitService.FBACreateRecruitProfile(apiDTO);
      if (profile) {
        const newProfile = new RecruitPlayerProfile({
          ...profile,
          ID: GenerateNumberFromRange(500000, 1000000),
        });
        setRecruitProfiles((profiles) => [...profiles, newProfile]);
      }
    } finally {
      setRecruitingLoading(false);
    }
  };

  const removeRecruitFromBoard = async (dto: any) => {
    if (recruitingLoading) return;
    setRecruitingLoading(true);

    try {
      const profile = await RecruitService.FBARemovePlayerFromBoard(dto);
      if (profile) {
        setRecruitProfiles((profiles) =>
          [...profiles].filter((p) => p.RecruitID != dto.RecruitID),
        );
        enqueueSnackbar("Recruit removed from board!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      }
    } finally {
      setRecruitingLoading(false);
    }
  };

  const toggleScholarship = async (dto: any) => {
    if (recruitingLoading) return;
    setRecruitingLoading(true);

    try {
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
              : p,
          ),
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
    } finally {
      setRecruitingLoading(false);
    }
  };

  const updatePointsOnRecruit = (id: number, name: string, points: number) => {
    setRecruitProfiles((prevProfiles) => {
      // Update the profiles and get the new profiles array.
      const updatedProfiles = prevProfiles.map((profile) =>
        profile.ID === id && profile.ID > 0
          ? new RecruitPlayerProfile({ ...profile, [name]: points })
          : profile,
      );

      // Calculate the total points from the updated profiles.
      const totalPoints = updatedProfiles.reduce(
        (sum, profile) => sum + (profile.CurrentWeeksPoints || 0),
        0,
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
    if (recruitingLoading) return;
    setRecruitingLoading(true);

    try {
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
    } finally {
      setRecruitingLoading(false);
    }
  }, [teamProfileMap, recruitProfiles, cfbTeam, recruitingLoading]);

  const SaveAIRecruitingSettings = useCallback(
    async (dto: UpdateRecruitingBoardDTO) => {
      if (recruitingLoading) return;
      setRecruitingLoading(true);

      try {
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
      } finally {
        setRecruitingLoading(false);
      }
    },
    [cfbTeamMap, recruitingLoading],
  );

  const ExportCFBRecruits = useCallback(async () => {
    await RecruitService.ExportCFBCroots();
  }, []);

  const SearchFootballStats = useCallback(async (dto: any) => {
    if (dto.League === SimCFB) {
      const res = await StatsService.FBACollegeStatsSearch(dto);
      if (dto.ViewType === SEASON_VIEW) {
        setCfbPlayerSeasonStats((prev) => {
          return { ...prev, [dto.SeasonID]: res.CFBPlayerSeasonStats };
        });
        setCfbTeamSeasonStats((prev) => {
          return {
            ...prev,
            [dto.SeasonID]: res.CFBTeamSeasonStats,
          };
        });
      } else {
        setCfbPlayerGameStatsMap((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.CFBPlayerGameStats,
          };
        });
        setCfbTeamGameStats((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.CFBTeamGameStats,
          };
        });
      }
    } else {
      const res = await StatsService.FBAProStatsSearch(dto);
      if (dto.ViewType === SEASON_VIEW) {
        setNflPlayerSeasonStats((prev) => {
          return {
            ...prev,
            [dto.SeasonID]: res.NFLPlayerSeasonStats,
          };
        });
        setNflTeamSeasonStats((prev) => {
          return {
            ...prev,
            [dto.SeasonID]: res.NFLTeamSeasonStats,
          };
        });
      } else {
        setNflPlayerGameStats((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.NFLPlayerGameStats,
          };
        });
        setNflTeamGameStats((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.NFLTeamGameStats,
          };
        });
      }
    }
  }, []);

  const ExportFootballStats = useCallback(async (dto: any) => {
    if (dto.League === SimCFB) {
      const res = await StatsService.FBACollegeStatsExport(dto);
    } else {
      const res = await StatsService.FBAProStatsExport(dto);
    }
  }, []);

  const SaveFreeAgencyOffer = useCallback(
    async (dto: FreeAgencyOfferDTO) => {
      if (freeAgencyLoading) return;
      setFreeAgencyLoading(true);

      try {
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
      } finally {
        setFreeAgencyLoading(false);
      }
    },
    [freeAgencyLoading],
  );

  const CancelFreeAgencyOffer = useCallback(
    async (dto: FreeAgencyOfferDTO) => {
      if (freeAgencyLoading) return;
      setFreeAgencyLoading(true);

      try {
        const res = await FreeAgencyService.FBACancelFreeAgencyOffer(dto);
        if (res) {
          enqueueSnackbar("Free Agency Offer Cancelled!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setFreeAgentOffers((prevOffers) => {
            const offers = [...prevOffers].filter(
              (offer) => offer.ID !== dto.ID,
            );
            return offers;
          });
        }
      } finally {
        setFreeAgencyLoading(false);
      }
    },
    [freeAgencyLoading],
  );

  const SaveWaiverWireOffer = useCallback(
    async (dto: NFLWaiverOffDTO) => {
      if (freeAgencyLoading) return;
      setFreeAgencyLoading(true);

      try {
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
      } finally {
        setFreeAgencyLoading(false);
      }
    },
    [freeAgencyLoading],
  );

  const CancelWaiverWireOffer = useCallback(
    async (dto: NFLWaiverOffDTO) => {
      if (freeAgencyLoading) return;
      setFreeAgencyLoading(true);

      try {
        const res = await FreeAgencyService.FBACancelWaiverWireOffer(dto);
        if (res) {
          enqueueSnackbar("Waiver Offer Cancelled!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setWaiverOffers((prevOffers) => {
            const offers = [...prevOffers].filter(
              (offer) => offer.ID !== res.ID,
            );
            return offers;
          });
        }
      } finally {
        setFreeAgencyLoading(false);
      }
    },
    [freeAgencyLoading],
  );

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
    [cfbTeams],
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
    [nflTeams],
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
          },
        );
      }
      setCFBTeams(teams);
    },
    [cfbTeams],
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
          },
        );
      }
      setNFLTeams(teams);
    },
    [nflTeams],
  );

  const proposeTrade = useCallback(
    async (dto: any) => {
      // Transform NFLTradeProposal to NFLTradeProposalDTO
      const transformedDTO = {
        ID: dto.ID,
        NFLTeamID: dto.TeamID,
        NFLTeam: proTeamMap![dto.TeamID].TeamName,
        RecepientTeamID: dto.RecepientTeamID,
        RecepientTeam: proTeamMap![dto.RecepientTeamID].TeamName,
        IsTradeAccepted: dto.IsTradeAccepted,
        IsTradeRejected: dto.IsTradeRejected,
        NFLTeamTradeOptions:
          dto.TeamTradeOptions?.map((option: any) => ({
            ID: option.ID,
            TradeProposalID: option.TradeProposalID,
            NFLTeamID: option.TeamID,
            NFLPlayerID: option.PlayerID,
            NFLDraftPickID: option.DraftPickID,
            OptionType: option.OptionType,
            SalaryPercentage: option.SalaryPercentage,
            Player: proPlayerMap[option.PlayerID] || null,
            Draftpick: individualDraftPickMap[option.DraftPickID] || null,
          })) || [],
        RecepientTeamTradeOptions:
          dto.RecepientTeamTradeOptions?.map((option: any) => ({
            ID: option.ID,
            TradeProposalID: option.TradeProposalID,
            NFLTeamID: option.TeamID,
            NFLPlayerID: option.PlayerID,
            NFLDraftPickID: option.DraftPickID,
            OptionType: option.OptionType,
            SalaryPercentage: option.SalaryPercentage,
            Player: proPlayerMap[option.PlayerID] || null,
            Draftpick: individualDraftPickMap[option.DraftPickID] || null,
          })) || [],
      };

      const thisDTO = new NFLTradeProposalDTO({ ...transformedDTO });
      const res = await TradeService.FBACreateTradeProposal(thisDTO);
      enqueueSnackbar(
        `Sent trade proposal to ${proTeamMap![dto.RecepientTeamID].TeamName}!`,
        {
          variant: "success",
          autoHideDuration: 3000,
        },
      );
      setTradeProposalsMap((tp) => {
        const team = tp[dto.NFLTeamID];
        if (!team) return tp;
        return {
          ...tp,
          [dto.NFLTeamID]: [...tp[dto.NFLTeamID], dto],
        };
      });
    },
    [proPlayerMap, individualDraftPickMap, proTeamMap],
  );

  const acceptTrade = useCallback(async (dto: NFLTradeProposal) => {
    const res = await TradeService.FBAAcceptTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NFLTeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NFLTeamID]: [...tp[dto.NFLTeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const rejectTrade = useCallback(async (dto: NFLTradeProposal) => {
    const res = await TradeService.FBARejectTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NFLTeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NFLTeamID]: [...tp[dto.NFLTeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const cancelTrade = useCallback(async (dto: NFLTradeProposal) => {
    const res = await TradeService.FBACancelTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NFLTeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NFLTeamID]: [...tp[dto.NFLTeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const syncAcceptedTrade = useCallback(async (dto: NFLTradeProposal) => {
    const res = await TradeService.FBAConfirmAcceptedTrade(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NFLTeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NFLTeamID]: [...tp[dto.NFLTeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const vetoTrade = useCallback(async (dto: NFLTradeProposal) => {
    const res = await TradeService.FBAVetoAcceptedTrade(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NFLTeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NFLTeamID]: [...tp[dto.NFLTeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const submitCollegePoll = useCallback(async (dto: any) => {
    const res = await CollegePollService.FBASubmitPoll(dto);
    if (res) {
      setCollegePollSubmission(res);
      enqueueSnackbar(`College Poll Submitted!`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    }
  }, []);

  const ExportFootballSchedule = useCallback(async (dto: any) => {
    const scheduleService = new FBAScheduleService();
    const res = await scheduleService.FBATimeslotExport(dto);
  }, []);

  const ExportPlayByPlay = useCallback(async (dto: any) => {
    const scheduleService = new FBAScheduleService();
    if (dto.League === SimCFB) {
      const res = await scheduleService.FBAExportCFBPlayByPlay(dto);
    } else {
      const res = await scheduleService.FBAExportNFLPlayByPlay(dto);
    }
  }, []);

  const toggleNotificationAsRead = useCallback(
    async (notificationID: number, isPro: boolean) => {
      const res =
        await notificationService.ToggleSimFBANotification(notificationID);
      if (!isPro) {
        setCollegeNotifications((prevNotifications) => {
          return prevNotifications.map((notification) =>
            notification.ID === notificationID
              ? new Notification({
                  ...notification,
                  IsRead: !notification.IsRead,
                })
              : notification,
          );
        });
      } else {
        setProNotifications((prevNotifications) => {
          return prevNotifications.map((notification) =>
            notification.ID === notificationID
              ? new Notification({
                  ...notification,
                  IsRead: !notification.IsRead,
                })
              : notification,
          );
        });
      }
    },
    [setCollegeNotifications, setProNotifications],
  );

  const deleteNotification = useCallback(
    async (notificationID: number, isPro: boolean) => {
      const res =
        await notificationService.DeleteSimFBANotification(notificationID);
      if (!isPro) {
        setCollegeNotifications((prevNotifications) => {
          return prevNotifications.filter(
            (notification) => notification.ID !== notificationID,
          );
        });
      } else {
        setProNotifications((prevNotifications) => {
          return prevNotifications.filter(
            (notification) => notification.ID !== notificationID,
          );
        });
      }
    },
    [setCollegeNotifications, setProNotifications],
  );

  const SaveExtensionOffer = useCallback(
    async (dto: NFLExtensionOffer) => {
      if (freeAgencyLoading) return; // Prevent double clicks

      setFreeAgencyLoading(true);
      try {
        const res = await FreeAgencyService.FBASaveExtensionOffer(dto);
        if (res) {
          enqueueSnackbar("Extension Offer Created!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setProExtensionMap((prevOffers) => {
            const offers = { ...prevOffers };
            offers[res.NFLPlayerID] = new NFLExtensionOffer({ ...res });
            return offers;
          });
        }
      } finally {
        setFreeAgencyLoading(false);
      }
    },
    [freeAgencyLoading],
  );

  const CancelExtensionOffer = useCallback(
    async (dto: NFLExtensionOffer) => {
      if (freeAgencyLoading) return; // Prevent double clicks

      setFreeAgencyLoading(true);
      try {
        const res = await FreeAgencyService.FBACancelExtensionOffer(dto);
        if (res) {
          enqueueSnackbar("Extension Offer Cancelled!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setProExtensionMap((prevOffers) => {
            const offers = { ...prevOffers };
            delete offers[dto.NFLPlayerID];
            return offers;
          });
        }
      } finally {
        setFreeAgencyLoading(false);
      }
    },
    [freeAgencyLoading],
  );

  const addTransferPlayerToBoard = useCallback(
    async (dto: any) => {
      if (transferPortalLoading) return; // Prevent double clicks

      setTransferPortalLoading(true);
      try {
        const apiDTO = {
          ...dto,
          TeamAbbreviation: cfbTeam?.TeamAbbr,
          Recruiter: cfbTeam?.Coach,
          SeasonID: cfb_Timestamp?.CollegeSeasonID,
          ProfileID: cfbTeam?.ID,
        };
        enqueueSnackbar("Adding transfer player...", {
          variant: "info",
          autoHideDuration: 1000,
        });
        const profile =
          await TransferPortalService.FBACreateTransferPortalProfile(apiDTO);
        if (profile) {
          const newProfile = new TransferPortalProfile({
            ...profile,
            ID: GenerateNumberFromRange(500000, 1000000),
          });
          setTransferPortalProfiles((profiles) => [...profiles, newProfile]);
        }
      } finally {
        setTransferPortalLoading(false);
      }
    },
    [transferPortalProfiles, transferPortalLoading],
  );

  const removeTransferPlayerFromBoard = useCallback(
    async (dto: any) => {
      if (transferPortalLoading) return; // Prevent double clicks

      setTransferPortalLoading(true);
      try {
        enqueueSnackbar("Removing transfer player from board...", {
          variant: "info",
          autoHideDuration: 1000,
        });
        const profile =
          await TransferPortalService.FBARemoveProfileFromBoard(dto);
        enqueueSnackbar("Player removed from board!", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setTransferPortalProfiles((profiles) =>
          [...profiles].filter((p) => p.CollegePlayerID != dto.CollegePlayerID),
        );
      } finally {
        setTransferPortalLoading(false);
      }
    },
    [transferPortalProfiles, transferPortalLoading],
  );

  const saveTransferPortalBoard = useCallback(async () => {
    if (transferPortalLoading) return; // Prevent double clicks

    setTransferPortalLoading(true);
    try {
      const dto = {
        Profile: teamProfileMap![cfbTeam!.ID],
        Players: teamTransferPortalProfiles,
        TeamID: cfbTeam!.ID,
      };
      enqueueSnackbar("Saving...", {
        variant: "info",
        autoHideDuration: 1000,
      });
      await TransferPortalService.FBASaveTransferPortalBoard(dto);
      enqueueSnackbar("Transfer Portal Board Saved!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } finally {
      setTransferPortalLoading(false);
    }
  }, [teamProfileMap, transferPortalProfiles, cfbTeam, transferPortalLoading]);

  const promisePlayer = useCallback(
    async (dto: any) => {
      if (transferPortalLoading) return; // Prevent double clicks

      setTransferPortalLoading(true);
      try {
        const res = await TransferPortalService.FBACreatePromise(dto);
        if (res) {
          setCollegePromises((promises) => [...promises, dto]);
          enqueueSnackbar("Promise Created!", {
            variant: "success",
            autoHideDuration: 3000,
          });
        }
      } finally {
        setTransferPortalLoading(false);
      }
    },
    [collegePromises, transferPortalLoading],
  );

  const cancelPromise = useCallback(
    async (dto: any) => {
      if (transferPortalLoading) return; // Prevent double clicks

      setTransferPortalLoading(true);
      try {
        await TransferPortalService.FBACancelPromise(dto);

        setCollegePromises((promises) =>
          [...promises].filter(
            (x) => x.CollegePlayerID !== dto.CollegePlayerID,
          ),
        );
        enqueueSnackbar("Promise Cancelled!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } finally {
        setTransferPortalLoading(false);
      }
    },
    [collegePromises, transferPortalLoading],
  );

  const scoutPortalAttribute = async (dto: any) => {
    // const profile = await RecruitService.FBAScoutPortalAttribute(dto);
    const profile = true;
    if (profile) {
      setTransferPortalProfiles((profiles) =>
        [...profiles].map((p) =>
          p.CollegePlayerID === dto.RecruitID
            ? new TransferPortalProfile({
                ...p,
                [dto.Attribute]: true,
              })
            : p,
        ),
      );
      // setTeamProfileMap((prev) => {
      //   const currentProfile = prev![profile.ProfileID];
      //   if (!currentProfile) return prev;
      //   return {
      //     ...prev,
      //     [profile.ProfileID]: new RecruitingTeamProfile({
      //       ...currentProfile,
      //       WeeklyScoutingPoints: currentProfile.WeeklyScoutingPoints - 1,
      //     }),
      //   };
      // });
    }
  };

  const updatePointsOnPortalPlayer = (
    id: number,
    name: string,
    points: number,
  ) => {
    const profileIdx = transferPortalProfiles.findIndex((x) => x.ID === id);
    if (profileIdx === -1) return;
    // Profile Exists and there are already points allocated, return. Users cannot update the amount of points lower than what's already allocated.
    const existingProfile = transferPortalProfiles[profileIdx];
    if (
      existingProfile.TotalPoints > 0 &&
      existingProfile.PreviouslySpentPoints > points
    ) {
      return;
    }
    let pointsValue = points;
    if (points > 10) {
      pointsValue = 10;
    } else if (points < 0) {
      pointsValue = 0;
    } else if (
      points < existingProfile.CurrentWeeksPoints &&
      existingProfile.TotalPoints > 0
    ) {
      pointsValue = existingProfile.CurrentWeeksPoints;
    }

    setTransferPortalProfiles((prevProfiles) => {
      // Update the profiles and get the new profiles array.
      const updatedProfiles = prevProfiles.map((profile) =>
        profile.ID === id && profile.ID > 0
          ? new TransferPortalProfile({ ...profile, [name]: pointsValue })
          : profile,
      );

      // Calculate the total points from the updated profiles.
      const totalPoints = updatedProfiles.reduce(
        (sum, profile) => sum + (profile.CurrentWeeksPoints || 0),
        0,
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

  const exportTransferPortalPlayers = useCallback(async () => {
    const res = await TransferPortalService.ExportCFBPortal();
  }, []);

  return (
    <SimFBAContext.Provider
      value={{
        cfb_Timestamp,
        cfbPostSeasonAwards,
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
        collegePromises,
        teamProfileMap,
        portalPlayers,
        historicCollegePlayers,
        nflRetiredPlayers,
        collegeInjuryReport,
        currentCollegeSeasonGames,
        collegeTeamsGames,
        cfbDepthChartMap,
        collegeNews,
        allCollegeGames,
        collegeNotifications,
        nflTeam,
        nflTeams,
        proTeamMap,
        nflTeamOptions,
        nflConferenceOptions,
        nflDepthChartMap,
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
        proTeamsGames,
        proNotifications,
        isLoading,
        topCFBPassers,
        topCFBRushers,
        topCFBReceivers,
        topNFLPassers,
        topNFLRushers,
        topNFLReceivers,
        cfbPlayerMap,
        nflPlayerMap,
        collegePolls,
        collegePollSubmission,
        collegePollsMapBySeason,
        nflDraftPicks,
        individualDraftPickMap,
        nflDraftPickMap,
        tradeProposalsMap,
        tradePreferencesMap,
        submitCollegePoll,
        proposeTrade,
        acceptTrade,
        rejectTrade,
        cancelTrade,
        syncAcceptedTrade,
        vetoTrade,
        getBootstrapRosterData,
        getBootstrapRecruitingData,
        getBootstrapFreeAgencyData,
        getBootstrapScheduleData,
        getBootstrapDraftData,
        getBootstrapPortalData,
        getBootstrapGameplanData,
        getBootstrapNewsData,
        getBootstrapStatsData,
        cutCFBPlayer,
        redshirtPlayer,
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
        SaveExtensionOffer,
        CancelExtensionOffer,
        ExportFootballSchedule,
        ExportPlayByPlay,
        playerFaces,
        proContractMap,
        proExtensionMap,
        allCFBTeamHistory,
        cfbPlayerGameStatsMap,
        cfbPlayerSeasonStatsMap,
        cfbTeamGameStatsMap,
        cfbTeamSeasonStatsMap,
        nflPlayerGameStatsMap,
        nflPlayerSeasonStatsMap,
        nflTeamGameStatsMap,
        nflTeamSeasonStatsMap,
        SearchFootballStats,
        ExportFootballStats,
        proPlayerMap,
        freeAgents,
        waiverPlayers,
        collegeGameplan,
        nflGameplan,
        collegeDepthChart,
        nflDepthChart,
        nflDraftees,
        collegeGameplanMap,
        nflGameplanMap,
        nflWarRoomMap,
        nflScoutingProfileMap,
        collegePromiseMap,
        transferProfileMapByPlayerID,
        teamTransferPortalProfiles,
        transferPortalProfiles,
        portalPlayerMap,
        toggleNotificationAsRead,
        deleteNotification,
        addTransferPlayerToBoard,
        removeTransferPlayerFromBoard,
        saveTransferPortalBoard,
        promisePlayer,
        cancelPromise,
        scoutPortalAttribute,
        updatePointsOnPortalPlayer,
        exportTransferPortalPlayers,
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
