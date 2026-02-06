import { useMemo } from "react";
import {
  Coach,
  GM,
  League,
  Marketing,
  Owner,
  Scout,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { useModal } from "../../_hooks/useModal";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { updateUserByUsername } from "../../firebase/firestoreHelper";
import { NBARequest, NBATeam, Team } from "../../models/basketballModels";
import { CollegeTeam, NFLRequest, NFLTeam } from "../../models/footballModels";
import {
  CollegeTeam as CHLTeam,
  ProfessionalTeam,
  ProTeamRequest,
} from "../../models/hockeyModels";
import { RemoveUserModal } from "../AvailableTeams/RemoveUserModal";
import { AdminTeamCard } from "./AdminCards";
import { calculateStanding } from "./helper/cardHelper";

export const AdminTeamsTab = () => {
  const { selectedLeague } = useLeagueStore();
  const {
    chlTeams,
    phlTeams,
    removeUserfromCHLTeamCall,
    removeUserfromPHLTeamCall,
  } = useSimHCKStore();
  const {
    cfbTeams,
    nflTeams,
    removeUserfromCFBTeamCall,
    removeUserfromNFLTeamCall,
  } = useSimFBAStore();
  const {
    cbbTeams,
    nbaTeams,
    removeUserfromCBBTeamCall,
    removeUserfromNBATeamCall,
  } = useSimBBAStore();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 gap-x-2">
      {selectedLeague === SimCHL &&
        chlTeams.map((team) => (
          <AdminCHLTeamCard
            key={team.ID}
            team={team}
            removeUser={removeUserfromCHLTeamCall}
          />
        ))}
      {selectedLeague === SimPHL &&
        phlTeams.map((team) => (
          <AdminPHLTeamCard
            key={team.ID}
            team={team}
            removeUser={removeUserfromPHLTeamCall}
          />
        ))}
      {selectedLeague === SimCFB &&
        cfbTeams.map((team) => (
          <AdminCFBTeamCard
            key={team.ID}
            team={team}
            removeUser={removeUserfromCFBTeamCall}
          />
        ))}
      {selectedLeague === SimNFL &&
        nflTeams.map((team) => (
          <AdminNFLTeamCard
            key={team.ID}
            team={team}
            removeUser={removeUserfromNFLTeamCall}
          />
        ))}
      {selectedLeague === SimCBB &&
        cbbTeams.map((team) => (
          <AdminCBBTeamCard
            key={team.ID}
            team={team}
            removeUser={removeUserfromCBBTeamCall}
          />
        ))}
      {selectedLeague === SimNBA &&
        nbaTeams.map((team) => (
          <AdminNBATeamCard
            key={team.ID}
            team={team}
            removeUser={removeUserfromNBATeamCall}
          />
        ))}
    </div>
  );
};

interface AdminCHLTeamCardProps {
  team: CHLTeam;
  removeUser: (teamID: number) => Promise<void>;
}

