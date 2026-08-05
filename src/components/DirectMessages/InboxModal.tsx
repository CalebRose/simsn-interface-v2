import React, { useMemo } from "react";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { Tag } from "../../_design/Tags";
import { Modal } from "../../_design/Modal";
import { ConversationView } from "./ConversationView";
import { ComposeModal } from "./ComposeModal";
import { useDMStore } from "../../context/DMContext";
import { useAuthStore } from "../../context/AuthContext";
import { useResponsive } from "../../_hooks/useMobile";
import type { Conversation } from "../../models/dmModels";

// ─────────────────────────────────────────────
// Conversation list item
// ─────────────────────────────────────────────

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onSelect: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  currentUserId,
  onSelect,
}) => {
  const meta = conversation.participantMeta?.[currentUserId];
  const unread = meta?.unreadCount ?? 0;
  const isMuted = meta?.muted ?? false;

  const otherNames = conversation.participantUsernames
    .filter((_, i) => conversation.participantIds[i] !== currentUserId)
    .map((u) => `@${u}`)
    .join(", ");

  const ts = conversation.lastMessageAt?.toDate?.();
  const timeStr = ts
    ? (() => {
        const now = new Date();
        const isToday = ts.toDateString() === now.toDateString();
        return isToday
          ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : ts.toLocaleDateString([], { month: "short", day: "numeric" });
      })()
    : "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/30"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <Text
          variant="small"
          className={`truncate font-medium ${
            unread > 0 && !isMuted
              ? "text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {conversation.subject}
        </Text>
        <div className="flex items-center gap-1 shrink-0">
          {isMuted && (
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          )}
          {unread > 0 && !isMuted && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          <Text variant="xs" className="text-gray-400">
            {timeStr}
          </Text>
        </div>
      </div>
      <Text variant="xs" className="text-gray-400 truncate">
        {otherNames}
      </Text>
      <Text variant="xs" className="text-gray-400 truncate mt-0.5 italic">
        {conversation.lastMessagePreview}
      </Text>
    </button>
  );
};

// ─────────────────────────────────────────────
// Main inbox modal
// ─────────────────────────────────────────────

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuthStore();
  const { isMobile } = useResponsive();
  const {
    conversations,
    totalUnreadDMs,
    isInboxFull,
    selectedConversationId,
    selectConversation,
    isComposeOpen,
    openCompose,
    closeCompose,
  } = useDMStore();

  const uid = currentUser?.id ?? "";

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  // On mobile show only one panel at a time
  const showList = !isMobile || !selectedConversationId;
  const showThread = !isMobile || !!selectedConversationId;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Messages"
        maxWidth="max-w-5xl"
        bodyClass="overflow-hidden"
      >
        {/* Single-column on mobile, two-column on sm+ */}
        <div className="flex h-[80vh] sm:h-[70vh] overflow-hidden">
          {/* ── Left: conversation list ─────────────────────────────── */}
          <div
            className={`${
              showList ? "flex" : "hidden"
            } sm:flex w-full sm:w-72 shrink-0 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}
          >
            {/* List header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <Text
                variant="small"
                className="font-semibold text-gray-700 dark:text-gray-300"
              >
                Inbox
                {totalUnreadDMs > 0 && (
                  <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">
                    {totalUnreadDMs > 9 ? "9+" : totalUnreadDMs}
                  </span>
                )}
              </Text>
              <Button
                size="xs"
                variant="primary"
                onClick={openCompose}
                disabled={isInboxFull}
                title={
                  isInboxFull
                    ? "Inbox full — archive a conversation first"
                    : "New message"
                }
              >
                + New
              </Button>
            </div>

            {isInboxFull && (
              <div className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 shrink-0">
                <Text
                  variant="xs"
                  className="text-yellow-600 dark:text-yellow-400"
                >
                  Inbox full (10/10). Archive a conversation to make room.
                </Text>
              </div>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Text variant="small" className="text-gray-400">
                    No messages yet.
                  </Text>
                </div>
              ) : (
                conversations.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    isSelected={c.id === selectedConversationId}
                    currentUserId={uid}
                    onSelect={() => selectConversation(c.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Right: thread view or empty state ──────────────────── */}
          <div
            className={`${
              showThread ? "flex" : "hidden"
            } sm:flex flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900`}
          >
            {selectedConversation ? (
              <ConversationView
                conversation={selectedConversation}
                onBack={isMobile ? () => selectConversation(null) : undefined}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <svg
                  className="w-12 h-12 text-gray-300 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <Text variant="body-small" className="text-gray-400">
                  Select a conversation to read it, or start a new one.
                </Text>
                <Button
                  size="sm"
                  variant="primaryOutline"
                  onClick={openCompose}
                  disabled={isInboxFull}
                >
                  New Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ComposeModal isOpen={isComposeOpen} onClose={closeCompose} />
    </>
  );
};
