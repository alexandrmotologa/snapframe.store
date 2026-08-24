/** Dynamically load a Google Font and wait for it to be ready. */
export function loadGoogleFont(family: string): Promise<void> {
  if (typeof document === "undefined" || !family) return Promise.resolve();
  const linkId = `font-${family.replace(/\s+/g, "-")}`;
  
  if (document.getElementById(linkId)) {
    return document.fonts.load(`1em "${family}"`).then(() => {});
  }
  
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:wght@100..900&display=swap`;
    link.onload = () => {
      document.fonts.load(`1em "${family}"`).then(() => resolve()).catch(() => resolve());
    };
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}
