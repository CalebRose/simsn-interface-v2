import { FC, KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { display } from "facesjs";
import { Logo } from "../../_design/Logo";
import { SkeletonRows } from "../../_design/SkeletonRows";
import { useSimVBStore } from "../../context/SimVBContext";
import { SportPanel } from "../Common/SportKit";
import { SportBannerAside, SportBannerPicker } from "../Common/SportBanner";
import { sportTeamColors } from "../Common/sportTheme";
import { FaceDataResponse } from "../../models/footballModels";
import {
  VbApiError,
  VbFaceData,
  VbLeagueKind,
  VbTeam,
} from "../../_services/volleyballService";
import { getPlayerFace } from "../../_utility/usePlayerFaces";
import { vbPaths, vbTeamLogo } from "./vbFormatting";

/**
 * A page's season, picked on the banner's right. Every volleyball page that
 * shows one season at a time uses this one.
 */
export const VbBannerSeason: FC<{
  seasons: number[];
  season: number;
  onChange: (season: number) => void;
}> = ({ seasons, season, onChange }) => {
  const options = seasons.map((year) => ({
    value: String(year),
    label: String(year),
  }));
  return (
    <SportBannerAside>
      <SportBannerPicker
        compact
        aria-label="Season"
        options={options}
        value={options.find((option) => option.value === String(season)) ?? null}
        onChange={(option) => option && onChange(Number(option.value))}
      />
    </SportBannerAside>
  );
};

// Spans rather than buttons for inline links: the global button styles add
// padding, a hover border and a focus ring.
export const vbLinkProps = (onActivate: () => void) => ({
  role: "link",
  tabIndex: 0,
  onClick: onActivate,
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") onActivate();
  },
});

export const vbLinkClass =
  "cursor-pointer font-semibold transition-colors hover:text-(--accent-primary)";

interface VbTeamLinkProps {
  kind: VbLeagueKind;
  teamId: number;
  /** The name the response carried, shown as is. */
  name: string;
  seed?: number | null;
  showLogo?: boolean;
}

/** A team's logo and name, linking to its team page. */
export const VbTeamLink: FC<VbTeamLinkProps> = ({
  kind,
  teamId,
  name,
  seed,
  showLogo = true,
}) => {
  const navigate = useNavigate();
  const { vbTeamsById, vbLeagues } = useSimVBStore();
  return (
    <div className="flex min-w-0 items-center gap-2">
      {showLogo && (
        <Logo
          url={vbTeamLogo(vbTeamsById[teamId], kind, vbLeagues[kind])}
          variant="tiny"
          containerClass="shrink-0"
        />
      )}
      <span
        {...vbLinkProps(() => navigate(vbPaths(kind).team(teamId)))}
        // No weight of its own, so a table can bold the winner's name.
        className="cursor-pointer truncate transition-colors hover:text-(--accent-primary)"
      >
        {seed ? (
          <span className="mr-1 font-normal text-(--text-muted)">{seed}</span>
        ) : null}
        {name}
      </span>
    </div>
  );
};

interface VbPlayerFaceProps {
  face?: VbFaceData | null;
  team?: Pick<VbTeam, "ColorOne" | "ColorTwo" | "ColorThree"> | null;
  /** Tailwind size classes for the box. */
  classes?: string;
  /**
   * portrait: the whole face in a box (cards, the player page). avatar: a
   * round crop of the head, for a name in a row.
   */
  variant?: "portrait" | "avatar";
}

/** A player's face, drawn the same way the Discord clips draw it. */
export const VbPlayerFace: FC<VbPlayerFaceProps> = ({
  face,
  team,
  classes = "h-28 w-28",
  variant = "portrait",
}) => {
  const faceRef = useRef<HTMLDivElement>(null);
  const avatar = variant === "avatar";
  useEffect(() => {
    const container = faceRef.current;
    if (!container) return;
    container.innerHTML = "";
    if (!face) return;
    try {
      display(
        container,
        getPlayerFace(face as unknown as FaceDataResponse, null, team) as any,
      );
      const svg = container.querySelector("svg");
      svg?.setAttribute("preserveAspectRatio", "xMidYMid meet");
      // A round avatar: a square around the whole head, hair to chin, in
      // the face's 400 by 600 drawing, centred on it. Chosen by drawing a
      // dozen real faces at 24 and 88 pixels.
      if (avatar) svg?.setAttribute("viewBox", "-50 15 500 500");
    } catch {
      container.innerHTML = "";
    }
  }, [face, avatar, team?.ColorOne, team?.ColorTwo, team?.ColorThree]);
  // The ring is her team's colour, so a row says where she plays at a
  // glance; neutral when the team is not known.
  const ring = team ? sportTeamColors(team.ColorOne, team.ColorTwo).color : null;
  return (
    <div
      ref={faceRef}
      aria-hidden={avatar || undefined}
      style={avatar && ring ? { borderColor: ring } : undefined}
      className={`${classes} shrink-0 overflow-hidden [&_svg]:h-full [&_svg]:w-full ${
        avatar
          ? // A light neutral backdrop in every theme, as a photo has: dark
            // hair and light hair both stand out from it.
            "rounded-full border-2 border-(--border-primary) bg-[#d3d9e0]"
          : "rounded border border-(--border-primary) bg-white"
      }`}
    />
  );
};

interface VbLoadProps {
  loading: boolean;
  error: VbApiError | null;
  /** Shown instead of the error for a match that has not been played. */
  notPublished?: string;
  rows?: number;
  children: ReactNode;
}

