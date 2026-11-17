import { getFirebaseIdToken } from "../_helper/authToken";
import { vbOrigin, vbUrl } from "../_constants/urls";
import type { RallyView } from "../_vendor/simvb-court-view/simvb-court-view.js";

// The volleyball API's address lives in urls.tsx with the other sports'; it
// is public, so it needs no build setting.
const base = vbUrl;

/**
 * Always true now that the address is fixed in urls.tsx. Kept so a page can
 * still hide volleyball by one switch if it is ever taken down.
 */
export const isVolleyballConfigured = Boolean(base);

/** The API's address with no /api/v1: where its own assets are served. */
export const vbApiOrigin = vbOrigin;

// The API's error body is { error: { code, message, details?, correlationId } }.
// Pages branch on `code` (NOT_YOUR_TEAM, NO_COACH, NOT_PUBLISHED, ...).
export class VbApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "VbApiError";
  }
}

const vbRequest = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> => {
  // Always a fresh token: the API verifies any token it is sent, on public
  // routes too, so a stale one would turn a public read into a 401.
  const token = await getFirebaseIdToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new VbApiError(
      0,
      "NETWORK",
      "The volleyball service could not be reached.",
    );
  }

  if (!response.ok) {
    let error: { code?: string; message?: string; details?: unknown } = {};
    try {
      error = (await response.json())?.error ?? {};
    } catch {
      // Not a JSON error body; fall through to the status text.
    }
    throw new VbApiError(
      response.status,
      error.code ?? "UNKNOWN",
      error.message ?? `HTTP Error: ${response.statusText}`,
      error.details,
    );
  }
  return (await response.json()) as T;
};

const vbGet = <T>(path: string) => vbRequest<T>("GET", path);

// Types mirror the API, which uses PascalCase keys.

export type VbLeagueKind = "college" | "pro";

export interface VbLeague {
  LeagueID: number;
  Name: string;
  Kind: VbLeagueKind;
  ConfigVersion: string;
  ConfigChecksum: string;
  LogoURL: string | null;
}

export type VbPhase =
  | "preseason"
  | "regular_season"
  | "conference_tournament"
  | "national_tournament"
  | "offseason";

export interface VbClock {
  LeagueID: number;
  Season: number;
  Phase: VbPhase;
  Week: number;
  Day: number;
  /** Monotonic counter of clock advances; a change means cached data is stale. */
  Tick: number;
  Paused: boolean;
  AutoAdvance: boolean;
  NextDueAt: string | null;
  NextAction: string | null;
  Calendar?: VbCalendar;
}

/** The shape of a league's year. A null field does not apply to the league. */
export interface VbCalendar {
  RegularSeasonWeeks: number;
  MatchDays: Array<{ Day: number; Name: string }>;
  RegularSeasonMatches: number | null;
  ConferenceTournamentMaxRounds: number | null;
  NationalTournamentTeams: number | null;
  PlayoffTeams: number | null;
  TradeDeadlineWeek: number | null;
  OffseasonDays: number;
}

export type VbPosition = "S" | "OH" | "MB" | "OPP" | "L";

/**
 * A player's ability as letter grades, with no numbers. For a college player
 * the source is "consensus": one public read, the same for everyone and fixed
 * per player, which can be a step off. For a pro it is "true".
 */
export interface VbAbilityGrades {
  Source: "consensus" | "true";
  Position: VbPosition | null;
  /** Her overall at her own position. */
  Overall: string | null;
  OverallByPosition: Record<string, string>;
  /** Physical, Serving, BallControl, Setting, Attacking, Blocking, Temperament. */
  Families: Record<string, string>;
}

export interface VbTeam {
  TeamID: number;
  LeagueID: number;
  Kind: "college_program" | "pro_club";
  SchoolID: number | null;
  Name: string;
  Nickname: string;
  ColorOne: string;
  ColorTwo: string;
  ColorThree: string;
  ConferenceID: number | null;
  Conference: string | null;
  Controller: "human" | "ai";
  Abbreviation: string | null;
  City: string | null;
  /** null means: fall back to the league's LogoURL. */
  LogoURL: string | null;
}

export interface VbPhilosophy {
  TalentSource: number;
  SpendingSplit: number;
  TimeHorizon: number;
  RiskAppetite: number;
  OffensiveSystem: "5-1" | "6-2";
  DefensiveIdentity: number;
  FundraisingEngagement: number;
  StaffStyle: number;
}

/**
 * A user's coach. A user can have one college coach and one pro coach: two
 * separate people, each with their own build. A human coach stays at the
 * level it was made for.
 */
export interface VbCoach {
  PersonID: number;
  /** The level this coach coaches at. Older answers leave it out. */
  Level?: VbLeagueKind;
  Username: string;
  FirstName: string;
  LastName: string;
  Age: number;
  Background: string;
  Stage: "rising" | "established" | "veteran";
  Adjustments: Record<string, number>;
  Abilities: Record<string, number>;
  Philosophy: VbPhilosophy | null;
  TeamID: number | null;
  BuildResetSeason: number | null;
  Traits: string[];
  /** The coach's job at their team; absent or null without one. */
  Role?: VbStaffRole | null;
}

/** The coach a user without one designs as part of an application. */
export interface VbRequestCoach extends VbCoachBuild {
  FirstName?: string;
  LastName?: string;
  Philosophy?: VbPhilosophy;
  PickTrait?: string;
}

export interface VbRequestAnswer {
  Question: string;
  Answer: string;
}

export interface VbClaimRequest {
  ID: number;
  Username: string;
  /** A TeamID. */
  OrgID: number;
  TeamName: string;
  IsApproved: boolean;
  Status: "pending" | "approved" | "rejected" | "withdrawn" | "superseded";
  CreatedAt: string;
  DecidedAt: string | null;
  /** The coach sent with the application; null when none was. */
  Coach?: VbRequestCoach | null;
  Answers?: VbRequestAnswer[];
  /** A rejection reason or an admin's note. */
  Note?: string | null;
  /** When the application was last sent. */
  UpdatedAt?: string | null;
  /** The job asked for: headCoach, or a pro club's staff role. */
  Role?: VbStaffRole;
  /**
   * Who decides it. A request for a pro club's staff role is decided by
   * that club's staff, not by site admins.
   */
  Approver?: "admin" | "staff";
}

/** The jobs a user can ask for. College programs take head coaches only. */
export type VbStaffRole =
  | "headCoach"
  | "associateHeadCoach"
  | "strengthConditioning"
  | "setterCoach"
  | "athleticTrainer"
  | "videoAnalytics"
  | "defensiveCoordinator"
  | "offensiveCoordinator";

/** A pro club's roles a user can ask for, in the order the club lists them. */
export const vbProStaffRoles: VbStaffRole[] = [
  "headCoach",
  "associateHeadCoach",
  "offensiveCoordinator",
  "defensiveCoordinator",
  "setterCoach",
  "strengthConditioning",
  "athleticTrainer",
  "videoAnalytics",
];

/** A pro club's requests for its staff roles, decided by its staff. */
export interface VbStaffRequests {
  TeamID: number;
  Requests: VbClaimRequest[];
}

export interface VbManagedTeam {
  TeamID: number;
  Name: string;
  Kind: VbLeagueKind;
  LeagueID: number;
  /** The user's job there: headCoach, or a pro staff role. */
  Role?: VbStaffRole;
}

export interface VbMe {
  Username: string | null;
  /** For older code only: the college coach, else the pro coach. Read Coaches. */
  Coach: VbCoach | null;
  /** The user's coach at each level. Older answers leave it out. */
  Coaches?: { College: VbCoach | null; Pro: VbCoach | null };
  /** Up to two entries, one per level. */
  Teams: VbManagedTeam[];
  Requests: VbClaimRequest[];
}

export interface VbConference {
  ConferenceID: number;
  LeagueID: number;
  Name: string;
  ShortName: string;
  HostsTournament: boolean;
}

export type VbInjuryStatus =
  | "Day-to-day"
  | "Out"
  | "Out for season"
  | "Out indefinitely";

/**
 * A row of the public roster. It carries no ratings. Position is a label
 * only: the role she started in most, or her best fit when she has no starts.
 */
export interface VbRosterPlayer {
  PlayerID: number;
  Name: string;
  FirstName: string;
  LastName: string;
  Jersey: string | null;
  Class: "FR" | "SO" | "JR" | "SR" | "GR";
  Status: "active" | "injured" | "departed";
  HeightCm: number;
  StandingReachCm: number;
  BirthYear: number | null;
  Bootstrap: boolean;
  Tags: string[];
  Position?: VbPosition | null;
  PositionSource?: "started" | "best_fit" | null;
  AbilityGrades?: VbAbilityGrades | null;
  /** Here ExpectedReturn is a label; in the injury report it is an object. */
  Injury: {
    Status: VbInjuryStatus;
    BodyPart: string;
    ExpectedReturn: string;
  } | null;
}

export interface VbRoster {
  TeamID: number;
  Players: VbRosterPlayer[];
}

/** A pro player. Pro ratings are true numbers (0-50) and public. */
export interface VbProPlayer {
  PlayerID: number;
  Name: string;
  Jersey: string | null;
  Age: number | null;
  HeightCm: number;
  StandingReachCm: number;
  Tags: string[];
  /** A label only, by the same rule as the college roster. */
  Position?: VbPosition | null;
  PositionSource?: "started" | "best_fit" | null;
  AbilityGrades?: VbAbilityGrades | null;
  /** True family averages and overalls on the 0-50 scale: public for pros. */
  Families?: Record<string, number>;
  Overall?: number;
  OverallByPosition?: Record<string, number>;
  /** Dollars; 0 when she has no active contract. */
  Salary: number;
  /** Season year; 0 when she has no active contract. */
  ContractThrough: number;
  /** Keyed by the 26 camelCase rating keys. */
  ProRatings: Record<string, number>;
}

export interface VbProRoster {
  ClubID: number;
  Name: string;
  Payroll: number;
  Players: VbProPlayer[];
}

export interface VbInjuryReport {
  TeamID: number;
  Season: number;
  Injuries: Array<{
    PlayerID: number;
    Name: string;
    Jersey: string | null;
    BodyPart: string;
    Status: VbInjuryStatus;
    Source: "match" | "training";
    ExpectedReturn: { Season: number; Week: number | null; Label: string };
  }>;
}

/** Flat facesjs-style data, the same fields as FaceDataResponse. */
export type VbFaceData = Record<string, string | number | boolean>;
export type VbFaces = Record<string, VbFaceData>;

export interface VbStaffMember {
  PersonID: number;
  Name: string;
  Role: string;
  Interim: boolean;
  ReportsToPersonID: number | null;
  Since: number;
  /** Dollars. */
  Salary: number;
  ContractThrough: number | null;
  Traits: string[];
  /** Track-record estimates: a grade or a "low–high" range per attribute. */
  Grades: Record<string, string>;
  /** The user in this job; null for AI staff. */
  Username?: string | null;
}

