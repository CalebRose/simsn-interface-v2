import faceData from "./faceData.json";
import faceDataBBA from "./faceDataBBA.json";
import faceDataHCK from "./faceDataHCK.json";
import { FaceDataResponse } from "../models/footballModels";
import {
  BasketballPositionOptions,
  CanadaRegionOptions,
  CountryOptions,
  FootballPositionOptions,
  HockeyPositionOptions,
  League,
  RussiaRegionOptions,
  SimCBB,
  SimCFB,
  SimCHL,
  SwedenRegionOptions,
  USARegionOptions,
  cbbCountryOptions,
} from "./constants";

export type CrootEthnicity = "Caucasian" | "Asian" | "Brown" | "African";

// Keys into faceData.json (e.g. "whiteSkin", "whiteHair", "whiteHairColor")
export const EthnicityOptions: {
  label: string;
  value: CrootEthnicity;
  key: "white" | "asian" | "brown" | "black";
}[] = [
  { label: "Caucasian", value: "Caucasian", key: "white" },
  { label: "Asian", value: "Asian", key: "asian" },
  { label: "Brown", value: "Brown", key: "brown" },
  { label: "African", value: "African", key: "black" },
];

// Mirrors the backend's getArchetype() so submissions are always valid.
export const FootballArchetypesByPosition: Record<string, string[]> = {
  QB: ["Balanced", "Pocket", "Scrambler", "Field General"],
  RB: ["Balanced", "Power", "Speed", "Receiving"],
  FB: ["Balanced", "Blocking", "Receiving", "Rushing"],
  WR: ["Speed", "Possession", "Route Runner", "Red Zone Threat"],
  TE: ["Blocking", "Receiving", "Vertical Threat"],
  OT: ["Balanced", "Pass Blocking", "Run Blocking"],
  OG: ["Balanced", "Pass Blocking", "Run Blocking"],
  C: ["Balanced", "Pass Blocking", "Run Blocking", "Line Captain"],
  DT: ["Balanced", "Nose Tackle", "Pass Rusher"],
  DE: ["Balanced", "Run Stopper", "Speed Rusher"],
  ILB: ["Coverage", "Field General", "Run Stopper", "Speed"],
  OLB: ["Coverage", "Pass Rush", "Run Stopper", "Speed"],
  CB: ["Ball Hawk", "Man Coverage", "Zone Coverage"],
  FS: ["Run Stopper", "Ball Hawk", "Man Coverage", "Zone Coverage"],
  SS: ["Run Stopper", "Ball Hawk", "Man Coverage", "Zone Coverage"],
  K: ["Balanced", "Accuracy", "Power"],
  P: ["Balanced", "Accuracy", "Power"],
  ATH: [
    "Bandit",
    "Return Specialist",
    "Wingback",
    "Soccer Player",
    "Slotback",
    "Lineman",
    "Strongside",
    "Weakside",
    "Triple-Threat",
    "Field General",
  ],
};

// Values match the strings the backend reads for PreferenceOne / PreferenceTwo.
export const FootballPreferenceOptions = [
  { label: "Program Development", value: "Program Development" },
  { label: "Professional Development", value: "Professional Development" },
  { label: "Traditions", value: "Traditions" },
  { label: "Facilities", value: "Facilities" },
  { label: "Atmosphere", value: "Atmosphere" },
  { label: "Academics", value: "Academics" },
  { label: "Conference Prestige", value: "Conference Prestige" },
  { label: "Coach Rating", value: "Coach" },
  { label: "Season Momentum", value: "Season Momentum" },
  { label: "Campus Life", value: "Campus Life" },
  { label: "Media Spotlight", value: "Media Spotlight" },
];

// Archetypes offered per basketball position. Mirrors the archetypes in
// BasketballArchetypeOptions; adjust here if the backend mapping differs.
export const BasketballArchetypesByPosition: Record<string, string[]> = {
  G: [
    "All-Around",
    "Floor General",
    "Sharp Shooter",
    "Mid-Range Magician",
    "Defensive Dawg",
    "3-and-D",
    "Microwave",
    "Slasher",
  ],
  F: [
    "All-Around",
    "Two-Way Wing",
    "3-and-D",
    "Slasher",
    "Traditional Forward",
    "Offensive Weapon",
    "Point Forward",
    "Dunk Specialist",
  ],
  C: [
    "All-Around",
    "Rim Protector",
    "Stretch Bigs",
    "Lob Threat",
    "Dunk Specialist",
    "Traditional Forward",
  ],
};

