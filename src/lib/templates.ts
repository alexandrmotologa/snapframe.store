import { Template, ScreenshotLayer, TextLayer, ShapeLayer, TemplateScreen } from "@/lib/types";

// ─── Canvas dimensions (1290×2796) ────────────────────────────────────────────
const W = 1290;
const H = 2796;

// Helper: screenshot zone layer
function screenshotZone(
  x: number,
  y: number,
  w: number,
  h: number,
  label = "Drop your screenshot here",
  radius = 40,
): Omit<ScreenshotLayer, "id"> {
  return {
    type: "screenshot",
    src: undefined,
    x, y, width: w, height: h,
    rotation: 0,
    opacity: 1,
    objectFit: "cover",
    cornerRadius: radius,
    showDeviceFrame: false,
    label,
  };
}

// Helper: screenshot with device frame + shadow
function screenshotWithFrame(
  x: number,
  y: number,
  w: number,
  h: number,
  label = "Drop your screenshot here",
  rotation = 0,
): Omit<ScreenshotLayer, "id"> {
  return {
    ...screenshotZone(x, y, w, h, label, 55),
    rotation,
    showDeviceFrame: true,
    shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.35)", offsetX: 0, offsetY: 20 },
  };
}

// Helper: text layer
function textLayer(
  content: string,
  x: number, y: number, w: number, h: number,
  opts: Partial<Omit<TextLayer, "id" | "type" | "content" | "x" | "y" | "width" | "height">>
): Omit<TextLayer, "id"> {
  return {
    type: "text",
    content, x, y, width: w, height: h,
    fontSize: 90,
    fontFamily: "Inter",
    fontWeight: 700,
    color: "#ffffff",
    align: "left",
    lineHeight: 1.15,
    letterSpacing: -1.5,
    rotation: 0,
    opacity: 1,
    ...opts,
  };
}

// Helper: shape layer
function shapeLayer(
  shape: import("@/lib/types").ShapeType,
  x: number, y: number, w: number, h: number,
  fill: string,
  opts: Partial<Omit<ShapeLayer, "id" | "type" | "shape" | "x" | "y" | "width" | "height" | "fill">> = {}
): Omit<ShapeLayer, "id"> {
  return {
    type: "shape",
    shape, x, y, width: w, height: h, fill,
    rotation: 0, opacity: 1,
    ...opts,
  };
}

// Helper: flag / emoji layer
function flagLayer(
  content: string,
  x: number, y: number, w: number, h: number,
  opts: Partial<Omit<import("@/lib/types").FlagLayer, "id" | "type" | "content" | "x" | "y" | "width" | "height">> = {}
): Omit<import("@/lib/types").FlagLayer, "id"> {
  return {
    type: "flag",
    content,
    x, y, width: w, height: h,
    rotation: 0,
    opacity: 1,
    ...opts,
  };
}

// ─── TEMPLATES ─────────────────────────────────────────────────────────────────

const DEFAULT_CUSTOM_SCREENS = [
  {
    title: "Everything You Need in One App",
    subtitle: "Fast, intuitive, and beautifully designed for everyone",
  },
  {
    title: "Powerful Features & Insights",
    subtitle: "Track your progress and stay on top of your goals",
  },
  {
    title: "Real-Time Collaboration",
    subtitle: "Work seamlessly with your team anywhere, anytime",
  },
  {
    title: "Customizable & Secure",
    subtitle: "Tailored to your preferences with bank-level security",
  },
  {
    title: "Get Started in Seconds",
    subtitle: "Join thousands of happy users today",
  },
];

export const BLANK_TEMPLATE: Template = {
  id: "blank",
  name: "Custom Design",
  description: "Start with editable default headlines and screenshots (5 screens)",
  category: "Basic",
  layout: "screenshot-bottom",
  tags: ["blank", "empty", "custom", "default"],
  previewColor: "#1e1b4b",
  previewGradient: ["#6366f1", "#8b5cf6"],
  screens: DEFAULT_CUSTOM_SCREENS.map((item, i) => ({
    name: `Screen ${i + 1}`,
    background: {
      type: "gradient",
      gradient: { direction: "to-br", stops: [{ color: "#6366f1", position: 0 }, { color: "#8b5cf6", position: 100 }] },
    },
    layers: [
      textLayer(item.title, Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
        fontSize: 96,
        fontWeight: 800,
        align: "center",
        color: "#ffffff",
        lineHeight: 1.15,
        letterSpacing: -1.5,
      }) as any,
      textLayer(item.subtitle, Math.round(W * 0.1), 420, Math.round(W * 0.8), 160, {
        fontSize: 46,
        fontWeight: 400,
        align: "center",
        color: "rgba(255, 255, 255, 0.82)",
        lineHeight: 1.3,
        letterSpacing: -0.5,
      }) as any,
      { ...screenshotWithFrame(129, 720, 1032, 1957) } as any,
    ],
  })),
};

