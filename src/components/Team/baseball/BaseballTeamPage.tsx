import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  ScoutingActionType,
  ScoutingBudget,
} from "../../../models/baseball/baseballScoutingModels";

// ═══════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════

const ALL_ORGS = "__all__";
const Stats = "Stats";

// ═══════════════════════════════════════════════
// Quick Action Buttons
// ═══════════════════════════════════════════════

const actionBtn =
  "px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

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
    <div className="flex flex-wrap gap-0.5 items-center">
      {/* Scouting */}
      {!isCollege && (
        <button
          className={`${actionBtn} ${attrsPrecise ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
          onClick={attrsPrecise ? undefined : () => onScouting(player, "pro_attrs_precise")}
          disabled={attrsPrecise}
          title={attrsPrecise ? "Already scouted" : "Scout Precise Attributes"}
        >
          Attrs{attrsPrecise ? " ✓" : ""}
        </button>
      )}
      <button
        className={`${actionBtn} ${potsPrecise ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
        onClick={potsPrecise ? undefined : () => onScouting(player, isCollege ? "college_potential_precise" : "pro_potential_precise")}
        disabled={potsPrecise}
        title={potsPrecise ? "Already scouted" : "Scout Precise Potentials"}
      >
        Pots{potsPrecise ? " ✓" : ""}
      </button>

      {/* Movement — own org only */}
      {isOwnOrg && canMove && (
        <button
          className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`}
          onClick={() => onTransaction(player, "promote")}
          title="Move to Level"
        >
          Move
        </button>
      )}
      {isOwnOrg && hasContract && !onIR && (
        <button
          className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`}
          onClick={() => onTransaction(player, "ir_place")}
          title="Place on IR"
        >
          IR
        </button>
      )}
      {isOwnOrg && hasContract && onIR && (
        <button
          className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`}
          onClick={() => onTransaction(player, "ir_activate")}
          title="Activate from IR"
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
          >
            Rel
          </button>
          <button
            className={`${actionBtn} bg-orange-600/20 text-orange-400 hover:bg-orange-600/40`}
            onClick={() => onTransaction(player, "extend")}
            title="Extend"
          >
            Ext
          </button>
          <button
            className={`${actionBtn} bg-orange-600/20 text-orange-400 hover:bg-orange-600/40`}
            onClick={() => onTransaction(player, "buyout")}
            title="Buyout"
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
    seasonContext,
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

  const fetchScoutingOverlay = useCallback(async (players: Player[], orgId: number, lyId: number) => {
    if (!orgId || !lyId) return;
    setScoutingLoading(true);
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
            const data = await BaseballService.GetScoutedPlayer(p.id, orgId, lyId);
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
      // Update overlay progressively so table starts showing correct data as batches complete
      setScoutingOverlay(new Map(overlay));
    }
    setScoutingLoading(false);
  }, []);

  // Fetch scouting budget for all leagues when org loads
  useEffect(() => {
    if (isAllView || !effectiveOrgId || !leagueYearId) return;
    BaseballService.GetScoutingBudget(effectiveOrgId, leagueYearId)
      .then(setScoutingBudget).catch(() => {});
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
  }, [isCollege, isAllView, effectiveOrgId, leagueYearId, pageRosterMap, fetchScoutingOverlay]);

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

        if (isCollege && !entry) {
          // No scouting data yet — still convert bootstrap 20-80 values to letter grades
          return {
            ...p,
            ratings: convertRatingsToGrades(p.ratings),
          };
        }

        if (!entry) return p;
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
          for (const [key, val] of Object.entries(entry.attributes)) {
            const displayKey = `${key}_display` as keyof PlayerRatings;
            if (displayKey in newRatings) {
              (newRatings as any)[displayKey] = val;
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
    try {
      const results = await Promise.all(
        leagueOrgs.map((org) =>
          BaseballService.GetBootstrapLandingData(org.id),
        ),
      );
      setAllOrgPlayers(
        results.flatMap((d) => {
          if (!d.RosterMap) return [];
          return Object.values(d.RosterMap).flat().map(normalizePlayer);
        }),
      );
      // Capture allTeams from first result for consistent dropdown data
      const firstWithTeams = results.find((d) => d.AllTeams?.length > 0);
      if (firstWithTeams) setPageAllTeams(firstWithTeams.AllTeams);
    } catch (e) {
      console.error("Failed to load all org players", e);
    }
    setIsLoadingAll(false);
  }, [leagueOrgs]);

  // --- Filters & category ---
  const [filterLevel, setFilterLevel] = useState<string>(
    league === SimMLB ? "mlb" : "all",
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<BaseballCategory>(Attributes);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // --- Stats data for roster table ---
  const [playerStatsMap, setPlayerStatsMap] = useState<PlayerStatsMap>(
    new Map(),
  );
  const [statsLoading, setStatsLoading] = useState(false);

  // Team color theming — reflects the selected level's team colors
  const activeColorTeam = useMemo(() => {
    if (filterLevel === "all" || !viewedOrg?.teams) return primaryTeam;
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

  const handleOrgChange = useCallback((optValue: string) => {
    setFilterLevel("all");
    setSortConfig(null);
    setCategory(Attributes);
    scoutingLoadedForOrg.current = null;
    setScoutingOverlay(new Map());
    setScoutingBudget(null);
    if (optValue === ALL_ORGS) {
      setViewedOrgId(ALL_ORGS);
      loadAllOrgPlayers();
    } else {
      const orgId = Number(optValue);
      setViewedOrgId(orgId === userOrg?.id ? null : optValue);
      setIsLoadingOrg(true);
      loadBootstrapForOrg(orgId).then(processBootstrapResult);
    }
  }, [userOrg?.id, loadBootstrapForOrg, loadAllOrgPlayers, processBootstrapResult]);

  // --- Scouting Modal (college + MLB) ---
  const scoutingModal = useModal();
  const [scoutingPlayerId, setScoutingPlayerId] = useState(0);

  const openPlayerModal = (player: Player) => {
    setScoutingPlayerId(player.id);
    scoutingModal.handleOpenModal();
  };

  const handleScoutingModalClose = useCallback(() => {
    scoutingModal.handleCloseModal();
    if (scoutingPlayerId > 0 && effectiveOrgId && leagueYearId) {
      // Refresh scouting overlay for this player (works for both college + MLB)
      BaseballService.GetScoutedPlayer(scoutingPlayerId, effectiveOrgId, leagueYearId)
        .then((data) => {
          setScoutingOverlay((prev) => {
            const next = new Map(prev);
            next.set(scoutingPlayerId, {
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
      BaseballService.GetScoutingBudget(effectiveOrgId, leagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
  }, [scoutingModal, scoutingPlayerId, effectiveOrgId, leagueYearId]);

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

  const handleTransactionSuccess = useCallback(() => {
    const orgId = viewedOrg?.id ?? userOrg?.id;
    if (orgId) loadBootstrapForOrg(orgId).then(processBootstrapResult);
  }, [viewedOrg, userOrg, loadBootstrapForOrg, processBootstrapResult]);

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

  const handleScoutingConfirmSuccess = useCallback(() => {
    // Refresh scouting budget
    if (effectiveOrgId && leagueYearId) {
      BaseballService.GetScoutingBudget(effectiveOrgId, leagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
    // Refresh scouting overlay for the scouted player
    if (scoutConfirmPlayer && effectiveOrgId && leagueYearId) {
      BaseballService.GetScoutedPlayer(scoutConfirmPlayer.id, effectiveOrgId, leagueYearId)
        .then((data) => {
          setScoutingOverlay((prev) => {
            const next = new Map(prev);
            next.set(scoutConfirmPlayer.id, {
              letterGrades: data.letter_grades ?? {},
              attributes: data.attributes ?? {},
              potentials: data.potentials ?? {},
              potentialsPrecise: isPotentialsPrecise(data),
              attributesPrecise: isAttributesPrecise(data),
              displayFormat: data.display_format,
            });
            return next;
          });
        }).catch(() => {});
    }
  }, [effectiveOrgId, leagueYearId, scoutConfirmPlayer]);

  // --- Stats fetching ---
  useEffect(() => {
    if (category !== Stats || !leagueYearId || isAllView) {
      setPlayerStatsMap(new Map());
      return;
    }
    let cancelled = false;
    const fetchStats = async () => {
      setStatsLoading(true);
      const map: PlayerStatsMap = new Map();
      try {
        // Fetch batting + pitching leaders for all teams in this org
        const teamIds = viewedOrg?.teams
          ? Object.values(viewedOrg.teams).map((t) => t.team_id)
          : [];
        const fetches = teamIds.flatMap((tid) => [
          BaseballService.GetBattingLeaders({
            league_year_id: leagueYearId,
            team_id: tid,
            page_size: 200,
          })
            .then((res) => {
              for (const row of res.leaders) map.set(row.player_id, row);
            })
            .catch(() => {}),
          BaseballService.GetPitchingLeaders({
            league_year_id: leagueYearId,
            team_id: tid,
            page_size: 200,
          })
            .then((res) => {
              for (const row of res.leaders) map.set(row.player_id, row);
            })
            .catch(() => {}),
        ]);
        await Promise.all(fetches);
        if (!cancelled) setPlayerStatsMap(map);
      } catch {
        if (!cancelled) setPlayerStatsMap(new Map());
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
    const overlaid = applyScoutingOverlay(players);
    // While scouting is loading, only show players whose overlay data has arrived
    // to prevent briefly exposing raw bootstrap values (precise/unfuzzed for MLB,
    // numeric 20-80 for college). Once loading completes, show all players.
    if (scoutingLoading && !isAllView) {
      return overlaid.filter((p) => scoutingOverlay.has(p.id));
    }
    return overlaid;
  }, [isAllView, allOrgPlayers, pageRosterMap, applyScoutingOverlay, scoutingLoading, scoutingOverlay]);

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
      .filter((p) => filterLevel === "all" || p.league_level === filterLevel)
      .filter((p) => filterType === "all" || p.ptype === filterType)
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
      if (t) return getLogo(SimMLB, t.team_id, currentUser?.isRetro);
    }
    if (league === SimCollegeBaseball) {
      const es = Object.values(viewedOrg.teams);
      if (es.length > 0)
        return getLogo(SimCollegeBaseball, es[0].team_id, currentUser?.isRetro);
    }
    return "";
  }, [viewedOrg, isAllView, league, currentUser?.isRetro]);

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
            currentUser?.isRetro,
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
    [leagueOrgs, isCollege, league, currentUser?.isRetro],
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
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
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
                <TeamSelectorCard
                  isSelected={filterLevel === "all"}
                  onClick={() => setFilterLevel("all")}
                  label="All Teams"
                  sublabel={`${allPlayers.length} players`}
                  accentColor={headerColor}
                />
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
                            currentUser?.isRetro,
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
                <PillButton
                  variant="primaryOutline"
                  isSelected={filterLevel === "all"}
                  onClick={() => setFilterLevel("all")}
                >
                  <Text variant="small">All</Text>
                </PillButton>
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

          {/* Search + Count */}
          <div className="flex items-center gap-3">
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
            {scoutingBudget && (
              <Text
                variant="small"
                classes="text-gray-500 dark:text-gray-400 ml-auto"
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
