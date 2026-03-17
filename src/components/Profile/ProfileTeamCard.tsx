import { useEffect, useState } from "react";
import {
  Coach,
  GM,
  League,
  Marketing,
  Owner,
  Scout,
  SimCHL,
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
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { ProTeamRequest } from "../../models/hockeyModels";
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
}) => {
  const logoUrl = getLogo(league, teamID, IsRetro);
  return (
    <>
      <Border classes="w-full" styles={{ backgroundColor, borderColor }}>
        <div className="flex flex-row flex-grow h-[12rem] w-full p-2">
          <Border
            styles={{ borderColor: secondaryBorderColor }}
            classes="items-center justify-center self-center mt-1"
          >
            <div className="w-full p-4">
              <Logo
                url={logoUrl}
                variant="normal"
                classes=""
                containerClass="p-4 items-center justify-center"
              />
            </div>
          </Border>
          <div className="flex flex-col justify-center p-2 mx-auto mr-[1rem] flex-grow">
            <Text variant="h5" classes={`mb-2 ${textColorClass}`}>
              {league}
            </Text>
            <Text variant="small" classes={`mb-2 ${textColorClass}`}>
              {teamLabel}
            </Text>
            {role && (
              <Text variant="small" classes={`mb-2 ${textColorClass}`}>
                Role: {role}
              </Text>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <Button variant="danger" onClick={removeUser}>
              Resign
            </Button>
          </div>
        </div>
      </Border>
    </>
  );
};

interface ProfileCHLTeamCardProps {}

export const ProfileCHLTeamCard: React.FC<ProfileCHLTeamCardProps> = () => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { chlTeam, removeUserfromCHLTeamCall } = useSimHCKStore();
  const teamColors = useTeamColors(
    chlTeam?.ColorOne,
    chlTeam?.ColorTwo,
    chlTeam?.ColorThree,
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;
  const textColorClass = teamColors.TextColorOne;
  const secondaryBorderColor = teamColors.Three;
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
  return (
    <>
      {chlTeam && (
        <>
          <ProfileTeamCard
            teamID={currentUser!.CHLTeamID!!}
            teamLabel={`${chlTeam?.TeamName} ${chlTeam?.Mascot}`}
            conference={chlTeam!.Conference}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            secondaryBorderColor={secondaryBorderColor}
            league={SimCHL}
            textColorClass={textColorClass}
            IsRetro={currentUser!.IsRetro}
            removeUser={() => handleOpenModal()}
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

interface ProfilePHLTeamCardProps {}

export const ProfilePHLTeamCard: React.FC<ProfilePHLTeamCardProps> = () => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const { phlTeam, removeUserfromPHLTeamCall } = useSimHCKStore();
  const backgroundColor = phlTeam?.ColorOne || "#4B5563";
  const borderColor = phlTeam?.ColorTwo || "#4B5563";
  const secondaryBorderColor = phlTeam?.ColorThree || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [role, setRole] = useState("");

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
            teamID={currentUser!.PHLTeamID!!}
            teamLabel={`${phlTeam?.TeamName} ${phlTeam?.Mascot}`}
            conference={phlTeam!.Conference}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            secondaryBorderColor={secondaryBorderColor}
            league={SimPHL}
            role={role}
            textColorClass={textColorClass}
            IsRetro={currentUser!.IsRetro}
            removeUser={handleOpenModal}
          />
          <ProfileTeamCardModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={`Resign from ${phlTeam.TeamName}?`}
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
