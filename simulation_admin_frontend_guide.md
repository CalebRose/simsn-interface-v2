# Weekly Simulation & Season Control — Admin Frontend Guide

This document covers the admin-only endpoints and workflows the frontend admin panel needs to control the baseball simulation: running weekly games, advancing the season, managing league phases (offseason, free agency, draft, recruiting), and executing full-season runs.

All endpoints are under `/api/v1`. Game control endpoints are prefixed `/games/`.

---

## Table of Contents

1. [Concepts](#concepts)
2. [Timestamp / League State](#timestamp--league-state)
3. [Simulating Games](#simulating-games)
4. [Week Progression](#week-progression)
5. [Season Lifecycle](#season-lifecycle)
6. [Phase Control](#phase-control)
7. [Full-Season Automation](#full-season-automation)
8. [Task Monitoring](#task-monitoring)
9. [Admin UI Suggestion](#admin-ui-suggestion)
10. [Endpoint Reference](#endpoint-reference)
11. [Full Workflow: Season Lifecycle](#full-workflow-season-lifecycle)
12. [Error Messages Reference](#error-messages-reference)

---

## Concepts

### Simulation Architecture

The API does not simulate games itself — it builds **game payloads** (rosters, lineups, stamina, injuries, park factors) and sends them to a separate **game engine** (Rust). The engine returns results (box scores, stats, stamina costs, injuries) which the API processes and stores.

### Weeks and Subweeks

Each season week contains **4 subweeks** (a, b, c, d). Each subweek contains a set of games. Within a single `simulate-week` call, games are processed sequentially by subweek: a → b → c → d. This allows state changes (injuries, stamina drain, roster moves) to propagate between subweeks within the same week.

### Timestamp

The `Timestamp` table (single row) is the central source of truth for league state. It tracks the current season, week, which subweeks have been simulated, and which phase the league is in. Every state-changing operation updates the timestamp and broadcasts the change to all connected WebSocket clients.

### Phase State Machine

The league moves through distinct phases:

```
REGULAR_SEASON
  ↓  end-season
OFFSEASON
  ├─ start-free-agency → FREE_AGENCY
  │   ├─ advance-fa-round (repeatable)
  │   └─ end-free-agency → OFFSEASON
  ├─ start-draft → DRAFT
  │   └─ (draft endpoints handle completion)
  └─ set-phase (is_recruiting_locked=false) → RECRUITING
      └─ (recruiting endpoints handle completion)
OFFSEASON (all sub-phases completed)
  ↓  start-new-season
REGULAR_SEASON
```

Phase detection logic (in priority order):
1. If `IsOffSeason` is false → `REGULAR_SEASON`
2. If `IsFreeAgencyLocked` is false → `FREE_AGENCY`
3. If `IsDraftTime` is true → `DRAFT`
4. If `IsRecruitingLocked` is false → `RECRUITING`
5. Otherwise → `OFFSEASON`

---

## Timestamp / League State

Always load the current state before showing simulation controls.

### Loading State

```
GET /api/v1/games/timestamp
```

### Response

```json
{
  "Season": 2026,
  "SeasonId": 5,
  "Week": 12,
  "WeekId": 234,
  "IsOffSeason": false,
  "IsFreeAgencyLocked": true,
  "IsDraftTime": false,
  "IsRecruitingLocked": true,
  "FreeAgencyRound": 0,
  "RunGames": false,
  "GamesARan": false,
  "GamesBRan": false,
  "GamesCRan": false,
  "GamesDRan": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `Season` | int | Current season number (display year) |
| `SeasonId` | int | Internal league_year_id |
| `Week` | int | Current season week |
| `WeekId` | int | Internal week ID |
| `IsOffSeason` | bool | True if in offseason phase |
| `IsFreeAgencyLocked` | bool | True if FA window is closed |
| `IsDraftTime` | bool | True if draft phase is active |
| `IsRecruitingLocked` | bool | True if recruiting is locked |
| `FreeAgencyRound` | int | Current FA auction round (0 if FA not active) |
| `RunGames` | bool | True if simulation is currently in progress |
| `GamesARan` | bool | Subweek A completed for current week |
| `GamesBRan` | bool | Subweek B completed |
| `GamesCRan` | bool | Subweek C completed |
| `GamesDRan` | bool | Subweek D completed |

### Derived State for UI

```
Phase = IsOffSeason ? (
  !IsFreeAgencyLocked ? "FREE_AGENCY" :
  IsDraftTime ? "DRAFT" :
  !IsRecruitingLocked ? "RECRUITING" :
  "OFFSEASON"
) : "REGULAR_SEASON"

AllGamesRan = GamesARan && GamesBRan && GamesCRan && GamesDRan
WeekReady = !RunGames && !AllGamesRan
CanAdvance = !RunGames && AllGamesRan
```

### Button State Logic

| Condition | Simulate Week | Simulate Subweek | Advance Week | Reset Week |
|-----------|--------------|-------------------|-------------|------------|
| `RunGames = true` | Disabled (spinning) | Disabled (spinning) | Disabled | Disabled |
| `WeekReady` | Enabled | Enabled | Disabled | Disabled |
| `CanAdvance` | Disabled | Disabled | Enabled | Enabled |
| `IsOffSeason = true` | Hidden | Hidden | Hidden | Hidden |

---

## Simulating Games

### Simulate Full Week

Runs all 4 subweeks (a → b → c → d) for a given week. This is the primary simulation action.

```
POST /api/v1/games/simulate-week
```

```json
{
  "league_year_id": 5,
  "season_week": 12,
  "league_level": 9
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `league_year_id` | yes | Internal league year ID (from `SeasonId` in timestamp) |
| `season_week` | yes | Week number to simulate (from `Week` in timestamp) |
| `league_level` | no | Filter to specific level (9=MLB, 8=AAA, etc.). Omit for all levels. |

### Response (200)

```json
{
  "league_year_id": 5,
  "season_week": 12,
  "league_level": 9,
  "total_games": 47,
  "game_constants": { ... },
  "level_configs": { ... },
  "rules": { ... },
  "subweeks": {
    "a": [ ... ],
    "b": [ ... ],
    "c": [ ... ],
    "d": [ ... ]
  }
}
```

The response contains all game payloads and results. The admin panel does not need to parse or display the full payload — `total_games` is sufficient for a summary.

**During simulation:**
- `RunGames` becomes `true` (disable all buttons, show spinner)
- Each subweek flag flips to `true` as it completes: `GamesARan`, `GamesBRan`, etc.
- When all 4 subweeks finish, `RunGames` returns to `false`
- If the admin panel uses WebSocket, these updates arrive as broadcasts

### Simulate Single Subweek

Run one subweek at a time for more granular control.

```
POST /api/v1/games/simulate-subweek
```

```json
{
  "league_year_id": 5,
  "season_week": 12,
  "subweek": "a",
  "league_level": 9
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `league_year_id` | yes | |
| `season_week` | yes | |
| `subweek` | yes | One of `"a"`, `"b"`, `"c"`, `"d"` |
| `league_level` | no | Filter to specific level |

### Response (200)

```json
{
  "league_year_id": 5,
  "season_week": 12,
  "total_games": 12,
  "subweeks": {
    "a": [ ... ]
  }
}
```

Only the requested subweek is included in the response.

### Preview Week (GET — No Simulation)

Inspect game payloads without sending them to the engine. Useful for debugging.

```
GET /api/v1/games/simulate-week/5/12?league_level=9
```

Returns the same shape as the POST but does NOT execute games or update any state.

---

## Week Progression

### Advance to Next Week

After all 4 subweeks are complete, advance to the next week. This is a separate step from simulation.

```
POST /api/v1/games/advance-week
```

```json
{}
```

Or optionally:

```json
{ "season_id": 1 }
```

### Response (200)

```json
{
  "status": "ok",
  "message": "Advanced to next week"
}
```

### What Happens on Advance

1. `Week` increments by 1
2. All subweek flags reset to `false` (`GamesARan`, `GamesBRan`, `GamesCRan`, `GamesDRan`)
3. **Injury tick** runs: decrements injury weeks remaining, heals players whose injuries expired
4. `league_state.current_game_week_id` syncs to match
5. Broadcast to all WebSocket clients

After advancing, reload the timestamp to confirm the new state and enable simulation for the next week.

### Reset Week (Replay Current Week)

Reset subweek completion flags WITHOUT advancing. Use this to replay a week if simulation produced bad results.

```
POST /api/v1/games/reset-week
```

```json
{}
```

```json
{
  "status": "ok",
  "message": "Week games reset"
}
```

This sets all `Games*Ran` flags to `false` without changing the week number. The admin can then re-simulate the same week. Game results from the previous run are still in the database — this does not delete them.

**Warning:** Resimulating a week without clearing prior results will create duplicate game data. Use with caution; this is primarily for development/testing.

### Rollback to Previous Week

Move backward by one week. Resets subweek flags and decrements week.

```
POST /api/v1/games/rollback-week
```

```json
{}
```

### Rollback to Specific Week

Jump back to any prior week.

```
POST /api/v1/games/rollback-to-week
```

```json
{ "target_week": 5 }
```

**Warning:** Rollback does not delete game results from the skipped weeks. Use these for state corrections, not as an undo mechanism.

---

## Season Lifecycle

### End Regular Season

Transitions from regular season to offseason. Triggers end-of-season processing.

```
POST /api/v1/games/end-season
```

```json
{ "league_year_id": 5 }
```

### Response (200)

```json
{
  "phase_transition": "REGULAR_SEASON -> OFFSEASON",
  "waivers_resolved": { "resolved": 3, "expired": 1 },
  "end_of_season": {
    "service_time_updated": 450,
    "contracts_expired": 28,
    "fa_eligible": 15
  },
  "progression": {
    "players_progressed": 1200,
    "age_incremented": true
  },
  "timestamp_updated": true
}
```

### What Happens

1. **Waiver resolution**: All active waivers force-resolved (regardless of expiry)
2. **Contract processing**: Service time updated, expiring contracts marked, FA eligibility determined
3. **Player progression**: All players age +1, attributes adjusted by progression rules
4. **Timestamp flags**:
   - `IsOffSeason = true`
   - `IsFreeAgencyLocked = true`
   - `IsDraftTime = false`
   - `IsRecruitingLocked = true`
   - `FreeAgencyRound = 0`
   - All game flags reset

**Validation:** Can only be called during `REGULAR_SEASON` phase.

### Start New Season

Transitions from offseason back to regular season. Initializes financials for the new year.

```
POST /api/v1/games/start-new-season
```

```json
{ "league_year_id": 6 }
```

### Response (200)

```json
{
  "phase_transition": "OFFSEASON -> REGULAR_SEASON",
  "year_start_books": { "budgets_set": 30, "salary_caps_initialized": true },
  "new_season": 2027,
  "timestamp_updated": true
}
```

### What Happens

1. **Financial books**: Year-start accounting runs (salary caps, budgets reset)
2. **Timestamp reset**:
   - `Season` = new season number
   - `SeasonId` = league_year_id
   - `Week = 1`
   - `IsOffSeason = false`
   - All phase flags reset
   - All game flags reset
3. **League state synced** to new league year

**Validation:** Can only be called during `OFFSEASON` phase (all sub-phases must be completed first — FA closed, draft done, recruiting done).

---

## Phase Control

### Set Phase Flags Directly

Admin tool to manually toggle phase flags. Use when the normal lifecycle endpoints don't fit (e.g., enabling recruiting independently).

```
POST /api/v1/games/set-phase
```

```json
{
  "is_offseason": true,
  "is_free_agency_locked": false,
  "is_draft_time": false,
  "is_recruiting_locked": true,
  "free_agency_round": 1
}
```

All fields are optional — only non-null fields are updated. At least one field must be provided.

### Response (200)

Returns the full updated timestamp (same shape as `GET /games/timestamp`).

### Dedicated Phase Endpoints

These are convenience wrappers around `set-phase` with built-in validation:

| Endpoint | Method | Effect | Valid From |
|----------|--------|--------|-----------|
| `/games/start-free-agency` | POST | `IsFreeAgencyLocked=false`, `FreeAgencyRound=1` | OFFSEASON or FREE_AGENCY |
| `/games/advance-fa-round` | POST | `FreeAgencyRound += 1` | FREE_AGENCY |
| `/games/end-free-agency` | POST | `IsFreeAgencyLocked=true` | FREE_AGENCY |
| `/games/start-draft` | POST | `IsDraftTime=true` | OFFSEASON |
| `/games/end-draft` | POST | `IsDraftTime=false` | DRAFT |
| `/games/start-recruiting` | POST | `IsRecruitingLocked=false` | OFFSEASON |
| `/games/end-recruiting` | POST | `IsRecruitingLocked=true` | RECRUITING |

All take no request body and return the updated timestamp.

### Phase Transition Rules

| Current Phase | Allowed Transitions |
|--------------|-------------------|
| REGULAR_SEASON | end-season → OFFSEASON |
| OFFSEASON | start-free-agency, start-draft, unlock recruiting, start-new-season |
| FREE_AGENCY | advance-fa-round, end-free-agency → OFFSEASON |
| DRAFT | (draft completion) → OFFSEASON |
| RECRUITING | (recruiting completion) → OFFSEASON |

---

## Full-Season Automation

For running an entire season (or range of weeks) without manual week-by-week control.

### Run Season (Single Level)

Simulate one league level across a range of weeks as a background task.

```
POST /api/v1/games/run-season
```

```json
{
  "league_year_id": 5,
  "league_level": 9,
  "start_week": 1,
  "end_week": 52
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `league_year_id` | yes | — | |
| `league_level` | yes | — | Which level to simulate |
| `start_week` | no | 1 | First week to simulate |
| `end_week` | no | 52 | Last week to simulate |

### Response (202 — Task Created)

```json
{
  "task_id": "abc12345",
  "status": "pending",
  "total": 52,
  "poll_url": "/api/v1/games/tasks/abc12345"
}
```

### Run Season All Levels

Simulate ALL league levels with full weekly post-processing (injuries, finances, waivers, FA auctions).

```
POST /api/v1/games/run-season-all
```

```json
{
  "league_year_id": 5,
  "start_week": 1,
  "end_week": 52
}
```

### Response (202 — Task Created)

Same shape as `run-season`. The background task handles:
1. For each week: simulate all levels in parallel
2. After each week's games: run injury tick, weekly books, waiver processing, FA auction advancement, roster refresh
3. Advance to next week

---

## Task Monitoring

Background tasks (run-season, run-season-all) are tracked by task ID.

### Poll Task Status

```
GET /api/v1/games/tasks/{task_id}
```

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `include_result` | no | false | Include full result payload (WARNING: very large) |

### Response (Running)

```json
{
  "task_id": "abc12345",
  "status": "running",
  "progress": 25,
  "total": 52,
  "metadata": {
    "league_year_id": 5,
    "league_level": 9,
    "start_week": 1,
    "end_week": 52
  }
}
```

### Response (Complete)

```json
{
  "task_id": "abc12345",
  "status": "complete",
  "progress": 52,
  "total": 52,
  "result": null,
  "download_url": "/api/v1/games/tasks/abc12345/download"
}
```

### Response (Failed)

```json
{
  "task_id": "abc12345",
  "status": "failed",
  "error": "No games found for week 38, level 9"
}
```

### Download Full Result

```
GET /api/v1/games/tasks/{task_id}/download?compressed=false
```

Streams the full result as a JSON file download. Use `compressed=true` for gzipped output.

### UI for Task Monitoring

```
┌────────────────────────────────────────────┐
│  Running: Season Simulation                 │
│                                             │
│  Week 25 of 52                              │
│  ████████████████░░░░░░░░░░░░░  48%         │
│                                             │
│  Level: All                                 │
│  Started: 2:34 PM                           │
│                                             │
│  [Cancel]                                   │
└────────────────────────────────────────────┘
```

Poll every 3-5 seconds while status is `"pending"` or `"running"`. Stop polling when status is `"complete"` or `"failed"`.

---

## Admin UI Suggestion

Add a "Simulation Control" section to the admin panel:

```
┌──────────────────────────────────────────────────────────────┐
│  Simulation Control                                           │
│                                                               │
│  Season 2026  ·  Week 12  ·  Phase: REGULAR SEASON            │
│                                                               │
│  Subweeks:  [A ✓]  [B ✓]  [C ○]  [D ○]                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Week Actions                                        │     │
│  │  [▶ Simulate Week 12]  [▶ Simulate Subweek ▾]       │     │
│  │  [→ Advance to Week 13]  [↺ Reset Week]              │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Season Actions                                      │     │
│  │  [▶ Run Full Season]  [▶ Run Single Level ▾]         │     │
│  │                                                      │     │
│  │  League Level: [All ▾]                               │     │
│  │  Week Range:   [1] to [52]                           │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Phase Control                                       │     │
│  │  Current: REGULAR_SEASON                             │     │
│  │                                                      │     │
│  │  [End Regular Season]                                │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Offseason Controls (hidden during regular season)   │     │
│  │  [Start Free Agency]  [Start Draft]                  │     │
│  │  [Unlock Recruiting]  [Start New Season]             │     │
│  └──────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### Subweek Indicators

| State | Display |
|-------|---------|
| Not run | `○` (empty circle, gray) |
| Complete | `✓` (checkmark, green) |
| Running | Spinner animation |

### Phase Badge Colors

| Phase | Color |
|-------|-------|
| REGULAR_SEASON | Green |
| OFFSEASON | Gray |
| FREE_AGENCY | Blue |
| DRAFT | Purple |
| RECRUITING | Orange |

### Button Visibility by Phase

| Button | REGULAR_SEASON | OFFSEASON | FREE_AGENCY | DRAFT |
|--------|---------------|-----------|-------------|-------|
| Simulate Week | ✓ | — | — | — |
| Advance Week | ✓ | — | — | — |
| Run Full Season | ✓ | — | — | — |
| End Season | ✓ | — | — | — |
| Start Free Agency | — | ✓ | — | — |
| Advance FA Round | — | — | ✓ | — |
| End Free Agency | — | — | ✓ | — |
| Start Draft | — | ✓ | — | — |
| Unlock Recruiting | — | ✓ | — | — |
| Start New Season | — | ✓ | — | — |

---

## Endpoint Reference

### Game Simulation

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/games/timestamp` | Any | Current league state |
| GET | `/games/simulate-week/{ly_id}/{week}` | Admin | Preview payloads (no execution) |
| POST | `/games/simulate-week` | Admin | Simulate full week (4 subweeks) |
| POST | `/games/simulate-subweek` | Admin | Simulate single subweek |
| POST | `/games/advance-week` | Admin | Advance to next week |
| POST | `/games/reset-week` | Admin | Reset subweek flags |
| POST | `/games/rollback-week` | Admin | Go back one week |
| POST | `/games/rollback-to-week` | Admin | Go back to specific week |

### Season Lifecycle

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/games/end-season` | Admin | End regular season → offseason |
| POST | `/games/start-new-season` | Admin | Start new season from offseason |

### Phase Control

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/games/set-phase` | Admin | Directly set phase flags |
| POST | `/games/start-free-agency` | Admin | Open FA window |
| POST | `/games/advance-fa-round` | Admin | Increment FA round |
| POST | `/games/end-free-agency` | Admin | Close FA window |
| POST | `/games/start-draft` | Admin | Open draft phase |
| POST | `/games/end-draft` | Admin | Close draft phase |
| POST | `/games/start-recruiting` | Admin | Unlock recruiting |
| POST | `/games/end-recruiting` | Admin | Lock recruiting |

### Automation

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/games/run-season` | Admin | Background: simulate single level |
| POST | `/games/run-season-all` | Admin | Background: simulate all levels |
| GET | `/games/tasks/{task_id}` | Admin | Poll background task status |
| GET | `/games/tasks/{task_id}/download` | Admin | Download task results |

All POST endpoints return `400` with `{"error": "..."}` on validation failure.

---

## Full Workflow: Season Lifecycle

### Regular Season (Week-by-Week)

```
1. Load timestamp → GET /games/timestamp
2. Simulate week  → POST /games/simulate-week
   (wait for RunGames to return false)
3. Review results  → check standings, box scores
4. Advance week   → POST /games/advance-week
5. Reload timestamp
6. Repeat 2-5 until season ends
7. End season     → POST /games/end-season
```

### Offseason Sequence

The admin can run offseason phases in any order, but a typical sequence is:

```
1. End regular season  → POST /games/end-season
2. Run playoffs        → (via playoff admin endpoints)
3. Open free agency    → POST /games/start-free-agency
4. Run FA rounds       → POST /games/advance-fa-round (repeat)
5. Close free agency   → POST /games/end-free-agency
6. Start draft         → POST /games/start-draft
7. Run draft           → (via draft admin endpoints)
8. End draft           → POST /games/end-draft
9. Unlock recruiting   → POST /games/start-recruiting
10. Run recruiting     → POST /recruiting/advance-week (repeat)
11. Lock recruiting    → POST /games/end-recruiting
12. Start new season   → POST /games/start-new-season
```

### Full-Season Automation

```
1. Ensure schedule exists for the league year
2. Start full run   → POST /games/run-season-all
3. Monitor progress → GET /games/tasks/{task_id} (poll)
4. When complete, end season manually → POST /games/end-season
5. Run offseason phases manually
```

---

## Error Messages Reference

| Error | Cause | Resolution |
|-------|-------|------------|
| `"league_year_id is required"` | Missing field | Include in request body |
| `"season_week is required"` | Missing field | Include in request body |
| `"Invalid subweek: x"` | Bad subweek value | Use one of: a, b, c, d |
| `"No games found for week X, level Y"` | No schedule for this week/level | Check schedule exists; verify week number |
| `"Not in REGULAR_SEASON phase"` | Called end-season outside regular season | Check current phase |
| `"Not in OFFSEASON phase"` | Called start-new-season outside offseason | Complete all sub-phases first |
| `"Not in FREE_AGENCY phase"` | Called advance-fa-round outside FA | Start free agency first |
| `"No fields provided"` | set-phase called with empty body | Provide at least one flag |
