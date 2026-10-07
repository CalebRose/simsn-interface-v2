import {
  doc,
  collection,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import type {
  ChatAttachment,
  ChatAvatarProfile,
  ChatMessage,
  ChatMute,
  ChatRateLimit,
} from "../models/chatModels";
import { logFirestoreRead } from "../_utility/firestoreLogger";

export const CHAT_ROOM_ID = "global";
export const CHAT_RETENTION_DAYS = 3;
export const CHAT_PAGE_SIZE = 50;
export const CHAT_NEW_USER_COOLDOWN_SECONDS = 30;
export const CHAT_TEAM_COOLDOWN_SECONDS = 3;
export const CHAT_MESSAGE_MAX_LENGTH = 500;
export const CHAT_MENTION_MAX_COUNT = 10;

const messagesCollection = (roomId: string) =>
  collection(firestore, "chatRooms", roomId, "chatMessages");

const rateLimitDocument = (userId: string) =>
  doc(firestore, "chatRateLimits", userId);

const muteDocument = (roomId: string, userId: string) =>
  doc(firestore, "chatMutes", `${roomId}_${userId}`);

const toChatMessage = (document: QueryDocumentSnapshot): ChatMessage => {
  const data = document.data();
  const attachments = Array.isArray(data.attachments)
    ? data.attachments.filter(
        (attachment: unknown): attachment is ChatAttachment =>
          typeof attachment === "object" &&
          attachment !== null &&
          "url" in attachment &&
          typeof attachment.url === "string",
      )
    : [];

  return {
    ...data,
    id: document.id,
    attachments,
  } as ChatMessage;
};

export interface SendChatMessageInput {
  roomId: string;
  senderId: string;
  senderUsername: string;
  senderProfile: ChatAvatarProfile;
  body: string;
  mentionedUserIds: string[];
  attachment?: ChatAttachment;
}

const retentionCutoff = () =>
  Timestamp.fromMillis(
    Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );

export const ChatService = {
  subscribeToRecentMessages: (
    roomId: string,
    onMessages: (messages: ChatMessage[]) => void,
    onError: (error: Error) => void,
  ) => {
    const recentMessagesQuery = query(
      messagesCollection(roomId),
      where("createdAt", ">", retentionCutoff()),
      orderBy("createdAt", "desc"),
      orderBy(documentId(), "desc"),
      limit(CHAT_PAGE_SIZE),
    );

    return onSnapshot(
      recentMessagesQuery,
      (snapshot) => {
        logFirestoreRead("subscribeToRecentChatMessages", snapshot.size);
        onMessages(snapshot.docs.map(toChatMessage).reverse());
      },
      onError,
    );
  },

  subscribeToSendState: (
    roomId: string,
    userId: string,
    onRateLimit: (rateLimit: ChatRateLimit | null) => void,
    onMute: (mute: ChatMute | null) => void,
    onError: (error: Error) => void,
  ) => {
    const rateLimitUnsubscribe = onSnapshot(
      rateLimitDocument(userId),
      (snapshot) => {
        onRateLimit(
          snapshot.exists() ? (snapshot.data() as ChatRateLimit) : null,
        );
      },
      onError,
    );
    const muteUnsubscribe = onSnapshot(
      muteDocument(roomId, userId),
      (snapshot) => {
        onMute(snapshot.exists() ? (snapshot.data() as ChatMute) : null);
      },
      onError,
    );

    return () => {
      rateLimitUnsubscribe();
      muteUnsubscribe();
    };
  },

  getOlderMessages: async (
    roomId: string,
    oldestMessage: ChatMessage,
  ): Promise<ChatMessage[]> => {
    const olderMessagesQuery = query(
      messagesCollection(roomId),
      where("createdAt", ">", retentionCutoff()),
      orderBy("createdAt", "desc"),
      orderBy(documentId(), "desc"),
      startAfter(oldestMessage.createdAt, oldestMessage.id),
      limit(CHAT_PAGE_SIZE),
    );
    const snapshot = await getDocs(olderMessagesQuery);
    logFirestoreRead("getOlderChatMessages", snapshot.size);
    return snapshot.docs.map(toChatMessage).reverse();
  },

  sendMessage: async (input: SendChatMessageInput): Promise<void> => {
    const { roomId, senderId, senderUsername, senderProfile, body } = input;
    const normalizedBody = body.trim();
    const mentionedUserIds = [...new Set(input.mentionedUserIds)];

    if (!normalizedBody) throw new Error("Enter a message before sending.");
    if (normalizedBody.length > CHAT_MESSAGE_MAX_LENGTH) {
      throw new Error(
        `Messages can be no longer than ${CHAT_MESSAGE_MAX_LENGTH} characters.`,
      );
    }
    if (mentionedUserIds.length > CHAT_MENTION_MAX_COUNT) {
      throw new Error(
        `You can mention up to ${CHAT_MENTION_MAX_COUNT} users per message.`,
      );
    }

    const rateLimitRef = rateLimitDocument(senderId);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const rateLimitSnapshot = await getDoc(rateLimitRef);
      const previousSequence = rateLimitSnapshot.exists()
        ? Number(rateLimitSnapshot.data().seq) || 0
        : 0;
      const nextSequence = previousSequence + 1;
      const batch = writeBatch(firestore);
      const messageRef = doc(
        messagesCollection(roomId),
        `${senderId}_${nextSequence}`,
      );
      const expireAt = Timestamp.fromMillis(
        Date.now() + CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
      );

      batch.set(messageRef, {
        type: "Message",
        senderId,
        senderUsername,
        senderProfile,
        body: normalizedBody,
        mentionedUserIds,
        attachments: input.attachment ? [input.attachment] : [],
        createdAt: serverTimestamp(),
        expireAt,
      });
      batch.set(rateLimitRef, {
        lastMessageAt: serverTimestamp(),
        seq: nextSequence,
      });

      try {
        await batch.commit();
        return;
      } catch (error) {
        if (
          attempt === 0 &&
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "permission-denied"
        ) {
          const updatedSnapshot = await getDoc(rateLimitRef);
          const updatedSequence = updatedSnapshot.exists()
            ? Number(updatedSnapshot.data().seq) || 0
            : 0;
          if (updatedSequence > previousSequence) continue;
        }
        throw error;
      }
    }
    throw new Error("Unable to send the message. Please try again.");
  },
};
