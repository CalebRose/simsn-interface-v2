import React, { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { PageContainer } from "../../_design/Container";
import { TeamService } from "../../_services/teamService";
import { RequestDTO, RequestService } from "../../_services/requestService";
import { ButtonGrid, PillButton } from "../../_design/Buttons";
import { TeamCard } from "../Common/Cards";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCLAX,
  SimNBA,
  SimNFL,
  SimPHL,
  SimMLB,
  SimCollegeBaseball,
} from "../../_constants/constants";
import { SelectedTeamCard } from "./SelectedTeamCards";
import { Text } from "../../_design/Typography";
import { SelectDropdown } from "../../_design/Select";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { getPrimaryBaseballTeam } from "../../_utility/baseballHelpers";
import { ForumService } from "../../_services/forumService";
import type { BaseballOrganization } from "../../models/baseball/baseballModels";
import { getLaxLogoUrl, LacrosseService } from "../../_services/lacrosseService";

const buildBaseballOptions = (
  orgs: BaseballOrganization[],
  league: "mlb" | "college",
) => {
  const filtered = orgs.filter((o) => o.league === league);
  const sorted = [...filtered].sort((a, b) =>
    a.org_abbrev.localeCompare(b.org_abbrev),
  );
  const teamOpts = sorted.map((o) => ({
    label: o.org_abbrev,
    value: o.id.toString(),
  }));
  const confMap = new Map<string, { label: string; value: string }>();
  for (const o of sorted) {
    const primary = getPrimaryBaseballTeam(o);
    const conf = primary?.conference;
    if (conf && !confMap.has(conf)) {
      confMap.set(conf, { label: conf, value: conf });
    }
  }
  const confOpts = Array.from(confMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  return { teamOpts, confOpts };
};

export const AvailableTeams = () => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const { currentUser } = useAuthStore();
  const {
    cfbTeams,
    nflTeams,
    cfbTeamOptions,
    nflTeamOptions,
    cfbConferenceOptions,
    nflConferenceOptions,
  } = useSimFBAStore();
  const {
    cbbTeams,
    nbaTeams,
    cbbTeamOptions,
    nbaTeamOptions,
    cbbConferenceOptions,
    nbaConferenceOptions,
  } = useSimBBAStore();
  const {
    chlTeams,
    phlTeams,
    chlTeamOptions,
    phlTeamOptions,
    chlConferenceOptions,
    phlConferenceOptions,
  } = useSimHCKStore();
  const { organizations: mlbOrganizations } = useSimBaseballStore();
  const [claxTeams, setClaxTeams] = useState<any[]>([]);
  const [claxLoadError, setClaxLoadError] = useState("");
  const [teamOptions, setTeamOptions] = useState(cfbTeamOptions);
  const [conferenceOptions, setConferenceOptions] =
    useState(cfbConferenceOptions);
  const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedTeamData, setSelectedTeamData] = useState<any>(null);
  const [sentRequestCFB, setSentRequestCFB] = useState(false);
  const [sentRequestNFL, setSentRequestNFL] = useState(false);
  const [sentRequestCBB, setSentRequestCBB] = useState(false);
  const [sentRequestNBA, setSentRequestNBA] = useState(false);
  const [sentRequestCHL, setSentRequestCHL] = useState(false);
  const [sentRequestCLAX, setSentRequestCLAX] = useState(false);
  const [sentRequestPHL, setSentRequestPHL] = useState(false);
  const [sentRequestMLB, setSentRequestMLB] = useState(false);
  const [sentRequestCollegeBaseball, setSentRequestCollegeBaseball] =
    useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const IsRetro = currentUser?.IsRetro;

  useEffect(() => {
    LacrosseService.getTeams()
      .then((result) => {
        setClaxTeams(result.teams.map((team) => ({
          ID: team.id, TeamName: team.name, Mascot: team.nickname,
          Abbreviation: team.abbreviation, City: team.city, State: team.state,
          Arena: team.venue, Coach: team.coach || "None",
          LogoURL: getLaxLogoUrl(team.logoFileName),
          ConferenceID: team.conference?.id ?? 0,
          Conference: team.conference?.name ?? "Independent",
          ColorOne: team.colors.primary || "#374151",
          ColorTwo: team.colors.secondary || "#9CA3AF",
          ColorThree: team.colors.tertiary || "#FFFFFF",
          IsUserCoached: team.isUserControlled,
          OverallGrade: "—", OffenseGrade: "—", DefenseGrade: "—",
        })));
        setClaxLoadError("");
      })
      .catch(() => {
        setClaxTeams([]);
        setClaxLoadError("SimCLAX teams could not be loaded. Please refresh after the local database is running.");
      });
    LacrosseService.getMyClaim()
      .then((claim) => setSentRequestCLAX(claim?.status === "pending"))
      .catch(() => setSentRequestCLAX(false));
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(() => false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      GetViewTeamData();
    }
  }, [selectedTeam, selectedLeague]);

  useEffect(() => {
    switch (selectedLeague) {
      case SimCFB:
        setTeamOptions(cfbTeamOptions);
        setConferenceOptions(cfbConferenceOptions);
        break;
      case SimCBB:
        setTeamOptions(cbbTeamOptions);
        setConferenceOptions(cbbConferenceOptions);
        break;
      case SimNFL:
        setTeamOptions(nflTeamOptions);
        setConferenceOptions(nflConferenceOptions);
        break;
      case SimNBA:
        setTeamOptions(nbaTeamOptions);
        setConferenceOptions(nbaConferenceOptions);
        break;
      case SimCLAX: {
        setTeamOptions(claxTeams.map((team) => ({ label: team.TeamName, value: String(team.ID) })));
        const conferences = new Map<number, string>();
        claxTeams.forEach((team) => conferences.set(team.ConferenceID, team.Conference));
        setConferenceOptions(Array.from(conferences, ([value, label]) => ({ label, value: String(value) })).sort((a, b) => a.label.localeCompare(b.label)));
        break;
      }
      case SimCHL:
        setTeamOptions(chlTeamOptions);
        setConferenceOptions(chlConferenceOptions);
        break;
      case SimPHL:
        setTeamOptions(phlTeamOptions);
        setConferenceOptions(phlConferenceOptions);
        break;
      case SimMLB: {
        const mlb = buildBaseballOptions(mlbOrganizations || [], "mlb");
        setTeamOptions(mlb.teamOpts);
        setConferenceOptions(mlb.confOpts);
        break;
      }
      case SimCollegeBaseball: {
        const cbl = buildBaseballOptions(mlbOrganizations || [], "college");
        setTeamOptions(cbl.teamOpts);
        setConferenceOptions(cbl.confOpts);
        break;
      }
    }

    setSelectedTeams([]);
    setConferences([]);
    setSelectedTeam(null);
    setSelectedTeamData(null);
  }, [selectedLeague, claxTeams]);

  const filteredTeams = useMemo(() => {
    let teams: any[] = [];
    if (selectedLeague === SimCFB) teams = [...cfbTeams];
    else if (selectedLeague === SimNFL) teams = [...nflTeams];
    else if (selectedLeague === SimCBB) teams = [...cbbTeams];
    else if (selectedLeague === SimNBA) teams = [...nbaTeams];
    else if (selectedLeague === SimCHL) teams = [...chlTeams];
    else if (selectedLeague === SimCLAX) teams = [...claxTeams];
    else if (selectedLeague === SimPHL) teams = [...phlTeams];
    else if (selectedLeague === SimMLB)
      teams = [...(mlbOrganizations || [])].filter((o) => o.league === "mlb");
    else if (selectedLeague === SimCollegeBaseball)
      teams = [...(mlbOrganizations || [])].filter(
        (o) => o.league === "college",
      );

    const isBaseball =
      selectedLeague === SimMLB || selectedLeague === SimCollegeBaseball;
    const filtered = teams.filter((x) => {
      let matchesConference = true;
      let matchesTeams = true;
      if (isBaseball) {
        if (conferences.length > 0) {
          const primary = getPrimaryBaseballTeam(x);
          matchesConference = conferences.includes(primary?.conference);
        }
        if (selectedTeams.length > 0) {
          matchesTeams = selectedTeams.includes(x.id);
        }
      } else {
        if (conferences.length > 0)
          matchesConference = conferences.includes(x.ConferenceID);
        if (selectedTeams.length > 0)
          matchesTeams = selectedTeams.includes(x.ID);
      }
      return matchesConference && matchesTeams;
    });
    return filtered;
  }, [
    selectedLeague,
    conferences,
    selectedTeams,
    cfbTeams,
    cbbTeams,
    nflTeams,
    nbaTeams,
    chlTeams,
    claxTeams,
    phlTeams,
    mlbOrganizations,
  ]);

  useEffect(() => {
    setIsLoading(false);
  }, [filteredTeams]);

  const GetViewTeamData = async () => {
    if (selectedLeague === SimCLAX) {
      const preview = await LacrosseService.getPreview(selectedTeam.ID);
      setSelectedTeamData(preview);
      return;
    }
    // Baseball orgs don't have a view endpoint yet — use the org data directly
    if (selectedLeague === SimMLB || selectedLeague === SimCollegeBaseball) {
      setSelectedTeamData(selectedTeam);
      return;
    }
    const res = await TeamService.ViewTeamFromAvailableTeamsPage(
      selectedLeague as League,
      selectedTeam.ID,
    );
    setSelectedTeamData(() => res);
  };

  const sendRequest = async (dto: any) => {
    const {
      league,
      team,
      role,
      discordUsername,
      howMuchTimeAnswer,
      howDidYouHearAboutSimSN,
      communityReference,
      aboutYourself,
    } = dto;
    if (
      (league === SimCFB && sentRequestCFB) ||
      (league === SimNFL && sentRequestNFL) ||
      (league === SimCBB && sentRequestCBB) ||
      (league === SimNBA && sentRequestNBA) ||
      (league === SimCHL && sentRequestCHL) ||
      (league === SimCLAX && sentRequestCLAX) ||
      (league === SimPHL && sentRequestPHL) ||
      (league === SimMLB && sentRequestMLB) ||
      (league === SimCollegeBaseball && sentRequestCollegeBaseball)
    ) {
      throw new Error(
        `You've already requested a team within ${league}. Please wait for an admin to approve the request.`,
      );
    }

    let requestDTO: RequestDTO = {
      Username: currentUser!.username,
      TeamID: team.ID,
      Role: role,
      IsApproved: false,
      DiscordUsername: discordUsername,
      HowMuchTimeAnswer: howMuchTimeAnswer,
      HowDidYouHearAboutSimSN: howDidYouHearAboutSimSN,
      CommunityReference: communityReference,
      AboutYourself: aboutYourself,
      IsActive: true,
    };

    switch (league) {
      case SimCFB:
        await RequestService.CreateCFBTeamRequest(requestDTO);
        setSentRequestCFB(true);
        break;
      case SimNFL:
        const nflRequestDTO = {
          Username: currentUser!.username,
          NFLTeamID: team.ID,
          Role: role,
          IsApproved: false,
          IsOwner: role === "o",
          IsManager: role === "gm",
          IsCoach: role === "hc",
          IsAssistant: role === "a",
          DiscordUsername: discordUsername,
          HowMuchTimeAnswer: howMuchTimeAnswer,
          HowDidYouHearAboutSimSN: howDidYouHearAboutSimSN,
          CommunityReference: communityReference,
          AboutYourself: aboutYourself,
        };
        await RequestService.CreateNFLTeamRequest(nflRequestDTO as any);
        setSentRequestNFL(true);
        break;
      case SimCBB:
        await RequestService.CreateCBBTeamRequest(requestDTO);
        setSentRequestCBB(true);
        break;
      case SimNBA:
        const nbaRequestDTO = {
          Username: currentUser!.username,
          NBATeamID: team.ID,
          Role: role,
          IsApproved: false,
          IsOwner: role === "o",
          IsManager: role === "gm",
          IsCoach: role === "hc",
          IsAssistant: role === "a",
          DiscordUsername: discordUsername,
          HowMuchTimeAnswer: howMuchTimeAnswer,
          HowDidYouHearAboutSimSN: howDidYouHearAboutSimSN,
          CommunityReference: communityReference,
          AboutYourself: aboutYourself,
        };
        await RequestService.CreateNBATeamRequest(nbaRequestDTO as any);
        setSentRequestNBA(true);
        break;
      case SimCLAX:
        await LacrosseService.requestTeam(team.ID, currentUser!.username);
        setSentRequestCLAX(true);
        break;      case SimCHL:
        await RequestService.CreateCHLTeamRequest(requestDTO);
        setSentRequestCHL(true);
        break;
      case SimPHL:
        requestDTO = {
          ...requestDTO,
          IsOwner: role === "o",
          IsManager: role === "gm",
          IsCoach: role === "hc",
          IsAssistant: role === "a",
          IsMarketing: role === "m",
          IsActive: true,
          DiscordUsername: discordUsername,
          HowMuchTimeAnswer: howMuchTimeAnswer,
          HowDidYouHearAboutSimSN: howDidYouHearAboutSimSN,
          CommunityReference: communityReference,
          AboutYourself: aboutYourself,
        };
        await RequestService.CreatePHLTeamRequest(requestDTO as any);
        setSentRequestPHL(true);
        break;
      case SimMLB:
        const mlbRequestDTO = {
          Username: currentUser!.username,
          OrgID: team.id,
          Role: role,
          IsApproved: false,
          IsOwner: role === "o",
          IsGM: role === "gm",
          IsManager: role === "mgr",
          IsScout: role === "sc",
        };
        await RequestService.CreateMLBTeamRequest(mlbRequestDTO);
        setSentRequestMLB(true);
        await ForumService.CreateMLBJobApplicationThreadFromTeamRequest(
          {
            ...mlbRequestDTO,
            DiscordUsername: discordUsername,
            HowMuchTimeAnswer: howMuchTimeAnswer,
            HowDidYouHearAboutSimSN: howDidYouHearAboutSimSN,
            CommunityReference: communityReference,
            AboutYourself: aboutYourself,
          },
          team as BaseballOrganization,
          currentUser!.id,
          currentUser!.username,
        );
        break;
      case SimCollegeBaseball:
        await RequestService.CreateCollegeBaseballTeamRequest(
          team.id,
          currentUser!.username,
        );
        setSentRequestCollegeBaseball(true);
        await ForumService.CreateSimCollegeBaseballJobApplicationThreadFromTeamRequest(
          { Username: currentUser!.username, OrgID: team.id },
          team as BaseballOrganization,
          currentUser!.id,
          currentUser!.username,
        );
        break;
    }
    enqueueSnackbar(`${league} Request Sent!`, {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const selectSport = (sport: League) => {
    setIsLoading(true);
    setSelectedLeague(sport);
  };

  const ChangeConference = (options: any) => {
    const isBaseball =
      selectedLeague === SimMLB || selectedLeague === SimCollegeBaseball;
    const opts = [
      ...options.map((x: any) => (isBaseball ? x.value : Number(x.value))),
    ];
    setConferences(() => opts);
  };

  const ChangeTeams = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setSelectedTeams(() => opts);
  };

  return (
    <PageContainer
      direction="col"
      isLoading={isLoading}
      title="Available Teams"
    >
      <div className="flex flex-col">
        <div className="min-[320px]:flex-col lg:flex-row mb-3">
          <div className="flex flex-col md:flex-col lg:flex-row flex-1 mb-2 justify-between lg:px-20">
            <div className="flex lg:flex-nowrap lg:flex-row gap-4">
              <div className="text-start">
                <Text variant="alternate">Conferences</Text>
                <SelectDropdown
                  options={conferenceOptions}
                  isMulti={true}
                  className=""
                  classNamePrefix="select"
                  onChange={ChangeConference}
                />
              </div>
              <div className="text-start">
                <Text variant="alternate">Teams</Text>
                <SelectDropdown
                  options={teamOptions}
                  isMulti={true}
                  className=""
                  classNamePrefix="select"
                  onChange={ChangeTeams}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col gap-2">
                <ButtonGrid classes="grid-cols-6 justify-center">
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimCFB} onClick={() => selectSport(SimCFB)}>
                    <Text variant="small">SimCFB</Text>
                  </PillButton>
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimNFL} onClick={() => selectSport(SimNFL)}>
                    <Text variant="small">SimNFL</Text>
                  </PillButton>
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimCBB} onClick={() => selectSport(SimCBB)}>
                    <Text variant="small">SimCBB</Text>
                  </PillButton>
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimNBA} onClick={() => selectSport(SimNBA)}>
                    <Text variant="small">SimNBA</Text>
                  </PillButton>
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimCHL} onClick={() => selectSport(SimCHL)}>
                    <Text variant="small">SimCHL</Text>
                  </PillButton>
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimPHL} onClick={() => selectSport(SimPHL)}>
                    <Text variant="small">SimPHL</Text>
                  </PillButton>
                </ButtonGrid>
                <ButtonGrid classes="grid-cols-6 justify-center">
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimCollegeBaseball} onClick={() => selectSport(SimCollegeBaseball)}>
                    <Text variant="small">SimCBL</Text>
                  </PillButton>
                  <PillButton variant="primaryOutline" isSelected={selectedLeague === SimMLB} onClick={() => selectSport(SimMLB)}>
                    <Text variant="small">SimMLB</Text>
                  </PillButton>
                  {/* SimLAX public launch: restore the SimCLAX and SimPLAX buttons here. */}
                  {/*
                    <PillButton variant="primaryOutline" isSelected={selectedLeague === SimCLAX} onClick={() => selectSport(SimCLAX)}>
                      <Text variant="small">SimCLAX</Text>
                    </PillButton>
                    <PillButton variant="primaryOutline" disabled title="SimPLAX is coming soon" classes="cursor-not-allowed opacity-50">
                      <Text variant="small">SimPLAX</Text>
                    </PillButton>
                  */}
                </ButtonGrid>
              </div>
            </div>
          </div>
        </div>
        <div className="min-[320px]:flex min-[320px]:flex-col-reverse min-[1025px]:grid min-[1025px]:grid-cols-2 gap-x-8">
          <div className="grid min-[800px]:grid-cols-4 px-2 min-[300px]:grid-cols-3 overflow-y-auto gap-1 md:gap-0 justify-center min-[320px]:max-h-68 min-[420px]:max-h-100 min-[820px]:max-h-80 max-[1024px]:w-full min-[1025px]:max-h-[75vh] min-[1025px]:w-[50vw]">
            {selectedLeague === SimCFB &&
              filteredTeams.map((x) => (
                <TeamCard
                  key={x.ID}
                  teamID={x.ID}
                  t={x}
                  retro={IsRetro}
                  team={x.TeamName}
                  conference={x.Conference}
                  league={selectedLeague}
                  disable={
                    sentRequestCFB ||
                    (x.Coach && x.Coach !== "AI" && x.Coach.length > 0)
                  }
                  setSelectedTeam={setSelectedTeam}
                />
              ))}
            {selectedLeague === SimNFL &&
              filteredTeams.map((x) => (
                <TeamCard
                  key={x.ID}
                  teamID={x.ID}
                  t={x}
                  retro={IsRetro}
                  team={x.TeamName}
                  conference={x.Conference}
                  league={selectedLeague}
                  setSelectedTeam={setSelectedTeam}
                  disable={undefined}
                />
              ))}
            {selectedLeague === SimCBB &&
              filteredTeams.map((x) => (
                <TeamCard
                  key={x.ID}
                  teamID={x.ID}
                  t={x}
                  retro={IsRetro}
                  team={x.Team}
                  conference={x.Conference}
                  league={selectedLeague}
                  disable={sentRequestCBB || x.IsUserCoached}
                  setSelectedTeam={setSelectedTeam}
                />
              ))}
            {selectedLeague === SimNBA &&
              filteredTeams.map((x) => (
                <TeamCard
                  key={x.ID}
                  teamID={x.ID}
                  t={x}
                  retro={IsRetro}
                  team={x.Team}
                  conference={x.Conference}
                  league={selectedLeague}
                  setSelectedTeam={setSelectedTeam}
                  disable={undefined}
                />
              ))}
            {selectedLeague === SimCLAX && claxLoadError && (
              <div className="col-span-full m-3 rounded-lg border border-red-400 p-4 text-red-400">
                {claxLoadError}
              </div>
            )}            {selectedLeague === SimCLAX &&
              filteredTeams.map((x) => (
                <TeamCard
                  key={x.ID}
                  teamID={x.ID}
                  t={x}
                  retro={false}
                  team={x.TeamName}
                  conference={x.Conference}
                  league={selectedLeague}
                  disable={sentRequestCLAX || x.IsUserCoached}
                  setSelectedTeam={setSelectedTeam}
                />
              ))}            {selectedLeague === SimCHL &&
              filteredTeams.map((x) => (
                <TeamCard
                  key={x.ID}
                  teamID={x.ID}
                  t={x}
                  retro={IsRetro}
                  team={x.TeamName}
                  conference={x.Conference}
                  league={selectedLeague}
                  disable={
                    sentRequestCHL ||
                    (x.Coach && x.Coach !== "AI" && x.Coach.length > 0) ||
                    x.LeagueID > 1
                  }
                  setSelectedTeam={setSelectedTeam}
                />
              ))}
            {selectedLeague === SimPHL &&
              filteredTeams.map((x) => (
                <TeamCard
                  key={x.ID}
                  teamID={x.ID}
                  t={x}
                  retro={IsRetro}
                  team={x.TeamName}
                  conference={x.Conference}
                  league={selectedLeague}
                  setSelectedTeam={setSelectedTeam}
                  disable={undefined}
                />
              ))}
            {selectedLeague === SimCollegeBaseball &&
              filteredTeams.map((x, idx) => {
                const primaryTeam = getPrimaryBaseballTeam(x);
                return (
                  <TeamCard
                    key={x.id ?? `cb-${idx}`}
                    teamID={primaryTeam?.team_id ?? x.id ?? idx}
                    t={{
                      ...x,
                      ColorOne: primaryTeam?.color_one,
                      ColorTwo: primaryTeam?.color_two,
                      ColorThree: primaryTeam?.color_three,
                    }}
                    retro={IsRetro}
                    team={x.org_abbrev}
                    conference={primaryTeam?.conference || ""}
                    league={selectedLeague}
                    disable={
                      sentRequestCollegeBaseball ||
                      (x.coach != null &&
                        x.coach !== "AI" &&
                        x.coach.length > 0)
                    }
                    setSelectedTeam={setSelectedTeam}
                  />
                );
              })}
            {selectedLeague === SimMLB &&
              filteredTeams.map((x, idx) => {
                const primaryTeam = getPrimaryBaseballTeam(x);
                return (
                  <TeamCard
                    key={x.id ?? `mlb-${idx}`}
                    teamID={primaryTeam?.team_id ?? x.id ?? idx}
                    t={{
                      ...x,
                      ColorOne: primaryTeam?.color_one,
                      ColorTwo: primaryTeam?.color_two,
                      ColorThree: primaryTeam?.color_three,
                    }}
                    retro={IsRetro}
                    team={x.org_abbrev}
                    conference={primaryTeam?.conference || ""}
                    league={selectedLeague}
                    setSelectedTeam={setSelectedTeam}
                    disable={sentRequestMLB}
                  />
                );
              })}
          </div>
          <div className="flex min-[320px]:flex-col min-[1025px]:flex-row justify-center min-[320px]:mb-2 min-[820px]:max-h-140 min-[1025px]:max-h-120 max-w-full">
            <SelectedTeamCard
              selectedTeam={selectedTeam}
              data={selectedTeamData}
              league={selectedLeague}
              retro={IsRetro}
              sentRequest={
                selectedLeague === SimCLAX ? sentRequestCLAX : undefined
              }
              sendRequest={sendRequest}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
