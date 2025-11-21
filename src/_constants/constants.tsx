export const SimCFB = "SimCFB";
export const SimNFL = "SimNFL";
export const SimCBB = "SimCBB";
export const SimNBA = "SimNBA";
export const SimCHL = "SimCHL";
export const SimPHL = "SimPHL";
export const SimFBA = "SimFBA";
export const SimBBA = "SimBBA";
export const SimHCK = "SimHCK";
export const AdminRole = "Admin";
export type League =
  | typeof SimCFB
  | typeof SimNFL
  | typeof SimCBB
  | typeof SimNBA
  | typeof SimCHL
  | typeof SimPHL;

export const CollegeRequests = "College Requests";
export const ProRequests = "Pro Requests";
export const CollegeTeams = "College Teams";
export const ProTeams = "Pro Teams";
export const Requests = "Requests";
export const Teams = "Teams";
export const Trades = "Trades";
export const Owner = "Owner";
export const Coach = "Coach";
export const GM = "GM";
export const Scout = "Scout";
export const Assistant = "Assistant";
export const Marketing = "Marketing";
export const Cut = "Cut";
export const Promise = "Promise";
export const Redshirt = "Redshirt";
export const InfoType = "Info";
export const RecruitInfoType = "Recruit Info";
export const PortalInfoType = "Portal Info";
export const AddRecruitType = "Add Recruit";
export const AddFreeAgentType = "Add Free Agent";
export const AddPortalPlayerType = "Add Portal Player";
export const RemoveRecruitType = "Remove Recruit";
export const RemovePortalPlayerType = "Remove Portal Player";
export const ToggleScholarshipType = "Toggle Scholarship";
export const ScoutAttributeType = "Scout Attribute";
export const ScoutPortalAttributeType = "Scout Portal Attribute";
export const ScoutDraftAttributeType = "Scout Draft Attribute";
export const ExtensionOfferType = "Extension Offer";
export const CancelOffer = "Cancel Offer";
export const PracticeSquad = "Practice Squad";
export const Affiliate = "Affiliate";
export const Gameplan = "Gameplan";
export const DepthChart = "Depth Chart";
export const OffensiveDistributions = "Offensive Distributions";
export const OffensiveFormations = "Offensive Formations";
export const Offensive = "Offensive";
export const Defensive = "Defensive";
export const Defense = "Defense";
export const SpecialTeams = "Special Teams";
export const Team = "Team";
export const Player = "Player";
export const Formations = "Formations";
export const Focus = "Focus";
export const Help1 = "Help1";
export const Help2 = "Help2";
export const Help3 = "Help3";
export const Help4 = "Help4";
export const TradeBlock = "TradeBlock";
export type ModalAction =
  | typeof Cut
  | typeof Promise
  | typeof Redshirt
  | typeof InfoType
  | typeof RecruitInfoType
  | typeof PortalInfoType
  | typeof AddRecruitType
  | typeof AddFreeAgentType
  | typeof AddPortalPlayerType
  | typeof RemoveRecruitType
  | typeof RemovePortalPlayerType
  | typeof ToggleScholarshipType
  | typeof ScoutAttributeType
  | typeof ScoutPortalAttributeType
  | typeof ScoutDraftAttributeType
  | typeof CancelOffer
  | typeof ExtensionOfferType
  | typeof PracticeSquad
  | typeof Affiliate
  | typeof Help1
  | typeof Help2
  | typeof Help3
  | typeof Help4
  | typeof TradeBlock;
export const FreeAgentOffer = "FreeAgentOffer";
export const WaiverOffer = "WaiverOffer";
export const Extension = "Extension";
export type OfferAction =
  | typeof FreeAgentOffer
  | typeof WaiverOffer
  | typeof Extension;

export const LineupF1 = "Forwards 1";
export const LineupF2 = "Forwards 2";
export const LineupF3 = "Forwards 3";
export const LineupF4 = "Forwards 4";
export const LineupD1 = "Defenders 1";
export const LineupD2 = "Defenders 2";
export const LineupD3 = "Defenders 3";
export const LineupG1 = "Goalies 1";
export const LineupG2 = "Goalies 2";
export const LineupSO = "Shootout";
export type Lineup =
  | typeof LineupF1
  | typeof LineupF2
  | typeof LineupF3
  | typeof LineupF4
  | typeof LineupD1
  | typeof LineupD2
  | typeof LineupD3
  | typeof LineupG1
  | typeof LineupG2
  | typeof LineupSO;
export const DefendingGoalZone = "Defending Goal Zone";
export const DefendingZone = "Defending Zone";
export const NeutralZone = "Neutral Zone";
export const AttackingZone = "Attacking Zone";
export const AttackingGoalZone = "Attacking Goal Zone";
export const ManagementCard = "Management Card";
export type Zone =
  | typeof DefendingGoalZone
  | typeof DefendingZone
  | typeof NeutralZone
  | typeof AttackingZone
  | typeof AttackingGoalZone;
export const RecruitingOverview = "Overview";
export const RecruitingTeamBoard = "Team Board";
export const RecruitingRankings = "RecruitingRankings";
export const RecruitingClassView = "ClassView";
export type RecruitingCategory =
  | typeof RecruitingOverview
  | typeof RecruitingTeamBoard
  | typeof RecruitingRankings
  | typeof RecruitingClassView;
