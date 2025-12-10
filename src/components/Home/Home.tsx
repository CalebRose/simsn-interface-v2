import React, { useMemo, useEffect } from "react";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { PageContainer } from "../../_design/Container";
import { Button } from "../../_design/Buttons";
import { TeamLandingPage } from "../LandingPage/TeamLandingPage";
import { Text } from "../../_design/Typography";
import {
  League,
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
  SimCHL,
  SimPHL,
} from "../../_constants/constants";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { simLogos } from "../../_constants/logos";
import { Border } from "../../_design/Borders";
import { useNavigate } from "react-router-dom";
import routes from "../../_constants/routes";
import { LeagueSelector } from "../Common/LeagueSelector";
import { teamByLeague } from "../../_utility/useLeagueSelector";

export const Home = () => {
  const { currentUser } = useAuthStore();
  const { selectedLeague, ts, selectedTeam, SetTeam } = useLeagueStore();
  const navigate = useNavigate();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const { cbbTeam, nbaTeam } = useSimBBAStore();
  const { chlTeam, phlTeam } = useSimHCKStore();

  console.log({ selectedLeague, selectedTeam });

  // Check if selected team matches current league and correct it if needed
  useEffect(() => {
    if (!currentUser || !selectedTeam) return;

    const getUserTeamIdForLeague = (league: League) => {
      switch (league) {
        case SimCFB:
          return currentUser.teamId;
        case SimNFL:
          return currentUser.NFLTeamID;
        case SimCBB:
          return currentUser.cbb_id;
        case SimNBA:
          return currentUser.NBATeamID;
        case SimCHL:
          return currentUser.CHLTeamID;
        case SimPHL:
          return currentUser.PHLTeamID;
        default:
          return null;
      }
    };

    const expectedTeamId = getUserTeamIdForLeague(selectedLeague as League);

    // If the selected team doesn't match the expected team for this league, correct it
    if (expectedTeamId && selectedTeam.ID !== expectedTeamId) {
      const correctTeam = teamByLeague({
        league: selectedLeague as League,
        cfbTeam,
        nflTeam,
        cbbTeam,
        nbaTeam,
        chlTeam,
        phlTeam,
      });

      if (correctTeam) {
        SetTeam(selectedLeague as League, correctTeam);
      }
    }
  }, [
    selectedLeague,
    selectedTeam,
    currentUser,
    cfbTeam,
    nflTeam,
    cbbTeam,
    nbaTeam,
    chlTeam,
    phlTeam,
    SetTeam,
  ]);

  const isLoadingData = !selectedTeam;

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
          <LeagueSelector
            selectedLeague={selectedLeague as League}
            onLeagueSelect={SetTeam}
            teams={{
              cfbTeam,
              nflTeam,
              cbbTeam,
              nbaTeam,
              chlTeam,
              phlTeam,
            }}
          />
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
