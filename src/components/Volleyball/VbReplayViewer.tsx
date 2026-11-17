import { SportSegmented } from "../Common/SportKit";
import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { useHref } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import {
  VbMatch,
  VbReplayManifest,
  vbApiOrigin,
  VolleyballReplayService,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
import { VbEmpty, VbLoad, VbPanel } from "./VbCommon";

// The drawing is the backend's own: the code its Discord clips and match
// videos are rendered with, kept unedited in src/_vendor/simvb-court-view.
// Nothing here draws on the canvas or over it, and the clip keeps its own
// timing (the rally, a hold, the last touch again in slow motion). A viewer
// may leave the slow-motion replay out; the frames shown are never changed. The rules
// are in TechDocs/volleyball/08-replay-viewer.md. The bundle is large, so it
// is fetched only when a rally is first watched.
export type CourtView = typeof import("../../_vendor/simvb-court-view/simvb-court-view.js");
type RallyPlayer = ReturnType<CourtView["playRally"]>;

const REPLAY_KEY = "simvb-include-replay";
const AUTO_NEXT_KEY = "simvb-play-on";

// public/simvb/fonts: the five fonts the drawing names.
const FONTS_URL = "/simvb/fonts";

let courtView: Promise<CourtView> | null = null;
/** The drawing code with its fonts registered: loaded once per visit. */
export const loadCourtView = () =>
  (courtView ??= import(
    "../../_vendor/simvb-court-view/simvb-court-view.js"
  ).then(async (lib) => {
    await lib.loadCourtFonts(FONTS_URL);
    return lib;
  }));

type StageStatus =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "missing" }
  | { kind: "error"; message: string };

interface StageProps {
  matchId: number;
  set: number;
  rally: number;
  /** Told whenever the clip reaches, or is taken back from, its end. */
  onEndedChange: (ended: boolean) => void;
  /**
   * Whether the clip's slow-motion replay of the last touch is shown. Without
   * it the clip ends after the rally and its hold.
   */
  includeReplay: boolean;
}

