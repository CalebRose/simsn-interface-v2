import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Flag, X } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useAuthStore } from "../../context/AuthContext";
import {
  ChatService,
  CHAT_PAGE_SIZE,
  CHAT_ROOM_ID,
  CHAT_RETENTION_DAYS,
  CHAT_NEW_USER_COOLDOWN_SECONDS,
  CHAT_TEAM_COOLDOWN_SECONDS,
} from "../../_services/chatService";
import type {
  ChatAvatarProfile,
  ChatMessage,
  ChatMute,
  ChatRateLimit,
  ChatReportTarget,
} from "../../models/chatModels";
import type { CurrentUser } from "../../_hooks/useCurrentUser";
import { ImageKitService } from "../../_services/imagekitService";
import { getUserLogoUrl } from "../../_utility/getLogo";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageBody } from "./ChatMessageBody";
import { ChatUserTrigger } from "./ChatUserTrigger";
import { ChatReportModal } from "./ChatReportModal";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const timestampMillis = (value: Timestamp | null | undefined) =>
  value?.toMillis?.() ?? 0;

const formatMessageTime = (value: Timestamp) => {
  if (!value?.toDate) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value.toDate());
};

const safeImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const initialsFor = (username: string) =>
  username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "?";

const formatCountdown = (remainingMillis: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, "0")}`
    : `${seconds}s`;
};

const profileSnapshot = (user: CurrentUser): ChatAvatarProfile => ({
  DefaultLeague: user.DefaultLeague ?? null,
  teamId: user.teamId ?? 0,
  NFLTeamID: user.NFLTeamID ?? 0,
  cbb_id: user.cbb_id ?? 0,
  NBATeamID: user.NBATeamID ?? 0,
  CHLTeamID: user.CHLTeamID ?? 0,
  PHLTeamID: user.PHLTeamID ?? 0,
  IsRetro: user.IsRetro ?? false,
});

export const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const { currentUser, isLoading: isUserLoading } = useAuthStore();
  const currentUserId = currentUser?.id;
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [rateLimit, setRateLimit] = useState<ChatRateLimit | null>(null);
  const [chatMute, setChatMute] = useState<ChatMute | null>(null);
  const [isSendStateLoading, setIsSendStateLoading] = useState(true);
  const [sendStateError, setSendStateError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reportTarget, setReportTarget] = useState<ChatReportTarget | null>(
    null,
  );
  const [cutoffMillis, setCutoffMillis] = useState(
    Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  const [nowMillis, setNowMillis] = useState(Date.now());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const shouldStickToBottom = useRef(true);
  const rateStateReceived = useRef(false);
  const muteStateReceived = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setRecentMessages([]);
    setOlderMessages([]);
    setHasMore(true);
    setRateLimit(null);
    setChatMute(null);
    setSendStateError(null);
    setIsSendStateLoading(true);
    rateStateReceived.current = false;
    muteStateReceived.current = false;
    shouldStickToBottom.current = true;
    const timer = window.setTimeout(() => {
      if (isUserLoading) return;
      if (!currentUserId) {
        setError(new Error("Sign in to view public chat."));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const unsubscribe = ChatService.subscribeToRecentMessages(
        CHAT_ROOM_ID,
        (messages) => {
          setRecentMessages(messages);
          setIsLoading(false);
        },
        (subscriptionError) => {
          console.error(
            "Unable to load public chat messages:",
            subscriptionError,
          );
          setError(subscriptionError);
          setIsLoading(false);
        },
      );
      const unsubscribeSendState = ChatService.subscribeToSendState(
        CHAT_ROOM_ID,
        currentUserId,
        (nextRateLimit) => {
          setRateLimit(nextRateLimit);
          rateStateReceived.current = true;
          if (muteStateReceived.current) setIsSendStateLoading(false);
        },
        (nextMute) => {
          setChatMute(nextMute);
          muteStateReceived.current = true;
          if (rateStateReceived.current) setIsSendStateLoading(false);
        },
        (subscriptionError) => {
          console.error(
            "Unable to load public chat send status:",
            subscriptionError,
          );
          setSendStateError(subscriptionError);
          setIsSendStateLoading(false);
        },
      );
      subscriptionRef.current = () => {
        unsubscribe();
        unsubscribeSendState();
      };
    }, 0);

    return () => {
      window.clearTimeout(timer);
      subscriptionRef.current?.();
      subscriptionRef.current = null;
    };
  }, [currentUserId, isOpen, isUserLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      setNowMillis(now);
      setCutoffMillis(now - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const messages = useMemo(() => {
    const byId = new Map<string, ChatMessage>();
    for (const message of [...olderMessages, ...recentMessages]) {
      if (timestampMillis(message.createdAt) > cutoffMillis) {
        byId.set(message.id, message);
      }
    }
    return [...byId.values()].sort(
      (left, right) =>
        timestampMillis(left.createdAt) - timestampMillis(right.createdAt),
    );
  }, [cutoffMillis, olderMessages, recentMessages]);

  const disabledMessage = useMemo(() => {
    if (isUserLoading) return "Loading your account status…";
    if (!currentUser) return "Sign in to send chat messages.";
    if (currentUser.IsBanned) return "Your account is not allowed to post.";
    if (sendStateError)
      return "Chat send status is unavailable. Try again later.";
    if (isSendStateLoading) return "Checking chat permissions…";

    const createdAtRaw: unknown = currentUser.createdAt;
    const createdAtMillis =
      createdAtRaw instanceof Timestamp
        ? createdAtRaw.toMillis()
        : createdAtRaw
          ? Date.parse(String(createdAtRaw))
          : NaN;
    if (!Number.isNaN(createdAtMillis)) {
      const accountUnlockAt = createdAtMillis + 10 * 60 * 1000;
      if (accountUnlockAt > nowMillis) {
        return `New accounts can chat in ${formatCountdown(accountUnlockAt - nowMillis)}.`;
      }
    }

    const forumMuteUntil =
      timestampMillis(currentUser.forumMutedUntilAt) ||
      (currentUser.forumMutedUntil
        ? Date.parse(currentUser.forumMutedUntil)
        : 0);
    if (forumMuteUntil > nowMillis) {
      return `Your forum mute also blocks chat for ${formatCountdown(forumMuteUntil - nowMillis)}.`;
    }

    if (
      chatMute &&
      chatMute.roomId === CHAT_ROOM_ID &&
      chatMute.userId === currentUser.id &&
      (chatMute.expiresAt === null ||
        timestampMillis(chatMute.expiresAt) > nowMillis)
    ) {
      return chatMute.expiresAt
        ? `You are muted in chat for ${formatCountdown(timestampMillis(chatMute.expiresAt) - nowMillis)}.`
        : "You are muted in chat.";
    }

    if (rateLimit?.lastMessageAt instanceof Timestamp) {
      const hasTeam = [
        currentUser.teamId,
        currentUser.NFLTeamID,
        currentUser.cbb_id,
        currentUser.NBATeamID,
        currentUser.CHLTeamID,
        currentUser.PHLTeamID,
        currentUser.MLBOrgID,
        currentUser.CollegeBaseballOrgID,
      ].some((teamId) => typeof teamId === "number" && teamId > 0);
      const cooldown = hasTeam
        ? CHAT_TEAM_COOLDOWN_SECONDS
        : CHAT_NEW_USER_COOLDOWN_SECONDS;
      const nextSendAt =
        timestampMillis(rateLimit.lastMessageAt) + cooldown * 1000;
      if (nextSendAt > nowMillis) {
        return `Please wait ${formatCountdown(nextSendAt - nowMillis)} before sending again.`;
      }
    }
    return null;
  }, [
    chatMute,
    currentUser,
    isSendStateLoading,
    isUserLoading,
    nowMillis,
    rateLimit,
    sendStateError,
  ]);

  const handleSend = useCallback(
    async (body: string, mentionedUserIds: string[], image: File | null) => {
      if (!currentUser || disabledMessage) {
        throw new Error(disabledMessage ?? "Sign in to send chat messages.");
      }
      const attachmentUrl = image
        ? await ImageKitService.uploadImage(image)
        : null;
      await ChatService.sendMessage({
        roomId: CHAT_ROOM_ID,
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        senderProfile: profileSnapshot(currentUser),
        body,
        mentionedUserIds,
        knownSequence: Number(rateLimit?.seq) || 0,
        ...(image && attachmentUrl
          ? { attachment: { url: attachmentUrl, name: image.name } }
          : {}),
      });
    },
    [currentUser, disabledMessage, rateLimit],
  );

  useEffect(() => {
    if (isOpen && shouldStickToBottom.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  const loadOlderMessages = useCallback(async () => {
    const oldestMessage = messages[0];
    if (!oldestMessage || isLoadingOlder || !hasMore) return;

    setIsLoadingOlder(true);
    setError(null);
    try {
      const page = await ChatService.getOlderMessages(
        CHAT_ROOM_ID,
        oldestMessage,
      );
      setOlderMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id));
        const next = page.filter((message) => !existingIds.has(message.id));
        return [...next, ...current];
      });
      setHasMore(page.length === CHAT_PAGE_SIZE);
    } catch (loadError) {
      const normalizedError =
        loadError instanceof Error
          ? loadError
          : new Error("Unable to load older chat messages.");
      console.error(
        "Unable to load older public chat messages:",
        normalizedError,
      );
      setError(normalizedError);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [hasMore, isLoadingOlder, messages]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    shouldStickToBottom.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      64;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100">
      <button
        type="button"
        aria-label="Close chat"
        className="absolute inset-0 h-full w-full bg-black/40"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-chat-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <h2
              id="public-chat-title"
              className="text-start text-base font-semibold text-gray-900 dark:text-white"
            >
              General Chat
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Global room · messages kept for {CHAT_RETENTION_DAYS} days
            </p>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {hasMore && messages.length > 0 && (
            <button
              type="button"
              onClick={loadOlderMessages}
              disabled={isLoadingOlder}
              className="mx-auto mb-4 rounded-full px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
            >
              {isLoadingOlder
                ? "Loading older messages…"
                : "Load older messages"}
            </button>
          )}

          {isLoading && (
            <p className="m-auto text-sm text-gray-500 dark:text-gray-400">
              Loading chat…
            </p>
          )}

          {!isLoading && error && (
            <div className="m-auto max-w-xs text-center" role="alert">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {error.message === "Sign in to view public chat."
                  ? error.message
                  : "Chat messages could not be loaded."}
              </p>
              {error.message !== "Sign in to view public chat." && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Please try again later.
                </p>
              )}
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <p className="m-auto text-center text-sm text-gray-500 dark:text-gray-400">
              No recent messages. The conversation starts here.
            </p>
          )}

          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const grouped =
              previous?.senderId === message.senderId &&
              timestampMillis(message.createdAt) -
                timestampMillis(previous.createdAt) <
                5 * 60 * 1000;
            const candidateAvatarUrl = message.senderProfile
              ? getUserLogoUrl(message.senderProfile)
              : (message.imageUrl ?? "");
            const avatarUrl = safeImageUrl(candidateAvatarUrl)
              ? candidateAvatarUrl
              : null;

            const openReport = () =>
              setReportTarget({
                roomId: CHAT_ROOM_ID,
                messageId: message.id,
                messageBody: message.body,
                reportedUid: message.senderId,
                reportedUsername: message.senderUsername,
              });
            const canReport =
              !!currentUser && message.senderId !== currentUser.id;
            const trigger = (children: ReactNode) => (
              <ChatUserTrigger
                uid={message.senderId}
                username={message.senderUsername}
                logoUrl={avatarUrl ?? undefined}
                onNavigate={onClose}
                onReport={canReport ? openReport : undefined}
              >
                {children}
              </ChatUserTrigger>
            );

            return (
              <article
                key={message.id}
                className={`group relative flex gap-2.5 ${grouped ? "mt-1" : "mt-4"} text-start`}
              >
                {canReport && (
                  <button
                    type="button"
                    aria-label={`Report message from ${message.senderUsername}`}
                    title="Report message"
                    onClick={openReport}
                    className="absolute right-0 top-0 rounded p-1 text-gray-400 opacity-0 hover:bg-gray-100 hover:text-red-500 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-gray-800"
                  >
                    <Flag size={14} aria-hidden="true" />
                  </button>
                )}
                <div className="w-9 shrink-0">
                  {!grouped &&
                    trigger(
                      avatarUrl ? (
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-200 p-1.5 dark:bg-gray-700">
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div
                          aria-hidden="true"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {initialsFor(message.senderUsername)}
                        </div>
                      ),
                    )}
                </div>
                <div className="min-w-0 flex-1">
                  {!grouped && (
                    <div className="mb-0.5 flex items-baseline gap-2">
                      {trigger(
                        <span className="truncate text-sm font-semibold text-gray-900 hover:text-blue-500 dark:text-gray-100">
                          {message.senderUsername || "User"}
                        </span>,
                      )}
                      <time
                        className="shrink-0 text-[11px] text-gray-400"
                        dateTime={message.createdAt?.toDate?.().toISOString()}
                      >
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap wrap-break-word text-sm text-gray-800 dark:text-gray-200">
                    <ChatMessageBody
                      body={message.body}
                      hasMentions={(message.mentionedUserIds?.length ?? 0) > 0}
                      currentUsername={currentUser?.username}
                    />
                  </p>
                  {message.attachments.map((attachment, attachmentIndex) =>
                    safeImageUrl(attachment.url) ? (
                      <a
                        key={`${message.id}-${attachmentIndex}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block w-fit"
                      >
                        <img
                          src={attachment.url}
                          alt={attachment.name || "Chat attachment"}
                          loading="lazy"
                          className="max-h-64 max-w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                        />
                      </a>
                    ) : null,
                  )}
                  {grouped && (
                    <time
                      className="sr-only"
                      dateTime={message.createdAt?.toDate?.().toISOString()}
                    >
                      {formatMessageTime(message.createdAt)}
                    </time>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <ChatComposer
          disabled={disabledMessage !== null}
          disabledMessage={disabledMessage}
          onSend={handleSend}
        />
      </section>
      {currentUser && (
        <ChatReportModal
          target={reportTarget}
          reporterUid={currentUser.id}
          reporterUsername={currentUser.username ?? ""}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
};