export const CORE_TEMPLATES: Template[] = [
  // ── Template 28 (Obsidian Cyber Glow) ───────────────────────────────────────
  {
    id: "template-28",
    name: "Obsidian Cyber Glow",
    description: "Deep elegant tones with premium 3D glows & glass badges (10 Screens)",
    category: "Modern",
    layout: "screenshot-bottom",
    tags: ["dark", "premium", "modern", "glow", "cyber", "obsidian"],
    previewColor: "#0f172a",
    previewGradient: ["#1e293b", "#020617"],
    screens: [
      // Screen 1: Hero Cover
      {
        name: "Hero Cover",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#1e1b4b", bottomLeft: "#020617", bottomRight: "#0f172a" },
          pattern: { type: "noise", color: "#ffffff", opacity: 0.03, size: 1, spacing: 1 }
        },
        layers: [
          shapeLayer("circle", W * 0.1, H * 0.32, W * 0.8, W * 0.8, "rgba(139,92,246,0.25)", { opacity: 0.8 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 320, 85, "rgba(99, 102, 241, 0.25)", {
            stroke: "rgba(165, 180, 252, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("NEW RELEASE", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 320, 85, {
            fontSize: 48, fontWeight: 900, color: "#ffffff", align: "center", letterSpacing: 4
          }),
          textLayer("Redefining\nThe Future.", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("The all-in-one platform built for speed, elegance, and scale.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 2: Real-time Analytics
      {
        name: "Analytics",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e1b4b", topRight: "#0f172a", bottomLeft: "#020617", bottomRight: "#172554" },
          pattern: { type: "noise", color: "#ffffff", opacity: 0.03, size: 1, spacing: 1 }
        },
        layers: [
          shapeLayer("circle", W * 0.15, H * 0.35, W * 0.7, W * 0.7, "rgba(16,185,129,0.2)", { opacity: 0.7 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 340, 85, "rgba(16, 185, 129, 0.2)", {
            stroke: "rgba(52, 211, 153, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("LIVE METRICS", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 340, 85, {
            fontSize: 48, fontWeight: 900, color: "#6ee7b7", align: "center", letterSpacing: 4
          }),
          textLayer("Live Analytics\nIn Real-Time", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Track your vital KPIs and growth metrics with zero latency.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 3: Angled Showcase
      {
        name: "Integration",
        background: {
          type: "mesh",
          mesh: { topLeft: "#020617", topRight: "#172554", bottomLeft: "#0f172a", bottomRight: "#1e1b4b" }
        },
        layers: [
          shapeLayer("circle", W * 0.05, H * 0.25, W * 0.9, W * 0.9, "rgba(59,130,246,0.22)", { opacity: 0.8 }),
          textLayer("Seamless\nIntegration", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Connect effortlessly with tools and workflows you already love.", Math.round(W * 0.08), Math.round(H * 0.215), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.33), Math.round(W * 0.86), 2200, "Drop Screenshot", -4),
        ],
      },
      // Screen 4: AI Powered
      {
        name: "AI Assistant",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#1e1b4b", bottomLeft: "#020617", bottomRight: "#311042" }
        },
        layers: [
          shapeLayer("circle", W * 0.1, H * 0.3, W * 0.8, W * 0.8, "rgba(236,72,153,0.22)", { opacity: 0.8 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 320, 85, "rgba(236, 72, 153, 0.2)", {
            stroke: "rgba(244, 114, 182, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("AI POWERED", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 320, 85, {
            fontSize: 48, fontWeight: 900, color: "#f472b6", align: "center", letterSpacing: 4
          }),
          textLayer("Smarter Work\nWith Built-In AI", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Automate complex tasks with intuitive natural language prompts.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 5: Continuous Flow Left
      {
        name: "Flow (Left)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e1b4b", topRight: "#0f172a", bottomLeft: "#172554", bottomRight: "#020617" }
        },
        layers: [
          shapeLayer("circle", W * 0.3, H * 0.3, W * 0.8, W * 0.8, "rgba(99,102,241,0.25)", { opacity: 0.8 }),
          textLayer("Ultra Smooth\nExperience", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Engineered for buttery smooth 120Hz interactions.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          // Phone starts on this screen and extends off the right edge to meet Screen 6
          screenshotWithFrame(Math.round(W * 0.35), Math.round(H * 0.32), Math.round(W * 0.86), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 6: Continuous Flow Right
      {
        name: "Flow (Right)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#1e1b4b", bottomLeft: "#020617", bottomRight: "#172554" }
        },
        layers: [
          shapeLayer("circle", -W * 0.1, H * 0.3, W * 0.8, W * 0.8, "rgba(99,102,241,0.25)", { opacity: 0.8 }),
          textLayer("Every Pixel\nPerfected", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Crafted with obsessively precise attention to detail.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          // Phone continues from left edge of this screen
          screenshotWithFrame(Math.round(-W * 0.21), Math.round(H * 0.32), Math.round(W * 0.86), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 7: Security
      {
        name: "Security",
        background: {
          type: "mesh",
          mesh: { topLeft: "#020617", topRight: "#0f172a", bottomLeft: "#020617", bottomRight: "#0f172a" }
        },
        layers: [
          shapeLayer("circle", W * 0.1, H * 0.35, W * 0.8, W * 0.8, "rgba(59,130,246,0.2)", { opacity: 0.8 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 360, 85, "rgba(59, 130, 246, 0.2)", {
            stroke: "rgba(96, 165, 250, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("END-TO-END", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 360, 85, {
            fontSize: 48, fontWeight: 900, color: "#93c5fd", align: "center", letterSpacing: 4
          }),
          textLayer("Bank-Grade\nEncryption", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Your private data stays yours, protected with AES-256 standards.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 8: Dark Mode Focus
      {
        name: "Dark Mode",
        background: {
          type: "solid",
          color: "#050508",
          pattern: { type: "grid", color: "#6366f1", opacity: 0.04, size: 1, spacing: 60 }
        },
        layers: [
          shapeLayer("circle", W * 0.1, H * 0.3, W * 0.8, W * 0.8, "rgba(168,85,247,0.2)", { opacity: 0.7 }),
          textLayer("Engineered For\nPure Dark Mode", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Deep blacks optimized for OLED screens and eye comfort.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 9: Social Proof
      {
        name: "Social Proof",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e1b4b", topRight: "#0f172a", bottomLeft: "#020617", bottomRight: "#1e1b4b" }
        },
        layers: [
          shapeLayer("circle", W * 0.1, H * 0.32, W * 0.8, W * 0.8, "rgba(245,158,11,0.18)", { opacity: 0.8 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 360, 85, "rgba(245, 158, 11, 0.2)", {
            stroke: "rgba(251, 191, 36, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("★ ★ ★ ★ ★", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 360, 85, {
            fontSize: 52, fontWeight: 900, color: "#fbbf24", align: "center", letterSpacing: 6
          }),
          textLayer("Loved By Over\n1 Million Users", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Top rated app worldwide for effortless daily productivity.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 10: Call To Action
      {
        name: "Call to Action",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#311042", bottomLeft: "#020617", bottomRight: "#1e1b4b" }
        },
        layers: [
          shapeLayer("circle", W * 0.05, H * 0.25, W * 0.9, W * 0.9, "rgba(139,92,246,0.3)", { opacity: 0.8 }),
          textLayer("Start Your\nJourney Today", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Download now and experience the new gold standard.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#94a3b8", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
    ],
  },

  // ── Template 29 (Nordic Minimal Light) ──────────────────────────────────────
  {
    id: "template-29",
    name: "Nordic Minimal Light",
    description: "Crisp gallery aesthetic with subtle paper textures (10 Screens)",
    category: "Classic",
    layout: "screenshot-top",
    tags: ["light", "clean", "white", "minimal", "nordic", "gallery"],
    previewColor: "#f8fafc",
    previewGradient: ["#ffffff", "#e2e8f0"],
    screens: [
      // Screen 1: Top Mockup Intro
      {
        name: "Intro",
        background: {
          type: "solid",
          color: "#f8fafc",
          pattern: { type: "grid", color: "#0f172a", opacity: 0.03, size: 1, spacing: 60 }
        },
        layers: [
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.06), Math.round(W * 0.8), 1800, "Drop Screenshot"),
          textLayer("Simply\nBeautiful.", Math.round(W * 0.1), Math.round(H * 0.74), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Your application, stripped down to its perfect essence.", Math.round(W * 0.1), Math.round(H * 0.87), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
        ],
      },
      // Screen 2: Clarity Feature
      {
        name: "Clarity",
        background: {
          type: "solid",
          color: "#ffffff",
          pattern: { type: "dots", color: "#0f172a", opacity: 0.04, size: 2, spacing: 40 }
        },
        layers: [
          textLayer("Clarity In\nEvery Step", Math.round(W * 0.1), Math.round(H * 0.08), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Focus on what matters without the unnecessary clutter.", Math.round(W * 0.1), Math.round(H * 0.205), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.32), Math.round(W * 0.8), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 3: Effortless Navigation
      {
        name: "Navigation",
        background: { type: "solid", color: "#f1f5f9" },
        layers: [
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.06), Math.round(W * 0.8), 1800, "Drop Screenshot"),
          textLayer("Effortless\nNavigation", Math.round(W * 0.1), Math.round(H * 0.74), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Move through your tasks with unmatched fluid speed.", Math.round(W * 0.1), Math.round(H * 0.87), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
        ],
      },
      // Screen 4: Pure Focus
      {
        name: "Focus",
        background: { type: "solid", color: "#ffffff" },
        layers: [
          textLayer("Zero Clutter.\nPure Focus.", Math.round(W * 0.1), Math.round(H * 0.08), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("A distraction-free environment tailored for high productivity.", Math.round(W * 0.1), Math.round(H * 0.205), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.32), Math.round(W * 0.8), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 5: Continuous Split (Left)
      {
        name: "Panorama (Left)",
        background: { type: "solid", color: "#f8fafc" },
        layers: [
          textLayer("Designed For\nModern Life", Math.round(W * 0.1), Math.round(H * 0.08), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Synchronize seamlessly across all your personal devices.", Math.round(W * 0.1), Math.round(H * 0.205), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.38), Math.round(H * 0.32), Math.round(W * 0.82), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 6: Continuous Split (Right)
      {
        name: "Panorama (Right)",
        background: { type: "solid", color: "#f8fafc" },
        layers: [
          textLayer("Stay In\nPerfect Sync", Math.round(W * 0.1), Math.round(H * 0.08), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Instant updates and zero delay on cloud backups.", Math.round(W * 0.1), Math.round(H * 0.205), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(-W * 0.2), Math.round(H * 0.32), Math.round(W * 0.82), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 7: Smart Tools
      {
        name: "Smart Tools",
        background: { type: "solid", color: "#ffffff" },
        layers: [
          textLayer("Smart Tools\nBuilt Right In", Math.round(W * 0.1), Math.round(H * 0.08), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Everything you need in one clean, thoughtfully crafted space.", Math.round(W * 0.1), Math.round(H * 0.205), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.32), Math.round(W * 0.8), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 8: Contrast Slate Accent
      {
        name: "Theme Ready",
        background: { type: "solid", color: "#f1f5f9" },
        layers: [
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.06), Math.round(W * 0.8), 1800, "Drop Screenshot"),
          textLayer("Light Or Dark.\nYour Choice.", Math.round(W * 0.1), Math.round(H * 0.74), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Flawlessly switches according to your personal system settings.", Math.round(W * 0.1), Math.round(H * 0.87), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
        ],
      },
      // Screen 9: Privacy & Security
      {
        name: "Privacy",
        background: { type: "solid", color: "#ffffff" },
        layers: [
          textLayer("Private, Fast\n& Reliable", Math.round(W * 0.1), Math.round(H * 0.08), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Your information stays securely protected on your device.", Math.round(W * 0.1), Math.round(H * 0.205), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.32), Math.round(W * 0.8), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 10: Call to Action
      {
        name: "Get Started",
        background: { type: "solid", color: "#f8fafc" },
        layers: [
          screenshotWithFrame(Math.round(W * 0.1), Math.round(H * 0.06), Math.round(W * 0.8), 1800, "Drop Screenshot"),
          textLayer("Get Started\nIn Seconds.", Math.round(W * 0.1), Math.round(H * 0.74), Math.round(W * 0.8), 300, {
            fontSize: 135, fontWeight: 900, color: "#0f172a", lineHeight: 1.05
          }),
          textLayer("Download today and enjoy a clean, refreshed experience.", Math.round(W * 0.1), Math.round(H * 0.87), Math.round(W * 0.8), 180, {
            fontSize: 60, fontWeight: 500, color: "#64748b", lineHeight: 1.4
          }),
        ],
      },
    ],
  },

  // ── Template 30 (Sunset Playful Mesh) ───────────────────────────────────────
  {
    id: "template-30",
    name: "Sunset Playful Mesh",
    description: "Warm coral mesh gradients with playful geometric shapes (10 Screens)",
    category: "Social",
    layout: "screenshot-float",
    tags: ["fun", "vibrant", "shapes", "colorful", "sunset", "mesh"],
    previewColor: "#fb923c",
    previewGradient: ["#f43f5e", "#f59e0b"],
    screens: [
      // Screen 1: Hero
      {
        name: "Welcome",
        background: {
          type: "mesh",
          mesh: { topLeft: "#f43f5e", topRight: "#f97316", bottomLeft: "#fb923c", bottomRight: "#e11d48" }
        },
        layers: [
          shapeLayer("star", W * 0.78, H * 0.06, 160, 160, "rgba(255,255,255,0.35)", { rotation: 12 }),
          shapeLayer("circle", W * 0.06, H * 0.28, 120, 120, "rgba(255,255,255,0.25)"),
          textLayer("Make It\nFun & Easy!", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Connect, create, and share good vibes every single day.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 2: Squad / Social
      {
        name: "Squad",
        background: {
          type: "mesh",
          mesh: { topLeft: "#e11d48", topRight: "#db2777", bottomLeft: "#f43f5e", bottomRight: "#fb923c" }
        },
        layers: [
          shapeLayer("triangle", W * 0.8, H * 0.08, 140, 140, "rgba(255,255,255,0.3)", { rotation: -15 }),
          textLayer("Connect With\nYour Squad", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Real-time messaging, reaction stickers, and group fun.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot", 4),
        ],
      },
      // Screen 3: Rewards / Gamify
      {
        name: "Rewards",
        background: {
          type: "mesh",
          mesh: { topLeft: "#f97316", topRight: "#eab308", bottomLeft: "#f43f5e", bottomRight: "#f97316" }
        },
        layers: [
          shapeLayer("diamond", W * 0.76, H * 0.07, 150, 150, "rgba(255,255,255,0.35)", { rotation: 25 }),
          textLayer("Level Up\nYour Game", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Earn exclusive badges and trophies as you make daily progress.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 4: Fast Actions
      {
        name: "Speed",
        background: {
          type: "mesh",
          mesh: { topLeft: "#ec4899", topRight: "#f43f5e", bottomLeft: "#8b5cf6", bottomRight: "#f97316" }
        },
        layers: [
          shapeLayer("hexagon", W * 0.8, H * 0.06, 150, 150, "rgba(255,255,255,0.3)", { rotation: 10 }),
          textLayer("Lightning Fast\nInstant Fun", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Everything responds at your fingertips in zero seconds.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 5: Split Fun (Left)
      {
        name: "Share (Left)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#f43f5e", topRight: "#f97316", bottomLeft: "#ec4899", bottomRight: "#e11d48" }
        },
        layers: [
          shapeLayer("star", W * 0.1, H * 0.28, 120, 120, "rgba(255,255,255,0.3)"),
          textLayer("Share Magic\nInstantly", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Post stories and moments to all your favorite channels.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.38), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 6: Split Fun (Right)
      {
        name: "Share (Right)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#f97316", topRight: "#f43f5e", bottomLeft: "#e11d48", bottomRight: "#ec4899" }
        },
        layers: [
          shapeLayer("diamond", W * 0.8, H * 0.28, 130, 130, "rgba(255,255,255,0.3)", { rotation: 20 }),
          textLayer("Never Miss\nA Moment", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Real-time notifications keep you right in the action.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(-W * 0.22), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 7: Customization
      {
        name: "Express",
        background: {
          type: "mesh",
          mesh: { topLeft: "#8b5cf6", topRight: "#ec4899", bottomLeft: "#f43f5e", bottomRight: "#f97316" }
        },
        layers: [
          shapeLayer("star", W * 0.8, H * 0.07, 160, 160, "rgba(255,255,255,0.35)", { rotation: 18 }),
          textLayer("Express Your\nTrue Style", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Customize themes, avatars, and icons to match your vibe.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 8: Daily Streaks
      {
        name: "Streaks",
        background: {
          type: "mesh",
          mesh: { topLeft: "#f97316", topRight: "#f43f5e", bottomLeft: "#eab308", bottomRight: "#fb923c" }
        },
        layers: [
          shapeLayer("circle", W * 0.08, H * 0.28, 140, 140, "rgba(255,255,255,0.3)"),
          textLayer("Daily Streaks\n& Badges", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Build positive daily habits alongside your closest friends.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 9: Community
      {
        name: "Community",
        background: {
          type: "mesh",
          mesh: { topLeft: "#db2777", topRight: "#f97316", bottomLeft: "#f43f5e", bottomRight: "#8b5cf6" }
        },
        layers: [
          shapeLayer("star", W * 0.78, H * 0.06, 170, 170, "rgba(255,255,255,0.35)", { rotation: 15 }),
          textLayer("Join 500k+\nHappy Creators", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Discover endless creative ideas shared by the global family.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 10: Playful CTA
      {
        name: "Join Now",
        background: {
          type: "mesh",
          mesh: { topLeft: "#f43f5e", topRight: "#f97316", bottomLeft: "#8b5cf6", bottomRight: "#ec4899" }
        },
        layers: [
          shapeLayer("star", W * 0.75, H * 0.06, 180, 180, "rgba(255,255,255,0.4)", { rotation: 20 }),
          textLayer("Ready To Play?\nJoin Us Today!", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Download for free and jump right into the excitement.", Math.round(W * 0.08), Math.round(H * 0.21), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.35
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
    ],
  },

  // ── Template 31 (Fintech Oceanic Pro) ───────────────────────────────────────
  {
    id: "template-31",
    name: "Fintech Oceanic Pro",
    description: "Corporate dark blue designed for SaaS & fintech apps (10 Screens)",
    category: "Finance",
    layout: "screenshot-bottom",
    tags: ["blue", "corporate", "finance", "business", "fintech", "oceanic"],
    previewColor: "#2563eb",
    previewGradient: ["#1e3a8a", "#2563eb"],
    screens: [
      // Screen 1: Hero
      {
        name: "Enterprise Hero",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#1e3a8a", bottomLeft: "#1e3a8a", bottomRight: "#2563eb" }
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 360, 85, "rgba(59, 130, 246, 0.25)", {
            stroke: "rgba(147, 197, 253, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("ENTERPRISE", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 360, 85, {
            fontSize: 48, fontWeight: 900, color: "#93c5fd", align: "center", letterSpacing: 4
          }),
          textLayer("Empower Your\nBusiness", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Next-generation financial operations and real-time ledger intelligence.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 2: Real-time Assets
      {
        name: "Assets",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e3a8a", topRight: "#0f172a", bottomLeft: "#2563eb", bottomRight: "#1e3a8a" }
        },
        layers: [
          textLayer("Track Assets\nIn Real-Time", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Monitor global portfolios and cash flow with bank-grade accuracy.", Math.round(W * 0.08), Math.round(H * 0.215), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 3: Automated Reports
      {
        name: "Smart Reports",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#2563eb", bottomLeft: "#1e3a8a", bottomRight: "#0f172a" }
        },
        layers: [
          textLayer("Automated\nSmart Reports", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Export executive summaries and compliance audits in one click.", Math.round(W * 0.08), Math.round(H * 0.215), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot", -3),
        ],
      },
      // Screen 4: Global Scale
      {
        name: "Global Scale",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e3a8a", topRight: "#0f172a", bottomLeft: "#0f172a", bottomRight: "#2563eb" }
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 360, 85, "rgba(59, 130, 246, 0.25)", {
            stroke: "rgba(147, 197, 253, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("GLOBAL", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 360, 85, {
            fontSize: 48, fontWeight: 900, color: "#93c5fd", align: "center", letterSpacing: 4
          }),
          textLayer("Built For\nGlobal Scale", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Multi-currency support and localized tax compliance built in.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 5: Continuous Team Sync (Left)
      {
        name: "Team (Left)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#1e3a8a", bottomLeft: "#1e3a8a", bottomRight: "#2563eb" }
        },
        layers: [
          textLayer("Seamless Team\nCollaboration", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Role-based permissions and granular team access controls.", Math.round(W * 0.08), Math.round(H * 0.215), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.38), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 6: Continuous Team Sync (Right)
      {
        name: "Team (Right)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e3a8a", topRight: "#0f172a", bottomLeft: "#2563eb", bottomRight: "#1e3a8a" }
        },
        layers: [
          textLayer("Instant Cloud\nSyncing", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Zero data loss with enterprise 99.99% uptime SLA.", Math.round(W * 0.08), Math.round(H * 0.215), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(-W * 0.22), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 7: Security
      {
        name: "Security",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#1e3a8a", bottomLeft: "#020617", bottomRight: "#0f172a" }
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 360, 85, "rgba(59, 130, 246, 0.25)", {
            stroke: "rgba(147, 197, 253, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("SOC-2 COMPLIANT", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 360, 85, {
            fontSize: 44, fontWeight: 900, color: "#93c5fd", align: "center", letterSpacing: 3
          }),
          textLayer("Bank-Grade\n256-Bit Security", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Biometric login, hardware keys, and encrypted cloud vaults.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 8: Integration Stack
      {
        name: "Integrations",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e3a8a", topRight: "#0f172a", bottomLeft: "#1e3a8a", bottomRight: "#2563eb" }
        },
        layers: [
          textLayer("Connect Your\nEntire Stack", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Pre-built webhooks and native REST APIs for modern workflows.", Math.round(W * 0.08), Math.round(H * 0.215), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 9: Trusted by Leaders
      {
        name: "Trust",
        background: {
          type: "mesh",
          mesh: { topLeft: "#0f172a", topRight: "#1e3a8a", bottomLeft: "#0f172a", bottomRight: "#2563eb" }
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), Math.round(H * 0.045), 360, 85, "rgba(59, 130, 246, 0.25)", {
            stroke: "rgba(147, 197, 253, 0.6)", strokeWidth: 3, cornerRadius: 100
          }),
          textLayer("INDUSTRY LEADER", Math.round(W * 0.08), Math.round(H * 0.045) + 16, 360, 85, {
            fontSize: 44, fontWeight: 900, color: "#93c5fd", align: "center", letterSpacing: 3
          }),
          textLayer("Trusted By\nFortune 500", Math.round(W * 0.08), Math.round(H * 0.095), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Powering top finance and technology enterprises globally.", Math.round(W * 0.08), Math.round(H * 0.23), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 10: Call to Action
      {
        name: "Scale Faster",
        background: {
          type: "mesh",
          mesh: { topLeft: "#1e3a8a", topRight: "#2563eb", bottomLeft: "#0f172a", bottomRight: "#1e3a8a" }
        },
        layers: [
          textLayer("Scale Faster\nStarting Today", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Get started today with a risk-free 14-day enterprise trial.", Math.round(W * 0.08), Math.round(H * 0.215), Math.round(W * 0.84), 180, {
            fontSize: 64, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.33), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
    ],
  },

  // ── Template 32 (Neon Cyber) ────────────────────────────────────────────────
  {
    id: "neon-cyberpunk",
    name: "Neon Cyberpunk",
    description: "Deep space dark theme with vibrant neon glow accents & high-contrast cyberpunk typography (10 Screens)",
    category: "Technology",
    layout: "screenshot-float",
    tags: ["neon", "cyber", "cyberpunk", "glow", "dark", "futuristic", "technology"],
    previewColor: "#06b6d4",
    previewGradient: ["#020617", "#000000"],
    screens: [
      // Screen 1: Initiate
      {
        name: "Initiate",
        background: {
          type: "solid",
          color: "#000000",
          pattern: { type: "dots", color: "#06b6d4", opacity: 0.15, size: 2, spacing: 50 }
        },
        layers: [
          shapeLayer("rectangle", 0, H * 0.65, W, 8, "#ec4899", { shadow: { blur: 20, color: "#ec4899", spread: 5, offsetX: 0, offsetY: 0 } }),
          shapeLayer("rectangle", W * 0.82, H * 0.08, 40, 40, "transparent", { stroke: "#06b6d4", strokeWidth: 4, cornerRadius: 8 }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.08), Math.round(W * 0.76), 2200, "Drop Screenshot"),
          textLayer("INITIATE\nSEQUENCE", Math.round(W * 0.08), Math.round(H * 0.70), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#ec4899", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Experience the next generation of uncompromised power.", Math.round(W * 0.08), Math.round(H * 0.83), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#06b6d4", lineHeight: 1.4, letterSpacing: 2
          }),
        ],
      },
      // Screen 2: System Override
      {
        name: "Override",
        background: {
          type: "solid",
          color: "#05050f",
          pattern: { type: "grid", color: "#ec4899", opacity: 0.08, size: 1, spacing: 60 }
        },
        layers: [
          shapeLayer("rectangle", 0, H * 0.28, W, 6, "#06b6d4", { shadow: { blur: 20, color: "#06b6d4", spread: 5, offsetX: 0, offsetY: 0 } }),
          textLayer("OVERRIDE\nSYSTEM", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#06b6d4", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Access unparalleled real-time telemetry and control.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#ec4899", lineHeight: 1.4, letterSpacing: 2
          }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.33), Math.round(W * 0.76), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 3: Hyper Performance
      {
        name: "Hyper Speed",
        background: { type: "solid", color: "#000000" },
        layers: [
          shapeLayer("circle", W * 0.8, H * 0.25, 120, 120, "#ec4899", { shadow: { blur: 30, color: "#ec4899", spread: 10, offsetX: 0, offsetY: 0 } }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.08), Math.round(W * 0.76), 2200, "Drop Screenshot"),
          textLayer("HYPER\nPERFORMANCE", Math.round(W * 0.08), Math.round(H * 0.70), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#06b6d4", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Sub-millisecond execution pipeline for power users.", Math.round(W * 0.08), Math.round(H * 0.83), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#ec4899", lineHeight: 1.4, letterSpacing: 2
          }),
        ],
      },
      // Screen 4: Realtime Telemetry
      {
        name: "Telemetry",
        background: {
          type: "solid",
          color: "#05050f",
          pattern: { type: "dots", color: "#ec4899", opacity: 0.12, size: 2, spacing: 50 }
        },
        layers: [
          shapeLayer("rectangle", 0, H * 0.28, W, 6, "#ec4899", { shadow: { blur: 20, color: "#ec4899", spread: 5, offsetX: 0, offsetY: 0 } }),
          textLayer("REALTIME\nTELEMETRY", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#ec4899", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Live visual spectrums and automated diagnostic feeds.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#06b6d4", lineHeight: 1.4, letterSpacing: 2
          }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.33), Math.round(W * 0.76), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 5: Quantum Sync (Left)
      {
        name: "Quantum (Left)",
        background: { type: "solid", color: "#000000" },
        layers: [
          shapeLayer("rectangle", 0, H * 0.28, W, 6, "#06b6d4", { shadow: { blur: 20, color: "#06b6d4", spread: 5, offsetX: 0, offsetY: 0 } }),
          textLayer("QUANTUM\nSYNC", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#06b6d4", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Distributed network state replicated across nodes.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#ec4899", lineHeight: 1.4, letterSpacing: 2
          }),
          screenshotWithFrame(Math.round(W * 0.38), Math.round(H * 0.33), Math.round(W * 0.76), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 6: Quantum Sync (Right)
      {
        name: "Quantum (Right)",
        background: { type: "solid", color: "#000000" },
        layers: [
          shapeLayer("rectangle", 0, H * 0.28, W, 6, "#06b6d4", { shadow: { blur: 20, color: "#06b6d4", spread: 5, offsetX: 0, offsetY: 0 } }),
          textLayer("ZERO\nLATENCY", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#ec4899", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Direct edge connectivity worldwide.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#06b6d4", lineHeight: 1.4, letterSpacing: 2
          }),
          screenshotWithFrame(Math.round(-W * 0.22), Math.round(H * 0.33), Math.round(W * 0.76), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 7: Encrypted Protocol
      {
        name: "Encryption",
        background: {
          type: "solid",
          color: "#05050f",
          pattern: { type: "grid", color: "#06b6d4", opacity: 0.08, size: 1, spacing: 60 }
        },
        layers: [
          shapeLayer("rectangle", 0, H * 0.65, W, 8, "#06b6d4", { shadow: { blur: 20, color: "#06b6d4", spread: 5, offsetX: 0, offsetY: 0 } }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.08), Math.round(W * 0.76), 2200, "Drop Screenshot"),
          textLayer("ENCRYPTED\nPROTOCOL", Math.round(W * 0.08), Math.round(H * 0.70), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#06b6d4", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Zero-knowledge architecture for total sovereign privacy.", Math.round(W * 0.08), Math.round(H * 0.83), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#ec4899", lineHeight: 1.4, letterSpacing: 2
          }),
        ],
      },
      // Screen 8: Modular Core
      {
        name: "Modular",
        background: { type: "solid", color: "#000000" },
        layers: [
          shapeLayer("rectangle", 0, H * 0.28, W, 6, "#ec4899", { shadow: { blur: 20, color: "#ec4899", spread: 5, offsetX: 0, offsetY: 0 } }),
          textLayer("MODULAR\nCORE", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#ec4899", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Hot-swap modules and customize every interface terminal.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#06b6d4", lineHeight: 1.4, letterSpacing: 2
          }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.33), Math.round(W * 0.76), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 9: Next-gen Architecture
      {
        name: "Architecture",
        background: {
          type: "solid",
          color: "#05050f",
          pattern: { type: "dots", color: "#06b6d4", opacity: 0.15, size: 2, spacing: 50 }
        },
        layers: [
          shapeLayer("rectangle", 0, H * 0.65, W, 8, "#ec4899", { shadow: { blur: 20, color: "#ec4899", spread: 5, offsetX: 0, offsetY: 0 } }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.08), Math.round(W * 0.76), 2200, "Drop Screenshot"),
          textLayer("NEXT-GEN\nSYSTEMS", Math.round(W * 0.08), Math.round(H * 0.70), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#ec4899", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Engineered without legacy compromises.", Math.round(W * 0.08), Math.round(H * 0.83), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#06b6d4", lineHeight: 1.4, letterSpacing: 2
          }),
        ],
      },
      // Screen 10: Enter The Future
      {
        name: "Finale",
        background: { type: "solid", color: "#000000" },
        layers: [
          shapeLayer("rectangle", 0, H * 0.28, W, 8, "#06b6d4", { shadow: { blur: 25, color: "#06b6d4", spread: 8, offsetX: 0, offsetY: 0 } }),
          textLayer("ENTER THE\nFUTURE", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 300, {
            fontSize: 130, fontWeight: 900, color: "#06b6d4", lineHeight: 1.05, letterSpacing: 5
          }),
          textLayer("Initialize your protocol today. Available on all platforms.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 400, color: "#ec4899", lineHeight: 1.4, letterSpacing: 2
          }),
          screenshotWithFrame(Math.round(W * 0.12), Math.round(H * 0.33), Math.round(W * 0.76), 2200, "Drop Screenshot"),
        ],
      },
    ],
  },

  // ── Template 33 (Aurora Flow Dynamic) ───────────────────────────────────────
  {
    id: "template-33",
    name: "Aurora Flow Dynamic",
    description: "Multi-colored ambient mesh glows with expressive curves (10 Screens)",
    category: "Creative",
    layout: "screenshot-float-reverse",
    tags: ["creative", "flow", "dynamic", "asymmetric", "aurora", "ambient"],
    previewColor: "#8b5cf6",
    previewGradient: ["#8b5cf6", "#ec4899"],
    screens: [
      // Screen 1: Stand Out
      {
        name: "Stand Out",
        background: {
          type: "mesh",
          mesh: { topLeft: "#7c3aed", topRight: "#db2777", bottomLeft: "#4f46e5", bottomRight: "#c026d3" }
        },
        layers: [
          shapeLayer("hexagon", W * 0.7, H * 0.05, 180, 180, "rgba(255,255,255,0.2)", { rotation: 15 }),
          textLayer("Stand\nOut.", Math.round(W * 0.58), Math.round(H * 0.14), Math.round(W * 0.38), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, align: "left"
          }),
          textLayer("Unleash the full potential of your creativity today.", Math.round(W * 0.58), Math.round(H * 0.28), Math.round(W * 0.38), 240, {
            fontSize: 56, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, align: "left"
          }),
          screenshotWithFrame(Math.round(-W * 0.15), Math.round(H * 0.25), Math.round(W * 0.8), 2400, "Drop Screenshot"),
        ],
      },
      // Screen 2: Fluid Journey
      {
        name: "Smooth Journey",
        background: {
          type: "mesh",
          mesh: { topLeft: "#9333ea", topRight: "#7c3aed", bottomLeft: "#db2777", bottomRight: "#4f46e5" }
        },
        layers: [
          shapeLayer("diamond", W * 0.1, H * 0.06, 170, 170, "rgba(255,255,255,0.2)", { rotation: -20 }),
          textLayer("Smooth\nJourney", Math.round(W * 0.08), Math.round(H * 0.14), Math.round(W * 0.42), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, align: "left"
          }),
          textLayer("An experience so smooth it feels like pure magic.", Math.round(W * 0.08), Math.round(H * 0.28), Math.round(W * 0.42), 240, {
            fontSize: 56, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, align: "left"
          }),
          screenshotWithFrame(Math.round(W * 0.42), Math.round(H * 0.25), Math.round(W * 0.8), 2400, "Drop Screenshot"),
        ],
      },
      // Screen 3: Infinite Possibilities
      {
        name: "Possibilities",
        background: {
          type: "mesh",
          mesh: { topLeft: "#4f46e5", topRight: "#9333ea", bottomLeft: "#c026d3", bottomRight: "#db2777" }
        },
        layers: [
          shapeLayer("star", W * 0.72, H * 0.06, 160, 160, "rgba(255,255,255,0.25)", { rotation: 18 }),
          textLayer("Infinite\nPower", Math.round(W * 0.58), Math.round(H * 0.14), Math.round(W * 0.38), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, align: "left"
          }),
          textLayer("Flexible tools configured to suit your unique imagination.", Math.round(W * 0.58), Math.round(H * 0.28), Math.round(W * 0.38), 240, {
            fontSize: 56, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, align: "left"
          }),
          screenshotWithFrame(Math.round(-W * 0.15), Math.round(H * 0.25), Math.round(W * 0.8), 2400, "Drop Screenshot"),
        ],
      },
      // Screen 4: Creator Focus
      {
        name: "Creators",
        background: {
          type: "mesh",
          mesh: { topLeft: "#db2777", topRight: "#c026d3", bottomLeft: "#7c3aed", bottomRight: "#4f46e5" }
        },
        layers: [
          shapeLayer("circle", W * 0.1, H * 0.08, 150, 150, "rgba(255,255,255,0.2)"),
          textLayer("Built For\nCreators", Math.round(W * 0.08), Math.round(H * 0.14), Math.round(W * 0.42), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, align: "left"
          }),
          textLayer("Professional studio workflows in the palm of your hand.", Math.round(W * 0.08), Math.round(H * 0.28), Math.round(W * 0.42), 240, {
            fontSize: 56, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, align: "left"
          }),
          screenshotWithFrame(Math.round(W * 0.42), Math.round(H * 0.25), Math.round(W * 0.8), 2400, "Drop Screenshot"),
        ],
      },
      // Screen 5: Flow Split (Left)
      {
        name: "Elegance (Left)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#7c3aed", topRight: "#db2777", bottomLeft: "#4f46e5", bottomRight: "#9333ea" }
        },
        layers: [
          textLayer("Unmatched\nElegance", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("A cohesive visual aesthetic designed to inspire.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.38), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 6: Flow Split (Right)
      {
        name: "Elegance (Right)",
        background: {
          type: "mesh",
          mesh: { topLeft: "#db2777", topRight: "#7c3aed", bottomLeft: "#9333ea", bottomRight: "#4f46e5" }
        },
        layers: [
          textLayer("Every Pixel\nPerfected", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Crafted to make your content look effortlessly stunning.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(-W * 0.22), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
      // Screen 7: Progress
      {
        name: "Progress",
        background: {
          type: "mesh",
          mesh: { topLeft: "#4f46e5", topRight: "#7c3aed", bottomLeft: "#c026d3", bottomRight: "#db2777" }
        },
        layers: [
          shapeLayer("star", W * 0.72, H * 0.06, 170, 170, "rgba(255,255,255,0.25)", { rotation: 12 }),
          textLayer("Daily\nGrowth", Math.round(W * 0.58), Math.round(H * 0.14), Math.round(W * 0.38), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, align: "left"
          }),
          textLayer("Track your evolution with dynamic visual charts.", Math.round(W * 0.58), Math.round(H * 0.28), Math.round(W * 0.38), 240, {
            fontSize: 56, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, align: "left"
          }),
          screenshotWithFrame(Math.round(-W * 0.15), Math.round(H * 0.25), Math.round(W * 0.8), 2400, "Drop Screenshot"),
        ],
      },
      // Screen 8: Visual Audio
      {
        name: "Sensory",
        background: {
          type: "mesh",
          mesh: { topLeft: "#c026d3", topRight: "#4f46e5", bottomLeft: "#db2777", bottomRight: "#7c3aed" }
        },
        layers: [
          shapeLayer("triangle", W * 0.1, H * 0.06, 160, 160, "rgba(255,255,255,0.2)", { rotation: 15 }),
          textLayer("Sensory\nImmersion", Math.round(W * 0.08), Math.round(H * 0.14), Math.round(W * 0.42), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, align: "left"
          }),
          textLayer("Haptic feedback, dynamic soundscapes, and lush animations.", Math.round(W * 0.08), Math.round(H * 0.28), Math.round(W * 0.42), 240, {
            fontSize: 56, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, align: "left"
          }),
          screenshotWithFrame(Math.round(W * 0.42), Math.round(H * 0.25), Math.round(W * 0.8), 2400, "Drop Screenshot"),
        ],
      },
      // Screen 9: Global Love
      {
        name: "Loved Globally",
        background: {
          type: "mesh",
          mesh: { topLeft: "#7c3aed", topRight: "#c026d3", bottomLeft: "#4f46e5", bottomRight: "#db2777" }
        },
        layers: [
          shapeLayer("diamond", W * 0.72, H * 0.06, 160, 160, "rgba(255,255,255,0.25)", { rotation: 25 }),
          textLayer("Loved\nGlobally", Math.round(W * 0.58), Math.round(H * 0.14), Math.round(W * 0.38), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, align: "left"
          }),
          textLayer("Ranked #1 creative app in over 80 countries.", Math.round(W * 0.58), Math.round(H * 0.28), Math.round(W * 0.38), 240, {
            fontSize: 56, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, align: "left"
          }),
          screenshotWithFrame(Math.round(-W * 0.15), Math.round(H * 0.25), Math.round(W * 0.8), 2400, "Drop Screenshot"),
        ],
      },
      // Screen 10: Call to Action
      {
        name: "Get Started",
        background: {
          type: "mesh",
          mesh: { topLeft: "#db2777", topRight: "#7c3aed", bottomLeft: "#4f46e5", bottomRight: "#c026d3" }
        },
        layers: [
          shapeLayer("star", W * 0.75, H * 0.06, 180, 180, "rgba(255,255,255,0.35)", { rotation: 20 }),
          textLayer("Unlock Your\nFull Potential", Math.round(W * 0.08), Math.round(H * 0.08), Math.round(W * 0.84), 360, {
            fontSize: 125, fontWeight: 900, color: "#ffffff", lineHeight: 1.05
          }),
          textLayer("Download today and create something unforgettable.", Math.round(W * 0.08), Math.round(H * 0.205), Math.round(W * 0.84), 180, {
            fontSize: 60, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.4
          }),
          screenshotWithFrame(Math.round(W * 0.08), Math.round(H * 0.32), Math.round(W * 0.84), 2200, "Drop Screenshot"),
        ],
      },
    ],
  },
];

export function createRubikTemplate(config: {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  previewGradient: string[];
  bg: import("@/lib/types").Background;
  fgTitle: string;
  fgSubtitle: string;
  accentStroke?: string;
  accentGlow?: string;
}): Template {
  const { id, name, description, previewColor, previewGradient, bg, fgTitle, fgSubtitle, accentStroke = "rgba(129, 140, 248, 0.65)", accentGlow = "rgba(99, 102, 241, 0.4)" } = config;

  return {
    id,
    name,
    description,
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "studio", "modern", "10 screens", "app store", "google play"],
    previewColor,
    previewGradient,
    screens: [
      // Screen 1: Hero Top Headline
      {
        name: "1 • Hero Overview",
        background: { ...bg },
        layers: [
          textLayer("Everything In\nOne App.", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Fast, intuitive, and beautifully designed for everyone", Math.round(W * 0.1), 420, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 740, 1032, 1960, "Main Screen") as any,
        ],
      },
      // Screen 2: Bottom Headline
      {
        name: "2 • Key Benefits",
        background: { ...bg },
        layers: [
          screenshotWithFrame(129, 120, 1032, 1960, "Feature Showcase") as any,
          textLayer("Effortless Workflow", Math.round(W * 0.08), 2180, Math.round(W * 0.84), 180, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Automate your routine and save hours every single day", Math.round(W * 0.1), 2400, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
        ],
      },
      // Screen 3: Analytics / Stats
      {
        name: "3 • Live Analytics",
        background: { ...bg },
        layers: [
          textLayer("Real-Time\nInsights", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Visual analytics and metrics right at your fingertips", Math.round(W * 0.1), 420, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 740, 1032, 1960, "Analytics Dashboard") as any,
        ],
      },
      // Screen 4: Top Device Feed
      {
        name: "4 • Instant Sync",
        background: { ...bg },
        layers: [
          screenshotWithFrame(129, -200, 1032, 1960, "Smart Feed") as any,
          textLayer("Instant Cloud Sync", Math.round(W * 0.08), 2180, Math.round(W * 0.84), 180, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Stay up to date across all devices without any delay", Math.round(W * 0.1), 2400, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
        ],
      },
      // Screen 5: Dual Showcase
      {
        name: "5 • Dual Perspective",
        background: { ...bg },
        layers: [
          screenshotWithFrame(129, -980, 1032, 1960, "Top View") as any,
          textLayer("Everything in Sync", Math.round(W * 0.08), 1220, Math.round(W * 0.84), 180, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Tailored specifically for speed, comfort, and productivity", Math.round(W * 0.1), 1440, Math.round(W * 0.8), 160, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 1720, 1032, 1960, "Bottom View") as any,
        ],
      },
      // Screen 6: Split Left
      {
        name: "6 • Dark & Light (Left)",
        background: { ...bg },
        layers: [
          textLayer("Dark & Light\nPerfection", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Engineered for readability in any lighting condition", Math.round(W * 0.1), 420, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(380, 780, 1850, 3600, "Dark Mode") as any,
        ],
      },
      // Screen 7: Split Right
      {
        name: "7 • Dark & Light (Right)",
        background: { ...bg },
        layers: [
          textLayer("True OLED\nContrast", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Seamless switch anytime with full system support", Math.round(W * 0.1), 420, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(-940, 780, 1850, 3600, "Light Mode") as any,
        ],
      },
      // Screen 8: Focus Zoom
      {
        name: "8 • Feature Focus",
        background: { ...bg },
        layers: [
          textLayer("Precision in\nEvery Detail", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Zoom into core features with crystal-clear focus", Math.round(W * 0.1), 420, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          shapeLayer("circle", 360, 1150, 570, 570, "rgba(99, 102, 241, 0.12)", {
            stroke: accentStroke,
            strokeWidth: 5,
            shadow: { blur: 40, spread: 0, color: accentGlow, offsetX: 0, offsetY: 0 },
          }) as any,
          screenshotWithFrame(129, 740, 1032, 1960, "Detail View") as any,
        ],
      },
      // Screen 9: Cross-Platform
      {
        name: "9 • Cross-Platform",
        background: { ...bg },
        layers: [
          textLayer("iOS & Android\nReady", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Flawless native experience on every platform", Math.round(W * 0.1), 420, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(40, 1050, 760, 1680, "Android View") as any,
          screenshotWithFrame(480, 800, 780, 1680, "iPhone View") as any,
        ],
      },
      // Screen 10: Multilingual
      {
        name: "10 • Global Reach",
        background: { ...bg },
        layers: [
          textLayer("Loved Across\nThe World", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Rubik", fontSize: 108, fontWeight: 700, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Localized in 30+ languages for a truly global community", Math.round(W * 0.1), 420, Math.round(W * 0.8), 140, {
            fontFamily: "Rubik", fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          flagLayer("🇺🇸", 80, 760, 150, 150) as any,
          flagLayer("🇪🇺", 80, 1140, 150, 150) as any,
          flagLayer("🇯🇵", 80, 1520, 150, 150) as any,
          flagLayer("🇧🇷", 80, 1900, 150, 150) as any,
          flagLayer("🇩🇪", 80, 2280, 150, 150) as any,
          screenshotWithFrame(360, 720, 920, 1940, "Global App") as any,
        ],
      },
    ],
  };
}

export function createAutoLayoutPanoramaTemplate(config: {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  previewGradient: string[];
  bgStops: { color: string; position: number }[];
  fgTitle: string;
  fgSubtitle: string;
}): Template {
  const { id, name, description, previewColor, previewGradient, bgStops, fgTitle, fgSubtitle } = config;

  return {
    id,
    name,
    description,
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["auto-layout", "panorama", "community", "seamless", "app store", "google play"],
    previewColor,
    previewGradient,
    screens: [
      // Screen 1: Single Center Mockup
      {
        name: "1 • Seamless Intro",
        background: {
          type: "gradient",
          gradient: { direction: "to-r", stops: bgStops },
        },
        layers: [
          textLayer("Simple. Fast.\nPowerful.", Math.round(W * 0.08), 140, Math.round(W * 0.84), 200, {
            fontSize: 108, fontWeight: 800, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Everything you need to succeed in one streamlined tool", Math.round(W * 0.1), 380, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(181, 560, 929, 1952, "Overview Screen") as any,
        ],
      },
      // Screen 2: Panorama Flow 1 (Left Part)
      {
        name: "2 • Panorama Flow (Part 1)",
        background: {
          type: "gradient",
          gradient: { direction: "to-r", stops: bgStops },
        },
        layers: [
          textLayer("Connect & Collaborate", Math.round(W * 0.08), 140, Math.round(W * 0.84), 200, {
            fontSize: 108, fontWeight: 800, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Work together in real-time across teams and devices", Math.round(W * 0.1), 380, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(108, 560, 1394, 2258, "Collaboration Feed") as any,
          screenshotWithFrame(1182, 540, 1271, 2217, "Activity View") as any,
        ],
      },
      // Screen 3: Panorama Flow 1 (Right Part Continuation)
      {
        name: "3 • Panorama Flow (Part 2)",
        background: {
          type: "gradient",
          gradient: { direction: "to-r", stops: bgStops },
        },
        layers: [
          textLayer("Smart Automation", Math.round(W * 0.08), 140, Math.round(W * 0.84), 200, {
            fontSize: 108, fontWeight: 800, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Save hours every week with automated workflows", Math.round(W * 0.1), 380, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(-1182, 560, 1394, 2258, "Collaboration Feed") as any,
          screenshotWithFrame(-108, 540, 1271, 2217, "Activity View") as any,
        ],
      },
      // Screen 4: Panorama Flow 2 (Part 1)
      {
        name: "4 • Deep Insights (Part 1)",
        background: {
          type: "gradient",
          gradient: { direction: "to-r", stops: bgStops },
        },
        layers: [
          textLayer("Live Performance", Math.round(W * 0.08), 140, Math.round(W * 0.84), 200, {
            fontSize: 108, fontWeight: 800, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Monitor key indicators and growth trends seamlessly", Math.round(W * 0.1), 380, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(127, 480, 1403, 2359, "Analytics View") as any,
          screenshotWithFrame(1179, 520, 1296, 2279, "Metrics View") as any,
        ],
      },
      // Screen 5: Panorama Flow 2 (Part 2 Continuation)
      {
        name: "5 • Deep Insights (Part 2)",
        background: {
          type: "gradient",
          gradient: { direction: "to-r", stops: bgStops },
        },
        layers: [
          textLayer("Secure Cloud Vault", Math.round(W * 0.08), 140, Math.round(W * 0.84), 200, {
            fontSize: 108, fontWeight: 800, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Enterprise grade encryption protecting your sensitive data", Math.round(W * 0.1), 380, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(-1163, 480, 1403, 2359, "Analytics View") as any,
          screenshotWithFrame(-111, 520, 1296, 2279, "Metrics View") as any,
        ],
      },
      // Screen 6: Final Single Phone Showcase
      {
        name: "6 • Start Today",
        background: {
          type: "gradient",
          gradient: { direction: "to-r", stops: bgStops },
        },
        layers: [
          textLayer("Ready to Launch?", Math.round(W * 0.08), 140, Math.round(W * 0.84), 200, {
            fontSize: 108, fontWeight: 800, align: "center", color: fgTitle, lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Join thousands of creators building the future today", Math.round(W * 0.1), 380, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: fgSubtitle, lineHeight: 1.3
          }) as any,
          screenshotWithFrame(65, 520, 1160, 2148, "Final Call to Action") as any,
        ],
      },
    ],
  };
}

function createSoundwaveBars(baseY = 550, count = 28) {
  const bars: any[] = [];
  const barWidth = 22;
  const gap = 20;
  const startX = 65;
  const heights = [180, 260, 420, 310, 560, 780, 620, 900, 720, 540, 850, 640, 430, 320, 600, 820, 950, 710, 490, 380, 520, 740, 610, 450, 300, 220, 160, 120];
  for (let i = 0; i < count; i++) {
    const h = heights[i % heights.length];
    bars.push(
      shapeLayer("rounded-rectangle", startX + i * (barWidth + gap), baseY + (950 - h) / 2, barWidth, h, "rgba(255, 255, 255, 0.08)", { cornerRadius: 11 })
    );
  }
  return bars;
}

export const COMMUNITY_TEMPLATES: Template[] = [
  // ── Amber Sonic Flow (Figma Community Golden Audio Kit) ──────────────────────
  {
    id: "community-amber-sonic-flow",
    name: "Amber Sonic Flow",
    description: "Warm golden-amber soundwave aesthetic with tilted panoramic hero & bottom feature captions (5 Screens)",
    category: "Community",
    layout: "screenshot-top",
    tags: ["community", "amber", "golden", "music", "audio", "podcast", "streaming", "sonic", "figma", "5 screens"],
    previewColor: "#EA9E24",
    previewGradient: ["#EA9E24", "#D97706"],
    screens: [
      // Screen 1: Hero Panoramic 1/2
      {
        name: "1 • Hero Panoramic (Left)",
        background: {
          type: "gradient",
          gradient: { direction: "to-br", stops: [{ color: "#EA9E24", position: 0 }, { color: "#D97706", position: 100 }] },
        },
        layers: [
          ...createSoundwaveBars(650, 28),
          textLayer("A neat attractive\napp title here", Math.round(W * 0.08), 220, Math.round(W * 0.84), 320, {
            fontFamily: "Montserrat",
            fontSize: 115,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.08,
            letterSpacing: -1,
            align: "left",
          }) as any,
          screenshotWithFrame(300, 780, 1050, 2200, "Drop screenshot here", -28) as any,
        ],
      },
      // Screen 2: Hero Panoramic 2/2
      {
        name: "2 • Hero Panoramic (Right)",
        background: {
          type: "gradient",
          gradient: { direction: "to-br", stops: [{ color: "#EA9E24", position: 0 }, { color: "#D97706", position: 100 }] },
        },
        layers: [
          ...createSoundwaveBars(650, 28),
          textLayer("Feature title here", Math.round(W * 0.08), 220, Math.round(W * 0.84), 220, {
            fontFamily: "Montserrat",
            fontSize: 100,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.12,
            letterSpacing: -1,
            align: "left",
          }) as any,
          textLayer("Some sub title explaining the benefits.", Math.round(W * 0.08), 470, Math.round(W * 0.84), 160, {
            fontFamily: "Montserrat",
            fontSize: 54,
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.94)",
            lineHeight: 1.3,
            align: "left",
          }) as any,
          screenshotWithFrame(-260, 420, 1050, 2200, "Drop screenshot here", -28) as any,
        ],
      },
      // Screen 3: Feature 1 Top Mockup + Bottom Text
      {
        name: "3 • Feature Showcase 1",
        background: {
          type: "gradient",
          gradient: { direction: "to-br", stops: [{ color: "#EA9E24", position: 0 }, { color: "#D97706", position: 100 }] },
        },
        layers: [
          ...createSoundwaveBars(300, 28),
          screenshotWithFrame(182, 190, 926, 1850, "Drop screenshot here") as any,
          textLayer("Feature title here", Math.round(W * 0.08), 2150, Math.round(W * 0.84), 140, {
            fontFamily: "Montserrat",
            fontSize: 96,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: -1,
            align: "center",
          }) as any,
          textLayer("Some sub title explaining the benefits.", Math.round(W * 0.08), 2310, Math.round(W * 0.84), 140, {
            fontFamily: "Montserrat",
            fontSize: 58,
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.94)",
            lineHeight: 1.3,
            align: "center",
          }) as any,
        ],
      },
      // Screen 4: Feature 2 Top Mockup + Bottom Text
      {
        name: "4 • Feature Showcase 2",
        background: {
          type: "gradient",
          gradient: { direction: "to-br", stops: [{ color: "#EA9E24", position: 0 }, { color: "#D97706", position: 100 }] },
        },
        layers: [
          ...createSoundwaveBars(300, 28),
          screenshotWithFrame(182, 190, 926, 1850, "Drop screenshot here") as any,
          textLayer("Feature title here", Math.round(W * 0.08), 2150, Math.round(W * 0.84), 140, {
            fontFamily: "Montserrat",
            fontSize: 96,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: -1,
            align: "center",
          }) as any,
          textLayer("Some sub title explaining the benefits.", Math.round(W * 0.08), 2310, Math.round(W * 0.84), 140, {
            fontFamily: "Montserrat",
            fontSize: 58,
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.94)",
            lineHeight: 1.3,
            align: "center",
          }) as any,
        ],
      },
      // Screen 5: Feature 3 Top Mockup + Bottom Text
      {
        name: "5 • Feature Showcase 3",
        background: {
          type: "gradient",
          gradient: { direction: "to-br", stops: [{ color: "#EA9E24", position: 0 }, { color: "#D97706", position: 100 }] },
        },
        layers: [
          ...createSoundwaveBars(300, 28),
          screenshotWithFrame(182, 190, 926, 1850, "Drop screenshot here") as any,
          textLayer("Feature title here", Math.round(W * 0.08), 2150, Math.round(W * 0.84), 140, {
            fontFamily: "Montserrat",
            fontSize: 96,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: -1,
            align: "center",
          }) as any,
          textLayer("Some sub title explaining the benefits.", Math.round(W * 0.08), 2310, Math.round(W * 0.84), 140, {
            fontFamily: "Montserrat",
            fontSize: 58,
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.94)",
            lineHeight: 1.3,
            align: "center",
          }) as any,
        ],
      },
    ],
  },

  // ── 1. Minimalist Pure Dark (6 Screens - Alternating Rhythm) ─────────────────
  {
    id: "community-pure-dark-minimal",
    name: "Minimalist Pure Dark",
    description: "Ultra-clean pure black theme with rhythmic alternating top and bottom phone layout (6 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "minimalist", "dark", "pure black", "clean", "figma", "6 screens"],
    previewColor: "#010101",
    previewGradient: ["#010101", "#18181b"],
    screens: [
      {
        name: "1 • Feature Hero (Top Text)",
        background: { type: "solid", color: "#010101" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(255, 255, 255, 0.68)", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "2 • Feature Focus (Bottom Text)",
        background: { type: "solid", color: "#010101" },
        layers: [
          screenshotWithFrame(182, 160, 926, 1850, "Drop screenshot here") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 2120, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 2370, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(255, 255, 255, 0.68)", lineHeight: 1.35, align: "center",
          }) as any,
        ],
      },
      {
        name: "3 • Feature 3 (Top Text)",
        background: { type: "solid", color: "#010101" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(255, 255, 255, 0.68)", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "4 • Feature 4 (Bottom Text)",
        background: { type: "solid", color: "#010101" },
        layers: [
          screenshotWithFrame(182, 160, 926, 1850, "Drop screenshot here") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 2120, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 2370, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(255, 255, 255, 0.68)", lineHeight: 1.35, align: "center",
          }) as any,
        ],
      },
      {
        name: "5 • Feature 5 (Top Text)",
        background: { type: "solid", color: "#010101" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(255, 255, 255, 0.68)", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "6 • Feature 6 (Bottom Text)",
        background: { type: "solid", color: "#010101" },
        layers: [
          screenshotWithFrame(182, 160, 926, 1850, "Drop screenshot here") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 2120, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 2370, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(255, 255, 255, 0.68)", lineHeight: 1.35, align: "center",
          }) as any,
        ],
      },
    ],
  },

  // ── 2. Lifestyle Warm Beige (6 Screens) ──────────────────────────────────────
  {
    id: "community-lifestyle-warm-beige",
    name: "Lifestyle Warm Beige",
    description: "Organic warm linen aesthetic with deep espresso typography and clean device frames (6 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "lifestyle", "beige", "linen", "organic", "minimal", "figma", "6 screens"],
    previewColor: "#E3E2DA",
    previewGradient: ["#E8E6DF", "#DFDCD3"],
    screens: [
      {
        name: "1 • Brand Hero",
        background: { type: "solid", color: "#E3E2DA" },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.38), 180, Math.round(W * 0.24), 60, "rgba(28, 25, 23, 0.08)", { cornerRadius: 30 }) as any,
          textLayer("LIFESTYLE", Math.round(W * 0.38), 195, Math.round(W * 0.24), 30, {
            fontFamily: "Inter", fontSize: 26, fontWeight: 800, color: "#1C1917", letterSpacing: 3, align: "center",
          }) as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 280, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#1C1917", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 530, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 500, color: "#57534E", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 740, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "2 • Daily Routine",
        background: { type: "solid", color: "#E3E2DA" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#1C1917", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 500, color: "#57534E", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "3 • Seamless Habits",
        background: { type: "solid", color: "#E3E2DA" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#1C1917", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 500, color: "#57534E", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "4 • Peaceful Mind",
        background: { type: "solid", color: "#E3E2DA" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#1C1917", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 500, color: "#57534E", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "5 • Journal & Reflect",
        background: { type: "solid", color: "#E3E2DA" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#1C1917", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 500, color: "#57534E", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "6 • Core Values",
        background: { type: "solid", color: "#E3E2DA" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#1C1917", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 500, color: "#57534E", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
    ],
  },

  // ── 3. Ambient Glow Studio (6 Screens) ───────────────────────────────────────
  {
    id: "community-ambient-glow-studio",
    name: "Ambient Gradient Glow Studio",
    description: "Crisp white canvas with glowing ambient light halos behind each phone mockup (6 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "glow", "ambient", "light", "modern", "figma", "6 screens"],
    previewColor: "#FFFFFF",
    previewGradient: ["#FFFFFF", "#F4F4F5"],
    screens: [
      {
        name: "1 • Violet Halo",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("circle", 145, 1100, 1000, 1000, "rgba(168, 85, 247, 0.28)") as any,
          textLayer("A super helpful\napp feature goes here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "#71717A", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "2 • Blue Sky Halo",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("circle", 145, 1100, 1000, 1000, "rgba(59, 130, 246, 0.28)") as any,
          textLayer("A super helpful\napp feature goes here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "#71717A", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "3 • Sunset Rose Halo",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("circle", 145, 1100, 1000, 1000, "rgba(244, 63, 94, 0.28)") as any,
          textLayer("A super helpful\napp feature goes here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "#71717A", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "4 • Emerald Teal Halo",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("circle", 145, 1100, 1000, 1000, "rgba(16, 185, 129, 0.28)") as any,
          textLayer("A super helpful\napp feature goes here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "#71717A", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "5 • Amber Gold Halo",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("circle", 145, 1100, 1000, 1000, "rgba(245, 158, 11, 0.28)") as any,
          textLayer("A super helpful\napp feature goes here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "#71717A", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "6 • Royal Indigo Halo",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("circle", 145, 1100, 1000, 1000, "rgba(99, 102, 241, 0.28)") as any,
          textLayer("A super helpful\napp feature goes here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "#71717A", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
    ],
  },

  // ── 4. Bottom Color-Bar Studio (6 Screens) ──────────────────────────────────
  {
    id: "community-bottom-colorbar-studio",
    name: "Bottom Color-Bar Studio",
    description: "Crisp white canvas with bold geometric bottom color blocks and centered mockups (6 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "colorbar", "modern", "geometric", "clean", "figma", "6 screens"],
    previewColor: "#FFFFFF",
    previewGradient: ["#FFFFFF", "#3B82F6"],
    screens: [
      {
        name: "1 • Emerald Foundation",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("rectangle", 0, 2150, W, 646, "#10B981") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          screenshotWithFrame(182, 540, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "2 • Amber Gold Foundation",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("rectangle", 0, 2150, W, 646, "#F59E0B") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          screenshotWithFrame(182, 540, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "3 • Vibrant Orange Foundation",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("rectangle", 0, 2150, W, 646, "#F97316") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          screenshotWithFrame(182, 540, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "4 • Coral Rose Foundation",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("rectangle", 0, 2150, W, 646, "#FB7185") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          screenshotWithFrame(182, 540, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "5 • Royal Blue Foundation",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("rectangle", 0, 2150, W, 646, "#3B82F6") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          screenshotWithFrame(182, 540, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "6 • Violet Purple Foundation",
        background: { type: "solid", color: "#FFFFFF" },
        layers: [
          shapeLayer("rectangle", 0, 2150, W, 646, "#A855F7") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#09090B", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          screenshotWithFrame(182, 540, 926, 1950, "Drop screenshot here") as any,
        ],
      },
    ],
  },

  // ── 5. Dynamic Cyan Navy Panorama (6 Screens) ───────────────────────────────
  {
    id: "community-dynamic-cyan-navy",
    name: "Dynamic Cyan Navy",
    description: "High-tech deep oceanic navy with continuous tilted panoramic flow & glowing cyan accents (6 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "navy", "cyan", "panoramic", "tech", "modern", "figma", "6 screens"],
    previewColor: "#0D3B5C",
    previewGradient: ["#0D3B5C", "#082032"],
    screens: [
      {
        name: "1 • Panorama Tilted (Part 1)",
        background: { type: "solid", color: "#0D3B5C" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(103, 232, 249, 0.85)", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(480, 780, 1050, 2200, "Drop screenshot here", -25) as any,
        ],
      },
      {
        name: "2 • Panorama Tilted (Part 2)",
        background: { type: "solid", color: "#0D3B5C" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(103, 232, 249, 0.85)", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(-320, 460, 1050, 2200, "Drop screenshot here", -25) as any,
        ],
      },
      {
        name: "3 • Tilted Feature Focus",
        background: { type: "solid", color: "#0D3B5C" },
        layers: [
          screenshotWithFrame(182, 160, 926, 1850, "Drop screenshot here", 5) as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 2120, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 2370, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(103, 232, 249, 0.85)", lineHeight: 1.35, align: "center",
          }) as any,
        ],
      },
      {
        name: "4 • Upright Feature View",
        background: { type: "solid", color: "#0D3B5C" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(103, 232, 249, 0.85)", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
      {
        name: "5 • High-Contrast View",
        background: { type: "solid", color: "#0D3B5C" },
        layers: [
          screenshotWithFrame(182, 160, 926, 1850, "Drop screenshot here") as any,
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 2120, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 2370, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(103, 232, 249, 0.85)", lineHeight: 1.35, align: "center",
          }) as any,
        ],
      },
      {
        name: "6 • Final Call to Action",
        background: { type: "solid", color: "#0D3B5C" },
        layers: [
          textLayer("A super helpful\napp feature", Math.round(W * 0.08), 180, Math.round(W * 0.84), 220, {
            fontFamily: "Inter", fontSize: 104, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5, align: "center",
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.1), 430, Math.round(W * 0.8), 140, {
            fontFamily: "Inter", fontSize: 46, fontWeight: 400, color: "rgba(103, 232, 249, 0.85)", lineHeight: 1.35, align: "center",
          }) as any,
          screenshotWithFrame(182, 680, 926, 1950, "Drop screenshot here") as any,
        ],
      },
    ],
  },
  createRubikTemplate({
    id: "community-rubik-dark",
    name: "Studio Modern Dark",
    description: "Sleek dark gradient theme with panoramic flow and modern typography (10 Screens)",
    previewColor: "#18181b",
    previewGradient: ["#1e1e1e", "#3f3f46"],
    bg: {
      type: "gradient",
      gradient: {
        direction: "to-b",
        stops: [{ color: "#18181b", position: 0 }, { color: "#27272a", position: 100 }],
      },
    },
    fgTitle: "#ffffff",
    fgSubtitle: "rgba(255, 255, 255, 0.82)",
    accentStroke: "rgba(161, 161, 170, 0.6)",
    accentGlow: "rgba(255, 255, 255, 0.2)",
  }),
  createRubikTemplate({
    id: "community-rubik-light",
    name: "Studio Clean Light",
    description: "Clean minimalist light palette with crisp typography (10 Screens)",
    previewColor: "#f8fafc",
    previewGradient: ["#f8fafc", "#e2e8f0"],
    bg: {
      type: "gradient",
      gradient: {
        direction: "to-b",
        stops: [{ color: "#f8fafc", position: 0 }, { color: "#e2e8f0", position: 100 }],
      },
    },
    fgTitle: "#0f172a",
    fgSubtitle: "rgba(15, 23, 42, 0.72)",
    accentStroke: "rgba(99, 102, 241, 0.6)",
    accentGlow: "rgba(99, 102, 241, 0.25)",
  }),
  createRubikTemplate({
    id: "community-rubik-vibrant",
    name: "Studio Vibrant Sunset",
    description: "Rich sunset gradient with bold presence and high contrast (10 Screens)",
    previewColor: "#312e81",
    previewGradient: ["#312e81", "#701a75"],
    bg: {
      type: "gradient",
      gradient: {
        direction: "to-br",
        stops: [{ color: "#312e81", position: 0 }, { color: "#701a75", position: 100 }],
      },
    },
    fgTitle: "#ffffff",
    fgSubtitle: "rgba(255, 255, 255, 0.88)",
    accentStroke: "rgba(244, 63, 94, 0.7)",
    accentGlow: "rgba(244, 63, 94, 0.4)",
  }),
  createAutoLayoutPanoramaTemplate({
    id: "community-autolayout-ocean",
    name: "Auto-Layout Panorama Ocean",
    description: "Continuous panorama flow with 6 seamless screen transitions (6 Screens)",
    previewColor: "#32508c",
    previewGradient: ["#32508c", "#4494b9"],
    bgStops: [
      { color: "#32508c", position: 0 },
      { color: "#4494b9", position: 100 },
    ],
    fgTitle: "#ffffff",
    fgSubtitle: "rgba(255, 255, 255, 0.85)",
  }),
  createAutoLayoutPanoramaTemplate({
    id: "community-autolayout-dark",
    name: "Auto-Layout Panorama Dark",
    description: "Seamless deep charcoal & titanium continuous panorama flow (6 Screens)",
    previewColor: "#090d16",
    previewGradient: ["#090d16", "#1e293b"],
    bgStops: [
      { color: "#090d16", position: 0 },
      { color: "#1e293b", position: 100 },
    ],
    fgTitle: "#ffffff",
    fgSubtitle: "rgba(255, 255, 255, 0.82)",
  }),
  createAutoLayoutPanoramaTemplate({
    id: "community-autolayout-sunset",
    name: "Auto-Layout Panorama Sunset",
    description: "Vivid magenta & rose continuous panorama flow (6 Screens)",
    previewColor: "#4c0519",
    previewGradient: ["#4c0519", "#831843"],
    bgStops: [
      { color: "#4c0519", position: 0 },
      { color: "#831843", position: 100 },
    ],
    fgTitle: "#ffffff",
    fgSubtitle: "rgba(255, 255, 255, 0.88)",
  }),

  // ── Bold Multicolor Pop ───────────────────────────────────────────────────
  {
    id: "community-bold-multicolor",
    name: "Bold Multicolor Pop",
    description: "High-contrast dynamic solid background shifts per screen (5 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "multicolor", "bold", "vibrant", "pop", "5 screens"],
    previewColor: "#c7321a",
    previewGradient: ["#c7321a", "#06408a"],
    screens: [
      {
        name: "1 • Crimson Hero",
        background: { type: "solid", color: "#c7321a" },
        layers: [
          textLayer("Your Catchy\nHeadline Here.", Math.round(W * 0.08), 180, Math.round(W * 0.84), 260, {
            fontSize: 112, fontWeight: 800, align: "left", color: "#ffffff", lineHeight: 1.08, letterSpacing: -1.5
          }) as any,
          textLayer("Fast and reliable solution for everyday needs", Math.round(W * 0.08), 470, Math.round(W * 0.84), 140, {
            fontSize: 48, fontWeight: 400, align: "left", color: "rgba(255,255,255,0.85)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 780, 1032, 1950, "App Overview") as any,
        ],
      },
      {
        name: "2 • Cobalt Showcase",
        background: { type: "solid", color: "#06408a" },
        layers: [
          textLayer("Showcase", Math.round(W * 0.08), 160, Math.round(W * 0.84), 140, {
            fontSize: 116, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Your Feature In Full Detail", Math.round(W * 0.08), 320, Math.round(W * 0.84), 120, {
            fontSize: 52, fontWeight: 600, align: "center", color: "#eef7ff", lineHeight: 1.25
          }) as any,
          screenshotWithFrame(129, 680, 1032, 1950, "Showcase Feature") as any,
        ],
      },
      {
        name: "3 • Emerald Highlight",
        background: { type: "solid", color: "#006847" },
        layers: [
          textLayer("Highlight", Math.round(W * 0.08), 160, Math.round(W * 0.84), 140, {
            fontSize: 116, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Something Truly Incredible", Math.round(W * 0.08), 320, Math.round(W * 0.84), 120, {
            fontSize: 52, fontWeight: 600, align: "center", color: "#eef7ff", lineHeight: 1.25
          }) as any,
          screenshotWithFrame(129, 680, 1032, 1950, "Highlight Screen") as any,
        ],
      },
      {
        name: "4 • Navy Statement",
        background: { type: "solid", color: "#232669" },
        layers: [
          textLayer("Make Bold", Math.round(W * 0.08), 160, Math.round(W * 0.84), 140, {
            fontSize: 116, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Statements That Resonate", Math.round(W * 0.08), 320, Math.round(W * 0.84), 120, {
            fontSize: 52, fontWeight: 600, align: "center", color: "#eef7ff", lineHeight: 1.25
          }) as any,
          screenshotWithFrame(129, 680, 1032, 1950, "Statement Screen") as any,
        ],
      },
      {
        name: "5 • Royal Benefits",
        background: { type: "solid", color: "#7035a8" },
        layers: [
          textLayer("Describe", Math.round(W * 0.08), 160, Math.round(W * 0.84), 140, {
            fontSize: 116, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Key Benefits & Outcomes", Math.round(W * 0.08), 320, Math.round(W * 0.84), 120, {
            fontSize: 52, fontWeight: 600, align: "center", color: "#eef7ff", lineHeight: 1.25
          }) as any,
          screenshotWithFrame(129, 680, 1032, 1950, "Benefits Screen") as any,
        ],
      },
    ],
  },

  // ── Midnight Cyber Split ──────────────────────────────────────────────────
  {
    id: "community-midnight-split",
    name: "Midnight Cyber Split",
    description: "Deep midnight purple with split panorama and alternating views (5 Screens)",
    category: "Community",
    layout: "screenshot-split",
    tags: ["community", "midnight", "split", "cyber", "dark", "5 screens"],
    previewColor: "#1e0b3a",
    previewGradient: ["#1e0b3a", "#3b0764"],
    screens: [
      {
        name: "1 • Split Giant Phone (Left)",
        background: { type: "solid", color: "#1e0b3a" },
        layers: [
          textLayer("Your Catchy\nHeadline Here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 104, fontWeight: 800, align: "left", color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Unmatched clarity and futuristic dark aesthetics", Math.round(W * 0.08), 410, Math.round(W * 0.84), 140, {
            fontSize: 48, fontWeight: 400, align: "left", color: "rgba(255,255,255,0.8)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(480, 750, 1550, 2600, "Dark UI Left") as any,
        ],
      },
      {
        name: "2 • Split Giant Phone (Right)",
        background: { type: "solid", color: "#1e0b3a" },
        layers: [
          textLayer("Highlight Your\nBest Feature.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 104, fontWeight: 800, align: "right", color: "#ffffff", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Engineered for speed, security, and elegance", Math.round(W * 0.08), 410, Math.round(W * 0.84), 140, {
            fontSize: 48, fontWeight: 400, align: "right", color: "rgba(255,255,255,0.8)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(-880, 750, 1550, 2600, "Dark UI Right") as any,
        ],
      },
      {
        name: "3 • Top Feed Flow",
        background: { type: "solid", color: "#1e0b3a" },
        layers: [
          screenshotWithFrame(129, -260, 1032, 2190, "Feed Screen") as any,
          textLayer("Powerful Analytics\nAt Your Fingertips", Math.round(W * 0.08), 2140, Math.round(W * 0.84), 220, {
            fontSize: 100, fontWeight: 800, align: "left", color: "#ffffff", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
        ],
      },
      {
        name: "4 • Bottom Details",
        background: { type: "solid", color: "#1e0b3a" },
        layers: [
          textLayer("Briefly Explain\nYour Feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 100, fontWeight: 800, align: "right", color: "#ffffff", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          screenshotWithFrame(129, 850, 1032, 2190, "Details Screen") as any,
        ],
      },
      {
        name: "5 • Instant Access",
        background: { type: "solid", color: "#1e0b3a" },
        layers: [
          screenshotWithFrame(129, -260, 1032, 2190, "Instant Access Screen") as any,
          textLayer("Instant Access\nEverywhere You Go", Math.round(W * 0.08), 2140, Math.round(W * 0.84), 220, {
            fontSize: 100, fontWeight: 800, align: "left", color: "#ffffff", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
        ],
      },
    ],
  },

  // ── Matcha Pastel Clean ───────────────────────────────────────────────────
  {
    id: "community-matcha-clean",
    name: "Matcha Pastel Clean",
    description: "Warm linen cream palette with rich forest green typography (5 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "matcha", "clean", "minimal", "pastel", "5 screens"],
    previewColor: "#f6f4e8",
    previewGradient: ["#f6f4e8", "#e7e4cf"],
    screens: [
      {
        name: "1 • Warm Hero",
        background: { type: "solid", color: "#f6f4e8" },
        layers: [
          textLayer("Your Catchy\nHeadline Here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 800, align: "center", color: "#003513", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("A fresh, organic, and clean interface for modern daily workflows", Math.round(W * 0.1), 400, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: "rgba(0, 53, 19, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2030, "Clean Home") as any,
        ],
      },
      {
        name: "2 • Core Feature",
        background: { type: "solid", color: "#f6f4e8" },
        layers: [
          textLayer("Highlight Your\nCore Feature", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 800, align: "center", color: "#003513", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Simple navigation and effortless interactions every day", Math.round(W * 0.1), 400, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: "rgba(0, 53, 19, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2030, "Core Screen") as any,
        ],
      },
      {
        name: "3 • Live Stats",
        background: { type: "solid", color: "#f6f4e8" },
        layers: [
          textLayer("Powerful Stats\nIn Real-Time", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 800, align: "center", color: "#003513", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Gain deep clarity into your habits, milestones, and goals", Math.round(W * 0.1), 400, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: "rgba(0, 53, 19, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2030, "Stats Screen") as any,
        ],
      },
      {
        name: "4 • Smart Reminders",
        background: { type: "solid", color: "#f6f4e8" },
        layers: [
          textLayer("Smart Habits &\nDaily Streaks", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 800, align: "center", color: "#003513", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Stay motivated with gentle notifications and streak rewards", Math.round(W * 0.1), 400, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: "rgba(0, 53, 19, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2030, "Habits Screen") as any,
        ],
      },
      {
        name: "5 • Cloud Sync",
        background: { type: "solid", color: "#f6f4e8" },
        layers: [
          textLayer("Seamless Cloud\nBackup Included", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 800, align: "center", color: "#003513", lineHeight: 1.12, letterSpacing: -1.5
          }) as any,
          textLayer("Never lose your data with instant end-to-end sync", Math.round(W * 0.1), 400, Math.round(W * 0.8), 140, {
            fontSize: 48, fontWeight: 400, align: "center", color: "rgba(0, 53, 19, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2030, "Cloud Screen") as any,
        ],
      },
    ],
  },

  // ── Lavender Tech Zigzag ──────────────────────────────────────────────────
  {
    id: "community-lavender-tech",
    name: "Lavender Tech Zigzag",
    description: "Alternating top/bottom layout in soft lavender and royal violet (5 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "lavender", "zigzag", "pastel", "tech", "5 screens"],
    previewColor: "#f5e2fe",
    previewGradient: ["#f5e2fe", "#e9d5ff"],
    screens: [
      {
        name: "1 • Feature Hero",
        background: { type: "solid", color: "#f5e2fe" },
        layers: [
          textLayer("Feature Name", Math.round(W * 0.08), 140, Math.round(W * 0.84), 160, {
            fontSize: 120, fontWeight: 800, align: "left", color: "#5100a6", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Fast, secure, and delightfully simple for everyone", Math.round(W * 0.08), 320, Math.round(W * 0.84), 120, {
            fontSize: 50, fontWeight: 400, align: "left", color: "rgba(81, 0, 166, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 780, 1032, 2190, "Hero Screen") as any,
        ],
      },
      {
        name: "2 • Top Phone Feed",
        background: { type: "solid", color: "#f5e2fe" },
        layers: [
          screenshotWithFrame(129, -220, 1032, 2190, "New Features") as any,
          textLayer("What's New", Math.round(W * 0.08), 2140, Math.round(W * 0.84), 160, {
            fontSize: 120, fontWeight: 800, align: "left", color: "#5100a6", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Redesigned components built for maximum responsiveness", Math.round(W * 0.08), 2320, Math.round(W * 0.84), 120, {
            fontSize: 48, fontWeight: 400, align: "left", color: "rgba(81, 0, 166, 0.75)", lineHeight: 1.3
          }) as any,
        ],
      },
      {
        name: "3 • Premium Tools",
        background: { type: "solid", color: "#f5e2fe" },
        layers: [
          textLayer("Premium Tools", Math.round(W * 0.08), 140, Math.round(W * 0.84), 160, {
            fontSize: 120, fontWeight: 800, align: "left", color: "#5100a6", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Professional grade utilities right on your mobile device", Math.round(W * 0.08), 320, Math.round(W * 0.84), 120, {
            fontSize: 50, fontWeight: 400, align: "left", color: "rgba(81, 0, 166, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 780, 1032, 2190, "Tools Screen") as any,
        ],
      },
      {
        name: "4 • Smart Automation",
        background: { type: "solid", color: "#f5e2fe" },
        layers: [
          screenshotWithFrame(129, -220, 1032, 2190, "Smart Automation") as any,
          textLayer("Smart Flow", Math.round(W * 0.08), 2140, Math.round(W * 0.84), 160, {
            fontSize: 120, fontWeight: 800, align: "left", color: "#5100a6", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Let smart presets do the heavy lifting automatically", Math.round(W * 0.08), 2320, Math.round(W * 0.84), 120, {
            fontSize: 48, fontWeight: 400, align: "left", color: "rgba(81, 0, 166, 0.75)", lineHeight: 1.3
          }) as any,
        ],
      },
      {
        name: "5 • Core Benefits",
        background: { type: "solid", color: "#f5e2fe" },
        layers: [
          textLayer("Core Benefits", Math.round(W * 0.08), 140, Math.round(W * 0.84), 160, {
            fontSize: 120, fontWeight: 800, align: "left", color: "#5100a6", lineHeight: 1.1, letterSpacing: -1.5
          }) as any,
          textLayer("Boost your daily productivity and achieve your goals", Math.round(W * 0.08), 320, Math.round(W * 0.84), 120, {
            fontSize: 50, fontWeight: 400, align: "left", color: "rgba(81, 0, 166, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 780, 1032, 2190, "Benefits Screen") as any,
        ],
      },
    ],
  },

  // ── Neon Acid Chartreuse ──────────────────────────────────────────────────
  {
    id: "community-neon-acid",
    name: "Neon Acid Energy",
    description: "High-voltage lime, acid yellow & deep ink contrast palette (5 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "neon", "acid", "chartreuse", "electric", "5 screens"],
    previewColor: "#c7f54a",
    previewGradient: ["#c7f54a", "#00c805"],
    screens: [
      {
        name: "1 • Electric Hero",
        background: { type: "solid", color: "#c7f54a" },
        layers: [
          textLayer("Next-Gen Mobile\nExperience.", Math.round(W * 0.08), 140, Math.round(W * 0.84), 220, {
            fontSize: 110, fontWeight: 900, align: "center", color: "#130f1e", lineHeight: 1.08, letterSpacing: -2
          }) as any,
          shapeLayer("rounded-rectangle", Math.round(W * 0.32), 400, Math.round(W * 0.36), 76, "#130f1e", { cornerRadius: 50 }) as any,
          textLayer("★★★★★ 4.9 Rating", Math.round(W * 0.32), 416, Math.round(W * 0.36), 76, {
            fontSize: 38, fontWeight: 700, align: "center", color: "#c7f54a"
          }) as any,
          screenshotWithFrame(129, 720, 1032, 1950, "App Home") as any,
        ],
      },
      {
        name: "2 • Speed & Precision",
        background: { type: "solid", color: "#c7f54a" },
        layers: [
          textLayer("Blazing Fast\nPerformance", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 900, align: "center", color: "#130f1e", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          textLayer("Engineered from the ground up for instantaneous response", Math.round(W * 0.1), 400, Math.round(W * 0.8), 120, {
            fontSize: 46, fontWeight: 500, align: "center", color: "rgba(19, 15, 30, 0.75)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2140, "Fast Screen") as any,
        ],
      },
      {
        name: "3 • Cyber Ink Dark",
        background: { type: "solid", color: "#130f1e" },
        layers: [
          textLayer("Ultra Dark\nMode On", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 900, align: "center", color: "#c7f54a", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          textLayer("Saves battery life while looking razor-sharp in any light", Math.round(W * 0.1), 400, Math.round(W * 0.8), 120, {
            fontSize: 46, fontWeight: 400, align: "center", color: "rgba(199, 245, 74, 0.8)", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2140, "Dark Mode Screen") as any,
        ],
      },
      {
        name: "4 • Power Tools",
        background: { type: "solid", color: "#00c805" },
        layers: [
          textLayer("Built For\nPower Users", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 900, align: "center", color: "#130f1e", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          textLayer("Deep customization and powerful automation at your command", Math.round(W * 0.1), 400, Math.round(W * 0.8), 120, {
            fontSize: 46, fontWeight: 600, align: "center", color: "#ffffff", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2140, "Power Screen") as any,
        ],
      },
      {
        name: "5 • Instant Launch",
        background: { type: "solid", color: "#fefb32" },
        layers: [
          textLayer("Get Started\nIn Seconds", Math.round(W * 0.08), 160, Math.round(W * 0.84), 220, {
            fontSize: 108, fontWeight: 900, align: "center", color: "#130f1e", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          textLayer("Join thousands of creators leveling up their mobile experience", Math.round(W * 0.1), 400, Math.round(W * 0.8), 120, {
            fontSize: 46, fontWeight: 600, align: "center", color: "#130f1e", lineHeight: 1.3
          }) as any,
          screenshotWithFrame(129, 720, 1032, 2140, "Launch Screen") as any,
        ],
      },
    ],
  },

  // ── 1. UXpro Royal Indigo Bold (6 Screens) ──────────────────────────────────
  {
    id: "community-uxpro-indigo-bold",
    name: "Royal Indigo Bold",
    description: "Bold high-impact indigo design with logo badge, zigzag mockup offsets & Manrope typography (6 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "indigo", "bold", "minimal", "uxpro", "6 screens", "app store", "google play"],
    previewColor: "#4300ff",
    previewGradient: ["#4300ff", "#2d00aa"],
    screens: [
      {
        name: "1 • App Hero",
        background: { type: "solid", color: "#4300ff" },
        layers: [
          shapeLayer("circle", Math.round(W * 0.08), 120, 160, 160, "#2d00aa") as any,
          shapeLayer("circle", Math.round(W * 0.08) + 40, 160, 80, 80, "#ffffff") as any,
          textLayer("Add your App\ntitle here", Math.round(W * 0.08), 320, Math.round(W * 0.84), 320, {
            fontFamily: "Manrope", fontSize: 130, fontWeight: 700, align: "left", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          screenshotWithFrame(107, 720, 1076, 2240, "App Title") as any,
        ],
      },
      {
        name: "2 • Feature Offset 1",
        background: { type: "solid", color: "#4300ff" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 140, Math.round(W * 0.84), 280, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "left", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.08), 440, Math.round(W * 0.84), 160, {
            fontFamily: "Manrope", fontSize: 46, fontWeight: 500, align: "left", color: "rgba(255, 255, 255, 0.82)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(107, 920, 1076, 2240, "Feature 1") as any,
        ],
      },
      {
        name: "3 • Feature Focus 2",
        background: { type: "solid", color: "#4300ff" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 140, Math.round(W * 0.84), 280, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "left", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.08), 440, Math.round(W * 0.84), 160, {
            fontFamily: "Manrope", fontSize: 46, fontWeight: 500, align: "left", color: "rgba(255, 255, 255, 0.82)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(107, 720, 1076, 2240, "Feature 2") as any,
        ],
      },
      {
        name: "4 • Feature Offset 3",
        background: { type: "solid", color: "#4300ff" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 140, Math.round(W * 0.84), 280, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "left", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.08), 440, Math.round(W * 0.84), 160, {
            fontFamily: "Manrope", fontSize: 46, fontWeight: 500, align: "left", color: "rgba(255, 255, 255, 0.82)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(107, 920, 1076, 2240, "Feature 3") as any,
        ],
      },
      {
        name: "5 • Feature Focus 4",
        background: { type: "solid", color: "#4300ff" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 140, Math.round(W * 0.84), 280, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "left", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.08), 440, Math.round(W * 0.84), 160, {
            fontFamily: "Manrope", fontSize: 46, fontWeight: 500, align: "left", color: "rgba(255, 255, 255, 0.82)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(107, 720, 1076, 2240, "Feature 4") as any,
        ],
      },
      {
        name: "6 • Feature Offset 5",
        background: { type: "solid", color: "#4300ff" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 140, Math.round(W * 0.84), 280, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "left", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          textLayer("This is a subtitle which explains this feature in a better way.", Math.round(W * 0.08), 440, Math.round(W * 0.84), 160, {
            fontFamily: "Manrope", fontSize: 46, fontWeight: 500, align: "left", color: "rgba(255, 255, 255, 0.82)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(107, 920, 1076, 2240, "Feature 5") as any,
        ],
      },
    ],
  },

  // ── 2. UXpro Vivid Spectrum Flow (6 Screens) ────────────────────────────────
  {
    id: "community-uxpro-spectrum-color",
    name: "Vivid Spectrum Flow",
    description: "Vibrant color progression across every screen: Lavender, Electric Blue, Amber, Coral, Mint & Teal (6 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "spectrum", "colorful", "gradient", "uxpro", "6 screens", "app store", "google play"],
    previewColor: "#805cf5",
    previewGradient: ["#805cf5", "#0067eb"],
    screens: [
      {
        name: "1 • Lavender",
        background: { type: "solid", color: "#805cf5" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          screenshotWithFrame(167, 620, 956, 1993, "Feature 1") as any,
        ],
      },
      {
        name: "2 • Electric Blue",
        background: { type: "solid", color: "#0067eb" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          screenshotWithFrame(167, 820, 956, 1993, "Feature 2") as any,
        ],
      },
      {
        name: "3 • Amber Gold",
        background: { type: "solid", color: "#f7930d" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          screenshotWithFrame(167, 620, 956, 1993, "Feature 3") as any,
        ],
      },
      {
        name: "4 • Coral Crimson",
        background: { type: "solid", color: "#ee4040" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          screenshotWithFrame(167, 820, 956, 1993, "Feature 4") as any,
        ],
      },
      {
        name: "5 • Emerald Mint",
        background: { type: "solid", color: "#09be67" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          screenshotWithFrame(167, 620, 956, 1993, "Feature 5") as any,
        ],
      },
      {
        name: "6 • Cyan Teal",
        background: { type: "solid", color: "#09b3be" },
        layers: [
          textLayer("Add your App\nfeature here.", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontFamily: "Manrope", fontSize: 120, fontWeight: 700, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -3
          }) as any,
          screenshotWithFrame(167, 820, 956, 1993, "Feature 6") as any,
        ],
      },
    ],
  },

  // ── 3. Fabled Glow Obsidian (8 Screens) ─────────────────────────────────────
  {
    id: "community-fabled-radial-glow",
    name: "Glow Obsidian Showcase",
    description: "Sleek dark obsidian backdrop with radiant colored ambient glows & dual tilted hero mockups (8 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "obsidian", "dark", "neon", "glow", "fabled", "8 screens", "app store", "google play"],
    previewColor: "#121212",
    previewGradient: ["#121212", "#06b6d4"],
    screens: [
      {
        name: "1 • Dual Tilted Hero",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 200, 900, 890, 890, "rgba(6, 182, 212, 0.16)") as any,
          textLayer("This can be a\nlong text about\nyour product", Math.round(W * 0.08), 140, Math.round(W * 0.84), 360, {
            fontSize: 98, fontWeight: 900, align: "left", color: "#ffffff", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.12), 680, Math.round(W * 0.72), 1700, "Left Mockup", -7) as any,
          screenshotWithFrame(Math.round(W * 0.38), 620, Math.round(W * 0.76), 1800, "Right Hero Mockup", 6) as any,
        ],
      },
      {
        name: "2 • Violet Ambient",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 240, 950, 800, 800, "rgba(139, 92, 246, 0.18)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#10b981") as any,
          textLayer("Heading Text", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          textLayer("Experience blazing performance and intuitive workflow everywhere", Math.round(W * 0.1), 360, Math.round(W * 0.8), 120, {
            fontSize: 44, fontWeight: 400, align: "center", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2170, "Violet Showcase") as any,
        ],
      },
      {
        name: "3 • Emerald Ambient",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 240, 950, 800, 800, "rgba(16, 185, 129, 0.18)") as any,
          screenshotWithFrame(129, 450, 1032, 2340, "Emerald Mockup") as any,
        ],
      },
      {
        name: "4 • Crimson Ambient",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 240, 950, 800, 800, "rgba(244, 63, 94, 0.18)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#10b981") as any,
          textLayer("Your Text Here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          textLayer("Crafted for power users who demand high precision and style", Math.round(W * 0.1), 360, Math.round(W * 0.8), 120, {
            fontSize: 44, fontWeight: 400, align: "center", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2170, "Crimson Showcase") as any,
        ],
      },
      {
        name: "5 • Dual Amber Offset",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 240, 950, 800, 800, "rgba(245, 158, 11, 0.18)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#10b981") as any,
          textLayer("Your Text Here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(W * 0.32), 600, Math.round(W * 0.72), 1700, "Back Phone") as any,
          screenshotWithFrame(Math.round(-W * 0.04), 780, Math.round(W * 0.72), 1700, "Front Phone") as any,
        ],
      },
      {
        name: "6 • Dual Angled Blue",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 240, 950, 800, 800, "rgba(59, 130, 246, 0.18)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#10b981") as any,
          textLayer("Your Text Here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.15), 620, Math.round(W * 0.72), 1700, "Left Tilt", -8) as any,
          screenshotWithFrame(Math.round(W * 0.42), 620, Math.round(W * 0.72), 1700, "Right Tilt", 8) as any,
        ],
      },
      {
        name: "7 • Pink Ambient",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 240, 950, 800, 800, "rgba(236, 72, 153, 0.18)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#10b981") as any,
          textLayer("Your Text Here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2170, "Pink Showcase") as any,
        ],
      },
      {
        name: "8 • Violet Ambient",
        background: { type: "solid", color: "#121212" },
        layers: [
          shapeLayer("circle", 240, 950, 800, 800, "rgba(168, 85, 247, 0.18)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#10b981") as any,
          textLayer("Your Text Here", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2170, "Violet Showcase") as any,
        ],
      },
    ],
  },

  // ── 4. Fabled Aurora Royal Violet (8 Screens) ───────────────────────────────
  {
    id: "community-fabled-violet-aurora",
    name: "Aurora Royal Violet",
    description: "Lush purple to indigo gradient with clean straight mockups, dual layered showcase & trust badges (8 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "violet", "purple", "aurora", "gradient", "fabled", "8 screens", "app store", "google play"],
    previewColor: "#3730a3",
    previewGradient: ["#3730a3", "#1e1b4b"],
    screens: [
      {
        name: "1 • Heading & Badge",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#fbbf24") as any,
          textLayer("PLACE HEADING", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 1
          }) as any,
          textLayer("Designed to streamline your daily routine seamlessly", Math.round(W * 0.1), 360, Math.round(W * 0.8), 120, {
            fontSize: 44, fontWeight: 400, align: "center", color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(129, 600, 1032, 2196, "Main Screen") as any,
        ],
      },
      {
        name: "2 • Offset Screen",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#fbbf24") as any,
          textLayer("PLACE HEADING", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 1
          }) as any,
          textLayer("Unlock actionable insights in real-time with smart analytics", Math.round(W * 0.1), 360, Math.round(W * 0.8), 120, {
            fontSize: 44, fontWeight: 400, align: "center", color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(129, 820, 1032, 2196, "Offset Screen") as any,
        ],
      },
      {
        name: "3 • Dual Straight Mockup",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#fbbf24") as any,
          textLayer("PLACE HEADING", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 1
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.08), 560, Math.round(W * 0.78), 1850, "Back Phone") as any,
          screenshotWithFrame(Math.round(W * 0.32), 760, Math.round(W * 0.76), 1800, "Front Phone") as any,
        ],
      },
      {
        name: "4 • Clean Full Showcase",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          screenshotWithFrame(129, 400, 1032, 2396, "Full Showcase") as any,
        ],
      },
      {
        name: "5 • Center Showcase",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#fbbf24") as any,
          textLayer("PLACE HEADING", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 1
          }) as any,
          screenshotWithFrame(129, 600, 1032, 2196, "Screen 5") as any,
        ],
      },
      {
        name: "6 • Bottom Bleed",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#fbbf24") as any,
          textLayer("PLACE HEADING", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 1
          }) as any,
          screenshotWithFrame(129, 820, 1032, 2196, "Screen 6") as any,
        ],
      },
      {
        name: "7 • Dual Left Front",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#fbbf24") as any,
          textLayer("PLACE HEADING", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 1
          }) as any,
          screenshotWithFrame(Math.round(W * 0.32), 560, Math.round(W * 0.78), 1850, "Back Phone") as any,
          screenshotWithFrame(Math.round(-W * 0.08), 760, Math.round(W * 0.76), 1800, "Front Phone") as any,
        ],
      },
      {
        name: "8 • Trust & Awards",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#3730a3", position: 0 }, { color: "#1e1b4b", position: 100 }] } },
        layers: [
          textLayer("PLACE HEADING", Math.round(W * 0.08), 140, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 1
          }) as any,
          screenshotWithFrame(129, 440, 1032, 1850, "Final Screen") as any,
          shapeLayer("rounded-rectangle", Math.round(W * 0.18), 2400, Math.round(W * 0.64), 90, "rgba(255, 255, 255, 0.15)", { stroke: "rgba(255, 255, 255, 0.3)", strokeWidth: 2, cornerRadius: 45 }) as any,
          textLayer("🏆 Loved by over 10 Million Users", Math.round(W * 0.18), 2420, Math.round(W * 0.64), 60, {
            fontSize: 38, fontWeight: 700, align: "center", color: "#ffffff"
          }) as any,
        ],
      },
    ],
  },

  // ── 5. Fabled Lime Volt & Electric Dark (8 Screens) ─────────────────────────
  {
    id: "community-fabled-lime-neon",
    name: "Lime Volt & Electric Dark",
    description: "High-voltage lime green to bright yellow gradients on deep ink dark canvas with angled dynamic phones (8 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "lime", "volt", "electric", "yellow", "fabled", "8 screens", "app store", "google play"],
    previewColor: "#a3e635",
    previewGradient: ["#a3e635", "#eab308"],
    screens: [
      {
        name: "1 • Lime Header",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#000000") as any,
          textLayer("Place your heading", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#000000", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          textLayer("Lightning-fast tools engineered for the modern creator", Math.round(W * 0.1), 360, Math.round(W * 0.8), 120, {
            fontSize: 44, fontWeight: 600, align: "center", color: "rgba(0, 0, 0, 0.75)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(129, 600, 1032, 2196, "App Screen 1") as any,
        ],
      },
      {
        name: "2 • Offset Screen",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          textLayer("Place your heading", Math.round(W * 0.08), 160, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#000000", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 820, 1032, 2196, "Offset Screen") as any,
        ],
      },
      {
        name: "3 • Feature Grid Cards",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          textLayer("Place your heading", Math.round(W * 0.08), 140, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#000000", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), 340, 260, 200, "#000000", { cornerRadius: 28 }) as any,
          shapeLayer("rounded-rectangle", Math.round(W * 0.08) + 290, 340, 260, 200, "#000000", { cornerRadius: 28 }) as any,
          shapeLayer("rounded-rectangle", Math.round(W * 0.08) + 580, 340, 260, 200, "#000000", { cornerRadius: 28 }) as any,
          screenshotWithFrame(129, 680, 1032, 2116, "Screen 3") as any,
        ],
      },
      {
        name: "4 • Trust Badge",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          textLayer("Some Random Text here", Math.round(W * 0.08), 140, Math.round(W * 0.84), 160, {
            fontSize: 96, fontWeight: 900, align: "center", color: "#000000", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          shapeLayer("rounded-rectangle", Math.round(W * 0.2), 340, Math.round(W * 0.6), 80, "#000000", { cornerRadius: 40 }) as any,
          textLayer("🌿 10 Million Active Users", Math.round(W * 0.2), 358, Math.round(W * 0.6), 50, {
            fontSize: 36, fontWeight: 700, align: "center", color: "#a3e635"
          }) as any,
          screenshotWithFrame(129, 580, 1032, 2216, "Screen 4") as any,
        ],
      },
      {
        name: "5 • Left Tilted Phone",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          textLayer("Place your heading", Math.round(W * 0.08), 160, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#000000", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Left Angle Phone", -7) as any,
        ],
      },
      {
        name: "6 • Right Tilted Phone",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          textLayer("Place your heading", Math.round(W * 0.08), 160, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#000000", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Right Angle Phone", 7) as any,
        ],
      },
      {
        name: "7 • Clean Showcase",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          screenshotWithFrame(129, 380, 1032, 2416, "Clean Showcase") as any,
        ],
      },
      {
        name: "8 • Dual Angled Finale",
        background: { type: "gradient", gradient: { direction: "to-b", stops: [{ color: "#a3e635", position: 0 }, { color: "#eab308", position: 100 }] } },
        layers: [
          textLayer("This can be a\nlong text about\nyour product", Math.round(W * 0.08), 140, Math.round(W * 0.84), 360, {
            fontSize: 98, fontWeight: 900, align: "left", color: "#000000", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.12), 680, Math.round(W * 0.72), 1700, "Left Mockup", -7) as any,
          screenshotWithFrame(Math.round(W * 0.38), 620, Math.round(W * 0.76), 1800, "Right Hero Mockup", 6) as any,
        ],
      },
    ],
  },

  // ── 6. Fabled Midnight Neon Stepped Flow (8 Screens) ────────────────────────
  {
    id: "community-fabled-stepped-flow",
    name: "Midnight Neon Stepped Flow",
    description: "Dark neon screens with numbered step pills (1-4), soft ambient base glows & dual angled mockups (8 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "steps", "numbered", "flow", "neon", "fabled", "8 screens", "app store", "google play"],
    previewColor: "#0d0f17",
    previewGradient: ["#0d0f17", "#8b5cf6"],
    screens: [
      {
        name: "1 • Intro Dual Hero",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1800, 890, 890, "rgba(139, 92, 246, 0.2)") as any,
          textLayer("This can be a\nlong text about\nyour product", Math.round(W * 0.08), 140, Math.round(W * 0.84), 360, {
            fontSize: 98, fontWeight: 900, align: "left", color: "#ffffff", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.08), 680, Math.round(W * 0.76), 1800, "Left Mockup") as any,
          screenshotWithFrame(Math.round(W * 0.32), 520, Math.round(W * 0.76), 1800, "Right Mockup") as any,
        ],
      },
      {
        name: "2 • Step 1",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1900, 890, 890, "rgba(236, 72, 153, 0.2)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 30, 120, 60, 60, "#ec4899") as any,
          textLayer("1", Math.round(W * 0.5) - 30, 130, 60, 60, { fontSize: 36, fontWeight: 900, align: "center", color: "#ffffff" }) as any,
          textLayer("Your text will be\nplaced here!", Math.round(W * 0.08), 210, Math.round(W * 0.84), 220, {
            fontSize: 96, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Step 1 Mockup") as any,
        ],
      },
      {
        name: "3 • Step 2",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1900, 890, 890, "rgba(6, 182, 212, 0.2)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 30, 120, 60, 60, "#06b6d4") as any,
          textLayer("2", Math.round(W * 0.5) - 30, 130, 60, 60, { fontSize: 36, fontWeight: 900, align: "center", color: "#ffffff" }) as any,
          textLayer("Your text will be\nplaced here!", Math.round(W * 0.08), 210, Math.round(W * 0.84), 220, {
            fontSize: 96, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Step 2 Mockup") as any,
        ],
      },
      {
        name: "4 • Step 3",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1900, 890, 890, "rgba(16, 185, 129, 0.2)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 30, 120, 60, 60, "#10b981") as any,
          textLayer("3", Math.round(W * 0.5) - 30, 130, 60, 60, { fontSize: 36, fontWeight: 900, align: "center", color: "#ffffff" }) as any,
          textLayer("Your text will be\nplaced here!", Math.round(W * 0.08), 210, Math.round(W * 0.84), 220, {
            fontSize: 96, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Step 3 Mockup") as any,
        ],
      },
      {
        name: "5 • Step 4",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1900, 890, 890, "rgba(245, 158, 11, 0.2)") as any,
          shapeLayer("circle", Math.round(W * 0.5) - 30, 120, 60, 60, "#f59e0b") as any,
          textLayer("4", Math.round(W * 0.5) - 30, 130, 60, 60, { fontSize: 36, fontWeight: 900, align: "center", color: "#ffffff" }) as any,
          textLayer("Replace this text\nwith yours", Math.round(W * 0.08), 210, Math.round(W * 0.84), 220, {
            fontSize: 96, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Step 4 Mockup") as any,
        ],
      },
      {
        name: "6 • Security Heading",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1900, 890, 890, "rgba(139, 92, 246, 0.2)") as any,
          textLayer("Heading", Math.round(W * 0.08), 160, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Security Mockup") as any,
        ],
      },
      {
        name: "7 • Analytics Heading",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1900, 890, 890, "rgba(59, 130, 246, 0.2)") as any,
          textLayer("Heading", Math.round(W * 0.08), 160, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 800, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 620, 1032, 2176, "Analytics Mockup") as any,
        ],
      },
      {
        name: "8 • Finale Dual Tilted",
        background: { type: "solid", color: "#0d0f17" },
        layers: [
          shapeLayer("circle", 200, 1800, 890, 890, "rgba(139, 92, 246, 0.2)") as any,
          textLayer("This can be a\nlong text about\nyour product", Math.round(W * 0.08), 140, Math.round(W * 0.84), 360, {
            fontSize: 98, fontWeight: 900, align: "left", color: "#ffffff", lineHeight: 1.1, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.12), 680, Math.round(W * 0.72), 1700, "Left Mockup", -7) as any,
          screenshotWithFrame(Math.round(W * 0.38), 620, Math.round(W * 0.76), 1800, "Right Hero Mockup", 6) as any,
        ],
      },
    ],
  },

  // ── 7. Fabled Vivid Multi-Palette Studio (8 Screens) ────────────────────────
  {
    id: "community-fabled-vivid-palette",
    name: "Vivid Multi-Palette Studio",
    description: "Distinct colorful backgrounds per screen: Cyan, Violet, Sunset, Emerald, Indigo, Obsidian, Forest & Blue (8 Screens)",
    category: "Community",
    layout: "screenshot-bottom",
    tags: ["community", "vivid", "palette", "multicolor", "colorful", "fabled", "8 screens", "app store", "google play"],
    previewColor: "#06b6d4",
    previewGradient: ["#06b6d4", "#8b5cf6"],
    screens: [
      {
        name: "1 • Cyan Teal",
        background: { type: "solid", color: "#06b6d4" },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#10b981") as any,
          textLayer("Place your heading", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          textLayer("Everything you need to manage your mobile workflow effortlessly", Math.round(W * 0.1), 360, Math.round(W * 0.8), 120, {
            fontSize: 44, fontWeight: 500, align: "center", color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.35
          }) as any,
          screenshotWithFrame(129, 600, 1032, 2196, "Cyan Mockup") as any,
        ],
      },
      {
        name: "2 • Violet Purple",
        background: { type: "solid", color: "#8b5cf6" },
        layers: [
          textLayer("Place your heading", Math.round(W * 0.08), 160, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(129, 820, 1032, 2196, "Violet Offset") as any,
        ],
      },
      {
        name: "3 • Sunset Rose",
        background: { type: "gradient", gradient: { direction: "to-br", stops: [{ color: "#f97316", position: 0 }, { color: "#ec4899", position: 100 }] } },
        layers: [
          screenshotWithFrame(129, 400, 1032, 2396, "Sunset Showcase") as any,
        ],
      },
      {
        name: "4 • Emerald Green",
        background: { type: "solid", color: "#10b981" },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#ffffff") as any,
          textLayer("Place your heading", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.08), 600, Math.round(W * 0.74), 1800, "Left Phone") as any,
          screenshotWithFrame(Math.round(W * 0.34), 600, Math.round(W * 0.74), 1800, "Right Phone") as any,
        ],
      },
      {
        name: "5 • Royal Indigo",
        background: { type: "solid", color: "#6366f1" },
        layers: [
          shapeLayer("circle", Math.round(W * 0.5) - 20, 120, 40, 40, "#ffffff") as any,
          textLayer("Place your heading", Math.round(W * 0.08), 180, Math.round(W * 0.84), 160, {
            fontSize: 104, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: -2
          }) as any,
          screenshotWithFrame(Math.round(W * 0.32), 560, Math.round(W * 0.76), 1800, "Back Phone") as any,
          screenshotWithFrame(Math.round(-W * 0.08), 760, Math.round(W * 0.76), 1800, "Front Phone") as any,
        ],
      },
      {
        name: "6 • Deep Obsidian",
        background: { type: "solid", color: "#0f172a" },
        layers: [
          textLayer("RANDOM TEXT", Math.round(W * 0.08), 160, Math.round(W * 0.84), 140, {
            fontSize: 90, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 2
          }) as any,
          screenshotWithFrame(129, 440, 1032, 1850, "Obsidian Screen") as any,
          textLayer("RANDOM TEXT", Math.round(W * 0.08), 2440, Math.round(W * 0.84), 140, {
            fontSize: 70, fontWeight: 700, align: "center", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.15, letterSpacing: 2
          }) as any,
        ],
      },
      {
        name: "7 • Dark Forest",
        background: { type: "solid", color: "#064e3b" },
        layers: [
          textLayer("RANDOM TEXT", Math.round(W * 0.08), 160, Math.round(W * 0.84), 140, {
            fontSize: 90, fontWeight: 900, align: "center", color: "#ffffff", lineHeight: 1.15, letterSpacing: 2
          }) as any,
          screenshotWithFrame(129, 440, 1032, 1850, "Forest Screen") as any,
          textLayer("RANDOM TEXT", Math.round(W * 0.08), 2440, Math.round(W * 0.84), 140, {
            fontSize: 70, fontWeight: 700, align: "center", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.15, letterSpacing: 2
          }) as any,
        ],
      },
      {
        name: "8 • Royal Blue Award",
        background: { type: "solid", color: "#1d4ed8" },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.38), 120, Math.round(W * 0.24), 60, "rgba(255, 255, 255, 0.2)", { cornerRadius: 30 }) as any,
          textLayer("LOGO", Math.round(W * 0.38), 132, Math.round(W * 0.24), 40, {
            fontSize: 28, fontWeight: 800, align: "center", color: "#ffffff", letterSpacing: 2
          }) as any,
          shapeLayer("rounded-rectangle", Math.round(W * 0.2), 220, Math.round(W * 0.6), 80, "rgba(255, 255, 255, 0.15)", { cornerRadius: 40 }) as any,
          textLayer("🏆 10 Million People", Math.round(W * 0.2), 238, Math.round(W * 0.6), 50, {
            fontSize: 36, fontWeight: 700, align: "center", color: "#ffffff"
          }) as any,
          screenshotWithFrame(Math.round(-W * 0.08), 440, Math.round(W * 0.74), 1850, "Left Mockup") as any,
          screenshotWithFrame(Math.round(W * 0.34), 440, Math.round(W * 0.74), 1850, "Right Mockup") as any,
        ],
      },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [
  'All',
  'Basic',
  'Community',
  'Classic',
  'Modern',
  'Health',
  'Finance',
  'Social',
  'Shopping',
  'Entertainment',
  'Education',
  'Business',
  'Technology',
  'Utility',
  'Media',
  'Creative',
  'Lifestyle',
];

// Layout display metadata for UI
export const LAYOUT_META: Record<string, { icon: string; label: string; description: string }> = {
  'screenshot-top':    { icon: '⬆️', label: 'App Top',     description: 'Screenshot top, text below' },
  'screenshot-bottom': { icon: '⬇️', label: 'App Bottom',  description: 'Text top, screenshot below' },
  'screenshot-float':  { icon: '✨', label: 'Float Right',  description: 'Screenshot floats beside text' },
  'screenshot-full':   { icon: '🖼️', label: 'Full Screen', description: 'Screenshot fills the canvas' },
  'screenshot-split':  { icon: '⬛', label: 'Split View',   description: 'Two screenshots side by side' },
  'text-only':         { icon: '✍️', label: 'Text Only',   description: 'No screenshot zone' },
};

const FIGMA_METADATA_MAP: Record<string, { name: string; description: string; category?: string; tags?: string[] }> = {
  figma_1: { name: "Emerald Forest Pro", description: "Deep emerald green theme with bold headline focus (10 screens)", category: "Business", tags: ["emerald", "green", "business", "pro"] },
  figma_2: { name: "Cobalt Sapphire Flow", description: "Deep oceanic blue with dual subtitle captions (10 screens)", category: "Technology", tags: ["cobalt", "sapphire", "blue", "technology"] },
  figma_3: { name: "Royal Amethyst", description: "Rich royal purple palette for luxury and lifestyle apps (10 screens)", category: "Lifestyle", tags: ["purple", "amethyst", "luxury", "lifestyle"] },
  figma_4: { name: "Midnight Teal", description: "Elegant dark teal layout with crisp white typography (10 screens)", category: "Classic", tags: ["teal", "midnight", "dark", "classic"] },
  figma_5: { name: "Crimson Velvet", description: "Intense crimson wine theme for fitness, media and lifestyle (10 screens)", category: "Health", tags: ["crimson", "red", "health", "fitness"] },
  figma_6: { name: "OLED Pure Black", description: "High-contrast pitch black theme tailored for dark mode apps (10 screens)", category: "Modern", tags: ["black", "dark", "oled", "modern"] },
  figma_7: { name: "Electric Indigo Gradient", description: "Vibrant electric indigo & violet gradient layout (10 screens)", category: "Creative", tags: ["indigo", "gradient", "creative", "vibrant"] },
  figma_8: { name: "Mint Pine Minimal", description: "Fresh mint-green palette for health, food and productivity (10 screens)", category: "Health", tags: ["mint", "green", "health", "minimal"] },
  figma_9: { name: "Deep Navy Corporate", description: "Authoritative dark navy background for finance and business (10 screens)", category: "Finance", tags: ["navy", "corporate", "finance", "business"] },
  figma_10: { name: "Cyber Violet Gradient", description: "Glowing modern violet-to-blue gradient for tech & AI (10 screens)", category: "Technology", tags: ["violet", "cyber", "gradient", "tech"] },
  figma_11: { name: "Sunny Gold Accent", description: "High-energy canary gold theme with dark contrast typography (10 screens)", category: "Entertainment", tags: ["gold", "yellow", "entertainment", "vibrant"] },
  figma_12: { name: "Obsidian Stealth", description: "Minimalist dark stealth layout with centered mockup focus (10 screens)", category: "Modern", tags: ["obsidian", "dark", "stealth", "modern"] },
  figma_13: { name: "Ultramarine Tech", description: "Vivid ultramarine blue palette for SaaS and developer tools (10 screens)", category: "Technology", tags: ["ultramarine", "blue", "saas", "tech"] },
  figma_14: { name: "Nordic Ice Pastel", description: "Soft arctic ice-blue pastel for meditation, travel and calm apps (10 screens)", category: "Lifestyle", tags: ["ice", "blue", "pastel", "nordic"] },
  figma_15: { name: "Hyper Blue Modern", description: "Bright energetic electric blue for social and gaming apps (10 screens)", category: "Social", tags: ["blue", "social", "gaming", "modern"] },
  figma_16: { name: "Sunset Prism Gradient", description: "Multi-stop vibrant gradient with dynamic device staging (10 screens)", category: "Creative", tags: ["sunset", "prism", "gradient", "creative"] },
  figma_17: { name: "Deep Abyss Cyan", description: "Moody oceanic abyss teal with clean typography (10 screens)", category: "Utility", tags: ["cyan", "abyss", "utility", "dark"] },
  figma_18: { name: "Royal Indigo Clean", description: "Bold indigo blue canvas with high-legibility layout (10 screens)", category: "Classic", tags: ["indigo", "clean", "classic", "royal"] },
  figma_19: { name: "Classic Sapphire", description: "Professional enterprise blue for B2B and enterprise apps (10 screens)", category: "Business", tags: ["sapphire", "blue", "enterprise", "business"] },
  figma_20: { name: "Plum Luxury", description: "Sophisticated dark plum purple for audio, books and premium apps (10 screens)", category: "Media", tags: ["plum", "luxury", "media", "books"] },
  figma_21: { name: "Monochrome Dark", description: "Clean monochrome black canvas for photography and portfolio apps (10 screens)", category: "Creative", tags: ["monochrome", "dark", "portfolio", "creative"] },
  figma_22: { name: "Nordic Slate", description: "Dark slate blue with dual headline and description structure (10 screens)", category: "Business", tags: ["slate", "nordic", "business", "pro"] },
  figma_23: { name: "Skyline Blue Gradient", description: "Smooth cerulean-to-sky gradient for weather, navigation and utilities (10 screens)", category: "Utility", tags: ["skyline", "blue", "gradient", "utility"] },
  figma_24: { name: "Pure Studio White", description: "Crisp gallery white canvas for shopping, fashion and e-commerce (10 screens)", category: "Shopping", tags: ["white", "studio", "shopping", "ecommerce"] },
  figma_25: { name: "Clean Editorial White", description: "Editorial white layout with left-aligned typographic hierarchy (10 screens)", category: "Classic", tags: ["editorial", "white", "minimal", "classic"] },
  figma_26: { name: "Minimal Gallery Light", description: "Clean modern light theme with maximum device focus (10 screens)", category: "Modern", tags: ["gallery", "light", "minimal", "modern"] },
  figma_27: { name: "Neon Violet Luxury", description: "Dark purple velvet theme with elevated device frames (10 screens)", category: "Entertainment", tags: ["neon", "violet", "entertainment", "luxury"] },
};

export function mapFigmaTemplates(templates: import("./figmaTemplates").FigmaTemplate[]): Template[] {
  return templates.map((ft: import("./figmaTemplates").FigmaTemplate) => {
    const meta = FIGMA_METADATA_MAP[ft.id];
    const maxScreenIndex = ft.screens.reduce((max: number, s: import("./figmaTemplates").FigmaScreenData) => Math.max(max, s.screenIndex), -1);
    const totalScreens = Math.max(5, maxScreenIndex + 1);

    // Derive a preview color from the background
    const previewColor =
      ft.background.type === "solid"
        ? (ft.background.color ?? "#1a1a2e")
        : ft.background.gradient?.stops?.[0]?.color ?? "#1a1a2e";

    const templateScreens: TemplateScreen[] = [];
    for (let i = 0; i < totalScreens; i++) {
      const screenData = ft.screens.find((s: import("./figmaTemplates").FigmaScreenData) => s.screenIndex === i);

      let allLayers: import("@/lib/types").Layer[] = [];

      if (screenData) {
        // Map each Figma device zone as a ScreenshotLayer
        const mockupLayers = screenData.mockups.map((m: import("./figmaTemplates").FigmaMockupData, mIdx: number) => {
          let rotation = 0;
          if (m.transform && m.transform.includes("rotate")) {
            const match = m.transform.match(/rotate\(([-0-9.]+)/);
            if (match) rotation = parseFloat(match[1]);
          }

          return {
            id: `mockup_${ft.id}_s${i}_${mIdx}`,
            type: "screenshot" as const,
            src: undefined,
            x: m.x,
            y: m.y,
            width: m.width,
            height: m.height,
            rotation: rotation,
            opacity: 1,
            objectFit: "cover" as const,
            cornerRadius: 54,
            showDeviceFrame: true,
            shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.35)", offsetX: 0, offsetY: 20 },
            label: "Drop your screenshot here",
          };
        });

        // Layers from Figma: bg_shapes first, then texts/logo
        allLayers = [...mockupLayers, ...screenData.layers];
      }

      const figBg = screenData?.background ?? ft.background;

      let screenBg: import("@/lib/types").Background;
      if (figBg.type === "gradient" && figBg.gradient) {
        screenBg = {
          type: "gradient",
          gradient: {
            direction: figBg.gradient.direction as import("@/lib/types").GradientDirection,
            stops: figBg.gradient.stops.map((s) => ({
              color: s.color,
              position: s.position,
            })),
          },
        };
      } else {
        screenBg = {
          type: "solid",
          color: figBg.color ?? "#1a1a2e",
        };
      }

      templateScreens.push({
        name: `Screen ${i + 1}`,
        background: screenBg,
        layers: allLayers,
      });
    }

    return {
      id: ft.id,
      name: meta?.name ?? ft.name,
      description: meta?.description ?? "Imported from Figma kit (10 screens)",
      category: meta?.category ?? "Classic",
      tags: meta?.tags ?? ["Figma", "Classic"],
      previewColor,
      layout: "screenshot-full",
      screens: templateScreens,
    };
  });
}

import { NICHE_TEMPLATES } from "./nicheTemplates";
export { NICHE_TEMPLATES };

// Base templates available synchronously at runtime
export const BASE_TEMPLATES: Template[] = [
  BLANK_TEMPLATE,
  ...NICHE_TEMPLATES,
  ...COMMUNITY_TEMPLATES,
  ...CORE_TEMPLATES,
];

let cachedAllTemplates: Template[] | null = null;

/**
 * Lazily loads all 50+ templates including the 27 heavy Figma kits (10-screen sets)
 * on demand without bloating the initial application bundle.
 */
export async function getAllTemplates(): Promise<Template[]> {
  if (cachedAllTemplates) return cachedAllTemplates;
  try {
    const { FIGMA_TEMPLATES } = await import("./figmaTemplates");
    const mapped = mapFigmaTemplates(FIGMA_TEMPLATES);
    cachedAllTemplates = [
      BLANK_TEMPLATE,
      ...NICHE_TEMPLATES,
      ...COMMUNITY_TEMPLATES,
      ...mapped,
      ...CORE_TEMPLATES,
    ];
  } catch (err) {
    console.warn("Failed to load Figma templates dynamically, falling back to base templates:", err);
    cachedAllTemplates = BASE_TEMPLATES;
  }
  return cachedAllTemplates;
}

// Export synchronous reference for backward compatibility
export const ALL_TEMPLATES: Template[] = BASE_TEMPLATES;
export const DEFAULT_TEMPLATES: Template[] = BASE_TEMPLATES;

/**
 * Returns true if the template is part of the SnapFrame Pro Suite.
 */
export function isProTemplate(template?: Partial<Template> | null): boolean {
  if (!template || !template.id) return false;
  return Boolean(
    template.id.startsWith("niche-") ||
    template.id.includes("pro-") ||
    template.category?.toLowerCase() === "pro niches" ||
    template.tags?.some((t) => t.toLowerCase() === "pro" || t.toLowerCase() === "pro suite")
  );
}
