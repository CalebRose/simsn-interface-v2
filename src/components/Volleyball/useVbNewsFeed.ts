import { useCallback, useMemo } from "react";
import { League, SimCVB, SimPVB } from "../../_constants/constants";
import { useSimVBStore } from "../../context/SimVBContext";
import { NewsLog } from "../../models/footballModels";
import {
  VbLeagueKind,
  VbNews,
  vbNewsTypes,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource, useVbSeasons, useVbTeams } from "./useVbData";
import { vbLabel } from "./vbFormatting";

// The API serves news 200 items at a time; the shared News page filters and
// pages a whole season on the client, so a season is fetched in full.
const PAGE = 200;

type VbNewsItem = VbNews["Items"][number];

const loadSeason = async (leagueId: number, season: number) => {
  const first = await VolleyballService.getNews(leagueId, {
    Season: season,
    Limit: PAGE,
  });
  const offsets: number[] = [];
  for (let offset = PAGE; offset < first.Total; offset += PAGE) {
    offsets.push(offset);
  }
  const rest = await Promise.all(
    offsets.map((offset) =>
      VolleyballService.getNews(leagueId, {
        Season: season,
        Limit: PAGE,
        Offset: offset,
      }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.Items);
};

/** The news type as the page shows and filters it: "Coach Hired". */
export const vbNewsTypeLabel = (type: string) => vbLabel(type);

export const vbNewsTypeOptions = [
  { label: "None", value: "" },
  ...vbNewsTypes.map((type) => ({
    label: vbNewsTypeLabel(type),
    value: vbNewsTypeLabel(type),
  })),
];

export const isVbLeague = (league: League | string | undefined) =>
  league === SimCVB || league === SimPVB;

/**
 * Volleyball's news in the shape the shared News page lists. Idle (and
 * fetching nothing) unless `league` is one of the two volleyball leagues.
 * `season` is a year; anything else means the latest season with news.
 */
export const useVbNewsFeed = (league: League, season: number) => {
  const kind: VbLeagueKind | null =
    league === SimCVB ? "college" : league === SimPVB ? "pro" : null;
  const { vbLeagues, setVbResource } = useSimVBStore();
  // Hooks cannot be skipped, so an idle feed looks at the college league and
  // asks it for nothing it has not already loaded.
  const { seasons, playedSeason } = useVbSeasons(kind ?? "college");
  useVbTeams(kind ?? "college");
  const leagueId = kind ? vbLeagues[kind]?.LeagueID : undefined;
  const year = seasons.includes(season) ? season : playedSeason;
  const key = leagueId && year ? `news-season:${leagueId}:${year}` : null;
  const feed = useVbResource(key, () => loadSeason(leagueId!, year!));

  const news = useMemo<NewsLog[]>(() => {
    // Recruiting items carry no time. The API's order is newest first, so
    // each of those takes a moment just before the item ahead of it, which
    // keeps the page's own sorting from scattering them.
    let last = Date.UTC((year ?? 2000) + 1, 0, 1);
    return (feed.data ?? []).map((item: VbNewsItem) => {
      const stamped = item.At ? Date.parse(item.At) : NaN;
      const time = Number.isNaN(stamped) ? last - 1 : stamped;
      last = Math.min(last, time);
      return {
        ID: item.ID,
        CreatedAt: new Date(time).toISOString(),
        UpdatedAt: null,
        DeletedAt: null,
        WeekID: item.Week ?? 0,
        Week: item.Week ?? 0,
        SeasonID: item.Season,
        TeamID: item.TeamID ?? 0,
        MessageType: vbNewsTypeLabel(item.Type),
        Message: item.Message,
        League: league,
      } as unknown as NewsLog;
    });
  }, [feed.data, league, year]);

  const refresh = useCallback(async () => {
    if (!key || !leagueId || !year) return;
    try {
      setVbResource(key, await loadSeason(leagueId, year));
    } catch {
      // The list on screen stays as it was.
    }
  }, [key, leagueId, year, setVbResource]);

  return {
    news,
    /** The year on screen, and every year there is. */
    season: year,
    seasons,
    refresh,
  };
};
