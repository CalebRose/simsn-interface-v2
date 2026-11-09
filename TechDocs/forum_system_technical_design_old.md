# Forum System Technical Design

## Document Info

- **Project**: Forum-based community system for simulation sports leagues
- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend / BaaS**: Firebase Authentication, Firestore, Cloud Functions, optional Cloud Storage
- **Primary Goal**: Provide an async forum experience for league communities with moderation, rich text, polls, quoting/replying, tagging, and game references
- **Status**: Initial technical design draft

---

## 1. Overview

This document describes a forum-based system intended to support a sports simulation community. The system should provide structured discussion spaces for league operations, daily discussion, sports-specific subforums, moderation tools, and future extensibility for media and richer integrations.

The system should favor:

- low operational cost
- low infrastructure complexity
- strong moderation controls
- clean UX for structured discussion
- extensibility for future league-specific features

Firebase is a good fit because:

- user base is relatively small to moderate
- forum traffic is asynchronous rather than chat-heavy
- Firestore can model threads, posts, polls, notifications, and references cleanly
- Firebase Auth simplifies auth and role-aware access
- Cloud Functions can enforce server-side moderation and denormalization logic

---

## 2. Goals

### 2.1 Functional Goals

The forum should support:

- A **Forum landing page**
- Top-level subforums:
  - Admin
  - Daily
  - SimCFB
  - SimNFL
  - SimCBB
  - SimNBA
  - SimCHL
  - SimPHL
  - SimCBL
  - SimMLB
  - Offtopic / OnterriorIRL
- Sports forums should support subcategories such as:
  - News / Press
  - Daily
- Rich text editing
- Role-based moderation tools
- Poll creation and voting
- Replying, tagging, and quoting
- Reacting to posts within forum threads (Like, Dislike, Laugh, Sad, Angry, Confused)
- Thread locking
- Optional image attachments later
- Referencing an existing game from schedule pages in the Interface

### 2.2 Non-Goals (Initial Scope)

The first version should not require:

- real-time chat behavior
- full WYSIWYG collaborative editing
- arbitrary file attachments beyond optional future image support
- advanced search indexing beyond basic Firestore-backed filtering
- full markdown + HTML + arbitrary iframe support from day one

---

## 3. User Roles and Permissions

### 3.1 Roles

Suggested base roles:

- **guest**
  - can view public forum content if enabled
- **member** (any user with a TeamID > 0 from currentUser class)
  - can create threads, reply, vote in polls, quote, mention
- **Commissioner** (role already existing as XXXX Comissioner)
  - can edit/delete/lock threads and posts within scoped forums by league
- **admin**
  - can manage role assignments and protected admin-only settings

### 3.2 Permission Matrix

| Capability                          |   Member | Commissioner | Admin |
| ----------------------------------- | -------: | -----------: | ----: |
| Read forums                         |      Yes |          Yes |   Yes |
| Create thread                       |      Yes |          Yes |   Yes |
| Reply to thread                     |      Yes |          Yes |   Yes |
| Edit own post (time-limited)        |      Yes |          Yes |   Yes |
| Delete own post (soft delete rules) | Optional |          Yes |   Yes |
| Vote in poll                        |      Yes |          Yes |   Yes |
| Lock thread                         |       No |          Yes |   Yes |
| Delete any post                     |       No |          Yes |   Yes |
| Edit any post                       |       No |          Yes |   Yes |
| Pin/feature thread                  |       No |     Optional |   Yes |
| Manage forums/categories            |       No |           No |   Yes |

### 3.3 Moderation Notes

Recommended moderation model:

- moderators and admins **do not hard delete by default**
- use **soft deletion** for auditability
- maintain fields like:
  - `isDeleted`
  - `deletedBy`
  - `deletedAt`
  - `moderationReason`

---

## 4. Information Architecture

## 4.1 Forum Structure

Recommended hierarchy:

