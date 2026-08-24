import {
  Screen, ScreenSet, TextLayer, ShapeLayer,
  ImageLayer, ScreenshotLayer, FlagLayer, CharacterLayer
} from "@/lib/types";
import { ALL_DEVICES, IOS_DEVICES, ANDROID_DEVICES, COLOR_HEX_MAP, isTabletDevice } from "@/lib/devices";
import { getTextGradientPreset } from "@/lib/textPresets";
import { drawBackgroundToCanvas } from "@/lib/utils";

// ─── CANVAS & DEVICE RENDERING CONSTANTS ─────────────────────────────────────
export const STATUS_BAR_TIME = "9:41";
export const STATUS_BAR_HEIGHT_RATIO = 0.08;
export const DYNAMIC_ISLAND_WIDTH_RATIO = 0.285;
export const DYNAMIC_ISLAND_HEIGHT_RATIO = 0.07;
export const DEVICE_BEZEL_RADIUS = 44;
export const DEVICE_BUTTON_WIDTH = 3;

export const SHADOW_PRESETS = {
  floatingStudio: { blur: 110, color: "rgba(0, 0, 0, 0.48)" },
  softGlow: { blur: 40, color: "rgba(0, 0, 0, 0.3)" },
  ambientDrop: { blur: 60, color: "rgba(0, 0, 0, 0.35)" },
} as const;

export interface RenderOptions {
  scale?: number;
  activeLang?: string;
  hideScreenshots?: boolean;
  isExport?: boolean;
  dpr?: number;
  activeLayerId?: string;
  isActiveScreen?: boolean;
}

// ── Image Cache with LRU Eviction (Max 100 entries to prevent RAM bloat) ──────
const MAX_IMAGE_CACHE_SIZE = 100;
const imgCache = new Map<string, HTMLImageElement>();

export function loadCachedImage(src: string): Promise<HTMLImageElement> {
  if (imgCache.has(src)) {
    const cached = imgCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      // Refresh recency in Map
      imgCache.delete(src);
      imgCache.set(src, cached);
      return Promise.resolve(cached);
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // LRU Eviction: Remove oldest entries if capacity reached
      if (imgCache.size >= MAX_IMAGE_CACHE_SIZE) {
        const oldestKey = imgCache.keys().next().value;
        if (oldestKey) imgCache.delete(oldestKey);
      }
      imgCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn(`[renderScreenToCanvas] Failed to load image asset: ${src.slice(0, 60)}...`);
      reject(err);
    };
    img.src = src;
  });
}

function parseColorStr(
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

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  label?: string
) {
  ctx.fillStyle = "rgba(15,23,42,0.55)";
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "rgba(99,102,241,0.55)";
  ctx.lineWidth = 10;
  ctx.setLineDash([30, 20]);
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
  ctx.setLineDash([]);

  const iw = w * 0.25;
  const ih = iw * 1.8;
  const ix = x + (w - iw) / 2;
  const iy = y + (h - ih) / 2 - (label ? h * 0.05 : 0);
  const ir = iw * 0.15;

  ctx.strokeStyle = "rgba(99,102,241,0.8)";
  ctx.lineWidth = Math.max(8, iw * 0.04);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, ir);
  ctx.stroke();

  ctx.fillStyle = "rgba(99,102,241,0.8)";
  ctx.beginPath();
  ctx.roundRect(ix + iw * 0.3, iy + ih - iw * 0.12, iw * 0.4, iw * 0.04, iw * 0.02);
  ctx.fill();

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

  const instrFontSize = Math.round(w * 0.06);
  ctx.font = `500 ${instrFontSize}px "Inter", sans-serif`;
  ctx.fillStyle = "rgba(226,232,240,1)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Click or drop image here", x + w / 2, instrY);
}

