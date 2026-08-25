/**
 * Universal File Download & File System Access API Helper.
 * 
 * 1. Tries the File System Access API (showSaveFilePicker) on Chromium browsers
 *    (Chrome, Edge, Opera, Brave) to let the user pick the exact destination folder.
 * 2. Seamlessly falls back to a standard <a> download for Firefox, Safari, or on user cancel/error.
 */
export async function downloadFileWithPicker(
  blob: Blob,
  suggestedName: string,
  options: {
    types?: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  } = {}
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Auto-detect picker type from extension if not provided
  let types = options.types;
  if (!types) {
    if (suggestedName.endsWith(".zip")) {
      types = [{ description: "ZIP Archive", accept: { "application/zip": [".zip"] } }];
    } else if (suggestedName.endsWith(".png")) {
      types = [{ description: "PNG Image", accept: { "image/png": [".png"] } }];
    } else if (suggestedName.endsWith(".jpg") || suggestedName.endsWith(".jpeg")) {
      types = [{ description: "JPEG Image", accept: { "image/jpeg": [".jpg", ".jpeg"] } }];
    } else if (suggestedName.endsWith(".webp")) {
      types = [{ description: "WebP Image", accept: { "image/webp": [".webp"] } }];
    } else if (suggestedName.endsWith(".json")) {
      types = [{ description: "JSON Document", accept: { "application/json": [".json"] } }];
    } else if (suggestedName.endsWith(".mp4")) {
      types = [{ description: "MP4 Video", accept: { "video/mp4": [".mp4"] } }];
    } else if (suggestedName.endsWith(".gif")) {
      types = [{ description: "Animated GIF", accept: { "image/gif": [".gif"] } }];
    }
  }

  // Approach 1: File System Access API (Chrome 86+, Edge 86+, Opera)
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as unknown as {
        showSaveFilePicker: (opts: {
          suggestedName: string;
          types?: Array<{ description: string; accept: Record<string, string[]> }>;
        }) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName,
        types,
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err: unknown) {
      // User cancelled picker dialog (AbortError) -> stop
      if (err instanceof Error && err.name === "AbortError") {
        return false;
      }
      // On other permissions errors, gracefully proceed to fallback
    }
  }

  // Approach 2: Traditional anchor download fallback (Firefox, Safari, Mobile)
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);

  return true;
}