// One rally's clip. It is remounted for each rally, and starts playing as
// soon as its faces and logos have loaded.
const Stage: FC<StageProps> = ({
  matchId,
  set,
  rally,
  onEndedChange,
  includeReplay,
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<RallyPlayer | null>(null);
  const [status, setStatus] = useState<StageStatus>({ kind: "loading" });
  const [frame, setFrame] = useState({ index: 0, count: 1 });
  const [playing, setPlaying] = useState(false);
  // The first frame of the slow-motion replay; -1 when the clip has none.
  // The frames themselves are the backend's: the replay is only cut off.
  const [cut, setCut] = useState(-1);
  const cutRef = useRef(-1);
  const includeRef = useRef(includeReplay);
  includeRef.current = includeReplay;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [lib, view] = await Promise.all([
        loadCourtView(),
        VolleyballReplayService.getView(matchId, set, rally),
      ]);
      if (cancelled) return;
      if (!view) return setStatus({ kind: "missing" });
      if (view.courtViewVersion !== lib.CLIP_RENDER_VERSION) {
        console.warn(
          `The replay drawing code is version ${lib.CLIP_RENDER_VERSION} but the API draws version ${view.courtViewVersion}: update src/_vendor/simvb-court-view (TechDocs/volleyball/08-replay-viewer.md, "Updates").`,
        );
      }
      // Every face and both logos, before the first frame.
      const assets = await lib.preloadRallyAssets(view, vbApiOrigin);
      if (cancelled || !canvas.current) return;
      cutRef.current = lib.clipFrames(view).findIndex((item) => item.replay);
      setCut(cutRef.current);
      player.current = lib.playRally(canvas.current, view, assets, {
        onFrame: (index, count) => {
          // With the replay left out, stop on the rally's last hold frame.
          // The seek redraws it before the screen updates.
          const first = cutRef.current;
          if (!includeRef.current && first > 0 && index >= first) {
            player.current?.pause();
            player.current?.seek(first - 1);
            return;
          }
          setFrame({ index, count });
        },
      });
      setStatus({ kind: "ready" });
      player.current.play();
      setPlaying(true);
    })().catch((reason: unknown) => {
      if (!cancelled) {
        setStatus({
          kind: "error",
          message: reason instanceof Error ? reason.message : String(reason),
        });
      }
    });
    return () => {
      cancelled = true;
      player.current?.pause();
      player.current = null;
    };
  }, [matchId, set, rally]);

  const last = !includeReplay && cut > 0 ? cut - 1 : frame.count - 1;
  // Switched off while paused inside the replay: back to the rally's end.
  useEffect(() => {
    if (includeReplay || cut <= 0) return;
    const current = player.current;
    if (current && current.index >= cut) {
      current.pause();
      current.seek(cut - 1);
    }
  }, [includeReplay, cut]);
  const ended = status.kind === "ready" && frame.index >= last;
  useEffect(() => {
    if (ended) setPlaying(false);
    onEndedChange(ended);
  }, [ended, onEndedChange]);

  const toggle = () => {
    const current = player.current;
    if (!current) return;
    if (current.playing) {
      current.pause();
    } else {
      if (ended) current.seek(0);
      current.play();
    }
    setPlaying(current.playing);
  };

  return (
    <div>
      {/* The drawing size is fixed at 960 by 540; only CSS scales it. */}
      <canvas
        ref={canvas}
        width={960}
        height={540}
        role="img"
        aria-label="The rally, as the league's clips show it"
        className="block w-full rounded"
        style={{ height: "auto", aspectRatio: "16 / 9", background: "#0b1a33" }}
      />
      {status.kind === "loading" && (
        <div className="py-2 text-left text-sm text-(--text-muted)">
          Loading the replay...
        </div>
      )}
      {status.kind === "missing" && (
        <VbEmpty>This rally's replay was not kept.</VbEmpty>
      )}
      {status.kind === "error" && (
        <VbEmpty tone="error">
          The replay could not be shown: {status.message}
        </VbEmpty>
      )}
      {status.kind === "ready" && (
        <div className="mt-2 flex items-center gap-2">
          <SportButton size="sm" onClick={toggle}>
            {ended ? "Replay" : playing ? "Pause" : "Play"}
          </SportButton>
          <input
            type="range"
            className="flex-1"
            aria-label="Position in the clip"
            min={0}
            max={last}
            value={frame.index}
            onChange={(event) => {
              player.current?.pause();
              setPlaying(false);
              player.current?.seek(Number(event.target.value));
            }}
          />
        </div>
      )}
    </div>
  );
};

interface RallyRef {
  set: number;
  rally: number;
}

interface RallyListProps {
  set: VbReplayManifest["Sets"][number];
  selected: number;
  scores: Record<number, { Home: number; Away: number }>;
  match: VbMatch;
  onPick: (rally: number) => void;
}

// Memoized: the stage reports progress every frame, and this list does not
// need to follow it.
const RallyList = memo<RallyListProps>(({ set, selected, scores, match, onPick }) => (
  <div className="max-h-80 overflow-y-auto text-sm lg:max-h-[28rem]">
    {set.Rallies.map((rally) => {
      const score = scores[rally.Rally];
      // No winner is named while a rally is still on air.
      const winner =
        rally.WinnerTeamID === null
          ? ""
          : rally.WinnerTeamID === match.HomeTeamID
            ? match.HomeName
            : match.AwayName;
      return (
        <div
          key={rally.Rally}
          role="button"
          tabIndex={0}
          aria-pressed={rally.Rally === selected}
          aria-disabled={!rally.Retained}
          title={rally.Retained ? undefined : "This rally's replay was not kept."}
          onClick={() => rally.Retained && onPick(rally.Rally)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && rally.Retained) onPick(rally.Rally);
          }}
          className={`flex justify-between gap-3 border-b border-(--sport-divider) px-2 py-1 tabular-nums ${
            rally.Retained ? "cursor-pointer" : "opacity-40"
          } ${rally.Rally === selected ? "bg-(--accent-primary)/20 font-semibold" : ""}`}
        >
          <span>{rally.Rally}</span>
          <span>
            {score ? `${score.Home}–${score.Away}` : ""}{" "}
            <span className="text-(--text-muted)">
              {winner}
            </span>
          </span>
        </div>
      );
    })}
  </div>
));

