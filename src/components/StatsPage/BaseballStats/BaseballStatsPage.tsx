import { useCallback, useEffect, useMemo, useState } from "react";
import { exportToCsv } from "../../../_utility/csvExport";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { SelectDropdown } from "../../../_design/Select";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { useModal } from "../../../_hooks/useModal";
import { PlayerModal } from "../../Team/baseball/PlayerModal";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { getPrimaryBaseballTeam } from "../../../_utility/baseballHelpers";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { BaseballService } from "../../../_services/baseballService";
import {
  BattingLeaderRow,
  PitchingLeaderRow,
  FieldingLeaderRow,
  TeamBattingRow,
  TeamPitchingRow,
  TeamFieldingRow,
  BattingSortField,
  PitchingSortField,
  FieldingSortField,
} from "../../../models/baseball/baseballStatsModels";
import {
  BaseballBattingTable,
  BattingColumnGroup,
  BATTING_COLUMN_GROUP_LABELS,
  DEFAULT_BATTING_GROUPS,
} from "./BaseballBattingTable";
import {
  BaseballPitchingTable,
  PitchingColumnGroup,
  PITCHING_COLUMN_GROUP_LABELS,
  DEFAULT_PITCHING_GROUPS,
} from "./BaseballPitchingTable";
import { BaseballFieldingTable } from "./BaseballFieldingTable";
import { BaseballTeamStatsTable } from "./BaseballTeamStatsTable";

// ═══════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════

type StatsTab = "Batting" | "Pitching" | "Fielding" | "Team";

const POSITION_CODES = [
  "c",
  "fb",
  "sb",
  "tb",
  "ss",
  "lf",
  "cf",
  "rf",
  "p",
  "dh",
];

const POSITION_LABELS: Record<string, string> = {
  c: "C",
  fb: "1B",
  sb: "2B",
  tb: "3B",
  ss: "SS",
  lf: "LF",
  cf: "CF",
  rf: "RF",
  p: "P",
  dh: "DH",
};

// ═══════════════════════════════════════════════
// Column group persistence helpers
// ═══════════════════════════════════════════════

const LS_BATTING_GROUPS = "baseball_batting_col_groups";
const LS_PITCHING_GROUPS = "baseball_pitching_col_groups";

function loadGroups<T extends string>(key: string, defaults: Set<T>): Set<T> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw) as T[];
      if (Array.isArray(arr) && arr.length > 0) return new Set(arr);
    }
  } catch { /* ignore */ }
  return new Set(defaults);
}

function saveGroups<T extends string>(key: string, groups: Set<T>) {
  localStorage.setItem(key, JSON.stringify([...groups]));
}

// ═══════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════

interface BaseballStatsPageProps {
  league: string;
}

