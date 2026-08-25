"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Film, X, Loader2, CheckCircle2, AlertCircle,
  Play, Pause, Sparkles, Video, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store/editorStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { cn } from "@/lib/utils";
import { renderScreenToCanvas } from "@/lib/renderScreenToCanvas";
import { toast } from "@/lib/store/toastStore";

interface GifExportModalProps {
  projectId: string;
  onClose: () => void;
}

type ExportFormat = "gif" | "webm" | "mp4";
type TransitionStyle = "slide" | "fade" | "cut";
type Step = "config" | "exporting" | "done" | "error";

export function GifExportModal({ projectId, onClose }: GifExportModalProps) {
  const { screenSets } = useEditorStore();
  const { projects } = useProjectStore();
  const project = projects.find((p) => p.id === projectId);
  const appName = project?.name ?? "SnapFrame";

  const [step, setStep] = useState<Step>("config");
  const [format, setFormat] = useState<ExportFormat>("webm");
  const [transition, setTransition] = useState<TransitionStyle>("slide");
  const [fps, setFps] = useState(1.5);
  const [scale, setScale] = useState(1);
  const [selectedSet] = useState<string>(screenSets[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const cachedCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const isCancelledRef = useRef(false);

  const activeSet = screenSets.find((s) => s.id === selectedSet) || screenSets[0];
  const screens = useMemo(() => activeSet?.screens ?? [], [activeSet]);


  // Pre-render all screens to offscreen canvases for silky preview and recording
  useEffect(() => {
    let isCancelled = false;
    const renderScreens = async () => {
      if (screens.length === 0 || !activeSet) return;
      const canvases: HTMLCanvasElement[] = [];
      for (const scr of screens) {
        const c = document.createElement("canvas");
        await renderScreenToCanvas(c, scr, activeSet, { scale: 0.5, isExport: true });
        if (isCancelled) return;
        canvases.push(c);
      }
      cachedCanvasesRef.current = canvases;
    };
    renderScreens();
    return () => {
      isCancelled = true;
    };
  }, [screens, activeSet]);

  // Live preview animation loop
  useEffect(() => {
    if (!isPlayingPreview || screens.length === 0) return;

    const startTime = performance.now();
    const frameDurationMs = (1 / fps) * 1000;
    const transitionMs = transition === "cut" ? 0 : 450;

    const renderLoop = (now: number) => {
      const canvas = previewCanvasRef.current;
      const canvases = cachedCanvasesRef.current;
      if (canvas && canvases.length > 0) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const totalLoopTime = canvases.length * frameDurationMs;
          const elapsed = (now - startTime) % totalLoopTime;
          const currentIndex = Math.floor(elapsed / frameDurationMs);
          const nextIndex = (currentIndex + 1) % canvases.length;
          const timeInFrame = elapsed % frameDurationMs;

          const currentCanvas = canvases[currentIndex];
          const nextCanvas = canvases[nextIndex];

          const cw = canvas.width;
          const ch = canvas.height;

          // Clear background
          ctx.fillStyle = "#09090b";
          ctx.fillRect(0, 0, cw, ch);

          if (currentCanvas) {
            if (timeInFrame > frameDurationMs - transitionMs && transition !== "cut") {
              const progress = (timeInFrame - (frameDurationMs - transitionMs)) / transitionMs;
              const easeProgress = progress * progress * (3 - 2 * progress); // smooth cubic ease

              if (transition === "slide") {
                // Slide left
                const offsetX = easeProgress * cw;
                ctx.drawImage(currentCanvas, -offsetX, 0, cw, ch);
                if (nextCanvas) {
                  ctx.drawImage(nextCanvas, cw - offsetX, 0, cw, ch);
                }
              } else if (transition === "fade") {
                // Cross fade
                ctx.globalAlpha = 1;
                ctx.drawImage(currentCanvas, 0, 0, cw, ch);
                if (nextCanvas) {
                  ctx.globalAlpha = easeProgress;
                  ctx.drawImage(nextCanvas, 0, 0, cw, ch);
                  ctx.globalAlpha = 1;
                }
              }
            } else {
              // Steady frame
              ctx.drawImage(currentCanvas, 0, 0, cw, ch);
            }
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingPreview, fps, transition, screens.length]);

  // Export handler: WebM / MP4 Video via MediaRecorder or FFmpeg for GIF
  const handleExport = async () => {
    if (screens.length === 0 || !activeSet) return;
    setStep("exporting");
    setProgress(0);

    try {
      setStatusMsg("Rendering high-res master frames...");
      const masterCanvases: HTMLCanvasElement[] = [];
      const exportScale = scale === 2 ? 1 : 0.75;

      for (let i = 0; i < screens.length; i++) {
        const c = document.createElement("canvas");
        await renderScreenToCanvas(c, screens[i], activeSet, { scale: exportScale, isExport: true });
        masterCanvases.push(c);
        setProgress(Math.round(((i + 1) / screens.length) * 35));
      }

      if (format === "webm" || format === "mp4") {
        // Fast Lossless Video Generation via HTML5 Canvas Stream & MediaRecorder
        setStatusMsg("Recording video stream...");
        const targetW = masterCanvases[0].width;
        const targetH = masterCanvases[0].height;

        const recordCanvas = document.createElement("canvas");
        recordCanvas.width = targetW;
        recordCanvas.height = targetH;
        const rCtx = recordCanvas.getContext("2d", { alpha: false });
        if (!rCtx) throw new Error("Canvas context creation failed");

        const stream = recordCanvas.captureStream(30);
        const mimeType =
          format === "mp4" && MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
            ? "video/mp4;codecs=avc1"
            : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : "video/webm";

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 8_000_000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        const recordingComplete = new Promise<Blob>((resolve) => {
          recorder.onstop = () => {
            resolve(new Blob(chunks, { type: mimeType }));
          };
        });

        recorder.start();

        const frameDurationMs = (1 / fps) * 1000;
        const transitionMs = transition === "cut" ? 0 : 400;
        const totalDuration = masterCanvases.length * frameDurationMs;
        const fpsRate = 30;
        const totalFrames = Math.round((totalDuration / 1000) * fpsRate);

        for (let frame = 0; frame <= totalFrames; frame++) {
          if (isCancelledRef.current) {
            recorder.stop();
            return;
          }
          const currentTime = (frame / fpsRate) * 1000;
          const currentIndex = Math.min(
            masterCanvases.length - 1,
            Math.floor(currentTime / frameDurationMs)
          );
          const nextIndex = (currentIndex + 1) % masterCanvases.length;
          const timeInFrame = currentTime % frameDurationMs;

          const currentCanvas = masterCanvases[currentIndex];
          const nextCanvas = masterCanvases[nextIndex];

          rCtx.fillStyle = "#09090b";
          rCtx.fillRect(0, 0, targetW, targetH);

          if (timeInFrame > frameDurationMs - transitionMs && transition !== "cut") {
            const p = (timeInFrame - (frameDurationMs - transitionMs)) / transitionMs;
            const ease = p * p * (3 - 2 * p);

            if (transition === "slide") {
              const offsetX = ease * targetW;
              rCtx.drawImage(currentCanvas, -offsetX, 0, targetW, targetH);
              if (nextCanvas) rCtx.drawImage(nextCanvas, targetW - offsetX, 0, targetW, targetH);
            } else {
              rCtx.globalAlpha = 1;
              rCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);
              if (nextCanvas) {
                rCtx.globalAlpha = ease;
                rCtx.drawImage(nextCanvas, 0, 0, targetW, targetH);
                rCtx.globalAlpha = 1;
              }
            }
          } else {
            rCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);
          }

          // Progress update
          setProgress(35 + Math.round((frame / totalFrames) * 60));
          // Wait one frame tick
          await new Promise((r) => setTimeout(r, 1000 / fpsRate));
        }

        recorder.stop();
        const videoBlob = await recordingComplete;

        const ext = format === "mp4" && mimeType.includes("mp4") ? "mp4" : "webm";
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${appName.toLowerCase().replace(/\s+/g, "-")}-promo.${ext}`;
        a.click();
        URL.revokeObjectURL(url);

        setProgress(100);
        setStep("done");
        toast.success(`Video exported successfully (${ext.toUpperCase()})!`);
      } else {
        // GIF Export with FFmpeg
        setStatusMsg("Loading FFmpeg engine...");
        setProgress(40);

        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

        const ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress: p }) => {
          setProgress(45 + Math.round(p * 50));
        });
        ffmpeg.on("log", ({ message }) => setStatusMsg(message.slice(0, 70)));

        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });

        setStatusMsg("Writing frames...");
        for (let i = 0; i < masterCanvases.length; i++) {
          const blob = await new Promise<Blob>((res) =>
            masterCanvases[i].toBlob((b) => res(b!), "image/png")
          );
          const frameData = await fetchFile(blob);
          await ffmpeg.writeFile(`frame${String(i).padStart(3, "0")}.png`, frameData);
        }

        setStatusMsg("Encoding animated GIF palette...");
        const gifW = Math.min(masterCanvases[0].width, 640);
        await ffmpeg.exec([
          "-framerate", String(fps),
          "-i", "frame%03d.png",
          "-vf", [
            `scale=${gifW}:-1:flags=lanczos`,
            "split[s0][s1]",
            "[s0]palettegen=max_colors=256[p]",
            "[s1][p]paletteuse=dither=bayer"
          ].join(","),
          "-loop", "0",
          "output.gif",
        ]);

        setStatusMsg("Saving file...");
        const data = await ffmpeg.readFile("output.gif");
        const rawBytes = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
        const plainBuf = new ArrayBuffer(rawBytes.byteLength);
        new Uint8Array(plainBuf).set(rawBytes);
        const gifBlob = new Blob([plainBuf], { type: "image/gif" });
        const url = URL.createObjectURL(gifBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${appName.toLowerCase().replace(/\s+/g, "-")}-animated.gif`;
        a.click();
        URL.revokeObjectURL(url);

        setProgress(100);
        setStep("done");
        toast.success("Animated GIF exported successfully!");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "Unknown export error");
      setStep("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/80 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-500 border border-pink-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                Video &amp; Animated GIF Studio
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-500 border border-pink-500/30">
                  PRO
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Export animated slideshows for TikTok, Instagram Reels, and social ads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          {step === "config" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Live Preview Player */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-secondary/30 p-4 rounded-2xl border border-border/50">
                <div className="relative w-full max-w-[200px] aspect-[9/19.5] rounded-2xl overflow-hidden shadow-2xl border border-border/60 bg-black flex items-center justify-center">
                  <canvas
                    ref={previewCanvasRef}
                    width={270}
                    height={585}
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPlayingPreview((p) => !p)}
                    className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                    title={isPlayingPreview ? "Pause preview" : "Play preview"}
                  >
                    {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  Live Transition Preview
                </p>
              </div>

              {/* Right Column: Controls */}
              <div className="md:col-span-7 space-y-4">
                {/* Format Selector */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "webm", label: "WebM Video", desc: "Instant HD" },
                      { id: "mp4", label: "MP4 Video", desc: "Universal" },
                      { id: "gif", label: "Animated GIF", desc: "Looping" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id as ExportFormat)}
                        className={cn(
                          "py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer",
                          format === f.id
                            ? "border-pink-500 bg-pink-500/15 text-pink-500 dark:text-pink-400 shadow-xs ring-1 ring-pink-500/50"
                            : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <div>{f.label}</div>
                        <div className="text-[9.5px] opacity-70 font-normal">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transition Effect */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Transition Effect
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "slide", label: "Smooth Slide" },
                      { id: "fade", label: "Cross-Fade" },
                      { id: "cut", label: "Snap Cut" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTransition(t.id as TransitionStyle)}
                        className={cn(
                          "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                          transition === t.id
                            ? "border-pink-500 bg-pink-500/10 text-pink-500 dark:text-pink-400 font-semibold"
                            : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Duration / Speed */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Slide Speed (Time per screen)
                    </label>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {(1 / fps).toFixed(1)}s / screen
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { rate: 0.5, label: "2.0s" },
                      { rate: 0.8, label: "1.2s" },
                      { rate: 1.5, label: "0.7s" },
                      { rate: 2.0, label: "0.5s" },
                    ].map((item) => (
                      <button
                        key={item.rate}
                        type="button"
                        onClick={() => setFps(item.rate)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                          fps === item.rate
                            ? "border-pink-500 bg-pink-500/10 text-pink-500 dark:text-pink-400 font-semibold"
                            : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Quality &amp; Resolution
                  </label>
                  <div className="flex gap-2">
                    {[
                      { s: 1, label: "Standard HD (Fast Export)" },
                      { s: 2, label: "Master 4K (Lossless Quality)" },
                    ].map((item) => (
                      <button
                        key={item.s}
                        type="button"
                        onClick={() => setScale(item.s)}
                        className={cn(
                          "flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                          scale === item.s
                            ? "border-pink-500 bg-pink-500/10 text-pink-500 dark:text-pink-400 font-semibold"
                            : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exporting Progress */}
          {step === "exporting" && (
            <div className="py-10 space-y-5 max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Generating Your Promo Video...</h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{statusMsg}</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden border border-border/50">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-mono font-bold text-foreground">{progress}%</p>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    isCancelledRef.current = true;
                    setStep("config");
                    toast.info("Export cancelled");
                  }}
                  className="border-border/60 text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel Export
                </Button>
              </div>
            </div>
          )}

          {/* Done State */}
          {step === "done" && (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Video Ready &amp; Downloaded!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your animation has been downloaded to your computer. Ready for social media ads!
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === "error" && (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Export Failed</h3>
                <p className="text-xs text-red-400 mt-1 font-mono">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/50 bg-secondary/20 flex items-center justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={step === "exporting"}
          >
            {step === "done" ? "Close" : "Cancel"}
          </Button>
          {step === "config" && (
            <Button
              className="gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold shadow-md shadow-pink-500/20"
              onClick={handleExport}
              disabled={screens.length === 0}
            >
              <Video className="w-4 h-4" />
              Export {format.toUpperCase()} Animation
            </Button>
          )}
          {step === "error" && (
            <Button
              className="gap-2"
              onClick={() => { setStep("config"); setProgress(0); }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
