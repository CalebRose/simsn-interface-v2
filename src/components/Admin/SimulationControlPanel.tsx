import { FC, useCallback, useEffect, useState } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { Modal } from "../../_design/Modal";
import { BaseballService } from "../../_services/baseballService";
import { useSnackbar } from "notistack";
import { Timestamp } from "../../models/baseball/baseballModels";

interface SimulationControlPanelProps {
    leagueYearId: number;
}

type Phase = "REGULAR_SEASON" | "OFFSEASON" | "FREE_AGENCY" | "DRAFT" | "RECRUITING";

function derivePhase(ts: Timestamp): Phase {
    if (!ts.IsOffSeason) return "REGULAR_SEASON";
    if (!ts.IsFreeAgencyLocked) return "FREE_AGENCY";
    if (ts.IsDraftTime) return "DRAFT";
    if (!ts.IsRecruitingLocked) return "RECRUITING";
    return "OFFSEASON";
}

const PHASE_COLORS: Record<Phase, string> = {
    REGULAR_SEASON: "bg-green-600 text-white",
    OFFSEASON: "bg-gray-500 text-white",
    FREE_AGENCY: "bg-blue-600 text-white",
    DRAFT: "bg-purple-600 text-white",
    RECRUITING: "bg-orange-500 text-white",
};

const PHASE_LABELS: Record<Phase, string> = {
    REGULAR_SEASON: "Regular Season",
    OFFSEASON: "Offseason",
    FREE_AGENCY: "Free Agency",
    DRAFT: "Draft",
    RECRUITING: "Recruiting",
};

const SUBWEEK_LABELS = ["A", "B", "C", "D"] as const;