// The basketball backend reads "Media" rather than "Media Spotlight".
export const BasketballPreferenceOptions = FootballPreferenceOptions.map(
  (option) =>
    option.value === "Media Spotlight"
      ? { ...option, value: "Media" }
      : option,
);

// Hockey has no Campus Life or Media preferences.
export const HockeyPreferenceOptions = FootballPreferenceOptions.filter(
  (option) =>
    option.value !== "Campus Life" && option.value !== "Media Spotlight",
);

const skatersArchetypes = [
  "Enforcer",
  "Grinder",
  "Playmaker",
  "Power",
  "Sniper",
  "Two-Way",
];

// Mirrors the SimHockey generator's GetArchetype() per position.
export const HockeyArchetypesByPosition: Record<string, string[]> = {
  C: skatersArchetypes,
  F: skatersArchetypes,
  D: ["Defensive", "Enforcer", "Offensive", "Two-Way"],
  G: ["Stand-Up", "Hybrid", "Butterfly"],
};

type SelectOptions = { label: string; value: string }[];

export interface CustomCrootLeagueConfig {
  positionOptions: SelectOptions;
  archetypesByPosition: Record<string, string[]>;
  preferenceOptions: SelectOptions;
  minHeight: number;
  maxHeight: number;
  minWeight: number;
  maxWeight: number;
  defaultWeight: number;
  // null means the league only has US recruits, so no country picker is shown.
  countryOptions: SelectOptions | null;
  // Countries without an entry have no state/province field.
  getRegionOptions: (country: string) => SelectOptions;
}

const withoutAll = (options: SelectOptions) =>
  options.filter((option) => option.value !== "All");
const USA = "USA";
const usStates = withoutAll(USARegionOptions);

export const CustomCrootConfigs: Partial<
  Record<League, CustomCrootLeagueConfig>
> = {
  [SimCFB]: {
    positionOptions: FootballPositionOptions.map((option) => ({
      label: `${option.value} - ${option.label}`,
      value: option.value,
    })),
    archetypesByPosition: FootballArchetypesByPosition,
    preferenceOptions: FootballPreferenceOptions,
    minHeight: 64,
    maxHeight: 82,
    minWeight: 150,
    maxWeight: 380,
    defaultWeight: 200,
    countryOptions: null,
    getRegionOptions: () => usStates,
  },
  [SimCBB]: {
    positionOptions: BasketballPositionOptions.map((option) => ({
      label: `${option.value} - ${option.label}`,
      value: option.value,
    })),
    archetypesByPosition: BasketballArchetypesByPosition,
    preferenceOptions: BasketballPreferenceOptions,
    minHeight: 66,
    maxHeight: 92,
    minWeight: 150,
    maxWeight: 320,
    defaultWeight: 200,
    countryOptions: withoutAll(cbbCountryOptions),
    getRegionOptions: (country) => (country === USA ? usStates : []),
  },
  [SimCHL]: {
    positionOptions: HockeyPositionOptions.map((option) => ({
      label: `${option.value} - ${option.label}`,
      value: option.value,
    })),
    archetypesByPosition: HockeyArchetypesByPosition,
    preferenceOptions: HockeyPreferenceOptions,
    minHeight: 66,
    maxHeight: 80,
    minWeight: 140,
    maxWeight: 260,
    defaultWeight: 190,
    countryOptions: withoutAll(CountryOptions),
    getRegionOptions: (country) => {
      switch (country) {
        case USA:
          return usStates;
        case "Canada":
          return withoutAll(CanadaRegionOptions);
        case "Sweden":
          return withoutAll(SwedenRegionOptions);
        case "Russia":
          return withoutAll(RussiaRegionOptions);
        default:
          return [];
      }
    },
  },
};

export const CUSTOM_CROOT_MAX_PREFERENCES = 2;
export const CUSTOM_CROOT_MAX_BIO_LENGTH = 2000;
export const CUSTOM_CROOT_MAX_RELATIVE_LENGTH = 500;

