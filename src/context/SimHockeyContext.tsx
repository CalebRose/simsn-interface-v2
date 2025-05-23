import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  updatePointsOnRecruit: (id: number, name: string, points: number) => void;
  removeUserfromCHLTeamCall: (teamID: number) => Promise<void>;
  removeUserfromPHLTeamCall: (request: ProTeamRequest) => Promise<void>;
  addUserToCHLTeam: (teamID: number, user: string) => void;
  addUserToPHLTeam: (teamID: number, user: string, role: string) => void;
  cutCHLPlayer: (playerID: number, teamID: number) => Promise<void>;
  cutPHLPlayer: (playerID: number, teamID: number) => Promise<void>;
  affiliatePlayer: (playerID: number, teamID: number) => Promise<void>;
  redshirtPlayer: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer: (playerID: number, teamID: number) => Promise<void>;
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
  SaveFreeAgencyOffer: (dto: any) => Promise<void>;
  CancelFreeAgencyOffer: (dto: any) => Promise<void>;
  SaveWaiverWireOffer: (dto: any) => Promise<void>;
  CancelWaiverWireOffer: (dto: any) => Promise<void>;
  SaveRecruitingBoard: () => Promise<void>;
  SaveAIRecruitingSettings: (dto: UpdateRecruitingBoardDTO) => Promise<void>;
  SearchHockeyStats: (dto: any) => Promise<void>;
  ExportHockeyStats: (dto: any) => Promise<void>;
  ExportHCKRoster: (teamID: number, isPro: boolean) => Promise<void>;
  ExportCHLRecruits: () => Promise<void>;
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
  removeUserfromCHLTeamCall: async () => {},
  removeUserfromPHLTeamCall: async () => {},
  addUserToCHLTeam: () => {},
  addUserToPHLTeam: () => {},
  cutCHLPlayer: async () => {},
  cutPHLPlayer: async () => {},
  affiliatePlayer: async () => {},
  redshirtPlayer: async () => {},
  promisePlayer: async () => {},
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
  SearchHockeyStats: async () => {},
  ExportHockeyStats: async () => {},
  ExportHCKRoster: async () => {},
  ExportCHLRecruits: async () => {},
  PlacePHLPlayerOnTradeBlock: async () => {},
  proposeTrade: async () => {},
  acceptTrade: async () => {},
  rejectTrade: async () => {},
  cancelTrade: async () => {},
  syncAcceptedTrade: async () => {},
  vetoTrade: async () => {},
  submitCollegePoll: async () => {},
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
  const { hck_Timestamp } = useWebSockets(hck_ws, SimHCK);
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
  const [currentCHLStandings, setCurrentCHLStandings] = useState<
    CollegeStandings[]
  >([]);
  const [chlStandingsMap, setCHLStandingsMap] = useState<
    Record<number, CollegeStandings>
  >({});
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
  const [currentCollegeSeasonGames, setCurrentCollegeSeasonGames] = useState<
    CollegeGame[]
  >([]);
  const [collegeTeamsGames, setCollegeTeamsGames] = useState<CollegeGame[]>([]);
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
  const [currentProStandings, setCurrentProStandings] = useState<
    ProfessionalStandings[]
  >([]);
  const [proStandingsMap, setProStandingsMap] = useState<
    Record<number, ProfessionalStandings>
  >({});
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
  const [currentProSeasonGames, setCurrentProSeasonGames] = useState<
    ProfessionalGame[]
  >([]);
  const [proTeamsGames, setProTeamsGames] = useState<ProfessionalGame[]>([]);
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

    for (let i = 0; i < phlTeams.length; i++) {
      const team = phlTeams[i];
      const roster = proRosterMap[team.ID];
      for (let j = 0; j < roster.length; j++) {
        const p = roster[j];
        playerMap[p.ID] = p;
      }
    }
    const freeAgents = proRosterMap[0];
    if (freeAgents) {
      for (let i = 0; i < freeAgents.length; i++) {
        const p = freeAgents[i];
        playerMap[p.ID] = p;
      }
    }

    return playerMap;
  }, [proRosterMap, phlTeams]);

  useEffect(() => {
    if (currentUser && hck_Timestamp) {
      getBootstrapData();
    }
  }, [currentUser, hck_Timestamp]);

  const getBootstrapData = async () => {
    let chlid = 0;
    let phlid = 0;
    if (currentUser && currentUser.CHLTeamID) {
      chlid = currentUser.CHLTeamID;
    }
    if (currentUser && currentUser.PHLTeamID) {
      phlid = currentUser.PHLTeamID;
    }
    const res = await BootstrapService.GetHCKBootstrapData(chlid, phlid);
    setCHLTeams(res.AllCollegeTeams);
    setProTeams(res.AllProTeams);
    setAllCollegeGames(res.AllCollegeGames);
    setAllProGames(res.AllProGames);
    setCapsheetMap(res.CapsheetMap);
    setCollegeInjuryReport(res.CollegeInjuryReport);
    setProInjuryReport(res.ProInjuryReport);
    setCHLTeam(res.CollegeTeam);
    setPHLTeam(res.ProTeam);
    setCollegeNews(res.CollegeNews);
    setProNews(res.ProNews);
    setCollegePolls(res.OfficialPolls);
    setCollegePollSubmission(res.CollegePoll);
    setCollegeNotifications(res.CollegeNotifications);
    setAllCHLStandings(res.CollegeStandings);
    setCHLGameplan(res.CHLGameplan);
    setCHLLineups(res.CollegeTeamLineups);
    setPHLLineups(res.ProTeamLineups);
    setPHLGameplan(res.PHLGameplan);
    setCHLShootoutLineup(res.CollegeTeamShootoutLineup);
    setPHLShootoutLineup(res.ProTeamShootoutLineup);
    setAllProStandings(res.ProStandings);
    setTeamProfileMap(res.TeamProfileMap);
    setCHLRosterMap(res.CollegeRosterMap);
    setProRosterMap(res.ProRosterMap);
    setFreeAgentOffers(res.FreeAgentOffers);
    setWaiverOffers(res.WaiverWireOffers);
    setAffiliatePlayers(res.AffiliatePlayers);
    setPortalPlayers(res.PortalPlayers);
    setRecruits(res.Recruits);
    setRecruitProfiles(res.RecruitProfiles);
    setProNotifications(res.ProNotifications);
    setPlayerFaces(res.FaceData);
    setProContractMap(res.ContractMap);
    setProExtensionMap(res.ExtensionMap);
    setTopCHLGoals(res.TopCHLGoals);
    setTopCHLAssists(res.TopCHLAssists);
    setTopCHLSaves(res.TopCHLSaves);
    setTopPHLGoals(res.TopPHLGoals);
    setTopPHLAssists(res.TopPHLAssists);
    setTopPHLSaves(res.TopPHLSaves);
    setTradeProposalsMap(res.ProTradeProposalMap);
    setTradePreferencesMap(res.ProTradePreferenceMap);
    setPHLDraftPicks(res.DraftPicks);

    if (res.AllCollegeGames.length > 0 && hck_Timestamp) {
      const currentSeasonGames = res.AllCollegeGames.filter(
        (x) => x.SeasonID === hck_Timestamp.SeasonID
      );
      setCurrentCollegeSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === chlid || x.AwayTeamID === chlid
      );
      setCollegeTeamsGames(teamGames);
    }
    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.TeamName.localeCompare(b.TeamName)
      );
      const chlTeamOptions = sortedCollegeTeams.map((team) => ({
        label: team.TeamName,
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
    if (res.CollegeStandings.length > 0 && hck_Timestamp) {
      const currentSeasonStandings = res.CollegeStandings.filter(
        (x) => x.SeasonID === hck_Timestamp.SeasonID
      );
      const collegeStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standing) => [standing.TeamID, standing])
      );
      setCurrentCHLStandings(currentSeasonStandings);
      setCHLStandingsMap(collegeStandingsMap);
    }

    if (res.AllProGames.length > 0 && hck_Timestamp) {
      const currentSeasonGames = res.AllProGames.filter(
        (x) => x.SeasonID === hck_Timestamp.SeasonID
      );
      setCurrentProSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === chlid || x.AwayTeamID === chlid
      );
      setProTeamsGames(teamGames);
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
    if (res.ProStandings.length > 0 && hck_Timestamp) {
      const currentSeasonStandings = res.ProStandings.filter(
        (x) => x.SeasonID === hck_Timestamp.SeasonID
      );
      const proStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standing) => [standing.TeamID, standing])
      );
      setCurrentProStandings(currentSeasonStandings);
      setProStandingsMap(proStandingsMap);
    }
    setIsLoading(false);
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
      const res = await PlayerService.CutCHLPlayer(playerID);
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
  const promisePlayer = useCallback(
    async (playerID: number, teamID: number) => {},
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
          let currentProfile = prevTeamProfiles[chlTeam!.ID];
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
        removeUserfromCHLTeamCall,
        removeUserfromPHLTeamCall,
        addUserToCHLTeam,
        addUserToPHLTeam,
        cutCHLPlayer,
        redshirtPlayer,
        promisePlayer,
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
        playerFaces,
        proContractMap,
        proExtensionMap,
        SaveAIRecruitingSettings,
        SaveFreeAgencyOffer,
        CancelFreeAgencyOffer,
        SaveWaiverWireOffer,
        CancelWaiverWireOffer,
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
