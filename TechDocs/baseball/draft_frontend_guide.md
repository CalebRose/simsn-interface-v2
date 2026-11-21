# Draft System — Frontend Implementation Guide

This guide covers the API contracts, WebSocket events, and UI requirements for building the draft page. The backend is complete — this document describes what the frontend needs to consume.

---

## API Base

All endpoints are under `/api/v1`. Use the same fetch pattern as the rest of the admin panel:

```js
const API = '/api/v1';

async function draftApi(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts,
  });
  return res.json();
}

// GET helper
const draftGet = (path) => draftApi(path);

// POST helper
const draftPost = (path, body) =>
  draftApi(path, { method: 'POST', body: JSON.stringify(body) });
```

---

## 1. Draft Lifecycle (Admin Controls)

The draft moves through phases: **SETUP → IN_PROGRESS ↔ PAUSED → SIGNING → COMPLETE**

### 1a. Initialize Draft

```
POST /draft/admin/initialize
```

**Request:**
```json
{
  "league_year_id": 5,
  "total_rounds": 20,
  "seconds_per_pick": 60,
  "is_snake": false,
  "live_rounds": [1, 2, 3]
}
```

- `live_rounds` — array of round numbers that use live timers. All other rounds become auto-draft rounds. Default: `[1, 2, 3]`.
- `total_rounds` — default 20
- `seconds_per_pick` — timer per pick in live rounds, default 60

**Response:**
```json
{
  "league_year_id": 5,
  "total_rounds": 20,
  "picks_per_round": 30,
  "total_picks": 600,
  "eligible_players": 4200,
  "draft_order": [12, 7, 23, ...],
  "live_rounds": [1, 2, 3]
}
```

### 1b. Configure Round Modes (SETUP only)

Can override round modes after initialization but before starting.

```
POST /draft/admin/round-modes
```

**Request:**
```json
{
  "league_year_id": 5,
  "round_modes": {
    "1": "live",
    "2": "live",
    "3": "live",
    "4": "auto",
    "5": "auto"
  }
}
```

Only rounds you include are updated — omitted rounds keep their current mode.

### 1c. Start / Pause / Resume

```
POST /draft/admin/start       { "league_year_id": 5 }
POST /draft/admin/pause       { "league_year_id": 5 }
POST /draft/admin/resume      { "league_year_id": 5 }
POST /draft/admin/reset-timer { "league_year_id": 5 }
```

All return the current draft state (see section 2).

### 1d. Run Auto Rounds

After the last live round completes, the draft pauses with no timer. Admin triggers auto rounds:

```
POST /draft/admin/run-auto-rounds
```

**Request:**
```json
{ "league_year_id": 5 }
```

**Response:**
```json
{
  "picks_made": 510,
  "picks": [
    {
      "pick_id": 91,
      "round": 4,
      "pick_in_round": 1,
      "overall_pick": 91,
      "org_id": 12,
      "player_id": 4501,
      "player_name": "John Smith",
      "is_auto_pick": true,
      "draft_complete": false,
      "auto_round_next": true
    },
    ...
  ]
}
```

This is a synchronous call — it will take a few seconds to process all ~510 picks. Show a loading spinner.

### 1e. Advance to Signing / Export / Complete

```
POST /draft/admin/advance-signing  { "league_year_id": 5 }
POST /draft/admin/export           { "league_year_id": 5 }
POST /draft/admin/complete         { "league_year_id": 5 }
```

---

## 2. Draft State (Poll or WebSocket)

```
GET /draft/state?league_year_id=5
```

**Response:**
```json
{
  "league_year_id": 5,
  "phase": "IN_PROGRESS",
  "current_round": 2,
  "current_pick": 15,
  "total_rounds": 20,
  "picks_per_round": 30,
  "seconds_per_pick": 60,
  "is_snake": false,
  "pick_deadline_at": "2026-04-08T14:30:00",
  "seconds_remaining": 42,
  "current_round_mode": "live",
  "auto_rounds_locked": false
}
```

**Key fields for UI:**
- `phase` — drives which controls to show (see Phase UI Map below)
- `current_round` / `current_pick` — highlight the active slot on the board
- `seconds_remaining` — countdown timer (null when paused or in auto round)
- `current_round_mode` — `"live"` or `"auto"` — if auto and phase is IN_PROGRESS with no deadline, admin must trigger auto rounds
- `auto_rounds_locked` — true after auto rounds have started; preferences can no longer be edited

### Phase UI Map

