import { useEffect, useMemo, useState } from "react";
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
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { useModal } from "../../_hooks/useModal";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import {
  CollegeTeam as CHLTeam,
  ProfessionalTeam,
  ProTeamRequest,
} from "../../models/hockeyModels";
import {
  CollegeTeam as CFBTeam,
  NFLRequest,
  NFLTeam,
} from "../../models/footballModels";
import {
  Team as CBBTeam,
  NBATeam,
  NBARequest,
} from "../../models/basketballModels";
import { BaseballOrganization } from "../../models/baseball/baseballModels";
import { ProfileTeamCardModal } from "./ProfileTeamCardModal";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { updateUserByUsername } from "../../firebase/firestoreHelper";

interface ProfileTeamCardProps {
  teamID: number;
  teamLabel: string;
  conference: string;
  role?: string;
  textColorClass: string;
  backgroundColor: string;
  borderColor: string;
  secondaryBorderColor: string;
  league: League;
  IsRetro?: boolean;
  removeUser: () => void;
  isUser: boolean;
}

const ProfileTeamCard: React.FC<ProfileTeamCardProps> = ({
  teamID,
  teamLabel,
  conference,
  league,
  removeUser,
  IsRetro,
  backgroundColor,
  borderColor,
  secondaryBorderColor,
  role,
  textColorClass,
  isUser = false,
}) => {
  const logoUrl = getLogo(league, teamID, IsRetro);
  return (
    <>
      <Border classes="w-full" styles={{ backgroundColor, borderColor }}>
        <div className="grid grid-cols-3 h-24 w-full p-2 items-center">
          <div className="col-span-1 w-full p-4">
            <Logo
              url={logoUrl}
              variant="normal"
              classes=""
              containerClass="p-4 items-center justify-center"
            />
          </div>
          <div className="col-span-2 items-center flex-wrap justify-center p-2 grow">
            <Text variant="h5" classes={`${textColorClass}`}>
              {league}
            </Text>
            <Text variant="small" classes={`${textColorClass}`}>
              {teamLabel}
            </Text>
            {role && (
              <Text variant="small" classes={`${textColorClass}`}>
                Role: {role}
              </Text>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center p-4">
          {isUser && (
            <Button
              variant="danger"
              onClick={removeUser}
              size="xs"
              disabled={!isUser}
            >
              Resign
            </Button>
          )}
        </div>
      </Border>
    </>
  );
};

interface ProfileCFBTeamCardProps {
  IsUser?: boolean;
  Team: CFBTeam | null;
}

export const ProfileCFBTeamCard: React.FC<ProfileCFBTeamCardProps> = ({
  IsUser,
  Team,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { cfbTeam, removeUserfromCFBTeamCall } = useSimFBAStore();

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const remove = async () => {
    handleCloseModal();
    await removeUserfromCFBTeamCall(currentUser!.teamId!!);
    const cu = { ...currentUser };
    cu.teamId = 0;
    setCurrentUser(cu as CurrentUser);
    const payload = {
      teamId: 0,
    };
    await updateUserByUsername(currentUser!.username, payload);
  };

  const viewingTeam = useMemo(() => {
    if (Team?.ID !== currentUser?.teamId) {
      return Team;
    }
    return cfbTeam;
  }, [cfbTeam, Team]);

  const teamColors = useTeamColors(
    viewingTeam?.ColorOne,
    viewingTeam?.ColorTwo,
    viewingTeam?.ColorThree,
  );

  const backgroundColor = teamColors?.One || "#4B5563";
  const borderColor = teamColors?.Two || "#4B5563";
  const secondaryBorderColor = teamColors?.Three || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  return (
    <>
      {cfbTeam && (
        <>
          <ProfileTeamCard
            teamID={viewingTeam?.ID!!}
            teamLabel={`${viewingTeam?.TeamName} ${viewingTeam?.Mascot}`}
            conference={viewingTeam!.Conference}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            secondaryBorderColor={secondaryBorderColor}
            league={SimCFB}
            textColorClass={textColorClass}
            IsRetro={currentUser!.IsRetro}
            removeUser={() => handleOpenModal()}
            isUser={IsUser!!}
          />
          <ProfileTeamCardModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={`Resign from ${viewingTeam?.TeamName}?`}
            actions={
              <>
                <ButtonGroup>
                  <Button size="sm" onClick={remove}>
                    Yes
                  </Button>
                  <Button size="sm" onClick={handleCloseModal}>
                    No
                  </Button>
                </ButtonGroup>
              </>
            }
          >
            <Text className="mb-4 text-start">
              Warning: By resigning, you will lose access to the team in this
              league. Are you sure you would like to resign?
            </Text>
          </ProfileTeamCardModal>
        </>
      )}
    </>
  );
};

interface ProfileNFLTeamCardProps {
  IsUser?: boolean;
  Team: NFLTeam | null;
}

export const ProfileNFLTeamCard: React.FC<ProfileNFLTeamCardProps> = ({
  IsUser,
  Team,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { nflTeam, removeUserfromNFLTeamCall } = useSimFBAStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [role, setRole] = useState("");

  const viewingTeam = useMemo(() => {
    if (Team?.ID !== currentUser?.NFLTeamID) {
      return Team;
    }
    return nflTeam;
  }, [nflTeam, Team]);

  const backgroundColor = viewingTeam?.ColorOne || "#4B5563";
  const borderColor = viewingTeam?.ColorTwo || "#4B5563";
  const secondaryBorderColor = viewingTeam?.ColorThree || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  useEffect(() => {
    if (nflTeam) {
      if (nflTeam?.Owner === currentUser?.username) {
        setRole(Owner);
      } else if (nflTeam!.GM === currentUser?.username) {
        setRole(GM);
      } else if (nflTeam!.Coach === currentUser?.username) {
        setRole(Coach);
      } else if (nflTeam!.Scout === currentUser?.username) {
        setRole(Scout);
      } else if (nflTeam!.Marketing === currentUser?.username) {
        setRole(Marketing);
      }
    }
  }, [nflTeam]);
  const remove = async () => {
    let isManager = false;
    let isOwner = false;
    let isCoach = false;
    let isScout = false;
    if (role === "Manager") isManager = true;
    if (role === "Owner") isOwner = true;
    if (role === "Coach") isCoach = true;
    if (role === "Scout" || role === "Assistant") isScout = true;
    const dto = {
      NFLTeamID: nflTeam!.ID,
      IsOwner: isOwner,
      IsManager: isManager,
      IsCoach: isCoach,
      IsAssistant: isScout,
    } as NFLRequest;
    handleCloseModal();
    const cu = { ...currentUser };
    cu.NFLTeamID = 0;
    setCurrentUser(cu as CurrentUser);
    const payload = {
      NFLTeamID: 0,
    };
    await updateUserByUsername(currentUser!.username, payload);
    return await removeUserfromNFLTeamCall(dto);
  };
  return (
    <>
      {nflTeam && (
        <>
          <ProfileTeamCard
            teamID={viewingTeam?.ID!!}
            teamLabel={`${viewingTeam?.TeamName} ${viewingTeam?.Mascot}`}
            conference={viewingTeam!.Conference}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            secondaryBorderColor={secondaryBorderColor}
            league={SimNFL}
            role={role}
            textColorClass={textColorClass}
            IsRetro={currentUser!.IsRetro}
            removeUser={handleOpenModal}
            isUser={IsUser!!}
          />
          {IsUser && (
            <ProfileTeamCardModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              title={`Resign from ${viewingTeam?.TeamName}?`}
              actions={
                <>
                  <ButtonGroup>
                    <Button size="sm" onClick={remove}>
                      Yes
                    </Button>
                    <Button size="sm" onClick={handleCloseModal}>
                      No
                    </Button>
                  </ButtonGroup>
                </>
              }
            >
              <Text className="mb-4 text-start">
                Warning: By resigning, you will lose access to the team in this
                league. Are you sure you would like to resign?
              </Text>
            </ProfileTeamCardModal>
          )}
        </>
      )}
    </>
  );
};

interface ProfileCHLTeamCardProps {
  IsUser?: boolean;
  Team: CHLTeam | null;
}

export const ProfileCHLTeamCard: React.FC<ProfileCHLTeamCardProps> = ({
  IsUser,
  Team,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { chlTeam, removeUserfromCHLTeamCall } = useSimHCKStore();

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const remove = async () => {
    handleCloseModal();
    await removeUserfromCHLTeamCall(currentUser!.CHLTeamID!!);
    const cu = { ...currentUser };
    cu.CHLTeamID = 0;
    setCurrentUser(cu as CurrentUser);
    const payload = {
      CHLTeamID: 0,
    };
    await updateUserByUsername(currentUser!.username, payload);
  };

  const viewingTeam = useMemo(() => {
    if (Team?.ID !== currentUser?.CHLTeamID) {
      return Team;
    }
    return chlTeam;
  }, [chlTeam, Team]);

  const teamColors = useTeamColors(
    viewingTeam?.ColorOne,
    viewingTeam?.ColorTwo,
    viewingTeam?.ColorThree,
  );

  const backgroundColor = teamColors?.One || "#4B5563";
  const borderColor = teamColors?.Two || "#4B5563";
  const secondaryBorderColor = teamColors?.Three || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  return (
    <>
      {chlTeam && (
        <>
          <ProfileTeamCard
            teamID={viewingTeam?.ID!!}
            teamLabel={`${viewingTeam?.TeamName} ${viewingTeam?.Mascot}`}
            conference={viewingTeam!.Conference}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            secondaryBorderColor={secondaryBorderColor}
            league={SimCHL}
            textColorClass={textColorClass}
            IsRetro={currentUser!.IsRetro}
            removeUser={() => handleOpenModal()}
            isUser={IsUser!!}
          />
          <ProfileTeamCardModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={`Resign from ${chlTeam.TeamName}?`}
            actions={
              <>
                <ButtonGroup>
                  <Button size="sm" onClick={remove}>
                    Yes
                  </Button>
                  <Button size="sm" onClick={handleCloseModal}>
                    No
                  </Button>
                </ButtonGroup>
              </>
            }
          >
            <Text className="mb-4 text-start">
              Warning: By resigning, you will lose access to the team in this
              league. Are you sure you would like to resign?
            </Text>
          </ProfileTeamCardModal>
        </>
      )}
    </>
  );
};

interface ProfilePHLTeamCardProps {
  IsUser?: boolean;
  Team: ProfessionalTeam | null;
}

export const ProfilePHLTeamCard: React.FC<ProfilePHLTeamCardProps> = ({
  IsUser,
  Team,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { phlTeam, removeUserfromPHLTeamCall } = useSimHCKStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [role, setRole] = useState("");

  const viewingTeam = useMemo(() => {
    if (Team?.ID !== currentUser?.PHLTeamID) {
      return Team;
    }
    return phlTeam;
  }, [phlTeam, Team]);

  const backgroundColor = viewingTeam?.ColorOne || "#4B5563";
  const borderColor = viewingTeam?.ColorTwo || "#4B5563";
  const secondaryBorderColor = viewingTeam?.ColorThree || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  useEffect(() => {
    if (phlTeam) {
      if (phlTeam?.Owner === currentUser?.username) {
        setRole(Owner);
      } else if (phlTeam!.GM === currentUser?.username) {
        setRole(GM);
      } else if (phlTeam!.Coach === currentUser?.username) {
        setRole(Coach);
      } else if (phlTeam!.Scout === currentUser?.username) {
        setRole(Scout);
      } else if (phlTeam!.Marketing === currentUser?.username) {
        setRole(Marketing);
      }
    }
  }, [phlTeam]);
  const remove = async () => {
    const dto = {
      TeamID: phlTeam?.ID,
      Role: role,
    } as ProTeamRequest;
    handleCloseModal();
    const cu = { ...currentUser };
    cu.PHLTeamID = 0;
    setCurrentUser(cu as CurrentUser);
    const payload = {
      PHLTeamID: 0,
    };
    await updateUserByUsername(currentUser!.username, payload);
    return await removeUserfromPHLTeamCall(dto);
  };
  return (
    <>
      {phlTeam && (
        <>
          <ProfileTeamCard
            teamID={viewingTeam?.ID!!}
            teamLabel={`${viewingTeam?.TeamName} ${viewingTeam?.Mascot}`}
            conference={viewingTeam!.Conference}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            secondaryBorderColor={secondaryBorderColor}
            league={SimPHL}
            role={role}
            textColorClass={textColorClass}
            IsRetro={currentUser!.IsRetro}
            removeUser={handleOpenModal}
            isUser={IsUser!!}
          />
          {IsUser && (
            <ProfileTeamCardModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              title={`Resign from ${viewingTeam?.TeamName}?`}
              actions={
                <>
                  <ButtonGroup>
                    <Button size="sm" onClick={remove}>
                      Yes
                    </Button>
                    <Button size="sm" onClick={handleCloseModal}>
                      No
                    </Button>
                  </ButtonGroup>
                </>
              }
            >
              <Text className="mb-4 text-start">
                Warning: By resigning, you will lose access to the team in this
                league. Are you sure you would like to resign?
              </Text>
            </ProfileTeamCardModal>
          )}
        </>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────
// CBB
// ─────────────────────────────────────────────────────────────────────────────────

interface ProfileCBBTeamCardProps {
  IsUser?: boolean;
  Team: CBBTeam | null;
}

export const ProfileCBBTeamCard: React.FC<ProfileCBBTeamCardProps> = ({
  IsUser,
  Team,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { cbbTeam, removeUserfromCBBTeamCall } = useSimBBAStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();

  const remove = async () => {
    handleCloseModal();
    setCurrentUser({ ...currentUser, cbb_id: 0 } as CurrentUser);
  };

  const viewingTeam = useMemo(() => {
    if (Team?.ID !== currentUser?.cbb_id) return Team;
    return cbbTeam;
  }, [cbbTeam, Team]);

  const teamColors = useTeamColors(
    viewingTeam?.ColorOne,
    viewingTeam?.ColorTwo,
    viewingTeam?.ColorThree,
  );
  const backgroundColor = teamColors?.One || "#4B5563";
  const borderColor = teamColors?.Two || "#4B5563";
  const secondaryBorderColor = teamColors?.Three || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  return (
    <>
      <ProfileTeamCard
        teamLabel={`${viewingTeam?.Team} ${viewingTeam?.Nickname}`}
        conference={viewingTeam?.Conference!!}
        backgroundColor={backgroundColor}
        teamID={viewingTeam?.ID!!}
        borderColor={borderColor}
        secondaryBorderColor={secondaryBorderColor}
        league={SimCBB}
        textColorClass={textColorClass}
        removeUser={handleOpenModal}
        isUser={IsUser!!}
      />
      <ProfileTeamCardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Resign from ${viewingTeam?.Team}?`}
        actions={
          <ButtonGroup>
            <Button size="sm" onClick={remove}>
              Yes
            </Button>
            <Button size="sm" onClick={handleCloseModal}>
              No
            </Button>
          </ButtonGroup>
        }
      >
        <Text className="mb-4 text-start">
          Warning: By resigning, you will lose access to the team in this
          league. Are you sure you would like to resign?
        </Text>
      </ProfileTeamCardModal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NBA
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileNBATeamCardProps {
  IsUser?: boolean;
  Team: NBATeam | null;
}

export const ProfileNBATeamCard: React.FC<ProfileNBATeamCardProps> = ({
  IsUser,
  Team,
}) => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { nbaTeam, removeUserfromNBATeamCall } = useSimBBAStore();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [role, setRole] = useState("");

  const viewingTeam = useMemo(() => {
    if (Team?.ID !== currentUser?.NBATeamID) return Team;
    return nbaTeam;
  }, [nbaTeam, Team]);

  const backgroundColor = viewingTeam?.ColorOne || "#4B5563";
  const borderColor = viewingTeam?.ColorTwo || "#4B5563";
  const secondaryBorderColor = viewingTeam?.ColorThree || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  useEffect(() => {
    if (nbaTeam) {
      if (nbaTeam.NBAOwnerName === currentUser?.username) setRole(Owner);
      else if (nbaTeam.NBACoachName === currentUser?.username) setRole(Coach);
      else if (nbaTeam.NBAGMName === currentUser?.username) setRole(GM);
      else if (nbaTeam.NBAAssistantName === currentUser?.username)
        setRole("Assistant");
    }
  }, [nbaTeam, currentUser]);

  const remove = async () => {
    const request = new NBARequest({
      NBATeamID: nbaTeam!.ID,
      Username: currentUser!.username,
      IsOwner: role === Owner,
      IsCoach: role === Coach,
      IsManager: role === GM,
      IsAssistant: role === "Assistant",
    });
    handleCloseModal();
    setCurrentUser({
      ...currentUser,
      NBATeamID: 0,
      NBARole: "",
    } as CurrentUser);
    await updateUserByUsername(currentUser!.username, {
      NBATeamID: 0,
      NBARole: "",
    });
    await removeUserfromNBATeamCall(request);
  };

  if (!nbaTeam) return null;

  return (
    <>
      <ProfileTeamCard
        teamID={viewingTeam?.ID!!}
        teamLabel={`${viewingTeam?.Team} ${viewingTeam?.Nickname}`}
        conference={viewingTeam?.Conference ?? ""}
        role={role || undefined}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        secondaryBorderColor={secondaryBorderColor}
        league={SimNBA}
        textColorClass={textColorClass}
        IsRetro={currentUser!.IsRetro}
        removeUser={handleOpenModal}
        isUser={IsUser!!}
      />
      {IsUser && (
        <ProfileTeamCardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`Resign from ${viewingTeam?.Team}?`}
          actions={
            <ButtonGroup>
              <Button size="sm" onClick={remove}>
                Yes
              </Button>
              <Button size="sm" onClick={handleCloseModal}>
                No
              </Button>
            </ButtonGroup>
          }
        >
          <Text className="mb-4 text-start">
            Warning: By resigning, you will lose access to the team in this
            league. Are you sure you would like to resign?
          </Text>
        </ProfileTeamCardModal>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// College Baseball (CBL) — resign not yet supported by the API
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileCBLTeamCardProps {
  IsUser?: boolean;
  Org: BaseballOrganization | null;
}

export const ProfileCBLTeamCard: React.FC<ProfileCBLTeamCardProps> = ({
  Org,
  IsUser,
}) => {
  const { currentUser } = useAuthStore();
  const { collegeOrganization, organizationMap } = useSimBaseballStore();

  const org = Org ?? collegeOrganization ?? null;
  const viewingOrg = useMemo(() => {
    if (org?.id !== currentUser?.teamId) {
      return org;
    }
    return organizationMap[currentUser?.teamId ?? -1] ?? null;
  }, [organizationMap, Org, collegeOrganization]);
  const primaryTeam = viewingOrg ? Object.values(viewingOrg.teams)[0] : null;
  const backgroundColor = primaryTeam?.color_one || "#4B5563";
  const borderColor = primaryTeam?.color_two || "#4B5563";
  const secondaryBorderColor = primaryTeam?.color_three || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  if (!org) return null;

  return (
    <ProfileTeamCard
      teamID={primaryTeam?.team_id ?? 0}
      teamLabel={org.org_abbrev}
      conference={primaryTeam?.conference ?? ""}
      role={org.coach ? "Coach" : undefined}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      secondaryBorderColor={secondaryBorderColor}
      league={SimCollegeBaseball}
      textColorClass={textColorClass}
      IsRetro={currentUser?.IsRetro}
      removeUser={() => {}}
      isUser={IsUser!!}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MLB — resign not yet supported by the API
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileMLBTeamCardProps {
  IsUser?: boolean;
  Org: BaseballOrganization | null;
}

export const ProfileMLBTeamCard: React.FC<ProfileMLBTeamCardProps> = ({
  Org,
  IsUser,
}) => {
  const { currentUser } = useAuthStore();
  const { mlbOrganization } = useSimBaseballStore();

  const org = Org ?? mlbOrganization ?? null;
  const primaryTeam = org ? Object.values(org.teams)[0] : null;
  const backgroundColor = primaryTeam?.color_one || "#4B5563";
  const borderColor = primaryTeam?.color_two || "#4B5563";
  const secondaryBorderColor = primaryTeam?.color_three || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  const role = (() => {
    if (!org || !currentUser?.username) return undefined;
    if (org.owner_name === currentUser.username) return Owner;
    if (org.gm_name === currentUser.username) return GM;
    if (org.manager_name === currentUser.username) return "Manager";
    if (org.scout_name === currentUser.username) return Scout;
    return undefined;
  })();

  if (!org) return null;

  return (
    <ProfileTeamCard
      teamID={org.id}
      teamLabel={org.org_abbrev}
      conference={primaryTeam?.conference ?? ""}
      role={role}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      secondaryBorderColor={secondaryBorderColor}
      league={SimMLB}
      textColorClass={textColorClass}
      IsRetro={currentUser?.IsRetro}
      removeUser={() => {}}
      isUser={IsUser!!}
    />
  );
};
