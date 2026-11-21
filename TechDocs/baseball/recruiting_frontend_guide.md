# College Recruiting — Frontend Guide

This document covers every endpoint, response shape, and workflow the frontend needs to implement the college recruiting page: browsing recruits, managing an org's recruiting board, investing points, and tracking commitments.

All endpoints are under `/api/v1`. All recruiting endpoints are prefixed `/recruiting/`.

---

## Table of Contents

1. [Concepts](#concepts)
2. [Recruiting State](#recruiting-state)
3. [Star Rankings Page](#star-rankings-page)
4. [Recruiting Board](#recruiting-board)
5. [Player Detail Modal](#player-detail-modal)
6. [Investing Points](#investing-points)
7. [Commitments Page](#commitments-page)
8. [HS Scouting Pool](#hs-scouting-pool)
9. [Pro Scouting Pool (College Players)](#pro-scouting-pool-college-players)
10. [Endpoint Reference](#endpoint-reference)

---

## Concepts

### Who Can Recruit

Only **college orgs** (org IDs 31-342, excluding 339 INTAM and 340 USHS) participate in recruiting. MLB orgs cannot recruit — they draft.

### Recruiting Lifecycle

Recruiting runs for 20 weeks. The admin advances weeks manually via `POST /recruiting/advance-week`.

```
Week 0 (pending)  →  Rankings computed, status becomes 'active'
Weeks 1-19        →  Orgs invest points each week; commitments resolve at week end
Week 20           →  Final cleanup: remaining players go to point leader
Week 21+          →  Status 'complete', no more activity
```

### Star Ratings

Every HS player (org 340) receives a 1-5 star rating based on a composite score of their attributes and potentials. Stars are assigned separately within Pitchers and Position Players:

| Stars | Percentile |
|-------|-----------|
| 5 | Top 1% |
| 4 | Next 2% |
| 3 | Next 7% |
| 2 | Next 30% |
| 1 | Bottom 60% |

Star ratings persist permanently on the player as `recruit_stars`. When an HS player moves to a college roster, their star rating carries over and is visible on the pro scouting pool.

### Commitment Resolution

Each week, a player's commitment threshold is computed from their star tier. As total investment from all orgs approaches or exceeds that threshold, a weighted lottery determines who wins the commitment. Higher-star players have higher thresholds and take longer to commit.

A hidden per-player **signing tendency** (not exposed to the frontend) modifies thresholds by -10% to +10%, so identically-starred players may commit at different rates.

### Fog of War

| Data | What You See |
|------|-------------|
| Star rating & rank | Public — exact values |
| Your investment | Exact cumulative points |
| Interest gauge | Fuzzed per org — deterministic ±1 tier shift. Values: `"Low"`, `"Medium"`, `"High"`, `"Very High"` |
| Competitor logos | Team IDs of orgs with >50% of the leader's investment (you can map these to logos) |
| Status | Per-player progression label based on investment activity relative to threshold |
| Commitments | Public once signed — exact org, week, points |

### Recruiting Status Labels

Status reflects how close a player's total investment is to their commitment threshold. A player with no investment stays `"Open"` regardless of week. The possible values are:

| Status | Meaning |
|--------|---------|
| `"Open"` | No/minimal investment relative to threshold |
| `"Listening to Offers"` | ~10-30% of threshold reached |
| `"Locking Down Top 5"` | ~30-50% of threshold reached |
| `"Narrowing to Top 3"` | ~50-70% of threshold reached |
| `"May Sign Soon"` | ~70-90% of threshold reached |
| `"May Sign this Week"` | 90%+ of threshold reached, commitment imminent |
| `"Signed to {ABBREV}"` | Committed to a team (e.g., `"Signed to UNC"`) |

### Status Badge Colors

```js
function getStatusColor(status) {
  if (status.startsWith('Signed'))     return 'gray';
  if (status === 'May Sign this Week') return 'red';
  if (status === 'May Sign Soon')      return 'orange';
  if (status === 'Narrowing to Top 3') return 'yellow';
  if (status === 'Locking Down Top 5') return 'yellow';
  if (status === 'Listening to Offers') return 'blue';
  return 'green'; // Open
}
```

### Competitor Team Logos

The `competitor_team_ids` field returns an array of `teams.id` values. Use these to look up team logos (the same team IDs used elsewhere in the app for logo rendering). Only orgs investing more than 50% of the leader's total appear as competitors. The viewing org is excluded from the list.

```js
// Example: render competitor logos
entry.competitor_team_ids.forEach(teamId => {
  const img = document.createElement('img');
  img.src = `/logos/${teamId}.png`;
  img.classList.add('competitor-logo');
  container.appendChild(img);
});
```

---

## Recruiting State

Check the current phase before rendering any recruiting UI.

### Loading State

```
GET /api/v1/recruiting/state?league_year_id={leagueYearId}
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

| `status` | UI Behavior |
|----------|-------------|
| `"pending"` | Show "Recruiting has not started yet" |
| `"active"` | Full recruiting UI — board, investments, rankings |
| `"complete"` | Read-only — show final commitments, disable invest buttons |

---

## Star Rankings Page

Public view of all ranked HS recruits. No org-specific fog of war.

### Loading Rankings

```
GET /api/v1/recruiting/rankings
  ?league_year_id={leagueYearId}
  &page=1
  &per_page=50
  &star_rating=5
  &ptype=Pitcher
  &search=Smith
```

All filter params are optional.

### Response

```json
{
  "players": [
    {
      "player_id": 12345,
      "player_name": "John Smith",
      "ptype": "Pitcher",
      "age": 17,
      "star_rating": 5,
      "rank_overall": 1,
      "rank_by_ptype": 1
    }
  ],
  "page": 1,
  "per_page": 50,
  "total": 245,
  "total_pages": 5
}
```

### Suggested UI

```
+-------+-----+------+-----+------+---------+-----------+--------+
| Rank  |Stars| Name | Age | Type | Rank(P) | Rank(Pos) |  Add   |
+-------+-----+------+-----+------+---------+-----------+--------+
|   1   | 5*  |Smith |  17 |  P   |    1    |     -     | [+ Board] |
|   2   | 5*  |Jones |  18 | Pos  |    -    |     1     | [+ Board] |
+-------+-----+------+-----+------+---------+-----------+--------+
```

- Star ratings displayed as filled stars (e.g., 5 gold stars)
- `rank_by_ptype` shows rank within their player type
- "+ Board" button calls `POST /recruiting/board/add`

---

## Recruiting Board

The org's personalized board showing players they're tracking or invested in. This is the primary recruiting interface.

### Loading the Board

```
GET /api/v1/recruiting/board/{orgId}?league_year_id={leagueYearId}
```

### Response

```json
{
  "players": [
    {
      "player_id": 12345,
      "player_name": "John Smith",
      "ptype": "Pitcher",
      "star_rating": 5,
      "rank_overall": 1,
      "your_points": 80,
      "on_board": true,
      "interest_gauge": "High",
      "competitor_team_ids": [145, 203, 87],
      "status": "Narrowing to Top 3",
      "committed_to": null
    },
    {
      "player_id": 12346,
      "player_name": "Jane Doe",
      "ptype": "Position",
      "star_rating": 4,
      "rank_overall": 15,
      "your_points": 60,
      "on_board": true,
      "interest_gauge": "Very High",
      "competitor_team_ids": [145],
      "status": "Signed to DUKE",
      "committed_to": {
        "org_id": 72,
        "org_abbrev": "DUKE",
        "week_committed": 5
      }
    }
  ]
}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `your_points` | int | Your org's cumulative investment across all weeks |
| `on_board` | bool | Whether you explicitly added this player (vs. appearing from investments only) |
| `interest_gauge` | string | Fuzzed interest level: `"Low"` / `"Medium"` / `"High"` / `"Very High"` |
| `competitor_team_ids` | int[] | Team IDs of competitors investing >50% of leader. Use for logo display. |
| `status` | string | Activity-based progression label (see [Status Labels](#recruiting-status-labels)) |
| `committed_to` | object\|null | If signed: `{org_id, org_abbrev, week_committed}`. Null if unsigned. |

### Sorting

The API returns players sorted: unsigned first (by star rating descending), then signed players. Maintain this sort order in the UI.

### Suggested Board Layout

```
+------+------+------+--------+---------+-----------+------------+--------+
|Stars | Name | Type | Points |Interest |Competitors|  Status    | Action |
+------+------+------+--------+---------+-----------+------------+--------+
| 5*   |Smith |  P   |   80   |  High   | [logos]   | Top 3      |[Invest]|
| 4*   |Doe   | Pos  |   60   | V.High  | [logo]    | Signed DUKE|   -    |
| 3*   |Lee   |  P   |   40   |  Med    |           | Listening  |[Invest]|
+------+------+------+--------+---------+-----------+------------+--------+
```

- **Competitors column**: Render team logos from `competitor_team_ids`. If empty, show "—".
- **Status column**: Colored badge (see [Status Badge Colors](#status-badge-colors)).
- **Action column**: "Invest" button for unsigned players, disabled for signed.
- Clicking a row opens the [Player Detail Modal](#player-detail-modal).

### Board Management

**Add to board:**
```
POST /api/v1/recruiting/board/add
```
```json
{ "org_id": 45, "league_year_id": 5, "player_id": 12345 }
```
Response: `{ "status": "added", "player_id": 12345 }` or `{ "status": "already_on_board" }`

**Remove from board:**
```
POST /api/v1/recruiting/board/remove
```
```json
{ "org_id": 45, "league_year_id": 5, "player_id": 12345 }
```
Response: `{ "status": "removed", "player_id": 12345 }` or `{ "status": "not_on_board" }`

---

## Player Detail Modal

Shown when clicking a player row on the board or rankings page.

### Loading Detail

```
GET /api/v1/recruiting/player/{playerId}
  ?league_year_id={leagueYearId}
  &viewing_org_id={orgId}
```

The `viewing_org_id` param enables fog-of-war fuzzing and returns your org's investment.

### Response

```json
{
  "player_id": 12345,
  "player_name": "John Smith",
  "ptype": "Pitcher",
  "star_rating": 5,
  "rank_overall": 1,
  "rank_by_ptype": 1,
  "status": "Narrowing to Top 3",
  "interest_gauge": "High",
  "competitor_team_ids": [145, 203, 87],
  "your_investment": 80
}
```

If the player is committed, `status` will be `"Signed to {ABBREV}"` and a `commitment` object is included:

```json
{
  "status": "Signed to UNC",
  "commitment": {
    "org_id": 45,
    "org_abbrev": "UNC",
    "week_committed": 5,
    "points_total": 120
  }
}
```

### Suggested Modal Layout

```
+--------------------------------------------------------+
|  John Smith  ·  17  ·  Pitcher  ·  5 Stars  ·  #1 Overall  |
+---------------------------------------------------------+
|                                                          |
|  STATUS: [Narrowing to Top 3]  (yellow badge)            |
|  Interest: High                                          |
|  Competitors: [logo] [logo] [logo]                       |
|                                                          |
|  YOUR INVESTMENT: 80 pts                                 |
|                                                          |
|  [Invest Points]                                         |
+---------------------------------------------------------+
```

- Hide "Invest Points" button if `status` starts with `"Signed"` or if recruiting is `"complete"`.
- `your_investment` is null if `viewing_org_id` was not provided — hide the investment section.

---

## Investing Points

Orgs allocate points to players each week. Points accumulate across weeks.

### Check Current Budget

```
GET /api/v1/recruiting/investments/{orgId}?league_year_id={leagueYearId}
```

### Response

```json
{
  "current_week": 8,
  "status": "active",
  "weekly_budget": 100,
  "max_per_player": 20,
  "spent": 60,
  "budget_remaining": 40,
  "investments": [
    { "player_id": 12345, "points": 15, "player_name": "John Smith", "ptype": "Pitcher" },
    { "player_id": 12346, "points": 20, "player_name": "Jane Doe", "ptype": "Position" },
    { "player_id": 12347, "points": 25, "player_name": "Bob Lee", "ptype": "Pitcher" }
  ]
}
```

### Submit Investments

```
POST /api/v1/recruiting/invest
```

```json
{
  "org_id": 45,
  "league_year_id": 5,
  "week": 8,
  "investments": [
    { "player_id": 12345, "points": 15 },
    { "player_id": 12346, "points": 20 }
  ]
}
```

### Response

```json
{
  "accepted": [
    { "player_id": 12345, "points": 15 },
    { "player_id": 12346, "points": 20 }
  ],
  "errors": [],
  "budget_remaining": 65
}
```

### Validation Rules

| Rule | Limit |
|------|-------|
| Weekly budget | 100 pts total per week |
| Per-player cap | 20 pts max per player per week |
| No negatives | Points must be >= 0 |

### Investment Form

```
+--------------------------------------------------------+
|  Week 8 Investments          Budget: 40 / 100 remaining |
+---------------------------------------------------------+
|  Player         | Stars | Points This Week | Cumulative |
+-----------------+-------+------------------+------------+
|  John Smith     |  5*   | [15        ]     |    80      |
|  Jane Doe       |  4*   | [20        ]     |    60      |
|  Bob Lee        |  3*   | [ 0        ]     |    40      |
+-----------------+-------+------------------+------------+
|  [Save Investments]                                      |
+---------------------------------------------------------+
```

- Show a running total of points allocated this week.
- Disable input fields if recruiting status is not `"active"`.
- After saving, refresh the board to see updated `your_points` and `status`.

---

## Commitments Page

Public list of all commitments. Shows which players signed where.

### Loading Commitments

```
GET /api/v1/recruiting/commitments
  ?league_year_id={leagueYearId}
  &page=1
  &per_page=50
  &org_id=45
  &star_rating=5
  &week=8
```

All filter params except `league_year_id` are optional.

### Response

```json
{
  "commitments": [
    {
      "player_id": 12345,
      "player_name": "John Smith",
      "ptype": "Pitcher",
      "org_id": 45,
      "org_abbrev": "UNC",
      "star_rating": 5,
      "week_committed": 5,
      "points_total": 120,
      "competitor_team_ids": [145, 203, 87]
    }
  ],
  "page": 1,
  "per_page": 50,
  "total": 42,
  "total_pages": 1
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `org_abbrev` | The team that won the commitment |
| `week_committed` | Which recruiting week the player signed |
| `points_total` | The winning org's total investment |
| `competitor_team_ids` | All team IDs that invested >50% of the leader (includes winner) |

### Suggested UI

```
+------+--------+------+------+---------+-------+--------+-----------+
|Stars | Player | Type | Team | Week    | Points| Winner | Also In   |
+------+--------+------+------+---------+-------+--------+-----------+
| 5*   | Smith  |  P   | UNC  |  Wk 5  |  120  | [logo] | [logos]   |
| 4*   | Jones  | Pos  | DUKE |  Wk 8  |   95  | [logo] | [logos]   |
+------+--------+------+------+---------+-------+--------+-----------+
```

- **Winner column**: Show the committing org's logo.
- **Also In column**: Render logos from `competitor_team_ids` (excluding the winner's team_id if desired).
- Filter by star rating to see elite commitment activity.
- Filter by org_id to see a specific school's recruiting class.

---

## HS Scouting Pool

The college-pool endpoint shows all HS players available for recruiting, with scouting features and fog-of-war attribute fuzz.

### Loading the Pool

```
GET /api/v1/scouting/college-pool
  ?league_year_id={leagueYearId}
  &viewing_org_id={orgId}
  &page=1
  &per_page=50
  &age=17
  &ptype=Pitcher
  &search=Smith
```

### Response

```json
{
  "total": 500,
  "page": 1,
  "per_page": 50,
  "pages": 10,
  "age_counts": { "15": 120, "16": 130, "17": 125, "18": 125 },
  "players": [
    {
      "id": 12345,
      "firstname": "John",
      "lastname": "Smith",
      "age": 17,
      "ptype": "Pitcher",
      "star_rating": 5,
      "recruit_stars": 5,
      "contact_base": "B+",
      "power_base": "A-",
      "generated_stats": { "batting": { "avg": 0.285 }, "fielding": { "errors": 3 } }
    }
  ]
}
```

### Key Points

- `star_rating` comes from the current year's rankings (if computed), or falls back to `recruit_stars` (the permanent value on the player).
- `age_counts` enables "Class of" tabs — show the count badge for each age group.
- Attributes are fuzzed via fog-of-war when `viewing_org_id` is provided. Scouting actions can unlock precise values.

---

## Pro Scouting Pool (College Players)

College players visible to MLB orgs for draft scouting now include their recruit star rating.

### Loading the Pool

```
GET /api/v1/scouting/pro-pool
  ?viewing_org_id={orgId}
  &page=1
  &per_page=50
  &org_id=45
  &min_age=20
```

### Response

Each player now includes `star_rating` (from their `recruit_stars` value set during their HS recruiting):

```json
{
  "id": 12345,
  "firstname": "John",
  "lastname": "Smith",
  "age": 21,
  "ptype": "Pitcher",
  "star_rating": 4,
  "recruit_stars": 4,
  "org_id": 45,
  "org_abbrev": "UNC"
}
```

The `star_rating` field shows how the player was rated as an HS recruit. Display it alongside their current attributes so scouts can see their pedigree.

---

## Endpoint Reference

### Recruiting State & Rankings

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/recruiting/state` | Current week and phase |
| GET | `/recruiting/rankings` | Public star rankings (paginated, filterable) |

### Board Management

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/recruiting/board/{orgId}` | Org's board with fog-of-war |
| POST | `/recruiting/board/add` | Add player to board |
| POST | `/recruiting/board/remove` | Remove player from board |

### Investments

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/recruiting/investments/{orgId}` | Current week's investments + budget |
| POST | `/recruiting/invest` | Submit weekly point allocations |

### Player & Commitments

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/recruiting/player/{playerId}` | Single player detail with fog-of-war |
| GET | `/recruiting/commitments` | Public commitment list (paginated, filterable) |

### Scouting Pools

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/scouting/college-pool` | HS players for college recruiting (with star_rating) |
| GET | `/scouting/pro-pool` | College/INTAM players for pro scouting (with recruit_stars) |

---

## Common Patterns

### Checking Signed Status

```js
const isSigned = status.startsWith('Signed');
```

Use this to conditionally disable invest buttons and show the commitment details.

### Rendering Star Ratings

```js
function renderStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}
// renderStars(4) → "★★★★☆"
```

### Interest Gauge Colors

```js
const gaugeColors = {
  'Low':       '#6b7280',  // gray
  'Medium':    '#3b82f6',  // blue
  'High':      '#f59e0b',  // amber
  'Very High': '#ef4444',  // red
};
```

### Refreshing After Actions

| Action | What to Refresh |
|--------|----------------|
| Add/remove from board | Refresh board |
| Submit investments | Refresh board (status/competitors may change) and investments endpoint |
| Week advances (admin) | Refresh state, board, and commitments (new signings may appear) |

### Error Handling

All endpoints return errors as `{ "error": "error_type", "message": "Human readable message" }` with HTTP 400. Display the `message` value directly.
