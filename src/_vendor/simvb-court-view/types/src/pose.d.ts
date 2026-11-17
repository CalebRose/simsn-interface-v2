import type { RallyReplay } from '@simsn/contracts';
/**
 * Player poses for clips (D-EVT-019): the same sensibility as the ball, which lifts off its shadow and
 * grows as it rises. A replay stores where a player is and what she is doing at each keyframe (run, jump,
 * dive); this turns that into how she is drawn between them: eased movement, a jump that rises and lands,
 * a dive that flattens and recovers. Display only: positions at keyframes are exactly the replay's.
 */
type Keyframe = RallyReplay['playerTracks'][number]['keyframes'][number];
export interface Pose {
    x: number;
    y: number;
    /** Metres off the floor right now (her recorded jump height at the top; 0.6 when the replay has none). */
    lift: number;
    /** 0 upright … 1 laid out on the floor. */
    dive: number;
    /** Ground speed now, m/s (for the running bob). */
    speed: number;
}
/** Jump timing around a 'jump' keyframe (the contact is the top of the jump). */
export declare const JUMP: {
    riseMs: number;
    fallMs: number;
};
/** Dive timing around a 'dive' keyframe: going down, staying down, getting up. */
export declare const DIVE: {
    downMs: number;
    holdMs: number;
    upMs: number;
};
export declare function playerPose(keyframes: readonly Keyframe[], t: number): Pose;
/** Who touched the ball when: the player nearest each ball flight's start (within reach), for a contact pulse. */
export declare function contactPulses(replay: RallyReplay): Array<{
    playerId: number;
    tMs: number;
}>;
export {};
//# sourceMappingURL=pose.d.ts.map