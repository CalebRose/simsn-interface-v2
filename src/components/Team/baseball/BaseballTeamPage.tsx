import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportToCsv } from "../../../_utility/csvExport";
import {
  INFO_HEADERS, ALL_ATTR_HEADERS,
  POT_HEADERS, CONTRACT_HEADERS, BATTING_STAT_HEADERS, PITCHING_STAT_HEADERS,
  FULL_EXPORT_HEADERS,
  playerInfoRow, playerAllAttrRow,
  playerPotRow, playerContractRow, playerBattingStatsRow, playerPitchingStatsRow,
  buildFullExportRow,
} from "../../../_utility/rosterCsvExport";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import {
  Player,
  BaseballTeam,
  PlayerRatings,
  PlayerPotentials,
  VisibilityContext,
  ListedPositionResponse,
} from "../../../models/baseball/baseballModels";
import { TransactionPlayerPatch } from "../../../models/baseball/baseballTransactionModels";
import {
  SimCollegeBaseball,
  SimMLB,
  Attributes,
  Potentials,
  Contracts,
} from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import {
  displayLevel,
  displayTeamName,
  LEVEL_ORDER,
  normalizePlayer,
  numericToLetterGrade,
} from "../../../_utility/baseballHelpers";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import {
  BaseballTransactionModal,
  ScoutingConfirmationModal,
  TransactionAction,
  getTransactionOptions,
} from "./BaseballTransactionModals";
import {
  type BaseballCategory,
  type SortConfig,
  type PlayerStatsMap,
  emptyStatsMap,
  comparePlayers,
  AllPlayersTable,
  PositionTable,
  PitcherTable,
} from "./BaseballRosterTable";
import {
  BattingLeaderRow,
  PitchingLeaderRow,
} from "../../../models/baseball/baseballStatsModels";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import "./baseballMobile.css";
import {
  ScoutingActionType,
  ScoutingBudget,
} from "../../../models/baseball/baseballScoutingModels";
import {
  ContractDemand,
  ContractOverviewWithDemand,
} from "../../../models/baseball/baseballFreeAgencyModels";

// ═══════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════

const ALL_ORGS = "__all__";
const Stats = "Stats";

// ═══════════════════════════════════════════════
// Quick Action Buttons
// ═══════════════════════════════════════════════

const actionBtn =
  "px-2 py-1.5 sm:px-1.5 sm:py-0.5 rounded text-xs sm:text-[11px] min-h-[36px] sm:min-h-0 font-semibold leading-tight whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

