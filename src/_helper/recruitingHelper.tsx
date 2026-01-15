import { useMemo } from "react";
import { Croot as HockeyCroot } from "../models/hockeyModels";
import {
  Croot as FootballCroot,
  RecruitingTeamProfile,
  RecruitPlayerProfile,
} from "../models/footballModels";
import RegionMatcher from "../_matchers/regionMatcher.json";
import StateMatcher from "../_matchers/stateMatcher.json";
import { FormationMap } from "../_utility/getFormationMap";
import {
  Academics,
  BigCity,
  Frontrunner,
  LargeCrowds,
  MediaSpotlight,
  Religion,
  RisingStars,
  Service,
  SmallSchool,
  SmallTown,
} from "../_constants/constants";
import { Croot } from "../models/basketballModels";

type RegionMap = {
  [state: string]: { [city: string]: string };
};

const RegionMatcherMap: RegionMap = RegionMatcher;

type StateMap = {
  [regionState: string]: string[];
};

const StateMatcherMap: StateMap = StateMatcher;

type FormationScheme = {
  SchemeFits: string[];
  BadFits: string[];
};

type FormationMapType = {
  [scheme: string]: FormationScheme;
};

export const useFilteredHockeyRecruits = ({
  recruits,
  country,
  positions,
  archetype,
  regions,
  statuses,
  stars,
}: {
  recruits: HockeyCroot[];
  country: string;
  positions: string[];
  archetype: string[];
  regions: string[];
  statuses: string[];
  stars: number[];
}) => {
  if (!recruits) {
    return [];
  }
  // 1) build Sets once per-change
  const positionSet = useMemo(() => new Set(positions), [positions]);
  const archSet = useMemo(() => new Set(archetype), [archetype]);
  const regionSet = useMemo(() => new Set(regions), [regions]);
  const statusSet = useMemo(() => new Set(statuses), [statuses]);
  const starsSet = useMemo(() => new Set(stars), [stars]);

  // 2) filter in one pass, rejecting any row that fails an active filter
  return useMemo(
    () => {
      return recruits.filter((r) => {
        // country: if set non-empty and not “All,” must match
        if (country && country !== "All" && r.Country !== country) {
          return false;
        }

        // position
        if (positionSet.size > 0 && !positionSet.has(r.Position)) {
          return false;
        }

        // archetype
        if (archSet.size > 0 && !archSet.has(r.Archetype)) {
          return false;
        }

        // region (state)
        if (regionSet.size > 0 && !regionSet.has(r.State)) {
          return false;
        }

        // stars
        if (starsSet.size > 0 && !starsSet.has(r.Stars)) {
          return false;
        }

        // recruiting status
        if (statusSet.size > 0 && !statusSet.has(r.RecruitingStatus)) {
          return false;
        }

        // passed all active filters
        return true;
      });
    },
    // depend on the raw list plus the Sets
    [recruits, country, positionSet, archSet, regionSet, starsSet, statusSet]
  );
};

export const useFilteredBasketballRecruits = ({
  recruits,
  positions,
  archetype,
  regions,
  statuses,
  stars,
  country,
}: {
  recruits: Croot[];
  positions: string[];
  archetype: string[];
  regions: string[];
  statuses: string[];
  country: string[];
  stars: number[];
}) => {
  // 1) build Sets once per-change
  const positionSet = useMemo(() => new Set(positions), [positions]);
  const archSet = useMemo(() => new Set(archetype), [archetype]);
  const regionSet = useMemo(() => new Set(regions), [regions]);
  const countrySet = useMemo(() => new Set(country), [country]);
  const statusSet = useMemo(() => new Set(statuses), [statuses]);
  const starsSet = useMemo(() => new Set(stars), [stars]);

  // 2) filter in one pass, rejecting any row that fails an active filter
  return useMemo(
    () => {
      return recruits.filter((r) => {
        // position
        if (positionSet.size > 0 && !positionSet.has(r.Position)) {
          return false;
        }

        // archetype
        if (archSet.size > 0 && !archSet.has(r.Archetype)) {
          return false;
        }

        // region (state)
        if (regionSet.size > 0 && !regionSet.has(r.State)) {
          return false;
        }

        if (countrySet.size > 0 && !countrySet.has(r.Country)) {
          return false;
        }

        // stars
        if (starsSet.size > 0 && !starsSet.has(r.Stars)) {
          return false;
        }

        // recruiting status
        if (statusSet.size > 0 && !statusSet.has(r.SigningStatus)) {
          return false;
        }

        // passed all active filters
        return true;
      });
    },
    // depend on the raw list plus the Sets
    [recruits, positionSet, archSet, regionSet, starsSet, statusSet]
  );
};

