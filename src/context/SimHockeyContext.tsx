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
import { BootstrapService } from "../_services/bootstrapService";
import { useWebSockets } from "../_hooks/useWebsockets";
import {
  CollegeTeam,
  Notification,
  ProfessionalTeam,
  CollegeStandings,
  CollegePlayer,
  Croot,
  RecruitingTeamProfile,
  NewsLog,
  CollegeGame,
  ProfessionalStandings,
  ProfessionalPlayer,
  ProCapsheet,
  ProfessionalGame,
  ProTeamRequest,
  Timestamp,
  CollegeLineup,
  CollegeShootoutLineup,
  ProfessionalLineup,
  ProfessionalShootoutLineup,
  RecruitPlayerProfile,
  FaceDataResponse,
  ProContract,
  ExtensionOffer,
  UpdateRecruitingBoardDTO,
  FreeAgencyOffer,
  WaiverOffer,
  FreeAgencyOfferDTO,
  WaiverOfferDTO,
  CollegePlayerGameStats,
  CollegePlayerSeasonStats,
  CollegeTeamGameStats,
  CollegeTeamSeasonStats,
  ProfessionalPlayerGameStats,
  ProfessionalPlayerSeasonStats,
  ProfessionalTeamGameStats,
  ProfessionalTeamSeasonStats,
  SearchStatsResponse,
  TradeProposal,
  TradePreferences,
  DraftPick,
  CollegeGameplan,
  ProGameplan,
  CollegePollOfficial,
  CollegePollSubmission,
  TransferPortalProfile,
  CollegePromise,
} from "../models/hockeyModels";
import { TeamService } from "../_services/teamService";
import {
  Coach,
  GM,
  Marketing,
  Owner,
  Scout,
  SEASON_VIEW,
  SimCHL,
  SimHCK,
} from "../_constants/constants";
import { hck_ws } from "../_constants/urls";
import { PlayerService } from "../_services/playerService";
import { GameplanService } from "../_services/gameplanService";
import { useSnackbar } from "notistack";
import { RecruitService } from "../_services/recruitService";
import { FreeAgencyService } from "../_services/freeAgencyService";
import { StatsService } from "../_services/statsService";
import { GenerateNumberFromRange } from "../_helper/utilHelper";
import { TradeService } from "../_services/tradeService";
import { CollegePollService } from "../_services/collegePollService";
import FBAScheduleService from "../_services/scheduleService";
import { TransferPortalService } from "../_services/transferPortalService";

// ✅ Define the context props
interface SimHCKContextProps {
  hck_Timestamp: Timestamp | null;
  isLoading: boolean;
  chlTeam: CollegeTeam | null;
  phlTeam: ProfessionalTeam | null;
  chlTeams: CollegeTeam[];
  chlTeamMap: Record<number, CollegeTeam>;
  chlTeamOptions: { label: string; value: string }[];
  chlConferenceOptions: { label: string; value: string }[];
  allCHLStandings: CollegeStandings[];
  currentCHLStandings: CollegeStandings[];
  chlStandingsMap: Record<number, CollegeStandings>;
  chlRosterMap: Record<number, CollegePlayer[]>;
  chlPlayerMap: Record<number, CollegePlayer>;
  chlGameplan: CollegeGameplan;
  chlLineups: CollegeLineup[];
  chlShootoutLineup: CollegeShootoutLineup;
  phlGameplan: ProGameplan;
  phlLineups: ProfessionalLineup[];
  phlShootoutLineup: ProfessionalShootoutLineup;
  recruits: Croot[]; // Replace with a more specific type if available
  recruitProfiles: RecruitPlayerProfile[];
  teamProfileMap: Record<number, RecruitingTeamProfile>;
  portalPlayers: CollegePlayer[]; // Replace with a more specific type if available
  collegeInjuryReport: CollegePlayer[];
  collegeNews: NewsLog[];
  collegePolls: CollegePollOfficial[];
  collegePollSubmission: CollegePollSubmission;
  allCollegeGames: CollegeGame[];
  currentCollegeSeasonGames: CollegeGame[];
  collegeTeamsGames: CollegeGame[];
  collegeNotifications: Notification[];
  phlTeams: ProfessionalTeam[];
  phlTeamOptions: { label: string; value: string }[];
  phlTeamMap: Record<number, ProfessionalTeam>;
  phlConferenceOptions: { label: string; value: string }[];
  allProStandings: ProfessionalStandings[];
  currentProStandings: ProfessionalStandings[];
  proStandingsMap: Record<number, ProfessionalStandings>;
  proRosterMap: Record<number, ProfessionalPlayer[]>;
  affiliatePlayers: ProfessionalPlayer[];
  freeAgentOffers: FreeAgencyOffer[];
  waiverOffers: WaiverOffer[];
  capsheetMap: Record<number, ProCapsheet>;
  proInjuryReport: ProfessionalPlayer[];
  proNews: NewsLog[];
  allProGames: ProfessionalGame[];
  currentProSeasonGames: ProfessionalGame[];
  proTeamsGames: ProfessionalGame[];
  proNotifications: Notification[];
  topCHLGoals: CollegePlayer[];
  topCHLAssists: CollegePlayer[];
  topCHLSaves: CollegePlayer[];
  topPHLGoals: ProfessionalPlayer[];
  topPHLAssists: ProfessionalPlayer[];
  topPHLSaves: ProfessionalPlayer[];
  tradeProposalsMap: Record<number, TradeProposal[]>;
  tradePreferencesMap: Record<number, TradePreferences>;
  transferPortalProfiles: TransferPortalProfile[];
  teamTransferPortalProfiles: TransferPortalProfile[];
  collegePromises: CollegePromise[];
  collegePromiseMap: Record<number, CollegePromise>;
  transferProfileMapByPlayerID: Record<number, TransferPortalProfile[]>;
  addTransferPlayerToBoard: (dto: any) => Promise<void>;
  removeTransferPlayerFromBoard: (dto: any) => Promise<void>;
  saveTransferPortalBoard: () => Promise<void>;
  createPromise: (dto: any) => Promise<void>;
  cancelPromise: (dto: any) => Promise<void>;
  exportTransferPortalPlayers: () => Promise<void>;
  updatePointsOnRecruit: (id: number, name: string, points: number) => void;
  removeUserfromCHLTeamCall: (teamID: number) => Promise<void>;
  removeUserfromPHLTeamCall: (request: ProTeamRequest) => Promise<void>;
  addUserToCHLTeam: (teamID: number, user: string) => void;
  addUserToPHLTeam: (teamID: number, user: string, role: string) => void;
  cutCHLPlayer: (playerID: number, teamID: number) => Promise<void>;
  cutPHLPlayer: (playerID: number, teamID: number) => Promise<void>;
  affiliatePlayer: (playerID: number, teamID: number) => Promise<void>;
  redshirtPlayer: (playerID: number, teamID: number) => Promise<void>;
  updateCHLRosterMap: (newMap: Record<number, CollegePlayer[]>) => void;
  updateProRosterMap: (newMap: Record<number, ProfessionalPlayer[]>) => void;
  saveCHLGameplan: (dto: any) => Promise<void>;
  saveCHLAIGameplan: (dto: any) => Promise<void>;
  savePHLGameplan: (dto: any) => Promise<void>;
  savePHLAIGameplan: (dto: any) => Promise<void>;
  addRecruitToBoard: (dto: any) => Promise<void>;
  toggleScholarship: (dto: any) => Promise<void>;
  removeRecruitFromBoard: (dto: any) => Promise<void>;
  scoutCrootAttribute: (dto: any) => Promise<void>;
  updatePointsOnPortalPlayer: (
    id: number,
    name: string,
    points: number
  ) => void;
  scoutPortalAttribute: (dto: any) => Promise<void>;
  SaveFreeAgencyOffer: (dto: any) => Promise<void>;
  CancelFreeAgencyOffer: (dto: any) => Promise<void>;
  SaveWaiverWireOffer: (dto: any) => Promise<void>;
  CancelWaiverWireOffer: (dto: any) => Promise<void>;
  SaveExtensionOffer: (dto: any) => Promise<void>;
  CancelExtensionOffer: (dto: any) => Promise<void>;
  SaveRecruitingBoard: () => Promise<void>;
  SaveAIRecruitingSettings: (dto: UpdateRecruitingBoardDTO) => Promise<void>;
  SearchHockeyStats: (dto: any) => Promise<void>;
  ExportHockeyStats: (dto: any) => Promise<void>;
  ExportHockeySchedule: (dto: any) => Promise<void>;
  ExportHCKRoster: (teamID: number, isPro: boolean) => Promise<void>;
  ExportCHLRecruits: () => Promise<void>;
  ExportPlayByPlay: (dto: any) => Promise<void>;
  proposeTrade: (dto: TradeProposal) => Promise<void>;
  acceptTrade: (dto: TradeProposal) => Promise<void>;
  rejectTrade: (dto: TradeProposal) => Promise<void>;
  cancelTrade: (dto: TradeProposal) => Promise<void>;
  syncAcceptedTrade: (dto: TradeProposal) => Promise<void>;
  vetoTrade: (dto: TradeProposal) => Promise<void>;
  PlacePHLPlayerOnTradeBlock: (
    playerID: number,
    teamID: number
  ) => Promise<void>;
  submitCollegePoll: (dto: any) => Promise<void>;
  getBootstrapNewsData: () => Promise<void>;