const QuickActionButtons = ({
  player,
  isOwnOrg,
  isCollege,
  onTransaction,
  onScouting,
}: {
  player: Player;
  isOwnOrg: boolean;
  isCollege: boolean;
  onTransaction: (player: Player, action: TransactionAction) => void;
  onScouting: (player: Player, actionType: ScoutingActionType) => void;
}) => {
  const hasContract = player.contract !== null;
  const onIR = player.contract?.on_ir ?? false;
  const levelIndex = LEVEL_ORDER.indexOf(player.league_level);
  const canMove = hasContract && LEVEL_ORDER.length > 1;
  const attrsPrecise = player.visibility_context?.attributes_precise ?? false;
  const potsPrecise = player.visibility_context?.potentials_precise ?? false;

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-0.5 items-center">
      {/* Scouting */}
      {!isCollege && (
        <button
          className={`${actionBtn} ${attrsPrecise ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
          onClick={
            attrsPrecise
              ? undefined
              : () => onScouting(player, "pro_attrs_precise")
          }
          disabled={attrsPrecise}
          title={attrsPrecise ? "Already scouted" : "Scout Precise Attributes"}
          aria-label={
            attrsPrecise ? "Already scouted" : "Scout Precise Attributes"
          }
        >
          Attrs{attrsPrecise ? " ✓" : ""}
        </button>
      )}
      <button
        className={`${actionBtn} ${potsPrecise ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
        onClick={
          potsPrecise
            ? undefined
            : () =>
                onScouting(
                  player,
                  isCollege
                    ? "college_potential_precise"
                    : "pro_potential_precise",
                )
        }
        disabled={potsPrecise}
        title={potsPrecise ? "Already scouted" : "Scout Precise Potentials"}
        aria-label={
          potsPrecise ? "Already scouted" : "Scout Precise Potentials"
        }
      >
        Pots{potsPrecise ? " ✓" : ""}
      </button>

      {/* Movement — own org only */}
      {isOwnOrg && canMove && (
        <button
          className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`}
          onClick={() => onTransaction(player, "promote")}
          title="Move to Level"
          aria-label="Move to Level"
        >
          Move
        </button>
      )}
      {isOwnOrg && hasContract && !onIR && (
        <button
          className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`}
          onClick={() => onTransaction(player, "ir_place")}
          title="Place on IR"
          aria-label="Place on IR"
        >
          IR
        </button>
      )}
      {isOwnOrg && hasContract && onIR && (
        <button
          className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`}
          onClick={() => onTransaction(player, "ir_activate")}
          title="Activate from IR"
          aria-label="Activate from IR"
        >
          Act
        </button>
      )}

      {/* Transactions — own org only */}
      {isOwnOrg && hasContract && (
        <>
          <button
            className={`${actionBtn} bg-red-600/20 text-red-400 hover:bg-red-600/40`}
            onClick={() => onTransaction(player, "release")}
            title="Release"
            aria-label="Release player"
          >
            Rel
          </button>
          <button
            className={`${actionBtn} bg-orange-600/20 text-orange-400 hover:bg-orange-600/40`}
            onClick={() => onTransaction(player, "extend")}
            title="Extend"
            aria-label="Extend contract"
          >
            Ext
          </button>
          <button
            className={`${actionBtn} bg-orange-600/20 text-orange-400 hover:bg-orange-600/40`}
            onClick={() => onTransaction(player, "buyout")}
            title="Buyout"
            aria-label="Buyout contract"
          >
            Buy
          </button>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Team Selector Card
// ═══════════════════════════════════════════════

const TeamSelectorCard = ({
  isSelected,
  onClick,
  label,
  sublabel,
  logoSrc,
  playerCount,
  accentColor,
}: {
  isSelected: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
  logoSrc?: string;
  playerCount?: number;
  accentColor?: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer min-w-[8rem]
      ${
        !isSelected
          ? "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-800"
          : "shadow-sm"
      }`}
    style={
      isSelected
        ? { borderColor: accentColor, backgroundColor: `${accentColor}15` }
        : undefined
    }
  >
    {logoSrc && (
      <img
        src={logoSrc}
        className="w-8 h-8 object-contain shrink-0"
        alt=""
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    )}
    <div className="flex flex-col items-start text-left">
      <span
        className="text-sm font-medium leading-tight"
        style={isSelected && accentColor ? { color: accentColor } : undefined}
      >
        {label}
      </span>
      {sublabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {sublabel}
        </span>
      )}
      {playerCount !== undefined && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {playerCount} players
        </span>
      )}
    </div>
  </button>
);

// ═══════════════════════════════════════════════
// Main page component
// ═══════════════════════════════════════════════

interface BaseballTeamPageProps {
  league: string;
}

export const BaseballTeamPage = ({ league }: BaseballTeamPageProps) => {
  const { currentUser } = useAuthStore();
  const {
    organizations,
    mlbOrganization,
    collegeOrganization,
    loadBootstrapForOrg,
    getAllCachedOrgPlayers,
    seasonContext,
    rosterMap: contextRosterMap,
    bootstrappedOrgId,
  } = useSimBaseballStore();

  const userOrg = league === SimMLB ? mlbOrganization : collegeOrganization;

  // --- Org selector ---
  const [viewedOrgId, setViewedOrgId] = useState<string | null>(null);
  const [allOrgPlayers, setAllOrgPlayers] = useState<Player[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const leagueKey = league === SimMLB ? "mlb" : "college";
  const isAllView = viewedOrgId === ALL_ORGS;

  const leagueOrgs = useMemo(() => {
    return (organizations ?? [])
      .filter((o) => o.league === leagueKey)
      .sort((a, b) => a.org_abbrev.localeCompare(b.org_abbrev));
  }, [organizations, leagueKey]);

  const viewedOrg = useMemo(() => {
    if (isAllView) return null;
    if (viewedOrgId == null) return userOrg;
    return organizations?.find((o) => o.id === Number(viewedOrgId)) ?? userOrg;
  }, [viewedOrgId, isAllView, organizations, userOrg]);

  const isCollege = league === SimCollegeBaseball;

  // primaryTeam used for logo/title (always top-level)
  const primaryTeam = useMemo(() => {
    if (!viewedOrg?.teams) return null;
    if (isCollege) return Object.values(viewedOrg.teams)[0] ?? null;
    return viewedOrg.teams["mlb"] ?? Object.values(viewedOrg.teams)[0] ?? null;
  }, [viewedOrg, isCollege]);

  // --- Page-local roster & team data (decoupled from context to avoid race conditions) ---
  const [pageRosterMap, setPageRosterMap] = useState<Record<string, Player[]>>(
    {},
  );
  const [pageAllTeams, setPageAllTeams] = useState<BaseballTeam[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  const processBootstrapResult = useCallback((data: any) => {
    if (data?.RosterMap) {
      const normalized: Record<string, Player[]> = {};
      for (const [key, players] of Object.entries(data.RosterMap)) {
        normalized[key] = (players as any[]).map(normalizePlayer);
      }
      setPageRosterMap(normalized);
    }
    if (data?.AllTeams) setPageAllTeams(data.AllTeams);
    setIsLoadingOrg(false);
  }, []);

  // Load bootstrap for user's org on mount
  useEffect(() => {
    if (userOrg?.id && viewedOrgId == null) {
      setIsLoadingOrg(true);
      loadBootstrapForOrg(userOrg.id).then(processBootstrapResult);
    }
  }, [userOrg?.id]);

  // Re-sync pageRosterMap when context rosterMap updates (e.g. after sim advance)
  // Only applies when viewing the user's own org (bootstrappedOrgId matches)
  useEffect(() => {
    const currentViewId = viewedOrgId != null ? Number(viewedOrgId) : userOrg?.id;
    if (!currentViewId || isAllView) return;
    if (bootstrappedOrgId !== currentViewId) return;
    const contextPlayers = Object.values(contextRosterMap).flat();
    if (contextPlayers.length === 0) return;
    // Normalize and update — fresh data from context replaces stale pageRosterMap
    const normalized: Record<string, Player[]> = {};
    for (const [key, players] of Object.entries(contextRosterMap)) {
      normalized[key] = players.map(normalizePlayer);
    }
    setPageRosterMap(normalized);
  }, [contextRosterMap, bootstrappedOrgId]);

  // ── Scouting overlay (college + MLB) ──
  interface ScoutingOverlayEntry {
    letterGrades: Record<string, string>; // college: letter grade attrs
    attributes: Record<string, number>; // MLB: numeric 20-80 attrs
    potentials: Record<string, string | null>;
    potentialsPrecise: boolean;
    attributesPrecise: boolean;
    displayFormat?: string; // "20-80" | "20-80-fuzzed" | "letter_grade"
  }
  const [scoutingOverlay, setScoutingOverlay] = useState<
    Map<number, ScoutingOverlayEntry>
  >(new Map());
  const [scoutingLoading, setScoutingLoading] = useState(false);
  const scoutingLoadedForOrg = useRef<number | null>(null);
  const statsCache = useRef<{
    orgId: number;
    lyId: number;
    data: PlayerStatsMap;
  } | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(
    null,
  );

  const leagueYearId = seasonContext?.current_league_year_id ?? 0;
  const effectiveOrgId = viewedOrg?.id ?? userOrg?.id ?? 0;

  /** Determine if potentials are precise from scouting response. */
  const isPotentialsPrecise = (data: any): boolean => {
    if (data.visibility_context?.potentials_precise) return true;
    const unlocked: string[] = data.visibility?.unlocked ?? [];
    return (
      unlocked.includes("college_potential_precise") ||
      unlocked.includes("pro_potential_precise")
    );
  };

  /** Determine if attributes are precise from scouting response. */
  const isAttributesPrecise = (data: any): boolean => {
    if (data.visibility_context?.attributes_precise) return true;
    if (data.display_format === "20-80") return true;
    const unlocked: string[] = data.visibility?.unlocked ?? [];
    return unlocked.includes("pro_attrs_precise");
  };

  const fetchScoutingOverlay = useCallback(
    async (players: Player[], orgId: number, lyId: number) => {
      if (!orgId || !lyId || players.length === 0) return;
      setScoutingLoading(true);
      try {
        const playerIds = players.map((p) => p.id);
        const results = await BaseballService.GetScoutedPlayersBatch(
          playerIds,
          orgId,
          lyId,
        );
        const overlay = new Map<number, ScoutingOverlayEntry>();
        for (const [idStr, data] of Object.entries(results)) {
          overlay.set(Number(idStr), {
            letterGrades: data.letter_grades ?? {},
            attributes: data.attributes ?? {},
            potentials: data.potentials ?? {},
            potentialsPrecise: isPotentialsPrecise(data),
            attributesPrecise: isAttributesPrecise(data),
            displayFormat: data.display_format,
          });
        }
        setScoutingOverlay(overlay);
      } catch {
        /* scouting overlay unavailable — bootstrap data is already fuzzed */
      }
      setScoutingLoading(false);
    },
    [],
  );

  // Fetch scouting budget for all leagues when org loads
  useEffect(() => {
    if (isAllView || !effectiveOrgId || !leagueYearId) return;
    BaseballService.GetScoutingBudget(effectiveOrgId, leagueYearId)
      .then(setScoutingBudget)
      .catch(() => {});
  }, [isAllView, effectiveOrgId, leagueYearId]);

  // Fetch scouting overlay when roster loads (both college + MLB).
  // College: replaces 20-80 _display with letter grades.
  // MLB: replaces bootstrap _display with scouting-aware fuzzed/precise values.
  // Requests are batched (5 at a time) to avoid API rate limits.
  useEffect(() => {
    if (isAllView || !effectiveOrgId || !leagueYearId) return;
    const allPlayers = Object.values(pageRosterMap).flat();
    if (allPlayers.length === 0) return;
    if (scoutingLoadedForOrg.current === effectiveOrgId) return;
    scoutingLoadedForOrg.current = effectiveOrgId;
    fetchScoutingOverlay(allPlayers, effectiveOrgId, leagueYearId);
  }, [
    isCollege,
    isAllView,
    effectiveOrgId,
    leagueYearId,
    pageRosterMap,
    fetchScoutingOverlay,
  ]);

  // Convert any numeric _display values to letter grades for college players
  const convertRatingsToGrades = (ratings: PlayerRatings): PlayerRatings => {
    const converted = { ...ratings };
    for (const key of Object.keys(converted) as (keyof PlayerRatings)[]) {
      const val = converted[key];
      if (typeof val === "number" && key.endsWith("_display")) {
        (converted as any)[key] = numericToLetterGrade(val);
      }
    }
    return converted;
  };

  // Apply scouting overlay to players: replace _display values, overlay potentials
  // For college: also ensures all numeric _display values are converted to letter grades
  const applyScoutingOverlay = useCallback(
    (players: Player[]): Player[] => {
      return players.map((p) => {
        const entry = scoutingOverlay.get(p.id);

        if (!entry) {
          return {
            ...p,
            ratings: isCollege ? convertRatingsToGrades(p.ratings) : p.ratings,
            visibility_context: p.visibility_context ?? {
              context: isCollege ? "college_roster" : "pro_roster",
              display_format: isCollege ? "letter_grade" : "20-80",
              attributes_precise: false,
              potentials_precise: false,
            },
          };
        }
        const newRatings = { ...p.ratings };

        if (isCollege) {
          // College: map letter_grades keys (e.g. "contact") → ratings display fields (e.g. "contact_display")
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
          ratings: isCollege ? convertRatingsToGrades(newRatings) : newRatings,
          potentials: newPotentials,
          visibility_context: {
            context: isCollege ? "college_roster" : "pro_roster",
            display_format: isCollege ? "letter_grade" : "20-80",
            attributes_precise: entry.attributesPrecise,
            potentials_precise: entry.potentialsPrecise,
          },
        };
      });
    },
    [isCollege, scoutingOverlay],
  );

  const orgOptions = useMemo(() => {
    const allEntry: SelectOption = {
      value: ALL_ORGS,
      label: "All Organizations",
    };

    if (isCollege) {
      // Build org_id → team lookup from pageAllTeams (has consistent data for ALL teams)
      const teamByOrgId: Record<number, BaseballTeam> = {};
      for (const t of pageAllTeams) {
        if (t.org_id) teamByOrgId[t.org_id] = t;
      }

      // Group by conference
      const conferenceMap: Record<string, SelectOption[]> = {};
      for (const org of leagueOrgs) {
        // Use allTeams data (consistent for every org), fall back to org.teams
        const team = teamByOrgId[org.id] || Object.values(org.teams ?? {})[0];
        const conf = team?.conference || "Independent";
        if (!conferenceMap[conf]) conferenceMap[conf] = [];
        conferenceMap[conf].push({
          value: String(org.id),
          label: team?.team_full_name || org.org_abbrev,
        });
      }
      const groups = Object.keys(conferenceMap)
        .sort()
        .map((conf) => ({
          label: conf,
          options: conferenceMap[conf].sort((a, b) =>
            a.label.localeCompare(b.label),
          ),
        }));
      return [{ label: "", options: [allEntry] }, ...groups];
    }

    // MLB: flat list
    const opts: SelectOption[] = [allEntry];
    for (const org of leagueOrgs) {
      const t = org.teams?.["mlb"];
      opts.push({
        value: String(org.id),
        label: t?.team_full_name || org.org_abbrev,
      });
    }
    return opts;
  }, [leagueOrgs, isCollege, pageAllTeams]);

  const selectedOrgOption = useMemo(() => {
    const orgId = isAllView ? ALL_ORGS : String(viewedOrg?.id ?? userOrg?.id);
    // Search through grouped or flat options
    const flat =
      Array.isArray(orgOptions) &&
      orgOptions.length > 0 &&
      "options" in orgOptions[0]
        ? (orgOptions as { label: string; options: SelectOption[] }[]).flatMap(
            (g) => g.options,
          )
        : (orgOptions as SelectOption[]);
    return flat.find((o) => o.value === orgId) ?? null;
  }, [orgOptions, isAllView, viewedOrg, userOrg]);

  const loadAllOrgPlayers = useCallback(async () => {
    setIsLoadingAll(true);
    const leaguePlayerFilter = (p: Player) => {
      if (league === SimMLB) return LEVEL_ORDER.includes(p.league_level);
      return p.league_level === "college";
    };
    try {
      // Only use cache if it contains data for ALL known orgs in this league —
      // a partial cache (e.g. only the user's own org) would show incorrect results.
      const cached = getAllCachedOrgPlayers();
      const cacheIsComplete = cached != null && cached.cachedOrgCount >= leagueOrgs.length && leagueOrgs.length > 0;
      if (cacheIsComplete) {
        setAllOrgPlayers(cached.players.filter(leaguePlayerFilter));
        if (cached.allTeams.length > 0) setPageAllTeams(cached.allTeams);
      } else {
        // Cache incomplete — fetch all orgs from the API
        const allData = await BaseballService.GetAllBootstrapData();
        const players: Player[] = [];
        if (allData.Orgs) {
          for (const orgEntry of Object.values(allData.Orgs)) {
            if (orgEntry.RosterMap) {
              for (const roster of Object.values(orgEntry.RosterMap)) {
                players.push(...(roster as any[]).map(normalizePlayer));
              }
            }
          }
        }
        setAllOrgPlayers(players.filter(leaguePlayerFilter));
        if (allData.AllTeams?.length > 0) setPageAllTeams(allData.AllTeams);
      }
    } catch (e) {
      console.error("Failed to load all org players", e);
    }
    setIsLoadingAll(false);
  }, [league, getAllCachedOrgPlayers, leagueOrgs]);

  // --- Filters & category ---
  const defaultLevel = league === SimMLB ? "mlb" : "college";
  const [filterLevel, setFilterLevel] = useState<string>(defaultLevel);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterInjury, setFilterInjury] = useState<"all" | "healthy" | "injured">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<BaseballCategory>(Attributes);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // --- Stats data for roster table ---
  const [playerStatsMap, setPlayerStatsMap] = useState<PlayerStatsMap>(emptyStatsMap);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isExportingFull, setIsExportingFull] = useState(false);

  // Team color theming — reflects the selected level's team colors
  const activeColorTeam = useMemo(() => {
    if (!viewedOrg?.teams) return primaryTeam;
    return viewedOrg.teams[filterLevel] ?? primaryTeam;
  }, [filterLevel, viewedOrg, primaryTeam]);
  const teamColors = useTeamColors(
    activeColorTeam?.color_one ?? undefined,
    activeColorTeam?.color_two ?? undefined,
    activeColorTeam?.color_three ?? undefined,
  );
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  // Reset sort when category changes
  useEffect(() => {
    setSortConfig(null);
  }, [category]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key)
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "desc" };
    });
  }, []);

  const handleOrgChange = useCallback(
    (optValue: string) => {
      setFilterLevel(defaultLevel);
      setSortConfig(null);
      setCategory(Attributes);
      scoutingLoadedForOrg.current = null;
      setScoutingOverlay(new Map());
      setScoutingBudget(null);
      statsCache.current = null;
      if (optValue === ALL_ORGS) {
        setViewedOrgId(ALL_ORGS);
        loadAllOrgPlayers();
      } else {
        const orgId = Number(optValue);
        setViewedOrgId(orgId === userOrg?.id ? null : optValue);
        setIsLoadingOrg(true);
        loadBootstrapForOrg(orgId).then(processBootstrapResult);
      }
    },
    [
      userOrg?.id,
      loadBootstrapForOrg,
      loadAllOrgPlayers,
      processBootstrapResult,
    ],
  );

  // --- Shared scouting refresh helper ---
  const refreshPlayerScouting = useCallback(
    (playerId: number, refreshBudget = true) => {
      if (!playerId || !effectiveOrgId || !leagueYearId) return;
      BaseballService.GetScoutedPlayer(playerId, effectiveOrgId, leagueYearId)
        .then((data) => {
          setScoutingOverlay((prev) => {
            const next = new Map(prev);
            next.set(playerId, {
              letterGrades: data.letter_grades ?? {},
              attributes: data.attributes ?? {},
              potentials: data.potentials ?? {},
              potentialsPrecise: isPotentialsPrecise(data),
              attributesPrecise: isAttributesPrecise(data),
              displayFormat: data.display_format,
            });
            return next;
          });
        })
        .catch(() => {});
      if (refreshBudget) {
        BaseballService.GetScoutingBudget(effectiveOrgId, leagueYearId)
          .then(setScoutingBudget)
          .catch(() => {});
      }
    },
    [effectiveOrgId, leagueYearId],
  );

  // --- Scouting Modal (college + MLB) ---
  const scoutingModal = useModal();
  const [scoutingPlayerId, setScoutingPlayerId] = useState(0);

  const openPlayerModal = (player: Player) => {
    setScoutingPlayerId(player.id);
    scoutingModal.handleOpenModal();
  };

  const handleScoutingModalClose = useCallback(() => {
    scoutingModal.handleCloseModal();
    refreshPlayerScouting(scoutingPlayerId);
  }, [scoutingModal, scoutingPlayerId, refreshPlayerScouting]);

  // --- Contract Demands (for buyout/extend modals) ---
  const [contractDemands, setContractDemands] = useState<Record<number, ContractDemand | null>>({});

  // --- Transaction Modal ---
  const txnModal = useModal();
  const [txnPlayer, setTxnPlayer] = useState<Player | null>(null);
  const [txnAction, setTxnAction] = useState<TransactionAction | null>(null);

  const handleTransactionAction = useCallback(
    (player: Player, action: TransactionAction) => {
      setTxnPlayer(player);
      setTxnAction(action);
      txnModal.handleOpenModal();
    },
    [txnModal],
  );

  const handleTransactionSuccess = useCallback(
    (playerId: number, patch?: TransactionPlayerPatch) => {
      if (patch) {
        // Patch roster locally — no network call needed
        setPageRosterMap((prev) => {
          const updated: Record<string, Player[]> = {};
          for (const [level, players] of Object.entries(prev)) {
            if (patch.current_level === null) {
              // Player released/bought out — remove from all levels
              updated[level] = players.filter((p) => p.id !== playerId);
            } else if (level === patch.current_level) {
              // Player moved to this level — add if not already here, update IR status
              const exists = players.some((p) => p.id === playerId);
              if (exists) {
                updated[level] = players.map((p) =>
                  p.id === playerId
                    ? {
                        ...p,
                        league_level: patch.current_level!,
                        contract: p.contract
                          ? { ...p.contract, on_ir: patch.on_ir }
                          : p.contract,
                      }
                    : p,
                );
              } else {
                // Find the player from another level and move them here
                const allPlayers = Object.values(prev).flat();
                const moving = allPlayers.find((p) => p.id === playerId);
                if (moving) {
                  updated[level] = [
                    ...players,
                    {
                      ...moving,
                      league_level: patch.current_level!,
                      contract: moving.contract
                        ? { ...moving.contract, on_ir: patch.on_ir }
                        : moving.contract,
                    },
                  ];
                } else {
                  updated[level] = players;
                }
              }
            } else {
              // Remove player from levels they're no longer on
              updated[level] = players.filter((p) => p.id !== playerId);
            }
          }
          return updated;
        });
        // Invalidate stats cache since roster changed
        statsCache.current = null;
      } else {
        // No patch data (e.g. extension) — force refresh
        const orgId = viewedOrg?.id ?? userOrg?.id;
        if (orgId) {
          loadBootstrapForOrg(orgId, true).then(processBootstrapResult);
        }
      }
    },
    [viewedOrg, userOrg, loadBootstrapForOrg, processBootstrapResult],
  );

  // --- Scouting Confirmation Modal ---
  const scoutConfirmModal = useModal();
  const [scoutConfirmPlayer, setScoutConfirmPlayer] = useState<Player | null>(
    null,
  );
  const [scoutConfirmAction, setScoutConfirmAction] =
    useState<ScoutingActionType | null>(null);

  const handleScoutingQuickAction = useCallback(
    (player: Player, actionType: ScoutingActionType) => {
      setScoutConfirmPlayer(player);
      setScoutConfirmAction(actionType);
      scoutConfirmModal.handleOpenModal();
    },
    [scoutConfirmModal],
  );

  const handleScoutingConfirmSuccess = useCallback(
    (pointsRemaining?: number) => {
      if (scoutConfirmPlayer) {
        // Refresh player scouting data but skip budget re-fetch — we have it from the response
        refreshPlayerScouting(scoutConfirmPlayer.id, false);
      }
      if (pointsRemaining != null) {
        // Update budget locally from the scouting action response
        setScoutingBudget((prev) =>
          prev ? { ...prev, remaining_points: pointsRemaining } : prev,
        );
      }
    },
    [scoutConfirmPlayer, refreshPlayerScouting],
  );

  // --- Stats fetching (cached per org to avoid re-fetching on category toggle) ---
  useEffect(() => {
    if (category !== Stats || !leagueYearId || isAllView) {
      return;
    }
    const orgId = viewedOrg?.id ?? 0;
    // Return cached stats if we already fetched for this org + season
    if (
      statsCache.current &&
      statsCache.current.orgId === orgId &&
      statsCache.current.lyId === leagueYearId
    ) {
      setPlayerStatsMap(statsCache.current.data);
      return;
    }
    let cancelled = false;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Single org-level call replaces per-team loop
        const [battingRes, pitchingRes] = await Promise.all([
          BaseballService.GetBattingLeaders({
            league_year_id: leagueYearId,
            org_id: orgId,
            min_pa: 0,
            page_size: 500,
          }),
          BaseballService.GetPitchingLeaders({
            league_year_id: leagueYearId,
            org_id: orgId,
            page_size: 500,
          }),
        ]);
        const batting = new Map<number, BattingLeaderRow>();
        const pitching = new Map<number, PitchingLeaderRow>();
        for (const row of battingRes.leaders) batting.set(row.player_id, row);
        for (const row of pitchingRes.leaders) pitching.set(row.player_id, row);
        const map: PlayerStatsMap = { batting, pitching };
        if (!cancelled) {
          statsCache.current = { orgId, lyId: leagueYearId, data: map };
          setPlayerStatsMap(map);
        }
      } catch {
        if (!cancelled) setPlayerStatsMap(emptyStatsMap);
      }
      if (!cancelled) setStatsLoading(false);
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [category, leagueYearId, viewedOrg, isAllView]);

  // --- Actions renderer for roster tables ---
  const isOwnOrg = !isAllView && viewedOrg?.id === userOrg?.id;

  const renderActions = useCallback(
    (p: Player) => (
      <QuickActionButtons
        player={p}
        isOwnOrg={isOwnOrg}
        isCollege={isCollege}
        onTransaction={handleTransactionAction}
        onScouting={handleScoutingQuickAction}
      />
    ),
    [isOwnOrg, isCollege, handleTransactionAction, handleScoutingQuickAction],
  );

  // --- Load contract demands for buyout/extend modals (MLB only) ---
  useEffect(() => {
    if (!isOwnOrg || isCollege || !viewedOrg || !seasonContext) return;
    BaseballService.GetContractOverviewWithDemands(viewedOrg.id, seasonContext.current_league_year_id)
      .then((data) => {
        const map: Record<number, ContractDemand | null> = {};
        for (const p of data) {
          map[p.player_id] = p.demand ?? null;
        }
        setContractDemands(map);
      })
      .catch(() => {});
  }, [isOwnOrg, isCollege, viewedOrg, seasonContext]);

  // --- Position override handler ---
  const handlePositionOverride = useCallback(
    async (playerId: number, positionCode: string | null) => {
      if (!viewedOrg?.teams) return;
      // Find player in pageRosterMap to get their league_level → team_id
      const player = Object.values(pageRosterMap)
        .flat()
        .find((p) => p.id === playerId);
      if (!player) return;
      const team = viewedOrg.teams[player.league_level];
      if (!team) return;
      try {
        let res: ListedPositionResponse;
        if (positionCode) {
          res = await BaseballService.SetListedPosition(
            team.team_id,
            playerId,
            positionCode,
          );
        } else {
          res = await BaseballService.ClearListedPosition(
            team.team_id,
            playerId,
          );
        }
        // Update local state with the response display value
        const newPos = positionCode ? res.display : null;
        setPageRosterMap((prev) => {
          const updated: Record<string, Player[]> = {};
          for (const [key, players] of Object.entries(prev)) {
            updated[key] = players.map((p) =>
              p.id === playerId ? { ...p, listed_position: newPos } : p,
            );
          }
          return updated;
        });
      } catch (e) {
        console.error("Failed to update position", e);
      }
    },
    [viewedOrg, pageRosterMap],
  );

  // --- Derived data ---
  const allPlayers = useMemo(() => {
    let players: Player[];
    if (isAllView) players = allOrgPlayers;
    else if (Object.keys(pageRosterMap).length > 0)
      players = Object.values(pageRosterMap).flat();
    else players = [];
    // Bootstrap data is now visibility-aware (fuzzed by the backend),
    // so players are safe to show immediately. The scouting overlay only
    // upgrades fuzzed → precise after a scouting action.
    return applyScoutingOverlay(players);
  }, [isAllView, allOrgPlayers, pageRosterMap, applyScoutingOverlay]);

  const levelTeams = useMemo(() => {
    if (isAllView || !viewedOrg?.teams) return [];
    const avail = new Set<string>(allPlayers.map((p) => p.league_level));
    const order =
      league === SimCollegeBaseball
        ? Object.keys(viewedOrg.teams)
        : LEVEL_ORDER;
    return order
      .filter((l) => viewedOrg.teams[l] || avail.has(l))
      .map((l) => ({ level: l, team: viewedOrg.teams[l] ?? null }));
  }, [allPlayers, viewedOrg, isAllView, league]);

  const availableLevels = useMemo(() => {
    if (!isAllView) return [];
    const levels = new Set<string>(allPlayers.map((p) => p.league_level));
    if (league === SimCollegeBaseball) return [...levels];
    return LEVEL_ORDER.filter((l) => levels.has(l));
  }, [allPlayers, isAllView, league]);

  const filteredPlayers = useMemo(() => {
    const filtered = allPlayers
      .filter((p) => p.league_level === filterLevel)
      .filter((p) => filterType === "all" || p.ptype === filterType)
      .filter((p) => {
        if (filterInjury === "healthy") return !p.is_injured;
        if (filterInjury === "injured") return p.is_injured === true;
        return true;
      })
      .filter(
        (p) =>
          searchTerm === "" ||
          `${p.firstname} ${p.lastname}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    if (sortConfig)
      return [...filtered].sort((a, b) =>
        comparePlayers(a, b, sortConfig, playerStatsMap),
      );
    const li = (level: string) => {
      const i = LEVEL_ORDER.indexOf(level);
      return i === -1 ? LEVEL_ORDER.length : i;
    };
    return filtered.sort((a, b) => {
      const ld = li(a.league_level) - li(b.league_level);
      if (ld !== 0) return ld;
      if (a.ptype !== b.ptype) return a.ptype === "Pitcher" ? -1 : 1;
      return a.lastname.localeCompare(b.lastname);
    });
  }, [
    allPlayers,
    filterLevel,
    filterType,
    filterInjury,
    searchTerm,
    sortConfig,
    playerStatsMap,
  ]);

  const pageTitle = useMemo(() => {
    if (isAllView) return "All Organizations";
    if (!viewedOrg) return "";
    if (league === SimCollegeBaseball) {
      const t = Object.values(viewedOrg.teams ?? {})[0];
      return t?.team_full_name || viewedOrg.org_abbrev;
    }
    const t = viewedOrg.teams?.["mlb"];
    return t?.team_full_name
      ? `${t.team_full_name} Organization`
      : `${viewedOrg.org_abbrev} Organization`;
  }, [viewedOrg, isAllView, league]);

  const logo = useMemo(() => {
    if (isAllView || !viewedOrg?.teams) return "";
    if (league === SimMLB) {
      const t = viewedOrg.teams["mlb"];
      if (t) return getLogo(SimMLB, t.team_id, currentUser?.IsRetro);
    }
    if (league === SimCollegeBaseball) {
      const es = Object.values(viewedOrg.teams);
      if (es.length > 0)
        return getLogo(SimCollegeBaseball, es[0].team_id, currentUser?.IsRetro);
    }
    return "";
  }, [viewedOrg, isAllView, league, currentUser?.IsRetro]);

  // --- CSV Export ---

  /** "Export View": exports filteredPlayers with columns matching current category. */
  const handleExportView = useCallback(() => {
    if (filteredPlayers.length === 0) return;
    const teamSlug = isAllView ? "all-orgs" : (viewedOrg?.org_abbrev ?? "roster").toLowerCase();

    if (category === "Attributes") {
      const headers = [...INFO_HEADERS, ...ALL_ATTR_HEADERS];
      const rows = filteredPlayers.map((p) => [
        ...playerInfoRow(p),
        ...playerAllAttrRow(p),
      ]);
      exportToCsv(`${teamSlug}-roster-attributes`, headers, rows);

    } else if (category === "Potentials") {
      const headers = [...INFO_HEADERS, ...POT_HEADERS];
      const rows = filteredPlayers.map((p) => [
        ...playerInfoRow(p),
        ...playerPotRow(p),
      ]);
      exportToCsv(`${teamSlug}-roster-potentials`, headers, rows);

    } else if (category === "Contracts") {
      const headers = [...INFO_HEADERS, ...CONTRACT_HEADERS];
      const rows = filteredPlayers.map((p) => [
        ...playerInfoRow(p),
        ...playerContractRow(p),
      ]);
      exportToCsv(`${teamSlug}-roster-contracts`, headers, rows);

    } else if (category === "Stats") {
      if (filterType === "Pitcher") {
        const headers = [...INFO_HEADERS, ...PITCHING_STAT_HEADERS];
        const rows = filteredPlayers.map((p) => [
          ...playerInfoRow(p),
          ...playerPitchingStatsRow(playerStatsMap.pitching.get(p.id)),
        ]);
        exportToCsv(`${teamSlug}-pitching-stats`, headers, rows);
      } else {
        const headers = [...INFO_HEADERS, ...BATTING_STAT_HEADERS];
        const rows = filteredPlayers.map((p) => [
          ...playerInfoRow(p),
          ...playerBattingStatsRow(playerStatsMap.batting.get(p.id)),
        ]);
        exportToCsv(`${teamSlug}-batting-stats`, headers, rows);
      }
    }
  }, [filteredPlayers, category, filterType, playerStatsMap, isAllView, viewedOrg]);

  /** "Export Full Roster": exports allPlayers with all columns combined, fetching stats if needed. */
  const handleExportFull = useCallback(async () => {
    if (isExportingFull) return;
    setIsExportingFull(true);
    try {
      const teamSlug = isAllView ? "all-orgs" : (viewedOrg?.org_abbrev ?? "roster").toLowerCase();

      // Resolve stats map — fetch if not yet loaded (and we have org context)
      let statsMap: PlayerStatsMap = playerStatsMap;
      if (statsMap.batting.size === 0 && statsMap.pitching.size === 0 && !isAllView && leagueYearId && effectiveOrgId) {
        const [battingRes, pitchingRes] = await Promise.all([
          BaseballService.GetBattingLeaders({
            league_year_id: leagueYearId,
            org_id: effectiveOrgId,
            min_pa: 0,
            page_size: 500,
          }),
          BaseballService.GetPitchingLeaders({
            league_year_id: leagueYearId,
            org_id: effectiveOrgId,
            page_size: 500,
          }),
        ]);
        const batting = new Map<number, BattingLeaderRow>();
        const pitching = new Map<number, PitchingLeaderRow>();
        for (const row of battingRes.leaders) batting.set(row.player_id, row);
        for (const row of pitchingRes.leaders) pitching.set(row.player_id, row);
        statsMap = { batting, pitching };
      }

      const rows = allPlayers.map((p) => buildFullExportRow(p, statsMap));
      exportToCsv(`${teamSlug}-full-roster`, FULL_EXPORT_HEADERS, rows);
    } catch (e) {
      console.error("Full roster export failed", e);
    }
    setIsExportingFull(false);
  }, [isExportingFull, isAllView, viewedOrg, allPlayers, playerStatsMap, leagueYearId, effectiveOrgId]);

  const showPitchers = filterType === "Pitcher";
  const showPosition = filterType === "Position";
  const displayOrgAbbrev = isAllView ? "" : (viewedOrg?.org_abbrev ?? "");

  // Logo in org selector dropdown options
  const formatOrgLabel = useCallback(
    (option: SelectOption) => {
      if (option.value === ALL_ORGS) return <span>{option.label}</span>;
      const org = leagueOrgs.find((o) => String(o.id) === option.value);
      if (!org) return <span>{option.label}</span>;
      const team = isCollege
        ? Object.values(org.teams ?? {})[0]
        : org.teams?.["mlb"];
      const logoUrl = team
        ? getLogo(
            league === SimMLB ? SimMLB : SimCollegeBaseball,
            team.team_id,
            currentUser?.IsRetro,
          )
        : "";
      return (
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img
              src={logoUrl}
              className="w-5 h-5 object-contain"
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span>{option.label}</span>
        </div>
      );
    },
    [leagueOrgs, isCollege, league, currentUser?.IsRetro],
  );

  if (!userOrg && !isAllView) {
    return (
      <PageContainer>
        <Text variant="h4">No organization found.</Text>
      </PageContainer>
    );
  }

  // --- Render ---
  return (
    <PageContainer>
      <div className="flex-col w-full md:mb-6 px-2 sm:px-4 md:px-0">
        {/* Team-colored header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{
            backgroundColor: headerColor,
            borderBottom: `3px solid ${borderColor}`,
          }}
        >
          {logo && (
            <img
              src={logo}
              className="w-10 h-10 object-contain"
              alt={viewedOrg?.org_abbrev ?? ""}
            />
          )}
          <Text variant="h4" classes={headerTextClass}>
            {pageTitle}
          </Text>
          <div className="ml-auto">
            <SelectDropdown
              options={orgOptions}
              value={selectedOrgOption}
              onChange={(opt) => {
                if (opt) handleOrgChange((opt as SelectOption).value);
              }}
              isSearchable
              placeholder="Select organization..."
              formatOptionLabel={formatOrgLabel}
              styles={{
                control: (base: any, state: any) => ({
                  ...base,
                  minWidth: "16rem",
                  backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                  borderColor: state.isFocused ? borderColor : "#4A5568",
                }),
              }}
            />
          </div>
        </div>
        <Border
          classes="p-4 mb-2"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {/* Team Level Selector (single org) */}
          {!isAllView && viewedOrg && (
            <div className="mb-4">
              <Text variant="small" classes="font-semibold mb-2">
                Team
              </Text>
              <div className="flex flex-wrap gap-2">
                {levelTeams.map(({ level, team }) => (
                  <TeamSelectorCard
                    key={level}
                    isSelected={filterLevel === level}
                    onClick={() => setFilterLevel(level)}
                    label={
                      team
                        ? displayTeamName(level, team, viewedOrg.org_abbrev)
                        : displayLevel(level)
                    }
                    sublabel={displayLevel(level)}
                    logoSrc={
                      team
                        ? getLogo(
                            league === SimMLB ? SimMLB : SimCollegeBaseball,
                            team.team_id,
                            currentUser?.IsRetro,
                          )
                        : undefined
                    }
                    playerCount={
                      allPlayers.filter((p) => p.league_level === level).length
                    }
                    accentColor={headerColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Level pills (all orgs view) */}
          {isAllView && !isLoadingAll && availableLevels.length > 0 && (
            <div className="mb-3">
              <Text variant="small" classes="font-semibold mb-1">
                Level
              </Text>
              <ButtonGroup>
                {availableLevels.map((lv) => (
                  <PillButton
                    key={lv}
                    variant="primaryOutline"
                    isSelected={filterLevel === lv}
                    onClick={() => setFilterLevel(lv)}
                  >
                    <Text variant="small">{displayLevel(lv)}</Text>
                  </PillButton>
                ))}
              </ButtonGroup>
            </div>
          )}

          {/* Player Type */}
          <div className="mb-3">
            <Text variant="small" classes="font-semibold mb-1">
              Player Type
            </Text>
            <ButtonGroup>
              <PillButton
                variant="primaryOutline"
                isSelected={filterType === "all"}
                onClick={() => setFilterType("all")}
              >
                <Text variant="small">All</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={filterType === "Pitcher"}
                onClick={() => setFilterType("Pitcher")}
              >
                <Text variant="small">Pitcher</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={filterType === "Position"}
                onClick={() => setFilterType("Position")}
              >
                <Text variant="small">Position</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Availability Filter */}
          <div className="mb-3">
            <Text variant="small" classes="font-semibold mb-1">
              Availability
            </Text>
            <ButtonGroup>
              <PillButton
                variant="primaryOutline"
                isSelected={filterInjury === "all"}
                onClick={() => setFilterInjury("all")}
              >
                <Text variant="small">All</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={filterInjury === "healthy"}
                onClick={() => setFilterInjury("healthy")}
              >
                <Text variant="small">Healthy</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={filterInjury === "injured"}
                onClick={() => setFilterInjury("injured")}
              >
                <Text variant="small">Injured</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Category Toggle */}
          <div className="mb-3">
            <Text variant="small" classes="font-semibold mb-1">
              View
            </Text>
            <ButtonGroup>
              <PillButton
                variant="primaryOutline"
                isSelected={category === Attributes}
                onClick={() => setCategory(Attributes)}
              >
                <Text variant="small">Attributes</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={category === Potentials}
                onClick={() => setCategory(Potentials)}
              >
                <Text variant="small">Potentials</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={category === Contracts}
                onClick={() => setCategory(Contracts)}
              >
                <Text variant="small">Contracts</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={category === Stats}
                onClick={() => setCategory(Stats)}
              >
                <Text variant="small">Stats</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Search + Count + Export */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search player..."
              className="text-sm border rounded px-2 py-1 w-48 dark:bg-gray-700 dark:border-gray-600"
            />
            <Text variant="small" classes="text-gray-500 dark:text-gray-400">
              {filteredPlayers.length} players
            </Text>
            {scoutingLoading && (
              <Text variant="small" classes="text-blue-500">
                Loading scouting data...
              </Text>
            )}

            {/* Export buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <PillButton
                variant="primaryOutline"
                onClick={handleExportView}
                disabled={filteredPlayers.length === 0}
              >
                <Text variant="small">↓ Current View</Text>
              </PillButton>
              {!isAllView && (
                <PillButton
                  variant="primaryOutline"
                  onClick={handleExportFull}
                  disabled={isExportingFull || allPlayers.length === 0}
                >
                  <Text variant="small">{isExportingFull ? "Exporting..." : "↓ Full Roster"}</Text>
                </PillButton>
              )}
            </div>

            {scoutingBudget && (
              <Text
                variant="small"
                classes="text-gray-500 dark:text-gray-400"
              >
                Scouting: {scoutingBudget.remaining_points}/
                {scoutingBudget.total_points} pts
              </Text>
            )}
          </div>
        </Border>

        {/* Roster Table */}
        <Border
          classes="p-4"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {isLoadingAll || isLoadingOrg ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">
                {isLoadingAll
                  ? "Loading all organizations..."
                  : "Loading roster..."}
              </Text>
            </div>
          ) : category === Stats && statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">
                Loading stats...
              </Text>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <Text
              variant="body-small"
              classes="text-gray-500 dark:text-gray-400"
            >
              No roster data available.
            </Text>
          ) : showPitchers ? (
            <PitcherTable
              players={filteredPlayers}
              orgAbbrev={displayOrgAbbrev}
              onPlayerClick={openPlayerModal}
              sortConfig={sortConfig}
              onSort={handleSort}
              category={category}
              renderActions={renderActions}
              isCollege={isCollege}
              isFuzzed
              onPositionOverride={isOwnOrg ? handlePositionOverride : undefined}
              playerStatsMap={playerStatsMap}
            />
          ) : showPosition ? (
            <PositionTable
              players={filteredPlayers}
              orgAbbrev={displayOrgAbbrev}
              onPlayerClick={openPlayerModal}
              sortConfig={sortConfig}
              onSort={handleSort}
              category={category}
              renderActions={renderActions}
              isCollege={isCollege}
              isFuzzed
              onPositionOverride={isOwnOrg ? handlePositionOverride : undefined}
              playerStatsMap={playerStatsMap}
            />
          ) : (
            <AllPlayersTable
              players={filteredPlayers}
              orgAbbrev={displayOrgAbbrev}
              onPlayerClick={openPlayerModal}
              sortConfig={sortConfig}
              onSort={handleSort}
              category={category}
              renderActions={renderActions}
              isCollege={isCollege}
              isFuzzed
              onPositionOverride={isOwnOrg ? handlePositionOverride : undefined}
              playerStatsMap={playerStatsMap}
            />
          )}
        </Border>
      </div>

      {txnPlayer && seasonContext && viewedOrg && (
        <BaseballTransactionModal
          isOpen={txnModal.isModalOpen}
          onClose={() => {
            txnModal.handleCloseModal();
            setTxnPlayer(null);
            setTxnAction(null);
          }}
          player={txnPlayer}
          action={txnAction}
          demand={contractDemands[txnPlayer.id] ?? undefined}
          orgId={viewedOrg.id}
          seasonContext={seasonContext}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {scoutConfirmPlayer && scoutConfirmAction && (
        <ScoutingConfirmationModal
          isOpen={scoutConfirmModal.isModalOpen}
          onClose={() => {
            scoutConfirmModal.handleCloseModal();
            setScoutConfirmPlayer(null);
            setScoutConfirmAction(null);
          }}
          player={scoutConfirmPlayer}
          actionType={scoutConfirmAction}
          budget={scoutingBudget}
          orgId={effectiveOrgId}
          leagueYearId={leagueYearId}
          onSuccess={handleScoutingConfirmSuccess}
        />
      )}

      {scoutingPlayerId > 0 && (
        <BaseballScoutingModal
          isOpen={scoutingModal.isModalOpen}
          onClose={handleScoutingModalClose}
          playerId={scoutingPlayerId}
          orgId={effectiveOrgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={() => {
            BaseballService.GetScoutingBudget(effectiveOrgId, leagueYearId)
              .then(setScoutingBudget)
              .catch(() => {});
          }}
          league={league}
        />
      )}
    </PageContainer>
  );
};