export interface VbStaff {
  TeamID: number;
  Payroll: number;
  Philosophy: VbPhilosophy | null;
  Staff: VbStaffMember[];
}

export interface VbTeamHistory {
  TeamID: number;
  Seasons: Array<{
    Season: number;
    Wins: number;
    Losses: number;
    ConfWins: number;
    ConfLosses: number;
    ConfRank: number | null;
    EloRank: number | null;
    Elo: number | null;
    RPIRank: number | null;
    ConfTourneySeed: number | null;
    ConfTourneyResult: string | null;
    NationalSeed: number | null;
    NationalResult: string | null;
    /**
     * True on the last entry only: the season being played, live from
     * published results. Its Elo and EloRank are current, not final, and a
     * tournament still under way reads "in_progress".
     */
    InProgress?: boolean;
    /** Every head coach of the season in order (more than one after a mid-season change). */
    HeadCoaches?: Array<{
      PersonID: number;
      Name: string;
      Username: string | null;
      Interim: boolean;
    }>;
    /**
     * The class that arrived this season (signed in the season before's
     * window). Null when nobody signed, and for the league's first season.
     */
    RecruitingClassRank?: number | null;
  }>;
}

/** `Season` is the season of the recruiting window the class signed in. */
export interface VbClassRankings {
  LeagueID: number;
  Season: number;
  /** The window is still open: the ranking moves as commitments land. */
  InProgress: boolean;
  /** How points are counted, in a sentence to show as it is. */
  Scoring: string;
  Teams: Array<{
    TeamID: number;
    Name: string;
    Rank: number;
    Points: number;
    Commits: number;
    /** Commits by star count: { "5": 1, "4": 3 }. */
    Stars: Record<string, number>;
    AverageRank: number | null;
    /** Shown, not scored. */
    Transfers: number;
  }>;
}

export interface VbCommitments {
  TeamID: number;
  Season: number;
  Commitments: Array<{
    PersonID: number;
    Name: string;
    Position: string;
    Stars: number;
    Rank: number;
    Status: string;
    CommittedRound: number | null;
    AbilityGrades?: VbAbilityGrades | null;
  }>;
}

export interface VbLeagueTime {
  Season: number;
  Phase: VbPhase;
  /** 0 for tournament rounds, which carry the round in Day. */
  Week: number;
  Day: number;
  /** Sort by this for date order. */
  Order?: number;
  /** "Week 3 Saturday", "Conference tournament round 2". */
  Label?: string;
}

export interface VbSetScore {
  SetNumber: number;
  Home: number;
  Away: number;
}

export interface VbMatch {
  MatchID: number;
  LeagueID: number;
  /** An internal id, not the year. The year is LeagueTime.Season. */
  SeasonID: number;
  Kind:
    | "non_conf"
    | "conf"
    | "conf_tourney"
    | "national"
    | "pro_regular"
    | "pro_playoff"
    | "exhibition";
  /** Show a result only when this is "published". */
  Status:
    | "scheduled"
    | "leased"
    | "simulated"
    | "published"
    | "failed"
    | "cancelled";
  HomeTeamID: number;
  AwayTeamID: number;
  HomeName: string;
  AwayName: string;
  NeutralSite: boolean;
  LeagueTime: VbLeagueTime;
  Result: {
    WinnerTeamID: number;
    SetsHome: number;
    SetsAway: number;
    Sets: VbSetScore[];
  } | null;
  PublishedAt: string | null;
  /**
   * When the match airs. Known for the next slate only; later matches carry
   * null, and so does a match that publishes without airing.
   */
  BroadcastStartsAt?: string | null;
  /** Null when the match does not air. */
  Broadcast?: {
    StartsAt: string;
    Status: "scheduled" | "live" | "ended";
    EndsAt: string | null;
  } | null;
}

/** The score once a rally has finished airing. Home and Away are the set's points. */
export interface VbAiredScore {
  Home: number;
  Away: number;
  SetsHome: number;
  SetsAway: number;
}

/**
 * A match on air, as far as it has aired. Nothing here says how many rallies
 * are left or when the match will end.
 */
export interface VbBroadcast {
  MatchID: number;
  Status: "scheduled" | "live" | "ended";
  StartsAt: string;
  /** The server's clock, to correct the viewer's. */
  ServerNow: string;
  CourtViewVersion: number;
  /** Rallies that have started airing, in order. */
  Aired: Array<{
    Set: number;
    Rally: number;
    /** Milliseconds after StartsAt. */
    StartMs: number;
    /** The clip's length, with its slow-motion replay when Replay is true. */
    DurationMs: number;
    Replay: boolean;
    /** Null until the rally has finished airing. */
    After: VbAiredScore | null;
  }>;
  /** The set break on air, or the next one once the rally before it has ended. */
  Break: { Kind: string; StartMs: number; DurationMs: number } | null;
  /** Sent at most 20 seconds before it starts, so it can be loaded early. */
  Next: { Set: number; Rally: number; StartMs: number } | null;
  EndsAt: string | null;
}

export interface VbLeagueBroadcasts {
  Slates: Array<{
    SlateID: number;
    Label: string;
    StartsAt: string;
    Status: "scheduled" | "live" | "ended";
    Matches: Array<{
      MatchID: number;
      HomeName: string;
      AwayName: string;
      StartsAt: string;
      Status: "scheduled" | "live" | "ended";
      EndsAt: string | null;
    }>;
  }>;
  /** The next slate before it has been simulated. */
  Upcoming: Array<{ Label: string; StartsAt: string | null }>;
}

export interface VbLeagueSchedule {
  LeagueID: number;
  Season: number;
  /** These three count the whole season, not the filtered list. */
  Scheduled: number;
  Published: number;
  Total: number;
  Matches: VbMatch[];
}

export interface VbTeamSchedule {
  TeamID: number;
  Season: number;
  Matches: VbMatch[];
}

export interface VbStanding {
  Rank: number;
  TeamID: number;
  Name: string;
  ConferenceID: number | null;
  Conference: string | null;
  ConfWins: number;
  ConfLosses: number;
  Wins: number;
  Losses: number;
  HomeWins: number;
  HomeLosses: number;
  RoadWins: number;
  RoadLosses: number;
  SetsWon: number;
  SetsLost: number;
  PointsFor: number;
  PointsAgainst: number;
  /** "W3", "L1", or "" before any result. */
  Streak: string;
}

export interface VbStandings {
  LeagueID: number;
  Season: number;
  Standings: VbStanding[];
}

export interface VbEloRow {
  Rank: number;
  TeamID: number;
  Name: string;
  Elo: number;
  Wins: number;
  Losses: number;
}

/** The league's poll: a human-style ranking, the one to lead with. */
export interface VbPollRow {
  Rank: number;
  TeamID: number;
  Name: string;
  /** The poll's own score: higher is better; it has no unit and can be negative. */
  Score: number;
  Wins: number;
  Losses: number;
}

/**
 * A season with no poll comes back with every team at score 0 and 0-0,
 * ranked in id order, rather than as an empty list. Such a list is no poll.
 */
export const vbPollRows = (rows: VbPollRow[] | undefined) =>
  rows?.some((row) => row.Score !== 0 || row.Wins || row.Losses) ? rows : [];

export interface VbRpiRow {
  Rank: number;
  TeamID: number;
  Name: string;
  RPI: number;
  WP: number;
  OWP: number;
  OOWP: number;
  Games: number;
}

export interface VbRankings<Row> {
  LeagueID: number;
  Season: number;
  Rankings: Row[];
}

/** camelCase, unlike the rest of the API. */
export interface VbBracketSlot {
  round: number;
  slot: number;
  teamA: number | null;
  teamB: number | null;
  seedA: number | null;
  seedB: number | null;
  matchId: number | null;
  winner: number | null;
  bye: boolean;
}

export interface VbTournament {
  TournamentID: number;
  Kind: "conference" | "national" | "pro_playoff";
  ConferenceID: number | null;
  Conference: string | null;
  Status: "scheduled" | "in_progress" | "complete";
  FieldSize: number;
  Rounds: number;
  ChampionTeamID: number | null;
  Champion: string | null;
  Seeds: Array<{ Seed: number; TeamID: number; Name: string }>;
  Bracket: {
    size: number;
    rounds: VbBracketSlot[][];
    champion: number | null;
  } | null;
}

export interface VbTournaments {
  LeagueID: number;
  Season: number;
  Tournaments: VbTournament[];
}

export interface VbLeagueHistory {
  LeagueID: number;
  Seasons: Array<{
    Season: number;
    ChampionTeamID: number | null;
    Champion: string | null;
    RunnerUpTeamID: number | null;
    RunnerUp: string | null;
    FinalScore: string | null;
    FinalFour: string[];
    BestRecord: string | null;
    ConferenceChampions: number;
  }>;
  Headlines: string[];
}

/** A ready-made story of the league. It carries names only, no ids. */
export interface VbHistoryWelcome {
  LeagueID: number;
  From: number | null;
  To: number | null;
  Story: string[];
  Seasons: Array<{
    Season: number;
    Champion: string | null;
    RunnerUp: string | null;
    FinalScore: string | null;
    FinalFour: string[];
    ProChampion: string | null;
    Awards: Array<{ Award: string; Name: string; Team: string }>;
  }>;
  // Each count is every time the program reached that round: a champion
  // also counts in Finals, FinalFours and so on.
  Programs: Array<{
    Team: string;
    Titles: number;
    FinalFours: number;
    Finals?: number;
    EliteEights?: number;
    Sweet16s?: number;
    RoundOf32s?: number;
    Appearances?: number;
  }>;
  Players: Array<{ Name: string; Team: string; Highlights: string[] }>;
  Coaches: Array<{
    Name: string;
    Wins: number;
    Losses: number;
    Titles: number;
    Teams: string[];
  }>;
  Headlines: string[];
}

export interface VbAward {
  Season: number;
  Award: string;
  /** "" or "conf:<ConferenceID>". */
  Scope: string;
  /** "", "<position>", or "<team number>:<position>". */
  Slot: string;
  PlayerID: number;
  Name: string;
  TeamID: number;
  Team: string;
}

export interface VbBoxLine {
  K: number;
  E: number;
  TA: number;
  /** Hitting percentage (K - E) / TA; null with no attempts. */
  PCT: number | null;
  A: number;
  SA: number;
  SE: number;
  RE: number;
  DIG: number;
  BS: number;
  BA: number;
  BHE: number;
  /** On the 0-3 pass grade scale. */
  PassRating: number | null;
}

export interface VbBoxScore {
  MatchID: number;
  Teams: Array<
    VbBoxLine & {
      TeamID: number;
      Name: string;
      Points: number;
      BlockPoints: number;
      OpponentErrors: number;
    }
  >;
  Players: Array<
    VbBoxLine & {
      PlayerID: number;
      TeamID: number;
      Name: string;
      Jersey?: string | null;
      /** The role she started in; null for substitutes and older matches. */
      Position?: VbPosition | null;
      /** Sets played. */
      S: number;
      /** Kills + aces + blocks, a block assist counting half. */
      PTS: number;
    }
  >;
}

