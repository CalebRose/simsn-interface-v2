import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { SimCVB, SimPVB } from "../../_constants/constants";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbAbilityGrades,
  VbLeague,
  VbLeagueKind,
  vbProStaffRoles,
  VbStaffRole,
  VbTeam,
  VbTeamHistory,
  VolleyballService,
} from "../../_services/volleyballService";
import { vbGradeRank } from "./VbGrades";
import { vbLabel, vbPaths, vbRoleLabel, vbTeamLogo } from "./vbFormatting";
import { useVbResource } from "./useVbData";

// Volleyball's part of the shared Available Teams page: its teams in the
// shape that page lists, what the selected-team card shows, and the notice in
// the request window. Requests for a volleyball team are made there, like
// every other sport's.

export const vbKindOf = (league: string): VbLeagueKind | null =>
  league === SimCVB ? "college" : league === SimPVB ? "pro" : null;

/**
 * For a user with no volleyball coach: opens the application page for a
 * team, where they build their coach and ask for the team in one go. Null
 * for anyone else, who uses the shared request window.
 */
export const useVbApplication = (league: string, teamId?: number) => {
  const navigate = useNavigate();
  const { vbCoaches, vbLoading } = useSimVBStore();
  const kind = vbKindOf(league);
  if (!kind || vbLoading || vbCoaches[kind] || !teamId) return null;
  return () => navigate(vbPaths(kind).apply(teamId));
};

/** A volleyball team as the Available Teams page lists every sport's teams. */
export const vbAvailableTeam = (
  team: VbTeam,
  kind: VbLeagueKind,
  league: VbLeague | null,
) => ({
  ID: team.TeamID,
  TeamName: team.Name,
  Mascot: team.Nickname,
  Abbreviation: team.Abbreviation ?? "",
  City: team.City ?? "",
  LogoURL: vbTeamLogo(team, kind, league),
  ConferenceID: team.ConferenceID ?? 0,
  Conference: team.Conference ?? "",
  ColorOne: team.ColorOne || "#374151",
  ColorTwo: team.ColorTwo || "#9CA3AF",
  ColorThree: team.ColorThree || "#FFFFFF",
  IsUserCoached: team.Controller === "human",
});

export interface VbAvailableTeamData {
  history: VbTeamHistory;
  players: Array<{
    PlayerID: number;
    Name: string;
    Position?: string | null;
    AbilityGrades?: VbAbilityGrades | null;
  }>;
}

/** What the selected-team card shows for a volleyball team. */
export const loadVbAvailableTeam = async (
  teamId: number,
  kind: VbLeagueKind,
): Promise<VbAvailableTeamData> => {
  const [history, roster] = await Promise.all([
    VolleyballService.getTeamHistory(teamId),
    kind === "college"
      ? VolleyballService.getRoster(teamId)
      : VolleyballService.getProRoster(teamId),
  ]);
  return { history, players: roster.Players };
};

/** The body of the selected-team card: record, honours and best players. */
export const VbAvailableTeamDetail: FC<{
  league: string;
  team: { City?: string; Conference?: string };
  data: VbAvailableTeamData | null;
}> = ({ league, team, data }) => {
  const college = league === SimCVB;
  const seasons = [...(data?.history.Seasons ?? [])].sort(
    (a, b) => b.Season - a.Season,
  );
  const last = seasons[0];
  const wins = seasons.reduce((sum, season) => sum + season.Wins, 0);
  const losses = seasons.reduce((sum, season) => sum + season.Losses, 0);
  const titles = seasons
    .filter((season) => /champion/i.test(season.NationalResult ?? ""))
    .map((season) => season.Season);
  // Public grades only: the best four by overall at their position.
  const top = [...(data?.players ?? [])]
    .filter((player) => player.AbilityGrades?.Overall)
    .sort(
      (a, b) =>
        (vbGradeRank(b.AbilityGrades?.Overall) ?? -99) -
        (vbGradeRank(a.AbilityGrades?.Overall) ?? -99),
    )
    .slice(0, 4);

  return (
    <>
      <Border>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <Text variant="alternate" classes="font-semibold">
              Last Season{last ? ` (${last.Season})` : ""}
            </Text>
            <Text variant="small">
              {last ? `${last.Wins} - ${last.Losses}` : "—"}
            </Text>
          </div>
          <div>
            <Text variant="alternate" classes="font-semibold">
              All-Time Record
            </Text>
            <Text variant="small">
              {seasons.length ? `${wins} - ${losses}` : "—"}
            </Text>
          </div>
        </div>
      </Border>
      <Border>
        <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2">
          <div>
            <Text variant="alternate" classes="font-semibold">
              {college ? "Last National Tournament" : "Last Playoffs"}
            </Text>
            <Text variant="small">
              {last?.NationalResult ? vbLabel(last.NationalResult) : "Did not qualify"}
            </Text>
          </div>
          <div>
            <Text variant="alternate" classes="font-semibold">
              Championships
            </Text>
            <Text variant="small">
              {titles.length ? titles.join(", ") : "None"}
            </Text>
          </div>
        </div>
      </Border>
      <Border>
        <div className="mb-2 flex flex-row items-center justify-start">
          <Text variant="alternate" classes="font-semibold">
            Top Players
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-4 text-start sm:grid-cols-4">
          {top.map((player) => (
            <div className="flex flex-col" key={player.PlayerID}>
              <Text variant="xs">
                {player.Position ?? ""} {player.Name}
              </Text>
              <Text variant="xs">Overall: {player.AbilityGrades?.Overall}</Text>
            </div>
          ))}
          {!top.length && <Text variant="xs">{team.City || "—"}</Text>}
        </div>
      </Border>
    </>
  );
};

