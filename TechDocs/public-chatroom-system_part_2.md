# Public Chatroom System — Technical Design Document

**Stack:** TypeScript, React, Firebase (Firestore + Security Rules). No Cloud Functions, no Go involvement.
**Status:** Draft v2
**Reuses:** the existing @mention parser and the report flow from the forum/DM features

---

## 1. Overview

A real-time public chatroom that gives new and existing users a low-friction place to talk. Unlike the mail-style DM system, this is live chat: messages appear instantly through Firestore listeners, and there is no per-user read/unread tracking.

**Goals**

- Live public chat with Discord-style rows (avatar, username, timestamp, text)
- Every message expires 3 days after it is sent, cleaned up automatically by Firestore TTL
- Message types (`Message`, `Player`, `Team`, `Game`) reserved now for a future slash-command feature
- Spam limits for new users: a 10-minute posting lock, then metering until they have a team
- Reports keep the text of the reported message even after it expires

**Deferred (not in v1)**

- Image attachments, typing indicators, reactions/threads, voice/video
- Push or in-app notifications for @mentions (would need server-side code; see §9)
- Slash commands and clickable Player/Team/Game cards (schema reserved)

---

## 2. Room Structure

Start with a **single global room** (`chatRooms/global`). A new community feels more alive in one busy room than in several empty per-league rooms. A room is just a document ID, so splitting into per-league rooms later (SimHockey, SimFBA, etc.) needs no schema change.

---

## 3. Architecture: No Cloud Functions

