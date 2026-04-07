import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Attributes, Contracts, League, Potentials, SimMLB } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { BaseballService } from "../../../_services/baseballService";
import { BaseballOrganization, BaseballRosters, Player } from "../../../models/baseball/baseballModels";
import {
    TradeProposal,
    ProposeTradeRequest,
    SalaryRetention,
} from "../../../models/baseball/baseballTradeModels";
import { normalizePlayer, displayLevel, LEVEL_ORDER } from "../../../_utility/baseballHelpers";
import { ratingColor } from "./baseballColorConfig";
import {
    type BaseballCategory,
    type SortConfig,
    type PlayerStatsMap,
    emptyStatsMap,
    comparePlayers,
    GroupedTableHeader,
    InfoCells,
    AllAttrCells, AllPotCells,
    PosAttrCells, PosPotCells,
    PitchAttrCells, PitchPotCells,
    ContractCells,
    BattingStatsCells, PitchingStatsCells,
    StaminaBarCell,
    td,
    ALL_ATTR_GROUPS_NO_ACTIONS,
    ALL_POT_GROUPS_NO_ACTIONS,
    POS_ATTR_GROUPS_NO_ACTIONS,
    POS_POT_GROUPS_NO_ACTIONS,
    PITCH_ATTR_GROUPS_NO_ACTIONS,
    PITCH_POT_GROUPS_NO_ACTIONS,
    CONTRACT_GROUPS_NO_ACTIONS,
    BATTING_STATS_GROUPS_NO_ACTIONS,
    PITCHING_STATS_GROUPS_NO_ACTIONS,
} from "./BaseballRosterTable";
import { Text } from "../../../_design/Typography";
import { Button, PillButton, ButtonGroup } from "../../../_design/Buttons";
import { Border } from "../../../_design/Borders";
import { SelectDropdown } from "../../../_design/Select";
import { Input } from "../../../_design/Inputs";
import { Close } from "../../../_design/Icons";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SingleValue } from "react-select";
import { enqueueSnackbar } from "notistack";
import "./baseballMobile.css";

// Dark theme select styles for org selector
const darkSelectStyles = {
    control: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
        borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
        color: "#ffffff",
        width: "100%",
        padding: "0.3rem",
        boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
        borderRadius: "8px",
        transition: "all 0.2s ease",
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: "#1a202c",
        borderRadius: "8px",
        zIndex: 9999,
    }),
    menuList: (provided: any) => ({
        ...provided,
        backgroundColor: "#1a202c",
        padding: "0",
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
        color: "#ffffff",
        padding: "10px",
        cursor: "pointer",
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: "#ffffff",
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: "#a0aec0",
    }),
};

// ─── Status badge ────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    proposed: "bg-yellow-600",
    counterparty_accepted: "bg-blue-600",
    admin_approved: "bg-green-600",
    executed: "bg-green-700",
    rejected: "bg-red-600",
    admin_rejected: "bg-red-600",
    cancelled: "bg-gray-600",
};

