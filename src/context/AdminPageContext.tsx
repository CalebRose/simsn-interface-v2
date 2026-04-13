import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CollegeTeamRequest,
  ProTeamRequest,
  TeamRequestsResponse as HCKRequestResponse,
  TradeProposal as HCKTradeProposal,
} from "../models/hockeyModels";
import {
  NFLRequest,
  TeamRequest as CFBRequest,
  TeamRequestsResponse as FBARequestResponse,
  NFLTradeProposal,
} from "../models/footballModels";
import {
  League,
  Requests,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../_constants/constants";
import {
  Request as CBBRequest,
  NBARequest,
  NBATeam,
  NBATradeProposal,
} from "../models/basketballModels";
import {
  CollegeBaseballTeamRequest,
  MLBTeamRequest,
} from "../models/baseball/baseballModels";
import { TradeProposal as BaseballTradeProposal } from "../models/baseball/baseballTradeModels";
import { useLeagueStore } from "./LeagueContext";
import { RequestService } from "../_services/requestService";
import { BaseballService } from "../_services/baseballService";
import { updateUserByUsername } from "../firebase/firestoreHelper";
import { useSimHCKStore } from "./SimHockeyContext";
import { useSimFBAStore } from "./SimFBAContext";
import { useSimBBAStore } from "./SimBBAContext";

interface AdminPageContextType {
  hckCHLRequests: CollegeTeamRequest[];
  hckPHLRequests: ProTeamRequest[];
  hckTradeProposals: HCKTradeProposal[];
  refreshHCKTradeProposals: (id: number) => void;
  acceptCHLRequest: (request: CollegeTeamRequest) => Promise<void>;
  rejectCHLRequest: (request: CollegeTeamRequest) => Promise<void>;
  acceptPHLRequest: (request: ProTeamRequest) => Promise<void>;
  rejectPHLRequest: (request: ProTeamRequest) => Promise<void>;
  acceptCBBRequest: (request: CBBRequest) => Promise<void>;
  rejectCBBRequest: (request: CBBRequest) => Promise<void>;
  acceptNBARequest: (request: NBARequest) => Promise<void>;
  rejectNBARequest: (request: NBARequest) => Promise<void>;
  acceptCFBRequest: (request: CFBRequest) => Promise<void>;
  rejectCFBRequest: (request: CFBRequest) => Promise<void>;
  acceptNFLRequest: (request: NFLRequest) => Promise<void>;
  rejectNFLRequest: (request: NFLRequest) => Promise<void>;
  fbaCFBRequests: CFBRequest[];
  fbaNFLRequests: NFLRequest[];
  fbaTradeProposals: NFLTradeProposal[];
  bbaCBBRequests: CBBRequest[];
  bbaNBARequests: NBARequest[];
  bbaTradeProposals: NBATradeProposal[];
  baseballCBRequests: CollegeBaseballTeamRequest[];
  baseballMLBRequests: MLBTeamRequest[];
  baseballTradeProposals: BaseballTradeProposal[];
  refreshBaseballTradeProposals: () => Promise<void>;
  acceptCBBaseballRequest: (
    request: CollegeBaseballTeamRequest,
  ) => Promise<void>;
  rejectCBBaseballRequest: (
    request: CollegeBaseballTeamRequest,
  ) => Promise<void>;
  acceptMLBRequest: (request: MLBTeamRequest) => Promise<void>;
  rejectMLBRequest: (request: MLBTeamRequest) => Promise<void>;
  selectedTab: string;
  setSelectedTab: Dispatch<SetStateAction<string>>;
  RefreshRequests: () => Promise<void>;
}

const AdminPageContext = createContext<AdminPageContextType | undefined>(
  undefined,
);

interface AdminPageProviderProps {
  children: ReactNode;
}

export const AdminPageProvider: React.FC<AdminPageProviderProps> = ({
  children,
}) => {
  const leagueStore = useLeagueStore();
  const { selectedLeague } = leagueStore;
  const [selectedTab, setSelectedTab] = useState(Requests);
  const [hckCHLRequests, setHCKCHLRequests] = useState<CollegeTeamRequest[]>(
    [],
  );
  const [hckPHLRequests, setHCKPHLRequests] = useState<ProTeamRequest[]>([]);
  const [hckTradeProposals, setHCKTradePropsals] = useState<HCKTradeProposal[]>(
    [],
  );
  const [fbaCFBRequests, setFBACFBRequests] = useState<CFBRequest[]>([]);
  const [fbaNFLRequests, setFBANFLRequests] = useState<NFLRequest[]>([]);
  const [fbaTradeProposals, setFBATradePropsals] = useState<NFLTradeProposal[]>(
    [],
  );
  const [bbaCBBRequests, setBBACBBRequests] = useState<CBBRequest[]>([]);
  const [bbaNBARequests, setBBANBARequests] = useState<NBARequest[]>([]);
  const [bbaTradeProposals, setBBATradePropsals] = useState<NBATradeProposal[]>(
    [],
  );
  const [baseballCBRequests, setBaseballCBRequests] = useState<
    CollegeBaseballTeamRequest[]
  >([]);
  const [baseballMLBRequests, setBaseballMLBRequests] = useState<
    MLBTeamRequest[]
  >([]);
  const [baseballTradeProposals, setBaseballTradeProposals] = useState<
    BaseballTradeProposal[]
  >([]);

  const { addUserToCHLTeam, addUserToPHLTeam } = useSimHCKStore();
  const {
    addUserToCFBTeam,
    addUserToNFLTeam,
    cfbTeamMap,
    proTeamMap,
    setNFLDraftPicks,
  } = useSimFBAStore();
  const { addUserToCBBTeam, addUserToNBATeam, cbbTeamMap, nbaTeamMap } =
    useSimBBAStore();

  useEffect(() => {
    if (
      (selectedLeague === SimCFB || selectedLeague === SimNFL) &&
      (fbaCFBRequests.length === 0 || fbaNFLRequests.length === 0)
    ) {
      getFootballRequests();
    }
    if (
      (selectedLeague === SimCBB || selectedLeague === SimNBA) &&
      (bbaCBBRequests.length === 0 || bbaNBARequests.length === 0)
    ) {
      getBasketballRequests();
    }
    if (
      (selectedLeague === SimCHL || selectedLeague === SimPHL) &&
      (hckCHLRequests.length === 0 || hckPHLRequests.length === 0)
    ) {
      getHockeyRequests();
    }
    if (
      (selectedLeague === SimCollegeBaseball || selectedLeague === SimMLB) &&
      (baseballCBRequests.length === 0 || baseballMLBRequests.length === 0)
    ) {
      getBaseballRequests();
      getBaseballTradeProposals();
    }
  }, [selectedLeague]);

  const getHockeyRequests = async () => {
    const res = await RequestService.GetLeagueRequests(
      selectedLeague as League,
    );
    const model = res as HCKRequestResponse;
    setHCKCHLRequests(model.CollegeRequests);
    setHCKPHLRequests(model.ProRequest);
    setHCKTradePropsals(model.AcceptedTrades);
  };
  const getFootballRequests = async () => {
    const res = await RequestService.GetLeagueRequests(
      selectedLeague as League,
    );
    const model = res as FBARequestResponse;
    const filteredCFBRequests = model.CollegeRequests.filter(
      (req) => req.TeamID > 0,
    );
    setFBACFBRequests(filteredCFBRequests);
    setFBANFLRequests(model.ProRequests);
    setFBATradePropsals(model.AcceptedTrades);
    setNFLDraftPicks(model.DraftPicks);
  };
  const getBasketballRequests = async () => {
    const res = await RequestService.GetCBBTeamRequests();
    if (res) {
      setBBACBBRequests(res);
    }
    const nbaRes = await RequestService.GetNBATeamRequests();
    if (nbaRes) {
      setBBANBARequests(nbaRes);
    }
  };

  const getBaseballRequests = async () => {
    const cbRes = await RequestService.GetLeagueRequests(
      SimCollegeBaseball as League,
    );
    if (cbRes) {
      setBaseballCBRequests(Array.isArray(cbRes) ? cbRes : []);
    }
    const mlbRes = await RequestService.GetLeagueRequests(SimMLB as League);
    if (mlbRes) {
      setBaseballMLBRequests(Array.isArray(mlbRes) ? mlbRes : []);
    }
  };

  const getBaseballTradeProposals = async () => {
    try {
      const proposals = await BaseballService.GetAllTradeProposals();
      if (proposals) {
        setBaseballTradeProposals(Array.isArray(proposals) ? proposals : []);
      }
    } catch (e) {
      console.error("Failed to load baseball trade proposals", e);
    }
  };

  const refreshBaseballTradeProposals = useCallback(async () => {
    await getBaseballTradeProposals();
  }, []);

  const acceptCBBaseballRequest = useCallback(
    async (request: CollegeBaseballTeamRequest) => {
      await RequestService.ApproveCollegeBaseballRequest(request);
      setBaseballCBRequests((prev) =>
        prev.filter((req) => req.ID !== request.ID),
      );
    },
    [baseballCBRequests],
  );

  const rejectCBBaseballRequest = useCallback(
    async (request: CollegeBaseballTeamRequest) => {
      await RequestService.RejectCollegeBaseballRequest(request);
      setBaseballCBRequests((prev) =>
        prev.filter((req) => req.ID !== request.ID),
      );
    },
    [baseballCBRequests],
  );

  const acceptMLBRequest = useCallback(
    async (request: MLBTeamRequest) => {
      await RequestService.ApproveMLBRequest(request);
      setBaseballMLBRequests((prev) =>
        prev.filter((req) => req.ID !== request.ID),
      );
    },
    [baseballMLBRequests],
  );

  const rejectMLBRequest = useCallback(
    async (request: MLBTeamRequest) => {
      await RequestService.RejectMLBRequest(request);
      setBaseballMLBRequests((prev) =>
        prev.filter((req) => req.ID !== request.ID),
      );
    },
    [baseballMLBRequests],
  );

  const acceptCHLRequest = useCallback(
    async (request: CollegeTeamRequest) => {
      const res = await RequestService.ApproveCHLRequest(request);

      setHCKCHLRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
      const payload = {
        username: request.Username,
        CHLTeamID: request.TeamID,
      };
      addUserToCHLTeam(request.TeamID, request.Username);
      await updateUserByUsername(request.Username, payload);
    },
    [hckCHLRequests],
  );

  const rejectCHLRequest = useCallback(
    async (request: CollegeTeamRequest) => {
      const res = await RequestService.RejectCHLRequest(request);
      setHCKCHLRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
    },
    [hckCHLRequests],
  );

  const acceptPHLRequest = useCallback(
    async (request: ProTeamRequest) => {
      const res = await RequestService.ApprovePHLRequest(request);
      setHCKPHLRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
      const payload = {
        username: request.Username,
        PHLTeamID: request.TeamID,
        PHLRole: request.Role,
      };
      addUserToPHLTeam(request.TeamID, request.Username, request.Role);
      await updateUserByUsername(request.Username, payload);
    },
    [hckPHLRequests],
  );

  const rejectPHLRequest = useCallback(
    async (request: ProTeamRequest) => {
      const res = await RequestService.RejectPHLRequest(request);
      setHCKPHLRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
    },
    [hckPHLRequests],
  );

  const acceptCBBRequest = useCallback(
    async (request: CBBRequest) => {
      const team = cbbTeamMap![request.TeamID];
      if (!team) {
        console.error(`Team with ID ${request.TeamID} not found in cbbTeamMap`);
        return;
      }
      const res = await RequestService.ApproveCBBRequest(request);

      setBBACBBRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
      const payload = {
        username: request.Username,
        cbb_id: request.TeamID,
        cbb_abbr: team.Abbr,
        cbb_team: team.Team,
      };
      addUserToCBBTeam(request.TeamID, request.Username);
      await updateUserByUsername(request.Username, payload);
    },
    [bbaCBBRequests, cbbTeamMap],
  );

  const rejectCBBRequest = useCallback(
    async (request: CBBRequest) => {
      const res = await RequestService.RejectCBBTeamRequest(request);
      setBBACBBRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
    },
    [bbaCBBRequests],
  );

  const acceptNBARequest = useCallback(
    async (request: NBARequest) => {
      const team = nbaTeamMap![request.NBATeamID];
      if (!team) {
        console.error(
          `Team with ID ${request.NBATeamID} not found in nbaTeamMap`,
        );
        return;
      }
      const res = await RequestService.ApproveNBARequest(request);
      setBBANBARequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
      let role = "Owner";
      if (request.IsManager) {
        role = "GM";
      } else if (request.IsCoach) {
        role = "Coach";
      } else if (request.IsAssistant) {
        role = "Assistant";
      }
      const payload = {
        username: request.Username,
        NBATeamID: request.NBATeamID,
        NBARole: role,
        NBATeam: team.Team,
        NBATeamAbbreviation: team.Abbr,
      };
      addUserToNBATeam(request.NBATeamID, request.Username, role);
      await updateUserByUsername(request.Username, payload);
    },
    [bbaNBARequests, nbaTeamMap],
  );

  const rejectNBARequest = useCallback(
    async (request: NBARequest) => {
      const res = await RequestService.RejectNBARequest(request);
      setBBANBARequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
    },
    [bbaNBARequests],
  );

  const acceptCFBRequest = useCallback(
    async (request: CFBRequest) => {
      const team = cfbTeamMap![request.TeamID];
      if (!team) {
        console.error(`Team with ID ${request.TeamID} not found in cfbTeamMap`);
        return;
      }
      const res = await RequestService.ApproveCFBRequest(request);

      setFBACFBRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
      const payload = {
        username: request.Username,
        teamId: request.TeamID,
        team: team.TeamName,
        teamAbbr: team.TeamAbbr,
      };
      addUserToCFBTeam(request.TeamID, request.Username);
      await updateUserByUsername(request.Username, payload);
    },
    [fbaCFBRequests, cfbTeamMap],
  );

  const rejectCFBRequest = useCallback(
    async (request: CFBRequest) => {
      const res = await RequestService.RejectCFBRequest(request);
      setFBACFBRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
    },
    [fbaCFBRequests],
  );

  const acceptNFLRequest = useCallback(
    async (request: NFLRequest) => {
      const team = proTeamMap![request.NFLTeamID];
      if (!team) {
        console.error(
          `Team with ID ${request.NFLTeamID} not found in proTeamMap`,
        );
        return;
      }
      const res = await RequestService.ApproveNFLRequest(request);
      setFBANFLRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
      let role = "Owner";
      if (request.IsManager) {
        role = "GM";
      } else if (request.IsCoach) {
        role = "Coach";
      } else if (request.IsAssistant) {
        role = "Assistant";
      }
      const payload = {
        username: request.Username,
        NFLTeamID: request.NFLTeamID,
        NFLRole: role,
        NFLTeam: team.TeamName,
        NFLTeamAbbreviation: team.TeamAbbr,
      };
      addUserToNFLTeam(request.NFLTeamID, request.Username, role);
      await updateUserByUsername(request.Username, payload);
    },
    [fbaNFLRequests, proTeamMap],
  );

  const rejectNFLRequest = useCallback(
    async (request: NFLRequest) => {
      const res = await RequestService.RejectNFLRequest(request);
      setFBANFLRequests((prevRequests) =>
        prevRequests.filter((req) => req.ID !== request.ID),
      );
    },
    [fbaNFLRequests],
  );

  const RefreshRequests = useCallback(async () => {
    await getFootballRequests();
    await getBasketballRequests();
    await getHockeyRequests();
    await getBaseballRequests();
    await getBaseballTradeProposals();
  }, []);

  const refreshHCKTradeProposals = useCallback((id: number) => {
    setHCKTradePropsals((proposals) =>
      proposals.filter((item) => item.ID !== id),
    );
  }, []);

  return (
    <AdminPageContext.Provider
      value={{
        hckCHLRequests,
        hckPHLRequests,
        hckTradeProposals,
        bbaCBBRequests,
        bbaNBARequests,
        baseballCBRequests,
        baseballMLBRequests,
        baseballTradeProposals,
        refreshBaseballTradeProposals,
        fbaTradeProposals,
        bbaTradeProposals,
        acceptCBBaseballRequest,
        rejectCBBaseballRequest,
        acceptMLBRequest,
        rejectMLBRequest,
        acceptCHLRequest,
        rejectCHLRequest,
        acceptPHLRequest,
        rejectPHLRequest,
        acceptCBBRequest,
        rejectCBBRequest,
        acceptNBARequest,
        rejectNBARequest,
        acceptCFBRequest,
        rejectCFBRequest,
        acceptNFLRequest,
        rejectNFLRequest,
        fbaCFBRequests,
        fbaNFLRequests,
        selectedTab,
        setSelectedTab,
        RefreshRequests,
        refreshHCKTradeProposals,
      }}
    >
      {children}
    </AdminPageContext.Provider>
  );
};

export const useAdminPage = () => {
  const context = useContext(AdminPageContext);
  if (!context) {
    throw new Error(
      "useAdminPageContext must be used within an AdminPageProvider",
    );
  }
  return context;
};
