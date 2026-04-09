import React, { useState, useMemo } from "react";
import {
  BaseballDraftPick,
  DraftTradeProposal,
} from "../../../models/baseball/baseballDraftModels";
import { BaseballOrganization } from "../../../models/baseball/baseballModels";
import BaseballDraftPickCard from "./BaseballDraftPickCard";

interface BaseballWarRoomProps {
  teamPicks: BaseballDraftPick[];
  allPicks: BaseballDraftPick[];
  currentOverall: number;
  userOrgId: number | null;
  userOrgAbbrev: string;
  orgMap: Record<number, string>;
  tradeProposals: DraftTradeProposal[];
  onProposeTrade: (
    receivingOrgId: number,
    picksOffered: number[],
    picksRequested: number[]
  ) => Promise<void>;
  onAcceptTrade: (proposalId: number) => Promise<void>;
  onRejectTrade: (proposalId: number) => Promise<void>;
  onRefreshTrades: () => void;
  organizations: BaseballOrganization[] | null;
}

const BaseballWarRoom: React.FC<BaseballWarRoomProps> = ({
  teamPicks,
  allPicks,
  currentOverall,
  userOrgId,
  userOrgAbbrev,
  orgMap,
  tradeProposals,
  onProposeTrade,
  onAcceptTrade,
  onRejectTrade,
  onRefreshTrades,
  organizations,
}) => {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [partnerOrgId, setPartnerOrgId] = useState<number | "">("");
  const [picksOffered, setPicksOffered] = useState<number[]>([]);
  const [picksRequested, setPicksRequested] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const incomingProposals = tradeProposals.filter(
    (p) => p.receiving_org_id === userOrgId && p.status === "pending"
  );
  const outgoingProposals = tradeProposals.filter(
    (p) => p.proposing_org_id === userOrgId && p.status === "pending"
  );

  const partnerPicks = useMemo(() => {
    if (!partnerOrgId) return [];
    return allPicks.filter((p) => p.current_org_id === partnerOrgId);
  }, [allPicks, partnerOrgId]);

  const togglePickOffered = (pickId: number) => {
    setPicksOffered((prev) =>
      prev.includes(pickId) ? prev.filter((id) => id !== pickId) : [...prev, pickId]
    );
  };

  const togglePickRequested = (pickId: number) => {
    setPicksRequested((prev) =>
      prev.includes(pickId) ? prev.filter((id) => id !== pickId) : [...prev, pickId]
    );
  };

  const handleSendProposal = async () => {
    if (!partnerOrgId || picksOffered.length === 0 || picksRequested.length === 0) return;
    setSending(true);
    setError(null);
    try {
      await onProposeTrade(partnerOrgId as number, picksOffered, picksRequested);
      setShowTradeModal(false);
      setPartnerOrgId("");
      setPicksOffered([]);
      setPicksRequested([]);
    } catch (err: any) {
      setError(err?.message || "Failed to send trade proposal.");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (proposalId: number) => {
    setAccepting(proposalId);
    setError(null);
    try {
      await onAcceptTrade(proposalId);
    } catch (err: any) {
      setError(err?.message || "Failed to accept trade.");
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (proposalId: number) => {
    setRejecting(proposalId);
    setError(null);
    try {
      await onRejectTrade(proposalId);
    } catch (err: any) {
      setError(err?.message || "Failed to reject trade.");
    } finally {
      setRejecting(null);
    }
  };

  const getPickLabel = (pickId: number): string => {
    const pick = allPicks.find((p) => p.pick_id === pickId);
    if (!pick) return `Pick #${pickId}`;
    return `Rd ${pick.round} Pick ${pick.pick_in_round} (#${pick.overall_pick})`;
  };

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      {/* Header */}
      <h2 className="text-xl font-bold">{userOrgAbbrev} War Room</h2>

      {error && (
        <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Your Picks */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-300">Your Picks</h3>
        <div className="grid grid-cols-4 gap-3">
          {teamPicks.map((pick) => (
            <BaseballDraftPickCard
              key={pick.pick_id}
              pick={pick}
              orgMap={orgMap}
              isCurrent={pick.overall_pick === currentOverall}
              isUserPick
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Trade Center */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-300">Trade Center</h3>
          <div className="flex gap-2">
            <button
              onClick={onRefreshTrades}
              className="rounded bg-gray-700 px-3 py-1.5 text-sm hover:bg-gray-600"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowTradeModal(true)}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-500"
            >
              Propose Trade
            </button>
          </div>
        </div>

        {/* Incoming Proposals */}
        {incomingProposals.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-green-400">Incoming Proposals</h4>
            <div className="flex flex-col gap-2">
              {incomingProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between rounded border border-green-800 bg-gray-800 p-3"
                >
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">
                      From: {proposal.proposing_org_abbrev}
                    </span>
                    <span className="text-gray-400">
                      Offering: {proposal.picks_offered.map(getPickLabel).join(", ")}
                    </span>
                    <span className="text-gray-400">
                      Requesting: {proposal.picks_requested.map(getPickLabel).join(", ")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(proposal.id)}
                      disabled={accepting === proposal.id}
                      className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
                    >
                      {accepting === proposal.id ? "..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleReject(proposal.id)}
                      disabled={rejecting === proposal.id}
                      className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
                    >
                      {rejecting === proposal.id ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing Proposals */}
        {outgoingProposals.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-yellow-400">Outgoing Proposals</h4>
            <div className="flex flex-col gap-2">
              {outgoingProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between rounded border border-yellow-800 bg-gray-800 p-3"
                >
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">
                      To: {proposal.receiving_org_abbrev}
                    </span>
                    <span className="text-gray-400">
                      Offering: {proposal.picks_offered.map(getPickLabel).join(", ")}
                    </span>
                    <span className="text-gray-400">
                      Requesting: {proposal.picks_requested.map(getPickLabel).join(", ")}
                    </span>
                  </div>
                  <span className="rounded bg-yellow-900 px-2 py-1 text-xs text-yellow-300">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {incomingProposals.length === 0 && outgoingProposals.length === 0 && (
          <p className="text-sm text-gray-500">No active trade proposals.</p>
        )}
      </section>

      {/* Trade Proposal Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-xl">
            <h3 className="mb-4 text-lg font-bold">Propose Trade</h3>

            {/* Partner Org */}
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-400">Trade Partner</label>
              <select
                value={partnerOrgId}
                onChange={(e) => {
                  setPartnerOrgId(e.target.value ? Number(e.target.value) : "");
                  setPicksRequested([]);
                }}
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
              >
                <option value="">Select organization...</option>
                {organizations
                  ?.filter((org) => org.id !== userOrgId)
                  .map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.org_abbrev}
                    </option>
                  ))}
              </select>
            </div>

            {/* Picks to Offer */}
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-400">Picks to Offer</label>
              <div className="flex flex-wrap gap-2">
                {teamPicks.map((pick) => (
                  <button
                    key={pick.pick_id}
                    onClick={() => togglePickOffered(pick.pick_id)}
                    className={`rounded border px-2 py-1 text-xs ${
                      picksOffered.includes(pick.pick_id)
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Rd {pick.round} #{pick.pick_in_round}
                  </button>
                ))}
              </div>
            </div>

            {/* Picks to Request */}
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-400">Picks to Request</label>
              {partnerOrgId ? (
                <div className="flex flex-wrap gap-2">
                  {partnerPicks.map((pick) => (
                    <button
                      key={pick.pick_id}
                      onClick={() => togglePickRequested(pick.pick_id)}
                      className={`rounded border px-2 py-1 text-xs ${
                        picksRequested.includes(pick.pick_id)
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Rd {pick.round} #{pick.pick_in_round}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Select a trade partner first.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTradeModal(false);
                  setPartnerOrgId("");
                  setPicksOffered([]);
                  setPicksRequested([]);
                  setError(null);
                }}
                className="rounded bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSendProposal}
                disabled={
                  sending ||
                  !partnerOrgId ||
                  picksOffered.length === 0 ||
                  picksRequested.length === 0
                }
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Proposal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseballWarRoom;
