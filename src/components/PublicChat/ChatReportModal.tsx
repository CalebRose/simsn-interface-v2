import { useState } from "react";
import { Modal } from "../../_design/Modal";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { ChatService } from "../../_services/chatService";
import type {
  ChatReportCategory,
  ChatReportTarget,
} from "../../models/chatModels";

const CATEGORIES: { value: ChatReportCategory; label: string }[] = [
  { value: "inflammatory", label: "Inflammatory / Inciting" },
  { value: "abusive", label: "Abuse / Harassment" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "other", label: "Other" },
];

interface ChatReportModalProps {
  target: ChatReportTarget | null;
  reporterUid: string;
  reporterUsername: string;
  onClose: () => void;
}

export const ChatReportModal = ({
  target,
  reporterUid,
  reporterUsername,
  onClose,
}: ChatReportModalProps) => {
  const [category, setCategory] = useState<ChatReportCategory>("inflammatory");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setCategory("inflammatory");
    setReason("");
    setSubmitted(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!target || reason.trim().length < 10) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await ChatService.reportMessage(
        target,
        category,
        reason,
        reporterUid,
        reporterUsername,
      );
      setSubmitted(true);
    } catch (submitError) {
      console.error("Unable to submit chat report:", submitError);
      setError("Unable to submit the report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={target !== null}
      onClose={handleClose}
      title="Report Chat Message"
      maxWidth="max-w-md"
      zIndexClass="z-[120]"
      actions={
        submitted ? (
          <Button variant="primary" size="sm" onClick={handleClose}>
            Close
          </Button>
        ) : (
          <ButtonGroup>
            <Button
              variant="secondary"
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
              disabled={isSubmitting || reason.trim().length < 10}
            >
              {isSubmitting ? "Sending…" : "Submit Report"}
            </Button>
          </ButtonGroup>
        )
      }
    >
      {submitted ? (
        <div className="py-4 text-center">
          <Text variant="body-small" classes="text-green-400">
            ✓ Report submitted. A moderator will review it shortly.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4 text-start">
          <Text variant="body-small" classes="text-gray-400">
            Reporting a message from{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {target?.reportedUsername}
            </span>
          </Text>
          <blockquote className="line-clamp-4 break-words rounded border-l-2 border-gray-500 bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            {target?.messageBody}
          </blockquote>

          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="font-semibold">
              Category
            </Text>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ChatReportCategory)
              }
              className="w-full rounded-sm border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-hidden"
            >
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="font-semibold">
              Reason{" "}
              <span className="font-normal text-gray-500">
                (min 10 characters)
              </span>
            </Text>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe why this message violates community guidelines…"
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-sm border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-hidden"
            />
            <Text variant="xs" classes="text-right text-gray-500">
              {reason.length}/500
            </Text>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};