| Phase | Timer | User Can Pick | Admin Actions | Prefs Editable |
|---|---|---|---|---|
| `SETUP` | Hidden | No | Initialize, Set Round Modes | Yes |
| `IN_PROGRESS` (live round) | Countdown | Yes (current org) | Pause, Reset Timer | Yes |
| `IN_PROGRESS` (auto round, pre-trigger) | Hidden | No | Run Auto Rounds | No (locked) |
| `PAUSED` | Frozen | No | Resume | Yes (if not locked) |
| `SIGNING` | Hidden | No (sign/pass) | Advance Signing, Export | N/A |
| `COMPLETE` | Hidden | No | N/A | N/A |

---

## 3. Round Modes

```
GET /draft/round-modes?league_year_id=5
```

**Response:**
```json
{
  "rounds": [
    { "round": 1, "mode": "live" },
    { "round": 2, "mode": "live" },
    { "round": 3, "mode": "live" },
    { "round": 4, "mode": "auto" },
    ...
    { "round": 20, "mode": "auto" }
  ]
}
```

Use this to render a round indicator strip showing which rounds are live vs auto.

---

## 4. Draft Board

```
GET /draft/board?league_year_id=5
```

**Response:**
```json
{
  "picks": [
    {
      "pick_id": 1,
      "round": 1,
      "pick_in_round": 1,
      "overall_pick": 1,
      "original_org_id": 12,
      "current_org_id": 12,
      "player_id": null,
      "player_name": null,
      "picked_at": null,
      "is_auto_pick": false,
      "slot_value": 5000000.0,
      "sign_status": "pending"
    },
    {
      "pick_id": 2,
      "round": 1,
      "pick_in_round": 2,
      "overall_pick": 2,
      "original_org_id": 7,
      "current_org_id": 7,
      "player_id": 3200,
      "player_name": "Mike Johnson",
      "picked_at": "2026-04-08T14:25:30",
      "is_auto_pick": false,
      "slot_value": 5000000.0,
      "sign_status": "signed"
    },
    ...
  ]
}
```

600 entries total (20 rounds x 30 teams). Render as a grid/table grouped by round.

