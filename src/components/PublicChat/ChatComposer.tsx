import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import type { PostMention } from "../../models/forumModels";
import { ForumService } from "../../_services/forumService";
import {
  CHAT_MENTION_MAX_COUNT,
  CHAT_MESSAGE_MAX_LENGTH,
} from "../../_services/chatService";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface ChatComposerProps {
  disabled: boolean;
  disabledMessage: string | null;
  onSend: (
    body: string,
    mentionedUserIds: string[],
    image: File | null,
  ) => Promise<void>;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMentionQuery = (value: string, cursor: number) => {
  const precedingText = value.slice(0, cursor);
  const match = precedingText.match(/(?:^|\s)@([A-Za-z0-9_.-]*)$/);
  return match?.[1] ?? null;
};

export const ChatComposer = ({
  disabled,
  disabledMessage,
  onSend,
}: ChatComposerProps) => {
  const [body, setBody] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<PostMention[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<PostMention[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const mentionedUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const mention of selectedMentions) {
      const token = new RegExp(
        `(?:^|\\s)@${escapeRegExp(mention.username)}(?=\\s|$|[.,!?])`,
        "i",
      );
      if (token.test(body)) ids.add(mention.uid);
    }
    return [...ids];
  }, [body, selectedMentions]);

  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length === 0) {
      setMentionResults([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const results = await ForumService.SearchUsersByPrefix(mentionQuery, 8);
        if (!cancelled) setMentionResults(results);
      } catch (searchError) {
        console.error("Unable to search users for chat mention:", searchError);
        if (!cancelled) {
          setMentionResults([]);
          setError("Mention search failed. Please try again.");
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mentionQuery]);

  useEffect(() => {
    if (!image) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const selectMention = (mention: PostMention) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const prefix = body.slice(0, cursor);
    const nextPrefix = prefix.replace(
      /@([A-Za-z0-9_.-]*)$/,
      `@${mention.username} `,
    );
    const nextBody = nextPrefix + body.slice(cursor);
    setBody(nextBody);
    setSelectedMentions((previous) =>
      previous.some((item) => item.uid === mention.uid)
        ? previous
        : [...previous, mention],
    );
    setMentionQuery(null);
    setMentionResults([]);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextPrefix.length, nextPrefix.length);
    });
  };

  const handleImageSelection = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Images must be 5 MB or smaller.");
      return;
    }
    setError(null);
    setImage(file);
  };

  const handleSend = useCallback(async () => {
    const trimmedBody = body.trim();
    if (disabled || isSubmitting || !trimmedBody) return;
    if (trimmedBody.length > CHAT_MESSAGE_MAX_LENGTH) {
      setError(
        `Messages can be no longer than ${CHAT_MESSAGE_MAX_LENGTH} characters.`,
      );
      return;
    }
    if (mentionedUserIds.length > CHAT_MENTION_MAX_COUNT) {
      setError(`You can mention up to ${CHAT_MENTION_MAX_COUNT} users.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSend(trimmedBody, mentionedUserIds, image);
      setBody("");
      setSelectedMentions([]);
      setImage(null);
    } catch (sendError) {
      console.error("Unable to send chat message:", sendError);
      const code =
        typeof sendError === "object" &&
        sendError !== null &&
        "code" in sendError
          ? sendError.code
          : null;
      setError(
        code === "permission-denied"
          ? "Chat rules rejected this message. Refresh the chat status and try again."
          : sendError instanceof Error
            ? sendError.message
            : "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [body, disabled, image, isSubmitting, mentionedUserIds, onSend]);

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      {disabledMessage && (
        <p className="mb-2 text-center text-xs text-amber-700 dark:text-amber-300">
          {disabledMessage}
        </p>
      )}
      {error && (
        <p
          className="mb-2 text-center text-xs text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {mentionedUserIds.length > CHAT_MENTION_MAX_COUNT && (
        <p
          className="mb-2 text-center text-xs text-red-600 dark:text-red-400"
          role="alert"
        >
          You can mention up to {CHAT_MENTION_MAX_COUNT} users per message.
        </p>
      )}

      {imagePreviewUrl && image && (
        <div className="mb-2 flex items-center gap-2">
          <img
            src={imagePreviewUrl}
            alt="Selected attachment preview"
            className="h-14 w-14 rounded-md border border-gray-200 object-cover dark:border-gray-700"
          />
          <span className="min-w-0 flex-1 truncate text-xs text-gray-600 dark:text-gray-300">
            {image.name}
          </span>
          <button
            type="button"
            aria-label="Remove attached image"
            onClick={() => setImage(null)}
            className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="relative rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        {mentionResults.length > 0 && (
          <div
            role="listbox"
            aria-label="Mention suggestions"
            className="absolute bottom-full left-0 z-10 mb-2 max-h-48 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            {mentionResults.map((mention) => (
              <button
                key={mention.uid}
                type="button"
                role="option"
                aria-selected="false"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectMention(mention)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-800 hover:bg-blue-50 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                <span className="font-semibold text-blue-600 dark:text-blue-300">
                  @
                </span>
                {mention.username}
              </button>
            ))}
          </div>
        )}
        {isSearching && (
          <p className="absolute bottom-full left-2 mb-2 text-xs text-gray-500">
            Searching users…
          </p>
        )}
        <textarea
          ref={textareaRef}
          aria-label="Chat message"
          aria-describedby="chat-composer-help"
          disabled={disabled || isSubmitting}
          value={body}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          placeholder={
            disabled
              ? "Chat is unavailable"
              : "Write a message… (use @ to mention)"
          }
          rows={2}
          onChange={(event) => {
            const nextBody = event.currentTarget.value;
            setBody(nextBody);
            setError(null);
            setMentionQuery(
              getMentionQuery(nextBody, event.currentTarget.selectionStart),
            );
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && mentionQuery !== null) {
              setMentionQuery(null);
              setMentionResults([]);
              return;
            }
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-gray-100"
        />
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={disabled || isSubmitting || Boolean(image)}
              aria-label="Attach image"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ImagePlus size={18} aria-hidden="true" />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
              className="hidden"
              onChange={(event) => {
                handleImageSelection(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <span
              id="chat-composer-help"
              className="text-start text-xs text-gray-400"
            >
              @mentions · one image up to 5 MB · Shift+Enter for a new line
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {body.length}/{CHAT_MESSAGE_MAX_LENGTH}
            </span>
            <button
              type="button"
              disabled={
                disabled ||
                isSubmitting ||
                !body.trim() ||
                mentionedUserIds.length > CHAT_MENTION_MAX_COUNT
              }
              aria-label="Send message"
              onClick={() => void handleSend()}
              className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
