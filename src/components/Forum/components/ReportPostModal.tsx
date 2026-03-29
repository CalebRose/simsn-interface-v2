import React, { useState } from "react";
import { Modal } from "../../../_design/Modal";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import {
  Post,
  CreateReportDTO,
  ReportCategory,
} from "../../../models/forumModels";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "inflammatory", label: "Inflammatory / Inciting" },
  { value: "abusive", label: "Abuse / Harassment" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "other", label: "Other" },
];

interface ReportPostModalProps {
  isOpen: boolean;
  post: Post;
  onClose: () => void;
  onSubmit: (dto: CreateReportDTO) => Promise<void>;
}

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  isOpen,
  post,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState<ReportCategory>("inflammatory");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        postId: post.id,
        threadId: post.threadId,
        forumId: post.forumId,
        reportedUid: post.author.uid,
        reportedUsername: post.author.username,
        category,
        reason: trimmed,
      });
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategory("inflammatory");
    setReason("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Post"
      maxWidth="max-w-md"
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
        <div className="flex flex-col gap-y-4">
          <Text variant="body-small" classes="text-gray-400">
            Reporting post by{" "}
            <span className="font-semibold text-white">
              {post.author.username}
            </span>
          </Text>

          {/* Category */}
          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="font-semibold">
              Category
            </Text>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="font-semibold">
              Reason{" "}
              <span className="text-gray-500 font-normal">
                (min 10 characters)
              </span>
            </Text>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why this post violates community guidelines…"
              rows={4}
              maxLength={500}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500"
            />
            <Text variant="xs" classes="text-gray-500 text-right">
              {reason.length}/500
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};
