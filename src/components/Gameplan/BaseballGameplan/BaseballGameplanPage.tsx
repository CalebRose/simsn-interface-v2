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
    if (!oId || !lyId) return;
    const overlay = new Map<number, ScoutingOverlayEntry>();
    // Process in small batches with delays to avoid API rate limits (429)
    const BATCH_SIZE = 3;
    const BATCH_DELAY_MS = 300;
    for (let i = 0; i < players.length; i += BATCH_SIZE) {
      if (i > 0) await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
      const batch = players.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (p) => {
          try {
            const data = await BaseballService.GetScoutedPlayer(p.id, oId, lyId);
            overlay.set(p.id, {
              letterGrades: data.letter_grades ?? {},
              attributes: data.attributes ?? {},
              potentials: data.potentials ?? {},
              potentialsPrecise: isPotentialsPrecise(data),
              attributesPrecise: isAttributesPrecise(data),
              displayFormat: data.display_format,
            });
          } catch { /* player may not be in scouting pool */ }
        })
      );
      setScoutingOverlay(new Map(overlay));
    }
  }, []);

  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    const all = Object.values(rosterMap).flat();
    if (all.length === 0) return;
    if (scoutingLoadedForOrg.current === orgId) return;
    scoutingLoadedForOrg.current = orgId;
    fetchScoutingOverlay(all, orgId, leagueYearId);
  }, [orgId, leagueYearId, rosterMap, fetchScoutingOverlay]);

  const applyScoutingOverlay = useCallback((players: Player[]): Player[] => {
    if (scoutingOverlay.size === 0) return players;
    return players.map((p) => {
      const entry = scoutingOverlay.get(p.id);
      if (!entry) return p;
      const newRatings = { ...p.ratings };

      if (isCollege) {
        for (const [key, grade] of Object.entries(entry.letterGrades)) {
          const displayKey = `${key}_display` as keyof PlayerRatings;
          if (displayKey in newRatings) {
            (newRatings as any)[displayKey] = grade;
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
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Header */}
        <Border classes="p-4 mb-2">
          <div className="flex items-center gap-4 mb-3">
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all cursor-pointer border
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
