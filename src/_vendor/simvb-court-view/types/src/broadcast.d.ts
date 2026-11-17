/** Moved from @simsn/clips (2026-11-14): shared by server clips and the interface's replay viewer. */
import type { RallyReplay } from '@simsn/contracts';
import type { Ctx2D, ImageLike } from './canvas.js';
/**
 * Broadcast dressing for match videos (D-EVT-029): the SimSN score bug across the top, and the first referee
 * on her stand at the net, signalling. Display only.
 */
/** SimSN brand colours, from the league logos. */
export declare const BRAND: {
    navy: string;
    gold: string;
    grey: string;
};
export interface ScoreSide {
    name: string;
    /** Short name for the bug (NEB, WIS); made from the name when absent. */
    abbr?: string | undefined;
    /** Poll rank going into the match, shown only inside the top 25. */
    rank?: number | undefined;
    /** Record going into the match: "12-3". */
    record?: string | undefined;
    color: string;
    /** Points in this set before the rally. */
    points: number;
    /** Points once the rally is over. */
    pointsAfter?: number | undefined;
    sets: number;
    serving?: boolean | undefined;
    /** Timeouts she has left this set (shown as small bars under the name). */
    timeoutsLeft?: number | undefined;
}
export interface Scoreboard {
    home: ScoreSide;
    away: ScoreSide;
    setNumber: number;
    setsToWin: number;
    /** Finished sets, home–away, oldest first. */
    previous?: ReadonlyArray<readonly [number, number]> | undefined;
    /** "SET POINT" or "MATCH POINT", hung under the team that holds it. */
    flag?: {
        text: string;
        side: 'home' | 'away';
    } | undefined;
    timeoutsPerSet?: number | undefined;
}
/** How the first referee calls the end of a rally. */
export type RefCall = 'in' | 'out' | 'touched' | 'net' | 'four_hits' | 'ball_handling' | 'foot_fault' | 'rotation' | 'fault';
/** What the first referee shows when the rally ends. */
export interface RefereeCall {
    /** The team that won the point: she then points to its side (it serves next). */
    winnerTeamId: number;
    call: RefCall;
    /** Court y where the ball came down, for "in" (she points at the floor on that side). */
    landingY?: number | undefined;
}
/** The words shown beside her for each call, as a broadcast captions it. */
export declare const CALL_LABEL: Record<RefCall, string>;
/** A team's short name: the admin's abbreviation, else the first letters of a one-word name or the initials. */
export declare function abbreviate(name: string): string;
/**
 * The score bug (D-EVT-032/033): one panel in the top-left corner, over the stands, never over the court.
 * Columns, left to right: the league logo; the teams (away above home, as broadcasts list them), each row a
 * bar of her colour, poll rank (top 25 only), short name and record, then a gold dot when she is serving, her
 * sets won as pips and her timeouts left as small bars under them; the points; the set, with the finished
 * sets under it. A gold rule runs under the whole panel. SET POINT or MATCH POINT hangs off the right edge
 * of the row of the team that has it. When the rally is over the new score shows and the points of the team
 * that won it turn gold.
 */
export declare function drawScoreboard(ctx: Ctx2D, sb: Scoreboard, o: {
    W: number;
    top: number;
    over: boolean;
    logo: ImageLike | null;
}): void;
/** Where each team plays in this rally: the sign of its players' court y at the start. */
export declare function teamSides(replay: RallyReplay): Map<number, number>;
/** Officials' shirts, for their faces' jerseys (black and white). */
export declare const OFFICIAL_KIT: [string, string, string];
/** A stable face per official per match: four officials, ids well away from any person's. */
export declare const officialFace: (replay: RallyReplay, k: number) => number;
/**
 * The first referee on her stand across the net from the scorers' table. Before the serve she waves the
 * server on; in play her hands are down; at the whistle she makes the call for a second, then holds a hand
 * out to the team that won the point, which serves next. `t` runs on past the end of the rally.
 */
export declare function drawReferee(ctx: Ctx2D, replay: RallyReplay, 
/** Rally time; past the rally's end it keeps running (the pause, a between-rally scene). */
t: number, call: RefereeCall | undefined, g: {
    sx: (y: number) => number;
    sy: (x: number) => number;
    scale: number; /** The visible band (below the score bug, above the bottom bar). */
    minY?: number;
    maxY?: number; /** No serve to wave on (a between-rally scene). */
    noServe?: boolean;
}): void;
/**
 * The other officials (D-EVT-031/033): the second referee on the floor at the post on the scorers' side, who
 * repeats the point; and two line judges at opposite corners with flags, who show in (flag down) or out
 * (flag up) for a ball that lands in their half.
 */
export declare function drawOfficials(ctx: Ctx2D, replay: RallyReplay, t: number, call: RefereeCall | undefined, g: {
    sx: (y: number) => number;
    sy: (x: number) => number;
    scale: number;
}): void;
/** The call the first referee is showing at time `t` (on the strip at the bottom), or null. */
export declare function refereeCallNow(replay: RallyReplay, t: number, call: RefereeCall): string | null;
/**
 * Every face a rally draws, with the colours it is drawn in: each player (a libero in her team's colours
 * swapped) and the four officials. A viewer that loads faces before drawing loads exactly these.
 */
export declare function facesInRally(replay: RallyReplay, teams: ReadonlyArray<{
    teamId: number;
    colorOne: string;
    colorTwo: string;
    colorThree?: string | null | undefined;
}>): Array<{
    personId: number;
    colors: [string | undefined, string | undefined, string | null | undefined];
}>;
//# sourceMappingURL=broadcast.d.ts.map