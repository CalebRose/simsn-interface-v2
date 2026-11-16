import { NFLDraftee, ScoutingProfile } from "../../../../models/footballModels";
import { getOverallGrade } from "../../common/draftHelpers";
import { SimNFL } from "../../../../_constants/constants";

export const PRIVATE_WORKOUT_COST_PER_PLAYER = 20;
export const MAX_PRIVATE_WORKOUT_PLAYERS = 5;

export const isPrivateWorkoutCompleted = (profile: ScoutingProfile): boolean => {
  if (profile.PrivateWorkout) return true;
  return (
    Boolean(profile.ShowAttribute1) &&
    Boolean(profile.ShowAttribute2) &&
    Boolean(profile.ShowAttribute3) &&
    Boolean(profile.ShowAttribute4) &&
    Boolean(profile.ShowAttribute5) &&
    Boolean(profile.ShowAttribute6) &&
    Boolean(profile.ShowAttribute7) &&
    Boolean(profile.ShowAttribute8) &&
    Boolean(profile.ShowPotential)
  );
};

const pickDeterministic = (
  pool: string[],
  playerID: number,
  salt: number,
): string => {
  const hash =
    (Math.imul(playerID, 2654435761) ^ Math.imul(salt, 2246822519)) >>> 0;
  return pool[hash % pool.length];
};

const ATROCIOUS_DISCIPLINE_POOL = [
  '[Atrocious] Can\'t spell "study hall" - a walking penalty flag who struggles to follow basic team rules.',
  "[Atrocious] Showed up late to his own private workout and forgot his playbook in the car.",
  "[Atrocious] Multiple coaches flagged him for arguing with officials and blowing assignments out of frustration.",
  "[Atrocious] Treats the snap count like a polite suggestion rather than a rule.",
  "[Atrocious] Burned through three position coaches in college because he refused to take hard coaching.",
  "[Atrocious] Has a knack for turning a 3rd-and-2 stop into an automatic first down via personal foul.",
  "[Atrocious] Film room attendance was reportedly optional in his mind.",
  "[Atrocious] Spent more time jawing with the opposing sideline than lining up on time.",
  "[Atrocious] Routinely busts curfew on road trips and blames everyone else when caught.",
  "[Atrocious] Scouts noted zero accountability during interviews - every mistake was somebody else's fault.",
  "[Atrocious] Needs a babysitter just to make morning meetings on schedule.",
  "[Atrocious] Chronic false-start and unsportsmanlike-conduct risk the moment emotions run hot.",
  "[Atrocious] Said his favourite player and icon is Matt Howard. Bought a car from him and immediately crashed it.",
];

const BAD_DISCIPLINE_POOL = [
  "[Bad] A liability when left unsupervised. Struggles to balance responsibilities and distractions.",
  "[Bad] Physically challenged a coach during practice: a hothead who lets emotions overtake reason.",
  "[Bad] Prone to retaliatory flags after the whistle when opponents get under his skin.",
  "[Bad] Focus drifts during long walkthroughs and late-game situations.",
  "[Bad] Coaches had to simplify his assignments to keep him from freelancing on key downs.",
  "[Bad] Too many drive-killing holding and offside penalties on college tape.",
  "[Bad] Has talent, but his habit of cutting corners in conditioning worries the staff.",
  "[Bad] Frequently looks lost after pre-snap motion changes the picture.",
  "[Bad] Tends to sulk on the bench when things aren't going his way.",
  "[Bad] Auto-Correct can't even save him.",
  "[Bad] Needs strict veteran leadership in the locker room to stay dialed in.",
  "[Bad] Struggles to maintain composure when trailing by two scores.",
  "[Bad] Scouts noted sloppy technique late in drills whenever fatigue sets in.",
];

