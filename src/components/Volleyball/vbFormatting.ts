import { SimCVB, SimPVB } from "../../_constants/constants";
import { simLogos } from "../../_constants/logos";
import routes from "../../_constants/routes";
import {
  VbAward,
  VbClock,
  VbLeague,
  VbLeagueKind,
  VbMatch,
  VbPhase,
  VbTeam,
} from "../../_services/volleyballService";

export const vbLeagueConstant = (kind: VbLeagueKind) =>
  kind === "college" ? SimCVB : SimPVB;

export const vbLeagueLabel = (kind: VbLeagueKind) =>
  kind === "college" ? "College Volleyball" : "Pro Volleyball";

export const vbLeagueLogo = (kind: VbLeagueKind, league?: VbLeague | null) =>
  league?.LogoURL || (kind === "college" ? simLogos.SimCVB : simLogos.SimPVB);

/** A team's own logo, or its league's when it has none (some pro clubs). */
export const vbTeamLogo = (
  team: VbTeam | null | undefined,
  kind: VbLeagueKind,
  league?: VbLeague | null,
) => team?.LogoURL || vbLeagueLogo(kind, league);

/** "Abilene Christian Wildcats"; a pro club's name already ends in its nickname. */
export const vbTeamFullName = (team: VbTeam) =>
  team.Nickname && !team.Name.includes(team.Nickname)
    ? `${team.Name} ${team.Nickname}`
    : team.Name;

// Paths for one league. The path shapes are fixed: Discord posts link to them.
export const vbPaths = (kind: VbLeagueKind) => {
  const college = kind === "college";
  return {
    home: college ? routes.CVB_HOME : routes.PVB_HOME,
    teams: college ? routes.CVB_TEAMS : routes.PVB_TEAMS,
    schedule: college ? routes.CVB_SCHEDULE : routes.PVB_SCHEDULE,
    history: college ? routes.CVB_HISTORY : routes.PVB_HISTORY,
    statistics: college ? routes.CVB_STATISTICS : routes.PVB_STATISTICS,
    topPlays: (season: number, week?: number | null) =>
      (college ? routes.CVB_TOP_PLAYS : routes.PVB_TOP_PLAYS)
        .replace(":season", String(season))
        .replace("/:week?", week ? `/${week}` : ""),
    rally: (matchId: number, set: number, rally: number) =>
      (college ? routes.CVB_MATCH_RALLY : routes.PVB_MATCH_RALLY)
        .replace(":matchId", String(matchId))
        .replace(":set", String(set))
        .replace(":rally", String(rally)),
    // The coach's own pages; with no team id they open on their team.
    lineup: (college ? routes.CVB_LINEUP : routes.PVB_LINEUP).replace(
      "/:teamId?",
      "",
    ),
    tactics: (college ? routes.CVB_TACTICS : routes.PVB_TACTICS).replace(
      "/:teamId?",
      "",
    ),
    development: (
      college ? routes.CVB_DEVELOPMENT : routes.PVB_DEVELOPMENT
    ).replace("/:teamId?", ""),
    // The user's own coach at this level: each level has its own.
    coach: college ? routes.CVB_COACH : routes.PVB_COACH,
    // The one application: a coach and a request, for a user with no coach.
    apply: (teamId: number) =>
      (college ? routes.CVB_APPLY : routes.PVB_APPLY).replace(
        ":teamId",
        String(teamId),
      ),
    team: (teamId: number) =>
      (college ? routes.CVB_TEAM : routes.PVB_TEAM).replace(
        ":teamId?",
        String(teamId),
      ),
    match: (matchId: number) =>
      (college ? routes.CVB_MATCH : routes.PVB_MATCH).replace(
        ":matchId",
        String(matchId),
      ),
    player: (playerId: number) =>
      (college ? routes.CVB_PLAYER : routes.PVB_PLAYER).replace(
        ":playerId",
        String(playerId),
      ),
  };
};

const phaseLabels: Record<VbPhase, string> = {
  preseason: "Preseason",
  regular_season: "Regular Season",
  conference_tournament: "Conference Tournaments",
  national_tournament: "National Tournament",
  offseason: "Offseason",
};

export const vbPhaseLabel = (phase: VbPhase) => phaseLabels[phase] ?? phase;