export const SimulationControlPanel: FC<SimulationControlPanelProps> = ({ leagueYearId }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [ts, setTs] = useState<Timestamp | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBusy, setIsBusy] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ label: string; action: () => Promise<void> } | null>(null);


    const loadTimestamp = useCallback(async () => {
        try {
            const data = await BaseballService.GetTimestamp();
            setTs(new Timestamp(data));
        } catch (e: any) {
            enqueueSnackbar(e?.message || "Failed to load timestamp", { variant: "error" });
        }
        setIsLoading(false);
    }, [enqueueSnackbar]);

    useEffect(() => { loadTimestamp(); }, [loadTimestamp]);

    const exec = useCallback(async (label: string, fn: () => Promise<void>) => {
        setIsBusy(true);
        try {
            await fn();
            enqueueSnackbar(label + " succeeded", { variant: "success" });
            await loadTimestamp();
        } catch (e: any) {
            enqueueSnackbar(e?.message || `${label} failed`, { variant: "error" });
        }
        setIsBusy(false);
    }, [enqueueSnackbar, loadTimestamp]);

    const confirmAndExec = useCallback((label: string, fn: () => Promise<void>) => {
        setConfirmAction({ label, action: fn });
    }, []);

    if (isLoading || !ts) {
        return (
            <Border classes="w-full mt-4">
                <div className="p-4">
                    <Text variant="h6">Simulation Control</Text>
                    <Text variant="small" classes="text-gray-400 py-4 text-center">
                        Loading...
                    </Text>
                </div>
            </Border>
        );
    }

    const phase = derivePhase(ts);
    const allGamesRan = ts.GamesARan && ts.GamesBRan && ts.GamesCRan && ts.GamesDRan;
    const weekReady = !ts.RunGames && !allGamesRan;
    const canAdvance = !ts.RunGames && allGamesRan;
    const subweekFlags = [ts.GamesARan, ts.GamesBRan, ts.GamesCRan, ts.GamesDRan];

    return (
        <>
            <Border classes="w-full mt-4">
                <div className="p-4">
                    <Text variant="h6" classes="mb-3">Simulation Control</Text>

                    {/* Status bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PHASE_COLORS[phase]}`}>
                            {PHASE_LABELS[phase]}
                        </span>
                        <span className="text-sm font-medium">
                            Season {ts.Season} &middot; Week {ts.Week}
                        </span>
                        {ts.FreeAgencyRound > 0 && (
                            <span className="text-sm text-blue-500 font-medium">
                                FA Round {ts.FreeAgencyRound}
                            </span>
                        )}
                    </div>

                    {/* Subweek indicators (regular season only) */}
                    {phase === "REGULAR_SEASON" && (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs text-gray-500 mr-1">Subweeks:</span>
                            {SUBWEEK_LABELS.map((label, i) => (
                                <span
                                    key={label}
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded text-xs font-semibold border ${
                                        ts.RunGames && !subweekFlags[i]
                                            ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 animate-pulse"
                                            : subweekFlags[i]
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600"
                                            : "border-gray-300 dark:border-gray-600 text-gray-400"
                                    }`}
                                >
                                    {subweekFlags[i] ? "\u2713" : label}
                                </span>
                            ))}
                            {ts.RunGames && (
                                <span className="text-xs text-yellow-600 font-medium ml-2">
                                    Simulating...
                                </span>
                            )}
                        </div>
                    )}

                    {/* Week Actions (regular season) */}
                    {phase === "REGULAR_SEASON" && (
                        <div className="border rounded p-3 mb-3 dark:border-gray-700">
                            <Text variant="body-small" classes="font-semibold mb-2">Week Actions</Text>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    disabled={isBusy || ts.RunGames || !weekReady}
                                    onClick={() => exec("Simulate Week", async () => {
                                        await BaseballService.SimulateWeek({
                                            league_year_id: leagueYearId,
                                            season_week: ts.Week,
                                        });
                                    })}
                                >
                                    Simulate Week {ts.Week}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="success"
                                    disabled={isBusy || ts.RunGames || !canAdvance}
                                    onClick={() => exec("Advance Week", async () => {
                                        await BaseballService.AdvanceWeek();
                                    })}
                                >
                                    Advance to Week {ts.Week + 1}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="warning"
                                    disabled={isBusy || ts.RunGames}
                                    onClick={() => confirmAndExec("Reset Week", async () => {
                                        await BaseballService.ResetWeek();
                                    })}
                                >
                                    Reset Week
                                </Button>
                            </div>

                            {/* Subweek simulation */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {SUBWEEK_LABELS.map((label, i) => (
                                    <Button
                                        key={label}
                                        size="xs"
                                        variant="secondaryOutline"
                                        disabled={isBusy || ts.RunGames || subweekFlags[i]}
                                        onClick={() => exec(`Simulate Subweek ${label}`, async () => {
                                            await BaseballService.SimulateSubweek({
                                                league_year_id: leagueYearId,
                                                season_week: ts.Week,
                                                subweek: label.toLowerCase() as "a" | "b" | "c" | "d",
                                            });
                                        })}
                                    >
                                        Subweek {label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Phase Control */}
                    <div className="border rounded p-3 dark:border-gray-700">
                        <Text variant="body-small" classes="font-semibold mb-2">Phase Control</Text>
                        <div className="flex flex-wrap gap-2">
                            {/* Offseason buttons */}
                            {phase === "OFFSEASON" && (
                                <>
                                    <Button
                                        size="sm"
                                        disabled={isBusy}
                                        onClick={() => exec("Start Free Agency", async () => {
                                            await BaseballService.StartFreeAgency();
                                        })}
                                    >
                                        Start Free Agency
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={isBusy}
                                        onClick={() => exec("Start Draft", async () => {
                                            await BaseballService.StartDraftPhase();
                                        })}
                                    >
                                        Start Draft
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="sort"
                                        disabled={isBusy}
                                        onClick={() => exec("Unlock Recruiting", async () => {
                                            await BaseballService.StartRecruiting();
                                        })}
                                    >
                                        Unlock Recruiting
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="success"
                                        disabled={isBusy}
                                        onClick={() => confirmAndExec("Start New Season", async () => {
                                            await BaseballService.StartNewSeason({ league_year_id: leagueYearId + 1 });
                                        })}
                                    >
                                        Start New Season
                                    </Button>
                                </>
                            )}

                            {/* Free Agency buttons */}
                            {phase === "FREE_AGENCY" && (
                                <>
                                    <Button
                                        size="sm"
                                        disabled={isBusy}
                                        onClick={() => exec("Advance FA Round", async () => {
                                            await BaseballService.AdvanceFARound();
                                        })}
                                    >
                                        Advance FA Round {ts.FreeAgencyRound + 1}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        disabled={isBusy}
                                        onClick={() => confirmAndExec("End Free Agency", async () => {
                                            await BaseballService.EndFreeAgency();
                                        })}
                                    >
                                        End Free Agency
                                    </Button>
                                </>
                            )}

                            {/* Draft buttons */}
                            {phase === "DRAFT" && (
                                <Button
                                    size="sm"
                                    variant="danger"
                                    disabled={isBusy}
                                    onClick={() => confirmAndExec("End Draft", async () => {
                                        await BaseballService.EndDraftPhase();
                                    })}
                                >
                                    End Draft Phase
                                </Button>
                            )}

                            {/* Recruiting buttons */}
                            {phase === "RECRUITING" && (
                                <Button
                                    size="sm"
                                    variant="danger"
                                    disabled={isBusy}
                                    onClick={() => confirmAndExec("Lock Recruiting", async () => {
                                        await BaseballService.EndRecruiting();
                                    })}
                                >
                                    Lock Recruiting
                                </Button>
                            )}

                            {/* Regular season - no phase controls except End Season above */}
                            {phase === "REGULAR_SEASON" && (
                                <span className="text-xs text-gray-400 py-2">
                                    Phase controls available during offseason
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Border>

            {/* Confirmation modal */}
            <Modal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                title="Confirm Action"
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setConfirmAction(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={isBusy}
                            onClick={async () => {
                                if (!confirmAction) return;
                                setConfirmAction(null);
                                await exec(confirmAction.label, confirmAction.action);
                            }}
                        >
                            Confirm
                        </Button>
                    </div>
                }
            >
                <Text variant="body">
                    Are you sure you want to <strong>{confirmAction?.label}</strong>?
                </Text>
            </Modal>
        </>
    );
};
