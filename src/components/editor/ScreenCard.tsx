import { useCallback, useRef, useEffect, useState, memo } from "react";
import { Trash2, Copy, ArrowUp, ArrowDown, Lock, RefreshCw, GripHorizontal, AlignCenter, AlignJustify, Edit3, Upload } from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";
import { useLanguageStore } from "@/lib/store/languageStore";
import { toast } from "@/lib/store/toastStore";
import {
  Screen, ScreenSet, TextLayer, ShapeLayer,
  ImageLayer, ScreenshotLayer, FlagLayer, Layer
} from "@/lib/types";
import { ALL_DEVICES, IOS_DEVICES, ANDROID_DEVICES, COLOR_HEX_MAP, isTabletDevice } from "@/lib/devices";
import { cn, loadGoogleFont, drawBackgroundToCanvas } from "@/lib/utils";
import { getTextGradientPreset } from "@/lib/textPresets";
import { Draggable } from "@hello-pangea/dnd";
import { ScreenVerticalMenu } from "@/components/editor/ScreenVerticalMenu";
import {
  loadImage,
  parseColorStr,
  drawPlaceholder,
  drawWrappedText,
  drawAutoFitText,
  ResizeOverlay,
  ScreenContextMenu,
  InlineTextEditor,
  useScreenDragDrop,
  useScreenDropzone,
} from "@/components/editor/card";

interface ScreenCardProps {
  screen: Screen;
  screenSet: ScreenSet;
  index: number;
  /** When true, screenshot zones are hidden to focus on text/design */
  hideScreenshots?: boolean;
}

const BASE_CARD_WIDTH = 300;

