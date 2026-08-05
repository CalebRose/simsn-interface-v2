import React, { useCallback, useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { Tag } from "../../_design/Tags";
import { LoadSpinner } from "../../_design/LoadSpinner";
import {
  ForumEditor,
  ForumEditorHandle,
} from "../Forum/components/ForumEditor";
import { RichTextRenderer } from "../Forum/components/RichTextRenderer";
import { DMService } from "../../_services/dmService";
import { useDMStore } from "../../context/DMContext";
import { useAuthStore } from "../../context/AuthContext";
import type { Conversation, ConversationMessage } from "../../models/dmModels";
import type { RichTextDocument, PostMention } from "../../models/forumModels";

// ─────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────

interface MessageBubbleProps {
  message: ConversationMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const ts = message.createdAt?.toDate?.();
  const timeStr = ts
    ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const dateStr = ts
    ? ts.toLocaleDateString([], { month: "short", day: "numeric" })
    : "";

  return (
    <div
      className={`flex flex-col mb-4 ${isOwn ? "items-end" : "items-start"}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {!isOwn && (
          <Text
            variant="small"
            className="font-semibold text-gray-700 dark:text-gray-300"
          >
            @{message.senderUsername}
          </Text>
        )}
        <Text variant="xs" className="text-gray-400">
          {dateStr} {timeStr}
        </Text>
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${
          isOwn
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm"
        }`}
      >
        <RichTextRenderer document={message.body} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Conversation header
// ─────────────────────────────────────────────

interface ConversationHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onArchive: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  currentUserId,
  onArchive,
  onMuteToggle,
  isMuted,
}) => {
  const otherParticipants = conversation.participantUsernames.filter(
    (_, i) => conversation.participantIds[i] !== currentUserId,
  );

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
      <div className="min-w-0 text-start">
        <Text
          variant="h5"
          className="font-semibold truncate text-gray-900 dark:text-white"
        >
          {conversation.subject}
        </Text>
        <Text
          variant="small"
          className="text-gray-500 dark:text-gray-400 truncate"
        >
          {otherParticipants.map((u) => `@${u}`).join(", ")}
        </Text>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onMuteToggle}
          title={isMuted ? "Unmute notifications" : "Mute notifications"}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isMuted ? (
            /* Bell-slash icon */
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M3 3l18 18"
              />
            </svg>
          ) : (
            /* Bell icon */
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={onArchive}
          title="Archive conversation"
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Conversation view
// ─────────────────────────────────────────────

interface ConversationViewProps {
  conversation: Conversation;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
}) => {
  const { currentUser } = useAuthStore();
  const { archiveConversation, muteConversation, unmuteConversation } =
    useDMStore();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<ForumEditorHandle>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const uid = currentUser?.id ?? "";
  const isMuted = conversation.participantMeta?.[uid]?.muted ?? false;

  const mentionUsers = conversation.participantUsernames
    .map((username, i) => ({ uid: conversation.participantIds[i], username }))
    .filter((p) => p.uid !== uid);

  // Subscribe to messages
  useEffect(() => {
    setIsLoading(true);
    const unsub = DMService.subscribeToMessages(
      conversation.id,
      (msgs) => {
        setMessages(msgs);
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
    return unsub;
  }, [conversation.id]);

  // Mark as read when opened
  useEffect(() => {
    if (!uid || !conversation.id) return;
    const meta = conversation.participantMeta?.[uid];
    if (meta && meta.unreadCount > 0) {
      DMService.markConversationRead(conversation.id, uid);
    }
  }, [conversation.id, conversation.participantMeta, uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(
    async (
      doc: RichTextDocument,
      plainText: string,
      mentions: PostMention[],
    ) => {
      if (!currentUser) return;
      setIsSubmitting(true);
      try {
        await DMService.sendMessage(
          conversation.id,
          uid,
          currentUser.username,
          doc,
          plainText,
          mentions,
        );
        editorRef.current?.clear();
      } catch {
        enqueueSnackbar("Failed to send message. Please try again.", {
          variant: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [conversation.id, uid, currentUser],
  );

  const handleArchive = useCallback(async () => {
    await archiveConversation(conversation.id);
    enqueueSnackbar("Conversation archived.", { variant: "info" });
  }, [archiveConversation, conversation.id]);

  const handleMuteToggle = useCallback(async () => {
    if (isMuted) {
      await unmuteConversation(conversation.id);
    } else {
      await muteConversation(conversation.id);
    }
  }, [isMuted, muteConversation, unmuteConversation, conversation.id]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ConversationHeader
        conversation={conversation}
        currentUserId={uid}
        onArchive={handleArchive}
        onMuteToggle={handleMuteToggle}
        isMuted={isMuted}
      />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center pt-8">
            <LoadSpinner />
          </div>
        ) : messages.length === 0 ? (
          <Text variant="small" className="text-center text-gray-400 pt-8">
            No messages yet.
          </Text>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === uid}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply editor */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 shrink-0">
        <ForumEditor
          ref={editorRef}
          placeholder="Reply…"
          submitLabel="Send"
          isSubmitting={isSubmitting}
          onSubmit={handleSend}
          mentionUsers={mentionUsers}
          maxLength={5000}
        />
      </div>
    </div>
  );
};