Clients read and write Firestore directly. **Security Rules are the only server-side enforcement.** Rules can read other documents (the user document, the sender's rate-limit document, mute documents), which is enough to enforce everything v1 needs.

**What the rules enforce**

- The sender is who they claim to be, and `senderUsername` and the snapshotted logo inputs match the user document
- The user is not banned, forum-muted, or muted in this room, and their account is at least 10 minutes old
- A per-user cooldown between messages (stricter if the user has no team), including a guard against sending many messages in one batched write (§8)
- The message is `type: 'Message'`, has a 1–500 character body, at most 10 mentions and one approved image URL, with `createdAt` equal to server time
- `expireAt` is roughly 3 days out (within a bounded window, see §6)
- Only moderators can delete messages or create mutes
- A chat report's message snapshot matches the live message

**What the rules cannot do (accepted for v1)**

- Validate `mentionedUserIds`. They are client-computed and only used to highlight mentions
- Run a profanity filter. If the forum has one, it can only run client-side here, which a determined user can bypass
- Verify that a Player/Team/Game card points at a real entity. v1 rules only allow `type: 'Message'`, so this doesn't matter until slash commands exist
- Set `expireAt` exactly. The client supplies it, so the rules accept a window instead of an exact value

**Cost note:** every send triggers about 6 rule lookups (user document, mute check, rate-limit document before and after), and each is billed as a document read. Negligible at this scale, but it is not free. Rules also have a lookup limit per request (10 for single writes, 20 for batches); this design stays under it.

---

## 4. Data Model (Firestore)

### 4.1 `chatRooms/{roomId}`

```ts
interface ChatRoom {
  id: string; // 'global' in v1
  name: string; // e.g. "General Chat"
  isActive: boolean;
  createdAt: Timestamp;
}
```

Seeded manually (console or a one-off script). Clients cannot write it.

### 4.2 `chatRooms/{roomId}/chatMessages/{messageId}`

```ts
type ChatMessageType = "Message" | "Player" | "Team" | "Game";

interface ChatMessage {
  type: ChatMessageType; // 'Message' is the base text message
  senderId: string;
  senderUsername: string;
  senderProfile: ChatAvatarProfile; // validated logo inputs snapshotted at send time
  body: string; // 1–500 characters
  mentionedUserIds: string[]; // max 10, client-computed
  attachments: ChatAttachment[]; // v1: zero or one image
  createdAt: Timestamp; // server timestamp
  expireAt: Timestamp; // ≈ createdAt + 3 days; drives TTL (§6)
  entityRef?: ChatEntityRef; // reserved for Player/Team/Game, not allowed by v1 rules
}

interface ChatAvatarProfile {
  DefaultLeague: string | null;
  teamId: number;
  NFLTeamID: number;
  cbb_id: number;
  NBATeamID: number;
  CHLTeamID: number;
  PHLTeamID: number;
  IsRetro: boolean;
}

interface ChatAttachment {
  url: string;
  name: string;
}

interface ChatEntityRef {
  entityType: "Player" | "Team" | "Game"; // equals `type`
  entityId: string;
  league?: string;
  label: string; // display text; also the fallback if lookup fails
}
```

The message document ID is `{uid}_{seq}`, derived from the sender's rate-limit counter (§4.3, §8).

**Message types**

| Type      | Meaning                                     | Click behavior                    |
| --------- | ------------------------------------------- | --------------------------------- |
| `Message` | Base text message. The only type sent in v1 | None                              |
| `Player`  | Player card shared into chat                | Opens a modal with player details |
| `Team`    | Team card shared into chat                  | Opens a modal with team details   |
| `Game`    | Game card shared into chat                  | Opens a modal with game details   |

- Typed messages store a **reference**, not a copy. The modal fetches live data by `entityId` when opened, and `label` is the only denormalized piece.
- Clients that don't recognize a `type` should render `body` (or `entityRef.label`) as plain text instead of failing.
- Enabling these types later means loosening the rules (add the new keys and types) and deciding how entity IDs get validated (§9).

**Avatars (`senderProfile`)**

- The client snapshots the user's league/team logo inputs, and the rules reject the write if they don't match the user document.
- The client derives the logo with the existing `getUserLogoUrl` helper; users without a supported logo get an initials fallback.
- It is a snapshot. If a user changes teams or their default league, older messages keep the prior logo selection until they expire (at most about 3 days).

### 4.3 `chatRateLimits/{uid}`

```ts
interface ChatRateLimit {
  lastMessageAt: Timestamp; // server timestamp of the user's last send
  seq: number; // increments by 1 on every send
}
```

Written by the client in the same batch as each message. The rules require both writes to happen together (§8).

### 4.4 `chatMutes/{roomId}_{userId}`

```ts
interface ChatMute {
  roomId: string;
  userId: string;
  mutedBy: string; // moderator user ID
  reason?: string;
  expiresAt: Timestamp | null; // null = indefinite
  createdAt: Timestamp;
}
```

Moderators create and remove these. A muted user can read their own mute so the UI can explain why the input is disabled.

### 4.5 Report additions (existing `reports` collection)

Extend the existing report shape rather than creating a new collection:

```ts
context: "public_chat";
contextRefs: {
  roomId: string;
  messageId: string;
}
chatMessageSnapshot: {
  type: ChatMessageType;
  body: string;
  senderId: string;
  senderUsername: string;
  sentAt: Timestamp;
}
```

The snapshot is captured at report time because the message will expire. Reports have no `expireAt` and are never touched by TTL. The rules check that the snapshot body matches the live message, so reporters can't fabricate evidence (§8).

---

## 5. Core Flows

### 5.1 Sending a message

One batched write containing the message and the updated rate-limit document:

```ts
const rlRef = doc(db, "chatRateLimits", uid);
const prevSeq = (await getDoc(rlRef)).data()?.seq ?? 0; // or cached from the last send
const seq = prevSeq + 1;

const batch = writeBatch(db);
batch.set(doc(db, "chatRooms", roomId, "chatMessages", `${uid}_${seq}`), {
  type: "Message",
  senderId: uid,
  senderUsername: currentUser.username,
  senderProfile: chatAvatarProfileSnapshot,
  body,
  mentionedUserIds,
  attachments: attachment ? [attachment] : [],
  createdAt: serverTimestamp(),
  expireAt: Timestamp.fromMillis(Date.now() + 3 * 24 * 60 * 60 * 1000),
});
batch.set(rlRef, { lastMessageAt: serverTimestamp(), seq });
await batch.commit();
```

A rules rejection comes back as a generic `permission-denied`, so the UI must work out the reason locally (new-account lock, cooldown, mute, ban) and disable the input with an explanation. The rules are the backstop, not the user-facing error path. If two tabs race on `seq`, one write fails; refetch and retry.

### 5.2 Reading

- Subscribe with `onSnapshot` to the latest messages: `where('createdAt', '>', now − 3 days)`, `orderBy('createdAt', 'desc')`, `limit(50)`. Reverse for display.
- Paginate older messages on scroll-up using the same age filter. History bottoms out at about 3 days, so show a subtle "Messages older than 3 days aren't kept" note at the top.
- Group consecutive messages from the same sender under one avatar and name.

### 5.3 Reporting

The client creates a `reports` document (§4.5) including the snapshot. This is a pure flag-to-moderators action; unlike DMs there is no per-reporter mute.

### 5.4 Moderation

- **Delete a message:** moderators delete the document directly. The report snapshot preserves evidence for anything that was reported.
- **Mute a user:** moderators write a `chatMutes` document (temporary or indefinite).

---

## 6. Retention: 3-Day Expiry via Firestore TTL

Firestore TTL policies delete documents automatically once a designated timestamp field passes, so no cron job or scheduler is needed.

1. Create a TTL policy once on collection group **`chatMessages`**, field **`expireAt`** (Firebase/Google Cloud console, or `gcloud firestore fields ttls update`).
2. Every message carries `expireAt ≈ createdAt + 3 days`. The client sets it, so the rules accept any value between 2 and 4 days after the server time. A client with a wrong clock can shorten or lengthen its own message's life by a day at most, which is harmless.
3. **Deletion is not instant.** Expired documents still appear in queries until TTL removes them, which is why the read queries filter on `createdAt` (§5.2).
4. TTL deletes bill as normal deletes, and TTL does not delete in expiry order. Neither matters here.
5. Google notes that indexing a timestamp field can create hotspots at high traffic. Since the client never queries `expireAt`, consider exempting it from single-field indexing.
6. The subcollection is named `chatMessages` (not `messages`) because TTL policies are keyed by collection-group name, and the DM system's `messages` group would otherwise share the policy. Never add `expireAt` to DM messages or reports.

---

## 7. New-User Restrictions

1. **10-minute posting lock.** Measured from `createdAt` on the user document. New users can read chat but not send. The UI shows the input disabled with a countdown ("You can chat in 6:42").
2. **Metering until they have a team.** The cooldown is **30 seconds** between messages without a team and **3 seconds** with one.

"Has a team" means any per-league team ID on the user document is greater than 0, including `MLBOrgID` and `CollegeBaseballOrgID`; the duplicate `team_id` does not count. User-owned profile writes must not alter account creation time, moderation fields, or team IDs, or these rule-enforced limits could be bypassed.

An active forum mute also blocks chat. The admin mute UI writes both the existing `forumMutedUntil` ISO string and a `forumMutedUntilAt` Timestamp mirror, which rules can compare with `request.time`. Backfill existing active forum mutes before deploying the rules.

---

## 8. Security Rules

The code sketch below is retained for architectural context only; it predates the resolved `senderProfile` and attachment schema and is not deployable as-is. The current working implementation is [`firestore.rules`](../firestore.rules). It has been smoke-tested in the Firestore Emulator with one permitted send and one immediate send rejected by cooldown; broader rules-unit tests are still recommended when a test harness is added.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ---------- helpers ----------
    function userData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function hasTeam(u) {
      return u.get('teamId', 0) > 0
          || u.get('NFLTeamID', 0) > 0
          || u.get('cbb_id', 0) > 0
          || u.get('NBATeamID', 0) > 0
          || u.get('CHLTeamID', 0) > 0
          || u.get('PHLTeamID', 0) > 0
          || u.get('MLBOrgID', 0) > 0                // proposed
          || u.get('CollegeBaseballOrgID', 0) > 0;   // proposed
    }

    function isModerator(u) {
      return u.get('roleID', null) in ['admin', 'moderator'];   // TBD: real role values
    }

    function rateLimitPath() {
      return /databases/$(database)/documents/chatRateLimits/$(request.auth.uid);
    }

    function prevSeq() {
      return exists(rateLimitPath()) ? get(rateLimitPath()).data.seq : 0;
    }

    function notMuted(roomId) {
      let mutePath = /databases/$(database)/documents/chatMutes/$(roomId + '_' + request.auth.uid);
      return !exists(mutePath)
        || (get(mutePath).data.expiresAt != null
            && get(mutePath).data.expiresAt < request.time);
    }

    function cooldownPassed(u) {
      return !exists(rateLimitPath())
        || get(rateLimitPath()).data.lastMessageAt
             + duration.value(hasTeam(u) ? 3 : 30, 's') <= request.time;
    }

    function canSend(roomId, messageId) {
      let u = userData();
      let d = request.resource.data;
      return d.keys().hasOnly(['type', 'senderId', 'senderUsername', 'imageUrl',
                               'body', 'mentionedUserIds', 'createdAt', 'expireAt'])
        && d.type == 'Message'
        && d.senderId == request.auth.uid
        && d.senderUsername == u.username
        && d.get('imageUrl', null) == u.get('profileImageUrl', null)   // TBD: field name
        && d.body is string && d.body.size() > 0 && d.body.size() <= 500
        && d.mentionedUserIds is list && d.mentionedUserIds.size() <= 10
        && d.createdAt == request.time
        && d.expireAt > request.time + duration.value(2, 'd')
        && d.expireAt < request.time + duration.value(4, 'd')
        && u.get('IsBanned', false) != true
        && request.time > u.createdAt + duration.value(10, 'm')
        && notMuted(roomId)
        && cooldownPassed(u)
        // one message per batch: the ID is tied to the sequence number
        && messageId == request.auth.uid + '_' + string(prevSeq() + 1)
        && getAfter(rateLimitPath()).data.seq == prevSeq() + 1
        && getAfter(rateLimitPath()).data.lastMessageAt == request.time;
    }

    // ---------- chat ----------
    match /chatRooms/{roomId} {
      allow read: if request.auth != null;   // decide on anonymous read, see §10
      allow write: if false;                 // seeded manually

      match /chatMessages/{messageId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && canSend(roomId, messageId);
        allow update: if false;
        allow delete: if request.auth != null && isModerator(userData());
      }
    }

    match /chatRateLimits/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['lastMessageAt', 'seq'])
        && request.resource.data.lastMessageAt == request.time
        && request.resource.data.seq == prevSeq() + 1;
      allow delete: if false;
    }

    match /chatMutes/{muteId} {
      allow read: if request.auth != null
        && (resource.data.userId == request.auth.uid || isModerator(userData()));
      allow create, update, delete: if request.auth != null && isModerator(userData());
    }

    // ---------- reports (add this branch to the EXISTING reports create rule) ----------
    // request.resource.data.context != 'public_chat'
    //   || get(/databases/$(database)/documents/chatRooms/
    //          $(request.resource.data.contextRefs.roomId)/chatMessages/
    //          $(request.resource.data.contextRefs.messageId)).data.body
    //        == request.resource.data.chatMessageSnapshot.body
  }
}
```

**Why the message ID is `{uid}_{seq}`:** rules can't count writes in a batch. Without this guard, a user could put hundreds of messages in one batch and every one would pass the cooldown check, because they all see the same "before" state. Tying the ID to the sequence number means a batch can only ever produce one message.

---

## 9. Limits of the Function-Free Approach

This design trades some server-side control for simplicity. Add a small Cloud Function (or Go endpoint) later only if one of these becomes a real need:

- **@mention notifications** (push or in-app). Needs a server-side trigger
- **Validated Player/Team/Game cards.** Rules can't check a Go/SQL-backed entity, so the slash-command feature will probably need a server check (or the Go API) to stop forged cards
- **Server-enforced profanity filtering**
- **Hourly message caps or other windowed limits.** Possible in rules with a counter, but fiddly; the cooldown alone covers v1
- **Exact `expireAt`** values (the 2–4 day window is the only tradeoff today)

Rules are also harder to debug than application code, so budget time for emulator tests of every rule above.

---

## 10. Open Questions

The following v1 choices are settled: authenticated users only; 30-second no-team / 3-second team cooldowns; `MLBOrgID` and `CollegeBaseballOrgID` count as a team, but `team_id` does not; Admins and Commissioners moderate; forum mutes also block chat; mentions are stored without notifications; no profanity filter; one image attachment up to 5 MB is accepted by the UI. The image-size limit is client-side; Rules validate the count and ImageKit URL but cannot inspect the uploaded file's actual bytes.

Reports, role badges, slash commands, and moderator UI remain follow-on work. The current avatar snapshot uses the validated team-logo inputs rather than a profile-image URL.

---

## 11. Implementation Order

1. Security rules (§8) with emulator tests. This is the core of the feature, so get it right first
2. Seed `chatRooms/global`; create the TTL policy on `chatMessages.expireAt` (optionally exempt it from indexing)
3. Chat UI: live subscription with the age filter, Discord-style rows, input with @mention autocomplete, locked/cooldown states
4. Reporting: add the chat branch and snapshot to the existing report flow
5. Moderator tools: delete message, mute user
6. Later: slash commands and clickable cards, attachments, notifications, per-league rooms