export const ScreenCard = memo(function ScreenCard({ screen, screenSet, index, hideScreenshots }: ScreenCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(screen.caption ?? "");
  const captionRef = useRef<HTMLInputElement>(null);
  // Text inline edit state
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Right-click context menu
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; layerId: string } | null>(null);

  const [fontsLoaded, setFontsLoaded] = useState(0);

  // ── Preload Fonts ─────────────────────────────────────────────────────────
  useEffect(() => {
    let hasFonts = false;
    const fontPromises: Promise<void>[] = [];
    for (const layer of screen.layers) {
      if (layer.type === "text" && (layer as TextLayer).fontFamily) {
        fontPromises.push(loadGoogleFont((layer as TextLayer).fontFamily));
        hasFonts = true;
      }
    }
    if (hasFonts) {
      Promise.all(fontPromises).then(() => {
        // Redraw will be triggered automatically if we can force a canvas update,
        // but since `draw` is defined below, we'll just rely on the component re-rendering
        // if fonts load. Actually, `document.fonts.load` fires an event.
        // Let's use a local state to trigger a re-render once fonts are loaded.
        setFontsLoaded(prev => prev + 1);
      });
    }
  }, [screen.layers]);


  const {
    activeSetId, activeScreenId, activeLayerId, selectedLayerIds,
    setActiveLayer, toggleSelectLayer, clearSelection,
    deleteScreen, deleteLayer, duplicateLayer, updateLayer, updateScreen,
    lockLayer, bringForward, sendBackward, zoom,
  } = useEditorStore();
  const { activeLang } = useLanguageStore();

  const saveCaption = () => {
    setEditingCaption(false);
    updateScreen(screenSet.id, screen.id, { caption: captionDraft.trim() });
    useEditorStore.getState().recordHistory();
  };

  const isActiveScreen = activeSetId === screenSet.id && activeScreenId === screen.id;
  const CARD_DISPLAY_WIDTH = Math.round(BASE_CARD_WIDTH * zoom);
  const scale = CARD_DISPLAY_WIDTH / screen.width;
  const displayH = Math.round(screen.height * scale);

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = screen.width;
    const H = screen.height;
    
    const dpr = window.devicePixelRatio || 1;
    const displayW = CARD_DISPLAY_WIDTH;
    const displayH = (H / W) * displayW;
    const targetW = Math.round(displayW * dpr);
    const targetH = Math.round(displayH * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const scale = targetW / W;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.scale(scale, scale);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // ── Background ────────────────────────────────────────────────────────────
    const bg = screen.background;
    let bgImg: HTMLImageElement | null = null;
    if (bg.type === "image" && bg.imageUrl) {
      try {
        bgImg = await loadImage(bg.imageUrl);
      } catch (err) {
        console.warn("[ScreenCard] Failed to load background image:", err);
      }
    }
    drawBackgroundToCanvas(ctx, bg, W, H, bgImg);

    // ── Pattern overlay ────────────────────────────────────────────────────────
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
        // Pseudo-noise using random dots
        const seed = 42.123;
        const pseudo = (n: number) => {
          const x = Math.sin(n + seed) * 10000;
          return x - Math.floor(x);
        };
        // Reduce the number of dots for better performance (0.01 instead of 0.03)
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

    // ── Layers ────────────────────────────────────────────────────────────────
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

      // ── TEXT ──────────────────────────────────────────────────────────────
      if (layer.type === "text") {
        const tl = layer as TextLayer;

        // i18n: resolve localized content for active language
        const rawContent =
          activeLang !== "en" && screen.localizations?.[activeLang]?.[tl.id]?.content != null
            ? screen.localizations[activeLang][tl.id].content!
            : tl.content;

        // Apply textCase
        let displayContent = rawContent;
        if (tl.textCase === "uppercase") displayContent = displayContent.toUpperCase();
        else if (tl.textCase === "lowercase") displayContent = displayContent.toLowerCase();
        else if (tl.textCase === "capitalize")
          displayContent = displayContent.replace(/\b\w/g, (c) => c.toUpperCase());

        ctx.font = `${tl.fontWeight} ${tl.fontSize}px "${tl.fontFamily}", -apple-system, sans-serif`;
        ctx.textAlign = tl.align as CanvasTextAlign;
        if (tl.letterSpacing) ctx.letterSpacing = `${tl.letterSpacing}px`;

        const words = displayContent.split(/\s+/);
        let currentLine = "";
        const lines: string[] = [];

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine + words[i] + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > tl.width && i > 0) {
            lines.push(currentLine.trim());
            currentLine = words[i] + " ";
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine.trim());

        // Also split by explicit newlines if the user typed them
        const finalLines = lines.flatMap(line => line.split("\n"));
        const lineH = tl.fontSize * (tl.lineHeight ?? 1.25);
        const textActualH = Math.max(tl.fontSize, finalLines.length * lineH);

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
          ctx.fillStyle = tl.color;
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


        // Highlight background
        if (tl.highlight) {
          const { color, paddingX, paddingY, cornerRadius } = tl.highlight;
          const totalH = finalLines.length * lineH;
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

        finalLines.forEach((line, i) => {
          const yPos = tl.y + tl.fontSize + i * lineH;
          // Stroke (outline)
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

        // Indicator for missing translation
        if (activeLang !== "en" && !screen.localizations?.[activeLang]?.[tl.id]?.content) {
          ctx.strokeStyle = "rgba(251,191,36,0.6)";
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(tl.x - 4, tl.y - 4, tl.width + 8, tl.fontSize * lines.length * (tl.lineHeight ?? 1.25) + 8);
          ctx.setLineDash([]);
        }
      }

      // ── SCREENSHOT ZONE ───────────────────────────────────────────────────
      else if (layer.type === "screenshot") {
        const sl = layer as ScreenshotLayer;
        const mockup = screenSet.mockup;
        const hasFrame = sl.showDeviceFrame && mockup?.showFrame !== false;
        
        // Find the active device model, fallback to correct store default
        const targetDeviceId = screenSet.deviceId || mockup?.device;
        const defaultDevice = screenSet.store === "android" ? ANDROID_DEVICES[0] : IOS_DEVICES[0];
        const device = ALL_DEVICES.find((d) => d.id === targetDeviceId) || defaultDevice;

        // 1. Calculate aspect-ratio perfect physical bounds
        const physicalW = device.width;
        const physicalH = device.height;
        // Assume device body is proportionally wider/taller than screen if it has a frame
        const bezelRatio = hasFrame ? (device.bezelRatio ?? 0.0373) : 0;
        const rawBezel = physicalW * bezelRatio;
        
        const frameW = physicalW + rawBezel * 2;
        const frameH = physicalH + rawBezel * 2;
        
        // Scale to fit exactly inside sl bounds
        const scale = Math.min(sl.width / frameW, sl.height / frameH);
        const w = frameW * scale;
        const h = frameH * scale;
        
        // Center inside sl bounds
        const x = sl.x + (sl.width - w) / 2;
        const y = sl.y + (sl.height - h) / 2;

        const defaultDeviceR = device.cornerRadius * scale + (hasFrame ? rawBezel * scale : 0);
        const r = (mockup?.squircle || hasFrame) ? defaultDeviceR : (sl.cornerRadius || 0);

        const bezel = hasFrame ? rawBezel * scale : 0;
        const innerX = x + bezel;
        const innerY = y + bezel;
        const innerW = w - bezel * 2;
        const innerH = h - bezel * 2;
        const innerR = Math.max(0, r - bezel);

        // When hideScreenshots is active, show a subtle dimmed placeholder instead
        if (hideScreenshots) {
          ctx.beginPath();
          if (r > 0) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          ctx.fillStyle = "rgba(99,102,241,0.08)";
          ctx.fill();
          ctx.strokeStyle = "rgba(99,102,241,0.25)";
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
          continue;
        }

        // Apply shadow parameters
        const applyShadow = () => {
          if (mockup?.showShadow === true) {
            const preset = mockup.shadowPreset || "soft-ambient";
            if (preset === "none") {
              ctx.shadowBlur = 0;
              ctx.shadowColor = "transparent";
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            } else if (preset === "floating-studio") {
              ctx.shadowBlur = 110 * scale;
              ctx.shadowColor = "rgba(0,0,0,0.48)";
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 38 * scale;
            } else if (preset === "hard-isometric") {
              ctx.shadowBlur = 0;
              ctx.shadowColor = "rgba(0,0,0,0.38)";
              ctx.shadowOffsetX = 24 * scale;
              ctx.shadowOffsetY = 28 * scale;
            } else if (preset === "neon-glow") {
              ctx.shadowBlur = 95 * scale;
              ctx.shadowColor = mockup.shadowGlowColor || "rgba(99,102,241,0.65)";
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            } else {
              // soft-ambient (default)
              ctx.shadowBlur = (sl.shadow?.blur ?? 75) * scale;
              ctx.shadowColor = sl.shadow?.color ?? "rgba(0,0,0,0.28)";
              ctx.shadowOffsetX = (sl.shadow?.offsetX ?? 0) * scale;
              ctx.shadowOffsetY = (sl.shadow?.offsetY ?? 18) * scale;
            }
          }
        };

        const rawColorName = mockup?.color || "black";
        const baseHex = COLOR_HEX_MAP[rawColorName.toLowerCase()] || "#1a1a1c";

        // 1. Draw outer device frame OR minimal shadow
        if (hasFrame) {
          applyShadow();
          if (mockup.frameType === "titanium") {
            // ── Titanium Precision ──
            if (device.buttons) {
               device.buttons.forEach((btn: any) => {
                  const btnY = y + h * btn.yOffset;
                  const btnH = h * btn.height;
                  const btnW = (btn.thickness || 1) * (Math.min(w, h) * 0.009);
                  const btnRadius = btnW / 2;
                  const btnGrad = ctx.createLinearGradient(x, btnY, x, btnY + btnH);
                  btnGrad.addColorStop(0, "#d1d5db");
                  btnGrad.addColorStop(0.5, "#6b7280");
                  btnGrad.addColorStop(1, "#374151");
                  ctx.fillStyle = btnGrad;
                  const btnX = btn.side === "left" ? x - btnW + 1 : x + w - 1;
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

            // Multi-stop brushed titanium gradient rim
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

            // Chamfered micro-bevel groove
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x + 2, y + 2, w - 4, h - 4, Math.max(r - 2, 0));
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.stroke();

            // Inner glass shadow
            ctx.beginPath();
            if (r > 0) ctx.roundRect(innerX - 1, innerY - 1, innerW + 2, innerH + 2, innerR);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(0,0,0,0.9)";
            ctx.stroke();

          } else if (mockup.frameType === "clay") {
            // ── Clay Matte ──
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x - 2, y - 2, w + 4, h + 4, r + 2);
            else ctx.rect(x - 2, y - 2, w + 4, h + 4);
            ctx.fillStyle = baseHex;
            ctx.fill();

            // Soft tactile ambient clay lighting
            const clayGrad = ctx.createLinearGradient(x, y, x, y + h);
            clayGrad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
            clayGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.05)");
            clayGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.08)");
            clayGrad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
            ctx.fillStyle = clayGrad;
            ctx.fill();

            // Soft clay outer pill outline
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x - 2, y - 2, w + 4, h + 4, r + 2);
            ctx.lineWidth = bezel * 0.35;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.stroke();

            // Inner soft recession bevel
            ctx.beginPath();
            if (r > 0) ctx.roundRect(innerX, innerY, innerW, innerH, innerR);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.stroke();

          } else if (mockup.frameType === "glass") {
            // ── Liquid Glass (Frosted Glassmorphism) ──
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x, y, w, h, r);
            else ctx.rect(x, y, w, h);
            
            const glassGrad = ctx.createLinearGradient(x, y, x + w, y + h);
            glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
            glassGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
            glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.18)");
            ctx.fillStyle = glassGrad;
            ctx.fill();

            // Iridescent glass refractive rim
            const rimGrad = ctx.createLinearGradient(x, y, x + w, y + h);
            rimGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
            rimGrad.addColorStop(0.3, "rgba(147, 197, 253, 0.5)");
            rimGrad.addColorStop(0.7, "rgba(216, 180, 254, 0.5)");
            rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.75)");
            ctx.lineWidth = bezel * 0.4;
            ctx.strokeStyle = rimGrad;
            ctx.stroke();

            // Corner specular glints
            if (r > 0) {
              ctx.beginPath();
              ctx.arc(x + r, y + r, r * 0.8, Math.PI, 1.5 * Math.PI);
              ctx.lineWidth = 3;
              ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
              ctx.stroke();
            }

          } else if (mockup.frameType === "neon") {
            // ── Neon Glow ──
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x, y, w, h, r);
            else ctx.rect(x, y, w, h);
            ctx.fillStyle = "#09090e";
            ctx.fill();

            // Multi-color neon glow border
            const neonGrad = ctx.createLinearGradient(x, y, x + w, y + h);
            neonGrad.addColorStop(0, "#a855f7");
            neonGrad.addColorStop(0.35, "#3b82f6");
            neonGrad.addColorStop(0.7, "#06b6d4");
            neonGrad.addColorStop(1, "#ec4899");
            ctx.lineWidth = bezel * 0.4;
            ctx.strokeStyle = neonGrad;
            ctx.stroke();

            // Glowing inner border
            ctx.beginPath();
            if (r > 0) ctx.roundRect(innerX - 1, innerY - 1, innerW + 2, innerH + 2, innerR);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#a855f7";
            ctx.stroke();

          } else if (mockup.frameType === "wireframe") {
            // ── Minimal Wireframe ──
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x, y, w, h, r);
            else ctx.rect(x, y, w, h);
            
            const isDarkBg = baseHex === "#ffffff" || baseHex === "#f5f5f7";
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = isDarkBg ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.85)";
            ctx.stroke();

          } else if (mockup.frameType === "2d") {
            // ── 2D Flat Frame ──
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x, y, w, h, r);
            else ctx.rect(x, y, w, h);

            ctx.fillStyle = baseHex;
            ctx.fill();
            
            ctx.beginPath();
            if (r > 0) ctx.roundRect(x + 2, y + 2, w - 4, h - 4, Math.max(r - 2, 0));
            else ctx.rect(x + 2, y + 2, w - 4, h - 4);
            
            const isWhite = baseHex === "#f5f5f7" || baseHex === "#ffffff" || baseHex === "#f8f8f8";
            ctx.strokeStyle = isWhite ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)";
            ctx.lineWidth = 2;
            ctx.stroke();

          } else {
            // ── 3D Realistic (Default) ──
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
                   ctx.fillStyle = "rgba(255,255,255,0.15)";
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

            const isDark = baseHex === "#1a1a1c" || baseHex === "#000000" || baseHex === "#111111" || baseHex === "#111827" || baseHex === "#2d2d2d";
            const rimGrad = ctx.createLinearGradient(x, y, x + w, y + h);
            if (isDark) {
              rimGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
              rimGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.05)");
              rimGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.8)");
              rimGrad.addColorStop(0.8, "rgba(255, 255, 255, 0.05)");
              rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");
            } else {
              rimGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
              rimGrad.addColorStop(0.2, "rgba(0, 0, 0, 0.05)");
              rimGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
              rimGrad.addColorStop(0.8, "rgba(0, 0, 0, 0.05)");
              rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.8)");
            }
            
            ctx.lineWidth = bezel * 0.4;
            ctx.strokeStyle = rimGrad;
            ctx.stroke();

            ctx.beginPath();
            if (r > 0) ctx.roundRect(innerX - 1, innerY - 1, innerW + 2, innerH + 2, innerR);
            else ctx.rect(innerX - 1, innerY - 1, innerW + 2, innerH + 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(0,0,0,0.8)";
            ctx.stroke();
            
            if (r > 0) {
              ctx.beginPath();
              ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
              ctx.lineWidth = 2;
              ctx.strokeStyle = "rgba(255,255,255,0.6)";
              ctx.stroke();
              
              ctx.beginPath();
              ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI);
              ctx.lineWidth = 1.5;
              ctx.strokeStyle = "rgba(255,255,255,0.3)";
              ctx.stroke();
            }
          }
          // Reset shadow after drawing frame
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
        } else {
          // Minimal or Borderless: Apply shadow to the image shape itself
          applyShadow();
          ctx.beginPath();
          if (innerR > 0) ctx.roundRect(innerX, innerY, innerW, innerH, innerR);
          else ctx.rect(innerX, innerY, innerW, innerH);
          ctx.fillStyle = "#ffffff";
          ctx.fill(); // Fill shadow
          
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
        }

        // Clip to inner screen rect
        ctx.save();
        ctx.beginPath();
        if (innerR > 0) {
          ctx.roundRect(innerX, innerY, innerW, innerH, innerR);
        } else {
          ctx.rect(innerX, innerY, innerW, innerH);
        }
        ctx.clip();

        let drawBaseImage: (() => void) | null = null;
        let imgObj: HTMLImageElement | null = null;

        if (sl.src) {
          try {
            imgObj = await loadImage(sl.src);
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
          } catch {
            // error loading image
          }
        }

        const drawNotch = () => {
            if (hasFrame && device.notchType !== "none") {
              ctx.fillStyle = "#000000";
              if (device.notchType === "island" && mockup.dynamicIsland !== false) {
                const islandW = innerW * 0.285;
                const islandH = innerW * 0.0887;
                const islandX = innerX + (innerW - islandW) / 2;
                const islandY = innerY + innerW * 0.025; // floating a bit lower
                
                // Top Speaker Grill
                ctx.fillStyle = "#151515";
                ctx.beginPath();
                ctx.roundRect(innerX + (innerW - innerW * 0.16) / 2, innerY - bezel * 0.4, innerW * 0.16, bezel * 0.4, 2);
                ctx.fill();

                // The main black pill
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.roundRect(islandX, islandY, islandW, islandH, islandH / 2);
                ctx.fill();
                // TrueDepth Camera (left)
                ctx.fillStyle = "#1e1e20";
                ctx.beginPath();
                ctx.arc(islandX + islandH * 0.8, islandY + islandH / 2, islandH * 0.22, 0, Math.PI * 2);
                ctx.fill();
                // Front Camera (right, slightly blueish reflection)
                ctx.fillStyle = "#293246";
                ctx.beginPath();
                ctx.arc(islandX + islandW - islandH * 0.7, islandY + islandH / 2, islandH * 0.22, 0, Math.PI * 2);
                ctx.fill();
                // Tiny reflection in front camera
                ctx.fillStyle = "rgba(255,255,255,0.25)";
                ctx.beginPath();
                ctx.arc(islandX + islandW - islandH * 0.7, islandY + islandH / 2.3, islandH * 0.08, 0, Math.PI * 2);
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
                if (isTablet) {
                  ctx.beginPath();
                  ctx.roundRect(notchX, innerY, notchW, notchH, [0, 0, 8, 8]);
                  ctx.fill();
                } else {
                  ctx.beginPath();
                  ctx.moveTo(notchX - notchH, innerY);
                  ctx.quadraticCurveTo(notchX, innerY, notchX, innerY + notchH * 0.4);
                  ctx.lineTo(notchX, innerY + notchH - notchH * 0.5);
                  ctx.quadraticCurveTo(notchX, innerY + notchH, notchX + notchH, innerY + notchH);
                  ctx.lineTo(notchX + notchW - notchH, innerY + notchH);
                  ctx.quadraticCurveTo(notchX + notchW, innerY + notchH, notchX + notchW, innerY + notchH - notchH * 0.5);
                  ctx.lineTo(notchX + notchW, innerY + notchH * 0.4);
                  ctx.quadraticCurveTo(notchX + notchW, innerY, notchX + notchW + notchH, innerY);
                  ctx.fill();
                }
              }
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

        // 2. Draw base screenshot with optional blur
        ctx.save();
        if (overlay && overlay.enabled && overlay.blurBackground) {
          const blurPx = overlay.blurAmount ?? 12;
          ctx.filter = `blur(${blurPx}px)`;
        }
        
        if (drawBaseImage) {
          drawBaseImage();
        } else {
          drawPlaceholder(ctx, innerX, innerY, innerW, innerH, sl.label);
        }
        ctx.restore();

        // 3. Draw overlay tint color (if focus overlay is enabled)
        if (overlay && overlay.enabled && overlay.overlayColor) {
          ctx.save();
          ctx.fillStyle = overlay.overlayColor;
          ctx.fillRect(innerX, innerY, innerW, innerH);
          ctx.restore();
        }

        // 4. Draw Focus Highlight Card (crisp unblurred slice with custom corner radius and border)
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

          // Shadow
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
          
          // Clip to focused card and draw crisp image
          ctx.save();
          ctx.beginPath();
          if (fRadius > 0) ctx.roundRect(innerX, fY, innerW, fH, fRadius);
          else ctx.rect(innerX, fY, innerW, fH);
          ctx.clip();
          drawBaseImage();
          ctx.restore();
          
          // Stroke border
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

        // 5. Draw Notch / Dynamic Island and Glass Reflection on top
        drawNotch();
        drawReflection();

        ctx.restore(); // END CLIP INNER (we can now draw outside the inner screen)

        // 3b. Draw Premium Subtle Border for Minimal/Borderless
        if (!hasFrame) {
            ctx.beginPath();
            if (innerR > 0) {
              ctx.roundRect(innerX, innerY, innerW, innerH, innerR);
            } else {
              ctx.rect(innerX, innerY, innerW, innerH);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(0,0,0,0.12)";
            ctx.stroke();
            // inner subtle highlight
            ctx.beginPath();
            if (innerR > 0) {
              ctx.roundRect(innerX + 1, innerY + 1, innerW - 2, innerH - 2, innerR - 1);
            } else {
              ctx.rect(innerX + 1, innerY + 1, innerW - 2, innerH - 2);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.stroke();
        }
      }

      // ── SHAPE ─────────────────────────────────────────────────────────────
      else if (layer.type === "shape") {
        const sl = layer as ShapeLayer;
        ctx.fillStyle = parseColorStr(ctx, sl.fill, sl.x, sl.y, sl.width, sl.height) as string;
        const r2 = sl.cornerRadius ?? 0;
        const cx2 = sl.x + sl.width / 2;
        const cy2 = sl.y + sl.height / 2;
        const hw  = sl.width / 2;
        const hh  = sl.height / 2;

        // Apply rotation around the shape's center
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
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
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
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
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

        } else if (sl.shape === "arrow-right" || sl.shape === "arrowRight") {
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
            const badgeImg = await loadImage(badgeSrc);
            ctx.drawImage(badgeImg, sl.x, sl.y, sl.width, sl.height);
          } catch (e) {
            // Fallback rendering
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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Gold stars + rating text
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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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

          // Card shadow / backdrop
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, br);
          ctx.fillStyle = sl.fill ?? "rgba(255,255,255,0.96)";
          ctx.fill();
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

          // Left App Icon (Rounded squircle container)
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

          // Icon emoji / glyph inside
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `${iconSize * 0.52}px serif`;
          ctx.fillText("⚡", iconX + iconSize / 2, iconY + iconSize / 2 + 1);

          // Header line (App Name · time)
          const textLeft = iconX + iconSize + bh * 0.18;
          const maxTextW = bw - (textLeft - bx) - bh * 0.18;

          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.font = `600 ${bh * 0.16}px "Inter", sans-serif`;
          ctx.fillStyle = "#64748B";
          ctx.fillText(sl.subtext || "SnapFrame · now", textLeft, by + bh * 0.33);

          // Main Message line
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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

          // Search Icon (Left)
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `${bh * 0.38}px serif`;
          ctx.fillText("🔍", bx + bh * 0.42, by + bh / 2);

          // Placeholder Text (Left aligned after icon)
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.font = `500 ${bh * 0.30}px "Inter", sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillText(sl.text || "Search songs, artists, albums...", bx + bh * 0.85, by + bh / 2);

          // Mic icon (Right)
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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

          // Stars
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `700 ${bh * 0.16}px "Inter", sans-serif`;
          ctx.fillStyle = "#FBBF24";
          ctx.fillText("★★★★★", bx + bw / 2, by + bh * 0.20);

          // Quote
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

          // Author
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
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

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

          // Card Background
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, br);
          ctx.fillStyle = sl.fill ?? (isGlass ? "rgba(255,255,255,0.14)" : "rgba(10,14,23,0.90)");
          ctx.fill();
          if (sl.stroke && sl.strokeWidth) {
            ctx.strokeStyle = sl.stroke;
            ctx.lineWidth = sl.strokeWidth;
            ctx.stroke();
          }

          // Top Accent Pill / Badge
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

          // Heading
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

          // Subtitle
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

        // Restore context after rotation
        if (shapeDeg !== 0) {
          ctx.restore();
        }
      }

      // ── FLAG / EMOJI / BRAND ─────────────────────────────────────────────
      else if (layer.type === "flag" || layer.type === "emoji" || layer.type === "brand") {
        const fl = layer as FlagLayer;
        ctx.font = `${layer.height * 0.75}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fl.content, layer.x + layer.width / 2, layer.y + layer.height / 2);
      }

      // ── IMAGE ─────────────────────────────────────────────────────────────
      else if (layer.type === "image") {
        const il = layer as ImageLayer;
        if (il.src) {
          try {
            const img = await loadImage(il.src);
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

      // ── CHARACTER ─────────────────────────────────────────────────────────
      else if (layer.type === "character") {
        const cl = layer as import("@/lib/types").CharacterLayer;
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

            const img = await loadImage(imgUrl);
            ctx.drawImage(img, cl.x, cl.y, cl.width, cl.height);

            if (needsRevoke) {
              URL.revokeObjectURL(imgUrl);
            }

            // Tint color overlay
            if (cl.tintColor) {
              ctx.globalCompositeOperation = "multiply";
              ctx.fillStyle = cl.tintColor;
              ctx.fillRect(cl.x, cl.y, cl.width, cl.height);
              ctx.globalCompositeOperation = "source-over";
            }
          } catch (err) {
            console.error("Failed to render character:", err);
            // Fallback placeholder
            ctx.fillStyle = "rgba(99,102,241,0.1)";
            ctx.fillRect(cl.x, cl.y, cl.width, cl.height);
            ctx.strokeStyle = "rgba(99,102,241,0.4)";
            ctx.lineWidth = 2;
            ctx.strokeRect(cl.x, cl.y, cl.width, cl.height);
          }
        }
      }

      // ── Selection outline ─────────────────────────────────────────────────
      if (isActiveScreen && layer.id === activeLayerId) {
        ctx.restore(); // restore before drawing outline (no clip)
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 6;
        ctx.setLineDash([14, 6]);
        ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8);
        ctx.setLineDash([]);
        // Corner handles
        ctx.fillStyle = "#6366f1";
        [[layer.x - 4, layer.y - 4], [layer.x + layer.width - 4, layer.y - 4],
         [layer.x - 4, layer.y + layer.height - 4], [layer.x + layer.width - 4, layer.y + layer.height - 4]
        ].forEach(([hx, hy]) => ctx.fillRect(hx, hy, 8, 8));
      }

      ctx.restore();
    }
  }, [screen, isActiveScreen, activeLayerId, activeLang, hideScreenshots, screenSet.mockup]);

  useEffect(() => {
    const animId = requestAnimationFrame(() => {
      draw();
    });
    return () => cancelAnimationFrame(animId);
  }, [draw, fontsLoaded]);

  const activeLayer = screen.layers.find((l) => l.id === activeLayerId);
  const isScreenshotActive = isActiveScreen && activeLayer?.type === "screenshot";

  const {
    snapGuides,
    hitTest,
    getCanvasCoords,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleContextMenu,
    handleResizeStart,
  } = useScreenDragDrop({
    screen,
    screenSet,
    canvasRef,
    scale,
    activeLayer,
    isActiveScreen,
    setEditingLayerId,
    setEditText,
    setCtxMenu,
  });

  const {
    isDraggingOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useScreenDropzone({
    screen,
    screenSet,
    getCanvasCoords,
    hitTest,
  });

  return (
    <Draggable draggableId={screen.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-screen-card="true"
          data-screen-id={screen.id}
          className="shrink-0 flex flex-col gap-1.5 group cursor-default"
          style={{
            width: CARD_DISPLAY_WIDTH,
            ...provided.draggableProps.style,
          }}
        >
          {/* Header: index + caption editable + delete */}
      <div className="flex items-center gap-1.5 px-0.5">
        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground transition-colors" title="Drag to reorder screen">
          <GripHorizontal className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] text-foreground/80 font-mono font-semibold w-4 shrink-0">{index + 1}</span>

        {/* Caption — editable inline */}
        {editingCaption ? (
          <input
            ref={captionRef}
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value)}
            onBlur={saveCaption}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); saveCaption(); }
              if (e.key === "Escape") { setEditingCaption(false); setCaptionDraft(screen.caption ?? ""); }
            }}
            className="flex-1 text-[11px] font-medium bg-transparent border-0 border-b border-primary/60 outline-none text-foreground py-0 px-0.5 min-w-0"
            placeholder="Add caption…"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCaptionDraft(screen.caption ?? "");
              setEditingCaption(true);
              setTimeout(() => captionRef.current?.focus(), 0);
            }}
            className="flex-1 text-left text-[11px] text-muted-foreground hover:text-foreground font-medium truncate transition-colors px-0.5 py-0"
            title="Click to edit caption"
          >
            {screen.caption || <span className="italic opacity-60">Caption…</span>}
          </button>
        )}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); deleteScreen(screenSet.id, screen.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Canvas container */}
      <div
        className={cn(
          "relative rounded-2xl transition-all duration-150",
          isActiveScreen
            ? "ring-2 ring-primary shadow-lg shadow-primary/20"
            : "ring-1 ring-border/60 hover:ring-primary/30 hover:shadow-md"
        )}
        style={{ width: CARD_DISPLAY_WIDTH, height: displayH }}
      >
        <div className="w-full h-full rounded-2xl overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={screen.width}
            height={screen.height}
            style={{ width: CARD_DISPLAY_WIDTH, height: displayH, display: "block" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(isScreenshotActive ? "cursor-move" : "cursor-pointer", isDraggingOver ? "opacity-75" : "")}
          />

        {/* Magnetic Smart Snapping Guide Lines */}
        {snapGuides?.x && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-pink-500 shadow-md shadow-pink-500/50 z-20 pointer-events-none" />
        )}
        {snapGuides?.y && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-pink-500 shadow-md shadow-pink-500/50 z-20 pointer-events-none" />
        )}

        {/* Resize handles overlay — shown when layer is selected */}
        {isActiveScreen && activeLayer && !editingLayerId && (
          <ResizeOverlay
            layer={activeLayer}
            scale={scale}
            onResizeStart={handleResizeStart}
          />
        )}

        {/* Inline text edit overlay — shown on double-click */}
        {isActiveScreen && editingLayerId && (
          <InlineTextEditor
            editingLayerId={editingLayerId}
            editText={editText}
            screen={screen}
            screenSet={screenSet}
            scale={scale}
            cardDisplayWidth={CARD_DISPLAY_WIDTH}
            displayHeight={displayH}
            onTextChange={setEditText}
            onClose={() => setEditingLayerId(null)}
          />
        )}
        </div>

        {/* Right-click context menu */}
        {ctxMenu && isActiveScreen && (
          <ScreenContextMenu
            ctxMenu={ctxMenu}
            screen={screen}
            screenSet={screenSet}
            onClose={() => setCtxMenu(null)}
            onStartTextEdit={(id: string, content: string) => {
              setEditingLayerId(id);
              setEditText(content);
            }}
          />
        )}

        {/* Vertical Screen Context Menu (1-3 Mockups + Background) - only visible when the screen/frame itself is selected, NOT when a layer inside is selected */}
        {isActiveScreen && !activeLayerId && (!selectedLayerIds || selectedLayerIds.length === 0) && (
          <ScreenVerticalMenu screen={screen} screenSet={screenSet} />
        )}
      </div>

      {/* Screen name */}
      <p className="text-[11px] text-center text-muted-foreground font-medium truncate mt-0.5">{screen.name}</p>
        </div>
      )}
    </Draggable>
  );
});




