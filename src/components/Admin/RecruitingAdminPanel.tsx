import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { BaseballService } from "../../_services/baseballService";
import { useSnackbar } from "notistack";
import type { RecruitingState } from "../../models/baseball/baseballRecruitingModels";
import type {
    AdvanceRecruitingWeekResponse,
    RecruitingSummaryResponse,
    OrgLeaderboardEntry,
    PlayerDemandEntry,
    OrgDetailResponse,
} from "../../models/baseball/baseballAdminModels";

interface RecruitingAdminPanelProps {
    leagueYearId: number;
}

type ReportTab = "summary" | "leaderboard" | "demand" | "org-detail";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-gray-500 text-white",
    active: "bg-green-600 text-white",
    complete: "bg-blue-600 text-white",
};

const STAR_DISPLAY = (n: number) => "\u2605".repeat(n);

export const RecruitingAdminPanel: FC<RecruitingAdminPanelProps> = ({ leagueYearId }) => {
    const { enqueueSnackbar } = useSnackbar();

    // State
    const [recruitState, setRecruitState] = useState<RecruitingState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBusy, setIsBusy] = useState(false);
    const [lastAdvance, setLastAdvance] = useState<AdvanceRecruitingWeekResponse | null>(null);

    // Reports
    const [reportTab, setReportTab] = useState<ReportTab>("summary");
    const [summary, setSummary] = useState<RecruitingSummaryResponse | null>(null);
    const [leaderboard, setLeaderboard] = useState<OrgLeaderboardEntry[]>([]);
    const [demandPlayers, setDemandPlayers] = useState<PlayerDemandEntry[]>([]);
    const [demandStarFilter, setDemandStarFilter] = useState<number | undefined>(undefined);
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [orgDetail, setOrgDetail] = useState<OrgDetailResponse | null>(null);
    const [reportLoading, setReportLoading] = useState(false);



    const loadState = useCallback(async () => {
        try {
            const s = await BaseballService.GetRecruitingState(leagueYearId);
            setRecruitState(s);
        } catch (e: any) {
            enqueueSnackbar(e?.message || "Failed to load recruiting state", { variant: "error" });
        }
        setIsLoading(false);
    }, [leagueYearId, enqueueSnackbar]);

    useEffect(() => { loadState(); }, [loadState]);

    const handleAdvance = useCallback(async () => {
        setIsBusy(true);
        setLastAdvance(null);
        try {
            const res = await BaseballService.AdvanceRecruitingWeek({ league_year_id: leagueYearId });
            setLastAdvance(res);
            setRecruitState((prev) => prev ? { ...prev, current_week: res.new_week, status: res.status as any } : prev);
            enqueueSnackbar(
                `Recruiting advanced to Week ${res.new_week}${res.status === "complete" ? " (complete)" : ""}`,
                { variant: "success" },
            );
        } catch (e: any) {
            enqueueSnackbar(e?.message || "Failed to advance recruiting", { variant: "error" });
        }
        setIsBusy(false);
    }, [leagueYearId, enqueueSnackbar]);

    // Report loading
    const loadReport = useCallback(async (tab: ReportTab) => {
        setReportLoading(true);
        try {
            switch (tab) {
                case "summary": {
                    const s = await BaseballService.GetRecruitingSummary(leagueYearId);
                    setSummary(s);
                    break;
                }
                case "leaderboard": {
                    const lb = await BaseballService.GetOrgLeaderboard(leagueYearId);
                    setLeaderboard(lb.leaderboard);
                    break;
                }
                case "demand": {
                    const d = await BaseballService.GetPlayerDemand({
                        league_year_id: leagueYearId,
                        star_rating: demandStarFilter,
                        limit: 50,
                    });
                    setDemandPlayers(d.players);
                    break;
                }
                case "org-detail": {
                    if (selectedOrgId) {
                        const od = await BaseballService.GetOrgDetail(selectedOrgId, leagueYearId);
                        setOrgDetail(od);
                    }
                    break;
                }
            }
        } catch (e: any) {
            enqueueSnackbar(e?.message || "Failed to load report", { variant: "error" });
        }
        setReportLoading(false);
    }, [leagueYearId, demandStarFilter, selectedOrgId, enqueueSnackbar]);

    const handleTabChange = useCallback((tab: ReportTab) => {
        setReportTab(tab);
        loadReport(tab);
    }, [loadReport]);


    // Button label
    const advanceLabel = useMemo(() => {
        if (!recruitState) return "";
        if (recruitState.status === "pending") return "Initialize Recruiting";
        if (recruitState.current_week >= 20) return "Close Recruiting";
        return `Advance to Week ${recruitState.current_week + 1}`;
    }, [recruitState]);

    if (isLoading) {
        return (
            <Border classes="w-full mt-4">
                <div className="p-4">
                    <Text variant="h6">College Recruiting</Text>
                    <Text variant="small" classes="text-gray-400 py-4 text-center">Loading...</Text>
                </div>
            </Border>
        );
    }

    if (!recruitState) return null;

    const progressPct = recruitState.total_weeks > 0
        ? Math.round((recruitState.current_week / recruitState.total_weeks) * 100)
        : 0;

    return (
        <Border classes="w-full mt-4">
            <div className="p-4">
                <Text variant="h6" classes="mb-3">College Recruiting</Text>

                    {/* Status bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[recruitState.status]}`}>
                            {recruitState.status.charAt(0).toUpperCase() + recruitState.status.slice(1)}
                        </span>
                        <span className="text-sm font-medium">
                            Week {recruitState.current_week} of {recruitState.total_weeks}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">{progressPct}%</span>
                    </div>

                    {/* Advance button */}
                    <div className="mb-4">
                        <Button
                            size="sm"
                            disabled={isBusy || recruitState.status === "complete"}
                            onClick={handleAdvance}
                        >
                            {advanceLabel}
                        </Button>
                    </div>

                    {/* Last advance results */}
                    {lastAdvance && (
                        <div className="border rounded p-3 mb-4 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                            <Text variant="body-small" classes="font-semibold mb-1">
                                Week {lastAdvance.previous_week} Results
                            </Text>
                            {lastAdvance.ranked_players != null && (
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    {lastAdvance.ranked_players.toLocaleString()} players ranked and available for recruiting.
                                </p>
                            )}
                            {lastAdvance.commitments && lastAdvance.commitments.length > 0 && (
                                <div className="mt-1">
                                    <p className="text-xs text-gray-500 mb-1">
                                        {lastAdvance.commitments.length} commitment{lastAdvance.commitments.length !== 1 ? "s" : ""}:
                                    </p>
                                    <ul className="text-sm space-y-0.5">
                                        {lastAdvance.commitments.map((c) => (
                                            <li key={c.player_id} className="text-green-700 dark:text-green-300">
                                                {c.player_name} ({STAR_DISPLAY(c.star_rating)}) &rarr; {c.org_abbrev} ({c.points_total} pts)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {lastAdvance.cleanup_commitments && lastAdvance.cleanup_commitments.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 italic mb-1">
                                        Assigned by default (highest investment):
                                    </p>
                                    <ul className="text-sm space-y-0.5">
                                        {lastAdvance.cleanup_commitments.map((c) => (
                                            <li key={c.player_id} className="text-yellow-700 dark:text-yellow-300 italic">
                                                {c.player_name} ({STAR_DISPLAY(c.star_rating)}) &rarr; {c.org_abbrev} ({c.points_total} pts)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reports section */}
                    <div className="border rounded p-3 mb-3 dark:border-gray-700">
                        <Text variant="body-small" classes="font-semibold mb-2">Reports</Text>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {(["summary", "leaderboard", "demand"] as ReportTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                                        reportTab === tab
                                            ? "bg-orange-500 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    }`}
                                    onClick={() => handleTabChange(tab)}
                                >
                                    {tab === "summary" ? "Summary" : tab === "leaderboard" ? "Org Leaderboard" : "Player Demand"}
                                </button>
                            ))}
                        </div>

                        {reportLoading ? (
                            <Text variant="small" classes="text-gray-400 py-4 text-center">Loading report...</Text>
                        ) : (
                            <>
                                {/* Summary report */}
                                {reportTab === "summary" && summary?.state && (
                                    <div>
                                        <div className="flex flex-wrap gap-3 mb-3 text-sm">
                                            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                                                Pool: <strong>{summary.state.pool_size?.toLocaleString() ?? 0}</strong>
                                            </span>
                                            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                                                Committed: <strong>{summary.commitments?.committed_count ?? 0}</strong>
                                            </span>
                                            <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                                                Active Orgs: <strong>{summary.investment_activity?.active_orgs ?? 0}</strong>
                                            </span>
                                            <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200">
                                                Avg Winning Pts: <strong>{summary.commitments?.avg_winning_points?.toFixed(1) ?? "0.0"}</strong>
                                            </span>
                                        </div>
                                        {/* Star distribution */}
                                        {summary.stars && (
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-500 mb-1 font-semibold">Star Distribution (committed / total)</p>
                                            <div className="space-y-1">
                                                {[5, 4, 3, 2, 1].map((star) => {
                                                    const total = summary.stars?.star_distribution?.[String(star)] ?? 0;
                                                    const committed = summary.stars?.committed_by_star?.[String(star)] ?? 0;
                                                    const pct = total > 0 ? (committed / total) * 100 : 0;
                                                    return (
                                                        <div key={star} className="flex items-center gap-2 text-xs">
                                                            <span className="w-16 text-yellow-500 font-mono">{STAR_DISPLAY(star)}</span>
                                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden">
                                                                <div className="bg-orange-400 h-full rounded" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="w-16 text-right text-gray-500">{committed}/{total}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                )}

                                {/* Leaderboard */}
                                {reportTab === "leaderboard" && leaderboard?.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                                                    <th className="px-2 py-1">Org</th>
                                                    <th className="px-2 py-1 text-center">Won</th>
                                                    <th className="px-2 py-1 text-center">Avg Star</th>
                                                    <th className="px-2 py-1 text-right">Points</th>
                                                    <th className="px-2 py-1 text-center">Targeted</th>
                                                    <th className="px-2 py-1 text-center">Budget %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.map((org, idx) => (
                                                    <tr
                                                        key={org.org_id}
                                                        className={`border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
                                                        onClick={() => {
                                                            setSelectedOrgId(org.org_id);
                                                            setReportTab("org-detail");
                                                            loadReport("org-detail");
                                                        }}
                                                    >
                                                        <td className="px-2 py-1 font-medium">{org.org_abbrev}</td>
                                                        <td className="px-2 py-1 text-center">{org.commitments_won}</td>
                                                        <td className="px-2 py-1 text-center">{org.avg_star.toFixed(1)}</td>
                                                        <td className="px-2 py-1 text-right">{org.total_points_invested.toLocaleString()}</td>
                                                        <td className="px-2 py-1 text-center">{org.players_targeted}</td>
                                                        <td className="px-2 py-1 text-center">
                                                            <span className={org.budget_utilization_pct > 0.9 ? "text-red-500 font-semibold" : ""}>
                                                                {Math.round(org.budget_utilization_pct * 100)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Player Demand */}
                                {reportTab === "demand" && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-xs text-gray-500">Star filter:</label>
                                            <select
                                                className="rounded border px-2 py-1 text-xs dark:bg-gray-800 dark:border-gray-600"
                                                value={demandStarFilter ?? "all"}
                                                onChange={(e) => {
                                                    const val = e.target.value === "all" ? undefined : Number(e.target.value);
                                                    setDemandStarFilter(val);
                                                }}
                                            >
                                                <option value="all">All Stars</option>
                                                {[5, 4, 3, 2, 1].map((s) => (
                                                    <option key={s} value={s}>{STAR_DISPLAY(s)}</option>
                                                ))}
                                            </select>
                                            <Button size="xs" variant="secondaryOutline" onClick={() => loadReport("demand")}>
                                                Refresh
                                            </Button>
                                        </div>
                                        {demandPlayers?.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse text-sm">
                                                    <thead>
                                                        <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                                                            <th className="px-2 py-1">Player</th>
                                                            <th className="px-2 py-1 text-center">Stars</th>
                                                            <th className="px-2 py-1 text-center">Type</th>
                                                            <th className="px-2 py-1 text-center">Orgs</th>
                                                            <th className="px-2 py-1 text-right">Interest</th>
                                                            <th className="px-2 py-1">Top Orgs</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {demandPlayers.map((p, idx) => (
                                                            <tr
                                                                key={p.player_id}
                                                                className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
                                                            >
                                                                <td className="px-2 py-1 font-medium">{p.player_name}</td>
                                                                <td className="px-2 py-1 text-center text-yellow-500">{STAR_DISPLAY(p.star_rating)}</td>
                                                                <td className="px-2 py-1 text-center text-xs">{p.ptype}</td>
                                                                <td className="px-2 py-1 text-center">{p.num_orgs_targeting}</td>
                                                                <td className="px-2 py-1 text-right">{p.total_interest}</td>
                                                                <td className="px-2 py-1 text-xs text-gray-500">
                                                                    {p.top_orgs.slice(0, 3).map((o) => o.org_abbrev).join(", ")}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Org Detail */}
                                {reportTab === "org-detail" && orgDetail && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button
                                                className="text-xs text-blue-500 hover:underline"
                                                onClick={() => handleTabChange("leaderboard")}
                                            >
                                                &larr; Back to Leaderboard
                                            </button>
                                            <span className="font-semibold text-sm">{orgDetail.org_abbrev}</span>
                                        </div>
                                        {/* Commitments */}
                                        {orgDetail.commitments?.length > 0 && (
                                            <div className="mb-2">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Commitments ({orgDetail.commitments.length})</p>
                                                <ul className="text-sm space-y-0.5">
                                                    {orgDetail.commitments.map((c) => (
                                                        <li key={c.player_id}>
                                                            <span className="text-yellow-500">{STAR_DISPLAY(c.star_rating)}</span>{" "}
                                                            {c.player_name} (Wk {c.week_committed}, {c.points_total} pts)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {/* Active investments */}
                                        {orgDetail.investments?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Active Investments ({orgDetail.investments.length})</p>
                                                <ul className="text-sm space-y-0.5">
                                                    {orgDetail.investments.map((inv) => (
                                                        <li key={inv.player_id} className="text-gray-600 dark:text-gray-400">
                                                            <span className="text-yellow-500">{STAR_DISPLAY(inv.star_rating)}</span>{" "}
                                                            {inv.player_name} &mdash; {inv.invested_points} pts ({inv.status})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
        </Border>
    );
};
