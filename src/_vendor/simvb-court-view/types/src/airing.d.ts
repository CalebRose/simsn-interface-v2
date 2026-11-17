/**
 * Broadcast timing (premieres, 2026-11-15): how long each rally airs and where it sits in a match's
 * broadcast. Shared, unchanged, by the server (which publishes the schedule and gates rallies by it) and
 * the interface's player (which plays each rally's frames), so the two always agree.
 *
 *   rally clip   the rally's frames at the clip rate: the rally, a hold, and (when the rally shows a
 *                slow-motion replay) the replay of the last touch and a second hold (`clipTimeline`)
 *   gap          a pause after each rally
 *   set break    after the last rally of a set, instead of the gap
 */
/** The playback the rally view route serves (the clip's own settings). */
export declare const BROADCAST_PLAYBACK: {
    readonly width: 960;
    readonly height: 540;
    readonly fps: 30;
    readonly speed: 1;
    readonly replaySpeed: 0.35;
    readonly replayLeadMs: 700;
    readonly holdMs: 1000;
};
export type ReplayRule = 'none' | 'set_points' | 'all';
export interface AiringOptions {
    fps: number;
    speed: number;
    replaySpeed: number;
    replayLeadMs: number;
    holdMs: number;
    /** Pause after each rally. */
    gapMs: number;
    /** Break after the last rally of a set (instead of the gap). */
    setBreakMs: number;
    /** Which rallies show the slow-motion replay. */
    replays: ReplayRule;
}
export declare const DEFAULT_AIRING: AiringOptions;
/** One rally as the schedule needs it: its replay's length and last contact, and the score once it is over. */
export interface AiringRally {
    set: number;
    rally: number;
    /** The replay's `durationMs`. */
    durationMs: number;
    /** The replay's last ball segment start (`ballSegments.at(-1).fromMs`, 0 when none): where the slow-motion replay begins. */
    lastContactMs: number;
    /** The score after this rally (sets won include this rally's set if it ended it). */
    after: {
        home: number;
        away: number;
        setsHome: number;
        setsAway: number;
    };
}
export interface AiringRallySlot extends AiringRally {
    kind: 'rally';
    startMs: number;
    /** How long the rally's clip plays: its frame count over the frame rate. */
    clipMs: number;
    /** The rally shows the slow-motion replay. */
    replay: boolean;
    /** The last rally of a set. */
    setEnding: boolean;
}
export interface AiringBreak {
    kind: 'set_break';
    /** The set just finished. */
    afterSet: number;
    startMs: number;
    durationMs: number;
}
export type AiringSlot = AiringRallySlot | AiringBreak;
/** Frames of a rally's clip (the same count `clipFrames` gives the player). */
export declare function rallyClipFrames(durationMs: number, lastContactMs: number, replay: boolean, o?: Pick<AiringOptions, 'fps' | 'speed' | 'replaySpeed' | 'replayLeadMs' | 'holdMs'>): number;
/** Milliseconds a rally's clip plays. */
export declare function rallyClipMs(durationMs: number, lastContactMs: number, replay: boolean, o?: Pick<AiringOptions, 'fps' | 'speed' | 'replaySpeed' | 'replayLeadMs' | 'holdMs'>): number;
/**
 * The broadcast running order of a match: every rally's start and clip length, gaps between rallies and
 * a break between sets. `totalMs` is the end of the last rally's clip. Rallies must be in play order.
 */
export declare function airingSchedule(rallies: readonly AiringRally[], o?: AiringOptions): {
    slots: AiringSlot[];
    totalMs: number;
};
//# sourceMappingURL=airing.d.ts.map