import React, { useRef, useState } from "react";
import { RichTextDocument, PostMention } from "../../../models/forumModels";
import { Button } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";

// ─────────────────────────────────────────────
// ForumEditor – V1 plain-text editor.
// Stores content as a structured RichTextDocument
// (paragraph nodes) so the schema is compatible with
// a future TipTap/Lexical drop-in.
// ─────────────────────────────────────────────

interface ForumEditorProps {
  initialText?: string;
  placeholder?: string;
  onSubmit: (
    doc: RichTextDocument,
    plainText: string,
    mentions: PostMention[],
  ) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  maxLength?: number;
}

/** Converts a plain string into a minimal RichTextDocument. */
export function plaintextToDoc(text: string): RichTextDocument {
  const paragraphs = text.split("\n").map((line) => ({
    type: "paragraph" as const,
    content: line.length > 0 ? [{ type: "text" as const, text: line }] : [],
  }));

  return {
    type: "doc",
    content: paragraphs,
  };
}

/** Extracts plain text from a RichTextDocument. */
export function docToPlaintext(doc: RichTextDocument): string {
  function extractText(node: {
    type: string;
    text?: string;
    content?: unknown[];
  }): string {
    if (node.type === "text") return node.text ?? "";
    if (!node.content) return "";
    return (node.content as (typeof node)[])
      .map(extractText)
      .join(node.type === "paragraph" ? "\n" : "");
  }
  return doc.content.map(extractText).join("\n");
}

const MAX_DEFAULT = 10000;

export const ForumEditor: React.FC<ForumEditorProps> = ({
  initialText = "",
  placeholder = "Write your post…",
  onSubmit,
  onCancel,
  submitLabel = "Post",
  isSubmitting = false,
  maxLength = MAX_DEFAULT,
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = maxLength - text.length;
  const isOverLimit = remaining < 0;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isOverLimit) return;
    const doc = plaintextToDoc(trimmed);
    onSubmit(doc, trimmed, []);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={6}
        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-sm text-white placeholder-gray-500 resize-y focus:outline-none focus:border-blue-500 transition-colors"
        disabled={isSubmitting}
        aria-label="Post editor"
      />

      <div className="flex items-center justify-between">
        <Text
          variant="xs"
          classes={isOverLimit ? "text-red-400" : "text-gray-500"}
        >
          {isOverLimit
            ? `${Math.abs(remaining)} characters over limit`
            : `${remaining} characters remaining`}
        </Text>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || text.trim().length === 0 || isOverLimit}
          >
            {isSubmitting ? "Posting…" : submitLabel}
          </Button>
        </div>
      </div>
      <Text variant="xs" classes="text-gray-600">
        Tip: Ctrl+Enter to submit
      </Text>
    </div>
  );
};