export interface VbPlayByPlay {
  MatchID: number;
  Verbosity: string;
  Lines: Array<{
    Set: number;
    Rally: number;
    /** The score after the rally. */
    Home: number;
    Away: number;
    WinnerTeamID: number;
    Reason: string;
    Text: string;
  }>;
}

export interface VbMatchSummary {
  MatchID: number;
  Match: string | null;
  Sets: Array<VbSetScore & { WinnerTeamID: number; Text: string }>;
}

export interface VbTacticsReportTeam {
  /** Spelled TeamId on this route only. */
  TeamId: number;
  Attack: {
    Attempts: number;
    Kills: number;
    Efficiency: number;
    ByTempo: Array<{
      Tempo: string;
      Attempts: number;
      Kills: number;
      Errors: number;
      Blocked: number;
      Efficiency: number;
      Share: number;
    }>;
    OffSpeedShare: number;
    Setters: number;
  };
  Serve: {
    Serves: number;
    Aces: number;
    Errors: number;
    JumpShare: number;
    /** Zone 1..6 -> serves aimed there. */
    ByZone: Record<string, number>;
  };
  Receive: {
    Receptions: number;
    Passers: number;
    AverageGrade: number;
    PerfectShare: number;
  };
  Block: { Stuffs: number; Touches: number; AverageBlockersUp: number };
  OpponentEfficiency: number;
}

export interface VbTacticsReport {
  MatchID: number;
  /** [home, away]. */
  Teams: VbTacticsReportTeam[];
}

export interface VbHighlights {
  MatchID: number;
  Highlights: Array<{
    Set: number;
    Rally: number;
    Score: number;
    Tags: string[];
    Featured: boolean;
    Title: string;
  }>;
}

const query = (
  params: Record<string, string | number | boolean | null | undefined>,
) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

/** A player's public profile. College ratings never appear here. */
export interface VbPlayerProfile {
  PlayerID: number;
  Name: string;
  FirstName: string;
  LastName: string;
  Hometown: string | null;
  BirthYear: number | null;
  Age: number | null;
  /** Her team now. */
  Team: {
    TeamID: number;
    Name: string;
    LeagueID: number;
    LeagueKind: VbLeagueKind;
  } | null;
  /** Set when she has no team now. */
  LastTeam: {
    TeamID: number;
    Name: string;
    LeagueID: number;
    LeagueKind: VbLeagueKind;
    ToSeason: number | null;
  } | null;
  Jersey: string | null;
  /** null for pros. */
  Class: "FR" | "SO" | "JR" | "SR" | "GR" | null;
  HeightCm: number;
  StandingReachCm: number;
  Tags: string[];
  Status:
    | "active"
    | "injured"
    | "graduated"
    | "free_agent"
    | "retired"
    | "overseas"
    | "recruit"
    | "former";
  Injury: { Status: string; BodyPart: string; ExpectedReturn: string } | null;
  /** A label only: nothing may be derived from it. */
  Position: VbPosition | null;
  PositionSource: "started" | "best_fit" | "recruiting" | null;
  Bootstrap: boolean;
  AbilityGrades?: VbAbilityGrades | null;
  /** Pros only. */
  ProRatings: Record<string, number> | null;
  Contract: { Salary: number; Through: number; Kind: string } | null;
}

/** The statistics line every statistics route shares. */
export interface VbStatLine {
  Matches: number;
  Sets: number;
  Kills: number;
  Errors: number;
  Attempts: number;
  HittingPct: number | null;
  Assists: number;
  Aces: number;
  ServiceErrors: number;
  ReceptionErrors: number;
  Digs: number;
  BlockSolos: number;
  BlockAssists: number;
  Blocks: number;
  BallHandlingErrors: number;
  /** Kills + aces + block solos + half of block assists. */
  Points: number;
  PassAttempts: number;
  /** On the 0-3 scale. */
  PassRating: number | null;
  PerSet: {
    Kills: number;
    Assists: number;
    Aces: number;
    Digs: number;
    Blocks: number;
    Points: number;
  } | null;
}

export type VbStatPhase = "all" | "regular" | "postseason";

export interface VbPlayerStats {
  PlayerID: number;
  /** One row per league, season and team. */
  Seasons: Array<
    VbStatLine & {
      Season: number;
      LeagueID: number;
      LeagueKind: VbLeagueKind;
      TeamID: number;
      TeamName: string;
    }
  >;
  Careers: Array<
    VbStatLine & { LeagueKind: VbLeagueKind; SeasonsPlayed: number }
  >;
}

/** The columns the leaders route can sort by. */
export type VbStatSort =
  | "Matches"
  | "Sets"
  | "Kills"
  | "Errors"
  | "Attempts"
  | "HittingPct"
  | "Assists"
  | "Aces"
  | "ServiceErrors"
  | "ReceptionErrors"
  | "Digs"
  | "BlockSolos"
  | "BlockAssists"
  | "Blocks"
  | "Points"
  | "PassRating";

export interface VbLeaderFilters {
  Season?: number;
  Sort?: VbStatSort;
  Order?: "asc" | "desc";
  /** Sorts a total by its per-set value. */
  PerSet?: boolean;
  MinSets?: number;
  TeamID?: number;
  ConferenceID?: number;
  Phase?: VbStatPhase;
  Limit?: number;
  Offset?: number;
}

export interface VbLeaders {
  LeagueID: number;
  Season: number;
  Sort: VbStatSort;
  Order: "asc" | "desc";
  PerSet: boolean;
  Total: number;
  Players: Array<
    VbStatLine & {
      Rank: number;
      PlayerID: number;
      Name: string;
      TeamID: number;
      TeamName: string;
      Position: VbPosition | null;
      AbilityGrades?: VbAbilityGrades | null;
    }
  >;
}

export interface VbTeamStats {
  LeagueID: number;
  Season: number;
  Teams: Array<VbStatLine & { TeamID: number; TeamName: string }>;
}

export interface VbTopPlays {
  LeagueID: number;
  Season: number;
  Week: number | null;
  Plays: Array<{
    Rank: number;
    MatchID: number;
    Set: number;
    Rally: number;
    Week: number | null;
    Phase: VbPhase;
    HomeTeamID: number;
    AwayTeamID: number;
    Matchup: string;
    /** The set score after the rally. */
    HomeScore: number;
    AwayScore: number;
    Title: string;
    Text: string;
    Tags: string[];
    HomeLogoURL: string | null;
    AwayLogoURL: string | null;
  }>;
}

export const vbNewsTypes = [
  "champion",
  "award",
  "coach_hired",
  "coach_departed",
  "commitment",
  "transfer",
  "drafted",
  "pro_signed",
  "pro_released",
  "pro_retired",
  "overseas",
  "traded",
] as const;

export type VbNewsType = (typeof vbNewsTypes)[number];

export interface VbNews {
  LeagueID: number;
  Season: number;
  Total: number;
  Items: Array<{
    ID: string;
    LeagueID: number;
    LeagueKind: VbLeagueKind;
    Season: number;
    Week: number | null;
    Round: number | null;
    Type: VbNewsType;
    Message: string;
    TeamID: number | null;
    TeamName: string | null;
    /** null on coach items, which carry CoachID instead. */
    PlayerID: number | null;
    /** The coach's person id on coach_hired and coach_departed items: for a coach page. */
    CoachID?: number | null;
    At: string | null;
  }>;
}

export type VbRecordScope =
  | "match"
  | "season"
  | "career"
  | "team_match"
  | "team_season"
  | "program";

export interface VbRecords {
  LeagueID: number;
  Scope: string;
  TeamID: number | null;
  Records: Array<{
    Stat: string;
    Label: string;
    Entries: Array<{
      Rank: number;
      Value: number;
      PlayerID: number | null;
      Name: string | null;
      TeamID: number;
      TeamName: string;
      Season: number | null;
      MatchID: number | null;
      OpponentID: number | null;
      OpponentName: string | null;
      /** Context for the value: "22 sets", "212 attempts", "28–4". */
      Detail: string | null;
    }>;
  }>;
}

/** A coach as a person: who they are now, and everywhere they have been. */
export interface VbCoachProfile {
  PersonID: number;
  Name: string;
  FirstName: string;
  LastName: string;
  Age: number | null;
  /** Human coaches only. */
  Username: string | null;
  /** null when out of work. */
  Current: {
    TeamID: number;
    TeamName: string;
    LeagueID: number;
    LeagueKind: VbLeagueKind;
    Role: string;
    Interim: boolean;
    Since: number;
    Salary: number;
    ContractThrough: number | null;
  } | null;
  /** In the pool of coaches looking for work. */
  InPool: boolean;
  Traits: string[];
  /** The same public estimates a team's staff list shows. */
  Grades: Record<string, string>;
  /** Head coaches only. */
  Philosophy: VbPhilosophy | null;
  SeasonsCoaching: number;
  HeadCoachTotals: { Seasons: number; Wins: number; Losses: number } | null;
  /** One row per season. Record is set for head-coaching seasons played. */
  Career: Array<{
    Season: number;
    TeamID: number;
    TeamName: string;
    LeagueKind: VbLeagueKind;
    Role: string;
    Interim: boolean;
    Record: {
      Wins: number;
      Losses: number;
      ConfWins: number;
      ConfLosses: number;
      EloRank: number | null;
      ConfTourney: string | null;
      National: string | null;
    } | null;
  }>;
  /** Hired, fired, retired, not renewed, hired away, extended, released. */
  Moves: Array<{
    Season: number;
    Type: string;
    TeamID: number | null;
    TeamName: string | null;
    Role: string | null;
    Detail: string | null;
  }>;
}

export interface VbCoachLookup {
  Username: string;
  Coaches: Array<{
    PersonID: number;
    Name: string;
    Team: {
      TeamID: number;
      Name: string;
      Kind: VbLeagueKind;
      LeagueID: number;
      /** Their job there: headCoach, or a pro staff role. */
      Role?: VbStaffRole;
    } | null;
  }>;
}

