import { VbApiError } from "../../_services/volleyballService";

// Plain wording for the error codes a user can run into. Anything not listed
// falls back to the API's own message.
const messages: Record<string, string> = {
  TEAM_TAKEN: "That team already has a human coach.",
  EARLIER_PENDING:
    "Someone asked for that team before you. Their request is decided first.",
  COOLDOWN: "You changed teams too recently to ask for another one.",
  WRONG_LEAGUE: "That team belongs to the other volleyball league.",
  NOT_PENDING: "That request has already been decided.",
  NO_COACH: "You have not created a coach yet.",
  COACH_EXISTS: "You already have a coach.",
  USERNAME: "That username already belongs to another coach.",
  RESET_WINDOW:
    "Once you have coached a match, a rebuild is only possible in the offseason.",
  RESET_USED: "You have already rebuilt your coach this offseason.",
  NOT_YOUR_TEAM: "Only that team's head coach can do this.",
  // Recruiting and the portal
  NOT_COLLEGE: "Only college programs recruit.",
  NO_WINDOW: "No recruiting window is open right now.",
  AUTO_MODE:
    "Your staff is recruiting for you. Switch to assist or manual to act yourself.",
  NOT_A_CANDIDATE: "That person is not part of this market.",
  NOT_AVAILABLE: "That person is no longer available.",
  NOT_CONTACTED: "Contact her first to learn her asking price.",
  DECLINED: "She has already turned your program down.",
  BOARD_FULL: "Your board is full. Remove someone to add her.",
  OFFERS_FULL: "You have as many live offers as you are allowed.",
  OVER_CAP: "That is more than a single offer may be.",
  NO_MONEY: "You do not have the money available for that offer.",
  NO_SPOTS: "You have no open roster spots.",
  NOT_LIVE: "That offer is no longer live.",
  NOT_ON_ROSTER: "She is not on your roster.",
  RESIGN_CLOSED: "Re-signing has already been decided for this offseason.",
  // Pro clubs
  NOT_PRO: "Only pro clubs can do this.",
  FA_CLOSED: "Free agency has already run this season.",
  WINDOW_CLOSED: "The trade window is closed.",
  LOCKED: "One of those players or picks is tied up in another deal.",
  PARTNER: "That club cannot be traded with.",
  ILLEGAL: "That trade is not allowed.",
  PICK: "One of those picks cannot be traded.",
  // Staff
  TOO_LOW: "That is below the salary they will accept.",
  OVER_BUDGET: "That would put your payroll over your staff budget.",
  ROLE_FILLED: "You already have someone in that role.",
  NOT_YOURS: "That is not yours to answer or change.",
  UNAUTHENTICATED: "Sign in again to continue.",
  NETWORK: "The volleyball service could not be reached.",
};

/** The lines to show for a failed call: a summary, then any specifics. */
export const vbErrorLines = (reason: unknown): string[] => {
  if (!(reason instanceof VbApiError)) {
    return [reason instanceof Error ? reason.message : "Something went wrong."];
  }
  const details = reason.details as { Errors?: unknown } | undefined;
  const specifics = Array.isArray(details?.Errors)
    ? details.Errors.map(String)
    : [];
  return [messages[reason.code] ?? reason.message, ...specifics];
};

export const vbErrorText = (reason: unknown) => vbErrorLines(reason).join(" ");