const AVERAGE_DISCIPLINE_POOL = [
  "[Average] Generally committed but not immune to lapses in focus. Performance can vary depending on the environment.",
  "[Average] Favorite flavor is vanilla - entirely unremarkable off the field.",
  "[Average] Shows up on time, does the work asked of him, and rarely makes headlines good or bad.",
  "[Average] Occasional mental lapse on snap counts, though nothing that lingers into the next series.",
  "[Average] Coachable enough, even if he isn't the first guy in the building.",
  "[Average] Keeps his nose clean for the most part, with only a couple of avoidable flags on tape.",
  "[Average] Responds well to structure, though his habits slip a bit in unstructured settings.",
  "[Average] Neither a vocal leader nor a locker-room headache - blends right into the group.",
  "[Average] Solid effort in drills, though scouts wish he showed a little more urgency between reps.",
  "[Average] Will commit the occasional frustration penalty in a chippy rivalry game, then settle down.",
  "[Average] Respectful in interviews and answered every scheme question straight down the middle.",
  "[Average] Does what's on the schedule without much extra, which is fine for most rooms.",
  "[Average] Conditioning and meeting habits are right at the league baseline.",
  "[Average] Rarely draws praise or complaints from his college position coach.",
  "[Average] Handles normal game-week prep fine, though short-week turnarounds test his focus.",
  "[Average] Stays out of trouble and keeps his circle small.",
  "[Average] Co-founded and develops for a sports simulation community as a hobby in his spare time.",
  "[Average] Plays within the whistle 95% of the time; the other 5% is mostly over-aggressiveness.",
  "[Average] Nothing in the background check raises red flags, and nothing jumps off the page either.",
  "[Average] Steady temperament - won't fire up a huddle, won't derail one either.",
  "[Average] Acceptable football character; fits best in a veteran-led locker room.",
  "[Average] Clean enough record with a few minor tardies freshman year that he outgrew.",
];

const GOOD_DISCIPLINE_POOL = [
  "[Good] Reliable and coachable. Keeps his head down and avoids costly mental mistakes.",
  "[Good] No one has ever heard him cuss - polite, composed, and locked in.",
  "[Good] Rarely flagged on tape; understands leverage and keeps his hands inside.",
  "[Good] Takes detailed notes in install meetings and asks sharp follow-up questions.",
  "[Good] Always lines up cleanly and knows every check at the line of scrimmage.",
  "[Good] Former team captain who held younger players accountable at practice.",
  "[Good] Never takes the bait after the whistle; walks back to the huddle every time.",
  "[Good] Coaches praised his consistency from August camp through bowl season.",
  "[Good] Self-starter who stays after practice for extra jug-machine or footwork reps.",
  "[Good] High situational awareness - knows when to stay inbounds and protect the ball.",
  "[Good] Trusted by his college staff to call out protections and adjustments.",
  "[Good] Clean background check with glowing references from strength and academic staff.",
];

const GREAT_DISCIPLINE_POOL = [
  "[Great] Consistently shows a strong work ethic and focus. Coaches trust this player to handle business without constant oversight.",
  "[Great] Teeters on the edge of perfection. A standout example of professionalism in every setting.",
  "[Great] First one in the facility, last one out of the film room - coaches raved about his habits.",
  "[Great] Virtually zero pre-snap or post-whistle penalties across three years of college starts.",
  "[Great] Acts like an extension of the coaching staff on the field and in the meeting room.",
  "[Great] Unflappable demeanor; opponents tried everything to rattle him and he never blinked.",
  "[Great] Known for organizing player-led summer workouts and film sessions.",
  "[Great] Immaculate technique even when exhausted late in the fourth quarter.",
  "[Great] Every reference - from the head coach to the equipment manager - called him a model pro.",
  "[Great] Treats every walkthrough rep like a game-winning snap.",
  "[Great] Zero off-field noise, zero wasted motion, 100% locked into the craft.",
  "[Great] The exact kind of tone-setter you want anchoring a young locker room.",
];

export const getDisciplineFlavourText = (
  discipline: number,
  playerID: number = 0,
): string => {
  if (discipline < 25) {
    return pickDeterministic(ATROCIOUS_DISCIPLINE_POOL, playerID, 101);
  }
  if (discipline < 40) {
    return pickDeterministic(BAD_DISCIPLINE_POOL, playerID, 102);
  }
  if (discipline < 60) {
    return pickDeterministic(AVERAGE_DISCIPLINE_POOL, playerID, 103);
  }
  if (discipline < 80) {
    return pickDeterministic(GOOD_DISCIPLINE_POOL, playerID, 104);
  }
  return pickDeterministic(GREAT_DISCIPLINE_POOL, playerID, 105);
};

