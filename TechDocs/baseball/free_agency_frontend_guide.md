# Free Agency & Contract Negotiation — Frontend Guide

This document covers every endpoint, response shape, and workflow the frontend needs to implement the free agency page, roster contract actions (extensions, buyouts), and the auction board.

All endpoints are under `/api/v1`. All monetary values from the API are strings (Decimal precision) unless noted as `float`.

---

## Season 2 changes (2026-11-21)

These change what the interface sees or must send. Everything else in this guide still holds.

### 1. Club token on offers (`X-Org-Token`)

`POST /fa-auction/{auction_id}/offer` and `DELETE /fa-auction/{auction_id}/offer/{org_id}` act for a club. Send that club's token:

```
X-Org-Token: <the club's token>
```

- The league admin issues each MLB club one token (`POST /admin/org-tokens/{org_id}/rotate`, shown once). Store it with the club's account, never in client code shared between clubs.
- The server runs in one of three modes (`ORG_TOKEN_MODE`): `off`, `warn` (default: a missing or wrong token is logged and allowed) or `enforce` (rejected).
- In `enforce`, a missing token, a wrong token, or another club's token returns:

```json
401 { "error": "unauthorized", "message": "This action needs the X-Org-Token header for org 7." }
```

Start sending the header now; the league will switch to `enforce` once the interface does.

### 2. Offers reserve money

An active offer reserves its **signing bonus plus its first season's salary** against the club's cash until it wins, loses or is withdrawn. A new offer is refused when it does not fit in what is left:

```json
400 { "error": "Offer commits 18,500,000.00 (bonus plus first-season salary) but only 12,040,000.00 is available: cash 60,040,000.00 minus 48,000,000.00 reserved by the club's other active offers" }
```

Show the message as is; the club can withdraw another open-phase offer or lower this one. Updating an offer on the same auction replaces its reservation, it does not add to it.

### 3. Falling asks

A player with no offers lowers his ask by 10 % per round once he has gone two rounds without an offer, never below $1.6M. The board and pool always show the live ask.

Board entries (`GET /fa-auction/board`) gain:

