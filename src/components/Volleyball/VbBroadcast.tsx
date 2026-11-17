import { FC, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbAiredScore,
  VbBroadcast,
  VbMatch,
  VbSetScore,
  vbApiOrigin,
  VolleyballReplayService,
  VolleyballService,
} from "../../_services/volleyballService";
import { vbCell, VbEmpty, vbHeadClass, vbNum, VbPanel } from "./VbCommon";
import { vbResult } from "./vbFormatting";
import { LiveBadge } from "../Common/sportTheme";
import { CourtView, loadCourtView } from "./VbReplayViewer";

// A match airs at a set time and everyone watching sees the same rally at
// the same moment. The API holds the result back until the match has aired
// (and standings, stats and news until its whole slate has), so nothing here
// works a result out: the scoreboard is built only from rallies the API says
// have finished airing. TechDocs/volleyball/11-api-ask-league-premieres.md.

/** The time now, read again every `everyMs`, for countdowns and "Live" labels. */
export const useVbNow = (everyMs = 30_000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), everyMs);
    return () => window.clearInterval(timer);
  }, [everyMs]);
  return now;
};

export interface VbAiring {
  /** ended: it has aired and its result is about to appear. */
  state: "upcoming" | "live" | "ended";
  startsAt: number;
}

/**
 * Where a match stands with its broadcast: null when it has a result, does
 * not air, or has no start time yet (only the next slate's are known).
 */
export const vbAiring = (match: VbMatch, now: number): VbAiring | null => {
  if (vbResult(match)) return null;
  const starts = match.Broadcast?.StartsAt ?? match.BroadcastStartsAt;
  const startsAt = starts ? Date.parse(starts) : NaN;
  if (Number.isNaN(startsAt)) return null;
  if (match.Broadcast?.Status === "ended") return { state: "ended", startsAt };
  if (match.Broadcast?.Status === "live" || now >= startsAt) {
    return { state: "live", startsAt };
  }
  return { state: "upcoming", startsAt };
};

/** "8:00 PM" today, "Sat 8:00 PM" on another day, in the viewer's own time. */
export const vbAirTime = (startsAt: number) => {
  const when = new Date(startsAt);
  const time = when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return when.toDateString() === new Date().toDateString()
    ? time
    : `${when.toLocaleDateString([], { weekday: "short" })} ${time}`;
};

/** "1:02:03" or "4:05". */
export const vbCountdown = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
};

/** "Live", "Airs 8:00 PM": the short label for tiles and tables. */
export const vbAiringLabel = (airing: VbAiring) =>
  airing.state === "upcoming"
    ? `Airs ${vbAirTime(airing.startsAt)}`
    : airing.state === "live"
      ? "Live"
      : "Ended";

/**
 * Keeps a cached list of matches fresh while any of them is on air: its
 * result appears once it has aired, and the cache would not notice. Reads
 * again at once (the cache may be old) and then every `everyMs`.
 */
