# Sport UI guide: baseball and volleyball

**For:** anyone building or changing a baseball or volleyball page in this repository.
**Written:** 2026-11-16. The visual half is the page at `/sport-ui` ([SportUiPage.tsx](../src/components/Common/SportUiPage.tsx)). It is drawn with the real components, so it cannot drift from the code. Check it in both themes after changing anything shared.

Baseball and volleyball share one look and one way to get around. Other sports keep their own pages and are not covered here.

## 1. Principles

1. **One way to get around.** Every page of the two sports has the same banner in the same place, with the same links. Navigation lives in the banner; the side menu stays as the site-wide fallback.
2. **Show only what the API sends.** Never derive a hidden number, and never show a result before it is published (volleyball premieres).
3. **The user's own team comes first,** in its colours. Someone without a team sees the league in neutral colours.
4. **Theme first.** Every surface works in light and dark. Team colours are the only hard-coded colours, and they go through one helper.
5. **Shared code is the easy path.** If a rule here has no shared component or helper yet, add one rather than copying a pattern.

## 2. Page anatomy

From the top:

1. **Banner** (from the sport's frame, never drawn by the page):
   - the user's leagues, one row, across all sports;
   - the title row: logo, team or page name, a line for league · page · season, and an optional small line, with the page's own controls on the right;
   - under the title, **fact chips**: the user's team at a glance (rank, record, conference record, streak) and what the page is showing (a week, how many matches are live, unsaved changes);
   - optional: a row of the page's own tabs, such as baseball's levels;
   - the page links, grouped: Home | your team | players (baseball) | league;
   - optional, last and lighter: **the page's sections** (Matches | Standings | Rankings). Page, then section.
2. **Games bar,** on home pages only.
3. **Page body:** panels in a grid that collapses to one column on phones.

The banner is the page's anchor: what a page is, which part of it is open, which season, and the facts that frame it all live there, so the page body is only content. A page about one team (Team, Staff, Finances, a baseball org view) hands that team to the banner with `useSportBannerContent`. It puts its picker and buttons on the right with `SportBannerAside` (a season picker is `SportBannerPicker compact`; volleyball's is `VbBannerSeason`), a level switch with `SportBannerRows`, its sections with `SportBannerSections`, and its facts with `useSportBannerFacts`. Sections are kept in the address with `useSportSectionTab` (`?tab=`), so each can be linked to. It never draws a second coloured header.

Where it lives:
- [SportBanner.tsx](../src/components/Common/SportBanner.tsx): the banner, its rows, and the page-to-banner hand-off.
- [vbNav.ts](../src/components/Volleyball/vbNav.ts) and [baseballNav.tsx](../src/components/LandingPage/baseballNav.tsx): each sport's one list of pages.
- Volleyball's frame is `VbPageShell`. Baseball's is `BaseballRouteFrame`, set per route in `AuthRoutes.tsx`; `PageContainer` shows the banner it is given.

## 3. Colour

- **Team colours** go through `sportTeamColors(one, two)` in [sportTheme.tsx](../src/components/Common/sportTheme.tsx). A bright primary swaps with the secondary; matching colours get a white accent; missing colours give neutral gray. Never pick `ColorOne` by hand.
- **Neutral league colours** (a viewer without a team): `#1F2937` with an amber accent.
- **Surfaces, not outlines.** A section is a filled surface (`--sport-surface`): near-white in light themes, a step lighter than the page in dark ones. Wells inside a surface (segmented tracks, inputs, small cards) use `--sport-surface-2`. Rows are divided by `--sport-divider`. All four are derived from each theme's own colours in `index.css`, so every site theme gets them.
- **Everything else** is a theme variable: `--bg-primary`, `--bg-secondary`, `--bg-surface`, `--text-primary`, `--text-muted`, `--border-primary`, and the four accents. Write `text-(--text-muted)`, not `text-gray-400`; `bg-(--bg-surface)`, not `bg-gray-800`.
- **Results and live** use `sportStateCard`, `sportStateText` and `sportStatePill` (win, loss, live, next, upcoming). A result card is outlined in its colour with a light tint of it, as the other sports' games bars are; next and live are outlined only. A road match adds `sportAwayShade`, a faint shade (a neutral site counts as home). A live match always shows `LiveBadge`, and nothing else.
- **Records** are written with an en dash (`vbRecord`). They come from standings, never from a rankings route (the pro poll reports 0–0). A ranked team's number goes before its name, small and muted.

