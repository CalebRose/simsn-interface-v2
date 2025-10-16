import React, { useEffect, useMemo, useState } from "react";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { PageContainer } from "../../_design/Container";
import { Button, ButtonGroup, PillButton } from "../../_design/Buttons";
import { TeamLandingPage } from "../LandingPage/TeamLandingPage";
import { Text } from "../../_design/Typography";
import {
  League,
  SimCBB,
  SimCFB,
  SimNBA,
  SimNFL,
  SimCHL,
  SimPHL,
} from "../../_constants/constants";
import { Logo } from "../../_design/Logo";
import { getLogo } from "../../_utility/getLogo";
import { GetTeamLabel } from "../../_helper/teamHelper";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { simLogos } from "../../_constants/logos";
import { Border } from "../../_design/Borders";
import { useNavigate } from "react-router-dom";
import routes from "../../_constants/routes";

export const Home = () => {
  const {
    currentUser,
    isCFBUser,
    isCBBUser,
    isCHLUser,
    isNFLUser,
    isNBAUser,
    isPHLUser,
  } = useAuthStore();
  const { setSelectedLeague, selectedLeague, ts } = useLeagueStore();
  const navigate = useNavigate();
  const fbStore = useSimFBAStore();
  const bkStore = useSimBBAStore();
  const hkStore = useSimHCKStore();
  const { chlTeam, phlTeam } = hkStore;
  const hkLoading = hkStore.isLoading;
  const { cfbTeam, nflTeam, isLoading } = fbStore;
  const fbLoading = isLoading;
  const { cbbTeam, nbaTeam } = bkStore;
  const bkLoading = bkStore.isLoading;
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const logoUrl =
    selectedTeam &&
    getLogo(selectedLeague as League, selectedTeam?.ID, currentUser?.isRetro);
  const teamName =
    selectedTeam && GetTeamLabel(selectedLeague as League, selectedTeam);

  const teamByLeague = (league: League) => {
    switch (league) {
      case SimCFB:
        return cfbTeam;
      case SimNFL:
        return nflTeam;
      case SimCBB:
        return cbbTeam;
      case SimNBA:
        return nbaTeam;
      case SimCHL:
        return chlTeam;
      case SimPHL:
        return phlTeam;
      default:
        return null;
    }
  };

  const isLoadingData = !selectedTeam;

  useEffect(() => {
    // only run once all stores are done loading
    if (fbLoading || bkLoading || hkLoading) return;

    // 1) Try the user's DefaultLeague
    const defaultLeague = currentUser?.DefaultLeague as League | undefined;
    if (defaultLeague) {
      const defaultTeam = teamByLeague(defaultLeague);
      if (defaultTeam) {
        setSelectedLeague(defaultLeague);
        setSelectedTeam(defaultTeam);
        return;
      }
    }

    // 2) Fallback priority: CFB → NFL → CBB → NBA → CHL → PHL
    const priority: League[] = [SimCFB, SimNFL, SimCBB, SimNBA, SimCHL, SimPHL];
    for (let league of priority) {
      const team = teamByLeague(league);
      if (team) {
        setSelectedLeague(league);
        setSelectedTeam(team);
        break;
      }
    }
  }, [
    fbLoading,
    bkLoading,
    hkLoading,
    cfbTeam,
    nflTeam,
    cbbTeam,
    nbaTeam,
    chlTeam,
    phlTeam,
    currentUser?.DefaultLeague,
    setSelectedLeague,
  ]);

  const SetTeam = (league: League, team: any) => {
    setSelectedLeague(league);
    setSelectedTeam(team);
  };

  const isParticipating = useMemo(() => {
    if (!currentUser) return false;
    const { cbb_id, teamId, NFLTeamID, CHLTeamID, PHLTeamID, NBATeamID } =
      currentUser;
    if (
      !cbb_id &&
      !teamId &&
      !NFLTeamID &&
      !CHLTeamID &&
      !PHLTeamID &&
      !NBATeamID
    ) {
      return false;
    }
    if (
      cbb_id === 0 &&
      teamId === 0 &&
      NFLTeamID === 0 &&
      CHLTeamID === 0 &&
      PHLTeamID === 0 &&
      NBATeamID === 0
    ) {
      return false;
    }
    return true;
  }, [currentUser]);

  return (
    <PageContainer isLoading={isLoadingData && isParticipating}>
      {!isParticipating && (
        <>
          <Border
            direction="col"
            classes="p-4 h-full mt-[20vh] md:w-[80vw] xl:w-[40vw]"
          >
            <div className="flex mb-2 justify-center">
              <img
                src={`${simLogos.SimSN}`}
                className="h-20 sm:h-40"
                alt="SimSNLogo"
              />
            </div>
            <div className="flex flex-row mb-2 justify-center">
              <Text variant="body" classes="font-semibold">
                Welcome to Simulation Sports Network!
              </Text>
            </div>
            <div className="flex flex-row mb-4 justify-center">
              <Text variant="body-small" classes="">
                We are an online multiplayer sports simulation community. We
                currently run sports management simulations for College Football
                (SimCFB), Pro Football (SimNFL), College Basketball (SimCBB),
                Pro Basketball (SimNBA), College Hockey (SimCHL), and Pro Hockey
                (SimPHL).
              </Text>
            </div>
            <div className="flex flex-row mb-2 justify-center">
              <Button onClick={() => navigate(routes.AVAILABLE_TEAMS)}>
                Click here to join a league and start your SimSN Career
              </Button>
            </div>
          </Border>
        </>
      )}
      <div className="flex flex-col px-2 mt-1">
        <div className="flex flex-row mb-1">
          <ButtonGroup>
            {isCFBUser && cfbTeam && (
              <PillButton
                variant="primaryOutline"
                classes="flex flex-col"
                isSelected={selectedLeague === SimCFB}
                onClick={() => SetTeam(SimCFB, cfbTeam)}
              >
                <img
                  src={`${simLogos.SimCFB}`}
                  className="hidden md:block w-[4em] h-auto"
                />
                {cfbTeam.TeamName}
              </PillButton>
            )}
            {isNFLUser && nflTeam && (
              <PillButton
                variant="primaryOutline"
                classes="flex flex-col"
                isSelected={selectedLeague === SimNFL}
                onClick={() => SetTeam(SimNFL, nflTeam)}
              >
                <img
                  src={`${simLogos.SimNFL}`}
                  className="hidden md:block w-[4em] h-auto"
                />
                {nflTeam.Mascot}
              </PillButton>
            )}
            {isCBBUser && cbbTeam && (
              <PillButton
                variant="primaryOutline"
                classes="flex flex-col"
                isSelected={selectedLeague === SimCBB}
                onClick={() => SetTeam(SimCBB, cbbTeam)}
              >
                <img
                  src={`${simLogos.SimCBB}`}
                  className="hidden md:block w-[4em] h-auto"
                />
                {cbbTeam.Team}
              </PillButton>
            )}
            {isNBAUser && nbaTeam && (
              <PillButton
                variant="primaryOutline"
                classes="flex flex-col"
                isSelected={selectedLeague === SimNBA}
                onClick={() => SetTeam(SimNBA, nbaTeam)}
              >
                <img
                  src={`${simLogos.SimNBA}`}
                  className="hidden md:block w-[4em] h-auto"
                />
                {nbaTeam.Nickname}
              </PillButton>
            )}
            {isCHLUser && chlTeam && (
              <PillButton
                variant="primaryOutline"
                classes="flex flex-col"
                isSelected={selectedLeague === SimCHL}
                onClick={() => SetTeam(SimCHL, chlTeam)}
              >
                <img
                  src={`${simLogos.SimCHL}`}
                  className="hidden md:block w-[4em] h-auto"
                />
                {chlTeam.TeamName}
              </PillButton>
            )}
            {isPHLUser && phlTeam && (
              <PillButton
                variant="primaryOutline"
                classes="flex flex-col"
                isSelected={selectedLeague === SimPHL}
                onClick={() => SetTeam(SimPHL, phlTeam)}
              >
                <img
                  src={`${simLogos.SimPHL}`}
                  className="hidden md:block w-[4em] h-auto"
                />
                {phlTeam.Mascot}
              </PillButton>
            )}
          </ButtonGroup>
          {/* Refactor below code into component by league -- Football, Basketball, Baseball, Hockey */}
          {/* <div className="flex ml-4">
            <Logo url={logoUrl} variant="tiny" />
            <Text variant="alternate" classes="ml-4 flex items-center">
              {teamName}
            </Text>
            {ts && (
              <Text variant="alternate" classes="ml-4 flex items-center">
                {ts.Season}, Week {ts.CollegeWeek}
              </Text>
            )}
          </div> */}
        </div>
        {selectedTeam && (
          <TeamLandingPage
            team={selectedTeam}
            league={selectedLeague}
            ts={ts}
          />
        )}
      </div>
    </PageContainer>
  );
};
