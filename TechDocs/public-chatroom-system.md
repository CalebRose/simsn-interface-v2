# Public Chatroom System — Technical Design Document

**Stack:** TypeScript, React, Firebase (Firestore, Firebase Storage, Cloud Functions, Firebase Auth)
**Status:** Draft v1
**Related features referenced:** Private messaging system (blocking, reporting, @mentions, attachments — this doc reuses those patterns), Forum feature (reporting, moderation)

---

## 1. Overview

A real-time, public (or semi-public) chatroom to give new and existing users a lower-friction, always-on space to talk, distinct from the private/threaded nature of the DM system. Unlike the mail-style private messaging system, this is genuinely live chat — messages appear in real time via Firestore listeners rather than mail-style read/unread state.

### 1.1 Goals

- Real-time public chat, reusing existing @mention, reporting, and blocking patterns where sensible
- Engagement tool for new users specifically — likely surfaced prominently (e.g. a persistent chat drawer/widget) rather than buried in a nav item
- Moderation-aware from day one, since public chat is higher-risk than private DMs (anyone can see it, including new/anonymous users)
- Intentionally short-lived history: chat is persistent (always there, always live) but every message expires 3 days after it is sent, cleaned up automatically by Firestore TTL, to keep storage/read costs bounded — chat is meant to feel like an active room, not a searchable archive (see §6.1)

### 1.2 Non-Goals (v1)

- Voice/video
- Direct file transfer beyond the same image-attachment pattern used in DMs (if attachments are wanted here at all — see §7)
- Full Slack/Discord-style features (threads-within-chat, reactions, custom emoji) — v1 is a flat, scrolling message stream

---

## 2. Room Structure — Options

You asked me to propose options here rather than assuming. Given SimSN spans multiple leagues/projects (SimHockey, SimFBA) under one web presence, three reasonable structures:

**Option A — Single global room.**
One chat for the entire site. Simplest to build, and maximizes the "new users see activity and feel the community is alive" engagement goal, since a global room concentrates all activity in one place rather than splitting it thin across leagues. Downside: SimHockey and SimFBA conversations mix together, which may or may not matter depending on how much cross-pollination your user base has.

**Option B — One room per league/project (SimHockey, SimFBA, etc.).**
Mirrors how the forums are presumably already segmented. Keeps conversation relevant to the league a user actually plays, but for a newer/smaller community this risks each room looking sparse/dead, which undercuts the "engage new users" goal — an empty-looking chatroom is arguably worse than no chatroom.

**Option C — Single global room now, with league-specific rooms added later once volume justifies splitting.**
Start with Option A for the engagement/liveliness benefit while the community is still growing, and revisit splitting by league once message volume in the global room would actually benefit from segmentation. This avoids over-building room-management infrastructure before you know whether you need it.

**Recommendation: Option C.** It gets you the engagement benefit fastest, and the data model in §3 below is intentionally structured so that adding additional rooms later (Option B) is a straightforward extension rather than a rework — a room is just a document ID, and "one room" vs "many rooms" is a matter of how many room documents exist, not a schema change.

---

## 3. Data Model (Firestore)

### 3.1 `chatRooms/{roomId}`

```ts
interface ChatRoom {
  id: string;                 // e.g. 'global' for the v1 single room
  name: string;                // display name, e.g. "General Chat"
  isActive: boolean;
  createdAt: Timestamp;
  slowModeSeconds?: number;    // optional per-room rate limit, see §6
}
```

### 3.2 `chatRooms/{roomId}/chatMessages/{messageId}`

```ts
type ChatMessageType = 'Message' | 'Player' | 'Team' | 'Game';

interface ChatMessage {
  id: string;
  roomId: string;
  type: ChatMessageType;         // 'Message' is the base text message (see §3.2.1)
  senderId: string;
  senderUsername: string;        // denormalized for display
  imageUrl: string | null;       // sender's profile image URL, captured at send time (see §3.2.2)
  body: string;                  // message text; for typed messages, optional caption / fallback text
  entityRef?: ChatEntityRef;     // present only when type is 'Player' | 'Team' | 'Game'
  mentionedUserIds: string[];    // reuses forum/DM mention parser
  attachments: MessageAttachment[];  // reuses DM attachment pattern, see §7 on whether this is wanted here
  createdAt: Timestamp;
  expireAt: Timestamp;           // createdAt + 3 days; drives Firestore TTL deletion (see §6.1)
  isRemoved: boolean;            // soft-delete flag for moderation (see §6), false by default
  removedReason?: string;
}
```

