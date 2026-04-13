# College Recruiting — Admin Frontend Guide

This document covers the admin-only endpoints and workflows the frontend admin panel needs to control the college recruiting period: advancing weeks, monitoring recruiting activity, resetting state, and viewing reports.

The user-facing recruiting guide (player rankings, investing points, boards, commitments) is in `recruiting_frontend_guide.md`. This guide focuses exclusively on the **admin control panel**.

All endpoints are under `/api/v1`. All recruiting endpoints are prefixed `/recruiting/`.

---

## Table of Contents

1. [Concepts](#concepts)
2. [Recruiting State](#recruiting-state)
3. [Admin: Advance Week](#admin-advance-week)
4. [Admin: Reports](#admin-reports)
5. [Admin: Reset & Wipe Controls](#admin-reset--wipe-controls)
6. [Admin: Rankings Management](#admin-rankings-management)
7. [Admin UI Suggestion](#admin-ui-suggestion)
8. [Endpoint Reference](#endpoint-reference)
9. [Full Workflow: Admin Recruiting Lifecycle](#full-workflow-admin-recruiting-lifecycle)
10. [Error Messages Reference](#error-messages-reference)

---

## Concepts

### Admin Role

The admin controls the recruiting timeline. Recruiting weeks do **not** advance automatically with game simulation — each week must be explicitly advanced via `POST /recruiting/advance-week`. This gives the admin full control over pacing.

### Recruiting Lifecycle (Admin View)

```
Week 0 (pending)
  ↓  Admin calls advance-week
Week 1 (active) — Rankings computed, orgs can invest
  ↓  Admin calls advance-week each week
Weeks 2-19 — Commitments resolve, orgs continue investing
  ↓  Admin calls advance-week
Week 20 — Final cleanup: all remaining players assigned to point leader
  ↓  Status becomes 'complete'
Done — No more advances possible
```

### What Happens Each Week

When the admin advances a week:

| Transition | What Happens |
|-----------|-------------|
| Week 0 → 1 | Star rankings computed for all HS players. Status changes to `"active"`. |
| Week N → N+1 (1-19) | Commitment lottery runs for week N. Players meeting threshold go to weighted lottery winner. |
| Week 19 → 20 | Normal resolution + cleanup: all remaining uncommitted players assigned to org with most total points invested. Status changes to `"complete"`. |

### Commitment Resolution (Summary)

Each uncommitted player has a threshold based on their star rating. As weeks progress, thresholds decay (higher-star players decay faster). When total investment from all orgs meets or exceeds the threshold, a weighted lottery determines which org wins the commitment. Weights are based on each org's invested points raised to an exponent (default 1.3).

---

## Recruiting State

Check current recruiting status before taking any action.

### Loading State

```
GET /api/v1/recruiting/state?league_year_id=5
```

### Response

```json
{
  "league_year_id": 5,
  "current_week": 8,
  "status": "active",
  "total_weeks": 20
}
```

| Field | Type | Description |
|-------|------|-------------|
| `league_year_id` | int | Which league year |
| `current_week` | int | Current recruiting week (0 = not started, 1-20 = in progress) |
| `status` | string | `"pending"`, `"active"`, or `"complete"` |
| `total_weeks` | int | Total weeks in recruiting period (default 20) |

### Button State Logic

| Status | Advance Button | Reset Controls | Wipe Controls |
|--------|---------------|----------------|---------------|
| `"pending"` (week 0) | Enabled — "Initialize Recruiting" | Hidden | Hidden |
| `"active"` (weeks 1-19) | Enabled — "Advance to Week {N+1}" | Enabled | Enabled |
| `"active"` (week 20) | Enabled — "Close Recruiting" | Enabled | Enabled |
| `"complete"` | Disabled | Enabled (for corrections) | Enabled (for corrections) |

---

## Admin: Advance Week

The primary admin action. Each call advances recruiting by one week and triggers commitment resolution.

### Advance One Week

```
POST /api/v1/recruiting/advance-week
```

```json
{ "league_year_id": 5 }
```

### Response (Week 0 → 1: Initialization)

```json
{
  "previous_week": 0,
  "new_week": 1,
  "status": "active",
  "ranked_players": 1247
}
```

On initialization, `ranked_players` tells you how many HS players received star rankings. Display this as a confirmation: "1,247 players ranked and available for recruiting."

### Response (Weeks 1-19: Normal Advance)

```json
{
  "previous_week": 8,
  "new_week": 9,
  "status": "active",
  "commitments": [
    {
      "player_id": 4521,
      "player_name": "Marcus Johnson",
      "org_id": 45,
      "org_abbrev": "AUB",
      "star_rating": 4,
      "week_committed": 8,
      "points_total": 87
    }
  ]
}
```

The `commitments` array contains all players who committed during the just-completed week. Display this as a summary after each advance.

### Response (Week 20: Final Close)

```json
{
  "previous_week": 19,
  "new_week": 20,
  "status": "complete",
  "commitments": [...],
  "cleanup_commitments": [
    {
      "player_id": 6102,
      "player_name": "Tyler Brooks",
      "org_id": 78,
      "org_abbrev": "OSU",
      "star_rating": 2,
      "week_committed": 20,
      "points_total": 42
    }
  ]
}
```

`cleanup_commitments` contains players who didn't meet threshold but were assigned to the org with the highest total investment. Display these separately from normal `commitments` — label them "Assigned by default (highest investment)".

### Error Responses (400)

```json
{ "error": "Recruiting is already complete for this league year" }
```

---

## Admin: Reports

Four report endpoints provide visibility into recruiting activity without needing to check each org individually.

### Summary Report

High-level dashboard data.

```
GET /api/v1/recruiting/admin/report/summary?league_year_id=5
```

```json
{
  "state": {
    "current_week": 8,
    "status": "active",
    "pool_size": 1247,
    "total_weeks": 20
  },
  "stars": {
    "star_distribution": { "5": 12, "4": 25, "3": 87, "2": 374, "1": 749 },
    "committed_by_star": { "5": 8, "4": 15, "3": 32, "2": 45, "1": 12 }
  },
  "commitments": {
    "committed_count": 112,
    "uncommitted_count": 1135,
    "unique_orgs_committing": 89,
    "avg_winning_points": 64.3
  },
  "investment_activity": {
    "active_orgs": 156,
    "targeted_players": 423,
    "total_points_invested": 48200,
    "total_allocations": 2890
  },
  "trends": {
    "weekly_trend": [
      { "week": 1, "active_orgs": 145, "points_spent": 5200, "players_targeted": 312 },
      { "week": 2, "active_orgs": 152, "points_spent": 5800, "players_targeted": 340 }
    ],
    "commitment_pace": [
      { "week": 1, "commitments": 3 },
      { "week": 2, "commitments": 7 }
    ]
  }
}
```

**Suggested display:**
- Top row: status badge + week counter + pool size
- Star distribution: horizontal bar chart (total vs. committed per star tier)
- Commitment progress: "112 / 1,247 committed (9.0%)" with progress bar
- Weekly trend: line chart showing points_spent and commitments over weeks
- Key stats: active orgs, avg winning points, targeted players

### Org Leaderboard

Which orgs are most active and successful in recruiting.

```
GET /api/v1/recruiting/admin/report/org-leaderboard?league_year_id=5
```

```json
{
  "leaderboard": [
    {
      "org_id": 45,
      "org_abbrev": "AUB",
      "total_points_invested": 1580,
      "players_targeted": 18,
      "weeks_active": 8,
      "commitments_won": 4,
      "total_commit_stars": 14,
      "avg_star": 3.5,
      "budget_utilization_pct": 0.79
    }
  ]
}
```

**Suggested display:** Sortable table. Default sort by `commitments_won` desc. Highlight orgs with > 90% budget utilization.

### Player Demand

Most-targeted players across all orgs.

```
GET /api/v1/recruiting/admin/report/player-demand?league_year_id=5&star_rating=5&limit=50
```

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `league_year_id` | yes | — | |
| `star_rating` | no | all | Filter by star tier |
| `limit` | no | 50 | Max players returned |

```json
{
  "players": [
    {
      "player_id": 4521,
      "player_name": "Marcus Johnson",
      "ptype": "P",
      "star_rating": 5,
      "num_orgs_targeting": 12,
      "total_interest": 340,
      "top_orgs": [
        { "org_id": 45, "org_abbrev": "AUB", "invested_points": 85 },
        { "org_id": 78, "org_abbrev": "OSU", "invested_points": 72 }
      ]
    }
  ]
}
```

**Suggested display:** Table with star filter dropdown. Show competition level (num_orgs_targeting) and top 3 org abbreviations inline.

### Org Detail

Drill into a specific org's recruiting activity.

```
GET /api/v1/recruiting/admin/report/org-detail/45?league_year_id=5
```

```json
{
  "org_id": 45,
  "org_abbrev": "AUB",
  "weekly_spend": [
    { "week": 1, "points_spent": 100, "players_targeted": 5 },
    { "week": 2, "points_spent": 95, "players_targeted": 6 }
  ],
  "commitments": [
    { "player_id": 4521, "player_name": "Marcus Johnson", "star_rating": 4, "week_committed": 5, "points_total": 87 }
  ],
  "investments": [
    { "player_id": 6102, "player_name": "Tyler Brooks", "star_rating": 3, "invested_points": 42, "status": "uncommitted" }
  ]
}
```

**Suggested display:** Link from org leaderboard row → this detail view. Show weekly spend chart + commitment list + active investment targets.

---

## Admin: Reset & Wipe Controls

These are destructive actions. Always confirm before executing. All require `league_year_id` in the request body.

### Reset Week (Non-Destructive)

Reset the recruiting state to a specific week without wiping data. Useful for replaying a week if something went wrong.

```
POST /api/v1/recruiting/admin/reset-week
```

```json
{ "league_year_id": 5, "target_week": 1 }
```

```json
{ "ok": true, "league_year_id": 5, "current_week": 1, "status": "active" }
```

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `league_year_id` | yes | — | |
| `target_week` | no | 1 | Week to reset to. Does NOT wipe investments or commitments. |

**Warning:** This does not roll back commitments made in later weeks. If you reset from week 8 to week 3, commitments from weeks 3-8 still exist. Use wipe-commitments if you need a clean slate.

### Wipe Investments

Delete recruiting point investments. Can scope by org, player, or both.

```
POST /api/v1/recruiting/admin/wipe-investments
```

```json
{ "league_year_id": 5 }
```

Or scoped:

```json
{ "league_year_id": 5, "org_id": 45 }
```

```json
{ "league_year_id": 5, "player_id": 4521 }
```

```json
{ "ok": true, "deleted": 342, "scope": "all" }
```

| Scope Combo | Effect |
|------------|--------|
| `league_year_id` only | Wipe ALL investments for the league year |
| `+ org_id` | Wipe only that org's investments |
| `+ player_id` | Wipe all investments targeting that player |
| `+ org_id + player_id` | Wipe that org's investment in that specific player |

### Wipe Commitments

Delete commitment records. Same scoping as investments.

```
POST /api/v1/recruiting/admin/wipe-commitments
```

```json
{ "league_year_id": 5 }
```

```json
{ "ok": true, "deleted": 112, "scope": "all" }
```

### Wipe Boards

Delete recruiting board entries (which players an org is tracking). Same scoping.

```
POST /api/v1/recruiting/admin/wipe-boards
```

```json
{ "league_year_id": 5 }
```

```json
{ "ok": true, "deleted": 1580, "scope": "all" }
```

### Full Reset

Nuclear option: wipe everything and reset state to pending (week 0). Star rankings are preserved.

```
POST /api/v1/recruiting/admin/full-reset
```

```json
{ "league_year_id": 5 }
```

```json
{
  "ok": true,
  "deleted": {
    "recruiting_investments": 4820,
    "recruiting_commitments": 112,
    "recruiting_board": 1580,
    "state_reset": true
  }
}
```

**UI:** Require a confirmation dialog: "This will wipe all investments, commitments, and boards for league year 5. Rankings will be preserved. Are you sure?"

---

## Admin: Rankings Management

### Wipe Rankings

Delete all star rankings for a league year. Use before regenerating or if rankings need to be recomputed with different criteria.

```
POST /api/v1/recruiting/rankings/wipe
```

```json
{ "league_year_id": 5 }
```

```json
{ "status": "wiped", "deleted": 1247, "league_year_id": 5 }
```

### Regenerate Rankings

Wipe and recompute star rankings in one step. Useful after player attribute changes.

```
POST /api/v1/recruiting/rankings/regenerate
```

```json
{ "league_year_id": 5 }
```

```json
{ "status": "regenerated", "ranked_players": 1253, "league_year_id": 5 }
```

**Note:** Regenerating rankings while recruiting is active will affect commitment thresholds for future weeks. Existing commitments are not affected.

---

## Admin UI Suggestion

Add a "College Recruiting" section to the admin panel:

```
┌──────────────────────────────────────────────────────────────┐
│  College Recruiting                                           │
│                                                               │
│  Status: Active   ·   Week 8 of 20                            │
│  Committed: 112 / 1,247 (9.0%)  ████░░░░░░░░░░░░░░░░         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  ★★★★★  8/12    ★★★★  15/25   ★★★  32/87            │     │
│  │  ★★     45/374  ★     12/749                         │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  [Advance to Week 9]       [View Reports ▾]                   │
│                                                               │
│  ─── Last Advance Results ───                                 │
│  3 commitments in week 8:                                     │
│  • Marcus Johnson (★★★★) → AUB (87 pts)                      │
│  • Tyler Brooks (★★★) → OSU (42 pts)                         │
│  • Ryan Chen (★★) → UCLA (28 pts)                            │
│                                                               │
│  ─── Reports ───                                              │
│  [Summary]  [Org Leaderboard]  [Player Demand]                │
│                                                               │
│  ─── Admin Controls ───                                       │
│  [Reset Week ▾]  [Regenerate Rankings]                        │
│  [Wipe Investments ▾]  [Wipe Commitments ▾]                   │
│  [Wipe Boards ▾]  [⚠ Full Reset]                             │
└──────────────────────────────────────────────────────────────┘
```

### Color Coding

| Element | Color |
|---------|-------|
| Status badge: pending | Gray |
| Status badge: active | Green |
| Status badge: complete | Blue |
| Star ratings | Gold (★) |
| Advance button | Primary/Blue |
| Wipe buttons | Orange/Warning |
| Full Reset button | Red/Danger |
| Commitment results | Green text |
| Cleanup assignments | Yellow text (italicized) |

---

## Endpoint Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/recruiting/state?league_year_id` | Any | Current recruiting state |
| POST | `/recruiting/advance-week` | Admin | Advance recruiting by one week |
| GET | `/recruiting/admin/report/summary?league_year_id` | Admin | Dashboard summary |
| GET | `/recruiting/admin/report/org-leaderboard?league_year_id` | Admin | Org activity leaderboard |
| GET | `/recruiting/admin/report/player-demand?league_year_id` | Admin | Most-targeted players |
| GET | `/recruiting/admin/report/org-detail/{org_id}?league_year_id` | Admin | Single org drill-down |
| POST | `/recruiting/admin/reset-week` | Admin | Reset recruiting to a specific week |
| POST | `/recruiting/admin/wipe-investments` | Admin | Delete investments (scopeable) |
| POST | `/recruiting/admin/wipe-commitments` | Admin | Delete commitments (scopeable) |
| POST | `/recruiting/admin/wipe-boards` | Admin | Delete boards (scopeable) |
| POST | `/recruiting/admin/full-reset` | Admin | Wipe all recruiting data, reset to pending |
| POST | `/recruiting/rankings/wipe` | Admin | Delete star rankings |
| POST | `/recruiting/rankings/regenerate` | Admin | Recompute star rankings |

All POST endpoints return `400` with `{"error": "..."}` on validation failure.

---

## Full Workflow: Admin Recruiting Lifecycle

### 1. Pre-Season Setup

Before recruiting can start, ensure:
- A league year exists with HS players (org 340) populated
- College orgs (31-342) have rosters
- The league is in a phase where recruiting makes sense (typically offseason)

### 2. Initialize Recruiting (Week 0 → 1)

Admin calls `POST /recruiting/advance-week` with `league_year_id`.
- Star rankings are automatically computed for all HS players
- Separate rankings for pitchers and position players
- Status changes from `"pending"` to `"active"`
- Display: "1,247 players ranked. Recruiting is now open."

### 3. Allow Time for Org Investment

Between advances, orgs invest their weekly points via the user-facing recruiting page. The admin controls pacing — advance when ready, not on a fixed timer.

Typical cadence: advance once per real-world day or once per sim week, depending on league pace.

### 4. Advance Through Weeks 1-19

Each `POST /recruiting/advance-week` call:
1. Resolves commitments from the just-completed week
2. Increments the week counter
3. Returns a list of new commitments

After each advance, display the commitment results to the admin. Monitor via the summary report to see if recruiting is progressing at a healthy pace.

**Signs of healthy recruiting:**
- Commitment pace increasing as weeks progress (thresholds decay)
- Most orgs have some budget utilization (> 50%)
- 5-star players committing by weeks 6-10

**Signs of problems:**
- Very few commitments by week 10 → thresholds may be too high
- One org dominating → check if investing rules are balanced
- Many orgs not investing → check that college orgs are active

### 5. Close Recruiting (Week 20)

The final advance call:
1. Resolves normal commitments
2. Assigns all remaining uncommitted players to their point leader
3. Sets status to `"complete"`

Display both `commitments` (lottery winners) and `cleanup_commitments` (default assignments) separately.

### 6. Post-Recruiting

After recruiting completes:
- Committed players will be moved to college rosters during season processing
- Star ratings persist on players (`recruit_stars`) for scouting visibility
- Admin can use reports to review the full recruiting class

### 7. Corrections (If Needed)

If something went wrong:
- **Minor fix:** Use scoped wipe (specific org or player) + reset-week to replay
- **Major fix:** Use full-reset to start over (rankings preserved)
- **Rankings wrong:** Use regenerate-rankings (will recompute from current player attributes)

---

## Error Messages Reference

| Error | Cause | Resolution |
|-------|-------|------------|
| `"Recruiting is already complete for this league year"` | Tried to advance past week 20 | No action needed; recruiting is done |
| `"No recruiting state found"` | No recruiting initialized for this league year | Check league_year_id is correct |
| `"league_year_id is required"` | Missing required field | Include league_year_id in request body |
