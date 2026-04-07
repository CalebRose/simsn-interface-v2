# FA Pool API Response Alignment with Roster Player Shape

## Problem

The frontend has two separate table implementations for displaying player attributes — one for the roster page and one for the free agency pool — because the API returns different field structures for the same underlying data. We want to reuse the roster table components on the FA page (same columns, same layout, same cell styling, just different action buttons), but the field naming and nesting differences make this impractical without an adapter layer.

Aligning the FA pool API response shape with the roster player shape would let us delete ~500 lines of duplicate table code and guarantee visual consistency across both pages.

## Current Differences

### 1. Attribute field naming and nesting

**Roster player** (from roster/landing endpoints):
```json
{
  "ratings": {
    "contact_display": "A-",
    "power_display": 72,
    "speed_display": "B+",
    "fieldcatch_display": "C",
    "pendurance_display": 65,
    "sp_rating": 78,
    "rp_rating": 45,
    "c_rating": 0,
    "fb_rating": 55,
    "pitch1_ovr": 70
  },
  "potentials": {
    "contact_pot": "A",
    "power_pot": "A+",
    "speed_pot": "B"
  }
}
```

**FA pool player** (from `/fa-auction/free-agent-pool`):
```json
{
  "contact_base": "A-",
  "power_base": 72,
  "speed_base": "B+",
  "fieldcatch_base": "C",
  "pendurance_base": 65,
  "pitch1_ovr": 70,
  "contact_pot": "A",
  "power_pot": "A+",
  "speed_pot": "B"
}
```

**What's different:**
- Roster nests attributes under `ratings` and potentials under `potentials`; FA pool flattens everything to the top level
- Roster uses `_display` suffix; FA pool uses `_base` suffix
- The actual values are the same type (either fuzzed letter grades or precise 20-80 numbers depending on scouting)

### 2. Fields present in roster but missing from FA pool

| Field | Roster Source | Notes |
|-------|--------------|-------|
| `ratings.sp_rating` | Role rating (SP) | Useful for evaluating pitcher FAs |
| `ratings.rp_rating` | Role rating (RP) | Same |
| `ratings.c_rating`, `fb_rating`, `sb_rating`, `tb_rating`, `ss_rating`, `lf_rating`, `cf_rating`, `rf_rating`, `dh_rating` | Position ratings | Valuable for evaluating position player FAs |
| `ratings.baserunning_display` | Baserunning attribute | |
| `ratings.fieldspot_display` | Field spot attribute | |
| `ratings.catchframe_display` | Catcher framing | |
| `ratings.catchsequence_display` | Catcher sequencing | |
| `stamina` | Current fatigue (0-100) | Probably N/A for FAs — fine to omit |
| `is_injured` / `injury_details` | Injury status | Probably N/A for FAs — fine to omit |
| `contract` | Current contract details | N/A for FAs — fine to omit |

The position and role ratings are the most impactful gap. A user evaluating a free agent shortstop can't see their SS rating, which they can see on the roster page.

### 3. Fields unique to FA pool (keep these)

These are FA-specific and should remain on the FA pool response. The frontend will handle them separately from the shared table columns:

| Field | Purpose |
|-------|---------|
| `fa_type` | Tier classification (mlb_fa, arb, pre_arb, milb_fa) |
| `auction` | Active auction state (phase, offer count, my_offer) |
| `demand` | Player's contract demands (min_aav, years, war) |
| `scouting` | Scouting unlock state (attrs_precise, pots_precise, available_actions) |

## Requested Change

Restructure the `/fa-auction/free-agent-pool` player objects to match the roster shape for the overlapping fields:

```json
{
  "id": 12345,
  "firstname": "Aaron",
  "lastname": "Judge",
  "age": 34,
  "ptype": "Position",
  "listed_position": "RF",
  "displayovr": 72,
  "height": 79,
  "weight": 282,
  "bat_hand": "R",
  "pitch_hand": "R",

  "ratings": {
    "contact_display": "A-",
    "power_display": "A",
    "eye_display": "B+",
    "discipline_display": "B+",
    "speed_display": "C+",
    "baserunning_display": "C",
    "fieldcatch_display": "B",
    "fieldreact_display": "B+",
    "fieldspot_display": "B",
    "throwacc_display": "A-",
    "throwpower_display": "A",
    "catchframe_display": null,
    "catchsequence_display": null,
    "pendurance_display": null,
    "pgencontrol_display": null,
    "pthrowpower_display": null,
    "psequencing_display": null,
    "pickoff_display": null,
    "c_rating": 0,
    "fb_rating": 55,
    "sb_rating": 0,
    "tb_rating": 0,
    "ss_rating": 0,
    "lf_rating": 40,
    "cf_rating": 30,
    "rf_rating": 78,
    "dh_rating": 65,
    "sp_rating": null,
    "rp_rating": null,
    "pitch1_ovr": null,
    "pitch2_ovr": null,
    "pitch3_ovr": null,
    "pitch4_ovr": null,
    "pitch5_ovr": null
  },
  "potentials": {
    "contact_pot": "A",
    "power_pot": "A+",
    "eye_pot": "B",
    "discipline_pot": "B+",
    "speed_pot": "C+",
    "baserunning_pot": "C",
    "fieldcatch_pot": "B+",
    "fieldreact_pot": "A-",
    "fieldspot_pot": "B",
    "throwacc_pot": "A",
    "throwpower_pot": "A",
    "catchframe_pot": null,
    "catchsequence_pot": null,
    "pendurance_pot": null,
    "pgencontrol_pot": null,
    "pthrowpower_pot": null,
    "psequencing_pot": null,
    "pickoff_pot": null
  },

  "pitch1_name": null,
  "pitch2_name": null,
  "pitch3_name": null,
  "pitch4_name": null,
  "pitch5_name": null,

  "fa_type": "mlb_fa",
  "auction": { "..." : "unchanged" },
  "demand": { "..." : "unchanged" },
  "scouting": { "..." : "unchanged" }
}
```

### Key points

1. **Nest attributes under `ratings`** using `_display` suffix instead of flat `_base` suffix. The values are identical — this is purely a structural rename.
2. **Nest potentials under `potentials`** (already uses `_pot` suffix, just needs nesting).
3. **Include position ratings** (`c_rating`, `fb_rating`, etc.) and **role ratings** (`sp_rating`, `rp_rating`). These should respect the same fog-of-war/scouting rules as other attributes. Null for inapplicable positions is fine.
4. **Include missing attributes**: `baserunning_display`, `fieldspot_display`, `catchframe_display`, `catchsequence_display`.
5. **Keep FA-specific fields** (`fa_type`, `auction`, `demand`, `scouting`) at the top level — the frontend handles these separately.
6. **Fields OK to omit**: `contract`, `stamina`, `is_injured`, `injury_details`, `league_level`, `team_abbrev` — these don't apply to free agents.

### Same change for `/fa-auction/player-detail/{id}`

The player detail endpoint should align similarly. Its `attributes` and `potentials` objects should use the same `ratings`/`potentials` nesting and `_display`/`_pot` naming as above.

## Impact

Once this is done, the frontend can:
- Delete `FAPoolTable.tsx` (~490 lines)
- Reuse `AllPlayersTable`, `PositionTable`, and `PitcherTable` from the roster system directly
- Users see the same attribute columns (including position ratings) on both the roster and FA pages
- Only the action buttons differ per context
