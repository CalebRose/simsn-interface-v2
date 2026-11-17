import { FC, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSimVBStore } from "../../context/SimVBContext";
import { VbLeagueKind, VbMatch, VbTeam } from "../../_services/volleyballService";
import { vbPaths, vbRecord, vbResult, vbTeamLogo } from "./vbFormatting";
import { vbMatchTab } from "./VbMatchTile";
import { vbAirTime, vbAiring } from "./VbBroadcast";
import { useVbStandingsById, useVbTop25 } from "./useVbData";
import {
  LiveBadge,
  SportMatchState,
  sportAwayShade,
  sportStateCard,
  sportStatePill,
  sportStateText,
} from "../Common/sportTheme";

// The row of game cards every sport shows at the top of its dashboard: the
// whole season, scrolled so the next match is in view, with arrows either
// side. The cards are laid out as the shared GamesBar lays out its own; that
// component reads each sport's own game shape, so volleyball has this one.
// Unlike the shared one, a card here opens its match.

const PAST_GAMES_VISIBLE = 3;

export const VbGamesBar: FC<{
  kind: VbLeagueKind;
  team: VbTeam;
  /** The team's season, in the order it is played. */
  matches: VbMatch[];
  /** The time now, so a card can say "Live" or when its match airs. */
  now?: number;
}> = ({ kind, team, matches, now = Date.now() }) => {
  const navigate = useNavigate();
  const scroller = useRef<HTMLDivElement>(null);
  const { vbTeamsById, vbLeagues } = useSimVBStore();
  const firstUpcoming = matches.findIndex((match) => !vbResult(match));
  // Each opponent's record now, and a college opponent's top-25 rank.
  const season = matches[0]?.LeagueTime.Season ?? null;
  const standings = useVbStandingsById(vbLeagues[kind], season);
  const top25 = useVbTop25(kind === "college" ? vbLeagues[kind] : null, season);

  useEffect(() => {
    const element = scroller.current;
    if (!element || !matches.length) return;
    requestAnimationFrame(() => {
      const first = element.firstElementChild as HTMLElement | null;
      if (!first) return;
      const gap = parseFloat(getComputedStyle(element).gap) || 8;
      // A finished season opens on its last matches.
      const next = firstUpcoming < 0 ? matches.length : firstUpcoming;
      const target = Math.max(0, next - PAST_GAMES_VISIBLE);
      element.scrollTo({ left: target * (first.offsetWidth + gap), behavior: "auto" });
    });
  }, [matches, firstUpcoming]);

  if (!matches.length) return null;
  const scrollBy = (left: number) =>
    scroller.current?.scrollBy({ left, behavior: "smooth" });
  // Flat arrow buttons on the surface; the row itself shows no scrollbar.
  const arrow =
    "absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border-0 bg-(--sport-surface) p-0 text-(--text-primary) [box-shadow:var(--sport-shadow)] hover:border-0 hover:bg-(--sport-surface-2)";

  return (
    <div className="mb-2 flex pb-1">
      <div className="relative flex w-full items-center pb-1">
        <button
          type="button"
          aria-label="Earlier matches"
          onClick={() => scrollBy(-240)}
          className={`${arrow} left-0`}
        >
          &lt;
        </button>
        <div
          ref={scroller}
          className="flex w-full flex-row gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {matches.map((match, index) => {
            const home = match.HomeTeamID === team.TeamID;
            const opponentId = home ? match.AwayTeamID : match.HomeTeamID;
            const opponent = vbTeamsById[opponentId];
            const name = home ? match.AwayName : match.HomeName;
            const result = vbResult(match);
            const won = result?.WinnerTeamID === team.TeamID;
            const ours = result ? (home ? result.SetsHome : result.SetsAway) : 0;
            const theirs = result ? (home ? result.SetsAway : result.SetsHome) : 0;
            const next = index === firstUpcoming;
            const airing = vbAiring(match, now);
            const state: SportMatchState = result
              ? won
                ? "win"
                : "loss"
              : airing?.state === "live"
                ? "live"
                : next
                  ? "next"
                  : "upcoming";
            // A road match is shaded faintly; a neutral site counts as home.
            const away = !home && !match.NeutralSite;
            const card = `${sportStateCard[state]} ${away ? sportAwayShade : ""}`;
            const standing = standings.get(opponentId);
            const rank = top25.get(opponentId);
            const open = () =>
              navigate(
                result
                  ? vbMatchTab(kind, match.MatchID, "box")
                  : vbPaths(kind).match(match.MatchID),
              );
            return (
              <div
                key={match.MatchID}
                role="button"
                tabIndex={0}
                title={
                  result
                    ? `${won ? "Won" : "Lost"} ${ours}-${theirs} ${home ? "vs" : "at"} ${name}: open the box score`
                    : airing?.state === "live"
                      ? `${home ? "vs" : "at"} ${name}: on air now, watch it live`
                      : `${home ? "vs" : "at"} ${name}: open the preview`
                }
                onClick={open}
                onKeyDown={(event) => {
                  if (event.key === "Enter") open();
                }}
                className={`flex w-28 shrink-0 cursor-pointer flex-col items-center rounded-lg px-2 py-1.5 md:w-32 lg:w-36 ${card}`}
              >
                <span className="text-[0.6rem] text-(--text-muted)">
                  {match.LeagueTime.Phase === "regular_season"
                    ? `Wk ${match.LeagueTime.Week}`
                    : (match.LeagueTime.Label ?? "Postseason")}
                </span>
                <img
                  src={vbTeamLogo(opponent, kind, vbLeagues[kind])}
                  className="my-0.5 h-7 w-7 object-contain md:h-8 md:w-8"
                  alt=""
                  onError={(event) => {
                    (event.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="w-full truncate text-center text-xs font-semibold">
                  {match.NeutralSite || home ? "vs" : "@"}{" "}
                  {/* A ranked opponent's rank goes before its name. */}
                  {rank ? (
                    <span
                      className="mr-0.5 text-[0.6rem] font-normal text-(--text-muted)"
                      title={`No. ${rank} in the poll`}
                    >
                      {rank}
                    </span>
                  ) : null}
                  {opponent?.Abbreviation || name}
                </span>
                {standing && (
                  <span
                    className="text-[0.6rem] tabular-nums text-(--text-muted)"
                    title="Their record this season"
                  >
                    {vbRecord(standing)}
                  </span>
                )}
                {result ? (
                  <div className="mt-0.5 flex flex-col items-center">
                    <span
                      className={`text-sm font-bold ${sportStateText[won ? "win" : "loss"]}`}
                    >
                      {ours} - {theirs}
                    </span>
                    <span
                      className={`mt-0.5 rounded-sm px-1.5 py-px text-[0.55rem] font-bold uppercase tracking-wider ${sportStatePill[won ? "win" : "loss"]}`}
                    >
                      {won ? "W" : "L"}
                    </span>
                  </div>
                ) : (
                  <span
                    className={`mt-1 text-[0.65rem] ${next ? "font-bold" : ""} ${sportStateText[next ? "next" : "upcoming"]}`}
                  >
                    {airing?.state === "live" ? (
                      <LiveBadge />
                    ) : airing?.state === "upcoming" ? (
                      vbAirTime(airing.startsAt)
                    ) : next ? (
                      "NEXT"
                    ) : (
                      "—"
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Later matches"
          onClick={() => scrollBy(240)}
          className={`${arrow} right-0`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};
