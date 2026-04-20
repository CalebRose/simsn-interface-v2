import { FC, useEffect, useMemo, useState } from "react";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import { formatMoney } from "../../baseball/BaseballFinancials/financialConstants";
import { getTextColorBasedOnBg } from "../../../../_utility/getBorderClass";
import type {
  ScoutingBudget,
  ScoutingDepartmentStatus,
  ScoutingAction,
  DepartmentTierScheduleEntry,
} from "../../../../models/baseball/baseballScoutingModels";

const ACTION_LABELS: Record<string, string> = {
  hs_report: "HS Reports",
  recruit_potential_fuzzed: "Recruit Potential (fuzzed)",
  recruit_potential_precise: "Recruit Potential (precise)",
  college_potential_precise: "College Potential",
  draft_attrs_fuzzed: "Draft Attrs (fuzzed)",
  draft_attrs_precise: "Draft Attrs (precise)",
  draft_potential_precise: "Draft Potential",
  pro_attrs_precise: "Pro Attrs",
  pro_potential_precise: "Pro Potential",
};

interface ScoutingDepartmentPanelProps {
  orgId: number;
  leagueYearId: number;
  budget: ScoutingBudget | null;
  /** Increment to force a refresh */
  refreshKey?: number;
  /** Called after a successful purchase so parent can refresh budget */
  onPurchased?: () => void;
  /** Called when eligibility is determined so the parent can hide/show its wrapper */
  onEligibilityChange?: (eligible: boolean) => void;
  /** Team accent color for the upgrade button (hex). Falls back to green. */
  accentColor?: string;
}