export const useFilteredFootballRecruits = ({
  recruits,
  positions,
  archetype,
  regions,
  statuses,
  stars,
}: {
  recruits: FootballCroot[];
  positions: string[];
  archetype: string[];
  regions: string[];
  statuses: string[];
  stars: number[];
}) => {
  // 1) build Sets once per-change
  const positionSet = useMemo(() => new Set(positions), [positions]);
  const archSet = useMemo(() => new Set(archetype), [archetype]);
  const regionSet = useMemo(() => new Set(regions), [regions]);
  const statusSet = useMemo(() => new Set(statuses), [statuses]);
  const starsSet = useMemo(() => new Set(stars), [stars]);

  // 2) filter in one pass, rejecting any row that fails an active filter
  return useMemo(
    () => {
      return recruits.filter((r) => {
        // position
        if (positionSet.size > 0 && !positionSet.has(r.Position)) {
          return false;
        }

        // archetype
        if (archSet.size > 0 && !archSet.has(r.Archetype)) {
          return false;
        }

        // region (state)
        if (regionSet.size > 0 && !regionSet.has(r.State)) {
          return false;
        }

        // stars
        if (starsSet.size > 0 && !starsSet.has(r.Stars)) {
          return false;
        }

        // recruiting status
        if (statusSet.size > 0 && !statusSet.has(r.RecruitingStatus)) {
          return false;
        }

        // passed all active filters
        return true;
      });
    },
    // depend on the raw list plus the Sets
    [recruits, positionSet, archSet, regionSet, starsSet, statusSet]
  );
};

export const getAffinityList = (teamProfile: RecruitingTeamProfile) => {
  const list = [];
  if (teamProfile.AcademicsAffinity) {
    list.push("Academics");
  }
  if (teamProfile.FrontrunnerAffinity) {
    list.push("Frontrunner");
  }
  if (teamProfile.LargeCrowdsAffinity) {
    list.push("Large Crowds");
  }
  if (teamProfile.ReligionAffinity) {
    list.push("Religious School");
  }
  if (teamProfile.ServiceAffinity) {
    list.push("Service Academy");
  }
  if (teamProfile.SmallSchoolAffinity) {
    list.push("Small School");
  }
  if (teamProfile.SmallTownAffinity) {
    list.push("Small Town College");
  }
  if (teamProfile.BigCityAffinity) {
    list.push("Big City School");
  }
  if (teamProfile.MediaSpotlightAffinity) {
    list.push("Media Spotlight");
  }
  if (teamProfile.RisingStarsAffinity) {
    list.push("Rising Stars");
  }
  return list;
};

export const ValidateCloseToHome = (croot: any, abbr: any) => {
  let crootState = String(croot.State);

  if (crootState === "TX" || crootState === "CA" || crootState === "FL") {
    const regionalState = RegionMatcherMap[croot.State];
    if (regionalState && !regionalState[croot.City]) {
      // Short term fix if a city isn't on the map
      crootState = `${croot.State}(S)`;
    } else {
      crootState = regionalState[croot.City];
    }
  }

  const closeToHomeSchools = StateMatcherMap[crootState];
  if (closeToHomeSchools.length <= 0) {
    return false;
  }

  return closeToHomeSchools.includes(abbr);
};

export const ValidateAffinity = (
  affinity: string,
  teamProfile: RecruitingTeamProfile
) => {
  if (affinity === Academics && teamProfile.AcademicsAffinity) {
    return true;
  }
  if (affinity === Service && teamProfile.ServiceAffinity) {
    return true;
  }
  if (affinity === Frontrunner && teamProfile.FrontrunnerAffinity) {
    return true;
  }
  if (affinity === Religion && teamProfile.ReligionAffinity) {
    return true;
  }
  if (affinity === LargeCrowds && teamProfile.LargeCrowdsAffinity) {
    return true;
  }
  if (affinity === SmallSchool && teamProfile.SmallSchoolAffinity) {
    return true;
  }
  if (affinity === SmallTown && teamProfile.SmallTownAffinity) {
    return true;
  }
  if (affinity === BigCity && teamProfile.BigCityAffinity) {
    return true;
  }
  if (affinity === RisingStars && teamProfile.RisingStarsAffinity) {
    return true;
  }
  if (affinity === MediaSpotlight && teamProfile.MediaSpotlightAffinity) {
    return true;
  }

  return false;
};

