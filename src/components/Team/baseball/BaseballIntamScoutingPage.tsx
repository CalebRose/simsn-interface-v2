import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { SimMLB } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import {
  IntamPoolResponse,
  IntamSigning,
  PoolPlayer,
  ScoutingBudget,
} from "../../../models/baseball/baseballScoutingModels";
import { BoardPlayer } from "../../../models/baseball/baseballRecruitingModels";
import { usePoolTable } from "./BaseballScouting/usePoolTable";
import { PoolPagination } from "./BaseballScouting/PoolPagination";
import { ScoutingBudgetBar } from "./BaseballScouting/ScoutingBudgetBar";
import { ScoutingDepartmentPanel } from "./BaseballScouting/ScoutingDepartmentPanel";
import { PlayerModal } from "./PlayerModal";
import { BaseballSigningModal } from "./BaseballScouting/BaseballSigningModal";
import {
  type ColumnGroup,
  GroupedTableHeader,
  PotentialCell,
} from "./BaseballRosterTable";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { useSnackbar } from "notistack";
import "./baseballMobile.css";

// ═══════════════════════════════════════════════
// Scouted potentials cache
// ═══════════════════════════════════════════════

interface ScoutedEntry {
  potentials: Record<string, string | null>;
  fuzzed: boolean;
}

// ═══════════════════════════════════════════════
// INTAM-specific column groups (pool API sort keys)
// ═══════════════════════════════════════════════

const INTAM_POS_GROUPS: ColumnGroup[] = [
  {
    groupLabel: "",
    columns: [
      { label: "", sortKey: "" },
      { label: "Name", sortKey: "lastname" },
      { label: "Age", sortKey: "age" },
      { label: "Area", sortKey: "area" },
      { label: "B/T", sortKey: "" },
    ],
  },
  {
    groupLabel: "Potentials",
    columns: [
      { label: "Contact", sortKey: "contact_pot" },
      { label: "Power", sortKey: "power_pot" },
      { label: "Eye", sortKey: "eye_pot" },
      { label: "Disc", sortKey: "discipline_pot" },
      { label: "Speed", sortKey: "speed_pot" },
      { label: "BaseRun", sortKey: "baserunning_pot" },
      { label: "FldCatch", sortKey: "fieldcatch_pot" },
      { label: "FldReact", sortKey: "fieldreact_pot" },
      { label: "ThrowAcc", sortKey: "throwacc_pot" },
      { label: "ThrowPow", sortKey: "throwpower_pot" },
    ],
  },
  {
    groupLabel: "Batting Stats",
    columns: [
      { label: "AVG", sortKey: "batting_avg" },
      { label: "OBP", sortKey: "batting_obp" },
      { label: "SLG", sortKey: "batting_slg" },
      { label: "HR", sortKey: "batting_hr" },
      { label: "RBI", sortKey: "batting_rbi" },
      { label: "R", sortKey: "batting_runs" },
      { label: "SB", sortKey: "batting_sb" },
      { label: "SO", sortKey: "batting_so" },
    ],
  },
  {
    groupLabel: "Fielding Stats",
    columns: [
      { label: "FLD%", sortKey: "fielding_fpct" },
      { label: "PO", sortKey: "fielding_po" },
      { label: "A", sortKey: "fielding_a" },
      { label: "E", sortKey: "fielding_errors" },
    ],
  },
];

const INTAM_PITCH_GROUPS: ColumnGroup[] = [
  {
    groupLabel: "",
    columns: [
      { label: "", sortKey: "" },
      { label: "Name", sortKey: "lastname" },
      { label: "Age", sortKey: "age" },
      { label: "Area", sortKey: "area" },
      { label: "Throw", sortKey: "" },
    ],
  },
  {
    groupLabel: "Potentials",
    columns: [
      { label: "Endurance", sortKey: "pendurance_pot" },
      { label: "Control", sortKey: "pgencontrol_pot" },
      { label: "Velocity", sortKey: "pthrowpower_pot" },
      { label: "Sequence", sortKey: "psequencing_pot" },
    ],
  },
  {
    groupLabel: "Pitching Stats",
    columns: [
      { label: "ERA", sortKey: "pitching_era" },
      { label: "K/9", sortKey: "pitching_k9" },
      { label: "BB/9", sortKey: "pitching_bb9" },
      { label: "WHIP", sortKey: "pitching_whip" },
      { label: "W", sortKey: "pitching_wins" },
      { label: "SO", sortKey: "pitching_so" },
      { label: "IP", sortKey: "pitching_ip" },
    ],
  },
  {
    groupLabel: "Fielding Stats",
    columns: [
      { label: "FLD%", sortKey: "fielding_fpct" },
      { label: "PO", sortKey: "fielding_po" },
      { label: "A", sortKey: "fielding_a" },
      { label: "E", sortKey: "fielding_errors" },
    ],
  },
];

