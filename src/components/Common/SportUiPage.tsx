import { FC, ReactNode, useState } from "react";
import { PageContainer } from "../../_design/Container";
import { Button } from "../../_design/Buttons";
import { Tag } from "../../_design/Tags";
import { UnderlineTabs } from "../../_design/UnderlineTabs";
import {
  SportBanner,
  SportNavGroup,
  SportNavRow,
  SportTabRow,
  sportTabClass,
  sportTabStyle,
} from "./SportBanner";
import {
  LiveBadge,
  SportMatchState,
  sportStateCard,
  sportStatePill,
  sportStateText,
  sportTeamColors,
} from "./sportTheme";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import {
  vbCell,
  VbEmpty,
  vbHeadClass,
  vbLinkClass,
  vbNum,
  VbPanel,
  vbRowClass,
  vbStickyCell,
  vbTableClass,
} from "../Volleyball/VbCommon";
import { vbMoney, vbPct } from "../Volleyball/vbFormatting";
import { SkeletonRows } from "../../_design/SkeletonRows";
import { SportChip, SportSegmented, SportSelect } from "./SportKit";

// The sport UI kit, drawn with the real components: what baseball and
// volleyball pages are built from. The rules behind each part are in
// TechDocs/sport-ui-guide.md. Open it in both themes (the sun button in the
// header) when changing anything shared.

// Sample page links: the shape every sport's list has.
const sampleGroups: SportNavGroup[] = [
  { label: "Home", links: [{ label: "Home", path: "/sport-ui#home", exact: true }] },
  {
    label: "Your team",
    links: [
      { label: "Team", path: "/sport-ui#team" },
      { label: "Lineup", path: "/sport-ui#lineup" },
      { label: "Tactics", path: "/sport-ui#tactics" },
      { label: "Coach", path: "/sport-ui#coach" },
    ],
  },
  {
    label: "League",
    links: [
      { label: "Schedule", path: "/sport-ui" },
      { label: "Stats", path: "/sport-ui#stats" },
      { label: "History", path: "/sport-ui#history" },
    ],
  },
];

// Real colour pairs, including the awkward ones the rules exist for.
const samplePairs: Array<[name: string, one: string, two: string]> = [
  ["Dark primary", "#E41C38", "#FDF2D9"],
  ["Bright primary (swaps)", "#FFCD00", "#000000"],
  ["White primary (swaps)", "#FFFFFF", "#002D62"],
  ["Same two colours", "#4B2E83", "#4B2E83"],
  ["No colours", "", ""],
];

const themeTokens = [
  "--bg-primary",
  "--bg-secondary",
  "--bg-surface",
  "--text-primary",
  "--text-muted",
  "--border-primary",
  "--accent-primary",
  "--accent-success",
  "--accent-error",
  "--accent-warning",
];

const Section: FC<{ id: string; title: string; rule: string; children: ReactNode }> = ({
  id,
  title,
  rule,
  children,
}) => (
  <section id={id} className="space-y-2 text-left">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="max-w-3xl text-sm text-(--text-muted)">{rule}</p>
    {children}
  </section>
);

const StateCard: FC<{ state: SportMatchState; label: string; score?: string }> = ({
  state,
  label,
  score,
}) => (
  <div
    className={`flex w-28 shrink-0 flex-col items-center rounded-lg px-2 py-1.5 ${sportStateCard[state]}`}
  >
    <span className="text-[0.6rem] text-(--text-muted)">Wk 3</span>
    <span className="text-xs font-semibold">{label}</span>
    {state === "win" || state === "loss" ? (
      <>
        <span className={`text-sm font-bold ${sportStateText[state]}`}>{score}</span>
        <span
          className={`mt-0.5 rounded-sm px-1.5 py-px text-[0.55rem] font-bold uppercase ${sportStatePill[state]}`}
        >
          {state === "win" ? "W" : "L"}
        </span>
      </>
    ) : state === "live" ? (
      <LiveBadge className="mt-1 text-[0.65rem]" />
    ) : (
      <span className={`mt-1 text-[0.65rem] ${sportStateText[state]}`}>
        {state === "next" ? "8:00 PM" : "—"}
      </span>
    )}
  </div>
);