export const getOffensiveSchemesList = () => {
  return [
    { label: "Power Run", value: "Power Run" },
    { label: "Vertical", value: "Vertical" },
    { label: "West Coast", value: "West Coast" },
    { label: "I Option", value: "I Option" },
    { label: "Run and Shoot", value: "Run and Shoot" },
    { label: "Air Raid", value: "Air Raid" },
    { label: "Pistol", value: "Pistol" },
    { label: "Spread Option", value: "Spread Option" },
    { label: "Wing-T", value: "Wing-T" },
    { label: "Double Wing", value: "Double Wing" },
    { label: "Wishbone", value: "Wishbone" },
    { label: "Flexbone", value: "Flexbone" },
  ];
};

export const getDefensiveSchemesList = () => {
  return [
    { label: "Old School", value: "Old School" },
    { label: "2-Gap", value: "2-Gap" },
    {
      label: "4-Man Front Spread Stopper",
      value: "4-Man Front Spread Stopper",
    },
    {
      label: "3-Man Front Spread Stopper",
      value: "3-Man Front Spread Stopper",
    },
    { label: "Speed", value: "Speed" },
    { label: "Multiple", value: "Multiple" },
  ];
};

export const getCBBAIBehaviorList = () => {
  return [
    { label: "Talent", value: "Talent" },
    { label: "Potential", value: "Potential" },
    { label: "Star", value: "Star" },
  ];
};

export const getCBBAttributeList = () => {
  return [
    { label: "Finishing", value: "Finishing" },
    { label: "Shooting2", value: "Shooting2" },
    { label: "Shooting3", value: "Shooting3" },
    { label: "FreeThrow", value: "FreeThrow" },
    { label: "Ballwork", value: "Ballwork" },
    { label: "Rebounding", value: "Rebounding" },
    { label: "Interior Defense", value: "Interior Defense" },
    { label: "Perimeter Defense", value: "Perimeter Defense" },
  ];
};

export const isGoodFit = (
  offensiveScheme: string,
  defensiveScheme: string,
  pos: string,
  arch: string
) => {
  if (offensiveScheme.length === 0 || defensiveScheme.length === 0) {
    return false;
  }
  let scheme = offensiveScheme;
  if (
    pos === "DT" ||
    pos === "DE" ||
    pos === "ILB" ||
    pos === "OLB" ||
    pos === "CB" ||
    pos === "FS" ||
    pos === "SS"
  ) {
    scheme = defensiveScheme;
  }

  const formationMap: FormationMapType = FormationMap;

  const schemeMap = formationMap[scheme];
  const { SchemeFits } = schemeMap;
  const label = `${arch} ${pos}`;
  const idx = SchemeFits.findIndex((x) => x === label);
  if (idx > -1) {
    return true;
  }
  return false;
};

export const isBadFit = (
  offensiveScheme: string,
  defensiveScheme: string,
  pos: string,
  arch: string
) => {
  if (offensiveScheme.length === 0 || defensiveScheme.length === 0) {
    return false;
  }
  let scheme = offensiveScheme;
  if (
    pos === "DT" ||
    pos === "DE" ||
    pos === "ILB" ||
    pos === "OLB" ||
    pos === "CB" ||
    pos === "FS" ||
    pos === "SS"
  ) {
    scheme = defensiveScheme;
  }

  const formationMap: FormationMapType = FormationMap;

  const schemeMap = formationMap[scheme];
  const { BadFits } = schemeMap;
  const label = `${arch} ${pos}`;
  const idx = BadFits.findIndex((x: string) => x === label);
  if (idx > -1) {
    return true;
  }
  return false;
};

export const getDisplayStatus = (odds: number) => {
  if (odds > 45) {
    return "Strong Favorite";
  } else if (odds > 24) {
    return "In Contention";
  } else if (odds > 11) {
    return "Just Outside";
  }
  return "Unlikely";
};

export const CalculateAdjustedCFBPoints = (
  recruitProfile: RecruitPlayerProfile,
  teamProfile: RecruitingTeamProfile,
  recruit: FootballCroot
) => {
  let am1 = recruitProfile.AffinityOneEligible;
  let am2 = recruitProfile.AffinityTwoEligible;
  let res = recruitProfile.RecruitingEfficiencyScore;
  let points = recruitProfile.CurrentWeeksPoints;
  let consistencyBonus = recruitProfile.SpendingCount;
  let affinityBonus = 0;
  if (am1) {
    affinityBonus += 0.1;
  }
  if (am2) {
    affinityBonus += 0.1;
  }
  res += affinityBonus;
  points = points * res;
  if (!teamProfile.IsFBS) {
    const starMod = recruit.Stars * 0.04;
    points *= 1 - starMod;
  }
  if (consistencyBonus > 0) {
    const streakBonus = affinityBonus * consistencyBonus;
    points *= 1 + streakBonus;
  }
  return Math.round(points * 100) / 100;
};