export const useVbAiringRefresh = <T,>(
  key: string | null,
  matches: VbMatch[],
  fetcher: () => Promise<T>,
  everyMs = 60_000,
) => {
  const { setVbResource } = useSimVBStore();
  const now = useVbNow();
  const onAir = matches.some((match) => {
    const airing = vbAiring(match, now);
    return airing !== null && airing.state !== "upcoming";
  });
  const latest = useRef(fetcher);
  latest.current = fetcher;

  useEffect(() => {
    if (!key || !onAir) return;
    let active = true;
    const read = () => {
      latest
        .current()
        .then((data) => {
          if (active) setVbResource(key, data);
        })
        .catch(() => {
          // What is shown stays; the next read tries again.
        });
    };
    read();
    const timer = window.setInterval(read, everyMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [key, onAir, everyMs, setVbResource]);
  return now;
};

type RallyView = Awaited<
  ReturnType<typeof VolleyballReplayService.getBroadcastView>
>;
interface Clip {
  view: NonNullable<RallyView>;
  assets: Awaited<ReturnType<CourtView["preloadRallyAssets"]>>;
  frames: ReturnType<CourtView["clipFrames"]>;
}
// A rally that is loading, loaded, or to be asked for again later.
type ClipState = Clip | { loading: true } | { retryAt: number };

const LIVE_POLL_MS = 3_000;

const noScore: VbAiredScore = { Home: 0, Away: 0, SetsHome: 0, SetsAway: 0 };

/** A match's score so far on air, for a tile. */
export interface VbLiveScore {
  Status: VbBroadcast["Status"];
  SetsHome: number;
  SetsAway: number;
  /** Every set that has started airing; the last may still be in play. */
  Sets: VbSetScore[];
}

/** The score from rallies that have finished airing, and nothing else. */
export const vbLiveScore = (air: VbBroadcast): VbLiveScore => {
  const finished = air.Aired.filter((rally) => rally.After);
  const latest = finished[finished.length - 1]?.After ?? noScore;
  const setNumbers = [...new Set(air.Aired.map((rally) => rally.Set))];
  return {
    Status: air.Status,
    SetsHome: latest.SetsHome,
    SetsAway: latest.SetsAway,
    Sets: setNumbers.map((SetNumber) => {
      const inSet = finished.filter((rally) => rally.Set === SetNumber);
      const after = inSet[inSet.length - 1]?.After;
      return { SetNumber, Home: after?.Home ?? 0, Away: after?.Away ?? 0 };
    }),
  };
};

// Slower than the match page: a slate can have many matches on air at once,
// and a tile only needs the score, not each rally as it starts.
const TILE_POLL_MS = 15_000;

/**
 * The score of a match on air, read from its broadcast while `onAir` is true
 * and the tile (`watch`) is on screen in a visible tab. Null until first read.
 */
export const useVbLiveScore = (
  matchId: number,
  onAir: boolean,
  watch: RefObject<HTMLElement | null>,
) => {
  const [score, setScore] = useState<VbLiveScore | null>(null);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const element = watch.current;
    if (!onAir || !element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onAir, watch]);

  useEffect(() => {
    if (!onAir || !onScreen) return;
    let active = true;
    let timer = 0;
    const read = async () => {
      let done = false;
      if (!document.hidden) {
        try {
          const air = await VolleyballService.getBroadcast(matchId);
          if (!active) return;
          setScore(vbLiveScore(air));
          // Its result arrives with the schedule's own refresh.
          done = air.Status === "ended";
        } catch {
          // What is shown stays; the next read tries again.
        }
      }
      if (!active || done) return;
      // A little jitter, so a slate's tiles do not all ask at once.
      timer = window.setTimeout(read, TILE_POLL_MS + Math.random() * 3_000);
    };
    void read();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [matchId, onAir, onScreen]);

  return onAir ? score : null;
};

/**
 * A match on air. The rally on screen is worked out from the broadcast's
 * start time and the server's clock, so every viewer is in step and someone
 * arriving late joins at the current rally. There is no pause and no seeking:
 * it is live. `onEnded` is called once the broadcast is over.
 */
export const VbLiveMatch: FC<{
  match: VbMatch;
  onEnded: () => void;
}> = ({ match, onEnded }) => {
  const id = match.MatchID;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [air, setAir] = useState<VbBroadcast | null>(null);
  const [failed, setFailed] = useState(false);
  const [lib, setLib] = useState<CourtView | null>(null);
  const [showing, setShowing] = useState<{ set: number; rally: number } | null>(
    null,
  );
  const airRef = useRef<VbBroadcast | null>(null);
  // Server time minus this device's time.
  const offset = useRef(0);
  const ended = useRef(onEnded);
  ended.current = onEnded;
  const now = useVbNow(1_000) + offset.current;

  useEffect(() => {
    let active = true;
    let timer = 0;
    const poll = async () => {
      let wait = 10_000;
      try {
        const next = await VolleyballService.getBroadcast(id);
        if (!active) return;
        offset.current = Date.parse(next.ServerNow) - Date.now();
        airRef.current = next;
        setAir(next);
        setFailed(false);
        if (next.Status === "ended") {
          ended.current();
        } else if (next.Status === "live") {
          wait = LIVE_POLL_MS;
        } else {
          // Not started: ask again at the start, or soon when it is close.
          const until = Date.parse(next.StartsAt) - Date.parse(next.ServerNow);
          wait = Math.min(15_000, Math.max(2_000, until));
        }
      } catch {
        if (!active) return;
        setFailed(true);
      }
      timer = window.setTimeout(poll, wait);
    };
    void poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    loadCourtView()
      .then((loaded) => {
        if (active) setLib(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // The drawing: each frame of each rally is the backend's own, chosen by
  // the clock. The last frame is held through the gap to the next rally.
  useEffect(() => {
    if (!lib) return;
    const clips = new Map<string, ClipState>();
    let active = true;
    let drawn = "";
    let onScreen = "";

    const load = (set: number, rally: number) => {
      const key = `${set}:${rally}`;
      const state = clips.get(key);
      if (state && !("retryAt" in state && Date.now() >= state.retryAt)) return;
      clips.set(key, { loading: true });
      (async () => {
        const view = await VolleyballReplayService.getBroadcastView(id, set, rally);
        // Not released yet: the API gives each rally a short head start.
        if (!view) return clips.set(key, { retryAt: Date.now() + 2_000 });
        const assets = await lib.preloadRallyAssets(view, vbApiOrigin);
        if (active) clips.set(key, { view, assets, frames: lib.clipFrames(view) });
      })().catch(() => {
        clips.set(key, { retryAt: Date.now() + 5_000 });
      });
    };

    let request = 0;
    const tick = () => {
      request = window.requestAnimationFrame(tick);
      const current = airRef.current;
      const context = canvas.current?.getContext("2d");
      if (!current || !context || current.Status === "scheduled") return;
      const t = Date.now() + offset.current - Date.parse(current.StartsAt);
      if (current.Next) load(current.Next.Set, current.Next.Rally);

      // The rally on air: the latest that has started.
      let rally: { Set: number; Rally: number; StartMs: number; DurationMs?: number } | null =
        null;
      for (const aired of current.Aired) {
        if (aired.StartMs <= t) rally = aired;
      }
      if (current.Next && current.Next.StartMs <= t) rally = current.Next;
      if (!rally) return;

      const key = `${rally.Set}:${rally.Rally}`;
      load(rally.Set, rally.Rally);
      const clip = clips.get(key);
      if (!clip || !("frames" in clip)) return;
      const fps = clip.view.playback.fps;
      // The broadcast's own length for the clip: where it leaves the
      // slow-motion replay out, the frames stop before it.
      const last = Math.max(
        0,
        Math.min(
          clip.frames.length - 1,
          rally.DurationMs
            ? Math.round((rally.DurationMs / 1000) * fps) - 1
            : clip.frames.length - 1,
        ),
      );
      const index = Math.min(
        last,
        Math.max(0, Math.floor(((t - rally.StartMs) / 1000) * fps)),
      );
      const stamp = `${key}:${index}`;
      if (stamp === drawn) return;
      drawn = stamp;
      lib.drawClipFrame(context, clip.view, clip.assets, clip.frames[index]);
      if (onScreen !== key) {
        onScreen = key;
        setShowing({ set: rally.Set, rally: rally.Rally });
        // Rallies already shown are let go.
        const next = current.Next
          ? `${current.Next.Set}:${current.Next.Rally}`
          : "";
        for (const other of [...clips.keys()]) {
          if (other !== key && other !== next) clips.delete(other);
        }
      }
    };
    request = window.requestAnimationFrame(tick);
    return () => {
      active = false;
      window.cancelAnimationFrame(request);
    };
  }, [lib, id]);

  // The score, from rallies that have finished airing and nothing else.
  const finished = useMemo(
    () => (air?.Aired ?? []).filter((rally) => rally.After),
    [air],
  );
  const score = finished[finished.length - 1]?.After ?? noScore;
  const setNumbers = [...new Set((air?.Aired ?? []).map((rally) => rally.Set))];
  const setScore = (set: number) => {
    const inSet = finished.filter((rally) => rally.Set === set);
    return inSet[inSet.length - 1]?.After ?? null;
  };
  const feed = useMemo(
    () =>
      finished
        .map((rally, index) => {
          const before =
            index > 0 && finished[index - 1].Set === rally.Set
              ? finished[index - 1].After!
              : noScore;
          return {
            ...rally,
            After: rally.After!,
            homeWon: rally.After!.Home > before.Home,
          };
        })
        .reverse(),
    [finished],
  );

  const startsAt = air ? Date.parse(air.StartsAt) : null;
  const sinceStart = startsAt === null ? 0 : now - startsAt;
  const onBreak =
    air?.Break &&
    sinceStart >= air.Break.StartMs &&
    sinceStart < air.Break.StartMs + air.Break.DurationMs
      ? air.Break
      : null;

  let status: string;
  if (!air) {
    status = failed ? "The broadcast could not be reached. Trying again..." : "Joining the broadcast...";
  } else if (air.Status === "ended") {
    status = "The match has ended. Its result is being posted.";
  } else if (air.Status === "scheduled" || !air.Aired.length) {
    status =
      startsAt !== null && startsAt > now
        ? `Starts in ${vbCountdown(startsAt - now)}`
        : "Starting shortly...";
  } else if (onBreak) {
    status = `Set break · play resumes in ${vbCountdown(
      onBreak.StartMs + onBreak.DurationMs - sinceStart,
    )}`;
  } else if (showing) {
    status = `Set ${showing.set}, rally ${showing.rally}`;
  } else {
    status = "Loading the rally...";
  }

  return (
    <VbPanel>
      <div className="grid gap-3 p-3 lg:grid-cols-[1fr_17rem]">
        <div>
          {/* The drawing size is fixed at 960 by 540; only CSS scales it. */}
          <canvas
            ref={canvas}
            width={960}
            height={540}
            role="img"
            aria-label="The match, live"
            className="block w-full rounded"
            style={{ height: "auto", aspectRatio: "16 / 9", background: "#0b1a33" }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {air?.Status === "live" && <LiveBadge />}
            <span aria-live="polite">{status}</span>
          </div>
          <div className="mt-1 text-left text-xs text-(--text-muted)">
            Everyone watching sees the same rally at the same moment. The
            result appears across the site once the match has aired.
            {failed && air ? " The connection dropped; trying again." : ""}
          </div>
        </div>
        <div>
          <table data-keep-table className="w-full text-sm tabular-nums">
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Team</th>
                <th className={`${vbCell} text-right`}>Sets</th>
                {setNumbers.map((set) => (
                  <th key={set} className={`${vbCell} text-right`}>
                    {set}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["Away", "Home"] as const).map((side) => (
                <tr key={side}>
                  <td className={`${vbCell} max-w-[8rem] truncate text-left`}>
                    {side === "Away" ? match.AwayName : match.HomeName}
                  </td>
                  <td className={`${vbNum} font-bold`}>
                    {side === "Away" ? score.SetsAway : score.SetsHome}
                  </td>
                  {setNumbers.map((set) => (
                    <td key={set} className={vbNum}>
                      {setScore(set)?.[side] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 max-h-72 overflow-y-auto text-sm">
            {feed.map((rally) => (
              <div
                key={`${rally.Set}:${rally.Rally}`}
                className="flex justify-between gap-3 border-b border-(--sport-divider) px-2 py-1 tabular-nums"
              >
                <span className="text-(--text-muted)">
                  S{rally.Set} · {rally.Rally}
                </span>
                <span>
                  {rally.After.Home}–{rally.After.Away}{" "}
                  <span className="text-(--text-muted)">
                    {rally.homeWon ? match.HomeName : match.AwayName}
                  </span>
                </span>
              </div>
            ))}
            {!feed.length && <VbEmpty>No rally has finished yet.</VbEmpty>}
          </div>
          <div className="mt-1 text-left text-xs text-(--text-muted)">
            Each row is the score after the rally (home first) and who won it.
          </div>
        </div>
      </div>
    </VbPanel>
  );
};