// ═══════════════════════════════════════════════
// Small display components
// ═══════════════════════════════════════════════

const cell = "px-2 py-1.5";

const StatNum = ({
  value,
  decimals = 3,
}: {
  value: any;
  decimals?: number;
}) => {
  if (value == null)
    return <td className={`${cell} text-center text-gray-400`}>—</td>;
  return (
    <td className={`${cell} text-center`}>{Number(value).toFixed(decimals)}</td>
  );
};

// ═══════════════════════════════════════════════
// Tabs
// ═══════════════════════════════════════════════

type Tab = "pool" | "board" | "signings";

// ═══════════════════════════════════════════════
// Main page component
// ═══════════════════════════════════════════════

interface BaseballIntamScoutingPageProps {
  league: string;
}

export const BaseballIntamScoutingPage = (
  _props: BaseballIntamScoutingPageProps,
) => {
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuthStore();
  const { mlbOrganization, seasonContext } = useSimBaseballStore();
  const orgId = mlbOrganization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  const [activeTab, setActiveTab] = useState<Tab>("pool");

  // ── Team colors ──
  const primaryTeam = useMemo(() => {
    if (!mlbOrganization?.teams) return null;
    return Object.values(mlbOrganization.teams)[0] ?? null;
  }, [mlbOrganization]);

  const teamColors = useTeamColors(
    primaryTeam?.color_one ?? undefined,
    primaryTeam?.color_two ?? undefined,
    primaryTeam?.color_three ?? undefined,
  );
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  const logo = useMemo(() => {
    if (!primaryTeam) return "";
    return getLogo(SimMLB, primaryTeam.team_id, currentUser?.IsRetro);
  }, [primaryTeam, currentUser?.IsRetro]);

  const pageTitle = useMemo(() => {
    if (!primaryTeam) return "International Scouting";
    return `${primaryTeam.team_full_name} International Scouting`;
  }, [primaryTeam]);

  // ── Server-side pool table ──
  const fetcher = useCallback(
    (params: Record<string, any>) =>
      BaseballService.GetIntamPool({
        ...params,
        viewing_org_id: orgId,
      }) as Promise<IntamPoolResponse>,
    [orgId],
  );
  const pool = usePoolTable<PoolPlayer, IntamPoolResponse>(fetcher, {
    defaultSort: "lastname",
    defaultDir: "asc",
    defaultPerPage: 50,
  });

  // Default to Position filter on first load
  useEffect(() => {
    if (!pool.filters.ptype) pool.setFilter("ptype", "Position");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pool sort config for GroupedTableHeader ──
  const poolSortConfig = useMemo(
    () => ({ key: pool.sortKey, dir: pool.sortDir }) as const,
    [pool.sortKey, pool.sortDir],
  );

  const handlePoolSort = useCallback(
    (key: string) => pool.setSort(key),
    [pool.setSort],
  );

  // ── Filter state ──
  const filterType = pool.filters.ptype ?? "Position";
  const showPitchers = filterType === "Pitcher";
  const poolColumnGroups = showPitchers ? INTAM_PITCH_GROUPS : INTAM_POS_GROUPS;

  // ── Scouting budget ──
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(
    null,
  );

  // ── Scouting Modal ──
  const scoutingModal = useModal();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0);

  const openScoutingModal = (playerId: number) => {
    setSelectedPlayerId(playerId);
    scoutingModal.handleOpenModal();
  };

  // ── Signing Modal ──
  const signingModal = useModal();
  const [signingPlayerName, setSigningPlayerName] = useState("");

  const handleOpenSigning = () => {
    const p = pool.data.find((pl) => pl.id === selectedPlayerId);
    if (p) setSigningPlayerName(`${p.firstname} ${p.lastname}`);
    signingModal.handleOpenModal();
  };

  const handleSigningSuccess = () => {
    signingModal.handleCloseModal();
    scoutingModal.handleCloseModal();
    pool.refresh();
    setBudgetRefreshKey((k) => k + 1);
  };

  // ── Board data ──
  const [boardPlayers, setBoardPlayers] = useState<BoardPlayer[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardPlayerIds, setBoardPlayerIds] = useState<Set<number>>(new Set());

  const loadBoard = useCallback(() => {
    if (!orgId || !leagueYearId) return;
    setBoardLoading(true);
    BaseballService.GetIntamBoard(orgId, leagueYearId)
      .then((r) => {
        setBoardPlayers(r.players ?? []);
        setBoardPlayerIds(new Set((r.players ?? []).filter(bp => bp.on_board).map(bp => bp.player_id)));
      })
      .catch((err) => {
        console.error("[IntamBoard] fetch failed:", err);
        setBoardPlayers([]);
        setBoardPlayerIds(new Set());
      })
      .finally(() => setBoardLoading(false));
  }, [orgId, leagueYearId]);

  // Load board IDs on mount so pool tab can show board status
  useEffect(() => {
    if (orgId && leagueYearId) loadBoard();
  }, [orgId, leagueYearId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "board") loadBoard();
  }, [activeTab, loadBoard]);

  const handleAddToBoard = useCallback(
    async (playerId: number) => {
      try {
        await BaseballService.AddToIntamBoard({
          org_id: orgId,
          league_year_id: leagueYearId,
          player_id: playerId,
        });
        setBoardPlayerIds((prev) => new Set(prev).add(playerId));
        loadBoard();
        enqueueSnackbar("Added to board", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } catch (err: any) {
        enqueueSnackbar(err?.message || "Failed to add to board", {
          variant: "error",
        });
      }
    },
    [orgId, leagueYearId, loadBoard, enqueueSnackbar],
  );

  const handleRemoveFromBoard = useCallback(
    async (playerId: number) => {
      try {
        await BaseballService.RemoveFromIntamBoard({
          org_id: orgId,
          league_year_id: leagueYearId,
          player_id: playerId,
        });
        setBoardPlayerIds((prev) => {
          const next = new Set(prev);
          next.delete(playerId);
          return next;
        });
        setBoardPlayers((prev) => prev.filter((p) => p.player_id !== playerId));
        enqueueSnackbar("Removed from board", {
          variant: "info",
          autoHideDuration: 2000,
        });
      } catch (err: any) {
        enqueueSnackbar(err?.message || "Failed to remove from board", {
          variant: "error",
        });
      }
    },
    [orgId, leagueYearId, enqueueSnackbar],
  );

  // ── Scouted potentials cache ──
  const [scoutedCache, setScoutedCache] = useState<Map<number, ScoutedEntry>>(
    new Map(),
  );
  const cacheLoadedRef = useRef(false);

  const cachePlayerScouting = useCallback(
    (playerId: number) => {
      if (!orgId || !leagueYearId) return;
      BaseballService.GetScoutedPlayer(playerId, orgId, leagueYearId)
        .then((data) => {
          if (
            data.potentials &&
            Object.values(data.potentials).some((v) => v != null && v !== "?")
          ) {
            const preciseUnlocked =
              data.visibility_context?.potentials_precise ||
              data.visibility?.unlocked?.includes("pro_potential_precise");
            const fuzzed = !preciseUnlocked;
            setScoutedCache((prev) => {
              const next = new Map(prev);
              next.set(playerId, { potentials: data.potentials!, fuzzed });
              return next;
            });
          }
        })
        .catch(() => {});
    },
    [orgId, leagueYearId],
  );

  // Pre-populate cache for board players on load
  useEffect(() => {
    if (
      !orgId ||
      !leagueYearId ||
      boardPlayerIds.size === 0 ||
      cacheLoadedRef.current
    )
      return;
    cacheLoadedRef.current = true;
    boardPlayerIds.forEach((pid) => cachePlayerScouting(pid));
  }, [orgId, leagueYearId, boardPlayerIds, cachePlayerScouting]);

  // Refresh cache for current player when modal closes
  const handleScoutingModalClose = useCallback(() => {
    scoutingModal.handleCloseModal();
    if (selectedPlayerId > 0) {
      cachePlayerScouting(selectedPlayerId);
    }
    setBudgetRefreshKey((k) => k + 1);
  }, [scoutingModal, selectedPlayerId, cachePlayerScouting]);

  // ── Signings data ──
  const [signings, setSignings] = useState<IntamSigning[]>([]);
  const [signingsPage, setSigningsPage] = useState(1);
  const [signingsTotalPages, setSigningsTotalPages] = useState(0);
  const [signingsLoading, setSigningsLoading] = useState(false);

  const loadSignings = useCallback(() => {
    if (!leagueYearId) return;
    setSigningsLoading(true);
    BaseballService.GetIntamSignings({
      league_year_id: leagueYearId,
      page: signingsPage,
      per_page: 50,
    })
      .then((r) => {
        setSignings(r.signings);
        setSigningsTotalPages(r.total_pages);
      })
      .catch(() => setSignings([]))
      .finally(() => setSigningsLoading(false));
  }, [leagueYearId, signingsPage]);

  useEffect(() => {
    if (activeTab === "signings") loadSignings();
  }, [activeTab, loadSignings]);

  const orgAbbrev = mlbOrganization?.org_abbrev ?? "";

  const th = "px-2 py-1 text-xs font-semibold text-left whitespace-nowrap";
  const td = "px-2 py-1";

  if (!mlbOrganization) {
    return (
      <PageContainer>
        <Text variant="h4">No organization found.</Text>
      </PageContainer>
    );
  }

  // ── Pool row helpers ──

  const getPot = (
    pp: PoolPlayer,
    key: string,
  ): { pot: string | null; fuzzed: boolean } => {
    const cached = scoutedCache.get(pp.id);
    if (cached) {
      const val = cached.potentials[key] ?? null;
      if (val && val !== "?") return { pot: val, fuzzed: cached.fuzzed };
    }
    return { pot: pp[key] ?? null, fuzzed: false };
  };

  const renderPosRow = (pp: PoolPlayer) => {
    const onBoard = boardPlayerIds.has(pp.id);
    return (
      <tr
        key={pp.id}
        className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        onClick={() => openScoutingModal(pp.id)}
      >
        <td
          className={`${cell} text-center`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
              onBoard
                ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
            title={onBoard ? "Remove from board" : "Add to board"}
            onClick={() =>
              onBoard ? handleRemoveFromBoard(pp.id) : handleAddToBoard(pp.id)
            }
          >
            {onBoard ? "★" : "+"}
          </button>
        </td>
        <td
          className={`${cell} font-medium whitespace-nowrap sticky left-[2.5rem] bg-white dark:bg-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}
        >
          {pp.firstname} {pp.lastname}
        </td>
        <td className={`${cell} text-center`}>{pp.age}</td>
        <td className={`${cell} text-center`}>{pp.area}</td>
        <td className={`${cell} text-center`}>
          {pp.bat_hand}/{pp.pitch_hand}
        </td>
        {(() => {
          const p = getPot(pp, "contact_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "power_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "eye_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "discipline_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "speed_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "baserunning_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "fieldcatch_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "fieldreact_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "throwacc_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "throwpower_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        <StatNum value={pp.generated_stats?.batting?.avg} decimals={3} />
        <StatNum value={pp.generated_stats?.batting?.obp} decimals={3} />
        <StatNum value={pp.generated_stats?.batting?.slg} decimals={3} />
        <StatNum value={pp.generated_stats?.batting?.home_runs} decimals={0} />
        <StatNum value={pp.generated_stats?.batting?.rbi} decimals={0} />
        <StatNum value={pp.generated_stats?.batting?.runs} decimals={0} />
        <StatNum
          value={pp.generated_stats?.batting?.stolen_bases}
          decimals={0}
        />
        <StatNum value={pp.generated_stats?.batting?.strikeouts} decimals={0} />
        <StatNum
          value={pp.generated_stats?.fielding?.fielding_pct}
          decimals={3}
        />
        <StatNum value={pp.generated_stats?.fielding?.putouts} decimals={0} />
        <StatNum value={pp.generated_stats?.fielding?.assists} decimals={0} />
        <StatNum value={pp.generated_stats?.fielding?.errors} decimals={0} />
      </tr>
    );
  };

  const renderPitchRow = (pp: PoolPlayer) => {
    const onBoard = boardPlayerIds.has(pp.id);
    return (
      <tr
        key={pp.id}
        className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        onClick={() => openScoutingModal(pp.id)}
      >
        <td
          className={`${cell} text-center`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
              onBoard
                ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
            title={onBoard ? "Remove from board" : "Add to board"}
            onClick={() =>
              onBoard ? handleRemoveFromBoard(pp.id) : handleAddToBoard(pp.id)
            }
          >
            {onBoard ? "★" : "+"}
          </button>
        </td>
        <td
          className={`${cell} font-medium whitespace-nowrap sticky left-[2.5rem] bg-white dark:bg-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}
        >
          {pp.firstname} {pp.lastname}
        </td>
        <td className={`${cell} text-center`}>{pp.age}</td>
        <td className={`${cell} text-center`}>{pp.area}</td>
        <td className={`${cell} text-center`}>{pp.pitch_hand}</td>
        {(() => {
          const p = getPot(pp, "pendurance_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "pgencontrol_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "pthrowpower_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        {(() => {
          const p = getPot(pp, "psequencing_pot");
          return <PotentialCell pot={p.pot} isFuzzed={p.fuzzed} />;
        })()}
        <StatNum value={pp.generated_stats?.pitching?.era} decimals={2} />
        <StatNum value={pp.generated_stats?.pitching?.k_per_9} decimals={1} />
        <StatNum value={pp.generated_stats?.pitching?.bb_per_9} decimals={1} />
        <StatNum value={pp.generated_stats?.pitching?.whip} decimals={2} />
        <StatNum value={pp.generated_stats?.pitching?.wins} decimals={0} />
        <StatNum
          value={pp.generated_stats?.pitching?.strikeouts}
          decimals={0}
        />
        <StatNum
          value={pp.generated_stats?.pitching?.innings_pitched}
          decimals={1}
        />
        <StatNum
          value={pp.generated_stats?.fielding?.fielding_pct}
          decimals={3}
        />
        <StatNum value={pp.generated_stats?.fielding?.putouts} decimals={0} />
        <StatNum value={pp.generated_stats?.fielding?.assists} decimals={0} />
        <StatNum value={pp.generated_stats?.fielding?.errors} decimals={0} />
      </tr>
    );
  };

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
              alt={orgAbbrev}
            />
          )}
          <Text variant="h4" classes={headerTextClass}>
            {pageTitle}
          </Text>
          <div className="ml-auto">
            {orgId > 0 && leagueYearId > 0 && (
              <ScoutingBudgetBar
                orgId={orgId}
                leagueYearId={leagueYearId}
                onBudgetLoaded={setScoutingBudget}
                refreshKey={budgetRefreshKey}
              />
            )}
          </div>
        </div>

        {/* Scouting Department Expansion */}
        {orgId > 0 && leagueYearId > 0 && (
          <div className="mb-2">
            <ScoutingDepartmentPanel
              orgId={orgId}
              leagueYearId={leagueYearId}
              budget={scoutingBudget}
              refreshKey={budgetRefreshKey}
              onPurchased={() => setBudgetRefreshKey((k) => k + 1)}
            />
          </div>
        )}

        {/* Tab Selector + Filters */}
        <Border
          classes="p-4 mb-2"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          <div className="mb-4">
            <ButtonGroup>
              <PillButton
                variant="primaryOutline"
                isSelected={activeTab === "pool"}
                onClick={() => setActiveTab("pool")}
              >
                <Text variant="small">Scouting Pool</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={activeTab === "board"}
                onClick={() => setActiveTab("board")}
              >
                <Text variant="small">My Board</Text>
              </PillButton>
              <PillButton
                variant="primaryOutline"
                isSelected={activeTab === "signings"}
                onClick={() => setActiveTab("signings")}
              >
                <Text variant="small">Signings</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Pool tab filters */}
          {activeTab === "pool" && (
            <>
              {/* Player Type */}
              <div className="mb-3">
                <Text variant="small" classes="font-semibold mb-1">
                  Player Type
                </Text>
                <ButtonGroup>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={pool.filters.ptype === "Position"}
                    onClick={() => pool.setFilter("ptype", "Position")}
                  >
                    <Text variant="small">Position</Text>
                  </PillButton>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={pool.filters.ptype === "Pitcher"}
                    onClick={() => pool.setFilter("ptype", "Pitcher")}
                  >
                    <Text variant="small">Pitcher</Text>
                  </PillButton>
                </ButtonGroup>
              </div>

              {/* Search + Area + Count */}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  value={pool.search}
                  onChange={(e) => pool.setSearch(e.target.value)}
                  placeholder="Search player..."
                  className="text-sm border rounded px-2 py-1 w-48 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={pool.filters.area ?? ""}
                  onChange={(e) =>
                    pool.setFilter("area", e.target.value || undefined)
                  }
                  placeholder="Filter by area..."
                  className="text-sm border rounded px-2 py-1 w-40 dark:bg-gray-700 dark:border-gray-600"
                />
                <Text
                  variant="small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  {pool.totalCount} players
                </Text>
              </div>
            </>
          )}
        </Border>

        {/* Content Area */}
        <Border
          classes="p-4"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {/* ── Pool Tab ── */}
          {activeTab === "pool" && (
            <>
              {pool.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Text
                    variant="body"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    Loading players...
                  </Text>
                </div>
              ) : pool.error ? (
                <div className="flex items-center justify-center py-12">
                  <Text
                    variant="body"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    INTAM scouting data is not yet available.
                  </Text>
                </div>
              ) : pool.data.length === 0 ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  No players found.
                </Text>
              ) : (
                <>
                  <div className="baseball-table-wrapper overflow-x-auto max-h-[70vh] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <GroupedTableHeader
                        groups={poolColumnGroups}
                        sortConfig={poolSortConfig}
                        onSort={handlePoolSort}
                      />
                      <tbody>
                        {pool.data.map((pp) =>
                          showPitchers ? renderPitchRow(pp) : renderPosRow(pp),
                        )}
                      </tbody>
                    </table>
                  </div>
                  <PoolPagination
                    page={pool.page}
                    totalPages={pool.totalPages}
                    onPageChange={pool.setPage}
                  />
                </>
              )}
            </>
          )}

          {/* ── Board Tab ── */}
          {activeTab === "board" && (
            <>
              {boardLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Text
                    variant="body"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    Loading board...
                  </Text>
                </div>
              ) : boardPlayers.length === 0 ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  No players on your board yet. Scout players from the Scouting
                  Pool tab to add them.
                </Text>
              ) : (
                <div className="baseball-table-wrapper overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <th className={th}></th>
                        <th className={th}>Name</th>
                        <th className={th}>Type</th>
                        <th className={th}>Area</th>
                        <th className={th}>Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boardPlayers.map((bp) => (
                        <tr
                          key={bp.player_id}
                          className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer"
                          onClick={() => openScoutingModal(bp.player_id)}
                        >
                          <td
                            className={td}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-6 h-6 rounded text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                              title="Remove from board"
                              onClick={() =>
                                handleRemoveFromBoard(bp.player_id)
                              }
                            >
                              ✕
                            </button>
                          </td>
                          <td className={`${td} font-medium`}>
                            {bp.player_name}
                          </td>
                          <td className={td}>
                            {bp.ptype === "Pitcher" ? "P" : "Pos"}
                          </td>
                          <td className={td}>{(bp as any).area ?? "—"}</td>
                          <td className={td}>{(bp as any).age ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── Signings Tab ── */}
          {activeTab === "signings" && (
            <>
              {signingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Text
                    variant="body"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    Loading signings...
                  </Text>
                </div>
              ) : signings.length === 0 ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  No signings yet.
                </Text>
              ) : (
                <>
                  <div className="baseball-table-wrapper overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-50 dark:bg-gray-700">
                          <th className={th}>Player</th>
                          <th className={th}>Org</th>
                          <th className={th}>Type</th>
                          <th className={th}>Age</th>
                          <th className={th}>Years</th>
                          <th className={th}>Bonus</th>
                          <th className={th}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {signings.map((s) => (
                          <tr
                            key={s.player_id}
                            className="border-b border-gray-800 hover:bg-gray-700/30"
                          >
                            <td className={`${td} font-medium`}>
                              {s.player_name}
                            </td>
                            <td className={td}>{s.org_abbrev}</td>
                            <td className={td}>
                              {s.ptype === "Pitcher" ? "P" : "Pos"}
                            </td>
                            <td className={td}>{s.age}</td>
                            <td className={td}>{s.contract_years}</td>
                            <td className={td}>
                              ${(s.contract_bonus / 1_000_000).toFixed(2)}M
                            </td>
                            <td className={td}>{s.signed_date ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PoolPagination
                    page={signingsPage}
                    totalPages={signingsTotalPages}
                    onPageChange={setSigningsPage}
                  />
                </>
              )}
            </>
          )}
        </Border>
      </div>

      {/* Scouting Modal */}
      {selectedPlayerId > 0 && (
        <PlayerModal
          isOpen={scoutingModal.isModalOpen}
          onClose={handleScoutingModalClose}
          playerId={selectedPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={() => setBudgetRefreshKey((k) => k + 1)}
          league="SimMLB"
          context="scouting"
        />
      )}

      {/* Signing Modal */}
      <BaseballSigningModal
        isOpen={signingModal.isModalOpen}
        onClose={signingModal.handleCloseModal}
        playerId={selectedPlayerId}
        playerName={signingPlayerName}
        poolType="intam"
        orgId={orgId}
        seasonContext={seasonContext}
        onSuccess={handleSigningSuccess}
      />
    </PageContainer>
  );
};
