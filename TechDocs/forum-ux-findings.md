# Community Forums: UX Review and Recommendations

Review of the forums front page, category directory, subforum thread lists, thread/reply view, and new-thread form, based on fourteen screenshots (seven desktop, seven mobile at an iPhone SE 375x667 viewport) and a layout description.

## 1. Summary

**What already works**
- Consistent dark theme and card language across pages
- Editorial hero gives the site a media-outlet feel
- "Last Viewed Threads" is a genuinely useful feature that most forums lack
- Breadcrumbs on inner pages, and a clear "Locked" banner
- Type tags (Article, etc.) on threads, and a postgame sidebar in media forums

**Biggest problems**
1. Information architecture: league forums live inside "Admin"
2. No league filtering anywhere on the front page
3. Automated posts (applications, postgame bots) drown out human content
4. Hero overlay text is unreadable on some thumbnails; empty-state hero card looks broken
5. Small, low-contrast secondary text everywhere (stats, timestamps, subforum links)
6. No unread/new indicators
7. Category cards are tall, mostly empty, and don't show *what* the latest activity is
8. Mobile: the hero takes about 60% of the viewport, and users scroll past two long list sections before reaching the category directory
9. Mobile: text and tap targets are below mobile minimums, quote blocks have rendering bugs, and the reply composer consumes most of the screen
10. Editorial carousel on mobile does not page in a consistent direction

## 2. Quick wins (low effort, high payoff)

| # | Fix | Where |
|---|-----|-------|
| 1 | Add a dark gradient scrim behind all hero overlay text | Hero cards |
| 2 | Add a fallback visual (league color/logo/pattern) when an article has no thumbnail | Hero |
| 3 | Insert spaces/separators when building excerpts (currently "TennesseeFloridaWestern Michigan...") or omit excerpts for table-style posts | Hero, thread lists |
| 4 | Fix pluralization ("1 threads" -> "1 thread") and the "Subscribers's Lounge" apostrophe ("Subscribers' Lounge") | Category cards |
| 5 | Investigate "No activity" on Welcome, which shows 472 threads and 788 posts (likely a last-activity bug) | Category cards |
| 6 | Raise minimum text size to 12-13px and meet 4.5:1 contrast for stats, timestamps, subforum links | Sitewide |
| 7 | Move the red Report flag into the "..." overflow menu | Posts |
| 8 | Fix reaction picker so it does not cover post text; show reaction counts | Posts |
| 9 | Add tooltips to editor toolbar icons | New thread form |
| 10 | Use symmetric 12-16px page gutters on mobile (currently about 32px left, 19px right) | Mobile, all pages |
| 11 | Shrink the mobile hero to about 200-240px tall | Mobile hero |
| 12 | Fix nested quote markup leaking as literal text ("[Quote: Spoof]") | Replies |
| 13 | Make quoted text smaller than the reply text; truncate on a word boundary with an ellipsis | Replies |
| 14 | Fix carousel paging direction (explicit direction state or looping clones) | Mobile hero |
| 15 | Raise mobile body text to 15-16px, meta text to 12px, tap targets to 44px | Mobile, sitewide |
| 16 | Compact the mobile reply toolbar and hide the "Ctrl+Enter" tip on touch devices | Reply composer |

## 3. Information architecture

**Problem:** SimCFB, SimNFL, SimCBB, etc. are subforums of "Admin" (breadcrumb: Forums / ADMIN / SIMCFB). Users looking for their league must guess to open Admin.

**Recommendation:** make leagues the top level.

```
Forums
  SimCFB      -> Announcements | Media | Discussion | Applications | Postgame
  SimCBB      -> ...
  SimNFL      -> ...
  Community   -> Welcome | Daily | Suggestions / Fixes | League Proposals
  Admin       -> Announcements | Dev Diaries (staff-focused)
  Subscribers' Lounge
```