export const WEEK_VIEW = "WEEK";
export const SEASON_VIEW = "SEASON";
export type StatsView = typeof WEEK_VIEW | typeof SEASON_VIEW;
export const PLAYER_VIEW = "PLAYER";
export const TEAM_VIEW = "TEAM";
export type StatsType = typeof PLAYER_VIEW | typeof TEAM_VIEW;
export const PASSING = "PASSING";
export const RUSHING = "RUSHING";
export const RECEIVING = "RECEIVING";
export const DEFENSE = "DEFENSE";
export const SPECIAL_TEAMS = "SPECIAL TEAMS";
export const OLINE = "OLINE";
export const RETURN = "RETURN";
export const OVERALL = "OVERALL";
export const OFFENSE = "OFFENSE";
export type FootballStatsType =
  | typeof PASSING
  | typeof RUSHING
  | typeof RECEIVING
  | typeof DEFENSE
  | typeof OLINE
  | typeof RETURN
  | typeof SPECIAL_TEAMS
  | typeof OVERALL
  | typeof OFFENSE;


export interface PositionStatsConfig {
  statsType: FootballStatsType;
  labels: string[]; 
}

export const POSITION_STATS_CONFIG: Record<string, PositionStatsConfig> = {
  QB: {
    statsType: PASSING,
    labels: ["Cmp/Att", "Cmp%", "Yds", "TD", "INT", "QBR"],
  },
  RB: {
    statsType: RUSHING,
    labels: ["Att", "Yds", "YPC", "TD", "Fum"],
  },
  FB: {
    statsType: RUSHING,
    labels: ["Att", "Yds", "YPC", "TD", "Fum"],
  },
  WR: {
    statsType: RECEIVING,
    labels: ["Cth", "Trgt", "Yds", "TD", "Fum"],
  },
  TE: {
    statsType: RECEIVING,
    labels: ["Cth", "Trgt", "Yds", "TD", "Fum"],
  },
  DE: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "TFL", "Scks", "FF/FR"],
  },
  DT: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "TFL", "Scks", "FF/FR"],
  },
  OLB: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "TFL", "Scks", "FF/FR"],
  },
  ILB: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "TFL", "Scks", "FF/FR"],
  },
  CB: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "FF/FR", "PD", "INT"],
  },
  FS: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "FF/FR", "PD", "INT"],
  },
  SS: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "FF/FR", "PD", "INT"],
  },
  OT: {
    statsType: OLINE,
    labels: ["Snaps", "ScksAll", "Pnck"],
  },
  OG: {
    statsType: OLINE,
    labels: ["Snaps", "ScksAll", "Pnck"],
  },
  C: {
    statsType: OLINE,
    labels: ["Snaps", "ScksAll", "Pnck"],
  },
  K: {
    statsType: SPECIAL_TEAMS,
    labels: ["FGM", "FGA", "LFG", "XPM", "XPA"],
  },
  P: {
    statsType: SPECIAL_TEAMS,
    labels: ["P", "GPD", "NPD", "PT", "Ins20"],
  },
  KR: {
    statsType: RETURN,
    labels: ["KRet", "KRetY", "KRetTDs", "PRet", "PRetY"],
  },
  PR: {
    statsType: RETURN,
    labels: ["PRet", "PRetY", "PRetTDs", "KRet", "KRetY"],
  },
};

export const ATH_ARCHETYPE_STATS_CONFIG: Record<string, PositionStatsConfig> = {
  "Field General": {
    statsType: PASSING,
    labels: ["CMP/ATT", "Comp%", "Yds", "TD", "INT", "QBR"],
  },
  "Triple-Threat": {
    statsType: RUSHING,
    labels: ["Att", "Yds", "YPC", "TD", "Fum"],
  },
  Wingback: {
    statsType: RECEIVING,
    labels: ["Cth", "Trgt", "Yds", "TD", "Fum"],
  },
  Slotback: {
    statsType: RECEIVING,
    labels: ["Cth", "Trgt", "Yds", "TD", "Fum"],
  },
  Lineman: {
    statsType: OLINE,
    labels: ["Snaps", "ScksAll", "Pnck"],
  },
  Strongside: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "TFL", "Scks", "FF/FR"],
  },
  Weakside: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "FF/FR", "PD", "INT"],
  },
  Bandit: {
    statsType: DEFENSE,
    labels: ["SoloTck", "TotTck", "FF/FR", "PD", "INT"],
  },
  "Return Specialist": {
    statsType: RETURN,
    labels: ["KRet", "KRetY", "KRetTDs", "PRet", "PRetY"],
  },
  "Soccer Player": {
    statsType: SPECIAL_TEAMS,
    labels: ["FGM", "FGA", "LFG", "XPM", "XPA"],
  },
};
export const PRESEASON = "PRESEASON";
export const REGULAR_SEASON = "REGULARSEASON";
export const POST_SEASON = "POSTSEASON";
export type GameType =
  | typeof PRESEASON
  | typeof REGULAR_SEASON
  | typeof POST_SEASON;
