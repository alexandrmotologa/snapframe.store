import JSZip from "jszip";

/**
 * Universal browser file download helper
 */
export function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function sanitizeAppName(name: string): string {
  const clean = (name || "App").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean || "app";
}

export interface IconStyleConfig {
  type: "glyph" | "emoji" | "image" | "text";
  symbolName: string; // e.g. "Sparkles", "Camera", "Flame", etc.
  emoji: string;
  imageSrc?: string;
  customText?: string;
  
  // Icon / Glyph Styling
  iconColor: string;
  iconSizeRatio: number; // 0.2 to 0.85
  iconOffsetY: number; // -50 to 50
  
  // Background Styling
  bgType: "gradient" | "mesh" | "solid";
  bgGradient: {
    name: string;
    from: string;
    via?: string;
    to: string;
    angle: number; // in degrees
  };
  bgColor: string;

  // Effects
  gleamHighlight: boolean; // 3D top-left diagonal glass gleam
  innerShadow: boolean;
  ambientGlow: boolean;
  glowColor: string;
  metallicRing: "none" | "gold" | "silver" | "titanium" | "neon";
  cornerRadiusRatio?: number; // 0.0 to 0.5 (0 = square, 0.2237 = iOS squircle, 0.5 = circle)
}

export const ICON_GRADIENT_PRESETS = [
  { name: "Royal Indigo", from: "#4f46e5", via: "#7c3aed", to: "#9333ea", angle: 135 },
  { name: "iOS Sunset", from: "#ff416c", via: "#ff4b2b", to: "#f97316", angle: 135 },
  { name: "Cyber Neon", from: "#06b6d4", via: "#3b82f6", to: "#8b5cf6", angle: 135 },
  { name: "Emerald Pro", from: "#059669", via: "#10b981", to: "#34d399", angle: 135 },
  { name: "Golden Aura", from: "#f59e0b", via: "#fbbf24", to: "#d97706", angle: 135 },
  { name: "Velvet Rose", from: "#ec4899", via: "#d946ef", to: "#a855f7", angle: 135 },
  { name: "Deep Space", from: "#0f172a", via: "#1e1b4b", to: "#312e81", angle: 135 },
  { name: "Midnight OLED", from: "#000000", via: "#18181b", to: "#27272a", angle: 135 },
  { name: "Electric Lime", from: "#84cc16", via: "#22c55e", to: "#06b6d4", angle: 135 },
  { name: "Ruby Crimson", from: "#dc2626", via: "#b91c1c", to: "#991b1b", angle: 135 },
  { name: "Oceanic Turquoise", from: "#0891b2", via: "#0d9488", to: "#059669", angle: 135 },
  { name: "Frosted Lilac", from: "#c084fc", via: "#e879f9", to: "#f472b6", angle: 135 },
];

export const POPULAR_ICON_GLYPHS = [
  "Sparkles", "Zap", "Camera", "Smartphone", "Heart", "Star", "Flame", 
  "Shield", "Lock", "Music", "Video", "Compass", "Globe", "Cloud", 
  "Code", "Cpu", "Layers", "Box", "MessageSquare", "Send", "Search", 
  "Smile", "Activity", "CheckCircle", "Feather", "Rocket", "Award", 
  "DollarSign", "ShoppingBag", "Headphones", "Sliders", "Folder", "Play"
];

/**
 * Draws the configured App Icon onto any 2D canvas context
 */
