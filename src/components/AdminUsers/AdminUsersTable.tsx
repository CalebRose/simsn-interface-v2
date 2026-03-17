import { FC, useMemo } from "react";
import { Table, TableCell } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { SelectDropdown } from "../../_design/Select";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { useResponsive } from "../../_hooks/useMobile";
import { getLogo } from "../../_utility/getLogo";
import {
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Logo } from "../../_design/Logo";
import { CheckCircle } from "../../_design/Icons";

interface AdminUsersTableProps {
  users: (CurrentUser & { id: string })[];
  columns: { header: string; accessor: string }[];
  commissionerOptions: { label: string; value: string }[];
  onUpdateRole: (id: string, roleID: string) => Promise<void>;
  openManageModal: (user: CurrentUser) => void;
}

export const AdminUsersTable: FC<AdminUsersTableProps> = ({
  users,
  commissionerOptions,
  columns,
  onUpdateRole,
  openManageModal,
}) => {
  const { isDesktop, isTablet } = useResponsive();

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users],
  );

  const rowRenderer = (
    item: CurrentUser & { id: string },
    index: number,
    backgroundColor: string,
  ) => {
    const cfbLogo = getLogo(SimCFB, item.teamId ?? 0, item.IsRetro);
    const nflLogo = getLogo(SimNFL, item.NFLTeamID ?? 0, item.IsRetro);
    const cbbLogo = getLogo(SimCBB, item.cbb_id ?? 0, item.IsRetro);
    const nbaLogo = getLogo(SimNBA, item.NBATeamID ?? 0, item.IsRetro);
    const chlLogo = getLogo(SimCHL, item.CHLTeamID ?? 0, item.IsRetro);
    const phlLogo = getLogo(SimPHL, item.PHLTeamID ?? 0, item.IsRetro);

    return (
      <div
        key={item.id}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        {/* Username */}
        <TableCell>
          <Text variant="small">{item.username}</Text>
        </TableCell>

        {/* Email */}
        <TableCell>
          <Text variant="small">{item.email}</Text>
        </TableCell>

        {/* Role */}
        <TableCell>
          <Text variant="small">{item.roleID ?? "—"}</Text>
        </TableCell>
        <TableCell classes="flex text-center justify-center">
          <Text variant="small">{!item.IsBanned ? "Good" : "BANNED"}</Text>
        </TableCell>

        {/* Desktop/Tablet-only columns */}
        {(isDesktop || isTablet) && (
          <>
            <TableCell classes="flex text-center justify-center">
              <Text variant="small">{item.IsSubscribed ? "Yes" : "—"}</Text>
            </TableCell>
            <TableCell>
              <Text variant="small">{item.DefaultLeague ?? "—"}</Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">
                {item.teamId !== undefined && item.teamId > 0 ? (
                  <Logo url={cfbLogo} variant="xs" />
                ) : (
                  "—"
                )}
              </Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">
                {item.NFLTeamID !== undefined && item.NFLTeamID > 0 ? (
                  <Logo url={nflLogo} variant="xs" />
                ) : (
                  "—"
                )}
              </Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">{item.NFLRole ?? "—"}</Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">
                {item.cbb_id !== undefined && item.cbb_id > 0 ? (
                  <Logo url={cbbLogo} variant="xs" />
                ) : (
                  "—"
                )}
              </Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">
                {item.NBATeamID !== undefined && item.NBATeamID > 0 ? (
                  <Logo url={nbaLogo} variant="xs" />
                ) : (
                  "—"
                )}
              </Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">{item.NBARole ?? "—"}</Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">
                {item.CHLTeamID !== undefined && item.CHLTeamID > 0 ? (
                  <Logo url={chlLogo} variant="xs" />
                ) : (
                  "—"
                )}
              </Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">
                {item.PHLTeamID !== undefined && item.PHLTeamID > 0 ? (
                  <Logo url={phlLogo} variant="xs" />
                ) : (
                  "—"
                )}
              </Text>
            </TableCell>
            <TableCell classes="text-center">
              <Text variant="small">{item.PHLRole ?? "—"}</Text>
            </TableCell>
          </>
        )}

        {/* Actions */}
        <TableCell classes="min-w-[10rem]">
          <SelectDropdown
            placeholder="Set Role"
            options={commissionerOptions}
            value={
              commissionerOptions.find((o) => o.value === item.roleID) ?? null
            }
            onChange={(selected) => {
              if (selected) {
                onUpdateRole(item.id, (selected as { value: string }).value);
              }
            }}
          />
          <Button
            variant="secondary"
            size="xs"
            classes="mt-1 w-full"
            onClick={() => openManageModal(item)}
          >
            <Text variant="xs">Manage</Text>
          </Button>
        </TableCell>
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      data={sortedUsers}
      rowRenderer={rowRenderer}
      team={null}
    />
  );
};