Chat messages are a subcollection under the room, ordered by `createdAt`, exactly like the DM system's message subcollection — same pagination approach (load last N, paginate older on scroll-up). The subcollection is named `chatMessages` rather than `messages` on purpose; see §6.1.

#### 3.2.1 Message types

| Type | Meaning | Click behavior |
|---|---|---|
| `Message` | Base text message. The only type v1 needs to send. | None |
| `Player` | A player card shared into chat | Opens a modal with player details |
| `Team` | A team card shared into chat | Opens a modal with team details |
| `Game` | A game card shared into chat | Opens a modal with game details |

This is groundwork for the future slash-command feature (e.g. typing a command that resolves to a player card). The schema reserves the types now so that feature doesn't require a migration:

```ts
interface ChatEntityRef {
  entityType: 'Player' | 'Team' | 'Game';   // always equals the message's type
  entityId: string;
  league?: string;     // e.g. which sim the ID belongs to, if IDs aren't globally unique
  label: string;       // display text (player/team name, game title) used on the card and as a fallback
}
```

Design notes:
- **Store a reference, not a copy.** The modal should fetch current data by `entityId` when opened, so stats shown are live rather than frozen at send time. `label` is the only denormalized piece, so the card renders even if the lookup fails.
- **Validate server-side.** `sendChatMessage` should confirm the referenced entity exists (and is something the sender may share) before writing a typed message, so clients can't forge cards.
- **Graceful fallback.** A client that doesn't recognize a `type` should render `body`/`entityRef.label` as plain text rather than failing, so new types can ship without breaking older cached clients.
- **v1 scope:** until the slash-command feature exists, all messages are sent as `type: 'Message'`. Whether v1 should also *render* the other three types is an open question (§7).

#### 3.2.2 Profile image (`imageUrl`)

Messages carry the sender's profile image URL so chat can show an avatar next to each message, Discord-style: avatar, username, timestamp, then the text, with consecutive messages from the same sender visually grouped.

- **Set server-side.** `sendChatMessage` reads the sender's profile image from their user document and writes it onto the message. Note: the `CurrentUser` interface has no profile-image field, so where the image URL is stored needs confirming (see §7). A client-supplied `imageUrl` is ignored, otherwise a user could attach someone else's picture to their messages.
- **Snapshot at send time.** If a user changes their profile picture, their older messages keep the previous URL until they expire. With a 3-day lifetime this is acceptable, and it avoids a user-document lookup for every message rendered.
- **Fallback.** `null` or a failed image load should render a default avatar (e.g. initials or a generic icon).
- **Access:** the profile image must be readable by every chat viewer. If profile images currently sit behind Storage rules that restrict who can read them, those rules need to allow this (see §7).

### 3.3 `chatRooms/{roomId}/typing/{userId}` *(optional — see open question in §7)*

If a "so-and-so is typing" indicator is wanted:

```ts
interface TypingState {
  userId: string;
  username: string;
  lastTypingAt: Timestamp;   // client clears/expires this after a few seconds of inactivity
}
```

This is a genuinely optional nice-to-have and adds real-time write volume (every keystroke-adjacent update costs a write) — flagged as an explicit open question rather than assumed, since it's the kind of thing that's easy to skip in v1 without anyone missing it.

### 3.4 `chatMutes/{roomId}_{userId}` (moderation)

Distinct from the DM system's "user blocks another user" model — in a public room, blocking doesn't really apply user-to-user the same way (you can't stop one specific person from being in a public room you're also in, the way you can decline a private conversation). Instead, moderators can mute a user *from a room*:

