import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { SimCollegeBaseball } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import {
  CollegePoolResponse,
  PoolPlayer,
  ScoutingBudget,
} from "../../../models/baseball/baseballScoutingModels";
import { usePoolTable } from "./BaseballScouting/usePoolTable";
import { PoolPagination } from "./BaseballScouting/PoolPagination";
import { ScoutingBudgetBar } from "./BaseballScouting/ScoutingBudgetBar";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import {
  type ColumnGroup,
  GroupedTableHeader,
  PotentialCell,
} from "./BaseballRosterTable";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import type {
  RecruitingState,
  BoardPlayer,
  Commitment,
  InvestmentStateResponse,
} from "../../../models/baseball/baseballRecruitingModels";
import { useSnackbar } from "notistack";
import "./baseballMobile.css";

// ═══════════════════════════════════════════════
// Status badge colors
// ═══════════════════════════════════════════════

const getStatusBadgeClasses = (status: string): string => {
  if (status.startsWith("Signed"))
    return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  switch (status) {
    case "May Sign this Week":
      return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
    case "May Sign Soon":
      return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
    case "Narrowing to Top 3":
    case "Locking Down Top 5":
      return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300";
    case "Listening to Offers":
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
    default:
      return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
  }
};

// ═══════════════════════════════════════════════
// Scouted potentials cache
// ═══════════════════════════════════════════════

interface ScoutedEntry {
  potentials: Record<string, string | null>;
  fuzzed: boolean;
}

// ═══════════════════════════════════════════════
// Recruiting-specific column groups (use pool API sort keys directly)
// ═══════════════════════════════════════════════