export const ADay = "A";
export const BDay = "B";
export const CDay = "C";
export const DDay = "D";
export const ActualDDay = "TO THE BEACHES OF NORMANDY WE GO";
export type GameDay =
  | typeof ADay
  | typeof BDay
  | typeof CDay
  | typeof DDay
  | typeof ActualDDay;
export const PBP = "Play By Play";
export const BoxScore = "Box Score";
export const Attributes = "Attributes";
export const Values = "Values";
export const Preferences = "Preferences";
export const Potentials = "Potentials";
export const Promises = "Promises";
export const Contracts = "Contracts";
export const Overview = "Overview";
export const Details = "Details";
export const Profile = "Profile";
export const Roster = "Roster";
export const Schedule = "Schedule";
export const Standings = "Standings";
export const Divisions = "Divisions";
export const Conferences = "Conferences";
export const WeeklyGames = "WeeklyGames";
export const TeamGames = "TeamGames";
export const ThursdayNight = "Thursday Night";
export const FridayNight = "Friday Night";
export const SaturdayMorning = "Saturday Morning";
export const SaturdayAfternoon = "Saturday Afternoon";
export const SaturdayEvening = "Saturday Evening";
export const SaturdayNight = "Saturday Night";
export const ThursdayNightFootball = "Thursday Night Football";
export const SundayNoon = "Sunday Noon";
export const SundayAfternoon = "Sunday Afternoon";
export const SundayNightFootball = "Sunday Night Football";
export const MondayNightFootball = "Monday Night Football";
export type Timeslot =
  | typeof ThursdayNight
  | typeof FridayNight
  | typeof SaturdayMorning
  | typeof SaturdayAfternoon
  | typeof SaturdayEvening
  | typeof SaturdayNight
  | typeof ThursdayNightFootball
  | typeof SundayNoon
  | typeof SundayAfternoon
  | typeof SundayNightFootball
  | typeof MondayNightFootball;
