import React, { FC, useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { updateUserByUsername } from "../../firebase/firestoreHelper";
import { NFLRequest } from "../../models/footballModels";
import { NBARequest } from "../../models/basketballModels";
import { ProTeamRequest } from "../../models/hockeyModels";
import { Modal } from "../../_design/Modal";
import { Button, ButtonGrid, ButtonGroup } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { ToggleSwitch } from "../../_design/Inputs";
import { getLogo } from "../../_utility/getLogo";
import { Logo } from "../../_design/Logo";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { useSnackbar } from "notistack";
import { SectionHeading } from "../../_design/Section";
import { Hammer } from "../../_design/Icons";

interface ManageUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUser: (CurrentUser & { id: string }) | null;
  updateUser: (id: string, data: Partial<CurrentUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setViewingUser: (user: CurrentUser | null) => void;
}

// ─── Team row ────────────────────────────────────────────────────────────────
interface TeamRowProps {
  league: League;
  teamID: number;
  teamName: string;
  role?: string;
  isRetro?: boolean;
  onRemove: () => void;
}

const TeamRow: FC<TeamRowProps> = ({
  league,
  teamID,
  teamName,
  role,
  isRetro,
  onRemove,
}) => {
  const logo = getLogo(league, teamID, isRetro);
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-x-2">
        <Logo url={logo} variant="xs" />
        <div>
          <Text variant="small">{teamName}</Text>
          {role && (
            <Text variant="xs" classes="text-gray-500 dark:text-gray-400">
              {role}
            </Text>
          )}
        </div>
      </div>
      <Button variant="danger" size="xs" onClick={onRemove}>
        <Text variant="small">Remove</Text>
      </Button>
    </div>
  );
};

// ─── Forum Mute Controls ──────────────────────────────────────────────────────
interface ForumMuteControlsProps {
  user: CurrentUser & { id: string };
  updateUser: (id: string, data: Partial<CurrentUser>) => Promise<void>;
  setViewingUser: (user: CurrentUser | null) => void;
  isBusy: boolean;
  notify: (msg: string, variant: "success" | "error" | "warning") => void;
}

