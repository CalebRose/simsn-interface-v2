import {
  createContext,
  ReactNode,
  useCallback,
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
  SaveRecruitingBoard: () => Promise<void>;
  SaveAIRecruitingSettings: (dto: TeamRecruitingProfile) => Promise<void>;
  SearchBasketballStats: (dto: any) => Promise<void>;
  ExportBasketballStats: (dto: any) => Promise<void>;
  ExportCBBRecruits: () => Promise<void>;
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
  SearchBasketballStats: async () => {},
  ExportBasketballStats: async () => {},
  ExportCBBRecruits: async () => {},
};

export const SimBBAContext = createContext<SimBBAContextProps>(defaultContext);

// ✅ Define Props for Provider
interface SimBBAProviderProps {
  children: ReactNode;
}

export const SimBBAProvider: React.FC<SimBBAProviderProps> = ({ children }) => {
  const { currentUser } = useAuthStore();
  const { cbb_Timestamp, setCBB_Timestamp } = useWebSockets(bba_ws, SimBBA);
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
  const [recruitProfiles, setRecruitProfiles] = useState<
    PlayerRecruitProfile[]
  >([]);
  const [teamProfileMap, setTeamProfileMap] = useState<Record<
    number,
    TeamRecruitingProfile
  > | null>({});
  const [portalPlayers, setPortalPlayers] = useState<TransferPlayerResponse[]>(
    []
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
  const [freeAgentOffers, setFreeAgentOffers] = useState<NBAContractOffer[]>(
    []
  );
  const [waiverOffers, setWaiverOffers] = useState<NBAWaiverOffer[]>([]);
  const [gLeaguePlayers, setGLeaguePlayers] = useState<NBAPlayer[]>([]);
  const [internationalPlayers, setInternationalPlayers] = useState<NBAPlayer[]>(
    []
  );
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

  useEffect(() => {
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
    // if the user has no basketball teams, skip all BBA bootstrapping
    if (cbbID == 0 && nbaID == 0) {
      isFetching.current = false;
      return;
    }
    const res = await BootstrapService.GetBBABootstrapTeamData();
    setCBBTeams(res.AllCollegeTeams);
    const sortedProTeams = res.AllProTeams.sort(
      (a, b) => a.ConferenceID - b.ConferenceID
    );
    setNBATeams(sortedProTeams);
    if (res.AllCollegeTeams.length > 0) {
      const sortedCollegeTeams = res.AllCollegeTeams.sort((a, b) =>
        a.Team.localeCompare(b.Team)
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
      const sortedNBATeams = sortedProTeams.sort(
        (a, b) =>
          a.Team.localeCompare(b.Team) && a.ConferenceID - b.ConferenceID
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
    if (cbbID > 0) {
      setCBBTeam(res.CollegeTeam);
      setCollegeInjuryReport(res.CollegeInjuryReport);
      setCollegeNotifications(res.CollegeNotifications);
      setCBBRosterMap(res.CollegeRosterMap);
      setPortalPlayers(res.PortalPlayers);
      setCollegeGameplan(res.CollegeGameplan);
      setTopCBBPoints(res.TopCBBPoints);
      setTopCBBAssists(res.TopCBBAssists);
      setTopCBBRebounds(res.TopCBBRebounds);
    }
    if (nbaID > 0) {
      setNBATeam(res.NBATeam);
      setProNotifications(res.ProNotifications);
      setNBAGameplan(res.NBAGameplan);
    }

    setPlayerFaces(res.FaceData);
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
    if (cbbID > 0) {
      setCollegeNews(res.CollegeNews);
      setTeamProfileMap(res.TeamProfileMap);
      setAllCBBStandings(res.CollegeStandings);
    }
    if (nbaID > 0) {
      setTopNBAPoints(res.TopNBAPoints);
      setTopNBAAssists(res.TopNBAAssists);
      setTopNBARebounds(res.TopNBARebounds);
      setCapsheetMap(res.CapsheetMap);
      setProRosterMap(res.ProRosterMap);
      setGLeaguePlayers(res.GLeaguePlayers);
      setInternationalPlayers(res.InternationalPlayers);
      setProInjuryReport(res.ProInjuryReport);
      setAllProStandings(res.ProStandings);
    }

    if (
      res.CollegeStandings &&
      res.CollegeStandings.length > 0 &&
      cbb_Timestamp
    ) {
      const currentSeasonStandings = res.CollegeStandings.filter(
        (x) => x.SeasonID === cbb_Timestamp.SeasonID
      );
      const collegeStandingsMap = Object.fromEntries(
        currentSeasonStandings.map((standings) => [standings.TeamID, standings])
      );
      setCurrentCBBStandings(currentSeasonStandings);
      setCBBStandingsMap(collegeStandingsMap);
    }

    if (res.ProStandings && res.ProStandings.length > 0 && cbb_Timestamp) {
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
    if (cbbID > 0) {
      setRecruits(res.Recruits);
      setRecruitProfiles(res.RecruitProfiles);
      setAllCollegeGames(res.AllCollegeGames);
    }

    if (nbaID > 0) {
      setProNews(res.ProNews);
      setFreeAgentOffers(res.FreeAgentOffers);
      setWaiverOffers(res.WaiverOffers);
      setProContractMap(res.ContractMap);
      setProExtensionMap(res.ExtensionMap);
      setAllProGames(res.AllProGames);
    }

    if (
      res.AllCollegeGames &&
      res.AllCollegeGames.length > 0 &&
      cbb_Timestamp
    ) {
      const currentSeasonGames = res.AllCollegeGames.filter(
        (x) => x.SeasonID === cbb_Timestamp.SeasonID
      );
      setCurrentCollegeSeasonGames(currentSeasonGames);
      const teamGames = currentSeasonGames.filter(
        (x) => x.HomeTeamID === cbbID || x.AwayTeamID === cbbID
      );
      setCollegeTeamsGames(teamGames);
    }

    if (res.AllProGames && res.AllProGames.length > 0 && cbb_Timestamp) {
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
    [cbbTeams]
  );

  const removeUserfromNBATeamCall = useCallback(
    async (request: NBARequest) => {
      const res = await TeamService.RemoveUserFromNBATeam(
        request.NBATeamID,
        request
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
    [nbaTeams]
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
          }
        );
      }
      setCBBTeams(teams);
    },
    [cbbTeams]
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
          }
        );
      }
      setNBATeams(teams);
    },
    [nbaTeams]
  );

  const cutCBBPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.CutCBBPlayer(playerID);
      const rosterMap = { ...cbbRosterMap };
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID
      );
      setCBBRosterMap(rosterMap);
    },
    [cbbRosterMap]
  );
  const redshirtPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.RedshirtCBBPlayer(playerID);
      const rosterMap = { ...cbbRosterMap };
      const playerIDX = rosterMap[teamID].findIndex(
        (player) => player.ID === playerID
      );
      if (playerIDX > -1) {
        rosterMap[teamID][playerIDX].IsRedshirting = true;
        setCBBRosterMap(rosterMap);
      }
    },
    [cbbRosterMap]
  );
  const promisePlayer = useCallback(
    async (playerID: number, teamID: number) => {},
    [cbbRosterMap]
  );
  const cutNBAPlayer = useCallback(
    async (playerID: number, teamID: number) => {
      const res = await PlayerService.CutNBAPlayer(playerID);
      const rosterMap = { ...proRosterMap };
      rosterMap[teamID] = rosterMap[teamID].filter(
        (player) => player.ID !== playerID
      );
      setProRosterMap(rosterMap);
    },
    [proRosterMap]
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
          (x) => x.RecruitID === apiDTO.RecruitID
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
        [...profiles].filter((p) => p.RecruitID != dto.RecruitID)
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
            : p
        )
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
          : profile
      );

      // Calculate the total points from the updated profiles.
      const totalPoints = updatedProfiles.reduce(
        (sum, profile) => sum + (profile.CurrentWeeksPoints || 0),
        0
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
    [cbbTeamMap]
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
    []
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
        SearchBasketballStats,
        ExportBasketballStats,
        ExportCBBRecruits,
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