const csvEscape = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatFixed2 = (val: number | null): string => {
  if (val === null || Number.isNaN(val)) return "N/A";
  return (Math.round(val * 100) / 100).toFixed(2);
};

const computeWonderlic = (footballIQ: number): number => {
  const dblTemp = Math.pow(footballIQ - 130.0, 3) / 25000.0 + 51.0;
  if (dblTemp < 12) {
    return Math.max(6, Math.round(dblTemp));
  }
  return Math.round(dblTemp);
};

const computePrivateWorkoutRow = (player: NFLDraftee): string[] => {
  const pos = player.Position || "";
  const arch = player.Archetype || "";
  const weight = player.Weight || 200;

  // Universal drills (delta = 0 for zero-variance Private Workouts)
  const fortyTime = Math.pow(100.0 - player.Speed, 2) / 4000.0 + 4.3;
  const benchStrength = pos.includes("FB") ? player.Strength - 10 : player.Strength;
  const benchReps = Math.round((Math.pow(185.0 - benchStrength, 2) / 600.0) * -1.0 + 60.0);
  const shuttleTime = Math.pow(100.0 - player.Agility, 2) / 6000.0 + 3.7;
  const threeConeTime = Math.pow(100.0 - player.Agility, 2) / 4200.0 + 6.28;
  const jumpRatio = (player.Strength + player.Agility) / weight;
  const verticalJump = Math.sqrt(1500.0 * jumpRatio) + 11.0;
  const broadJump = Math.round(Math.sqrt(20000.0 * jumpRatio) / 2.0 + 79.0);
  const wonderlic = computeWonderlic(player.FootballIQ);

  // Position-specific drills (delta = 0)
  const isQB = pos.includes("QB");
  const isBack = pos.includes("RB") || pos.includes("FB");
  const isPassCatcher = isBack || pos.includes("WR") || pos.includes("TE");
  const isBlocker =
    pos.includes("OT") ||
    pos.includes("OG") ||
    pos.includes("C") ||
    pos.includes("TE") ||
    pos.includes("FB");
  const isPassRusher =
    pos.includes("DT") ||
    pos.includes("DE") ||
    (pos.includes("OLB") && arch === "Pass Rush");
  const isOffBallLB =
    pos.includes("ILB") || (pos.includes("OLB") && arch !== "Pass Rush");
  const isDB = pos.includes("CB") || pos.includes("FS") || pos.includes("SS");
  const isSpecialist = pos.includes("K") || pos.includes("P");

  const accuracyDrill = isQB ? (player.ThrowAccuracy / 80.0) * 10.0 : null;
  const distanceDrill = isQB ? (player.ThrowPower / 85.0) * 10.0 : null;
  const catchingDrill = isPassCatcher ? (player.Catching / 80.0) * 10.0 : null;
  const routeRunningDrill = isPassCatcher ? (player.RouteRunning / 65.0) * 10.0 : null;
  const insideRunDrill = isBack ? ((player.Speed + player.Strength) / 170.0) * 10.0 : null;
  const outsideRunDrill = isBack ? ((player.Speed + player.Agility) / 180.0) * 10.0 : null;

  const blockOffset = pos.includes("FB") ? 15.0 : pos.includes("TE") ? 8.0 : 0.0;
  const runBlockDrill = isBlocker ? ((player.RunBlock - blockOffset) / 85.0) * 10.0 : null;
  const passBlockDrill = isBlocker ? ((player.PassBlock - blockOffset) / 85.0) * 10.0 : null;

  const runStopDrill =
    isPassRusher || isOffBallLB ? (player.RunDefense / 85.0) * 10.0 : null;
  const passRushDrill = isPassRusher ? (player.PassRush / 80.0) * 10.0 : null;
  const lbCoverageDrill = isOffBallLB
    ? ((player.ManCoverage + player.ZoneCoverage) / 150.0) * 10.0
    : null;
  const manCoverageDrill = isDB ? (player.ManCoverage / 90.0) * 10.0 : null;
  const zoneCoverageDrill = isDB ? (player.ZoneCoverage / 80.0) * 10.0 : null;

  const kickoffDrill = isSpecialist
    ? ((pos.includes("K") ? player.KickPower : player.PuntPower) / 73.0) * 10.0
    : null;
  const fieldGoalDrill = isSpecialist ? (player.KickAccuracy / 80.0) * 10.0 : null;
  const puntDistanceDrill = isSpecialist ? (player.PuntPower / 60.0) * 10.0 : null;
  const coffinPuntDrill = isSpecialist ? (player.PuntAccuracy / 66.0) * 10.0 : null;

  const feet = Math.floor((player.Height || 0) / 12);
  const inches = (player.Height || 0) % 12;
  const heightStr = `${feet}' ${inches}"`;

  return [
    csvEscape(player.PlayerID),
    csvEscape(player.FirstName),
    csvEscape(player.LastName),
    csvEscape(player.Position),
    csvEscape(player.Archetype),
    csvEscape(player.Age),
    csvEscape(player.College),
    csvEscape(heightStr),
    csvEscape(`${weight} lbs`),
    csvEscape(getOverallGrade(player as any, SimNFL)),
    csvEscape(player.Overall),
    csvEscape(player.PotentialGrade),
    formatFixed2(fortyTime),
    formatFixed2(shuttleTime),
    formatFixed2(threeConeTime),
    String(benchReps),
    formatFixed2(verticalJump),
    String(broadJump),
    String(wonderlic),
    formatFixed2(accuracyDrill),
    formatFixed2(distanceDrill),
    formatFixed2(catchingDrill),
    formatFixed2(routeRunningDrill),
    formatFixed2(insideRunDrill),
    formatFixed2(outsideRunDrill),
    formatFixed2(runBlockDrill),
    formatFixed2(passBlockDrill),
    formatFixed2(runStopDrill),
    formatFixed2(passRushDrill),
    formatFixed2(lbCoverageDrill),
    formatFixed2(manCoverageDrill),
    formatFixed2(zoneCoverageDrill),
    formatFixed2(kickoffDrill),
    formatFixed2(fieldGoalDrill),
    formatFixed2(puntDistanceDrill),
    formatFixed2(coffinPuntDrill),
    csvEscape(getDisciplineFlavourText(player.Discipline ?? 50, player.PlayerID ?? 0)),
  ];
};

