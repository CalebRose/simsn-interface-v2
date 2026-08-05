# Private Messaging System — Technical Design Document

**Stack:** TypeScript, React, Firebase (Firestore, Firebase Storage, Cloud Functions, Firebase Auth)
**Status:** Draft v1
**Author:** _TBD_
**Related features referenced:** Forum @mention/tagging system, Forum reporting system, Forum image attachment system

---

## 1. Overview

A private mail-style forum messaging system where a user can start a conversation with 1–10 other users, give it a subject line, and exchange threaded replies. Conversations are strictly private to their participants — no one outside the conversation can read messages or receive notifications about them. Users have a capped inbox (10 active conversations), can block other users from messaging them (silently), and can report abusive users within a conversation (which also auto-mutes that conversation for the reporter).

### 1.1 Goals

- 1:1 and small-group (up to 10 participants) private conversations
- Subject line + threaded replies (mail-style, not live chat)
- @username tagging reusing the existing forum tagging implementation
- Image/screenshot attachments reusing the existing forum attachment pattern
- Reporting reusing the existing forum reporting pattern, extended with auto-mute
- Strict access control — non-participants cannot read messages or be notified
- Inbox cap of 10 conversations, enforced by requiring manual archive/delete before starting new ones
- Blocking with silent failure on send (no error shown to sender)

### 1.2 Non-Goals

- Real-time "typing indicators" / presence
- Message editing or deletion after send (open question, see §9)
- Group conversation admin roles / removing participants mid-conversation (open question, see §9)
- Read receipts beyond "read/unread" state (no granular per-user read timestamps in v1, see §9)

---

## 2. Data Model (Firestore)

All collections use Firestore. Denormalization is used deliberately to keep inbox reads cheap (avoiding N+1 queries per conversation list render).

### 2.1 `conversations/{conversationId}`

```ts
interface Conversation {
  id: string;
  subject: string; // required, max ~150 chars
  participantIds: string[]; // 2–10 user IDs, includes creator
  participantUsernames: string[]; // denormalized, parallel array to participantIds, for display without extra reads
  createdBy: string; // userId
  createdAt: Timestamp;
  lastMessageAt: Timestamp; // for inbox sorting
  lastMessagePreview: string; // truncated text of last message, for inbox list rendering
  lastMessageSenderId: string;
  messageCount: number;
  status: "active" | "archived"; // per-conversation archive is tracked per-user, see participantMeta below
  participantMeta: {
    [userId: string]: {
      unreadCount: number;
      archived: boolean; // user archived this conversation (frees inbox slot)
      muted: boolean; // true after reporting a user in this conversation
      lastReadAt: Timestamp | null;
    };
  };
}
```

**Why `participantMeta` as a map instead of a subcollection:** archive/mute/unread state is per-user but small and always read alongside the conversation itself when rendering the inbox, so a map field avoids extra reads. This does mean conversation documents grow with participant count (bounded at 10, so acceptable).

### 2.2 `conversations/{conversationId}/messages/{messageId}`

```ts
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string; // denormalized for display
  body: string; // message text, may contain @mention tokens
  mentionedUserIds: string[]; // resolved from @mentions, reuses forum mention parser
  attachments: MessageAttachment[]; // 0-1 image in v1 (see §5)
  createdAt: Timestamp;
  isFirstMessage: boolean; // true only for the message that created the conversation
}

interface MessageAttachment {
  storagePath: string; // Firebase Storage path
  downloadUrl: string; // cached download URL
  contentType: string; // e.g. 'image/png'
  sizeBytes: number;
  width?: number;
  height?: number;
}
```

Messages are a subcollection rather than an array on the conversation document because message count × body/attachment size can exceed the 1MB document limit for long-lived conversations, and subcollections allow efficient pagination (e.g. "load last 20, then paginate older").

### 2.3 `users/{userId}/inbox` (denormalized index — optional but recommended)

To enforce the 10-conversation cap and render the inbox list without a collection-wide query with `array-contains`, maintain a small per-user index:

```ts
// users/{userId}/inboxMeta/summary  (single doc)
interface InboxSummary {
  activeConversationCount: number; // non-archived conversations this user participates in
  conversationIds: string[]; // active (non-archived) conversation IDs, max 10
}
```

This is updated transactionally by the Cloud Function that creates conversations (see §4.1) and by archive/unarchive actions. It exists purely to make "do you have room for a new conversation" a single-document read instead of a query.

