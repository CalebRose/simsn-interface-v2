import React, { useCallback, useRef, useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "../../_design/Modal";
import { Button } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { Tag } from "../../_design/Tags";
import {
  ForumEditor,
  ForumEditorHandle,
} from "../Forum/components/ForumEditor";
import { DMService } from "../../_services/dmService";
import { useAuthStore } from "../../context/AuthContext";
import { useDMStore } from "../../context/DMContext";
import type { RichTextDocument, PostMention } from "../../models/forumModels";

const INBOX_CAP = 10;
const NEW_USER_HOURS = 48;
const MAX_PARTICIPANTS = 10;

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-populate a recipient (e.g. clicking "Message" on a profile). */
  initialRecipient?: { uid: string; username: string };
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  initialRecipient,
}) => {
  const { currentUser } = useAuthStore();
  const { isInboxFull } = useDMStore();

  const [subject, setSubject] = useState("");
  const [participants, setParticipants] = useState<
    { uid: string; username: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { uid: string; username: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<ForumEditorHandle>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject pre-populated recipient
  useEffect(() => {
    if (isOpen && initialRecipient) {
      setParticipants([initialRecipient]);
    }
  }, [isOpen, initialRecipient]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSubject("");
      setParticipants([]);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  // 48-hour new user check: new users can only DM one person
  const isNewUser =
    !!currentUser?.createdAt &&
    (() => {
      const created =
        typeof currentUser.createdAt.toMillis === "function"
          ? currentUser.createdAt.toMillis()
          : Number(currentUser.createdAt) * 1000;
      return Date.now() - created < NEW_USER_HOURS * 60 * 60 * 1000;
    })();
  const maxAllowedRecipients = isNewUser ? 1 : MAX_PARTICIPANTS - 1;

  const addParticipant = (user: { uid: string; username: string }) => {
    if (participants.some((p) => p.uid === user.uid)) return;
    if (user.uid === currentUser?.id) return;
    if (participants.length >= maxAllowedRecipients) return;
    setParticipants((prev) => [...prev, user]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeParticipant = (uid: string) => {
    setParticipants((prev) => prev.filter((p) => p.uid !== uid));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && searchResults.length > 0) {
      e.preventDefault();
      addParticipant(searchResults[0]);
    }
  };

  // Debounced user search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await DMService.searchUsers(searchQuery.trim());
        setSearchResults(
          results.filter(
            (u) =>
              u.uid !== currentUser?.id &&
              !participants.some((p) => p.uid === u.uid),
          ),
        );
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, currentUser?.id, participants]);

  const handleSend = useCallback(
    async (
      doc: RichTextDocument,
      plainText: string,
      mentions: PostMention[],
    ) => {
      if (!currentUser || participants.length === 0 || !subject.trim()) return;
      setIsSubmitting(true);
      try {
        const result = await DMService.createConversation(
          currentUser.id,
          currentUser.username,
          participants,
          subject.trim(),
          doc,
          plainText,
          mentions,
        );
        if ("error" in result) {
          if (result.error === "INBOX_FULL") {
            enqueueSnackbar(
              "Your inbox is full. Archive a conversation first.",
              { variant: "warning" },
            );
          }
          return;
        }
        enqueueSnackbar("Message sent.", { variant: "success" });
        onClose();
      } catch {
        enqueueSnackbar("Failed to send message. Please try again.", {
          variant: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentUser, participants, subject, onClose],
  );

  const canSend =
    participants.length > 0 &&
    subject.trim().length > 0 &&
    !isInboxFull &&
    !isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Message"
      maxWidth="max-w-3xl"
      classes="mx-2 sm:mx-auto"
    >
      {isInboxFull && (
        <div className="mb-3 px-3 py-2 rounded-md bg-yellow-500/10 border border-yellow-500/30">
          <Text
            variant="small"
            className="text-yellow-600 dark:text-yellow-400"
          >
            Your inbox is full (10 conversations). Archive a conversation to
            start a new one.
          </Text>
        </div>
      )}

      {isNewUser && (
        <div className="mb-3 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/30">
          <Text variant="small" className="text-blue-600 dark:text-blue-400">
            New accounts can only message one person at a time for the first 48
            hours.
          </Text>
        </div>
      )}

      {/* Recipient picker */}
      <div className="text-start mb-3 mt-1 pe-0.5">
        <div className="grid grid-cols-12 items-center">
          <Text
            variant="small"
            className="col-span-1 block mb-1 font-medium text-gray-700 dark:text-gray-300"
          >
            To
          </Text>

          {/* Search input */}
          {participants.length < maxAllowedRecipients ? (
            <div className="relative col-span-11">
              <input
                type="text"
                placeholder="Search username…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(searchResults.length > 0 || isSearching) && (
                <ul className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 overflow-hidden">
                  {isSearching && (
                    <li className="px-3 py-2 text-sm text-gray-400">
                      Searching…
                    </li>
                  )}
                  {searchResults.map((u) => (
                    <li key={u.uid}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                        onClick={() => addParticipant(u)}
                      >
                        @{u.username}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="col-span-11 text-xs text-gray-400 mt-1">
              {isNewUser
                ? "New users can add recipients after 48 hours."
                : `Maximum ${maxAllowedRecipients} recipients reached.`}
            </p>
          )}
        </div>
        {/* Participant chips shown below the search input */}
        {participants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {participants.map((p) => (
              <span
                key={p.uid}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-blue-500/20 text-blue-700 dark:text-blue-300"
              >
                @{p.username}
                <button
                  type="button"
                  onClick={() => removeParticipant(p.uid)}
                  className="ml-0.5 text-blue-500 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${p.username}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subject */}
      <div className="text-start mb-4 flex items-center space-x-4 pe-0.5">
        <Text
          variant="small"
          className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
        >
          Subject
        </Text>
        <input
          type="text"
          maxLength={150}
          placeholder="Subject…"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="p-0.5">
        {/* Message body */}
        <ForumEditor
          ref={editorRef}
          placeholder="Write your message…"
          submitLabel="Send"
          isSubmitting={isSubmitting}
          submitDisabled={!canSend}
          onSubmit={handleSend}
          onCancel={onClose}
          mentionUsers={participants}
          editorMaxHeight="10rem"
        />
      </div>
    </Modal>
  );
};
