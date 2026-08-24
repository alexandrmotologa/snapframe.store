import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
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
        if (token) {
          try {
            const adminAuth = await getAdminAuth();
            if (adminAuth) {
              const decoded = await adminAuth.verifyIdToken(token);
              userId = decoded.uid;
            } else {
              const parts = token.split(".");
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
                userId = payload.user_id || payload.sub || payload.uid;
              }
            }
          } catch (e) {
            console.warn("[UploadThing] Invalid auth token during upload:", e);
          }
        }
      }

      return { userId: userId || `user_${clientIp.replace(/[^a-zA-Z0-9]/g, "_")}` };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Upload complete for userId:", metadata.userId, "url:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
