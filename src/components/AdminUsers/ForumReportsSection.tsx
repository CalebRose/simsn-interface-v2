import React, { useCallback, useEffect, useState } from "react";
import { ForumService } from "../../_services/forumService";
import { PostReport, ReportStatus } from "../../models/forumModels";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { SectionHeading } from "../../_design/Section";

const STATUS_TABS: { label: string; value: ReportStatus | "all" }[] = [
  { label: "Pending", value: "pending" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Dismissed", value: "dismissed" },
  { label: "All", value: "all" },
];

function formatDate(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ForumReportsSectionProps {
  currentAdminUsername: string;
  onOpenUserModal: (user: CurrentUser) => void;
  users: CurrentUser[];
}

export const ForumReportsSection: React.FC<ForumReportsSectionProps> = ({
  currentAdminUsername,
  onOpenUserModal,
  users,
}) => {
  const [reports, setReports] = useState<PostReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportStatus | "all">("pending");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ForumService.GetPostReports(
        activeTab === "all" ? undefined : activeTab,
      );
      setReports(data);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const setReportBusy = (id: string, busy: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      busy ? next.add(id) : next.delete(id);
      return next;
    });

  const updateReport = async (
    id: string,
    status: ReportStatus,
    note?: string,
  ) => {
    setReportBusy(id, true);
    try {
      await ForumService.UpdatePostReport(id, {
        status,
        reviewedBy: currentAdminUsername,
        adminNote: note ?? null,
      });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                reviewedBy: currentAdminUsername,
                adminNote: note ?? null,
              }
            : r,
        ),
      );
    } finally {
      setReportBusy(id, false);
    }
  };

  const handleOpenUser = (reportedUsername: string) => {
    const user = users.find(
      (u) => u.username?.toLowerCase() === reportedUsername.toLowerCase(),
    );
    if (user) onOpenUserModal(user);
  };

  const visibleReports =
    activeTab === "all"
      ? reports
      : reports.filter((r) => r.status === activeTab);

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <Border classes="w-[95vw] px-4 py-4 mt-4">
      <SectionHeading
        label={`Forum Reports${pendingCount > 0 ? ` (${pendingCount} pending)` : ""}`}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={fetchReports}
          className="ml-auto px-3 py-1 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* Report list */}
      {isLoading ? (
        <Text variant="secondary">Loading reports…</Text>
      ) : visibleReports.length === 0 ? (
        <Text variant="secondary" classes="py-4 text-center">
          No {activeTab === "all" ? "" : activeTab} reports.
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleReports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-700 rounded-lg p-3 flex flex-col gap-2"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        report.status === "pending"
                          ? "bg-yellow-700 text-yellow-100"
                          : report.status === "reviewed"
                            ? "bg-green-800 text-green-100"
                            : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
                      {report.category}
                    </span>
                  </div>
                  <Text variant="xs" classes="text-gray-400 mt-0.5">
                    {formatDate(
                      report.createdAt as unknown as { seconds: number },
                    )}
                  </Text>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400">
                    Reporter:{" "}
                    <span className="text-white">
                      {report.reporterUsername}
                    </span>
                  </span>
                  <span className="text-gray-400">
                    Reported:{" "}
                    <button
                      onClick={() => handleOpenUser(report.reportedUsername)}
                      className="text-blue-400 hover:underline"
                    >
                      {report.reportedUsername}
                    </button>
                  </span>
                </div>
              </div>

              {/* Reason */}
              <Text variant="body-small" classes="text-gray-300 italic">
                "{report.reason}"
              </Text>

              {/* Admin note input */}
              {report.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={noteInputs[report.id] ?? ""}
                    onChange={(e) =>
                      setNoteInputs((prev) => ({
                        ...prev,
                        [report.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional admin note…"
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500"
                  />
                  <ButtonGroup>
                    <Button
                      variant="secondaryOutline"
                      size="xs"
                      disabled={busyIds.has(report.id)}
                      onClick={() =>
                        updateReport(
                          report.id,
                          "dismissed",
                          noteInputs[report.id],
                        )
                      }
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="success"
                      size="xs"
                      disabled={busyIds.has(report.id)}
                      onClick={() =>
                        updateReport(
                          report.id,
                          "reviewed",
                          noteInputs[report.id],
                        )
                      }
                    >
                      Mark Reviewed
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      disabled={busyIds.has(report.id)}
                      onClick={() => handleOpenUser(report.reportedUsername)}
                    >
                      Open User
                    </Button>
                  </ButtonGroup>
                </div>
              )}

              {/* Reviewed note */}
              {report.status !== "pending" && report.adminNote && (
                <Text variant="xs" classes="text-gray-400">
                  Admin note: {report.adminNote} — by {report.reviewedBy}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}
    </Border>
  );
};
