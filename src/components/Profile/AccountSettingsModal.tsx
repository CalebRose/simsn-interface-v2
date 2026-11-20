import { FormEvent, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { Button } from "../../_design/Buttons";
import { Modal } from "../../_design/Modal";
import {
  refreshAccountEmail,
  requestEmailChange,
} from "../../_services/accountSettings";
import { AuthService } from "../../_services/auth";

interface AccountSettingsModalProps {
  uid: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal = ({
  uid,
  isOpen,
  onClose,
}: AccountSettingsModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setEmail("");
    setNewEmail("");
    setPassword("");
    setError("");
    setBusy(true);
    refreshAccountEmail(uid)
      .then((value) => {
        if (active) setEmail(value);
      })
      .catch((err) => {
        console.error("Failed to refresh account email:", err);
        if (active) {
          setError("Could not refresh your account email. Try again or sign in again.");
        }
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, uid]);

  const refresh = async () => {
    setBusy(true);
    setError("");
    try {
      setEmail(await refreshAccountEmail(uid));
      enqueueSnackbar("Account email refreshed.", { variant: "success" });
    } catch (err) {
      console.error("Failed to refresh account email:", err);
      setError("Could not refresh your account email. Try again or sign in again.");
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setBusy(true);
    setError("");
    try {
      const currentEmail = await refreshAccountEmail(uid);
      setEmail(currentEmail);
      const result = await AuthService.resetPassword(currentEmail);
      if (result.status) {
        enqueueSnackbar(result.message, { variant: "success" });
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Failed to prepare password reset:", err);
      setError("Could not send a password reset email. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const changeEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetEmail = newEmail.trim();
    if (targetEmail.toLowerCase() === email.toLowerCase()) {
      setError("Enter a different email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestEmailChange(uid, targetEmail, password);
      setPassword("");
      setNewEmail("");
      enqueueSnackbar(
        "Check your new email for a verification link. After verifying, sign in with the new address.",
        { variant: "success", autoHideDuration: 8000 },
      );
    } catch (err) {
      console.error("Failed to request email change:", err);
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? err.code
          : "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Your current password is incorrect.");
      } else if (code === "auth/email-already-in-use") {
        setError("That email address is already in use.");
      } else if (code === "auth/invalid-email") {
        setError("Enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Could not request an email change. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm break-all">Current login email: {email || "Unavailable"}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={resetPassword} disabled={busy || !email}>
              Send password reset email
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={refresh} disabled={busy}>
              {busy ? "Working..." : "Refresh email"}
            </Button>
          </div>
        </div>
        <form className="space-y-3" onSubmit={changeEmail}>
          <p className="text-sm">Change your email by verifying the new address. Your current email remains active until you verify it.</p>
          <label className="block text-sm" htmlFor="account-new-email">New email</label>
          <input
            id="account-new-email"
            type="email"
            autoComplete="email"
            required
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            className="w-full rounded-md border border-gray-400 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <label className="block text-sm" htmlFor="account-current-password">Current password</label>
          <input
            id="account-current-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-gray-400 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <Button type="submit" size="sm" disabled={busy || !email}>
            Send verification email
          </Button>
        </form>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </Modal>
  );
};
