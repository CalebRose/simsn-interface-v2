export class Time {
  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
  }
}

export class Timestamp {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  Season: number;
  SeasonID: number;
  Week: number;
  WeekID: number | null;
  GamesARan: boolean;
  GamesBRan: boolean;
  GamesCRan: boolean;
  GamesDRan: boolean;
  IsOffSeason: boolean;
  IsRecruitingLocked: boolean;
  IsFreeAgencyLocked: boolean;
  IsDraftTime: boolean;
  RunGames: boolean;
  RunCron: boolean;
  RecruitingSynced: boolean;
  GMActionsCompleted: boolean;
  FreeAgencyRound: number;

  constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.ID = source["ID"];
      this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
      this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
      this.Season = source["Season"];
      this.SeasonID = source["SeasonID"];
      this.Week = source["Week"];
      this.WeekID = source["WeekID"];
      this.GamesARan = source["GamesARan"];
      this.GamesBRan = source["GamesBRan"];
      this.GamesCRan = source["GameCRan"];
      this.GamesDRan = source["GamesDRan"];
      this.IsOffSeason = source["IsOffSeason"];
      this.IsRecruitingLocked = source["IsRecruitingLocked"];
      this.IsFreeAgencyLocked = source["IsFreeAgencyLocked"];
      this.IsDraftTime = source["IsDraftTime"];
      this.RunGames = source["RunGames"];
      this.RunCron = source["RunCron"];
      this.RecruitingSynced = source["RecruitingSynced"];
      this.GMActionsCompleted = source["GMActionsCompleted"];
      this.FreeAgencyRound = source["FreeAgencyRound"];
    }  

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (Array.isArray(a)) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }    

}

export interface BaseballTeam {
    team_id: number;
    team_city: string | null;
    team_nickname: string;
    team_abbrev: string;
    team_full_name: string;
    team_level: number;
    org_id?: number;
    color_one?: string | null;
    color_two?: string | null;
    color_three?: string | null;
    conference?: string | null;
    division?: string | null;
}

export interface BaseballOrganization {
    id: number;
    org_abbrev: string;
    cash: number;
    league: "mlb" | "college";
    teams: Record<string, BaseballTeam>;
    // MLB role fields
    owner_name?: string;
    gm_name?: string;
    manager_name?: string;
    scout_name?: string;
    // College coach field
    coach?: string;
}

export interface MLBTeamRequest {
    ID?: number;
    Username: string;
    OrgID: number;
    Role?: string;
    IsOwner?: boolean;
    IsGM?: boolean;
    IsManager?: boolean;
    IsScout?: boolean;
    IsApproved: boolean;
}

export interface CollegeBaseballTeamRequest {
    ID?: number;
    Username: string;
    OrgID: number;
    IsApproved: boolean;
}

export interface BaseballRosters{
    org_abbrev: string;
    org_id:     number;
    players:    Player[];
}

// Fog-of-war: display values can be numeric (20-80), letter grade (string), or hidden (null)
export type DisplayValue = number | string | null;

export interface VisibilityContext {
    context: "college_recruiting" | "college_roster" | "pro_draft" | "pro_roster";
    display_format: "hidden" | "letter_grade" | "20-80";
    attributes_precise: boolean;
    potentials_precise: boolean;
}