// Public reads. Season defaults to the league clock's current season.
export const VolleyballService = {
  getLeagues: () => vbGet<VbLeague[]>("/leagues"),
  getClock: (leagueId: number) => vbGet<VbClock>(`/leagues/${leagueId}/clock`),
  getConferences: (leagueId: number) =>
    vbGet<VbConference[]>(`/leagues/${leagueId}/conferences`),
  getTeams: (leagueId: number) => vbGet<VbTeam[]>(`/teams?LeagueID=${leagueId}`),
  getTeam: (teamId: number) => vbGet<VbTeam>(`/teams/${teamId}`),
  getRoster: (teamId: number) => vbGet<VbRoster>(`/teams/${teamId}/roster`),
  getProRoster: (clubId: number) =>
    vbGet<VbProRoster>(`/pro/clubs/${clubId}/roster`),
  getTeamFaces: (teamId: number) => vbGet<VbFaces>(`/faces?TeamID=${teamId}`),
  getFaces: (playerIds: number[]) =>
    vbGet<VbFaces>(`/faces?PlayerIDs=${playerIds.join(",")}`),
  getInjuries: (teamId: number) =>
    vbGet<VbInjuryReport>(`/teams/${teamId}/injuries`),
  getStaff: (teamId: number) => vbGet<VbStaff>(`/teams/${teamId}/staff`),
  getTeamHistory: (teamId: number) =>
    vbGet<VbTeamHistory>(`/teams/${teamId}/history`),
  // Season is the recruiting window's season; without it, the latest class.
  getClassRankings: (leagueId: number, season?: number) =>
    vbGet<VbClassRankings>(
      `/leagues/${leagueId}/recruiting/class-rankings${query({ Season: season })}`,
    ),
  // Never cached by the API: poll it every few seconds while a match is live.
  getBroadcast: (matchId: number) =>
    vbGet<VbBroadcast>(`/matches/${matchId}/broadcast`),
  // With no filter: the slates around now.
  getLeagueBroadcasts: (
    leagueId: number,
    filters: { Season?: number; Week?: number; Phase?: string; Limit?: number } = {},
  ) =>
    vbGet<VbLeagueBroadcasts>(`/leagues/${leagueId}/broadcasts${query(filters)}`),
  getCommitments: (teamId: number) =>
    vbGet<VbCommitments>(`/teams/${teamId}/commitments`),
  getTeamSchedule: (teamId: number, season?: number) =>
    vbGet<VbTeamSchedule>(
      `/teams/${teamId}/schedule${query({ Season: season })}`,
    ),
  // A whole college season is several megabytes: always pass a week or a
  // tournament phase. The list comes back in date order.
  getLeagueSchedule: (
    leagueId: number,
    season: number,
    part: number | "conference_tournament" | "national_tournament",
  ) =>
    vbGet<VbLeagueSchedule>(
      `/leagues/${leagueId}/schedule${query(
        typeof part === "number"
          ? { Season: season, Week: part, Phase: "regular_season" }
          : { Season: season, Phase: part },
      )}`,
    ),
  getStandings: (leagueId: number, season?: number, conferenceId?: number) =>
    vbGet<VbStandings>(
      `/leagues/${leagueId}/standings${query({ Season: season, ConferenceID: conferenceId })}`,
    ),
  // The league's poll, the primary ranking. Limit defaults to 25 (max 400).
  getPollRankings: (leagueId: number, season?: number, limit?: number) =>
    vbGet<VbRankings<VbPollRow>>(
      `/leagues/${leagueId}/rankings/poll${query({ Season: season, Limit: limit })}`,
    ),
  getEloRankings: (leagueId: number, season?: number, limit?: number) =>
    vbGet<VbRankings<VbEloRow>>(
      `/leagues/${leagueId}/rankings/elo${query({ Season: season, Limit: limit })}`,
    ),
  getRpiRankings: (leagueId: number, season?: number, limit?: number) =>
    vbGet<VbRankings<VbRpiRow>>(
      `/leagues/${leagueId}/rankings/rpi${query({ Season: season, Limit: limit })}`,
    ),
  getTournaments: (leagueId: number, season?: number) =>
    vbGet<VbTournaments>(
      `/leagues/${leagueId}/tournaments${query({ Season: season })}`,
    ),
  getLeagueHistory: (leagueId: number) =>
    vbGet<VbLeagueHistory>(`/leagues/${leagueId}/history`),
  getHistoryWelcome: (leagueId: number) =>
    vbGet<VbHistoryWelcome>(`/leagues/${leagueId}/history/welcome`),
  getLeagueAwards: (leagueId: number, season?: number) =>
    vbGet<{ LeagueID: number; Season: number; Awards: VbAward[] }>(
      `/leagues/${leagueId}/awards${query({ Season: season })}`,
    ),
  getPlayerAwards: (playerId: number) =>
    vbGet<{ PlayerID: number; Awards: VbAward[] }>(
      `/players/${playerId}/awards`,
    ),
  getMatch: (matchId: number) => vbGet<VbMatch>(`/matches/${matchId}`),
  // The five below answer 404 NOT_PUBLISHED until the match is published.
  getMatchSummary: (matchId: number) =>
    vbGet<VbMatchSummary>(`/matches/${matchId}/summary`),
  getBoxScore: (matchId: number) =>
    vbGet<VbBoxScore>(`/matches/${matchId}/box-score`),
  getPlayByPlay: (matchId: number) =>
    vbGet<VbPlayByPlay>(`/matches/${matchId}/play-by-play`),
  getTacticsReport: (matchId: number) =>
    vbGet<VbTacticsReport>(`/matches/${matchId}/tactics-report`),
  getHighlights: (matchId: number) =>
    vbGet<VbHighlights>(`/matches/${matchId}/highlights`),
  // 404 NOT_FOUND for unknown ids and for coaches.
  getPlayer: (playerId: number) =>
    vbGet<VbPlayerProfile>(`/players/${playerId}`),
  getPlayerStats: (playerId: number, phase?: VbStatPhase) =>
    vbGet<VbPlayerStats>(`/players/${playerId}/stats${query({ Phase: phase })}`),
  getLeaders: (leagueId: number, filters: VbLeaderFilters) =>
    vbGet<VbLeaders>(`/leagues/${leagueId}/stats/players${query({ ...filters })}`),
  getTeamStats: (
    leagueId: number,
    filters: { Season?: number; Phase?: VbStatPhase; ConferenceID?: number },
  ) => vbGet<VbTeamStats>(`/leagues/${leagueId}/stats/teams${query(filters)}`),
  // Each match's best-scored rally, best first. With a week: that
  // regular-season week. Without: the season, kept replays only.
  getTopPlays: (
    leagueId: number,
    filters: { Season?: number; Week?: number; Limit?: number },
  ) => vbGet<VbTopPlays>(`/leagues/${leagueId}/top-plays${query(filters)}`),
  // Newest first. IncludePro on the college league adds the pro league's items.
  getNews: (
    leagueId: number,
    filters: {
      Season?: number;
      IncludePro?: boolean;
      /** Comma-separated VbNewsType values. */
      Type?: string;
      TeamID?: number;
      /** Items whose team was in that conference that season; drops pro items. */
      ConferenceID?: number;
      Limit?: number;
      Offset?: number;
    },
  ) => vbGet<VbNews>(`/leagues/${leagueId}/news${query(filters)}`),
  // With a TeamID: that program's own record book.
  getRecords: (
    leagueId: number,
    scope: VbRecordScope,
    filters: { Top?: number; TeamID?: number } = {},
  ) =>
    vbGet<VbRecords>(
      `/leagues/${leagueId}/records${query({ Scope: scope, ...filters })}`,
    ),
  // Any coach, AI or human, employed or in the pool. 404 for anyone else.
  getCoach: (personId: number) => vbGet<VbCoachProfile>(`/coaches/${personId}`),
  // Case-insensitive; Coaches is empty for an unknown username.
  getCoachesByUsername: (username: string) =>
    vbGet<VbCoachLookup>(
      `/coaches/by-username/${encodeURIComponent(username)}`,
    ),
};

/** A coach's starting point: where they came from and how far along they are. */
export interface VbCoachBuild {
  Background: string;
  Stage: VbCoach["Stage"];
  /** Coach attribute -> whole points up or down. */
  Adjustments?: Record<string, number>;
}

export interface VbCoachCreate extends VbCoachBuild {
  Username: string;
  /** The API takes "college" when it is left out. */
  Level: VbLeagueKind;
  FirstName?: string;
  LastName?: string;
  Philosophy?: VbPhilosophy;
  /** One of PickableTraits; a second trait is then drawn at random. */
  PickTrait?: string;
}

export interface VbBuildOptions {
  Backgrounds: Array<{ Background: string; Leans: string[] }>;
  Stages: Array<{
    Stage: VbCoach["Stage"];
    Age: number;
    /** Background -> attribute -> starting ability. */
    BaseAbilities: Record<string, Record<string, number>>;
  }>;
  Attributes: string[];
  AdjustmentPoints: number;
  CostThresholds: number[];
  Cap: number;
  Floor: number;
  LowerRefund: number;
  PickableTraits: string[];
  AllTraits: string[];
  /**
   * What raising one point costs, by where the value being raised sits
   * against CostThresholds. Each point lowered refunds LowerRefund.
   */
  CostRule?: {
    PerPointBelowFirstThreshold: number;
    PerPointBelowSecondThreshold: number;
    PerPointAbove: number;
    RefundRoundsDown: boolean;
  };
  /** What 0 and 1 mean on each philosophy dial. */
  PhilosophyDials?: Record<string, { Zero: string; One: string }>;
  OffensiveSystems?: Array<VbPhilosophy["OffensiveSystem"]>;
}

/** The answer to a build check: the same check creation runs. */
export interface VbBuildCheck {
  Ok: boolean;
  Errors: string[];
  Abilities: Record<string, number>;
  Spent: number;
  Budget: number;
}

export interface VbInbox {
  TeamID: number | null;
  /** How many items need an answer: the number for a badge. */
  NeedsAction: number;
  /** Items that need action come first. */
  Items: Array<{
    ID: string;
    Type: string;
    NeedsAction: boolean;
    Message: string;
    At: string | null;
    /** Where the item leads: a kind of page and, for some, an id. */
    Link: { Kind: string; ID: number | null };
  }>;
}

export interface VbJobOffer {
  OfferID: number;
  Season: number;
  StartsSeason: number;
  TeamID: number;
  TeamName: string;
  FromTeamID: number;
  FromTeamName: string;
  Salary: number;
  Years: number;
  GuaranteedShare: number;
  Status: "pending" | "accepted" | "declined" | "expired" | "void" | string;
  CreatedAt: string;
  DecidedAt: string | null;
}

