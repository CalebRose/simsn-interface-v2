import { useMemo } from "react";
import {
  Affiliate,
  GLeague,
  International,
  PracticeSquad,
  Waivers,
} from "../_constants/constants";
import { ProfessionalPlayer } from "../models/hockeyModels";
import { NFLPlayer } from "../models/footballModels";
import { NBAPlayer } from "../models/basketballModels";

export const useFilteredPHLFreeAgents = ({
  freeAgents,
  waiverPlayers,
  affiliatePlayers,
  playerType,
  country,
  positions,
  archetype,
  regions,
  isUDFA,
}: {
  freeAgents: ProfessionalPlayer[];
  waiverPlayers: ProfessionalPlayer[];
  affiliatePlayers: ProfessionalPlayer[];
  playerType: string;
  country: string;
  positions: string[];
  archetype: string[];
  regions: string[];
  isUDFA: boolean;
}) => {
  // 1) Pre-build lookup sets
  const positionSet = useMemo(() => new Set(positions), [positions]);
  const archSet = useMemo(() => new Set(archetype), [archetype]);
  const regionSet = useMemo(() => new Set(regions), [regions]);

  // 2) Filter in one pass
  return useMemo(
    () => {
      // choose source list
      let source = freeAgents;
      if (playerType === Waivers) source = waiverPlayers;
      else if (playerType === Affiliate) source = affiliatePlayers;

      return source.filter((fa) => {
        // country filter (allow “All” as wildcard)
        if (country && country !== "All" && fa.Country !== country) {
          return false;
        }

        // position filter
        if (positionSet.size > 0 && !positionSet.has(fa.Position)) {
          return false;
        }

        // archetype filter
        if (archSet.size > 0 && !archSet.has(fa.Archetype)) {
          return false;
        }

        // region filter
        if (regionSet.size > 0 && !regionSet.has(fa.State)) {
          return false;
        }

        if (isUDFA && !fa.IsUDFA) {
          return false;
        }

        // passes every active filter
        return true;
      });
    },
    // only rerun when these actually change:
    [
      freeAgents,
      waiverPlayers,
      affiliatePlayers,
      playerType,
      country,
      positionSet,
      archSet,
      regionSet,
      isUDFA,
    ],
  );
};

export const useFilteredNFLFreeAgents = ({
  freeAgents,
  waiverPlayers,
  practiceSquadPlayers,
  playerType,
  positions,
  archetype,
  regions,
}: {
  freeAgents: NFLPlayer[];
  waiverPlayers: NFLPlayer[];
  practiceSquadPlayers: NFLPlayer[];
  playerType: string;
  positions: string[];
  archetype: string[];
  regions: string[];
}) => {
  // 1) Pre-build lookup sets
  const positionSet = useMemo(() => new Set(positions), [positions]);
  const archSet = useMemo(() => new Set(archetype), [archetype]);
  const regionSet = useMemo(() => new Set(regions), [regions]);

  // 2) Filter in one pass
  return useMemo(
    () => {
      // choose source list
      let source = freeAgents;
      if (playerType === Waivers) source = waiverPlayers;
      else if (playerType === PracticeSquad) source = practiceSquadPlayers;

      return source.filter((fa) => {
        // position filter
        if (positionSet.size > 0 && !positionSet.has(fa.Position)) {
          return false;
        }

        // archetype filter
        if (archSet.size > 0 && !archSet.has(fa.Archetype)) {
          return false;
        }

        // region filter
        if (regionSet.size > 0 && !regionSet.has(fa.State)) {
          return false;
        }

        // passes every active filter
        return true;
      });
    },
    // only rerun when these actually change:
    [
      freeAgents,
      waiverPlayers,
      practiceSquadPlayers,
      playerType,
      positionSet,
      archSet,
      regionSet,
    ],
  );
};

export const useFilteredNBAFreeAgents = ({
  freeAgents,
  waiverPlayers,
  gLeaguePlayers,
  internationalPlayers,
  playerType,
  country,
  positions,
  archetype,
  regions,
}: {
  freeAgents: NBAPlayer[];
  waiverPlayers: NBAPlayer[];
  gLeaguePlayers: NBAPlayer[];
  internationalPlayers: NBAPlayer[];
  playerType: string;
  country: string;
  positions: string[];
  archetype: string[];
  regions: string[];
}) => {
  // 1) Pre-build lookup sets
  const positionSet = useMemo(() => new Set(positions), [positions]);
  const archSet = useMemo(() => new Set(archetype), [archetype]);
  const regionSet = useMemo(() => new Set(regions), [regions]);

  // 2) Filter in one pass
  return useMemo(
    () => {
      // choose source list
      let source = freeAgents;
      if (playerType === Waivers) source = waiverPlayers;
      else if (playerType === GLeague) source = gLeaguePlayers;
      else if (playerType === International)
        source = internationalPlayers.filter(
          (p) => p.TeamID > 32 || (p.IsIntGenerated && p.TeamID === 0),
        );

      return source.filter((fa) => {
        // country filter (allow “All” as wildcard)
        if (country && country !== "All" && fa.Country !== country) {
          return false;
        }
        // position filter
        if (positionSet.size > 0 && !positionSet.has(fa.Position)) {
          return false;
        }

        // archetype filter
        if (archSet.size > 0 && !archSet.has(fa.Archetype)) {
          return false;
        }

        // region filter
        if (regionSet.size > 0 && !regionSet.has(fa.State)) {
          return false;
        }

        // passes every active filter
        return true;
      });
    },
    // only rerun when these actually change:
    [
      freeAgents,
      waiverPlayers,
      gLeaguePlayers,
      internationalPlayers,
      playerType,
      positionSet,
      archSet,
      regionSet,
      country,
    ],
  );
};