- Forum Home
  - Admin
  - Daily
  - SimCFB
    - News / Press
    - Daily
  - SimNFL
    - News / Press
    - Daily
  - SimCBB
    - News / Press
    - Daily
  - SimNBA
    - News / Press
    - Daily
  - SimCHL
    - News / Press
    - Daily
  - SimPHL
    - News / Press
    - Daily
  - SimCBL
    - News / Press
    - Daily
  - SimMLB
    - News / Press
    - Daily
  - OffTopic / OnterrioIRL

### 4.2 Recommended Routing

Suggested frontend routes:

```txt
/forums
/forums/:forumSlug
/forums/:forumSlug/:subforumSlug
/forums/thread/:threadId
/forums/thread/:threadId/reply/:postId
```

Examples:

```txt
/forums
/forums/simcfb
/forums/simcfb/daily
/forums/thread/abc123
```

### 4.3 Navigation Behavior

Forum page should include:

- category cards or table layout for top-level forums
- per-forum thread counts, latest activity, latest poster
- breadcrumb navigation
- sticky/pinned threads shown first
- lock icon for locked threads
- poll badge for poll threads
- game-reference badge for game-linked threads

---

## 5. High-Level Architecture

## 5.1 Frontend

**Stack**

- React.js
- TypeScript
- Tailwind CSS
- React Router
- Firebase Web SDK
- Optional editor library:
  - Lexical
  - TipTap
  - Slate

### Recommended frontend responsibilities

- render forum hierarchy
- fetch and paginate threads/posts
- present editor UI
- manage optimistic UI for post creation
- render quoted posts and mentions
- render poll voting UI
- render game reference cards
- show moderation controls based on claims/role

## 5.2 Backend / Firebase

**Firebase services**

- **Firebase Auth**
  - user login / identity
- **Firestore**
  - forums, threads, posts, polls, notifications, forum metadata
- **Cloud Functions**
  - denormalization
  - poll vote validation
  - moderation logging
  - mention notifications
  - game-reference hydration
- **Cloud Storage** (optional later)
  - image uploads

## 5.3 Why Firestore Works Well Here

The forum is fundamentally:

- document-centric
- hierarchical
- read-heavy, write-light
- okay with pagination and denormalized counters

Firestore is a strong fit as long as:

- documents stay reasonably sized
- replies are paginated
- counters are denormalized carefully
- security rules are kept simple and role-based

---

## 6. Data Model

A normalized-relational design is possible, but Firestore works best with selective denormalization.

## 6.1 Core Collections

Recommended top-level collections:

```txt
users/
forums/
threads/
posts/
polls/
notifications/
moderationLogs/
gameReferences/
```

Optional:

```txt
forumDailyStats/
userMentions/
reports/
```

---

## 6.2 Collection: `users`

```ts
export interface CurrentUser {
  id: string;
  username: string;
  teamId?: number;
  NFLTeamID?: number;
  NFLRole?: string;
  cbb_id?: number;
  NBATeamID?: number;
  NBARole?: string;
  CHLTeamID?: number;
  PHLTeamID?: number;
  PHLRole?: string;
  MLBOrgID?: number;
  CollegeBaseballOrgID?: number;
  IsRetro?: boolean;
  IsSubscribed?: boolean;
  roleID: string | null; // "XXXX Commissioner", "admin", "beta". Use with any of TeamID/teamId/cbb_id fields to determine forum permissions
  forumROleScopes?: string[];
  email: string;
  DefaultLeague: string | null; // already determines profile pic in the interface
  IsBanned?: boolean;
  Reports?: number;
}
```

Notes:

- role can also live in Firebase custom claims
- profile document is useful for rendering and search
- `username` should be unique and normalized

---

## 6.3 Collection: `forums`

Each top-level forum or subforum can live as its own document.