function drawWrappedText(
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

function drawAutoFitText(
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

/**
 * Universal Screen Renderer that renders any Screen to a Canvas with 100% feature parity.
 */
export async function renderScreenToCanvas(
  canvas: HTMLCanvasElement,
  screen: Screen,
  screenSet: ScreenSet,
  options: RenderOptions = {}
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = screen.width || 1290;
  const H = screen.height || 2796;
  const scale = options.scale ?? 1;
  const dpr = options.dpr ?? 1;
  const activeLang = options.activeLang ?? "en";
  const hideScreenshots = options.hideScreenshots ?? false;
  const isExport = options.isExport ?? false;
  const activeLayerId = options.activeLayerId;
  const isActiveScreen = options.isActiveScreen ?? false;

  const targetW = Math.round(W * scale * dpr);
  const targetH = Math.round(H * scale * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  const effectiveScale = scale * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.scale(effectiveScale, effectiveScale);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ── 1. BACKGROUND ──────────────────────────────────────────────────────────
  const bg = screen.background;
  let bgImg: HTMLImageElement | null = null;
  if (bg.type === "image" && bg.imageUrl) {
    try {
      bgImg = await loadCachedImage(bg.imageUrl);
    } catch (err) {
      console.warn(`[renderScreenToCanvas] Failed to load background image: ${bg.imageUrl}`, err);
    }
  }
  drawBackgroundToCanvas(ctx, bg, W, H, bgImg);

  // ── Pattern overlay ──
  if (bg.pattern) {
    const { type: pType, color: pColor, opacity: pOpacity, size: pSize = 20, spacing: pSpacing = 30 } = bg.pattern;
    ctx.globalAlpha = pOpacity;
    ctx.fillStyle = pColor;
    ctx.strokeStyle = pColor;

    if (pType === "dots") {
      const r = pSize / 2;
      const gap = pSpacing;
      for (let py = 0; py < H + gap; py += gap) {
        for (let px = 0; px < W + gap; px += gap) {
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (pType === "lines") {
      ctx.lineWidth = pSize / 4;
      const gap = pSpacing;
      for (let py = -W; py < H + W; py += gap) {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(W, py + W);
        ctx.stroke();
      }
    } else if (pType === "grid") {
      ctx.lineWidth = 1;
      const gap = pSpacing;
      for (let py = 0; py < H; py += gap) {
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      }
      for (let px = 0; px < W; px += gap) {
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      }
    } else if (pType === "noise") {
      const seed = 42.123;
      const pseudo = (n: number) => {
        const x = Math.sin(n + seed) * 10000;
        return x - Math.floor(x);
      };
      const dotCount = Math.floor(W * H * 0.015);
      for (let i = 0; i < dotCount; i++) {
        const px = pseudo(i * 3) * W;
        const py = pseudo(i * 3 + 1) * H;
        const pr = pseudo(i * 3 + 2) * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── 2. LAYERS ──────────────────────────────────────────────────────────────
  for (const layer of screen.layers) {
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;

    if (layer.rotation) {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    // ── TEXT ──
    if (layer.type === "text") {
      const tl = layer as TextLayer;
      const rawContent =
        activeLang !== "en" && screen.localizations?.[activeLang]?.[tl.id]?.content != null
          ? screen.localizations[activeLang][tl.id].content!
          : tl.content;

      let displayContent = rawContent || "";
      if (tl.textCase === "uppercase") displayContent = displayContent.toUpperCase();
      else if (tl.textCase === "lowercase") displayContent = displayContent.toLowerCase();
      else if (tl.textCase === "capitalize") {
        displayContent = displayContent.replace(/\b\w/g, (c) => c.toUpperCase());
      }

      ctx.font = `${tl.fontWeight || 600} ${tl.fontSize}px "${tl.fontFamily || "Inter"}", system-ui, sans-serif`;
      ctx.textAlign = (tl.align || "left") as CanvasTextAlign;
      if (tl.letterSpacing) ctx.letterSpacing = `${tl.letterSpacing}px`;

      const rawParagraphs = displayContent.split("\n");
      const lines: string[] = [];

      for (const paragraph of rawParagraphs) {
        const words = paragraph.split(" ");
        let currentLine = "";

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > tl.width && currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
      }

      const lineH = tl.fontSize * (tl.lineHeight ?? 1.18);
      const textActualH = Math.max(tl.fontSize, lines.length * lineH);

      const preset = tl.gradientPresetId ? getTextGradientPreset(tl.gradientPresetId) : null;
      if (preset) {
        let grad: CanvasGradient;
        if (preset.direction === "horizontal") grad = ctx.createLinearGradient(tl.x, 0, tl.x + tl.width, 0);
        else if (preset.direction === "diagonal") grad = ctx.createLinearGradient(tl.x, tl.y, tl.x + tl.width, tl.y + textActualH);
        else grad = ctx.createLinearGradient(0, tl.y, 0, tl.y + textActualH);
        for (const stop of preset.gradientStops) {
          grad.addColorStop(stop.position / 100, stop.color);
        }
        ctx.fillStyle = grad;
      } else if (tl.gradientColor) {
        const [c1, c2, dir] = tl.gradientColor;
        let grad: CanvasGradient;
        if (dir === "horizontal") grad = ctx.createLinearGradient(tl.x, 0, tl.x + tl.width, 0);
        else if (dir === "diagonal") grad = ctx.createLinearGradient(tl.x, tl.y, tl.x + tl.width, tl.y + textActualH);
        else grad = ctx.createLinearGradient(0, tl.y, 0, tl.y + textActualH);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = tl.color || "#ffffff";
      }

      // Glow & Shadow
      const activeGlow = tl.glow || (preset?.glow ? preset.glow : null);
      if (activeGlow) {
        ctx.shadowColor = activeGlow.color;
        ctx.shadowBlur = activeGlow.blur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else if (tl.shadow) {
        ctx.shadowColor = tl.shadow.color;
        ctx.shadowBlur = tl.shadow.blur;
        ctx.shadowOffsetX = tl.shadow.offsetX;
        ctx.shadowOffsetY = tl.shadow.offsetY;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      const xPos =
        tl.align === "center" ? tl.x + tl.width / 2
        : tl.align === "right" ? tl.x + tl.width
        : tl.x;

      if (tl.highlight) {
        const { color, paddingX, paddingY, cornerRadius } = tl.highlight;
        const totalH = lines.length * lineH;
        ctx.save();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        const hx = tl.x - paddingX;
        const hy = tl.y - paddingY;
        const hw = tl.width + paddingX * 2;
        const hh = totalH + paddingY * 2;
        if (cornerRadius > 0) ctx.roundRect(hx, hy, hw, hh, cornerRadius);
        else ctx.rect(hx, hy, hw, hh);
        ctx.fill();
        ctx.restore();
      }

      lines.forEach((line, i) => {
        const yPos = tl.y + tl.fontSize * 0.88 + i * lineH;
        if (tl.stroke && tl.stroke.width > 0) {
          ctx.strokeStyle = tl.stroke.color;
          ctx.lineWidth = tl.stroke.width * 2;
          ctx.lineJoin = "round";
          ctx.strokeText(line, xPos, yPos, tl.width);
        }
        ctx.fillText(line, xPos, yPos, tl.width);
      });

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // ── SCREENSHOT ZONE (MOCKUP) ──
    else if (layer.type === "screenshot") {
      const sl = layer as ScreenshotLayer;
      const mockup = screenSet.mockup;
      const hasFrame = sl.showDeviceFrame && mockup?.showFrame !== false;
      const targetDeviceId = screenSet.deviceId || mockup?.device;
      const defaultDevice = screenSet.store === "android" ? ANDROID_DEVICES[0] : IOS_DEVICES[0];
      const device = ALL_DEVICES.find((d) => d.id === targetDeviceId) || defaultDevice;

      const physicalW = device.width;
      const physicalH = device.height;
      const bezelRatio = hasFrame ? (device.bezelRatio ?? 0.0373) : 0;
      const rawBezel = physicalW * bezelRatio;

      const frameW = physicalW + rawBezel * 2;
      const frameH = physicalH + rawBezel * 2;

      const scaleRatio = Math.min(sl.width / frameW, sl.height / frameH);
      const w = frameW * scaleRatio;
      const h = frameH * scaleRatio;

      const x = sl.x + (sl.width - w) / 2;
      const y = sl.y + (sl.height - h) / 2;

      const defaultDeviceR = device.cornerRadius * scaleRatio + (hasFrame ? rawBezel * scaleRatio : 0);
      const r = (mockup?.squircle || hasFrame) ? defaultDeviceR : (sl.cornerRadius || 0);

      const bezel = hasFrame ? rawBezel * scaleRatio : 0;
      const innerX = x + bezel;
      const innerY = y + bezel;
      const innerW = w - bezel * 2;
      const innerH = h - bezel * 2;
      const innerR = Math.max(0, r - bezel);

      if (hideScreenshots) {
        ctx.beginPath();
        if (r > 0) ctx.roundRect(x, y, w, h, r);
        else ctx.rect(x, y, w, h);
        ctx.fillStyle = "rgba(99,102,241,0.08)";
        ctx.fill();
        continue;
      }

      const applyShadow = () => {
        if (mockup?.showShadow === true) {
          const preset = mockup.shadowPreset || "soft-ambient";
          if (preset === "none") {
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          } else if (preset === "floating-studio") {
            ctx.shadowBlur = 110;
            ctx.shadowColor = "rgba(0,0,0,0.48)";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 38;
          } else if (preset === "hard-isometric") {
            ctx.shadowBlur = 0;
            ctx.shadowColor = "rgba(0,0,0,0.38)";
            ctx.shadowOffsetX = 24;
            ctx.shadowOffsetY = 28;
          } else if (preset === "neon-glow") {
            ctx.shadowBlur = 95;
            ctx.shadowColor = mockup.shadowGlowColor || "rgba(99,102,241,0.65)";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          } else {
            // soft-ambient (default)
            ctx.shadowBlur = sl.shadow?.blur ?? 75;
            ctx.shadowColor = sl.shadow?.color ?? "rgba(0,0,0,0.28)";
            ctx.shadowOffsetX = sl.shadow?.offsetX ?? 0;
            ctx.shadowOffsetY = sl.shadow?.offsetY ?? 18;
          }
        }
      };

      const rawColorName = mockup?.color || "black";
      const baseHex = COLOR_HEX_MAP[rawColorName.toLowerCase()] || "#1a1a1c";

      if (hasFrame) {
        applyShadow();
        if (mockup.frameType === "titanium") {
          if (device.buttons) {
            device.buttons.forEach((btn: any) => {
              const isTop = btn.side === "top";
              const btnY = isTop ? y - (btn.thickness || 1) * (Math.min(w, h) * 0.009) + 1 : y + h * btn.yOffset;
              const btnH = isTop ? (btn.thickness || 1) * (Math.min(w, h) * 0.009) : h * btn.height;
              const btnW = isTop ? w * btn.height : (btn.thickness || 1) * (Math.min(w, h) * 0.009);
              const btnX = isTop ? x + w * btn.yOffset : (btn.side === "left" ? x - btnW + 1 : x + w - 1);
              const btnRadius = Math.min(btnW, btnH) / 2;
              const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + (isTop ? btnW : 0), btnY + (isTop ? 0 : btnH));
              btnGrad.addColorStop(0, "#d1d5db");
              btnGrad.addColorStop(0.5, "#6b7280");
              btnGrad.addColorStop(1, "#374151");
              ctx.fillStyle = btnGrad;
              ctx.beginPath();
              ctx.roundRect(btnX, btnY, btnW, btnH, [btnRadius, btnRadius, btnRadius, btnRadius]);
              ctx.fill();
            });
          }

          ctx.beginPath();
          if (r > 0) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          ctx.fillStyle = baseHex;
          ctx.fill();

          const titGrad = ctx.createLinearGradient(x, y, x + w, y + h);
          titGrad.addColorStop(0, "rgba(243, 244, 246, 0.95)");
          titGrad.addColorStop(0.2, "rgba(156, 163, 175, 0.4)");
          titGrad.addColorStop(0.4, "rgba(75, 85, 99, 0.8)");
          titGrad.addColorStop(0.6, "rgba(229, 231, 235, 0.85)");
          titGrad.addColorStop(0.8, "rgba(107, 114, 128, 0.3)");
          titGrad.addColorStop(1, "rgba(209, 213, 219, 0.95)");
          ctx.lineWidth = bezel * 0.45;
          ctx.strokeStyle = titGrad;
          ctx.stroke();

        } else if (mockup.frameType === "clay") {
          ctx.beginPath();
          if (r > 0) ctx.roundRect(x - 2, y - 2, w + 4, h + 4, r + 2);
          else ctx.rect(x - 2, y - 2, w + 4, h + 4);
          ctx.fillStyle = baseHex;
          ctx.fill();

          const clayGrad = ctx.createLinearGradient(x, y, x, y + h);
          clayGrad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
          clayGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.05)");
          clayGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.08)");
          clayGrad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
          ctx.fillStyle = clayGrad;
          ctx.fill();

        } else if (mockup.frameType === "glass") {
          ctx.beginPath();
          if (r > 0) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          
          const glassGrad = ctx.createLinearGradient(x, y, x + w, y + h);
          glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
          glassGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
          glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.18)");
          ctx.fillStyle = glassGrad;
          ctx.fill();

          const rimGrad = ctx.createLinearGradient(x, y, x + w, y + h);
          rimGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
          rimGrad.addColorStop(0.3, "rgba(147, 197, 253, 0.5)");
          rimGrad.addColorStop(0.7, "rgba(216, 180, 254, 0.5)");
          rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.75)");
          ctx.lineWidth = bezel * 0.4;
          ctx.strokeStyle = rimGrad;
          ctx.stroke();

        } else if (mockup.frameType === "neon") {
          ctx.beginPath();
          if (r > 0) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          ctx.fillStyle = "#09090e";
          ctx.fill();

          const neonGrad = ctx.createLinearGradient(x, y, x + w, y + h);
          neonGrad.addColorStop(0, "#a855f7");
          neonGrad.addColorStop(0.35, "#3b82f6");
          neonGrad.addColorStop(0.7, "#06b6d4");
          neonGrad.addColorStop(1, "#ec4899");
          ctx.lineWidth = bezel * 0.4;
          ctx.strokeStyle = neonGrad;
          ctx.stroke();

        } else if (mockup.frameType === "wireframe") {
          ctx.beginPath();
          if (r > 0) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          const isDarkBg = baseHex === "#ffffff" || baseHex === "#f5f5f7";
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = isDarkBg ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.85)";
          ctx.stroke();

        } else if (mockup.frameType === "2d") {
          ctx.beginPath();
          if (r > 0) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          ctx.fillStyle = baseHex;
          ctx.fill();

        } else {
          // 3D Realistic
          if (device.buttons) {
            ctx.fillStyle = baseHex;
            device.buttons.forEach((btn: any) => {
              const isTop = btn.side === "top";
              const btnY = isTop ? y - (btn.thickness || 1) * (Math.min(w, h) * 0.008) + 1 : y + h * btn.yOffset;
              const btnH = isTop ? (btn.thickness || 1) * (Math.min(w, h) * 0.008) : h * btn.height;
              const btnW = isTop ? w * btn.height : (btn.thickness || 1) * (Math.min(w, h) * 0.008);
              const btnX = isTop ? x + w * btn.yOffset : (btn.side === "left" ? x - btnW + 1 : x + w - 1);
              const btnRadius = Math.min(btnW, btnH) / 2;
              ctx.beginPath();
              ctx.roundRect(btnX, btnY, btnW, btnH, [btnRadius, btnRadius, btnRadius, btnRadius]);
              ctx.fill();
            });
          }

          ctx.beginPath();
          if (r > 0) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          ctx.fillStyle = baseHex;
          ctx.fill();

          const isDark = baseHex === "#1a1a1c" || baseHex === "#000000" || baseHex === "#111111";
          const rimGrad = ctx.createLinearGradient(x, y, x + w, y + h);
          if (isDark) {
            rimGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
            rimGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.05)");
            rimGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.8)");
            rimGrad.addColorStop(0.8, "rgba(255, 255, 255, 0.05)");
            rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");
          } else {
            rimGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
            rimGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
            rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.8)");
          }
          ctx.lineWidth = bezel * 0.4;
          ctx.strokeStyle = rimGrad;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }

      // Clip inner screen area
      ctx.save();
      ctx.beginPath();
      if (innerR > 0) ctx.roundRect(innerX, innerY, innerW, innerH, innerR);
      else ctx.rect(innerX, innerY, innerW, innerH);
      ctx.clip();

      let drawBaseImage: (() => void) | null = null;
      let imgObj: HTMLImageElement | null = null;

      if (sl.src) {
        try {
          imgObj = await loadCachedImage(sl.src);
          drawBaseImage = () => {
            if (!imgObj) return;
            if (sl.objectFit === "cover") {
              const imgRatio = imgObj.width / imgObj.height;
              const zoneRatio = innerW / innerH;
              let sx = 0, sy = 0, sw = imgObj.width, sh = imgObj.height;
              if (imgRatio > zoneRatio) {
                sw = imgObj.height * zoneRatio;
                sx = (imgObj.width - sw) / 2;
              } else {
                sh = imgObj.width / zoneRatio;
                sy = (imgObj.height - sh) / 2;
              }
              ctx.drawImage(imgObj, sx, sy, sw, sh, innerX, innerY, innerW, innerH);
            } else if (sl.objectFit === "contain") {
              const imgRatio = imgObj.width / imgObj.height;
              const zoneRatio = innerW / innerH;
              let dw = innerW;
              let dh = innerH;
              let dx = innerX;
              let dy = innerY;
              if (imgRatio > zoneRatio) {
                dh = innerW / imgRatio;
                dy = innerY + (innerH - dh) / 2;
              } else {
                dw = innerH * imgRatio;
                dx = innerX + (innerW - dw) / 2;
              }
              ctx.fillStyle = "#0a0a0c";
              ctx.fillRect(innerX, innerY, innerW, innerH);
              ctx.drawImage(imgObj, 0, 0, imgObj.width, imgObj.height, dx, dy, dw, dh);
            } else {
              ctx.drawImage(imgObj, innerX, innerY, innerW, innerH);
            }
          };
        } catch {}
      }

      const drawNotch = () => {
        if (hasFrame && device.notchType !== "none") {
          ctx.fillStyle = "#000000";
          if (device.notchType === "island" && mockup.dynamicIsland !== false) {
            const islandW = innerW * 0.285;
            const islandH = innerW * 0.0887;
            const islandX = innerX + (innerW - islandW) / 2;
            const islandY = innerY + innerW * 0.025;
            
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.roundRect(islandX, islandY, islandW, islandH, islandH / 2);
            ctx.fill();
            
            ctx.fillStyle = "#1e1e20";
            ctx.beginPath();
            ctx.arc(islandX + islandH * 0.8, islandY + islandH / 2, islandH * 0.22, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#293246";
            ctx.beginPath();
            ctx.arc(islandX + islandW - islandH * 0.7, islandY + islandH / 2, islandH * 0.22, 0, Math.PI * 2);
            ctx.fill();
          } else if (device.notchType === "hole" && mockup.notch !== false) {
            const holeR = innerW * 0.025;
            const holeX = innerX + innerW / 2;
            const holeY = innerY + holeR * 2.5;
            ctx.beginPath();
            ctx.arc(holeX, holeY, holeR, 0, Math.PI * 2);
            ctx.fill();
          } else if (device.notchType === "notch" && mockup.notch !== false) {
            const isTablet = isTabletDevice(device);
            const notchW = isTablet ? innerW * 0.09 : innerW * 0.45;
            const notchH = isTablet ? innerW * 0.022 : innerW * 0.08;
            const notchX = innerX + (innerW - notchW) / 2;
            const cornerR = isTablet ? 8 : 16;
            ctx.beginPath();
            ctx.roundRect(notchX, innerY, notchW, notchH, [0, 0, cornerR, cornerR]);
            ctx.fill();
          }
        }
      };

      const drawCleanStatusBar = () => {
        if (sl.cleanStatusBar || mockup?.cleanStatusBar) {
          const theme = sl.statusBarTheme || mockup?.statusBarTheme || "dark";
          const iconColor = theme === "light" ? "#000000" : "#ffffff";
          const barH = innerW * 0.08;
          const barY = innerY + innerW * 0.018;
          const fontSize = Math.round(innerW * 0.036);

          ctx.save();
          // Time on left
          ctx.fillStyle = iconColor;
          ctx.font = `700 ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText("9:41", innerX + innerW * 0.07, barY + barH * 0.45);

          // Icons on right
          const rightX = innerX + innerW * 0.93;
          const iconY = barY + barH * 0.45;

          // Battery pill
          const battW = innerW * 0.052;
          const battH = battW * 0.52;
          const battX = rightX - battW;
          const battY = iconY - battH / 2;

          ctx.strokeStyle = iconColor;
          ctx.lineWidth = Math.max(1.5, innerW * 0.003);
          ctx.beginPath();
          ctx.roundRect(battX, battY, battW, battH, battH * 0.3);
          ctx.stroke();

          // Battery cap
          ctx.fillStyle = iconColor;
          ctx.beginPath();
          ctx.roundRect(battX + battW + 1, battY + battH * 0.25, battW * 0.08, battH * 0.5, [0, 1, 1, 0]);
          ctx.fill();

          // Battery 100% level fill
          ctx.beginPath();
          ctx.roundRect(battX + 2, battY + 2, battW - 4, battH - 4, battH * 0.2);
          ctx.fill();

          // 5G text
          const wifiX = battX - innerW * 0.045;
          ctx.font = `700 ${Math.round(fontSize * 0.72)}px "Inter", sans-serif`;
          ctx.textAlign = "right";
          ctx.fillText("5G", wifiX, iconY);

          // Cellular bars
          const cellX = wifiX - innerW * 0.045;
          const barWidth = innerW * 0.0055;
          const barGap = innerW * 0.003;
          for (let b = 0; b < 4; b++) {
            const bh = (b + 1) * (battH * 0.22);
            ctx.beginPath();
            ctx.roundRect(cellX + b * (barWidth + barGap), iconY + battH / 2 - bh, barWidth, bh, 1);
            ctx.fill();
          }

          ctx.restore();
        }
      };

      const drawReflection = () => {
        if (hasFrame && mockup.reflection) {
          const reflGrad = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + innerH);
          reflGrad.addColorStop(0, "rgba(255,255,255,0.15)");
          reflGrad.addColorStop(0.3, "rgba(255,255,255,0.05)");
          reflGrad.addColorStop(0.5, "transparent");
          reflGrad.addColorStop(1, "transparent");
          ctx.fillStyle = reflGrad;
          ctx.beginPath();
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(innerX + innerW, innerY);
          ctx.lineTo(innerX, innerY + innerH);
          ctx.closePath();
          ctx.fill();
        }
      };

      const overlay = sl.focusOverlay;

      // 1. Draw base screenshot with optional blur
      ctx.save();
      if (overlay && overlay.enabled && overlay.blurBackground) {
        const blurPx = overlay.blurAmount ?? 12;
        ctx.filter = `blur(${blurPx}px)`;
      }

      if (drawBaseImage) {
        drawBaseImage();
      } else {
        if (isExport) {
          ctx.fillStyle = "#0c0e14";
          ctx.fillRect(innerX, innerY, innerW, innerH);
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 4;
          ctx.strokeRect(innerX + 20, innerY + 20, innerW - 40, innerH - 40);
        } else {
          drawPlaceholder(ctx, innerX, innerY, innerW, innerH, sl.label);
        }
      }
      ctx.restore();

      // 2. Draw overlay tint / dimming if enabled
      if (overlay && overlay.enabled && overlay.overlayColor) {
        ctx.save();
        ctx.fillStyle = overlay.overlayColor;
        ctx.fillRect(innerX, innerY, innerW, innerH);
        ctx.restore();
      }

      // 3. Draw Focus Highlight Card (crisp unblurred slice with custom corner radius and border)
      if (overlay && overlay.enabled && drawBaseImage) {
        const fTop = ((overlay.cropTop ?? 25) / 100) * innerH;
        const fBottom = ((overlay.cropBottom ?? 25) / 100) * innerH;
        const fY = innerY + fTop;
        const fH = Math.max(0, innerH - fTop - fBottom);

        let fRadius = 24;
        if (typeof overlay.roundedCorners === "number") {
          fRadius = overlay.roundedCorners;
        } else if (overlay.roundedCorners === "none") {
          fRadius = 0;
        } else if (overlay.roundedCorners === "sm") {
          fRadius = 12;
        } else if (overlay.roundedCorners === "md") {
          fRadius = 24;
        } else if (overlay.roundedCorners === "xl") {
          fRadius = 40;
        }

        fRadius = Math.min(fRadius, fH / 2, innerW / 2);

        // Draw shadow behind the focused card
        if (overlay.overlayShadow) {
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.45)";
          ctx.shadowBlur = 30;
          ctx.shadowOffsetY = 12;
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          if (fRadius > 0) ctx.roundRect(innerX, fY, innerW, fH, fRadius);
          else ctx.rect(innerX, fY, innerW, fH);
          ctx.fill();
          ctx.restore();
        }

        // Clip to the focused card's rounded rectangle and draw crisp unblurred image
        ctx.save();
        ctx.beginPath();
        if (fRadius > 0) ctx.roundRect(innerX, fY, innerW, fH, fRadius);
        else ctx.rect(innerX, fY, innerW, fH);
        ctx.clip();

        // Draw crisp original unblurred image
        drawBaseImage();
        ctx.restore();

        // Stroke border on the focused card
        if ((overlay.borderWidth ?? 0) > 0 && overlay.borderColor) {
          ctx.save();
          ctx.beginPath();
          if (fRadius > 0) ctx.roundRect(innerX, fY, innerW, fH, fRadius);
          else ctx.rect(innerX, fY, innerW, fH);
          ctx.lineWidth = (overlay.borderWidth ?? 2) * 2;
          ctx.strokeStyle = overlay.borderColor;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. Draw Notch / Dynamic Island, Clean Status Bar & Glass Reflection ON TOP of everything
      drawNotch();
      drawCleanStatusBar();
      drawReflection();

      ctx.restore(); // END CLIP INNER
    }

    // ── SHAPE ──
    else if (layer.type === "shape") {
      const sl = layer as ShapeLayer;
      ctx.fillStyle = parseColorStr(ctx, sl.fill, sl.x, sl.y, sl.width, sl.height) as string;
      const r2 = sl.cornerRadius ?? 0;
      const cx2 = sl.x + sl.width / 2;
      const cy2 = sl.y + sl.height / 2;
      const hw  = sl.width / 2;
      const hh  = sl.height / 2;

      const shapeDeg = sl.rotation ?? 0;
      if (shapeDeg !== 0) {
        ctx.save();
        ctx.translate(cx2, cy2);
        ctx.rotate((shapeDeg * Math.PI) / 180);
        ctx.translate(-cx2, -cy2);
      }

      const applyStroke = () => {
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        }
      };

      if (sl.shape === "circle") {
        ctx.beginPath();
        ctx.arc(cx2, cy2, Math.min(hw, hh), 0, Math.PI * 2);
        ctx.fill(); applyStroke();

      } else if (sl.shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(cx2, sl.y);
        ctx.lineTo(sl.x + sl.width, sl.y + sl.height);
        ctx.lineTo(sl.x, sl.y + sl.height);
        ctx.closePath();
        ctx.fill(); applyStroke();

      } else if (sl.shape === "star") {
        const pts = 5;
        const outerR = Math.min(hw, hh);
        const innerR = outerR * 0.42;
        ctx.beginPath();
        for (let i = 0; i < pts * 2; i++) {
          const angle = (i * Math.PI) / pts - Math.PI / 2;
          const r3 = i % 2 === 0 ? outerR : innerR;
          const px = cx2 + Math.cos(angle) * r3;
          const py = cy2 + Math.sin(angle) * r3;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.fill(); applyStroke();

      } else if (sl.shape === "hexagon") {
        const r4 = Math.min(hw, hh);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = cx2 + Math.cos(angle) * r4;
          const py = cy2 + Math.sin(angle) * r4;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.fill(); applyStroke();

      } else if (sl.shape === "diamond") {
        ctx.beginPath();
        ctx.moveTo(cx2, sl.y);
        ctx.lineTo(sl.x + sl.width, cy2);
        ctx.lineTo(cx2, sl.y + sl.height);
        ctx.lineTo(sl.x, cy2);
        ctx.closePath();
        ctx.fill(); applyStroke();

      } else if (sl.shape === "crescent") {
        ctx.beginPath();
        ctx.arc(cx2, cy2, Math.min(hw, hh), Math.PI * 0.2, Math.PI * 1.8);
        ctx.arc(cx2 - hw * 0.3, cy2, Math.min(hw, hh) * 0.8, Math.PI * 1.8, Math.PI * 0.2, true);
        ctx.closePath();
        ctx.fill(); applyStroke();

      } else if (sl.shape === "arrow-right" || (sl.shape as any) === "arrowRight") {
        const aw = sl.width;
        const ah = sl.height;
        const arrowHead = aw * 0.4;
        const stemH = ah * 0.35;
        ctx.beginPath();
        ctx.moveTo(sl.x, cy2 - stemH);
        ctx.lineTo(sl.x + aw - arrowHead, cy2 - stemH);
        ctx.lineTo(sl.x + aw - arrowHead, sl.y);
        ctx.lineTo(sl.x + aw, cy2);
        ctx.lineTo(sl.x + aw - arrowHead, sl.y + ah);
        ctx.lineTo(sl.x + aw - arrowHead, cy2 + stemH);
        ctx.lineTo(sl.x, cy2 + stemH);
        ctx.closePath();
        ctx.fill(); applyStroke();

      } else if (
        sl.shape === "appstore-badge" ||
        sl.shape === "appstore-dark" ||
        sl.shape === "appstore-light" ||
        sl.shape === "googleplay-badge" ||
        sl.shape === "googleplay-dark" ||
        sl.shape === "googleplay-light"
      ) {
        const isAppStore = sl.shape.startsWith("appstore");
        const isLight = sl.shape.includes("light");
        const badgeSrc = isAppStore
          ? isLight ? "/badges/appstore-light.svg" : "/badges/appstore-dark.svg"
          : isLight ? "/badges/googleplay-light.svg" : "/badges/googleplay-dark.svg";

        try {
          const badgeImg = await loadCachedImage(badgeSrc);
          ctx.drawImage(badgeImg, sl.x, sl.y, sl.width, sl.height);
        } catch {
          ctx.fillStyle = isLight ? "#FFFFFF" : "#000000";
          ctx.beginPath();
          ctx.roundRect(sl.x, sl.y, sl.width, sl.height, Math.min(sl.width, sl.height) * 0.2);
          ctx.fill();
        }

      } else if (sl.shape === "rating-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.85)";
        ctx.fill();
        applyStroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${bh * 0.42}px "Inter", sans-serif`;
        ctx.fillStyle = "#F59E0B";
        ctx.fillText(sl.subtext || "★★★★★", bx + bw * 0.32, by + bh / 2 + 1);

        ctx.font = `600 ${bh * 0.35}px "Inter", sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(sl.text || "4.9 (100k+)", bx + bw * 0.74, by + bh / 2);

      } else if (sl.shape === "award-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#1e1b4b";
        ctx.fill();
        applyStroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${bh * 0.5}px serif`;
        ctx.fillText(sl.subtext || "🏆", bx + bh * 0.45, by + bh / 2);

        ctx.font = `700 ${bh * 0.34}px "Inter", sans-serif`;
        ctx.fillStyle = "#FBBF24";
        ctx.fillText(sl.text || "#1 App of the Day", bx + bw * 0.58, by + bh / 2);

      } else if (sl.shape === "users-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(16,185,129,0.15)";
        ctx.fill();
        applyStroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${bh * 0.45}px serif`;
        ctx.fillText(sl.subtext || "👥", bx + bh * 0.45, by + bh / 2);

        ctx.font = `700 ${bh * 0.34}px "Inter", sans-serif`;
        ctx.fillStyle = "#10B981";
        ctx.fillText(sl.text || "1,000,000+ Users", bx + bw * 0.58, by + bh / 2);

      } else if (sl.shape === "security-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(59,130,246,0.15)";
        ctx.fill();
        applyStroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${bh * 0.45}px serif`;
        ctx.fillText(sl.subtext || "🔒", bx + bh * 0.45, by + bh / 2);

        ctx.font = `700 ${bh * 0.34}px "Inter", sans-serif`;
        ctx.fillStyle = "#3B82F6";
        ctx.fillText(sl.text || "100% Private & Secure", bx + bw * 0.58, by + bh / 2);

      } else if (sl.shape === "notification-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : Math.min(36, maxR);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(255,255,255,0.96)";
        ctx.fill();
        applyStroke();

        const iconSize = bh * 0.62;
        const iconX = bx + bh * 0.18;
        const iconY = by + (bh - iconSize) / 2;
        const iconR = iconSize * 0.24;

        ctx.beginPath();
        ctx.roundRect(iconX, iconY, iconSize, iconSize, iconR);
        const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
        iconGrad.addColorStop(0, "#6366F1");
        iconGrad.addColorStop(1, "#8B5CF6");
        ctx.fillStyle = iconGrad;
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${iconSize * 0.52}px serif`;
        ctx.fillText("⚡", iconX + iconSize / 2, iconY + iconSize / 2 + 1);

        const textLeft = iconX + iconSize + bh * 0.18;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `600 ${bh * 0.16}px "Inter", sans-serif`;
        ctx.fillStyle = "#64748B";
        ctx.fillText(sl.subtext || "SnapFrame · now", textLeft, by + bh * 0.33);

        ctx.font = `700 ${bh * 0.20}px "Inter", sans-serif`;
        ctx.fillStyle = "#0F172A";
        ctx.fillText(sl.text || "Workout completed! +250 XP earned 🎉", textLeft, by + bh * 0.67);

      } else if (sl.shape === "search-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(255,255,255,0.18)";
        ctx.fill();
        applyStroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${bh * 0.38}px serif`;
        ctx.fillText("🔍", bx + bh * 0.42, by + bh / 2);

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `500 ${bh * 0.30}px "Inter", sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(sl.text || "Search songs, artists, albums...", bx + bh * 0.85, by + bh / 2);

        ctx.textAlign = "center";
        ctx.font = `${bh * 0.32}px serif`;
        ctx.fillText("🎙️", bx + bw - bh * 0.42, by + bh / 2);

      } else if (sl.shape === "sale-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#E11D48";
        ctx.fill();
        applyStroke();

        drawAutoFitText(
          ctx,
          sl.text || "🏷️ 50% OFF · Early Bird Special",
          bx + bw / 2,
          by + bh / 2,
          bw * 0.88,
          bh * 0.36,
          700,
          '"Inter", sans-serif',
          "#FFFFFF",
          "center"
        );

      } else if (sl.shape === "trial-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#6366F1";
        ctx.fill();
        applyStroke();

        drawAutoFitText(
          ctx,
          sl.text || "🚀 Try Free for 7 Days · No Card",
          bx + bw / 2,
          by + bh / 2,
          bw * 0.88,
          bh * 0.36,
          700,
          '"Inter", sans-serif',
          "#FFFFFF",
          "center"
        );

      } else if (sl.shape === "checklist-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.92)";
        ctx.fill();
        applyStroke();

        drawAutoFitText(
          ctx,
          sl.text || "✓ Ad-Free  ·  ✓ Offline  ·  ✓ 4K",
          bx + bw / 2,
          by + bh / 2,
          bw * 0.88,
          bh * 0.34,
          600,
          '"Inter", sans-serif',
          "#F8FAFC",
          "center"
        );

      } else if (sl.shape === "ranking-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : Math.min(30, maxR);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#172554";
        ctx.fill();
        applyStroke();

        drawAutoFitText(
          ctx,
          sl.text || "🏅 #1 Top Free App",
          bx + bw / 2,
          by + bh / 2,
          bw * 0.88,
          bh * 0.36,
          700,
          '"Inter", sans-serif',
          "#FFFFFF",
          "center"
        );

      } else if (sl.shape === "pro-tag" || sl.shape === "new-tag") {
        const isPro = sl.shape === "pro-tag";
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? (isPro ? "#6366F1" : "#10B981");
        ctx.fill();
        applyStroke();

        drawAutoFitText(
          ctx,
          sl.text || (isPro ? "⚡ PRO FEATURE" : "✨ NEW"),
          bx + bw / 2,
          by + bh / 2,
          bw * 0.88,
          bh * 0.42,
          700,
          '"Inter", sans-serif',
          "#FFFFFF",
          "center"
        );

      } else if (sl.shape === "press-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : Math.min(32, maxR);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.92)";
        ctx.fill();
        applyStroke();

        const quoteFontSize = bh * 0.16;
        ctx.font = `500 ${quoteFontSize}px "Inter", sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        drawWrappedText(
          ctx,
          sl.text || '"The cleanest and fastest screenshot generator on mobile."',
          bx + bw / 2,
          by + bh * 0.40,
          bw * 0.88,
          quoteFontSize * 1.3,
          "center"
        );

        ctx.font = `700 ${bh * 0.14}px "Inter", sans-serif`;
        ctx.fillStyle = "#34D399";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sl.subtext || "— TechCrunch", bx + bw / 2, by + bh * 0.78);

      } else if (sl.shape === "testimonial-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : Math.min(36, maxR);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.92)";
        ctx.fill();
        applyStroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${bh * 0.16}px "Inter", sans-serif`;
        ctx.fillStyle = "#FBBF24";
        ctx.fillText("★★★★★", bx + bw / 2, by + bh * 0.20);

        const quoteFontSize = bh * 0.13;
        ctx.font = `600 ${quoteFontSize}px "Inter", sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        drawWrappedText(
          ctx,
          sl.text || '"Boosted our App Store conversion rate by +40% in just 1 week!"',
          bx + bw / 2,
          by + bh * 0.52,
          bw * 0.88,
          quoteFontSize * 1.3,
          "center"
        );

        ctx.font = `500 ${bh * 0.11}px "Inter", sans-serif`;
        ctx.fillStyle = "#94A3B8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sl.subtext || "Alex Morgan · Lead iOS Developer", bx + bw / 2, by + bh * 0.82);

      } else if (sl.shape === "live-counter-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : maxR;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(67,20,7,0.92)";
        ctx.fill();
        applyStroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${bh * 0.36}px "Inter", sans-serif`;
        ctx.fillStyle = "#FB923C";
        ctx.fillText(sl.text || "🔥 2,500+ Downloads Today", bx + bw / 2, by + bh / 2);

      } else if (sl.shape === "glass-card" || sl.shape === "dark-card") {
        const isGlass = sl.shape === "glass-card";
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const maxR = Math.min(bw, bh) / 2;
        const br = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, maxR) : Math.min(40, maxR);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? (isGlass ? "rgba(255,255,255,0.14)" : "rgba(10,14,23,0.90)");
        ctx.fill();
        applyStroke();

        const pillW = bw * 0.32;
        const pillH = bh * 0.12;
        const pillX = bx + (bw - pillW) / 2;
        const pillY = by + bh * 0.12;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
        ctx.fillStyle = isGlass ? "rgba(255,255,255,0.20)" : "rgba(99,102,241,0.25)";
        ctx.fill();
        ctx.strokeStyle = isGlass ? "rgba(255,255,255,0.40)" : "rgba(99,102,241,0.50)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${pillH * 0.52}px "Inter", sans-serif`;
        ctx.fillStyle = isGlass ? "#FFFFFF" : "#818CF8";
        ctx.fillText(isGlass ? "✨ HIGHLIGHT" : "⚡ PRO FEATURE", pillX + pillW / 2, pillY + pillH / 2 + 1);

        const headingFontSize = bh * 0.15;
        ctx.font = `700 ${headingFontSize}px "Inter", sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        drawWrappedText(
          ctx,
          sl.text || (isGlass ? "Ultra Fast & Intuitive" : "Pro Performance"),
          bx + bw / 2,
          by + bh * 0.44,
          bw * 0.84,
          headingFontSize * 1.25,
          "center"
        );

        const subFontSize = bh * 0.09;
        ctx.font = `500 ${subFontSize}px "Inter", sans-serif`;
        ctx.fillStyle = isGlass ? "rgba(255,255,255,0.85)" : "rgba(148,163,184,0.90)";
        drawWrappedText(
          ctx,
          sl.subtext || (isGlass ? "Designed for speed, simplicity, and ease of use." : "Engineered for power users who demand lightning speed."),
          bx + bw / 2,
          by + bh * 0.74,
          bw * 0.84,
          subFontSize * 1.35,
          "center"
        );

      } else if (sl.shape === "glow-orb") {
        const cx = sl.x + sl.width / 2;
        const cy = sl.y + sl.height / 2;
        const r = Math.min(sl.width, sl.height) / 2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, sl.fill || "rgba(139,92,246,0.6)");
        grad.addColorStop(0.6, sl.fill ? `${sl.fill}44` : "rgba(139,92,246,0.2)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

      } else if (sl.shape === "dynamic-island") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = bh / 2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#000000";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        const iconR = bh * 0.32;
        const iconX = bx + bh * 0.45;
        const iconY = by + bh / 2;
        ctx.beginPath();
        ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,0.25)";
        ctx.fill();
        ctx.font = `${bh * 0.36}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🎵", iconX, iconY + 1);

        const textLeft = iconX + iconR + bh * 0.22;
        const maxTextW = bw - (textLeft - bx) - bh * 1.1;
        drawAutoFitText(
          ctx,
          sl.text || "Now Playing · Starboy",
          textLeft,
          by + bh / 2,
          maxTextW,
          bh * 0.28,
          600,
          '"Inter", sans-serif',
          "#FFFFFF",
          "left"
        );

        const rightX = bx + bw - bh * 0.55;
        const barW = bh * 0.07;
        const barGap = bh * 0.05;
        const heights = [0.25, 0.55, 0.40, 0.65];
        ctx.fillStyle = "#34D399";
        heights.forEach((hFactor, idx) => {
          const bH = bh * hFactor;
          const bX = rightX - (3 - idx) * (barW + barGap);
          const bY = by + (bh - bH) / 2;
          ctx.beginPath();
          ctx.roundRect(bX, bY, barW, bH, barW / 2);
          ctx.fill();
        });

      } else if (sl.shape === "live-activity") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(32, bh * 0.22);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.94)";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        const iconSize = bh * 0.44;
        const iconX = bx + bh * 0.16;
        const iconY = by + bh * 0.16;
        ctx.beginPath();
        ctx.roundRect(iconX, iconY, iconSize, iconSize, iconSize * 0.25);
        ctx.fillStyle = "#F97316";
        ctx.fill();
        ctx.font = `${iconSize * 0.58}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🏃", iconX + iconSize / 2, iconY + iconSize / 2 + 1);

        const textLeft = iconX + iconSize + bh * 0.14;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${bh * 0.18}px "Inter", sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(sl.text || "Workout in progress", textLeft, by + bh * 0.26);

        ctx.font = `600 ${bh * 0.15}px "Inter", sans-serif`;
        ctx.fillStyle = "#38BDF8";
        ctx.fillText(sl.subtext || "32:15 min · 420 kcal 🔥", textLeft, by + bh * 0.48);

        const progX = bx + bh * 0.16;
        const progY = by + bh * 0.74;
        const progW = bw - bh * 0.32;
        const progH = bh * 0.10;
        ctx.beginPath();
        ctx.roundRect(progX, progY, progW, progH, progH / 2);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(progX, progY, progW * 0.68, progH, progH / 2);
        ctx.fillStyle = "#F97316";
        ctx.fill();

      } else if (sl.shape === "magnifier-loupe") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const radius = Math.min(bw, bh) / 2;
        const cx = bx + bw / 2;
        const cy = by + bh / 2;

        // Outer Glow
        ctx.save();
        ctx.shadowColor = "rgba(99, 102, 241, 0.4)";
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fill();
        ctx.restore();

        // Lens glass reflection gradient
        const lensGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        lensGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
        lensGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.05)");
        lensGrad.addColorStop(0.7, "rgba(99, 102, 241, 0.08)");
        lensGrad.addColorStop(1, "rgba(255, 255, 255, 0.25)");
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = lensGrad;
        ctx.fill();

        // Metallic Chamfered Bezel Rim
        const rimGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        rimGrad.addColorStop(0, "#ffffff");
        rimGrad.addColorStop(0.3, "#818cf8");
        rimGrad.addColorStop(0.7, "#4f46e5");
        rimGrad.addColorStop(1, "#c7d2fe");
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
        ctx.strokeStyle = rimGrad;
        ctx.lineWidth = sl.strokeWidth || 8;
        ctx.stroke();

        // Inner glare arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.85, Math.PI * 1.15, Math.PI * 1.85);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Zoom tag / badge
        if (sl.text) {
          const badgeW = radius * 0.9;
          const badgeH = radius * 0.32;
          const badgeX = cx - badgeW / 2;
          const badgeY = cy + radius * 0.45;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.fill();
          ctx.strokeStyle = "#818cf8";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${badgeH * 0.48}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sl.text, cx, badgeY + badgeH / 2);
        }

      } else if (sl.shape === "ios-toggle") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(28, bh * 0.24);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.92)";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        const iconSize = bh * 0.46;
        const iconX = bx + bh * 0.16;
        const iconY = by + (bh - iconSize) / 2;
        ctx.beginPath();
        ctx.roundRect(iconX, iconY, iconSize, iconSize, iconSize * 0.25);
        ctx.fillStyle = "rgba(99,102,241,0.2)";
        ctx.fill();
        ctx.font = `${iconSize * 0.55}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✨", iconX + iconSize / 2, iconY + iconSize / 2 + 1);

        const textLeft = iconX + iconSize + bh * 0.14;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${bh * 0.20}px "Inter", sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(sl.text || "AI Smart Assistant", textLeft, by + bh * 0.38);

        ctx.font = `500 ${bh * 0.14}px "Inter", sans-serif`;
        ctx.fillStyle = "#94A3B8";
        ctx.fillText(sl.subtext || "Active & Listening", textLeft, by + bh * 0.64);

        const swW = bh * 0.54;
        const swH = bh * 0.32;
        const swX = bx + bw - swW - bh * 0.16;
        const swY = by + (bh - swH) / 2;
        ctx.beginPath();
        ctx.roundRect(swX, swY, swW, swH, swH / 2);
        ctx.fillStyle = "#34C759";
        ctx.fill();

        const knobR = (swH - 4) / 2;
        const knobX = swX + swW - knobR - 2;
        const knobY = swY + swH / 2;
        ctx.beginPath();
        ctx.arc(knobX, knobY, knobR, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

      } else if (sl.shape === "editors-choice-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(bw, bh) / 2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#0B132B";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(251,191,36,0.65)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.font = `${bh * 0.45}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🌿", bx + bh * 0.42, by + bh / 2);
        ctx.fillText("🌿", bx + bw - bh * 0.42, by + bh / 2);

        drawAutoFitText(
          ctx,
          sl.text || "App Store Editors' Choice",
          bx + bw / 2,
          by + bh / 2,
          bw - bh * 1.2,
          bh * 0.34,
          800,
          '"Inter", sans-serif',
          "#FBBF24",
          "center"
        );

      } else if (sl.shape === "design-award-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(bw, bh) / 2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#18181B";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.font = `${bh * 0.42}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💎", bx + bh * 0.45, by + bh / 2);

        drawAutoFitText(
          ctx,
          sl.text || "Apple Design Award Winner",
          bx + bw * 0.56,
          by + bh / 2,
          bw - bh * 1.0,
          bh * 0.34,
          700,
          '"Inter", sans-serif',
          "#FAFAFA",
          "center"
        );

      } else if (sl.shape === "streak-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(bw, bh) / 2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#EA580C";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(254,215,170,0.5)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.font = `${bh * 0.48}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔥", bx + bh * 0.45, by + bh / 2);

        drawAutoFitText(
          ctx,
          sl.text || "30-Day Streak · On Fire!",
          bx + bw * 0.56,
          by + bh / 2,
          bw - bh * 1.0,
          bh * 0.35,
          800,
          '"Inter", sans-serif',
          "#FFFFFF",
          "center"
        );

      } else if (sl.shape === "guarantee-badge") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(bw, bh) / 2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(6,78,59,0.92)";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(52,211,153,0.6)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.font = `${bh * 0.45}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🛡️", bx + bh * 0.45, by + bh / 2);

        drawAutoFitText(
          ctx,
          sl.text || "30-Day Money Back Guarantee",
          bx + bw * 0.56,
          by + bh / 2,
          bw - bh * 1.0,
          bh * 0.33,
          700,
          '"Inter", sans-serif',
          "#6EE7B7",
          "center"
        );

      } else if (sl.shape === "growth-stat-card") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(28, bh * 0.22);

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.92)";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(16,185,129,0.4)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `800 ${bh * 0.34}px "Inter", sans-serif`;
        ctx.fillStyle = "#34D399";
        ctx.fillText("📈 +142%", bx + bh * 0.20, by + bh * 0.38);

        ctx.font = `600 ${bh * 0.16}px "Inter", sans-serif`;
        ctx.fillStyle = "#E2E8F0";
        ctx.fillText(sl.text || "Productivity & Speed Boost", bx + bh * 0.20, by + bh * 0.72);

        const spX = bx + bw - bh * 0.9;
        const spY = by + bh * 0.5;
        ctx.beginPath();
        ctx.moveTo(spX, spY + bh * 0.15);
        ctx.lineTo(spX + bh * 0.22, spY + bh * 0.05);
        ctx.lineTo(spX + bh * 0.44, spY + bh * 0.10);
        ctx.lineTo(spX + bh * 0.70, spY - bh * 0.22);
        ctx.strokeStyle = "#34D399";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

      } else if (sl.shape === "comparison-card") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(bw, bh) / 2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "rgba(15,23,42,0.92)";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `600 ${bh * 0.28}px "Inter", sans-serif`;
        ctx.fillStyle = "#F87171";
        ctx.fillText("❌ " + (sl.subtext || "Without App"), bx + bw * 0.28, by + bh / 2);

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.5, by + bh * 0.2);
        ctx.lineTo(bx + bw * 0.5, by + bh * 0.8);
        ctx.stroke();

        ctx.font = `700 ${bh * 0.28}px "Inter", sans-serif`;
        ctx.fillStyle = "#34D399";
        ctx.fillText("✨ " + (sl.text || "With Our App"), bx + bw * 0.73, by + bh / 2);

      } else if (sl.shape === "curved-arrow") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const color = sl.fill || sl.stroke || "#F59E0B";

        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = Math.max(3, bh * 0.08);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.1, by + bh * 0.15);
        ctx.bezierCurveTo(
          bx + bw * 0.7, by + bh * 0.1,
          bx + bw * 0.9, by + bh * 0.5,
          bx + bw * 0.85, by + bh * 0.85
        );
        ctx.stroke();

        const endX = bx + bw * 0.85;
        const endY = by + bh * 0.85;
        const arrowSize = Math.max(12, bh * 0.22);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowSize * 0.8, endY - arrowSize * 0.3);
        ctx.lineTo(endX - arrowSize * 0.3, endY - arrowSize * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

      } else if (sl.shape === "handwritten-callout") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        const br = Math.min(18, bh * 0.28);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, br);
        ctx.fillStyle = sl.fill ?? "#FEF08A";
        ctx.fill();
        if (sl.stroke && sl.strokeWidth) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "#FACC15";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        drawAutoFitText(
          ctx,
          sl.text || "✨ Swipe to explore",
          bx + bw / 2,
          by + bh / 2,
          bw * 0.88,
          bh * 0.38,
          700,
          '"Inter", cursive, sans-serif',
          "#713F12",
          "center"
        );
        ctx.restore();

      } else if (sl.shape === "marker-highlight") {
        const bx = sl.x, by = sl.y, bw = sl.width, bh = sl.height;
        ctx.save();
        ctx.fillStyle = sl.fill ?? "rgba(250, 204, 21, 0.45)";
        ctx.beginPath();
        ctx.moveTo(bx, by + bh * 0.2);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw * 0.96, by + bh);
        ctx.lineTo(bx + bw * 0.02, by + bh * 0.9);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

      } else if (sl.shape === "rounded-rectangle" || sl.shape === "rectangle" || r2 > 0) {
        const effectiveR = sl.cornerRadius !== undefined ? Math.min(sl.cornerRadius, Math.min(sl.width, sl.height) / 2) : r2;
        ctx.beginPath();
        if (effectiveR > 0) {
          ctx.roundRect(sl.x, sl.y, sl.width, sl.height, effectiveR);
        } else {
          ctx.rect(sl.x, sl.y, sl.width, sl.height);
        }
        ctx.fill();
        applyStroke();

      } else {
        ctx.fillRect(sl.x, sl.y, sl.width, sl.height);
        applyStroke();
      }

      if (shapeDeg !== 0) {
        ctx.restore();
      }
    }

    // ── FLAG / EMOJI / BRAND ──
    else if (layer.type === "flag" || layer.type === "emoji" || layer.type === "brand") {
      const fl = layer as FlagLayer;
      ctx.font = `${layer.height * 0.75}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fl.content, layer.x + layer.width / 2, layer.y + layer.height / 2);
    }

    // ── IMAGE ──
    else if (layer.type === "image") {
      const il = layer as ImageLayer;
      if (il.src) {
        try {
          const img = await loadCachedImage(il.src);
          if (il.cornerRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(il.x, il.y, il.width, il.height, il.cornerRadius);
            ctx.clip();
          }
          ctx.drawImage(img, il.x, il.y, il.width, il.height);
        } catch {
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(il.x, il.y, il.width, il.height);
        }
      }
    }

    // ── CHARACTER (SVG) ──
    else if (layer.type === "character") {
      const cl = layer as CharacterLayer;
      if (cl.svgContent) {
        try {
          let imgUrl = cl.svgContent;
          let needsRevoke = false;

          if (cl.svgContent.startsWith("<") || cl.svgContent.includes("<svg") || cl.svgContent.includes("<g")) {
            const fullSvg = cl.svgContent.startsWith("<svg")
              ? cl.svgContent
              : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">${cl.svgContent}</svg>`;
            const blob = new Blob([fullSvg], { type: "image/svg+xml" });
            imgUrl = URL.createObjectURL(blob);
            needsRevoke = true;
          } else if (cl.svgContent.startsWith("http://") || cl.svgContent.startsWith("https://")) {
            imgUrl = `/api/proxy-svg?url=${encodeURIComponent(cl.svgContent)}`;
          }

          const img = await loadCachedImage(imgUrl);
          ctx.drawImage(img, cl.x, cl.y, cl.width, cl.height);

          if (needsRevoke) {
            URL.revokeObjectURL(imgUrl);
          }
        } catch {}
      }
    }

    // ── Selection Outline in Editor ──
    if (isActiveScreen && layer.id === activeLayerId) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 6;
      ctx.setLineDash([14, 6]);
      ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8);
      ctx.setLineDash([]);
      ctx.fillStyle = "#6366f1";
      [[layer.x - 4, layer.y - 4], [layer.x + layer.width - 4, layer.y - 4],
       [layer.x - 4, layer.y + layer.height - 4], [layer.x + layer.width - 4, layer.y + layer.height - 4]
      ].forEach(([hx, hy]) => ctx.fillRect(hx, hy, 8, 8));
      ctx.restore();
    }

    ctx.restore();
  }
}
