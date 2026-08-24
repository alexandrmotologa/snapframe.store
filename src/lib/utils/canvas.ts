import { Background } from "@/lib/types";

/** Convert a Background definition to a CSS background string for preview */
export function backgroundToCSS(bg: Background): string {
  if (bg.type === "solid" && bg.color) {
    return bg.color;
  }
  if (bg.type === "gradient" && bg.gradient) {
    const dirMap: Record<string, string> = {
      "to-b": "to bottom",
      "to-r": "to right",
      "to-br": "to bottom right",
      "to-bl": "to bottom left",
      "to-tr": "to top right",
      "to-tl": "to top left",
    };
    const dir = dirMap[bg.gradient.direction] ?? "to bottom";
    const stops = bg.gradient.stops
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");
    return `linear-gradient(${dir}, ${stops})`;
  }
  if (bg.type === "image" && bg.imageUrl) {
    return `url(${bg.imageUrl})`;
  }
  return "#1e1b4b";
}

/** Draw background (solid, gradient, mesh, or image fallback) directly onto a 2D Canvas context */
export function drawBackgroundToCanvas(
  ctx: CanvasRenderingContext2D,
  bg: Background,
  W: number,
  H: number,
  bgImg?: HTMLImageElement | null
): void {
  if (bg.type === "solid" && bg.color) {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, W, H);
  } else if (bg.type === "gradient" && bg.gradient) {
    const dirs: Record<string, [number, number, number, number]> = {
      "to-b":  [0, 0, 0, H], "to-r":  [0, 0, W, 0],
      "to-br": [0, 0, W, H], "to-bl": [W, 0, 0, H],
      "to-tr": [0, H, W, 0], "to-tl": [W, H, 0, 0],
    };
    const [x0, y0, x1, y1] = dirs[bg.gradient.direction] ?? [0, 0, 0, H];
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const stop of bg.gradient.stops) {
      grad.addColorStop(Math.min(Math.max(stop.position / 100, 0), 1), stop.color);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else if (bg.type === "mesh" && bg.mesh) {
    const { topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: br } = bg.mesh;
    const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.hypot(W, H));
    g1.addColorStop(0, tl + "cc"); g1.addColorStop(1, tl + "00");
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W, 0, 0, W, 0, Math.hypot(W, H));
    g2.addColorStop(0, tr + "cc"); g2.addColorStop(1, tr + "00");
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    const g3 = ctx.createRadialGradient(0, H, 0, 0, H, Math.hypot(W, H));
    g3.addColorStop(0, bl + "cc"); g3.addColorStop(1, bl + "00");
    ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H);

    const g4 = ctx.createRadialGradient(W, H, 0, W, H, Math.hypot(W, H));
    g4.addColorStop(0, br + "cc"); g4.addColorStop(1, br + "00");
    ctx.fillStyle = g4; ctx.fillRect(0, 0, W, H);
  } else if (bg.type === "image" && bgImg) {
    if (bg.imageSlice) {
      const { x, y, width: sw, height: sh } = bg.imageSlice;
      ctx.drawImage(bgImg, x, y, sw, sh, 0, 0, W, H);
    } else {
      ctx.drawImage(bgImg, 0, 0, W, H);
    }
  } else {
    ctx.fillStyle = bg.backgroundColor || "#1a1a2e";
    ctx.fillRect(0, 0, W, H);
  }
}