### 2.4 `blocks/{blockerId}_{blockedId}`

Deterministic document ID for cheap existence checks.

```ts
interface Block {
  id: string; // `${blockerId}_${blockedId}`
  blockerId: string;
  blockedId: string;
  createdAt: Timestamp;
}
```

### 2.5 `reports/{reportId}` (reuses existing forum report schema)

```ts
interface Report {
  id: string;
  reportedUserId: string;
  reportingUserId: string;
  context: "forum" | "private_message"; // extend existing enum
  contextRefs: {
    conversationId?: string;
    messageId?: string;
    forumPostId?: string; // existing field, unused here
  };
  reason: string;
  details?: string;
  status: "open" | "reviewed" | "actioned" | "dismissed";
  createdAt: Timestamp;
}
```

This assumes the existing forum `Report` document shape can be extended with a `context` discriminator and a `contextRefs` object rather than forking into a separate collection. **Please confirm this matches the real forum report schema** — if the forum reports collection is more rigid, we'll need a thin adapter.

---

## 3. Access Control (Security Rules)

Non-participants must never be able to read conversation or message documents. Rules sketch:

```
match /conversations/{conversationId} {
  allow read: if request.auth.uid in resource.data.participantIds;
  allow create: if request.auth.uid in request.resource.data.participantIds
                && request.resource.data.participantIds.size() >= 2
                && request.resource.data.participantIds.size() <= 10;
  allow update: if request.auth.uid in resource.data.participantIds
                // restrict which fields non-Cloud-Function writes may touch,
                // e.g. only participantMeta.<uid>.* for archive/mute/read state
                ;

  match /messages/{messageId} {
    allow read: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
    allow create: if request.auth.uid in get(...).data.participantIds
                  && request.resource.data.senderId == request.auth.uid;
  }
}
```

Key points:

- Read/write access is gated on membership in `participantIds`, checked server-side via rules, not just hidden in the UI.
- Message creation (and therefore blocking/rate-limiting/inbox-cap logic) should go through a **Cloud Function callable**, not a direct client write, so that block-checking, inbox-cap checks, and fan-out updates (`lastMessageAt`, `unreadCount` increments, notification suppression) happen atomically and can't be bypassed by a client skipping steps. Direct Firestore writes from the client for message creation are discouraged for this reason — see §4.

---

## 4. Core Flows

### 4.1 Creating a Conversation

Client calls a Cloud Function `createConversation({ participantUsernames, subject, body, attachment? })`.

Server-side steps:

1. Resolve `participantUsernames` → user IDs.
2. Validate participant count is 2–10 (including creator).
3. **Inbox cap check:** for the creator only — read `users/{creatorId}/inboxMeta/summary`; if `activeConversationCount >= 10`, reject with a clear error (`INBOX_FULL`) so the client can prompt the user to archive/delete an existing conversation. _(Per your decision, this is enforced only against the creator's own cap — recipients' inbox caps are not blocking; see open question in §9 about whether recipients should also be capped.)_
4. **Block check:** for each recipient, check `blocks/{recipientId}_{creatorId}` — if the recipient has blocked the creator, **silently drop that recipient** from the conversation without error (per your requirement). If _all_ recipients turn out to be blockers, the conversation is not created and the UI shows a generic "message sent" success state anyway (to avoid leaking block status) — **please confirm this is the desired UX for the all-blocked edge case**, see §9.
5. Create `conversations/{conversationId}` doc + first `messages/{messageId}` doc in a transaction.
6. Increment `activeConversationCount` / append to `conversationIds` in the inbox summary doc for every valid (non-blocked) participant.
7. Set `unreadCount = 1` for all participants except the creator.
8. Trigger notifications (push/email/in-app) to all participants except the creator and except blocked recipients.

### 4.2 Replying to a Conversation

Client calls `sendMessage({ conversationId, body, attachment? })`.

Server-side steps:

