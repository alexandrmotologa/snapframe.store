import { ShapeLayer } from "@/lib/types";

export interface StoreBadgeLocalization {
  subtext: string; // e.g. "Download on the" or "GET IT ON"
  title: string;   // e.g. "App Store" or "Google Play"
}

export const APP_STORE_TRANSLATIONS: Record<string, StoreBadgeLocalization> = {
  en: { subtext: "Download on the", title: "App Store" },
  ro: { subtext: "Descărcați de pe", title: "App Store" },
  de: { subtext: "Laden im", title: "App Store" },
  fr: { subtext: "Télécharger dans", title: "l'App Store" },
  es: { subtext: "Consíguelo en el", title: "App Store" },
  it: { subtext: "Scarica su", title: "App Store" },
  pt: { subtext: "Descarregar na", title: "App Store" },
  nl: { subtext: "Download in de", title: "App Store" },
  ru: { subtext: "Загрузите в", title: "App Store" },
  ja: { subtext: "App Store から", title: "ダウンロード" },
  ko: { subtext: "App Store 에서", title: "다운로드 하기" },
  zh: { subtext: "App Store 下载", title: "App Store" },
  pl: { subtext: "Pobierz w", title: "App Store" },
  tr: { subtext: "App Store'dan", title: "İndirin" },
  vi: { subtext: "Tải về trên", title: "App Store" },
  id: { subtext: "Unduh di", title: "App Store" },
};

export const GOOGLE_PLAY_TRANSLATIONS: Record<string, StoreBadgeLocalization> = {
  en: { subtext: "GET IT ON", title: "Google Play" },
  ro: { subtext: "ACUM PE", title: "Google Play" },
  de: { subtext: "JETZT BEI", title: "Google Play" },
  fr: { subtext: "DISPONIBLE SUR", title: "Google Play" },
  es: { subtext: "DISPONIBLE EN", title: "Google Play" },
  it: { subtext: "DISPONIBILE SU", title: "Google Play" },
  pt: { subtext: "DISPONÍVEL NO", title: "Google Play" },
  nl: { subtext: "ONTDEK HET OP", title: "Google Play" },
  ru: { subtext: "ДОСТУПНО В", title: "Google Play" },
  ja: { subtext: "Google Play で", title: "手に入れよう" },
  ko: { subtext: "Google Play 에서", title: "다운로드" },
  zh: { subtext: "从 Google Play", title: "获取" },
  pl: { subtext: "POBIERZ Z", title: "Google Play" },
  tr: { subtext: "Google Play'DEN", title: "ALIN" },
  vi: { subtext: "TẢI TRÊN", title: "Google Play" },
  id: { subtext: "TEMUKAN DI", title: "Google Play" },
};

/**
 * Draws an official Apple logo vector path on canvas scaled to box [x, y, w, h].
 */
export function drawAppleLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);

  // Normalize scale so standard unit fits in [size x size]
  const s = size / 100;
  ctx.scale(s, s);

  ctx.beginPath();
  // Apple leaf
  ctx.moveTo(56, 10);
  ctx.bezierCurveTo(62, 2, 72, 0, 77, 0);
  ctx.bezierCurveTo(77, 8, 73, 18, 66, 23);
  ctx.bezierCurveTo(60, 29, 52, 27, 49, 27);
  ctx.bezierCurveTo(50, 19, 53, 13, 56, 10);
  ctx.closePath();
  ctx.fill();

  // Apple body with bite cutout
  ctx.beginPath();
  ctx.moveTo(68, 38);
  ctx.bezierCurveTo(75, 43, 80, 52, 79, 63);
  ctx.bezierCurveTo(70, 64, 64, 58, 64, 50);
  ctx.bezierCurveTo(64, 44, 66, 40, 68, 38);

  ctx.moveTo(50, 31);
  ctx.bezierCurveTo(56, 31, 62, 35, 68, 38);
  ctx.bezierCurveTo(65, 43, 63, 50, 64, 57);
  ctx.bezierCurveTo(65, 69, 74, 76, 78, 79);
  ctx.bezierCurveTo(73, 90, 66, 99, 58, 99);
  ctx.bezierCurveTo(53, 99, 49, 96, 43, 96);
  ctx.bezierCurveTo(36, 96, 31, 99, 27, 99);
  ctx.bezierCurveTo(18, 99, 7, 82, 7, 65);
  ctx.bezierCurveTo(7, 49, 17, 40, 27, 40);
  ctx.bezierCurveTo(34, 40, 40, 44, 44, 44);
  ctx.bezierCurveTo(47, 44, 50, 31, 50, 31);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the official Google Play 4-color overlapping triangle logo on canvas.
 */