export const BaseballStatsPage = ({ league }: BaseballStatsPageProps) => {
  const { currentUser } = useAuthStore();
  const { allTeams, seasonContext, mlbOrganization, collegeOrganization, bootstrappedOrgId, loadBootstrapForOrg, standings } = useSimBaseballStore();

  const isCollege = league === SimCollegeBaseball;
  const organization = isCollege ? collegeOrganization : mlbOrganization;
  const primaryTeam = organization
    ? getPrimaryBaseballTeam(organization)
    : undefined;
  const defaultLevel = isCollege ? 3 : 9;

  // Ensure bootstrap data matches the current league's org
  useEffect(() => {
    if (organization && organization.id !== bootstrappedOrgId) {
      loadBootstrapForOrg(organization.id);
    }
  }, [organization?.id, bootstrappedOrgId, loadBootstrapForOrg]);

  // Player modal (scouting-aware)
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(
    null,
  );

  const orgId = organization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  const openPlayerModal = useCallback(
    (playerId: number) => {
      setModalPlayerId(playerId);
      handleOpenModal();
    },
    [handleOpenModal],
  );

  const refreshBudget = useCallback(() => {
    if (orgId && leagueYearId) {
      BaseballService.GetScoutingBudget(orgId, leagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
  }, [orgId, leagueYearId]);

  // Load scouting budget on mount
  useEffect(() => {
    refreshBudget();
  }, [refreshBudget]);

  // Team color theming
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

  // Logo
  const logo = useMemo(() => {
    if (!primaryTeam) return "";
    return getLogo(
      league === SimMLB ? SimMLB : SimCollegeBaseball,
      primaryTeam.team_id,
      currentUser?.IsRetro,
    );
  }, [primaryTeam, league, currentUser?.IsRetro]);

  // --- State ---
  const [activeTab, setActiveTab] = useState<StatsTab>("Batting");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(defaultLevel);
  const [page, setPage] = useState(1);

  // Sort state per tab (sort field + order)
  const [battingSort, setBattingSort] = useState<BattingSortField>("avg");
  const [battingOrder, setBattingOrder] = useState<"asc" | "desc">("desc");
  const [pitchingSort, setPitchingSort] = useState<PitchingSortField>("era");
  const [pitchingOrder, setPitchingOrder] = useState<"asc" | "desc">("asc");
  const [fieldingSort, setFieldingSort] = useState<FieldingSortField>("fpct");
  const [fieldingOrder, setFieldingOrder] = useState<"asc" | "desc">("desc");

  // Filter state
  const [battingPosition, setBattingPosition] = useState<string | null>(null);
  const [fieldingPosition, setFieldingPosition] = useState<string | null>(null);
  const [pitchingRole, setPitchingRole] = useState<
    "starter" | "reliever" | null
  >(null);
  const [minPA, setMinPA] = useState<number | null>(null);
  const [minIP, setMinIP] = useState<number | null>(null);
  const [minInn, setMinInn] = useState<number | null>(null);

  // Column group visibility (persisted to localStorage)
  const [battingGroups, setBattingGroups] = useState<Set<BattingColumnGroup>>(
    () => loadGroups(LS_BATTING_GROUPS, DEFAULT_BATTING_GROUPS),
  );
  const [pitchingGroups, setPitchingGroups] = useState<Set<PitchingColumnGroup>>(
    () => loadGroups(LS_PITCHING_GROUPS, DEFAULT_PITCHING_GROUPS),
  );

  const toggleBattingGroup = useCallback((group: BattingColumnGroup) => {
    setBattingGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      saveGroups(LS_BATTING_GROUPS, next);
      return next;
    });
  }, []);

  const togglePitchingGroup = useCallback((group: PitchingColumnGroup) => {
    setPitchingGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      saveGroups(LS_PITCHING_GROUPS, next);
      return next;
    });
  }, []);

  // Data
  const [battingLeaders, setBattingLeaders] = useState<BattingLeaderRow[]>([]);
  const [pitchingLeaders, setPitchingLeaders] = useState<PitchingLeaderRow[]>(
    [],
  );
  const [fieldingLeaders, setFieldingLeaders] = useState<FieldingLeaderRow[]>(
    [],
  );
  const [teamBatting, setTeamBatting] = useState<TeamBattingRow[]>([]);
  const [teamFielding, setTeamFielding] = useState<TeamFieldingRow[]>([]);
  const [teamPitching, setTeamPitching] = useState<TeamPitchingRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Team options
  const teamOptions = useMemo(() => {
    const teams = (allTeams ?? []).filter(
      (t) => t.team_level === selectedLevel,
    );
    const opts: SelectOption[] = [{ value: "__all__", label: "All Teams" }];
    for (const t of teams.sort((a, b) =>
      a.team_full_name.localeCompare(b.team_full_name),
    )) {
      opts.push({ value: String(t.team_id), label: t.team_full_name });
    }
    return opts;
  }, [allTeams, selectedLevel]);

  const selectedTeamOption = useMemo(() => {
    if (!selectedTeamId)
      return teamOptions.find((o) => o.value === "__all__") ?? null;
    return teamOptions.find((o) => o.value === String(selectedTeamId)) ?? null;
  }, [teamOptions, selectedTeamId]);

  // Level options (MLB only)
  const levelOptions: SelectOption[] = useMemo(() => {
    if (isCollege) return [];
    return [
      { value: "9", label: "MLB" },
      { value: "8", label: "AAA" },
      { value: "7", label: "AA" },
      { value: "6", label: "High-A" },
      { value: "5", label: "A" },
    ];
  }, [isCollege]);

  // Qualifying minimum options
  const qualifyingOptions: SelectOption[] = useMemo(() => {
    if (activeTab === "Batting") {
      return [
        { value: "0", label: "No Minimum" },
        { value: "50", label: "50 PA" },
        { value: "100", label: "100 PA" },
        { value: "200", label: "200 PA" },
        { value: "300", label: "300 PA" },
        { value: "400", label: "400 PA" },
      ];
    }
    if (activeTab === "Pitching") {
      return [
        { value: "0", label: "No Minimum" },
        { value: "10", label: "10 IP" },
        { value: "30", label: "30 IP" },
        { value: "50", label: "50 IP" },
        { value: "100", label: "100 IP" },
        { value: "150", label: "150 IP" },
      ];
    }
    if (activeTab === "Fielding") {
      return [
        { value: "0", label: "No Minimum" },
        { value: "50", label: "50 Inn" },
        { value: "100", label: "100 Inn" },
        { value: "200", label: "200 Inn" },
      ];
    }
    return [];
  }, [activeTab]);

  const currentQualifyingValue = useMemo(() => {
    const val =
      activeTab === "Batting"
        ? minPA
        : activeTab === "Pitching"
          ? minIP
          : minInn;
    return String(val ?? 0);
  }, [activeTab, minPA, minIP, minInn]);

  // Smart default order for sort fields
  const getDefaultOrder = (tab: StatsTab, sort: string): "asc" | "desc" => {
    if (tab === "Pitching") {
      // Lower-is-better pitching stats
      return [
        "era", "whip", "bb9", "hr9", "h9", "bb_pct", "fip", "xfip",
        "barrel_pct", "hard_hit_pct", "p_ip", "era_minus", "fip_minus",
        "lob_pct", "ir_pct", "wp9", "ld_pct",
      ].includes(sort) ? "asc" : "desc";
    }
    if (tab === "Batting") {
      // Lower-is-better batting stats
      return ["k_pct", "ab_hr", "gidp", "soft_pct"].includes(sort) ? "asc" : "desc";
    }
    if (tab === "Fielding") {
      return ["e", "e_inn", "err_runs"].includes(sort) ? "asc" : "desc";
    }
    return "desc";
  };

  // Header sort handler — passed to table components
  const handleSort = useCallback(
    (field: string) => {
      if (activeTab === "Batting") {
        const f = field as BattingSortField;
        if (battingSort === f) {
          setBattingOrder((o) => (o === "asc" ? "desc" : "asc"));
        } else {
          setBattingSort(f);
          setBattingOrder(getDefaultOrder("Batting", f));
        }
      } else if (activeTab === "Pitching") {
        const f = field as PitchingSortField;
        if (pitchingSort === f) {
          setPitchingOrder((o) => (o === "asc" ? "desc" : "asc"));
        } else {
          setPitchingSort(f);
          setPitchingOrder(getDefaultOrder("Pitching", f));
        }
      } else if (activeTab === "Fielding") {
        const f = field as FieldingSortField;
        if (fieldingSort === f) {
          setFieldingOrder((o) => (o === "asc" ? "desc" : "asc"));
        } else {
          setFieldingSort(f);
          setFieldingOrder(getDefaultOrder("Fielding", f));
        }
      }
    },
    [activeTab, battingSort, pitchingSort, fieldingSort],
  );

  // --- CSV Export ---
  const handleExport = useCallback(async () => {
    if (!seasonContext || isExporting) return;
    setIsExporting(true);
    try {
      const lyId = seasonContext.current_league_year_id;
      const levelLabel = isCollege ? "college" : String(selectedLevel);
      const tabLower = activeTab.toLowerCase();

      if (activeTab === "Batting") {
        const data = await BaseballService.GetBattingLeaders({
          league_year_id: lyId,
          league_level: selectedLevel,
          team_id: selectedTeamId ?? undefined,
          sort: battingSort,
          order: battingOrder,
          position: battingPosition ?? undefined,
          min_pa: minPA ?? undefined,
          page_size: 9999,
        });
        const headers = [
          "Player", "Team", "Pos",
          "G", "PA", "AB", "H", "2B", "3B", "HR", "ITPHR", "RBI", "R", "BB", "SO", "SB", "CS", "TB",
          "AVG", "OBP", "SLG", "OPS",
          "wOBA", "wRC+", "OPS+", "ISO", "BABIP", "BB%", "K%", "BB/K", "XBH%", "SB%",
          "HBP", "SF", "GIDP", "RC", "SecA", "PSS",
          "GB%", "FB%", "HR/FB", "Barrel%", "HardHit%", "Soft%", "Med%", "LD%", "Contact%",
          "bWAR",
        ];
        const rows = data.leaders.map((r) => [
          r.name, r.team_abbrev, r.position ?? "",
          r.g, r.pa, r.ab, r.h, r["2b"], r["3b"], r.hr, r.itphr, r.rbi, r.r, r.bb, r.so, r.sb, r.cs, r.tb,
          r.avg, r.obp, r.slg, r.ops,
          r.woba, r.wrc_plus, r.ops_plus, r.iso, r.babip, r.bb_pct, r.k_pct, r.bb_k, r.xbh_pct, r.sb_pct,
          r.hbp, r.sf, r.gidp, r.rc, r.sec_a, r.pss,
          r.gb_pct, r.fb_pct, r.hr_fb, r.barrel_pct, r.hard_hit_pct, r.soft_pct, r.med_pct, r.ld_pct, r.contact_pct,
          r.bwar != null ? r.bwar.toFixed(1) : "",
        ]);
        exportToCsv(`${levelLabel}-${tabLower}-stats`, headers, rows);

      } else if (activeTab === "Pitching") {
        const data = await BaseballService.GetPitchingLeaders({
          league_year_id: lyId,
          league_level: selectedLevel,
          team_id: selectedTeamId ?? undefined,
          sort: pitchingSort,
          order: pitchingOrder,
          role: pitchingRole ?? undefined,
          min_ip: minIP ?? undefined,
          page_size: 9999,
        });
        const headers = [
          "Player", "Team",
          "G", "GS", "W", "L", "SV", "HLD", "BS", "QS",
          "IP", "H", "R", "ER", "BB", "SO", "HR", "ITPHR",
          "ERA", "WHIP", "FIP", "xFIP",
          "K/9", "BB/9", "HR/9", "H/9", "K%", "BB%", "K-BB%", "K/BB", "W%", "BABIP", "IP/GS",
          "ERA-", "FIP-",
          "Pitches", "Str%", "P/IP", "HBP", "WP", "WP/9", "BF",
          "GB%", "FB%", "HR/FB", "Barrel%", "HardHit%", "Soft%", "LD%", "LOB%",
          "IR", "IRS", "IR%", "GIDP Induced",
          "pWAR",
        ];
        const rows = data.leaders.map((r) => [
          r.name, r.team_abbrev,
          r.g, r.gs, r.w, r.l, r.sv, r.hld, r.bs, r.qs,
          r.ip, r.h, r.r, r.er, r.bb, r.so, r.hr, r.itphr,
          r.era, r.whip, r.fip, r.xfip,
          r.k9, r.bb9, r.hr9, r.h9, r.k_pct, r.bb_pct, r.k_bb_pct, r.k_bb, r.w_pct, r.babip, r.ip_gs,
          r.era_minus, r.fip_minus,
          r.pitches, r.str_pct, r.p_ip, r.hbp, r.wp, r.wp9, r.bf,
          r.gb_pct, r.fb_pct, r.hr_fb, r.barrel_pct, r.hard_hit_pct, r.soft_pct, r.ld_pct, r.lob_pct,
          r.ir, r.irs, r.ir_pct, r.gidp_induced,
          r.pwar != null ? r.pwar.toFixed(1) : "",
        ]);
        exportToCsv(`${levelLabel}-${tabLower}-stats`, headers, rows);

      } else if (activeTab === "Fielding") {
        const data = await BaseballService.GetFieldingLeaders({
          league_year_id: lyId,
          league_level: selectedLevel,
          team_id: selectedTeamId ?? undefined,
          sort: fieldingSort,
          order: fieldingOrder,
          position_code: fieldingPosition ?? undefined,
          min_inn: minInn ?? undefined,
          page_size: 9999,
        });
        const headers = [
          "Player", "Team", "Pos",
          "G", "Inn", "PO", "A", "E", "FPCT",
          "TC", "TC/G", "RF/G", "PO/Inn", "A/Inn", "E/Inn",
          "DP", "RF", "DP/G",
          "fWAR", "ErrR", "RngR", "DPR",
        ];
        const rows = data.leaders.map((r) => [
          r.name, r.team_abbrev, r.pos,
          r.g, r.inn, r.po, r.a, r.e, r.fpct,
          r.tc, r.tc_g, r.rf_g, r.po_inn, r.a_inn, r.e_inn,
          r.dp, r.rf, r.dp_g,
          r.fwar != null ? r.fwar.toFixed(1) : "", r.err_runs != null ? r.err_runs.toFixed(1) : "", r.range_runs != null ? r.range_runs.toFixed(1) : "", r.dp_runs != null ? r.dp_runs.toFixed(1) : "",
        ]);
        exportToCsv(`${levelLabel}-${tabLower}-stats`, headers, rows);

      } else if (activeTab === "Team") {
        // Team tab uses already-loaded state — no extra fetch needed
        const pitchingMap = new Map(teamPitching.map((p) => [p.team_id, p]));
        const gpMap = new Map(
          (standings ?? []).map((s) => [s.team_id, s.wins + s.losses]),
        );
        const fieldingMap = new Map(teamFielding.map((f) => [f.team_id, f]));
        const headers = [
          "Team",
          // Batting
          "G", "PA", "R", "H", "HR", "ITPHR", "RBI", "SB", "BB", "HBP", "SO",
          "AVG", "OBP", "SLG", "OPS", "BABIP",
          // Pitching
          "W", "L", "SV", "HLD", "BS", "QS",
          "IP", "P_R", "ER", "P_HR", "P_ITPHR", "P_BB", "P_SO",
          "ERA", "WHIP", "K/9", "BB/9", "HR/9",
          // Fielding
          "FPCT", "E", "E/G", "DP", "DP/G", "RF", "DefEff",
        ];
        const rows = teamBatting.map((b) => {
          const p = pitchingMap.get(b.team_id);
          const f = fieldingMap.get(b.team_id);
          return [
            b.team_abbrev,
            gpMap.get(b.team_id) ?? b.g,
            b.pa, b.r, b.h, b.hr, b.itphr, b.rbi, b.sb, b.bb, b.hbp, b.so,
            b.avg, b.obp, b.slg, b.ops, b.babip,
            p?.w ?? "", p?.l ?? "", p?.sv ?? "", p?.hld ?? "", p?.bs ?? "", p?.qs ?? "",
            p?.ip ?? "", p?.r ?? "", p?.er ?? "", p?.hr ?? "", p?.itphr ?? "", p?.bb ?? "", p?.so ?? "",
            p?.era ?? "", p?.whip ?? "", p?.k9 ?? "", p?.bb9 ?? "", p?.hr9 ?? "",
            f?.fpct ?? "", f?.e ?? "", f?.e_g ?? "", f?.dp ?? "", f?.dp_g ?? "", f?.rf ?? "", f?.def_eff ?? "",
          ];
        });
        exportToCsv(`${levelLabel}-team-stats`, headers, rows);
      }
    } catch (e) {
      console.error("Export failed", e);
    }
    setIsExporting(false);
  }, [
    seasonContext, isExporting, activeTab, isCollege, selectedLevel, selectedTeamId,
    battingSort, battingOrder, battingPosition, minPA,
    pitchingSort, pitchingOrder, pitchingRole, minIP,
    fieldingSort, fieldingOrder, fieldingPosition, minInn,
    teamBatting, teamPitching, teamFielding, standings,
  ]);

  // --- Fetch data ---
  const fetchData = useCallback(async () => {
    if (!seasonContext) return;
    setIsLoading(true);
    try {
      const leagueYearId = seasonContext.current_league_year_id;

      if (activeTab === "Batting") {
        const data = await BaseballService.GetBattingLeaders({
          league_year_id: leagueYearId,
          league_level: selectedLevel,
          team_id: selectedTeamId ?? undefined,
          sort: battingSort,
          order: battingOrder,
          position: battingPosition ?? undefined,
          min_pa: minPA ?? undefined,
          page,
          page_size: 50,
        });
        setBattingLeaders(data.leaders);
        setTotalPages(data.pages);
      } else if (activeTab === "Pitching") {
        const data = await BaseballService.GetPitchingLeaders({
          league_year_id: leagueYearId,
          league_level: selectedLevel,
          team_id: selectedTeamId ?? undefined,
          sort: pitchingSort,
          order: pitchingOrder,
          role: pitchingRole ?? undefined,
          min_ip: minIP ?? undefined,
          page,
          page_size: 50,
        });
        setPitchingLeaders(data.leaders);
        setTotalPages(data.pages);
      } else if (activeTab === "Fielding") {
        const data = await BaseballService.GetFieldingLeaders({
          league_year_id: leagueYearId,
          league_level: selectedLevel,
          team_id: selectedTeamId ?? undefined,
          sort: fieldingSort,
          order: fieldingOrder,
          position_code: fieldingPosition ?? undefined,
          min_inn: minInn ?? undefined,
          page,
          page_size: 50,
        });
        setFieldingLeaders(data.leaders);
        setTotalPages(data.pages);
      } else if (activeTab === "Team") {
        const data = await BaseballService.GetTeamStats({
          league_year_id: leagueYearId,
          league_level: selectedLevel,
        });
        setTeamBatting(data.batting);
        setTeamPitching(data.pitching);
        setTeamFielding(data.fielding ?? []);
        setTotalPages(1);
      }
    } catch (e) {
      console.error("Failed to load stats", e);
    }
    setIsLoading(false);
  }, [
    seasonContext,
    activeTab,
    selectedLevel,
    selectedTeamId,
    battingSort,
    battingOrder,
    pitchingSort,
    pitchingOrder,
    fieldingSort,
    fieldingOrder,
    battingPosition,
    fieldingPosition,
    pitchingRole,
    minPA,
    minIP,
    minInn,
    page,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    selectedLevel,
    selectedTeamId,
    battingSort,
    battingOrder,
    pitchingSort,
    pitchingOrder,
    fieldingSort,
    fieldingOrder,
    battingPosition,
    fieldingPosition,
    pitchingRole,
    minPA,
    minIP,
    minInn,
  ]);

  const pageTitle = isCollege ? "College Baseball" : "MLB";

  // Current sort info for table components
  const currentSort =
    activeTab === "Batting"
      ? battingSort
      : activeTab === "Pitching"
        ? pitchingSort
        : fieldingSort;
  const currentOrder =
    activeTab === "Batting"
      ? battingOrder
      : activeTab === "Pitching"
        ? pitchingOrder
        : fieldingOrder;

  // --- Render ---
  if (!seasonContext) {
    return (
      <PageContainer>
        <Text variant="h4">Loading...</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{
            backgroundColor: headerColor,
            borderBottom: `3px solid ${borderColor}`,
          }}
        >
          {logo && (
            <img src={logo} className="w-10 h-10 object-contain" alt="" />
          )}
          <div>
            <Text variant="h4" classes={headerTextClass}>
              {pageTitle} Statistics
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Season {seasonContext.league_year}
            </Text>
          </div>
        </div>

        {/* Tabs */}
        <TabGroup>
          {(["Batting", "Pitching", "Fielding", "Team"] as StatsTab[]).map(
            (tab) => (
              <Tab
                key={tab}
                label={tab}
                selected={activeTab === tab}
                setSelected={(val) => setActiveTab(val as StatsTab)}
              />
            ),
          )}
        </TabGroup>

        {/* Filters */}
        {(
        <Border
          classes="p-4 mb-2"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            {/* Position filter — Batting */}
            {activeTab === "Batting" && (
              <div>
                <Text variant="small" classes="font-semibold mb-1">
                  Position
                </Text>
                <ButtonGroup>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={battingPosition === null}
                    onClick={() => setBattingPosition(null)}
                  >
                    <Text variant="small">All</Text>
                  </PillButton>
                  {POSITION_CODES.filter((p) => p !== "p").map((pos) => (
                    <PillButton
                      key={pos}
                      variant="primaryOutline"
                      isSelected={battingPosition === pos}
                      onClick={() => setBattingPosition(pos)}
                    >
                      <Text variant="small">{POSITION_LABELS[pos]}</Text>
                    </PillButton>
                  ))}
                </ButtonGroup>
              </div>
            )}

            {/* Role filter — Pitching */}
            {activeTab === "Pitching" && (
              <div>
                <Text variant="small" classes="font-semibold mb-1">
                  Role
                </Text>
                <ButtonGroup>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={pitchingRole === null}
                    onClick={() => setPitchingRole(null)}
                  >
                    <Text variant="small">All</Text>
                  </PillButton>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={pitchingRole === "starter"}
                    onClick={() => setPitchingRole("starter")}
                  >
                    <Text variant="small">Starters</Text>
                  </PillButton>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={pitchingRole === "reliever"}
                    onClick={() => setPitchingRole("reliever")}
                  >
                    <Text variant="small">Relievers</Text>
                  </PillButton>
                </ButtonGroup>
              </div>
            )}

            {/* Position filter — Fielding */}
            {activeTab === "Fielding" && (
              <div>
                <Text variant="small" classes="font-semibold mb-1">
                  Position
                </Text>
                <ButtonGroup>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={fieldingPosition === null}
                    onClick={() => setFieldingPosition(null)}
                  >
                    <Text variant="small">All</Text>
                  </PillButton>
                  {POSITION_CODES.map((pos) => (
                    <PillButton
                      key={pos}
                      variant="primaryOutline"
                      isSelected={fieldingPosition === pos}
                      onClick={() => setFieldingPosition(pos)}
                    >
                      <Text variant="small">{POSITION_LABELS[pos]}</Text>
                    </PillButton>
                  ))}
                </ButtonGroup>
              </div>
            )}

            {/* Team filter (not for Team tab) */}
            {activeTab !== "Team" && (
              <div className="w-full sm:w-auto sm:min-w-[14rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Team
                </Text>
                <SelectDropdown
                  options={teamOptions}
                  value={selectedTeamOption}
                  onChange={(opt) => {
                    if (!opt) return;
                    const v = (opt as SelectOption).value;
                    setSelectedTeamId(v === "__all__" ? null : Number(v));
                  }}
                  isSearchable
                  placeholder="Filter by team..."
                />
              </div>
            )}

            {/* Level filter (MLB only) */}
            {!isCollege && levelOptions.length > 0 && (
              <div className="w-full sm:w-auto sm:min-w-[8rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Level
                </Text>
                <SelectDropdown
                  options={levelOptions}
                  value={
                    levelOptions.find(
                      (o) => o.value === String(selectedLevel),
                    ) ?? null
                  }
                  onChange={(opt) => {
                    if (!opt) return;
                    setSelectedLevel(Number((opt as SelectOption).value));
                  }}
                />
              </div>
            )}

            {/* Qualifying minimum (not for Team tab) */}
            {activeTab !== "Team" && qualifyingOptions.length > 0 && (
              <div className="w-full sm:w-auto sm:min-w-[9rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Qualifying
                </Text>
                <SelectDropdown
                  options={qualifyingOptions}
                  value={
                    qualifyingOptions.find(
                      (o) => o.value === currentQualifyingValue,
                    ) ?? qualifyingOptions[0]
                  }
                  onChange={(opt) => {
                    if (!opt) return;
                    const v = Number((opt as SelectOption).value) || null;
                    if (activeTab === "Batting") setMinPA(v);
                    else if (activeTab === "Pitching") setMinIP(v);
                    else if (activeTab === "Fielding") setMinInn(v);
                  }}
                />
              </div>
            )}

            {/* Export CSV */}
            <div className="ml-auto flex items-end">
              <PillButton
                variant="primaryOutline"
                onClick={handleExport}
                disabled={isExporting || isLoading}
              >
                <Text variant="small">{isExporting ? "Exporting..." : "↓ Download Stats"}</Text>
              </PillButton>
            </div>
          </div>

          {/* Column group toggles (Batting & Pitching tabs) */}
          {activeTab === "Batting" && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Text variant="small" classes="font-semibold mr-1">Columns:</Text>
              {(Object.keys(BATTING_COLUMN_GROUP_LABELS) as BattingColumnGroup[]).map((grp) => (
                <PillButton
                  key={grp}
                  variant="primaryOutline"
                  isSelected={battingGroups.has(grp)}
                  onClick={() => toggleBattingGroup(grp)}
                >
                  <Text variant="small">{BATTING_COLUMN_GROUP_LABELS[grp]}</Text>
                </PillButton>
              ))}
            </div>
          )}
          {activeTab === "Pitching" && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Text variant="small" classes="font-semibold mr-1">Columns:</Text>
              {(Object.keys(PITCHING_COLUMN_GROUP_LABELS) as PitchingColumnGroup[]).map((grp) => (
                <PillButton
                  key={grp}
                  variant="primaryOutline"
                  isSelected={pitchingGroups.has(grp)}
                  onClick={() => togglePitchingGroup(grp)}
                >
                  <Text variant="small">{PITCHING_COLUMN_GROUP_LABELS[grp]}</Text>
                </PillButton>
              ))}
            </div>
          )}
        </Border>
        )}

        {/* Content */}
        <Border
          classes="p-4"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">
                Loading stats...
              </Text>
            </div>
          ) : (
            <>
              {activeTab === "Batting" && (
                <BaseballBattingTable
                  leaders={battingLeaders}
                  league={league}
                  IsRetro={currentUser?.IsRetro}
                  accentColor={headerColor}
                  onPlayerClick={openPlayerModal}
                  sortField={currentSort}
                  sortOrder={currentOrder}
                  onSort={handleSort}
                  visibleGroups={battingGroups}
                />
              )}
              {activeTab === "Pitching" && (
                <BaseballPitchingTable
                  leaders={pitchingLeaders}
                  league={league}
                  IsRetro={currentUser?.IsRetro}
                  accentColor={headerColor}
                  onPlayerClick={openPlayerModal}
                  sortField={currentSort}
                  sortOrder={currentOrder}
                  onSort={handleSort}
                  visibleGroups={pitchingGroups}
                />
              )}
              {activeTab === "Fielding" && (
                <BaseballFieldingTable
                  leaders={fieldingLeaders}
                  league={league}
                  IsRetro={currentUser?.IsRetro}
                  accentColor={headerColor}
                  onPlayerClick={openPlayerModal}
                  sortField={currentSort}
                  sortOrder={currentOrder}
                  onSort={handleSort}
                />
              )}
              {activeTab === "Team" && (
                <BaseballTeamStatsTable batting={teamBatting} pitching={teamPitching} fielding={teamFielding} standings={standings} league={league} IsRetro={currentUser?.IsRetro} accentColor={headerColor} />
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >
                    Previous
                  </button>
                  <Text variant="small" classes="font-semibold">
                    Page {page} of {totalPages}
                  </Text>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-default"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </Border>
      </div>

      {/* Player Scouting Modal */}
      {modalPlayerId != null && (
        <PlayerModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalPlayerId(null);
            handleCloseModal();
          }}
          playerId={modalPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={refreshBudget}
          league={league === SimMLB ? SimMLB : SimCollegeBaseball}
          context="scouting"
        />
      )}
    </PageContainer>
  );
};
