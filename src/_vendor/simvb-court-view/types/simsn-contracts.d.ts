// The rally replay as the view route sends it (backend @simsn/contracts RallyReplaySchema, replayVersion 1).
declare module '@simsn/contracts' {
  export interface BallSegment {
    fromMs: number;
    toMs: number;
    from: [number, number, number];
    to: [number, number, number];
    arc: 'float' | 'topspin' | 'loft' | 'fast' | 'deflect' | 'drop';
    vz0: number;
    gravity: number;
    contactEventId?: string;
  }
  export interface PlayerKeyframe {
    tMs: number;
    x: number;
    y: number;
    state?: 'ready' | 'shift' | 'sprint' | 'approach' | 'jump' | 'dive' | 'recover';
    h?: number;
  }
  export interface RallyReplay {
    rallyId: string;
    matchId: number;
    setNumber: number;
    rallyNumber: number;
    replayVersion: number;
    durationMs: number;
    courtOrientation: 'a_bottom' | 'b_bottom';
    participants: Array<{ playerId: number; teamId: number; jersey: string; libero?: true }>;
    playerTracks: Array<{ playerId: number; keyframes: PlayerKeyframe[] }>;
    ballSegments: BallSegment[];
    anchors: Array<{ tMs: number; eventId: string }>;
    checksum: string;
  }
}
