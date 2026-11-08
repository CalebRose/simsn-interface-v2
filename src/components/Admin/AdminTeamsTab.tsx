import { useMemo, useState } from "react";
import {
  Coach,
  GM,
  League,
  Marketing,
  Owner,
  Scout,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { Table, TableCell } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { updateUserByUsername } from "../../firebase/firestoreHelper";
import { NBARequest } from "../../models/basketballModels";
import { NFLRequest } from "../../models/footballModels";
import { ProTeamRequest } from "../../models/hockeyModels";
import { RemoveUserModal } from "../AvailableTeams/RemoveUserModal";
import { calculateStanding } from "./helper/cardHelper";

interface AdminTeamRole {
  role: string;
  label: string;
  username: string;
}

interface AdminTeamRow {
  ID: number;
  TeamLabel: string;
  logo: string;
  Owner: string;
  GM: string;
  Coach: string;
  Scout: string;
  Marketing: string;
  LastLogin: number;
  Standing: number;
  PenaltyMarks: number;
  WeeksMissed: number;
  isAIInRecruiting: boolean;
  roles: AdminTeamRole[];
  canRemove: boolean;
  remove: (role: string) => Promise<void>;
}

type ColumnDef = { header: string; accessor: string };

const teamColumn = { header: "Team", accessor: "TeamLabel" };
const lastLoginColumn = { header: "Last Activity", accessor: "LastLogin" };
const standingColumn = { header: "Standing", accessor: "Standing" };
const actionsColumn = { header: "", accessor: "actions" };

const collegeColumns: ColumnDef[] = [
  teamColumn,
  { header: "Coach", accessor: "Coach" },
  lastLoginColumn,
  standingColumn,
  { header: "Weeks Missed", accessor: "WeeksMissed" },
  actionsColumn,
];

const getProColumns = (
  includeMarketing: boolean,
  includePenalty: boolean,
): ColumnDef[] => [
  teamColumn,
  { header: "Owner", accessor: "Owner" },
  { header: "GM", accessor: "GM" },
  { header: "Coach", accessor: "Coach" },
  { header: "Scout", accessor: "Scout" },
  ...(includeMarketing ? [{ header: "Marketing", accessor: "Marketing" }] : []),
  lastLoginColumn,
  standingColumn,
  ...(includePenalty
    ? [{ header: "Penalty Marks", accessor: "PenaltyMarks" }]
    : []),
  actionsColumn,
];

const toTimestamp = (value: any): number => {
  const time = new Date(value?.toString()).getTime();
  return isNaN(time) ? 0 : time;
};

const formatLastLogin = (timestamp: number): string => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

const openLabel = (value: string) =>
  value && value.length > 0 && value !== "AI" ? value : "Open";

export const AdminTeamsTab = () => {
  const { selectedLeague } = useLeagueStore();
  const { currentUser } = useAuthStore();
  const {
    chlTeams,
    phlTeams,
    teamProfileMap: chlProfileMap,
    removeUserfromCHLTeamCall,
    removeUserfromPHLTeamCall,
  } = useSimHCKStore();
  const {
    cfbTeams,
    nflTeams,
    teamProfileMap: cfbProfileMap,
    removeUserfromCFBTeamCall,
    removeUserfromNFLTeamCall,
  } = useSimFBAStore();
  const {
    cbbTeams,
    nbaTeams,
    teamProfileMap: cbbProfileMap,
    removeUserfromCBBTeamCall,
    removeUserfromNBATeamCall,
  } = useSimBBAStore();
  const [selectedRow, setSelectedRow] = useState<AdminTeamRow | null>(null);
  const isRetro = currentUser?.IsRetro;

  const { rows, columns } = useMemo((): {
    rows: AdminTeamRow[];
    columns: ColumnDef[];
  } => {
    const base = (
      league: League,
      id: number,
      label: string,
      lastLogin: any,
    ): Pick<
      AdminTeamRow,
      | "ID"
      | "TeamLabel"
      | "logo"
      | "Owner"
      | "GM"
      | "Coach"
      | "Scout"
      | "Marketing"
      | "LastLogin"
      | "PenaltyMarks"
      | "WeeksMissed"
      | "isAIInRecruiting"
    > => ({
      ID: id,
      TeamLabel: label,
      logo: getLogo(league, id, isRetro),
      Owner: "",
      GM: "",
      Coach: "",
      Scout: "",
      Marketing: "",
      LastLogin: toTimestamp(lastLogin),
      PenaltyMarks: 0,
      WeeksMissed: 0,
      isAIInRecruiting: false,
    });

    const hasCoach = (coach: string) => coach.length > 0 && coach !== "AI";

    const buildCollege = (
      league: League,
      team: any,
      label: string,
      profileMap: any,
      goodStandingWhen: (team: any) => boolean,
      removeUser: (teamID: number) => Promise<void>,
      userPayload: Record<string, any>,
    ): AdminTeamRow => {
      const profile = profileMap ? profileMap[team.ID] : null;
      return {
        ...base(league, team.ID, label, team.LastLogin),
        Coach: team.Coach,
        WeeksMissed: profile?.WeeksMissed ?? 0,
        isAIInRecruiting: profile?.IsAI ?? false,
        Standing: goodStandingWhen(team) ? 1 : calculateStanding(team) ? 1 : 0,
        roles: [{ role: Coach, label: "Remove", username: team.Coach }],
        canRemove: hasCoach(team.Coach),
        remove: async () => {
          const userName = team.Coach;
          await removeUser(team.ID);
          setSelectedRow(null);
          await updateUserByUsername(userName, userPayload);
        },
      };
    };

    switch (selectedLeague) {
      case SimCHL:
        return {
          columns: collegeColumns,
          rows: chlTeams.map((team) =>
            buildCollege(
              SimCHL as League,
              team,
              `${team.TeamName} ${team.Mascot}`,
              chlProfileMap,
              (t) => !t.IsUserCoached,
              removeUserfromCHLTeamCall,
              { CHLTeamID: 0 },
            ),
          ),
        };
      case SimCFB:
        return {
          columns: collegeColumns,
          rows: cfbTeams.map((team) =>
            buildCollege(
              SimCFB as League,
              team,
              `${team.TeamName} ${team.Mascot}`,
              cfbProfileMap,
              (t) => !hasCoach(t.Coach),
              removeUserfromCFBTeamCall,
              { teamId: 0 },
            ),
          ),
        };
      case SimCBB:
        return {
          columns: collegeColumns,
          rows: cbbTeams.map((team) =>
            buildCollege(
              SimCBB as League,
              team,
              `${team.Team} ${team.Nickname}`,
              cbbProfileMap,
              (t) => !t.IsUserCoached,
              removeUserfromCBBTeamCall,
              { cbb_id: 0 },
            ),
          ),
        };
      case SimPHL:
        return {
          columns: getProColumns(true, false),
          rows: phlTeams.map((team) => {
            const roles: AdminTeamRole[] = [
              { role: Owner, label: "Ownership", username: team.Owner },
              { role: Coach, label: "Coach", username: team.Coach },
              { role: GM, label: "GM", username: team.GM },
              { role: Scout, label: "Scout", username: team.Scout },
              { role: Marketing, label: "Marketing", username: team.Marketing },
            ];
            return {
              ...base(
                SimPHL as League,
                team.ID,
                `${team.TeamName} ${team.Mascot}`,
                team.LastLogin,
              ),
              Owner: team.Owner,
              GM: team.GM,
              Coach: team.Coach,
              Scout: team.Scout,
              Marketing: team.Marketing,
              Standing: calculateStanding(team) ? 1 : 0,
              roles,
              canRemove: team.Owner.length > 0,
              remove: async (role: string) => {
                const dto = { TeamID: team.ID, Role: role } as ProTeamRequest;
                const userName =
                  roles.find((r) => r.role === role)?.username ?? "";
                await updateUserByUsername(userName, {
                  PHLTeamID: 0,
                  PHLRole: "",
                });
                setSelectedRow(null);
                await removeUserfromPHLTeamCall(dto);
              },
            };
          }),
        };
      case SimNFL:
        return {
          columns: getProColumns(false, true),
          rows: nflTeams.map((team) => {
            const roles: AdminTeamRole[] = [
              { role: Owner, label: "Ownership", username: team.NFLOwnerName },
              { role: Coach, label: "Coach", username: team.NFLCoachName },
              { role: GM, label: "GM", username: team.NFLGMName },
              { role: Scout, label: "Scout", username: team.NFLAssistantName },
            ];
            return {
              ...base(
                SimNFL as League,
                team.ID,
                `${team.TeamName} ${team.Mascot}`,
                team.LastLogin,
              ),
              Owner: team.NFLOwnerName,
              GM: team.NFLGMName,
              Coach: team.NFLCoachName,
              Scout: team.NFLAssistantName,
              PenaltyMarks: team.PenaltyMarks ?? 0,
              Standing: calculateStanding(team) ? 1 : 0,
              roles,
              canRemove: team.NFLOwnerName.length > 0,
              remove: async (role: string) => {
                const userName =
                  roles.find((r) => r.role === role)?.username ?? "";
                const dto = {
                  NFLTeamID: team.ID,
                  IsOwner: role === Owner,
                  IsCoach: role === Coach,
                  IsManager: role === GM,
                  IsAssistant: role === Scout,
                  Username: userName,
                } as NFLRequest;
                await updateUserByUsername(userName, {
                  NFLTeamID: 0,
                  NFLRole: "",
                });
                setSelectedRow(null);
                await removeUserfromNFLTeamCall(dto);
              },
            };
          }),
        };
      case SimNBA:
        return {
          columns: getProColumns(false, false),
          rows: nbaTeams.map((team) => {
            const roles: AdminTeamRole[] = [
              { role: Owner, label: "Ownership", username: team.NBAOwnerName },
              { role: Coach, label: "Coach", username: team.NBACoachName },
              { role: GM, label: "GM", username: team.NBAGMName },
              { role: Scout, label: "Scout", username: team.NBAAssistantName },
            ];
            return {
              ...base(
                SimNBA as League,
                team.ID,
                `${team.Team} ${team.Nickname}`,
                team.LastLogin,
              ),
              Owner: team.NBAOwnerName,
              GM: team.NBAGMName,
              Coach: team.NBACoachName,
              Scout: team.NBAAssistantName,
              Standing: calculateStanding(team) ? 1 : 0,
              roles,
              canRemove: team.NBAOwnerName.length > 0,
              remove: async (role: string) => {
                const userName =
                  roles.find((r) => r.role === role)?.username ?? "";
                const dto = {
                  NBATeamID: team.ID,
                  IsOwner: role === Owner,
                  IsCoach: role === Coach,
                  IsManager: role === GM,
                  IsAssistant: role === Scout,
                  Username: userName,
                } as NBARequest;
                await updateUserByUsername(userName, {
                  NBATeamID: 0,
                  NBARole: "",
                });
                setSelectedRow(null);
                await removeUserfromNBATeamCall(dto);
              },
            };
          }),
        };
      default:
        return { columns: collegeColumns, rows: [] };
    }
  }, [
    selectedLeague,
    isRetro,
    chlTeams,
    phlTeams,
    cfbTeams,
    nflTeams,
    cbbTeams,
    nbaTeams,
    chlProfileMap,
    cfbProfileMap,
    cbbProfileMap,
    removeUserfromCHLTeamCall,
    removeUserfromPHLTeamCall,
    removeUserfromCFBTeamCall,
    removeUserfromNFLTeamCall,
    removeUserfromCBBTeamCall,
    removeUserfromNBATeamCall,
  ]);

  // Keep the modal bound to the latest row data after store updates.
  const activeRow = selectedRow
    ? (rows.find((r) => r.ID === selectedRow.ID) ?? selectedRow)
    : null;
  const isMultiRole = (activeRow?.roles.length ?? 0) > 1;

  const rowRenderer = (
    item: AdminTeamRow,
    _index: number,
    backgroundColor: string,
  ) => {
    const textColorClass = getTextColorBasedOnBg(backgroundColor);
    const textCell = (value: string) => (
      <TableCell>
        <Text variant="small" classes={textColorClass}>
          {openLabel(value)}
        </Text>
      </TableCell>
    );
    const hasColumn = (accessor: string) =>
      columns.some((c) => c.accessor === accessor);
    return (
      <div
        key={item.ID}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <TableCell>
          <div className="flex items-center gap-x-2">
            <Logo url={item.logo} variant="xs" containerClass="p-3" />
            <Text variant="small" classes={textColorClass}>
              {item.TeamLabel}
            </Text>
          </div>
        </TableCell>
        {hasColumn("Owner") && textCell(item.Owner)}
        {hasColumn("GM") && textCell(item.GM)}
        {textCell(item.Coach)}
        {hasColumn("Scout") && textCell(item.Scout)}
        {hasColumn("Marketing") && textCell(item.Marketing)}
        <TableCell>
          <Text variant="small" classes={textColorClass}>
            {formatLastLogin(item.LastLogin)}
          </Text>
        </TableCell>
        <TableCell>
          <Text
            variant="small"
            classes={item.Standing ? "text-green-500" : "text-red-500"}
          >
            {item.Standing ? "In Good Standing" : "Inactive"}
          </Text>
        </TableCell>
        {hasColumn("WeeksMissed") && (
          <TableCell>
            <Text variant="small" classes={textColorClass}>
              {item.WeeksMissed} {item.isAIInRecruiting ? "(AI Active)" : ""}
            </Text>
          </TableCell>
        )}
        {hasColumn("PenaltyMarks") && (
          <TableCell>
            <Text variant="small" classes={textColorClass}>
              {item.PenaltyMarks}
            </Text>
          </TableCell>
        )}
        <TableCell>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedRow(item)}
            disabled={!item.canRemove}
          >
            Remove
          </Button>
        </TableCell>
      </div>
    );
  };

  return (
    <div className="px-2 w-full">
      <Table<AdminTeamRow>
        columns={columns}
        data={rows}
        team={null}
        rowRenderer={rowRenderer}
        league={selectedLeague as League}
        page="AdminTeams"
      />
      <RemoveUserModal
        isOpen={!!activeRow}
        onClose={() => setSelectedRow(null)}
        title={`Remove User from ${activeRow?.TeamLabel ?? ""}?`}
        actions={
          activeRow && (
            <ButtonGroup>
              {activeRow.roles.map((r) => (
                <Button
                  key={r.role}
                  size="sm"
                  onClick={() => activeRow.remove(r.role)}
                  disabled={r.username === "AI" || r.username === ""}
                >
                  <Text variant="small">{r.label}</Text>
                </Button>
              ))}
            </ButtonGroup>
          )
        }
      >
        <Text classes="mb-4 text-start">
          {isMultiRole
            ? `Please select the button that correlates to the user you would like to remove from the ${activeRow?.TeamLabel}. Once you select one of the buttons, the user will be removed from the team and they will need to re-apply in order to rejoin.`
            : "Once you select the remove button, the user will be removed from the team. They will need to re-apply for the same or different team in order to rejoin the league."}
        </Text>
        <Text classes="mb-4 text-start">Are you sure you want to do this?</Text>
      </RemoveUserModal>
    </div>
  );
};