export const ScoutingDepartmentPanel: FC<ScoutingDepartmentPanelProps> = ({
  orgId,
  leagueYearId,
  budget,
  refreshKey = 0,
  onPurchased,
  onEligibilityChange,
  accentColor,
}) => {
  const [dept, setDept] = useState<ScoutingDepartmentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [actions, setActions] = useState<ScoutingAction[]>([]);

  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      BaseballService.GetDepartmentStatus(orgId, leagueYearId),
      BaseballService.GetScoutingActions(orgId, leagueYearId),
    ])
      .then(([d, actionsResp]) => {
        if (cancelled) return;
        setDept(d);
        setActions(actionsResp?.actions ?? []);
        onEligibilityChange?.(d?.eligible ?? false);
      })
      .catch(() => {
        if (cancelled) return;
        setDept(null);
        setActions([]);
        onEligibilityChange?.(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [orgId, leagueYearId, refreshKey]);

  const btnStyle = useMemo(() => {
    if (!accentColor) return undefined;
    return { backgroundColor: accentColor, color: getTextColorBasedOnBg(accentColor) === "text-white" ? "#fff" : "#111" };
  }, [accentColor]);

  const spendingBreakdown = useMemo(() => {
    if (!actions.length) return [];
    const grouped: Record<string, { count: number; points: number }> = {};
    for (const a of actions) {
      const key = a.action_type;
      if (!grouped[key]) grouped[key] = { count: 0, points: 0 };
      grouped[key].count += 1;
      grouped[key].points += a.points_spent;
    }
    return Object.entries(grouped)
      .map(([type, { count, points }]) => ({
        type,
        label: ACTION_LABELS[type] ?? type,
        count,
        points,
      }))
      .sort((a, b) => b.points - a.points);
  }, [actions]);

  if (loading || !dept || !dept.eligible) return null;

  const handlePurchase = async () => {
    setShowConfirm(false);
    setPurchasing(true);
    setError(null);
    try {
      await BaseballService.PurchaseDepartmentTier({
        org_id: orgId,
        league_year_id: leagueYearId,
      });
      // Refresh department status
      const updated = await BaseballService.GetDepartmentStatus(orgId, leagueYearId);
      setDept(updated);
      onPurchased?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Purchase failed";
      setError(msg);
    } finally {
      setPurchasing(false);
    }
  };

  const currentTier = dept.current_tier ?? 0;
  const maxTier = dept.max_tier ?? 11;
  const baseBudget = dept.base_budget;
  const bonusPoints = dept.bonus_points ?? 0;
  const totalBudget = dept.total_budget;
  const spent = budget?.spent_points ?? 0;
  const spentPct = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  const basePct = totalBudget > 0 ? (baseBudget / totalBudget) * 100 : 100;

  return (
    <div className="space-y-3">
      {/* Budget bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Text variant="small" classes="font-semibold">
            Scouting Budget
          </Text>
          <Text variant="xs" classes="text-gray-400">
            Tier {currentTier} / {maxTier}
          </Text>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          {/* Spent portion */}
          <div
            className="h-full bg-blue-500 dark:bg-blue-400 transition-all"
            style={{ width: `${spentPct}%` }}
          />
          {/* Remaining base (unspent) */}
          <div
            className="h-full bg-gray-400 dark:bg-gray-500 transition-all"
            style={{ width: `${Math.max(0, basePct - spentPct)}%` }}
          />
          {/* Bonus portion (unspent) */}
          {bonusPoints > 0 && (
            <div
              className="h-full bg-green-500 dark:bg-green-400 transition-all"
              style={{ width: `${(bonusPoints / totalBudget) * 100}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <Text variant="xs" classes="text-gray-400">
            {spent.toLocaleString()} / {totalBudget.toLocaleString()} pts used
          </Text>
          <Text variant="xs" classes="text-gray-500">
            Base: {baseBudget.toLocaleString()} {bonusPoints > 0 && <>| Bonus: +{bonusPoints.toLocaleString()}</>}
          </Text>
        </div>
      </div>

      {/* Upgrade button */}
      <div className="flex items-center gap-3 flex-wrap">
        {dept.next_tier ? (
          <>
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={purchasing}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  btnStyle ? "hover:brightness-110" : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                style={btnStyle}
              >
                Expand Department — {formatMoney(dept.next_tier.cost)} for +{dept.next_tier.points_gained.toLocaleString()} pts
              </button>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                <Text variant="xs" classes="text-yellow-300">
                  Spend {formatMoney(dept.next_tier!.cost)} to gain +{dept.next_tier!.points_gained.toLocaleString()} scouting points?
                </Text>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className={`px-2 py-1 text-xs font-semibold rounded transition-colors disabled:opacity-50 ${
                    btnStyle ? "hover:brightness-110" : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  style={btnStyle}
                >
                  {purchasing ? "Purchasing..." : "Confirm"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-2 py-1 text-xs font-semibold rounded bg-gray-600 hover:bg-gray-500
                    text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-600 text-gray-300">
            Max Tier Reached
          </span>
        )}
        <button
          onClick={() => setShowSchedule((s) => !s)}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          {showSchedule ? "Hide" : "Show"} Tier Schedule
        </button>
        {spendingBreakdown.length > 0 && (
          <button
            onClick={() => setShowBreakdown((s) => !s)}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            {showBreakdown ? "Hide" : "Show"} Spending Breakdown
          </button>
        )}
      </div>

      {error && (
        <Text variant="xs" classes="text-red-400">
          {error}
        </Text>
      )}

      {/* Tier schedule table */}
      {showSchedule && dept.tier_schedule && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="px-2 py-1 text-left">Tier</th>
                <th className="px-2 py-1 text-right">Cost</th>
                <th className="px-2 py-1 text-right">Points</th>
                <th className="px-2 py-1 text-right">Total</th>
                <th className="px-2 py-1 text-right">$/Point</th>
              </tr>
            </thead>
            <tbody>
              {dept.tier_schedule.map((t: DepartmentTierScheduleEntry) => {
                const isPurchased = t.tier <= currentTier;
                const isNext = t.tier === currentTier + 1;
                return (
                  <tr
                    key={t.tier}
                    className={`border-b border-gray-800 ${
                      isPurchased
                        ? "text-gray-500"
                        : isNext
                        ? "text-green-400 font-semibold"
                        : ""
                    }`}
                  >
                    <td className="px-2 py-1">
                      {t.tier}{isPurchased && " *"}
                    </td>
                    <td className="px-2 py-1 text-right">{formatMoney(t.cost)}</td>
                    <td className="px-2 py-1 text-right">+{t.points_gained.toLocaleString()}</td>
                    <td className="px-2 py-1 text-right">{t.cumulative_total.toLocaleString()}</td>
                    <td className="px-2 py-1 text-right">{formatMoney(t.cost_per_point)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Text variant="xs" classes="text-gray-500 mt-1">* = purchased this season</Text>
        </div>
      )}

      {/* Spending breakdown */}
      {showBreakdown && spendingBreakdown.length > 0 && (
        <div>
          <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="px-2 py-1 text-left">Category</th>
                    <th className="px-2 py-1 text-right">Actions</th>
                    <th className="px-2 py-1 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {spendingBreakdown.map((row) => (
                    <tr key={row.type} className="border-b border-gray-800">
                      <td className="px-2 py-1">{row.label}</td>
                      <td className="px-2 py-1 text-right">{row.count}</td>
                      <td className="px-2 py-1 text-right">{row.points.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-600 font-semibold">
                    <td className="px-2 py-1">Total</td>
                    <td className="px-2 py-1 text-right">
                      {spendingBreakdown.reduce((s, r) => s + r.count, 0)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {spendingBreakdown.reduce((s, r) => s + r.points, 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
      )}

      {/* Purchase history */}
      {dept.purchases && dept.purchases.length > 0 && (
        <div>
          <button
            onClick={() => {}} // inline toggle could be added if desired
            className="text-xs text-gray-400 mb-1"
          >
            {dept.purchases.length} upgrade{dept.purchases.length !== 1 ? "s" : ""} this season
          </button>
        </div>
      )}
    </div>
  );
};
