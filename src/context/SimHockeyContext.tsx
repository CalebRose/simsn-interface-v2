import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
  FreeAgencyResponse,
  ProTeamRequest,
  Timestamp,
  CollegeLineup,
  CollegeShootoutLineup,
  ProfessionalLineup,
  ProfessionalShootoutLineup,
  RecruitPlayerProfile,
  FaceDataResponse,
  ProContract,
  ExtensionOffer
} from "../models/hockeyModels";
import { TeamService } from "../_services/teamService";
import {
  Coach,
  GM,
  Marketing,
  Owner,
  Scout,
  SimHCK,
} from "../_constants/constants";
import { hck_ws } from "../_constants/urls";
import { PlayerService } from "../_services/playerService";
import { GameplanService } from "../_services/gameplanService";

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
  chlLineups: CollegeLineup[];
  chlShootoutLineup: CollegeShootoutLineup;
  phlLineups: ProfessionalLineup[];
  phlShootoutLineup: ProfessionalShootoutLineup;
  recruits: Croot[]; // Replace with a more specific type if available
  recruitProfiles: RecruitPlayerProfile[];
  teamProfileMap: Record<number, RecruitingTeamProfile>;
  portalPlayers: CollegePlayer[]; // Replace with a more specific type if available
  collegeInjuryReport: CollegePlayer[];
  collegeNews: NewsLog[];
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
  freeAgency: FreeAgencyResponse | null;
  capsheetMap: Record<number, ProCapsheet>;
  proInjuryReport: ProfessionalPlayer[];
  proNews: NewsLog[];
  allProGames: ProfessionalGame[];
  currentProSeasonGames: ProfessionalGame[];
  proTeamsGames: ProfessionalGame[];
  proNotifications: Notification[];
  removeUserfromCHLTeamCall: (teamID: number) => Promise<void>;
  removeUserfromPHLTeamCall: (request: ProTeamRequest) => Promise<void>;
  addUserToCHLTeam: (teamID: number, user: string) => void;
  addUserToPHLTeam: (teamID: number, user: string, role: string) => void;
  cutCHLPlayer: (playerID: number, teamID: number) => Promise<void>;
  cutPHLPlayer: (playerID: number, teamID: number) => Promise<void>;
  redshirtPlayer: (playerID: number, teamID: number) => Promise<void>;
  promisePlayer: (playerID: number, teamID: number) => Promise<void>;
  updateCHLRosterMap: (newMap: Record<number, CollegePlayer[]>) => void;
  saveCHLGameplan: (dto: any) => Promise<void>;
  savePHLGameplan: (dto: any) => Promise<void>;
  playerFaces: {
    [key: number]: FaceDataResponse;
  };
  proContractMap: Record<number, ProContract> | null;
  proExtensionMap: Record<number, ExtensionOffer> | null;
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
  chlLineups: [],
  chlShootoutLineup: {} as CollegeShootoutLineup,
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
  freeAgency: null,
  capsheetMap: {},
  proInjuryReport: [],
  proNews: [],
  allProGames: [],
  currentProSeasonGames: [],
  proTeamsGames: [],
  proNotifications: [],
  removeUserfromCHLTeamCall: async () => {},
  removeUserfromPHLTeamCall: async () => {},
  addUserToCHLTeam: () => {},
  addUserToPHLTeam: () => {},
  cutCHLPlayer: async () => {},
  cutPHLPlayer: async () => {},
  redshirtPlayer: async () => {},
  promisePlayer: async () => {},
  updateCHLRosterMap: () => {},
  saveCHLGameplan: async () => {},
  savePHLGameplan: async () => {},
  playerFaces: {},
  proContractMap: {},
  proExtensionMap: {},
};

// ✅ Create the context
export const SimHCKContext = createContext<SimHCKContextProps>(defaultContext);

// ✅ Define the provider props
interface SimHCKProviderProps {
  children: ReactNode;
}

export const SimHCKProvider: React.FC<SimHCKProviderProps> = ({ children }) => {
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
  const [chlLineups, setCHLLineups] = useState<CollegeLineup[]>([]);
  const [chlShootoutLineup, setCHLShootoutLineup] =
    useState<CollegeShootoutLineup>({} as CollegeShootoutLineup);
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
  const [freeAgency, setFreeAgency] = useState<FreeAgencyResponse | null>(null);
  const [capsheetMap, setCapsheetMap] = useState<Record<number, ProCapsheet>>(
    {}
  );
  const [proInjuryReport, setProInjuryReport] = useState<ProfessionalPlayer[]>(
    []
  );
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
  const [proContractMap, setProContractMap] = useState<Record<number, ProContract> | null>({});
  const [proExtensionMap, setProExtensionMap] = useState<Record<number, ExtensionOffer> | null>({});

  useEffect(() => {
    if (currentUser) {
      getBootstrapData();
    }
  }, [currentUser]);

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
    console.log(res)
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
    setCollegeNotifications(res.CollegeNotifications);
    setAllCHLStandings(res.CollegeStandings);
    setCHLLineups(res.CollegeTeamLineups);
    setCHLShootoutLineup(res.CollegeTeamShootoutLineup);
    setAllProStandings(res.ProStandings);
    setTeamProfileMap(res.TeamProfileMap);
    setCHLRosterMap(res.CollegeRosterMap);
    setProRosterMap(res.ProRosterMap);
    setFreeAgency(res.FreeAgency);
    setPortalPlayers(res.PortalPlayers);
    setRecruits(res.Recruits);
    setRecruitProfiles(res.RecruitProfiles);
    setProNotifications(res.ProNotifications);
    setPlayerFaces(res.FaceData);
    setProContractMap(res.ContractMap);
    setProExtensionMap(res.ExtensionMap);

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

  const updateCHLRosterMap = (newMap: Record<number, CollegePlayer[]>) => {
    setCHLRosterMap(newMap);
  };

  const saveCHLGameplan = async (dto: any) => {
    const res = await GameplanService.SaveCHLGameplan(dto);
    setCHLLineups(dto.CHLLineups);
    setCHLShootoutLineup(dto.CHLShootoutLineup);
  };

  const savePHLGameplan = async (dto: any) => {
    const res = await GameplanService.SaveCHLGameplan(dto);
    setPHLLineups(dto.CHLLineups);
    setPHLShootoutLineup(dto.CHLShootoutLineup);
  };

  return (
    <SimHCKContext.Provider
      value={{
        hck_Timestamp,
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
        chlLineups,
        chlShootoutLineup,
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
        freeAgency,
        capsheetMap,
        proInjuryReport,
        proNews,
        allProGames,
        currentProSeasonGames,
        proTeamsGames,
        proNotifications,
        removeUserfromCHLTeamCall,
        removeUserfromPHLTeamCall,
        addUserToCHLTeam,
        addUserToPHLTeam,
        cutCHLPlayer,
        redshirtPlayer,
        promisePlayer,
        cutPHLPlayer,
        updateCHLRosterMap,
        saveCHLGameplan,
        savePHLGameplan,
        playerFaces,
        proContractMap,
        proExtensionMap
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
