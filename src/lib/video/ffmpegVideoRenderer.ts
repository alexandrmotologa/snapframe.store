import {
  Screen,
  ScreenSet,
  VideoRenderConfig,
  VideoRenderProgress,
} from "@/lib/types";

export interface FrameInterpolation {
  currentSlideIndex: number;
  nextSlideIndex: number;
  isTransitioning: boolean;
  transitionProgress: number; // 0 to 1
  easeProgress: number; // 0 to 1 (cubic ease)
}

export interface RenderLosslessVideoOptions {
  screens: Screen[];
  screenSet: ScreenSet;
  config: VideoRenderConfig;
  onProgress?: (progress: VideoRenderProgress) => void;
  signal?: AbortSignal;
  renderFrameFn?: (
    canvas: HTMLCanvasElement,
    screen: Screen,
    set: ScreenSet,
    options?: Record<string, unknown>
  ) => Promise<void>;
}

// ── Singleton FFmpeg Instance Holder ──
let ffmpegInstance: unknown = null;
let ffmpegLoadingPromise: Promise<unknown> | null = null;

/**
 * Lazily loads and initializes the @ffmpeg/ffmpeg WebAssembly singleton
 */
export async function getFFmpegInstance(): Promise<any> {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoadingPromise) return ffmpegLoadingPromise;

  ffmpegLoadingPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const instance = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

    await instance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegInstance = instance;
    return instance;
  })();

  try {
    return await ffmpegLoadingPromise;
  } finally {
    ffmpegLoadingPromise = null;
  }
}

/**
 * Resets the singleton instance (useful for testing or error recovery)
 */
export function resetFFmpegInstance(): void {
  ffmpegInstance = null;
  ffmpegLoadingPromise = null;
}

/**
 * Calculates total frames following the plan's exact formula:
 * F = (N * D_slide + (N - 1) * D_trans) * FPS
 */
export function calculateTotalFrames(
  slideCount: number,
  durationPerSlideSeconds: number,
  transitionDurationSeconds: number,
  fps: number,
  transitionStyle: "slide" | "fade" | "cut" = "slide"
): number {
  if (slideCount <= 0) return 0;
  if (slideCount === 1) {
    return Math.max(1, Math.round(durationPerSlideSeconds * fps));
  }
  const effectiveTransSec = transitionStyle === "cut" ? 0 : transitionDurationSeconds;
  const totalSeconds =
    slideCount * durationPerSlideSeconds + (slideCount - 1) * effectiveTransSec;
  return Math.max(1, Math.round(totalSeconds * fps));
}

/**
 * Maps a discrete frame index to slide positions and transition interpolation
 */
export function getFrameInterpolation(
  frameIndex: number,
  totalFrames: number,
  slideCount: number,
  durationPerSlideSeconds: number,
  transitionDurationSeconds: number,
  fps: number,
  transitionStyle: "slide" | "fade" | "cut" = "slide"
): FrameInterpolation {
  if (slideCount <= 1) {
    return {
      currentSlideIndex: 0,
      nextSlideIndex: 0,
      isTransitioning: false,
      transitionProgress: 0,
      easeProgress: 0,
    };
  }

  const effectiveTrans = transitionStyle === "cut" ? 0 : transitionDurationSeconds;
  const stepDuration = durationPerSlideSeconds + effectiveTrans;
  const currentTime = frameIndex / fps;

  // Check if we reached or exceeded the last slide
  const lastSlideStartTime = (slideCount - 1) * stepDuration;
  if (currentTime >= lastSlideStartTime) {
    return {
      currentSlideIndex: slideCount - 1,
      nextSlideIndex: slideCount - 1,
      isTransitioning: false,
      transitionProgress: 0,
      easeProgress: 0,
    };
  }

  const currentIndex = Math.min(
    slideCount - 2,
    Math.floor(currentTime / stepDuration)
  );
  const timeInStep = currentTime - currentIndex * stepDuration;

  if (timeInStep < durationPerSlideSeconds || effectiveTrans <= 0) {
    // Static hold time on current slide
    return {
      currentSlideIndex: currentIndex,
      nextSlideIndex: currentIndex,
      isTransitioning: false,
      transitionProgress: 0,
      easeProgress: 0,
    };
  }

  // Active transition to next slide
  const transTime = timeInStep - durationPerSlideSeconds;
  const rawProgress = Math.min(1, Math.max(0, transTime / effectiveTrans));
  // Smooth cubic ease: p * p * (3 - 2 * p)
  const easeProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);

  return {
    currentSlideIndex: currentIndex,
    nextSlideIndex: currentIndex + 1,
    isTransitioning: true,
    transitionProgress: Number(rawProgress.toFixed(4)),
    easeProgress: Number(easeProgress.toFixed(4)),
  };
}

