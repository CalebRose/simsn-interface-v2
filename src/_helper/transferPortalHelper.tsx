import { useMemo } from "react";
import { CollegePlayer } from "../models/hockeyModels";

export const useFilteredHockeyTransferPlayers = ({
  portalPlayers,
  country,
  positions,
  archetype,
  regions,
  stars,
}: {
  portalPlayers: CollegePlayer[];
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
