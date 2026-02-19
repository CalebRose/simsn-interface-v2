import {
  FootballPositionOptions,
  FootballArchetypeOptions,
  FootballStatsType,
  PASSING,
  RUSHING,
  RECEIVING,
  OLINE,
  DEFENSE,
  SPECIAL_TEAMS,
} from "../_constants/constants";

export const getPositionValue = (label: string, fallback: string) =>
  FootballPositionOptions.find((option) => option.label === label)?.value ??
  fallback;

export const QB_VALUE = getPositionValue("Quarterbacks", "QB");
export const RB_VALUE = getPositionValue("Runningbacks", "RB");
export const FB_VALUE = getPositionValue("Fullbacks", "FB");
export const WR_VALUE = getPositionValue("Wide Receivers", "WR");
export const TE_VALUE = getPositionValue("Tightends", "TE");
export const OT_VALUE = getPositionValue("Offensive Tackles", "OT");
export const OG_VALUE = getPositionValue("Offensive Guards", "OG");
export const C_VALUE = getPositionValue("Centers", "C");
export const DE_VALUE = getPositionValue("Defensive Ends", "DE");
export const DT_VALUE = getPositionValue("Defensive Tackles", "DT");
export const OLB_VALUE = getPositionValue("Outside Linebackers", "OLB");
export const ILB_VALUE = getPositionValue("Inside Linebackers", "ILB");
export const CB_VALUE = getPositionValue("Cornerbacks", "CB");
export const FS_VALUE = getPositionValue("Free Safeties", "FS");
export const SS_VALUE = getPositionValue("Strong Safeties", "SS");
export const K_VALUE = getPositionValue("Kickers", "K");
export const P_VALUE = getPositionValue("Punters", "P");
export const ATH_VALUE = getPositionValue("Athletes", "ATH");

export const getArchetypeValue = (archetype: string) =>
  FootballArchetypeOptions.find(
    (option) => option.value === archetype || option.label === archetype,
  )?.value ?? archetype;

export const getFootballStatsType = (position: string): FootballStatsType => {
  switch (position) {
    case QB_VALUE:
      return PASSING;
    case RB_VALUE:
    case FB_VALUE:
      return RUSHING;
    case WR_VALUE:
    case TE_VALUE:
      return RECEIVING;
    case OT_VALUE:
    case OG_VALUE:
    case C_VALUE:
      return OLINE;
    case DE_VALUE:
    case DT_VALUE:
    case OLB_VALUE:
    case ILB_VALUE:
    case CB_VALUE:
    case FS_VALUE:
    case SS_VALUE:
      return DEFENSE;
    case K_VALUE:
    case P_VALUE:
      return SPECIAL_TEAMS;
    default:
      return PASSING;
  }
};
