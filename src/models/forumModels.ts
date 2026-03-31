import { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────
// Rich Text Node Types
// ─────────────────────────────────────────────

export type RichTextNodeType =
  | "doc"
  | "paragraph"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "listItem"
  | "blockquote"
  | "codeBlock"
  | "text"
  | "hardBreak"
  | "horizontalRule"
  | "table"
  | "tableRow"
  | "tableCell"
  | "tableHeader"
  | "link"
  | "mention"
  | "quoteReference"
  | "youtubeEmbed"
  | "image"; // future

export interface RichTextMark {
  type: "bold" | "italic" | "underline" | "code" | "link";
  attrs?: { href?: string; target?: string };
}

export interface RichTextNode {
  type: RichTextNodeType;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
}

export interface RichTextDocument {
  type: "doc";
  content: RichTextNode[];
}

// ─────────────────────────────────────────────
// Forum
// ─────────────────────────────────────────────

export type ForumVisibility = "public" | "members" | "admin_only";
export type ForumType = "top_level" | "subforum";

export interface Forum {
  id: string;
  slug: string;
  name: string;
  parentForumId?: string | null;
  type: ForumType;
  description?: string;
  sortOrder: number;
  visibility: ForumVisibility;
  isLocked: boolean;
  threadCount: number;
  postCount: number;
  latestThreadId?: string | null;
  latestPostId?: string | null;
  latestActivityAt?: Timestamp | null;
  latestActivityBy?: {
    uid: string;
    username: string;
  } | null;
  allowedRolesToPost?: string[];
  sportKey?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// Thread
// ─────────────────────────────────────────────

export type ThreadType = "standard" | "poll" | "game_reference";

export interface ThreadAuthor {
  uid: string;
  username: string;
  displayName: string;
  logoUrl?: string;
}

export interface Thread {
  id: string;
  forumId: string;
  forumPath: string[];
  title: string;
  slug: string;
  author: ThreadAuthor;
  contentPreview: string;
  featureImageUrl?: string | null;
  firstPostId: string;
  isPinned: boolean;
  isLocked: boolean;
  isAnnouncement: boolean;
  isDeleted: boolean;
  tags?: string[];
  threadType: ThreadType;
  pollId?: string | null;
  referencedGameId?: string | null;
  referencedLeague?: string | null;
  replyCount: number;
  participantCount: number;
  latestPostId?: string | null;
  latestActivityAt: Timestamp;
  latestActivityBy?: {
    uid: string;
    username: string;
  } | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// Post
// ─────────────────────────────────────────────

export interface PostAuthor {
  uid: string;
  username: string;
  displayName: string;
  logoUrl?: string;
}

export interface PostMention {
  uid: string;
  username: string;
}

export interface Post {
  id: string;
  threadId: string;
  forumId: string;
  author: PostAuthor;
  editorVersion: number;
  body: RichTextDocument;
  bodyText: string;
  quotedPostId?: string | null;
  replyToPostId?: string | null;
  mentions?: PostMention[];
  reactions?: Record<ReactionType, string[]>; // map of reactionType -> array of uid
  isEdited: boolean;
  editedAt?: Timestamp | null;
  editedBy?: string | null;
  editedByUsername?: string | null;
  isDeleted: boolean;
  deletedAt?: Timestamp | null;
  deletedBy?: string | null;
  moderationReason?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// Reactions
// ─────────────────────────────────────────────

export type ReactionType =
  | "like"
  | "dislike"
  | "laugh"
  | "sad"
  | "angry"
  | "confused"
  | "whoa";

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: "👍",
  dislike: "👎",
  laugh: "😂",
  sad: "😢",
  angry: "😠",
  confused: "😕",
  whoa: "😮",
};

// ─────────────────────────────────────────────
// Poll
// ─────────────────────────────────────────────

export interface PollOption {
  id: string;
  label: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  threadId: string;
  question: string;
  options: PollOption[];
  allowsMultipleVotes: boolean;
  maxSelectableOptions: number;
  totalVotes: number;
  closesAt?: Timestamp | null;
  isClosed: boolean;
  createdBy: {
    uid: string;
    username: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PollVote {
  uid: string;
  username?: string;
  selectedOptionIds: string[];
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────

export type NotificationForumType =
  | "mention"
  | "quote"
  | "reply"
  | "mod_action"
  | "poll_closing";

export interface ForumNotification {
  id: string;
  uid: string;
  type: NotificationForumType;
  threadId?: string;
  postId?: string;
  actorUid?: string;
  actorUsername?: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// Moderation Log
// ─────────────────────────────────────────────

export type ModerationAction =
  | "lock"
  | "unlock"
  | "delete"
  | "restore"
  | "edit"
  | "pin"
  | "unpin"
  | "move";

export interface ModerationLog {
  id: string;
  targetType: "thread" | "post" | "forum";
  targetId: string;
  action: ModerationAction;
  performedBy: {
    uid: string;
    username: string;
  };
  reason?: string | null;
  previousState?: Record<string, unknown>;
  nextState?: Record<string, unknown>;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// Game Reference
// ─────────────────────────────────────────────

export interface GameReference {
  id: string;
  league: string;
  externalGameId: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeam?: string;
  awayTeam?: string;
  gameLabel: string;
  seasonId?: number;
  weekId?: number;
  gameStatus?: string;
  gameDateLabel?: string;
  sourcePath?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// DTOs – create/update payloads
// ─────────────────────────────────────────────

export interface CreateThreadDTO {
  forumId: string;
  forumPath: string[];
  title: string;
  body: RichTextDocument;
  bodyText: string;
  threadType: ThreadType;
  tags?: string[];
  poll?: CreatePollDTO | null;
  referencedGameId?: string | null;
  referencedLeague?: string | null;
  mentions?: PostMention[];
}

export interface CreatePostDTO {
  threadId: string;
  forumId: string;
  body: RichTextDocument;
  bodyText: string;
  quotedPostId?: string | null;
  replyToPostId?: string | null;
  mentions?: PostMention[];
}

export interface CreatePollDTO {
  question: string;
  options: string[];
  allowsMultipleVotes: boolean;
  maxSelectableOptions: number;
  closesAt?: Date | null;
}

export interface UpdatePostDTO {
  body: RichTextDocument;
  bodyText: string;
  mentions?: PostMention[];
  editorUsername?: string;
}

// ─────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────

export interface ThreadFilters {
  forumId: string;
  showPinned?: boolean;
}

export interface PostCursor {
  threadId: string;
  startAfterDoc?: unknown;
  pageSize?: number;
}

// ─────────────────────────────────────────────
// User forum role helpers
// ─────────────────────────────────────────────

export type ForumRole = "guest" | "member" | "commissioner" | "admin";

export interface ForumPermissions {
  canRead: boolean;
  canCreateThread: boolean;
  canReply: boolean;
  canEditOwnPost: boolean;
  canDeleteOwnPost: boolean;
  canVoteInPoll: boolean;
  canLockThread: boolean;
  canDeleteAnyPost: boolean;
  canEditAnyPost: boolean;
  canPinThread: boolean;
  canManageForums: boolean;
  canMoveAnyThread: boolean;
}

// ─────────────────────────────────────────────
// Post Reports
// ─────────────────────────────────────────────

export type ReportCategory =
  | "inflammatory"
  | "abusive"
  | "spam"
  | "inappropriate"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "dismissed";

export interface PostReport {
  id: string;
  postId: string;
  threadId: string;
  forumId: string;
  reportedUid: string;
  reportedUsername: string;
  reporterUid: string;
  reporterUsername: string;
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  reviewedBy?: string | null;
  reviewedAt?: Timestamp | null;
  adminNote?: string | null;
  createdAt: Timestamp;
}

export interface CreateReportDTO {
  postId: string;
  threadId: string;
  forumId: string;
  reportedUid: string;
  reportedUsername: string;
  category: ReportCategory;
  reason: string;
}