const RECRUIT_POS_GROUPS: ColumnGroup[] = [
  {
    groupLabel: "",
    columns: [
      { label: "", sortKey: "" },
      { label: "Name", sortKey: "lastname" },
      { label: "Stars", sortKey: "star_rating" },
      { label: "Area", sortKey: "area" },
      { label: "B/T", sortKey: "" },
      { label: "Interest", sortKey: "" },
      { label: "Competitors", sortKey: "" },
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

const RECRUIT_PITCH_GROUPS: ColumnGroup[] = [
  {
    groupLabel: "",
    columns: [
      { label: "", sortKey: "" },
      { label: "Name", sortKey: "lastname" },
      { label: "Stars", sortKey: "star_rating" },
      { label: "Area", sortKey: "area" },
      { label: "Throw", sortKey: "" },
      { label: "Interest", sortKey: "" },
      { label: "Competitors", sortKey: "" },
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

const StarDisplay = ({ rating }: { rating: number | undefined }) => {
  if (rating == null) return <span className="text-gray-400">—</span>;
  return (
    <>
      <span className="text-yellow-500">{"★".repeat(rating)}</span>
      <span className="text-gray-600 dark:text-gray-500">
        {"★".repeat(5 - rating)}
      </span>
    </>
  );
};

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

type Tab = "pool" | "board" | "commitments";

// ═══════════════════════════════════════════════
// Main page component
// ═══════════════════════════════════════════════

interface BaseballRecruitingPageProps {
  league: string;
}

export const BaseballRecruitingPage = (_props: BaseballRecruitingPageProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuthStore();
  const { collegeOrganization, seasonContext, allTeams } = useSimBaseballStore();
  const orgId = collegeOrganization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  const [activeTab, setActiveTab] = useState<Tab>("pool");

  // ── Team colors ──
  const primaryTeam = useMemo(() => {
    if (!collegeOrganization?.teams) return null;
    return Object.values(collegeOrganization.teams)[0] ?? null;
  }, [collegeOrganization]);

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
    return getLogo(
      SimCollegeBaseball,
      primaryTeam.team_id,
      currentUser?.IsRetro,
    );
  }, [primaryTeam, currentUser?.IsRetro]);

  const pageTitle = useMemo(() => {
    if (!primaryTeam) return "Recruiting";
    return `${primaryTeam.team_full_name} Recruiting`;
  }, [primaryTeam]);

  // ── Server-side pool table (seniors only: age=18 hardcoded) ──
  const fetcher = useCallback(
    (params: Record<string, any>) =>
      BaseballService.GetCollegePool({
        ...params,
        viewing_org_id: orgId,
        league_year_id: leagueYearId,
        age: 18,
      }) as Promise<CollegePoolResponse>,
    [orgId, leagueYearId],
  );
  const pool = usePoolTable<PoolPlayer, CollegePoolResponse>(fetcher, {
    defaultSort: "star_rating",
    defaultDir: "desc",
    defaultPerPage: 50,
  });

  // Default to Position filter on first load
  useEffect(() => {
    if (!pool.filters.ptype) pool.setFilter("ptype", "Position");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pool sort config for GroupedTableHeader (direct pool sort keys) ──
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

  // Column groups based on current filter
  const poolColumnGroups = showPitchers
    ? RECRUIT_PITCH_GROUPS
    : RECRUIT_POS_GROUPS;

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

  // ── Recruiting state ──
  const [recruitingState, setRecruitingState] =
    useState<RecruitingState | null>(null);
  useEffect(() => {
    if (!leagueYearId) return;
    BaseballService.GetRecruitingState(leagueYearId)
      .then(setRecruitingState)
      .catch(() => {});
  }, [leagueYearId]);

  // ── Board data ──
  const [boardPlayers, setBoardPlayers] = useState<BoardPlayer[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardPlayerIds, setBoardPlayerIds] = useState<Set<number>>(new Set());
  const loadBoard = useCallback(() => {
    if (!orgId || !leagueYearId) return;
    setBoardLoading(true);
    BaseballService.GetRecruitingBoard(orgId, leagueYearId)
      .then((r) => {
        setBoardPlayers(r.players ?? []);
        setBoardPlayerIds(new Set((r.players ?? []).filter(bp => bp.on_board).map(bp => bp.player_id)));
      })
      .catch((err) => {
        console.error(
          "[RecruitingBoard] fetch failed:",
          err,
          "status:",
          err?.status,
        );
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
        await BaseballService.AddToBoard({
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
        await BaseballService.RemoveFromBoard({
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
              data.visibility?.unlocked?.includes(
                "recruit_potential_precise",
              ) ||
              data.visibility?.unlocked?.includes("college_potential_precise");
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

  // Refresh cache for current player when modal closes (may have just scouted)
  const handleScoutingModalClose = useCallback(() => {
    scoutingModal.handleCloseModal();
    if (selectedPlayerId > 0) {
      cachePlayerScouting(selectedPlayerId);
    }
    setBudgetRefreshKey((k) => k + 1);
  }, [
    scoutingModal,
    selectedPlayerId,
    cachePlayerScouting,
    setBudgetRefreshKey,
  ]);

  // ── Investment data ──
  const [investState, setInvestState] =
    useState<InvestmentStateResponse | null>(null);
  const [investLoading, setInvestLoading] = useState(false);
  const [investAllocations, setInvestAllocations] = useState<
    Record<number, number>
  >({});
  const [investSaving, setInvestSaving] = useState(false);

  const loadInvestments = useCallback(() => {
    if (!orgId || !leagueYearId) return;
    setInvestLoading(true);
    BaseballService.GetInvestments(orgId, leagueYearId)
      .then((r) => {
        setInvestState(r);
        const allocs: Record<number, number> = {};
        r.investments.forEach((inv) => {
          allocs[inv.player_id] = inv.points;
        });
        setInvestAllocations(allocs);
      })
      .catch(() => {})
      .finally(() => setInvestLoading(false));
  }, [orgId, leagueYearId]);

  useEffect(() => {
    if (activeTab === "board") loadInvestments();
  }, [activeTab, loadInvestments]);

  const investSpent = useMemo(() => {
    return Object.values(investAllocations).reduce(
      (sum, v) => sum + (v || 0),
      0,
    );
  }, [investAllocations]);

  const investBudget = investState?.weekly_budget ?? 100;
  const investMaxPerPlayer = investState?.max_per_player ?? 20;
  const investRemaining = investBudget - investSpent;

  const handleInvestChange = useCallback(
    (playerId: number, value: number) => {
      const clamped = Math.max(0, Math.min(investMaxPerPlayer, value));
      setInvestAllocations((prev) => {
        const next = { ...prev };
        if (clamped === 0) {
          delete next[playerId];
        } else {
          next[playerId] = clamped;
        }
        return next;
      });
    },
    [investMaxPerPlayer],
  );

  const handleSaveInvestments = useCallback(async () => {
    if (!investState || investState.status !== "active") return;
    if (investRemaining < 0) {
      enqueueSnackbar(`Over budget by ${Math.abs(investRemaining)} points`, {
        variant: "error",
      });
      return;
    }
    setInvestSaving(true);
    try {
      const investments = Object.entries(investAllocations)
        .map(([pid, pts]) => ({ player_id: Number(pid), points: pts }));
      const resp = await BaseballService.SubmitInvestment({
        org_id: orgId,
        league_year_id: leagueYearId,
        week: investState.current_week,
        investments,
      });
      if (resp.errors?.length) {
        resp.errors.forEach((e) =>
          enqueueSnackbar(`Player ${e.player_id}: ${e.error}`, {
            variant: "error",
          }),
        );
      }
      if (resp.accepted?.length) {
        enqueueSnackbar(
          `Investments saved (${resp.budget_remaining} pts remaining)`,
          { variant: "success", autoHideDuration: 2000 },
        );
      }
      loadInvestments();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to save investments", {
        variant: "error",
      });
    } finally {
      setInvestSaving(false);
    }
  }, [
    investState,
    investAllocations,
    investRemaining,
    orgId,
    leagueYearId,
    enqueueSnackbar,
    loadInvestments,
  ]);

  // ── Commitments data ──
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [commitmentsPage, setCommitmentsPage] = useState(1);
  const [commitmentsTotalPages, setCommitmentsTotalPages] = useState(0);
  const [commitmentsLoading, setCommitmentsLoading] = useState(false);

  const loadCommitments = useCallback(() => {
    if (!leagueYearId) return;
    setCommitmentsLoading(true);
    BaseballService.GetCommitments({
      league_year_id: leagueYearId,
      page: commitmentsPage,
      per_page: 50,
    })
      .then((r) => {
        setCommitments(r.commitments);
        setCommitmentsTotalPages(r.total_pages);
      })
      .catch(() => setCommitments([]))
      .finally(() => setCommitmentsLoading(false));
  }, [leagueYearId, commitmentsPage]);

  useEffect(() => {
    if (activeTab === "commitments") loadCommitments();
  }, [activeTab, loadCommitments]);

  const orgAbbrev = collegeOrganization?.org_abbrev ?? "";

  // Lookup map so pool rows can show board-level data (interest, competitors)
  const boardPlayerMap = useMemo(() => {
    const map = new Map<number, BoardPlayer>();
    boardPlayers.forEach((bp) => map.set(bp.player_id, bp));
    return map;
  }, [boardPlayers]);

  // Build competitor list, prepending own team when the org has invested,
  // sorted alphabetically by team name
  const teamNameMap = useMemo(() => {
    const m = new Map<number, string>();
    allTeams.forEach((t) => m.set(t.team_id, t.team_full_name));
    return m;
  }, [allTeams]);

  const th = "px-2 py-1 text-xs font-semibold text-left whitespace-nowrap";
  const td = "px-2 py-1";

  if (!collegeOrganization) {
    return (
      <PageContainer>
        <Text variant="h4">No organization found.</Text>
      </PageContainer>
    );
  }

  const myTeamId = primaryTeam?.team_id;
  const getCompetitorIds = (ids: number[] | undefined | null, hasOwnPoints: boolean) => {
    const base = [...(ids ?? [])];
    if (hasOwnPoints && myTeamId && !base.includes(myTeamId)) {
      base.push(myTeamId);
    }
    base.sort((a, b) => (teamNameMap.get(a) ?? "").localeCompare(teamNameMap.get(b) ?? ""));
    return base;
  };

  // ── Pool board-data cells (interest + competitors) ──
  const renderBoardCells = (playerId: number) => {
    const bp = boardPlayerMap.get(playerId);
    return (
      <>
        <td className={`${cell} text-center`}>
          {bp ? (
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              bp.interest_gauge === "Very High"
                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                : bp.interest_gauge === "High"
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : bp.interest_gauge === "Medium"
                    ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}>
              {bp.interest_gauge}
            </span>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </td>
        <td className={`${cell} text-center`}>
          {(() => {
            const cIds = bp ? getCompetitorIds(bp.competitor_team_ids, bp.your_points > 0) : [];
            return cIds.length > 0 ? (
              <div className="flex items-center justify-center gap-0.5 flex-wrap">
                {cIds.map((tid) => (
                  <img
                    key={tid}
                    src={getLogo(SimCollegeBaseball, tid, false)}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                ))}
              </div>
            ) : (
              <span className="text-gray-500">—</span>
            );
          })()}
        </td>
      </>
    );
  };

  // ── Pool row renderers ──

  // Helper: get potential value from scouted cache or fall back to pool data
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
        <td className={`${cell} text-center`}>
          <StarDisplay rating={pp.star_rating} />
        </td>
        <td className={`${cell} text-center`}>{pp.area}</td>
        <td className={`${cell} text-center`}>
          {pp.bat_hand}/{pp.pitch_hand}
        </td>
        {renderBoardCells(pp.id)}
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
        <td className={`${cell} text-center`}>
          <StarDisplay rating={pp.star_rating} />
        </td>
        <td className={`${cell} text-center`}>{pp.area}</td>
        <td className={`${cell} text-center`}>{pp.pitch_hand}</td>
        {renderBoardCells(pp.id)}
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

        {/* Recruiting Status Banner */}
        {recruitingState && (
          <div
            className={`px-4 py-2 mb-2 rounded text-sm ${
              recruitingState.status === "active"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : recruitingState.status === "complete"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
            }`}
          >
            {recruitingState.status === "active" &&
              `Recruiting Week ${recruitingState.current_week} of ${recruitingState.total_weeks}`}
            {recruitingState.status === "pending" &&
              "Recruiting has not started yet"}
            {recruitingState.status === "complete" && "Recruiting is complete"}
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
                isSelected={activeTab === "commitments"}
                onClick={() => setActiveTab("commitments")}
              >
                <Text variant="small">Commitments</Text>
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

              {/* Star Rating */}
              <div className="mb-3">
                <Text variant="small" classes="font-semibold mb-1">
                  Star Rating
                </Text>
                <ButtonGroup>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={!pool.filters.star_rating}
                    onClick={() => pool.setFilter("star_rating", undefined)}
                  >
                    <Text variant="small">All</Text>
                  </PillButton>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <PillButton
                      key={s}
                      variant="primaryOutline"
                      isSelected={pool.filters.star_rating === s}
                      onClick={() => pool.setFilter("star_rating", s)}
                    >
                      <Text variant="small">{s}-Star</Text>
                    </PillButton>
                  ))}
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
                  {pool.totalCount} seniors
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
                    Loading recruits...
                  </Text>
                </div>
              ) : pool.error ? (
                <div className="flex items-center justify-center py-12">
                  <Text
                    variant="body"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    Recruiting data is not yet available.
                  </Text>
                </div>
              ) : pool.data.length === 0 ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  No recruits found.
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
                <>
                  {/* Investment Budget Bar */}
                  {investState?.status === "active" && (
                    <div className="mb-4 p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <Text variant="small" classes="font-semibold">
                          Week {investState.current_week} — Recruiting Points
                        </Text>
                        <Text
                          variant="small"
                          classes={
                            investRemaining < 0
                              ? "text-red-500 font-semibold"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {investSpent} / {investBudget} used ({investRemaining}{" "}
                          remaining)
                        </Text>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${investRemaining < 0 ? "bg-red-500" : investRemaining === 0 ? "bg-green-500" : "bg-blue-500"}`}
                          style={{
                            width: `${Math.min(100, (investSpent / investBudget) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Max {investMaxPerPlayer} pts per player
                      </div>
                    </div>
                  )}
                  {investState?.status === "pending" && (
                    <div className="mb-4 p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm">
                      Recruiting has not started yet. Point investment will be
                      available once recruiting is active.
                    </div>
                  )}
                  {investState?.status === "complete" && (
                    <div className="mb-4 p-3 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                      Recruiting is complete. Point investment is closed.
                    </div>
                  )}

                  <div className="baseball-table-wrapper overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-50 dark:bg-gray-700">
                          <th className={th}></th>
                          <th className={th}>Name</th>
                          <th className={th}>Stars</th>
                          <th className={th}>Rank</th>
                          <th className={th}>Type</th>
                          <th className={th}>Invest</th>
                          <th className={th}>Total Pts</th>
                          <th className={th}>Interest</th>
                          <th className={th}>Competitors</th>
                          <th className={th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boardPlayers.map((bp) => {
                          const allocation =
                            investAllocations[bp.player_id] ?? 0;
                          const isSigned = bp.status.startsWith("Signed");
                          return (
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
                                {bp.star_rating != null ? (
                                  <>
                                    <span className="text-yellow-500">
                                      {"★".repeat(bp.star_rating)}
                                    </span>
                                    <span className="text-gray-600">
                                      {"★".repeat(5 - bp.star_rating)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-gray-500">—</span>
                                )}
                              </td>
                              <td className={td}>
                                {bp.rank_overall != null
                                  ? `#${bp.rank_overall}`
                                  : "—"}
                              </td>
                              <td className={td}>
                                {bp.ptype === "Pitcher" ? "P" : "Pos"}
                              </td>
                              <td
                                className={td}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {investState?.status === "active" &&
                                !isSigned ? (
                                  <input
                                    type="number"
                                    min={0}
                                    max={investMaxPerPlayer}
                                    value={allocation}
                                    onChange={(e) =>
                                      handleInvestChange(
                                        bp.player_id,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-14 text-center text-sm border rounded px-1 py-0.5 dark:bg-gray-700 dark:border-gray-600
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                ) : (
                                  <span className="text-gray-400">
                                    {allocation || "—"}
                                  </span>
                                )}
                              </td>
                              <td className={`${td} font-semibold`}>
                                {bp.your_points}
                              </td>
                              <td className={td}>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    bp.interest_gauge === "Very High"
                                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                                      : bp.interest_gauge === "High"
                                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                        : bp.interest_gauge === "Medium"
                                          ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"
                                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {bp.interest_gauge}
                                </span>
                              </td>
                              <td className={td}>
                                {(() => {
                                  const cIds = getCompetitorIds(bp.competitor_team_ids, bp.your_points > 0);
                                  return cIds.length > 0 ? (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {cIds.map((tid) => (
                                        <img
                                          key={tid}
                                          src={getLogo(SimCollegeBaseball, tid, false)}
                                          alt=""
                                          className="w-5 h-5 object-contain"
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">—</span>
                                  );
                                })()}
                              </td>
                              <td className={td}>
                                <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getStatusBadgeClasses(bp.status)}`}>
                                  {bp.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Save button */}
                  {investState?.status === "active" && (
                    <div className="flex items-center justify-end gap-3 mt-4">
                      {investRemaining < 0 && (
                        <Text variant="small" classes="text-red-500">
                          Over budget by {Math.abs(investRemaining)} pts
                        </Text>
                      )}
                      {investRemaining > 0 && (
                        <Text variant="small" classes="text-gray-400">
                          {investRemaining} pts unallocated
                        </Text>
                      )}
                      <button
                        onClick={handleSaveInvestments}
                        disabled={investSaving || investRemaining < 0}
                        className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                          investSaving || investRemaining < 0
                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {investSaving ? "Saving..." : "Save Investments"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Commitments Tab ── */}
          {activeTab === "commitments" && (
            <>
              {commitmentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Text
                    variant="body"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    Loading commitments...
                  </Text>
                </div>
              ) : commitments.length === 0 ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  No commitments yet.
                </Text>
              ) : (
                <>
                  <div className="baseball-table-wrapper overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-50 dark:bg-gray-700">
                          <th className={th}>Player</th>
                          <th className={th}>School</th>
                          <th className={th}>Competitors</th>
                          <th className={th}>Stars</th>
                          <th className={th}>Type</th>
                          <th className={th}>Week</th>
                          <th className={th}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commitments.map((c) => (
                          <tr
                            key={c.player_id}
                            className="border-b border-gray-800 hover:bg-gray-700/30"
                          >
                            <td className={`${td} font-medium`}>
                              {c.player_name}
                            </td>
                            <td className={td}>
                              <div className="flex items-center gap-1">
                                <img
                                  src={getLogo(SimCollegeBaseball, c.org_id, false)}
                                  alt={c.org_abbrev}
                                  className="w-5 h-5 object-contain"
                                />
                                {c.org_abbrev}
                              </div>
                            </td>
                            <td className={td}>
                              {(() => {
                                const sorted = [...(c.competitor_team_ids ?? [])].sort(
                                  (a, b) => (teamNameMap.get(a) ?? "").localeCompare(teamNameMap.get(b) ?? "")
                                );
                                return sorted.length > 0 ? (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {sorted.map((tid) => (
                                      <img
                                        key={tid}
                                        src={getLogo(SimCollegeBaseball, tid, false)}
                                        alt=""
                                        className="w-5 h-5 object-contain"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">—</span>
                                );
                              })()}
                            </td>
                            <td className={td}>
                              <span className="text-yellow-500">
                                {"★".repeat(c.star_rating)}
                              </span>
                              <span className="text-gray-600">
                                {"★".repeat(5 - c.star_rating)}
                              </span>
                            </td>
                            <td className={td}>
                              {c.ptype === "Pitcher" ? "P" : "Pos"}
                            </td>
                            <td className={td}>{c.week_committed}</td>
                            <td className={td}>{c.points_total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PoolPagination
                    page={commitmentsPage}
                    totalPages={commitmentsTotalPages}
                    onPageChange={setCommitmentsPage}
                  />
                </>
              )}
            </>
          )}
        </Border>
      </div>

      {/* Scouting Modal */}
      {selectedPlayerId > 0 && (
        <BaseballScoutingModal
          isOpen={scoutingModal.isModalOpen}
          onClose={handleScoutingModalClose}
          playerId={selectedPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={() => setBudgetRefreshKey((k) => k + 1)}
          league="SimCollegeBaseball"
        />
      )}
    </PageContainer>
  );
};
