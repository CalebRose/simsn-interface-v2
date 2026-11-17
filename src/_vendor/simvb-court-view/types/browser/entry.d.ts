import { type ClipOptions, type ClipTeam } from '../src/index.js';
import type { RallyReplay } from '@simsn/contracts';
export * from '../src/index.js';
/** The payload of the view route. */
export interface RallyView {
    courtViewVersion: number;
    matchId: number;
    set: number;
    rally: number;
    replay: RallyReplay;
    teams: ClipTeam[];
    options: Omit<ClipOptions, 'court'> & {
        court: {
            color: string;
        };
    };
    images: {
        courtLogoUrl: string | null;
        leagueLogoUrl: string;
    };
    playback: {
        width: number;
        height: number;
        fps: number;
        speed: number;
        replaySpeed: number;
        replayLeadMs: number;
        holdMs: number;
    };
}
/** Register the five font files (fonts/ in this folder) under the names the drawing uses. Call once. */
export declare function loadCourtFonts(fontsBaseUrl: string): Promise<void>;
export interface RallyAssets {
    /** The league logo (score bug, watermark). */
    leagueLogo: HTMLImageElement | null;
    /** The floor logo: the home team's, else the league's. */
    courtLogo: HTMLImageElement | null;
}
/**
 * Load everything a rally draws before the first frame: every face (players and officials) and both logos.
 * `apiBase` resolves the league logo's path ("/assets/logos/…"); the home logo URL is absolute.
 */
export declare function preloadRallyAssets(view: RallyView, apiBase: string): Promise<RallyAssets>;
/** One frame of the clip's schedule: rally time, whether it is the slow-motion replay, ms since the rally ended. */
export interface ClipFrame {
    t: number;
    replay: boolean;
    afterMs?: number;
}
/** The clip's frames, exactly as the server encodes them (rally, hold, slow-motion replay of the last touch, hold). */
export declare function clipFrames(view: RallyView): ClipFrame[];
/** Draw one frame of the clip on a canvas sized playback.width × playback.height. */
export declare function drawClipFrame(ctx: CanvasRenderingContext2D, view: RallyView, assets: RallyAssets, frame: ClipFrame): void;
/**
 * Play the clip on a canvas at its own frame rate. The canvas's drawing size must be playback.width ×
 * playback.height (960 × 540); scale it with CSS. Returns controls; `onFrame` reports progress.
 */
export declare function playRally(canvas: HTMLCanvasElement, view: RallyView, assets: RallyAssets, o?: {
    loop?: boolean;
    onFrame?: (index: number, count: number) => void;
}): {
    frames: ClipFrame[];
    play(): void;
    pause(): void;
    seek(i: number): void;
    readonly index: number;
    readonly playing: boolean;
};
/**
 * Play a rally in step with its broadcast (premieres, D-EVT-035): every animation frame draws the frame the
 * shared clock says is on air, so every viewer, and one who joins late, sees the same frame. `rallyStartsAt`
 * is the rally's air time in epoch ms on the server's clock (broadcast StartsAt + the rally's StartMs);
 * `clockOffsetMs` is server time minus this machine's (ServerNow − Date.now() when the broadcast was
 * fetched). Before its start the first frame shows; after its last frame `onEnd` is called once and the
 * last frame stays. Fetch the view with `?Broadcast=true` so its playback matches the air time.
 */
export declare function playAired(canvas: HTMLCanvasElement, view: RallyView, assets: RallyAssets, o: {
    rallyStartsAt: number;
    clockOffsetMs: number;
    onEnd?: () => void;
    onFrame?: (index: number, count: number) => void;
}): {
    frames: ClipFrame[];
    /** The clip's length in ms (the broadcast's DurationMs for this rally). */
    durationMs: number;
    stop(): void;
};
//# sourceMappingURL=entry.d.ts.map