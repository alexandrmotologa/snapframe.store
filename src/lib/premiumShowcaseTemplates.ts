import { Template, ScreenshotLayer, TextLayer, ShapeLayer, FlagLayer } from "@/lib/types";

const W = 1290;

function textLayer(
  content: string,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: Partial<Omit<TextLayer, "id" | "type" | "content" | "x" | "y" | "width" | "height">> = {}
): Omit<TextLayer, "id"> {
  return {
    type: "text",
    content,
    x,
    y,
    width: w,
    height: h,
    fontSize: 90,
    fontFamily: "Inter",
    fontWeight: 700,
    color: "#ffffff",
    align: "center",
    lineHeight: 1.15,
    letterSpacing: -1.5,
    rotation: 0,
    opacity: 1,
    ...opts,
  };
}

function shapeLayer(
  shape: import("@/lib/types").ShapeType,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  opts: Partial<Omit<ShapeLayer, "id" | "type" | "shape" | "x" | "y" | "width" | "height" | "fill">> = {}
): Omit<ShapeLayer, "id"> {
  return {
    type: "shape",
    shape,
    x,
    y,
    width: w,
    height: h,
    fill,
    rotation: 0,
    opacity: 1,
    ...opts,
  };
}

function flagLayer(
  content: string,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: Partial<Omit<FlagLayer, "id" | "type" | "content" | "x" | "y" | "width" | "height">> = {}
): Omit<FlagLayer, "id"> {
  return {
    type: "flag",
    content,
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    opacity: 1,
    ...opts,
  };
}

function screenshotWithFrame(
  x: number,
  y: number,
  w: number,
  h: number,
  label = "Drop your screenshot here",
  rotation = 0
): Omit<ScreenshotLayer, "id"> {
  return {
    type: "screenshot",
    src: undefined,
    x,
    y,
    width: w,
    height: h,
    rotation,
    opacity: 1,
    objectFit: "cover",
    cornerRadius: 55,
    showDeviceFrame: true,
    shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.4)", offsetX: 0, offsetY: 24 },
    label,
  };
}