  playerFaces: {
    [key: number]: FaceDataResponse;
  };
  proContractMap: Record<number, ProContract> | null;
  proExtensionMap: Record<number, ExtensionOffer> | null;
  chlPlayerGameStatsMap: Record<number, CollegePlayerGameStats[]>;
  chlPlayerSeasonStatsMap: Record<number, CollegePlayerSeasonStats[]>;
  chlTeamGameStatsMap: Record<number, CollegeTeamGameStats[]>;
  chlTeamSeasonStatsMap: Record<number, CollegeTeamSeasonStats[]>;
  phlPlayerGameStatsMap: Record<number, ProfessionalPlayerGameStats[]>;
  phlPlayerSeasonStatsMap: Record<number, ProfessionalPlayerSeasonStats[]>;
  phlTeamGameStatsMap: Record<number, ProfessionalTeamGameStats[]>;
  phlTeamSeasonStatsMap: Record<number, ProfessionalTeamSeasonStats[]>;
  phlDraftPicks: DraftPick[];
  phlDraftPickMap: Record<number, DraftPick[]>;
  individualDraftPickMap: Record<number, DraftPick>;
  proPlayerMap: Record<number, ProfessionalPlayer>;
  collegeGamesMapBySeason: Record<number, CollegeGame[]>;
  proGamesMapBySeason: Record<number, ProfessionalGame[]>;
  collegePollsBySeason: Record<number, CollegePollOfficial[]>;
  collegeStandingsMapBySeason: Record<number, CollegeStandings[]>;
  proStandingsMapBySeason: Record<number, ProfessionalStandings[]>;
}

// ✅ Default context value
const defaultContext: SimHCKContextProps = {
  hck_Timestamp: null,
  isLoading: true,
  chlTeam: null,
  phlTeam: null,
  chlTeams: [],
  chlTeamMap: {},
  chlTeamOptions: [],
  chlConferenceOptions: [],
  allCHLStandings: [],
  currentCHLStandings: [],
  chlStandingsMap: {},
  chlRosterMap: {},
  chlPlayerMap: {},
  chlGameplan: {} as CollegeGameplan,
  chlLineups: [],
  chlShootoutLineup: {} as CollegeShootoutLineup,
  phlGameplan: {} as ProGameplan,
  phlLineups: [],
  phlShootoutLineup: {} as ProfessionalShootoutLineup,
  recruits: [],
  recruitProfiles: [],
  teamProfileMap: {},
  portalPlayers: [],
  collegeInjuryReport: [],
  collegeNews: [],
  allCollegeGames: [],
  currentCollegeSeasonGames: [],
  collegeTeamsGames: [],
  collegeNotifications: [],
  phlTeams: [],
  phlTeamOptions: [],
  phlTeamMap: {},
  phlConferenceOptions: [],
  allProStandings: [],
  currentProStandings: [],
  proStandingsMap: {},
  proRosterMap: {},
  affiliatePlayers: [],
  freeAgentOffers: [],
  waiverOffers: [],
  capsheetMap: {},
  proInjuryReport: [],
  proNews: [],
  allProGames: [],
  currentProSeasonGames: [],
  proTeamsGames: [],
  proNotifications: [],
  tradeProposalsMap: {},
  tradePreferencesMap: {},
  phlDraftPicks: [],
  phlDraftPickMap: {},
  collegePolls: [],
  collegePollSubmission: {} as CollegePollSubmission,
  transferPortalProfiles: [],
  collegePromises: [],
  collegePromiseMap: {},
  teamTransferPortalProfiles: [],
  transferProfileMapByPlayerID: {},
  addTransferPlayerToBoard: async () => {},
  removeTransferPlayerFromBoard: async () => {},
  saveTransferPortalBoard: async () => {},
  createPromise: async () => {},
  cancelPromise: async () => {},
  exportTransferPortalPlayers: async () => {},
  removeUserfromCHLTeamCall: async () => {},
  removeUserfromPHLTeamCall: async () => {},
  addUserToCHLTeam: () => {},
  addUserToPHLTeam: () => {},
  cutCHLPlayer: async () => {},
  cutPHLPlayer: async () => {},
  affiliatePlayer: async () => {},
  redshirtPlayer: async () => {},
  updateCHLRosterMap: () => {},
  updateProRosterMap: () => {},
  saveCHLGameplan: async () => {},
  savePHLGameplan: async () => {},
  saveCHLAIGameplan: async () => {},
  savePHLAIGameplan: async () => {},
  addRecruitToBoard: async () => {},
  removeRecruitFromBoard: async () => {},
  updatePointsOnRecruit: () => {},
  toggleScholarship: async () => {},
  scoutCrootAttribute: async () => {},
  SaveRecruitingBoard: async () => {},
  SaveAIRecruitingSettings: async () => {},
  SaveFreeAgencyOffer: async () => {},
  CancelFreeAgencyOffer: async () => {},
  SaveWaiverWireOffer: async () => {},
  CancelWaiverWireOffer: async () => {},
  SaveExtensionOffer: async () => {},
  CancelExtensionOffer: async () => {},
  SearchHockeyStats: async () => {},
  ExportHockeyStats: async () => {},
  ExportHCKRoster: async () => {},
  ExportCHLRecruits: async () => {},
  ExportHockeySchedule: async () => {},
  ExportPlayByPlay: async () => {},
  PlacePHLPlayerOnTradeBlock: async () => {},
  proposeTrade: async () => {},
  acceptTrade: async () => {},
  rejectTrade: async () => {},
  cancelTrade: async () => {},
  syncAcceptedTrade: async () => {},
  vetoTrade: async () => {},
  submitCollegePoll: async () => {},
  getBootstrapNewsData: async () => {},
  updatePointsOnPortalPlayer: () => {},
  scoutPortalAttribute: async () => {},
  topCHLGoals: [],
  topCHLAssists: [],
  topCHLSaves: [],
  topPHLGoals: [],
  topPHLAssists: [],
  topPHLSaves: [],
  playerFaces: {},
  proContractMap: {},
  proExtensionMap: {},
  chlPlayerGameStatsMap: {},
  chlPlayerSeasonStatsMap: {},
  chlTeamGameStatsMap: {},
  chlTeamSeasonStatsMap: {},
  phlPlayerGameStatsMap: {},
  phlPlayerSeasonStatsMap: {},
  phlTeamGameStatsMap: {},
  phlTeamSeasonStatsMap: {},
  individualDraftPickMap: {},
  proPlayerMap: {},
  collegeGamesMapBySeason: {},
  proGamesMapBySeason: {},
  collegePollsBySeason: {},
  collegeStandingsMapBySeason: {},
  proStandingsMapBySeason: {},
};

