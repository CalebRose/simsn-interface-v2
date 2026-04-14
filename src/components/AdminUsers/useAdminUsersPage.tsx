import { useCallback, useEffect, useMemo, useState } from "react";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { useFirestoreCollection } from "../../firebase/firebase";
import { useResponsive } from "../../_hooks/useMobile";
import { useModal } from "../../_hooks/useModal";
import { ForumService } from "../../_services/forumService";
import { PostReport, ReportStatus } from "../../models/forumModels";
import { useAuthStore } from "../../context/AuthContext";

export const useAdminUsersPage = () => {
  const { currentUser } = useAuthStore();
  const [users, { update, remove }, isLoading, error] =
    useFirestoreCollection<CurrentUser>("users");

  const [viewingUser, setViewingUser] = useState<CurrentUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewActiveUsers, setViewActiveUsers] = useState(true);
  const updateUser = async (id: string, data: Partial<CurrentUser>) => {
    await update(id, data);
  };

  const deleteUser = async (id: string) => {
    await remove(id);
  };
  const { isDesktop, isTablet } = useResponsive();

  const userTableColumns = useMemo(() => {
    let cols = [
      { header: "User", accessor: "username" },
      { header: "Email", accessor: "email" },
      { header: "Role", accessor: "roleID" },
      { header: "Status", accessor: "IsBanned" },
    ];

    if (isDesktop || isTablet) {
      cols.push(
        { header: "Subscriber", accessor: "IsSubscribed" },
        { header: "Default League", accessor: "DefaultLeague" },
        { header: "CFB", accessor: "teamId" },
        { header: "NFL", accessor: "NFLTeamID" },
        { header: "NFL Role", accessor: "NFLRole" },
        { header: "CBB", accessor: "cbb_id" },
        { header: "NBA", accessor: "NBATeamID" },
        { header: "NBA Role", accessor: "NBARole" },
        { header: "CHL", accessor: "CHLTeamID" },
        { header: "PHL", accessor: "PHLTeamID" },
        { header: "PHL Role", accessor: "PHLRole" },
      );
    }
    cols.push({ header: "Actions", accessor: "actions" });

    return cols;
  }, [isDesktop, isTablet]);

  const commissionerOptions: { label: string; value: string }[] = [
    { label: "None", value: "None" },
    { label: "Beta", value: "Beta" },
    { label: "CFB", value: "CFB Commissioner" },
    { label: "NFL", value: "NFL Commissioner" },
    { label: "CBB", value: "CBB Commissioner" },
    { label: "NBA", value: "NBA Commissioner" },
    { label: "CHL", value: "CHL Commissioner" },
    { label: "PHL", value: "PHL Commissioner" },
    { label: "CBL", value: "CBL Commissioner" },
    { label: "MLB", value: "MLB Commissioner" },
    { label: "Admin", value: "Admin" },
  ];

  const activeUsers = useMemo(() => {
    if (!users) return [];
    if (viewActiveUsers) {
      return users.filter((u) => {
        if (u.teamId) return true;
        if (u.NFLTeamID) return true;
        if (u.cbb_id) return true;
        if (u.NBATeamID) return true;
        if (u.CHLTeamID) return true;
        if (u.PHLTeamID) return true;
        return false;
      });
    }
    return users.filter((u) => {
      if (
        !u.teamId &&
        !u.NFLTeamID &&
        !u.cbb_id &&
        !u.NBATeamID &&
        !u.CHLTeamID &&
        !u.PHLTeamID
      )
        return true;
      return false;
    });
  }, [users, viewActiveUsers]);

  const filteredUsers = useMemo(() => {
    if (!activeUsers) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeUsers;
    return activeUsers.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [activeUsers, searchQuery]);

  const manageUserModal = useModal();

  const openManageModal = (user: CurrentUser) => {
    setViewingUser(user);
    manageUserModal.handleOpenModal();
  };

  const handleCloseManageModal = () => {
    setViewingUser(null);
    manageUserModal.handleCloseModal();
  };

  // ─── Forum Reports ──────────────────────────────────────────────────────────
  const [reports, setReports] = useState<PostReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportStatus | "all">("pending");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const data = await ForumService.GetPostReports(
        activeTab === "all" ? undefined : activeTab,
      );
      setReports(data);
    } finally {
      setReportsLoading(false);
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
        reviewedBy: currentUser?.username ?? "",
        adminNote: note ?? null,
      });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                reviewedBy: currentUser?.username ?? "",
                adminNote: note ?? null,
              }
            : r,
        ),
      );
    } finally {
      setReportBusy(id, false);
    }
  };

  const handleOpenReportedUser = (reportedUsername: string) => {
    const user = users?.find(
      (u) => u.username?.toLowerCase() === reportedUsername.toLowerCase(),
    );
    if (user) openManageModal(user);
  };

  const visibleReports =
    activeTab === "all"
      ? reports
      : reports.filter((r) => r.status === activeTab);

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return {
    users,
    filteredUsers,
    searchQuery,
    setSearchQuery,
    updateUser,
    deleteUser,
    isLoading,
    error,
    userTableColumns,
    commissionerOptions,
    manageUserModal,
    openManageModal,
    handleCloseManageModal,
    viewingUser,
    setViewingUser,
    viewActiveUsers,
    setViewActiveUsers,
    currentUser,
    reports,
    reportsLoading,
    activeTab,
    setActiveTab,
    noteInputs,
    setNoteInputs,
    busyIds,
    fetchReports,
    updateReport,
    handleOpenReportedUser,
    visibleReports,
    pendingCount,
  };
};