// ─── 6 ULTRA-PREMIUM SHOWCASE TEMPLATES ───────────────────────────────────────
export const PREMIUM_SHOWCASE_TEMPLATES: Template[] = [
  // 1. CYBERPUNK NEON ARCADE & ESPORTS
  {
    id: "niche-cyberpunk-gaming",
    name: "Cyberpunk Neon Arcade",
    description: "High-voltage ultraviolet & neon pink esports theme with tilted battle frames and floating rank badges.",
    category: "Games",
    previewColor: "#090514",
    previewGradient: ["#090514", "#2e1065", "#ec4899"],
    layout: "screenshot-bottom",
    tags: ["gaming", "esports", "cyberpunk", "neon", "arcade", "pro"],
    screens: [
      {
        name: "Battle Arena",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#090514", position: 0 },
              { color: "#2e1065", position: 40 },
              { color: "#05020a", position: 100 },
            ],
            direction: "to-br",
          },
        },
        layers: [
          shapeLayer("circle", Math.round(W * 0.15), 500, 900, 900, "radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(59,7,100,0) 70%)", { opacity: 0.8 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.28), 120, 560, 90, "rgba(236, 72, 153, 0.15)", {
            stroke: "rgba(244, 63, 94, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("⚡ ULTRA-FAST 120FPS", Math.round(W * 0.28), 136, 560, 90, {
            fontSize: 40,
            fontWeight: 800,
            color: "#f43f5e",
            letterSpacing: 2,
          }),
          textLayer("Next-Level\nBattle Arena", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          textLayer("Compete against millions in real-time ranked tournaments with zero input lag.", Math.round(W * 0.12), 570, Math.round(W * 0.76), 140, {
            fontSize: 44,
            fontWeight: 400,
            color: "#d8b4fe",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 760, Math.round(W * 0.74), 1900, "Main Gameplay Screen", -3),
          shapeLayer("rounded-rectangle", Math.round(W * 0.08), 2450, 480, 110, "rgba(15, 7, 30, 0.85)", {
            stroke: "rgba(168, 85, 247, 0.5)",
            strokeWidth: 2,
            cornerRadius: 24,
            shadow: { blur: 30, spread: 0, color: "rgba(0,0,0,0.5)", offsetX: 0, offsetY: 8 },
          }),
          textLayer("🏆 TOP 1% ESPORTS LEAGUE", Math.round(W * 0.08), 2478, 480, 110, {
            fontSize: 34,
            fontWeight: 800,
            color: "#e879f9",
          }),
        ],
      },
      {
        name: "Dual Hero Clash",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#170529", position: 0 },
              { color: "#090514", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.32), 120, 460, 90, "rgba(6, 182, 212, 0.15)", {
            stroke: "rgba(34, 211, 238, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("🔥 50+ LEGENDARY HEROES", Math.round(W * 0.32), 136, 460, 90, {
            fontSize: 36,
            fontWeight: 800,
            color: "#22d3ee",
            letterSpacing: 2,
          }),
          textLayer("Unlock Epic\nPowers & Gear", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.04), 780, Math.round(W * 0.62), 1850, "Left Hero Card", -8),
          screenshotWithFrame(Math.round(W * 0.34), 860, Math.round(W * 0.62), 1850, "Right Hero Card", 7),
        ],
      },
      {
        name: "Global Leaderboards",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#090514", position: 0 },
              { color: "#311042", position: 50 },
              { color: "#05020a", position: 100 },
            ],
            direction: "to-bl",
          },
        },
        layers: [
          textLayer("Live Ranked\nGlobal Seasons", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          textLayer("Climb from Bronze to Grandmaster with seasonal rewards.", Math.round(W * 0.12), 480, Math.round(W * 0.76), 140, {
            fontSize: 44,
            fontWeight: 400,
            color: "#c084fc",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 680, Math.round(W * 0.74), 1950, "Leaderboard UI", 0),
        ],
      },
      {
        name: "Custom Skins & Weapons",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#05020a", position: 0 },
              { color: "#1e0836", position: 100 },
            ],
            direction: "to-tr",
          },
        },
        layers: [
          textLayer("Rare Mythic\nSkins & FX", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 660, Math.round(W * 0.74), 1950, "Inventory & Skins", 4),
        ],
      },
      {
        name: "Community & Guilds",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#1a0430", position: 0 },
              { color: "#090514", position: 100 },
            ],
            direction: "to-br",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.25), 140, 640, 90, "rgba(236, 72, 153, 0.2)", {
            stroke: "rgba(236, 72, 153, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("✦ JOIN 2M+ PLAYERS", Math.round(W * 0.25), 156, 640, 90, {
            fontSize: 38,
            fontWeight: 800,
            color: "#f472b6",
            letterSpacing: 2,
          }),
          textLayer("Assemble Your\nDream Squad", Math.round(W * 0.08), 270, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 740, Math.round(W * 0.74), 1920, "Guild Chat & Voice", 0),
        ],
      },
    ],
  },

  // 2. EDITORIAL MONOLITH & HAUTE COUTURE
  {
    id: "niche-editorial-luxury",
    name: "Editorial Monolith & Luxury",
    description: "Warm porcelain & cashmere aesthetic with classic serif typography, gold badges, and high-fashion layout.",
    category: "Modern",
    previewColor: "#fbf9f5",
    previewGradient: ["#fbf9f5", "#f3eee6", "#c29b38"],
    layout: "screenshot-bottom",
    tags: ["editorial", "luxury", "minimalist", "fashion", "magazine", "serif"],
    screens: [
      {
        name: "The Edit 2026",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#fdfbf7", position: 0 },
              { color: "#f5efe6", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.32), 120, 460, 80, "rgba(194, 155, 56, 0.12)", {
            stroke: "rgba(194, 155, 56, 0.4)",
            strokeWidth: 1.5,
            cornerRadius: 100,
          }),
          textLayer("✦ THE EDIT / 2026", Math.round(W * 0.32), 136, 460, 80, {
            fontSize: 36,
            fontWeight: 700,
            color: "#92681d",
            letterSpacing: 3,
          }),
          textLayer("Curated Fashion\n& Fine Living", Math.round(W * 0.08), 240, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 800,
            fontFamily: "Playfair Display",
            color: "#1c1917",
          }),
          textLayer("Discover bespoke designer collections and exclusive private drops.", Math.round(W * 0.14), 540, Math.round(W * 0.72), 120, {
            fontSize: 42,
            fontWeight: 400,
            color: "#78716c",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 740, Math.round(W * 0.74), 1950, "App Home Feed", 0),
        ],
      },
      {
        name: "Private Collections",
        background: {
          type: "solid",
          color: "#f5efe6",
        },
        layers: [
          textLayer("Private Showrooms\n& Global Runway", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 105,
            fontWeight: 800,
            fontFamily: "Playfair Display",
            color: "#1c1917",
          }),
          screenshotWithFrame(Math.round(W * 0.06), 620, Math.round(W * 0.65), 1950, "Left Editorial Preview", -5),
          screenshotWithFrame(Math.round(W * 0.38), 700, Math.round(W * 0.65), 1950, "Right Editorial Preview", 4),
        ],
      },
      {
        name: "Artisanal Craft",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#faf6f0", position: 0 },
              { color: "#ede4d6", position: 100 },
            ],
            direction: "to-bl",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.3), 130, 520, 80, "rgba(28, 25, 23, 0.06)", {
            stroke: "rgba(28, 25, 23, 0.2)",
            strokeWidth: 1.5,
            cornerRadius: 100,
          }),
          textLayer("AUTHENTICATED LUXURY", Math.round(W * 0.3), 146, 520, 80, {
            fontSize: 34,
            fontWeight: 700,
            color: "#44403c",
            letterSpacing: 2,
          }),
          textLayer("100% Certified\nDirect From Brands", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 105,
            fontWeight: 800,
            fontFamily: "Playfair Display",
            color: "#1c1917",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 680, Math.round(W * 0.74), 1980, "Product Detail Page", 0),
        ],
      },
      {
        name: "Concierge Service",
        background: {
          type: "solid",
          color: "#f8f4ee",
        },
        layers: [
          textLayer("24/7 Dedicated\nVIP Concierge", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 105,
            fontWeight: 800,
            fontFamily: "Playfair Display",
            color: "#1c1917",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 640, Math.round(W * 0.74), 2000, "Concierge Chat", 0),
        ],
      },
      {
        name: "Club Membership",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#1c1917", position: 0 },
              { color: "#292524", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.28), 140, 560, 85, "rgba(194, 155, 56, 0.2)", {
            stroke: "rgba(194, 155, 56, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("✦ INVITATION ONLY", Math.round(W * 0.28), 158, 560, 85, {
            fontSize: 36,
            fontWeight: 700,
            color: "#fde68a",
            letterSpacing: 3,
          }),
          textLayer("Join The Elite\nCollector Society", Math.round(W * 0.08), 270, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 800,
            fontFamily: "Playfair Display",
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 740, Math.round(W * 0.74), 1950, "Membership Card", 0),
        ],
      },
    ],
  },

  // 3. SYNTHETIX AI & NEURAL STUDIO
  {
    id: "niche-ai-intelligence",
    name: "Synthetix AI & Neural Studio",
    description: "Deep void background with holographic indigo-violet auras, prompt bubbles, and model benchmark tags.",
    category: "Productivity",
    previewColor: "#030712",
    previewGradient: ["#030712", "#312e81", "#22d3ee"],
    layout: "screenshot-bottom",
    tags: ["ai", "neural", "copilot", "chatgpt", "machine learning", "productivity"],
    screens: [
      {
        name: "Instant AI Copilot",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#030712", position: 0 },
              { color: "#1e1b4b", position: 40 },
              { color: "#020617", position: 100 },
            ],
            direction: "to-br",
          },
        },
        layers: [
          shapeLayer("circle", Math.round(W * 0.15), 450, 900, 900, "radial-gradient(circle, rgba(79,70,229,0.25) 0%, rgba(34,211,238,0) 70%)", { opacity: 0.85 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.28), 120, 560, 90, "rgba(79, 70, 229, 0.2)", {
            stroke: "rgba(99, 102, 241, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("✨ NEXT-GEN INTELLIGENCE", Math.round(W * 0.28), 138, 560, 90, {
            fontSize: 38,
            fontWeight: 800,
            color: "#818cf8",
            letterSpacing: 2,
          }),
          textLayer("Your Personal\nAI Superpower", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          textLayer("Generate code, edit audio, and draft documents in seconds with advanced LLMs.", Math.round(W * 0.12), 570, Math.round(W * 0.76), 140, {
            fontSize: 42,
            fontWeight: 400,
            color: "#c7d2fe",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 760, Math.round(W * 0.74), 1900, "AI Chat Prompt Window", 0),
          shapeLayer("rounded-rectangle", Math.round(W * 0.1), 2440, 480, 100, "rgba(10, 15, 35, 0.9)", {
            stroke: "rgba(34, 211, 238, 0.5)",
            strokeWidth: 2,
            cornerRadius: 24,
          }),
          textLayer("⚡ 0.2s REALTIME INFERENCE", Math.round(W * 0.1), 2465, 480, 100, {
            fontSize: 32,
            fontWeight: 800,
            color: "#22d3ee",
          }),
        ],
      },
      {
        name: "Multi-Model Studio",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#0f172a", position: 0 },
              { color: "#020617", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.32), 120, 460, 90, "rgba(168, 85, 247, 0.2)", {
            stroke: "rgba(168, 85, 247, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("🧠 10+ AI MODELS IN 1", Math.round(W * 0.32), 138, 460, 90, {
            fontSize: 36,
            fontWeight: 800,
            color: "#c084fc",
            letterSpacing: 2,
          }),
          textLayer("Switch Models\nWith One Tap", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.04), 760, Math.round(W * 0.62), 1880, "Model Selector View", -6),
          screenshotWithFrame(Math.round(W * 0.34), 840, Math.round(W * 0.62), 1880, "Prompt Generator", 6),
        ],
      },
      {
        name: "Voice & Vision",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#030712", position: 0 },
              { color: "#1e1b4b", position: 50 },
              { color: "#030712", position: 100 },
            ],
            direction: "to-tr",
          },
        },
        layers: [
          textLayer("Ultra-Low Latency\nNatural Voice", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          textLayer("Talk naturally with emotion detection and instant translation.", Math.round(W * 0.12), 480, Math.round(W * 0.76), 140, {
            fontSize: 42,
            fontWeight: 400,
            color: "#a5b4fc",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 680, Math.round(W * 0.74), 1950, "Voice Waveform Interface", 0),
        ],
      },
      {
        name: "Privacy & Encryption",
        background: {
          type: "solid",
          color: "#030712",
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.28), 130, 560, 90, "rgba(16, 185, 129, 0.15)", {
            stroke: "rgba(16, 185, 129, 0.5)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("🔒 100% PRIVATE & ZERO LOGS", Math.round(W * 0.28), 148, 560, 90, {
            fontSize: 34,
            fontWeight: 800,
            color: "#34d399",
            letterSpacing: 2,
          }),
          textLayer("Your Data Never\nTrains Our Models", Math.round(W * 0.08), 260, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 680, Math.round(W * 0.74), 1950, "Security & Vault Settings", 0),
        ],
      },
      {
        name: "Workflow Automations",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#1e1b4b", position: 0 },
              { color: "#030712", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          textLayer("Automate Your\nDaily Workflow", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 640, Math.round(W * 0.74), 2000, "Automations Builder", 0),
        ],
      },
    ],
  },

  // 4. NORDIC WELLNESS & HABIT STUDIO
  {
    id: "niche-nordic-health",
    name: "Nordic Sage & Wellness",
    description: "Soothing matcha and sage palette with organic rounded pills, habit streaks, and mindful typography.",
    category: "Health & Fitness",
    previewColor: "#f0fdf4",
    previewGradient: ["#f0fdf4", "#dcfce7", "#064e3b"],
    layout: "screenshot-bottom",
    tags: ["wellness", "meditation", "nordic", "sage", "health", "habit tracker"],
    screens: [
      {
        name: "Mindful Balance",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#f0fdf4", position: 0 },
              { color: "#dcfce7", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.28), 120, 560, 85, "rgba(6, 78, 59, 0.1)", {
            stroke: "rgba(6, 78, 59, 0.3)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("🌿 CLINICALLY BACKED ROUTINES", Math.round(W * 0.28), 136, 560, 85, {
            fontSize: 34,
            fontWeight: 800,
            color: "#065f46",
            letterSpacing: 2,
          }),
          textLayer("Build Habits\nThat Actually Last", Math.round(W * 0.08), 240, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 800,
            color: "#064e3b",
          }),
          textLayer("Gentle science-backed daily micro-habits designed to reduce stress and anxiety.", Math.round(W * 0.12), 540, Math.round(W * 0.76), 140, {
            fontSize: 42,
            fontWeight: 400,
            color: "#047857",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 740, Math.round(W * 0.74), 1950, "Habit Daily Ring Screen", 0),
          shapeLayer("rounded-rectangle", Math.round(W * 0.1), 2440, 480, 95, "rgba(255, 255, 255, 0.95)", {
            stroke: "rgba(16, 185, 129, 0.3)",
            strokeWidth: 2,
            cornerRadius: 24,
            shadow: { blur: 25, spread: 0, color: "rgba(6,78,59,0.15)", offsetX: 0, offsetY: 8 },
          }),
          textLayer("🔥 45-DAY STREAK CLUB", Math.round(W * 0.1), 2465, 480, 95, {
            fontSize: 34,
            fontWeight: 800,
            color: "#047857",
          }),
        ],
      },
      {
        name: "Deep Rest & Sleep",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#064e3b", position: 0 },
              { color: "#022c22", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.32), 120, 460, 85, "rgba(255, 255, 255, 0.15)", {
            stroke: "rgba(255, 255, 255, 0.4)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("🌙 RESTORATIVE SLEEP", Math.round(W * 0.32), 136, 460, 85, {
            fontSize: 34,
            fontWeight: 800,
            color: "#a7f3d0",
            letterSpacing: 2,
          }),
          textLayer("Fall Asleep in\nUnder 10 Minutes", Math.round(W * 0.08), 240, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 800,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 680, Math.round(W * 0.74), 1950, "Sleep Soundscapes & Timer", 0),
        ],
      },
      {
        name: "Smart HRV Analytics",
        background: {
          type: "solid",
          color: "#f0fdf4",
        },
        layers: [
          textLayer("Real-Time Recovery\n& HRV Tracking", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 105,
            fontWeight: 800,
            color: "#064e3b",
          }),
          screenshotWithFrame(Math.round(W * 0.05), 620, Math.round(W * 0.64), 1950, "HRV Weekly Trend", -5),
          screenshotWithFrame(Math.round(W * 0.37), 700, Math.round(W * 0.64), 1950, "Daily Score Card", 5),
        ],
      },
      {
        name: "Breathwork & Cold Exposure",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#e6f4ea", position: 0 },
              { color: "#c8e6c9", position: 100 },
            ],
            direction: "to-bl",
          },
        },
        layers: [
          textLayer("Guided Wim Hof &\nBox Breathwork", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 105,
            fontWeight: 800,
            color: "#064e3b",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 640, Math.round(W * 0.74), 2000, "Breathwork Pacer Screen", 0),
        ],
      },
      {
        name: "5-Star Community",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#064e3b", position: 0 },
              { color: "#022c22", position: 100 },
            ],
            direction: "to-br",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.25), 140, 640, 90, "rgba(255, 255, 255, 0.15)", {
            stroke: "rgba(255, 255, 255, 0.3)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("★★★★★ 4.9 ON APP STORE", Math.round(W * 0.25), 158, 640, 90, {
            fontSize: 38,
            fontWeight: 800,
            color: "#fcd34d",
            letterSpacing: 2,
          }),
          textLayer("Join Over 1 Million\nMindful Creators", Math.round(W * 0.08), 270, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 800,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 740, Math.round(W * 0.74), 1950, "App Overview Dashboard", 0),
        ],
      },
    ],
  },

  // 5. APEX CRYPTO TERMINAL & PRO TRADING
  {
    id: "niche-crypto-terminal",
    name: "Apex Crypto Terminal",
    description: "Pure carbon OLED aesthetic with bull emerald indicators, live candlestick widgets, and security certifications.",
    category: "Finance",
    previewColor: "#050811",
    previewGradient: ["#050811", "#0b1329", "#10b981"],
    layout: "screenshot-bottom",
    tags: ["crypto", "trading", "stocks", "terminal", "web3", "oled", "finance"],
    screens: [
      {
        name: "Pro Trading Terminal",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#000000", position: 0 },
              { color: "#050c18", position: 40 },
              { color: "#000000", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.28), 120, 560, 90, "rgba(16, 185, 129, 0.15)", {
            stroke: "rgba(16, 185, 129, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("📈 ZERO-FEE SPOT TRADING", Math.round(W * 0.28), 138, 560, 90, {
            fontSize: 36,
            fontWeight: 800,
            color: "#34d399",
            letterSpacing: 2,
          }),
          textLayer("Trade 500+\nCrypto Pairs", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          textLayer("Institutional liquidity, microsecond matching engine, and 100% cold storage reserves.", Math.round(W * 0.12), 570, Math.round(W * 0.76), 140, {
            fontSize: 42,
            fontWeight: 400,
            color: "#94a3b8",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 760, Math.round(W * 0.74), 1900, "Trading Candlestick Screen", 0),
          shapeLayer("rounded-rectangle", Math.round(W * 0.1), 2440, 480, 100, "rgba(8, 15, 25, 0.9)", {
            stroke: "rgba(16, 185, 129, 0.5)",
            strokeWidth: 2,
            cornerRadius: 24,
          }),
          textLayer("🔒 SOC-2 TYPE II AUDITED", Math.round(W * 0.1), 2465, 480, 100, {
            fontSize: 32,
            fontWeight: 800,
            color: "#34d399",
          }),
        ],
      },
      {
        name: "DeFi Yield Staking",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#061524", position: 0 },
              { color: "#000000", position: 100 },
            ],
            direction: "to-br",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.3), 120, 520, 90, "rgba(56, 189, 248, 0.15)", {
            stroke: "rgba(56, 189, 248, 0.5)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("💎 UP TO 18.5% APY YIELD", Math.round(W * 0.3), 138, 520, 90, {
            fontSize: 36,
            fontWeight: 800,
            color: "#38bdf8",
            letterSpacing: 2,
          }),
          textLayer("Automated Yield\n& Staking Vaults", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.04), 760, Math.round(W * 0.62), 1880, "Staking Vaults List", -5),
          screenshotWithFrame(Math.round(W * 0.34), 840, Math.round(W * 0.62), 1880, "Earnings Graph", 5),
        ],
      },
      {
        name: "Biometric Cold Wallet",
        background: {
          type: "solid",
          color: "#02050b",
        },
        layers: [
          textLayer("Self-Custody\nBiometric Vault", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 680, Math.round(W * 0.74), 1950, "Cold Key Management", 0),
        ],
      },
      {
        name: "Realtime Signals & Alerts",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#02050b", position: 0 },
              { color: "#0b1f33", position: 100 },
            ],
            direction: "to-tr",
          },
        },
        layers: [
          textLayer("Sub-Second Push\nPrice Alerts", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 640, Math.round(W * 0.74), 2000, "Alerts Setup", 0),
        ],
      },
      {
        name: "Global Card Spend",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#061524", position: 0 },
              { color: "#02050b", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.25), 140, 640, 90, "rgba(16, 185, 129, 0.2)", {
            stroke: "rgba(16, 185, 129, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("💳 4% CASHBACK CARD", Math.round(W * 0.25), 158, 640, 90, {
            fontSize: 38,
            fontWeight: 800,
            color: "#6ee7b7",
            letterSpacing: 2,
          }),
          textLayer("Spend Anywhere\nApple Pay Supported", Math.round(W * 0.08), 270, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 740, Math.round(W * 0.74), 1950, "Metal Card View", 0),
        ],
      },
    ],
  },

  // 6. CINESTREAM 4K & SPATIAL AUDIO
  {
    id: "niche-streaming-cinema",
    name: "CineStream 4K & Velvet",
    description: "Deep ruby velvet and theatrical dark aesthetic with 4K HDR badges, spatial audio banners, and movie posters.",
    category: "Entertainment",
    previewColor: "#0a0a0f",
    previewGradient: ["#0a0a0f", "#4c0519", "#f97316"],
    layout: "screenshot-bottom",
    tags: ["streaming", "movies", "cinema", "4k", "music", "entertainment", "pro"],
    screens: [
      {
        name: "Cinema 4K HDR",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#0a0a0f", position: 0 },
              { color: "#4c0519", position: 40 },
              { color: "#030305", position: 100 },
            ],
            direction: "to-br",
          },
        },
        layers: [
          shapeLayer("circle", Math.round(W * 0.15), 500, 900, 900, "radial-gradient(circle, rgba(244,63,94,0.2) 0%, rgba(76,5,25,0) 70%)", { opacity: 0.8 }),
          shapeLayer("rounded-rectangle", Math.round(W * 0.28), 120, 560, 90, "rgba(244, 63, 94, 0.15)", {
            stroke: "rgba(251, 113, 133, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("🍿 4K HDR & DOLBY ATMOS", Math.round(W * 0.28), 138, 560, 90, {
            fontSize: 36,
            fontWeight: 800,
            color: "#fb7185",
            letterSpacing: 2,
          }),
          textLayer("Stream Thousands\nof Blockbusters", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          textLayer("Unlimited movies, exclusive originals, and live premier events with zero ads.", Math.round(W * 0.12), 570, Math.round(W * 0.76), 140, {
            fontSize: 42,
            fontWeight: 400,
            color: "#fecdd3",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 760, Math.round(W * 0.74), 1900, "Streaming Cinema Player", 0),
        ],
      },
      {
        name: "Personalized Watchlist",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#1f030b", position: 0 },
              { color: "#0a0a0f", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.32), 120, 460, 90, "rgba(249, 115, 22, 0.15)", {
            stroke: "rgba(251, 146, 60, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("🎬 PERSONAL AI CURATOR", Math.round(W * 0.32), 138, 460, 90, {
            fontSize: 36,
            fontWeight: 800,
            color: "#fb923c",
            letterSpacing: 2,
          }),
          textLayer("Recommendations\nYou'll Actually Love", Math.round(W * 0.08), 250, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.04), 760, Math.round(W * 0.62), 1880, "Watchlist Carousel", -6),
          screenshotWithFrame(Math.round(W * 0.34), 840, Math.round(W * 0.62), 1880, "Movie Details Modal", 6),
        ],
      },
      {
        name: "Offline Downloads",
        background: {
          type: "solid",
          color: "#0a0a0f",
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.3), 130, 520, 90, "rgba(255, 255, 255, 0.12)", {
            stroke: "rgba(255, 255, 255, 0.3)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("⬇️ WATCH ON THE GO", Math.round(W * 0.3), 148, 520, 90, {
            fontSize: 36,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: 2,
          }),
          textLayer("Download In 4K\nWatch Without WiFi", Math.round(W * 0.08), 260, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 680, Math.round(W * 0.74), 1950, "Offline Library View", 0),
        ],
      },
      {
        name: "Spatial Audio",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#0a0a0f", position: 0 },
              { color: "#380614", position: 100 },
            ],
            direction: "to-tr",
          },
        },
        layers: [
          textLayer("Studio Master\nSpatial Audio", Math.round(W * 0.08), 160, Math.round(W * 0.84), 300, {
            fontSize: 115,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 640, Math.round(W * 0.74), 2000, "Dolby Atmos Equalizer", 0),
        ],
      },
      {
        name: "Family Profiles",
        background: {
          type: "gradient",
          gradient: {
            stops: [
              { color: "#4c0519", position: 0 },
              { color: "#0a0a0f", position: 100 },
            ],
            direction: "to-b",
          },
        },
        layers: [
          shapeLayer("rounded-rectangle", Math.round(W * 0.25), 140, 640, 90, "rgba(244, 63, 94, 0.2)", {
            stroke: "rgba(244, 63, 94, 0.6)",
            strokeWidth: 2,
            cornerRadius: 100,
          }),
          textLayer("✦ 5 CONCURRENT STREAMS", Math.round(W * 0.25), 158, 640, 90, {
            fontSize: 38,
            fontWeight: 800,
            color: "#fda4af",
            letterSpacing: 2,
          }),
          textLayer("Separate Kids &\nAdult Profiles", Math.round(W * 0.08), 270, Math.round(W * 0.84), 300, {
            fontSize: 110,
            fontWeight: 900,
            color: "#ffffff",
          }),
          screenshotWithFrame(Math.round(W * 0.13), 740, Math.round(W * 0.74), 1950, "Profiles Switcher", 0),
        ],
      },
    ],
  },
];
