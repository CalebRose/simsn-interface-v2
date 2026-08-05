import React, { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "../../_design/Modal";
import { Button } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { DMService } from "../../_services/dmService";
import { useAuthStore } from "../../context/AuthContext";

const REASONS = [
  "Abusive or harassing behaviour",
  "Spam or unsolicited advertising",
  "Inappropriate content",
  "Threats or intimidation",
  "Other",
];

interface ReportConversationModalProps {
  isOpen: boolean;
  conversationId: string;
  participants: { uid: string; username: string }[];
  onClose: () => void;
}

export const ReportConversationModal: React.FC<
  ReportConversationModalProps
> = ({ isOpen, conversationId, participants, onClose }) => {
  const { currentUser } = useAuthStore();
  const [selectedUserId, setSelectedUserId] = useState(
    participants[0]?.uid ?? "",
  );
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedUser = participants.find((p) => p.uid === selectedUserId);

  const handleSubmit = async () => {
    if (!currentUser || !selectedUser) return;
    setIsSubmitting(true);
    try {
      await DMService.reportUserInConversation(
        conversationId,
        currentUser.id,
        currentUser.username,
        selectedUser.uid,
        selectedUser.username,
        details.trim() ? `${reason}: ${details.trim()}` : reason,
      );
      setSubmitted(true);
      enqueueSnackbar("Report submitted. This conversation has been muted.", {
        variant: "info",
      });
    } catch {
      enqueueSnackbar("Failed to submit report. Please try again.", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId(participants[0]?.uid ?? "");
    setReason(REASONS[0]);
    setDetails("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report User"
      maxWidth="max-w-md"
    >
      {submitted ? (
        <div className="text-center py-4">
          <Text variant="body-small" className="text-gray-700 dark:text-gray-300">
            Your report has been submitted. The conversation has been muted and
            will no longer send you notifications.
          </Text>
          <div className="mt-4">
            <Button size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* User selector */}
          {participants.length > 1 && (
            <div>
              <Text
                variant="small"
                className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
              >
                Report who?
              </Text>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {participants.map((p) => (
                  <option key={p.uid} value={p.uid}>
                    @{p.username}
                  </option>
                ))}
              </select>
            </div>
          )}
          {participants.length === 1 && (
            <Text
              variant="small"
              className="text-gray-700 dark:text-gray-300"
            >
              Reporting{" "}
              <span className="font-semibold">@{participants[0].username}</span>
            </Text>
          )}

          {/* Reason */}
          <div>
            <Text
              variant="small"
              className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
            >
              Reason
            </Text>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Optional details */}
          <div>
            <Text
              variant="small"
              className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
            >
              Additional details{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </Text>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Describe the issue…"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedUser}
            >
              {isSubmitting ? "Submitting…" : "Submit Report"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