/**
 * The job to ask for at a pro club: head coach or one of its assistant
 * roles. Roles a user already holds there are shown and cannot be picked
 * (the API would refuse them with ROLE_TAKEN). College programs take head
 * coaches only, so they have no picker.
 */
export const VbRolePicker: FC<{
  teamId: number;
  value: VbStaffRole;
  onChange: (role: VbStaffRole) => void;
  /** Classes for the select, to match the form around it. */
  classes?: string;
}> = ({ teamId, value, onChange, classes = "" }) => {
  // The same key as the Team page's staff tab.
  const staff = useVbResource(`staff:${teamId}`, () =>
    VolleyballService.getStaff(teamId),
  );
  // Who holds each role now, when it is a user.
  const heldBy = new Map(
    (staff.data?.Staff ?? [])
      .filter((member) => member.Username)
      .map((member) => [member.Role, member.Username!]),
  );
  // If the picked role turns out to be taken, move to the first open one.
  useEffect(() => {
    if (!heldBy.has(value)) return;
    const open = vbProStaffRoles.find((role) => !heldBy.has(role));
    if (open) onChange(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff.data]);
  const allTaken = vbProStaffRoles.every((role) => heldBy.has(role));
  return (
    <div className="text-start">
      <label className="mb-1 block text-sm font-medium">
        The job you are asking for
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as VbStaffRole)}
          className={`mt-1 block w-full ${classes}`}
        >
          {vbProStaffRoles.map((role) => (
            <option key={role} value={role} disabled={heldBy.has(role)}>
              {vbRoleLabel(role)}
              {heldBy.has(role) ? ` (held by ${heldBy.get(role)})` : ""}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-1 text-xs opacity-75">
        {allTaken
          ? "Every job at this club is held by a user."
          : value === "headCoach"
            ? "Site admins decide head coach requests."
            : "The club's staff decide requests for their assistant jobs, not site admins."}
      </p>
    </div>
  );
};

/**
 * What a volleyball request means, shown in the request window. Volleyball
 * differs from the other sports: you play as a coach, one per level, and
 * that coach holds one team, so a new team at a level means leaving the
 * current one there.
 */
export const VbRequestNotice: FC<{
  league: string;
  teamName: string;
  teamId?: number;
}> = ({ league, teamName, teamId }) => {
  const navigate = useNavigate();
  const { vbCoaches, cvbTeam, pvbTeam } = useSimVBStore();
  const college = league === SimCVB;
  const kind: VbLeagueKind = college ? "college" : "pro";
  const vbCoach = vbCoaches[kind];
  // Only a team at the same level is given up.
  const current = college ? cvbTeam : pvbTeam;
  return (
    <div className="mb-4 space-y-2 text-start text-sm">
      {current && (
        <p className="rounded border border-yellow-500 p-2 text-yellow-500">
          You coach at {current.Name}. Your {kind} coach works for one{" "}
          {college ? "program" : "club"} at a time: if this request is
          approved they leave {current.Name} for {teamName}. Your{" "}
          {college ? "pro" : "college"} team is not affected.
        </p>
      )}
      <p>
        In SimSN Volleyball you play as a coach: a person in the league with
        their own abilities, traits and philosophy, who can be hired and can
        move between {college ? "programs" : "clubs"}. You can have a college
        coach and a pro coach, as two separate people.
        {college
          ? " A college program has one user, its head coach."
          : " A pro club can have several users: its head coach and assistants."}
      </p>
      {/* Users with no coach normally apply on the application page; this
          window only reaches them if it opened before their account loaded. */}
      {!vbCoach && teamId && (
        <p>
          You have no {kind} coach yet. If this request is approved you are
          given a default one.{" "}
          <span
            role="link"
            tabIndex={0}
            className="cursor-pointer underline hover:text-blue-500"
            onClick={() => navigate(vbPaths(kind).apply(teamId))}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate(vbPaths(kind).apply(teamId));
            }}
          >
            Apply with your own coach instead
          </span>{" "}
          to choose their background, abilities and philosophy yourself.
        </p>
      )}
    </div>
  );
};