export const AdminCHLTeamCard: React.FC<AdminCHLTeamCardProps> = ({
  team,
  removeUser,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { teamProfileMap } = useSimHCKStore();
  const teamColors = useTeamColors(
    team.ColorOne,
    team.ColorTwo,
    team.ColorThree,
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const logo = getLogo(SimCHL as League, team.ID, currentUser?.isRetro);
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();

  const removeUserFromTeam = async () => {
    const userName = team.Coach;
    await removeUser(team.ID);
    handleCloseModal();
    const payload = {
      CHLTeamID: 0,
    };
    await updateUserByUsername(userName, payload);
  };

  const teamProfile = useMemo(() => {
    if (!teamProfileMap) return null;
    return teamProfileMap[team.ID];
  }, [teamProfileMap, team.ID]);

  const lastLoginLabel = useMemo(() => {
    const lastLoginDate = new Date(team.LastLogin.toString());
    // Change to MM/DD/YYYY format
    // This is the current time format 2026-02-06T03:08:19.637Z
    // getMonth() does not exist on type Time, so we need to convert it to a Date object
    return `${lastLoginDate.getMonth() + 1}/${lastLoginDate.getDate()}/${lastLoginDate.getFullYear()}`;
  }, [team.LastLogin]);

  // Checks whether the user is inactive by seeing if they have logged in within the last 4 weeks, or if they have received at least 3 penalty marks.
  const isInGoodStanding = useMemo(() => {
    if (!team.IsUserCoached) return true;
    return calculateStanding(team);
  }, [team, teamProfile]);

  const weeksMissedInRecruiting = useMemo(() => {
    if (!teamProfile) return 0;
    return teamProfile.WeeksMissed;
  }, [teamProfile]);

  return (
    <>
      <AdminTeamCard
        teamLabel={`${team.TeamName} ${team.Mascot}`}
        logo={logo}
        coach={team.Coach}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        onClick={handleOpenModal}
        disable={team.Coach.length === 0 || team.Coach === "AI"}
        lastLogin={lastLoginLabel}
        isInGoodStanding={isInGoodStanding}
        weeksMissed={weeksMissedInRecruiting}
      />
      <RemoveUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Remove User from ${team.TeamName}?`}
        actions={
          <>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={removeUserFromTeam}
                disabled={team.Coach === "AI" || team.Coach === ""}
              >
                <Text variant="small">Remove</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <Text classes="mb-4 text-start">
          Once you select the remove button, the user will be removed from the
          team. They will need to re-apply for the same or different team in
          order to rejoin the league.
        </Text>
        <Text className="mb-4 text-start">
          Are you sure you want to do this? In this economy?
        </Text>
      </RemoveUserModal>
    </>
  );
};

interface AdminPHLTeamCardProps {
  team: ProfessionalTeam;
  removeUser: (request: ProTeamRequest) => Promise<void>;
}

export const AdminPHLTeamCard: React.FC<AdminPHLTeamCardProps> = ({
  team,
  removeUser,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const teamColors = useTeamColors(
    team.ColorOne,
    team.ColorTwo,
    team.ColorThree,
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const logo = getLogo(SimPHL as League, team.ID, currentUser?.isRetro);
  const remove = async (role: string) => {
    const dto = {
      TeamID: team.ID,
      Role: role,
    } as ProTeamRequest;

    let userName = team.Owner;
    if (role === Coach) {
      userName = team.Coach;
    } else if (role === GM) {
      userName = team.GM;
    } else if (role === Scout) {
      userName = team.Scout;
    } else if (role === Marketing) {
      userName = team.Marketing;
    }
    const payload = {
      PHLTeamID: 0,
      PHLRole: "",
    };
    await updateUserByUsername(userName, payload);
    handleCloseModal();
    return await removeUser(dto);
  };

  const lastLoginLabel = useMemo(() => {
    const lastLoginDate = new Date(team.LastLogin.toString());
    // Change to MM/DD/YYYY format
    // This is the current time format 2026-02-06T03:08:19.637Z
    // getMonth() does not exist on type Time, so we need to convert it to a Date object
    return `${lastLoginDate.getMonth() + 1}/${lastLoginDate.getDate()}/${lastLoginDate.getFullYear()}`;
  }, [team.LastLogin]);

  // Checks whether the user is inactive by seeing if they have logged in within the last 4 weeks, or if they have received at least 3 penalty marks.
  const isInGoodStanding = useMemo(() => {
    return calculateStanding(team);
  }, [team]);
  return (
    <>
      <AdminTeamCard
        teamLabel={`${team.TeamName} ${team.Mascot}`}
        logo={logo}
        owner={team.Owner}
        gm={team.GM}
        coach={team.Coach}
        scout={team.Scout}
        marketing={team.Marketing}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        onClick={handleOpenModal}
        disable={team.Owner.length === 0}
        lastLogin={lastLoginLabel}
        isInGoodStanding={isInGoodStanding}
      />
      <RemoveUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Remove User from ${team.TeamName}?`}
        actions={
          <>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={() => remove(Owner)}
                disabled={team.Owner === "AI" || team.Owner === ""}
              >
                <Text variant="small">Ownership</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(Coach)}
                disabled={team.Coach === "AI" || team.Coach === ""}
              >
                <Text variant="small">Coach</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(GM)}
                disabled={team.GM === "AI" || team.GM === ""}
              >
                <Text variant="small">GM</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(Scout)}
                disabled={team.Scout === "AI" || team.Scout === ""}
              >
                <Text variant="small">Scout</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(Marketing)}
                disabled={team.Marketing === "AI" || team.Marketing === ""}
              >
                <Text variant="small">Marketing</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <Text classes="mb-4 text-start">
          Please select the button that correlates to the user you would like to
          remove from the {team.TeamName} {team.Mascot}. Once you select one of
          the buttons, the user will be removed from the team and they will need
          to re-apply in order to rejoin.
        </Text>
        <Text className="mb-4 text-start">
          Are you sure you want to do this?
        </Text>
      </RemoveUserModal>
    </>
  );
};

