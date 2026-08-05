import { Timestamp } from "firebase/firestore";
import { RichTextDocument, PostMention } from "./forumModels";

export interface ConversationParticipantMeta {
  unreadCount: number;
  archived: boolean;
  muted: boolean;
  lastReadAt: Timestamp | null;
}

export interface Conversation {
  id: string;
  subject: string;
  participantIds: string[];
  participantUsernames: string[];
  createdBy: string;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
  lastMessagePreview: string;
  lastMessageSenderId: string;
  messageCount: number;
  participantMeta: Record<string, ConversationParticipantMeta>;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  body: RichTextDocument;
  bodyText: string;
  mentionedUserIds: string[];
  createdAt: Timestamp;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Timestamp;
}

export interface InboxSummary {
  activeConversationCount: number;
  conversationIds: string[];
}

export interface CreateConversationDTO {
  subject: string;
  participants: { uid: string; username: string }[];
  body: RichTextDocument;
  bodyText: string;
  mentions: PostMention[];
}

export interface SendMessageDTO {
  conversationId: string;
  body: RichTextDocument;
  bodyText: string;
  mentions: PostMention[];
}

export type DMError = "INBOX_FULL" | "NO_VALID_RECIPIENTS" | "NOT_FOUND";