| Field | Meaning |
|---|---|
| `initial_min_aav` | The ask when he entered free agency |
| `min_aav` / `min_total_value` | The ask now (may be lower than `initial_min_aav`) |
| `ask_decay_steps` | How many times the ask has dropped |
| `rounds_without_offer` | Rounds in a row without an offer |
| `auction_league_year_id` | The season the auction was opened in (a player released in season keeps that season's id) |

In the pool (`GET /fa-auction/free-agent-pool`), `auction.min_aav` and `demand.min_aav` are the live ask. Suggested UI: show the starting ask struck through next to the current one when `ask_decay_steps > 0`.

### 4. Withdraw and re-offer

A club that withdraws during the open phase and offers again is back in the auction (`my_offer.status` is `active`). Before this fix the re-offer was silently ignored.

### 5. Offer statuses

`my_offer.status` can now also be `failed`: the club's offer won but could not be completed (for example the club no longer had the cash for the bonus). The next-best offer signs instead. If no offer can be completed the auction reopens to every club, and at the close of free agency the player gets a fallback deal.

| Status | Meaning |
|---|---|
| `active` | In the running |
| `outbid` | Not in the final three |
| `withdrawn` | Withdrawn by the club (open phase only) |
| `won` | Signed |
| `lost` | Another club signed him |
| `failed` | Won but could not be completed; skipped |

### 6. Notifications

Clubs now receive notifications on their MLB team (the existing `Notifications` list in the bootstrap payload; mark read with `PUT /notifications/{id}/read`). Messages start with `Free agency:` or `Free agency closed:`:

- your offer did not make the final three;
- you signed a player;
- a player you bid on signed with another club;
- your winning offer could not be completed and was skipped;
- at the close: a player was placed on your roster on a one-year fallback deal (release him at no cost before the season starts).

### 7. Board covers every season

The board and pool list every active auction, including players released during an earlier season. Do not filter the board by `league_year_id` on the client.

### 8. Market rate

`GET /fa-auction/market-rate?league_year_id=` now also returns how the rate was set:

```json
{ "dollar_per_war": "9200000.00", "raw_rate": "8650000.00", "previous_rate": "8000000",
  "signings_in_sample": 6, "method": "median", "max_change": "0.15", "limited_by_max_change": false }
```

The rate is the median price per WAR of recent signings and moves at most 15 % per season.

---

## Table of Contents

0. [Season 2 changes (2026-11-21)](#season-2-changes-2026-11-21)
1. [Concepts](#concepts)
2. [Free Agent Pool Page](#free-agent-pool-page)
3. [Auction Board](#auction-board)
4. [Player Detail Modal](#player-detail-modal)
5. [Inline Scouting](#inline-scouting)
6. [Roster Table: Extension Modal](#roster-table-extension-modal)
7. [Roster Table: Buyout Modal](#roster-table-buyout-modal)
8. [Market Dashboard](#market-dashboard)
9. [Signing Budget](#signing-budget)
10. [Endpoint Reference](#endpoint-reference)
11. [Free Agent Tiers (`fa_type`)](#free-agent-tiers-fa_type) -- NEW
12. [Waiver Wire](#waiver-wire) -- NEW
13. [Updated Endpoint Reference](#updated-endpoint-reference) -- NEW
14. [Updated Full Workflow: Player Lifecycle](#updated-full-workflow-player-lifecycle) -- NEW

---

## Concepts

### Contract Phases

Every player under contract is in one of four phases based on their league level and MLB service years:

| Phase | Condition | What Happens at Contract End |
|-------|-----------|------------------------------|
| `minor` | Level < 9 | Auto-renewed at $40,000 by holding org |
| `pre_arb` | Level 9, service < 3 | Auto-renewed at $800,000 by holding org |
| `arb_eligible` | Level 9, service 3-5 | Auto-renewed at WAR-based salary (40%/60%/80% of market rate for arb years 1/2/3) |
| `fa_eligible` | Level 9, service 6+ | Enters the free agent auction |

### Player Demands

Players generate minimum contract demands based on their WAR, age, and the current market rate ($/WAR). These demands are the floor — any offer below them is rejected by the API.

- **FA demands**: minimum AAV, preferred year range, minimum total value
- **Extension demands**: 90% of FA baseline (security discount for the player)
- **Buyout demands**: based on remaining guaranteed money vs. open-market value

### 3-Phase Auction

When a player becomes a free agent (end of season or mid-season release), they enter a competitive auction:

| Phase | Duration | Rules |
|-------|----------|-------|
| **Open** | 1 game week (stays open indefinitely with 0 offers) | Any org can submit an offer |
| **Listening** | 1 game week | Only existing bidders can update; must increase AAV |
| **Finalize** | 1 game week | Only top 3 bidders remain; must increase AAV; winner signs at end |

Phases advance automatically when the simulation processes `advance_week()`.

### How the Winner Is Chosen (Age-Weighted Scoring)

The auction winner is **not** simply the highest total value. Players evaluate offers using an age-based blend of **AAV** (per-year money) and **total value** (overall guaranteed money). Younger players favor long-term security; older players chase per-year maximization.

| Player Age | AAV Weight | Total Value Weight | Player Mindset |
|-----------|-----------|-------------------|----------------|
| ≤ 28 | 30% | 70% | Wants the big long-term deal |
| 29–31 | 50% | 50% | Balanced — values both |
| 32–33 | 70% | 30% | Leans toward per-year money |
| 34+ | 85% | 15% | Almost pure AAV chasing |

**What this means for owners:**
- Offering a 35-year-old a 4yr/$20M deal ($5M AAV) will lose to a 2yr/$14M offer ($7M AAV) — the player prefers the higher annual salary.
- Offering a 25-year-old the same two deals: the 4yr/$20M wins because the young player values total guaranteed money.
- This scoring also determines the **top-3 cutoff** at the listening → finalize transition.

**Frontend implication:** You cannot tell the user exactly where their offer ranks (competitor amounts are hidden), but you can display the player's age alongside a hint like _"Younger players value total guaranteed money; older players prioritize annual salary."_ to help guide their strategy.

### Fog of War

Player attributes on the free agency page are **fuzzed** (shown as shifted letter grades) unless the viewing org has spent scouting points to unlock precise values. The fuzz is deterministic per (org, player, attribute) — the same org always sees the same fuzz for a given player.

**Scouting actions available on the FA page:**

| Action | Cost | Effect |
|--------|------|--------|
| `pro_attrs_precise` | 15 pts | Reveals true 20-80 numeric attributes |
| `pro_potential_precise` | 15 pts | Reveals true potential letter grades |

---

## Free Agent Pool Page

The main page for browsing available free agents.

### Loading the Pool

```
GET /api/v1/fa-auction/free-agent-pool
  ?viewing_org_id={orgId}
  &league_year_id={leagueYearId}
  &page=1
  &per_page=50
  &sort=lastname
  &dir=asc
```

**Required params:** `viewing_org_id`, `league_year_id`

**Filter params (all optional):**

| Param | Type | Example | Notes |
|-------|------|---------|-------|
| `ptype` | string | `Pitcher` or `Position` | Player type filter |
| `search` | string | `Judge` | Name search, min 2 chars |
| `min_age` | int | `25` | |
| `max_age` | int | `32` | |
| `area` | string | `US` | Geographic region |
| `has_auction` | string | `true` | Only players currently in an active auction |

**Sort columns:** `lastname`, `firstname`, `age`, `ptype`, `area`, `displayovr`, any `_base` attribute (e.g., `contact_base`, `power_base`), any `_pot` attribute.

### Response

```json
{
  "total": 245,
  "page": 1,
  "per_page": 50,
  "pages": 5,
  "players": [ /* see below */ ]
}
```

### Player Object in Pool

The response shape now matches the roster endpoint — attributes are nested under `ratings` (with `_display` suffix, 20-80 scaled) and `potentials`, plus derived position ratings (`c_rating`, `ss_rating`, `sp_rating`, etc.) and pitch overalls.

```json
{
  "id": 12345,
  "displayovr": 72,
  "bio": {
    "firstname": "Aaron",
    "lastname": "Judge",
    "age": 34,
    "ptype": "Position",
    "area": "US",
    "height": 79,
    "weight": 282,
    "bat_hand": "R",
    "pitch_hand": "R",
    "arm_angle": null,
    "durability": 65,
    "injury_risk": 30,
    "pitch1_name": null,
    "pitch2_name": null
  },
  "ratings": {
    "contact_display": 65,
    "power_display": 75,
    "eye_display": 60,
    "discipline_display": 55,
    "speed_display": 45,
    "baserunning_display": 40,
    "fieldcatch_display": 55,
    "fieldreact_display": 60,
    "fieldspot_display": 50,
    "throwacc_display": 65,
    "throwpower_display": 70,
    "catchframe_display": null,
    "catchsequence_display": null,
    "pendurance_display": null,
    "pgencontrol_display": null,
    "c_rating": 20,
    "fb_rating": 55,
    "ss_rating": 30,
    "rf_rating": 72,
    "dh_rating": 65,
    "sp_rating": null,
    "rp_rating": null,
    "pitch1_ovr": null
  },
  "potentials": {
    "contact_pot": "A",
    "power_pot": "A+",
    "speed_pot": "C+"
  },

  "last_level": 9,
  "last_org_abbrev": "NYY",
  "listed_position": "RF",

  "auction": {
    "auction_id": 42,
    "phase": "listening",
    "min_aav": 12000000.0,
    "offer_count": 3,
    "my_offer": {
      "offer_id": 101,
      "years": 3,
      "bonus": 5000000.0,
      "total_value": 41000000.0,
      "aav": 13666666.67,
      "status": "active"
    }
  },

  "demand": {
    "min_aav": "12000000.00",
    "min_years": 3,
    "max_years": 5,
    "war": 4.2
  },

  "scouting": {
    "unlocked": ["pro_attrs_precise"],
    "attrs_precise": true,
    "pots_precise": false,
    "available_actions": ["pro_potential_precise"]
  }
}
```

**Notes:**
- Bio fields are nested under `bio` — matching the roster endpoint shape.
- `ratings` contains 20-80 scaled values with `_display` suffix for base attributes, plus position ratings (`c_rating`, `fb_rating`, etc.) and pitch overalls (`pitch1_ovr`, etc.). These are **fuzzed** by default and become precise when `scouting.attrs_precise` is true.
- `potentials` contains `_pot` fields as fuzzed letter grades or `"?"` if unknown. Precise if `scouting.pots_precise` is true.
- `auction` is `null` if the player is not currently in an active auction.
- `demand` is `null` if no FA demand has been computed for this player yet.
- `my_offer` inside `auction` is `null` if the viewing org has not submitted an offer.
- **This shape is identical to the roster endpoint** for the `bio`, `ratings`, and `potentials` fields, allowing frontend component reuse.

### Suggested UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Free Agency Pool                                    Budget: $X │
│  ┌──────┐ ┌────────┐ ┌─────────────┐ ┌──────────┐             │
│  │ Type ▼│ │ Age ▼  │ │ Search...   │ │ In Auction│             │
│  └──────┘ └────────┘ └─────────────┘ └──────────┘             │
├─────┬─────┬────┬─────┬──────┬───────┬───────┬────────┬────────┤
│Name │ Age │Type│ OVR │Demand│Phase  │Offers │My Offer│ Action │
├─────┼─────┼────┼─────┼──────┼───────┼───────┼────────┼────────┤
│Judge│  34 │ B  │ 72  │$12M  │Listen.│  3    │$13.7M  │[Update]│
│Smith│  28 │ P  │ 65  │$8M   │ Open  │  0    │  —     │[Offer] │
│Doe  │  31 │ B  │ 58  │$4M   │  —    │  —    │  —     │[View]  │
└─────┴─────┴────┴─────┴──────┴───────┴───────┴────────┴────────┘
                                                  Page 1 of 5  ▶
```

- **Phase column**: Show badge (green=Open, yellow=Listening, red=Finalize, gray=none)
- **Action button**: "Offer" if no auction or open auction with no offer; "Update" if has existing offer; "View" for detail modal
- Clicking any row opens the [Player Detail Modal](#player-detail-modal)

---

## Auction Board

A focused view showing only players currently in an active auction, enriched with fuzzed ratings.

### Loading the Board

```
GET /api/v1/fa-auction/board
  ?league_year_id={leagueYearId}
  &org_id={orgId}
```

### Response

Array of auction entries:

```json
{
  "auction_id": 42,
  "player_id": 12345,
  "player_name": "Aaron Judge",
  "player_type": "Position",
  "war": 4.2,
  "age": 34,
  "phase": "listening",
  "min_aav": 12000000.0,
  "min_total_value": 36000000.0,
  "min_years": 3,
  "max_years": 5,
  "offer_count": 3,
  "competing_teams": ["BOS", "LAD", "NYY"],
  "my_offer": { /* same shape as pool */ },
  "entered_week": 12,
  "listed_position": "RF",

  "bio": { /* same shape as pool bio */ },
  "ratings": {
    "contact_display": 65,
    "power_display": 75,
    "c_rating": 20,
    "rf_rating": 72,
    "sp_rating": null,
    "pitch1_ovr": null
  },
  "potentials": {
    "contact_pot": "A",
    "power_pot": "A+"
  },
  "scouting": {
    "attrs_precise": false,
    "pots_precise": false,
    "available_actions": ["pro_attrs_precise", "pro_potential_precise"]
  }
}
```

**Key display rules:**
- `competing_teams` is alphabetically sorted — this is intentional. Do NOT reorder by offer value (that info is hidden).
- The number of offers is shown, but NOT the competing offer amounts.
- The viewer's own offer (`my_offer`) shows exact details.

---

## Player Detail Modal

Shown when a user clicks a player row on the FA pool or auction board.

### Loading Detail

```
GET /api/v1/fa-auction/player-detail/{playerId}
  ?viewing_org_id={orgId}
  &league_year_id={leagueYearId}
```

### Response

```json
{
  "id": 12345,
  "displayovr": 72,
  "bio": {
    "firstname": "Aaron",
    "lastname": "Judge",
    "age": 34,
    "ptype": "Position",
    "area": "US",
    "height": 79,
    "weight": 282,
    "bat_hand": "R",
    "pitch_hand": "R",
    "arm_angle": null,
    "durability": 65,
    "injury_risk": 30,
    "pitch1_name": null
  },

  "ratings": {
    "contact_display": 65,
    "power_display": 75,
    "eye_display": 60,
    "discipline_display": 55,
    "speed_display": 45,
    "c_rating": 20,
    "ss_rating": 30,
    "rf_rating": 72,
    "sp_rating": null,
    "rp_rating": null,
    "pitch1_ovr": null
  },

  "potentials": {
    "contact_pot": "A",
    "power_pot": "A+",
    "speed_pot": "?"
  },

  "contract_history": [
    {
      "org": "NYY",
      "years": 5,
      "salary": 18000000.0,
      "bonus": 10000000.0,
      "signed_year": 2021,
      "is_extension": false,
      "is_buyout": false
    }
  ],

  "demand": {
    "min_aav": "12000000.00",
    "min_years": 3,
    "max_years": 5,
    "war": 4.2
  },

  "auction": {
    "auction_id": 42,
    "phase": "listening",
    "min_aav": 12000000.0,
    "offer_count": 3,
    "competing_teams": ["BOS", "LAD", "NYY"],
    "my_offer": null
  },

  "scouting": {
    "unlocked": [],
    "attrs_precise": false,
    "pots_precise": false,
    "available_actions": ["pro_attrs_precise", "pro_potential_precise"]
  },

  "stats_summary": {
    "batting": {
      "avg": ".285",
      "hr": 35,
      "rbi": 0,
      "ab": 520,
      "hits": 148,
      "walks": 78,
      "sb": 5
    },
    "pitching": null
  }
}
```

### Attribute Display Logic

| `scouting.attrs_precise` | How to Show Ratings |
|--------------------------|---------------------|
| `false` | Values are **fuzzed** 20-80 numbers — shifted from true value |
| `true` | Values are **precise** 20-80 numbers |

| `scouting.pots_precise` | How to Show Potentials |
|--------------------------|------------------------|
| `false` | Show as fuzzed letter grades or `"?"` for unknown |
| `true` | Show as precise letter grades |

### Suggested Modal Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Aaron Judge  ·  34  ·  Position  ·  R/R  ·  6'7" 282 lbs  │
│  OVR: 72  ·  WAR: 4.2  ·  Last: NYY (MLB)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  RATINGS (20-80 fuzzed)      POTENTIALS (fuzzed)             │
│  Contact: A-                 Contact: A                      │
│  Power:   A                  Power:   A+                     │
│  Speed:   C+                 Speed:   ?                      │
│  [🔍 Scout Attributes $15]  [🔍 Scout Potentials $15]       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  LAST SEASON                                                 │
│  .285 AVG · 35 HR · 148 H · 78 BB · 520 AB                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  DEMANDS                          CONTRACT HISTORY           │
│  Min AAV:  $12,000,000           NYY · 5yr · $18M/yr        │
│  Years:    3-5                     signed 2021               │
│  WAR:      4.2                                               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  AUCTION STATUS: Listening  ·  3 offers                      │
│  Competing: BOS, LAD, NYY                                    │
│  Your offer: —                                               │
│                                                              │
│  [Make Offer]                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Making an Offer

### Submit Offer (new or update)

```
POST /api/v1/fa-auction/{auctionId}/offer
```

```json
{
  "org_id": 1,
  "years": 3,
  "salaries": [12000000, 13000000, 14000000],
  "bonus": 5000000,
  "level_id": 9,
  "league_year_id": 5,
  "game_week_id": 12,
  "current_week": 12,
  "executed_by": "user"
}
```

**Important fields:**
- `salaries` must be an array with exactly `years` entries (one salary per year)
- `bonus` is paid from the org's cash balance immediately at signing
- `salaries` are future payroll obligations (deducted weekly from revenue)
- `level_id` is the level the player will be assigned to

**Response (success):**

```json
{
  "offer_id": 101,
  "auction_id": 42,
  "org_id": 1,
  "years": 3,
  "bonus": 5000000.0,
  "total_value": 44000000.0,
  "aav": 14666666.67,
  "is_update": false,
  "phase": "open"
}
```

**Error responses (400):**

```json
{ "error": "Total value (30000000) below player minimum (36000000)" }
{ "error": "Bonus (20000000) exceeds available budget (15000000)" }
{ "error": "Listening phase: only existing bidders can update offers" }
{ "error": "Listening phase: new AAV (12000000) must be >= old AAV (13000000)" }
{ "error": "Finalize phase: only existing bidders can update offers" }
{ "error": "Your offer was eliminated — cannot update" }
```

### Offer Form Validation (client-side)

Before submitting, validate:

1. **Total value >= player's min_total_value**: `sum(salaries) + bonus >= demand.min_aav * years`
2. **Bonus <= available budget**: Check against `/transactions/signing-budget/{orgId}`
3. **Years within range**: `demand.min_years <= years <= demand.max_years` (1-5 hard limit)
4. **AAV not decreased** (if updating): new AAV must be >= previous `my_offer.aav`

Show a live-computed AAV and total value as the user fills in salaries:

```
AAV = (sum(salaries) + bonus) / years
Total Value = sum(salaries) + bonus
```

**Strategy hint:** Display a contextual tip based on the player's age:
- Age ≤ 28: _"This player values total guaranteed money — consider more years."_
- Age 29–31: _"This player weighs annual salary and total value equally."_
- Age 32–33: _"This player prioritizes annual salary over total years."_
- Age 34+: _"This player is focused on maximizing per-year pay."_

### Withdraw Offer

Only allowed during the **Open** phase.

```
DELETE /api/v1/fa-auction/{auctionId}/offer/{orgId}
```

Response: `{ "withdrawn": true, "auction_id": 42, "org_id": 1 }`

---

## Inline Scouting

Users can spend scouting points directly from the FA page to reveal precise attributes.

### Scout a Player

```
POST /api/v1/fa-auction/scout-player
```

```json
{
  "org_id": 1,
  "league_year_id": 5,
  "player_id": 12345,
  "action_type": "pro_attrs_precise"
}
```

**Available action types for free agents:**

| Action | Cost | What It Reveals |
|--------|------|-----------------|
| `pro_attrs_precise` | 15 pts | True 20-80 numeric attribute ratings |
| `pro_potential_precise` | 15 pts | True potential letter grades |

**Response:**

```json
{
  "scouting_result": {
    "status": "unlocked",
    "action_type": "pro_attrs_precise",
    "cost": 15,
    "budget": {
      "total_points": 500,
      "spent_points": 215,
      "remaining_points": 285
    }
  },
  "player": {
    /* Full player detail with updated visibility — same shape as player-detail endpoint */
  }
}
```

After scouting, the `player` object in the response will have:
- `ratings` values become **precise** 20-80 numbers (if attrs were scouted)
- `potentials` values become **precise** letter grades (if potentials were scouted)
- `scouting.attrs_precise` / `scouting.pots_precise` will be `true`

**Update the UI in-place** with the returned `player` object — no need for a second API call.

If the player was already scouted: `status` will be `"already_unlocked"` and `cost` will be `0`.

### Scouting Budget

Check remaining scouting points:

```
GET /api/v1/scouting/budget/{orgId}?league_year_id={leagueYearId}
```

Response:
```json
{
  "org_id": 1,
  "total_points": 500,
  "spent_points": 200,
  "remaining_points": 300
}
```

---

## Roster Table: Extension Modal

> **Updated 2026-11-21:** eligibility, error codes and the "anytime" rule are in
> `contract_extensions_frontend_guide.md`, which supersedes this section where
> they differ. Short version: only FA-eligible MLB players in their final season
> (`extension_eligible: true` on the contract overview), only by the holding org,
> any time until End Season, unlimited offers; `game_week_id` is optional.

On the user's roster page, show an "Extend" button where the contract overview row has `extension_eligible: true`.

### Loading Contract Overview with Demands

```
GET /api/v1/transactions/contract-overview/{orgId}?league_year_id={leagueYearId}
```

Each player in the response includes a `demand` object when `league_year_id` is provided:

```json
{
  "player_id": 12345,
  "player_name": "Aaron Judge",
  "age": 34,
  "position": "Position",
  "contract_id": 789,
  "current_level": 9,
  "years": 3,
  "current_year": 3,
  "years_remaining": 0,
  "salary": 15000000.0,
  "on_ir": false,
  "mlb_service_years": 8,
  "contract_phase": "fa_eligible",
  "years_to_arb": null,
  "years_to_fa": null,
  "is_expiring": true,
  "demand": {
    "type": "extension",
    "min_aav": "10800000.00",
    "min_years": 2,
    "war": 4.2,
    "buyout_price": "7500000.00"
  }
}
```

### When to Show Extension vs Buyout Buttons

| Condition | Button |
|-----------|--------|
| `extension_eligible == true` (MLB, `is_expiring`, `contract_phase == "fa_eligible"`, no extension yet) | Show **Extend** button |
| Any player with an active contract | Show **Buyout** button |
| `contract_phase` is `minor`, `pre_arb` or `arb_eligible` | No extend button (renewed automatically) |

### Extension Modal

When the user clicks "Extend":

```
┌──────────────────────────────────────────────────────────┐
│  Extend: Aaron Judge                                     │
│                                                          │
│  PLAYER DEMANDS                                          │
│  Min AAV: $10,800,000  ·  Years: 2-5  ·  WAR: 4.2      │
│                                                          │
│  YOUR OFFER                                              │
│  Years: [3 ▼]                                            │
│  Signing Bonus: [$5,000,000    ]                         │
│                                                          │
│  Year 1 Salary: [$11,000,000   ]                         │
│  Year 2 Salary: [$12,000,000   ]                         │
│  Year 3 Salary: [$13,000,000   ]                         │
│                                                          │
│  Total Value: $41,000,000   AAV: $13,666,667             │
│  ✅ Meets player minimum                                 │
│                                                          │
│  [Submit Extension]                                      │
└──────────────────────────────────────────────────────────┘
```

### Submit Extension

```
POST /api/v1/transactions/extend
```

```json
{
  "contract_id": 789,
  "org_id": 1,
  "years": 3,
  "salaries": [11000000, 12000000, 13000000],
  "bonus": 5000000,
  "league_year_id": 5,
  "game_week_id": 12,
  "executed_by": "user"
}
```

**Validation (server-side, will return 400):**
- `Extension AAV ({offer}) below player's minimum demand ({min_aav})`
- `Extension years ({years}) below player's minimum demand ({min_years} years)`
- `Signing bonus ({bonus}) exceeds available budget ({budget})`

**Success response:**

```json
{
  "transaction_id": 55,
  "original_contract_id": 789,
  "extension_contract_id": 790,
  "player_id": 12345,
  "years": 3,
  "bonus": 5000000.0,
  "starts_league_year": 2027
}
```

---

## Roster Table: Buyout Modal

Any player on the roster can be bought out.

### Buyout Modal

When the user clicks "Buyout":

```
┌──────────────────────────────────────────────────────────┐
│  Buyout: Aaron Judge                                     │
│                                                          │
│  PLAYER DEMANDS                                          │
│  Minimum Buyout: $7,500,000  ·  WAR: 4.2                │
│  Remaining Guaranteed: $15,000,000                       │
│                                                          │
│  YOUR OFFER                                              │
│  Buyout Amount: [$8,000,000    ]                         │
│  ✅ Meets player minimum                                 │
│                                                          │
│  [Confirm Buyout]                                        │
└──────────────────────────────────────────────────────────┘
```

### Submit Buyout

```
POST /api/v1/transactions/buyout
```

```json
{
  "contract_id": 789,
  "org_id": 1,
  "buyout_amount": 8000000,
  "league_year_id": 5,
  "game_week_id": 12,
  "executed_by": "user"
}
```

**Validation (server-side):**
- `Buyout amount ({amount}) below player's minimum demand ({min_price})`
- The buyout amount is deducted from the org's cash balance immediately.

**Success response:**

```json
{
  "transaction_id": 56,
  "contract_id": 789,
  "buyout_contract_id": 791,
  "player_id": 12345,
  "buyout_amount": 8000000.0
}
```

After a successful buyout, the player is released and (if FA-eligible) automatically enters the free agent auction.

---

## Market Dashboard

Shows historical contract pricing data.

### Loading Market Data

```
GET /api/v1/fa-auction/market-summary?league_year_id={leagueYearId}
```

### Response

```json
{
  "dollar_per_war": "8500000.00",
  "total_signings": 42,
  "avg_years": 2.3,
  "avg_aav": "6500000.00",
  "avg_total_value": "14950000.00",
  "war_tiers": {
    "0-1": 15,
    "1-2": 12,
    "2-3": 8,
    "3-4": 5,
    "4+": 2
  },
  "recent_signings": [
    {
      "player_id": 456,
      "name": "Mike Trout",
      "war": 5.1,
      "total_value": "85000000.00",
      "aav": "17000000.00",
      "years": 5,
      "age": 31,
      "source": "fa_auction"
    }
  ]
}
```

**`source` values:** `fa_auction`, `direct_signing`, `extension`, `arb_renewal`

### Current $/WAR Rate

```
GET /api/v1/fa-auction/market-rate?league_year_id={leagueYearId}
```

Response: `{ "dollar_per_war": "8500000.00" }`

---

## Signing Budget

### Check Available Cash

```
GET /api/v1/transactions/signing-budget/{orgId}?league_year_id={leagueYearId}
```

Response: `{ "org_id": 1, "available_budget": 45000000.0 }`

This is the org's cash balance minus already-committed signing bonuses for the current year. **Only bonuses** come from this balance — salaries are future payroll obligations deducted weekly from game revenue.

**Display this prominently** on the offer form so users know their ceiling for bonuses.

---

## Endpoint Reference

### Free Agent Browsing

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/fa-auction/free-agent-pool` | Paginated FA list with fuzzed attrs, demands, auction status |
| GET | `/fa-auction/player-detail/{id}` | Full player profile modal |
| GET | `/fa-auction/board` | Active auctions only, with ratings |
| GET | `/fa-auction/market-summary` | Market pricing dashboard data |
| GET | `/fa-auction/market-rate` | Current $/WAR rate |

### Auction Actions

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/fa-auction/{auctionId}/offer` | Submit or update an offer |
| DELETE | `/fa-auction/{auctionId}/offer/{orgId}` | Withdraw (open phase only) |
| POST | `/fa-auction/scout-player` | Inline scouting + refreshed detail |
| POST | `/fa-auction/advance-phases` | Admin: manually trigger phase transitions |

### Roster Contract Actions

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/transactions/contract-overview/{orgId}?league_year_id=X` | Roster with demand data |
| POST | `/transactions/extend` | Submit extension offer |
| POST | `/transactions/buyout` | Submit buyout |
| GET | `/transactions/signing-budget/{orgId}?league_year_id=X` | Available cash for bonuses |
| GET | `/transactions/contract-status/{playerId}` | Single player contract info |

### Demand Computation

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/fa-auction/player-demand/{id}?league_year_id=X&type=fa` | Cached demand lookup |
| POST | `/fa-auction/compute-demands` | Force (re)compute a demand |

---

## Common Patterns

### Currency Display

All monetary values from the API are either `string` (Decimal precision, e.g., `"12000000.00"`) or `float`. Parse with `parseFloat()` and format with `toLocaleString()`:

```js
const formatted = '$' + parseFloat(demand.min_aav).toLocaleString();
// → "$12,000,000"
```

### Offer AAV Calculation

```js
const totalValue = salaries.reduce((a, b) => a + b, 0) + bonus;
const aav = years > 0 ? totalValue / years : 0;
```

### Phase Badge Colors

```js
const phaseColors = {
  open: 'green',
  listening: 'yellow',
  finalize: 'red',
  completed: 'gray',
  withdrawn: 'gray',
};
```

### Error Handling

All endpoints return errors as `{ "error": "message" }` with HTTP 400. Display the error message directly — it's user-readable (e.g., "Bonus exceeds available budget").

### Refreshing After Actions

After these actions, refresh the relevant data:
- **After submitting an offer**: Refresh the pool/board row for that player
- **After scouting**: Use the `player` object from the scout response directly
- **After extension/buyout**: Refresh the contract overview for the org
- **After placing/withdrawing a waiver claim**: Refresh the waiver wire list
- **After a week advances**: Auction phases may have changed — refresh the board. Waivers may have resolved — refresh the waiver wire and FA pool.

---

## Free Agent Tiers (`fa_type`)

Every player in the FA pool now includes an `fa_type` field that classifies their free agency tier. This determines their demand floor, whether they go through the auction, and how the UI should present them.

### Tier Definitions

| `fa_type` | Condition | Demand | Auction? |
|-----------|-----------|--------|----------|
| `mlb_fa` | 6+ MLB service years | WAR-based (min $1.6M AAV, multi-year) | Yes — 3-phase auction |
| `arb` | Level 9, 3-5 service years | $800,000 / 1 year | No — direct signing |
| `pre_arb` | Level 9, <3 service years | $800,000 / 1 year | No — direct signing |
| `milb_fa` | Last level 4-8 | $40,000 / 1 year | No — direct signing |

### Updated Player Object in Pool

The pool response now includes `fa_type` on every player:

```json
{
  "id": 54321,
  "firstname": "Joe",
  "lastname": "Smith",
  "fa_type": "pre_arb",
  "last_level": 9,

  "auction": null,
  "demand": {
    "min_aav": "800000",
    "min_years": 1,
    "max_years": 1,
    "war": 0.0
  }
}
```

**Key change**: `demand` is now guaranteed non-null for all pool players. Players without pre-existing demand records get one auto-generated based on their tier.

### How `fa_type` Affects the UI

| `fa_type` | Auction column | Action button | Signing flow |
|-----------|---------------|---------------|-------------|
| `mlb_fa` | Shows phase badge | "Offer" / "Update" | Through auction (`POST /fa-auction/{id}/offer`) |
| `arb` | "—" (no auction) | "Sign" | Direct (`POST /transactions/sign`) |
| `pre_arb` | "—" (no auction) | "Sign" | Direct (`POST /transactions/sign`) |
| `milb_fa` | "—" (no auction) | "Sign" | Direct (`POST /transactions/sign`) |

### Filtering by Tier

Add an `fa_type` filter dropdown to the pool page:

```
┌──────────┐ ┌────────┐ ┌─────────────┐ ┌──────────┐ ┌───────────┐
│ Type ▼   │ │ Age ▼  │ │ Search...   │ │In Auction│ │ FA Tier ▼ │
└──────────┘ └────────┘ └─────────────┘ └──────────┘ └───────────┘
                                                       All
                                                       MLB FA
                                                       Arb-Eligible
                                                       Pre-Arb
                                                       MiLB FA
```

Filter client-side on the `fa_type` field since it's already in the response.

### Signing Non-Auction Free Agents

For `arb`, `pre_arb`, and `milb_fa` players (those without an active auction), use the direct signing endpoint:

```
POST /api/v1/transactions/sign
```

```json
{
  "player_id": 54321,
  "org_id": 1,
  "years": 1,
  "salaries": [800000],
  "bonus": 0,
  "level_id": 9,
  "league_year_id": 5,
  "game_week_id": 16,
  "executed_by": "user"
}
```

**Response:**

```json
{
  "transaction_id": 1055,
  "contract_id": 999,
  "player_id": 54321,
  "years": 1,
  "bonus": 0.0,
  "roster_warning": null
}
```

**Validation:** The API enforces that the offer meets the player's demand floor. For non-auction tiers, the minimum is:
- `milb_fa`: $40,000 / 1 year
- `pre_arb` and `arb`: $800,000 / 1 year

Users can offer MORE than the minimum (more years, higher salary, bonus) — the demand is just the floor.

### Suggested Sign Modal (Non-Auction)

```
┌──────────────────────────────────────────────────────────────┐
│  Sign: Joe Smith  ·  28  ·  Pitcher  ·  Pre-Arb FA          │
│                                                              │
│  PLAYER DEMANDS                                              │
│  Minimum Salary: $800,000  ·  Min Years: 1                   │
│                                                              │
│  YOUR OFFER                                                  │
│  Years: [1 ▼]                                                │
│  Signing Bonus: [$0          ]                               │
│  Year 1 Salary: [$800,000    ]                               │
│                                                              │
│  Assign to Level: [MLB (9) ▼]                                │
│                                                              │
│  Total Value: $800,000   AAV: $800,000                       │
│  ✅ Meets player minimum                                     │
│                                                              │
│  [Sign Player]                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Waiver Wire

When a player is released mid-season, they are placed on the **waiver wire** for 1 week before becoming a free agent. During the waiver period, any org can place a claim. If multiple orgs claim, the one with the **worst record** (reverse standings order) wins and takes on the full remaining contract.

### How Players End Up on Waivers

The release endpoint now automatically places all released players on waivers:

```
POST /api/v1/transactions/release
```

```json
{
  "contract_id": 789,
  "org_id": 1,
  "league_year_id": 5,
  "executed_by": "user"
}
```

**Updated response** (now includes `waiver` info):

```json
{
  "transaction_id": 1020,
  "contract_id": 789,
  "player_id": 12345,
  "years_remaining_on_books": 2,
  "waiver": {
    "waiver_claim_id": 501,
    "expires_week": 16
  },
  "player": {
    "player_id": 12345,
    "player_name": "Joe Smith",
    "age": 28,
    "position": "Pitcher",
    "current_level": null,
    "on_ir": false
  }
}
```

### Waiver Wire List

```
GET /api/v1/transactions/waivers
  ?league_year_id={leagueYearId}
  &org_id={orgId}
```

`org_id` is optional — if provided, each entry includes a `my_bid` flag.

**Response:**

```json
{
  "ok": true,
  "count": 3,
  "waivers": [
    {
      "waiver_claim_id": 501,
      "player_id": 54321,
      "player_name": "Joe Smith",
      "ptype": "Pitcher",
      "age": 28,
      "displayovr": 62,
      "contract_id": 888,
      "releasing_org_id": 5,
      "releasing_org_abbrev": "BOS",
      "placed_week": 15,
      "expires_week": 16,
      "last_level": 9,
      "service_years": 4,
      "fa_type": "arb",
      "bid_count": 2,
      "my_bid": true
    }
  ]
}
```

### Waiver Detail

```
GET /api/v1/transactions/waivers/{waiverClaimId}?org_id={orgId}
```

**Response:**

```json
{
  "ok": true,
  "waiver_claim_id": 501,
  "player_id": 54321,
  "player_name": "Joe Smith",
  "ptype": "Pitcher",
  "age": 28,
  "displayovr": 62,
  "contract_id": 888,
  "releasing_org_id": 5,
  "releasing_org_abbrev": "BOS",
  "placed_week": 15,
  "expires_week": 16,
  "last_level": 9,
  "service_years": 4,
  "fa_type": "arb",
  "status": "active",
  "claiming_org_id": null,
  "resolved_at": null,
  "my_bid": false
}
```

`status` values: `active` (on waivers), `claimed` (awarded to a team), `cleared` (entered FA pool)

### Place a Waiver Claim

```
POST /api/v1/transactions/waivers/{waiverClaimId}/claim
```

```json
{ "org_id": 2 }
```

**Response:**

```json
{ "ok": true, "bid_id": 9001, "waiver_claim_id": 501 }
```

**Errors (400):**
- `"Waiver claim {id} is no longer active"` — waiver already resolved
- `"Cannot claim your own released player"` — self-claim prevention

### Withdraw a Waiver Claim

```
DELETE /api/v1/transactions/waivers/{waiverClaimId}/claim
```

```json
{ "org_id": 2 }
```

**Response:** `{ "ok": true, "withdrawn": true }`

### What Happens When Waivers Resolve

Waivers resolve automatically when `advance_week()` processes (or at end of regular season). Two outcomes:

| Outcome | What Happens | Frontend Impact |
|---------|-------------|-----------------|
| **Claimed** | Worst-record claimant gets the player + full remaining contract. Like a trade with 0% retention. | Player disappears from waiver wire. Appears on claiming org's roster. |
| **Cleared** | Old contract is finished. Player enters FA pool with tier-appropriate demand. | Player disappears from waiver wire. Appears in FA pool with `fa_type` and `demand`. |

After a week advances, refresh both the waiver wire and the FA pool.

### Suggested Waiver Wire UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Waiver Wire                                      Week 15 of 25│
├──────┬─────┬────┬─────┬─────────┬────────┬───────┬─────────────┤
│Name  │ Age │Type│ OVR │Released │Expires │Claims │    Action    │
├──────┼─────┼────┼─────┼─────────┼────────┼───────┼─────────────┤
│Smith │  28 │ P  │ 62  │ BOS     │ Wk 16  │  2    │[Withdraw]   │
│Jones │  24 │ B  │ 55  │ NYY     │ Wk 16  │  0    │[Claim]      │
│Brown │  31 │ P  │ 48  │ LAD     │ Wk 16  │  1    │[Claim]      │
└──────┴─────┴────┴─────┴─────────┴────────┴───────┴─────────────┘
```

- Show "Claim" if `my_bid` is false, "Withdraw" if `my_bid` is true
- Hide the claim button for the releasing org (API rejects it anyway)
- Show `bid_count` so users know competition level — but NOT which teams bid
- Show `fa_type` as a badge/tag (e.g., "MiLB FA", "Pre-Arb", "Arb", "MLB FA")
- After expiry, show resolved status in a "Recent Waivers" section if desired

### Claim Priority Rule

When multiple teams claim the same player, the team with the **worst record at that level** wins. This is reverse standings order — intentionally favoring weaker teams. The frontend does NOT need to compute this; the backend resolves it automatically.

### Waiver Wire Integration Points

The waiver wire should be accessible from:
1. **Roster page**: After releasing a player, show a confirmation that includes `waiver.expires_week`
2. **Transactions/activity feed**: Show waiver placements, claims, and resolutions
3. **Navigation**: Add a "Waivers" tab alongside "Free Agents" and "Auction Board"

---

## Updated Endpoint Reference

### Waiver Wire

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/transactions/waivers?league_year_id=X&org_id=Y` | List active waiver wire entries |
| GET | `/transactions/waivers/{id}?org_id=Y` | Single waiver detail |
| POST | `/transactions/waivers/{id}/claim` | Place a waiver claim |
| DELETE | `/transactions/waivers/{id}/claim` | Withdraw a waiver claim |

### Updated Existing Endpoints

| Endpoint | What Changed |
|----------|-------------|
| `POST /transactions/release` | Response now includes `waiver` object with `waiver_claim_id` and `expires_week` |
| `GET /fa-auction/free-agent-pool` | Each player now includes `fa_type` field. `demand` is guaranteed non-null for all players. |

---

## Updated Full Workflow: Player Lifecycle

```
Player under contract
        │
        ├─ Contract expires (end of season)
        │       │
        │       ├─ Minor/Pre-arb/Arb → Auto-renewed by holding org
        │       │
        │       └─ FA-eligible (6+ svc) → Enters 3-phase auction
        │                                       │
        │                                  fa_type: "mlb_fa"
        │
        └─ Released mid-season
                │
                └─ ALL releases → Waiver wire (1 week)
                        │
                        ├─ Claimed → Full contract transfers to claiming org
                        │            (worst record wins)
                        │
                        └─ Cleared → Old contract finished
                                │
                                ├─ svc >= 6 → Enters auction (fa_type: "mlb_fa")
                                ├─ level 9, svc 3-5 → FA pool (fa_type: "arb")
                                ├─ level 9, svc < 3 → FA pool (fa_type: "pre_arb")
                                └─ level < 9 → FA pool (fa_type: "milb_fa")
```