```ts
interface ChatMute {
  id: string;              // `${roomId}_${userId}`
  roomId: string;
  userId: string;
  mutedBy: string;          // moderator user ID
  reason?: string;
  expiresAt: Timestamp | null;   // null = indefinite
  createdAt: Timestamp;
}
```

### 3.5 Reporting — reuses `reports/{reportId}` from the DM/forum system

Extend the `context` enum introduced in the DM design doc with `'public_chat'`, and `contextRefs` with `roomId`/`messageId`. No new report schema needed — same moderation queue handles forum, DM, and chat reports uniformly, which is likely valuable for whoever reviews reports (one queue, not three).

**Important addition given the 3-day expiry (§6.1):** since the underlying chat message can be deleted before a report is reviewed, the report itself must capture a **snapshot of the message content at report time**, not just a reference to it — otherwise a moderator opening the report after the purge would see a dangling `messageId` pointing at nothing. Extend the report schema with a chat-specific snapshot field:

```ts
interface Report {
  // ...existing fields from the DM design doc...
  chatMessageSnapshot?: {
    type: ChatMessageType;       // so typed messages (Player/Team/Game) are still understandable
    body: string;
    senderId: string;
    senderUsername: string;
    sentAt: Timestamp;
    attachmentUrls?: string[];   // if attachments are enabled, see §7
  };
}
```

This snapshot is written once, at the moment `reportChatMessage` is called (§4.3), and is never touched again — it's explicitly exempt from the TTL expiry in §6.1 (reports never carry an `expireAt` field), since reports (and the message content they reference) need to remain reviewable regardless of how old the original message is.

---

## 4. Core Flows

### 4.1 Sending a Message

Given the volume and public-facing nature of chat, message sends should go through a callable Cloud Function (`sendChatMessage({ roomId, body, type?, entityRef?, attachment? })`) rather than a raw client write, for the same reason as the DM system: server-side enforcement of rate limits, mute checks, and mention parsing can't be trusted to a client that could otherwise write directly and bypass them if rules alone aren't airtight.

1. Verify caller is authenticated, is not `IsBanned`, and is not currently muted from this room — check `chatMutes/{roomId}_{uid}`, respecting `expiresAt`).
2. **New-user checks (§6.2):** reject if the account is under 10 minutes old; apply the stricter metering limit if the user has no team, otherwise the room's normal slow mode.
3. If `type` is `Player`, `Team`, or `Game`, validate that `entityRef` points at a real entity (§3.2.1). Otherwise treat the message as `type: 'Message'`.
4. Parse `@mentions` (reused parser).
5. Read the sender's user document once and use it for everything below: `username`, profile image, `createdAt` (10-minute lock), `IsBanned`, and the team fields (§6.2). Never trust client-supplied values for any of these.
6. Append the message to `chatRooms/{roomId}/chatMessages`, setting `createdAt` and `expireAt = createdAt + 3 days` from the same server timestamp.
7. No per-user unread-count fan-out needed (unlike DMs) — chat is read live via subscription, not tracked per-recipient. A room-level `lastMessageAt` may still be useful for a "chat is active" indicator elsewhere on the site.

### 4.2 Reading / Live Updates

