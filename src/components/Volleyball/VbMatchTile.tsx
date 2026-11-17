import { FC, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../../_design/Logo";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeagueKind,
  VbMatch,
  VbStanding,
} from "../../_services/volleyballService";
import { vbLinkClass, vbLinkProps } from "./VbCommon";
import { useVbLiveScore, vbAiring, vbAiringLabel } from "./VbBroadcast";
import { LiveBadge, sportTeamColors } from "../Common/sportTheme";
import {
  vbMatchKindLabel,
  vbMatchWhen,
  vbPaths,
  vbRecord,
  vbResult,
  vbTeamLogo,
} from "./vbFormatting";

/** The address of a match page opened on one of its tabs. */
export const vbMatchTab = (
  kind: VbLeagueKind,
  matchId: number,
  tab: "box" | "replay" | "plays",
) => `${vbPaths(kind).match(matchId)}?tab=${tab}`;

/**
 * One match as a scoreboard tile: both teams with their colours, sets won
 * and each set's score, and plain links to the box score and the replay.
 */
export const VbMatchTile: FC<{
  kind: VbLeagueKind;
  match: VbMatch;
  /** Replays are kept for every rally only while a season is being played. */
  watchable: boolean;
  /** The time now, so a tile can say "Live" or when its match airs. */
  now?: number;
  /** Each team's standing, for its record under its name. */
  standings?: Map<number, VbStanding>;
  /** Top-25 poll ranks, shown before a ranked team's name. */
  ranks?: Map<number, number>;
}> = ({ kind, match, watchable, now = Date.now(), standings, ranks }) => {
  const navigate = useNavigate();
  const { vbTeamsById, vbLeagues } = useSimVBStore();
  const result = vbResult(match);
  const paths = vbPaths(kind);
  const airing = vbAiring(match, now);
  const tile = useRef<HTMLDivElement>(null);
  // While on air, the score so far; the result replaces it once posted.
  const live = useVbLiveScore(
    match.MatchID,
    airing !== null && airing.state !== "upcoming",
    tile,
  );
  const board = result ?? live;
  const liveSet = !result && live ? live.Sets[live.Sets.length - 1] : undefined;

  const side = (teamId: number, name: string, home: boolean) => {
    const team = vbTeamsById[teamId];
    const color = sportTeamColors(team?.ColorOne, team?.ColorTwo).color;
    const won = result?.WinnerTeamID === teamId;
    const sets = board ? (home ? board.SetsHome : board.SetsAway) : null;
    const standing = standings?.get(teamId);
    const rank = ranks?.get(teamId);
    // Overall, then in conference for a college team that has one.
    const inConference =
      kind === "college" && standing?.ConferenceID != null;
    return (
      <div
        className="flex items-center gap-2 px-2 py-1.5"
        style={{ borderLeft: `5px solid ${color}` }}
      >
        <Logo
          url={vbTeamLogo(team, kind, vbLeagues[kind])}
          variant="tiny"
          containerClass="shrink-0"
        />
        {/* The record goes under the name, so five sets leave it room. */}
        <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
          <span
            {...vbLinkProps(() => navigate(paths.team(teamId)))}
            className={`cursor-pointer truncate hover:text-(--accent-primary) ${won ? "font-bold" : result ? "text-(--text-muted)" : ""}`}
          >
            {rank ? (
              <span
                className="mr-1 text-xs font-normal text-(--text-muted)"
                title={`No. ${rank} in the poll`}
              >
                {rank}
              </span>
            ) : null}
            {name}
          </span>
          {standing && (
            <span
              className="truncate text-xs tabular-nums text-(--text-muted)"
              title={inConference ? "Overall (conference)" : "Overall"}
            >
              {vbRecord(standing)}
              {inConference
                ? ` (${vbRecord({ Wins: standing.ConfWins, Losses: standing.ConfLosses })})`
                : ""}
            </span>
          )}
        </span>
        {board && (
          <>
            <span className="flex gap-2 text-xs tabular-nums">
              {board.Sets.map((set) => {
                const mine = home ? set.Home : set.Away;
                const theirs = home ? set.Away : set.Home;
                // The set in play is picked out, and stays shown on phones.
                if (set === liveSet) {
                  return (
                    <span
                      key={set.SetNumber}
                      className="w-5 text-right font-bold text-(--accent-primary)"
                      title={`Set ${set.SetNumber}, in play`}
                    >
                      {mine}
                    </span>
                  );
                }
                // Whoever took the set is the bright one, so the row reads
                // as the story of the match.
                return (
                  <span
                    key={set.SetNumber}
                    className={`hidden w-5 text-right sm:block ${mine > theirs ? "font-bold text-(--text-primary)" : "text-(--text-muted) opacity-70"}`}
                  >
                    {mine}
                  </span>
                );
              })}
            </span>
            <span
              className={`w-6 text-right text-lg tabular-nums ${won || !result ? "font-bold" : "text-(--text-muted)"}`}
            >
              {sets}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={tile}
      className="overflow-hidden rounded-lg bg-(--sport-surface) [box-shadow:var(--sport-shadow)] text-sm"
    >
      <div className="flex justify-between border-b border-(--sport-divider) px-2 py-1 text-xs text-(--text-muted)">
        <span>{vbMatchWhen(match)}</span>
        <span>
          {live?.Status === "ended" ? (
            // Aired in full; the result posts with the next refresh.
            "Ended"
          ) : airing?.state === "live" ? (
            <LiveBadge />
          ) : result ? (
            "Final"
          ) : airing ? (
            vbAiringLabel(airing)
          ) : (
            "Scheduled"
          )}{" "}
          · {vbMatchKindLabel(match.Kind)}
          {match.NeutralSite ? " · neutral" : ""}
        </span>
      </div>
      {side(match.AwayTeamID, match.AwayName, false)}
      {side(match.HomeTeamID, match.HomeName, true)}
      <div className="flex gap-4 border-t border-(--sport-divider) px-2 py-1.5 text-xs">
        {result ? (
          <>
            <span
              {...vbLinkProps(() =>
                navigate(vbMatchTab(kind, match.MatchID, "box")),
              )}
              className={vbLinkClass}
            >
              Box score
            </span>
            {watchable && (
              <span
                {...vbLinkProps(() =>
                  navigate(vbMatchTab(kind, match.MatchID, "replay")),
                )}
                className={vbLinkClass}
              >
                ▶ Watch
              </span>
            )}
            <span
              {...vbLinkProps(() => navigate(paths.match(match.MatchID)))}
              className={`ml-auto ${vbLinkClass}`}
            >
              Match page
            </span>
          </>
        ) : (
          <span
            {...vbLinkProps(() => navigate(paths.match(match.MatchID)))}
            className={vbLinkClass}
          >
            {airing?.state === "live" ? "▶ Watch live" : "Preview"}
          </span>
        )}
      </div>
    </div>
  );
};