// Needs a signed-in user, except getBuildOptions.
export const VolleyballCoachService = {
  getMe: () => vbGet<VbMe>("/manage/me"),
  getBuildOptions: () => vbGet<VbBuildOptions>("/manage/coach/build-options"),
  // Creates nothing. Needs no sign-in.
  checkBuild: (build: VbCoachBuild) =>
    vbRequest<VbBuildCheck>("POST", "/manage/coach/build-check", build),
  // 400 INVALID_BUILD carries details.Errors: string[].
  create: (coach: VbCoachCreate) =>
    vbRequest<VbCoach>("POST", "/manage/coach", coach),
  // A user can have a coach at each level, so every route about "my coach"
  // names the level; with both coaches and no Level the API answers 400
  // LEVEL_REQUIRED. College pages always send college, pro pages pro.
  // Only in the offseason once the coach has coached: 409 RESET_WINDOW, RESET_USED.
  resetBuild: (build: VbCoachBuild, level: VbLeagueKind) =>
    vbRequest<VbCoach>("POST", "/manage/coach/build-reset", {
      ...build,
      Level: level,
    }),
  // What needs the coach's answer, then what happened lately. Built on request, so
  // there is no read state: an action item stays until it stops being true.
  getInbox: (level: VbLeagueKind, sinceDays?: number) =>
    vbGet<VbInbox>(
      `/manage/inbox${query({ Level: level, SinceDays: sinceDays })}`,
    ),
  // Offers made to that level's coach during the offseason coaching carousel.
  getJobOffers: (level: VbLeagueKind) =>
    vbGet<{ Offers: VbJobOffer[] }>(
      `/manage/job-offers${query({ Level: level })}`,
    ),
  // Accepting moves the coach at once. 403 NOT_YOURS, 409 CLOSED.
  answerJobOffer: (offerId: number, answer: "accept" | "decline") =>
    vbRequest<{ OfferID: number; Status: string; TeamID: number | null }>(
      "POST",
      `/manage/job-offers/${offerId}/${answer}`,
    ),
  // A head coach's team gets an AI interim; an assistant leaving leaves no
  // interim (InterimPersonID null).
  leave: (level: VbLeagueKind) =>
    vbRequest<{
      TeamID: number;
      Role: VbStaffRole;
      InterimPersonID: number | null;
    }>(
      "POST",
      "/manage/coach/leave",
      { Level: level },
    ),
};

const claimPath = (kind: VbLeagueKind) =>
  kind === "college" ? "/college/requests" : "/pro/requests";

// Asking for a program or club. The API accepts approve, reject and getAll
// from any signed-in user; only the admin page may call those three.
export const VolleyballClaimService = {
  // Coach only from a user with no coach at this level (409 COACH_EXISTS
  // otherwise); a bad
  // build is refused with 400 INVALID_BUILD and nothing is created. Sending
  // again for the same team while it is pending replaces the application and
  // keeps its place in the queue.
  create: (
    kind: VbLeagueKind,
    username: string,
    teamId: number,
    application: {
      Coach?: VbRequestCoach;
      Answers?: VbRequestAnswer[];
      // Pro only, and headCoach when left out. College takes headCoach
      // alone (400 ROLE otherwise). 409 ROLE_TAKEN, STAFF_FULL.
      Role?: VbStaffRole;
    } = {},
  ) =>
    vbRequest<VbClaimRequest>("POST", `${claimPath(kind)}/create`, {
      Username: username,
      OrgID: teamId,
      IsApproved: false,
      ...application,
    }),
  // Approve, reject and getAll need the admin role on the signed-in account (403).
  getAll: (kind: VbLeagueKind) =>
    vbGet<VbClaimRequest[]>(`${claimPath(kind)}/all`),
  approve: (kind: VbLeagueKind, id: number) =>
    vbRequest<VbClaimRequest & { CoachCreated: boolean; Superseded: number }>(
      "POST",
      `${claimPath(kind)}/approve`,
      { ID: id },
    ),
  reject: (kind: VbLeagueKind, id: number) =>
    vbRequest<VbClaimRequest>("POST", `${claimPath(kind)}/reject`, { ID: id }),
  // The user's own pending request only: 409 NOT_PENDING otherwise.
  withdraw: (kind: VbLeagueKind, id: number) =>
    vbRequest<VbClaimRequest>("POST", `${claimPath(kind)}/withdraw`, {
      ID: id,
    }),
};

export interface VbTeamOverview {
  TeamID: number;
  Name: string;
  Kind: VbLeagueKind;
  LeagueID: number;
  Clock: VbLeagueTime | null;
  AttentionMode: "manual" | "adaptive";
  Staff: Array<{
    PersonID: number;
    Name: string;
    Role: string;
    Interim: boolean;
    Salary: number;
    ContractEnd: number | null;
  }>;
  /** Up to five scheduled matches, not in date order: sort before showing. */
  NextMatches: Array<{
    MatchID: number;
    Week: number;
    Day: number;
    HomeTeamID: number;
    AwayTeamID: number;
  }>;
}

/** The starting six plus libero, by PlayerID. Each player once. */
export interface VbLineup {
  Setter: number;
  Outsides: [number, number];
  Middles: [number, number];
  /** In a 6-2 system this is the second setter. */
  Opposite: number;
  Libero?: number | null;
}

/** In-match policy. A null field uses the default the view provides. */
export interface VbPolicy {
  FatigueSubOut: number | null;
  /** Must be below FatigueSubOut. */
  FatigueSubIn: number | null;
  /** 2..10 points. */
  TimeoutOnOpponentRun: number | null;
  ServeAggression: number | null;
}

export interface VbLineupView {
  TeamID: number;
  /** null: the staff picks the lineup every match. */
  Lineup: VbLineup | null;
  Policy: VbPolicy;
  Defaults: { [Key in keyof VbPolicy]: number };
  /**
   * The lineup that will start the next match, after injuries. It is that
   * match day's own selection: a later injury can still change it.
   */
  Projected?: {
    Match: {
      MatchID: number;
      OpponentID: number;
      Season: number;
      Phase: string;
      Week: number;
      Day: number;
    } | null;
    /** Position 1-6 is the serving order. */
    Rotation: Array<{
      Position: number;
      PlayerID: number;
      Name: string | null;
      Role: string | null;
    }>;
    Setter: number;
    Libero: number | null;
    LiberoName: string | null;
    /** The players the libero comes on for. */
    LiberoReplaces: number[];
    Unavailable: Array<{ PlayerID: number; Name: string | null }>;
    ChangedFromPicks: boolean;
  } | null;
  /**
   * The serve aggression in force. The first one set wins: the opponent's
   * game plan, this policy, the team system, then 0.5.
   */
  ServeAggression?: {
    Effective: number;
    Source: "policy" | "team_system" | "default";
    Precedence: string[];
  } | null;
}

/** A team's resolved system. Enum values come from the presets' Options. */
export interface VbTactics {
  Offense: {
    System: string;
    Tempo: string;
    /** Each 0..1; 0.5 is neutral. */
    Distribution: {
      Outside: number;
      Middle: number;
      Opposite: number;
      BackRow: number;
    };
    Slide: boolean;
    Style: string;
    Switching: boolean;
  };
  Receive: { Passers: number };
  Defense: { System: string };
  Block: {
    Scheme: string;
    Spacing: string;
    Take: string;
    KeyHitter: number | null;
  };
  Serve: { Target: string; Style: string };
}

type VbDeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends object ? VbDeepPartial<T[Key]> : T[Key];
};

/** Only the fields to change. The server refuses unknown keys. */
export type VbTacticsPatch = VbDeepPartial<VbTactics>;

/** "When X, change Y", checked at the start of each set after the first. */
export interface VbTacticsRule {
  When: string;
  Apply: VbTacticsPatch;
}

export interface VbTacticsView {
  TeamID: number;
  Preset: string;
  /** The coach's edits over the preset. */
  Patch: VbTacticsPatch;
  Rules: VbTacticsRule[];
  ServeAggression: number | null;
  Source: "ai" | "human" | "default";
  /** Preset plus patch, resolved. */
  Tactics: VbTactics;
  /** Preset key -> rating points against a typical roster; higher is better. */
  Fit: Record<string, number>;
  /** False when the roster cannot run a 6-2. */
  SecondSetterOk: boolean;
  StyleFit: string | null;
  StyleLean: number | null;
}

export interface VbTacticsSave {
  Preset: string;
  Patch?: VbTacticsPatch;
  Rules?: VbTacticsRule[];
  ServeAggression?: number | null;
}

export interface VbTacticsPresets {
  Presets: Array<{
    Key: string;
    Label: string;
    Summary: string;
    Tactics: VbTactics;
    ServeAggression: number | null;
  }>;
  Options: {
    OffenseSystem: string[];
    Tempo: string[];
    Style: string[];
    Passers: number[];
    DefenseSystem: string[];
    BlockScheme: string[];
    BlockSpacing: string[];
    BlockTake: string[];
    ServeTarget: string[];
    ServeStyle: string[];
    RuleWhen: string[];
    MaxRules: number;
  };
}

/** Overrides for matches against one opponent. A null field is not overridden. */
export interface VbGamePlan {
  OpponentID: number;
  ServeAggression: number | null;
  /** 1..6 */
  ServeTargetZone: number | null;
  TimeoutOnOpponentRun: number | null;
  Tactics: VbTacticsPatch | null;
  Rules: VbTacticsRule[] | null;
}

export interface VbGamePlans {
  TeamID: number;
  Plans: VbGamePlan[];
}

/** How training time is split. The server normalizes Areas to sum to 1. */
export interface VbDevelopmentPlan {
  Areas: Record<string, number>;
  /** Area -> one camelCase rating key to emphasize within it. */
  Focus?: Record<string, string>;
}

export interface VbDevelopmentView {
  TeamID: number;
  WeeklyHours: number;
  IndividualHours: number;
  Template: VbDevelopmentPlan | null;
  Players: Array<{
    PlayerID: number;
    Name: string;
    BestRole: string;
    /** Her own override, if any. */
    Plan: VbDevelopmentPlan | null;
    /** What applies to her. */
    Effective: VbDevelopmentPlan;
    Source: "player" | "template" | "default";
  }>;
  /** Area -> the ratings its Focus may name. Anything else is refused. */
  FocusOptions?: Record<string, string[]>;
}

/** How the head coach spends their own time. */
export interface VbAttentionView {
  TeamID: number;
  /** adaptive: the simulation shifts it through the year. */
  Mode: "manual" | "adaptive";
  Manual: Record<string, number> | null;
  /** What was actually applied in the latest period. */
  Current: Record<string, number> | null;
  CurrentPeriod: string | null;
  /** Whole points to spread over the buckets. */
  Budget: number;
  DirectReports: number;
  MinimumStaffManagement: number;
  Buckets: string[];
}

/**
 * A coach's staff's view of some players: a grade, or a "low–high" range of grades,
 * per rating. Never the true number.
 */
export interface VbEstimates {
  TeamID: number;
  Season: number;
  Athletes: Array<{
    PlayerID: number;
    Name: string;
    Context: "own" | "opponent" | "recruit";
    Grades: Record<string, string>;
    /** The staff's estimate of the family grades and overalls, as ranges. */
    Families?: Record<string, string>;
    Overall?: string | null;
    OverallByPosition?: Record<string, string>;
    Ranges: Record<string, { Low: number; High: number }>;
  }>;
}

const vbPut = <T>(path: string, body: unknown) =>
  vbRequest<T>("PUT", path, body);

