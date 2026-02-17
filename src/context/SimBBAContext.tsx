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
  NBACapsheet,
  Gameplan,
  NBAGameplan,
  TransferPlayerResponse,
  FaceDataResponse,
  NBAContract,
  NBAExtensionOffer,
  NBAContractOffer,
  NBAWaiverOffer,
  NBARequest,
  UpdateRecruitingBoardDto,
  NBAWaiverOfferDTO,
  NBAContractOfferDTO,
  PlayerRecruitProfile,
  CrootProfile,
  NBATradeProposal,
  CollegePollOfficial,
  CollegePollSubmission,
  NBADraftee,
  NBATradePreferences,
  DraftPick,
  NBATradeProposalDTO,
  NBATeamProposals,
  CollegePromise,
  ScoutingProfile,
  NBAWarRoom,
  TransferPortalProfile,
} from "../models/basketballModels";
import { useWebSockets } from "../_hooks/useWebsockets";
import { BootstrapService } from "../_services/bootstrapService";
import { bba_ws } from "../_constants/urls";
import { SimBBA, SimCBB } from "../_constants/constants";
import { StatsService } from "../_services/statsService";
import { enqueueSnackbar } from "notistack";
import { FreeAgencyService } from "../_services/freeAgencyService";
import { RecruitService } from "../_services/recruitService";
import { GameplanService } from "../_services/gameplanService";
import { PlayerService } from "../_services/playerService";
import { TeamService } from "../_services/teamService";
import { TradeService } from "../_services/tradeService";
import { CollegePollService } from "../_services/collegePollService";
import FBAScheduleService from "../_services/scheduleService";
import { FaceDataService } from "../_services/faceDataService";
import { TransferPortalService } from "../_services/transferPortalService";
import { GenerateNumberFromRange } from "../_helper/utilHelper";
import { notificationService } from "../_services/notificationService";

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
  currentCBBStandings: CollegeStandings[];
  cbbStandingsMap: Record<number, CollegeStandings> | null;
  cbbRosterMap: Record<number, CollegePlayer[]> | null;
  recruits: Croot[];
  recruitProfiles: PlayerRecruitProfile[];
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
  freeAgentOffers: NBAContractOffer[];
  waiverOffers: NBAWaiverOffer[];
  gLeaguePlayers: NBAPlayer[];
  internationalPlayers: NBAPlayer[];
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
  updatePointsOnRecruit: (id: number, name: string, points: number) => void;
  removeUserfromCBBTeamCall: (teamID: number) => Promise<void>;
  removeUserfromNBATeamCall: (request: NBARequest) => Promise<void>;
  addUserToCBBTeam: (teamID: number, user: string) => void;
  addUserToNBATeam: (teamID: number, user: string, role: string) => void;
  cutCBBPlayer: (playerID: number, teamID: number) => Promise<void>;
  cutNBAPlayer: (playerID: number, teamID: number) => Promise<void>;
  redshirtPlayer: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer: (playerID: number, teamID: number) => Promise<void>;
  updateCBBRosterMap: (newMap: Record<number, CollegePlayer[]>) => void;
  updateNBARosterMap: (newMap: Record<number, NBAPlayer[]>) => void;
  saveCBBGameplan: (dto: any) => Promise<void>;
  saveNBAGameplan: (dto: any) => Promise<void>;
  addRecruitToBoard: (dto: any) => Promise<void>;
  toggleScholarship: (dto: any) => Promise<void>;
  removeRecruitFromBoard: (dto: any) => Promise<void>;
  SaveFreeAgencyOffer: (dto: any) => Promise<void>;
  CancelFreeAgencyOffer: (dto: any) => Promise<void>;
  SaveWaiverWireOffer: (dto: any) => Promise<void>;
  CancelWaiverWireOffer: (dto: any) => Promise<void>;
  SaveExtensionOffer: (dto: any) => Promise<void>;
  CancelExtensionOffer: (dto: any) => Promise<void>;
  SaveRecruitingBoard: () => Promise<void>;
  SaveAIRecruitingSettings: (dto: TeamRecruitingProfile) => Promise<void>;
  SearchBasketballStats: (dto: any) => Promise<void>;
  ExportBasketballStats: (dto: any) => Promise<void>;
  ExportCBBRecruits: () => Promise<void>;
  ExportPlayByPlay: (dto: any) => Promise<void>;
  submitCollegePoll: (dto: any) => Promise<void>;
  proposeTrade: (dto: NBATradeProposal) => Promise<void>;
  acceptTrade: (dto: NBATradeProposal) => Promise<void>;
  rejectTrade: (dto: NBATradeProposal) => Promise<void>;
  cancelTrade: (dto: NBATradeProposal) => Promise<void>;
  syncAcceptedTrade: (dto: NBATradeProposal) => Promise<void>;
  vetoTrade: (dto: NBATradeProposal) => Promise<void>;
  ExportBasketballSchedule: (dto: any) => Promise<void>;
  collegePolls: CollegePollOfficial[];
  collegePollSubmission: CollegePollSubmission;
  nbaDraftees: NBADraftee[];
  nbaTradeProposals: NBATeamProposals;
  nbaTradeProposalsMap: NBATeamProposals;
  tradeProposalsMap: Record<number, NBATradeProposal[]>;
  tradePreferencesMap: Record<number, NBATradePreferences>;
  nbaDraftPicks: DraftPick[];
  nbaDraftPickMap: Record<number, DraftPick[]>;
  individualDraftPickMap: Record<number, DraftPick>;
  proPlayerMap: Record<number, NBAPlayer>;
  freeAgents: NBAPlayer[];
  waiverPlayers: NBAPlayer[];
  collegePromises: CollegePromise[];
  collegeGameplanMap: Record<number, Gameplan | null>;
  nbaGameplanMap: Record<number, NBAGameplan | null>;
  nbaWarRoomMap: Record<number, NBAWarRoom | null>;
  nbaScoutingProfileMap: Record<number, ScoutingProfile | null>;
  transferPortalProfiles: TransferPortalProfile[];
  teamTransferPortalProfiles: TransferPortalProfile[];
  cbbPlayerMap: Record<number, CollegePlayer>;
  portalPlayerMap: Record<number, TransferPlayerResponse>;
  teamCollegePromises: CollegePromise[];
  collegePromiseMap: Record<number, CollegePromise>;
  transferProfileMapByPlayerID: Record<number, TransferPortalProfile[]>;
  getLandingBootstrapData: () => void;
  getBootstrapRosterData: () => void;
  getBootstrapRecruitingData: () => void;
  getBootstrapFreeAgencyData: () => void;
  getBootstrapScheduleData: () => void;
  getBootstrapDraftData: () => void;
  getBootstrapPortalData: () => void;
  getBootstrapGameplanData: () => void;
  getBootstrapNewsData: () => void;
  createPromise: (dto: any) => Promise<void>;
  cancelPromise: (dto: any) => Promise<void>;
  updatePointsOnPortalPlayer: (
    id: number,
    name: string,
    points: number,
  ) => void;
  addTransferPlayerToBoard: (dto: any) => Promise<void>;
  removeTransferPlayerFromBoard: (dto: any) => Promise<void>;
  saveTransferPortalBoard: () => Promise<void>;
  exportTransferPortalPlayers: () => Promise<void>;
  toggleNotificationAsRead: (
    notificationID: number,
    isPro: boolean,
  ) => Promise<void>;
  deleteNotification: (notificationID: number, isPro: boolean) => Promise<void>;
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
  recruitProfiles: [],
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
  proPlayerMap: {},
  freeAgentOffers: [],
  waiverOffers: [],
  gLeaguePlayers: [],
  internationalPlayers: [],
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
  removeUserfromCBBTeamCall: async () => {},
  removeUserfromNBATeamCall: async () => {},
  addUserToCBBTeam: () => {},
  addUserToNBATeam: () => {},
  cutCBBPlayer: async () => {},
  cutNBAPlayer: async () => {},
  redshirtPlayer: async () => {},
  promisePlayer: async () => {},
  updateCBBRosterMap: () => {},
  updateNBARosterMap: () => {},
  saveCBBGameplan: async () => {},
  saveNBAGameplan: async () => {},
  addRecruitToBoard: async () => {},
  removeRecruitFromBoard: async () => {},
  updatePointsOnRecruit: () => {},
  toggleScholarship: async () => {},
  SaveRecruitingBoard: async () => {},
  SaveAIRecruitingSettings: async () => {},
  SaveFreeAgencyOffer: async () => {},
  CancelFreeAgencyOffer: async () => {},
  SaveWaiverWireOffer: async () => {},
  CancelWaiverWireOffer: async () => {},
  SaveExtensionOffer: async () => {},
  CancelExtensionOffer: async () => {},
  SearchBasketballStats: async () => {},
  ExportBasketballStats: async () => {},
  ExportCBBRecruits: async () => {},
  submitCollegePoll: async () => {},
  proposeTrade: async () => {},
  acceptTrade: async () => {},
  rejectTrade: async () => {},
  cancelTrade: async () => {},
  syncAcceptedTrade: async () => {},
  vetoTrade: async () => {},
  ExportBasketballSchedule: async () => {},
  ExportPlayByPlay: async () => {},
  getBootstrapNewsData: async () => {},
  collegePolls: [],
  collegePollSubmission: {} as CollegePollSubmission,
  nbaDraftees: [],
  nbaTradeProposals: {} as NBATeamProposals,
  nbaTradeProposalsMap: {} as NBATeamProposals,
  tradeProposalsMap: {},
  tradePreferencesMap: {},
  nbaDraftPicks: [],
  nbaDraftPickMap: [],
  individualDraftPickMap: [],
  freeAgents: [],
  waiverPlayers: [],
  collegePromises: [],
  collegeGameplanMap: {},
  nbaGameplanMap: {},
  nbaWarRoomMap: {},
  nbaScoutingProfileMap: {},
  transferPortalProfiles: [],
  teamTransferPortalProfiles: [],
  cbbPlayerMap: {},
  portalPlayerMap: {},
  teamCollegePromises: [],
  collegePromiseMap: {},
  transferProfileMapByPlayerID: {},
  getLandingBootstrapData: async () => {},
  getBootstrapRosterData: async () => {},
  getBootstrapRecruitingData: async () => {},
  getBootstrapFreeAgencyData: async () => {},
  getBootstrapScheduleData: async () => {},
  getBootstrapDraftData: async () => {},
  getBootstrapPortalData: async () => {},
  getBootstrapGameplanData: async () => {},
  createPromise: async () => {},
  cancelPromise: async () => {},
  updatePointsOnPortalPlayer: () => {},
  addTransferPlayerToBoard: async () => {},
  removeTransferPlayerFromBoard: async () => {},
  saveTransferPortalBoard: async () => {},
  exportTransferPortalPlayers: async () => {},
  toggleNotificationAsRead: async () => {},
  deleteNotification: async () => {},
};

