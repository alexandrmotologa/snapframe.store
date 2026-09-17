import { FocalRegionAnalysis } from "@/lib/types";

export const TARGET_ANALYSIS_WIDTH = 120;
export const TARGET_ANALYSIS_HEIGHT = 240;

/**
 * Raw buffer interface compatible with ImageData and mock test buffers
 */
export interface RawImageBuffer {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array | number[];
}

/**
 * Core image saliency and focal region detector using Sobel convolution.
 * Pure mathematical computation with zero DOM dependencies.
 */
export function analyzeFocalRegionFromRawData(
  data: Uint8ClampedArray | Uint8Array | number[],
  width: number,
  height: number
): FocalRegionAnalysis {
  if (!data || width < 3 || height < 3) {
    return {
      optimalYOffset: 0.25,
      headerClearanceNeeded: false,
      bottomBarDetected: false,
      confidenceScore: 0.5,
    };
  }

  // 1. Convert RGBA to Grayscale Luminance buffer
  const pixelCount = width * height;
  const luminance = new Float32Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const r = data[idx] ?? 0;
    const g = data[idx + 1] ?? 0;
    const b = data[idx + 2] ?? 0;
    const a = (data[idx + 3] ?? 255) / 255;
    luminance[i] = (0.299 * r + 0.587 * g + 0.114 * b) * a;
  }

  // 2. Vertical & Horizontal Sobel Gradient Convolution
  const rowEnergy = new Float32Array(height);
  let totalEnergy = 0;
  let nonZeroRows = 0;

  for (let y = 1; y < height - 1; y++) {
    let currentRowEnergy = 0;
    const rowOffset = y * width;
    const prevRowOffset = (y - 1) * width;
    const nextRowOffset = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      // Sobel Horizontal (Gx)
      const gx =
        -1 * luminance[prevRowOffset + x - 1] +
        1 * luminance[prevRowOffset + x + 1] +
        -2 * luminance[rowOffset + x - 1] +
        2 * luminance[rowOffset + x + 1] +
        -1 * luminance[nextRowOffset + x - 1] +
        1 * luminance[nextRowOffset + x + 1];

      // Sobel Vertical (Gy)
      const gy =
        -1 * luminance[prevRowOffset + x - 1] +
        -2 * luminance[prevRowOffset + x] +
        -1 * luminance[prevRowOffset + x + 1] +
        1 * luminance[nextRowOffset + x - 1] +
        2 * luminance[nextRowOffset + x] +
        1 * luminance[nextRowOffset + x + 1];

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      currentRowEnergy += magnitude;
    }

    rowEnergy[y] = currentRowEnergy;
    totalEnergy += currentRowEnergy;
    if (currentRowEnergy > 1.0) {
      nonZeroRows++;
    }
  }

  // Handle uniform or empty images
  if (totalEnergy < 1.0) {
    return {
      optimalYOffset: 0.25,
      headerClearanceNeeded: false,
      bottomBarDetected: false,
      confidenceScore: 0.5,
    };
  }

  // 3. Zone Analysis (Top 15% header, Bottom 15% bottom bar)
  const headerBoundary = Math.max(1, Math.floor(height * 0.15));
  const bottomBoundary = Math.min(height - 2, Math.floor(height * 0.85));

  let headerEnergy = 0;
  for (let y = 1; y <= headerBoundary; y++) {
    headerEnergy += rowEnergy[y];
  }

  let bottomEnergy = 0;
  for (let y = bottomBoundary; y < height - 1; y++) {
    bottomEnergy += rowEnergy[y];
  }

  const averageRowEnergy = totalEnergy / Math.max(1, height - 2);
  const headerDensity = headerEnergy / headerBoundary;
  const bottomDensity = bottomEnergy / Math.max(1, height - 1 - bottomBoundary);

  // If density in zone exceeds 1.25x the average row density, mark as detected
  const headerClearanceNeeded = headerDensity > averageRowEnergy * 1.25;
  const bottomBarDetected = bottomDensity > averageRowEnergy * 1.25;

  // 4. Primary Content Centroid
  let weightedYSum = 0;
  for (let y = 1; y < height - 1; y++) {
    weightedYSum += y * rowEnergy[y];
  }
  const centroidY = weightedYSum / totalEnergy;
  const centroidRatio = centroidY / height; // 0 to 1

  // 5. Calculate Optimal Y-Offset
  // Base offset: 0.22 (22% from top of canvas)
  let optimalOffset = 0.22;

  if (centroidRatio < 0.38) {
    // Content is packed high in the screen -> leave extra breathing room
    optimalOffset = 0.28 + (0.38 - centroidRatio) * 0.2;
  } else if (centroidRatio > 0.60) {
    // Content is bottom-heavy -> push device up so bottom isn't clipped
    optimalOffset = 0.18 - (centroidRatio - 0.60) * 0.15;
  } else {
    // Mid-range distribution
    optimalOffset = 0.22 + (0.5 - centroidRatio) * 0.1;
  }

  // Modulate based on specific UI component detections
  if (headerClearanceNeeded) {
    optimalOffset += 0.03;
  }
  if (bottomBarDetected) {
    optimalOffset -= 0.03;
  }

  // Constrain between 12% and 40%
  const optimalYOffset = Math.max(0.12, Math.min(0.4, Number(optimalOffset.toFixed(3))));

  // Confidence based on edge spread and total signal
  const rowCoverageRatio = nonZeroRows / Math.max(1, height - 2);
  const confidenceScore = Math.min(0.99, Math.max(0.55, Number((0.55 + rowCoverageRatio * 0.4).toFixed(2))));

  return {
    optimalYOffset,
    headerClearanceNeeded,
    bottomBarDetected,
    confidenceScore,
  };
}

/**
 * High-level helper accepting ImageData or raw image buffer
 */
export function analyzeFocalRegion(input: RawImageBuffer | ImageData): FocalRegionAnalysis {
  return analyzeFocalRegionFromRawData(input.data, input.width, input.height);
}

/**
 * Browser-compatible asynchronous analyzer for HTMLImageElement, HTMLCanvasElement, or data URL
 */
export async function analyzeScreenshotImage(
  imageOrUrl: HTMLImageElement | HTMLCanvasElement | string
): Promise<FocalRegionAnalysis> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    // Fallback in SSR/headless environments
    return {
      optimalYOffset: 0.25,
      headerClearanceNeeded: false,
      bottomBarDetected: false,
      confidenceScore: 0.5,
    };
  }

  try {
    let sourceElement: HTMLImageElement | HTMLCanvasElement;

    if (typeof imageOrUrl === "string") {
      sourceElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = imageOrUrl;
      });
    } else {
      sourceElement = imageOrUrl;
    }

    const canvas = document.createElement("canvas");
    canvas.width = TARGET_ANALYSIS_WIDTH;
    canvas.height = TARGET_ANALYSIS_HEIGHT;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return {
        optimalYOffset: 0.25,
        headerClearanceNeeded: false,
        bottomBarDetected: false,
        confidenceScore: 0.5,
      };
    }

    ctx.drawImage(sourceElement, 0, 0, TARGET_ANALYSIS_WIDTH, TARGET_ANALYSIS_HEIGHT);
    const imageData = ctx.getImageData(0, 0, TARGET_ANALYSIS_WIDTH, TARGET_ANALYSIS_HEIGHT);

    return analyzeFocalRegion(imageData);
  } catch (err) {
    console.warn("[smartFraming] Fallback to default framing analysis:", err);
    return {
      optimalYOffset: 0.25,
      headerClearanceNeeded: false,
      bottomBarDetected: false,
      confidenceScore: 0.5,
    };
  }
}