const ForumMuteControls: React.FC<ForumMuteControlsProps> = ({
  user,
  updateUser,
  setViewingUser,
  isBusy,
  notify,
}) => {
  const [muteDays, setMuteDays] = useState("");
  const [muteBusy, setMuteBusy] = useState(false);

  const muteExpiresAt = user.forumMutedUntil
    ? new Date(user.forumMutedUntil)
    : null;
  const isMuted = muteExpiresAt !== null && muteExpiresAt > new Date();

  const handleApplyMute = async () => {
    const days = parseInt(muteDays, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      notify("Enter a valid number of days (1–365)", "error");
      return;
    }
    setMuteBusy(true);
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      const iso = expires.toISOString();
      await updateUser(user.id, { forumMutedUntil: iso });
      setViewingUser({ ...user, forumMutedUntil: iso });
      setMuteDays("");
      notify(
        `${user.username} muted for ${days} day${days === 1 ? "" : "s"} (until ${expires.toLocaleDateString()})`,
        "warning",
      );
    } finally {
      setMuteBusy(false);
    }
  };

  const handleClearMute = async () => {
    setMuteBusy(true);
    try {
      await updateUser(user.id, { forumMutedUntil: null });
      setViewingUser({ ...user, forumMutedUntil: null });
      notify(`${user.username}'s forum mute has been lifted`, "success");
    } finally {
      setMuteBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      {isMuted ? (
        <div className="flex flex-col gap-y-1">
          <Text variant="body-small" classes="text-yellow-400">
            🔇 Muted until{" "}
            <span className="font-semibold">
              {muteExpiresAt!.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </Text>
          <Button
            variant="success"
            size="sm"
            disabled={isBusy || muteBusy}
            onClick={handleClearMute}
          >
            <Text variant="small">Lift Mute</Text>
          </Button>
        </div>
      ) : (
        <Text variant="body-small" classes="text-gray-400">
          No active mute.
        </Text>
      )}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={365}
          placeholder="Days"
          value={muteDays}
          onChange={(e) => setMuteDays(e.target.value)}
          className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <Button
          variant="warning"
          size="sm"
          disabled={isBusy || muteBusy || !muteDays}
          onClick={handleApplyMute}
        >
          <Text variant="small">{isMuted ? "Extend Mute" : "Mute User"}</Text>
        </Button>
      </div>
    </div>
  );
};

export const ManageUserModal: FC<ManageUserModalProps> = ({
  isOpen,
  onClose,
  viewingUser,
  updateUser,
  deleteUser,
  setViewingUser,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const {
    cfbTeamMap,
    proTeamMap,
    removeUserfromCFBTeamCall,
    removeUserfromNFLTeamCall,
  } = useSimFBAStore();
  const {
    cbbTeamMap,
    nbaTeamMap,
    removeUserfromCBBTeamCall,
    removeUserfromNBATeamCall,
  } = useSimBBAStore();
  const {
    chlTeamMap,
    phlTeamMap,
    removeUserfromCHLTeamCall,
    removeUserfromPHLTeamCall,
  } = useSimHCKStore();

  if (!viewingUser) return null;

  const u = viewingUser;

  // ── helpers ──────────────────────────────────────────────────────────────

  const withBusy = async (fn: () => Promise<void>) => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await fn();
    } finally {
      setIsBusy(false);
    }
  };

  const notify = (msg: string, variant: "success" | "error" | "warning") =>
    enqueueSnackbar(msg, { variant, autoHideDuration: 3000 });

  // ── remove from team ──────────────────────────────────────────────────────

  const handleRemoveCFB = () =>
    withBusy(async () => {
      await removeUserfromCFBTeamCall(u.teamId!);
      await updateUserByUsername(u.username, { teamId: 0 });
      setViewingUser({ ...u, teamId: 0 });
      notify(`${u.username} removed from CFB team`, "success");
    });

  const handleRemoveNFL = () =>
    withBusy(async () => {
      const role = u.NFLRole ?? "Coach";
      const request = new NFLRequest({
        NFLTeamID: u.NFLTeamID,
        Username: u.username,
        IsOwner: role === "Owner",
        IsCoach: role === "Coach",
        IsManager: role === "GM",
        IsAssistant: role === "Assistant",
      });
      await removeUserfromNFLTeamCall(request);
      await updateUserByUsername(u.username, { NFLTeamID: 0, NFLRole: "" });
      setViewingUser({ ...u, NFLTeamID: 0, NFLRole: "" });
      notify(`${u.username} removed from NFL team`, "success");
    });

  const handleRemoveCBB = () =>
    withBusy(async () => {
      await removeUserfromCBBTeamCall(u.cbb_id!);
      await updateUserByUsername(u.username, { cbb_id: 0 });
      setViewingUser({ ...u, cbb_id: 0 });
      notify(`${u.username} removed from CBB team`, "success");
    });

  const handleRemoveNBA = () =>
    withBusy(async () => {
      const role = u.NBARole ?? "Coach";
      const request = new NBARequest({
        NBATeamID: u.NBATeamID,
        Username: u.username,
        IsOwner: role === "Owner",
        IsCoach: role === "Coach",
        IsManager: role === "GM",
        IsAssistant: role === "Assistant",
      });
      await removeUserfromNBATeamCall(request);
      await updateUserByUsername(u.username, { NBATeamID: 0, NBARole: "" });
      setViewingUser({ ...u, NBATeamID: 0, NBARole: "" });
      notify(`${u.username} removed from NBA team`, "success");
    });

  const handleRemoveCHL = () =>
    withBusy(async () => {
      await removeUserfromCHLTeamCall(u.CHLTeamID!);
      await updateUserByUsername(u.username, { CHLTeamID: 0 });
      setViewingUser({ ...u, CHLTeamID: 0 });
      notify(`${u.username} removed from CHL team`, "success");
    });

  const handleRemovePHL = () =>
    withBusy(async () => {
      const request = new ProTeamRequest({
        TeamID: u.PHLTeamID,
        Username: u.username,
        Role: u.PHLRole ?? "Coach",
      });
      setViewingUser({ ...u, PHLTeamID: 0, PHLRole: "" });
      await removeUserfromPHLTeamCall(request);
      await updateUserByUsername(u.username, { PHLTeamID: 0, PHLRole: "" });
      notify(`${u.username} removed from PHL team`, "success");
    });

  // ── account actions ───────────────────────────────────────────────────────

  const handleToggleSubscriber = () =>
    withBusy(async () => {
      await updateUser(u.id, { IsSubscribed: !u.IsSubscribed });
      setViewingUser({ ...u, IsSubscribed: !u.IsSubscribed });
      notify(
        `${u.username} subscription ${!u.IsSubscribed ? "enabled" : "disabled"}`,
        "success",
      );
    });

  const handleToggleBan = () =>
    withBusy(async () => {
      if (u.username === "TuscanSota" || u.username === "Rocketcan") {
        notify("Cannot ban this user.", "error");
        return;
      }
      await updateUser(u.id, { IsBanned: !u.IsBanned });
      setViewingUser({ ...u, IsBanned: !u.IsBanned });
      notify(
        `${u.username} has been ${!u.IsBanned ? "banned" : "unbanned"}`,
        !u.IsBanned ? "warning" : "success",
      );
    });

  const handlePasswordReset = () =>
    withBusy(async () => {
      const auth = getAuth();
      try {
        await sendPasswordResetEmail(auth, u.email);
        notify(`Password reset email sent to ${u.email}`, "success");
      } catch (err) {
        notify("Failed to send password reset email", "error");
      }
    });

  const handleDelete = () =>
    withBusy(async () => {
      if (u.username === "TuscanSota" || u.username === "Rocketcan") {
        notify("Cannot delete this user", "error");
        return;
      }
      await deleteUser(u.id);
      notify(`${u.username} deleted`, "success");
      setConfirmDelete(false);
      onClose();
    });

  // ── team name helpers ────────────────────────────────────────────────────

  const cfbTeam = u.teamId ? cfbTeamMap?.[u.teamId] : null;
  const nflTeam = u.NFLTeamID ? proTeamMap?.[u.NFLTeamID] : null;
  const cbbTeam = u.cbb_id ? cbbTeamMap?.[u.cbb_id] : null;
  const nbaTeam = u.NBATeamID ? nbaTeamMap?.[u.NBATeamID] : null;
  const chlTeam = u.CHLTeamID ? chlTeamMap?.[u.CHLTeamID] : null;
  const phlTeam = u.PHLTeamID ? phlTeamMap?.[u.PHLTeamID] : null;

  const hasAnyTeam =
    cfbTeam || nflTeam || cbbTeam || nbaTeam || chlTeam || phlTeam;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmDelete(false);
        onClose();
      }}
      title={`Manage: ${u.username}`}
      maxWidth="max-w-xl"
      actions={
        <Button size="sm" variant="secondary" onClick={onClose}>
          <Text variant="small">Close</Text>
        </Button>
      }
    >
      {/* ── User info ── */}
      <div className="flex flex-col gap-y-0.5 mb-2">
        <Text variant="body-small">
          <span className="font-semibold">Email:</span> {u.email}
        </Text>
        <Text variant="body-small">
          <span className="font-semibold">Role:</span> {u.roleID ?? "—"}
        </Text>
        <Text variant="body-small">
          <span className="font-semibold">Default League:</span>{" "}
          {u.DefaultLeague ?? "—"}
        </Text>
      </div>

      {/* ── Teams ── */}
      {hasAnyTeam && (
        <>
          <SectionHeading label="Team Assignments" />
          {cfbTeam && (
            <TeamRow
              league={SimCFB}
              teamID={u.teamId!}
              teamName={`${cfbTeam.TeamName} ${cfbTeam.Mascot}`}
              isRetro={u.IsRetro}
              onRemove={handleRemoveCFB}
            />
          )}
          {nflTeam && (
            <TeamRow
              league={SimNFL}
              teamID={u.NFLTeamID!}
              teamName={`${nflTeam.TeamName} ${nflTeam.Mascot}`}
              role={u.NFLRole}
              isRetro={u.IsRetro}
              onRemove={handleRemoveNFL}
            />
          )}
          {cbbTeam && (
            <TeamRow
              league={SimCBB}
              teamID={u.cbb_id!}
              teamName={`${cbbTeam.Team} ${cbbTeam.Nickname}`}
              isRetro={u.IsRetro}
              onRemove={handleRemoveCBB}
            />
          )}
          {nbaTeam && (
            <TeamRow
              league={SimNBA}
              teamID={u.NBATeamID!}
              teamName={`${nbaTeam.Team} ${nbaTeam.Nickname}`}
              role={u.NBARole}
              isRetro={u.IsRetro}
              onRemove={handleRemoveNBA}
            />
          )}
          {chlTeam && (
            <TeamRow
              league={SimCHL}
              teamID={u.CHLTeamID!}
              teamName={`${chlTeam.TeamName} ${chlTeam.Mascot}`}
              isRetro={u.IsRetro}
              onRemove={handleRemoveCHL}
            />
          )}
          {phlTeam && (
            <TeamRow
              league={SimPHL}
              teamID={u.PHLTeamID!}
              teamName={`${phlTeam.TeamName} ${phlTeam.Mascot}`}
              role={u.PHLRole}
              isRetro={u.IsRetro}
              onRemove={handleRemovePHL}
            />
          )}
        </>
      )}

      {/* ── Account status ── */}
      <SectionHeading label="Account Status" />
      <div className="flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <Text variant="body-small">Subscriber</Text>
          <ToggleSwitch
            checked={!!u.IsSubscribed}
            onChange={handleToggleSubscriber}
          />
        </div>
      </div>

      {/* ── Forum Moderation ── */}
      <SectionHeading label="Forum Moderation" />
      <ForumMuteControls
        user={u}
        updateUser={updateUser}
        setViewingUser={setViewingUser}
        isBusy={isBusy}
        notify={notify}
      />

      {/* ── Actions ── */}
      <SectionHeading label="Actions" />
      <ButtonGrid>
        <Button
          variant="secondary"
          size="sm"
          classes="w-full mb-2"
          disabled={isBusy}
          onClick={handlePasswordReset}
        >
          <Text variant="small">Send Password Reset Email</Text>
        </Button>
        <Button
          variant={u.IsBanned ? "success" : "danger"}
          size="sm"
          classes="w-full mb-2"
          disabled={isBusy}
          onClick={handleToggleBan}
        >
          <Text
            variant="h6"
            classes="flex text-center justify-center gap-x-4 text-medium"
          >
            <span className="flex gap-x-4 items-center">
              {u.IsBanned ? "Unban" : "Ban"} <Hammer />
            </span>
          </Text>
        </Button>
      </ButtonGrid>

      {/* ── Danger zone ── */}
      <SectionHeading label="Danger Zone" />
      {!confirmDelete ? (
        <Button
          variant="danger"
          size="sm"
          classes="w-full"
          disabled={isBusy}
          onClick={() => setConfirmDelete(true)}
        >
          <Text variant="small">Delete User</Text>
        </Button>
      ) : (
        <div className="border border-red-500 rounded p-3 flex flex-col gap-y-2">
          <Text variant="body-small" classes="text-red-500 font-semibold">
            This action is permanent and cannot be undone. Are you sure?
          </Text>
          <ButtonGroup>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              <Text variant="small">Cancel</Text>
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isBusy}
              onClick={handleDelete}
            >
              <Text variant="small">Confirm Delete</Text>
            </Button>
          </ButtonGroup>
        </div>
      )}
    </Modal>
  );
};