export async function renderIconToCanvas(
  canvas: HTMLCanvasElement,
  config: IconStyleConfig,
  size: number = 1024,
  options?: {
    mask?: "none" | "squircle" | "circle" | "rounded" | "custom";
    cornerRadiusRatio?: number;
    withShadow?: boolean;
  }
) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);

  const mask = options?.mask || "none";
  const radiusRatio = options?.cornerRadiusRatio !== undefined
    ? options.cornerRadiusRatio
    : (config.cornerRadiusRatio !== undefined
      ? config.cornerRadiusRatio
      : (mask === "circle" ? 0.5 : mask === "squircle" ? 0.2237 : 0));

  const r = size * radiusRatio;

  ctx.save();

  // Apply Clipping Mask if requested
  if (radiusRatio >= 0.495) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (r > 0) {
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, r);
    ctx.clip();
  }

  // 1. Draw Background Gradient or Solid
  if (config.bgType === "solid") {
    ctx.fillStyle = config.bgColor || "#4f46e5";
    ctx.fillRect(0, 0, size, size);
  } else {
    // Linear Gradient by angle
    const angleRad = ((config.bgGradient.angle - 90) * Math.PI) / 180;
    const x1 = size / 2 - (Math.cos(angleRad) * size) / 2;
    const y1 = size / 2 - (Math.sin(angleRad) * size) / 2;
    const x2 = size / 2 + (Math.cos(angleRad) * size) / 2;
    const y2 = size / 2 + (Math.sin(angleRad) * size) / 2;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, config.bgGradient.from);
    if (config.bgGradient.via) {
      grad.addColorStop(0.5, config.bgGradient.via);
    }
    grad.addColorStop(1, config.bgGradient.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // 2. Ambient Mesh Glow
  if (config.ambientGlow) {
    const radGlow = ctx.createRadialGradient(
      size / 2,
      size * 0.35,
      10,
      size / 2,
      size / 2,
      size * 0.7
    );
    radGlow.addColorStop(0, config.glowColor || "rgba(255, 255, 255, 0.45)");
    radGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, size, size);
  }

  // 3. 3D Diagonal Gleam Highlight
  if (config.gleamHighlight) {
    const gleamGrad = ctx.createLinearGradient(0, 0, size * 0.9, size * 0.9);
    gleamGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    gleamGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.08)");
    gleamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    gleamGrad.addColorStop(1, "rgba(0, 0, 0, 0.15)");
    ctx.fillStyle = gleamGrad;
    ctx.fillRect(0, 0, size, size);
  }

  // 4. Draw Center Icon / Symbol / Emoji / Image
  const iconSize = size * config.iconSizeRatio;
  const centerY = size / 2 + (config.iconOffsetY / 100) * size;

  if (config.type === "image" && config.imageSrc) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const aspect = img.width / img.height;
        let w = iconSize;
        let h = iconSize;
        if (aspect > 1) {
          h = iconSize / aspect;
        } else {
          w = iconSize * aspect;
        }
        ctx.drawImage(img, (size - w) / 2, centerY - h / 2, w, h);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = config.imageSrc!;
    });
  } else if (config.type === "emoji" && config.emoji) {
    ctx.font = `${Math.round(iconSize * 0.9)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = size * 0.03;
    ctx.shadowOffsetY = size * 0.015;
    ctx.fillText(config.emoji, size / 2, centerY + iconSize * 0.05);
  } else if (config.type === "text" && config.customText) {
    ctx.fillStyle = config.iconColor || "#ffffff";
    ctx.font = `bold ${Math.round(iconSize * 0.7)}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = size * 0.025;
    ctx.shadowOffsetY = size * 0.015;
    ctx.fillText(config.customText.slice(0, 3).toUpperCase(), size / 2, centerY);
  } else {
    // Render Vector Glyph
    await renderGlyphSymbol(ctx, config.symbolName, size / 2, centerY, iconSize, config.iconColor);
  }

  // 5. Metallic Ring / Stroke
  if (config.metallicRing !== "none") {
    ctx.save();
    const ringWidth = size * 0.032; // 33px at 1024
    ctx.lineWidth = ringWidth;
    
    // Multi-stop realistic metallic luster gradient
    const ringGrad = ctx.createLinearGradient(0, 0, size, size);
    if (config.metallicRing === "gold") {
      ringGrad.addColorStop(0, "#fffbeb");
      ringGrad.addColorStop(0.18, "#fef08a");
      ringGrad.addColorStop(0.42, "#d97706");
      ringGrad.addColorStop(0.68, "#78350f");
      ringGrad.addColorStop(0.85, "#fbbf24");
      ringGrad.addColorStop(1, "#fef3c7");
    } else if (config.metallicRing === "silver") {
      ringGrad.addColorStop(0, "#ffffff");
      ringGrad.addColorStop(0.2, "#e2e8f0");
      ringGrad.addColorStop(0.5, "#64748b");
      ringGrad.addColorStop(0.75, "#94a3b8");
      ringGrad.addColorStop(1, "#ffffff");
    } else if (config.metallicRing === "titanium") {
      ringGrad.addColorStop(0, "#94a3b8");
      ringGrad.addColorStop(0.3, "#475569");
      ringGrad.addColorStop(0.6, "#1e293b");
      ringGrad.addColorStop(0.85, "#334155");
      ringGrad.addColorStop(1, "#64748b");
    } else if (config.metallicRing === "neon") {
      ringGrad.addColorStop(0, "#38bdf8");
      ringGrad.addColorStop(0.33, "#818cf8");
      ringGrad.addColorStop(0.66, "#c084fc");
      ringGrad.addColorStop(1, "#f472b6");
    }
    
    ctx.strokeStyle = ringGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = size * 0.015;

    const halfStroke = ringWidth / 2;
    if (radiusRatio >= 0.495) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - halfStroke, 0, Math.PI * 2);
      ctx.stroke();
    } else if (r > 0) {
      ctx.beginPath();
      ctx.roundRect(halfStroke, halfStroke, size - ringWidth, size - ringWidth, Math.max(0, r - halfStroke));
      ctx.stroke();
    } else {
      // 0% - Square perimeter border
      ctx.beginPath();
      ctx.strokeRect(halfStroke, halfStroke, size - ringWidth, size - ringWidth);
    }
    ctx.restore();
  }

  ctx.restore();
}

