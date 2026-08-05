import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  documentId,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { logFirestoreRead } from "../_utility/firestoreLogger";
import type {
  Conversation,
  ConversationMessage,
  Block,
  InboxSummary,
  DMError,
} from "../models/dmModels";
import type { PostMention, RichTextDocument } from "../models/forumModels";
import { ForumService } from "./forumService";

// ─────────────────────────────────────────────
// Collection references
// ─────────────────────────────────────────────

const conversationsCol = () => collection(firestore, "conversations");
const messagesCol = (conversationId: string) =>
  collection(firestore, "conversations", conversationId, "messages");
const blocksCol = () => collection(firestore, "blocks");
const inboxSummaryDoc = (userId: string) =>
  doc(firestore, "users", userId, "inboxMeta", "summary");

const PREVIEW_MAX = 100;
const INBOX_CAP = 10;

function makePreview(text: string): string {
  return text.length > PREVIEW_MAX ? text.slice(0, PREVIEW_MAX) + "…" : text;
}

// ─────────────────────────────────────────────
// DM Service
// ─────────────────────────────────────────────

export const DMService = {
  // ── Block helpers ───────────────────────────────────────────────────────────

  /** True if `potentialBlocker` has blocked `targetId`. */
  isBlockedBy: async (
    targetId: string,
    potentialBlockerId: string,
  ): Promise<boolean> => {
    const snap = await getDoc(
      doc(firestore, "blocks", `${potentialBlockerId}_${targetId}`),
    );
    logFirestoreRead("isBlockedBy", 1);
    return snap.exists();
  },

  blockUser: async (blockerId: string, blockedId: string): Promise<void> => {
    const blockId = `${blockerId}_${blockedId}`;
    await setDoc(doc(firestore, "blocks", blockId), {
      id: blockId,
      blockerId,
      blockedId,
      createdAt: serverTimestamp(),
    });
  },

  unblockUser: async (blockerId: string, blockedId: string): Promise<void> => {
    await deleteDoc(doc(firestore, "blocks", `${blockerId}_${blockedId}`));
  },

  getBlockedUserIds: async (blockerId: string): Promise<string[]> => {
    const q = query(blocksCol(), where("blockerId", "==", blockerId));
    const snap = await getDocs(q);
    logFirestoreRead("getBlockedUserIds", snap.docs.length);
    return snap.docs.map((d) => (d.data() as Block).blockedId);
  },

  // ── Inbox summary ───────────────────────────────────────────────────────────

  subscribeToInboxSummary: (
    userId: string,
    onUpdate: (summary: InboxSummary) => void,
  ): (() => void) => {
    return onSnapshot(
      inboxSummaryDoc(userId),
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as InboxSummary);
        } else {
          onUpdate({ activeConversationCount: 0, conversationIds: [] });
        }
      },
      // Silently swallow permission errors (rules not yet deployed, or user
      // not yet authenticated when the subscription fires).
      (err) => {
        if (err.code !== "permission-denied") {
          console.warn("[DMService] inboxSummary listener error:", err.code);
        }
      },
    );
  },

  // ── Conversations ───────────────────────────────────────────────────────────

  /**
   * Creates a new conversation + first message atomically.
   * Silently drops recipients who have blocked the creator.
   * Returns { conversationId } on success or { error } on failure.
   */
  createConversation: async (
    creatorId: string,
    creatorUsername: string,
    participants: { uid: string; username: string }[],
    subject: string,
    body: RichTextDocument,
    bodyText: string,
    mentions: PostMention[],
  ): Promise<{ conversationId: string } | { error: DMError }> => {
    // 1. Inbox cap check for creator
    const summarySnap = await getDoc(inboxSummaryDoc(creatorId));
    logFirestoreRead("createConversation.inboxSummary", 1);
    const summary = summarySnap.exists()
      ? (summarySnap.data() as InboxSummary)
      : null;
    if ((summary?.activeConversationCount ?? 0) >= INBOX_CAP) {
      return { error: "INBOX_FULL" };
    }

    // 2. Block check: drop anyone who has blocked the creator
    const blockResults = await Promise.all(
      participants.map(async (p) => ({
        ...p,
        blocked: await DMService.isBlockedBy(creatorId, p.uid),
      })),
    );
    const validParticipants = blockResults.filter((p) => !p.blocked);

    // If everyone blocked the creator, silently succeed
    if (validParticipants.length === 0) {
      return { conversationId: "" };
    }

    const allParticipants = [
      { uid: creatorId, username: creatorUsername },
      ...validParticipants,
    ];

    // 3. Atomic write
    const conversationRef = doc(conversationsCol());
    const messageRef = doc(messagesCol(conversationRef.id));
    const preview = makePreview(bodyText);

    const participantMeta: Record<string, object> = {};
    allParticipants.forEach((p) => {
      participantMeta[p.uid] = {
        unreadCount: p.uid === creatorId ? 0 : 1,
        archived: false,
        muted: false,
        lastReadAt: p.uid === creatorId ? Timestamp.now() : null,
      };
    });

    const batch = writeBatch(firestore);

    batch.set(conversationRef, {
      subject: subject.slice(0, 150),
      participantIds: allParticipants.map((p) => p.uid),
      participantUsernames: allParticipants.map((p) => p.username),
      createdBy: creatorId,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: preview,
      lastMessageSenderId: creatorId,
      messageCount: 1,
      participantMeta,
    });

    batch.set(messageRef, {
      conversationId: conversationRef.id,
      senderId: creatorId,
      senderUsername: creatorUsername,
      body,
      bodyText,
      mentionedUserIds: mentions.map((m) => m.uid),
      createdAt: serverTimestamp(),
    });

    // Update inbox summary for each participant
    allParticipants.forEach((p) => {
      batch.set(
        inboxSummaryDoc(p.uid),
        {
          activeConversationCount: increment(1),
          conversationIds: arrayUnion(conversationRef.id),
        },
        { merge: true },
      );
    });

    await batch.commit();
    return { conversationId: conversationRef.id };
  },

  /**
   * Sends a reply in an existing conversation.
   * Respects per-participant mute state (muted users skip unread increment).
   */
  sendMessage: async (
    conversationId: string,
    senderId: string,
    senderUsername: string,
    body: RichTextDocument,
    bodyText: string,
    mentions: PostMention[],
  ): Promise<void> => {
    const conversationRef = doc(conversationsCol(), conversationId);
    const messageRef = doc(messagesCol(conversationId));
    const preview = makePreview(bodyText);

    await runTransaction(firestore, async (tx) => {
      const convSnap = await tx.get(conversationRef);
      if (!convSnap.exists()) throw new Error("NOT_FOUND");
      const conv = convSnap.data() as Omit<Conversation, "id">;

      const metaUpdates: Record<string, FieldValue | string | number | null> = {
        lastMessageAt: serverTimestamp(),
        lastMessagePreview: preview,
        lastMessageSenderId: senderId,
        messageCount: increment(1),
      };

      conv.participantIds.forEach((uid) => {
        if (uid === senderId) return;
        const isMuted = conv.participantMeta?.[uid]?.muted ?? false;
        if (!isMuted) {
          metaUpdates[`participantMeta.${uid}.unreadCount`] = increment(1);
        }
      });

      tx.set(messageRef, {
        conversationId,
        senderId,
        senderUsername,
        body,
        bodyText,
        mentionedUserIds: mentions.map((m) => m.uid),
        createdAt: serverTimestamp(),
      });

      tx.update(conversationRef, metaUpdates as Record<string, FieldValue>);
    });
  },

  /** Real-time subscription to conversations by ID list. */
  subscribeToConversations: (
    conversationIds: string[],
    onUpdate: (conversations: Conversation[]) => void,
    onError?: (err: Error) => void,
  ): (() => void) => {
    if (conversationIds.length === 0) {
      onUpdate([]);
      return () => {};
    }

    // Firestore 'in' supports up to 30 values; inbox cap is 10, so we're safe
    const q = query(
      conversationsCol(),
      where(documentId(), "in", conversationIds),
    );

    return onSnapshot(
      q,
      (snap) => {
        logFirestoreRead("subscribeToConversations", snap.docs.length);
        const conversations = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Conversation)
          .sort(
            (a, b) =>
              (b.lastMessageAt?.toMillis() ?? 0) -
              (a.lastMessageAt?.toMillis() ?? 0),
          );
        onUpdate(conversations);
      },
      (err) => {
        if (err.code !== "permission-denied") {
          console.warn("[DMService] conversations listener error:", err.code);
        }
        onError?.(err);
      },
    );
  },

  /** Real-time subscription to messages in a conversation. */
  subscribeToMessages: (
    conversationId: string,
    onUpdate: (messages: ConversationMessage[]) => void,
    onError?: (err: Error) => void,
  ): (() => void) => {
    const q = query(
      messagesCol(conversationId),
      orderBy("createdAt", "asc"),
      limit(100),
    );

    return onSnapshot(
      q,
      (snap) => {
        logFirestoreRead("subscribeToMessages", snap.docs.length);
        onUpdate(
          snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as ConversationMessage,
          ),
        );
      },
      onError,
    );
  },

  /** Sets unread count to 0 for the given user in the given conversation. */
  markConversationRead: async (
    conversationId: string,
    userId: string,
  ): Promise<void> => {
    await updateDoc(doc(conversationsCol(), conversationId), {
      [`participantMeta.${userId}.unreadCount`]: 0,
      [`participantMeta.${userId}.lastReadAt`]: serverTimestamp(),
    });
  },

  /** Archives a conversation for the given user, freeing their inbox slot. */
  archiveConversation: async (
    conversationId: string,
    userId: string,
  ): Promise<void> => {
    const batch = writeBatch(firestore);
    batch.update(doc(conversationsCol(), conversationId), {
      [`participantMeta.${userId}.archived`]: true,
    });
    batch.update(inboxSummaryDoc(userId), {
      activeConversationCount: increment(-1),
      conversationIds: arrayRemove(conversationId),
    });
    await batch.commit();
  },

  /** Restores an archived conversation if the user still has inbox capacity. */
  unarchiveConversation: async (
    conversationId: string,
    userId: string,
  ): Promise<{ error: DMError } | void> => {
    const summarySnap = await getDoc(inboxSummaryDoc(userId));
    logFirestoreRead("unarchiveConversation.inboxSummary", 1);
    const summary = summarySnap.exists()
      ? (summarySnap.data() as InboxSummary)
      : null;
    if ((summary?.activeConversationCount ?? 0) >= INBOX_CAP) {
      return { error: "INBOX_FULL" };
    }

    const batch = writeBatch(firestore);
    batch.update(doc(conversationsCol(), conversationId), {
      [`participantMeta.${userId}.archived`]: false,
    });
    batch.set(
      inboxSummaryDoc(userId),
      {
        activeConversationCount: increment(1),
        conversationIds: arrayUnion(conversationId),
      },
      { merge: true },
    );
    await batch.commit();
  },

  muteConversation: async (
    conversationId: string,
    userId: string,
  ): Promise<void> => {
    await updateDoc(doc(conversationsCol(), conversationId), {
      [`participantMeta.${userId}.muted`]: true,
    });
  },

  unmuteConversation: async (
    conversationId: string,
    userId: string,
  ): Promise<void> => {
    await updateDoc(doc(conversationsCol(), conversationId), {
      [`participantMeta.${userId}.muted`]: false,
    });
  },

  // ── User search (delegates to forum service) ────────────────────────────────

  searchUsers: (
    prefix: string,
  ): Promise<{ uid: string; username: string }[]> => {
    return ForumService.SearchUsersByPrefix(prefix);
  },

  // ── Reporting ────────────────────────────────────────────────────────────────

  /** Creates a report and auto-mutes the conversation for the reporter. */
  reportUserInConversation: async (
    conversationId: string,
    reporterId: string,
    reporterUsername: string,
    reportedUserId: string,
    reportedUsername: string,
    reason: string,
  ): Promise<void> => {
    const batch = writeBatch(firestore);

    batch.set(doc(collection(firestore, "dmReports")), {
      conversationId,
      reporterId,
      reporterUsername,
      reportedUserId,
      reportedUsername,
      reason,
      status: "open",
      createdAt: serverTimestamp(),
    });

    // Auto-mute for reporter so they stop receiving notifications
    batch.update(doc(conversationsCol(), conversationId), {
      [`participantMeta.${reporterId}.muted`]: true,
    });

    await batch.commit();
  },
};
