import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { getLogo } from "../../_utility/getLogo";
import { useAdminPage } from "../../context/AdminPageContext";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { updateUserByUsername } from "../../firebase/firestoreHelper";
import {
  NBARequest,
  NBATeam,
  Request as CBBRequest,
  Team,
} from "../../models/basketballModels";
import {
  CollegeTeam,
  NFLRequest,
  NFLTeam,
  TeamRequest,
} from "../../models/footballModels";
import {
  CollegeTeamRequest as CHLRequest,
  CollegeTeam as CHLTeam,
  ProfessionalTeam,
  ProTeamRequest,
} from "../../models/hockeyModels";
import { AdminRequestCard } from "./AdminCards";

export const AdminRequestsTab = () => {
  const { selectedLeague } = useLeagueStore();
  const {
    hckCHLRequests,
    hckPHLRequests,
    bbaCBBRequests,
    bbaNBARequests,
    fbaCFBRequests,
    fbaNFLRequests,
  } = useAdminPage();
  const hkStore = useSimHCKStore();
  const { chlTeamMap, phlTeamMap } = hkStore;
  const hkLoading = hkStore.isLoading;
  const fbStore = useSimFBAStore();
  const { cfbTeamMap, proTeamMap } = fbStore;
  const fbLoading = fbStore.isLoading;
  const bbStore = useSimBBAStore();
  const bbLoading = bbStore.isLoading;
  const { nbaTeamMap, cbbTeamMap } = bbStore;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-2 py-2 ${
        hckCHLRequests.length === 1 ? "justify-center" : "justify-start"
      }`}
    >
      {selectedLeague === SimCHL &&
        !hkLoading &&
        hckCHLRequests.map((request) => (
          <CHLRequestCard
            request={request}
            chlTeam={chlTeamMap[request.TeamID]}
            key={request.ID}
            oneItem={hckCHLRequests.length === 1}
          />
        ))}

      {selectedLeague === SimPHL &&
        !hkLoading &&
        hckPHLRequests.map((request) => (
          <PHLRequestCard
            request={request}
            phlTeam={phlTeamMap[request.TeamID]}
            key={request.ID}
            oneItem={hckPHLRequests.length === 1}
          />
        ))}
      {selectedLeague === SimCBB &&
        !bbLoading &&
        bbaCBBRequests.map((request) => (
          <CBBRequestCard
            request={request}
            cbbTeam={cbbTeamMap![request.TeamID]}
            key={request.ID}
            oneItem={bbaCBBRequests.length === 1}
          />
        ))}

      {selectedLeague === SimNBA &&
        !bbLoading &&
        bbaNBARequests.map((request) => (
          <NBARequestCard
            request={request}
            nbaTeam={nbaTeamMap![request.NBATeamID]}
            key={request.ID}
            oneItem={bbaNBARequests.length === 1}
          />
        ))}
      {selectedLeague === SimCFB &&
        !fbLoading &&
        fbaCFBRequests.map((request) => (
          <CFBRequestCard
            request={request}
            cfbTeam={cfbTeamMap![request.TeamID]}
            key={request.ID}
            oneItem={fbaCFBRequests.length === 1}
          />
        ))}

      {selectedLeague === SimNFL &&
        !fbLoading &&
        fbaNFLRequests.map((request) => (
          <NFLRequestCard
            request={request}
            nflTeam={proTeamMap![request.NFLTeamID]}
            key={request.ID}
            oneItem={fbaNFLRequests.length === 1}
          />
        ))}
    </div>
  );
};

interface CHLRequestCardProps {
  request: CHLRequest;
  chlTeam: CHLTeam;
  oneItem: boolean;
}

export const CHLRequestCard: React.FC<CHLRequestCardProps> = ({
  request,
  chlTeam,
  oneItem,
}) => {
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const leagueStore = useLeagueStore();
  const { selectedLeague } = leagueStore;
  const requestLogo = getLogo(
    selectedLeague as League,
    request.TeamID,
    currentUser?.isRetro
  );
  const teamColors = useTeamColors(
    chlTeam.ColorOne,
    chlTeam.ColorTwo,
    chlTeam.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const { acceptCHLRequest, rejectCHLRequest } = useAdminPage();
  const accept = async () => {
    await acceptCHLRequest(request);
  };
  const reject = async () => {
    await rejectCHLRequest(request);
  };
  return (
    <AdminRequestCard
      teamLabel={`${chlTeam.TeamName} ${chlTeam.Mascot}`}
      requestLogo={requestLogo}
      oneItem={oneItem}
      accept={accept}
      reject={reject}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      username={request.Username}
    />
  );
};

interface PHLRequestCardProps {
  request: ProTeamRequest;
  phlTeam: ProfessionalTeam;
  oneItem: boolean;
}

export const PHLRequestCard: React.FC<PHLRequestCardProps> = ({
  request,
  phlTeam,
  oneItem,
}) => {
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const requestLogo = getLogo(
    SimPHL as League,
    request.TeamID,
    currentUser?.isRetro
  );
  const teamColors = useTeamColors(
    phlTeam.ColorOne,
    phlTeam.ColorTwo,
    phlTeam.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const { acceptPHLRequest, rejectPHLRequest } = useAdminPage();
  const accept = async () => {
    const payload = {
      PHLTeamID: request.TeamID,
      PHLRole: request.Role,
    };
    await updateUserByUsername(request.Username, payload);
    await acceptPHLRequest(request);
  };
  const reject = async () => {
    await rejectPHLRequest(request);
  };

  return (
    <AdminRequestCard
      teamLabel={`${phlTeam.TeamName} ${phlTeam.Mascot}`}
      requestLogo={requestLogo}
      role={request.Role}
      oneItem={oneItem}
      accept={accept}
      reject={reject}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      username={request.Username}
    />
  );
};

interface CBBRequestCardProps {
  request: CBBRequest;
  cbbTeam: Team;
  oneItem: boolean;
}

export const CBBRequestCard: React.FC<CBBRequestCardProps> = ({
  request,
  cbbTeam,
  oneItem,
}) => {
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const requestLogo = getLogo(
    SimCBB as League,
    request.TeamID,
    currentUser?.isRetro
  );
  const teamColors = useTeamColors(
    cbbTeam.ColorOne,
    cbbTeam.ColorTwo,
    cbbTeam.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const { acceptCBBRequest, rejectCBBRequest } = useAdminPage();
  const accept = async () => {
    await acceptCBBRequest(request);
  };
  const reject = async () => {
    await rejectCBBRequest(request);
  };

  return (
    <AdminRequestCard
      teamLabel={`${cbbTeam.Team} ${cbbTeam.Nickname}`}
      requestLogo={requestLogo}
      oneItem={oneItem}
      accept={accept}
      reject={reject}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      username={request.Username}
    />
  );
};

interface NBARequestCardProps {
  request: NBARequest;
  nbaTeam: NBATeam;
  oneItem: boolean;
}

export const NBARequestCard: React.FC<NBARequestCardProps> = ({
  request,
  nbaTeam,
  oneItem,
}) => {
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const requestLogo = getLogo(
    SimNBA as League,
    request.NBATeamID,
    currentUser?.isRetro
  );
  const teamColors = useTeamColors(
    nbaTeam.ColorOne,
    nbaTeam.ColorTwo,
    nbaTeam.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const { acceptNBARequest, rejectNBARequest } = useAdminPage();
  const accept = async () => {
    await acceptNBARequest(request);
  };
  const reject = async () => {
    await rejectNBARequest(request);
  };

  return (
    <AdminRequestCard
      teamLabel={`${nbaTeam.Team} ${nbaTeam.Nickname}`}
      requestLogo={requestLogo}
      oneItem={oneItem}
      accept={accept}
      reject={reject}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      username={request.Username}
    />
  );
};

interface CFBRequestCardProps {
  request: TeamRequest;
  cfbTeam: CollegeTeam;
  oneItem: boolean;
}

export const CFBRequestCard: React.FC<CFBRequestCardProps> = ({
  request,
  cfbTeam,
  oneItem,
}) => {
  if (!cfbTeam) {
    console.error("CFB Team not found for request:", request);
    return null; // Handle the case where the team is not found
  }
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const requestLogo = getLogo(
    SimCFB as League,
    request.TeamID,
    currentUser?.isRetro
  );
  const teamColors = useTeamColors(
    cfbTeam.ColorOne,
    cfbTeam.ColorTwo,
    cfbTeam.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const { acceptCFBRequest, rejectCFBRequest } = useAdminPage();
  const accept = async () => {
    await acceptCFBRequest(request);
  };
  const reject = async () => {
    await rejectCFBRequest(request);
  };

  return (
    <AdminRequestCard
      teamLabel={`${cfbTeam.TeamName} ${cfbTeam.Mascot}`}
      requestLogo={requestLogo}
      oneItem={oneItem}
      accept={accept}
      reject={reject}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      username={request.Username}
    />
  );
};

interface NFLRequestCardProps {
  request: NFLRequest;
  nflTeam: NFLTeam;
  oneItem: boolean;
}

export const NFLRequestCard: React.FC<NFLRequestCardProps> = ({
  request,
  nflTeam,
  oneItem,
}) => {
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const requestLogo = getLogo(
    SimNFL as League,
    request.NFLTeamID,
    currentUser?.isRetro
  );
  const teamColors = useTeamColors(
    nflTeam.ColorOne,
    nflTeam.ColorTwo,
    nflTeam.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const { acceptNFLRequest, rejectNFLRequest } = useAdminPage();
  const accept = async () => {
    await acceptNFLRequest(request);
  };
  const reject = async () => {
    await rejectNFLRequest(request);
  };

  return (
    <AdminRequestCard
      teamLabel={`${nflTeam.TeamName} ${nflTeam.Mascot}`}
      requestLogo={requestLogo}
      oneItem={oneItem}
      accept={accept}
      reject={reject}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      username={request.Username}
    />
  );
};