export const SportUiGuide: FC = () => {
  const [tab, setTab] = useState<"roster" | "schedule" | "history">("roster");
  const [rows, setRows] = useState<10 | 25>(10);
  const [measure, setMeasure] = useState("poll");
  const [season, setSeason] = useState({ value: "2026", label: "2026" });
  const red = sportTeamColors("#E41C38", "#FDF2D9");
  const navy = sportTeamColors("#002D62", "#EB6E1F");

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-2xl font-semibold">Sport UI kit</h1>
        <p className="max-w-3xl text-sm text-(--text-muted)">
          What baseball and volleyball pages are built from, drawn with the
          real components. The rules are in TechDocs/sport-ui-guide.md. Check
          changes here in both themes.
        </p>
      </div>

      <Section
        id="banner"
        title="The banner"
        rule="One per page, at the top, from the sport's frame. Title row: logo, team or page name, then a line for the league, page and season, then an optional small line. On the right: the page's own controls (pickers, a request button). Under it: the user's leagues (in the app), an optional tab row of the page's own (levels), then the page links. A page never draws a second coloured header; it hands its team to the banner."
      >
        <SportBanner
          color={red.color}
          accent={red.accent}
          title="Nebraska Cornhuskers"
          subtitle="SimCVB · Schedule · Big Ten · 2026 · Regular Season · Week 3"
          detail="Next advance: broadcast Week 3 Thursday · 6:17 PM"
          aside={<Tag variant="green">Coached by a user</Tag>}
        >
          <SportNavRow color={red.color} accent={red.accent} groups={sampleGroups} />
        </SportBanner>
        <SportBanner
          color={navy.color}
          accent={navy.accent}
          title="Houston Astros Organization"
          subtitle="SimMLB · Roster · Season 2026, Week 57"
        >
          <SportTabRow color={navy.color} label="Levels">
            {["MLB", "AAA", "AA", "High-A", "A"].map((level, index) => (
              <button
                key={level}
                type="button"
                className={`${sportTabClass(index === 0)} text-white`}
                style={sportTabStyle(index === 0, navy.accent)}
              >
                {level}
              </button>
            ))}
          </SportTabRow>
          <SportNavRow color={navy.color} accent={navy.accent} groups={sampleGroups} />
        </SportBanner>
        <SportBanner
          color="#1F2937"
          accent="#F59E0B"
          title="SimPVB · Schedule"
          subtitle="Someone without a team here: the league's neutral colours, league pages only"
        >
          <SportNavRow
            color="#1F2937"
            accent="#F59E0B"
            groups={sampleGroups.filter((group) => group.label !== "Your team")}
          />
        </SportBanner>
      </Section>

      <Section
        id="colour"
        title="Team colours"
        rule="Always through sportTeamColors(one, two). A bright primary (white, yellow) swaps with the secondary so text stays readable; matching colours get a white accent; no colours give neutral gray. Never pick ColorOne by hand."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {samplePairs.map(([name, one, two]) => {
            const { color, accent } = sportTeamColors(one, two);
            return (
              <div
                key={name}
                className={`rounded-lg p-3 text-sm ${getTextColorBasedOnBg(color)}`}
                style={{ backgroundColor: color, borderBottom: `4px solid ${accent}` }}
              >
                <div className="font-semibold">{name}</div>
                <div className="text-xs opacity-80">
                  in {one || "—"} / {two || "—"}
                </div>
                <div className="text-xs opacity-80">
                  out {color} / {accent}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        id="theme"
        title="Theme colours"
        rule="Everything that is not a team colour is a theme variable, so it works in light and dark: text-(--text-muted), bg-(--bg-surface) and so on. No text-gray-400, bg-gray-800 or text-white on page surfaces."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {themeTokens.map((token) => (
            <div
              key={token}
              className="overflow-hidden rounded border border-(--border-primary) text-xs"
            >
              <div className="h-10" style={{ backgroundColor: `var(${token})` }} />
              <div className="p-1 font-mono">{token}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="states"
        title="Results and live"
        rule="Win, loss, live, next and upcoming look the same everywhere: sportStateCard, sportStateText, sportStatePill. A live match always shows LiveBadge, nothing else."
      >
        <div className="flex flex-wrap gap-2">
          <StateCard state="win" label="vs Lamar" score="3 - 0" />
          <StateCard state="loss" label="@ Texas" score="1 - 3" />
          <StateCard state="live" label="@ New Mexico" />
          <StateCard state="next" label="@ Kentucky" />
          <StateCard state="upcoming" label="vs Ohio State" />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <LiveBadge />
          <LiveBadge label="Watch live" />
          <LiveBadge label="4 live" />
        </div>
      </Section>

      <Section
        id="panels"
        title="Surfaces, panels and tables"
        rule="No outlined boxes. A section is a filled surface (SportPanel), a step lighter than the page in dark themes and near-white in light ones, with a small uppercase label and its controls on the same line. Your own team's panels get a thin strip of its colour on top. Rows are divided by hairlines. Tables carry data-keep-table, scroll sideways when narrow, keep the name column in place, right-align numbers, and use tabular figures."
      >
        <VbPanel
          title="Standings · Big Ten"
          color={red.color}
          actions={
            <SportSegmented
              label="Rows shown"
              value={rows}
              onChange={setRows}
              options={[
                [10, "Top 10"],
                [25, "Top 25"],
              ]}
            />
          }
        >
          <table data-keep-table className={`${vbTableClass} min-w-[520px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={`${vbCell} text-right`}>#</th>
                <th className={vbCell}>Team</th>
                <th className={`${vbCell} text-right`}>Record</th>
                <th className={`${vbCell} text-right`}>Hitting</th>
                <th className={`${vbCell} text-right`}>Payroll</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, "Nebraska", "19-0", 0.312, 1250000],
                [2, "Penn State", "17-2", 0.287, 1100000],
                [3, "Wisconsin", "15-4", -0.012, 990000],
              ].map(([rank, name, record, pct, money]) => (
                <tr key={String(rank)} className={vbRowClass}>
                  <td className={vbNum}>{rank}</td>
                  <td className={`${vbCell} ${vbStickyCell}`}>
                    <span className={vbLinkClass}>{name}</span>
                  </td>
                  <td className={vbNum}>{record}</td>
                  <td className={vbNum}>{vbPct(pct as number)}</td>
                  <td className={vbNum}>{vbMoney(money as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </VbPanel>
      </Section>

      <Section
        id="tabs"
        title="Tabs, toggles and dropdowns"
        rule="Page links: the banner. A switch of what the page shows (a team's levels): a tab row on the banner. Sections of one page: UnderlineTabs. Every toggle and filter (Top 10/25, Poll/Elo/RPI, a news kind, a week): SportSegmented. A long list of choices: SportSelect, at the same height. Never coloured buttons as toggles."
      >
        <div className="flex flex-wrap items-center gap-3">
          <SportSegmented
            label="Ranking"
            value={measure}
            onChange={setMeasure}
            options={[
              ["poll", "Poll"],
              ["elo", "Elo"],
              ["rpi", "RPI"],
            ]}
          />
          <div className="w-40">
            <SportSelect
              options={[
                { value: "2026", label: "2026" },
                { value: "2025", label: "2025" },
              ]}
              value={season}
              onChange={(option) => option && setSeason(option)}
            />
          </div>
          <SportChip>Injury</SportChip>
          <SportChip>Commit</SportChip>
          <SportChip tone="attention">Needs your answer</SportChip>
        </div>
        <UnderlineTabs
          tabs={[
            ["roster", "Roster"],
            ["schedule", "Schedule"],
            ["history", "History"],
          ]}
          value={tab}
          onChange={setTab}
        />
      </Section>

      <Section
        id="actions"
        title="Buttons, links and tags"
        rule="A button does something (save, send, withdraw). A link goes somewhere and is text in vbLinkClass. A tag states a fact (Coached by a user, Your team) and is not clickable."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Save lineup</Button>
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
          <Button size="sm" variant="success">
            Request a team
          </Button>
          <Button size="sm" variant="danger">
            Leave team
          </Button>
          <span className={vbLinkClass}>Box score</span>
          <Tag variant="green">Coached by a user</Tag>
          <Tag variant="blue">Your team</Tag>
          <Tag variant="gray">AI coached</Tag>
        </div>
      </Section>

      <Section
        id="states-empty"
        title="Loading, empty and error"
        rule="Loading shows skeleton rows the size of what is coming. Empty says what is missing and, when there is one, what to do about it. Errors say what failed in plain words; they never block the rest of the page."
      >
        <div className="grid gap-2 lg:grid-cols-3">
          <VbPanel title="Loading">
            <div className="p-2">
              <SkeletonRows count={3} heightClass="h-6" />
            </div>
          </VbPanel>
          <VbPanel title="Empty">
            <VbEmpty>No match played yet this season.</VbEmpty>
          </VbPanel>
          <VbPanel title="Error">
            <VbEmpty tone="error">
              The volleyball service could not be reached. Try again in a moment.
            </VbEmpty>
          </VbPanel>
        </div>
      </Section>

      <Section
        id="words"
        title="Numbers and words"
        rule="Numbers in the sport's own style; words plain and short. Coaches and staff are gender-neutral; volleyball players are she/her. College ratings are always labelled as the staff's estimate."
      >
        <VbPanel>
          <table data-keep-table className={vbTableClass}>
            <tbody>
              {[
                ["Hitting percentage", vbPct(0.312), "three places, no leading zero"],
                ["Money", vbMoney(1250000), "dollars with separators"],
                ["Record", "19–0", "en dash"],
                ["Set score", "25–21, 23–25, 25–19", "home first unless a team's view"],
                ["Air time", "Sat 8:00 PM", "the viewer's own time; the day only when not today"],
                ["Rating (college)", "Your staff's estimate: B+", "never a hidden number"],
              ].map(([what, example, note]) => (
                <tr key={what} className={vbRowClass}>
                  <td className={vbCell}>{what}</td>
                  <td className={`${vbCell} font-semibold tabular-nums`}>{example}</td>
                  <td className="px-2 py-1.5 text-(--text-muted)">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </VbPanel>
      </Section>
    </div>
  );
};

/** The kit as a page of the site: /sport-ui. */
export const SportUiPage: FC = () => (
  <PageContainer direction="col">
    <SportUiGuide />
  </PageContainer>
);