**League filter:** add a chip row at the top of the front page (All / CFB / CBB / NFL / ...) that filters the hero, Latest Threads, and categories. Persist the choice per user, and consider a "my teams" setting that prioritizes content about the user's team.

## 4. Forum category cards (directory)

### Current issues
- Cards are full-width and ~175px tall, but content sits on the left and most of the card is empty
- The only activity info is tiny, right-aligned text ("Oct 27 / by TuscanSota") with no thread title
- Stats ("57 threads, 363 posts") compete with the content for attention
- No icon, color, or league identity, so every card looks identical
- No unread indicator at the category or subforum level

### Recommended layout: two zones per card

```
+----------------------------------------------------------------------+
| [icon]  Admin                                  | Latest               |
|         League administration and announce... | "Dev Diary #14: ..." |
|                                                | (avatar) TuscanSota  |
|  [Announcements 12] [Dev Diaries 5] [SimCFB]   | 2h ago               |
|  [SimNFL] [SimCBB] [SimNBA] +4 more            |                      |
|                                                | 57 threads | 363 posts|
+----------------------------------------------------------------------+
```

- **Left zone (flexible):** icon or league logo, title, one-line description, subforum links
- **Right zone (fixed ~280-320px):** latest thread title (single line, truncated), avatar, author, relative time, and stats in muted text beneath
- Cards drop to roughly 110-130px tall
- On mobile the right zone stacks under the left and stats collapse to one line

### Should we show the latest thread per forum? Yes.
- It tells users which areas are alive, which is the main job of a directory
- It differs from the site-wide Latest Threads column, so it is not redundant: that one answers "what's new anywhere," this one answers "what's new *here*"
- It replaces the least useful element currently on the card (the tiny date and author)