export function drawGooglePlayLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.translate(x, y);

  const s = size / 100;
  ctx.scale(s, s);

  // 1. Blue body polygon
  ctx.fillStyle = "#00c3ff";
  ctx.beginPath();
  ctx.moveTo(12, 10);
  ctx.lineTo(60, 50);
  ctx.lineTo(12, 90);
  ctx.closePath();
  ctx.fill();

  // 2. Green top polygon
  ctx.fillStyle = "#00e676";
  ctx.beginPath();
  ctx.moveTo(12, 10);
  ctx.lineTo(76, 38);
  ctx.lineTo(60, 50);
  ctx.closePath();
  ctx.fill();

  // 3. Red bottom polygon
  ctx.fillStyle = "#ff334b";
  ctx.beginPath();
  ctx.moveTo(12, 90);
  ctx.lineTo(60, 50);
  ctx.lineTo(76, 62);
  ctx.closePath();
  ctx.fill();

  // 4. Yellow right apex triangle
  ctx.fillStyle = "#ffc400";
  ctx.beginPath();
  ctx.moveTo(60, 50);
  ctx.lineTo(76, 38);
  ctx.lineTo(92, 50);
  ctx.lineTo(76, 62);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Universal Store Badge Renderer for HTML Canvas.
 * Renders pixel-perfect, fully localized vector Apple App Store and Google Play badges.
 */
export function drawStoreBadge(
  ctx: CanvasRenderingContext2D,
  layer: ShapeLayer,
  activeLocale: string = "en"
) {
  const isAppStore = layer.shape.startsWith("appstore");
  const isLight = layer.shape.includes("light");
  const locale = (layer.locale || activeLocale || "en").toLowerCase().slice(0, 2);

  const localization = isAppStore
    ? APP_STORE_TRANSLATIONS[locale] || APP_STORE_TRANSLATIONS.en
    : GOOGLE_PLAY_TRANSLATIONS[locale] || GOOGLE_PLAY_TRANSLATIONS.en;

  const subtext = layer.subtext || localization.subtext;
  const mainTitle = layer.text || localization.title;

  const bx = layer.x;
  const by = layer.y;
  const bw = layer.width;
  const bh = layer.height;
  const br = layer.cornerRadius !== undefined ? layer.cornerRadius : Math.min(bw, bh) * 0.18;

  ctx.save();

  // Badge Container Background
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, br);
  ctx.fillStyle = isLight ? "#FFFFFF" : (layer.fill && layer.fill !== "transparent" ? layer.fill : "#000000");
  ctx.fill();

  // Subtle Border
  ctx.lineWidth = layer.strokeWidth || Math.max(1, Math.round(bh * 0.025));
  ctx.strokeStyle = layer.stroke || (isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.25)");
  ctx.stroke();

  // Logo & Text Sizing
  const iconAreaWidth = bw * 0.28;
  const logoSize = Math.min(iconAreaWidth * 0.75, bh * 0.65);
  const logoX = bx + (iconAreaWidth - logoSize) / 2 + bw * 0.04;
  const logoY = by + (bh - logoSize) / 2;

  const textColor = isLight ? "#000000" : "#FFFFFF";

  if (isAppStore) {
    drawAppleLogo(ctx, logoX, logoY, logoSize, textColor);
  } else {
    drawGooglePlayLogo(ctx, logoX, logoY, logoSize);
  }

  // Text Typography
  const textLeftX = bx + iconAreaWidth + bw * 0.03;
  const maxTextWidth = bw - (iconAreaWidth + bw * 0.06);

  // Subtext (Top subtitle)
  const subFontSize = Math.max(8, Math.round(bh * 0.18));
  ctx.font = `500 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(subtext, textLeftX, by + bh * 0.35, maxTextWidth);

  // Main Brand Title
  const mainFontSize = Math.max(11, Math.round(bh * 0.36));
  ctx.font = `700 ${mainFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = textColor;
  ctx.fillText(mainTitle, textLeftX, by + bh * 0.68, maxTextWidth);

  ctx.restore();
}