export const downloadPrivateWorkoutReport = (
  players: NFLDraftee[],
  teamName?: string,
): void => {
  if (players.length === 0) return;

  const headers = [
    "PlayerID",
    "First Name",
    "Last Name",
    "Position",
    "Archetype",
    "Age",
    "College",
    "Height",
    "Weight",
    "Overall",
    "Overall (Num)",
    "Potential",
    "40 Yard Dash (sec.)",
    "20 Yard Shuttle (sec.)",
    "3 Cone (sec.)",
    "Bench Press (reps)",
    "Vertical Jump (in.)",
    "Broad Jump (in.)",
    "Wonderlic",
    "Accuracy Drill",
    "Distance Drill",
    "Catching Drill",
    "Route Running Drill",
    "Inside Run Drill",
    "Outside Run Drill",
    "Run Block Drill",
    "Pass Block Drill",
    "Run Stop Drill",
    "Pass Rush Drill",
    "LB Coverage Drill",
    "Man Coverage Drill",
    "Zone Coverage Drill",
    "Kickoff Drill",
    "Field Goal Drill",
    "Punt Distance Drill",
    "Coffin Punt Drill",
    "Background Check",
  ];

  const rows = players.map(computePrivateWorkoutRow);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeTeam = (teamName || "simnfl")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  link.href = url;
  link.setAttribute("download", `${safeTeam}_private_workouts_report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