**Rules to make it work:**
- Exclude (or visually label) system-generated threads so bot posts do not dominate every card
- Respect permissions (do not leak titles from restricted forums such as the Subscribers' Lounge)
- Truncate to one line with an ellipsis, and use a link style that clearly reads as clickable
- Empty state: "No threads yet" rather than "No activity" when it is genuinely empty
- Optional: show last activity for each subforum on hover or in an expanded list
- If the sidebar columns stay, consider making Latest Threads collapsible or secondary so the directory gets more width

### Visual styling for category cards
- Add a 3-4px left accent border in the league's color (and a small logo or icon) so leagues are scannable
- Reduce stats to muted secondary text; do not make them the loudest element
- Hover state: slight background lift and border highlight; the whole card area (except links) should be clickable
- Allow collapsing categories and remember the state; this helps long pages (Welcome has 472 threads)
- Add an unread dot or bold title when a category has new activity since the user's last visit
- Group category cards under league or section headers rather than a single flat list
- Remove or restyle the floating "DIRECTORY" label; it currently reads as stray text

## 5. Subforum links (the blue chips)

### Current issues
- Small text, low contrast blue on slate, tight tap targets
- No counts, no unread state, no hint of which subforum is active
- Ten chips under Admin wrap as one undifferentiated row

### Recommendations
- Make chips at least 32px tall with comfortable horizontal padding (tap target 44px on mobile)
- Use a visible hover/focus state, and ensure 4.5:1 text contrast
- Show an optional count badge or unread dot per subforum
- Cap visible chips at about 6-8 with a "+N more" expander, or switch to a two-column subforum list (name, short description, last post time) for categories where subforums matter
- Once leagues are top-level, most cards will have only 3-5 subforums and the problem largely goes away

## 6. Thread list display (subforum pages)

### Current issues
- Each row is about 150px tall, so only about four threads fit on screen
- "Replies / Views / Last post" stacked labels are tiny and low-contrast
- Excerpt text is faint and run together
- Type tags only appear on some threads, and there is no way to filter by them
- No unread markers, no sort options, no pinned area

### Recommended row layout

```
+-----------------------------------------------------------------------------+
| [thumb]  [Article] 2027 Week 13 Committee Rankings        12    340   (av)   |
|          tsweezy . 13m ago . SimCFB                      replies views 13m   |
+-----------------------------------------------------------------------------+
```

- **Height:** about 64-80px, with a density toggle (Comfortable / Compact)
- **Left media:** thumbnail for articles, author avatar for discussion threads
- **Title line:** type tag as a colored prefix chip, then title; pinned/locked icons inline
- **Meta line:** author, created time, league (one line, 12-13px)
- **Stats column:** replies and views as icon plus number; emphasize high reply counts (a "hot" marker past a threshold)
- **Last post:** small avatar plus relative time
- **Excerpt:** a single line at most, hidden in compact mode, and never for table-style content
- **Unread:** bold title and a dot for threads with new replies since last visit
- **Mobile:** collapse stats into the meta line

### Tag color system (use consistently everywhere)
| Type | Suggested color |
|------|-----------------|
| Article | Blue |
| Press Conference | Purple |
| Postgame | Green |
| Rankings | Gold |
| Podcast | Orange |
| Proposal / Suggestion | Teal |

### Controls above the list
- Filter chips by type (All / Article / Press Conf / Rankings / Podcast)
- Sort: Latest / Last activity / Most viewed
- Pinned threads section at the top
- Pagination or infinite scroll, plus "jump to last post"

### Postgame threads sidebar
Currently nine near-identical rows ("Postgame Thread: MOST at NMSU, SimSN, 2d ago, 0 replies").
- Render as a **scoreboard**: team logos, final score, winner emphasized, link to box score and thread
- Drop the "SimSN" author and "0 replies" noise
- Add week filter or a "this week's games" header

## 7. Thread page and replies

- **Reaction picker** covers post text; anchor it to the action row or open it as a popover
- **Action buttons** (Reply, Quote) are low-contrast and unclear; Quote should visibly show what it is replying to
- **Author block:** add team badge/flair, role tag (GM, Coach, Mod), join date or post count; username hover cards
- **Timestamps:** relative on screen, exact on hover; increase size and contrast
- **Pin** "how to participate" threads (e.g. Create a Croot) and consider a structured form instead of copy-paste templates
- **Sticky quick-reply box** at the bottom of long threads
- Permalink and share affordance per post

## 8. New thread form

- Form is left-aligned with a large empty right side: center it, or use that space for posting guidelines, live preview, or "similar threads" suggestions while typing the title
- Body editor is about 120px tall: make it auto-grow
- Add a tag/prefix selector (Article, Press Conference, etc.)
- Add a cover-image picker when the thread feeds the editorial hero (avoids baked-in-text thumbnails clashing with overlays)
- Add draft autosave and a preview tab
- Per-forum templates, e.g. Suggestions / Fixes prefilled with Problem / Proposed change / Who it affects
- Tooltips on toolbar icons; raise contrast of the character counter

## 9. Editorial hero

- Gradient scrim behind overlay text; reduce title size on the large card
- Fallback visual when there is no thumbnail
- Allow staff to pin or feature a slot instead of strictly "three most recent"
- Increase size and contrast of the "EDITORIAL CONTENT" / "MEDIA SPOTLIGHT" micro-labels or drop one of them
- Let authors choose the cover image rather than auto-selecting the first screenshot

## 10. Global style guidance

- **Spacing:** use an 8px grid; tighten vertical padding on cards, loosen it between sections
- **Type scale:** titles 16-18px semibold, body 14-15px, meta 12-13px; avoid sub-12px text and tiny all-caps labels
- **Fonts:** keep the serif for editorial headlines only; use the sans for UI
- **Contrast:** secondary text and links need 4.5:1 against slate cards
- **Surfaces:** keep the slate cards, but add subtle hover states and softer borders so interactive elements are distinguishable from static ones
- **Responsive:** see Section 13 for mobile specifics; tablet widths still need a pass

## 11. Feature ideas

- Follow/subscribe to threads, with in-site notifications and @mentions
- Better search with filters (league, author, type, season/week)
- "Hot / trending" view based on recent reply velocity
- Structured rankings (table with movement arrows) instead of a text blob, plus polls on rankings
- League standings or schedule widget in each league's forum sidebar
- System-post filter: tabs on Latest Threads (All / Discussion / Media / Applications)

## 12. Suggested roadmap

**Phase 1: polish (days)**
Hero scrim and fallback, excerpt spacing, pluralization and typo fixes, "No activity" bug, text size and contrast, Report to overflow menu, reaction picker fix, toolbar tooltips, mobile gutters, mobile hero height, nested-quote bug, carousel direction fix, mobile text size and tap targets

**Phase 2: navigation (1-2 weeks)**
League-first category structure, league filter chips, category card redesign with latest thread per forum, system-post filtering, subforum chip restyle, mobile front-page tabs (Categories / Latest / Last viewed)

**Phase 3: engagement (2-4 weeks)**
Thread row redesign with filters and sort, unread markers, postgame scoreboard, author flair, new-thread form improvements and templates, mobile composer (bottom sheet, compact toolbar), quote block redesign

**Phase 4: depth**
Follow/notifications, hot/trending, structured rankings, search filters, swipe gestures, tablet and landscape pass

## 13. Mobile review

Reviewed at 375x667 (iPhone SE viewport in dev tools): front page, category directory, a subforum page, thread posts, quotes, and the reply composer.

### 13.1 What works
- Clean single-column stack with readable breadcrumbs and a clear primary button on the subforum page
- **The subforum page (Admin) already uses a strong mobile pattern:** one full-width row per subforum with a title, description, and Threads/Posts stats. This is better than the chip links on the front-page category cards, so reuse it there
- Sticky header with notifications, chat, and mail is the right idea

### 13.2 Header and page chrome
- The sticky header is about 70px, roughly 10% of an SE-sized screen, permanently. Shrink to 52-56px, or hide on scroll down and reveal on scroll up
- The bell, chat, and mail icons show no unread badges, so they cannot tell the user anything at a glance
- "Community Forums" wraps to two lines and "+ New Thread" wraps to two lines, with Search squeezed between. Use a shorter title ("Forums"), an icon-only Search button, and either an icon button or a floating "+" action for New Thread
- **Gutters are asymmetric:** about 32px on the left and about 19px on the right on every section, so cards look shifted right. Use symmetric 12-16px gutters, which also gives back roughly 10% of the width

### 13.3 Editorial carousel
- The hero is about 420px tall, around 60% of the viewport. With no thumbnail it is a large blank block. Target 200-240px (or 16:9) so the next section peeks above the fold
- Prev / Next buttons plus oversized pill dots is redundant on touch. Support swipe, use small dots, and drop or shrink the buttons
- Title text is large and centered over empty space; add the scrim and fallback visual from Section 9

**Paging direction is inconsistent.** Flipping through the editorials does not always move in the same direction. I have not seen the component code, so these are the likely causes, roughly in order:
1. **Wrap-around:** going from the last slide back to the first via Next computes direction from the index change (new index is lower than old), so it animates as "previous", or it smooth-scrolls backward across every slide
2. **Dot taps:** jumping 1 to 3 or 3 to 1 uses the same index-comparison logic
3. **Autoplay (if present)** reusing that logic or continuing after a manual interaction
4. **Scroll-snap containers:** a smooth `scrollTo(0)` on wrap visibly rewinds through the slides

Recommended fix:
- Store an explicit direction set by the action (Next or swipe-left = forward, Prev or swipe-right = backward) instead of deriving it from index comparison
- For wrap-around, either clone the first/last slide so Next always continues forward (true loop), or stop at the ends and disable the button
- For non-adjacent dot jumps, use a short crossfade rather than sliding past the middle slides
- Pause any autoplay on touch, and respect `prefers-reduced-motion`
- Sharing the carousel component would let me pinpoint which cause it is

### 13.4 Front page order
Current mobile order: hero, Last Viewed (5 rows), Latest Threads (10+ rows), then Forum Categories. Users scroll roughly three screens before reaching the directory.
- Add a segmented control or tabs under the hero: **Categories | Latest | Last viewed**, defaulting by user (returning users to Latest, new users to Categories)
- Or keep one list visible and cap it at 5 rows with a "See all" link
- Meta text ("13m ago", author, replies) is about 9-10px; raise it to 12px
- Thread rows have no dividers and tight padding; give each a 44px minimum tap height
- System-generated posts (CLAX / CFB / CBB applications) again fill the Latest list

### 13.5 Category cards on mobile
- Subforum links wrap into ragged rows (three rows for Admin) with no chip shape, and each tap target is about 20px tall
- The "Oct 27 / by TuscanSota" last-activity text is about 8px and effectively illegible
- Recommended: show the latest thread title instead (Section 4), render subforums as proper chips (36-44px tall) or collapse them behind an expander ("10 forums"), and reuse the subforum-page row pattern for the expanded list

### 13.6 Subforum page
- Row pattern is good, but descriptions are about 9-10px at low contrast and the "Threads / Posts" labels are tiny. Raise to 12-13px
- Add last-post time and an unread dot per row
- The descriptions ("SimCFB league announcements") under Admin reinforce the information-architecture issue in Section 3

### 13.7 Thread posts and quotes
- Body text is about 12px. Use 15-16px with a 1.5 line height
- **@mentions render as bordered gold pills with padding.** A paragraph with six of them reads as clutter and breaks the line flow. Use link-colored text with a subtle background, no border, and no extra margin, linking to the profile
- Reaction / Reply / Quote / Flag buttons are about 26px tall and gray. Reply and Quote look disabled. Use 44px targets, icon plus label, and readable contrast; move Report into the overflow menu
- The small "replied" badge beside a username is ambiguous. Replace it with something explicit ("Replying to Dean", "Author") or remove it

**Quote blocks:**
- **Hierarchy is inverted:** the quoted text is larger (about 14-15px) than the actual reply beneath it (about 11px). The quote should be smaller and muted, and the new reply should dominate
- **Truncation cuts mid-word** ("...and have also been helping plan out some needs for it, and m") with no ellipsis and no "show more". Truncate at a word boundary with an ellipsis and an expander
- **Nested quote markup leaks as text:** bundy's quote of Dean displays a literal "[Quote: Spoof] Also, will there be..." Strip nested quotes, or flatten to one level so a quote only shows the quoted author's own words
- Make the quote header ("Quote - Spoof") tappable to jump to the original post

### 13.8 Reply composer
- The full formatting toolbar (13+ buttons across three rows), a short text box, and the footer take most of the screen, and the keyboard covers the rest
- Recommended: a collapsed "Write a reply..." bar pinned to the bottom of the thread; tapping it opens a bottom sheet or full-screen composer with a single-row scrollable compact toolbar (bold, italic, link, quote, image, more)
- Hide "Tip: Ctrl+Enter to submit" on touch devices
- Set the textarea font size to at least 16px, otherwise iOS Safari zooms the page on focus
- The composer sits at the bottom of long threads, so add a "Jump to reply" / "Jump to latest" button
- Preserve drafts across navigation and app backgrounding
- The New Thread form likely needs the same treatment; I have not seen it on mobile

### 13.9 Mobile checklist
- Tap targets at least 44px; body text 15-16px; meta text at least 12px; 4.5:1 contrast
- Symmetric gutters; safe-area insets for notched devices
- Test with the keyboard open, at 320px and 375px widths, and in landscape
- Respect `prefers-reduced-motion` for carousel and popover animation

## 14. Open questions

- The carousel component code would let me pin down the direction bug rather than listing likely causes
- Tablet widths (768-1024px) and landscape have not been reviewed
- The New Thread form on mobile has not been reviewed