1. Verify caller is in `participantIds`.
2. **Block check:** if the sender has blocked, or is blocked by, _any_ other participant, decide policy — recommend: sending is still allowed to the conversation as a whole (the conversation already exists and other participants opted in), block only prevents _new conversation creation_, not replies within an existing shared conversation. **This needs your confirmation** — alternative is to silently drop the reply for participants who blocked the sender, which gets complicated in group conversations. See §9.
3. Parse `@mentions` using the existing forum mention parser/resolver.
4. Append message to `messages` subcollection.
5. Update `conversations`: `lastMessageAt`, `lastMessagePreview`, `messageCount++`.
6. For every participant except the sender: increment `participantMeta.{uid}.unreadCount`, unless `participantMeta.{uid}.muted === true` (muted users still receive the message and can read it, but do not get unread-badge increments or notifications — see §4.4).
7. Trigger notifications to non-muted, non-sender participants (and to any mentioned users, reusing forum mention-notification logic).

### 4.3 Reading a Conversation

- Client subscribes to `conversations/{conversationId}/messages` ordered by `createdAt`, paginated (e.g. 20 at a time, load-more on scroll-up).
- On open, client calls a small Cloud Function or direct rules-permitted update to set `participantMeta.{uid}.unreadCount = 0` and `lastReadAt = now`.

### 4.4 Reporting a User (and Auto-Mute)

Client calls `reportUserInConversation({ conversationId, reportedUserId, messageId?, reason, details? })`.

1. Verify caller is a participant.
2. Create a `Report` document with `context: 'private_message'` and `contextRefs: { conversationId, messageId }`, reusing the forum reporting Cloud Function/pipeline if one exists (moderation queue, etc.).
3. **Per your decision:** set `participantMeta.{reporterId}.muted = true` on the conversation. Muted means:
   - The conversation still appears in the reporter's inbox (not archived/hidden — reporter may still want to reference it or unmute later).
   - The reporter stops receiving unread-count increments and notifications for new messages in that conversation.
   - The reporter can still manually open and read the conversation, and can un-mute it themselves (open question: should un-mute be user-controlled or moderator-controlled? See §9).

### 4.5 Blocking a User

Client calls `blockUser({ blockedUserId })` → creates `blocks/{callerId}_{blockedUserId}`.

Effects going forward:

- Blocked user cannot create _new_ conversations that include the blocker (silently dropped per §4.1 step 4).
- Does not retroactively affect existing shared conversations (see open question in §9 on whether blocking should also mute/hide existing conversations with that user).

Unblocking simply deletes the `blocks` doc.

### 4.6 Archiving/Deleting to Free Inbox Space

Client calls `archiveConversation({ conversationId })`:

1. Sets `participantMeta.{uid}.archived = true`.
2. Decrements the caller's `inboxMeta/summary.activeConversationCount` and removes the ID from `conversationIds`.
3. Conversation remains fully intact for other participants and is recoverable via an "archived" view for this user (recommend keeping archived conversations visible/searchable rather than deleting data, given no explicit deletion requirement was stated).

---

## 5. Attachments (Images/Screenshots)

Per your confirmation, this mirrors the existing forum attachment pattern:

- Client uploads directly to Firebase Storage at a path such as `dm-attachments/{conversationId}/{messageId}/{filename}`, using the same client-side upload helper, size/type validation, and compression step used in the forum feature.
- Storage security rules restrict read access to `participantIds` of the parent conversation (mirroring Firestore rule logic — likely via a custom claim or a Storage rule that calls into Firestore, or a Cloud Function-issued signed URL if the forum pattern already does this).
- Same moderation/scanning hook as forum attachments, if one exists (e.g. an image-scan Cloud Function trigger on upload) should be wired to `dm-attachments/**` as well.
- v1 assumption: **one attachment per message**, matching the "a screenshot" singular phrasing in your requirements — flag if multiple attachments per message are actually needed.

**Note:** I don't have visibility into the actual forum attachment implementation's code, so the storage path convention, signed-URL vs. rules-based access approach, and moderation hook above are proposed based on common patterns — please point me to (or paste) the forum attachment module so I can align this section exactly.

---

## 6. Tagging (@mentions)

Reuses the existing forum @mention implementation:

- Same autocomplete UI component/hook for `@username` typeahead while composing.
- Same parsing step server-side (or client-side, matching wherever the forum does it) to resolve typed `@username` tokens into `mentionedUserIds` at send time.
- Same mention-notification trigger, scoped to only fire for users who are already `participantIds` of the conversation (mentioning a non-participant should either be disallowed by the autocomplete UI, since it only offers participants, or silently not notify them — mentioning someone outside the conversation should **never** grant them read access).

