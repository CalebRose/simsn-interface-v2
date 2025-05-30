import { League, SimCBB, SimCHL, SimPHL } from "../../_constants/constants";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { getLogo } from "../../_utility/getLogo";
import { useAdminPage } from "../../context/AdminPageContext";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { updateUserByUsername } from "../../firebase/firestoreHelper";
import { Request, Team } from "../../models/basketballModels";
import {
  CollegeTeamRequest as CHLRequest,
  CollegeTeam as CHLTeam,
  ProfessionalTeam,
  ProTeamRequest,
} from "../../models/hockeyModels";
import { AdminRequestCard } from "./AdminCards";

export const AdminRequestsTab = () => {
  const { selectedLeague } = useLeagueStore();
  const { hckCHLRequests, hckPHLRequests } = useAdminPage();
  const hkStore = useSimHCKStore();
  const { chlTeamMap, phlTeamMap } = hkStore;
  const hkLoading = hkStore.isLoading;
  const fbStore = useSimFBAStore();
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
    const payload = {
      CHLTeamID: request.TeamID,
    };
    await updateUserByUsername(request.Username, payload);
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
  request: Request;
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
    const payload = {
      CHLTeamID: request.TeamID,
    };
    await updateUserByUsername(request.Username, payload);
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