// Scouting-scale ratings — values depend on visibility context:
//   20-80 numeric when precise/fuzzed, letter grade strings when college/draft view, null when hidden
export interface PlayerRatings {
    // Batting
    power_display:            DisplayValue;
    contact_display:          DisplayValue;
    eye_display:              DisplayValue;
    discipline_display:       DisplayValue;
    // Base running
    speed_display:            DisplayValue;
    basereaction_display:     DisplayValue;
    baserunning_display:      DisplayValue;
    // Defense - Throwing
    throwacc_display:         DisplayValue;
    throwpower_display:       DisplayValue;
    // Defense - Fielding
    fieldcatch_display:       DisplayValue;
    fieldreact_display:       DisplayValue;
    fieldspot_display:        DisplayValue;
    // Defense - Catcher
    catchframe_display:       DisplayValue;
    catchsequence_display:    DisplayValue;
    // Pitching
    pendurance_display:       DisplayValue;
    pgencontrol_display:      DisplayValue;
    psequencing_display:      DisplayValue;
    pthrowpower_display:      DisplayValue;
    pickoff_display:          DisplayValue;
    // Per-pitch quality (pitchers only)
    pitch1_consist_display:   DisplayValue;
    pitch1_pacc_display:      DisplayValue;
    pitch1_pbrk_display:      DisplayValue;
    pitch1_pcntrl_display:    DisplayValue;
    pitch2_consist_display:   DisplayValue;
    pitch2_pacc_display:      DisplayValue;
    pitch2_pbrk_display:      DisplayValue;
    pitch2_pcntrl_display:    DisplayValue;
    pitch3_consist_display:   DisplayValue;
    pitch3_pacc_display:      DisplayValue;
    pitch3_pbrk_display:      DisplayValue;
    pitch3_pcntrl_display:    DisplayValue;
    pitch4_consist_display:   DisplayValue;
    pitch4_pacc_display:      DisplayValue;
    pitch4_pbrk_display:      DisplayValue;
    pitch4_pcntrl_display:    DisplayValue;
    pitch5_consist_display:   DisplayValue;
    pitch5_pacc_display:      DisplayValue;
    pitch5_pbrk_display:      DisplayValue;
    pitch5_pcntrl_display:    DisplayValue;
    // Position ratings (computed, weighted averages — may be numeric or letter grade)
    c_rating:                 DisplayValue;
    fb_rating:                DisplayValue;
    sb_rating:                DisplayValue;
    tb_rating:                DisplayValue;
    ss_rating:                DisplayValue;
    lf_rating:                DisplayValue;
    cf_rating:                DisplayValue;
    rf_rating:                DisplayValue;
    dh_rating:                DisplayValue;
    sp_rating:                DisplayValue;
    rp_rating:                DisplayValue;
    // Per-pitch overalls
    pitch1_ovr:               DisplayValue;
    pitch2_ovr:               DisplayValue;
    pitch3_ovr:               DisplayValue;
    pitch4_ovr:               DisplayValue;
    pitch5_ovr:               DisplayValue;
}

// Potential letter grades (e.g. "A+", "B", "C-")
export interface PlayerPotentials {
    power_pot:                string | null;
    contact_pot:              string | null;
    eye_pot:                  string | null;
    discipline_pot:           string | null;
    speed_pot:                string | null;
    basereaction_pot:         string | null;
    baserunning_pot:          string | null;
    throwacc_pot:             string | null;
    throwpower_pot:           string | null;
    fieldcatch_pot:           string | null;
    fieldreact_pot:           string | null;
    fieldspot_pot:            string | null;
    catchframe_pot:           string | null;
    catchsequence_pot:        string | null;
    pendurance_pot:           string | null;
    pgencontrol_pot:          string | null;
    psequencing_pot:          string | null;
    pthrowpower_pot:          string | null;
    pickoff_pot:              string | null;
    pitch1_consist_pot:       string | null;
    pitch1_pacc_pot:          string | null;
    pitch1_pbrk_pot:          string | null;
    pitch1_pcntrl_pot:        string | null;
    pitch2_consist_pot:       string | null;
    pitch2_pacc_pot:          string | null;
    pitch2_pbrk_pot:          string | null;
    pitch2_pcntrl_pot:        string | null;
    pitch3_consist_pot:       string | null;
    pitch3_pacc_pot:          string | null;
    pitch3_pbrk_pot:          string | null;
    pitch3_pcntrl_pot:        string | null;
    pitch4_consist_pot:       string | null;
    pitch4_pacc_pot:          string | null;
    pitch4_pbrk_pot:          string | null;
    pitch4_pcntrl_pot:        string | null;
    pitch5_consist_pot:       string | null;
    pitch5_pacc_pot:          string | null;
    pitch5_pbrk_pot:          string | null;
    pitch5_pcntrl_pot:        string | null;
}

// Contract detail for a single year
export interface ContractYearDetail {
    id:               number;
    year_index:       number;
    base_salary:      number | null;
    salary_share:     number | null;
    salary_for_org:   number | null;
}

// Player contract sub-object
export interface PlayerContract {
    id:                  number;
    years:               number;
    current_year:        number;
    league_year_signed:  number;
    is_active:           boolean;
    is_buyout:           boolean;
    is_extension:        boolean;
    is_finished:         boolean;
    on_ir:               boolean;
    bonus:               number;
    current_year_detail: ContractYearDetail;
}