export const SimBBAContext = createContext<SimBBAContextProps>(defaultContext);

// ✅ Define Props for Provider
interface SimBBAProviderProps {
  children: ReactNode;
}

export const SimBBAProvider: React.FC<SimBBAProviderProps> = ({ children }) => {
  const { currentUser } = useAuthStore();
  const scheduleService = new FBAScheduleService();
  const { cbb_Timestamp, setCBB_Timestamp } = useWebSockets(bba_ws, SimBBA);
  const isFetching = useRef(false);
  const isScheduleDataFetching = useRef(false);
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
    [],
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
  const [recruitProfiles, setRecruitProfiles] = useState<
    PlayerRecruitProfile[]
  >([]);
  const [teamProfileMap, setTeamProfileMap] = useState<Record<
    number,
    TeamRecruitingProfile
  > | null>({});
  const [portalPlayers, setPortalPlayers] = useState<TransferPlayerResponse[]>(
    [],
  );
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
    {},
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
  const [freeAgentOffers, setFreeAgentOffers] = useState<NBAContractOffer[]>(
    [],
  );
  const [waiverOffers, setWaiverOffers] = useState<NBAWaiverOffer[]>([]);
  const [gLeaguePlayers, setGLeaguePlayers] = useState<NBAPlayer[]>([]);
  const [internationalPlayers, setInternationalPlayers] = useState<NBAPlayer[]>(
    [],
  );
  const [nbaDraftees, setNBADraftees] = useState<NBADraftee[]>([]);

  const [capsheetMap, setCapsheetMap] = useState<Record<
    number,
    NBACapsheet
  > | null>({});
  const [proInjuryReport, setProInjuryReport] = useState<NBAPlayer[]>([]);
  const [proNews, setProNews] = useState<NewsLog[]>([]);
  const [allProGames, setAllProGames] = useState<NBAMatch[]>([]);
  const [currentProSeasonGames, setCurrentProSeasonGames] = useState<
    NBAMatch[]
  >([]);
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
  const [proContractMap, setProContractMap] = useState<Record<
    number,
    NBAContract
  > | null>({});
  const [proExtensionMap, setProExtensionMap] = useState<Record<
    number,
    NBAExtensionOffer
  > | null>({});
  const [collegePolls, setCollegePolls] = useState<CollegePollOfficial[]>([]);
  const [collegePollSubmission, setCollegePollSubmission] =
    useState<CollegePollSubmission>({} as CollegePollSubmission);
  const [nbaTradeProposals, setNBATradeProposals] = useState<NBATeamProposals>(
    {} as NBATeamProposals,
  );
  const [tradeProposalsMap, setTradeProposalsMap] = useState<
    Record<number, NBATradeProposal[]>
  >({});
  const [nbaTradeProposalsMap, setNBATradeProposalsMap] =
    useState<NBATeamProposals>({} as NBATeamProposals);
  const [tradePreferencesMap, setTradePreferencesMap] = useState<
    Record<number, NBATradePreferences>
  >([]);
  const [nbaDraftPicks, setNBADraftPicks] = useState<DraftPick[]>([]);
  const [freeAgents, setFreeAgents] = useState<NBAPlayer[]>([]);
  const [waiverPlayers, setWaiverPlayers] = useState<NBAPlayer[]>([]);
  const [collegePromises, setCollegePromises] = useState<CollegePromise[]>([]);
  const [transferPortalProfiles, setTransferPortalProfiles] = useState<
    TransferPortalProfile[]
  >([]);
  const [collegeGameplanMap, setCollegeGameplanMap] = useState<
    Record<number, Gameplan | null>
  >({});
  const [nbaGameplanMap, setNBAGameplanMap] = useState<
    Record<number, NBAGameplan | null>
  >({});
  const [nbaWarRoomMap, setNBAWarRoomMap] = useState<
    Record<number, NBAWarRoom | null>
  >({});
  const [nbaScoutingProfileMap, setNBAScoutingProfileMap] = useState<
    Record<number, ScoutingProfile | null>
  >({});

  const nbaDraftPickMap = useMemo(() => {
    const pickMap: Record<number, DraftPick[]> = {};
    if (!nbaDraftPicks) return pickMap;
    for (let i = 0; i < nbaDraftPicks.length; i++) {
      const pick = nbaDraftPicks[i];
      if (!pickMap[pick.TeamID]) {
        pickMap[pick.TeamID] = [pick];
      } else {
        pickMap[pick.TeamID].push(pick);
      }
    }
    return pickMap;
  }, [nbaDraftPicks]);

  const individualDraftPickMap = useMemo(() => {
    const pickMap: Record<number, DraftPick> = {};
    if (!nbaDraftPicks) return pickMap;

    for (let i = 0; i < nbaDraftPicks.length; i++) {
      const pick = nbaDraftPicks[i];
      pickMap[pick.ID] = pick;
    }

    return pickMap;
  }, [nbaDraftPicks]);

  const teamTransferPortalProfiles = useMemo(() => {
    if (!cbbTeam) return [];
    return transferPortalProfiles.filter(
      (profile) => profile.ProfileID === cbbTeam.ID,
    );
  }, [cbbTeam, transferPortalProfiles]);

  const proPlayerMap = useMemo(() => {
    const playerMap: Record<number, NBAPlayer> = {};

    if (proRosterMap && nbaTeams) {
      for (let i = 0; i < nbaTeams.length; i++) {
        const team = nbaTeams[i];
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
  }, [proRosterMap, nbaTeams]);

  const cbbPlayerMap = useMemo(() => {
    const playerMap: Record<number, CollegePlayer> = {};
    if (cbbRosterMap && cbbTeams) {
      for (let i = 0; i < cbbTeams.length; i++) {
        const team = cbbTeams[i];
        const roster = cbbRosterMap[team.ID];
        if (roster) {
          for (let j = 0; j < roster.length; j++) {
            const p = roster[j];
            playerMap[p.ID] = p;
          }
        }
      }
    }
    return playerMap;
  }, [cbbRosterMap, cbbTeams, portalPlayers]);

  const portalPlayerMap = useMemo(() => {
    const playerMap: Record<number, TransferPlayerResponse> = {};
    if (portalPlayers) {
      for (let i = 0; i < portalPlayers.length; i++) {
        const p = portalPlayers[i];
        playerMap[p.ID] = p;
      }
    }
    return playerMap;
  }, [portalPlayers]);

  const teamCollegePromises = useMemo(() => {
    if (!cbbTeam || !collegePromises) return [];
    return collegePromises.filter((promise) => promise.TeamID === cbbTeam.ID);
  }, [cbbTeam, collegePromises]);

  const collegePromiseMap = useMemo(() => {
    const map: Record<number, CollegePromise> = {};
    for (let i = 0; i < teamCollegePromises.length; i++) {
      const promise = teamCollegePromises[i];
      map[promise.CollegePlayerID] = promise;
    }
    return map;
  }, [teamCollegePromises]);

  const transferProfileMapByPlayerID = useMemo(() => {
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

  useEffect(() => {
    getFaceData();
    getBootstrapTeamData();
  }, []);

  const getBootstrapTeamData = async () => {
    let cbbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    const res = await BootstrapService.GetBBABootstrapTeamData();
    setCBBTeams(res.AllCollegeTeams);
    const sortedProTeams = res.AllProTeams.sort(
      (a, b) => a.ConferenceID - b.ConferenceID,
    );
    setNBATeams(sortedProTeams);
    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.Team.localeCompare(b.Team),
      );
      const teamOptionsList = sortedCollegeTeams.map((team) => ({
        label: `${team.Team} | ${team.Abbr}`,
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
      setCBBTeamOptions(teamOptionsList);
      setCBBConferenceOptions(conferenceOptions);
      const collegeTeamMap = Object.fromEntries(
        sortedCollegeTeams.map((team) => [team.ID, team]),
      );
      setCBBTeamMap(collegeTeamMap);
    }
    if (res.AllProTeams.length > 0) {
      const sortedNBATeams = sortedProTeams.sort(
        (a, b) =>
          a.Team.localeCompare(b.Team) && a.ConferenceID - b.ConferenceID,
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
          ]),
        ).values(),
      ).sort((a, b) => a.label.localeCompare(b.label));
      setNBATeamOptions(nbaTeamOptions);
      setNBAConferenceOptions(nbaConferenceOptions);
      const nbaTeamMap = Object.fromEntries(
        sortedNBATeams.map((team) => [team.ID, team]),
      );
      setProTeamMap(nbaTeamMap);
    }
  };

  const getFaceData = async () => {
    const res = await FaceDataService.GetBBAFaceData();
    setPlayerFaces(res);
  };

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      isFetching.current = true;
      bootstrapAllData();
    }
  }, [currentUser]);

  const bootstrapAllData = async () => {
    await getLandingBootstrapData();
    isFetching.current = false;
  };

  const getBootstrapNewsData = useCallback(async () => {
    let cbbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    if (cbbID === 0 && nbaID === 0) {
      return;
    }
    const res = await BootstrapService.GetBBANewsBootstrapData(cbbID, nbaID);

    if (cbbID > 0) {
      setCollegeNews(res.CollegeNews as any);
    }

    if (nbaID > 0) {
      setProNews(res.ProNews as any);
    }
  }, [currentUser?.cbb_id, currentUser?.NBATeamID]);

  const getLandingBootstrapData = async () => {
    let cbbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    // if the user has no basketball teams, skip BBA bootstrapping
    if (cbbID === 0 && nbaID === 0) {
      isFetching.current = false;
      setIsLoading(false);
      return;
    }
    const res = await BootstrapService.GetBBABootstrapData(cbbID, nbaID);
    if (cbbID > 0) {
      setCBBTeam(res.CollegeTeam);
      setCollegeInjuryReport(res.CollegeInjuryReport);
      setCollegeNotifications(res.CollegeNotifications);
      setCBBRosterMap(res.CollegeRosterMap);
      setPortalPlayers(res.PortalPlayers);
      setTopCBBPoints(res.TopCBBPoints);
      setTopCBBAssists(res.TopCBBAssists);
      setTopCBBRebounds(res.TopCBBRebounds);
      setPortalPlayers(res.PortalPlayers);
      setAllCollegeGames(res.AllCollegeGames);
      setAllCBBStandings(res.CollegeStandings);
    }
    if (nbaID > 0) {
      setNBATeam(res.NBATeam);
      setProNotifications(res.ProNotifications);
      setTopNBAAssists(res.TopNBAAssists);
      setTopNBAPoints(res.TopNBAPoints);
      setTopNBARebounds(res.TopNBARebounds);
      setProRosterMap(res.ProRosterMap);
      setInternationalPlayers(res.InternationalPlayers);
      setGLeaguePlayers(res.GLeaguePlayers);
      setCapsheetMap(res.CapsheetMap);
      setProInjuryReport(res.ProInjuryReport);
      setAllProStandings(res.ProStandings);
      setAllProGames(res.AllProGames);
    }

    setIsLoading(false);
  };

  const getBootstrapRosterData = async () => {
    let cbbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    if (cbbID === 0 && nbaID === 0) {
      return;
    }
    const res = await BootstrapService.GetBBARosterBootstrapData(cbbID, nbaID);
    setNBATradeProposals(res.TradeProposals);
    setTradePreferencesMap(res.TradePreferencesMap);
    setProContractMap(res.ContractMap);
    setProExtensionMap(res.ExtensionMap);
    setNBADraftPicks(res.DraftPicks);
  };

  const getBootstrapRecruitingData = async () => {
    let cbbID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (cbbID === 0) {
      return;
    }
    console.log("Fetching recruiting bootstrap data...");
    const res = await BootstrapService.GetBBARecruitingBootstrapData(cbbID);
    setRecruits(res.Recruits);
    setTeamProfileMap(res.TeamProfileMap);
    setRecruitProfiles(res.RecruitProfiles);
  };

  const getBootstrapFreeAgencyData = async () => {
    let nbaID = 0;
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    if (nbaID === 0) {
      return;
    }
    const res = await BootstrapService.GetBBAFreeAgencyBootstrapData(nbaID);
    setFreeAgentOffers(res.FreeAgentOffers);
    setWaiverOffers(res.WaiverOffers);
    setFreeAgents(res.FreeAgents);
    setWaiverPlayers(res.WaiverPlayers);
  };

  const getBootstrapScheduleData = useCallback(async () => {
    if (isScheduleDataFetching.current) {
      console.log("Schedule data already fetching, skipping...");
      return;
    }

    let cbbID = 0;
    const seasonId = cbb_Timestamp?.SeasonID || 0;
    const username = currentUser?.username || "";
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (cbbID === 0 || seasonId === 0 || username === "") {
      return;
    }

    isScheduleDataFetching.current = true;
    console.log("Starting bootstrap schedule data fetch...");

    try {
      const res = await BootstrapService.GetBBASchedulingBootstrapData(
        username,
        cbbID,
        seasonId,
      );
      setCollegePolls(res.CollegePolls);
      setCollegePollSubmission(res.PollSubmission);
    } finally {
      isScheduleDataFetching.current = false;
    }
  }, [cbb_Timestamp?.SeasonID, currentUser?.username, currentUser?.teamId]);

  // Use this once the draft page is finished
  const getBootstrapDraftData = async () => {
    let nbaID = 0;
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    if (nbaID === 0) {
      return;
    }
    const res = await BootstrapService.GetBBADraftBootstrapData(nbaID);
    setNBADraftees(res.NBADraftees);
    setNBAWarRoomMap(res.WarRoomMap);
    setNBAScoutingProfileMap(res.ScoutingProfileMap);
  };

  // use this once the portal page is finished
  const getBootstrapPortalData = async () => {
    let cbbID = 0;
    if (currentUser && currentUser.cbb_id) {
      cbbID = currentUser.cbb_id;
    }
    if (cbbID === 0) {
      return;
    }
    const res = await BootstrapService.GetBBAPortalBootstrapData(cbbID);
    setTransferPortalProfiles(res.TransferPortalProfiles);
    setTeamProfileMap(res.TeamProfileMap);
    setCollegePromises(res.CollegePromises);
  };

  const getBootstrapGameplanData = async () => {
    let cfbID = 0;
    let nbaID = 0;
    if (currentUser && currentUser.teamId) {
      cfbID = currentUser.teamId;
    }
    if (currentUser && currentUser.NBATeamID) {
      nbaID = currentUser.NBATeamID;
    }
    if (cfbID === 0 && nbaID === 0) {
      return;
    }
    const res = await BootstrapService.GetBBAGameplanBootstrapData(
      cfbID,
      nbaID,
    );
    setCollegeGameplanMap(res.CollegeGameplanMap);
    setNBAGameplanMap(res.ProGameplanMap);
  };

  const removeUserfromCBBTeamCall = useCallback(
    async (teamID: number) => {
      const res = await TeamService.RemoveUserFromCBBTeam(teamID);
      const CBBTeamsList = [...cbbTeams];
      const teamIDX = CBBTeamsList.findIndex((x) => x.ID === teamID);
      if (teamIDX > -1) {
        CBBTeamsList[teamIDX].Coach = "";
        CBBTeamsList[teamIDX].IsUserCoached = false;
      }
      setCBBTeams(CBBTeamsList);
    },
    [cbbTeams],
  );

  const removeUserfromNBATeamCall = useCallback(
    async (request: NBARequest) => {
      const res = await TeamService.RemoveUserFromNBATeam(
        request.NBATeamID,
        request,
      );
      const NBATeamsList = [...nbaTeams];
      const teamIDX = NBATeamsList.findIndex((x) => x.ID === request.NBATeamID);
      if (request.IsOwner) {
        NBATeamsList[teamIDX].NBAOwnerName = "";
      } else if (request.IsCoach) {
        NBATeamsList[teamIDX].NBACoachName = "";
      } else if (request.IsManager) {
        NBATeamsList[teamIDX].NBAGMName = "";
      } else if (request.IsAssistant) {
        NBATeamsList[teamIDX].NBAAssistantName = "";
      }
      setNBATeams(NBATeamsList);
    },
    [nbaTeams],
  );

  const addUserToCBBTeam = useCallback(
    (teamID: number, user: string) => {
      const teams = [...cbbTeams];
      const teamIDX = teams.findIndex((team) => team.ID === teamID);
      if (teamID > -1) {
        teams[teamIDX].Coach = user;
        enqueueSnackbar(
          `${user} has been added as the Head Coach for ${teams[teamIDX].Team} Organization`,
          {
            variant: "success",
            autoHideDuration: 3000,
          },
        );
      }
      setCBBTeams(teams);
    },
    [cbbTeams],
  );

  const addUserToNBATeam = useCallback(
    (teamID: number, user: string, role: string) => {
      const teams = [...nbaTeams];
      const teamIDX = teams.findIndex((team) => team.ID === teamID);
      if (teamID > -1) {
        if (role === "Owner") {
          teams[teamIDX].NBAOwnerName = user;
        } else if (role === "Coach") {
          teams[teamIDX].NBACoachName = user;
        } else if (role === "GM") {
          teams[teamIDX].NBAGMName = user;
        } else if (role === "Assistant") {
          teams[teamIDX].NBAAssistantName = user;
        }
        enqueueSnackbar(
          `${user} has been added as a ${role} to the ${teams[teamIDX].Nickname} Organization`,
          {
            variant: "success",
            autoHideDuration: 3000,
          },
        );
      }
      setNBATeams(teams);
    },
    [nbaTeams],
  );

  const cutCBBPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.CutCBBPlayer(playerID);
      const rosterMap = { ...cbbRosterMap };
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID,
      );
      setCBBRosterMap(rosterMap);
    },
    [cbbRosterMap],
  );
  const redshirtPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.RedshirtCBBPlayer(playerID);
      const rosterMap = { ...cbbRosterMap };
      const playerIDX = rosterMap[teamID].findIndex(
        (player) => player.ID === playerID,
      );
      if (playerIDX > -1) {
        rosterMap[teamID][playerIDX].IsRedshirting = true;
        setCBBRosterMap(rosterMap);
      }
    },
    [cbbRosterMap],
  );
  const promisePlayer = useCallback(
    async (playerID: number, teamID: number) => {},
    [cbbRosterMap],
  );
  const cutNBAPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.CutNBAPlayer(playerID);
      const rosterMap = { ...proRosterMap };
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID,
      );
      setProRosterMap(rosterMap);
    },
    [proRosterMap],
  );

  const updateCBBRosterMap = (newMap: Record<number, CollegePlayer[]>) => {
    setCBBRosterMap(newMap);
  };

  const updateNBARosterMap = (newMap: Record<number, NBAPlayer[]>) => {
    setProRosterMap(newMap);
  };

  const saveCBBGameplan = async (dto: any) => {
    const res = await GameplanService.SaveCBBGameplan(dto);
  };

  const saveNBAGameplan = async (dto: any) => {
    const res = await GameplanService.SaveNBAGameplan(dto);
    enqueueSnackbar("Lineups saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const addRecruitToBoard = async (dto: any) => {
    const apiDTO = {
      ...dto,
      SeasonID: cbb_Timestamp?.SeasonID,
      Team: cbbTeam?.Team,
      Recruiter: cbbTeam?.Coach,
      ProfileID: cbbTeam?.ID,
    };
    const profile = await RecruitService.BBACreateRecruitProfile(apiDTO);
    if (profile) {
      setRecruitProfiles((profiles) => {
        const profileIDX = profiles.findIndex(
          (x) => x.RecruitID === apiDTO.RecruitID,
        );
        if (profileIDX < 0) {
          return [...profiles, profile];
        }
        const newProfiles = [...profiles];
        newProfiles[profileIDX] = { ...profile } as PlayerRecruitProfile;
        return newProfiles;
      });
    }
  };

  const removeRecruitFromBoard = async (dto: any) => {
    const profile = await RecruitService.BBARemoveCrootFromBoard(dto);
    if (profile) {
      setRecruitProfiles((profiles) =>
        [...profiles].filter((p) => p.RecruitID != dto.RecruitID),
      );
    }
  };

  const toggleScholarship = async (dto: any) => {
    const profile = await RecruitService.BBAToggleScholarship(dto);
    if (profile) {
      setRecruitProfiles((profiles) =>
        [...profiles].map((p) =>
          p.RecruitID === profile.RecruitID
            ? new PlayerRecruitProfile({
                ...profile,
                Scholarship: profile.Scholarship,
                ScholarshipRevoked: profile.ScholarshipRevoked,
              })
            : p,
        ),
      );
      setTeamProfileMap((prev) => {
        const currentProfile = prev!![profile.ProfileID];
        if (!currentProfile) return prev;

        const adjustment = profile.Scholarship
          ? -1
          : profile.ScholarshipRevoked
            ? 1
            : 0;
        return {
          ...prev,
          [profile.ProfileID]: new TeamRecruitingProfile({
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
        profile.ID === id
          ? new PlayerRecruitProfile({ ...profile, [name]: points })
          : profile,
      );

      // Calculate the total points from the updated profiles.
      const totalPoints = updatedProfiles.reduce(
        (sum, profile) => sum + (profile.CurrentWeeksPoints || 0),
        0,
      );

      // Update the recruiting team profile based on the updated points.
      setTeamProfileMap((prevTeamProfiles) => {
        const currentProfile = prevTeamProfiles!![cbbTeam!.ID];
        if (!currentProfile) return prevTeamProfiles;
        return {
          ...prevTeamProfiles,
          [cbbTeam!.ID]: new TeamRecruitingProfile({
            ...currentProfile,
            SpentPoints: totalPoints,
          }),
        };
      });

      return updatedProfiles;
    });
  };

  const SaveRecruitingBoard = useCallback(async () => {
    const crootProfiles = recruitProfiles.map((profile) => {
      return new CrootProfile({
        ID: profile.ID,
        RecruitID: profile.RecruitID,
        ProfileID: profile.ProfileID,
        CurrentWeeksPoints: profile.CurrentWeeksPoints,
      });
    });
    const dto = {
      Profile: teamProfileMap!![cbbTeam!.ID],
      Recruits: crootProfiles,
      TeamID: cbbTeam!.ID,
    };
    await RecruitService.BBASaveRecruitingBoard(dto);
    enqueueSnackbar(`Recruiting Board Saved for ${cbbTeam?.Team}!`, {
      variant: "success",
      autoHideDuration: 3000,
    });
  }, [teamProfileMap, recruitProfiles, cbbTeam]);

  const SaveAIRecruitingSettings = useCallback(
    async (dto: TeamRecruitingProfile) => {
      const res = await RecruitService.BBASaveAISettings(dto);
      if (res) {
        enqueueSnackbar("AI Recruiting Settings Saved!", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setTeamProfileMap((prevTeamProfiles) => {
          let currentProfile = prevTeamProfiles!![cbbTeam!.ID];
          if (!currentProfile) return prevTeamProfiles;
          return {
            ...prevTeamProfiles,
            [cbbTeam!.ID]: new TeamRecruitingProfile({
              ...currentProfile,
              ...dto.Profile,
            }),
          };
        });
      }
    },
    [cbbTeamMap],
  );

  const SaveFreeAgencyOffer = useCallback(async (dto: NBAContractOfferDTO) => {
    const res = await FreeAgencyService.BBASaveFreeAgencyOffer(dto);
    if (res) {
      enqueueSnackbar("Free Agency Offer Created!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setFreeAgentOffers((prevOffers) => {
        const offers = [...prevOffers];
        const index = offers.findIndex((offer) => offer.ID === res.ID);
        if (index > -1) {
          offers[index] = new NBAContractOffer({ ...res });
        } else {
          offers.push(res);
        }
        return offers;
      });
    }
  }, []);

  const CancelFreeAgencyOffer = useCallback(
    async (dto: NBAContractOfferDTO) => {
      const res = await FreeAgencyService.BBACancelFreeAgencyOffer(dto);
      if (res) {
        enqueueSnackbar("Free Agency Offer Cancelled!", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setFreeAgentOffers((prevOffers) => {
          const offers = [...prevOffers].filter((offer) => offer.ID !== res.ID);
          return offers;
        });
      }
    },
    [],
  );

  const SaveWaiverWireOffer = useCallback(async (dto: NBAWaiverOfferDTO) => {
    const res = await FreeAgencyService.BBASaveWaiverWireOffer(dto);
    if (res) {
      enqueueSnackbar("Waiver Offer Created!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setWaiverOffers((prevOffers) => {
        const offers = [...prevOffers];
        const index = offers.findIndex((offer) => offer.ID === res.ID);
        if (index > -1) {
          offers[index] = new NBAWaiverOffer({ ...res });
        } else {
          offers.push(res);
        }
        return offers;
      });
    }
  }, []);

  const CancelWaiverWireOffer = useCallback(async (dto: NBAWaiverOfferDTO) => {
    const res = await FreeAgencyService.BBACancelWaiverWireOffer(dto);
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

  const SearchBasketballStats = useCallback(async (dto: any) => {
    if (dto.League === SimCBB) {
      const res = await StatsService.BBACollegeStatsSearch(dto);
      // if (dto.ViewType === SEASON_VIEW) {
      //   setCBBPlayerSeasonStats((prev) => {
      //     return {...prev,
      //       [dto.SeasonID]: res.CBBPlayerSeasonStats,
      //     };
      //   });
      //   setCBBTeamSeasonStats((prev) => {
      //     return {
      //       ...prev,
      //       [dto.SeasonID]: res.CBBTeamSeasonStats,
      //     };
      //   });
      // } else {
      //   setCBBPlayerGameStatsMap((prev) => {
      //     return {
      //       ...prev,
      //       [dto.WeekID]: res.CBBPlayerGameStats,
      //     }
      //   });
      //   setCBBTeamGameStats((prev) => {
      //     return {
      //       ...prev,
      //       [dto.WeekID]: res.CBBTeamGameStats,
      //     };
      //   });
      // }
    } else {
      const res = await StatsService.HCKProStatsSearch(dto);
      // if (dto.ViewType === SEASON_VIEW) {
      //   setNBAPlayerSeasonStats((prev) => {
      //     return {
      //       ...prev,
      //       [dto.SeasonID]: res.NBAPlayerSeasonStats,
      //     };
      //   });
      //   setNBATeamSeasonStats((prev) => {
      //     return {
      //       ...prev,
      //       [dto.SeasonID]: res.NBATeamSeasonStats,
      //     };
      //   });
      // } else {
      //   setNBAPlayerGameStats((prev) => {
      //     return {
      //       ...prev,
      //       [dto.WeekID]: res.NBAPlayerGameStats,
      //     };
      //   });
      //   setNBATeamGameStats((prev) => {
      //     return {
      //       ...prev,
      //       [dto.WeekID]: res.NBATeamGameStats,
      //     };
      //   });
      // }
    }
  }, []);

  const ExportBasketballStats = useCallback(async (dto: any) => {
    if (dto.League === SimCBB) {
      const res = await StatsService.BBACollegeStatsExport(dto);
    } else {
      const res = await StatsService.BBAProStatsExport(dto);
    }
  }, []);

  const ExportCBBRecruits = useCallback(async () => {
    await RecruitService.ExportCBBCroots();
  }, []);

  const proposeTrade = useCallback(async (dto: NBATradeProposal) => {
    const thisDTO = new NBATradeProposalDTO({ dto });
    const res = await TradeService.BBACreateTradeProposal(thisDTO);
    enqueueSnackbar(
      `Sent trade proposal to ${nbaTeamMap![dto.RecepientTeamID].Team}!`,
      {
        variant: "success",
        autoHideDuration: 3000,
      },
    );
    setTradeProposalsMap((tp) => {
      const team = tp[dto.NBATeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NBATeamID]: [...tp[dto.NBATeamID], dto],
      };
    });
  }, []);

  const acceptTrade = useCallback(async (dto: NBATradeProposal) => {
    const res = await TradeService.BBAAcceptTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NBATeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NBATeamID]: [...tp[dto.NBATeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const rejectTrade = useCallback(async (dto: NBATradeProposal) => {
    const res = await TradeService.FBARejectTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NBATeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NBATeamID]: [...tp[dto.NBATeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const cancelTrade = useCallback(async (dto: NBATradeProposal) => {
    const res = await TradeService.FBACancelTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NBATeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NBATeamID]: [...tp[dto.NBATeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const syncAcceptedTrade = useCallback(async (dto: NBATradeProposal) => {
    const res = await TradeService.FBAConfirmAcceptedTrade(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NBATeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NBATeamID]: [...tp[dto.NBATeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const vetoTrade = useCallback(async (dto: NBATradeProposal) => {
    const res = await TradeService.FBAVetoAcceptedTrade(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.NBATeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.NBATeamID]: [...tp[dto.NBATeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const submitCollegePoll = useCallback(async (dto: any) => {
    const res = await CollegePollService.BBASubmitPoll(dto);
    if (res) {
      setCollegePollSubmission(res);
      enqueueSnackbar(`College Poll Submitted!`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    }
  }, []);

  const ExportBasketballSchedule = useCallback(async (dto: any) => {
    const res = await scheduleService.BBATimeslotExport(dto);
  }, []);

  // Fixme: This function is not used in the current context, but it is included for completeness.
  const ExportPlayByPlay = useCallback(async (dto: any) => {
    if (dto.League === SimCBB) {
      const res = await scheduleService.HCKExportCHLPlayByPlay(dto);
    } else {
      const res = await scheduleService.HCKExportPHLPlayByPlay(dto);
    }
  }, []);

  const createPromise = useCallback(
    async (dto: any) => {
      const res = await TransferPortalService.BBACreatePromise(dto);
      if (res) {
        setCollegePromises((promises) => [...promises, dto]);
        enqueueSnackbar("Promise Created!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      }
    },
    [collegePromises],
  );

  const cancelPromise = useCallback(
    async (dto: any) => {
      await TransferPortalService.BBACancelPromise(dto);

      setCollegePromises((promises) =>
        [...promises].filter((x) => x.CollegePlayerID !== dto.CollegePlayerID),
      );
      enqueueSnackbar("Promise Cancelled!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    },
    [collegePromises],
  );

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
        const currentProfile = prevTeamProfiles![cbbTeam!.ID];
        if (!currentProfile) return prevTeamProfiles;
        return {
          ...prevTeamProfiles,
          [cbbTeam!.ID]: new TeamRecruitingProfile({
            ...currentProfile,
            SpentPoints: totalPoints,
          }),
        };
      });

      return updatedProfiles;
    });
  };

  const addTransferPlayerToBoard = useCallback(
    async (dto: any) => {
      const apiDTO = {
        ...dto,
        TeamAbbreviation: cbbTeam?.Abbr,
        Recruiter: cbbTeam?.Coach,
        SeasonID: cbb_Timestamp?.SeasonID,
        ProfileID: cbbTeam?.ID,
      };
      const profile =
        await TransferPortalService.BBACreateTransferPortalProfile(apiDTO);
      if (profile) {
        const newProfile = new TransferPortalProfile({
          ...profile,
          ID: GenerateNumberFromRange(500000, 1000000),
        });
        setTransferPortalProfiles((profiles) => [...profiles, newProfile]);
      }
    },
    [transferPortalProfiles],
  );

  const removeTransferPlayerFromBoard = useCallback(
    async (dto: any) => {
      const profile =
        await TransferPortalService.BBARemoveProfileFromBoard(dto);

      setTransferPortalProfiles((profiles) =>
        [...profiles].filter((p) => p.CollegePlayerID != dto.CollegePlayerID),
      );
    },
    [transferPortalProfiles],
  );

  const saveTransferPortalBoard = useCallback(async () => {
    const dto = {
      Profile: teamProfileMap![cbbTeam!.ID],
      Players: teamTransferPortalProfiles,
      TeamID: cbbTeam!.ID,
    };
    await TransferPortalService.BBASaveTransferPortalBoard(dto);
    enqueueSnackbar("Transfer Portal Board Saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  }, [teamProfileMap, transferPortalProfiles, cbbTeam]);

  const exportTransferPortalPlayers = useCallback(async () => {
    const res = await TransferPortalService.ExportBBAPortal();
  }, []);

  const toggleNotificationAsRead = useCallback(
    async (notificationID: number, isPro: boolean) => {
      const res =
        await notificationService.ToggleSimBBANotification(notificationID);
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
        await notificationService.DeleteSimBBANotification(notificationID);
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
    async (dto: NBAExtensionOffer) => {
      try {
        const res = await FreeAgencyService.BBASaveExtensionOffer(dto);
        if (res) {
          enqueueSnackbar("Extension Offer Created!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setProExtensionMap((prevOffers) => {
            const offers = { ...prevOffers };
            offers[res.PlayerID] = new NBAExtensionOffer({ ...res });
            return offers;
          });
        }
      } finally {
      }
    },
    [proExtensionMap, setProExtensionMap],
  );

  const CancelExtensionOffer = useCallback(
    async (dto: NBAExtensionOffer) => {
      try {
        const res = await FreeAgencyService.BBACancelExtensionOffer(dto);
        if (res) {
          enqueueSnackbar("Extension Offer Cancelled!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setProExtensionMap((prevOffers) => {
            const offers = { ...prevOffers };
            delete offers[dto.PlayerID];
            return offers;
          });
        }
      } finally {
      }
    },
    [proExtensionMap, setProExtensionMap],
  );

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
        recruitProfiles,
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
        proPlayerMap,
        freeAgentOffers,
        waiverOffers,
        gLeaguePlayers,
        internationalPlayers,
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
        proExtensionMap,
        collegePolls,
        collegePollSubmission,
        nbaDraftPicks,
        individualDraftPickMap,
        nbaDraftPickMap,
        tradeProposalsMap,
        tradePreferencesMap,
        nbaTradeProposals,
        nbaTradeProposalsMap,
        nbaDraftees,
        freeAgents,
        waiverPlayers,
        collegePromises,
        collegeGameplanMap,
        nbaGameplanMap,
        nbaWarRoomMap,
        nbaScoutingProfileMap,
        transferPortalProfiles,
        teamTransferPortalProfiles,
        cbbPlayerMap,
        portalPlayerMap,
        teamCollegePromises,
        collegePromiseMap,
        transferProfileMapByPlayerID,
        getLandingBootstrapData,
        getBootstrapRosterData,
        getBootstrapRecruitingData,
        getBootstrapFreeAgencyData,
        getBootstrapScheduleData,
        getBootstrapDraftData,
        getBootstrapPortalData,
        getBootstrapGameplanData,
        submitCollegePoll,
        proposeTrade,
        acceptTrade,
        rejectTrade,
        cancelTrade,
        syncAcceptedTrade,
        vetoTrade,
        removeUserfromCBBTeamCall,
        removeUserfromNBATeamCall,
        addUserToCBBTeam,
        addUserToNBATeam,
        cutCBBPlayer,
        cutNBAPlayer,
        redshirtPlayer,
        promisePlayer,
        updateCBBRosterMap,
        updateNBARosterMap,
        saveCBBGameplan,
        saveNBAGameplan,
        addRecruitToBoard,
        removeRecruitFromBoard,
        updatePointsOnRecruit,
        toggleScholarship,
        SaveRecruitingBoard,
        SaveAIRecruitingSettings,
        SaveFreeAgencyOffer,
        CancelFreeAgencyOffer,
        SaveWaiverWireOffer,
        CancelWaiverWireOffer,
        SaveExtensionOffer,
        CancelExtensionOffer,
        SearchBasketballStats,
        ExportBasketballStats,
        ExportCBBRecruits,
        ExportBasketballSchedule,
        ExportPlayByPlay,
        getBootstrapNewsData,
        createPromise,
        cancelPromise,
        updatePointsOnPortalPlayer,
        addTransferPlayerToBoard,
        removeTransferPlayerFromBoard,
        saveTransferPortalBoard,
        exportTransferPortalPlayers,
        toggleNotificationAsRead,
        deleteNotification,
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
