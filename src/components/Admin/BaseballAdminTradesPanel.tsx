import { useCallback, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { Button, PillButton, ButtonGroup } from "../../_design/Buttons";
import { Border } from "../../_design/Borders";
import { Modal } from "../../_design/Modal";
import { Text } from "../../_design/Typography";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { BaseballService } from "../../_services/baseballService";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { useAdminPage } from "../../context/AdminPageContext";
import {
  TradeProposal,
  TradeProposalStatus,
  TradeRosterPlayer,
  AdminApproveTradeRequest,
  DirectTradeRequest,
  TransactionLogEntry,
  RollbackResponse,
} from "../../models/baseball/baseballTradeModels";
import type { RosterLevelStatus } from "../../models/baseball/baseballTradeModels";
import { BaseballOrganization } from "../../models/baseball/baseballModels";

// ═══════════════════════════════════════════════
// Status Badge
// ═══════════════════════════════════════════════

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  proposed: { label: "Proposed", bg: "bg-gray-500", text: "text-white" },
  counterparty_accepted: {
    label: "Awaiting Admin",
    bg: "bg-yellow-500",
    text: "text-white",
  },
  counterparty_rejected: {
    label: "Rejected (CP)",
    bg: "bg-red-500",
    text: "text-white",
  },
  admin_rejected: {
    label: "Rejected (Admin)",
    bg: "bg-red-600",
    text: "text-white",
  },
  executed: { label: "Executed", bg: "bg-green-600", text: "text-white" },
  cancelled: { label: "Cancelled", bg: "bg-gray-400", text: "text-white" },
  expired: { label: "Expired", bg: "bg-gray-400", text: "text-white" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = statusConfig[status] || {
    label: status,
    bg: "bg-gray-500",
    text: "text-white",
  };
  return (
    <span
      className={`${cfg.bg} ${cfg.text} text-xs font-semibold px-2 py-0.5 rounded-full`}
    >
      {cfg.label}
    </span>
  );
};

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  if (amount === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getOrgName = (
  orgId: number,
  organizations: BaseballOrganization[] | null,
) => {
  if (!organizations) return `Org #${orgId}`;
  const org = organizations.find((o) => o.id === orgId);
  return org ? org.org_abbrev : `Org #${orgId}`;
};

// ═══════════════════════════════════════════════
// Sub-tabs
// ═══════════════════════════════════════════════

type SubTab = "pending" | "all" | "builder" | "log";

// ═══════════════════════════════════════════════
// Main Panel Component
// ═══════════════════════════════════════════════

export const BaseballAdminTradesPanel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { organizations, seasonContext } = useSimBaseballStore();
  const { baseballTradeProposals, refreshBaseballTradeProposals } =
    useAdminPage();

  const [subTab, setSubTab] = useState<SubTab>("pending");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProposal, setSelectedProposal] =
    useState<TradeProposal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const pendingProposals = useMemo(
    () =>
      baseballTradeProposals.filter(
        (p) => p.status === "counterparty_accepted",
      ),
    [baseballTradeProposals],
  );

  const filteredProposals = useMemo(() => {
    if (statusFilter === "all") return baseballTradeProposals;
    return baseballTradeProposals.filter((p) => p.status === statusFilter);
  }, [baseballTradeProposals, statusFilter]);

  const openDetail = (proposal: TradeProposal) => {
    setSelectedProposal(proposal);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedProposal(null);
  };

  const statusOptions: SelectOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "counterparty_accepted", label: "Awaiting Admin" },
    { value: "executed", label: "Executed" },
    { value: "admin_rejected", label: "Rejected (Admin)" },
    { value: "counterparty_rejected", label: "Rejected (CP)" },
    { value: "proposed", label: "Proposed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="w-full">
      {/* Sub-tab navigation */}
      <ButtonGroup classes="mb-4 gap-2">
        <PillButton
          size="sm"
          isSelected={subTab === "pending"}
          onClick={() => setSubTab("pending")}
        >
          Pending ({pendingProposals.length})
        </PillButton>
        <PillButton
          size="sm"
          isSelected={subTab === "all"}
          onClick={() => setSubTab("all")}
        >
          All Proposals
        </PillButton>
        <PillButton
          size="sm"
          isSelected={subTab === "builder"}
          onClick={() => setSubTab("builder")}
        >
          Direct Trade
        </PillButton>
        <PillButton
          size="sm"
          isSelected={subTab === "log"}
          onClick={() => setSubTab("log")}
        >
          Transaction Log
        </PillButton>
      </ButtonGroup>

      {/* Pending Approval Queue */}
      {subTab === "pending" && (
        <PendingQueue
          proposals={pendingProposals}
          organizations={organizations}
          onViewDetail={openDetail}
          seasonContext={seasonContext}
          onRefresh={refreshBaseballTradeProposals}
          enqueueSnackbar={enqueueSnackbar}
        />
      )}

      {/* All Proposals Table */}
      {subTab === "all" && (
        <div>
          <div className="mb-3 w-48">
            <SelectDropdown
              options={statusOptions}
              value={statusOptions.find((o) => o.value === statusFilter)}
              onChange={(opt) => setStatusFilter(opt?.value || "all")}
              placeholder="Filter by status"
            />
          </div>
          <AllProposalsTable
            proposals={filteredProposals}
            organizations={organizations}
            onViewDetail={openDetail}
          />
        </div>
      )}

      {/* Direct Trade Builder */}
      {subTab === "builder" && (
        <DirectTradeBuilder
          organizations={organizations}
          seasonContext={seasonContext}
          onComplete={refreshBaseballTradeProposals}
          enqueueSnackbar={enqueueSnackbar}
        />
      )}

      {/* Transaction Log */}
      {subTab === "log" && (
        <TransactionLogView
          organizations={organizations}
          enqueueSnackbar={enqueueSnackbar}
        />
      )}

      {/* Trade Detail Modal */}
      {selectedProposal && (
        <TradeDetailModal
          isOpen={isDetailOpen}
          onClose={closeDetail}
          proposal={selectedProposal}
          organizations={organizations}
          seasonContext={seasonContext}
          onActionComplete={async () => {
            await refreshBaseballTradeProposals();
            closeDetail();
          }}
          enqueueSnackbar={enqueueSnackbar}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Pending Queue
// ═══════════════════════════════════════════════

interface PendingQueueProps {
  proposals: TradeProposal[];
  organizations: BaseballOrganization[] | null;
  onViewDetail: (p: TradeProposal) => void;
  seasonContext: any;
  onRefresh: () => Promise<void>;
  enqueueSnackbar: any;
}

const PendingQueue: React.FC<PendingQueueProps> = ({
  proposals,
  organizations,
  onViewDetail,
  seasonContext,
  onRefresh,
  enqueueSnackbar,
}) => {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Text variant="body">No trades awaiting admin approval.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => (
        <PendingTradeCard
          key={proposal.id}
          proposal={proposal}
          organizations={organizations}
          onViewDetail={() => onViewDetail(proposal)}
          seasonContext={seasonContext}
          onRefresh={onRefresh}
          enqueueSnackbar={enqueueSnackbar}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Pending Trade Card
// ═══════════════════════════════════════════════

interface PendingTradeCardProps {
  proposal: TradeProposal;
  organizations: BaseballOrganization[] | null;
  onViewDetail: () => void;
  seasonContext: any;
  onRefresh: () => Promise<void>;
  enqueueSnackbar: any;
}

const PendingTradeCard: React.FC<PendingTradeCardProps> = ({
  proposal,
  organizations,
  onViewDetail,
  seasonContext,
  onRefresh,
  enqueueSnackbar,
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const orgAName = getOrgName(proposal.proposing_org_id, organizations);
  const orgBName = getOrgName(proposal.receiving_org_id, organizations);
  const playersToB = proposal.proposal?.players_to_b?.length || 0;
  const playersToA = proposal.proposal?.players_to_a?.length || 0;
  const cash = proposal.proposal?.cash_a_to_b || 0;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const dto: AdminApproveTradeRequest = {
        league_year_id: seasonContext?.current_league_year_id || 0,
        game_week_id: seasonContext?.current_week_index || 0,
        note: adminNote || undefined,
        executed_by: "admin",
      };
      await BaseballService.AdminApproveTrade(proposal.id, dto);
      enqueueSnackbar(`Trade #${proposal.id} approved and executed`, {
        variant: "success",
      });
      await onRefresh();
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Failed to approve trade", {
        variant: "error",
      });
    }
    setLoading(false);
    setShowApproveConfirm(false);
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await BaseballService.AdminRejectTrade(proposal.id, {
        note: adminNote || undefined,
      });
      enqueueSnackbar(`Trade #${proposal.id} rejected`, {
        variant: "info",
      });
      await onRefresh();
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Failed to reject trade", {
        variant: "error",
      });
    }
    setLoading(false);
    setShowRejectConfirm(false);
  };

  let tradeDesc = `${playersToB} player${playersToB !== 1 ? "s" : ""}`;
  tradeDesc += ` ↔ ${playersToA} player${playersToA !== 1 ? "s" : ""}`;
  if (cash !== 0) {
    tradeDesc += ` + ${formatCurrency(cash)}`;
  }

  return (
    <Border classes="p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Text variant="small" className="font-bold">
              #{proposal.id}
            </Text>
            <Text variant="small">
              {orgAName} → {orgBName}
            </Text>
            <StatusBadge status={proposal.status} />
          </div>
          <Text variant="xs" className="text-gray-400">
            {tradeDesc}
          </Text>
          <Text variant="xs" className="text-gray-500">
            Proposed: {formatDate(proposal.created_at)} · Accepted:{" "}
            {formatDate(proposal.updated_at)}
          </Text>
          {proposal.note && (
            <Text variant="xs" className="text-gray-400 italic mt-1">
              Note: "{proposal.note}"
            </Text>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="primary" onClick={onViewDetail}>
            Details
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={() => setShowApproveConfirm(true)}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowRejectConfirm(true)}
            disabled={loading}
          >
            Reject
          </Button>
        </div>
      </div>

      {/* Approve Confirmation */}
      <Modal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title={`Approve Trade #${proposal.id}?`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowApproveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? "Approving..." : "Approve & Execute"}
            </Button>
          </>
        }
      >
        <Text variant="body-small">
          This will immediately execute the trade — players and salary
          obligations will be transferred.
        </Text>
        <div className="mt-3">
          <label className="text-sm text-gray-400">Admin Note (optional)</label>
          <textarea
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white text-sm border border-gray-600"
            rows={2}
            maxLength={500}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Reason for approval..."
          />
        </div>
      </Modal>

      {/* Reject Confirmation */}
      <Modal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        title={`Reject Trade #${proposal.id}?`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRejectConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? "Rejecting..." : "Reject Trade"}
            </Button>
          </>
        }
      >
        <Text variant="body-small">
          Both orgs will be notified. This cannot be undone.
        </Text>
        <div className="mt-3">
          <label className="text-sm text-gray-400">
            Rejection Reason (optional)
          </label>
          <textarea
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white text-sm border border-gray-600"
            rows={2}
            maxLength={500}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Reason for rejection..."
          />
        </div>
      </Modal>
    </Border>
  );
};