export interface Player {
    id:                  number;
    firstname:           string;
    lastname:            string;
    ptype:               Ptype;
    listed_position:     string | null;
    age:                 number;
    displayovr:          string | null;
    current_level:       number;
    league_level:        string;
    team_abbrev:         string;
    contract:            PlayerContract | null;
    bat_hand:            Hand | null;
    pitch_hand:          Hand | null;
    height:              number;
    weight:              number;
    durability:          string;
    injury_risk:         string;
    pitch1_name:         string | null;
    pitch2_name:         string | null;
    pitch3_name:         string | null;
    pitch4_name:         string | null;
    pitch5_name:         string | null;
    ratings:             PlayerRatings;
    potentials:          PlayerPotentials;
    defensive_xp_mod?:   Record<string, number>; // position code → XP modifier (-0.20 to +0.05)
    visibility_context?: VisibilityContext;
    stamina?:            number;          // 0-100, 100 = fully rested
    has_fatigue_data?:   boolean;         // true = real fatigue record, false = no data yet
}

export interface ListedPositionResponse {
    player_id: number;
    team_id: number;
    position_code: string;
    display: string;
    source: "override" | "gameplan" | "auto";
}

export enum Hand {
    L = "L",
    R = "R",
    S = "S",
}

export enum Ptype {
    Pitcher = "Pitcher",
    Position = "Position",
}

// --- Financials ---

export interface FinancialWeek {
    week_index:          number;
    salary_out:          number;
    performance_in:      number;
    other_in:            number;
    other_out:           number;
    net:                 number;
    cumulative_balance:  number;
    by_type:             Record<string, number>;
}

export interface FinancialSummary {
    starting_balance:               number;
    season_revenue:                 number;
    season_expenses:                number;
    year_start_events:              Record<string, number>;
    interest_events:                Record<string, number>;
    ending_balance_before_interest: number;
    ending_balance:                 number;
    weeks:                          FinancialWeek[];
}

export interface ObligationItem {
    type:           "salary" | "bonus";
    category:       string;
    player:         { id: number; firstname: string; lastname: string };
    contract_id:    number;
    year_index?:    number;
    salary?:        number;
    salary_share?:  number;
    amount:         number;
}

export interface ObligationTotals {
    active_salary:   number;
    inactive_salary: number;
    buyout:          number;
    signing_bonus:   number;
    overall:         number;
}

export interface FinancialObligations {
    league_year: number;
    totals:      ObligationTotals;
    items:       ObligationItem[];
}

export interface BaseballFinancials {
    summary:            FinancialSummary;
    obligations:        FinancialObligations;
    future_obligations: Record<string, number>;
}

// Payroll Projection (multi-year salary view)
export interface SalaryScheduleEntry {
    league_year:    number;
    contract_year:  number;
    gross_salary:   number;
    team_share:     number;
    team_owes:      number;
    is_current:     boolean;
}

export interface PayrollProjectionPlayer {
    player_id:        number;
    player_name:      string;
    position:         string;
    age:              number;
    contract_id:      number;
    is_extension:     boolean;
    contract_phase:   string;
    mlb_service_years: number;
    current_level:    number;
    bonus:            number;
    salary_schedule:  SalaryScheduleEntry[];
}

export interface DeadMoneyEntry {
    player_id:    number;
    player_name:  string;
    contract_id:  number;
    remaining:    { league_year: number; team_owes: number }[];
}

export interface YearTotal {
    total_salary:  number;
    player_count:  number;
}

export interface PayrollProjectionResponse {
    org_id:              number;
    current_league_year: number;
    players:             PayrollProjectionPlayer[];
    year_totals:         Record<string, YearTotal>;
    dead_money:          DeadMoneyEntry[];
}

// Contract Overview (service time + phase data)
export interface ContractOverviewPlayer {
    player_id:        number;
    player_name:      string;
    age:              number;
    position:         string;
    contract_id:      number;
    current_level:    number;
    years:            number;
    current_year:     number;
    years_remaining:  number;
    salary:           number;
    on_ir:            boolean;
    mlb_service_years: number;
    contract_phase:   string;
    years_to_arb:     number | null;
    years_to_fa:      number | null;
    is_expiring:      boolean;
}

// Bootstrap Landing Page Response
export interface BaseballBootstrapLanding {
    Organization: BaseballOrganization;
    RosterMap: Record<string, Player[]>;
    Standings: BaseballStanding[];
    AllGames: BaseballGame[];
    Notifications: BaseballNotification[];
    News: BaseballNewsLog[];
    TopBatter: BaseballBattingStats | null;
    TopPitcher: BaseballPitchingStats | null;
    TopFielder: BaseballFieldingStats | null;
    InjuryReport: BaseballInjury[];
    AllTeams: BaseballTeam[];
    SeasonContext: BaseballSeasonContext;
    Financials: BaseballFinancials | null;
    FaceData?: { [key: number]: import("../footballModels").FaceDataResponse };
    SpecialEvents?: import("./baseballEventModels").BootstrapSpecialEvent[];
}

