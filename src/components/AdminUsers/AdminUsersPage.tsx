import { FC } from "react";
import { useAdminUsersPage } from "./useAdminUsersPage";
import { AdminUsersTable } from "./AdminUsersTable";
import { ManageUserModal } from "./ManageUserModal";
import { PageContainer } from "../../_design/Container";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { Input, ToggleSwitch } from "../../_design/Inputs";

export const AdminUsersPage: FC = () => {
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    updateUser,
    deleteUser,
    isLoading,
    error,
    commissionerOptions,
    userTableColumns,
    manageUserModal,
    viewingUser,
    setViewingUser,
    openManageModal,
    handleCloseManageModal,
    viewActiveUsers,
    setViewActiveUsers,
  } = useAdminUsersPage();

  if (error) return <div>Error loading users: {error.message}</div>;

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Manage Users">
        <Border classes="w-[95vw] px-4 py-4">
          <div className="grid grid-flow-row grid-cols-2 md:grid-cols-4 space-x-2">
            <div className="flex items-center">
              <Text variant="h6" className="text-start mb-2">
                User Count: {filteredUsers ? filteredUsers.length : "—"}
              </Text>
            </div>
            <div className="flex flex-row gap-x-4 items-center">
              <Text variant="h6" className="text-start mb-2">
                View Active Users
              </Text>
              <ToggleSwitch
                checked={viewActiveUsers}
                onChange={() => setViewActiveUsers((prev) => !prev)}
              />
            </div>
            <div className="col-span-2 flex flex-row gap-x-4 items-center">
              <Text variant="h6" className="text-start mb-2">
                Search
              </Text>
              <Input
                placeholder="Filter by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Border>
        <div className="max-h-[75vh] overflow-auto max-w-[95vw]">
          {filteredUsers && filteredUsers.length > 0 && (
            <AdminUsersTable
              users={filteredUsers}
              commissionerOptions={commissionerOptions}
              onUpdateRole={(id, roleID) => updateUser(id, { roleID })}
              openManageModal={openManageModal}
              columns={userTableColumns}
            />
          )}
        </div>
      </PageContainer>
      {manageUserModal.isModalOpen && viewingUser && (
        <ManageUserModal
          isOpen={manageUserModal.isModalOpen}
          onClose={handleCloseManageModal}
          viewingUser={viewingUser as typeof viewingUser & { id: string }}
          updateUser={updateUser}
          deleteUser={deleteUser}
          setViewingUser={setViewingUser}
        />
      )}
    </>
  );
};
