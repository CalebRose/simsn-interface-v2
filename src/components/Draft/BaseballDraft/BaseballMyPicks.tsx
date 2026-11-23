import React from "react";
import {
  BaseballDraftPick,
  DraftPhase,
  DRAFT_CLASS_LABELS,
  formatSlotValue,
} from "../../../models/baseball/baseballDraftModels";
import "../../Team/baseball/baseballMobile.css";

interface BaseballMyPicksProps {
  orgPicks: BaseballDraftPick[];
  phase: DraftPhase;
  orgMap: Record<number, string>;
  userOrgAbbrev: string;
  /** Signing is a negotiation, so it happens in the Pick Signing tab. */
  onOpenSigning: () => void;
  onRefresh: () => void;
}

const statusLabels: Record<string, string> = {
  signed: "Signed",
  passed: "Passed",
  refused: "Refused, returned to school",
  pending: "Not signed yet",
};

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
  onOpenSigning,
  onRefresh,
}) => {
  const isSigningPhase = phase === "SIGNING";

  // Separate picked vs empty picks
  const pickedPicks = orgPicks.filter((p) => p.player_id != null);
  const emptyPicks = orgPicks.filter((p) => p.player_id == null);

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Picks — {userOrgAbbrev}</h2>
        <button
          onClick={onRefresh}
          className="rounded-sm bg-gray-700 px-3 py-1.5 text-sm hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

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
                <td className="px-3 py-2 font-medium">
                  {p.player_name}
                  {p.class_year && DRAFT_CLASS_LABELS[p.class_year] && (
                    <span
                      className="ml-2 rounded-sm bg-gray-700 px-1.5 py-0.5 text-[11px] font-semibold text-gray-200"
                      title={DRAFT_CLASS_LABELS[p.class_year].long}
                    >
                      {DRAFT_CLASS_LABELS[p.class_year].short}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {p.is_auto_pick && (
                    <span className="rounded-sm bg-orange-600/30 text-orange-400 px-1.5 py-0.5 text-xs">
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
                      {statusLabels[p.sign_status] ?? p.sign_status}
                    </span>
                  )}
                </td>
                {isSigningPhase && (
                  <td className="px-3 py-2">
                    {p.sign_status === "pending" && (
                      <button
                        onClick={onOpenSigning}
                        className="rounded-sm bg-green-600 px-3 py-1 text-xs font-medium hover:bg-green-500"
                        title={`${p.offers_remaining ?? 3} offers left`}
                      >
                        Make offers
                      </button>
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
                  className="rounded-sm border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300"
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