interface AdminCFBTeamCardProps {
  team: CollegeTeam;
  removeUser: (teamID: number) => Promise<void>;
}

export const AdminCFBTeamCard: React.FC<AdminCFBTeamCardProps> = ({
  team,
  removeUser,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { teamProfileMap } = useSimFBAStore();
  const teamColors = useTeamColors(
    team.ColorOne,
    team.ColorTwo,
    team.ColorThree,
  );

  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const logo = getLogo(SimCFB as League, team.ID, currentUser?.isRetro);
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();

  const removeUserFromTeam = async () => {
    const userName = team.Coach;
    await removeUser(team.ID);
    handleCloseModal();
    const payload = {
      teamId: 0,
    };
    await updateUserByUsername(userName, payload);
  };

  const teamProfile = useMemo(() => {
    if (!teamProfileMap) return null;
    return teamProfileMap[team.ID];
  }, [teamProfileMap, team.ID]);

  const lastLoginLabel = useMemo(() => {
    const lastLoginDate = new Date(team.LastLogin.toString());
    // Change to MM/DD/YYYY format
    // This is the current time format 2026-02-06T03:08:19.637Z
    // getMonth() does not exist on type Time, so we need to convert it to a Date object
    return `${lastLoginDate.getMonth() + 1}/${lastLoginDate.getDate()}/${lastLoginDate.getFullYear()}`;
  }, [team.LastLogin]);

  // Checks whether the user is inactive by seeing if they have logged in within the last 4 weeks, or if they have received at least 3 penalty marks.
  const isInGoodStanding = useMemo(() => {
    if (team.Coach.length === 0 || team.Coach === "AI") return true;
    return calculateStanding(team);
  }, [team, teamProfile]);

  const weeksMissedInRecruiting = useMemo(() => {
    if (!teamProfile) return 0;
    return teamProfile.WeeksMissed;
  }, [teamProfile]);

  return (
    <>
      <AdminTeamCard
        teamLabel={`${team.TeamName} ${team.Mascot}`}
        logo={logo}
        coach={team.Coach}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        onClick={handleOpenModal}
        disable={team.Coach.length === 0 || team.Coach === "AI"}
        lastLogin={lastLoginLabel}
        isInGoodStanding={isInGoodStanding}
        weeksMissed={weeksMissedInRecruiting}
      />
      <RemoveUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Remove User from ${team.TeamName}?`}
        actions={
          <>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={removeUserFromTeam}
                disabled={team.Coach === "AI" || team.Coach === ""}
              >
                <Text variant="small">Remove</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <Text classes="mb-4 text-start">
          Once you select the remove button, the user will be removed from the
          team. They will need to re-apply for the same or different team in
          order to rejoin the league.
        </Text>
        <Text className="mb-4 text-start">
          Are you sure you want to do this? In this economy?
        </Text>
      </RemoveUserModal>
    </>
  );
};

interface AdminNFLTeamCardProps {
  team: NFLTeam;
  removeUser: (request: NFLRequest) => Promise<void>;
}

export const AdminNFLTeamCard: React.FC<AdminNFLTeamCardProps> = ({
  team,
  removeUser,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const teamColors = useTeamColors(
    team.ColorOne,
    team.ColorTwo,
    team.ColorThree,
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const logo = getLogo(SimNFL as League, team.ID, currentUser?.isRetro);
  const remove = async (role: string) => {
    const dto = {
      NFLTeamID: team.ID,
      IsOwner: role === Owner,
      IsCoach: role === Coach,
      IsManager: role === GM,
      IsAssistant: role === Scout,
    } as NFLRequest;

    let userName = team.NFLOwnerName;
    if (role === Coach) {
      userName = team.NFLCoachName;
    } else if (role === GM) {
      userName = team.NFLGMName;
    } else if (role === Scout) {
      userName = team.NFLAssistantName;
    }
    dto.Username = userName;
    const payload = {
      NFLTeamID: 0,
      NFLRole: "",
    };
    await updateUserByUsername(userName, payload);
    handleCloseModal();
    return await removeUser(dto);
  };

  const lastLoginLabel = useMemo(() => {
    const lastLoginDate = new Date(team.LastLogin.toString());
    // Change to MM/DD/YYYY format
    // This is the current time format 2026-02-06T03:08:19.637Z
    // getMonth() does not exist on type Time, so we need to convert it to a Date object
    return `${lastLoginDate.getMonth() + 1}/${lastLoginDate.getDate()}/${lastLoginDate.getFullYear()}`;
  }, [team.LastLogin]);

  // Checks whether the user is inactive by seeing if they have logged in within the last 4 weeks, or if they have received at least 3 penalty marks.
  const isInGoodStanding = useMemo(() => {
    return calculateStanding(team);
  }, [team]);

  return (
    <>
      <AdminTeamCard
        teamLabel={`${team.TeamName} ${team.Mascot}`}
        logo={logo}
        owner={team.NFLOwnerName}
        gm={team.NFLGMName}
        coach={team.NFLCoachName}
        scout={team.NFLAssistantName}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        onClick={handleOpenModal}
        disable={team.NFLOwnerName.length === 0}
        lastLogin={lastLoginLabel}
        isInGoodStanding={isInGoodStanding}
        penaltyMarks={team.PenaltyMarks}
      />
      <RemoveUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Remove User from ${team.TeamName}?`}
        actions={
          <>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={() => remove(Owner)}
                disabled={
                  team.NFLOwnerName === "AI" || team.NFLOwnerName === ""
                }
              >
                <Text variant="small">Ownership</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(Coach)}
                disabled={
                  team.NFLCoachName === "AI" || team.NFLCoachName === ""
                }
              >
                <Text variant="small">Coach</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(GM)}
                disabled={team.NFLGMName === "AI" || team.NFLGMName === ""}
              >
                <Text variant="small">GM</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(Scout)}
                disabled={
                  team.NFLAssistantName === "AI" || team.NFLAssistantName === ""
                }
              >
                <Text variant="small">Scout</Text>
              </Button>{" "}
            </ButtonGroup>
          </>
        }
      >
        <Text classes="mb-4 text-start">
          Please select the button that correlates to the user you would like to
          remove from the {team.TeamName} {team.Mascot}. Once you select one of
          the buttons, the user will be removed from the team and they will need
          to re-apply in order to rejoin.
        </Text>
        <Text className="mb-4 text-start">
          Are you sure you want to do this?
        </Text>
      </RemoveUserModal>
    </>
  );
};

