import React, { useState } from "react";
import {
  BaseballDraftPick,
  DraftPhase,
  formatSlotValue,
  SignStatus,
} from "../../../models/baseball/baseballDraftModels";
import "../../Team/baseball/baseballMobile.css";

interface BaseballMyPicksProps {
  orgPicks: BaseballDraftPick[];
  phase: DraftPhase;
  orgMap: Record<number, string>;
  userOrgAbbrev: string;
  onSignPick: (pickId: number) => Promise<void>;
  onPassPick: (pickId: number) => Promise<void>;
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  signed: "bg-green-600 text-green-100",
  passed: "bg-yellow-600 text-yellow-100",
  refused: "bg-red-600 text-red-100",
  pending: "bg-gray-600 text-gray-200",
};

const BaseballMyPicks: React.FC<BaseballMyPicksProps> = ({
  orgPicks,
  phase,
  orgMap,
  userOrgAbbrev,
  onSignPick,
  onPassPick,
  onRefresh,
}) => {
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSigningPhase = phase === "SIGNING";

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

  // Separate picked vs empty picks
  const pickedPicks = orgPicks.filter((p) => p.player_id != null);
  const emptyPicks = orgPicks.filter((p) => p.player_id == null);

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Picks — {userOrgAbbrev}</h2>
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

      {/* Picks with players */}
      <div className="baseball-table-wrapper overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="px-3 py-2">Round</th>
              <th className="px-3 py-2">Pick</th>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2">Auto?</th>
              <th className="px-3 py-2">Slot Value</th>
              <th className="px-3 py-2">Status</th>
              {isSigningPhase && <th className="px-3 py-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {pickedPicks.map((p) => (
              <tr
                key={p.pick_id}
                className="border-b border-gray-800 hover:bg-gray-800/60"
              >
                <td className="px-3 py-2">{p.round}</td>
                <td className="px-3 py-2">{p.pick_in_round}</td>
                <td className="px-3 py-2 font-medium">{p.player_name}</td>
                <td className="px-3 py-2">
                  {p.is_auto_pick && (
                    <span className="rounded bg-orange-600/30 text-orange-400 px-1.5 py-0.5 text-xs">
                      Auto
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{formatSlotValue(p.slot_value)}</td>
                <td className="px-3 py-2">
                  {p.sign_status && (
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        statusColors[p.sign_status] || statusColors.pending
                      }`}
                    >
                      {p.sign_status}
                    </span>
                  )}
                </td>
                {isSigningPhase && (
                  <td className="px-3 py-2">
                    {p.sign_status === "pending" && (
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
                )}
              </tr>
            ))}
            {pickedPicks.length === 0 && (
              <tr>
                <td colSpan={isSigningPhase ? 7 : 6} className="px-3 py-4 text-center text-gray-500">
                  No picks with selected players yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upcoming empty picks */}
      {emptyPicks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Upcoming Picks ({emptyPicks.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {emptyPicks.map((p) => {
              const isTraded = p.current_org_id !== p.original_org_id;
              return (
                <div
                  key={p.pick_id}
                  className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300"
                >
                  Rd {p.round}, Pick {p.pick_in_round}
                  {isTraded && (
                    <span className="text-yellow-400 ml-1">(via {orgMap[p.original_org_id] ?? ""})</span>
                  )}
                  <span className="text-gray-500 ml-1">{formatSlotValue(p.slot_value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseballMyPicks;
