import routes from "../../_constants/routes";
import { VbClock, VbLeagueKind, VbTeam } from "../../_services/volleyballService";
import { SportNavGroup } from "../Common/SportBanner";
import { vbPaths } from "./vbFormatting";

/**
 * Every volleyball page a user can go to, as the banner shows them: their
 * own team's pages first (only for a coach in that league), then the
 * league's. This is the one list; the banner on every volleyball page reads it.
 */
export const vbNavGroups = (
  kind: VbLeagueKind,
  ownTeam: VbTeam | null,
  clock: VbClock | null,
): SportNavGroup[] => {
  const paths = vbPaths(kind);
  const college = kind === "college";
  const strip = (route: string) => route.replace("/:teamId?", "");
  const finances = strip(college ? routes.CVB_FINANCES : routes.PVB_FINANCES);
  // Before a season's first match, the plays worth watching are last year's.
  const playsSeason = clock
    ? clock.Season - (clock.Phase === "preseason" ? 1 : 0)
    : null;

  const team: SportNavGroup = {
    label: "Your team",
    links: ownTeam
      ? [
          { label: "Team", path: paths.team(ownTeam.TeamID) },
          { label: "Lineup", path: paths.lineup },
          { label: "Tactics", path: paths.tactics },
          { label: "Development", path: paths.development },
          {
            label: "Staff",
            path: strip(college ? routes.CVB_STAFF : routes.PVB_STAFF),
          },
          {
            label: "Finances",
            path: `${finances}/${ownTeam.TeamID}`,
            match: [`${finances}/${ownTeam.TeamID}`],
          },
          { label: "Coach", path: paths.coach },
        ]
      : [],
  };

  const league: SportNavGroup = {
    label: "League",
    links: [
      { label: "Teams", path: paths.teams },
      { label: "Schedule", path: paths.schedule },
      { label: "Stats", path: paths.statistics },
      ...(playsSeason
        ? [
            {
              label: "Top Plays",
              path: paths.topPlays(playsSeason),
              match: [college ? "/cvb/topplays" : "/pvb/topplays"],
            },
          ]
        : []),
      { label: "History", path: paths.history },
      ...(college
        ? [
            { label: "Recruiting", path: routes.CVB_RECRUITING },
            { label: "Portal", path: routes.CVB_TRANSFER },
            { label: "Coaching Changes", path: routes.CVB_CAROUSEL },
          ]
        : [
            { label: "Draft", path: routes.PVB_DRAFT },
            { label: "Trades", path: routes.PVB_TRADES },
            { label: "Free Agency", path: routes.PVB_FREE_AGENCY },
          ]),
      // Without a team, Finances is every program's books.
      ...(ownTeam ? [] : [{ label: "Finances", path: finances, exact: true }]),
    ],
  };

  return [
    { label: "Home", links: [{ label: "Home", path: paths.home, exact: true }] },
    team,
    league,
  ];
};

/** "15-week season · matches on Tuesday and Saturday · 64-team national tournament". */
export const vbCalendarFacts = (clock: VbClock | null) => {
  const calendar = clock?.Calendar;
  if (!calendar) return "";
  return [
    `${calendar.RegularSeasonWeeks}-week season`,
    calendar.MatchDays.length
      ? `matches on ${calendar.MatchDays.map((day) => day.Name).join(" and ")}`
      : null,
    calendar.TradeDeadlineWeek
      ? `trade deadline in week ${calendar.TradeDeadlineWeek}`
      : null,
    calendar.PlayoffTeams ? `${calendar.PlayoffTeams}-team playoffs` : null,
    calendar.NationalTournamentTeams
      ? `${calendar.NationalTournamentTeams}-team national tournament`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
};