// Everything under /manage/teams/:TeamID answers 403 NOT_YOUR_TEAM to anyone
// but that team's head coach. Each PUT returns the updated view, and each one
// replaces what it is sent. On the lineup PUT, Lineup and Policy are separate
// parts: leave one out to keep it, send null for the staff default, and a part
// that is sent replaces that part whole, so always send the full policy.
// Settings apply from the team's next match.
export const VolleyballManageService = {
  getOverview: (teamId: number) =>
    vbGet<VbTeamOverview>(`/manage/teams/${teamId}/overview`),
  getLineup: (teamId: number) =>
    vbGet<VbLineupView>(`/manage/teams/${teamId}/lineup`),
  // 400 INVALID_LINEUP carries details.Errors.
  saveLineup: (
    teamId: number,
    body: { Lineup?: VbLineup | null; Policy?: Partial<VbPolicy> | null },
  ) => vbPut<VbLineupView>(`/manage/teams/${teamId}/lineup`, body),
  getTactics: (teamId: number) =>
    vbGet<VbTacticsView>(`/manage/teams/${teamId}/tactics`),
  // 400 INVALID_TACTICS names the field in its message.
  saveTactics: (teamId: number, body: VbTacticsSave) =>
    vbPut<VbTacticsView>(`/manage/teams/${teamId}/tactics`, body),
  getGamePlans: (teamId: number) =>
    vbGet<VbGamePlans>(`/manage/teams/${teamId}/game-plans`),
  // null deletes the plan.
  saveGamePlan: (
    teamId: number,
    opponentId: number,
    plan: Partial<Omit<VbGamePlan, "OpponentID">> | null,
  ) =>
    vbPut<VbGamePlans>(
      `/manage/teams/${teamId}/game-plans/${opponentId}`,
      plan,
    ),
  getDevelopment: (teamId: number) =>
    vbGet<VbDevelopmentView>(`/manage/teams/${teamId}/development-plans`),
  // All-or-nothing; 400 INVALID_PLAN carries details.Errors. A null plan
  // clears the template or a player's override.
  saveDevelopment: (
    teamId: number,
    body: {
      Template?: VbDevelopmentPlan | null;
      Players?: Array<{ PlayerID: number; Plan: VbDevelopmentPlan | null }>;
    },
  ) =>
    vbPut<VbDevelopmentView>(
      `/manage/teams/${teamId}/development-plans`,
      body,
    ),
  getAttention: (teamId: number) =>
    vbGet<VbAttentionView>(`/manage/teams/${teamId}/attention`),
  // 400 INVALID_ATTENTION carries details.Errors.
  saveAttention: (
    teamId: number,
    body: { Mode: "manual" | "adaptive"; Allocation?: Record<string, number> },
  ) => vbPut<VbAttentionView>(`/manage/teams/${teamId}/attention`, body),
  // The staff's estimates of a whole roster: the coach's own or an opponent's.
  getTeamEstimates: (teamId: number, ofTeamId: number) =>
    vbGet<VbEstimates>(
      `/manage/teams/${teamId}/scouting/athletes?OfTeamID=${ofTeamId}`,
    ),
};

export type VbMarket = "hs" | "portal";

/** A high-school recruit or a portal entrant, as the public sees her. */
export interface VbRecruit {
  PersonID: number;
  Name: string;
  HeightCm: number;
  StandingReachCm: number;
  Position: string;
  /** Public ranking and stars: deliberately imprecise. */
  Rank: number;
  Stars: number;
  Status: "available" | "committed" | "signed" | "walk_on" | "left";
  TeamID: number | null;
  Tags: string[];
  AbilityGrades?: VbAbilityGrades | null;
  /** Portal entrants only. */
  FromTeamID?: number | null;
  Cut?: boolean;
}

export interface VbRecruitList {
  LeagueID: number;
  Season: number;
  Total: number;
  Recruits: VbRecruit[];
}

export type VbRecruitingMode = "auto" | "assist" | "manual";

/** A program's side of one market. All money is dollars. */
export interface VbRecruitingView {
  TeamID: number;
  Market: VbMarket;
  Mode: VbRecruitingMode;
  /** null: no market window is open, and Board is empty. */
  Window: {
    WindowID: number;
    Status: "open" | "signing" | "closed";
    RoundsDone: number;
  } | null;
  Position: {
    Returning: number;
    Committed: number;
    OpenSpots: number;
    BoardSize: number;
    MaxOffers: number;
    /** The most one offer may be. */
    OfferCap: number;
    Budget: number;
    Firm: number;
    Offers: number;
    Available: number;
  };
  Board: Array<{
    PlayerID: number;
    Name: string;
    Position: string;
    Rank: number;
    Stars: number;
    Status: VbRecruit["Status"];
    CommittedTeamID: number | null;
    FromTeamID: number | null;
    /** Her asking price as this program sees it. */
    Ask: number;
    Offer: { OfferID: number; Amount: number; Round: number } | null;
    Response: {
      Response: "commit" | "hold" | "counter" | "decline";
      Reason: string | null;
      Counter: number | null;
      Round: number;
    } | null;
    DeclinedUs: boolean;
  }>;
}

export type VbResignPlan = "auto" | "cut" | "offer";

export interface VbResignView {
  TeamID: number;
  Season: number;
  /** False once this offseason's re-signing step has run. */
  Open: boolean;
  Budget: number;
  Planned: number;
  Players: Array<{
    PlayerID: number;
    Name: string;
    SeasonsUsed: number;
    Ask: number;
    PreviousNIL: number;
    Plan: VbResignPlan;
    Amount: number | null;
  }>;
}

// A college program's recruiting. Pro clubs get 400 NOT_COLLEGE.
export const VolleyballRecruitingService = {
  // Public. Neither list ever carries ratings, asks or offers.
  getRecruits: (
    leagueId: number,
    filters: {
      Season?: number;
      Stars?: number;
      Position?: string;
      Limit?: number;
      Offset?: number;
    },
  ) =>
    vbGet<VbRecruitList>(`/leagues/${leagueId}/recruits${query(filters)}`),
  getPortal: (
    leagueId: number,
    filters: { Season?: number; Limit?: number; Offset?: number },
  ) =>
    vbGet<Omit<VbRecruitList, "Recruits"> & { Entrants: VbRecruit[] }>(
      `/leagues/${leagueId}/portal${query(filters)}`,
    ),
  getView: (teamId: number, market: VbMarket) =>
    vbGet<VbRecruitingView>(
      `/manage/teams/${teamId}/recruiting?Market=${market}`,
    ),
  setMode: (teamId: number, mode: VbRecruitingMode) =>
    vbPut<{ TeamID: number; Mode: VbRecruitingMode }>(
      `/manage/teams/${teamId}/recruiting/mode`,
      { Mode: mode },
    ),
  // Adds her to the board and reveals her asking price.
  contact: (teamId: number, playerId: number, market: VbMarket) =>
    vbRequest<{ PlayerID: number; Ask: number; Added: boolean }>(
      "POST",
      `/manage/teams/${teamId}/recruiting/contacts`,
      { PlayerID: playerId, Market: market },
    ),
  removeContact: (teamId: number, playerId: number, market: VbMarket) =>
    vbRequest<{ PlayerID: number; Removed: boolean }>(
      "DELETE",
      `/manage/teams/${teamId}/recruiting/contacts/${playerId}?Market=${market}`,
    ),
  // Makes or changes a sealed one-year offer, in dollars.
  offer: (teamId: number, playerId: number, amount: number, market: VbMarket) =>
    vbRequest<{ OfferID: number; Replaced: boolean; Amount: number }>(
      "POST",
      `/manage/teams/${teamId}/recruiting/offers`,
      { PlayerID: playerId, Amount: amount, Market: market },
    ),
  withdrawOffer: (teamId: number, offerId: number, market: VbMarket) =>
    vbRequest<{ OfferID: number; Withdrawn: boolean }>(
      "POST",
      `/manage/teams/${teamId}/recruiting/offers/${offerId}/withdraw`,
      { Market: market },
    ),
  // The staff's estimates of named recruits (the first 100 ids are used).
  getEstimates: (teamId: number, personIds: number[]) =>
    vbGet<VbEstimates>(
      `/manage/teams/${teamId}/scouting/athletes?PersonIDs=${personIds.join(",")}`,
    ),
  getResign: (teamId: number) =>
    vbGet<VbResignView>(`/manage/teams/${teamId}/resign`),
  saveResign: (
    teamId: number,
    players: Array<{ PlayerID: number; Plan: VbResignPlan; Amount?: number }>,
  ) =>
    vbPut<VbResignView>(`/manage/teams/${teamId}/resign`, { Players: players }),
};

export interface VbCarousel {
  LeagueID: number;
  Season: number;
  Moves: Array<{
    PersonID: number;
    Name: string;
    Type: string;
    TeamID: number | null;
    Team: string | null;
    Role: string | null;
    Salary: number | null;
    Years: number | null;
    Guaranteed: number | null;
    Through: number | null;
    /** The job the coach left, a word such as "pool", or nothing. */
    From: { TeamID: number; Role: string } | string | null;
    Payout: number | null;
  }>;
  HotSeat: Array<{
    TeamID: number;
    Team: string;
    PersonID: number;
    Name: string;
    Outcome: string;
  }>;
}

/** A hired coach as their own program sees them. Money in dollars. */
export interface VbManagedStaff {
  TeamID: number;
  Season: number;
  Budget: number;
  Payroll: number;
  OpenRoles: string[];
  Staff: Array<{
    EmploymentID: number;
    PersonID: number;
    Name: string;
    Role: string;
    Interim: boolean;
    Salary: number;
    ContractEnd: number | null;
    GuaranteedShare: number | null;
    Grades: Record<string, string>;
    Traits: string[];
    /** A user holds this job: they cannot be let go (409 HUMAN). */
    Human?: boolean;
  }>;
  Candidates: Array<{
    PersonID: number;
    Name: string;
    Age: number;
    LastRole: string | null;
    Source: string;
    MinimumSalary: number;
    Grades: Record<string, string>;
    Traits: string[];
  }>;
}

/** Who reports to whom, and how each coach splits their time. */
export interface VbOrgChart {
  TeamID: number;
  /** True once the head coach has changed the reporting lines. */
  Custom: boolean;
  /** The areas a split divides time between. */
  Domains: string[];
  Staff: Array<{
    EmploymentID: number;
    PersonID: number;
    Name: string;
    Role: string;
    Interim: boolean;
    ManagerEmploymentID: number | null;
    /** null: the default split for the role. */
    CustomSplit: Record<string, number> | null;
    LastPeriod: {
      Season: number;
      Period: string | number;
      Split: Record<string, number>;
      Management: number;
    } | null;
  }>;
}

