import { useEffect, useMemo, useRef, useState } from "react";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbApiError,
  VbClaimRequest,
  VbLeague,
  VbLeagueKind,
  VbStanding,
  VbTeam,
  vbPollRows,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbClock } from "./useVbClock";

const asVbError = (reason: unknown) =>
  reason instanceof VbApiError
    ? reason
    : new VbApiError(
        0,
        "UNKNOWN",
        reason instanceof Error ? reason.message : "Something went wrong.",
      );

/**
 * Loads one thing from the volleyball API and keeps it in the shared cache
 * under `key`, so going back to a page does not load it again. Pass a null
 * key to wait (for example until a league id is known). The key must name
 * everything the fetcher depends on.
 */
export const useVbResource = <T,>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: {
    /**
     * When the league clock moves the cache is emptied; keep showing what
     * was there until the new answer comes, instead of a loading state. For
     * public data only: it would outlive a change of user.
     */
    keepWhileReloading?: boolean;
  } = {},
) => {
  const { vbResources, vbResourceEpoch, loadVbResource } = useSimVBStore();
  const [failure, setFailure] = useState<{
    key: string;
    error: VbApiError;
  } | null>(null);
  const latestFetcher = useRef(fetcher);
  latestFetcher.current = fetcher;
  const loaded = key !== null && key in vbResources;
  const last = useRef<{ key: string; data: T } | null>(null);
  if (loaded) last.current = { key: key!, data: vbResources[key!] as T };
  const stale =
    options.keepWhileReloading && !loaded && last.current?.key === key
      ? last.current
      : null;

  useEffect(() => {
    if (key === null || loaded) return;
    let active = true;
    loadVbResource(key, () => latestFetcher.current())
      .then(() => {
        if (active) setFailure(null);
      })
      .catch((reason) => {
        if (active) setFailure({ key, error: asVbError(reason) });
      });
    return () => {
      active = false;
    };
  }, [key, loaded, vbResourceEpoch, loadVbResource]);

  const error = failure && failure.key === key ? failure.error : null;
  return {
    data: loaded ? (vbResources[key] as T) : stale?.data,
    error,
    loading: key !== null && !loaded && !error && !stale,
  };
};

/**
 * Every team's standing in a season, by team id: the league's own record of
 * wins and losses, overall and in conference. Records come from here, not
 * from the rankings routes: the pro poll reports every team 0-0
 * (05-backend-gaps-and-open-decisions.md).
 */
export const useVbStandingsById = (
  league: VbLeague | null | undefined,
  season: number | null,
) => {
  // The same key as the pro Standings tab, which also asks for every team.
  const standings = useVbResource(
    !league || season === null
      ? null
      : `standings:${league.LeagueID}:${season}:all`,
    () => VolleyballService.getStandings(league!.LeagueID, season!),
    { keepWhileReloading: true },
  );
  return useMemo(
    () =>
      new Map<number, VbStanding>(
        (standings.data?.Standings ?? []).map((row) => [row.TeamID, row]),
      ),
    [standings.data],
  );
};

/**
 * Each poll-ranked team's place in a season's top 25, by team id; empty when
 * there is no poll (or no key, to skip it).
 */
export const useVbTop25 = (
  league: VbLeague | null | undefined,
  season: number | null,
) => {
  // The same key as the Rankings tab, which asks for every team.
  const poll = useVbResource(
    league && season !== null ? `poll:${league.LeagueID}:${season}:all` : null,
    () => VolleyballService.getPollRankings(league!.LeagueID, season!, 400),
    { keepWhileReloading: true },
  );
  return useMemo(
    () =>
      new Map<number, number>(
        vbPollRows(poll.data?.Rankings)
          .filter((row) => row.Rank <= 25)
          .map((row) => [row.TeamID, row.Rank]),
      ),
    [poll.data],
  );
};

/** Every team of a league (null until loaded), for pickers, logos and links. */
export const useVbTeams = (kind: VbLeagueKind): VbTeam[] | null => {
  const { vbLeagues, vbTeams, refreshVbTeams } = useSimVBStore();
  const leagueId = vbLeagues[kind]?.LeagueID;
  const teams = vbTeams[kind];

  useEffect(() => {
    if (!leagueId || teams) return;
    refreshVbTeams(kind).catch(() => {
      // Team names still come with each response; only logos go missing.
    });
  }, [leagueId, teams, kind, refreshVbTeams]);

  return teams;
};

/**
 * The seasons a league has played, newest first, ending with the current
 * one. The API has no season list, so this joins the league history with the
 * clock. The pro league's own history is empty; the two leagues share their
 * years, so the college history serves both.
 */
export const useVbSeasons = (kind: VbLeagueKind) => {
  const { vbLeagues } = useSimVBStore();
  const clock = useVbClock(kind);
  const collegeId = vbLeagues.college?.LeagueID;
  const history = useVbResource(
    collegeId ? `league-history:${collegeId}` : null,
    () => VolleyballService.getLeagueHistory(collegeId!),
  );

  const seasons = useMemo(() => {
    const years = new Set<number>(
      history.data?.Seasons.map((season) => season.Season) ?? [],
    );
    if (clock) years.add(clock.Season);
    return [...years].sort((a, b) => b - a);
  }, [history.data, clock]);

  // Before a season's first match, the newest results, statistics and news
  // are last season's.
  const currentSeason = clock?.Season ?? null;
  const playedSeason =
    clock && clock.Phase === "preseason" && seasons.includes(clock.Season - 1)
      ? clock.Season - 1
      : currentSeason;

  return { seasons, currentSeason, playedSeason, clock };
};

/**
 * Which league a request is for. A request names its team but not its
 * league, so the two team lists tell; null until they have loaded.
 */
export const useVbRequestKind = () => {
  const college = useVbTeams("college");
  const pro = useVbTeams("pro");
  return (request: VbClaimRequest): VbLeagueKind | null =>
    college?.some((team) => team.TeamID === request.OrgID)
      ? "college"
      : pro?.some((team) => team.TeamID === request.OrgID)
        ? "pro"
        : null;
};

/**
 * The user's requests at one level, and the one waiting there. Each level is
 * separate: a user may wait on a college program and a pro club at once.
 */
export const useVbLevelRequests = (kind: VbLeagueKind) => {
  const { vbRequests } = useSimVBStore();
  const requestKind = useVbRequestKind();
  const requests = vbRequests.filter((request) => requestKind(request) === kind);
  return {
    requests,
    pending: requests.find((request) => request.Status === "pending"),
    requestKind,
  };
};
