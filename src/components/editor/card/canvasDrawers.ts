// ── Image cache ───────────────────────────────────────────────────────────────
const imgCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imgCache.has(src)) return Promise.resolve(imgCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ── Draw gradient string helper ────────────────────────────────────────────────
export function parseColorStr(
  ctx: CanvasRenderingContext2D,
  fill: string | undefined,
  x: number,
  y: number,
  w: number,
  h: number
): string | CanvasGradient {
  if (!fill) return "#000000";
  if (typeof fill === "string" && fill.startsWith("linear-gradient")) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "#000000");
    return g;
  }
  return fill;
}

// ── Placeholder drawing ────────────────────────────────────────────────────────
export function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label?: string
) {
  // Dark translucent fill
  ctx.fillStyle = "rgba(15,23,42,0.55)";
  ctx.fillRect(x, y, w, h);

  // Dashed border
  ctx.strokeStyle = "rgba(99,102,241,0.55)";
  ctx.lineWidth = 10;
  ctx.setLineDash([30, 20]);
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
  ctx.setLineDash([]);

  // Phone icon (simple outline)
  const iw = w * 0.25;
  const ih = iw * 1.8;
  const ix = x + (w - iw) / 2;
  const iy = y + (h - ih) / 2 - (label ? h * 0.05 : 0);
  const ir = iw * 0.15;

  ctx.strokeStyle = "rgba(99,102,241,0.8)";
  ctx.lineWidth = Math.max(8, iw * 0.04);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, ir);
  ctx.stroke();

  // Small home indicator
  ctx.fillStyle = "rgba(99,102,241,0.8)";
  ctx.beginPath();
  ctx.roundRect(ix + iw * 0.3, iy + ih - iw * 0.12, iw * 0.4, iw * 0.04, iw * 0.02);
  ctx.fill();

  // Upload icon (arrow up + line)
  const arrowCx = x + w / 2;
  const arrowCy = iy + ih / 2;
  const arrowSize = iw * 0.35;
  ctx.strokeStyle = "rgba(99,102,241,0.7)";
  ctx.lineWidth = Math.max(6, iw * 0.035);
  ctx.beginPath();
  ctx.moveTo(arrowCx, arrowCy - arrowSize * 0.6);
  ctx.lineTo(arrowCx, arrowCy + arrowSize * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arrowCx - arrowSize * 0.4, arrowCy - arrowSize * 0.2);
  ctx.lineTo(arrowCx, arrowCy - arrowSize * 0.6);
  ctx.lineTo(arrowCx + arrowSize * 0.4, arrowCy - arrowSize * 0.2);
  ctx.stroke();

  // Label text
  let instrY = iy + ih + h * 0.06;
  if (label) {
    const fontSize = Math.round(w * 0.085);
    ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const words = label.split(" ");
    let line = "";
    const lines: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      if (ctx.measureText(testLine).width > w * 0.9 && i > 0) {
        lines.push(line.trim());
        line = words[i] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    for (const l of lines) {
      ctx.fillText(l, x + w / 2, instrY);
      instrY += fontSize * 1.3;
    }
    instrY += h * 0.02;
  } else {
    instrY += w * 0.08 + h * 0.02;
  }

  // Tap instruction
  const instrFontSize = Math.round(w * 0.06);
  ctx.font = `500 ${instrFontSize}px "Inter", sans-serif`;
  ctx.fillStyle = "rgba(226,232,240,1)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Click or drop image here", x + w / 2, instrY);
}

// ── Multi-line word-wrapped text drawer ────────────────────────────────────────
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "center"
) {
  const words = (text || "").split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  const totalHeight = lines.length * lineHeight;
  const startY = y - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * lineHeight);
  });
}

// ── Single-line auto-fitting text drawer ───────────────────────────────────────
export function drawAutoFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseFontSize: number,
  fontWeight: number | string = 700,
  fontFamily: string = '"Inter", sans-serif',
  color: string = "#FFFFFF",
  align: CanvasTextAlign = "center"
) {
  let fontSize = baseFontSize;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const measured = ctx.measureText(text).width;
  if (measured > maxWidth && maxWidth > 0) {
    fontSize = Math.max(10, fontSize * (maxWidth / measured));
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
