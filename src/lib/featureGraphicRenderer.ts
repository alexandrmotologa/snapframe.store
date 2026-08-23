export interface FeatureGraphicConfig {
  format: "google-play" | "social-og" | "in-app-event";
  layout: "hero-right" | "dual-phone" | "panorama-glow" | "minimalist";
  
  // Content
  appName: string;
  tagline: string;
  badgeText: string; // e.g. "⭐️ 4.9 (50K+ Reviews)" or "#1 Productivity App"
  category: string;
  showStoreBadges: boolean;
  
  // Visual Assets
  iconSrc?: string;
  screenshotSrc?: string;
  secondaryScreenshotSrc?: string;
  
  // Background Styling
  bgGradient: {
    from: string;
    via?: string;
    to: string;
    angle: number;
  };
  ambientLighting: boolean;
  gridPattern: boolean;
  deviceTiltAngle: number; // e.g. -12 to 12 degrees
}

export const FEATURE_GRAPHIC_FORMATS = {
  "google-play": { width: 1024, height: 500, label: "Google Play Feature Graphic (1024×500)" },
  "social-og": { width: 1200, height: 630, label: "Social Share & Product Hunt (1200×630)" },
  "in-app-event": { width: 1920, height: 1080, label: "In-App Event & Promo Card (1920×1080)" },
};

export const FEATURE_GRAPHIC_PRESETS = [
  {
    name: "Cyber Horizon",
    bgGradient: { from: "#0f172a", via: "#1e1b4b", to: "#312e81", angle: 135 },
    ambientLighting: true,
    gridPattern: true,
  },
  {
    name: "Sunset Vibrant",
    bgGradient: { from: "#4c0519", via: "#831843", to: "#be185d", angle: 135 },
    ambientLighting: true,
    gridPattern: false,
  },
  {
    name: "Emerald Studio",
    bgGradient: { from: "#022c22", via: "#064e3b", to: "#047857", angle: 135 },
    ambientLighting: true,
    gridPattern: true,
  },
  {
    name: "Midnight Titanium",
    bgGradient: { from: "#09090b", via: "#18181b", to: "#27272a", angle: 135 },
    ambientLighting: true,
    gridPattern: true,
  },
  {
    name: "Electric Violet",
    bgGradient: { from: "#311042", via: "#581c87", to: "#7c3aed", angle: 135 },
    ambientLighting: true,
    gridPattern: false,
  },
];

/**
 * Loads an image with CORS handling
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Renders a complete Feature Graphic Banner or Social Launch Card onto canvas
 */
export async function renderFeatureGraphicToCanvas(
  canvas: HTMLCanvasElement,
  config: FeatureGraphicConfig
) {
  const dim = FEATURE_GRAPHIC_FORMATS[config.format] || FEATURE_GRAPHIC_FORMATS["google-play"];
  const W = dim.width;
  const H = dim.height;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, W, H);
  ctx.save();

  // 1. Render Background Gradient
  const angleRad = ((config.bgGradient.angle - 90) * Math.PI) / 180;
  const x1 = W / 2 - (Math.cos(angleRad) * W) / 2;
  const y1 = H / 2 - (Math.sin(angleRad) * H) / 2;
  const x2 = W / 2 + (Math.cos(angleRad) * W) / 2;
  const y2 = H / 2 + (Math.sin(angleRad) * H) / 2;

  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, config.bgGradient.from);
  if (config.bgGradient.via) {
    grad.addColorStop(0.5, config.bgGradient.via);
  }
  grad.addColorStop(1, config.bgGradient.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 2. Ambient Lighting Glow
  if (config.ambientLighting) {
    // Top right / center light spot
    const radGlow = ctx.createRadialGradient(W * 0.75, H * 0.4, 20, W * 0.75, H * 0.4, W * 0.6);
    radGlow.addColorStop(0, "rgba(129, 140, 248, 0.35)");
    radGlow.addColorStop(0.5, "rgba(192, 132, 252, 0.15)");
    radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, W, H);

    // Subtle bottom left glow
    const bottomGlow = ctx.createRadialGradient(W * 0.15, H * 0.8, 10, W * 0.15, H * 0.8, W * 0.4);
    bottomGlow.addColorStop(0, "rgba(56, 189, 248, 0.2)");
    bottomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, W, H);
  }

  // 3. Grid Pattern Overlay
  if (config.gridPattern) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const step = Math.round(W * 0.035);
    for (let x = 0; x < W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Load external assets (icon & screenshots)
  const [iconImg, screenImg1, screenImg2] = await Promise.all([
    loadImage(config.iconSrc || ""),
    loadImage(config.screenshotSrc || ""),
    loadImage(config.secondaryScreenshotSrc || ""),
  ]);

  // 4. Render Layout
  switch (config.layout) {
    case "hero-right":
      await renderHeroRightLayout(ctx, config, W, H, iconImg, screenImg1);
      break;
    case "dual-phone":
      await renderDualPhoneLayout(ctx, config, W, H, iconImg, screenImg1, screenImg2);
      break;
    case "panorama-glow":
      await renderPanoramaGlowLayout(ctx, config, W, H, iconImg);
      break;
    case "minimalist":
    default:
      await renderMinimalistLayout(ctx, config, W, H, iconImg);
      break;
  }

  ctx.restore();
}

