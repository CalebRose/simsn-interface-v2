import type { ImageLike } from './canvas.js';
/**
 * What the court view needs from where it runs: player and official faces, already rasterised. The server
 * (clips) and the browser bundle each provide it. Without it, markers show numbers only.
 */
export type FaceTeamColors = readonly [string | null | undefined, string | null | undefined, string | null | undefined];
export type FaceSource = (personId: number, colors: FaceTeamColors, sizePx: number) => ImageLike | null;
export declare function configureCourtView(env: {
    face?: FaceSource | undefined;
}): void;
export declare function faceImage(personId: number, colors: FaceTeamColors, sizePx: number): ImageLike | null;
/**
 * Fonts by family name; each environment registers the same files under these names (fonts/ in the
 * hand-off folder; packages/clips/assets/fonts on the server). Graphics: Barlow Condensed. Body text
 * (numbers, names, benches): DejaVu Sans, pinned so every machine draws the same glyphs.
 */
export declare const FONT_FAMILIES: {
    readonly semibold: {
        readonly family: "SimSN Semibold";
        readonly file: "BarlowCondensed-SemiBold.ttf";
    };
    readonly bold: {
        readonly family: "SimSN Bold";
        readonly file: "BarlowCondensed-Bold.ttf";
    };
    readonly extrabold: {
        readonly family: "SimSN Extrabold";
        readonly file: "BarlowCondensed-ExtraBold.ttf";
    };
    readonly body: {
        readonly family: "SimSN Body";
        readonly file: "DejaVuSans.ttf";
    };
    readonly bodyBold: {
        readonly family: "SimSN Body Bold";
        readonly file: "DejaVuSans-Bold.ttf";
    };
};
export declare function graphicsFont(weight: 'semibold' | 'bold' | 'extrabold', px: number): string;
export declare function bodyFont(weight: 'regular' | 'bold', px: number): string;
/** Source crop in the faces.js 400×600 box: the hair's top to the shoulders, so the jersey shows. */
export declare const FACE_CROP: {
    readonly x: -60;
    readonly y: 40;
    readonly size: 520;
};
//# sourceMappingURL=env.d.ts.map