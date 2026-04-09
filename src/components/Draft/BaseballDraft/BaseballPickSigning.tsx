import React, { useState } from "react";
import {
  BaseballDraftPick,
  formatSlotValue,
  SignStatus,
} from "../../../models/baseball/baseballDraftModels";
import "../../Team/baseball/baseballMobile.css";

interface BaseballPickSigningProps {
  orgPicks: BaseballDraftPick[];
  orgMap: Record<number, string>;
  onSignPick: (pickId: number) => Promise<void>;
  onPassPick: (pickId: number) => Promise<void>;
  onRefresh: () => void;
  userOrgAbbrev: string;
}

const statusColors: Record<string, string> = {
  signed: "bg-green-600 text-green-100",
  passed: "bg-yellow-600 text-yellow-100",
  refused: "bg-red-600 text-red-100",
  pending: "bg-gray-600 text-gray-200",
};

const BaseballPickSigning: React.FC<BaseballPickSigningProps> = ({
  orgPicks,
  orgMap,
  onSignPick,
  onPassPick,
  onRefresh,
  userOrgAbbrev,
}) => {
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only show picks with selected players
  const picksWithPlayers = orgPicks.filter((p) => p.player_id != null);

  // Budget summary
  const totalPool = picksWithPlayers.reduce((sum, p) => sum + p.slot_value, 0);
  const signedPicks = picksWithPlayers.filter((p) => p.sign_status === "signed");
  const spent = signedPicks.reduce((sum, p) => sum + p.slot_value, 0);
  const remaining = totalPool - spent;

  const runAction = async (pickId: number, action: () => Promise<void>) => {
    setActionLoading(pickId);
    setError(null);
    try {
      await action();
    } catch (err: any) {
      setError(err?.message || "Action failed");
    } finally {
      setActionLoading(null);
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

      {error && (
        <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">{error}</div>
      )}

      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Total Pool</p>
          <p className="text-lg font-bold text-white">
            {formatSlotValue(totalPool)}
          </p>
        </div>
        <div className="rounded border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Signed</p>
          <p className="text-lg font-bold text-green-400">
            {formatSlotValue(spent)}
          </p>
        </div>
        <div className="rounded border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Remaining</p>
          <p className="text-lg font-bold text-blue-400">
            {formatSlotValue(remaining)}
          </p>
        </div>
      </div>

      {/* Signing Table */}
      <div className="baseball-table-wrapper overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="px-3 py-2">Round</th>
              <th className="px-3 py-2">Pick</th>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2">Slot Value</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {picksWithPlayers.map((p) => (
              <tr
                key={p.pick_id}
                className="border-b border-gray-800 hover:bg-gray-800/60"
              >
                <td className="px-3 py-2">{p.round}</td>
                <td className="px-3 py-2">{p.pick_in_round}</td>
                <td className="px-3 py-2 font-medium">{p.player_name}</td>
                <td className="px-3 py-2">{formatSlotValue(p.slot_value)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      statusColors[p.sign_status ?? "pending"] || statusColors.pending
                    }`}
                  >
                    {p.sign_status ?? "pending"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {(p.sign_status === "pending" || p.sign_status == null) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => runAction(p.pick_id, () => onSignPick(p.pick_id))}
                        disabled={actionLoading === p.pick_id}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-medium hover:bg-green-500 disabled:opacity-50"
                      >
                        {actionLoading === p.pick_id ? "..." : "Sign"}
                      </button>
                      <button
                        onClick={() => runAction(p.pick_id, () => onPassPick(p.pick_id))}
                        disabled={actionLoading === p.pick_id}
                        className="rounded bg-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-500 disabled:opacity-50"
                      >
                        Pass
                      </button>
                    </div>
                  )}
                  {p.sign_status === "signed" && (
                    <span className="text-green-400">&#10003;</span>
                  )}
                  {p.sign_status === "passed" && (
                    <span className="text-gray-500">Passed</span>
                  )}
                  {p.sign_status === "refused" && (
                    <span className="text-red-400">Refused</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BaseballPickSigning;
