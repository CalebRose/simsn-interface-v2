import { useMemo } from "react";
import {
  CollegePromise,
  CollegePlayer as HockeyPlayer,
  CollegeTeam as HockeyTeam,
  TransferPortalProfile,
} from "../models/hockeyModels";
import { CollegeTeam } from "../models/footballModels";
import { Team } from "../models/basketballModels";

export const useFilteredHockeyTransferPlayers = ({
  portalPlayers,
  country,
  positions,
  archetype,
  regions,
  stars,
}: {
  portalPlayers: HockeyPlayer[];
  country: string;
  positions: string[];
  archetype: string[];
  regions: string[];
  stars: number[];
}) => {
  // 1) build Sets once per-change
  const positionSet = useMemo(() => new Set(positions), [positions]);
  const archSet = useMemo(() => new Set(archetype), [archetype]);
  const regionSet = useMemo(() => new Set(regions), [regions]);
  const starsSet = useMemo(() => new Set(stars), [stars]);

  // 2) filter in one pass, rejecting any row that fails an active filter
  return useMemo(
    () => {
      return portalPlayers.filter((p) => {
        // country: if set non-empty and not “All,” must match
        if (country && country !== "All" && p.Country !== country) {
          return false;
        }

        // position
        if (positionSet.size > 0 && !positionSet.has(p.Position)) {
          return false;
        }

        // archetype
        if (archSet.size > 0 && !archSet.has(p.Archetype)) {
          return false;
        }

        // region (state)
        if (regionSet.size > 0 && !regionSet.has(p.State)) {
          return false;
        }

        // stars
        if (starsSet.size > 0 && !starsSet.has(p.Stars)) {
          return false;
        }

        // passed all active filters
        return true;
      });
    },
    // depend on the raw list plus the Sets
    [portalPlayers, country, positionSet, archSet, regionSet, starsSet]
  );
};

export const getHCKPromiseWeight = (promiseType: string, benchmark: number) => {
  if (promiseType === "") {
    return "None";
  }
  if (promiseType === "No Redshirt") {
    return "Low";
  }
  if (promiseType === "Home State Game") {
    return "Medium";
  }
  if (promiseType === "Time on Ice") {
    if (benchmark < 1 || benchmark > 20) {
      return "Invalid";
    }
    if (benchmark <= 5) return "Very Low";
    if (benchmark <= 10) return "Low";
    if (benchmark <= 14) return "Medium";
    if (benchmark <= 18) return "High";
    return "Very High";
  }
  if (promiseType === "Wins") {
    if (benchmark > 34) {
      return "Invalid";
    }
    if (benchmark === 0) return "Why even try?";
    if (benchmark <= 2) return "Extremely Low";
    if (benchmark <= 8) return "Very Low";
    if (benchmark <= 18) return "Low";
    if (benchmark <= 24) return "Medium";
    if (benchmark <= 30) return "High";
    if (benchmark < 34) return "Very High";
    return "Extremely High";
  }
  if (promiseType === "Conference Championship") {
    return "High";
  }
  if (promiseType === "Playoffs") {
    return "Very High";
  }
  if (promiseType === "Frozen Four") {
    return "Extremely High";
  }
  if (promiseType === "National Championship") {
    return "If you make this promise then you better win it!";
  }
  return "None";
};

export const getSimCHLTeamStateOptions = (chlTeams: HockeyTeam[]) => {
  const list: { label: string; value: string }[] = [];
  chlTeams.forEach((team) => {
    if (!list.find((item) => item.value === team.State)) {
      list.push({ label: team.State, value: team.State });
    }
  });
  return list;
};

export const getSimCFBTeamStateOptions = (cfbTeams: CollegeTeam[]) => {
  const list: { label: string; value: string }[] = [];
  cfbTeams.forEach((team) => {
    if (!list.find((item) => item.value === team.State)) {
      list.push({ label: team.State, value: team.State });
    }
  });
  return list;
};

export const getSimCBBTeamStateOptions = (cbbTeams: Team[]) => {
  const list: { label: string; value: string }[] = [];
  cbbTeams.forEach((team) => {
    if (!list.find((item) => item.value === team.State)) {
      list.push({ label: team.State, value: team.State });
    }
  });
  return list;
};

export const getHCKModifierValue = (
  profile: TransferPortalProfile,
  promise: CollegePromise
) => {
  if (!promise || !profile) {
    return 1;
  }
  if (promise.ID === 0 || !promise.IsActive) {
    return 1;
  }

  const weight = promise.PromiseWeight;
  switch (weight) {
    case "Why even try?":
      return 0.5;
    case "Extremely Low":
      return 1.01;
    case "Very Low":
      return 1.05;
    case "Low":
      return 1.1;
    case "Medium":
      return 1.3;
    case "High":
      return 1.5;
    case "Very High":
      return 1.75;
    case "Extremely High":
      return 2.0;
    case "If you make this promise then you better win it!":
      return 2.25;
  }
  return 1;
};