export const VolleyballStaffService = {
  getOrgChart: (teamId: number) =>
    vbGet<VbOrgChart>(`/manage/teams/${teamId}/org-chart`),
  // Everyone but the head coach must report to someone on the staff, with
  // no cycles and no manager over their limit: 400 with the reason otherwise.
  // null returns to the default structure. The answer is a bare chart, not
  // the org-chart view: read the view again after saving.
  saveOrgChart: (
    teamId: number,
    reportsTo: Array<{
      EmploymentID: number;
      ManagerEmploymentID: number;
    }> | null,
  ) =>
    vbPut<unknown>(`/manage/teams/${teamId}/org-chart`, {
      ReportsTo: reportsTo,
    }),
  // Domain -> share, normalised by the server to sum to 1. null returns the
  // assistant to the default for their role. 400 for the head coach.
  saveTimeSplit: (
    teamId: number,
    employmentId: number,
    split: Record<string, number> | null,
  ) =>
    vbPut<unknown>(
      `/manage/teams/${teamId}/staff/${employmentId}/time-split`,
      { Split: split },
    ),
  getCarousel: (leagueId: number, season?: number) =>
    vbGet<VbCarousel>(
      `/leagues/${leagueId}/carousel${query({ Season: season })}`,
    ),
  // With a role, candidates are ranked by the market rate for that role.
  getManaged: (teamId: number, role?: string) =>
    vbGet<VbManagedStaff>(
      `/manage/teams/${teamId}/staff${query({ Role: role })}`,
    ),
  hire: (
    teamId: number,
    body: { PersonID: number; Role: string; Salary: number; Years: number },
  ) =>
    vbRequest<{ EmploymentID: number; Salary: number }>(
      "POST",
      `/manage/teams/${teamId}/staff/hire`,
      body,
    ),
  // confirm false previews the payout and changes nothing. 409 HUMAN for a
  // job a user holds.
  terminate: (teamId: number, employmentId: number, confirm: boolean) =>
    vbRequest<{ EmploymentID: number; Payout: number; Done: boolean }>(
      "POST",
      `/manage/teams/${teamId}/staff/${employmentId}/terminate`,
      { Confirm: confirm },
    ),
  // A pro club's requests for its staff roles, decided by anyone on its
  // staff. First come per role: approving a later one is 409 EARLIER_PENDING
  // until the earlier is decided. 403 FORBIDDEN on your own request.
  getStaffRequests: (teamId: number) =>
    vbGet<VbStaffRequests>(`/manage/teams/${teamId}/staff-requests`),
  approveStaffRequest: (teamId: number, requestId: number) =>
    vbRequest<VbClaimRequest>(
      "POST",
      `/manage/teams/${teamId}/staff-requests/${requestId}/approve`,
    ),
  rejectStaffRequest: (teamId: number, requestId: number, note?: string) =>
    vbRequest<VbClaimRequest>(
      "POST",
      `/manage/teams/${teamId}/staff-requests/${requestId}/reject`,
      // The route wants a body, even an empty one.
      note ? { Note: note } : {},
    ),
};

export interface VbFinance {
  TeamID: number;
  Name: string;
  Season: number;
  Cash: number;
  /** This season to date. */
  Revenue: {
    InstitutionalBase: number;
    MediaPayout: number;
    GateAndSmallDollar: number;
    MajorGifts: number;
    Total: number;
  };
  /** NIL is one total; per-player amounts are never served. */
  Spending: {
    Payroll: number;
    Facilities: { Training: number; Arena: number; Recruiting: number };
    NIL: number;
    Total: number;
  };
  Supporters: { Fill: number; Conversion: number };
  /** Grades A to F. */
  Facilities: { Training: string; Arena: string; Recruiting: string };
  HoardingPenalty: number;
  NextYear: { ProjectedRevenue: number; MajorGifts: number; Gate: number };
  Explanation: string | null;
}

export interface VbTeamFinance extends VbFinance {
  History: Array<{
    Season: number;
    Step: number;
    Fill: number;
    Conversion: number;
    Explanation: string | null;
  }>;
}

// Public, in dollars. A coach sees the same pages as everyone else.
export const VolleyballFinanceService = {
  // 404 NOT_FOUND when the program has no books yet.
  // With a season: that season's revenue and spending. Cash is always the
  // balance now, whichever season is asked for.
  getTeam: (teamId: number, season?: number) =>
    vbGet<VbTeamFinance>(
      `/teams/${teamId}/finances${query({ Season: season })}`,
    ),
  getLeague: (leagueId: number, season?: number) =>
    vbGet<{ LeagueID: number; Season: number; Programs: VbFinance[] }>(
      `/leagues/${leagueId}/finances${query({ Season: season })}`,
    ),
  // Every season of a team's books in one response, college or pro.
  getHistory: (teamId: number) =>
    vbGet<VbFinanceHistory>(`/teams/${teamId}/finances/history`),
  // Per season, the league's total, mean and median for every category; with
  // conferences, the same for each conference.
  getLeagueHistory: (leagueId: number, byConference = false) =>
    vbGet<VbLeagueFinanceHistory>(
      `/leagues/${leagueId}/finances/history${query({ GroupBy: byConference ? "conference" : undefined })}`,
    ),
  // Each step of a season that booked money, with a running balance.
  getSteps: (teamId: number, season: number) =>
    vbGet<VbFinanceSteps>(
      `/teams/${teamId}/finances/steps${query({ Season: season })}`,
    ),
  // Supporter steps with the gifts and gate each produced; every season
  // when none is named.
  getSupporters: (teamId: number, season?: number) =>
    vbGet<VbSupporterSteps>(
      `/teams/${teamId}/finances/supporters${query({ Season: season })}`,
    ),
  // Pro clubs keep different books; /teams/:id/finances answers 404 PRO_CLUB.
  getProClub: (clubId: number, season?: number) =>
    vbGet<VbProFinance>(
      `/pro/clubs/${clubId}/finances${query({ Season: season })}`,
    ),
  // Largest payroll first.
  getProLeague: (proLeagueId: number, season?: number) =>
    vbGet<{ LeagueID: number; Season: number; Clubs: VbProFinance[] }>(
      `/leagues/${proLeagueId}/pro-finances${query({ Season: season })}`,
    ),
};

/**
 * Money by category. College revenue: InstitutionalBase, MediaPayout,
 * GateAndSmallDollar, MajorGifts. College spending: Payroll,
 * FacilitiesTraining, FacilitiesArena, FacilitiesRecruiting, NIL. Pro revenue:
 * LeagueShare. Pro spending: PlayerSalaries, StaffSalaries. Each also has
 * Other and Total.
 */
export type VbMoneyByCategory = Record<string, number>;

export interface VbFinanceHistory {
  TeamID: number;
  LeagueID: number;
  Kind: VbLeagueKind;
  Seasons: Array<{
    Season: number;
    Revenue: VbMoneyByCategory;
    Spending: VbMoneyByCategory;
    Net: number;
    /** Cash at the end of that season. */
    EndCash: number;
    Teams: number;
    /** Place in the league that season; 1 is the largest. */
    Ranks: Record<string, number>;
    Supporters: { Fill: number; Conversion: number } | null;
    /** Pro clubs: the fixed budget salaries are booked against. */
    PayrollBudget: number | null;
  }>;
}

export interface VbMoneyStat {
  Total: number;
  Mean: number;
  Median: number;
}

export interface VbLeagueFinanceSeason {
  Season: number;
  Teams: number;
  Revenue: Record<string, VbMoneyStat>;
  Spending: Record<string, VbMoneyStat>;
  Net: VbMoneyStat;
  EndCash: VbMoneyStat;
}

export interface VbLeagueFinanceHistory {
  LeagueID: number;
  Kind: VbLeagueKind;
  League: VbLeagueFinanceSeason[];
  /** Only when grouped by conference. */
  Conferences?: Array<{
    ConferenceID: number;
    Name: string;
    Seasons: VbLeagueFinanceSeason[];
  }>;
}

export interface VbFinanceSteps {
  TeamID: number;
  Season: number;
  OpeningCash: number;
  Steps: Array<{
    Tick: number;
    /** "Preseason", "Week 3", "Offseason day 1". */
    Label: string;
    Phase: string;
    Week: number;
    Day: number;
    Revenue: VbMoneyByCategory;
    Spending: VbMoneyByCategory;
    Net: number;
    /** Cash after the step. */
    Balance: number;
  }>;
}

export interface VbSupporterSteps {
  TeamID: number;
  Steps: Array<{
    Season: number;
    Step: number;
    Fill: number;
    Conversion: number;
    Explanation: string | null;
    /** Gifts credited at this step. */
    Gifts: number;
    /** Gate money earned since the previous step. */
    Gate: number;
  }>;
}

export interface VbProFinance {
  ClubID: number;
  Name: string;
  Season: number;
  Cash: number;
  Revenue: { LeagueShare: number; Other: number; Total: number };
  Spending: {
    PlayerSalaries: number;
    StaffSalaries: number;
    Other: number;
    Total: number;
  };
  Net: number;
  /** Committed: active contracts now. Budget: the revenue share meant for pay. */
  Payroll: { Committed: number; Players: number; Budget: number };
  Lines: Array<{ Kind: string; Amount: number }>;
}

export interface VbDraft {
  LeagueID: number;
  Season: number | null;
  Picks: Array<{
    Pick: number;
    Round: number;
    ClubID: number;
    Club: string;
    OriginalClubID: number;
    PlayerID: number | null;
    Name: string | null;
    CollegeTeamID: number | null;
    College: string | null;
  }>;
}

export interface VbTransactions {
  LeagueID: number;
  Season: number;
  Transactions: Array<{
    PlayerID: number;
    Name: string;
    Type:
      | "drafted"
      | "pro_signed"
      | "pro_released"
      | "pro_retired"
      | "overseas"
      | "traded";
    ClubID: number | null;
    Club: string | null;
    Salary: number | null;
    Seasons: number | null;
    Resigned: boolean | null;
    Pick: number | null;
  }>;
}

export interface VbTradeSide {
  ClubID: number;
  Name: string;
  Sends: {
    /** The first player sent, or null when a side sends only picks. */
    PlayerID: number | null;
    PlayerIDs?: number[];
    Picks: Array<{ Season: number; Round: number }>;
  };
}

export interface VbTrades {
  LeagueID: number;
  Season: number;
  Trades: Array<{
    TradeID: number;
    Phase: VbPhase;
    Week: number;
    ClubA: VbTradeSide;
    ClubB: VbTradeSide;
  }>;
}

/**
 * Not live bidding: an ordered shortlist with a top salary per player, which
 * the simulation bids from when free agency runs.
 */
export interface VbFreeAgencyView {
  TeamID: number;
  Season: number;
  /** False once this season's free agency has run. */
  Open: boolean;
  Shortlist: Array<{
    PlayerID: number;
    Name: string;
    Rank: number;
    MaxSalary: number;
  }>;
  /** Contracts ending this season, league-wide, by salary. */
  Expiring: Array<{
    PlayerID: number;
    Name: string;
    ClubID: number;
    Age: number | null;
    Salary: number;
  }>;
}

export interface VbReleasesView {
  TeamID: number;
  Season: number;
  /** The players the coach plans to release. */
  Releases: number[];
  /** Ids only: join with the club's roster for names. */
  UnderContract: Array<{ PlayerID: number; Salary: number; Through: number }>;
}