interface VbReplayViewerProps {
  match: VbMatch;
  /** Open on this rally, as a Discord link asks. */
  start?: RallyRef;
  /** The page address of a rally, so the address bar can follow along. */
  linkFor?: (rally: RallyRef) => string;
}

/**
 * Every kept rally of a match, shown exactly as the league's clips show it.
 * This component is the frame around the clip: which rally, the list to
 * choose from, and a link to share.
 */
export const VbReplayViewer: FC<VbReplayViewerProps> = ({
  match,
  start,
  linkFor,
}) => {
  const id = match.MatchID;
  const manifest = useVbResource(`replay-manifest:${id}`, () =>
    VolleyballReplayService.getManifest(id),
  );
  // Play-by-play gives the score after each rally, for the list.
  const plays = useVbResource(`play-by-play:${id}`, () =>
    VolleyballService.getPlayByPlay(id),
  );
  const [picked, setPicked] = useState<RallyRef | null>(start ?? null);
  // On when watching a match through, and remembered per browser. A link to
  // one rally (a highlight, a top play) starts on that rally alone.
  const [autoNext, setAutoNext] = useState(() => {
    if (start) return false;
    try {
      return window.localStorage.getItem(AUTO_NEXT_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const changeAutoNext = (value: boolean) => {
    setAutoNext(value);
    try {
      window.localStorage.setItem(AUTO_NEXT_KEY, value ? "on" : "off");
    } catch {
      // Not remembered; the choice still holds for this visit.
    }
  };
  // Remembered per browser: a viewer's own preference, nothing more.
  const [includeReplay, setIncludeReplay] = useState(() => {
    try {
      return window.localStorage.getItem(REPLAY_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const changeIncludeReplay = (value: boolean) => {
    setIncludeReplay(value);
    try {
      window.localStorage.setItem(REPLAY_KEY, value ? "on" : "off");
    } catch {
      // Not remembered; the choice still holds for this visit.
    }
  };

  // Every rally whose replay was kept, in match order.
  const kept = useMemo<RallyRef[]>(
    () =>
      (manifest.data?.Sets ?? []).flatMap((set) =>
        set.Rallies.filter((rally) => rally.Retained).map((rally) => ({
          set: set.SetNumber,
          rally: rally.Rally,
        })),
      ),
    [manifest.data],
  );
  const current = picked ?? kept[0] ?? null;
  const currentSet = manifest.data?.Sets.find(
    (set) => set.SetNumber === current?.set,
  );
  const at = current
    ? kept.findIndex(
        (item) => item.set === current.set && item.rally === current.rally,
      )
    : -1;
  const isKept = at >= 0;
  const rallyKey = current ? `${id}:${current.set}:${current.rally}` : null;
  const scores = useMemo(
    () =>
      Object.fromEntries(
        (plays.data?.Lines ?? [])
          .filter((line) => line.Set === current?.set)
          .map((line) => [line.Rally, { Home: line.Home, Away: line.Away }]),
      ),
    [plays.data, current?.set],
  );

  // The address bar follows the rally on screen, so the page can be shared
  // as it stands. The router is not told: telling it would start the page
  // again, and the rally with it.
  const rallyHref = useHref(linkFor && current ? linkFor(current) : "");
  const followRally = Boolean(linkFor && picked);
  useEffect(() => {
    if (!followRally) return;
    window.history.replaceState(window.history.state, "", rallyHref);
  }, [followRally, rallyHref]);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(rallyHref, window.location.origin).toString(),
      );
      enqueueSnackbar("Link to this rally copied.", { variant: "success" });
    } catch {
      enqueueSnackbar("Could not copy. Use the address bar instead.", {
        variant: "error",
      });
    }
  };

  const previous = at > 0 ? kept[at - 1] : null;
  const next = at >= 0 && at < kept.length - 1 ? kept[at + 1] : null;
  const [ended, setEnded] = useState(false);
  useEffect(() => setEnded(false), [rallyKey]);
  useEffect(() => {
    if (!ended || !autoNext || !next) return;
    const timer = window.setTimeout(() => setPicked(next), 800);
    return () => window.clearTimeout(timer);
  }, [ended, autoNext, next]);

  if (!manifest.data) {
    return <VbLoad loading={manifest.loading} error={manifest.error} children={null} />;
  }
  if (!kept.length) {
    return (
      <VbPanel>
        <VbEmpty>
          {manifest.data.Status === "pending"
            ? "This match's replays are still being prepared."
            : "No replays were kept for this match. After a season ends the league keeps about a hundred highlight rallies, the last three college matches and the pro final; the box score and play-by-play are kept for every match."}
        </VbEmpty>
      </VbPanel>
    );
  }

  return (
    <VbPanel>
      <div className="grid gap-3 p-3 lg:grid-cols-[1fr_15rem]">
        <div>
          {isKept && current ? (
            <Stage
              key={rallyKey}
              matchId={id}
              set={current.set}
              rally={current.rally}
              onEndedChange={setEnded}
              includeReplay={includeReplay}
            />
          ) : (
            <VbEmpty>This rally's replay was not kept.</VbEmpty>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-(--text-muted)">
              Set {current?.set}, rally {current?.rally}
            </span>
            <SportButton
              size="sm"
              variant="secondary"
              disabled={!previous}
              onClick={() => previous && setPicked(previous)}
            >
              Previous rally
            </SportButton>
            <SportButton
              size="sm"
              variant="secondary"
              disabled={!next}
              onClick={() => next && setPicked(next)}
            >
              Next rally
            </SportButton>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={autoNext}
                onChange={(event) => changeAutoNext(event.target.checked)}
              />
              Play on to the next rally
            </label>
            <label
              className="flex items-center gap-1 text-sm"
              title="Each clip ends with the last touch again in slow motion"
            >
              <input
                type="checkbox"
                checked={includeReplay}
                onChange={(event) => changeIncludeReplay(event.target.checked)}
              />
              Include the slow-motion replay
            </label>
            {linkFor && current && (
              <SportButton size="sm" variant="secondary" onClick={copyLink}>
                Copy link
              </SportButton>
            )}
          </div>
        </div>
        <div>
          <SportSegmented
            classes="mb-2"
            label="Set"
            value={current?.set ?? null}
            onChange={(number) => {
              const first = kept.find((item) => item.set === number);
              if (first) setPicked(first);
            }}
            options={manifest.data.Sets.map(
              (set) =>
                [
                  set.SetNumber,
                  `Set ${set.SetNumber}`,
                  kept.some((item) => item.set === set.SetNumber)
                    ? undefined
                    : "No replays were kept for this set.",
                ] as const,
            )}
          />
          {currentSet && current && (
            <RallyList
              set={currentSet}
              selected={current.rally}
              scores={scores}
              match={match}
              onPick={(rallyNumber) =>
                setPicked({ set: current.set, rally: rallyNumber })
              }
            />
          )}
          <div className="mt-1 text-left text-xs text-(--text-muted)">
            Each row is the score after the rally and who won it.
          </div>
        </div>
      </div>
    </VbPanel>
  );
};
