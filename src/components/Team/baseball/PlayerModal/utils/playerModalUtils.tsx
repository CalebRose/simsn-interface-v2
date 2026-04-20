import type { AuctionPhase } from "../../../../../models/baseball/baseballFreeAgencyModels";
import { PHASE_COLORS } from "../../../../../models/baseball/baseballFreeAgencyModels";
import type { IFAAuctionPhase } from "../../../../../models/baseball/baseballIFAModels";
import { IFA_PHASE_COLORS } from "../../../../../models/baseball/baseballIFAModels";

export const heightDisplay = (inches: number) => {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
};

export const formatMoney = (val: string | number) => {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "—";
  return "$" + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

export const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

/** Format an effects dict as a short summary, e.g. "Contact −30%, Stamina −50%" */
export function formatEffectsSummary(
  effects: Record<string, number> | undefined,
): string {
  if (!effects) return "";
  const ATTR_LABELS: Record<string, string> = {
    contact: "CON",
    power: "POW",
    speed: "SPD",
    eye: "EYE",
    discipline: "DISC",
    fieldreact: "FLD",
    fieldcatch: "CATCH",
    throwpower: "THRP",
    throwacc: "THRA",
    basereaction: "BRCTN",
    baserunning: "BRUN",
    pendurance: "END",
    pgencontrol: "CTRL",
    psequencing: "SEQ",
    pthrowpower: "VELO",
    pickoff: "PKO",
    stamina_pct: "STA",
  };
  return Object.entries(effects)
    .filter(([, v]) => v < 1.0)
    .map(([k, v]) => `${ATTR_LABELS[k] ?? k} −${Math.round((1 - v) * 100)}%`)
    .join(", ");
}

export const FA_PHASE_COLOR_MAP: Record<string, string> = {
  green: "bg-green-600/20 text-green-400",
  yellow: "bg-yellow-600/20 text-yellow-400",
  red: "bg-red-600/20 text-red-400",
  gray: "bg-gray-600/20 text-gray-400",
};

export const faPhaseBadge = (phase: AuctionPhase) => {
  const color = PHASE_COLORS[phase] ?? "gray";
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${FA_PHASE_COLOR_MAP[color]}`}
    >
      {phase}
    </span>
  );
};

export const IFA_PHASE_CLASS_MAP: Record<string, string> = {
  green: "bg-green-600/20 text-green-400",
  yellow: "bg-yellow-600/20 text-yellow-400",
  red: "bg-red-600/20 text-red-400",
  gray: "bg-gray-600/20 text-gray-400",
};

export const IFA_OFFER_STATUS_CLASS_MAP: Record<string, string> = {
  green: "text-green-400",
  blue: "text-blue-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  gray: "text-gray-400",
};

export const ifaPhaseBadge = (phase: IFAAuctionPhase) => {
  const color = IFA_PHASE_COLORS[phase] ?? "gray";
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${IFA_PHASE_CLASS_MAP[color]}`}
    >
      {phase}
    </span>
  );
};