export interface VbDraftPick {
  PickID: number;
  Season: number;
  Round: number;
  OriginalClubID: number;
  OriginalClubName?: string;
}

/** A pick as a trade offer names it. */
export interface VbOfferPick {
  PickID: number;
  /** The three below are null for a pick that no longer exists. */
  Season: number | null;
  Round: number | null;
  OriginalClubName: string | null;
}

/**
 * Give and Get are from the sender's side: in an offer the coach received, Give is
 * what the other club gives.
 */
export interface VbTradeOffer {
  OfferID: number;
  Direction: "sent" | "received";
  FromClubID: number;
  ToClubID: number;
  /** Each side's first player, or null when that side sends only picks. */
  GivePlayerID: number | null;
  GetPlayerID: number | null;
  /** Every player on each side: up to three. */
  GivePlayers?: Array<{ PlayerID: number; Name: string | null }>;
  GetPlayers?: Array<{ PlayerID: number; Name: string | null }>;
  GivePickIDs: number[];
  GetPickIDs: number[];
  FromClubName?: string;
  ToClubName?: string;
  GivePlayerName?: string | null;
  GetPlayerName?: string | null;
  GivePicks?: VbOfferPick[];
  GetPicks?: VbOfferPick[];
  Status: "pending" | "accepted" | "rejected" | "withdrawn" | "void";
  Note: string | null;
  CreatedAt: string;
}

export interface VbTradeAnswer {
  OfferID: number;
  Status: VbTradeOffer["Status"];
  Reason: string | null;
}

/**
 * A club's own ranking of the coming draft class. At the club's pick the draft
 * takes its highest-ranked player still available; with none left, the staff
 * picks.
 */
export interface VbDraftBoard {
  TeamID: number;
  Season: number;
  Picks: Array<{ PickID: number; Round: number; OriginalClubID: number }>;
  Board: Array<{
    Rank: number;
    PlayerID: number;
    Name: string | null;
    /** False for a player no longer in the class. */
    InClass: boolean;
  }>;
  /** College players in their final season of eligibility. Never ratings. */
  Prospects: Array<{
    PlayerID: number;
    Name: string;
    CollegeTeamID: number;
    College: string;
    Age: number | null;
    HeightCm: number | null;
    StandingReachCm: number | null;
    Position: string | null;
    AbilityGrades?: VbAbilityGrades | null;
    Graduated: boolean;
    LastSeason: {
      Season: number;
      Matches: number;
      Sets: number;
      Kills: number;
      Errors: number;
      Attempts: number;
      Assists: number;
      Aces: number;
      Digs: number;
      Blocks: number;
      Points: number;
    } | null;
  }>;
}

// Pro clubs only: a college program gets 400 NOT_PRO from the manage routes.
// The three public lists take the COLLEGE league's id in the path.
export const VolleyballProService = {
  getDraft: (collegeLeagueId: number, season?: number) =>
    vbGet<VbDraft>(
      `/leagues/${collegeLeagueId}/pro/draft${query({ Season: season })}`,
    ),
  getTransactions: (collegeLeagueId: number, season?: number) =>
    vbGet<VbTransactions>(
      `/leagues/${collegeLeagueId}/pro/transactions${query({ Season: season })}`,
    ),
  getTrades: (collegeLeagueId: number, season?: number) =>
    vbGet<VbTrades>(
      `/leagues/${collegeLeagueId}/pro/trades${query({ Season: season })}`,
    ),
  getFreeAgency: (clubId: number) =>
    vbGet<VbFreeAgencyView>(`/manage/teams/${clubId}/free-agency`),
  // Replaces the list; its order is the coach's priority. Empty lets the club's
  // policy decide. 409 FA_CLOSED once free agency has run.
  saveShortlist: (
    clubId: number,
    shortlist: Array<{ PlayerID: number; MaxSalary: number }>,
  ) =>
    vbPut<VbFreeAgencyView>(`/manage/teams/${clubId}/free-agency`, {
      Shortlist: shortlist,
    }),
  getReleases: (clubId: number) =>
    vbGet<VbReleasesView>(`/manage/teams/${clubId}/releases`),
  saveReleases: (clubId: number, playerIds: number[]) =>
    vbPut<VbReleasesView>(`/manage/teams/${clubId}/releases`, {
      PlayerIDs: playerIds,
    }),
  // The unused picks the club owns, for this draft and the next.
  getPicks: (clubId: number) =>
    vbGet<{ TeamID: number; Picks: VbDraftPick[] }>(
      `/manage/teams/${clubId}/picks`,
    ),
  getDraftBoard: (clubId: number) =>
    vbGet<VbDraftBoard>(`/manage/teams/${clubId}/draft-board`),
  // Ranked best first, up to 120; replaces the board. 400 NOT_IN_CLASS for
  // anyone outside the coming draft class.
  saveDraftBoard: (clubId: number, playerIds: number[]) =>
    vbPut<VbDraftBoard>(`/manage/teams/${clubId}/draft-board`, {
      Players: playerIds,
    }),
  // Public: any club's unused picks in the drafts a trade can still involve.
  getClubPicks: (clubId: number) =>
    vbGet<{ ClubID: number; Picks: VbDraftPick[] }>(
      `/pro/clubs/${clubId}/picks`,
    ),
  // Up to three players and four picks each way, at least one player in all.
  // An AI club answers at once; a human club gets a pending offer. Each side
  // must keep its role minimums and payroll, and uneven player counts must
  // leave both rosters between 12 and 16: 400 ILLEGAL otherwise. 409 LOCKED
  // for a player already traded this season.
  proposeTrade: (
    clubId: number,
    body: {
      PartnerID: number;
      GivePlayerIDs: number[];
      GetPlayerIDs: number[];
      GivePickIDs?: number[];
      GetPickIDs?: number[];
    },
  ) =>
    vbRequest<{
      Accepted: boolean;
      PendingOfferID: number | null;
      Reason: string | null;
    }>("POST", `/manage/teams/${clubId}/trades`, body),
  getTradeOffers: (clubId: number) =>
    vbGet<{ TeamID: number; Offers: VbTradeOffer[] }>(
      `/manage/teams/${clubId}/trade-offers`,
    ),
  answerTradeOffer: (
    clubId: number,
    offerId: number,
    answer: "accept" | "reject" | "withdraw",
  ) =>
    vbRequest<VbTradeAnswer>(
      "POST",
      `/manage/teams/${clubId}/trade-offers/${offerId}/${answer}`,
    ),
};

export interface VbReplayManifest {
  MatchID: number;
  /**
   * not_retained: the season is over and this match's rallies were dropped.
   * airing: the match is on air and only its aired rallies are listed.
   */
  Status: "pending" | "ready" | "failed" | "not_retained" | "airing";
  Sets: Array<
    VbSetScore & {
      Rallies: Array<{
        Rally: number;
        /** Null while the rally is still on air. */
        WinnerTeamID: number | null;
        DurationMs: number;
        /** Always check this: a dropped rally still answers 200. */
        Retained: boolean;
        RetentionClass: string;
      }>;
    }
  >;
}

// The replay itself is camelCase. Units are metres. The origin is the centre
// of the court at the net: y runs along the length (end lines at ±9), x runs
// across (sidelines at ±4.5), z is height. The home team plays at y < 0 until
// the teams change ends.
export interface VbReplayKeyframe {
  tMs: number;
  x: number;
  y: number;
  state?: "ready" | "shift" | "sprint" | "approach" | "jump" | "dive" | "recover";
  /** Jump height in metres, on a jump keyframe. */
  h?: number;
}

export interface VbBallSegment {
  fromMs: number;
  toMs: number;
  from: [x: number, y: number, z: number];
  to: [x: number, y: number, z: number];
  arc: string;
  /** Launch speed upward, m/s. */
  vz0: number;
  gravity: number;
}

export interface VbRallyReplay {
  durationMs: number;
  /** b_bottom: mirror the court to keep each team on the same screen side. */
  courtOrientation: "a_bottom" | "b_bottom";
  participants: Array<{
    playerId: number;
    teamId: number;
    jersey: string | null;
    /** Present only when true. */
    libero?: boolean;
  }>;
  playerTracks: Array<{ playerId: number; keyframes: VbReplayKeyframe[] }>;
  ballSegments: VbBallSegment[];
}

export type VbRallyReplayResponse =
  | { MatchID: number; Set: number; Rally: number; Retained: false; Reason: string }
  | { MatchID: number; Set: number; Rally: number; Retained: true; Replay: VbRallyReplay };

/** A raw match event: camelCase, with timeMs counted from the rally's start. */
export interface VbMatchEvent {
  eventId: string;
  setNumber: number;
  rallyNumber: number;
  timeMs: number;
  order: number;
  payload: {
    type: string;
    teamId?: number;
    playerId?: number;
    playerIds?: number[];
    serveType?: string;
    shot?: string;
    tempo?: string;
    outcome?: string;
    kind?: string;
    reason?: string;
    winnerTeamId?: number;
  };
}

// Replays are kept for every rally during a season; afterwards only
// highlights, the last college matches and the pro final remain. A kept
// rally never changes, so the API lets browsers cache it for good.
export const VolleyballReplayService = {
  // Exactly what the league's own clip of a rally is drawn from, for the
  // vendored drawing code: camelCase, passed on unchanged. null when the
  // replay was not kept. The route is public and cached, so no token is sent.
  getView: async (
    matchId: number,
    set: number,
    rally: number,
  ): Promise<RallyView | null> => {
    const response = await fetch(
      `${base}/matches/${matchId}/replay/${set}/${rally}/view`,
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`The replay could not be loaded (${response.status}).`);
    }
    return (await response.json()) as RallyView;
  },
  // A rally of a match on air, with the timing the broadcast uses. null when
  // it has not started airing: the API answers 403 NOT_AIRED for those, and
  // for anything else it will not name, so nothing gives a match's length away.
  getBroadcastView: async (
    matchId: number,
    set: number,
    rally: number,
  ): Promise<RallyView | null> => {
    const response = await fetch(
      `${base}/matches/${matchId}/replay/${set}/${rally}/view?Broadcast=true`,
    );
    if (response.status === 403 || response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`The rally could not be loaded (${response.status}).`);
    }
    return (await response.json()) as RallyView;
  },
  getManifest: (matchId: number) =>
    vbGet<VbReplayManifest>(`/matches/${matchId}/replay-manifest`),
  getRally: (matchId: number, set: number, rally: number) =>
    vbGet<VbRallyReplayResponse>(`/matches/${matchId}/replay/${set}/${rally}`),
  getRallyEvents: (matchId: number, set: number, rally: number) =>
    vbGet<{ MatchID: number; Events: VbMatchEvent[] }>(
      `/matches/${matchId}/events?Set=${set}&Rally=${rally}`,
    ),
};

export const VolleyballTacticsService = {
  // Public: the preset systems and every option's allowed values.
  getPresets: () => vbGet<VbTacticsPresets>("/tactics/presets"),
};