// Each backend stores face parts as indexes into its own faceData.json, so
// the option lists (and their order) must come from the matching league file.
const footballLists = faceData as unknown as Record<string, string[]>;
const basketballLists = faceDataBBA as unknown as Record<string, string[]>;
const hockeyLists = faceDataHCK as unknown as Record<string, string[]>;

const getLists = (league: League) => {
  if (league === SimCBB) return basketballLists;
  if (league === SimCHL) return hockeyLists;
  return footballLists;
};

export const getFaceOptionLists = (league: League) => {
  const lists = getLists(league);
  return {
    accessories: lists.accessories,
    body: lists.body,
    ear: lists.ear,
    eye: lists.eye,
    eyeLine: lists.eyeLine,
    eyebrow: lists.eyebrow,
    facialHair: lists.facialHair,
    head: lists.head,
    jersey: lists.jersey,
    miscLine: lists.miscLine,
    mouth: lists.mouth,
    nose: lists.nose,
    smileLine: lists.smileLine,
    hairBg: lists.hairBg,
  };
};

export const getEthnicityFaceLists = (
  ethnicity: CrootEthnicity,
  league: League,
) => {
  const lists = getLists(league);
  const key =
    EthnicityOptions.find((e) => e.value === ethnicity)?.key ?? "white";
  return {
    skin: lists[`${key}Skin`],
    hair: lists[`${key}Hair`],
    hairColor: lists[`${key}HairColor`],
  };
};

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const range = (min: number, max: number) =>
  Math.round((min + Math.random() * (max - min)) * 100) / 100;
const intRange = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));

export const generateCustomCrootFace = (
  ethnicity: CrootEthnicity,
  weight: number,
  league: League,
): FaceDataResponse => {
  const lists = getLists(league);
  const eth = getEthnicityFaceLists(ethnicity, league);
  const heavy = weight >= 240;
  return new FaceDataResponse({
    Accessories: "none",
    Body: pick(heavy ? lists.body : lists.body.slice(0, 3)),
    Ear: pick(lists.ear),
    Eye: pick(lists.eye),
    EyeLine: pick(lists.eyeLine),
    Eyebrow: pick(lists.eyebrow),
    FacialHair: Math.random() < 0.7 ? "none" : pick(lists.facialHair),
    Glasses: "none",
    Hair: pick(eth.hair),
    HairBG: "none",
    HairFlip: Math.random() < 0.5,
    Head: pick(lists.head),
    Jersey: pick(lists.jersey),
    MiscLine: pick(lists.miscLine),
    Mouth: pick(lists.mouth),
    MouthFlip: Math.random() < 0.5,
    Nose: pick(lists.nose),
    NoseFlip: Math.random() < 0.5,
    SmileLine: pick(lists.smileLine),
    BodySize: heavy ? range(0.97, 1.2) : range(0.8, 0.96),
    EarSize: range(0.5, 1.5),
    EyeAngle: intRange(-10, 15),
    EyeBrowAngle: intRange(-15, 20),
    FaceSize: heavy ? range(0.6, 1) : range(0, 0.6),
    FacialHairShave: "rgba(0,0,0,0)",
    NoseSize: range(0.5, 1.25),
    SmileLineSize: range(0.25, 2.25),
    SkinColor: pick(eth.skin),
    HairColor: pick(eth.hairColor),
  });
};

// Keeps skin/hair/hair color legal for the chosen ethnicity while preserving
// every other feature the user already picked.
export const applyEthnicityToFace = (
  face: FaceDataResponse,
  ethnicity: CrootEthnicity,
  league: League,
): FaceDataResponse => {
  const eth = getEthnicityFaceLists(ethnicity, league);
  return new FaceDataResponse({
    ...face,
    TeamColors: face.teamColors,
    SkinColor: eth.skin.includes(face.SkinColor)
      ? face.SkinColor
      : pick(eth.skin),
    Hair: eth.hair.includes(face.Hair) ? face.Hair : pick(eth.hair),
    HairColor: eth.hairColor.includes(face.HairColor)
      ? face.HairColor
      : pick(eth.hairColor),
  });
};