/** "2027 · Regular Season · Week 3". Weeks only count within a phase. */
export const vbClockLabel = (clock: VbClock) => {
  const parts = [String(clock.Season), vbPhaseLabel(clock.Phase)];
  if (clock.Week > 0) parts.push(`Week ${clock.Week}`);
  return parts.join(" · ");
};

/** Turns an API identifier ("headCoach", "round_of_32") into "Head Coach". */
export const vbLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

/** Centimetres as feet and inches: 185 -> 6'1". */
export const vbHeight = (cm: number) => {
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

/** Hitting percentage the way volleyball writes it: .312, -.077, or a dash. */
export const vbPct = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  const text = Math.abs(value).toFixed(3).replace(/^0/, "");
  return value < 0 ? `-${text}` : text;
};

export const vbShare = (value: number) => `${Math.round(value * 100)}%`;

/** A record, "19–3", with the en dash the sport UI guide asks for. */
export const vbRecord = (row: { Wins: number; Losses: number }) =>
  `${row.Wins}–${row.Losses}`;

export const vbMoney = (dollars: number) => `$${dollars.toLocaleString("en-US")}`;

const matchKindLabels: Record<VbMatch["Kind"], string> = {
  non_conf: "Non-Conference",
  conf: "Conference",
  conf_tourney: "Conference Tournament",
  national: "National Tournament",
  pro_regular: "Regular Season",
  pro_playoff: "Playoffs",
  exhibition: "Exhibition",
};

export const vbMatchKindLabel = (kind: VbMatch["Kind"]) =>
  matchKindLabels[kind] ?? vbLabel(kind);

/** The API's own label ("Week 3 Saturday", "Playoffs round 1") when it sends one. */
export const vbMatchWhen = (match: VbMatch) =>
  match.LeagueTime.Label ??
  (match.LeagueTime.Phase === "regular_season"
    ? `Week ${match.LeagueTime.Week}`
    : vbPhaseLabel(match.LeagueTime.Phase));

/** A result exists only once the match is published. */
export const vbResult = (match: VbMatch) =>
  match.Status === "published" ? match.Result : null;

/** "25-21, 23-25, 25-19", from the point of view of `teamId` when given. */
export const vbSetScores = (match: VbMatch, teamId?: number) => {
  const result = vbResult(match);
  if (!result) return "";
  const awayFirst = teamId !== undefined && teamId === match.AwayTeamID;
  return result.Sets.map((set) =>
    awayFirst ? `${set.Away}-${set.Home}` : `${set.Home}-${set.Away}`,
  ).join(", ");
};

const awardLabels: Record<string, string> = {
  national_poy: "National Player of the Year",
  freshman_of_year: "Freshman of the Year",
  setter_of_year: "Setter of the Year",
  libero_of_year: "Libero of the Year",
  coach_of_year: "Coach of the Year",
  pro_mvp: "Pro League MVP",
  pro_rookie: "Pro Rookie of the Year",
  all_american: "All-American",
  all_conference: "All-Conference",
  all_pro: "All-Pro",
};

const ordinals = ["First", "Second", "Third", "Fourth", "Fifth"];

/** "All-American · First Team · OH", "Libero of the Year". */
export const vbAwardLabel = (award: VbAward) => {
  const parts = [awardLabels[award.Award] ?? vbLabel(award.Award)];
  const [team, position] = award.Slot.includes(":")
    ? award.Slot.split(":")
    : ["", award.Slot];
  if (team) parts.push(`${ordinals[Number(team) - 1] ?? `#${team}`} Team`);
  if (position) parts.push(position);
  return parts.join(" · ");
};

// The 26 ratings in the API's seven families: a family grade is the average
// of exactly these. Scale 0-50.
export const vbRatingGroups: Array<[group: string, keys: string[]]> = [
  [
    "Physical",
    ["vertical", "quickness", "lateralMovement", "power", "reflexes", "stamina"],
  ],
  ["Serving", ["servePower", "servePlacement", "serveMovement"]],
  [
    "Ball Control",
    ["serveReceive", "ballControl", "digging", "pursuit", "defensiveRead"],
  ],
  ["Setting", ["settingHands", "tempo", "setterVision"]],
  [
    "Attacking",
    ["attackPower", "attackPlacement", "approachTiming", "attackVision"],
  ],
  ["Blocking", ["blockTechnique", "blockFootwork", "blockRead"]],
  ["Temperament", ["consistency", "composure"]],
];
