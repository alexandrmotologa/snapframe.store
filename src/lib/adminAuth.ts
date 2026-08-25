/**
 * Administrator authorization utilities for SnapFrame.
 * Strictly verifies whether an authenticated user possesses administrator access.
 */

// Fallback admin handles / emails if not configured in environment
const DEFAULT_ADMIN_HANDLES = [
  "alexandrmotologa",
  "alexandru.motologa",
  "motologa",
  "admin@snapframe.store",
  "alex@snapframe.store",
];

/**
 * Returns the list of authorized administrator emails from environment variables or defaults
 */
export function getAdminEmails(): string[] {
  const envAdmins =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    "";

  if (!envAdmins.trim()) {
    return DEFAULT_ADMIN_HANDLES;
  }

  const parsed = envAdmins
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_ADMIN_HANDLES;
}

/**
 * Strictly verifies whether a given email address belongs to an authorized administrator.
 * Case-insensitive comparison.
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;

  const normalized = email.toLowerCase().trim();
  if (!normalized) return false;

  const adminList = getAdminEmails();

  return adminList.some((admin) => {
    const adminNormalized = admin.toLowerCase().trim();
    if (!adminNormalized) return false;

    // Exact email match
    if (normalized === adminNormalized) return true;

    // Handle/prefix match if only handle specified (e.g. "alexandrmotologa" matches "alexandrmotologa@gmail.com")
    if (!adminNormalized.includes("@")) {
      const handle = normalized.split("@")[0];
      return handle === adminNormalized || handle.includes(adminNormalized);
    }

    return false;
  });
}