interface AdminCBBTeamCardProps {
  team: Team;
  removeUser: (teamID: number) => Promise<void>;
}

export const AdminCBBTeamCard: React.FC<AdminCBBTeamCardProps> = ({
  team,
  removeUser,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { teamProfileMap } = useSimBBAStore();
  const teamColors = useTeamColors(
    team.ColorOne,
    team.ColorTwo,
    team.ColorThree,
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const logo = getLogo(SimCBB as League, team.ID, currentUser?.isRetro);
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();

  const removeUserFromTeam = async () => {
    const userName = team.Coach;
    await removeUser(team.ID);
    handleCloseModal();
    const payload = {
      teamId: 0,
    };
    await updateUserByUsername(userName, payload);
  };

  const teamProfile = useMemo(() => {
    if (!teamProfileMap) return null;
    return teamProfileMap[team.ID];
  }, [teamProfileMap, team.ID]);

  const lastLoginLabel = useMemo(() => {
    const lastLoginDate = new Date(team.LastLogin.toString());
    // Change to MM/DD/YYYY format
    // This is the current time format 2026-02-06T03:08:19.637Z
    // getMonth() does not exist on type Time, so we need to convert it to a Date object
    return `${lastLoginDate.getMonth() + 1}/${lastLoginDate.getDate()}/${lastLoginDate.getFullYear()}`;
  }, [team.LastLogin]);

  // Checks whether the user is inactive by seeing if they have logged in within the last 4 weeks, or if they have received at least 3 penalty marks.
  const isInGoodStanding = useMemo(() => {
    if (!team.IsUserCoached) return true;
    return calculateStanding(team);
  }, [team, teamProfile]);

  const weeksMissedInRecruiting = useMemo(() => {
    if (!teamProfile) return 0;
    return teamProfile.WeeksMissed;
  }, [teamProfile]);

  return (
    <>
      <AdminTeamCard
        teamLabel={`${team.Team} ${team.Nickname}`}
        logo={logo}
        coach={team.Coach}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        onClick={handleOpenModal}
        disable={team.Coach.length === 0 || team.Coach === "AI"}
        lastLogin={lastLoginLabel}
        isInGoodStanding={isInGoodStanding}
        weeksMissed={weeksMissedInRecruiting}
      />
      <RemoveUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Remove User from ${team.Team}?`}
        actions={
          <>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={removeUserFromTeam}
                disabled={team.Coach === "AI" || team.Coach === ""}
              >
                <Text variant="small">Remove</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <Text classes="mb-4 text-start">
          Once you select the remove button, the user will be removed from the
          team. They will need to re-apply for the same or different team in
          order to rejoin the league.
        </Text>
        <Text className="mb-4 text-start">
          Are you sure you want to do this? In this economy?
        </Text>
      </RemoveUserModal>
    </>
  );
};

interface AdminNBATeamCardProps {
  team: NBATeam;
  removeUser: (request: NBARequest) => Promise<void>;
}

export const AdminNBATeamCard: React.FC<AdminNBATeamCardProps> = ({
  team,
  removeUser,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const teamColors = useTeamColors(
    team.ColorOne,
    team.ColorTwo,
    team.ColorThree,
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const logo = getLogo(SimNBA as League, team.ID, currentUser?.isRetro);
  const remove = async (role: string) => {
    const dto = {
      NBATeamID: team.ID,
      IsOwner: role === Owner,
      IsCoach: role === Coach,
      IsManager: role === GM,
      IsAssistant: role === Scout,
    } as NBARequest;

    let userName = team.NBAOwnerName;
    if (role === Coach) {
      userName = team.NBACoachName;
    } else if (role === GM) {
      userName = team.NBAGMName;
    } else if (role === Scout) {
      userName = team.NBAAssistantName;
    }
    const payload = {
      NBATeamID: 0,
      NBARole: "",
    };
    dto.Username = userName;

    await updateUserByUsername(userName, payload);
    handleCloseModal();
    return await removeUser(dto);
  };

  const lastLoginLabel = useMemo(() => {
    const lastLoginDate = new Date(team.LastLogin.toString());
    // Change to MM/DD/YYYY format
    // This is the current time format 2026-02-06T03:08:19.637Z
    // getMonth() does not exist on type Time, so we need to convert it to a Date object
    return `${lastLoginDate.getMonth() + 1}/${lastLoginDate.getDate()}/${lastLoginDate.getFullYear()}`;
  }, [team.LastLogin]);

  // Checks whether the user is inactive by seeing if they have logged in within the last 4 weeks, or if they have received at least 3 penalty marks.
  const isInGoodStanding = useMemo(() => {
    return calculateStanding(team);
  }, [team]);

  return (
    <>
      <AdminTeamCard
        teamLabel={`${team.Team} ${team.Nickname}`}
        logo={logo}
        owner={team.NBAOwnerName}
        gm={team.NBAGMName}
        coach={team.NBACoachName}
        scout={team.NBAAssistantName}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        onClick={handleOpenModal}
        disable={team.NBAOwnerName.length === 0}
        isInGoodStanding={isInGoodStanding}
        lastLogin={lastLoginLabel}
      />
      <RemoveUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Remove User from ${team.Team}?`}
        actions={
          <>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={() => remove(Owner)}
                disabled={
                  team.NBAOwnerName === "AI" || team.NBAOwnerName === ""
                }
              >
                <Text variant="small">Ownership</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(Coach)}
                disabled={
                  team.NBACoachName === "AI" || team.NBACoachName === ""
                }
              >
                <Text variant="small">Coach</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(GM)}
                disabled={team.NBAGMName === "AI" || team.NBAGMName === ""}
              >
                <Text variant="small">GM</Text>
              </Button>
              <Button
                size="sm"
                onClick={() => remove(Scout)}
                disabled={
                  team.NBAAssistantName === "AI" || team.NBAAssistantName === ""
                }
              >
                <Text variant="small">Scout</Text>
              </Button>{" "}
            </ButtonGroup>
          </>
        }
      >
        <Text classes="mb-4 text-start">
          Please select the button that correlates to the user you would like to
          remove from the {team.Team} {team.Nickname}. Once you select one of
          the buttons, the user will be removed from the team and they will need
          to re-apply in order to rejoin.
        </Text>
        <Text className="mb-4 text-start">
          Are you sure you want to do this?
        </Text>
      </RemoveUserModal>
    </>
  );
};
