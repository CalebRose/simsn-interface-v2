import { useMemo, useState } from "react";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { useFirestoreCollection } from "../../firebase/firebase";
import { useResponsive } from "../../_hooks/useMobile";
import { useModal } from "../../_hooks/useModal";

export const useAdminUsersPage = () => {
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
  };
};
