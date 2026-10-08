import type { Timestamp } from "firebase/firestore";

export interface ChatAttachment {
  url: string;
  name?: string;
}

export interface ChatAvatarProfile {
  DefaultLeague: string | null;
  teamId: number;
  NFLTeamID: number;
  cbb_id: number;
  NBATeamID: number;
  CHLTeamID: number;
  PHLTeamID: number;
  IsRetro: boolean;
}

export interface ChatRateLimit {
  lastMessageAt: Timestamp;
  seq: number;
}

export interface ChatMute {
  roomId: string;
  userId: string;
  mutedBy: string;
  reason?: string;
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
}

export type ChatReportCategory =
  | "inflammatory"
  | "abusive"
  | "spam"
  | "inappropriate"
  | "other";

export interface ChatReportTarget {
  roomId: string;
  messageId: string;
  messageBody: string;
  reportedUid: string;
  reportedUsername: string;
}

export interface ChatMessage {
  id: string;
  type: "Message" | "Player" | "Team" | "Game";
  senderId: string;
  senderUsername: string;
  senderProfile?: ChatAvatarProfile;
  imageUrl?: string | null;
  body: string;
  mentionedUserIds: string[];
  attachments: ChatAttachment[];
  createdAt: Timestamp;
  expireAt: Timestamp;
}