## 4. Components and when to use them

| Job | Use | Not |
|---|---|---|
| Go to another page | The banner's page links | Pill buttons, button rows, "quick links" cards |
| Change what the page shows (a team's levels) | A tab row on the banner (`BaseballLevelTabs`) | Cards or pills inside the page |
| Sections of one page | `SportBannerSections` with `useSportSectionTab`: the banner's last row. `UnderlineTabs` only inside a window (the player card) | `TabGroup`, pill buttons as tabs, tabs in the page body |
| Toggle or filter (Top 10/25, Poll/Elo/RPI, a news kind, a week) | `SportSegmented` (`VbChoice` uses it) | Coloured `Button`s with `isSelected`, pill buttons |
| A long list of choices | `SportSelect`, the same height as a segmented control | The design kit's tall dark `SelectDropdown` |
| Pick a team or an organisation | `SportBannerPicker` on the banner | A dropdown in the page body |
| Do something | `SportButton` (primary, secondary, success, danger; danger stays quiet until pointed at) | The design kit's `Button` (fixed blue and gray), a styled link |
| A player in a row | `VbPlayerLink`: her face beside her name, the faces of a table fetched together (`useVbFace`). `face={false}` where the row draws its own | A bare name, one face request per row |
| The league's forum on a home page | `SportForumPanel` | `ForumPortal` (other sports keep it) |
| Go somewhere inline | Text in `vbLinkClass` | A button |
| State a fact | `Tag` | A button-looking chip |
| Group content | `SportPanel` (`VbPanel` is it): a surface, an uppercase label, controls on the label line, a team-colour strip on your own team's panels | `Border` outlines, `SectionCards` coloured headers (`SportSectionCard` is a drop-in) |
| A small fact in a row (Injury, Commit) | `SportChip` | The design kit's `Tag` (its gray is unreadable in light themes) |
| Tables | `data-keep-table`, sideways scroll, sticky name column, numbers right-aligned in tabular figures | Tables that turn into cards below 900 px |

**Loading, empty and error:**
- Loading shows skeleton rows the size of what is coming.
- Empty says what is missing and what to do about it.
- An error says what failed in plain words and never blocks the rest of the page.

## 5. Numbers and words

- **Hitting** `.312`; **money** `$1,250,000`; **records** and **set scores** with an en dash (`19–0`, `25–21`); **air times** in the viewer's own time, with the day only when it is not today.
- **Plain, short sentences.** Say what the thing is, not how it works inside.
- **Coaches and staff are gender-neutral. Volleyball players are she/her.**
- **College ratings are always "Your staff's estimate".** Never a hidden number.

## 6. Phones

- Banner rows scroll sideways on a phone and wrap on wider screens.
- Pickers on the banner take the full width on a phone.
- Tap targets are at least the size of a banner tab.
- Tables scroll sideways inside their panel, never the page.

## 7. Audit (2026-11-16) and what is left

**Done in this pass:**
- **One banner on every page of both sports:**
  - The league pills on Home are replaced by the banner's leagues row.
  - The volleyball Team page's header and button row are folded in.
  - The volleyball Staff and Finances pickers moved to the banner.
- **Baseball folded in:** the coloured headers on Stats, Injuries, Training Camp, Intam Scouting, Recruiting, Schedule, Playoffs, Conference Tournaments, All-Star and WBC; the Team page header, org picker and button row; the Financials header and picker; Gameplan's header and level switch; and the duplicate titles on Trades, Free Agency, IFA and Scouting. The baseball home page uses the same level tabs and has its organisation picker back, on the banner.
- **One colour helper, one set of state colours, one live badge,** across volleyball.

**App-style surfaces (2026-11-16, later the same day):**
- **Shared kit:** [SportKit.tsx](../src/components/Common/SportKit.tsx) has `SportPanel`, `SportSurface`, `SportSectionCard`, `SportSegmented`, `SportSelect`, `SportChip` and the label style.
- **Volleyball, everywhere:** every `VbPanel` is a surface, every dropdown is `SportSelect`, and every toggle row is a segmented control. That includes `VbChoice`, the schedule weeks, Poll/Elo/RPI, news kinds, stats, records, roster, development, match sets and replay sets. Outlines and inputs are now surfaces and wells, the games bar is flat cards with a coloured top edge, and the home page puts the inbox beside one schedule panel (last result, then what is next).
- **Baseball home:** the games bar uses the same cards, and its twelve outlined `SectionCards` panels are sport panels.

**The banner as anchor (2026-11-16, volleyball):**
- **Sections on the banner:** Schedule, Stats, History, Team, Match, Development, Tactics, Finances, Free Agency, Trades and Recruiting moved their tabs to `SportBannerSections`, kept in `?tab=`. `UnderlineTabs` no longer picks up the site-wide button look (it drew filled boxes).
- **Season pickers on the banner:** Schedule, Stats, Top Plays and the Team page's schedule (`VbBannerSeason`).
- **Fact chips:** the coach's team on every page (rank, record, conference record, streak); the Team page's (who coaches it and "Your team", which replace the hard-to-read tags); Schedule (the week or team shown, live count); Lineup (whose picks play, unsaved changes).
- **Games bar:** outlined and tinted results, a faint shade on road matches, each opponent's rank before its name and record under it. The cards stay separate.
- **Faces** beside every `VbPlayerLink`, and on the Lineup page beside each pick and on the projected court.
- **Buttons:** every volleyball `Button` is a `SportButton`.
- **Forum panel:** the volleyball home uses `SportForumPanel`. The volleyball media forums (`media-simcvb`, `media-simpvb`) are not in `scripts/seedForums.js`, so they may not exist yet.
- **Schedule:** a team picker shows one team's whole season (`?team=`); tiles show each team's record and a college team's top-25 rank; live matches show their score so far.

**Left to do, largest first:**

| Finding | Baseball | Volleyball | Suggestion |
|---|---|---|---|
| Hard-coded grays (`text-gray-*`) | 742 | 0 | Replace with theme variables, page by page. Many break the light theme today (for example `text-gray-300` and `text-white` in the IFA and Free Agency headers). |
| Hard-coded gray backgrounds (`bg-gray-*`) | 446 | 2 | Same. |
| Team colours picked by hand (`useTeamColors` + `isBrightColor`) | 39 + 42 | 3 | Use `sportTeamColors`, or `useBaseballOrg` for the user's organisation. |
| Section tabs | `TabGroup` ×9, pill tabs (Free Agency) | Done (`SportBannerSections`) | Move baseball to `SportBannerSections`; its frame must pass the banner a `sectionsRef`. |
| Buttons | The design kit's `Button` | Done (`SportButton`) | `SportButton`. |
| Faces in rows | `PlayerPicture` in a few places | Done | A batched face cache like `useVbFace`, beside every player name. |
| Games bar | Same cards; no opponent rank, record or road shade | Done | The volleyball bar's additions. |
| Forum panel | `ForumPortal` | Done (`SportForumPanel`) | `SportForumPanel`. |
| Panels | `Border` and `SectionCards` on every page but home | Done | `SportPanel` / `SportSectionCard`, page by page. |
| Toggles | `PillButton` ×76, `TabGroup` ×9 | Done | `SportSegmented` and `UnderlineTabs`. |
| Roster level filter | `TeamSelectorCard` cards with counts | — | Decide whether the counts belong on the banner's level tabs. |
| Dropdown colours | Dark in both themes, except the banner pickers | Done (`SportSelect`) | `SportSelect` on baseball pages. |
| Tags on the banner | The green "Coached by a user" tag is hard to read on a red banner | Done (fact chips) | `useSportBannerFacts`. |
| Icons | ★ ● ▶ → typed as characters | Same | One small set from `_design/Icons`. |
| Page widths | `w-[95vw] sm:w-[90vw]` on most pages | Full width | One width rule from the container. |

## 8. Open decisions

- **Type:** keep the site font everywhere, or use the broadcast clips' Barlow Condensed for scoreboards and big numbers?
- **How strict:** is this a guide to follow, or does a page that bypasses the shared parts not ship?
