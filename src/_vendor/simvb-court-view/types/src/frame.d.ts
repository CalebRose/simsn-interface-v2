import type { RallyReplay } from '@simsn/contracts';
import type { Ctx2D, ImageLike } from './canvas.js';
import { type RefereeCall, type Scoreboard } from './broadcast.js';
/**
 * Rally clips (D-EVT-007, PR 055): a stored replay drawn frame by frame — the same top-down court the
 * viewer shows, turned horizontal for 16:9 — and encoded to H.264 MP4 with ffmpeg. It never simulates:
 * keyframes and ball arcs are interpolated exactly as the viewer does. Every clip carries the SimSN /
 * league watermark (and the league logo when given). Deterministic for a given replay and options.
 */
export declare const CLIP_RENDER_VERSION = 13;
export interface ClipTeam {
    teamId: number;
    name: string;
    colorOne: string;
    colorTwo: string;
    colorThree?: string | null | undefined;
    /** For the score bug (D-EVT-032): short name, poll rank going in (top 25 only shown), record going in. */
    abbr?: string | null | undefined;
    rank?: number | null | undefined;
    record?: string | null | undefined;
}
/** The floor: the home team's court (its colour and logo), or a neutral court with the league logo. */
export interface CourtStyle {
    /** Court paint (hex); the default is the classic orange. */
    color?: string | undefined;
    /** Drawn faintly at centre court. */
    logo?: ImageLike | null | undefined;
}
export interface ClipOptions {
    /** Top bar, e.g. "Stanford vs Louisville · Set 3 · 21–20". */
    header: string;
    /** Spoiler-free ticker: the latest label at or before `t` ("Set · Kim"), with a running touch count. */
    timeline?: ReadonlyArray<{
        tMs: number;
        label: string; /** The touch's graded quality (0–1): a faint tint on its contact ring. */
        q?: number | undefined;
    }> | undefined;
    /** Shown only after the rally ends (the final hold). */
    outcome?: string | undefined;
    /** Kept for callers; no longer drawn (the league logo is the watermark). */
    caption?: string | undefined;
    watermark?: string | undefined;
    /** League logo (local PNG) for the top-right corner. */
    logoPath?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    fps?: number | undefined;
    /** Playback speed of the rally itself (1 = real time). */
    speed?: number | undefined;
    /** Speed of the slow-motion replay of the deciding touch (0 or undefined after `replayLeadMs` = none). */
    replaySpeed?: number | undefined;
    /** The replay starts this long before the last contact. */
    replayLeadMs?: number | undefined;
    /** Hold on the last frame (ms), after the rally and again after the replay. */
    holdMs?: number | undefined;
    /** Draw each player's face (as the interface draws it) in her marker, with the number on a badge. */
    faces?: boolean | undefined;
    /** Player names by player ID, shown small under each marker. */
    names?: Readonly<Record<string, string>> | undefined;
    court?: CourtStyle | undefined;
    /** The team area beside the court (D-EVT-028): benches, a coach each, the scorers' table. None when absent. */
    sideline?: Sideline | undefined;
    /** Who is serving and her match so far, shown in the bottom bar as the rally starts (D-EVT-031). */
    server?: {
        name: string;
        line: string;
    } | undefined;
    /** Draw the officials even with no call to make (a timeout, teams walking on). */
    officials?: boolean | undefined;
    /** A banner over the court (a timeout, teams changing ends). */
    banner?: string | undefined;
    /** Keep the camera where it is when teams change ends (match videos); clips keep team A on the left. */
    fixedCamera?: boolean | undefined;
    /** A branded score bug in place of the header text (D-EVT-029). */
    scoreboard?: Scoreboard | undefined;
    /** The first referee at the net and her signals (D-EVT-029). None when absent. */
    referee?: RefereeCall | undefined;
    /** Sound for the clip (D-EVT-023); none when absent. */
    /** Sound (server clips only; the drawing ignores it). */
    sound?: unknown;
}
/** Who is off the court: jersey numbers on each team's bench, by team ID. */
export interface Sideline {
    bench: Readonly<Record<string, readonly string[]>>;
}
/**
 * A home court's paint from the team's colours: the first colour (the second when the first is near
 * white), toned down toward a dark floor so the players' markers stay the brightest thing on it.
 */
export declare function homeCourtColor(team: {
    colorOne: string;
    colorTwo: string;
}): string;
/** The neutral (tournament) floor. */
export declare const NEUTRAL_COURT = "#24406e";
/** A marker fill that stands out on the court: the team's second colour when its first is too close. */
export declare function markerColors(team: {
    colorOne: string;
    colorTwo: string;
} | undefined, court?: string): {
    fill: string;
    ring: string;
};
export type FrameOptions = Omit<ClipOptions, 'width' | 'height'> & {
    width: number;
    height: number; /** This frame is part of the slow-motion replay. */
    replay?: boolean | undefined; /** On a hold frame: ms since the rally ended. */
    afterMs?: number | undefined; /** This replay is a between-rally scene (no ball; the rally before it is over). */
    scene?: boolean | undefined;
};
/**
 * Frame times for a clip: the rally at `speed`, a short hold on the result, then the deciding touch again
 * in slow motion and a final hold (D-EVT-015). Pure, so the timing is testable without encoding.
 */
export declare function clipTimeline(durationMs: number, lastContactMs: number, o: {
    fps: number;
    speed: number;
    replaySpeed: number;
    replayLeadMs: number;
    holdMs: number;
}): Array<{
    t: number;
    replay: boolean;
    afterMs?: number;
}>;
export interface View {
    cx: number;
    cy: number;
    flip: number;
    scale: number;
    W: number;
    H: number;
    top: number;
    bottom: number;
}
/**
 * Camera offset at time t: where the frame must slide so the ball stays inside its margins, smoothed over
 * about a second so the move is a glide (and it starts before the ball gets there). Stateless: any frame
 * can be drawn on its own.
 */
export declare function cameraPan(replay: RallyReplay, t: number, v: View): {
    x: number;
    y: number;
};
/** Draw one frame at replay time `t` (ms). */
export declare function drawFrame(ctx: Ctx2D, replay: RallyReplay, teams: readonly ClipTeam[], t: number, o: FrameOptions, logo: ImageLike | null): void;
//# sourceMappingURL=frame.d.ts.map