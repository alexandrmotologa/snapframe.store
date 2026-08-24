import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { adminAuth, isAdminConfigured } from "@/lib/firebaseAdmin";
import { checkRateLimit } from "@/lib/rateLimiter";

const f = createUploadthing();

// FileRouter for SnapFrame
export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 4,
    },
  })
    .middleware(async ({ req }) => {
      // 1. Rate limiting by IP
      const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      const clientIp = forwarded.split(",")[0].trim();
      const limit = checkRateLimit(`upload:${clientIp}`, { limit: 20, windowMs: 60000, keyPrefix: "upload" });
      if (!limit.success) {
        throw new UploadThingError("Rate limit exceeded for uploads. Please wait a minute.");
      }

      // 2. Enforce authentication
      const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
      let userId: string | null = null;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split("Bearer ")[1]?.trim();
        if (token && isAdminConfigured && adminAuth) {
          try {
            const decoded = await adminAuth.verifyIdToken(token);
            userId = decoded.uid;
          } catch (e) {
            console.warn("[UploadThing] Invalid auth token during upload:", e);
            throw new UploadThingError("Invalid authentication token. Please sign in again.");
          }
        }
      }

      // If Firebase Admin is configured, require authentication
      if (isAdminConfigured && !userId) {
        throw new UploadThingError("Authentication required for cloud file uploads.");
      }

      return { userId: userId || `dev_${clientIp.replace(/[^a-zA-Z0-9]/g, "_")}` };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Upload complete for userId:", metadata.userId, "url:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