// ═══════════════════════════════════════════════
// All Proposals Table
// ═══════════════════════════════════════════════

interface AllProposalsTableProps {
  proposals: TradeProposal[];
  organizations: BaseballOrganization[] | null;
  onViewDetail: (p: TradeProposal) => void;
}

const AllProposalsTable: React.FC<AllProposalsTableProps> = ({
  proposals,
  organizations,
  onViewDetail,
}) => {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Text variant="body">No proposals found.</Text>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-700 text-gray-300">
          <tr>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">From</th>
            <th className="px-3 py-2">To</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-gray-700 ${i % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}`}
            >
              <td className="px-3 py-2 font-mono">#{p.id}</td>
              <td className="px-3 py-2">
                {getOrgName(p.proposing_org_id, organizations)}
              </td>
              <td className="px-3 py-2">
                {getOrgName(p.receiving_org_id, organizations)}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-3 py-2 text-gray-400">
                {formatDate(p.created_at)}
              </td>
              <td className="px-3 py-2">
                <Button size="xs" variant="primary" onClick={() => onViewDetail(p)}>
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Trade Detail Modal
// ═══════════════════════════════════════════════

interface TradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: TradeProposal;
  organizations: BaseballOrganization[] | null;
  seasonContext: any;
  onActionComplete: () => Promise<void>;
  enqueueSnackbar: any;
}

const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  isOpen,
  onClose,
  proposal,
  organizations,
  seasonContext,
  onActionComplete,
  enqueueSnackbar,
}) => {
  const [loading, setLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [rosterA, setRosterA] = useState<TradeRosterPlayer[]>([]);
  const [rosterB, setRosterB] = useState<TradeRosterPlayer[]>([]);
  const [rosterStatusA, setRosterStatusA] = useState<RosterLevelStatus[]>([]);
  const [rosterStatusB, setRosterStatusB] = useState<RosterLevelStatus[]>([]);

  useEffect(() => {
    if (!isOpen || !proposal) return;
    const loadContext = async () => {
      try {
        const [ra, rb, sa, sb] = await Promise.all([
          BaseballService.GetTradeRoster(proposal.proposing_org_id),
          BaseballService.GetTradeRoster(proposal.receiving_org_id),
          BaseballService.GetTradeRosterStatus(proposal.proposing_org_id),
          BaseballService.GetTradeRosterStatus(proposal.receiving_org_id),
        ]);
        setRosterA(Array.isArray(ra) ? ra : []);
        setRosterB(Array.isArray(rb) ? rb : []);
        setRosterStatusA(Array.isArray(sa) ? sa : []);
        setRosterStatusB(Array.isArray(sb) ? sb : []);
      } catch (e) {
        console.error("Failed to load roster context", e);
      }
    };
    loadContext();
  }, [isOpen, proposal]);

  const orgAName = getOrgName(proposal.proposing_org_id, organizations);
  const orgBName = getOrgName(proposal.receiving_org_id, organizations);

  const playersGoingToB = useMemo(() => {
    const ids = proposal.proposal?.players_to_b || [];
    return ids.map((id) => {
      const p = rosterA.find((r) => r.player_id === id);
      return p || { player_id: id, player_name: `Player #${id}`, position: "?", current_level: 0, salary: 0, contract_id: 0, onIR: 0 };
    });
  }, [proposal, rosterA]);

  const playersGoingToA = useMemo(() => {
    const ids = proposal.proposal?.players_to_a || [];
    return ids.map((id) => {
      const p = rosterB.find((r) => r.player_id === id);
      return p || { player_id: id, player_name: `Player #${id}`, position: "?", current_level: 0, salary: 0, contract_id: 0, onIR: 0 };
    });
  }, [proposal, rosterB]);

  const cash = proposal.proposal?.cash_a_to_b || 0;
  const retention = proposal.proposal?.salary_retention || {};

  const isPending = proposal.status === "counterparty_accepted";

  const handleApprove = async () => {
    setLoading(true);
    try {
      const dto: AdminApproveTradeRequest = {
        league_year_id: seasonContext?.current_league_year_id || 0,
        game_week_id: seasonContext?.current_week_index || 0,
        note: adminNote || undefined,
        executed_by: "admin",
      };
      await BaseballService.AdminApproveTrade(proposal.id, dto);
      enqueueSnackbar(`Trade #${proposal.id} approved and executed`, { variant: "success" });
      await onActionComplete();
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Failed to approve trade", { variant: "error" });
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await BaseballService.AdminRejectTrade(proposal.id, { note: adminNote || undefined });
      enqueueSnackbar(`Trade #${proposal.id} rejected`, { variant: "info" });
      await onActionComplete();
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Failed to reject trade", { variant: "error" });
    }
    setLoading(false);
  };

  const getLevelLabel = (level: number) => {
    if (level === 9) return "MLB";
    if (level === 8) return "AAA";
    if (level === 7) return "AA";
    if (level === 6) return "A+";
    if (level === 5) return "A";
    return `Lv${level}`;
  };

  const mlbStatusA = rosterStatusA.find((s) => s.level_name === 9);
  const mlbStatusB = rosterStatusB.find((s) => s.level_name === 9);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trade #${proposal.id}`}
      maxWidth="max-w-[52rem]"
      actions={
        isPending ? (
          <>
            <Button variant="danger" size="sm" onClick={handleReject} disabled={loading}>
              {loading ? "Processing..." : "Reject Trade"}
            </Button>
            <Button variant="success" size="sm" onClick={handleApprove} disabled={loading}>
              {loading ? "Processing..." : "Approve Trade"}
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <StatusBadge status={proposal.status} />
        </div>

        {/* Players Exchange */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Org A sends */}
          <div>
            <Text variant="small" className="font-bold mb-2">
              {orgAName} sends to {orgBName}:
            </Text>
            <div className="space-y-1">
              {playersGoingToB.length === 0 ? (
                <Text variant="xs" className="text-gray-500">No players</Text>
              ) : (
                playersGoingToB.map((p) => {
                  const ret = (retention as Record<string, any>)[String(p.player_id)];
                  return (
                    <div key={p.player_id} className="bg-gray-700 rounded p-2">
                      <Text variant="small" className="font-semibold">
                        {p.player_name} ({p.position})
                      </Text>
                      <Text variant="xs" className="text-gray-400">
                        {getLevelLabel(p.current_level)} · {formatCurrency(p.salary)}/yr
                        {ret && ` · Retention: ${Math.round((ret as any).retention_pct * 100)}%`}
                      </Text>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Org B sends */}
          <div>
            <Text variant="small" className="font-bold mb-2">
              {orgBName} sends to {orgAName}:
            </Text>
            <div className="space-y-1">
              {playersGoingToA.length === 0 ? (
                <Text variant="xs" className="text-gray-500">No players</Text>
              ) : (
                playersGoingToA.map((p) => {
                  const ret = (retention as Record<string, any>)[String(p.player_id)];
                  return (
                    <div key={p.player_id} className="bg-gray-700 rounded p-2">
                      <Text variant="small" className="font-semibold">
                        {p.player_name} ({p.position})
                      </Text>
                      <Text variant="xs" className="text-gray-400">
                        {getLevelLabel(p.current_level)} · {formatCurrency(p.salary)}/yr
                        {ret && ` · Retention: ${Math.round((ret as any).retention_pct * 100)}%`}
                      </Text>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Cash */}
        {cash !== 0 && (
          <div>
            <Text variant="small" className="text-gray-300">
              Cash: {cash > 0 ? orgAName : orgBName} pays{" "}
              {cash > 0 ? orgBName : orgAName} {formatCurrency(cash)}
            </Text>
          </div>
        )}

        {/* Roster Impact */}
        {(mlbStatusA || mlbStatusB) && (
          <div>
            <Text variant="small" className="font-bold mb-1">
              Roster Impact (MLB)
            </Text>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              {mlbStatusA && (
                <div>
                  {orgAName}: {mlbStatusA.count} →{" "}
                  {mlbStatusA.count - (proposal.proposal?.players_to_b?.length || 0) + (proposal.proposal?.players_to_a?.length || 0)}{" "}
                  (limits: {mlbStatusA.min_roster}-{mlbStatusA.max_roster})
                </div>
              )}
              {mlbStatusB && (
                <div>
                  {orgBName}: {mlbStatusB.count} →{" "}
                  {mlbStatusB.count + (proposal.proposal?.players_to_b?.length || 0) - (proposal.proposal?.players_to_a?.length || 0)}{" "}
                  (limits: {mlbStatusB.min_roster}-{mlbStatusB.max_roster})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <Text variant="small" className="font-bold mb-1">Timeline</Text>
          <div className="text-xs text-gray-400 space-y-0.5">
            <div>Proposed: {formatDate(proposal.created_at)}</div>
            <div>Last Updated: {formatDate(proposal.updated_at)}</div>
            {proposal.note && (
              <div className="italic">Note: "{proposal.note}"</div>
            )}
          </div>
        </div>

        {/* Admin Note */}
        {isPending && (
          <div>
            <label className="text-sm text-gray-400">Admin Note (optional)</label>
            <textarea
              className="w-full mt-1 p-2 rounded bg-gray-700 text-white text-sm border border-gray-600"
              rows={2}
              maxLength={500}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════
// Direct Trade Builder
// ═══════════════════════════════════════════════

interface DirectTradeBuilderProps {
  organizations: BaseballOrganization[] | null;
  seasonContext: any;
  onComplete: () => Promise<void>;
  enqueueSnackbar: any;
}

const DirectTradeBuilder: React.FC<DirectTradeBuilderProps> = ({
  organizations,
  seasonContext,
  onComplete,
  enqueueSnackbar,
}) => {
  const [orgA, setOrgA] = useState<SelectOption | null>(null);
  const [orgB, setOrgB] = useState<SelectOption | null>(null);
  const [rosterA, setRosterA] = useState<TradeRosterPlayer[]>([]);
  const [rosterB, setRosterB] = useState<TradeRosterPlayer[]>([]);
  const [selectedPlayersToB, setSelectedPlayersToB] = useState<Set<number>>(new Set());
  const [selectedPlayersToA, setSelectedPlayersToA] = useState<Set<number>>(new Set());
  const [cashAmount, setCashAmount] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const orgOptions: SelectOption[] = useMemo(() => {
    if (!organizations) return [];
    return organizations
      .filter((o) => o.league === "mlb")
      .map((o) => ({ value: String(o.id), label: o.org_abbrev }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [organizations]);

  useEffect(() => {
    if (!orgA) { setRosterA([]); return; }
    BaseballService.GetTradeRoster(Number(orgA.value))
      .then((r) => setRosterA(Array.isArray(r) ? r : []))
      .catch(() => setRosterA([]));
    setSelectedPlayersToB(new Set());
  }, [orgA]);

  useEffect(() => {
    if (!orgB) { setRosterB([]); return; }
    BaseballService.GetTradeRoster(Number(orgB.value))
      .then((r) => setRosterB(Array.isArray(r) ? r : []))
      .catch(() => setRosterB([]));
    setSelectedPlayersToA(new Set());
  }, [orgB]);

  const togglePlayerToB = (playerId: number) => {
    setSelectedPlayersToB((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const togglePlayerToA = (playerId: number) => {
    setSelectedPlayersToA((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const canExecute =
    orgA &&
    orgB &&
    orgA.value !== orgB.value &&
    (selectedPlayersToB.size > 0 || selectedPlayersToA.size > 0);

  const handleExecute = async () => {
    if (!orgA || !orgB) return;
    setLoading(true);
    try {
      const dto: DirectTradeRequest = {
        org_a_id: Number(orgA.value),
        org_b_id: Number(orgB.value),
        league_year_id: seasonContext?.current_league_year_id || 0,
        game_week_id: seasonContext?.current_week_index || 0,
        players_to_b: Array.from(selectedPlayersToB),
        players_to_a: Array.from(selectedPlayersToA),
        cash_a_to_b: Number(cashAmount) || 0,
        executed_by: "admin",
      };
      const result = await BaseballService.ExecuteDirectTrade(dto);
      enqueueSnackbar(
        `Trade executed! Transaction #${result.transaction_id}`,
        { variant: "success" },
      );
      setSelectedPlayersToB(new Set());
      setSelectedPlayersToA(new Set());
      setCashAmount("0");
      await onComplete();
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Failed to execute trade", {
        variant: "error",
      });
    }
    setLoading(false);
    setShowConfirm(false);
  };

  const getLevelLabel = (level: number) => {
    if (level === 9) return "MLB";
    if (level === 8) return "AAA";
    if (level === 7) return "AA";
    return `Lv${level}`;
  };

  return (
    <div className="space-y-4">
      {/* Org Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Text variant="small" className="font-bold mb-1">Org A</Text>
          <SelectDropdown
            options={orgOptions}
            value={orgA}
            onChange={(opt) => setOrgA(opt)}
            placeholder="Select org..."
            isClearable
          />
        </div>
        <div>
          <Text variant="small" className="font-bold mb-1">Org B</Text>
          <SelectDropdown
            options={orgOptions}
            value={orgB}
            onChange={(opt) => setOrgB(opt)}
            placeholder="Select org..."
            isClearable
          />
        </div>
      </div>

      {/* Rosters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Org A roster - players going to B */}
        <div>
          {orgA && (
            <>
              <Text variant="xs" className="text-gray-400 mb-1">
                {orgA.label} players → {orgB?.label || "Org B"}
              </Text>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {rosterA.map((p) => (
                  <div
                    key={p.player_id}
                    onClick={() => togglePlayerToB(p.player_id)}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm ${
                      selectedPlayersToB.has(p.player_id)
                        ? "bg-blue-700 bg-opacity-40 border border-blue-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayersToB.has(p.player_id)}
                      readOnly
                      className="pointer-events-none"
                    />
                    <span className="flex-1">
                      {p.player_name} ({p.position})
                    </span>
                    <span className="text-xs text-gray-400">
                      {getLevelLabel(p.current_level)} · {formatCurrency(p.salary)}
                    </span>
                  </div>
                ))}
                {rosterA.length === 0 && orgA && (
                  <Text variant="xs" className="text-gray-500">
                    Loading roster...
                  </Text>
                )}
              </div>
            </>
          )}
        </div>

        {/* Org B roster - players going to A */}
        <div>
          {orgB && (
            <>
              <Text variant="xs" className="text-gray-400 mb-1">
                {orgB.label} players → {orgA?.label || "Org A"}
              </Text>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {rosterB.map((p) => (
                  <div
                    key={p.player_id}
                    onClick={() => togglePlayerToA(p.player_id)}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm ${
                      selectedPlayersToA.has(p.player_id)
                        ? "bg-blue-700 bg-opacity-40 border border-blue-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayersToA.has(p.player_id)}
                      readOnly
                      className="pointer-events-none"
                    />
                    <span className="flex-1">
                      {p.player_name} ({p.position})
                    </span>
                    <span className="text-xs text-gray-400">
                      {getLevelLabel(p.current_level)} · {formatCurrency(p.salary)}
                    </span>
                  </div>
                ))}
                {rosterB.length === 0 && orgB && (
                  <Text variant="xs" className="text-gray-500">
                    Loading roster...
                  </Text>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cash */}
      <div className="flex items-center gap-3">
        <Text variant="small">Cash (A → B):</Text>
        <input
          type="number"
          className="w-32 p-1.5 rounded bg-gray-700 text-white text-sm border border-gray-600"
          value={cashAmount}
          onChange={(e) => setCashAmount(e.target.value)}
        />
        <Text variant="xs" className="text-gray-500">
          Positive = A pays B, Negative = B pays A
        </Text>
      </div>

      {/* Execute */}
      <Button
        variant="success"
        onClick={() => setShowConfirm(true)}
        disabled={!canExecute || loading}
      >
        Execute Trade
      </Button>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Execute Direct Trade?"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleExecute} disabled={loading}>
              {loading ? "Executing..." : "Execute Trade"}
            </Button>
          </>
        }
      >
        <Text variant="body-small">
          This will execute the trade immediately, bypassing the proposal
          workflow. Players will be transferred.
        </Text>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Transaction Log
// ═══════════════════════════════════════════════

interface TransactionLogViewProps {
  organizations: BaseballOrganization[] | null;
  enqueueSnackbar: any;
}

const TransactionLogView: React.FC<TransactionLogViewProps> = ({
  organizations,
  enqueueSnackbar,
}) => {
  const [entries, setEntries] = useState<TransactionLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [rollingBack, setRollingBack] = useState<number | null>(null);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadLog();
  }, []);

  const loadLog = async () => {
    setLoadingLog(true);
    try {
      const log = await BaseballService.GetTransactionLog(undefined, "trade");
      setEntries(Array.isArray(log) ? log : []);
    } catch (e) {
      console.error("Failed to load transaction log", e);
    }
    setLoadingLog(false);
  };

  const handleRollback = async (transactionId: number) => {
    setRollingBack(transactionId);
    try {
      await BaseballService.RollbackTransaction({ transaction_id: transactionId });
      enqueueSnackbar(`Transaction #${transactionId} rolled back`, { variant: "success" });
      setShowRollbackConfirm(null);
      await loadLog();
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Rollback failed", { variant: "error" });
    }
    setRollingBack(null);
  };

  if (loadingLog) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Text variant="body">Loading transaction log...</Text>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Text variant="body">No trade transactions found.</Text>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-700 text-gray-300">
          <tr>
            <th className="px-3 py-2">TX ID</th>
            <th className="px-3 py-2">Org</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              className={`border-b border-gray-700 ${i % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}`}
            >
              <td className="px-3 py-2 font-mono">#{entry.id}</td>
              <td className="px-3 py-2">
                {getOrgName(entry.org_id, organizations)}
              </td>
              <td className="px-3 py-2">{entry.type}</td>
              <td className="px-3 py-2 text-gray-400">
                {formatDate(entry.created_at)}
              </td>
              <td className="px-3 py-2">
                <Button
                  size="xs"
                  variant="danger"
                  onClick={() => setShowRollbackConfirm(entry.id)}
                  disabled={rollingBack === entry.id}
                >
                  {rollingBack === entry.id ? "Rolling back..." : "Rollback"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rollback Confirmation */}
      <Modal
        isOpen={showRollbackConfirm !== null}
        onClose={() => setShowRollbackConfirm(null)}
        title={`Rollback Transaction #${showRollbackConfirm}?`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowRollbackConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => showRollbackConfirm && handleRollback(showRollbackConfirm)}
              disabled={rollingBack !== null}
            >
              {rollingBack ? "Rolling back..." : "Confirm Rollback"}
            </Button>
          </>
        }
      >
        <Text variant="body-small">
          This will reverse all contract share mutations and delete cash ledger
          entries for this trade. This cannot be undone.
        </Text>
      </Modal>
    </div>
  );
};
