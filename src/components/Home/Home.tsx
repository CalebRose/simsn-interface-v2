import React, { useMemo, useEffect, useState } from "react";
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
  SimCollegeBaseball,
  SimMLB,
  SimCLAX,
} from "../../_constants/constants";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { simLogos } from "../../_constants/logos";
import { Border } from "../../_design/Borders";
import { useNavigate } from "react-router-dom";
import routes from "../../_constants/routes";
import { LeagueSelector } from "../Common/LeagueSelector";
import { teamByLeague } from "../../_utility/useLeagueSelector";
import { BaseballLandingPage } from "../LandingPage/BaseballLandingPage";
import { useSimLAXStore } from "../../context/SimLAXContext";
import { CollegeLacrosseDashboard } from "../Lacrosse/CollegeLacrosseDashboard";

export const Home = () => {
  const { currentUser } = useAuthStore();
  const { selectedLeague, ts, selectedTeam, SetTeam } = useLeagueStore();
  const navigate = useNavigate();
  const { cfbTeam, nflTeam, isLoading: footballLoading } = useSimFBAStore();
  const { cbbTeam, nbaTeam, isLoading: basketballLoading } = useSimBBAStore();
  const { chlTeam, phlTeam, isLoading: hockeyLoading } = useSimHCKStore();
  const {
    collegeOrganization,
    mlbOrganization,
    isLoading: baseballLoading,
  } = useSimBaseballStore();
  const {
    claxTeam,
    claxTeamLoading,
    refreshClaxSchedule,
    refreshClaxStatistics,
    refreshClaxRoster,
  } = useSimLAXStore();
  const [claxDashboardReadyKey, setClaxDashboardReadyKey] = useState<
    string | null
  >(null);
  const [claxDashboardError, setClaxDashboardError] = useState("");
  const [readyLogoKey, setReadyLogoKey] = useState<string | null>(null);
  const [homeLoadTimedOut, setHomeLoadTimedOut] = useState(false);
  const claxDashboardKey =
    selectedLeague === SimCLAX && claxTeam
      ? `${currentUser?.id}:${claxTeam.id}`
      : null;
  const logoKey = useMemo(
    () =>
      [
        currentUser?.teamId && cfbTeam ? simLogos.SimCFB : null,
        currentUser?.NFLTeamID && nflTeam ? simLogos.SimNFL : null,
        currentUser?.cbb_id && cbbTeam ? simLogos.SimCBB : null,
        currentUser?.NBATeamID && nbaTeam ? simLogos.SimNBA : null,
        currentUser?.CHLTeamID && chlTeam ? simLogos.SimCHL : null,
        currentUser?.PHLTeamID && phlTeam ? simLogos.SimPHL : null,
        collegeOrganization ? simLogos.SimCBL : null,
        mlbOrganization ? simLogos.SimMLB : null,
        claxTeam ? simLogos.SimCLAX : null,
      ]
        .filter(Boolean)
        .join("|"),
    [
      currentUser,
      cfbTeam,
      nflTeam,
      cbbTeam,
      nbaTeam,
      chlTeam,
      phlTeam,
      collegeOrganization,
      mlbOrganization,
      claxTeam,
    ],
  );

  useEffect(() => {
    if (!logoKey) {
      setReadyLogoKey("");
      return;
    }
    let active = true;
    const logoUrls = logoKey.split("|");
    const images = logoUrls.map(() => new Image());
    void Promise.all(
      images.map(
        (image, index) =>
          new Promise<void>((resolve) => {
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = logoUrls[index];
            if (image.complete) resolve();
          }),
      ),
    ).then(() => {
      if (active) setReadyLogoKey(logoKey);
    });
    return () => {
      active = false;
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [logoKey]);

  useEffect(() => {
    if (
      !claxDashboardKey ||
      !claxTeam ||
      claxDashboardReadyKey === claxDashboardKey
    )
      return;
    let active = true;
    setClaxDashboardError("");
    const loadDashboard = async () => {
      try {
        const schedule = await refreshClaxSchedule(claxTeam.id);
        await Promise.all([
          refreshClaxStatistics(
            schedule.selectedSeason,
            undefined,
            "field",
            "player",
          ),
          refreshClaxStatistics(
            schedule.selectedSeason,
            undefined,
            "goalie",
            "player",
          ),
          refreshClaxRoster(claxTeam.id),
        ]);
      } catch (reason) {
        if (active)
          setClaxDashboardError(
            reason instanceof Error
              ? reason.message
              : "The SimLAX dashboard could not be loaded.",
          );
      } finally {
        if (active) setClaxDashboardReadyKey(claxDashboardKey);
      }
    };
    void loadDashboard();
    return () => {
      active = false;
    };
  }, [
    claxDashboardKey,
    claxDashboardReadyKey,
    claxTeam?.id,
    refreshClaxSchedule,
    refreshClaxStatistics,
    refreshClaxRoster,
  ]);

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
        case SimCollegeBaseball:
          return collegeOrganization?.id ?? null;
        case SimMLB:
          return mlbOrganization?.id ?? null;
        default:
          return null;
      }
    };

    const expectedTeamId = getUserTeamIdForLeague(selectedLeague as League);

    // If the selected team doesn't match the expected team for this league, correct it
    const teamId = selectedTeam.ID || selectedTeam.id;
    if (expectedTeamId && teamId !== expectedTeamId) {
      const correctTeam = teamByLeague({
        league: selectedLeague as League,
        cfbTeam,
        nflTeam,
        cbbTeam,
        nbaTeam,
        chlTeam,
        phlTeam,
        collegeBaseballOrg: collegeOrganization,
        mlbOrg: mlbOrganization,
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
    collegeOrganization,
    mlbOrganization,
    SetTeam,
  ]);

  const isParticipating = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.IsBanned) return false;
    const { cbb_id, teamId, NFLTeamID, CHLTeamID, PHLTeamID, NBATeamID } =
      currentUser;
    if (
      !cbb_id &&
      !teamId &&
      !NFLTeamID &&
      !CHLTeamID &&
      !PHLTeamID &&
      !NBATeamID &&
      !collegeOrganization &&
      !mlbOrganization &&
      !claxTeam
    ) {
      return false;
    }
    if (
      cbb_id === 0 &&
      teamId === 0 &&
      NFLTeamID === 0 &&
      CHLTeamID === 0 &&
      PHLTeamID === 0 &&
      NBATeamID === 0 &&
      !collegeOrganization &&
      !mlbOrganization &&
      !claxTeam
    ) {
      return false;
    }
    return true;
  }, [currentUser, collegeOrganization, mlbOrganization, claxTeam]);

  const isBanned = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.IsBanned;
  }, [currentUser]);

  const participatingTeamsMissing = Boolean(
    currentUser &&
    ((currentUser.teamId && !cfbTeam) ||
      (currentUser.NFLTeamID && !nflTeam) ||
      (currentUser.cbb_id && !cbbTeam) ||
      (currentUser.NBATeamID && !nbaTeam) ||
      (currentUser.CHLTeamID && !chlTeam) ||
      (currentUser.PHLTeamID && !phlTeam)),
  );
  const teamButtonsLoading = Boolean(
    currentUser &&
    (footballLoading ||
      basketballLoading ||
      hockeyLoading ||
      baseballLoading ||
      participatingTeamsMissing ||
      readyLogoKey !== logoKey),
  );
  const homeLoading =
    claxTeamLoading ||
    teamButtonsLoading ||
    (!selectedTeam && !claxTeam && isParticipating) ||
    (claxDashboardKey !== null && claxDashboardReadyKey !== claxDashboardKey);

  useEffect(() => {
    if (!homeLoading) {
      setHomeLoadTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setHomeLoadTimedOut(true), 45000);
    return () => window.clearTimeout(timer);
  }, [homeLoading]);

  if (homeLoadTimedOut && homeLoading)
    return (
      <PageContainer>
        <Border classes="p-5 text-center text-red-400">
          <p>Some team information could not be loaded.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Border>
      </PageContainer>
    );

  return (
    <PageContainer isLoading={homeLoading}>
      {!isParticipating && !isBanned && (
        <>
          <Border
            direction="col"
            classes="p-[2vw] md:p-4 h-full mt-[20vh] md:w-[85vw] lg:w-[80vw] xl:w-[40vw]"
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
                Pro Basketball (SimNBA), College Hockey (SimCHL), Pro Hockey
                (SimPHL), College Baseball (SimCBL), and Pro Baseball (SimMLB).
              </Text>
            </div>
            <div className="flex flex-row mb-4 justify-center">
              <Text variant="body-small" classes="">
                Our simulations are custom-engines built in-house, and do not
                use any software to play or simulate the games. Players can use
                any web browser to participate and manage their teams.
              </Text>
            </div>
            <div className="flex flex-row mb-4 justify-center">
              <Text variant="body-small" classes="">
                As a new user, we encourage you to join a league and start
                participating in our sports simulation community. You can also
                introduce yourself through the forums to connect with other
                members.
              </Text>
            </div>

            <div className="grid grid-cols-2 mb-2 space-x-4 justify-center">
              <Button onClick={() => navigate(routes.AVAILABLE_TEAMS)}>
                Navigate to Available Teams
              </Button>
              <Button
                onClick={() => navigate(`${routes.FORUMS}/welcome/intro-help`)}
              >
                Navigate to Introduction Forums
              </Button>
            </div>
          </Border>
        </>
      )}
      {isBanned && (
        <>
          <Border
            direction="col"
            classes="p-[2vw] md:p-4 h-full mt-[20vh] md:w-[85vw] lg:w-[80vw] xl:w-[40vw]"
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
                You have been banned from participating in Simulation Sports
                Network.
              </Text>
            </div>
            <div className="flex flex-col gap-y-2 mb-4 justify-center">
              <Text variant="small" classes="">
                Due to violations of our community guidelines, your account has
                been banned from participating in Simulation Sports Network and
                your team roles have been revoked.
              </Text>
            </div>
          </Border>
        </>
      )}
      {!isBanned && (
        <div className="flex flex-col px-[1vw] md:px-2 mt-1">
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
                collegeBaseballOrg: collegeOrganization,
                mlbOrg: mlbOrganization,
                claxTeam,
              }}
            />
          </div>
          {selectedTeam &&
            (selectedLeague === SimCollegeBaseball ||
              selectedLeague === SimMLB) && (
              <BaseballLandingPage
                organization={selectedTeam}
                league={selectedLeague}
                ts={ts}
              />
            )}
          {claxTeam &&
            selectedLeague === SimCLAX &&
            (claxDashboardError ? (
              <Border classes="p-5 text-center text-red-400">
                <p>
                  SimLAX dashboard could not be loaded: {claxDashboardError}
                </p>
                <Button onClick={() => setClaxDashboardReadyKey(null)}>
                  Retry
                </Button>
              </Border>
            ) : (
              <CollegeLacrosseDashboard team={claxTeam} />
            ))}
          {selectedTeam &&
            selectedLeague !== SimCLAX &&
            selectedLeague !== SimCollegeBaseball &&
            selectedLeague !== SimMLB && (
              <TeamLandingPage
                team={selectedTeam}
                league={selectedLeague}
                ts={ts}
              />
            )}
        </div>
      )}
    </PageContainer>
  );
};
