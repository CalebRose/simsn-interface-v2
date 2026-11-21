# Contract Extensions — frontend guide

An org can extend an MLB player whose contract is in its final season and who
is eligible for free agency. There is no window: extensions are open at any
time of year until End Season expires the contract. The org can offer as often
as it likes; an offer below the player's demand is rejected, an offer that
meets it is signed immediately.

All routes are under `/api/v1`. This replaces the "Roster Table: Extension
Modal" rules in `free_agency_frontend_guide.md`.

## 1. Who can be extended

All of these must hold:

| Rule | Field to read (contract overview) |
|---|---|
| MLB contract (level 9) | `current_level == 9` |
| Final season of the contract | `is_expiring == true` |
| Player is free-agent eligible (6+ MLB service years); minor-league renewals, pre-arbitration and arbitration players are **not** eligible | `contract_phase == "fa_eligible"` |
| No extension signed yet for this contract | `has_extension == false` |
| The org making the offer holds the contract | the overview only lists the org's own players |

The API computes this for you: **`extension_eligible: true`** on each
contract-overview row. Show the Extend button only when it is true.

## 2. What the player asks for

The player's demand comes from public stats (WAR) and the market rate:

- **minimum AAV** = 90 % of his free-agent value (a discount for security);
- **minimum years** by age (at least 2).

AAV is `(sum of salaries + bonus) / years`, so the signing bonus counts.
An offer is accepted when **AAV ≥ `min_aav` and years ≥ `min_years`**; there is
no chance involved and no limit on attempts. Years are 1–5.

Where to get it:

- the contract overview's `demand` object (cached demands only);
- `GET /api/v1/fa-auction/player-demand/{player_id}?league_year_id={ly}&type=extension`
  returns the cached demand, or 404 if none has been computed yet;
- `POST /api/v1/fa-auction/compute-demands` with
  `{ "player_id", "league_year_id", "demand_type": "extension", "contract_id" }`
  computes and caches it (call this when the modal opens and the GET returned 404).

The server also computes the demand itself on the first offer if none is cached.

```json
{ "player_id": 12345, "demand_type": "extension", "war": 4.2, "dollar_per_war": "2387000.00",
  "min_aav": "10800000.00", "min_years": 2, "max_years": 4, "min_total_value": "21600000.00",
  "age": 31, "service_years": 8 }
```

## 3. Contract overview fields

```
GET /api/v1/transactions/contract-overview/{orgId}?league_year_id={ly}
```

Each row now carries:

```json
{
  "player_id": 12345,
  "contract_id": 789,
  "current_level": 9,
  "years": 3, "current_year": 3, "years_remaining": 0,
  "contract_phase": "fa_eligible",
  "is_expiring": true,
  "has_extension": false,
  "extension_eligible": true,
  "demand": { "type": "extension", "min_aav": "10800000.00", "min_years": 2, "war": 4.2 }
}
```

- `has_extension` (new on this endpoint): an extension is signed and starts
  when this contract ends.
- `extension_eligible` (new): show the Extend button.
- `demand.type == "extension"` is attached only for extension-eligible players
  (and only once a demand has been computed; otherwise call the demand endpoint).

`GET /api/v1/transactions/contract-status/{player_id}` (single player) also
returns `has_extension` and `extension_eligible`.

## 4. Submit an offer

```
POST /api/v1/transactions/extend
{
  "contract_id": 789,
  "org_id": 1,
  "years": 3,
  "salaries": [11000000, 12000000, 13000000],
  "bonus": 5000000,
  "league_year_id": 5,
  "executed_by": "user"
}
```

`game_week_id` is optional now (the server uses the current week, and none in
the offseason). `salaries` must have one entry per year.

Accepted (200):

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

Rejected or not allowed (400): `{ "error": "validation", "code": ..., "message": ... }`

| `code` | Meaning | UI |
|---|---|---|
| `null` with message `Extension AAV (...) below player's minimum demand (...)` | Offer too low | Show "Offer rejected", keep the form open; the user can raise it and resend |
| `null` with message `Extension years (...) below player's minimum demand (...)` | Too short | Same |
| `null` with message `Signing bonus (...) exceeds available budget (...)` | Bonus over budget | Lower the bonus |
| `null` with message `Extension length must be 1-5 years` / `salaries length ... must match years` | Bad input | Form validation |
| `not_holder` | The org does not hold the contract | Hide the action |
| `not_mlb` | Not an MLB contract | Hide the action |
| `not_final_year` | Contract has seasons left after this one | Hide the action |
| `not_fa_eligible` | Pre-arbitration or arbitration player | Hide the action |
| `already_extended` | An extension is already signed | Show the extension instead |
| `not_in_force` / `not_found` | Contract finished, pending or unknown | Refresh |

## 5. What happens after signing

- The player stays on the roster once, under his current contract, until End
  Season. The extension does not appear as a second contract on rosters,
  ratings or the contract overview; `has_extension` turns true.
- The signing bonus is charged immediately.
- Payroll projections (`/transactions/payroll-projection/{orgId}`,
  obligations) include the extension's salaries in its seasons.
- At End Season the old contract ends and the extension takes over; the
  player never enters free agency. The salary of the extension's first season
  is paid from the next season on.
- If the player is traded before End Season, the extension goes with him.

## 6. UI suggestions

- Extend button on roster / contract rows where `extension_eligible`.
- Modal: demand line (min AAV, min years, WAR); years selector 1–5 starting at
  `min_years`; per-year salary inputs and a bonus field; live total and AAV
  with a "meets the player's demand" indicator (AAV ≥ `min_aav` and years ≥
  `min_years`).
- On a rejection keep the modal open with the message; the user can adjust and
  resend as often as they want.
- After signing: badge "Extended through {starts_league_year + years − 1}"
  and refresh the contract overview.