- `player_id == null` → empty slot (not yet picked)
- `current_org_id != original_org_id` → pick was traded
- `is_auto_pick == true` → auto-drafted (timer expired, auto-round, or CPU-controlled org)
- `sign_status` — `"pending"` | `"signed"` | `"passed"` | `"refused"` (refused = the org's offers were turned down; the player went back to school)
- `class_year` — `"hs_senior"` | `"freshman"` | `"sophomore"` | `"junior"` | `"senior"` (college class *after* the season just played)
- `offers_made` / `bonus_agreed` — negotiation state (see §9). The board never shows the player's ask; only the drafting org sees it in §8.
- `picked_at` and `pick_deadline_at` are ISO-8601 UTC with a trailing `Z`.

---

## 5. Eligible Players

```
GET /draft/eligible?league_year_id=5&available_only=true&limit=50&offset=0
```

**Optional query params:**
- `source` — `"college"` or `"hs"` to filter
- `search` — name search string
- `available_only` — `"true"` (default) to hide already-drafted players
- `viewing_org_id` — applies fog-of-war attribute visibility for that org (optional; without it the public fog view is served)
- `limit` / `offset` — pagination

**Who is eligible.** HS seniors who just graduated (`source: "hs"`, `class_year: "hs_senior"`) and **every** college player, freshman through redshirt senior (`source: "college"`). Nobody declares. `draft_rank` is the consensus rank (1 = best) over the whole pool, computed once when end-season builds the pool; it is public even though individual ratings are fogged.

**Response:**
```json
{
  "players": [
    {
      "player_id": 3200,
      "first_name": "Mike",
      "last_name": "Johnson",
      "age": 21,
      "source": "college",
      "draft_rank": 1,
      "composite_score": 87.5,
      "star_rating": 5,
      "pitcher_role": null,
      "bio": { ... },
      "attributes": { ... },
      "potentials": { ... },
      "letter_grades": { ... }
    },
    ...
  ],
  "total": 4200,
  "limit": 50,
  "offset": 0
}
```

Each player object includes full `bio`, `attributes`, `potentials`, and `letter_grades` dicts from the player display system (same shape used across scouting/recruiting).

---

## 6. Making a Pick (Live Rounds)

```
POST /draft/pick
```

**Request:**
```json
{
  "league_year_id": 5,
  "org_id": 12,
  "player_id": 3200
}
```

**Response:**
```json
{
  "pick_id": 15,
  "round": 1,
  "pick_in_round": 15,
  "overall_pick": 15,
  "org_id": 12,
  "player_id": 3200,
  "player_name": "Mike Johnson",
  "is_auto_pick": false,
  "draft_complete": false,
  "auto_round_next": false
}
```

**Validation errors (400):**
```json
{ "error": "validation", "message": "It is not org 12's turn. Current pick belongs to org 7" }
{ "error": "validation", "message": "Player 3200 has already been drafted" }
{ "error": "validation", "message": "Player 9999 is not draft-eligible" }
```

**`auto_round_next: true`** — means the next pick is in an auto round. The frontend should show a message like "Live rounds complete. Admin must trigger auto rounds to continue."

---

## 7. Team Auto-Draft Preferences

### 7a. Get Preferences

```
GET /draft/prefs/12?league_year_id=5
```

**Response:**
```json
{
  "org_id": 12,
  "pitcher_quota": 8,
  "hitter_quota": 9,
  "locked": false,
  "queue": [
    { "player_id": 3200, "priority": 1 },
    { "player_id": 3455, "priority": 2 },
    { "player_id": 3102, "priority": 3 }
  ]
}
```

### 7b. Set Preferences

```
POST /draft/prefs
```

**Request (all fields optional except league_year_id and org_id):**
```json
{
  "league_year_id": 5,
  "org_id": 12,
  "pitcher_quota": 8,
  "hitter_quota": 9,
  "queue": [3200, 3455, 3102, 2980, 3601]
}
```

- `pitcher_quota` / `hitter_quota` — target number of pitchers/hitters to draft in auto rounds. These are targets, not hard caps — once both quotas are filled, remaining picks fall back to best player available (BPA).
- `queue` — ordered array of player_ids. Highest priority first. During auto-rounds, the system picks the first available player from this list before applying quota logic. Queue can include players from the eligible list.
- Send only the fields you want to update. Omitted fields keep their current value.
- Quotas and queue are **independent** — you can set one, the other, or both.

**Error if locked:**
```json
{ "error": "validation", "message": "Auto-draft preferences are locked — auto rounds have begun" }
```

**Error if invalid players:**
```json
{ "error": "validation", "message": "Players not draft-eligible: [9999, 8888]" }
```

### Auto-Pick Priority Order

When the system auto-picks for a team (timer expiry in live rounds OR auto rounds), it uses this logic:

1. **Queue** — pick the highest-priority available player from the team's queue
2. **Quota** — if queue is empty/exhausted, pick BPA within the position type (pitcher or hitter) that still has unfilled quota. If both need players, the type with more remaining need gets priority.
3. **BPA** — if both quota targets are met or no prefs set, pick the best available player overall by draft rank

Teams with **no preferences set** get pure BPA (backward-compatible with original behavior).

---

## 8. Org Picks

```
GET /draft/picks/12?league_year_id=5
```

Returns a **bare array** of the picks owned by org 12 (board shape plus the org-private negotiation fields):

```json
[
  {
    "pick_id": 15, "round": 1, "pick_in_round": 12, "overall_pick": 12,
    "original_org_id": 12, "current_org_id": 12,
    "player_id": 3200, "player_name": "Mike Johnson",
    "picked_at": "2026-04-08T14:25:30Z", "is_auto_pick": false,
    "slot_value": 5000000.0,
    "sign_status": "pending",
    "ask_bonus": 6175000.0,
    "class_year": "junior",
    "offers_made": 1,
    "offers_remaining": 2,
    "offers": [ { "offer_no": 1, "amount": 4000000.0, "result": "rejected", "created_at": "..." } ],
    "bonus_agreed": null,
    "contract_id": null
  }
]
```

`ask_bonus` is what the player wants; it is only returned here (the public board omits it).

---

## 9. Signing Phase (bonus negotiation)

After all rounds complete (or admin advances to signing), every drafted player has a **bonus ask**:

```
ask = slot_value × class_mult × talent_mult
class_mult: senior 1.00 · HS senior 1.10 · junior 1.15 · sophomore 1.35 · freshman 1.60
talent_mult: 1.30 for consensus #1 … 0.90 for the last-ranked player
```

The drafting org gets **up to three offers** per pick. Each offer is answered immediately: an offer at or above the ask is always accepted; below it the acceptance chance is `clamp((offer/ask − 0.6) / 0.4, 0, 1) × willingness`, with willingness 1.0 for seniors and HS seniors, 0.6 juniors, 0.35 sophomores, 0.2 freshmen (underclassmen would rather go back to school). The answer is deterministic per pick and offer number, so a retried request gives the same result. A rejected third offer **refuses** the player: `sign_status` becomes `"refused"`, the pick is spent and he keeps his amateur contract.

### Make an Offer

```
POST /draft/sign/15
```

**Request:**
```json
{ "league_year_id": 5, "bonus": 5500000 }
```

`bonus` defaults to the slot value when omitted. The bonus must fit the org's signing budget (400 `validation` otherwise).

**Response — accepted (200):**
```json
{
  "accepted": true, "status": "signed",
  "draft_pick_id": 15, "player_id": 3200, "player_name": "Mike Johnson", "org_id": 12,
  "slot_value": 5000000.0, "ask_bonus": 6175000.0, "class_year": "junior",
  "offer_no": 2, "offer": 5500000.0, "accept_probability": 0.6,
  "transaction_id": 42, "contract_id": 1205, "bonus": 5500000.0, "years": 3, "level": 5,
  "offers_remaining": 0
}
```

**Response — rejected (still 200):**
```json
{
  "accepted": false, "status": "pending",
  "offer_no": 1, "offer": 4000000.0, "accept_probability": 0.05,
  "offers_remaining": 2, "...": "same identity fields as above"
}
```

`status` is `"refused"` on the third rejection. A 400 is returned for a pick that is no longer `pending`, has no offers left, or an offer over budget.

**The contract on acceptance:** 3 years at the minor-league salary, bonus = the agreed amount (debited from the org's ledger immediately and counted against the signing budget), HS draftees at level 4, college draftees at level 5. The player's HS/college contract is ended.

**When the admin completes the draft** every still-pending pick is resolved: orgs with no owner/GM sign at the ask; otherwise `refused` if offers were made, `passed` if none were. Unsigned HS graduates without a college commitment are placed at random on a program that still has roster room, or retire when none has; undrafted college seniors stay in the system as free agents only when good enough, otherwise they retire; college underclassmen simply stay on their college contracts.

### Pass on a Pick

```
POST /draft/pass/15
```

**Response:**
```json
{ "draft_pick_id": 15, "status": "passed" }
```

---

## 10. Pick Trading

### Proposals (org-to-org)

```
POST /draft/trade/propose
{ "league_year_id": 5, "proposing_org_id": 12, "receiving_org_id": 7,
  "picks_offered": [45], "picks_requested": [61, 92] }
→ { "success": true, "proposal_id": 3 }

GET  /draft/trade/proposals?league_year_id=5&org_id=7[&status=proposed]
→ [ { "proposal_id": 3, "proposing_org_id": 12, "proposing_org_abbrev": "NYY",
      "receiving_org_id": 7, "receiving_org_abbrev": "BOS",
      "picks_offered":  [ { "pick_id": 45, "round": 2, "pick_in_round": 12, "overall_pick": 42, "current_org_id": 12, "used": false } ],
      "picks_requested": [ ... ],
      "status": "proposed", "created_at": "...Z", "resolved_at": null } ]

POST /draft/trade/accept  { "proposal_id": 3, "org_id": 7 }   → executes the swap
POST /draft/trade/reject  { "proposal_id": 3, "org_id": 7 }   → status "rejected" (the proposer calling it → "cancelled")
```

Only unused picks owned by the right side can be offered/requested; ownership is re-checked at acceptance, and other open proposals touching the traded picks are cancelled. WebSocket events: `draft_trade_proposed`, `draft_trade_completed` (one per pick moved), `draft_trade_rejected`.

### Direct swap (admin / trusted)

```
POST /draft/trade
{ "league_year_id": 5, "pick_id": 45, "from_org_id": 12, "to_org_id": 7, "trade_proposal_id": null }
```

Only works on unpicked slots.

---

## 11. WebSocket Events

Connect to `ws://<host>/ws` for real-time updates. All messages are JSON with a `type` field.

### `draft_state_change`
Fires on: start, pause, resume, advance-signing, complete
```json
{
  "type": "draft_state_change",
  "phase": "IN_PROGRESS",
  "current_round": 2,
  "current_pick": 1
}
```

### `draft_pick_made`
Fires on: every pick (manual or auto)
```json
{
  "type": "draft_pick_made",
  "pick_id": 15,
  "round": 1,
  "pick_in_round": 15,
  "overall_pick": 15,
  "org_id": 12,
  "player_id": 3200,
  "player_name": "Mike Johnson",
  "is_auto_pick": false,
  "draft_complete": false,
  "auto_round_next": false
}
```

### `draft_trade_completed`
```json
{
  "type": "draft_trade_completed",
  "round": 3,
  "pick_in_round": 10,
  "from_org_id": 12,
  "to_org_id": 7
}
```

### `auto_rounds_started`
```json
{
  "type": "auto_rounds_started",
  "league_year_id": 5,
  "starting_round": 4
}
```

### `auto_rounds_completed`
```json
{
  "type": "auto_rounds_completed",
  "league_year_id": 5,
  "picks_made": 510
}
```

### WebSocket Connection Example

```js
let ws;

function connectDraftWs() {
  ws = new WebSocket(`ws://${location.host}/ws`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
      case 'draft_pick_made':
        handlePickMade(msg);
        break;
      case 'draft_state_change':
        refreshDraftState();
        break;
      case 'draft_trade_completed':
        refreshDraftBoard();
        break;
      case 'auto_rounds_started':
        showAutoRoundsSpinner();
        break;
      case 'auto_rounds_completed':
        hideAutoRoundsSpinner();
        refreshDraftBoard();
        break;
    }
  };

  ws.onclose = () => setTimeout(connectDraftWs, 3000);
}
```

---

## 12. Suggested UI Sections

### A. Draft Header / Status Bar
- Current phase badge (color-coded)
- Round indicator strip showing live (blue) vs auto (gray) rounds, current round highlighted
- Countdown timer (live rounds only)
- "On the clock: [Team Name]" display

### B. Draft Board (main view)
- Grid grouped by round — each row is a round, each cell is a pick
- Empty picks show org logo/abbrev
- Filled picks show player name + position
- Highlight current pick, traded picks (different border/icon)
- Color-code by `sign_status` during SIGNING phase

### C. Eligible Players Panel (side panel or tab)
- Searchable, filterable list (source: college/hs, name search)
- Show draft_rank, star_rating, name, age, position
- "Draft" button on each row (enabled only when it's the viewing org's turn)
- Pagination via limit/offset

### D. Team Preferences Panel (tab or modal)
- **Quotas**: Two number inputs — "Pitchers to draft" and "Hitters to draft"
- **Queue**: Drag-and-drop sortable list of players
  - "Add to Queue" button on eligible player rows
  - Reorder via drag handles
  - Remove button on each entry
- Save button calls `POST /draft/prefs`
- Show "Locked" badge when `auto_rounds_locked == true`; disable all inputs

### E. My Picks (tab)
- List of all picks owned by the viewing org (from `GET /draft/picks/<org_id>`)
- Show round, pick#, player (if picked), slot value, sign status
- During SIGNING phase: "Sign" and "Pass" buttons on each pending pick

### F. Admin Controls (admin-only panel)
- Phase transitions: Initialize, Start, Pause, Resume
- Round mode editor (checkboxes: live/auto per round) — SETUP phase only
- "Run Auto Rounds" button — visible when `current_round_mode == "auto"` and phase is `IN_PROGRESS`
- Advance to Signing, Export, Complete buttons
- Reset Timer, Set Pick, Remove Pick for overrides

---

## 13. Timer Implementation

```js
let timerInterval;