const GLYPH_PATHS: Record<string, string> = {
  sparkles: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z M20 3v4 M22 5h-4 M4 17v2 M5 18H3",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  camera: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  smartphone: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01",
  heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  lock: "M7 11V7a5 5 0 0 1 10 0v4 M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
  music: "M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  video: "m22 8-6 4 6 4V8z M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  cloud: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",
  code: "m16 18 6-6-6-6 M8 6l-6 6 6 6",
  cpu: "M4 4h16v16H4z M9 9h6v6H9z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M20 9h3 M20 14h3 M1 9h3 M1 14h3",
  layers: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12 M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
  box: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.27 6.96 12 12.01l8.73-5.05 M12 22.08V12",
  messagesquare: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  send: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z M21.854 2.146 10.804 13.196",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35",
  smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  checkcircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
  feather: "M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8 2 22 M17.5 15H9",
  rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89 7 23l5-3 5 3-1.21-9.12",
  dollarsign: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  shoppingbag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  headphones: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3",
  sliders: "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  folder: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
  play: "M6 3v18l15-9L6 3z",
};

/**
 * Renders common vector glyph paths directly onto canvas using Path2D
 */
async function renderGlyphSymbol(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.04;

  const half = size / 2;
  const left = cx - half;
  const top = cy - half;

  ctx.translate(left, top);
  const scale = size / 24;
  ctx.scale(scale, scale);

  const cleanName = symbol.toLowerCase().replace(/[\s-_]/g, "");
  const svgD = GLYPH_PATHS[cleanName] || GLYPH_PATHS["sparkles"];

  try {
    const path = new Path2D(svgD);
    ctx.stroke(path);
    if (["zap", "heart", "star", "sparkles", "flame", "rocket", "play"].includes(cleanName)) {
      ctx.fill(path);
    }
  } catch {
    const fallbackPath = new Path2D(GLYPH_PATHS["star"]);
    ctx.fill(fallbackPath);
  }

  ctx.restore();
}

/**
 * Exports complete Xcode Asset Catalog (`AppIcon.appiconset.zip`)
 */