const StatusBadge: FC<{ status: string }> = ({ status }) => (
    <span
        className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${STATUS_COLORS[status] ?? "bg-gray-500"}`}
    >
        {status.replace(/_/g, " ")}
    </span>
);

// ─── Retention presets ───────────────────────────────────────────────
const RETENTION_PRESETS = [0, 25, 50, 75, 100];
const RETENTION_STEP = 5;

// ═════════════════════════════════════════════════════════════════════
// PlayerPickerTable — filterable table matching roster view columns
// ═════════════════════════════════════════════════════════════════════

const Stats = "Stats";
const CATEGORY_LABELS: { key: BaseballCategory; label: string }[] = [
    { key: Attributes, label: "Attrs" },
    { key: Potentials, label: "Pots" },
    { key: Contracts, label: "Contracts" },
    { key: Stats, label: "Stats" },
];

interface PlayerPickerTableProps {
    players: Player[];
    selectedIds: Set<number>;
    onSelect: (player: Player) => void;
    label: string;
    orgAbbrev: string;
    statsMap?: PlayerStatsMap;
    onStatsNeeded?: () => void;
}

const PlayerPickerTable: FC<PlayerPickerTableProps> = ({
    players,
    selectedIds,
    onSelect,
    label,
    orgAbbrev,
    statsMap,
    onStatsNeeded,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all" | "Pitcher" | "Position">("all");
    const [filterLevel, setFilterLevel] = useState("MLB");
    const [category, setCategory] = useState<BaseballCategory>(Attributes);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const handleSort = (key: string) => {
        if (!key) return;
        setSortConfig((prev) =>
            prev?.key === key
                ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { key, dir: "desc" },
        );
    };

    // Derive available levels from roster
    const availableLevels = useMemo(() => {
        const levels = new Set(players.map((p) => p.league_level));
        return LEVEL_ORDER.filter((l) => levels.has(l));
    }, [players]);

    // Column groups based on category + filterType
    const columnGroups = useMemo(() => {
        if (category === Contracts) return CONTRACT_GROUPS_NO_ACTIONS;
        if (category === Stats) {
            return filterType === "Pitcher"
                ? PITCHING_STATS_GROUPS_NO_ACTIONS
                : BATTING_STATS_GROUPS_NO_ACTIONS;
        }
        if (category === Potentials) {
            if (filterType === "Pitcher") return PITCH_POT_GROUPS_NO_ACTIONS;
            if (filterType === "Position") return POS_POT_GROUPS_NO_ACTIONS;
            return ALL_POT_GROUPS_NO_ACTIONS;
        }
        // Attributes
        if (filterType === "Pitcher") return PITCH_ATTR_GROUPS_NO_ACTIONS;
        if (filterType === "Position") return POS_ATTR_GROUPS_NO_ACTIONS;
        return ALL_ATTR_GROUPS_NO_ACTIONS;
    }, [category, filterType]);

    // Filter + sort
    const filtered = useMemo(() => {
        const result = players
            .filter((p) => filterLevel === "all" || p.league_level === filterLevel)
            .filter((p) => filterType === "all" || p.ptype === filterType)
            .filter(
                (p) =>
                    searchTerm === "" ||
                    `${p.firstname} ${p.lastname}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );

        const li = (level: string) => {
            const i = LEVEL_ORDER.indexOf(level);
            return i === -1 ? LEVEL_ORDER.length : i;
        };
        return result.sort((a, b) => {
            if (sortConfig) {
                const cmp = comparePlayers(a, b, sortConfig, statsMap);
                if (cmp !== 0) return cmp;
            }
            const ld = li(a.league_level) - li(b.league_level);
            if (ld !== 0) return ld;
            if (a.ptype !== b.ptype) return a.ptype === "Pitcher" ? -1 : 1;
            return a.lastname.localeCompare(b.lastname);
        });
    }, [players, filterLevel, filterType, searchTerm, sortConfig, statsMap]);

    // Render category-specific cells for a player row
    const renderCategoryCells = (p: Player) => {
        if (category === Attributes) {
            if (filterType === "Pitcher") return <PitchAttrCells p={p} />;
            if (filterType === "Position") return <PosAttrCells p={p} />;
            return <AllAttrCells p={p} />;
        }
        if (category === Potentials) {
            if (filterType === "Pitcher") return <PitchPotCells p={p} />;
            if (filterType === "Position") return <PosPotCells p={p} />;
            return <AllPotCells p={p} />;
        }
        if (category === Contracts) {
            return (
                <>
                    <ContractCells p={p} />
                    <td data-label="Stamina" className={`${td} text-center text-xs`}>
                        <StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
                    </td>
                </>
            );
        }
        // Stats
        if (p.ptype === "Pitcher") {
            return (
                <>
                    <PitchingStatsCells p={p} statsMap={statsMap} />
                    <td data-label="Stamina" className={`${td} text-center text-xs`}>
                        <StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
                    </td>
                </>
            );
        }
        return (
            <>
                <BattingStatsCells p={p} statsMap={statsMap} />
                <td data-label="Stamina" className={`${td} text-center text-xs`}>
                    <StaminaBarCell value={p.stamina} isInjured={p.is_injured} />
                </td>
            </>
        );
    };

    return (
        <div className="flex flex-col">
            <Text as="h4" classes="mb-2 font-semibold">
                {label}
            </Text>

            {/* Search */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search player..."
                className="text-sm border rounded px-2 py-1 w-full mb-2 bg-gray-700 border-gray-600 text-white"
            />

            {/* Type filter pills */}
            <div className="flex flex-wrap gap-1 mb-1">
                <ButtonGroup>
                    <PillButton
                        variant="primaryOutline"
                        isSelected={filterType === "all"}
                        onClick={() => setFilterType("all")}
                    >
                        <Text variant="xs">All</Text>
                    </PillButton>
                    <PillButton
                        variant="primaryOutline"
                        isSelected={filterType === "Pitcher"}
                        onClick={() => setFilterType("Pitcher")}
                    >
                        <Text variant="xs">P</Text>
                    </PillButton>
                    <PillButton
                        variant="primaryOutline"
                        isSelected={filterType === "Position"}
                        onClick={() => setFilterType("Position")}
                    >
                        <Text variant="xs">Pos</Text>
                    </PillButton>
                </ButtonGroup>
            </div>

            {/* Level filter pills */}
            {availableLevels.length > 1 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    <ButtonGroup>
                        <PillButton
                            variant="primaryOutline"
                            isSelected={filterLevel === "all"}
                            onClick={() => setFilterLevel("all")}
                        >
                            <Text variant="xs">All</Text>
                        </PillButton>
                        {availableLevels.map((lv) => (
                            <PillButton
                                key={lv}
                                variant="primaryOutline"
                                isSelected={filterLevel === lv}
                                onClick={() => setFilterLevel(lv)}
                            >
                                <Text variant="xs">{displayLevel(lv)}</Text>
                            </PillButton>
                        ))}
                    </ButtonGroup>
                </div>
            )}

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 mb-2">
                <ButtonGroup>
                    {CATEGORY_LABELS.map(({ key, label: lbl }) => (
                        <PillButton
                            key={key}
                            variant="primaryOutline"
                            isSelected={category === key}
                            onClick={() => {
                                setCategory(key);
                                if (key === Stats) onStatsNeeded?.();
                            }}
                        >
                            <Text variant="xs">{lbl}</Text>
                        </PillButton>
                    ))}
                </ButtonGroup>
            </div>

            <Text variant="xs" classes="text-gray-400 mb-1">
                {filtered.length} players
            </Text>

            {/* Table */}
            <div className="baseball-table-wrapper trade-picker-table overflow-x-auto overflow-y-auto max-h-[35vh] border border-gray-600 rounded">
                <table className="w-full text-xs text-left">
                    <GroupedTableHeader groups={columnGroups} sortConfig={sortConfig} onSort={handleSort} />
                    <tbody>
                        {filtered.map((p) => {
                            const isSelected = selectedIds.has(p.id);
                            return (
                                <tr
                                    key={p.id}
                                    onClick={() => !isSelected && onSelect(p)}
                                    className={`border-b border-gray-700 ${
                                        isSelected
                                            ? "opacity-40 cursor-default"
                                            : "hover:bg-gray-700 cursor-pointer"
                                    }`}
                                >
                                    <InfoCells p={p} orgAbbrev={orgAbbrev} />
                                    {renderCategoryCells(p)}
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={999} className="px-2 py-4 text-center text-gray-500">
                                    No players match filters
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════
// SelectedPlayerCard — player in trade with retention controls
// ═════════════════════════════════════════════════════════════════════

interface SelectedPlayerCardProps {
    player: Player;
    retentionPct: number;
    onRetentionChange: (pct: number) => void;
    onRemove: () => void;
}

const SelectedPlayerCard: FC<SelectedPlayerCardProps> = ({
    player,
    retentionPct,
    onRetentionChange,
    onRemove,
}) => {
    const salary = player.contract?.current_year_detail?.base_salary;

    const increment = () =>
        onRetentionChange(Math.min(100, retentionPct + RETENTION_STEP));
    const decrement = () =>
        onRetentionChange(Math.max(0, retentionPct - RETENTION_STEP));

    return (
        <Border classes="px-3 py-2">
            <div className="flex items-start justify-between gap-2">
                {/* Player info */}
                <div className="flex flex-col flex-1 min-w-0">
                    <Text variant="small" classes="font-semibold truncate">
                        {player.firstname} {player.lastname}
                    </Text>
                    <Text variant="xs" classes="text-gray-400">
                        {player.ptype} — OVR{" "}
                        <span className={player.displayovr != null ? ratingColor(Number(player.displayovr)) : ""}>
                            {player.displayovr ?? "?"}
                        </span>{" "}
                        — {displayLevel(player.league_level)}
                        {salary != null && salary > 0 && ` — $${salary.toLocaleString()}`}
                    </Text>
                </div>

                {/* Remove button */}
                <Button
                    size="sm"
                    classes="rounded-full w-[26px] h-[26px] flex items-center justify-center shrink-0"
                    onClick={onRemove}
                >
                    <Close />
                </Button>
            </div>

            {/* Retention controls — always shown, backend knows the real salary */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Text variant="xs" classes="text-gray-400 whitespace-nowrap">
                    Retain:
                </Text>

                {/* Preset buttons */}
                <div className="flex items-center gap-0.5">
                    {RETENTION_PRESETS.map((preset) => (
                        <button
                            key={preset}
                            onClick={() => onRetentionChange(preset)}
                            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                retentionPct === preset
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            {preset}%
                        </button>
                    ))}
                </div>

                {/* -/input/+ */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={decrement}
                        className="px-1.5 py-0.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={retentionPct || ""}
                        onChange={(e) =>
                            onRetentionChange(
                                Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                            )
                        }
                        className="w-14 px-1 py-0.5 text-xs text-center bg-black text-white border border-gray-500 rounded"
                    />
                    <button
                        onClick={increment}
                        className="px-1.5 py-0.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                    >
                        +
                    </button>
                </div>
            </div>
        </Border>
    );
};

// ═════════════════════════════════════════════════════════════════════
// BaseballTradePage
// ═════════════════════════════════════════════════════════════════════

interface BaseballTradePageProps {
    league: League;
}

export const BaseballTradePage: FC<BaseballTradePageProps> = ({ league }) => {
    const {
        organizations,
        mlbOrganization,
        collegeOrganization,
        seasonContext,
        rosterMap,
    } = useSimBaseballStore();

    const userOrg = league === SimMLB ? mlbOrganization : collegeOrganization;

    // ── All rosters (keyed by org_id) ─────────────────────────────────
    const [allRosters, setAllRosters] = useState<Record<number, Player[]>>({});
    const [isLoadingRosters, setIsLoadingRosters] = useState(true);

    // ── Bootstrap cache: full contract data per org (loaded lazily) ──
    const [bootstrapCache, setBootstrapCache] = useState<Record<number, Player[]>>({});

    // ── Trade builder state ───────────────────────────────────────────
    const [targetOrgId, setTargetOrgId] = useState<number | null>(null);
    const [selectedUserPlayers, setSelectedUserPlayers] = useState<Player[]>([]);
    const [selectedTargetPlayers, setSelectedTargetPlayers] = useState<Player[]>([]);
    const [retentionMap, setRetentionMap] = useState<Record<number, number>>({});
    const [cashAmount, setCashAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Stats for trade picker tables ───────────────────────────────
    const [userStatsMap, setUserStatsMap] = useState<PlayerStatsMap>(emptyStatsMap);
    const [targetStatsMap, setTargetStatsMap] = useState<PlayerStatsMap>(emptyStatsMap);
    const statsCacheRef = useRef<Map<number, PlayerStatsMap>>(new Map());

    // ── Proposals state ───────────────────────────────────────────────
    const [proposals, setProposals] = useState<TradeProposal[]>([]);

    // ── Org options for dropdown (exclude own org) ────────────────────
    const orgOptions: SelectOption[] = useMemo(() => {
        if (!organizations || !userOrg) return [];
        const leagueFilter = league === SimMLB ? "mlb" : "college";
        return organizations
            .filter((o) => o.id !== userOrg.id && o.league === leagueFilter)
            .map((o) => ({ value: String(o.id), label: o.org_abbrev }));
    }, [organizations, userOrg, league]);

    // ── Org lookup map ────────────────────────────────────────────────
    const orgMap = useMemo(() => {
        const map: Record<number, BaseballOrganization> = {};
        if (organizations) {
            for (const o of organizations) map[o.id] = o;
        }
        return map;
    }, [organizations]);

    // ── Player lookup map (all rosters flat, bootstrap data preferred) ──
    const playerMap = useMemo(() => {
        const map: Record<number, Player> = {};
        // First add all roster data (may lack contract info)
        for (const players of Object.values(allRosters)) {
            for (const p of players) map[p.id] = p;
        }
        // Overlay with bootstrap cache (has contract data for fetched orgs)
        for (const players of Object.values(bootstrapCache)) {
            for (const p of players) map[p.id] = p;
        }
        // Overlay with user's own rosterMap (has richer contract data)
        for (const players of Object.values(rosterMap)) {
            for (const p of players) map[p.id] = p;
        }
        return map;
    }, [allRosters, bootstrapCache, rosterMap]);

    // ── Load all rosters on mount ─────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const raw = await BaseballService.GetAllRosters();
                if (cancelled) return;
                const rostersArray: BaseballRosters[] = Array.isArray(raw)
                    ? raw
                    : Object.values(raw as unknown as Record<string, BaseballRosters>);
                const map: Record<number, Player[]> = {};
                for (const r of rostersArray) {
                    map[r.org_id] = r.players.map(normalizePlayer);
                }
                setAllRosters(map);
            } catch (err) {
                console.error("Failed to load rosters", err);
            } finally {
                if (!cancelled) setIsLoadingRosters(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    // ── Load proposals ────────────────────────────────────────────────
    const loadProposals = useCallback(async () => {
        if (!userOrg) return;
        try {
            const data = await BaseballService.GetTradeProposals(userOrg.id);
            setProposals(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load trade proposals", err);
        }
    }, [userOrg]);

    useEffect(() => {
        loadProposals();
    }, [loadProposals]);

    // ── Lazy-fetch bootstrap data for target org (gives us contract/salary info) ──
    useEffect(() => {
        if (!targetOrgId || bootstrapCache[targetOrgId]) return;
        let cancelled = false;
        const load = async () => {
            try {
                const data = await BaseballService.GetBootstrapLandingData(targetOrgId);
                if (cancelled || !data.RosterMap) return;
                const players: Player[] = [];
                for (const arr of Object.values(data.RosterMap)) {
                    for (const p of arr) players.push(normalizePlayer(p));
                }
                setBootstrapCache((prev) => ({ ...prev, [targetOrgId]: players }));
            } catch (err) {
                console.error("Failed to load target org bootstrap", err);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [targetOrgId, bootstrapCache]);

    // ── Derived: user's players (prefer rosterMap from bootstrap — has contract data) ──
    const userPlayers = useMemo(() => {
        if (!userOrg) return [];
        // rosterMap is keyed by level ("mlb", "aaa", etc.) and comes from bootstrap with full contract data
        const fromBootstrap = Object.values(rosterMap).flat();
        if (fromBootstrap.length > 0) return fromBootstrap;
        // Fallback to allRosters if bootstrap hasn't loaded yet
        return allRosters[userOrg.id] ?? [];
    }, [rosterMap, allRosters, userOrg]);

    // ── Derived: target's players (prefer bootstrap cache for contract data) ──
    const targetPlayers = useMemo(() => {
        if (!targetOrgId) return [];
        return bootstrapCache[targetOrgId] ?? allRosters[targetOrgId] ?? [];
    }, [targetOrgId, bootstrapCache, allRosters]);

    // ── Derived: exclude sets ─────────────────────────────────────────
    const selectedUserIds = useMemo(
        () => new Set(selectedUserPlayers.map((p) => p.id)),
        [selectedUserPlayers],
    );
    const selectedTargetIds = useMemo(
        () => new Set(selectedTargetPlayers.map((p) => p.id)),
        [selectedTargetPlayers],
    );

    // ── Derived: split proposals ──────────────────────────────────────
    const sentProposals = useMemo(
        () => proposals.filter((p) => userOrg && p.proposing_org_id === userOrg.id),
        [proposals, userOrg],
    );
    const receivedProposals = useMemo(
        () => proposals.filter((p) => userOrg && p.receiving_org_id === userOrg.id),
        [proposals, userOrg],
    );

    // ── Handlers ──────────────────────────────────────────────────────
    const handleTargetOrgChange = (opt: SingleValue<SelectOption>) => {
        const id = opt ? Number(opt.value) : null;
        setTargetOrgId(id);
        setSelectedTargetPlayers([]);
        setRetentionMap((prev) => {
            const next = { ...prev };
            for (const p of selectedTargetPlayers) delete next[p.id];
            return next;
        });
    };

    const addUserPlayer = (player: Player) => {
        if (!selectedUserIds.has(player.id)) {
            setSelectedUserPlayers((prev) => [...prev, player]);
        }
    };

    const addTargetPlayer = (player: Player) => {
        if (!selectedTargetIds.has(player.id)) {
            setSelectedTargetPlayers((prev) => [...prev, player]);
        }
    };

    const removeUserPlayer = (id: number) => {
        setSelectedUserPlayers((prev) => prev.filter((p) => p.id !== id));
        setRetentionMap((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const removeTargetPlayer = (id: number) => {
        setSelectedTargetPlayers((prev) => prev.filter((p) => p.id !== id));
        setRetentionMap((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const updateRetention = (playerId: number, pct: number) => {
        const clamped = Math.min(100, Math.max(0, pct));
        setRetentionMap((prev) => ({ ...prev, [playerId]: clamped }));
    };

    const clearBuilder = () => {
        setSelectedUserPlayers([]);
        setSelectedTargetPlayers([]);
        setRetentionMap({});
        setCashAmount(0);
    };

    const fetchOrgStats = useCallback(async (orgId: number, setter: (m: PlayerStatsMap) => void) => {
        if (statsCacheRef.current.has(orgId)) {
            setter(statsCacheRef.current.get(orgId)!);
            return;
        }
        if (!seasonContext) return;
        try {
            const [battingRes, pitchingRes] = await Promise.all([
                BaseballService.GetBattingLeaders({
                    league_year_id: seasonContext.current_league_year_id,
                    org_id: orgId,
                    min_pa: 0,
                    page_size: 500,
                }),
                BaseballService.GetPitchingLeaders({
                    league_year_id: seasonContext.current_league_year_id,
                    org_id: orgId,
                    page_size: 500,
                }),
            ]);
            const batting = new Map<number, any>();
            const pitching = new Map<number, any>();
            for (const row of battingRes.leaders) batting.set(row.player_id, row);
            for (const row of pitchingRes.leaders) pitching.set(row.player_id, row);
            const map: PlayerStatsMap = { batting, pitching };
            statsCacheRef.current.set(orgId, map);
            setter(map);
        } catch (err) {
            console.error("Failed to load stats for org", orgId, err);
        }
    }, [seasonContext]);

    const handlePropose = async () => {
        if (!userOrg || !targetOrgId || !seasonContext) return;
        if (selectedUserPlayers.length === 0 && selectedTargetPlayers.length === 0)
            return;

        setIsSubmitting(true);
        try {
            const salaryRetention: Record<number, SalaryRetention> = {};
            for (const p of selectedUserPlayers) {
                const pct = retentionMap[p.id];
                if (pct && pct > 0) {
                    salaryRetention[p.id] = {
                        retaining_org_id: userOrg.id,
                        retention_pct: pct / 100,
                    };
                }
            }
            for (const p of selectedTargetPlayers) {
                const pct = retentionMap[p.id];
                if (pct && pct > 0) {
                    salaryRetention[p.id] = {
                        retaining_org_id: targetOrgId,
                        retention_pct: pct / 100,
                    };
                }
            }

            const dto: ProposeTradeRequest = {
                proposing_org_id: userOrg.id,
                receiving_org_id: targetOrgId,
                league_year_id: seasonContext.current_league_year_id,
                proposal: {
                    players_to_b: selectedUserPlayers.map((p) => p.id),
                    players_to_a: selectedTargetPlayers.map((p) => p.id),
                    ...(Object.keys(salaryRetention).length > 0 && {
                        salary_retention: salaryRetention,
                    }),
                    ...(cashAmount !== 0 && { cash_a_to_b: cashAmount }),
                },
            };

            await BaseballService.ProposeTrade(dto);
            enqueueSnackbar("Trade proposal sent!", { variant: "success" });
            clearBuilder();
            await loadProposals();
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to propose trade", {
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async (proposalId: number) => {
        try {
            await BaseballService.CancelProposal(proposalId);
            enqueueSnackbar("Trade proposal cancelled", { variant: "info" });
            await loadProposals();
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to cancel", { variant: "error" });
        }
    };

    const handleAccept = async (proposalId: number) => {
        try {
            await BaseballService.AcceptProposal(proposalId);
            enqueueSnackbar("Trade proposal accepted!", { variant: "success" });
            await loadProposals();
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to accept", { variant: "error" });
        }
    };

    const handleReject = async (proposalId: number) => {
        try {
            await BaseballService.RejectProposal(proposalId);
            enqueueSnackbar("Trade proposal rejected", { variant: "info" });
            await loadProposals();
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to reject", { variant: "error" });
        }
    };

    // ── Guard: no org ─────────────────────────────────────────────────
    if (!userOrg) {
        return (
            <div className="p-6">
                <Text as="h3">
                    You must be assigned to an organization to access trades.
                </Text>
            </div>
        );
    }

    const canPropose =
        selectedUserPlayers.length > 0 || selectedTargetPlayers.length > 0;

    const renderPlayerName = (playerId: number) => {
        const p = playerMap[playerId];
        if (!p) return `Player #${playerId}`;
        return `${p.firstname} ${p.lastname} (${p.ptype}, ${displayLevel(p.league_level)})`;
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
            <Text as="h2" classes="text-2xl font-bold">
                Trades — {userOrg.org_abbrev}
            </Text>

            {/* ═══════ Trade Proposal Builder ═══════ */}
            <Border classes="p-4">
                <Text as="h4" classes="mb-3 font-semibold">
                    Propose a Trade
                </Text>

                {/* Target org selector */}
                <div className="mb-4 max-w-xs">
                    <Text variant="small" classes="mb-1">
                        Trade Partner
                    </Text>
                    <SelectDropdown
                        options={orgOptions}
                        isMulti={false}
                        onChange={handleTargetOrgChange}
                        placeholder="Select organization..."
                        styles={darkSelectStyles}
                        menuPortalTarget={document.body}
                    />
                </div>

                {targetOrgId && (
                    <>
                        {isLoadingRosters ? (
                            <Text>Loading rosters...</Text>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ── Left: You Send ── */}
                                <div className="flex flex-col">
                                    <PlayerPickerTable
                                        players={userPlayers}
                                        selectedIds={selectedUserIds}
                                        onSelect={addUserPlayer}
                                        label={`${userOrg.org_abbrev} Roster`}
                                        orgAbbrev={userOrg.org_abbrev}
                                        statsMap={userStatsMap}
                                        onStatsNeeded={() => fetchOrgStats(userOrg.id, setUserStatsMap)}
                                    />
                                    {selectedUserPlayers.length > 0 && (
                                        <div className="mt-3">
                                            <Text variant="small" classes="font-semibold mb-1">
                                                {userOrg.org_abbrev} Sends ({selectedUserPlayers.length})
                                            </Text>
                                            <div className="flex flex-col gap-2">
                                                {selectedUserPlayers.map((p) => (
                                                    <SelectedPlayerCard
                                                        key={p.id}
                                                        player={p}
                                                        retentionPct={retentionMap[p.id] ?? 0}
                                                        onRetentionChange={(pct) => updateRetention(p.id, pct)}
                                                        onRemove={() => removeUserPlayer(p.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Right: You Receive ── */}
                                <div className="flex flex-col">
                                    <PlayerPickerTable
                                        players={targetPlayers}
                                        selectedIds={selectedTargetIds}
                                        onSelect={addTargetPlayer}
                                        label={`${orgMap[targetOrgId]?.org_abbrev ?? "Target"} Roster`}
                                        orgAbbrev={orgMap[targetOrgId]?.org_abbrev ?? ""}
                                        statsMap={targetStatsMap}
                                        onStatsNeeded={() => fetchOrgStats(targetOrgId, setTargetStatsMap)}
                                    />
                                    {selectedTargetPlayers.length > 0 && (
                                        <div className="mt-3">
                                            <Text variant="small" classes="font-semibold mb-1">
                                                {orgMap[targetOrgId]?.org_abbrev ?? "Target"} Sends ({selectedTargetPlayers.length})
                                            </Text>
                                            <div className="flex flex-col gap-2">
                                                {selectedTargetPlayers.map((p) => (
                                                    <SelectedPlayerCard
                                                        key={p.id}
                                                        player={p}
                                                        retentionPct={retentionMap[p.id] ?? 0}
                                                        onRetentionChange={(pct) => updateRetention(p.id, pct)}
                                                        onRemove={() => removeTargetPlayer(p.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cash + Submit */}
                        <div className="flex flex-wrap items-end gap-4 mt-4">
                            <div className="w-64">
                                <Input
                                    label="Cash"
                                    type="number"
                                    value={cashAmount || ""}
                                    onChange={(e) =>
                                        setCashAmount(Number(e.target.value) || 0)
                                    }
                                    placeholder="+ send / - receive"
                                />
                            </div>
                            <Button
                                size="sm"
                                onClick={handlePropose}
                                disabled={!canPropose || isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Propose Trade"}
                            </Button>
                        </div>
                    </>
                )}
            </Border>

            {/* ═══════ Active Proposals ═══════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sent */}
                <div className="flex flex-col">
                    <Text as="h4" classes="mb-2 font-semibold">
                        Sent Proposals
                    </Text>
                    {sentProposals.length === 0 ? (
                        <Border classes="p-4">
                            <Text>No sent proposals</Text>
                        </Border>
                    ) : (
                        sentProposals.map((tp) => (
                            <ProposalCard
                                key={tp.id}
                                proposal={tp}
                                userOrgId={userOrg.id}
                                orgMap={orgMap}
                                renderPlayerName={renderPlayerName}
                                isSent
                                onCancel={() => handleCancel(tp.id)}
                            />
                        ))
                    )}
                </div>

                {/* Received */}
                <div className="flex flex-col">
                    <Text as="h4" classes="mb-2 font-semibold">
                        Received Proposals
                    </Text>
                    {receivedProposals.length === 0 ? (
                        <Border classes="p-4">
                            <Text>No received proposals</Text>
                        </Border>
                    ) : (
                        receivedProposals.map((tp) => (
                            <ProposalCard
                                key={tp.id}
                                proposal={tp}
                                userOrgId={userOrg.id}
                                orgMap={orgMap}
                                renderPlayerName={renderPlayerName}
                                onAccept={() => handleAccept(tp.id)}
                                onReject={() => handleReject(tp.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════
// ProposalCard — shows a sent or received trade proposal
// ═════════════════════════════════════════════════════════════════════

interface ProposalCardProps {
    proposal: TradeProposal;
    userOrgId: number;
    orgMap: Record<number, BaseballOrganization>;
    renderPlayerName: (id: number) => string;
    isSent?: boolean;
    onCancel?: () => void;
    onAccept?: () => void;
    onReject?: () => void;
}

const ProposalCard: FC<ProposalCardProps> = ({
    proposal,
    userOrgId,
    orgMap,
    renderPlayerName,
    isSent,
    onCancel,
    onAccept,
    onReject,
}) => {
    const otherOrgId = isSent
        ? proposal.receiving_org_id
        : proposal.proposing_org_id;
    const otherOrgAbbrev = orgMap[otherOrgId]?.org_abbrev ?? `Org #${otherOrgId}`;

    const userSends = isSent
        ? proposal.proposal.players_to_b
        : proposal.proposal.players_to_a;
    const userReceives = isSent
        ? proposal.proposal.players_to_a
        : proposal.proposal.players_to_b;

    const cash = proposal.proposal.cash_a_to_b ?? 0;
    const cashDisplay = isSent
        ? cash > 0
            ? `You send $${cash.toLocaleString()}`
            : cash < 0
              ? `You receive $${Math.abs(cash).toLocaleString()}`
              : null
        : cash > 0
          ? `You receive $${cash.toLocaleString()}`
          : cash < 0
            ? `You send $${Math.abs(cash).toLocaleString()}`
            : null;

    const retention = proposal.proposal.salary_retention;
    const canAct = proposal.status === "proposed";

    return (
        <Border classes="p-3 mb-2">
            <div className="flex justify-between items-start mb-2">
                <Text variant="small" classes="font-semibold">
                    Trade with {otherOrgAbbrev}
                </Text>
                <StatusBadge status={proposal.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <Text variant="xs" classes="text-gray-400 mb-1">
                        You send
                    </Text>
                    {userSends.length === 0 ? (
                        <Text variant="xs">—</Text>
                    ) : (
                        userSends.map((pid) => (
                            <div key={pid} className="flex flex-col">
                                <Text variant="xs">{renderPlayerName(pid)}</Text>
                                {retention?.[pid] && (
                                    <Text variant="xs" classes="text-yellow-400">
                                        Salary retained:{" "}
                                        {Math.round(retention[pid].retention_pct * 100)}%
                                    </Text>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div>
                    <Text variant="xs" classes="text-gray-400 mb-1">
                        You receive
                    </Text>
                    {userReceives.length === 0 ? (
                        <Text variant="xs">—</Text>
                    ) : (
                        userReceives.map((pid) => (
                            <div key={pid} className="flex flex-col">
                                <Text variant="xs">{renderPlayerName(pid)}</Text>
                                {retention?.[pid] && (
                                    <Text variant="xs" classes="text-yellow-400">
                                        Salary retained:{" "}
                                        {Math.round(retention[pid].retention_pct * 100)}%
                                    </Text>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {cashDisplay && (
                <Text variant="xs" classes="mt-1 text-green-400">
                    {cashDisplay}
                </Text>
            )}

            {proposal.note && (
                <Text variant="xs" classes="mt-1 text-gray-400 italic">
                    Note: {proposal.note}
                </Text>
            )}

            {canAct && (
                <div className="flex gap-2 mt-2 justify-end">
                    {isSent && onCancel && (
                        <Button size="sm" variant="danger" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    {!isSent && onAccept && (
                        <Button size="sm" onClick={onAccept}>
                            Accept
                        </Button>
                    )}
                    {!isSent && onReject && (
                        <Button size="sm" variant="danger" onClick={onReject}>
                            Reject
                        </Button>
                    )}
                </div>
            )}
        </Border>
    );
};