// ✅ Create the context
export const SimHCKContext = createContext<SimHCKContextProps>(defaultContext);

// ✅ Define the provider props
interface SimHCKProviderProps {
  children: ReactNode;
}

export const SimHCKProvider: React.FC<SimHCKProviderProps> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuthStore();
  const { hck_Timestamp, setHCK_Timestamp } = useWebSockets(hck_ws, SimHCK);
  const isFetching = useRef(false);
  const scheduleService = new FBAScheduleService();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chlTeam, setCHLTeam] = useState<CollegeTeam | null>(null); // College Hockey
  const [phlTeam, setPHLTeam] = useState<ProfessionalTeam | null>(null); // Pro Hockey
  const [chlTeams, setCHLTeams] = useState<CollegeTeam[]>([]);
  const [chlTeamMap, setCHLTeamMap] = useState<Record<number, CollegeTeam>>({});
  const [chlTeamOptions, setCHLTeamOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [chlConferenceOptions, setCHLConferenceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [allCHLStandings, setAllCHLStandings] = useState<CollegeStandings[]>(
    []
  );
  const [chlRosterMap, setCHLRosterMap] = useState<
    Record<number, CollegePlayer[]>
  >({});
  const [chlGameplan, setCHLGameplan] = useState<CollegeGameplan>(
    {} as CollegeGameplan
  );
  const [chlLineups, setCHLLineups] = useState<CollegeLineup[]>([]);
  const [chlShootoutLineup, setCHLShootoutLineup] =
    useState<CollegeShootoutLineup>({} as CollegeShootoutLineup);
  const [phlGameplan, setPHLGameplan] = useState<ProGameplan>(
    {} as CollegeGameplan
  );
  const [phlLineups, setPHLLineups] = useState<ProfessionalLineup[]>([]);
  const [phlShootoutLineup, setPHLShootoutLineup] =
    useState<CollegeShootoutLineup>({} as ProfessionalShootoutLineup);
  const [recruits, setRecruits] = useState<Croot[]>([]);
  const [recruitProfiles, setRecruitProfiles] = useState<
    RecruitPlayerProfile[]
  >([]);
  const [teamProfileMap, setTeamProfileMap] = useState<
    Record<number, RecruitingTeamProfile>
  >({});
  const [portalPlayers, setPortalPlayers] = useState<CollegePlayer[]>([]);
  const [collegeInjuryReport, setCollegeInjuryReport] = useState<
    CollegePlayer[]
  >([]);
  const [collegeNews, setCollegeNews] = useState<NewsLog[]>([]);
  const [allCollegeGames, setAllCollegeGames] = useState<CollegeGame[]>([]);
  const [collegeNotifications, setCollegeNotifications] = useState<
    Notification[]
  >([]);
  // Pro
  const [phlTeams, setProTeams] = useState<ProfessionalTeam[]>([]);
  const [phlTeamOptions, setProTeamOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [phlTeamMap, setProTeamMap] = useState<
    Record<number, ProfessionalTeam>
  >({});
  const [phlConferenceOptions, setProConferenceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [allProStandings, setAllProStandings] = useState<
    ProfessionalStandings[]
  >([]);
  const [proRosterMap, setProRosterMap] = useState<
    Record<number, ProfessionalPlayer[]>
  >({});
  const [freeAgentOffers, setFreeAgentOffers] = useState<FreeAgencyOffer[]>([]);
  const [waiverOffers, setWaiverOffers] = useState<WaiverOffer[]>([]);
  const [capsheetMap, setCapsheetMap] = useState<Record<number, ProCapsheet>>(
    {}
  );
  const [proInjuryReport, setProInjuryReport] = useState<ProfessionalPlayer[]>(
    []
  );
  const [affiliatePlayers, setAffiliatePlayers] = useState<
    ProfessionalPlayer[]
  >([]);
  const [proNews, setProNews] = useState<NewsLog[]>([]);
  const [allProGames, setAllProGames] = useState<ProfessionalGame[]>([]);
  const [proNotifications, setProNotifications] = useState<Notification[]>([]);
  const [playerFaces, setPlayerFaces] = useState<{
    [key: number]: FaceDataResponse;
  }>({});
  const [proContractMap, setProContractMap] = useState<Record<
    number,
    ProContract
  > | null>({});
  const [proExtensionMap, setProExtensionMap] = useState<Record<
    number,
    ExtensionOffer
  > | null>({});
  const [transferPortalProfiles, setTransferPortalProfiles] = useState<
    TransferPortalProfile[]
  >([]);
  const [collegePromises, setCollegePromises] = useState<CollegePromise[]>([]);

  /*
  collegePolls: [],
  collegePollSubmission: {} as CollegePollSubmission,
  */
  const [collegePolls, setCollegePolls] = useState<CollegePollOfficial[]>([]);
  const [collegePollSubmission, setCollegePollSubmission] =
    useState<CollegePollSubmission>({} as CollegePollSubmission);

  const [topCHLGoals, setTopCHLGoals] = useState<CollegePlayer[]>([]);
  const [topCHLAssists, setTopCHLAssists] = useState<CollegePlayer[]>([]);
  const [topCHLSaves, setTopCHLSaves] = useState<CollegePlayer[]>([]);
  const [topPHLGoals, setTopPHLGoals] = useState<ProfessionalPlayer[]>([]);
  const [topPHLAssists, setTopPHLAssists] = useState<ProfessionalPlayer[]>([]);
  const [topPHLSaves, setTopPHLSaves] = useState<ProfessionalPlayer[]>([]);
  const [chlPlayerGameStatsMap, setChlPlayerGameStatsMap] = useState<
    Record<number, CollegePlayerGameStats[]>
  >({});
  const [chlPlayerSeasonStatsMap, setChlPlayerSeasonStats] = useState<
    Record<number, CollegePlayerSeasonStats[]>
  >({});
  const [chlTeamGameStatsMap, setChlTeamGameStats] = useState<
    Record<number, CollegeTeamGameStats[]>
  >([]);
  const [chlTeamSeasonStatsMap, setChlTeamSeasonStats] = useState<
    Record<number, CollegeTeamSeasonStats[]>
  >([]);
  const [phlPlayerGameStatsMap, setPhlPlayerGameStats] = useState<
    Record<number, ProfessionalPlayerGameStats[]>
  >([]);
  const [phlPlayerSeasonStatsMap, setPhlPlayerSeasonStats] = useState<
    Record<number, ProfessionalPlayerSeasonStats[]>
  >([]);
  const [phlTeamGameStatsMap, setPhlTeamGameStats] = useState<
    Record<number, ProfessionalTeamGameStats[]>
  >([]);
  const [phlTeamSeasonStatsMap, setPhlTeamSeasonStats] = useState<
    Record<number, ProfessionalTeamSeasonStats[]>
  >([]);
  const [tradeProposalsMap, setTradeProposalsMap] = useState<
    Record<number, TradeProposal[]>
  >([]);
  const [tradePreferencesMap, setTradePreferencesMap] = useState<
    Record<number, TradePreferences>
  >([]);
  const [phlDraftPicks, setPHLDraftPicks] = useState<DraftPick[]>([]);

  const phlDraftPickMap = useMemo(() => {
    if (!phlDraftPicks) return {};
    const pickMap: Record<number, DraftPick[]> = {};
    for (let i = 0; i < phlDraftPicks.length; i++) {
      const pick = phlDraftPicks[i];
      if (!pickMap[pick.TeamID]) {
        pickMap[pick.TeamID] = [pick];
      } else {
        pickMap[pick.TeamID].push(pick);
      }
    }
    return pickMap;
  }, [phlDraftPicks]);

  const individualDraftPickMap = useMemo(() => {
    const pickMap: Record<number, DraftPick> = {};

    for (let i = 0; i < phlDraftPicks.length; i++) {
      const pick = phlDraftPicks[i];
      pickMap[pick.ID] = pick;
    }

    return pickMap;
  }, [phlDraftPicks]);

  const proPlayerMap = useMemo(() => {
    const playerMap: Record<number, ProfessionalPlayer> = {};

    if (proRosterMap && phlTeams) {
      for (let i = 0; i < phlTeams.length; i++) {
        const team = phlTeams[i];
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
  }, [proRosterMap, phlTeams]);

  const teamTransferPortalProfiles = useMemo(() => {
    if (!chlTeam) return [];
    return transferPortalProfiles.filter(
      (profile) => profile.ProfileID === chlTeam.ID
    );
  }, [chlTeam, transferPortalProfiles]);

  const chlPlayerMap = useMemo(() => {
    const playerMap: Record<number, CollegePlayer> = {};
    if (chlRosterMap && chlTeams) {
      for (let i = 0; i < chlTeams.length; i++) {
        const team = chlTeams[i];
        const roster = chlRosterMap[team.ID];
        if (roster) {
          for (let j = 0; j < roster.length; j++) {
            const p = roster[j];
            playerMap[p.ID] = p;
          }
        }
      }
    }
    if (portalPlayers) {
      for (let i = 0; i < portalPlayers.length; i++) {
        const p = portalPlayers[i];
        playerMap[p.ID] = p;
      }
    }
    return playerMap;
  }, [chlRosterMap, chlTeams, portalPlayers]);

  const transferProfileMapByPlayerID = useMemo(() => {
    const transferProfileMap: Record<number, TransferPortalProfile[]> = {};
    for (let i = 0; i < portalPlayers.length; i++) {
      const p = portalPlayers[i];
      const profiles = transferPortalProfiles.filter(
        (profile) => profile.CollegePlayerID === p.ID
      );
      transferProfileMap[p.ID] = profiles;
    }
    return transferProfileMap;
  }, [portalPlayers, transferPortalProfiles]);

  const teamCollegePromises = useMemo(() => {
    if (!chlTeam || !collegePromises) return [];
    return collegePromises.filter((promise) => promise.TeamID === chlTeam.ID);
  }, [chlTeam, collegePromises]);

  const collegePromiseMap = useMemo(() => {
    const map: Record<number, CollegePromise> = {};
    for (let i = 0; i < teamCollegePromises.length; i++) {
      const promise = teamCollegePromises[i];
      map[promise.CollegePlayerID] = promise;
    }
    return map;
  }, [teamCollegePromises]);

  useEffect(() => {
    getBootstrapTeamData();
  }, []);

  const getBootstrapTeamData = async () => {
    let chlID = 0;
    let phlID = 0;
    if (currentUser && currentUser.CHLTeamID) {
      chlID = currentUser.CHLTeamID;
    }
    if (currentUser && currentUser.PHLTeamID) {
      phlID = currentUser.PHLTeamID;
    }
    const res = await BootstrapService.GetHCKBootstrapTeamData();
    setCHLTeams(res.AllCollegeTeams);
    setProTeams(res.AllProTeams);
    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName)
      );
      const chlTeamOptions = sortedCollegeTeams.map((team) => ({
        label: `${team.TeamName} | ${team.Abbreviation}`,
        value: team.ID.toString(),
      }));
      const chlConferenceOptions = Array.from(
        new Map(
          sortedCollegeTeams.map((team) => [
            team.ConferenceID,
            { label: team.Conference, value: team.ConferenceID.toString() },
          ])
        ).values()
      ).sort((a, b) => a.label.localeCompare(b.label));
      const chlTeamMap = Object.fromEntries(
        sortedCollegeTeams.map((team) => [team.ID, team])
      );
      setCHLTeamOptions(chlTeamOptions);
      setCHLConferenceOptions(chlConferenceOptions);
      setCHLTeamMap(chlTeamMap);
    }

    if (res.AllProTeams.length > 0) {
      const sortedTeams = res.AllProTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName)
      );
      const teamOptionsList = sortedTeams.map((x) => {
        return { label: x.TeamName, value: x.ID.toString() };
      });
      const confs = sortedTeams.map((x) => {
        return { label: x.Conference, value: x.ConferenceID.toString() };
      });
      const filtered = Array.from(
        new Map(confs.map((item) => [item.value, item])).values()
      ).sort((a, b) => a.label.localeCompare(b.label));
      setProTeamOptions(teamOptionsList);
      setProConferenceOptions(filtered);
      const ProTeamMap = Object.fromEntries(
        res.AllProTeams.map((team) => [team.ID, team])
      );
      setProTeamMap(ProTeamMap);
    }
  };

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      isFetching.current = true;
      getBootstrapData();
    }
  }, [currentUser]);

  const collegeStandingsMapBySeason = useMemo(() => {
    const map: Record<number, CollegeStandings[]> = {};
    for (let i = 0; i < allCHLStandings.length; i++) {
      const standing = allCHLStandings[i];
      if (!map[standing.SeasonID]) {
        map[standing.SeasonID] = [standing];
      } else {
        map[standing.SeasonID].push(standing);
      }
    }
    return map;
  }, [allCHLStandings, hck_Timestamp?.SeasonID]);

  const currentCHLStandings = useMemo(() => {
    return collegeStandingsMapBySeason[hck_Timestamp?.SeasonID || 0];
  }, [collegeStandingsMapBySeason, hck_Timestamp?.SeasonID]);

  const chlStandingsMap = useMemo(() => {
    const map: Record<number, CollegeStandings> = {};
    if (!currentCHLStandings) return map;
    for (let i = 0; i < currentCHLStandings.length; i++) {
      const standing = currentCHLStandings[i];
      map[standing.TeamID] = standing;
    }
    return map;
  }, [currentCHLStandings, hck_Timestamp?.SeasonID]);

  const proStandingsMapBySeason = useMemo(() => {
    const map: Record<number, ProfessionalStandings[]> = {};
    for (let i = 0; i < allProStandings.length; i++) {
      const standing = allProStandings[i];
      if (!map[standing.SeasonID]) {
        map[standing.SeasonID] = [standing];
      } else {
        map[standing.SeasonID].push(standing);
      }
    }
    return map;
  }, [allProStandings, hck_Timestamp?.SeasonID]);

  const currentProStandings = useMemo(() => {
    return proStandingsMapBySeason[hck_Timestamp?.SeasonID || 0];
  }, [proStandingsMapBySeason, hck_Timestamp?.SeasonID]);

  const proStandingsMap = useMemo(() => {
    const map: Record<number, ProfessionalStandings> = {};
    if (!currentProStandings) return map;
    for (let i = 0; i < currentProStandings.length; i++) {
      const standing = currentProStandings[i];
      map[standing.TeamID] = standing;
    }
    return map;
  }, [currentProStandings, hck_Timestamp?.SeasonID]);

  const collegeGamesMapBySeason = useMemo(() => {
    const map: Record<number, CollegeGame[]> = {};
    for (let i = 0; i < allCollegeGames.length; i++) {
      const game = allCollegeGames[i];
      if (!map[game.SeasonID]) {
        map[game.SeasonID] = [game];
      } else {
        map[game.SeasonID].push(game);
      }
    }
    return map;
  }, [allCollegeGames]);

  const currentCollegeSeasonGames = useMemo(() => {
    return collegeGamesMapBySeason[hck_Timestamp?.SeasonID || 0] || [];
  }, [collegeGamesMapBySeason, hck_Timestamp?.SeasonID]);

  const collegeTeamsGames = useMemo(() => {
    if (!chlTeam) return [];
    if (!currentCollegeSeasonGames) return [];
    return currentCollegeSeasonGames.filter(
      (x) => x.HomeTeamID === chlTeam.ID || x.AwayTeamID === chlTeam.ID
    );
  }, [currentCollegeSeasonGames, chlTeam]);

  const proGamesMapBySeason = useMemo(() => {
    const map: Record<number, ProfessionalGame[]> = {};
    for (let i = 0; i < allProGames.length; i++) {
      const game = allProGames[i];
      if (!map[game.SeasonID]) {
        map[game.SeasonID] = [game];
      } else {
        map[game.SeasonID].push(game);
      }
    }
    return map;
  }, [allProGames]);

  const currentProSeasonGames = useMemo(() => {
    return proGamesMapBySeason[hck_Timestamp?.SeasonID || 0] || [];
  }, [proGamesMapBySeason, hck_Timestamp?.SeasonID]);

  const proTeamsGames = useMemo(() => {
    if (!phlTeam) return [];
    return currentProSeasonGames.filter(
      (x) => x.HomeTeamID === phlTeam.ID || x.AwayTeamID === phlTeam.ID
    );
  }, [currentProSeasonGames, phlTeam]);

  const collegePollsBySeason = useMemo(() => {
    const map: Record<number, CollegePollOfficial[]> = {};
    for (let i = 0; i < collegePolls.length; i++) {
      const poll = collegePolls[i];
      if (!map[poll.SeasonID]) {
        map[poll.SeasonID] = [poll];
      } else {
        map[poll.SeasonID].push(poll);
      }
    }
    return map;
  }, [collegePolls]);

  const getBootstrapNewsData = useCallback(async () => {
    let chlid = 0;
    let phlid = 0;
    if (currentUser && currentUser.CHLTeamID) {
      chlid = currentUser.CHLTeamID;
    }
    if (currentUser && currentUser.PHLTeamID) {
      phlid = currentUser.PHLTeamID;
    }
    if (chlid === 0 && phlid === 0) {
      return;
    }
    const res = await BootstrapService.GetHCKNewsBootstrapData(chlid, phlid);

    if (chlid > 0) {
      setCollegeNews(res.CollegeNews as any);
    }

    if (phlid > 0) {
      setProNews(res.ProNews as any);
    }
  }, [currentUser?.CHLTeamID, currentUser?.PHLTeamID]);

  const getBootstrapData = async () => {
    let chlid = 0;
    let phlid = 0;
    if (currentUser && currentUser.CHLTeamID) {
      chlid = currentUser.CHLTeamID;
    }
    if (currentUser && currentUser.PHLTeamID) {
      phlid = currentUser.PHLTeamID;
    }
    // if the user has no hockey teams, skip all HCK bootstrapping
    if (chlid == 0 && phlid == 0) {
      setIsLoading(false);
      return;
    }
    const res = await BootstrapService.GetHCKBootstrapData(chlid, phlid);
    if (chlid > 0) {
      setAllCollegeGames(res.AllCollegeGames);
      setCollegeInjuryReport(res.CollegeInjuryReport);
      setCHLTeam(res.CollegeTeam);
      setCollegePolls(res.OfficialPolls);
      setCollegePollSubmission(res.CollegePoll);
      setCollegeNotifications(res.CollegeNotifications);
      setAllCHLStandings(res.CollegeStandings);
      setCHLGameplan(res.CHLGameplan);
      setCHLLineups(res.CollegeTeamLineups);
      setCHLShootoutLineup(res.CollegeTeamShootoutLineup);
      setCHLRosterMap(res.CollegeRosterMap);
      setTopCHLGoals(res.TopCHLGoals);
      setTopCHLAssists(res.TopCHLAssists);
      setTopCHLSaves(res.TopCHLSaves);
      setPortalPlayers(res.PortalPlayers);
      setRecruits(res.Recruits);
      setRecruitProfiles(res.RecruitProfiles);
      setTeamProfileMap(res.TeamProfileMap);
      setTransferPortalProfiles(res.TransferPortalProfiles);
      setCollegePromises(res.CollegePromises);
    }
    if (phlid > 0) {
      setAllProGames(res.AllProGames);
      setCapsheetMap(res.CapsheetMap);
      setProInjuryReport(res.ProInjuryReport);
      setPHLTeam(res.ProTeam);
      setPHLLineups(res.ProTeamLineups);
      setPHLGameplan(res.PHLGameplan);
      setPHLShootoutLineup(res.ProTeamShootoutLineup);
      setAllProStandings(res.ProStandings);
      setProRosterMap(res.ProRosterMap);
      setFreeAgentOffers(res.FreeAgentOffers);
      setWaiverOffers(res.WaiverWireOffers);
      setAffiliatePlayers(res.AffiliatePlayers);
      setProNotifications(res.ProNotifications);
      setProContractMap(res.ContractMap);
      setProExtensionMap(res.ExtensionMap);
      setTopPHLGoals(res.TopPHLGoals);
      setTopPHLAssists(res.TopPHLAssists);
      setTopPHLSaves(res.TopPHLSaves);
      setTradeProposalsMap(res.ProTradeProposalMap);
      setTradePreferencesMap(res.ProTradePreferenceMap);
      setPHLDraftPicks(res.DraftPicks);
    }
    setPlayerFaces(res.FaceData);
    setIsLoading(false);
    isFetching.current = false;
  };

  const removeUserfromCHLTeamCall = useCallback(
    async (teamID: number) => {
      const res = await TeamService.RemoveUserFromCHLTeam(teamID);
      const chlTeamsList = [...chlTeams];
      const teamIDX = chlTeamsList.findIndex((x) => x.ID === teamID);
      if (teamIDX > -1) {
        chlTeamsList[teamIDX].Coach = "";
        chlTeamsList[teamIDX].IsUserCoached = false;
      }
      setCHLTeams(chlTeamsList);
    },
    [chlTeams]
  );

  const removeUserfromPHLTeamCall = useCallback(
    async (request: ProTeamRequest) => {
      const res = await TeamService.RemoveUserFromPHLTeam(request);
      const phlTeamsList = [...phlTeams];
      const teamIDX = phlTeamsList.findIndex((x) => x.ID === request.TeamID);
      if (request.Role === Owner) {
        phlTeamsList[teamIDX].Owner = "";
      } else if (request.Role === Coach) {
        phlTeamsList[teamIDX].Coach = "";
      } else if (request.Role === GM) {
        phlTeamsList[teamIDX].GM = "";
      } else if (request.Role === Scout) {
        phlTeamsList[teamIDX].Scout = "";
      } else if (request.Role === Marketing) {
        phlTeamsList[teamIDX].Marketing = "";
      }
      setProTeams(phlTeamsList);
    },
    [phlTeams]
  );

  const addUserToCHLTeam = useCallback(
    (teamID: number, user: string) => {
      const teams = [...chlTeams];
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
      setCHLTeams(teams);
    },
    [chlTeams]
  );

  const addUserToPHLTeam = useCallback(
    (teamID: number, user: string, role: string) => {
      const teams = [...phlTeams];
      const teamIDX = teams.findIndex((team) => team.ID === teamID);
      if (teamID > -1) {
        if (role === "Owner") {
          teams[teamIDX].Owner = user;
        } else if (role === "Coach") {
          teams[teamIDX].Coach = user;
        } else if (role === "GM") {
          teams[teamIDX].GM = user;
        } else if (role === "Assistant") {
          teams[teamIDX].Scout = user;
        } else {
          teams[teamIDX].Marketing = user;
        }
        enqueueSnackbar(
          `${user} has been added as a ${role} to the ${teams[teamIDX].Mascot} Organization`,
          {
            variant: "success",
            autoHideDuration: 3000,
          }
        );
      }
      setProTeams(teams);
    },
    [phlTeams]
  );

  const cutCHLPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.CutCHLPlayer(playerID);
      const rosterMap = { ...chlRosterMap };
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID
      );
      setCHLRosterMap(rosterMap);
    },
    [chlRosterMap]
  );
  const redshirtPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.RedshirtCHLPlayer(playerID);
      const rosterMap = { ...chlRosterMap };
      const playerIDX = rosterMap[teamID].findIndex(
        (player) => player.ID === playerID
      );
      if (playerIDX > -1) {
        rosterMap[teamID][playerIDX].IsRedshirting = true;
        setCHLRosterMap(rosterMap);
      }
    },
    [chlRosterMap]
  );
  const cutPHLPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.CutPHLPlayer(playerID);
      const rosterMap = { ...proRosterMap };
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID
      );
      setProRosterMap(rosterMap);
    },
    [proRosterMap]
  );

  const PlacePHLPlayerOnTradeBlock = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.SendPHLPlayerToTradeBlock(playerID);
      setProRosterMap((prevMap) => {
        const teamRoster = prevMap[teamID];
        if (!teamRoster) return prevMap;

        return {
          ...prevMap,
          [teamID]: teamRoster.map((player) =>
            player.ID === playerID
              ? new ProfessionalPlayer({
                  ...player,
                  IsOnTradeBlock: !player.IsOnTradeBlock,
                })
              : player
          ),
        };
      });
    },
    []
  );

  const affiliatePlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const contract = proContractMap!![playerID];
      if (contract.NoMovementClause) {
        enqueueSnackbar(
          "Cannot move player with No Movement Clause to affiliate team!",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
        return;
      }
      const res = await PlayerService.SendPHLPlayerToAffiliate(playerID);
      setProRosterMap((prevMap) => {
        const teamRoster = prevMap[teamID];
        if (!teamRoster) return prevMap;

        return {
          ...prevMap,
          [teamID]: teamRoster.map((player) =>
            player.ID === playerID
              ? new ProfessionalPlayer({
                  ...player,
                  IsIsAffiliatePlayer: !player.IsAffiliatePlayer,
                })
              : player
          ),
        };
      });
    },
    [proRosterMap]
  );

  const updateCHLRosterMap = (newMap: Record<number, CollegePlayer[]>) => {
    setCHLRosterMap(newMap);
  };

  const updateProRosterMap = (newMap: Record<number, ProfessionalPlayer[]>) => {
    setProRosterMap(newMap);
  };

  const saveCHLGameplan = async (dto: any) => {
    const res = await GameplanService.SaveCHLGameplan(dto);
    setCHLLineups(dto.CHLLineups);
    setCHLShootoutLineup(dto.CHLShootoutLineup);
    enqueueSnackbar("Lineups saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const savePHLGameplan = async (dto: any) => {
    const res = await GameplanService.SavePHLGameplan(dto);
    setPHLLineups(dto.PHLLineups);
    setPHLShootoutLineup(dto.CHLShootoutLineup);
    enqueueSnackbar("Lineups saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const saveCHLAIGameplan = async (dto: any) => {
    const res = await GameplanService.SaveCHLAIGameplan(dto);
    setCHLGameplan(dto);
    enqueueSnackbar("AI Gameplan saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const savePHLAIGameplan = async (dto: any) => {
    const res = await GameplanService.SavePHLAIGameplan(dto);
    setPHLGameplan(dto);
    enqueueSnackbar("Lineups saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const addRecruitToBoard = async (dto: any) => {
    const apiDTO = {
      ...dto,
      SeasonID: hck_Timestamp?.SeasonID,
      Team: chlTeam,
      Recruiter: chlTeam?.Coach,
      ProfileID: chlTeam?.ID,
    };
    const profile = await RecruitService.HCKCreateRecruitProfile(apiDTO);
    if (profile) {
      const newProfile = new RecruitPlayerProfile({
        ...profile,
        ID: GenerateNumberFromRange(500000, 1000000),
      });
      setRecruitProfiles((profiles) => [...profiles, newProfile]);
    }
  };

  const removeRecruitFromBoard = async (dto: any) => {
    const profile = await RecruitService.HCKRemoveCrootFromBoard(dto);
    if (profile) {
      setRecruitProfiles((profiles) =>
        [...profiles].filter((p) => p.RecruitID != dto.RecruitID)
      );
    }
  };

  const toggleScholarship = async (dto: any) => {
    const profile = await RecruitService.HCKToggleScholarship(dto);
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
        const currentProfile = prev[profile.ProfileID];
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

  const scoutCrootAttribute = async (dto: any) => {
    const profile = await RecruitService.HCKScoutRecruitingAttribute(dto);
    if (profile) {
      setRecruitProfiles((profiles) =>
        [...profiles].map((p) =>
          p.RecruitID === profile.RecruitID
            ? new RecruitPlayerProfile({
                ...profile,
                [dto.Attribute]: true,
              })
            : p
        )
      );
      setTeamProfileMap((prev) => {
        const currentProfile = prev[profile.ProfileID];
        if (!currentProfile) return prev;
        return {
          ...prev,
          [profile.ProfileID]: new RecruitingTeamProfile({
            ...currentProfile,
            WeeklyScoutingPoints: currentProfile.WeeklyScoutingPoints - 1,
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
        const currentProfile = prevTeamProfiles[chlTeam!.ID];
        if (!currentProfile) return prevTeamProfiles;
        return {
          ...prevTeamProfiles,
          [chlTeam!.ID]: new RecruitingTeamProfile({
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
      Profile: teamProfileMap[chlTeam!.ID],
      Recruits: recruitProfiles,
      TeamID: chlTeam!.ID,
    };

    await RecruitService.HCKSaveRecruitingBoard(dto);
    enqueueSnackbar("Recruiting Board Saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  }, [teamProfileMap, recruitProfiles, chlTeam]);

  const SaveAIRecruitingSettings = useCallback(
    async (dto: UpdateRecruitingBoardDTO) => {
      const res = await RecruitService.HCKSaveAISettings(dto);
      if (res) {
        enqueueSnackbar("AI Recruiting Settings Saved!", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setTeamProfileMap((prevTeamProfiles) => {
          let currentProfile = prevTeamProfiles[dto.TeamID];
          if (!currentProfile) return prevTeamProfiles;
          return {
            ...prevTeamProfiles,
            [chlTeam!.ID]: new RecruitingTeamProfile({
              ...currentProfile,
              ...dto.Profile,
            }),
          };
        });
      }
    },
    [chlTeamMap]
  );

  const SaveFreeAgencyOffer = useCallback(async (dto: FreeAgencyOfferDTO) => {
    const res = await FreeAgencyService.HCKSaveFreeAgencyOffer(dto);
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
    const res = await FreeAgencyService.HCKCancelFreeAgencyOffer(dto);
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

  const SaveWaiverWireOffer = useCallback(async (dto: WaiverOfferDTO) => {
    const res = await FreeAgencyService.HCKSaveWaiverWireOffer(dto);
    if (res) {
      enqueueSnackbar("Waiver Offer Created!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setWaiverOffers((prevOffers) => {
        const offers = [...prevOffers];
        const index = offers.findIndex((offer) => offer.ID === res.ID);
        if (index > -1) {
          offers[index] = new WaiverOffer({ ...res });
        } else {
          offers.push(res);
        }
        return offers;
      });
    }
  }, []);

  const CancelWaiverWireOffer = useCallback(async (dto: WaiverOfferDTO) => {
    const res = await FreeAgencyService.HCKCancelWaiverWireOffer(dto);
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

  const SaveExtensionOffer = useCallback(async (dto: ExtensionOffer) => {
    const res = await FreeAgencyService.HCKSaveExtensionOffer(dto);
    if (res) {
      enqueueSnackbar("Extension Offer Created!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setProExtensionMap((prevOffers) => {
        const offers = { ...prevOffers };
        offers[res.PlayerID] = new ExtensionOffer({ ...res });
        return offers;
      });
    }
  }, []);

  const CancelExtensionOffer = useCallback(async (dto: ExtensionOffer) => {
    const res = await FreeAgencyService.HCKCancelExtensionOffer(dto);
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
  }, []);

  const SearchHockeyStats = useCallback(async (dto: any) => {
    if (dto.League === SimCHL) {
      const res = await StatsService.HCKCollegeStatsSearch(dto);
      if (dto.ViewType === SEASON_VIEW) {
        setChlPlayerSeasonStats((prev) => {
          return { ...prev, [dto.SeasonID]: res.CHLPlayerSeasonStats };
        });
        setChlTeamSeasonStats((prev) => {
          return {
            ...prev,
            [dto.SeasonID]: res.CHLTeamSeasonStats,
          };
        });
      } else {
        setChlPlayerGameStatsMap((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.CHLPlayerGameStats,
          };
        });
        setChlTeamGameStats((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.CHLTeamGameStats,
          };
        });
      }
    } else {
      const res = await StatsService.HCKProStatsSearch(dto);
      if (dto.ViewType === SEASON_VIEW) {
        setPhlPlayerSeasonStats((prev) => {
          return {
            ...prev,
            [dto.SeasonID]: res.PHLPlayerSeasonStats,
          };
        });
        setPhlTeamSeasonStats((prev) => {
          return {
            ...prev,
            [dto.SeasonID]: res.PHLTeamSeasonStats,
          };
        });
      } else {
        setPhlPlayerGameStats((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.PHLPlayerGameStats,
          };
        });
        setPhlTeamGameStats((prev) => {
          return {
            ...prev,
            [dto.WeekID]: res.PHLTeamGameStats,
          };
        });
      }
    }
  }, []);

  const ExportHockeyStats = useCallback(async (dto: any) => {
    if (dto.League === SimCHL) {
      const res = await StatsService.HCKCollegeStatsExport(dto);
    } else {
      const res = await StatsService.HCKProStatsExport(dto);
    }
  }, []);

  const proposeTrade = useCallback(async (dto: TradeProposal) => {
    const res = await TradeService.HCKCreateTradeProposal(dto as TradeProposal);
    enqueueSnackbar(
      `Sent trade proposal to ${phlTeamMap[dto.RecepientTeamID].TeamName}!`,
      {
        variant: "success",
        autoHideDuration: 3000,
      }
    );
    setTradeProposalsMap((tp) => {
      const team = tp[dto.TeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.TeamID]: [...tp[dto.TeamID], dto],
      };
    });
  }, []);

  const acceptTrade = useCallback(async (dto: TradeProposal) => {
    const res = await TradeService.HCKAcceptTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.TeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.TeamID]: [...tp[dto.TeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const rejectTrade = useCallback(async (dto: TradeProposal) => {
    const res = await TradeService.HCKRejectTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.TeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.TeamID]: [...tp[dto.TeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const cancelTrade = useCallback(async (dto: TradeProposal) => {
    const res = await TradeService.HCKCancelTradeProposal(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.TeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.TeamID]: [...tp[dto.TeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const ExportHCKRoster = useCallback(
    async (teamID: number, isPro: boolean) => {
      if (isPro) {
        await TeamService.ExportPHLRoster(teamID);
      } else {
        await TeamService.ExportCHLRoster(teamID);
      }
    },
    []
  );

  const ExportCHLRecruits = useCallback(async () => {
    await RecruitService.ExportCHLRecruits();
  }, []);

  const syncAcceptedTrade = useCallback(async (dto: TradeProposal) => {
    const res = await TradeService.HCKProcessAcceptedTrade(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.TeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.TeamID]: [...tp[dto.TeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const vetoTrade = useCallback(async (dto: TradeProposal) => {
    const res = await TradeService.HCKVetoAcceptedTrade(dto.ID);

    setTradeProposalsMap((tp) => {
      const team = tp[dto.TeamID];
      if (!team) return tp;
      return {
        ...tp,
        [dto.TeamID]: [...tp[dto.TeamID]].filter((x) => x.ID !== dto.ID),
      };
    });
  }, []);

  const submitCollegePoll = useCallback(async (dto: any) => {
    const res = await CollegePollService.HCKSubmitPoll(dto);
    if (res) {
      setCollegePollSubmission(res);
      enqueueSnackbar(`College Poll Submitted!`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    }
  }, []);

  const scoutPortalAttribute = async (dto: any) => {
    const profile = await RecruitService.HCKScoutPortalAttribute(dto);
    if (profile) {
      setTransferPortalProfiles((profiles) =>
        [...profiles].map((p) =>
          p.CollegePlayerID === profile.CollegePlayerID
            ? new TransferPortalProfile({
                ...profile,
                [dto.Attribute]: true,
              })
            : p
        )
      );
      setTeamProfileMap((prev) => {
        const currentProfile = prev[profile.ProfileID];
        if (!currentProfile) return prev;
        return {
          ...prev,
          [profile.ProfileID]: new RecruitingTeamProfile({
            ...currentProfile,
            WeeklyScoutingPoints: currentProfile.WeeklyScoutingPoints - 1,
          }),
        };
      });
    }
  };

  const updatePointsOnPortalPlayer = (
    id: number,
    name: string,
    points: number
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
          : profile
      );

      // Calculate the total points from the updated profiles.
      const totalPoints = updatedProfiles.reduce(
        (sum, profile) => sum + (profile.CurrentWeeksPoints || 0),
        0
      );

      // Update the recruiting team profile based on the updated points.
      setTeamProfileMap((prevTeamProfiles) => {
        const currentProfile = prevTeamProfiles[chlTeam!.ID];
        if (!currentProfile) return prevTeamProfiles;
        return {
          ...prevTeamProfiles,
          [chlTeam!.ID]: new RecruitingTeamProfile({
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
        TeamAbbreviation: chlTeam?.Abbreviation,
        Recruiter: chlTeam?.Coach,
        SeasonID: hck_Timestamp?.SeasonID,
        ProfileID: chlTeam?.ID,
      };
      const profile =
        await TransferPortalService.HCKCreateTransferPortalProfile(apiDTO);
      if (profile) {
        const newProfile = new TransferPortalProfile({
          ...profile,
          ID: GenerateNumberFromRange(500000, 1000000),
        });
        setTransferPortalProfiles((profiles) => [...profiles, newProfile]);
      }
    },
    [transferPortalProfiles]
  );

  const removeTransferPlayerFromBoard = useCallback(
    async (dto: any) => {
      const profile = await TransferPortalService.HCKRemoveProfileFromBoard(
        dto
      );

      setTransferPortalProfiles((profiles) =>
        [...profiles].filter((p) => p.CollegePlayerID != dto.CollegePlayerID)
      );
    },
    [transferPortalProfiles]
  );

  const saveTransferPortalBoard = useCallback(async () => {
    const dto = {
      Profile: teamProfileMap[chlTeam!.ID],
      Players: teamTransferPortalProfiles,
      TeamID: chlTeam!.ID,
    };
    await TransferPortalService.HCKSaveTransferPortalBoard(dto);
    enqueueSnackbar("Transfer Portal Board Saved!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  }, [teamProfileMap, transferPortalProfiles, chlTeam]);

  const createPromise = useCallback(
    async (dto: any) => {
      const res = await TransferPortalService.HCKCreatePromise(dto);
      if (res) {
        setCollegePromises((promises) => [...promises, dto]);
        enqueueSnackbar("Promise Created!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      }
    },
    [collegePromises]
  );

  const cancelPromise = useCallback(
    async (dto: any) => {
      await TransferPortalService.HCKCancelPromise(dto);

      setCollegePromises((promises) =>
        [...promises].filter((x) => x.CollegePlayerID !== dto.CollegePlayerID)
      );
      enqueueSnackbar("Promise Cancelled!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    },
    [collegePromises]
  );

  const exportTransferPortalPlayers = useCallback(async () => {
    const res = await TransferPortalService.ExportHCKPortal();
  }, []);

  const ExportHockeySchedule = useCallback(async (dto: any) => {
    const res = await scheduleService.HCKTimeslotExport(dto);
  }, []);

  const ExportPlayByPlay = useCallback(async (dto: any) => {
    if (dto.League === SimCHL) {
      const res = await scheduleService.HCKExportCHLPlayByPlay(dto);
    } else {
      const res = await scheduleService.HCKExportPHLPlayByPlay(dto);
    }
  }, []);

  return (
    <SimHCKContext.Provider
      value={{
        hck_Timestamp,
        affiliatePlayers,
        isLoading,
        chlTeam,
        phlTeam,
        chlTeams,
        chlTeamMap,
        chlTeamOptions,
        chlConferenceOptions,
        allCHLStandings,
        currentCHLStandings,
        chlStandingsMap,
        chlRosterMap,
        chlPlayerMap,
        chlGameplan,
        chlLineups,
        chlShootoutLineup,
        phlGameplan,
        phlLineups,
        phlShootoutLineup,
        recruits,
        recruitProfiles,
        teamProfileMap,
        portalPlayers,
        collegeInjuryReport,
        collegeNews,
        allCollegeGames,
        currentCollegeSeasonGames,
        collegeTeamsGames,
        collegeNotifications,
        phlTeams,
        phlTeamOptions,
        phlTeamMap,
        phlConferenceOptions,
        allProStandings,
        currentProStandings,
        proStandingsMap,
        proRosterMap,
        freeAgentOffers,
        waiverOffers,
        capsheetMap,
        proInjuryReport,
        proNews,
        allProGames,
        currentProSeasonGames,
        proTeamsGames,
        proNotifications,
        topCHLGoals,
        topCHLAssists,
        topCHLSaves,
        topPHLGoals,
        topPHLAssists,
        topPHLSaves,
        phlDraftPicks,
        phlDraftPickMap,
        transferPortalProfiles,
        collegePromises,
        collegePromiseMap,
        teamTransferPortalProfiles,
        transferProfileMapByPlayerID,
        removeUserfromCHLTeamCall,
        removeUserfromPHLTeamCall,
        addUserToCHLTeam,
        addUserToPHLTeam,
        cutCHLPlayer,
        redshirtPlayer,
        cutPHLPlayer,
        PlacePHLPlayerOnTradeBlock,
        affiliatePlayer,
        updateCHLRosterMap,
        updateProRosterMap,
        saveCHLGameplan,
        savePHLGameplan,
        saveCHLAIGameplan,
        savePHLAIGameplan,
        addRecruitToBoard,
        removeRecruitFromBoard,
        updatePointsOnRecruit,
        toggleScholarship,
        scoutCrootAttribute,
        SaveRecruitingBoard,
        ExportHockeySchedule,
        ExportPlayByPlay,
        playerFaces,
        proContractMap,
        proExtensionMap,
        SaveAIRecruitingSettings,
        SaveFreeAgencyOffer,
        CancelFreeAgencyOffer,
        SaveWaiverWireOffer,
        CancelWaiverWireOffer,
        SaveExtensionOffer,
        CancelExtensionOffer,
        chlPlayerGameStatsMap,
        chlPlayerSeasonStatsMap,
        chlTeamGameStatsMap,
        chlTeamSeasonStatsMap,
        phlPlayerGameStatsMap,
        phlPlayerSeasonStatsMap,
        phlTeamGameStatsMap,
        phlTeamSeasonStatsMap,
        SearchHockeyStats,
        ExportHockeyStats,
        tradeProposalsMap,
        tradePreferencesMap,
        proposeTrade,
        acceptTrade,
        rejectTrade,
        cancelTrade,
        syncAcceptedTrade,
        vetoTrade,
        individualDraftPickMap,
        proPlayerMap,
        ExportHCKRoster,
        ExportCHLRecruits,
        collegePolls,
        collegePollSubmission,
        submitCollegePoll,
        getBootstrapNewsData,
        addTransferPlayerToBoard,
        removeTransferPlayerFromBoard,
        saveTransferPortalBoard,
        createPromise,
        cancelPromise,
        exportTransferPortalPlayers,
        scoutPortalAttribute,
        updatePointsOnPortalPlayer,
        collegeGamesMapBySeason,
        proGamesMapBySeason,
        collegePollsBySeason,
        collegeStandingsMapBySeason,
        proStandingsMapBySeason,
      }}
    >
      {children}
    </SimHCKContext.Provider>
  );
};

export const useSimHCKStore = () => {
  const store = useContext(SimHCKContext);
  return store;
};
