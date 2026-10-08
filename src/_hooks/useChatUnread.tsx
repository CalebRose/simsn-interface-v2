import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { CHAT_RETENTION_DAYS, CHAT_ROOM_ID } from "../_services/chatService";

const UNREAD_QUERY_LIMIT = 50;

const storageKey = (userId: string) => `simfba-chat-last-read-${userId}`;

const readLastRead = (userId: string) => {
  try {
    const stored = Number(window.localStorage.getItem(storageKey(userId)));
    if (stored > 0) return stored;
  } catch {
    // Storage can be unavailable; fall through to "now".
  }
  return Date.now();
};

const writeLastRead = (userId: string, millis: number) => {
  try {
    window.localStorage.setItem(storageKey(userId), String(millis));
  } catch {
    // Ignore storage failures; the badge just resets on reload.
  }
};

interface UnreadMessage {
  createdAtMillis: number;
  mentioned: boolean;
}

/**
 * Tracks unread chat messages and mentions for the signed-in user.
 * The last-read marker lives in localStorage, so no extra Firestore writes
 * are needed. The listener only fetches messages newer than that marker.
 */
export const useChatUnread = (
  userId: string | undefined,
  isChatOpen: boolean,
) => {
  const [lastReadMillis, setLastReadMillis] = useState(0);
  const [messages, setMessages] = useState<UnreadMessage[]>([]);
  const latestSeenMillis = useRef(0);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }
    const retentionFloor =
      Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const baseline = Math.max(readLastRead(userId), retentionFloor);
    setLastReadMillis(baseline);
    latestSeenMillis.current = baseline;
    writeLastRead(userId, baseline);

    const unreadQuery = query(
      collection(firestore, "chatRooms", CHAT_ROOM_ID, "chatMessages"),
      where("createdAt", ">", Timestamp.fromMillis(baseline)),
      orderBy("createdAt", "desc"),
      limit(UNREAD_QUERY_LIMIT),
    );

    return onSnapshot(
      unreadQuery,
      (snapshot) => {
        const next: UnreadMessage[] = [];
        for (const document of snapshot.docs) {
          const data = document.data();
          const createdAt = data.createdAt as Timestamp | null;
          // Null while the server timestamp of a local write is pending.
          if (!createdAt || data.senderId === userId) continue;
          next.push({
            createdAtMillis: createdAt.toMillis(),
            mentioned:
              Array.isArray(data.mentionedUserIds) &&
              data.mentionedUserIds.includes(userId),
          });
        }
        if (next.length > 0) {
          latestSeenMillis.current = Math.max(
            latestSeenMillis.current,
            ...next.map((message) => message.createdAtMillis),
          );
        }
        setMessages(next);
      },
      (error) => {
        console.error("Unable to track unread chat messages:", error);
      },
    );
  }, [userId]);

  const markRead = useCallback(() => {
    if (!userId) return;
    const next = latestSeenMillis.current;
    setLastReadMillis(next);
    writeLastRead(userId, next);
  }, [userId]);

  // Messages that arrive while the drawer is open count as read, and the
  // marker is advanced again when it closes.
  useEffect(() => {
    if (!isChatOpen) return;
    markRead();
    return markRead;
  }, [isChatOpen, markRead, messages]);

  const unread = isChatOpen
    ? []
    : messages.filter((message) => message.createdAtMillis > lastReadMillis);

  return {
    unreadCount: unread.length,
    hasMention: unread.some((message) => message.mentioned),
  };
};
