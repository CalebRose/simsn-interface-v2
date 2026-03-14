import React, { useState, useMemo } from "react";
import {
  BaseballDraftSigningStatus,
  formatSlotValue,
} from "../../../models/baseball/baseballDraftModels";

interface BaseballPickSigningProps {
  signingStatuses: BaseballDraftSigningStatus[];
  onSignPick: (pickId: number, amount: number) => Promise<void>;
  onRefresh: () => void;
  userOrgAbbrev: string;
}

const statusColors: Record<string, string> = {
  signed: "bg-green-600 text-green-100",
  offered: "bg-yellow-600 text-yellow-100",
  refused: "bg-red-600 text-red-100",
  unsigned: "bg-gray-600 text-gray-200",
};

const BaseballPickSigning: React.FC<BaseballPickSigningProps> = ({
  signingStatuses,
  onSignPick,
  onRefresh,
  userOrgAbbrev,
}) => {
  const [signingPickId, setSigningPickId] = useState<number | null>(null);
  const [signAmount, setSignAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const budget = useMemo(() => {
    const totalPool = signingStatuses.reduce((sum, s) => sum + s.slot_value, 0);
    const spent = signingStatuses
      .filter((s) => s.status === "signed")
      .reduce((sum, s) => sum + (s.signed_amount ?? 0), 0);
    return { totalPool, spent, remaining: totalPool - spent };
  }, [signingStatuses]);

  const signingPick = signingStatuses.find((s) => s.pick_id === signingPickId) ?? null;

  const openSignModal = (status: BaseballDraftSigningStatus) => {
    setSigningPickId(status.pick_id);
    setSignAmount(status.slot_value);
    setError(null);
  };

  const closeSignModal = () => {
    setSigningPickId(null);
    setSignAmount(0);
    setError(null);
  };

  const handleSign = async () => {
    if (!signingPickId) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSignPick(signingPickId, signAmount);
      closeSignModal();
    } catch (err: any) {
      setError(err?.message || "Failed to sign player.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Pick Signing — {userOrgAbbrev}</h2>
        <button
          onClick={onRefresh}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Total Pool</p>
          <p className="text-lg font-bold text-white">
            {formatSlotValue(budget.totalPool)}
          </p>
        </div>
        <div className="rounded border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Spent</p>
          <p className="text-lg font-bold text-green-400">
            {formatSlotValue(budget.spent)}
          </p>
        </div>
        <div className="rounded border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Remaining</p>
          <p className="text-lg font-bold text-blue-400">
            {formatSlotValue(budget.remaining)}
          </p>
        </div>
      </div>

      {/* Signing Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="px-3 py-2">Round</th>
              <th className="px-3 py-2">Pick</th>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2">Position</th>
              <th className="px-3 py-2">Slot Value</th>
              <th className="px-3 py-2">Offered</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {signingStatuses.map((s) => {
              const round = Math.ceil(s.overall_pick / 30);
              const pick = s.overall_pick % 30 || 30;
              return (
                <tr
                  key={s.pick_id}
                  className="border-b border-gray-800 hover:bg-gray-800/60"
                >
                  <td className="px-3 py-2">{round}</td>
                  <td className="px-3 py-2">{pick}</td>
                  <td className="px-3 py-2 font-medium">{s.player_name}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-gray-700 px-1.5 py-0.5 text-xs font-mono">
                      —
                    </span>
                  </td>
                  <td className="px-3 py-2">{formatSlotValue(s.slot_value)}</td>
                  <td className="px-3 py-2">
                    {s.offered_amount !== null
                      ? formatSlotValue(s.offered_amount)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        statusColors[s.status] || statusColors.unsigned
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {s.status === "unsigned" && (
                      <button
                        onClick={() => openSignModal(s)}
                        className="rounded bg-blue-600 px-3 py-1 text-xs font-medium hover:bg-blue-500"
                      >
                        Sign
                      </button>
                    )}
                    {s.status === "offered" && (
                      <span className="text-xs text-yellow-400">Pending...</span>
                    )}
                    {s.status === "signed" && (
                      <span className="text-green-400">&#10003;</span>
                    )}
                    {s.status === "refused" && (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Signing Modal */}
      {signingPick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-xl">
            <h3 className="mb-4 text-lg font-bold">Sign Player</h3>

            <div className="mb-3">
              <p className="text-sm text-gray-400">Player</p>
              <p className="font-medium">{signingPick.player_name}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400">Slot Value</p>
              <p className="font-medium">{formatSlotValue(signingPick.slot_value)}</p>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-400">Amount ($)</label>
              <input
                type="number"
                value={signAmount}
                onChange={(e) => setSignAmount(Number(e.target.value))}
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>

            {error && (
              <div className="mb-3 rounded bg-red-900/50 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeSignModal}
                className="rounded bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={submitting}
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
              >
                {submitting ? "Signing..." : "Sign Player"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseballPickSigning;