```ts
type Forum = {
  id: string;
  slug: string;
  name: string;
  parentForumId?: string | null;
  type: "top_level" | "subforum";
  description?: string;
  sortOrder: number;
  visibility: "public" | "members" | "admin_only";
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
  sportKey?: string | null; // simcfb, simnfl, etc.
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

---

## 6.4 Collection: `threads`

```ts
type Thread = {
  id: string;
  forumId: string;
  forumPath: string[]; // e.g. ['simcfb', 'daily']
  title: string;
  slug: string;
  author: {
    uid: string;
    username: string;
    displayName: string;
  };
  contentPreview: string;
  firstPostId: string;
  isPinned: boolean;
  isLocked: boolean;
  isAnnouncement: boolean;
  isDeleted: boolean;
  tags?: string[];
  threadType: "standard" | "poll" | "game_reference";
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
};
```

Denormalized fields help with list rendering without fetching every post.

---

## 6.5 Collection: `posts`

Each reply is its own post document.

```ts
type Post = {
  id: string;
  threadId: string;
  forumId: string;
  author: {
    uid: string;
    username: string;
    displayName: string;
  };
  editorVersion: number;
  body: RichTextDocument; // JSON from editor
  bodyText: string; // plain-text stripped version for preview/search
  quotedPostId?: string | null;
  replyToPostId?: string | null;
  mentions?: Array<{
    uid: string;
    username: string;
  }>;
  isEdited: boolean;
  editedAt?: Timestamp | null;
  editedBy?: string | null;
  isDeleted: boolean;
  deletedAt?: Timestamp | null;
  deletedBy?: string | null;
  moderationReason?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

Notes:

- `body` stores editor JSON
- `bodyText` supports preview/search/indexing
- `replyToPostId` supports nested conversational context without requiring true nested tree rendering
- keep UI flat/threaded initially rather than fully nested Reddit-style replies

---

## 6.6 Collection: `polls`

```ts
type Poll = {
  id: string;
  threadId: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    voteCount: number;
  }>;
  allowsMultipleVotes: boolean;
  maxSelectableOptions: number; // typically 1 unless multi-select enabled later
  totalVotes: number;
  closesAt?: Timestamp | null;
  isClosed: boolean;
  createdBy: {
    uid: string;
    username: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### Poll vote storage

Option A:

```txt
polls/{pollId}/votes/{uid}
```

```ts
type PollVote = {
  uid: string;
  selectedOptionIds: string[];
  createdAt: Timestamp;
};
```

This is the safest approach. Each user gets one vote document keyed by UID.

---

## 6.7 Collection: `notifications`

```ts
type Notification = {
  id: string;
  uid: string;
  type: "mention" | "quote" | "reply" | "mod_action" | "poll_closing";
  threadId?: string;
  postId?: string;
  actorUid?: string;
  actorUsername?: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
};
```

---

## 6.8 Collection: `moderationLogs`

```ts
type ModerationLog = {
  id: string;
  targetType: "thread" | "post" | "forum";
  targetId: string;
  action: "lock" | "unlock" | "delete" | "restore" | "edit" | "pin" | "unpin";
  performedBy: {
    uid: string;
    username: string;
  };
  reason?: string | null;
  previousState?: Record<string, unknown>;
  nextState?: Record<string, unknown>;
  createdAt: Timestamp;
};
```

---

## 6.9 Collection: `gameReferences`

This supports linking a forum thread or post to an existing game in the Interface.

```ts
type GameReference = {
  id: string;
  league: string; // simcfb, simnfl, etc.
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
  sourcePath?: string; // route path in existing interface
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

A thread or post can reference one `GameReference` document by ID.

---

## 7. Rich Text Editing Design

## 7.1 Requirements

The editor should support:

- bold / italic / underline
- headings
- bullet and numbered lists
- block quotes
- code blocks
- tables
- links
- mentions
- quotes
- optional image blocks later
- safe YouTube embedding only through structured embeds, not arbitrary raw iframe HTML

## 7.2 Recommendation: Store Structured JSON, Not Raw HTML

Best practice:

- use an editor that emits structured JSON
- sanitize on both client and server when rendering
- derive plain text for previews/search

Why:

- avoids arbitrary HTML injection
- easier migration/versioning
- safer for embeds and custom blocks

### Suggested editor choices

#### Option A: Lexical

Good fit if you already have exposure to Lexical concepts.

Pros:

- strong extensibility
- structured editor model
- custom nodes for polls, quotes, game references, embeds

#### Option B: TipTap

Great developer ergonomics.

Pros:

- polished extension ecosystem
- straightforward rich text support
- easier table/code-block support out of the box

**Recommendation:** TipTap is likely the fastest path for rich forum editing unless your app already uses Lexical heavily.

## 7.3 Allowed Rich Content Blocks

Recommended initial block types:

- paragraph
- heading
- bullet list
- numbered list
- block quote
- code block
- table
- link
- mention
- quote reference
- game reference card
- youtube embed block (safe, structured)
- image block (future)

## 7.4 YouTube Embed Safety

Do **not** allow arbitrary iframe HTML in post content.

Instead:

- parse only YouTube URLs
- store a structured `youtubeEmbed` node with:
  - `videoId`
  - `url`
- render a controlled iframe component client-side

Example node payload:

```json
{
  "type": "youtubeEmbed",
  "attrs": {
    "videoId": "abc123xyz"
  }
}
```

This prevents malicious iframe/script injection.

---

## 8. Replying, Quoting, and Tagging

## 8.1 Replying

Two reply levels are enough for V1:

- reply to thread
- reply to a specific post

Store:

- `replyToPostId`

UI can show:

- “Replying to CalebRose”
- link to original post anchor

Avoid full arbitrary nested comment trees initially. A flat chronological thread with reply references is simpler and more forum-like.

## 8.2 Quoting

A quote action should:

- insert a quote block into editor
- include quoted post metadata
- optionally include snippet of original text

Suggested quote block structure:

```json
{
  "type": "quoteReference",
  "attrs": {
    "postId": "post_123",
    "authorUsername": "CalebRose"
  },
  "content": [
    {
      "type": "text",
      "text": "Quoted excerpt..."
    }
  ]
}
```

## 8.3 Tagging / Mentions

Mentions should be structured, not regex-only.

Flow:

- user types `@`
- app searches `users`
- editor inserts mention node
- post save extracts mentions into `mentions[]`
- Cloud Function creates notifications

Suggested node:

```json
{
  "type": "mention",
  "attrs": {
    "uid": "user123",
    "username": "CalebRose"
  }
}
```

---

## 9. Polling Design

## 9.1 Requirements

- polls should support **1 to 10 options**
- one poll per thread in V1
- admins and members may create polls depending on forum permissions
- single-vote required in V1
- future support for multiple selections is optional

## 9.2 Poll Validation

Rules:

- minimum 1 option
- maximum 10 options
- no duplicate options after normalization
- cannot vote twice
- cannot vote after close
- locked/deleted thread cannot accept votes

## 9.3 Vote Handling

Use Cloud Function or transaction-based write for vote submission.

Recommended flow:

1. client submits selected option
2. callable function validates:
   - auth user exists
   - poll is open
   - user has not voted
3. function writes:
   - vote document under `polls/{pollId}/votes/{uid}`
   - increments option count
   - increments total votes

This is more trustworthy than client-only writes.

---

## 10. Game Reference Integration

## 10.1 Requirement

The forum should allow users to reference a game that exists in schedule pages of the existing Interface.

## 10.2 Use Cases

- postgame discussion threads
- game previews
- admin announcements about a matchup
- press/news around a result

## 10.3 Recommended UX

In thread creation or post editor:

- provide “Attach game reference”
- user searches:
  - sport
  - season
  - week
  - team name
  - matchup
- user selects existing game
- thread/post stores `referencedGameId`

Rendered thread shows:

- league badge
- matchup card
- week/season
- link back to schedule page
- optional status if known

## 10.4 Data Flow Options

### Option A: Forum reads schedule data from existing API directly

Best if schedule pages already have stable API endpoints.

Pros:

- single source of truth
- no duplicate storage

Cons:

- forum thread rendering depends on live API availability

### Option B: Store lightweight snapshot in Firestore

Create `gameReferences` documents containing the subset needed for forum rendering.

Pros:

- stable rendering
- lower dependency on interface API at read time
- easy denormalized display

Cons:

- sync concerns if game labels/status change

**Recommendation:** Use a hybrid:

- store `externalGameId` + lightweight snapshot
- optionally rehydrate from main API when needed

---

## 11. Firestore Query Patterns

## 11.1 Forum Listing

Query:

- all `forums`
- order by `sortOrder`

## 11.2 Thread Listing by Forum

Query:

- `threads`
- where `forumId == X`
- where `isDeleted == false`
- order by `isPinned desc`, `latestActivityAt desc`

Because Firestore cannot always handle mixed boolean sorting in a single elegant way, a common pattern is:

- fetch pinned threads separately
- fetch normal threads separately
- merge in UI

## 11.3 Thread Posts

Query:

- `posts`
- where `threadId == X`
- where `isDeleted == false`
- order by `createdAt asc`
- paginate by 20/50

## 11.4 Notifications

Query:

- `notifications`
- where `uid == currentUser.uid`
- order by `createdAt desc`
- limit 20

## 11.5 Poll Votes

Usually fetched per poll, or aggregate counts only.

---

## 12. Security Design

## 12.1 Authentication

Use Firebase Auth.

Possible providers:

- email/password
- Google sign-in
- optional Discord OAuth later if needed via custom auth flow

## 12.2 Authorization Model

Role should be enforced by:

- Firebase custom claims for trusted access checks
- mirrored role in `users/{uid}` for UI rendering

## 12.3 Firestore Security Rule Principles

Rules should ensure:

- only authenticated users can create threads/posts
- only owners can edit their own posts within allowed constraints
- only moderators/admins can edit/delete/lock any content
- poll votes are restricted to one vote per authenticated user
- admin forums are not readable/writable by regular members

### Example rule concepts

```txt
- users can read public/member forums according to visibility
- members can create posts in unlocked forums
- members cannot write to admin-only forums unless role permits
- only moderators/admins can set isLocked, isPinned, isDeleted on arbitrary content
```

## 12.4 Important Rule Strategy

Do not trust the client to set moderation fields like:

- `isPinned`
- `isLocked`
- `isDeleted`
- `deletedBy`
- `moderationReason`
- `role`

These should be written only by trusted Cloud Functions or admin-authorized paths.

---

## 13. Cloud Functions

Recommended functions:

## 13.1 `onThreadCreated`

- set/create first post linkage
- increment forum thread count
- update forum latest activity

## 13.2 `onPostCreated`

- increment thread reply count
- increment forum post count
- update latest activity fields
- extract mentions and create notifications
- update participant count if needed

## 13.3 `onPostDeleted` / `onThreadDeleted`

- decrement denormalized counts if using hard delete
- otherwise update visibility/listing state

## 13.4 `submitPollVote`

- validate single vote
- update vote counts transactionally

## 13.5 `lockThread`

- admin/mod only callable
- sets thread lock state
- writes moderation log

## 13.6 `attachGameReference`

- validate external game data
- store snapshot or link metadata

## 13.7 `sanitizeRichText`

Optional but recommended:

- validate allowed node types
- strip unsupported content
- reject unsafe embeds

---

## 14. Frontend Component Design

## 14.1 Pages

- `ForumsHomePage`
- `ForumCategoryPage`
- `ThreadPage`
- `CreateThreadPage`
- `EditPostPage`
- `ModerationQueuePage` (future)

## 14.2 Core Components

- `ForumCard`
- `ForumBreadcrumbs`
- `ThreadList`
- `ThreadListItem`
- `ThreadHeader`
- `ThreadActions`
- `PostList`
- `PostCard`
- `RichTextRenderer`
- `ForumEditor`
- `MentionAutocomplete`
- `QuoteComposer`
- `PollBlock`
- `PollVoteForm`
- `GameReferencePicker`
- `GameReferenceCard`
- `ModerationControls`
- `LockBadge`
- `PinnedBadge`

## 14.3 Hook Suggestions

- `useForums()`
- `useForumThreads(forumId, filters)`
- `useThread(threadId)`
- `useThreadPosts(threadId, cursor)`
- `useCreateThread()`
- `useCreatePost()`
- `useModerationActions()`
- `usePollVote()`
- `useNotifications()`

---

## 15. UI / UX Considerations

## 15.1 Thread Creation Flow

Thread creation form should support:

- title
- forum selector (pre-filled if launched from forum page)
- editor body
- optional poll builder
- optional game reference selector
- optional tags

## 15.2 Thread Display

Each thread row should display:

- title
- badges:
  - pinned
  - locked
  - poll
  - announcement
  - sport/game reference
- author
- replies count
- latest activity timestamp
- latest poster

## 15.3 Post Display

Each post should show:

- author avatar/name
- role badge if mod/admin
- created timestamp
- edited marker if changed
- quote button
- reply button
- moderation dropdown if privileged
- post anchor for deep-linking

## 15.4 Locking Behavior

If a thread is locked:

- existing content remains readable
- editor/reply CTA disabled
- show lock banner:
  - “This thread has been locked by a moderator.”

---

## 16. Cost Considerations

## 16.1 Forum vs Chat

A forum is more cost-effective than chat because:

- fewer realtime listeners
- fewer read-amplified events
- lower write volume
- easier pagination

## 16.2 Rich Text Impact

Tables, bullets, and code blocks increase document size somewhat, but text-rich content is still relatively cheap.

Largest future cost drivers:

- images
- attachment bandwidth
- aggressive live listeners
- search indexing outside Firestore

## 16.3 Image Support Later

If image support is deferred, initial cost stays low.

When adding images later:

- use Cloud Storage
- store metadata in post body as image node
- optionally compress client-side before upload
- enforce image size/count limits

---

## 17. Optional Image Support (Future)

## 17.1 Recommendation

Defer image uploads in V1.

Why:

- adds storage and bandwidth considerations
- requires upload auth/security
- needs moderation/sanitization
- needs image lifecycle cleanup for deleted posts

## 17.2 Future Design

Possible approach:

- upload images to:
  - `forum-images/{uid}/{threadId}/{imageId}`
- store metadata:
  - storage path
  - width
  - height
  - alt text
  - uploadedBy
- insert image node in editor document

Example image node:

```json
{
  "type": "image",
  "attrs": {
    "storagePath": "forum-images/user123/thread456/img789.webp",
    "url": "https://...",
    "alt": "Box score screenshot"
  }
}
```

---

## 18. Search and Discovery

## 18.1 Initial Search

V1 can support basic search/filtering by:

- forum
- thread title prefix or keyword
- recent activity
- author username

## 18.2 Advanced Search Later

If full-text search becomes important, consider:

- Algolia
- Meilisearch
- Typesense

For now, Firestore alone is acceptable for a smaller community.

---

## 19. Auditing and Moderation Safety

Recommended protections:

- soft delete posts/threads
- keep moderation logs
- preserve edited history only if needed
- keep locked reason optionally visible internally
- prevent silent destructive moderation without trace

Optional:

- `postRevisions` subcollection for edit history
- `reports` collection for member-reported posts

---

## 20. Performance Considerations

## 20.1 Pagination

Do not load every post in long threads by default.

Use:

- first 20 or 50 posts
- load older/newer segments as needed

## 20.2 Denormalized Counts

Use Cloud Functions to maintain:

- thread reply count
- forum thread count
- forum post count
- latest activity metadata

This improves read performance and lowers query fan-out.

## 20.3 Renderer Safety

Rich text renderer should be:

- schema-aware
- component-based
- not `dangerouslySetInnerHTML` unless sanitized server-side

---

## 21. Suggested Implementation Phases

## Phase 1: Core Forum MVP

- Auth integration
- Forum landing page
- Forum/category pages
- Thread list
- Thread detail
- Basic rich text editor
- Create thread
- Create reply
- Lock/edit/delete moderation
- Notifications for mentions/replies
- Polls
- Game reference support

## Phase 2: Quality and Moderation

- soft delete/restore
- moderation logs
- pinned threads
- search/filter improvements
- improved quoting and mention UX
- role scoping by forum

## Phase 3: Media and Advanced Features

- image uploads
- featured threads
- thread tags
- post revision history
- reports / moderation queue
- subscription/watch thread feature

---

## 22. Risks and Tradeoffs

## 22.1 Firestore Query Constraints

Tradeoff:

- Firestore is not relational SQL
- some forum list logic requires denormalization and careful query design

Mitigation:

- maintain counters and latest activity through Cloud Functions
- split pinned vs normal thread queries if needed

## 22.2 Rich Text Complexity

Tradeoff:

- rich editors can grow complex fast

Mitigation:

- start with limited supported block set
- avoid arbitrary HTML
- use structured JSON nodes

## 22.3 Poll Integrity

Tradeoff:

- client-only vote handling is easy to abuse

Mitigation:

- route votes through transaction/callable function

## 22.4 Game Reference Coupling

Tradeoff:

- direct reliance on schedule APIs can introduce coupling

Mitigation:

- use lightweight snapshots and stable external IDs

---

## 23. Recommended Final Approach

### Recommended stack decisions

- **Editor**: TipTap or Lexical, storing structured JSON
- **Auth**: Firebase Auth
- **Roles**: Firebase custom claims + mirrored user profile
- **Database**: Firestore
- **Server logic**: Cloud Functions
- **Images**: defer to V2
- **Thread replies**: flat chronological posts with reply references
- **Quotes**: structured quote node
- **Mentions**: structured mention node + notifications
- **Polls**: one poll per thread, 1–10 options, stored with per-user vote docs
- **Game references**: structured attachment to thread/post using existing schedule IDs

### Why this approach fits

This design keeps the system:

- manageable for a small engineering team
- low-cost to operate
- extensible for league-specific workflows
- safer than raw HTML-driven forums
- aligned with the existing React/Firebase stack

---

## 24. Open Questions

Before implementation, these should be finalized:

1. Should **Admin** forum be visible only to admins, or readable by everyone and writable only by admins?
2. Should members be allowed to edit their own posts indefinitely or only for a time window?
3. Should moderators be scoped per sport, or global?
4. Should polls be allowed in every forum, or only selected ones?
5. Should game references be attachable to both threads and replies, or threads only in V1?
6. Do we want thread subscriptions / watched threads in MVP?
7. Should Offtopic / OnterriorIRL have looser moderation and richer embed support than sports forums?
8. Will forum content require markdown import/export compatibility?

---

## 25. Example Firestore Security Strategy (Conceptual)

```txt
forums:
  read allowed by visibility + auth role
  write limited to admins for forum metadata

threads:
  create allowed for authenticated users in permitted forums
  update own basic editable fields if unlocked and not moderated
  moderation fields restricted to mod/admin
  delete as soft-delete only for privileged roles

posts:
  create allowed for authenticated users in unlocked threads
  update own posts within editable rules
  mod/admin can soft-delete or edit
  quote/reply references must point to same thread or valid target

polls:
  create allowed during thread creation if forum permits
  updates restricted to creator/admin until first vote or close
  votes written only through trusted function path
```

---

## 26. Example TypeScript Interfaces

```ts
export type ForumRole = "member" | "moderator" | "admin" | "super_admin";

export interface ForumAuthor {
  uid: string;
  username: string;
  displayName: string;
}

export interface ForumThread {
  id: string;
  forumId: string;
  title: string;
  slug: string;
  author: ForumAuthor;
  firstPostId: string;
  threadType: "standard" | "poll" | "game_reference";
  pollId?: string | null;
  referencedGameId?: string | null;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  replyCount: number;
  participantCount: number;
  latestPostId?: string | null;
  latestActivityAt: unknown;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ForumPost {
  id: string;
  threadId: string;
  forumId: string;
  author: ForumAuthor;
  body: Record<string, unknown>;
  bodyText: string;
  quotedPostId?: string | null;
  replyToPostId?: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}
```

---

## 27. Conclusion

A Firebase-backed forum system is a strong fit for this community size and feature set. The forum model is more cost-effective and easier to moderate than building a chat-first system, while still supporting rich community discussion. By using structured rich text, Cloud Function-backed moderation and polls, and lightweight game reference integrations, the system can remain scalable, maintainable, and aligned with the existing React + TypeScript + Firebase ecosystem.

The recommended MVP should focus on:

- forums and subforums
- threads and replies
- role-based moderation
- rich text
- polls
- mentions/quotes
- game references

Image uploads should remain optional until the text-first forum experience is stable.
