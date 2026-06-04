import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { getPrimaryBaseballTeam } from "../../_utility/baseballHelpers";

export type AvailableTeamRow = {
  logoId: number;
  teamName: string;
  teamAbbr: string;
  conference: string;
  status: string;
  mobileStatus: string;
  isAvailable: boolean;
};

export type AvailableTeamsData = {
  cfbTeams: any[];
  nflTeams: any[];
  cbbTeams: any[];
  nbaTeams: any[];
  chlTeams: any[];
  phlTeams: any[];
  organizations?: any[] | null;
};

export const availableTeamLeagues: League[] = [
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
  SimCHL,
  SimPHL,
  SimCollegeBaseball,
  SimMLB,
];

export const getAvailableTeamLeagueLabel = (league: League) =>
  league === SimCollegeBaseball ? "SimCBL" : league;

const getOpenRoleStatus = (
  roles: Array<[string, string, string | undefined | null]>,
) => {
  const openRoles = roles.filter(([, , value]) => {
    return !value || value.length === 0 || value === "AI";
  });
  const desktopLabels = openRoles.map(([label]) => label);
  const mobileLabels = openRoles.map(([, mobileLabel]) => mobileLabel);

  return {
    status:
      desktopLabels.length > 0
        ? `${desktopLabels.join("/")} Open`
        : "No roles open",
    mobileStatus:
      mobileLabels.length > 0
        ? `${mobileLabels.join("/")} Open`
        : "Filled",
    isAvailable: openRoles.length > 0,
  };
};

const getCoachStatus = (coach: string | undefined | null, isAssigned = true) => {
  if (!isAssigned || !coach || coach === "AI") {
    return {
      status: "Available",
      mobileStatus: "Available",
      isAvailable: true,
    };
  }

  return {
    status: `Coach: ${coach}`,
    mobileStatus: "Assigned",
    isAvailable: false,
  };
};

export const buildAvailableTeamRows = (
  selectedLeague: League,
  data: AvailableTeamsData,
): AvailableTeamRow[] => {
  if (selectedLeague === SimCFB) {
    return [...data.cfbTeams]
      .sort((a, b) => a.ConferenceID - b.ConferenceID)
      .map((team) => {
        const coachStatus = getCoachStatus(
          team.Coach,
          team.Coach !== "AI" && team.Coach !== "",
        );

        return {
          logoId: team.ID,
          teamName: `${team.TeamName} ${team.Mascot}`,
          teamAbbr: team.TeamAbbr || team.TeamName,
          conference: team.Conference,
          ...coachStatus,
        };
      });
  }

  if (selectedLeague === SimNFL) {
    return [...data.nflTeams]
      .sort((a, b) => a.ConferenceID - b.ConferenceID)
      .map((team) => ({
        logoId: team.ID,
        teamName: `${team.TeamName} ${team.Mascot}`,
        teamAbbr: team.TeamAbbr || team.TeamName,
        conference: team.Conference,
        ...getOpenRoleStatus([
          ["Owner", "Owner", team.NFLOwnerName],
          ["GM", "GM", team.NFLGMName],
          ["HC", "HC", team.NFLCoachName],
          ["Scout", "Scout", team.NFLAssistantName],
        ]),
      }));
  }

  if (selectedLeague === SimCBB) {
    return [...data.cbbTeams]
      .sort((a, b) => a.ConferenceID - b.ConferenceID)
      .map((team) => ({
        logoId: team.ID,
        teamName: `${team.Team} ${team.Nickname}`,
        teamAbbr: team.Abbr || team.Team,
        conference: team.Conference,
        ...getCoachStatus(team.Coach, team.IsUserCoached),
      }));
  }

  if (selectedLeague === SimNBA) {
    return [...data.nbaTeams]
      .sort((a, b) => a.ConferenceID - b.ConferenceID)
      .map((team) => ({
        logoId: team.ID,
        teamName: `${team.Team} ${team.Nickname}`,
        teamAbbr: team.Abbr || team.Team,
        conference: team.Conference,
        ...getOpenRoleStatus([
          ["Owner", "Owner", team.NBAOwnerName],
          ["GM", "GM", team.NBAGMName],
          ["HC", "HC", team.NBACoachName],
          ["Scout", "Scout", team.NBAAssistantName],
        ]),
      }));
  }

  if (selectedLeague === SimCHL) {
    return [...data.chlTeams]
      .sort((a, b) => a.ConferenceID - b.ConferenceID)
      .map((team) => ({
        logoId: team.ID,
        teamName: `${team.TeamName} ${team.Mascot}`,
        teamAbbr: team.Abbreviation || team.TeamName,
        conference: team.Conference,
        ...getCoachStatus(team.Coach, team.IsUserCoached),
      }));
  }

  if (selectedLeague === SimPHL) {
    return [...data.phlTeams]
      .sort((a, b) => a.ConferenceID - b.ConferenceID)
      .map((team) => ({
        logoId: team.ID,
        teamName: `${team.TeamName} ${team.Mascot}`,
        teamAbbr: team.Abbreviation || team.TeamName,
        conference: team.Conference,
        ...getOpenRoleStatus([
          ["Owner", "Owner", team.Owner],
          ["GM", "GM", team.GM],
          ["HC", "HC", team.Coach],
          ["Scout", "Scout", team.Scout],
          ["Marketing", "MKT", team.Marketing],
        ]),
      }));
  }

  if (selectedLeague === SimCollegeBaseball || selectedLeague === SimMLB) {
    const leagueKey = selectedLeague === SimMLB ? "mlb" : "college";

    return [...(data.organizations || [])]
      .filter((org) => org.league === leagueKey)
      .sort((a, b) => a.org_abbrev.localeCompare(b.org_abbrev))
      .map((org) => {
        const primaryTeam = getPrimaryBaseballTeam(org);
        const assignedStatus =
          selectedLeague === SimCollegeBaseball
            ? getCoachStatus(org.coach, org.coach && org.coach !== "AI")
            : getOpenRoleStatus([
                ["Owner", "Owner", org.owner_name],
                ["GM", "GM", org.gm_name],
                ["Manager", "MGR", org.manager_name],
                ["Scout", "Scout", org.scout_name],
              ]);

        return {
          logoId: primaryTeam?.team_id ?? org.id,
          teamName: primaryTeam?.team_full_name || org.org_abbrev,
          teamAbbr: primaryTeam?.team_abbrev || org.org_abbrev,
          conference: primaryTeam?.conference || "",
          ...assignedStatus,
        };
      });
  }

  return [];
};
