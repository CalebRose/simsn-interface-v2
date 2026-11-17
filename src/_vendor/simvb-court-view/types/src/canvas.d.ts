/**
 * The drawing surface, typed by what the court view uses: the browser's CanvasRenderingContext2D and the
 * server's @napi-rs/canvas context both fit. Nothing here touches a DOM, a file or a clock.
 */
export interface ImageLike {
    readonly width: number;
    readonly height: number;
}
export interface Ctx2D {
    fillStyle: unknown;
    strokeStyle: unknown;
    lineWidth: number;
    font: string;
    textAlign: unknown;
    textBaseline: unknown;
    globalAlpha: number;
    fillRect(x: number, y: number, w: number, h: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    beginPath(): void;
    closePath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    arc(x: number, y: number, r: number, start: number, end: number): void;
    ellipse(x: number, y: number, rx: number, ry: number, rotation: number, start: number, end: number): void;
    roundRect(x: number, y: number, w: number, h: number, radii?: number | number[]): void;
    fill(): void;
    stroke(): void;
    clip(): void;
    save(): void;
    restore(): void;
    translate(x: number, y: number): void;
    scale(x: number, y: number): void;
    drawImage(image: any, dx: number, dy: number, dw: number, dh: number): void;
    measureText(text: string): {
        width: number;
    };
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
}
//# sourceMappingURL=canvas.d.ts.map