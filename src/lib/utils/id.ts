/** Generate a short unique ID (browser-safe, crypto-backed) */
export function nanoid(size = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const arr = new Uint8Array(size);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
    for (const byte of arr) {
      result += chars[byte % chars.length];
    }
  } else {
    for (let i = 0; i < size; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}
