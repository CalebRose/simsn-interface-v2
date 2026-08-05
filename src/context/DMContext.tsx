import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DMService } from "../_services/dmService";
import { CurrentUser } from "../_hooks/useCurrentUser";
import type { Conversation, InboxSummary } from "../models/dmModels";
import { DMContext } from "./DMContextCore";

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────

interface DMContextValue {
  /** Active (non-archived) conversations, sorted newest first. */
  conversations: Conversation[];
  /** Total unread DM count across all active conversations. */
  totalUnreadDMs: number;
  /** Active inbox cap reached. */
  isInboxFull: boolean;
  /** Currently open conversation ID. */
  selectedConversationId: string | null;
  selectConversation: (id: string | null) => void;
  /** Inbox modal open state. */
  isInboxOpen: boolean;
  openInbox: () => void;
  closeInbox: () => void;
  /** Compose modal open state. */
  isComposeOpen: boolean;
  openCompose: () => void;
  closeCompose: () => void;
  /** Archive the current user's view of a conversation. */
  archiveConversation: (conversationId: string) => Promise<void>;
  /** Mute / unmute (user-controlled after report). */
  muteConversation: (conversationId: string) => Promise<void>;
  unmuteConversation: (conversationId: string) => Promise<void>;
  /** IDs the current user has blocked. */
  blockedUserIds: string[];
  blockUser: (blockedId: string) => Promise<void>;
  unblockUser: (blockedId: string) => Promise<void>;
  /** Reload blocks list. */
  refreshBlocks: () => Promise<void>;
}

export function useDMStore(): DMContextValue {
  const ctx = useContext(DMContext) as DMContextValue | null;
  if (!ctx) throw new Error("useDMStore must be used within DMProvider");
  return ctx;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

interface DMProviderProps {
  children: ReactNode;
  currentUser: CurrentUser | null;
}

export function DMProvider({ children, currentUser }: DMProviderProps) {
  const [inboxSummary, setInboxSummary] = useState<InboxSummary>({
    activeConversationCount: 0,
    conversationIds: [],
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const uid = currentUser?.id ?? null;

  // ── Subscribe to inbox summary ───────────────────────────────────────────────
  // Deferred via setTimeout so React StrictMode's synchronous cleanup cancels
  // the timer before onSnapshot is ever called, preventing Firestore SDK
  // watch-stream corruption (INTERNAL ASSERTION FAILED: ve=-1).
  useEffect(() => {
    if (!uid) return;
    let unsub: (() => void) | null = null;
    const timer = setTimeout(() => {
      unsub = DMService.subscribeToInboxSummary(uid, setInboxSummary);
    }, 0);
    return () => {
      clearTimeout(timer);
      unsub?.();
    };
  }, [uid]);

  // ── Subscribe to conversations whenever the ID list changes ─────────────────
  const conversationIdsKey = inboxSummary.conversationIds
    .slice()
    .sort()
    .join(",");
  const conversationIdsRef = useRef(inboxSummary.conversationIds);
  conversationIdsRef.current = inboxSummary.conversationIds;

  useEffect(() => {
    const ids = conversationIdsRef.current;
    if (!uid || ids.length === 0) {
      setConversations([]);
      return;
    }
    let unsub: (() => void) | null = null;
    const timer = setTimeout(() => {
      unsub = DMService.subscribeToConversations(ids, setConversations);
    }, 0);
    return () => {
      clearTimeout(timer);
      unsub?.();
    };
    // conversationIdsKey is the stable dep that changes only when the array changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, conversationIdsKey]);

  // ── Load blocked user IDs once on mount ─────────────────────────────────────
  const refreshBlocks = useCallback(async () => {
    if (!uid) return;
    const ids = await DMService.getBlockedUserIds(uid);
    setBlockedUserIds(ids);
  }, [uid]);

  useEffect(() => {
    refreshBlocks();
  }, [refreshBlocks]);

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalUnreadDMs = useMemo(() => {
    if (!uid) return 0;
    return conversations.reduce((sum, c) => {
      const meta = c.participantMeta?.[uid];
      return sum + (meta?.unreadCount ?? 0);
    }, 0);
  }, [conversations, uid]);

  const isInboxFull = inboxSummary.activeConversationCount >= 10;

  // ── Actions ──────────────────────────────────────────────────────────────────
  const archiveConversation = useCallback(
    async (conversationId: string) => {
      if (!uid) return;
      await DMService.archiveConversation(conversationId, uid);
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    },
    [uid, selectedConversationId],
  );

  const muteConversation = useCallback(
    async (conversationId: string) => {
      if (!uid) return;
      await DMService.muteConversation(conversationId, uid);
    },
    [uid],
  );

  const unmuteConversation = useCallback(
    async (conversationId: string) => {
      if (!uid) return;
      await DMService.unmuteConversation(conversationId, uid);
    },
    [uid],
  );

  const blockUser = useCallback(
    async (blockedId: string) => {
      if (!uid) return;
      await DMService.blockUser(uid, blockedId);
      setBlockedUserIds((prev) =>
        prev.includes(blockedId) ? prev : [...prev, blockedId],
      );
    },
    [uid],
  );

  const unblockUser = useCallback(
    async (blockedId: string) => {
      if (!uid) return;
      await DMService.unblockUser(uid, blockedId);
      setBlockedUserIds((prev) => prev.filter((id) => id !== blockedId));
    },
    [uid],
  );

  const openInbox = useCallback(() => setIsInboxOpen(true), []);
  const closeInbox = useCallback(() => {
    setIsInboxOpen(false);
    setSelectedConversationId(null);
  }, []);
  const openCompose = useCallback(() => setIsComposeOpen(true), []);
  const closeCompose = useCallback(() => setIsComposeOpen(false), []);

  const value: DMContextValue = useMemo(
    () => ({
      conversations,
      totalUnreadDMs,
      isInboxFull,
      selectedConversationId,
      selectConversation: setSelectedConversationId,
      isInboxOpen,
      openInbox,
      closeInbox,
      isComposeOpen,
      openCompose,
      closeCompose,
      archiveConversation,
      muteConversation,
      unmuteConversation,
      blockedUserIds,
      blockUser,
      unblockUser,
      refreshBlocks,
    }),
    [
      conversations,
      totalUnreadDMs,
      isInboxFull,
      selectedConversationId,
      isInboxOpen,
      openInbox,
      closeInbox,
      isComposeOpen,
      openCompose,
      closeCompose,
      archiveConversation,
      muteConversation,
      unmuteConversation,
      blockedUserIds,
      blockUser,
      unblockUser,
      refreshBlocks,
    ],
  );

  return <DMContext.Provider value={value}>{children}</DMContext.Provider>;
}