**Note:** As with attachments, I'm assuming the forum mention system exposes a reusable parser/hook rather than being tightly coupled to forum post documents — please confirm or point me to the module.

---

## 7. Inbox UI Behavior Summary

- Inbox list query: read `users/{uid}/inboxMeta/summary.conversationIds`, then batch-fetch those `conversations` docs (max 10 → cheap, no pagination needed).
- Sort by `lastMessageAt` descending.
- Show subject, last message preview, sender, unread badge (from `participantMeta.{uid}.unreadCount`), muted indicator if applicable.
- "New Conversation" button disabled (or shows an inline prompt) when `activeConversationCount === 10`, directing the user to archive one first — matching your decision not to auto-archive.
- Archived conversations live in a separate "Archived" tab/view, not counted against the cap, still fully readable.

---

## 8. Cloud Functions Summary

| Function                                           | Trigger                                | Purpose                                                                                                                                                                             |
| -------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createConversation`                               | Callable                               | Validates participants/subject, checks inbox cap, checks blocks, creates conversation + first message, fans out inbox/unread updates, sends notifications                           |
| `sendMessage`                                      | Callable                               | Validates membership, parses mentions, appends message, updates conversation summary fields, fans out unread/notifications respecting mute state                                    |
| `reportUserInConversation`                         | Callable                               | Creates report doc (shared with forum pipeline), sets reporter's mute flag                                                                                                          |
| `blockUser` / `unblockUser`                        | Callable                               | Creates/deletes block doc                                                                                                                                                           |
| `archiveConversation` / `unarchiveConversation`    | Callable                               | Toggles archived flag + inbox summary count                                                                                                                                         |
| `onMessageCreate` _(optional trigger alternative)_ | Firestore trigger on `messages` create | If preferred over doing everything inline in `sendMessage`, this can handle the fan-out (unread counts, notifications) instead, decoupling write latency from notification dispatch |

Using callable functions (rather than raw client writes + Firestore triggers for everything) keeps block-checking and inbox-cap enforcement synchronous and reliable — the client gets an immediate, trustworthy success/failure response rather than writing optimistically and hoping a background trigger cleans up correctly.

---

## 9. Open Questions

These need your input before implementation starts:

1. **All-recipients-blocked edge case:** If a user tries to start a conversation and every intended recipient has blocked them, should the sender see a generic success message (to preserve block silence) or an error? Proposed: generic success, since the silent-block requirement implies senders should never learn they're blocked.
2. **Blocking and existing conversations:** Should blocking someone you already share a conversation with also mute/hide that existing conversation, or only prevent _new_ conversations? Proposed default in §4.5 is "no retroactive effect."
3. **Replying when blocked mid-conversation:** In a group conversation, if participant A blocks participant B after the conversation started, should B's future replies still reach A? Proposed default in §4.2 is "yes, block only affects new conversation creation," but this may not match intent.
4. **Un-muting after a report:** Should the reporter be able to manually un-mute the conversation themselves, or should that require a moderator action (e.g. after the report is reviewed/dismissed)?
5. **Recipient inbox cap:** Should the 10-conversation cap also block a _recipient_ from being added to a new conversation if they're already at 10 (rather than only capping the creator)? Current design in §4.1 only checks the creator.
6. **Message editing/deletion:** Any requirement for editing or deleting a sent message? Not mentioned in your requirements, currently out of scope.
7. **Multiple attachments per message:** Confirm one image per message is sufficient, matching "a screenshot."
8. **Read receipts:** Is per-recipient read status needed (e.g. "seen by X, Y") or is a single unread/read boolean per user sufficient? Current design only tracks the latter.
9. **Existing forum mention/attachment/report modules:** Please share the actual module locations/schemas so §5, §6, and §2.5 can be tightened from "proposed, mirroring common patterns" to "confirmed integration points."

---

## 10. Suggested Implementation Order

1. Data model + security rules (conversations, messages, blocks) — get access control right first, it's the hardest thing to retrofit.
2. `createConversation` + `sendMessage` Cloud Functions with block/cap checks (no attachments/mentions yet).
3. Inbox UI + conversation thread UI, read/unread state.
4. Wire in existing @mention component/parser.
5. Wire in existing image attachment component/storage pattern.
6. Wire in reporting (reuse forum report pipeline) + auto-mute.
7. Blocking UI (block/unblock from a user's profile or from within a conversation).
8. Archive/inbox-cap UX polish.