/**
 * Builds the exact broadcast-grade FFmpeg CLI arguments
 */
export function buildFFmpegRenderArgs(
  config: VideoRenderConfig,
  inputPattern = "frame_%04d.png",
  outputFilename = "output.mp4"
): string[] {
  const args = [
    "-framerate",
    String(config.fps),
    "-i",
    inputPattern,
    "-c:v",
    config.codec || "libx264",
    "-pix_fmt",
    "yuv420p",
  ];

  if (config.bitrate) {
    args.push("-b:v", config.bitrate);
  } else {
    args.push("-crf", "18");
  }

  args.push("-preset", "medium", "-movflags", "+faststart", outputFilename);
  return args;
}

/**
 * Standardized progress builder across pipeline phases
 */
export function calculateProgress(
  phase: VideoRenderProgress["phase"],
  current: number,
  total: number,
  customMessage?: string
): VideoRenderProgress {
  const safeTotal = Math.max(1, total);
  const ratio = Math.min(1, Math.max(0, current / safeTotal));

  let percent = 0;
  let defaultMessage = "";

  switch (phase) {
    case "rendering_canvases":
      // First 60% of total export pipeline
      percent = Math.round(ratio * 60);
      defaultMessage = `Rendering canvas frames (${current}/${total})...`;
      break;
    case "encoding_ffmpeg":
      // 60% to 95%
      percent = 60 + Math.round(ratio * 35);
      defaultMessage = `Encoding broadcast video (${Math.round(ratio * 100)}%)...`;
      break;
    case "finalizing":
      // 95% to 100%
      percent = 95 + Math.round(ratio * 5);
      defaultMessage = "Packaging final MP4 container...";
      break;
  }

  return {
    phase,
    currentFrame: current,
    totalFrames: total,
    percent,
    message: customMessage || defaultMessage,
  };
}

/**
 * Main Lossless Video Rendering Pipeline via WebAssembly FFmpeg
 */