export async function exportXcodeAppIconSet(config: IconStyleConfig, appName: string = "App") {
  const zip = new JSZip();
  const folder = zip.folder("AppIcon.appiconset");
  if (!folder) return;

  const XCODE_SIZES = [
    { size: 1024, idiom: "universal", platform: "ios", scale: "1x", filename: "icon-1024.png" },
    { size: 180, idiom: "iphone", scale: "3x", filename: "icon-60@3x.png" },
    { size: 120, idiom: "iphone", scale: "2x", filename: "icon-60@2x.png" },
    { size: 120, idiom: "iphone", scale: "3x", filename: "icon-40@3x.png" },
    { size: 80, idiom: "iphone", scale: "2x", filename: "icon-40@2x.png" },
    { size: 87, idiom: "iphone", scale: "3x", filename: "icon-29@3x.png" },
    { size: 58, idiom: "iphone", scale: "2x", filename: "icon-29@2x.png" },
    { size: 40, idiom: "iphone", scale: "2x", filename: "icon-20@2x.png" },
    { size: 60, idiom: "iphone", scale: "3x", filename: "icon-20@3x.png" },
    { size: 167, idiom: "ipad", scale: "2x", filename: "icon-83.5@2x.png" },
    { size: 152, idiom: "ipad", scale: "2x", filename: "icon-76@2x.png" },
    { size: 76, idiom: "ipad", scale: "1x", filename: "icon-76.png" },
  ];

  const contentsJson = {
    images: XCODE_SIZES.map((s) => ({
      idiom: s.idiom,
      size: `${s.size / parseInt(s.scale)}x${s.size / parseInt(s.scale)}`,
      scale: s.scale,
      filename: s.filename,
    })),
    info: {
      author: "xcode",
      version: 1,
    },
  };

  folder.file("Contents.json", JSON.stringify(contentsJson, null, 2));

  // Render each size to canvas and add to zip
  const offscreen = document.createElement("canvas");
  for (const item of XCODE_SIZES) {
    await renderIconToCanvas(offscreen, config, item.size, { mask: "none" });
    const blob = await new Promise<Blob | null>((res) => offscreen.toBlob(res, "image/png"));
    if (blob) {
      folder.file(item.filename, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const safeName = sanitizeAppName(appName);
  downloadBlob(zipBlob, `${safeName}-AppIcon.appiconset.zip`);
}

/**
 * Exports complete Android `res/mipmap` bundle
 */
export async function exportAndroidIconBundle(config: IconStyleConfig, appName: string = "App") {
  const zip = new JSZip();

  const ANDROID_SIZES = [
    { folder: "mipmap-mdpi", size: 48 },
    { folder: "mipmap-hdpi", size: 72 },
    { folder: "mipmap-xhdpi", size: 96 },
    { folder: "mipmap-xxhdpi", size: 144 },
    { folder: "mipmap-xxxhdpi", size: 192 },
  ];

  const offscreen = document.createElement("canvas");

  // Add Google Play Master 512x512
  await renderIconToCanvas(offscreen, config, 512, { mask: "none" });
  const playstoreBlob = await new Promise<Blob | null>((res) => offscreen.toBlob(res, "image/png"));
  if (playstoreBlob) {
    zip.file("playstore-icon-512x512.png", playstoreBlob);
  }

  // Add Adaptive/Square icons for each density folder
  for (const item of ANDROID_SIZES) {
    const f = zip.folder(item.folder);
    if (!f) continue;

    // Square Launcher
    await renderIconToCanvas(offscreen, config, item.size, { mask: "none" });
    const sqBlob = await new Promise<Blob | null>((res) => offscreen.toBlob(res, "image/png"));
    if (sqBlob) f.file("ic_launcher.png", sqBlob);

    // Round Launcher (for Android 7.1+)
    await renderIconToCanvas(offscreen, config, item.size, { mask: "circle" });
    const rdBlob = await new Promise<Blob | null>((res) => offscreen.toBlob(res, "image/png"));
    if (rdBlob) f.file("ic_launcher_round.png", rdBlob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const safeName = sanitizeAppName(appName);
  downloadBlob(zipBlob, `${safeName}-android-icons.zip`);
}

/**
 * Exports Web Favicon Package
 */
export async function exportWebFaviconPack(config: IconStyleConfig, appName: string = "App") {
  const zip = new JSZip();
  const offscreen = document.createElement("canvas");

  const SIZES = [
    { name: "apple-touch-icon.png", size: 180, mask: "rounded" as const },
    { name: "favicon-32x32.png", size: 32, mask: "none" as const },
    { name: "favicon-16x16.png", size: 16, mask: "none" as const },
    { name: "android-chrome-192x192.png", size: 192, mask: "rounded" as const },
    { name: "android-chrome-512x512.png", size: 512, mask: "rounded" as const },
  ];

  for (const item of SIZES) {
    await renderIconToCanvas(offscreen, config, item.size, { mask: item.mask });
    const blob = await new Promise<Blob | null>((res) => offscreen.toBlob(res, "image/png"));
    if (blob) zip.file(item.name, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const safeName = sanitizeAppName(appName);
  downloadBlob(zipBlob, `${safeName}-favicon-pack.zip`);
}