/**
 * Layout 1: Hero Right (Classic high-converting App Store & Play Store landscape)
 */
async function renderHeroRightLayout(
  ctx: CanvasRenderingContext2D,
  config: FeatureGraphicConfig,
  W: number,
  H: number,
  iconImg: HTMLImageElement | null,
  screenImg: HTMLImageElement | null
) {
  const leftX = W * 0.08;

  // Render Badge
  if (config.badgeText) {
    ctx.save();
    ctx.font = `bold ${Math.round(H * 0.042)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
    const textWidth = ctx.measureText(config.badgeText).width;
    const badgeHeight = H * 0.08;
    const badgeWidth = textWidth + H * 0.07;
    const badgeY = H * 0.16;

    // Glass pill background
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
    ctx.fill();
    ctx.stroke();

    // Badge text
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(config.badgeText, leftX + (H * 0.07) / 2, badgeY + badgeHeight / 2);
    ctx.restore();
  }

  // Render App Icon + Title
  const titleY = H * 0.38;
  if (iconImg) {
    const iconSize = H * 0.16;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.roundRect(leftX, titleY - iconSize * 0.8, iconSize, iconSize, iconSize * 0.22);
    ctx.clip();
    ctx.drawImage(iconImg, leftX, titleY - iconSize * 0.8, iconSize, iconSize);
    ctx.restore();

    // App Name beside or below
    ctx.save();
    ctx.font = `900 ${Math.round(H * 0.12)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 12;
    ctx.fillText(config.appName, leftX + iconSize + W * 0.02, titleY);
    ctx.restore();
  } else {
    // Large Title only
    ctx.save();
    ctx.font = `900 ${Math.round(H * 0.14)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 12;
    ctx.fillText(config.appName, leftX, titleY);
    ctx.restore();
  }

  // Render Tagline
  ctx.save();
  ctx.font = `500 ${Math.round(H * 0.058)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  const maxTextWidth = W * 0.45;
  wrapText(ctx, config.tagline, leftX, titleY + H * 0.16, maxTextWidth, H * 0.08);
  ctx.restore();

  // Render Phone Mockup on Right
  const phoneWidth = W * 0.32;
  const phoneHeight = phoneWidth * 2.1;
  const phoneX = W * 0.72;
  const phoneY = H * 0.55;

  drawDeviceMockup(
    ctx,
    screenImg,
    phoneX,
    phoneY,
    phoneWidth,
    phoneHeight,
    config.deviceTiltAngle || 8
  );
}

/**
 * Layout 2: Dual Overlapping Phones
 */
async function renderDualPhoneLayout(
  ctx: CanvasRenderingContext2D,
  config: FeatureGraphicConfig,
  W: number,
  H: number,
  iconImg: HTMLImageElement | null,
  screenImg1: HTMLImageElement | null,
  screenImg2: HTMLImageElement | null
) {
  const leftX = W * 0.07;
  const titleY = H * 0.35;

  // Title & Tagline
  ctx.save();
  ctx.font = `900 ${Math.round(H * 0.13)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 12;
  ctx.fillText(config.appName, leftX, titleY);

  ctx.font = `500 ${Math.round(H * 0.054)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  wrapText(ctx, config.tagline, leftX, titleY + H * 0.14, W * 0.38, H * 0.075);
  ctx.restore();

  // Phone 1 (Behind, angled)
  const phoneWidth = W * 0.28;
  const phoneHeight = phoneWidth * 2.1;
  drawDeviceMockup(ctx, screenImg2 || screenImg1, W * 0.65, H * 0.58, phoneWidth, phoneHeight, -10);

  // Phone 2 (Front, slightly overlapping)
  drawDeviceMockup(ctx, screenImg1, W * 0.79, H * 0.52, phoneWidth, phoneHeight, 10);
}

/**
 * Layout 3: Panorama Glow
 */
async function renderPanoramaGlowLayout(
  ctx: CanvasRenderingContext2D,
  config: FeatureGraphicConfig,
  W: number,
  H: number,
  iconImg: HTMLImageElement | null
) {
  // Center App Icon with Ambient Glow
  const iconSize = H * 0.24;
  const centerX = W * 0.5;
  const iconY = H * 0.24;

  if (iconImg) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.roundRect(centerX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize, iconSize * 0.22);
    ctx.clip();
    ctx.drawImage(iconImg, centerX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize);
    ctx.restore();
  }

  // App Name
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.round(H * 0.13)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(config.appName, centerX, H * 0.52);

  // Tagline
  ctx.font = `500 ${Math.round(H * 0.055)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText(config.tagline, centerX, H * 0.64);
  ctx.restore();
}

/**
 * Layout 4: Minimalist Studio
 */
async function renderMinimalistLayout(
  ctx: CanvasRenderingContext2D,
  config: FeatureGraphicConfig,
  W: number,
  H: number,
  iconImg: HTMLImageElement | null
) {
  const centerX = W * 0.5;

  if (iconImg) {
    const iconSize = H * 0.28;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(centerX - iconSize / 2, H * 0.15, iconSize, iconSize, iconSize * 0.22);
    ctx.clip();
    ctx.drawImage(iconImg, centerX - iconSize / 2, H * 0.15, iconSize, iconSize);
    ctx.restore();
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.round(H * 0.14)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(config.appName, centerX, H * 0.62);

  ctx.font = `500 ${Math.round(H * 0.056)}px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillText(config.tagline, centerX, H * 0.74);
  ctx.restore();
}

/**
 * Helper to draw modern 3D tilted phone mockup frame on canvas
 */
function drawDeviceMockup(
  ctx: CanvasRenderingContext2D,
  screenImg: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  tiltDegrees: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tiltDegrees * Math.PI) / 180);

  const cornerRadius = w * 0.12;

  // Drop Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = w * 0.25;
  ctx.shadowOffsetX = w * 0.08;
  ctx.shadowOffsetY = w * 0.12;

  // Device Outer Body (Titanium frame)
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, cornerRadius);
  ctx.fill();

  // Reset shadow for inner screen
  ctx.shadowColor = "transparent";

  // Metallic Border
  const borderGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  borderGrad.addColorStop(0, "#94a3b8");
  borderGrad.addColorStop(0.5, "#334155");
  borderGrad.addColorStop(1, "#64748b");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = w * 0.025;
  ctx.stroke();

  // Screen Area
  const innerMargin = w * 0.035;
  const innerW = w - innerMargin * 2;
  const innerH = h - innerMargin * 2;
  const innerRadius = cornerRadius - innerMargin * 0.6;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-innerW / 2, -innerH / 2, innerW, innerH, innerRadius);
  ctx.clip();

  if (screenImg) {
    ctx.drawImage(screenImg, -innerW / 2, -innerH / 2, innerW, innerH);
  } else {
    // Placeholder wallpaper
    const bg = ctx.createLinearGradient(-innerW / 2, -innerH / 2, innerW / 2, innerH / 2);
    bg.addColorStop(0, "#4f46e5");
    bg.addColorStop(1, "#9333ea");
    ctx.fillStyle = bg;
    ctx.fillRect(-innerW / 2, -innerH / 2, innerW, innerH);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `bold ${Math.round(w * 0.08)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("App Preview", 0, 0);
  }

  ctx.restore();

  // Dynamic Island / Top Notch
  ctx.fillStyle = "#000000";
  const notchW = w * 0.28;
  const notchH = h * 0.035;
  ctx.beginPath();
  ctx.roundRect(-notchW / 2, -h / 2 + innerMargin + notchH * 0.3, notchW, notchH, notchH / 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Text wrapping utility for 2D canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