- Client subscribes (`onSnapshot`) to the most recent N messages in the room, ordered by `createdAt` descending, reversed for display.
- Older history loads via pagination (query `createdAt <` the oldest currently-loaded message) on scroll-up — same pattern as DM message history, just applied to a much higher-volume stream.
- Chat history is only ever ~3 days deep, per the retention policy in §6.1 — pagination on scroll-up will naturally bottom out rather than loading indefinite history, which is a meaningfully different UX from DM history and worth calling out in the UI (e.g. a subtle "messages older than 3 days aren't kept" note near the top of the scroll, so users don't think chat is broken when history stops).
- Because TTL deletion lags behind expiry, the live query and the pagination query must both filter `createdAt > now - 3 days` (§6.1) so expired-but-not-yet-deleted messages never appear.

### 4.3 Reporting a Message/User

Same as the DM flow — `reportUserInConversation`-equivalent (`reportChatMessage({ roomId, messageId, reportedUserId, reason, details? })`) creates a `reports` doc with `context: 'public_chat'`, **and must also write the `chatMessageSnapshot` described in §3.5** at report time, since the message itself is not long-lived. Unlike DMs, there's no per-reporter "mute this conversation" concept to auto-apply, since leaving/muting an entire public room over one bad message is heavier-handed than in a small private conversation — reporting here is a pure flag-to-moderators action. (You may still want a personal "hide this user's messages from my view" client-side filter — see open question in §7.)

### 4.4 Moderator Actions

- Mute a user from a room (temporary or indefinite) via a moderator-only callable function, writing to `chatMutes`.
- Soft-delete a message (`isRemoved: true`) rather than hard-deleting, so there's an audit trail — client simply renders removed messages as a placeholder ("Message removed") or omits them, moderator's choice per message.

---

## 5. Security Rules

```
match /chatRooms/{roomId} {
  allow read: if request.auth != null;   // any logged-in user can read chat
  // writes to room metadata restricted to admins

  match /chatMessages/{messageId} {
    allow read: if request.auth != null;
    allow create: if false;   // force all sends through the Cloud Function
  }
}

match /chatMutes/{muteId} {
  allow read, write: if false;   // moderator-only via Cloud Functions, never direct client access
}
```

Public chat read access is broader than DMs by nature (any authenticated user, not just conversation participants) — this is expected and fine, since the whole point is public visibility. The main security concern here is **write-path integrity** (rate limits, mute enforcement, mention resolution) rather than read-access restriction, which is why sends are funneled through a Cloud Function rather than allowed as direct client writes.

**Open question:** should anonymous (not-logged-in) visitors be able to *read* chat without an account, to see activity as a "the community is alive" signal before signing up, even if they can't post? That would materially help the "engage new users" goal but needs an explicit decision since it changes the read rule above. See §7.

---

## 6. Moderation & Abuse Considerations

Public chat carries meaningfully more abuse risk than DMs (visible to everyone, including brand-new accounts, and lower friction to spam). Recommend building these in from the start rather than retrofitting:

- **Slow mode / rate limiting:** enforce a minimum seconds-between-messages per user (configurable per room via `slowModeSeconds`), checked server-side in the Cloud Function against the user's most recent message timestamp.
- **New-account restrictions:** a 10-minute posting lock plus stricter metering until the user has a team — specified in §6.2.
- **Soft-delete + audit trail** for moderator-removed messages, rather than hard deletion, so there's a record if a report or dispute follows — this is orthogonal to the 3-day TTL expiry in §6.1, since a moderator may want to remove a message from view well before it expires.
- **Reuse the forum's existing profanity/content filter, if one exists**, rather than building a new one — please point me to it if so; otherwise this is a gap that should be flagged before launch, since public chat is exactly the surface where a filter matters most.

### 6.1 Retention: 3-Day Expiry via Firestore TTL

**This supersedes the earlier plan** (a Go cron job purging messages older than 24 hours). Firestore supports TTL (time-to-live) policies natively: you designate a timestamp field on a collection group as the expiration time, and Firestore deletes documents automatically once that time passes. That removes the cron job, the scheduler, and the need for the Go API to have Firestore Admin access for this feature.

**Design:**

1. Every chat message is written with `expireAt = createdAt + 3 days`, set **server-side** inside `sendChatMessage` from the same timestamp used for `createdAt`, so the two can't drift and clients can't set their own lifetime. The 3-day value lives in one constant (e.g. `CHAT_RETENTION_DAYS = 3`) so it's trivial to change.
2. A TTL policy is created once on collection group `chatMessages`, field `expireAt` (Firebase/Google Cloud console, or the `gcloud firestore fields ttls update` command). Enabling a policy on a collection group that already has expired documents bulk-deletes them, which is harmless here but worth knowing if you ever backfill.
3. **Reports are untouched:** `reports` documents (including `chatMessageSnapshot` from §3.5) are in a different collection group with no TTL policy, so reported content survives. Never add `expireAt` to report documents.

**Caveats from Google's TTL documentation that shape the implementation:**

- **Deletion is not instant.** Expired documents keep showing up in queries and lookups until the TTL process actually deletes them. The history query must therefore filter by age itself, e.g. `where('createdAt', '>', now - 3 days)` ordered by `createdAt`, so users never see stale messages while they wait to be cleaned up. (Because `expireAt` is always `createdAt + 3 days`, filtering on `createdAt` is equivalent and reuses the existing ordering field.)
- **No ordering guarantee** for deletions. Irrelevant for chat, since nothing depends on the order messages disappear.
- **Billing:** TTL deletes count as ordinary document deletes. Cheap at this scale, but not free.
- **Index hotspots:** Google notes that indexing a timestamp field can create hotspots at higher traffic. Since the client never queries by `expireAt`, consider exempting `expireAt` from single-field indexing.

**Why the subcollection is `chatMessages`, not `messages`:** TTL policies are keyed by collection-group name plus field. The DM system's `conversations/{id}/messages` shares the group name `messages`; its documents have no `expireAt`, so they would be unaffected today, but one stray `expireAt` on a DM would silently delete it. A distinct name removes that risk entirely.

**Effect on history length:** retention is now 3 days (plus however long TTL takes to run) rather than 24 hours, so expect roughly 3x the stored volume you'd have had with the 24-hour plan. Soft-deleted messages (`isRemoved: true`, §4.4) expire on the same schedule.

### 6.2 New-User Posting Restrictions

Two rules limit spam from new accounts. Both are enforced server-side in `sendChatMessage`, never only in the UI.

1. **10-minute posting lock.** A user cannot send chat messages until 10 minutes after their account was created (`users/{uid}.createdAt`, or the Firebase Auth `metadata.creationTime`). They can still read chat during this window. The UI should show the input disabled with a countdown ("You can chat in 6:42"), so the server rejection (`CHAT_LOCKED_NEW_ACCOUNT`) is only a backstop. Unlike the DM block feature, this is **not** silent, since users should understand why they can't post.
2. **Metering until they have a team.** Users without a team get a stricter send limit than the room's normal slow mode; once they gain access to a team, they fall back to the room's regular `slowModeSeconds`. Proposed placeholder numbers (please confirm or replace): one message per 30 seconds and at most 10 messages per hour while team-less.

**Implementation sketch:**

```ts
// chatRateLimits/{uid}  (server-only; no client access)
interface ChatRateLimit {
  lastMessageAt: Timestamp;
  windowStartedAt: Timestamp;   // start of the current hourly window
  windowCount: number;          // messages sent in the current window
}
```

`sendChatMessage` reads and updates this document in a transaction, so concurrent sends can't slip past the limit. A counter document is preferable to querying the user's recent messages, because messages expire and querying by `senderId` would need an extra index.

**Team check:** "has a team" is derived from the per-league fields already on the Firestore user document (`CurrentUser`). The React app computes this in `AuthContext` with memoized flags (`isCFBUser` from `teamId`, `isNFLUser` from `NFLTeamID`, `isCBBUser` from `cbb_id`, `isNBAUser` from `NBATeamID`, `isCHLUser` from `CHLTeamID`, `isPHLUser` from `PHLTeamID`, each meaning "ID > 0"). Those are React `useMemo` values, so the Cloud Function can't call them. It needs the same rule as a plain function, ideally in code shared by both sides so the two can't drift:

```ts
export function hasAnyTeam(user: CurrentUser): boolean {
  const ids = [
    user.teamId,                 // CFB
    user.NFLTeamID,
    user.cbb_id,
    user.NBATeamID,
    user.CHLTeamID,
    user.PHLTeamID,
    user.MLBOrgID,               // proposed addition, see below
    user.CollegeBaseballOrgID,   // proposed addition, see below
  ];
  return ids.some((id) => typeof id === 'number' && id > 0);
}
```

**Coverage gap to decide on:** the existing `AuthContext` flags don't cover `MLBOrgID`, `CollegeBaseballOrgID`, or the duplicate `team_id` field. If chat only used the six existing flags, MLB and college baseball users would stay metered forever even though they run a team. I've included the two org IDs above as a proposal; see §7.

---

## 7. Open Questions

1. **Room structure:** Confirming Option C (single global room now, split by league later) as the starting point, per the recommendation in §2 — let me know if you'd rather start with Option A or B outright.
2. **Anonymous read access:** Should logged-out visitors be able to *view* chat activity (not post) to signal an active community before signing up? Materially affects the security rule in §5.
3. **Attachments in chat:** Do you want image/screenshot support in public chat like DMs have, or should chat be text-only (+ mentions) for v1 to reduce moderation surface area?
4. **Typing indicators / presence:** Worth the added write volume for v1, or skip for now (per the note in §3.3)?
5. **Existing profanity/content filter:** Does the forum already have one that this should plug into? This is close to a blocking question for a *public* chat launch, more so than it was for private DMs.
6. **Personal message filtering:** Beyond reporting, do you want a client-side "mute/hide this user's messages from my own view" option, distinct from moderator mutes?
7. **What "metered" means (§6.2):** The proposed placeholder is one message per 30 seconds and 10 per hour until the user has a team. Do you have numbers in mind?
8. **The 10-minute clock (§6.2):** I assumed it starts at account creation. The alternative is 10 minutes of cumulative time on the site, which is more complex and probably not worth it unless users commonly sign up and return later to spam. Which do you want?
9. **Team definition (§6.2):** any per-league team ID greater than 0 on the user document. Remaining decision: should `MLBOrgID`, `CollegeBaseballOrgID`, and the duplicate `team_id` also count? I recommend yes for the two org IDs, since the existing `AuthContext` flags omit them and those users would otherwise stay metered.
10. **Typed messages (§3.2.1):**
    - You wrote "backslashes" for the commands; I assumed the usual forward-slash style (`/player ...`). Which do you want?
    - Where does player/team/game data live (presumably the Go API)? The click-through modal would fetch from there by `entityId`.
    - Should v1 already render `Player`/`Team`/`Game` messages (even though nothing sends them yet), or only reserve the schema?
11. **Avatars (§3.2.2):**
    - Are snapshot-at-send-time avatars acceptable (older messages keep the old picture for up to 3 days after a change)?
    - Where is the profile image URL stored? The `CurrentUser` interface has no image field, so `sendChatMessage` needs to know which document and field to read.
    - Are profile images readable by all logged-in users under current Storage rules?
    - Your Discord screenshot also shows role badges next to the name. Do you want badges (e.g. staff/dev) on chat messages? If so, they'd be denormalized onto the message like `imageUrl`.
12. **TTL lag (§6.1):** Firestore doesn't delete at the exact moment of expiry, so the client hides anything older than 3 days in the meantime. Is that acceptable, or do you need hard guarantees about when data is gone?
13. **Existing moderation fields:** `CurrentUser` already has `IsBanned` and `forumMutedUntil`. I've assumed banned users can't chat. Should a forum mute (`forumMutedUntil`) also block chat, or should chat mutes stay separate (the `chatMutes` collection in §3.4)?

---

## 8. Suggested Implementation Order

1. Data model + security rules + `sendChatMessage` Cloud Function, including `expireAt`, the profile `imageUrl`, and the §6.2 checks (10-minute lock, metering). Single global room (Option C), text-only, `type: 'Message'` only.
2. One-time setup: create the Firestore TTL policy on collection group `chatMessages`, field `expireAt`, and (optionally) exempt `expireAt` from indexing. Can be done as soon as the schema is final; no cron job or Go changes needed.
3. Chat UI: Discord-style message rows (avatar, username, timestamp, grouped consecutive messages), live subscription with the `createdAt` age filter, pagination for history, input box with @mention autocomplete reused from DMs/forum, and the locked/countdown state for new users.
4. Reporting integration (reuse the shared `reports` pipeline from the DM/forum system), including the `chatMessageSnapshot` field from §3.5 so reports survive TTL expiry.
5. Moderator tooling: mute-from-room, soft-delete message.
6. Later: slash commands and clickable Player/Team/Game modals (schema is already reserved), attachments, typing indicators, and room-splitting once real usage patterns are known.
