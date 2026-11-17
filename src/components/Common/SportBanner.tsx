import {
  createContext,
  CSSProperties,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { UnderlineTabs } from "../../_design/UnderlineTabs";
import { League } from "../../_constants/constants";
import routes from "../../_constants/routes";
import { useLeagueStore } from "../../context/LeagueContext";
import { useUserLeagues } from "./LeagueSelector";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { SportSelect, SportSelectProps } from "./SportKit";

// One way to find your way around a sport: a bar in the team's colour with
// its logo, name and season, and under it a row of tabs. The sport decides
// what the tabs are: page links (volleyball, baseball), or a switch between
// teams of one organisation (baseball's farm levels). Each sport builds its
// rows from its own list of pages, so every page of the sport shows the same
// bar in the same place.

export interface SportNavLink {
  label: string;
  /** Where the link goes. */
  path: string;
  /**
   * Paths that also count as this page, for marking it as the current one.
   * Each matches itself and anything under it ("/cvb/team" matches
   * "/cvb/team/12"). Defaults to `path`.
   */
  match?: string[];
  /** Only the path itself counts, nothing under it (a league's home). */
  exact?: boolean;
}

/** Links shown together; groups are divided by a thin line. */
export interface SportNavGroup {
  /** Read by screen readers, e.g. "Your team", "League". */
  label: string;
  links: SportNavLink[];
}

const trimmed = (path: string) => path.replace(/\/+$/, "") || "/";

const isCurrent = (pathname: string, link: SportNavLink) =>
  (link.match ?? [link.path]).some((candidate) => {
    const base = trimmed(candidate);
    const here = trimmed(pathname);
    return here === base || (!link.exact && here.startsWith(`${base}/`));
  });

/**
 * The link for the page at `pathname`. The most specific match wins, so
 * "/cvb" (Home) is not the current page on "/cvb/schedule".
 */
export const sportCurrentLink = (pathname: string, groups: SportNavGroup[]) =>
  groups
    .flatMap((group) => group.links)
    .filter((link) => isCurrent(pathname, link))
    .sort(
      (a, b) =>
        Math.max(...(b.match ?? [b.path]).map((p) => trimmed(p).length)) -
        Math.max(...(a.match ?? [a.path]).map((p) => trimmed(p).length)),
    )[0];

/** The tab look, shared by page links and baseball's level switch. */
export const sportTabClass = (active: boolean) =>
  `relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm transition-all ${
    active ? "font-semibold opacity-100" : "opacity-75 hover:opacity-100"
  }`;

export const sportTabStyle = (active: boolean, accent: string) => ({
  backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
  borderBottom: `2px solid ${active ? accent : "transparent"}`,
});

/** A row of tabs on the banner's colour, scrolling sideways when narrow. */
export const SportTabRow: FC<{
  color: string;
  children: ReactNode;
  label?: string;
}> = ({ color, children, label }) => (
  <nav
    aria-label={label}
    // A phone scrolls the row sideways; a wider screen wraps it instead.
    className="flex items-stretch overflow-x-auto md:flex-wrap md:overflow-x-visible"
    style={{ backgroundColor: `${color}cc` }}
  >
    {children}
  </nav>
);

/**
 * Every league the user has a team in, across all sports, as the banner's
 * top row: one click opens that league's home. It replaces the row of pills
 * on the home page for the sports that use the banner.
 */
export const SportLeagueRow: FC<{ current: League }> = ({ current }) => {
  const navigate = useNavigate();
  const { SetTeam } = useLeagueStore();
  const leagues = useUserLeagues();
  if (leagues.length < 2) return null;
  return (
    <nav
      aria-label="Your leagues"
      className="flex items-stretch overflow-x-auto bg-black/30 text-white md:flex-wrap md:overflow-x-visible"
    >
      {leagues.map(({ league, team, displayName, logo }) => {
        const active = league === current;
        return (
          <button
            key={league}
            type="button"
            aria-current={active ? "true" : undefined}
            title={`${league}: ${displayName}`}
            onClick={() => {
              SetTeam(league, team);
              navigate(routes.HOME);
            }}
            className={`${sportTabClass(active)} cursor-pointer py-1 text-xs`}
            style={sportTabStyle(active, "#ffffff")}
          >
            <img src={logo} alt="" className="h-5 w-8 object-contain" />
            <span>{displayName}</span>
          </button>
        );
      })}
    </nav>
  );
};

/** Page links, a group at a time. The current page is marked. */
export const SportNavRow: FC<{
  color: string;
  accent: string;
  groups: SportNavGroup[];
}> = ({ color, accent, groups }) => {
  const { pathname } = useLocation();
  const textClass = getTextColorBasedOnBg(color);
  const shown = groups.filter((group) => group.links.length);
  const current = sportCurrentLink(pathname, shown);

  return (
    <SportTabRow color={color} label="Pages">
      {shown.map((group, index) => (
        <div
          key={group.label}
          role="group"
          aria-label={group.label}
          className="flex items-stretch"
        >
          {index > 0 && (
            <span
              aria-hidden
              className="mx-1 my-2 w-px shrink-0"
              style={{ backgroundColor: "currentColor", opacity: 0.3 }}
            />
          )}
          {group.links.map((link) => {
            const active = link === current;
            return (
              <Link
                key={`${link.label}:${link.path}`}
                to={link.path}
                aria-current={active ? "page" : undefined}
                className={`${sportTabClass(active)} ${textClass}`}
                style={sportTabStyle(active, accent)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </SportTabRow>
  );
};

interface SportBannerProps {
  /** The bar's colour: the team's, or the league's for someone without a team. */
  color: string;
  /** The underline of the current tab. */
  accent?: string;
  logo?: string;
  title: ReactNode;
  /** Under the title: the season and week, the page's name. */
  subtitle?: ReactNode;
  /** A smaller line under that. */
  detail?: ReactNode;
  /** Short facts as chips under the title: a record, a rank, what is next. */
  facts?: string[];
  /** The right of the title row. */
  aside?: ReactNode;
  /** Rows under the title row, e.g. a level switch, then page links. */
  children?: ReactNode;
  /** The page's league: shows the row of the user's leagues on top. */
  league?: League;
  /** Where a page's own controls are put (see SportBannerAside). */
  slotRef?: (element: HTMLDivElement | null) => void;
  /** Where a page's own tab row goes, above the page links (SportBannerRows). */
  rowsRef?: (element: HTMLDivElement | null) => void;
  /** Where a page's sections go, under the page links (SportBannerSections). */
  sectionsRef?: (element: HTMLDivElement | null) => void;
}

/** A small fact on the banner: white or black on a translucent fill. */
export const SportBannerChip: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center whitespace-nowrap rounded bg-black/20 px-1.5 py-0.5 text-xs font-semibold">
    {children}
  </span>
);

export const SportBanner: FC<SportBannerProps> = ({
  color,
  accent = "#ffffff",
  logo,
  title,
  subtitle,
  detail,
  facts,
  aside,
  children,
  league,
  slotRef,
  rowsRef,
  sectionsRef,
}) => {
  const textClass = getTextColorBasedOnBg(color);
  return (
    // Not overflow-hidden: a dropdown in the title row must open past the
    // banner. Each row rounds its own corners instead.
    <div
      className="mb-2 rounded-lg [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg"
      style={
        {
          borderBottom: `3px solid ${accent}`,
          backgroundColor: color,
          // The section row's underline.
          "--banner-accent": accent,
        } as CSSProperties
      }
    >
      {league && <SportLeagueRow current={league} />}
      <div
        className={`flex flex-wrap items-center gap-3 px-4 py-2 text-left ${textClass}`}
        style={{ backgroundColor: color }}
      >
        {logo && (
          <img
            src={logo}
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="flex min-w-0 flex-col">
          <div className="text-lg font-semibold leading-tight sm:text-xl">
            {title}
          </div>
          {subtitle && <div className="text-sm opacity-80">{subtitle}</div>}
          {detail && <div className="text-xs opacity-70">{detail}</div>}
          {facts && facts.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {facts.map((fact) => (
                <SportBannerChip key={fact}>{fact}</SportBannerChip>
              ))}
            </div>
          )}
        </div>
        {(aside || slotRef) && (
          <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
            {aside}
            {/* A page's own controls arrive here through a portal. */}
            {slotRef && (
              <div
                ref={slotRef}
                className="flex w-full flex-wrap items-center gap-2 empty:hidden sm:w-auto"
              />
            )}
          </div>
        )}
      </div>
      {/* A page's own tab row (baseball's levels) arrives here. */}
      {rowsRef && <div ref={rowsRef} className="empty:hidden" />}
      {children}
      {/* The page's sections, a lighter row under the page links. */}
      {sectionsRef && (
        <div
          ref={sectionsRef}
          className={`bg-black/20 empty:hidden ${textClass}`}
        />
      )}
    </div>
  );
};

/**
 * A dropdown on the banner (pick a team or an organisation), at the width and
 * in the colours every banner picker uses.
 */
export const SportBannerPicker: FC<
  SportSelectProps & {
    /** A short list (a season): narrower on wider screens. */
    compact?: boolean;
  }
> = ({ compact, ...props }) => (
  <div
    className={`w-full text-(--text-primary) ${compact ? "sm:w-32" : "sm:w-72"}`}
  >
    <SportSelect {...props} />
  </div>
);

// ─── A page's own part of the banner ────────────────────────────────────────
// The banner belongs to the sport's frame, above the page. A page about one
// team still wants that team on it: its name, colours and logo, and its own
// controls (a team picker, a "Request this team" button). Instead of drawing
// a second header, the page hands these to the banner.

/** What a page may set on the banner. Anything left out keeps the default. */
export interface SportBannerContent {
  title?: string;
  subtitle?: string;
  detail?: string;
  logo?: string;
  color?: string;
  accent?: string;
}

interface SportBannerHost {
  setContent: (content: SportBannerContent | null) => void;
  setFacts: (facts: string[] | null) => void;
  slot: HTMLElement | null;
  rows: HTMLElement | null;
  sections: HTMLElement | null;
}

const SportBannerHostContext = createContext<SportBannerHost | null>(null);

/**
 * For a sport's frame: the page's content and facts, refs for the slots, and
 * the provider to wrap the page in.
 */
export const useSportBannerHost = () => {
  const [content, setContent] = useState<SportBannerContent | null>(null);
  const [facts, setFacts] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<HTMLDivElement | null>(null);
  const [sections, setSections] = useState<HTMLDivElement | null>(null);
  const host = useMemo(
    () => ({ setContent, setFacts, slot, rows, sections }),
    [slot, rows, sections],
  );
  return {
    host,
    content,
    facts,
    slotRef: setSlot,
    rowsRef: setRows,
    sectionsRef: setSections,
  };
};

export const SportBannerHostProvider = SportBannerHostContext.Provider;

/** Sets the banner's title, colours and logo while the calling page is open. */
export const useSportBannerContent = (content: SportBannerContent | null) => {
  const host = useContext(SportBannerHostContext);
  // Compared by value, so a page may build the object on every render.
  const key = content ? JSON.stringify(content) : "";
  useEffect(() => {
    if (!host) return;
    host.setContent(key ? (JSON.parse(key) as SportBannerContent) : null);
    return () => host.setContent(null);
  }, [host, key]);
};

/**
 * Adds the page's own facts to the banner's chips while the page is open:
 * what the page is showing (a week, a count of live matches, what is next).
 */
export const useSportBannerFacts = (facts: Array<string | false | null | undefined>) => {
  const host = useContext(SportBannerHostContext);
  const key = JSON.stringify(facts.filter(Boolean));
  useEffect(() => {
    if (!host) return;
    const list = JSON.parse(key) as string[];
    host.setFacts(list.length ? list : null);
    return () => host.setFacts(null);
  }, [host, key]);
};

/**
 * The section a page shows, kept in the address (`?tab=`), so a section can
 * be linked to and the back button returns to it. Unknown values fall back.
 */
export const useSportSectionTab = <K extends string>(
  tabs: ReadonlyArray<readonly [K, string]>,
  fallback: K,
): [K, (key: K) => void] => {
  const [search, setSearch] = useSearchParams();
  const asked = search.get("tab");
  const tab = tabs.some(([key]) => key === asked) ? (asked as K) : fallback;
  const setTab = (key: K) =>
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        if (key === fallback) next.delete("tab");
        else next.set("tab", key);
        return next;
      },
      { replace: true },
    );
  return [tab, setTab];
};

/**
 * A page's sections as the banner's last, lighter row: page → section.
 * Outside a sport's frame they render as tabs where they stand.
 */
export const SportBannerSections = <K extends string>({
  tabs,
  value,
  onChange,
  label = "Sections",
}: {
  tabs: ReadonlyArray<readonly [K, string]>;
  value: K;
  onChange: (key: K) => void;
  label?: string;
}) => {
  const host = useContext(SportBannerHostContext);
  if (!host) {
    return <UnderlineTabs tabs={tabs} value={value} onChange={onChange} />;
  }
  if (!host.sections) return null;
  return createPortal(
    <nav
      aria-label={label}
      role="tablist"
      className="flex items-stretch overflow-x-auto px-2 [scrollbar-width:none] md:flex-wrap md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map(([key, text]) => {
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`shrink-0 whitespace-nowrap rounded-none border-0 border-b-2 bg-transparent px-3 py-1.5 text-xs text-inherit transition-opacity hover:bg-transparent sm:text-sm ${
              active
                ? "border-b-(--banner-accent) font-semibold opacity-100 hover:border-b-(--banner-accent)"
                : "border-b-transparent opacity-70 hover:border-b-transparent hover:opacity-100"
            }`}
          >
            {text}
          </button>
        );
      })}
    </nav>,
    host.sections,
  );
};

/**
 * Puts a page's controls on the right of the banner's title row. Outside a
 * sport's frame they render where they stand.
 */
export const SportBannerAside: FC<{ children: ReactNode }> = ({ children }) => {
  const host = useContext(SportBannerHostContext);
  if (!host) return <>{children}</>;
  return host.slot ? createPortal(children, host.slot) : null;
};

/**
 * Puts a page's own tab row (a level switch, say) on the banner, under the
 * title and above the page links. Outside a sport's frame it renders where
 * it stands.
 */
export const SportBannerRows: FC<{ children: ReactNode }> = ({ children }) => {
  const host = useContext(SportBannerHostContext);
  if (!host) return <>{children}</>;
  return host.rows ? createPortal(children, host.rows) : null;
};