export async function renderLosslessVideoWithFFmpeg(
  options: RenderLosslessVideoOptions
): Promise<Blob> {
  const { screens, screenSet, config, onProgress, signal, renderFrameFn } = options;

  if (screens.length === 0) {
    throw new Error("Cannot render video without screens.");
  }

  if (signal?.aborted) {
    throw new DOMException("Render aborted by user.", "AbortError");
  }

  // 1. Dynamic import of renderScreenToCanvas if not injected
  let renderScreen = renderFrameFn;
  if (!renderScreen) {
    const mod = await import("@/lib/renderScreenToCanvas");
    renderScreen = mod.renderScreenToCanvas;
  }

  const { fetchFile } = await import("@ffmpeg/util");

  onProgress?.(
    calculateProgress("rendering_canvases", 0, screens.length, "Preparing master slide buffers...")
  );

  // 2. Pre-render all slides to high-resolution master canvases
  const masterCanvases: HTMLCanvasElement[] = [];
  const exportScale = config.width >= 1200 ? 1 : 0.75;

  for (let i = 0; i < screens.length; i++) {
    if (signal?.aborted) {
      throw new DOMException("Render aborted by user.", "AbortError");
    }

    const c = document.createElement("canvas");
    c.width = config.width;
    c.height = config.height;

    await renderScreen(c, screens[i], screenSet, {
      scale: exportScale,
      isExport: true,
    });

    masterCanvases.push(c);
  }

  // 3. Initialize/retrieve singleton FFmpeg engine
  onProgress?.(
    calculateProgress("rendering_canvases", 0, 100, "Initializing WebAssembly FFmpeg engine...")
  );

  const ffmpeg = await getFFmpegInstance();

  // 4. Calculate total frames & composite timeline
  const totalFrames = calculateTotalFrames(
    screens.length,
    config.durationPerSlideSeconds,
    config.transitionDurationSeconds,
    config.fps,
    config.transitionStyle
  );

  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width = config.width;
  compositeCanvas.height = config.height;
  const ctx = compositeCanvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for frame compositing.");
  }

  const generatedFiles: string[] = [];

  try {
    for (let frame = 0; frame < totalFrames; frame++) {
      if (signal?.aborted) {
        throw new DOMException("Render aborted by user.", "AbortError");
      }

      const interp = getFrameInterpolation(
        frame,
        totalFrames,
        screens.length,
        config.durationPerSlideSeconds,
        config.transitionDurationSeconds,
        config.fps,
        config.transitionStyle
      );

      const currentCanvas = masterCanvases[interp.currentSlideIndex];
      const nextCanvas = masterCanvases[interp.nextSlideIndex];

      // Draw background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, config.width, config.height);

      if (!interp.isTransitioning || config.transitionStyle === "cut") {
        ctx.globalAlpha = 1;
        ctx.drawImage(currentCanvas, 0, 0, config.width, config.height);
      } else if (config.transitionStyle === "slide") {
        const offsetX = interp.easeProgress * config.width;
        ctx.drawImage(currentCanvas, -offsetX, 0, config.width, config.height);
        if (nextCanvas) {
          ctx.drawImage(nextCanvas, config.width - offsetX, 0, config.width, config.height);
        }
      } else if (config.transitionStyle === "fade") {
        ctx.globalAlpha = 1;
        ctx.drawImage(currentCanvas, 0, 0, config.width, config.height);
        if (nextCanvas) {
          ctx.globalAlpha = interp.easeProgress;
          ctx.drawImage(nextCanvas, 0, 0, config.width, config.height);
          ctx.globalAlpha = 1;
        }
      }

      // Convert canvas to PNG blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        compositeCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error(`Failed to convert frame ${frame} to blob`));
        }, "image/png");
      });

      const frameFilename = `frame_${String(frame).padStart(4, "0")}.png`;
      const frameData = await fetchFile(blob);
      await ffmpeg.writeFile(frameFilename, frameData);
      generatedFiles.push(frameFilename);

      onProgress?.(
        calculateProgress("rendering_canvases", frame + 1, totalFrames)
      );
    }

    // 5. Encode with FFmpeg
    onProgress?.(
      calculateProgress("encoding_ffmpeg", 0, 100, "Encoding Lossless H.264 Video...")
    );

    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      onProgress?.(
        calculateProgress(
          "encoding_ffmpeg",
          Math.round(progress * 100),
          100,
          `Encoding Lossless H.264 Video (${Math.round(progress * 100)}%)...`
        )
      );
    });

    const outputFilename = "output.mp4";
    const ffmpegArgs = buildFFmpegRenderArgs(config, "frame_%04d.png", outputFilename);
    await ffmpeg.exec(ffmpegArgs);

    // 6. Finalize and Read Result
    onProgress?.(calculateProgress("finalizing", 98, 100, "Extracting video payload..."));

    const outputData = await ffmpeg.readFile(outputFilename);
    const rawBytes =
      outputData instanceof Uint8Array
        ? outputData
        : new Uint8Array(outputData as unknown as ArrayBuffer);

    const cleanBuffer = new ArrayBuffer(rawBytes.byteLength);
    new Uint8Array(cleanBuffer).set(rawBytes);
    const resultBlob = new Blob([cleanBuffer], { type: "video/mp4" });

    // Cleanup virtual filesystem
    try {
      await ffmpeg.deleteFile(outputFilename);
    } catch {
      // Ignore cleanup error
    }

    onProgress?.(calculateProgress("finalizing", 100, 100, "Video render complete!"));
    return resultBlob;
  } finally {
    // Ensure all temporary frame files are cleaned up from virtual memory
    for (const f of generatedFiles) {
      try {
        await ffmpeg.deleteFile(f);
      } catch {
        // Ignore individual deletion errors
      }
    }
  }
}
