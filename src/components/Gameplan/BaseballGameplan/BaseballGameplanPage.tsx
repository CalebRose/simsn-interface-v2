import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PageContainer } from "../../../_design/Container";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SimCollegeBaseball, SimMLB } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { displayLevel, LEVEL_ORDER } from "../../../_utility/baseballHelpers";
import { BaseballService } from "../../../_services/baseballService";
import { Player, PlayerRatings } from "../../../models/baseball/baseballModels";
import {
  GAMEPLAN_TABS,
  DEFENSE_LINEUP_TAB,
  SAMPLE_LINEUPS_TAB,
  PITCHING_TAB,
  PLAYER_STRATEGY_TAB,
} from "./BaseballGameplanConstants";
import { DefenseAndLineupTab } from "./tabs/DefenseAndLineupTab";
import { SampleLineupsTab } from "./tabs/SampleLineupsTab";
import { PitchingTab } from "./tabs/PitchingTab";
import { PlayerStrategyTab } from "./tabs/PlayerStrategyTab";

interface BaseballGameplanPageProps {
  league: string;
}

export const BaseballGameplanPage = ({ league }: BaseballGameplanPageProps) => {
  const { currentUser } = useAuthStore();
  const { mlbOrganization, collegeOrganization, rosterMap, seasonContext } =
    useSimBaseballStore();

  const isCollege = league === SimCollegeBaseball;
  const organization =
    league === SimMLB ? mlbOrganization : collegeOrganization;

  const [selectedTab, setSelectedTab] = useState(DEFENSE_LINEUP_TAB);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Default to highest available level
  const activeLevel = useMemo(() => {
    if (selectedLevel) return selectedLevel;
    if (!organization?.teams) return "mlb";
    for (const level of LEVEL_ORDER) {
      if (organization.teams[level]) return level;
    }
    return "mlb";
  }, [selectedLevel, organization]);

  const activeTeam = useMemo(() => {
    return organization?.teams?.[activeLevel] ?? null;
  }, [organization, activeLevel]);

  const activeTeamId = activeTeam?.team_id ?? null;

  const allPlayers = useMemo(() => {
    return Object.values(rosterMap).flat();
  }, [rosterMap]);

  // Players for the active level only (used to scope scouting fetches)
  const activeLevelPlayers = useMemo(() => {
    return allPlayers.filter((p) => p.league_level === activeLevel);
  }, [allPlayers, activeLevel]);

  // ── Scouting overlay ──
  interface ScoutingOverlayEntry {
    letterGrades: Record<string, string>;
    attributes: Record<string, number>;
    potentials: Record<string, string | null>;
    potentialsPrecise: boolean;
    attributesPrecise: boolean;
    displayFormat?: string;
  }
  const [scoutingOverlay, setScoutingOverlay] = useState<Map<number, ScoutingOverlayEntry>>(new Map());
  const scoutingLoadedLevels = useRef<Set<string>>(new Set());
  const scoutingLoadedForOrg = useRef<number | null>(null);

  const orgId = organization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  const isPotentialsPrecise = (data: any): boolean => {
    if (data.visibility_context?.potentials_precise) return true;
    const unlocked: string[] = data.visibility?.unlocked ?? [];
    return unlocked.includes("college_potential_precise") || unlocked.includes("pro_potential_precise");
  };

  const isAttributesPrecise = (data: any): boolean => {
    if (data.visibility_context?.attributes_precise) return true;
    if (data.display_format === "20-80") return true;
    const unlocked: string[] = data.visibility?.unlocked ?? [];
    return unlocked.includes("pro_attrs_precise");
  };

  const fetchScoutingOverlay = useCallback(async (players: Player[], oId: number, lyId: number) => {
    if (!oId || !lyId || players.length === 0) return;
    try {
      const playerIds = players.map((p) => p.id);
      const results = await BaseballService.GetScoutedPlayersBatch(playerIds, oId, lyId);
      const entries: [number, ScoutingOverlayEntry][] = [];
      for (const [idStr, data] of Object.entries(results)) {
        entries.push([Number(idStr), {
          letterGrades: data.letter_grades ?? {},
          attributes: data.attributes ?? {},
          potentials: data.potentials ?? {},
          potentialsPrecise: isPotentialsPrecise(data),
          attributesPrecise: isAttributesPrecise(data),
          displayFormat: data.display_format,
        }]);
      }
      if (entries.length > 0) {
        setScoutingOverlay((prev) => {
          const next = new Map(prev);
          for (const [id, entry] of entries) next.set(id, entry);
          return next;
        });
      }
    } catch { /* scouting overlay unavailable — bootstrap data is already fuzzed */ }
  }, []);

  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    if (activeLevelPlayers.length === 0) return;
    // Reset tracking when org changes
    if (scoutingLoadedForOrg.current !== orgId) {
      scoutingLoadedForOrg.current = orgId;
      scoutingLoadedLevels.current = new Set();
      setScoutingOverlay(new Map());
    }
    // Only fetch for levels we haven't loaded yet
    if (scoutingLoadedLevels.current.has(activeLevel)) return;
    scoutingLoadedLevels.current.add(activeLevel);
    fetchScoutingOverlay(activeLevelPlayers, orgId, leagueYearId);
  }, [orgId, leagueYearId, activeLevel, activeLevelPlayers, fetchScoutingOverlay]);

  const applyScoutingOverlay = useCallback((players: Player[]): Player[] => {
    return players.map((p) => {
      const entry = scoutingOverlay.get(p.id);
      if (!entry) {
        return {
          ...p,
          visibility_context: p.visibility_context ?? {
            context: isCollege ? "college_roster" as const : "pro_roster" as const,
            display_format: isCollege ? "letter_grade" as const : "20-80" as const,
            attributes_precise: false,
            potentials_precise: false,
          },
        };
      }
      const newRatings = { ...p.ratings };

      if (isCollege) {
        for (const [key, grade] of Object.entries(entry.letterGrades)) {
          const displayKey = `${key}_display` as keyof PlayerRatings;
          if (displayKey in newRatings) {
            (newRatings as any)[displayKey] = grade;
          }
        }
      } else {
        // MLB: overlay attributes from scouting endpoint (fuzzed or precise 20-80 values)
        // Keys from scouting endpoint already include _display suffix (e.g. "contact_display")
        for (const [key, val] of Object.entries(entry.attributes)) {
          if (key in newRatings) {
            (newRatings as any)[key] = val;
          }
        }
      }

      const newPotentials = { ...p.potentials };
      for (const [key, val] of Object.entries(entry.potentials)) {
        if (key in newPotentials) {
          (newPotentials as any)[key] = val;
        }
      }

      return {
        ...p,
        ratings: newRatings,
        potentials: newPotentials,
        visibility_context: {
          context: isCollege ? "college_roster" as const : "pro_roster" as const,
          display_format: isCollege ? "letter_grade" as const : "20-80" as const,
          attributes_precise: entry.attributesPrecise,
          potentials_precise: entry.potentialsPrecise,
        },
      };
    });
  }, [isCollege, scoutingOverlay]);

  const levelPlayers = useMemo(() => {
    // Bootstrap data is now visibility-aware (fuzzed by the backend),
    // so players are safe to show immediately. The scouting overlay only
    // upgrades fuzzed → precise after a scouting action.
    const raw = allPlayers.filter((p) => p.league_level === activeLevel);
    return applyScoutingOverlay(raw);
  }, [allPlayers, activeLevel, applyScoutingOverlay]);

  const logo = useMemo(() => {
    if (!activeTeam) return "";
    return getLogo(
      league === SimMLB ? SimMLB : SimCollegeBaseball,
      activeTeam.team_id,
      currentUser?.isRetro,
    );
  }, [activeTeam, league, currentUser?.isRetro]);

  const pageTitle = useMemo(() => {
    if (!organization) return "";
    if (selectedLevel) {
      const team = organization.teams?.[selectedLevel];
      if (team?.team_full_name) return team.team_full_name;
      return `${organization.org_abbrev} ${displayLevel(selectedLevel)}`;
    }
    const mlbTeam = organization.teams?.["mlb"];
    if (mlbTeam?.team_full_name) return `${mlbTeam.team_full_name}`;
    return organization.org_abbrev;
  }, [organization, selectedLevel]);

  if (!organization) {
    return (
      <PageContainer>
        <Text variant="h4">No organization found.</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex-col w-full md:mb-6 px-2 sm:px-4 md:px-0">
        {/* Header */}
        <Border classes="p-4 mb-2">
          <div className="flex items-center flex-wrap gap-2 sm:gap-4 mb-3">
            {logo && (
              <img
                src={logo}
                className="w-12 h-12 object-contain"
                alt={organization.org_abbrev}
              />
            )}
            <Text variant="h4">{pageTitle} Game Planning</Text>
          </div>

          {/* Level Selector */}
          {organization.teams &&
            Object.keys(organization.teams).length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto">
                {LEVEL_ORDER.filter((l) => organization.teams?.[l]).map(
                  (level) => {
                    const team = organization.teams[level];
                    const isActive = activeLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() =>
                          setSelectedLevel(level === "mlb" ? null : level)
                        }
                        className={`flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-sm whitespace-nowrap transition-all cursor-pointer border
                      ${
                        isActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 font-semibold text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-800"
                      }`}
                      >
                        <img
                          src={getLogo(
                            league === SimMLB ? SimMLB : SimCollegeBaseball,
                            team.team_id,
                            currentUser?.isRetro,
                          )}
                          className="w-5 h-5 object-contain"
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <span>{displayLevel(level)}</span>
                        {team.team_abbrev && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {team.team_abbrev}
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            )}
        </Border>

        {/* Tabs + Content */}
        <Border classes="p-4">
          <TabGroup classes="mb-4">
            {GAMEPLAN_TABS.map((tab) => (
              <Tab
                key={tab}
                label={tab}
                selected={selectedTab === tab}
                setSelected={setSelectedTab}
              />
            ))}
          </TabGroup>

          {selectedTab === DEFENSE_LINEUP_TAB && activeTeamId && (
            <DefenseAndLineupTab teamId={activeTeamId} players={levelPlayers} />
          )}
          {selectedTab === SAMPLE_LINEUPS_TAB && activeTeamId && (
            <SampleLineupsTab teamId={activeTeamId} players={levelPlayers} />
          )}
          {selectedTab === PITCHING_TAB && activeTeamId && (
            <PitchingTab teamId={activeTeamId} players={levelPlayers} />
          )}
          {selectedTab === PLAYER_STRATEGY_TAB && (
            <PlayerStrategyTab
              orgId={organization.id}
              players={levelPlayers}
              levelLabel={activeLevel}
            />
          )}
        </Border>
      </div>
    </PageContainer>
  );
};