// All-orgs bootstrap (single request for every org)
export interface BaseballBootstrapAllOrgEntry {
    Organization: BaseballOrganization;
    RosterMap: Record<string, Player[]>;
    Notifications: BaseballNotification[];
    News: BaseballNewsLog[];
    TopBatter: BaseballBattingStats | null;
    TopPitcher: BaseballPitchingStats | null;
    TopFielder: BaseballFieldingStats | null;
    InjuryReport: BaseballInjury[];
    Financials: BaseballFinancials | null;
}

export interface BaseballBootstrapAll {
    SeasonContext: BaseballSeasonContext;
    Standings: BaseballStanding[];
    AllTeams: BaseballTeam[];
    AllGames: BaseballGame[];
    FaceData?: { [key: number]: import("../footballModels").FaceDataResponse };
    Orgs: Record<string, BaseballBootstrapAllOrgEntry>;
    SpecialEvents?: import("./baseballEventModels").BootstrapSpecialEvent[];
}

export interface BaseballStanding {
    team_id: number;
    team_abbrev: string;
    org_id: number;
    team_level: number;
    wins: number;
    losses: number;
    win_pct: number;
    games_back: number;
    conference?: string | null;
    division?: string | null;
}

export type BaseballGameType = "regular" | "playoff" | "allstar" | "wbc";

export interface BaseballGame {
    id: number;
    week: number;
    game_day: string;
    home_team_id: number;
    away_team_id: number;
    home_score: number;
    away_score: number;
    is_complete: number;
    game_outcome: string;
    game_type?: BaseballGameType;
}

export interface BaseballNotification {
    id: number;
    team_id: number;
    org_id: number;
    league: string;
    notification_type: string;
    message: string;
    subject: string;
    is_read: boolean;
    created_at: string;
}

export interface BaseballNewsLog {
    id: number;
    team_id: number;
    org_id: number;
    league: string;
    message: string;
    message_type: string;
    week: number;
    season_id: number;
    created_at: string;
}

export interface BaseballBattingStats {
    player_id: number;
    firstname: string;
    lastname: string;
    team: string;
    team_abbrev: string;
    games_played: number;
    at_bats: number;
    hits: number;
    doubles_hit: number;
    triples: number;
    home_runs: number;
    runs_batted_in: number;
    runs: number;
    batting_average: number;
    on_base_percentage: number;
    slugging_percentage: number;
    stolen_bases: number;
}

export interface BaseballPitchingStats {
    player_id: number;
    firstname: string;
    lastname: string;
    team: string;
    team_abbrev: string;
    games_played: number;
    wins: number;
    losses: number;
    era: number;
    innings_pitched_outs: number;
    strikeouts: number;
    walks: number;
    hits_allowed: number;
    earned_runs: number;
    saves: number;
    whip: number;
}

export interface BaseballFieldingStats {
    player_id: number;
    firstname: string;
    lastname: string;
    team: string;
    team_abbrev: string;
    position: string;
    games_played: number;
    putouts: number;
    assists: number;
    errors: number;
    fielding_percentage: number;
}

export interface BaseballInjury {
    player_id: number;
    firstname: string;
    lastname: string;
    team: string;
    position: string;
    injury_type: string;
    weeks_remaining: number;
    level: string;
}

export interface BaseballSeasonContext {
    current_league_year_id: number;
    current_season_id: number;
    current_week_index: number;
    league_year: number;
}

// --- Schedule API ---

export interface ScheduleParams {
    season_year: number;
    league_level?: number;
    team_id?: number;
    week_start?: number;
    week_end?: number;
    page?: number;
    page_size?: number;
}

export interface ScheduleGame {
    id: number;
    season_week: number;
    season_subweek: string;
    league_level: number;
    level_name: string;
    home_team_id: number;
    home_team_name: string;
    home_team_abbrev: string;
    away_team_id: number;
    away_team_name: string;
    away_team_abbrev: string;
    home_score: number | null;
    away_score: number | null;
    game_outcome: string | null;
    winning_team_id: number | null;
    completed_at: string | null;
    game_type?: BaseballGameType;
}

export interface WeekSummary {
    games: number;
    series_count: number;
}

export interface ScheduleResponse {
    games: ScheduleGame[];
    total: number;
    page: number;
    page_size: number;
    filters: ScheduleParams;
    weeks_summary: Record<string, WeekSummary>;
}

export interface ScheduleSeries {
    season_week: number;
    home_team_id: number;
    home_team_abbrev: string;
    home_team_name: string;
    away_team_id: number;
    away_team_abbrev: string;
    away_team_name: string;
    games: ScheduleGame[];
}