function startTimer(secondsRemaining, deadlineIso) {
  clearInterval(timerInterval);

  // Use server deadline for accuracy (avoids client clock drift)
  const deadline = new Date(deadlineIso);

  timerInterval = setInterval(() => {
    const now = new Date();
    const remaining = Math.max(0, Math.floor((deadline - now) / 1000));

    renderTimer(remaining);

    if (remaining <= 0) {
      clearInterval(timerInterval);
      // Don't auto-pick client-side — server handles it.
      // Just refresh state after a short delay.
      setTimeout(refreshDraftState, 2000);
    }
  }, 1000);
}
```

Use `pick_deadline_at` from draft state (ISO string) rather than `seconds_remaining` for the countdown source — it's more reliable across network latency.

---

## 14. Typical Page Load Sequence

```js
async function loadDraftPage(leagueYearId) {
  // Parallel fetch of initial data
  const [state, board, modes] = await Promise.all([
    draftGet(`/draft/state?league_year_id=${leagueYearId}`),
    draftGet(`/draft/board?league_year_id=${leagueYearId}`),
    draftGet(`/draft/round-modes?league_year_id=${leagueYearId}`),
  ]);

  renderRoundStrip(modes.rounds);
  renderDraftBoard(board.picks, state);
  renderPhaseControls(state);

  if (state.phase === 'IN_PROGRESS' && state.seconds_remaining) {
    startTimer(state.seconds_remaining, state.pick_deadline_at);
  }

  // Load eligible players for the side panel
  const eligible = await draftGet(
    `/draft/eligible?league_year_id=${leagueYearId}&limit=50`
  );
  renderEligiblePlayers(eligible.players, eligible.total);

  // Connect WebSocket for real-time updates
  connectDraftWs();
}
```