export const FreeAgent = "FreeAgent";
export const Waivers = "Waivers";
export const GLeague = "GLeague";
export const International = "International";
export const USA = "USA";
export const Canada = "Canada";
export const Sweden = "Sweden";
export const Russia = "Russia";
export const HockeyPositionOptions = [
  { label: "Centers", value: "C" },
  { label: "Forwards", value: "F" },
  { label: "Defenders", value: "D" },
  { label: "Goalies", value: "G" },
];
export const HockeyArchetypeOptions = [
  { label: "Butterfly", value: "Butterfly" },
  { label: "Defensive", value: "Defensive" },
  { label: "Enforcer", value: "Enforcer" },
  { label: "Grinder", value: "Grinder" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Offensive", value: "Offensive" },
  { label: "Playmaker", value: "Playmaker" },
  { label: "Two-Way", value: "Two-Way" },
  { label: "Power", value: "Power" },
  { label: "Sniper", value: "Sniper" },
];

export const cbbUSARegionOptions = [
  { label: "All", value: "All" },
  { label: "Alabama", value: "Alabama" },
  { label: "Alaska", value: "Alaska" },
  { label: "American Samoa", value: "American Samoa" },
  { label: "Arizona", value: "Arizona" },
  { label: "Arkansas", value: "Arkansas" },
  { label: "California", value: "California" },
  { label: "Colorado", value: "Colorado" },
  { label: "Connecticut", value: "Connecticut" },
  { label: "Delaware", value: "Delaware" },
  { label: "Florida", value: "Florida" },
  { label: "Georgia", value: "Georgia" },
  { label: "Guam", value: "Guam" },
  { label: "Hawaii", value: "Hawaii" },
  { label: "Idaho", value: "Idaho" },
  { label: "Illinois", value: "Illinois" },
  { label: "Indiana", value: "Indiana" },
  { label: "Iowa", value: "Iowa" },
  { label: "Kansas", value: "Kansas" },
  { label: "Kentucky", value: "Kentucky" },
  { label: "Louisiana", value: "Louisiana" },
  { label: "Maine", value: "Maine" },
  { label: "Maryland", value: "Maryland" },
  { label: "Massachusetts", value: "Massachusetts" },
  { label: "Michigan", value: "Michigan" },
  { label: "Minnesota", value: "Minnesota" },
  { label: "Mississippi", value: "Mississippi" },
  { label: "Missouri", value: "Missouri" },
  { label: "Montana", value: "Montana" },
  { label: "Nebraska", value: "Nebraska" },
  { label: "Nevada", value: "Nevada" },
  { label: "New Hampshire", value: "New Hampshire" },
  { label: "New Jersey", value: "New Jersey" },
  { label: "New Mexico", value: "New Mexico" },
  { label: "New York", value: "New York" },
  { label: "North Carolina", value: "North Carolina" },
  { label: "North Dakota", value: "North Dakota" },
  { label: "Ohio", value: "Ohio" },
  { label: "Oklahoma", value: "Oklahoma" },
  { label: "Oregon", value: "Oregon" },
  { label: "Pennsylvania", value: "Pennsylvania" },
  { label: "Puerto Rico", value: "Puerto Rico" },
  { label: "Rhode Island", value: "Rhode Island" },
  { label: "South Carolina", value: "South Carolina" },
  { label: "South Dakota", value: "South Dakota" },
  { label: "Tennessee", value: "Tennessee" },
  { label: "Texas", value: "Texas" },
  { label: "Utah", value: "Utah" },
  { label: "Vermont", value: "Vermont" },
  { label: "Virginia", value: "Virginia" },
  { label: "Washington", value: "Washington" },
  { label: "West Virginia", value: "West Virginia" },
  { label: "Wisconsin", value: "Wisconsin" },
  { label: "Wyoming", value: "Wyoming" },
];

export const USARegionOptions = [
  { label: "All", value: "All" },
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

export const CanadaRegionOptions = [
  { label: "All", value: "All" },
  { label: "Alberta", value: "AB" },
  { label: "British Columbia", value: "BC" },
  { label: "Manitoba", value: "MB" },
  { label: "New Brunswick", value: "NB" },
  { label: "Newfoundland and Labrador", value: "NL" },
  { label: "Northwest Territories", value: "NWT" }, // or "NT"
  { label: "Nova Scotia", value: "NS" },
  { label: "Nunavut", value: "NVT" }, // or "NU"
  { label: "Ontario", value: "ON" },
  { label: "Prince Edward Island", value: "PE" },
  { label: "Quebec", value: "QC" },
  { label: "Saskatchewan", value: "SK" },
  { label: "Yukon", value: "YT" },
];

export const RussiaRegionOptions = [
  { label: "All", value: "All" },
  { label: "Karelia", value: "Karelia" },
  { label: "Moscow", value: "Moscow" },
  { label: "Saint Petersburg", value: "Saint Petersburg" },
  { label: "Novosibirsk Oblast", value: "Novosibirsk Oblast" },
  { label: "Krasnoyarsk Krai", value: "Krasnoyarsk Krai" },
  { label: "Krasnodar Krai", value: "Krasnodar Krai" },
  { label: "Nizhny Novgorod Oblast", value: "Nizhny Novgorod Oblast" },
  { label: "Yaroslavl Oblast", value: "Yaroslavl Oblast" },
  { label: "Chelyabinsk Oblast", value: "Chelyabinsk Oblast" },
  { label: "Khabarovsk Krai", value: "Khabarovsk Krai" },
  { label: "Buryatia", value: "Buryatia" },
  { label: "Ryazan Oblast", value: "Ryazan Oblast" },
  { label: "Magadan Oblast", value: "Magadan Oblast" },
  { label: "Tuva", value: "Tuva" },
  { label: "Smolensk Oblast", value: "Smolensk Oblast" },
  { label: "Arkhangelsk Oblast", value: "Arkhangelsk Oblast" },
  { label: "Altai Krai", value: "Altai Krai" },
  { label: "Karachay-Cherkessia", value: "Karachay-Cherkessia" },
  { label: "Lipetsk Oblast", value: "Lipetsk Oblast" },
  { label: "Tambov Oblast", value: "Tambov Oblast" },
  { label: "Leningrad Oblast", value: "Leningrad Oblast" },
  { label: "Kalmykia", value: "Kalmykia" },
  { label: "Moscow Oblast", value: "Moscow Oblast" },
  { label: "Oryol Oblast", value: "Oryol Oblast" },
  { label: "Belgorod Oblast", value: "Belgorod Oblast" },
  { label: "Kaliningrad Oblast", value: "Kaliningrad Oblast" },
  { label: "Voronezh Oblast", value: "Voronezh Oblast" },
  { label: "Rostov Oblast", value: "Rostov Oblast" },
  { label: "Stavropol Krai", value: "Stavropol Krai" },
  { label: "Perm Krai", value: "Perm Krai" },
  { label: "Altai Republic", value: "Altai Republic" },
  { label: "Bryansk Oblast", value: "Bryansk Oblast" },
  { label: "Mordovia", value: "Mordovia" },
  { label: "Bashkortostan", value: "Bashkortostan" },
  { label: "Kostroma Oblast", value: "Kostroma Oblast" },
  {
    label: "Khanty-Mansi Autonomous Okrug",
    value: "Khanty-Mansi Autonomous Okrug",
  },
  { label: "Udmurtia", value: "Udmurtia" },
  { label: "Tatarstan", value: "Tatarstan" },
  { label: "Tyumen Oblast", value: "Tyumen Oblast" },
  { label: "Ulyanovsk Oblast", value: "Ulyanovsk Oblast" },
  { label: "Samara Oblast", value: "Samara Oblast" },
  { label: "Ivanovo Oblast", value: "Ivanovo Oblast" },
  {
    label: "Yamalo-Nenets Autonomous Okrug",
    value: "Yamalo-Nenets Autonomous Okrug",
  },
  { label: "Kabardino-Balkaria", value: "Kabardino-Balkaria" },
  { label: "Primorsky Krai", value: "Primorsky Krai" },
  { label: "Penza Oblast", value: "Penza Oblast" },
  { label: "North Ossetia-Alania", value: "North Ossetia-Alania" },
  { label: "Murmansk Oblast", value: "Murmansk Oblast" },
  { label: "Omsk Oblast", value: "Omsk Oblast" },
  { label: "Kursk Oblast", value: "Kursk Oblast" },
  { label: "Tula Oblast", value: "Tula Oblast" },
  { label: "Tomsk Oblast", value: "Tomsk Oblast" },
  { label: "Khakassia", value: "Khakassia" },
  { label: "Kaluga Oblast", value: "Kaluga Oblast" },
  { label: "Amur Oblast", value: "Amur Oblast" },
  { label: "Novgorod Oblast", value: "Novgorod Oblast" },
  { label: "Chuvashia", value: "Chuvashia" },
  { label: "Vologda Oblast", value: "Vologda Oblast" },
  { label: "Nenets Autonomous Okrug", value: "Nenets Autonomous Okrug" },
  { label: "Kemerovo Oblast", value: "Kemerovo Oblast" },
  { label: "Orenburg Oblast", value: "Orenburg Oblast" },
  { label: "Irkutsk Oblast", value: "Irkutsk Oblast" },
  { label: "Kirov Oblast", value: "Kirov Oblast" },
  { label: "Vladimir Oblast", value: "Vladimir Oblast" },
  { label: "Chechnya", value: "Chechnya" },
  { label: "Zabaykalsky Krai", value: "Zabaykalsky Krai" },
];

export const SwedenRegionOptions = [
  { label: "All", value: "All" },
  { label: "Uppland", value: "Uppland" },
  { label: "Skane", value: "Skane" },
  { label: "Vastergotland", value: "Vastergotland" },
  { label: "Narke", value: "Narke" },
  { label: "Vastmanland", value: "Vastmanland" },
  { label: "Smaland", value: "Smaland" },
  { label: "Vasterbotten", value: "Vasterbotten" },
  { label: "Orebro", value: "Orebro" },
  { label: "Angermanland", value: "Angermanland" },
  { label: "Bohuslan", value: "Bohuslan" },
  { label: "Jamtland", value: "Jamtland" },
  { label: "Blekinge", value: "Blekinge" },
  { label: "Sodermanland", value: "Sodermanland" },
  { label: "Medelpad", value: "Medelpad" },
  { label: "Ostergotland", value: "Ostergotland" },
  { label: "Gastrikland", value: "Gastrikland" },
  { label: "Dalarna", value: "Dalarna" },
  { label: "Norrbotten", value: "Norrbotten" },
  { label: "Lappland", value: "Lappland" },
  { label: "Harjedalen", value: "Harjedalen" },
  { label: "Varmland", value: "Varmland" },
  { label: "Halland", value: "Halland" },
  { label: "Oland", value: "Oland" },
  { label: "Halsingland", value: "Halsingland" },
  { label: "Gotland", value: "Gotland" },
  { label: "Dalsland", value: "Dalsland" },
];

export const CountryOptions = [
  { label: "All", value: "All" },
  { label: "Canada", value: "Canada" },
  { label: "Russia", value: "Russia" },
  { label: "Sweden", value: "Sweden" },
  { label: "USA", value: "USA" },
  { label: "Australia", value: "Australia" },
  { label: "Belarus", value: "Belarus" },
  { label: "Brazil", value: "Brazil" },
  { label: "China", value: "China" },
  { label: "Czech Republic", value: "Czech Republic" },
  { label: "Denmark", value: "Denmark" },
  { label: "Ecuador", value: "Ecuador" },
  { label: "England", value: "England" },
  { label: "Finland", value: "Finland" },
  { label: "France", value: "France" },
  { label: "Germany", value: "Germany" },
  { label: "Greenland", value: "Greenland" },
  { label: "India", value: "India" },
  { label: "Japan", value: "Japan" },
  { label: "Kazakhstan", value: "Kazakhstan" },
  { label: "Latvia", value: "Latvia" },
  { label: "Laos", value: "Laos" },
  { label: "Lithuania", value: "Lithuania" },
  { label: "Mexico", value: "Mexico" },
  { label: "Netherlands", value: "Netherlands" },
  { label: "Norway", value: "Norway" },
  { label: "Peru", value: "Peru" },
  { label: "Poland", value: "Poland" },
  { label: "Portugal", value: "Portugal" },
  { label: "Slovakia", value: "Slovakia" },
  { label: "South Africa", value: "South Africa" },
  { label: "Switzerland", value: "Switzerland" },
  { label: "Taiwan", value: "Taiwan" },
  { label: "UK", value: "UK" },
  { label: "Ukraine", value: "Ukraine" },
];

export const cbbCountryOptions: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Albania", value: "Albania" },
  { label: "Algeria", value: "Algeria" },
  { label: "Angola", value: "Angola" },
  { label: "Antarctica", value: "Antarctica" },
  { label: "Argentina", value: "Argentina" },
  { label: "Armenia", value: "Armenia" },
  { label: "Austria", value: "Austria" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "Barbados", value: "Barbados" },
  { label: "Belgium", value: "Belgium" },
  { label: "Belize", value: "Belize" },
  { label: "Benin", value: "Benin" },
  { label: "Botswana", value: "Botswana" },
  { label: "Brazil", value: "Brazil" },
  { label: "Bulgaria", value: "Bulgaria" },
  { label: "Cambodia", value: "Cambodia" },
  { label: "Cameroon", value: "Cameroon" },
  { label: "Canada", value: "Canada" },
  { label: "Chad", value: "Chad" },
  { label: "Chile", value: "Chile" },
  { label: "China", value: "China" },
  { label: "Colombia", value: "Colombia" },
  { label: "Costa Rica", value: "Costa Rica" },
  { label: "Croatia", value: "Croatia" },
  { label: "Cuba", value: "Cuba" },
  { label: "DCR", value: "DCR" },
  {
    label: "Democratic Republic of Congo",
    value: "Democratic Republic of Congo",
  },
  { label: "Denmark", value: "Denmark" },
  { label: "Dominican Republic", value: "Dominican Republic" },
  { label: "Ecuador", value: "Ecuador" },
  { label: "Egypt", value: "Egypt" },
  { label: "El Salvador", value: "El Salvador" },
  { label: "Estonia", value: "Estonia" },
  { label: "Eritrea", value: "Eritrea" },
  { label: "Ethiopia", value: "Ethiopia" },
  { label: "Fiji", value: "Fiji" },
  { label: "Finland", value: "Finland" },
  { label: "France", value: "France" },
  { label: "French Guiana", value: "French Guiana" },
  { label: "French Polynesia", value: "French Polynesia" },
  { label: "Gabon", value: "Gabon" },
  { label: "Georgia", value: "Georgia" },
  { label: "Germany", value: "Germany" },
  { label: "Ghana", value: "Ghana" },
  { label: "Greece", value: "Greece" },
  { label: "Grenada", value: "Grenada" },
  { label: "Guatemala", value: "Guatemala" },
  { label: "Guinea", value: "Guinea" },
  { label: "Guyana", value: "Guyana" },
  { label: "Haiti", value: "Haiti" },
  { label: "Honduras", value: "Honduras" },
  { label: "Hungary", value: "Hungary" },
  { label: "Iceland", value: "Iceland" },
  { label: "India", value: "India" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Ireland", value: "Ireland" },
  { label: "Israel", value: "Israel" },
  { label: "Jamaica", value: "Jamaica" },
  { label: "Japan", value: "Japan" },
  { label: "Kenya", value: "Kenya" },
  { label: "Kyrgyzstan", value: "Kyrgyzstan" },
  { label: "Laos", value: "Laos" },
  { label: "Liberia", value: "Liberia" },
  { label: "Libya", value: "Libya" },
  { label: "Lithuania", value: "Lithuania" },
  { label: "Luxembourg", value: "Luxembourg" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Malawi", value: "Malawi" },
  { label: "Mali", value: "Mali" },
  { label: "Malta", value: "Malta" },
  { label: "Mexico", value: "Mexico" },
  { label: "Moldova", value: "Moldova" },
  { label: "Mongolia", value: "Mongolia" },
  { label: "Montenegro", value: "Montenegro" },
  { label: "Morocco", value: "Morocco" },
  { label: "Myanmar", value: "Myanmar" },
  { label: "Namibia", value: "Namibia" },
  { label: "Nepal", value: "Nepal" },
  { label: "Nicaragua", value: "Nicaragua" },
  { label: "Niger", value: "Niger" },
  { label: "Nigeria", value: "Nigeria" },
  { label: "North Korea", value: "North Korea" },
  { label: "North Macedonia", value: "North Macedonia" },
  { label: "Norway", value: "Norway" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "Panama", value: "Panama" },
  { label: "Papua New Guinea", value: "Papua New Guinea" },
  { label: "Paraguay", value: "Paraguay" },
  { label: "Peru", value: "Peru" },
  { label: "Philippines", value: "Philippines" },
  { label: "Poland", value: "Poland" },
  { label: "Portugal", value: "Portugal" },
  { label: "Romania", value: "Romania" },
  { label: "Russia", value: "Russia" },
  { label: "Senegal", value: "Senegal" },
  { label: "Serbia", value: "Serbia" },
  { label: "Sierra Leone", value: "Sierra Leone" },
  { label: "Singapore", value: "Singapore" },
  { label: "Solomon Islands", value: "Solomon Islands" },
  { label: "South Africa", value: "South Africa" },
  { label: "South Korea", value: "South Korea" },
  { label: "Spain", value: "Spain" },
  { label: "Suriname", value: "Suriname" },
  { label: "Sweden", value: "Sweden" },
  { label: "Switzerland", value: "Switzerland" },
  { label: "Taiwan", value: "Taiwan" },
  { label: "Tajikistan", value: "Tajikistan" },
  { label: "Tanzania", value: "Tanzania" },
  { label: "Thailand", value: "Thailand" },
  { label: "The Bahamas", value: "The Bahamas" },
  { label: "The Gambia", value: "The Gambia" },
  { label: "Togo", value: "Togo" },
  { label: "Trinidad", value: "Trinidad" },
  { label: "Tunisia", value: "Tunisia" },
  { label: "Turkey", value: "Turkey" },
  { label: "Turkmenistan", value: "Turkmenistan" },
  { label: "Uganda", value: "Uganda" },
  { label: "Ukraine", value: "Ukraine" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Uruguay", value: "Uruguay" },
  { label: "USA", value: "USA" },
  { label: "Uzbekistan", value: "Uzbekistan" },
  { label: "Vanuatu", value: "Vanuatu" },
  { label: "Venezuela", value: "Venezuela" },
  { label: "Vietnam", value: "Vietnam" },
  { label: "Wales", value: "Wales" },
  { label: "Yemen", value: "Yemen" },
  { label: "Zambia", value: "Zambia" },
  { label: "Zimbabwe", value: "Zimbabwe" },
  { label: "New Caledonia", value: "New Caledonia" },
];

export const StarOptions = [
  { label: "Five", value: "5" },
  { label: "Four", value: "4" },
  { label: "Three", value: "3" },
  { label: "Two", value: "2" },
  { label: "One", value: "1" },
];

export const StatusOptions = [
  { label: "Not Ready", value: "Not Ready" },
  { label: "Hearing Offers", value: "Hearing Offers" },
  { label: "Visiting Schools", value: "Visiting Schools" },
  { label: "Finalizing Decisions", value: "Finalizing Decisions" },
  { label: "Ready to Sign", value: "Ready to Sign" },
  { label: "Signed", value: "Signed" },
];
export const FootballPositionOptions = [
  { label: "Quarterbacks", value: "QB" },
  { label: "Runningbacks", value: "RB" },
  { label: "Fullbacks", value: "FB" },
  { label: "Wide Receivers", value: "WR" },
  { label: "Tightends", value: "TE" },
  { label: "Offensive Tackles", value: "OT" },
  { label: "Offensive Guards", value: "OG" },
  { label: "Centers", value: "C" },
  { label: "Defensive Ends", value: "DE" },
  { label: "Defensive Tackles", value: "DT" },
  { label: "Outside Linebackers", value: "OLB" },
  { label: "Inside Linebackers", value: "ILB" },
  { label: "Cornerbacks", value: "CB" },
  { label: "Free Safeties", value: "FS" },
  { label: "Strong Safeties", value: "SS" },
  { label: "Kickers", value: "K" },
  { label: "Punters", value: "P" },
  { label: "Athletes", value: "ATH" },
];

export const FootballArchetypeOptions = [
  { label: "Balanced", value: "Balanced" },
  { label: "Pocket", value: "Pocket" },
  { label: "Scrambler", value: "Scrambling" },
  { label: "Field General", value: "Field General" },
  { label: "Speed", value: "Speed" },
  { label: "Power", value: "Power" },
  { label: "Receiving", value: "Receiving" },
  { label: "Blocking", value: "Blocking" },
  { label: "Rushing", value: "Rushing" },
  { label: "Vertical Threat", value: "Vertical Threat" },
  { label: "Possession", value: "Possession" },
  { label: "Red Zone Threat", value: "Red Zone Threat" },
  { label: "Route Runner", value: "Router Runner" },
  { label: "Pass Blocking", value: "Pass Blocking" },
  { label: "Run Blocking", value: "Run Blocking" },
  { label: "Line Captain", value: "Line Captain" },
  { label: "Nose Tackle", value: "Nose Tackler" },
  { label: "Pass Rusher", value: "Pass Rusher" },
  { label: "Pass Rush", value: "Pass Rush" },
  { label: "Speed Rusher", value: "Speed Rusher" },
  { label: "Run Stopper", value: "Run Stopper" },
  { label: "Coverage", value: "Coverage" },
  { label: "Zone Coverage", value: "Zone Coverage" },
  { label: "Man Coverage", value: "Man Coverage" },
  { label: "Ball Hawk", value: "Ball Hawk" },
  { label: "Accuracy", value: "Accuracy" },
  { label: "Triple-Threat", value: "Triple-Threat" },
  { label: "Wingback", value: "Wingback" },
  { label: "Slotback", value: "Slotback" },
  { label: "Lineman", value: "Lineman" },
  { label: "Bandit", value: "Bandit" },
  { label: "Strongside", value: "Strongside" },
  { label: "Weakside", value: "Weakside" },
  { label: "Return Specialist", value: "Return Specialist" },
  { label: "Soccer Player", value: "Soccer Player" },
];

export const BasketballPositionOptions = [
  { label: "Point Guards", value: "PG" },
  { label: "Shooting Guards", value: "SG" },
  { label: "Small Forwards", value: "SF" },
  { label: "Power Forwards", value: "PF" },
  { label: "Centers", value: "C" },
];

export const BasketballArchetypeOptions = [
  { label: "All-Around", value: "All-Around" },
  { label: "Floor General", value: "Floor General" },
  { label: "Sharp Shooter", value: "Sharp Shooter" },
  { label: "Mid-Range Magician", value: "Mid-Range Magician" },
  { label: "Defensive Dawg", value: "Defensive Dawg" },
  { label: "3-and-D", value: "3-and-D" },
  { label: "Dunk Specialist", value: "Dunk Specialist" },
  { label: "Microwave", value: "Microwave" },
  { label: "Two-Way Wing", value: "Two-Way Wing" },
  { label: "Slasher", value: "Slasher" },
  { label: "Traditional Forward", value: "Traditional Forward" },
  { label: "Offensive Weapon", value: "Offensive Weapon" },
  { label: "Point Forward", value: "Point Forward" },
  { label: "Rim Protector", value: "Rim Protector" },
  { label: "Stretch Bigs", value: "Stretch Bigs" },
  { label: "Lob Threat", value: "Lob Threat" },
];

export const Agility = "Agility";
export const Speed = "Speed";
export const Carrying = "Carrying";
export const Strength = "Strength";
export const ThrowPower = "Throw Power";
export const ThrowAccuracy = "Throw Accuracy";
export const ShotgunRating = "Shotgun Rating";
export const ShotgunRatingAcronyms = {
  Balanced: "BAL",
  "Under Center": "UND",
  Shotgun: "GUN",
} as const;
export const Catching = "Catching";
export const PassBlock = "Pass Block";
export const RunBlock = "Run Block";
export const RouteRunning = "Route Running";
export const Tackle = "Tackle";
export const PassRush = "Pass Rush";
export const RunDefense = "Run Defense";
export const ZoneCoverage = "Zone Coverage";
export const ManCoverage = "Man Coverage";
export const KickAccuracy = "Kick Accuracy";
export const KickPower = "Kick Power";
export const PuntAccuracy = "Punt Accuracy";
export const PuntPower = "Punt Power";
export const FootballIQ = "Football IQ";
export const Stamina = "Stamina";
export const Injury = "Injury";
export type ButtonColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "primaryOutline"
  | "secondaryOutline"
  | "successOutline"
  | "dangerOutline"
  | "warningOutline"
  | "basketballOutline"
  | "hockeyOutline";

export const ScholarshipOffered = "ScholarshipOffered";
export const ScholarshipRevoked = "ScholarshipRevoked";

export const ButtonGreen = "bg-[#189E5B]";
export const TextGreen = "text-[#189E5B]";
export const navyBlueColor = "#1f2937";

export const MIN_SALARY = 0.75;
export const MAX_SALARY = 14;
export const BASE_HCK_WEEKS_IN_SEASON = 30;
export const BASE_FBA_WEEKS_IN_SEASON = 24;
export const BASE_HCK_SEASON = 2024;
export const BASE_FBA_SEASON = 2020;

export const CHLConferenceNames = [
  { label: "ConferenceID", value: "1", name: "AHA" },
  { label: "ConferenceID", value: "2", name: "Big Ten" },
  { label: "ConferenceID", value: "3", name: "CCHA" },
  { label: "ConferenceID", value: "4", name: "ECAC" },
  { label: "ConferenceID", value: "5", name: "Hockey East" },
  { label: "ConferenceID", value: "6", name: "NCHC" },
  { label: "ConferenceID", value: "7", name: "Independent" },
];

export const PHLConferenceNames = [
  { label: "ConferenceID", value: "1", name: "Eastern" },
  { label: "ConferenceID", value: "2", name: "Western" },
];

export const PHLDivisionNames = [
  { label: "DivisionID", value: "1", name: "Atlantic" },
  { label: "DivisionID", value: "2", name: "Metropolitan" },
  { label: "DivisionID", value: "3", name: "Central" },
  { label: "DivisionID", value: "4", name: "Pacific" },
];

export const FootballSeasons: { label: string; value: string }[] = [
  { label: "2021", value: "2021" },
  { label: "2022", value: "2022" },
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
];

export const HockeySeasons: { label: string; value: string }[] = [
  { label: "2025", value: "1" },
  { label: "2026", value: "2" },
  { label: "2027", value: "3" },
  { label: "2028", value: "4" },
  { label: "2029", value: "5" },
];

export const FootballWeeks: { label: string; value: string }[] = Array.from(
  { length: 23 },
  (_, i) => ({
    label: i.toString(),
    value: i.toString(),
  })
);

export const CHLWeeks: { label: string; value: string }[] = Array.from(
  { length: 22 },
  (_, i) => [
    { label: `${i + 1}A`, value: `${i + 1}A` },
    { label: `${i + 1}B`, value: `${i + 1}B` },
  ]
).flat();

export const PHLWeeks: { label: string; value: string }[] = Array.from(
  { length: 22 },
  (_, i) => [
    { label: `${i + 1}A`, value: `${i + 1}A` },
    { label: `${i + 1}B`, value: `${i + 1}B` },
    { label: `${i + 1}C`, value: `${i + 1}C` },
  ]
).flat();

export const MAX_TEAM_INFO_COLUMNS = 4;
export const MAX_TEAM_PHL_INFO_COLUMNS = 5;

export const statsOptions = [
  { label: "Passing", value: "Passing" },
  { label: "Rushing", value: "Rushing" },
  { label: "Receiving", value: "Receiving" },
  { label: "Tackles", value: "Tackles" },
  { label: "Sacks", value: "Sacks" },
  { label: "Interceptions", value: "Interceptions" },
] as const;

export type StatsCategory = (typeof statsOptions)[number]["value"];
export const CloseToHome = "Close to Home";
export const Academics = "Academics";
export const Service = "Service";
export const Religion = "Religion";
export const LargeCrowds = "Large Crowds";
export const SmallSchool = "Small School";
export const Frontrunner = "Frontrunner";
export const SmallTown = "Small Town";
export const BigCity = "Big City";
export const RisingStars = "Rising Stars";
export const MediaSpotlight = "Media Spotlight";
export const NoAffinity = "";
