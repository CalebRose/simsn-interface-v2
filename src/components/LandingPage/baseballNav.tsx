import { FC, ReactNode } from "react";
import routes from "../../_constants/routes";
import { League, SimCollegeBaseball, SimMLB } from "../../_constants/constants";
import { PageBannerContext } from "../../_design/Container";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../context/AuthContext";
import { getLogo } from "../../_utility/getLogo";
import { getPrimaryBaseballTeam } from "../../_utility/baseballHelpers";
import {
  SportBanner,
  SportBannerContent,
  SportBannerHostProvider,
  SportNavGroup,
  SportNavRow,
  SportTabRow,
  sportCurrentLink,
  sportTabClass,
  sportTabStyle,
  useSportBannerHost,
} from "../Common/SportBanner";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { BaseballOrganization } from "../../models/baseball/baseballModels";
import { displayLevel, LEVEL_ORDER } from "../../_utility/baseballHelpers";
import { sportTeamColors } from "../Common/sportTheme";

type BaseballLeague = typeof SimMLB | typeof SimCollegeBaseball;

/**
 * Every baseball page, as the banner shows them: home, the organisation's
 * own pages, the player market, then the league's. This is the one list; the
 * home page's banner and the bar on every other baseball page read it.
 */
export const baseballNavGroups = (league: string): SportNavGroup[] => {
  const home: SportNavGroup = {
    label: "Home",
    links: [{ label: "Home", path: routes.HOME, exact: true }],
  };
  if (league === SimMLB) {
    return [
      home,
      {
        label: "Your organization",
        links: [
          { label: "Roster", path: routes.MLB_TEAM },
          { label: "Gameplan", path: routes.MLB_GAMEPLAN },
          { label: "Finances", path: routes.MLB_FINANCIALS },
          { label: "Injuries", path: routes.MLB_INJURIES },
          { label: "Training Camp", path: routes.MLB_TRAINING_CAMP },
        ],
      },
      {
        label: "Players",
        links: [
          { label: "Free Agency", path: routes.MLB_FREE_AGENCY },
          { label: "IFA", path: routes.MLB_IFA },
          { label: "Trades", path: routes.MLB_TRADES },
          { label: "Draft", path: routes.MLB_DRAFT_ROOM },
        ],
      },
      {
        label: "League",
        links: [
          { label: "Schedule", path: routes.MLB_SCHEDULE },
          { label: "Statistics", path: routes.MLB_STATS },
          { label: "Playoffs", path: routes.MLB_PLAYOFFS },
          { label: "All-Star", path: routes.MLB_ALLSTAR },
          { label: "Awards", path: routes.MLB_AWARDS },
          { label: "WBC", path: routes.MLB_WBC },
        ],
      },
    ];
  }
  return [
    home,
    {
      label: "Your program",
      links: [
        { label: "Roster", path: routes.COLLEGE_BASEBALL_TEAM },
        { label: "Gameplan", path: routes.COLLEGE_BASEBALL_GAMEPLAN },
        { label: "Injuries", path: routes.COLLEGE_BASEBALL_INJURIES },
        { label: "Training Camp", path: routes.COLLEGE_BASEBALL_TRAINING_CAMP },
      ],
    },
    {
      label: "Players",
      links: [{ label: "Recruiting", path: routes.COLLEGE_BASEBALL_RECRUITING }],
    },
    {
      label: "League",
      links: [
        { label: "Schedule", path: routes.COLLEGE_BASEBALL_SCHEDULE },
        { label: "Statistics", path: routes.COLLEGE_BASEBALL_STATS },
        {
          label: "Conf. Tournament",
          path: routes.COLLEGE_BASEBALL_CONF_TOURNAMENT,
        },
        { label: "Postseason", path: routes.COLLEGE_BASEBALL_PLAYOFFS },
      ],
    },
  ];
};

/** The user's organisation in a league, its main team, and its colours. */
export const useBaseballOrg = (league: string) => {
  const { mlbOrganization, collegeOrganization } = useSimBaseballStore();
  const org = league === SimMLB ? mlbOrganization : collegeOrganization;
  const team = org ? getPrimaryBaseballTeam(org) : undefined;
  return {
    org,
    team,
    ...sportTeamColors(team?.color_one, team?.color_two),
  };
};

