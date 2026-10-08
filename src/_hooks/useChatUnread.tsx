import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { CHAT_RETENTION_DAYS, CHAT_ROOM_ID } from "../_services/chatService";
import { logFirestoreRead } from "../_utility/firestoreLogger";

const UNREAD_QUERY_LIMIT = 20;
const UNREAD_POLL_INTERVAL_MS = 15_000;

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
 * are needed. While the drawer is closed the hook polls every 30 seconds
 * (paused when the tab is hidden); no listener stays open.
 */
export const useChatUnread = (
  userId: string | undefined,
  isChatOpen: boolean,
) => {
  const [lastReadMillis, setLastReadMillis] = useState(0);
  const [messages, setMessages] = useState<UnreadMessage[]>([]);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }
    // While the drawer is open its own listener receives every message, so
    // this one is paused to avoid reading each message twice.
    if (isChatOpen) {
      return () => {
        const now = Date.now();
        writeLastRead(userId, now);
        setLastReadMillis(now);
        setMessages([]);
      };
    }
    const retentionFloor =
      Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const baseline = Math.max(readLastRead(userId), retentionFloor);
    setLastReadMillis(baseline);
    writeLastRead(userId, baseline);

    // Poll instead of listening. Each poll only fetches messages newer than
    // the last one already seen, so a message is read at most once.
    let cancelled = false;
    let inFlight = false;
    let cursor = baseline;
    setMessages([]);

    const poll = async () => {
      if (cancelled || inFlight || document.hidden) return;
      inFlight = true;
      try {
        const snapshot = await getDocs(
          query(
            collection(firestore, "chatRooms", CHAT_ROOM_ID, "chatMessages"),
            where("createdAt", ">", Timestamp.fromMillis(cursor)),
            orderBy("createdAt", "asc"),
            limit(UNREAD_QUERY_LIMIT),
          ),
        );
        logFirestoreRead("pollUnreadChatMessages", snapshot.size);
        if (cancelled || snapshot.empty) return;
        const fresh: UnreadMessage[] = [];
        for (const messageDoc of snapshot.docs) {
          const data = messageDoc.data();
          const createdAt = data.createdAt as Timestamp | null;
          if (!createdAt) continue;
          cursor = Math.max(cursor, createdAt.toMillis());
          if (data.senderId === userId) continue;
          fresh.push({
            createdAtMillis: createdAt.toMillis(),
            mentioned:
              Array.isArray(data.mentionedUserIds) &&
              data.mentionedUserIds.includes(userId),
          });
        }
        if (fresh.length > 0) {
          setMessages((current) => [...current, ...fresh].slice(-100));
        }
      } catch (error) {
        console.error("Unable to check for unread chat messages:", error);
      } finally {
        inFlight = false;
      }
    };

    void poll();
    const interval = window.setInterval(poll, UNREAD_POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (!document.hidden) void poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userId, isChatOpen]);

  const unread = isChatOpen
    ? []
    : messages.filter((message) => message.createdAtMillis > lastReadMillis);

  return {
    unreadCount: unread.length,
    hasMention: unread.some((message) => message.mentioned),
  };
};