/** Skeleton while loading, a plain message on failure, else the content. */
export const VbLoad: FC<VbLoadProps> = ({
  loading,
  error,
  notPublished = "This match has not been played yet.",
  rows = 6,
  children,
}) => {
  if (error) {
    const quiet = error.code === "NOT_PUBLISHED";
    return (
      <VbEmpty tone={quiet ? "muted" : "error"}>
        {quiet ? notPublished : error.message}
      </VbEmpty>
    );
  }
  if (loading) return <SkeletonRows count={rows} classes="p-2" />;
  return <>{children}</>;
};

export const VbEmpty: FC<{ children: ReactNode; tone?: "muted" | "error" }> = ({
  children,
  tone = "muted",
}) => (
  <div
    className={`p-6 text-center text-sm ${tone === "error" ? "text-(--accent-error)" : "text-(--text-muted)"}`}
  >
    {children}
  </div>
);

/** A bordered panel for a table; scrolls sideways instead of squeezing. */
/**
 * A section of a volleyball page: the sports' filled surface with a label
 * line (SportPanel). `color` is the team colour strip on the user's own
 * team's panels; `actions` sit on the right of the label.
 */
export const VbPanel: FC<{
  children: ReactNode;
  title?: string;
  color?: string;
  classes?: string;
  actions?: ReactNode;
}> = ({ children, title, color, classes = "", actions }) => (
  <SportPanel title={title} accent={color} actions={actions} classes={classes}>
    {children}
  </SportPanel>
);

// Every volleyball table carries data-keep-table: without it a global rule
// turns tables into stacked cards below 900px.
export const vbTableClass = "w-full text-left text-sm";
export const vbHeadClass =
  "border-b border-(--sport-divider) text-[0.7rem] uppercase tracking-wider text-(--text-muted)";
export const vbRowClass =
  "border-b border-(--sport-divider) last:border-0 hover:bg-(--text-primary)/5";
export const vbCell = "px-2 py-1.5 whitespace-nowrap";
export const vbNum = `${vbCell} text-right tabular-nums`;
/** The name column, held in place while a wide table scrolls sideways. */
export const vbStickyCell =
  "sticky left-0 z-[1] bg-(--sport-surface) shadow-[2px_0_4px_-2px_rgba(0,0,0,0.25)]";
/** The upper row of a two-row header: a heading over a group of columns. */
export const vbGroupHead =
  "px-2 py-1 text-center text-[10px] font-bold tracking-wider border-l border-(--sport-divider)";

/** Previous and next for a list the API serves a page at a time. */
export const VbPager: FC<{
  offset: number;
  pageSize: number;
  total: number;
  onChange: (offset: number) => void;
}> = ({ offset, pageSize, total, onChange }) =>
  total > pageSize ? (
    <div className="flex items-center justify-end gap-3 px-3 py-2 text-sm">
      <span className="tabular-nums text-(--text-muted)">
        {offset + 1}–{Math.min(offset + pageSize, total)} of{" "}
        {total.toLocaleString("en-US")}
      </span>
      {offset > 0 && (
        <span
          {...vbLinkProps(() => onChange(Math.max(0, offset - pageSize)))}
          className={vbLinkClass}
        >
          Previous
        </span>
      )}
      {offset + pageSize < total && (
        <span
          {...vbLinkProps(() => onChange(offset + pageSize))}
          className={vbLinkClass}
        >
          Next
        </span>
      )}
    </div>
  ) : null;

type SortDirection = "asc" | "desc";

/** Local sort state for a table: click a header to sort, again to reverse. */
export const useVbSort = <Row, Key extends string>(
  rows: Row[],
  valueFor: (row: Row, key: Key) => string | number | null,
  initialKey: Key,
  initialDirection: SortDirection = "asc",
) => {
  const [sortKey, setSortKey] = useState<Key>(initialKey);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const sortBy = (key: Key, firstDirection: SortDirection = "asc") => {
    if (key === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(firstDirection);
    }
  };
  const sorted = [...rows].sort((left, right) => {
    const a = valueFor(left, sortKey);
    const b = valueFor(right, sortKey);
    // Missing values sink to the bottom whichever way the column is sorted.
    if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
    const order =
      typeof a === "number" && typeof b === "number"
        ? a - b
        : String(a).localeCompare(String(b), undefined, { numeric: true });
    return direction === "asc" ? order : -order;
  });
  return { sorted, sortKey, direction, sortBy };
};

interface VbSortHeaderProps<Key extends string> {
  label: string;
  column: Key;
  sort: { sortKey: Key; direction: SortDirection; sortBy: (key: Key, first?: SortDirection) => void };
  numeric?: boolean;
  title?: string;
}

export const VbSortHeader = <Key extends string>({
  label,
  column,
  sort,
  numeric = false,
  title,
}: VbSortHeaderProps<Key>) => (
  <th
    className={`${vbCell} cursor-pointer select-none ${numeric ? "text-right" : "text-left"}`}
    title={title}
    tabIndex={0}
    aria-sort={
      sort.sortKey === column
        ? sort.direction === "asc"
          ? "ascending"
          : "descending"
        : undefined
    }
    onClick={() => sort.sortBy(column, numeric ? "desc" : "asc")}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        sort.sortBy(column, numeric ? "desc" : "asc");
      }
    }}
  >
    {label}
    {sort.sortKey === column ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
  </th>
);