/**
 * The banner on every baseball page other than home: the user's
 * organisation, the page's name and the season, the user's leagues and the
 * baseball pages. A page about one team hands that team to it (see
 * useSportBannerContent) instead of drawing its own header.
 */
export const BaseballBanner: FC<{
  league: string;
  content: SportBannerContent | null;
  slotRef: (element: HTMLDivElement | null) => void;
  rowsRef: (element: HTMLDivElement | null) => void;
}> = ({ league, content, slotRef, rowsRef }) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuthStore();
  const { seasonContext } = useSimBaseballStore();
  const { org, team, color, accent } = useBaseballOrg(league);
  const groups = baseballNavGroups(league);
  const page = sportCurrentLink(pathname, groups)?.label;
  const mlb = league === SimMLB;
  const orgName = team?.team_full_name
    ? mlb
      ? `${team.team_full_name} Organization`
      : team.team_full_name
    : (org?.org_abbrev ?? (mlb ? "SimMLB" : "SimCBL"));
  const shownColor = content?.color ?? color;
  const shownAccent = content?.accent ?? accent;
  return (
    <SportBanner
      league={league as League}
      color={shownColor}
      accent={shownAccent}
      slotRef={slotRef}
      rowsRef={rowsRef}
      logo={
        content?.logo ??
        (team
          ? getLogo(league as League, team.team_id, currentUser?.IsRetro)
          : undefined)
      }
      title={content?.title ?? orgName}
      subtitle={
        content?.subtitle ??
        [
          mlb ? "SimMLB" : "SimCBL",
          page,
          seasonContext
            ? `Season ${seasonContext.league_year}, Week ${seasonContext.current_week_index}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      }
      detail={content?.detail}
    >
      <SportNavRow color={shownColor} accent={shownAccent} groups={groups} />
    </SportBanner>
  );
};

/**
 * Puts the baseball banner at the top of the page inside it. The page needs
 * no change for that: PageContainer shows whatever banner it is given.
 */
export const BaseballRouteFrame: FC<{
  league: BaseballLeague;
  children: ReactNode;
}> = ({ league, children }) => {
  const { host, content, slotRef, rowsRef } = useSportBannerHost();
  return (
    <PageBannerContext.Provider
      value={
        <BaseballBanner
          league={league}
          content={content}
          slotRef={slotRef}
          rowsRef={rowsRef}
        />
      }
    >
      <SportBannerHostProvider value={host}>{children}</SportBannerHostProvider>
    </PageBannerContext.Provider>
  );
};

/**
 * The switch between an organisation's teams (MLB, AAA, AA...), as a tab row
 * on the banner. The same on the home page, Roster and Gameplan. It changes
 * the team the page shows, not the page.
 */
export const BaseballLevelTabs: FC<{
  league: string;
  org: BaseballOrganization;
  activeLevel: string;
  onSelect: (level: string) => void;
  color: string;
  accent: string;
}> = ({ league, org, activeLevel, onSelect, color, accent }) => {
  const { currentUser } = useAuthStore();
  if (!org.teams || Object.keys(org.teams).length < 2) return null;
  const levels =
    league === SimCollegeBaseball
      ? Object.keys(org.teams)
      : LEVEL_ORDER.filter((level) => org.teams?.[level]);
  const textClass = getTextColorBasedOnBg(color);
  return (
    <SportTabRow color={color} label="Levels">
      {levels.map((level) => {
        const team = org.teams[level];
        const active = activeLevel === level;
        return (
          <button
            key={level}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(level)}
            className={`${sportTabClass(active)} cursor-pointer ${textClass}`}
            style={sportTabStyle(active, accent)}
          >
            <img
              src={getLogo(
                (league === SimMLB ? SimMLB : SimCollegeBaseball) as League,
                team.team_id,
                currentUser?.IsRetro,
              )}
              className="h-5 w-5 object-contain"
              alt=""
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span>{displayLevel(level)}</span>
            {team.team_abbrev && (
              <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>
                {team.team_abbrev}
              </span>
            )}
          </button>
        );
      })}
    </SportTabRow>
  );
};
