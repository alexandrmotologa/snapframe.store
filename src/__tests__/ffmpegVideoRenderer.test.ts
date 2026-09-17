import { describe, it, expect, vi } from "vitest";
import {
  calculateTotalFrames,
  getFrameInterpolation,
  buildFFmpegRenderArgs,
  calculateProgress,
  renderLosslessVideoWithFFmpeg,
} from "@/lib/video/ffmpegVideoRenderer";
import { VideoRenderConfig } from "@/lib/types";

describe("FFmpeg Video Renderer Pipeline", () => {
  describe("calculateTotalFrames", () => {
    it("should calculate exact frames for single slide", () => {
      const frames = calculateTotalFrames(1, 2.0, 0.5, 60, "slide");
      // 1 slide * 2.0s * 60fps = 120 frames
      expect(frames).toBe(120);
    });

    it("should calculate total frames according to the plan formula: F = (N * D_slide + (N - 1) * D_trans) * FPS", () => {
      // 3 slides, 2.0s per slide, 0.5s transition, 60 FPS
      // Total seconds = 3 * 2.0 + 2 * 0.5 = 7.0s
      // Total frames = 7.0 * 60 = 420 frames
      const frames60 = calculateTotalFrames(3, 2.0, 0.5, 60, "slide");
      expect(frames60).toBe(420);

      // 30 FPS version
      const frames30 = calculateTotalFrames(3, 2.0, 0.5, 30, "slide");
      expect(frames30).toBe(210);
    });

    it("should omit transition duration when transitionStyle is cut", () => {
      // 4 slides, 1.5s per slide, cut transition, 60 FPS
      // Total seconds = 4 * 1.5 = 6.0s
      // Total frames = 6.0 * 60 = 360 frames
      const frames = calculateTotalFrames(4, 1.5, 0.4, 60, "cut");
      expect(frames).toBe(360);
    });

    it("should handle zero or negative slide counts gracefully", () => {
      expect(calculateTotalFrames(0, 2.0, 0.5, 60)).toBe(0);
      expect(calculateTotalFrames(-2, 2.0, 0.5, 60)).toBe(0);
    });
  });

  describe("getFrameInterpolation", () => {
    const slideCount = 3;
    const durationPerSlide = 2.0;
    const transDuration = 0.5;
    const fps = 60;
    const totalFrames = calculateTotalFrames(slideCount, durationPerSlide, transDuration, fps, "slide");

    it("should report static hold during the first slide", () => {
      // Frame 30 is at 0.5s -> inside slide 0 static hold [0s to 2.0s]
      const interp = getFrameInterpolation(
        30,
        totalFrames,
        slideCount,
        durationPerSlide,
        transDuration,
        fps,
        "slide"
      );

      expect(interp.currentSlideIndex).toBe(0);
      expect(interp.nextSlideIndex).toBe(0);
      expect(interp.isTransitioning).toBe(false);
      expect(interp.transitionProgress).toBe(0);
      expect(interp.easeProgress).toBe(0);
    });

    it("should report active transition and smooth cubic ease between slide 0 and 1", () => {
      // Frame 135 is at 2.25s (135 / 60 = 2.25s)
      // Slide 0 transition occurs from 2.0s to 2.5s (midpoint at 2.25s, progress 0.5)
      const interp = getFrameInterpolation(
        135,
        totalFrames,
        slideCount,
        durationPerSlide,
        transDuration,
        fps,
        "slide"
      );

      expect(interp.currentSlideIndex).toBe(0);
      expect(interp.nextSlideIndex).toBe(1);
      expect(interp.isTransitioning).toBe(true);
      expect(interp.transitionProgress).toBeCloseTo(0.5, 2);
      // Cubic ease: 0.5 * 0.5 * (3 - 2 * 0.5) = 0.25 * 2 = 0.5
      expect(interp.easeProgress).toBeCloseTo(0.5, 2);
    });

    it("should switch to slide 1 static hold after transition finishes", () => {
      // Step duration is 2.5s. Frame 180 is at 3.0s -> inside slide 1 static hold [2.5s to 4.5s]
      const interp = getFrameInterpolation(
        180,
        totalFrames,
        slideCount,
        durationPerSlide,
        transDuration,
        fps,
        "slide"
      );

      expect(interp.currentSlideIndex).toBe(1);
      expect(interp.nextSlideIndex).toBe(1);
      expect(interp.isTransitioning).toBe(false);
    });

    it("should remain on the last slide steadily at the end of the timeline", () => {
      // Last frame (419)
      const interp = getFrameInterpolation(
        totalFrames - 1,
        totalFrames,
        slideCount,
        durationPerSlide,
        transDuration,
        fps,
        "slide"
      );

      expect(interp.currentSlideIndex).toBe(2);
      expect(interp.nextSlideIndex).toBe(2);
      expect(interp.isTransitioning).toBe(false);
    });
  });

  describe("buildFFmpegRenderArgs", () => {
    it("should build broadcast-ready H.264 arguments with 60 FPS and yuv420p", () => {
      const config: VideoRenderConfig = {
        width: 1290,
        height: 2796,
        fps: 60,
        durationPerSlideSeconds: 2,
        transitionDurationSeconds: 0.5,
        transitionStyle: "slide",
        codec: "libx264",
        bitrate: "12M",
      };

      const args = buildFFmpegRenderArgs(config, "frame_%04d.png", "final.mp4");

      expect(args).toContain("-framerate");
      expect(args).toContain("60");
      expect(args).toContain("-c:v");
      expect(args).toContain("libx264");
      expect(args).toContain("-pix_fmt");
      expect(args).toContain("yuv420p");
      expect(args).toContain("-b:v");
      expect(args).toContain("12M");
      expect(args).toContain("+faststart");
      expect(args[args.length - 1]).toBe("final.mp4");
    });

    it("should default to CRF 18 if bitrate is not explicitly provided", () => {
      const config: VideoRenderConfig = {
        width: 1080,
        height: 1920,
        fps: 30,
        durationPerSlideSeconds: 1.5,
        transitionDurationSeconds: 0.4,
        transitionStyle: "fade",
        codec: "libx264",
        bitrate: "",
      };

      const args = buildFFmpegRenderArgs(config);
      expect(args).toContain("-crf");
      expect(args).toContain("18");
      expect(args).toContain("30");
    });
  });

  describe("calculateProgress", () => {
    it("should calculate progressive percentages across phases", () => {
      const p1 = calculateProgress("rendering_canvases", 30, 60);
      expect(p1.phase).toBe("rendering_canvases");
      expect(p1.percent).toBe(30); // 50% of 60 = 30%

      const p2 = calculateProgress("encoding_ffmpeg", 50, 100);
      expect(p2.phase).toBe("encoding_ffmpeg");
      expect(p2.percent).toBe(78); // 60 + 0.5 * 35 = 77.5 -> 78%

      const p3 = calculateProgress("finalizing", 100, 100);
      expect(p3.phase).toBe("finalizing");
      expect(p3.percent).toBe(100);
    });
  });

  describe("renderLosslessVideoWithFFmpeg validation", () => {
    it("should reject when screens array is empty", async () => {
      const dummyConfig: VideoRenderConfig = {
        width: 1290,
        height: 2796,
        fps: 60,
        durationPerSlideSeconds: 2,
        transitionDurationSeconds: 0.5,
        transitionStyle: "slide",
        codec: "libx264",
        bitrate: "12M",
      };

      await expect(
        renderLosslessVideoWithFFmpeg({
          screens: [],
          screenSet: { id: "s1", store: "ios", preset: {} as any, mockup: {} as any, screens: [] },
          config: dummyConfig,
        })
      ).rejects.toThrow("Cannot render video without screens.");
    });

    it("should throw AbortError if signal is already aborted", async () => {
      const controller = new AbortController();
      controller.abort();

      const dummyConfig: VideoRenderConfig = {
        width: 1290,
        height: 2796,
        fps: 60,
        durationPerSlideSeconds: 2,
        transitionDurationSeconds: 0.5,
        transitionStyle: "slide",
        codec: "libx264",
        bitrate: "12M",
      };

      await expect(
        renderLosslessVideoWithFFmpeg({
          screens: [{ id: "sc1" } as any],
          screenSet: { id: "s1", store: "ios", preset: {} as any, mockup: {} as any, screens: [] },
          config: dummyConfig,
          signal: controller.signal,
        })
      ).rejects.toThrow();
    });
  });
});
