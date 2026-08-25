"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/store/editorStore";
import { cn } from "@/lib/utils";
import { HorizontalScrollRail } from "@/components/ui/horizontal-scroll-rail";

// ── Built-in emoji sticker packs ──────────────────────────────────────────────
const STICKER_CATEGORIES = [
  {
    name: "Smileys",
    stickers: ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","😍","🥰","😘","😜","🤩","🥳","😎","🤓","😏"],
  },
  {
    name: "Nature",
    stickers: ["🌸","🌺","🌻","🌹","🌷","🍀","🌿","🍃","🌱","🌲","🌴","🌵","🎋","🍄","🌾","🌊","🔥","⭐","✨","💫"],
  },
  {
    name: "Animals",
    stickers: ["🐶","🐱","🐻","🐼","🦊","🐸","🐧","🦁","🐯","🐨","🦄","🐙","🦋","🦜","🐬","🦩","🦚","🐺","🦝","🐇"],
  },
  {
    name: "Objects",
    stickers: ["💎","🏆","🎯","🎨","🎭","🎪","🎠","🎡","🎢","🎪","🎰","🎲","🎮","🕹️","🎸","🎹","🎺","🎻","🥁","🎤"],
  },
  {
    name: "Symbols",
    stickers: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","❤️‍🔥","💝","💖","💗","💓","💞","💕","💟","☮️","✌️","🤞","👍"],
  },
  {
    name: "Food",
    stickers: ["🍕","🍔","🍟","🌮","🍜","🍣","🍩","🍪","🎂","🍫","☕","🧋","🍵","🥤","🍺","🥂","🍾","🧁","🍭","🍬"],
  },
  {
    name: "Travel",
    stickers: ["✈️","🚀","🛸","🚁","🚂","🚢","🏖️","🏔️","🗺️","🧭","🏕️","🎡","🎪","🏰","🗼","🗽","🎑","🌅","🌄","🌠"],
  },
  {
    name: "Activities",
    stickers: ["🏋️","🤸","🧘","🏊","🚴","⚽","🏀","🎾","🏐","🎱","🎳","🏇","🤺","🥊","🏹","🧗","🤾","🏄","🤽","🏌️"],
  },
];

const EMOJI_KEYWORDS: Record<string, string> = {
  "😀": "smile happy grinning face laugh",
  "😃": "smile happy grinning eyes laugh",
  "😄": "smile happy laughing grin",
  "😁": "beaming smile teeth grin",
  "😆": "laughing squint closed eyes fun",
  "😅": "sweat smile relief nervous",
  "😂": "joy cry tears laughing lol rofl funny",
  "🤣": "rofl rolling laughing funny humor",
  "😊": "blush smiling pleased proud warm",
  "😇": "angel innocent halo blessed holy",
  "🙂": "slightly smiling pleasant smile calm",
  "😍": "heart love eyes in love romantic crush",
  "🥰": "hearts loving in love adore smile romantic",
  "😘": "kiss blow kiss romantic love affection",
  "😜": "wink tongue crazy playful funny joke",
  "🤩": "star struck excited amazed awesome wow",
  "🥳": "party celebrate hat horn birthday celebration event",
  "😎": "cool sunglasses shades chill stylish awesome",
  "🤓": "nerd geek glasses smart intelligent study",
  "😏": "smirk sly playful smug cheeky",
  "🌸": "cherry blossom flower pink flora bloom spring",
  "🌺": "hibiscus flower tropical bloom hawaii",
  "🌻": "sunflower yellow flower sunny summer",
  "🌹": "rose red flower romance love valentine beauty",
  "🌷": "tulip flower spring blossom colorful",
  "🍀": "four leaf clover lucky fortune charm ireland",
  "🌿": "herb plant leaf green organic natural fresh",
  "🍃": "leaves flutter wind green nature eco",
  "🌱": "seedling sprout plant grow baby new life",
  "🌲": "evergreen pine tree nature forest wood",
  "🌴": "palm tree tropical summer island beach vacation",
  "🌵": "cactus desert succulent thorny dry",
  "🎋": "tanabata tree bamboo festive wish",
  "🍄": "mushroom fungus nature toadstool mario",
  "🌾": "rice ear grain harvest crop autumn",
  "🌊": "water wave ocean sea surf tsunami blue tide",
  "🔥": "fire flame hot trend lit blaze burn danger viral energy",
  "⭐": "star favorite rating golden shiny score featured gold",
  "✨": "sparkles sparkle magic glow clean special new ai shine feature brilliance",
  "💫": "dizzy star spark swirl shine stellar",
  "🐶": "dog puppy pet canine animal cute bark woof",
  "🐱": "cat kitten pet feline animal cute meow",
  "🐻": "bear teddy wild animal cute grizzly",
  "🐼": "panda animal cute bear bamboo china",
  "🦊": "fox animal wild clever red foxy",
  "🐸": "frog animal amphibian toad green ribbit",
  "🐧": "penguin bird animal antarctic cute tuxedo",
  "🦁": "lion king animal wild cat roar brave",
  "🐯": "tiger animal cat wild stripes fierce",
  "🐨": "koala bear animal australia cute sleepy",
  "🦄": "unicorn magical fantasy rainbow horse horn startup magic",
  "🐙": "octopus animal sea tentacle ocean kraken",
  "🦋": "butterfly insect beautiful wings nature butterfly-effect",
  "🦜": "parrot bird tropical colorful talk pet",
  "🐬": "dolphin animal ocean marine sea smart jump",
  "🦩": "flamingo bird pink tropical elegant",
  "🦚": "peacock bird colorful feathers proud beauty",
  "🐺": "wolf animal wild moon pack howl",
  "🦝": "raccoon animal cute bandit sneaky trash-panda",
  "🐇": "rabbit bunny animal cute fast pet easter",
  "💎": "diamond gem jewel luxury premium wealth pro crystal rich vip sparkle",
  "🏆": "trophy prize winner first champion gold award success win champion victory",
  "🎯": "target bullseye goal accurate aim focus hit direct marketing conversion",
  "🎨": "art palette paint design color creative craft artist draw ui",
  "🎭": "theater arts masks drama stage actor movie performance",
  "🎪": "circus tent festival entertainment carnival show big-top",
  "🎠": "carousel horse amusement park fair ride fun",
  "🎡": "ferris wheel amusement park ride fair view",
  "🎢": "roller coaster amusement ride thrill park fast excitement",
  "🎰": "slot machine casino jackpot lucky bet 777 win cash",
  "🎲": "game die dice boardgame random luck roll",
  "🎮": "video game controller joystick gaming play arcade console esports",
  "🕹️": "joystick arcade retro gaming game retro classic",
  "🎸": "guitar music rock instrument sound song acoustic electric",
  "🎹": "piano keyboard music musical sound instrument keys melody",
  "🎺": "trumpet horn music brass jazz fanfare",
  "🎻": "violin cello strings classical music orchestra symphony",
  "🥁": "drum percussion music rhythm beat drummer",
  "🎤": "microphone mic singing karaoke podcast audio voice stream",
  "❤️": "red heart love romance favorite like passion sweet",
  "🧡": "orange heart love warm affection care",
  "💛": "yellow heart love friendship gold sunny",
  "💚": "green heart love eco nature health plant",
  "💙": "blue heart love trust peace cold calm",
  "💜": "purple heart love royal magic luxury aesthetic",
  "🖤": "black heart love dark gothic style minimal",
  "🤍": "white heart love pure clean peace clear",
  "❤️‍🔥": "heart on fire passion burning love hot desire",
  "💝": "heart with ribbon gift present love valentine surprise",
  "💖": "sparkling heart love romance shiny glow shimmer",
  "💗": "growing heart love affection pulse excited",
  "💓": "beating heart love vibration live pulse alive",
  "💞": "revolving hearts love romance affection swirl",
  "💕": "two hearts love affection pink couple",
  "💟": "heart decoration love purple icon cute",
  "☮️": "peace sign symbol harmony antiwar hippie",
  "✌️": "victory peace fingers v-sign two hand gesture win",
  "🤞": "crossed fingers luck hope wish promise pray",
  "👍": "thumbs up like approve good yes ok great agreement positive plus",
  "🍕": "pizza food cheese Italian fastfood slice eat delicious",
  "🍔": "burger hamburger fastfood beef cheeseburger food meal",
  "🍟": "french fries potato fastfood snack food crispy",
  "🌮": "taco mexican food snack wrap spicy food",
  "🍜": "steaming bowl ramen noodles soup asian food hot delicious",
  "🍣": "sushi japanese food raw fish roll seafood sashimi",
  "🍩": "doughnut donut sweet dessert pastry bakery treat glaze",
  "🍪": "cookie chocolate sweet dessert baked treat biscuit",
  "🎂": "birthday cake dessert sweet celebrate party celebration anniversary",
  "🍫": "chocolate bar candy sweet dessert dark milk cocoa",
  "☕": "coffee hot beverage tea cup morning cafe espresso cappuccino mug",
  "🧋": "boba bubble tea beverage drink milk tea tapioca",
  "🍵": "tea matcha green tea hot beverage cup drink healthy",
  "🥤": "cup with straw soft drink soda smoothie beverage drink takeaway",
  "🍺": "beer mug alcohol drink brewery pub cheers party pint",
  "🥂": "clinking glasses champagne toast cheers celebration party wedding pro",
  "🍾": "bottle with popping cork champagne wine celebrate party victory new year",
  "🧁": "cupcake dessert sweet muffin bakery frosting sprinkle",
  "🍭": "lollipop candy sweet sugar treat swirl sweet",
  "🍬": "candy sweet confection sugar treat wrapped",
  "✈️": "airplane plane flight travel trip aviation airport vacation explore",
  "🚀": "rocket launch boost fast speed startup space ship scale growth explosive fast",
  "🛸": "flying saucer ufo alien space sci-fi mystery",
  "🚁": "helicopter aircraft fly chopper transport sky",
  "🚂": "locomotive train steam transport railway trip",
  "🚢": "ship cruise boat sea ocean vessel travel ferry vacation",
  "🏖️": "beach umbrella sand ocean island vacation holiday summer sun relax",
  "🏔️": "snow-capped mountain nature landscape alpine peak winter cold",
  "🗺️": "world map travel navigation guide location globe atlas",
  "🧭": "compass navigate direction travel guide explorer orientation",
  "🏕️": "camping tent nature outdoor wilderness adventure camp fire",
  "🏰": "castle medieval fortress fairy tale palace kingdom royal",
  "🗼": "tokyo tower tokyo landmark travel japan architecture",
  "🗽": "statue of liberty new york landmark america usa travel freedom",
  "🎑": "moon viewing ceremony harvest moon japanese autumn festival",
  "🌅": "sunrise sun morning dawn landscape horizon early morning",
  "🌄": "sunrise over mountains sun morning dawn hill sunrise",
  "🌠": "shooting star wishing falling night sky wish meteor luck",
  "🏋️": "weight lifter gym fitness workout strength training heavy bodybuilder exercise",
  "🤸": "person cartwheeling gymnastics acrobatic energy sport play active",
  "🧘": "person in lotus position yoga meditate zen mindfulness peace relax health",
  "🏊": "swimmer swimming pool ocean water sport race fitness swim",
  "🚴": "cyclist bicycle bike ride cycling fitness race travel exercise",
  "⚽": "soccer ball football sport goal game match champion",
  "🏀": "basketball ball hoop sport nba match court slam dunk",
  "🎾": "tennis ball racket sport wimbledon match court court game",
  "🏐": "volleyball ball beach sport game match team net",
  "🎱": "pool 8 ball billiards game bar cue snooker lucky 8",
  "🎳": "bowling ball pins game strike alley sport fun",
  "🏇": "horse racing equestrian derby jockey sport race speed",
  "🤺": "fencer fencing sword sport duel match blade",
  "🥊": "boxing glove fight knockout combat sport match punch champion",
  "🏹": "bow and arrow archery target weapon hunting sport precision aim",
  "🧗": "person climbing rock climb mountain adventure sport wall bouldering",
  "🤾": "person playing handball sport ball game team goal",
  "🏄": "surfer surfing ocean water sport beach wave summer board surf",
  "🤽": "person playing water polo water sport pool team ball",
  "🏌️": "person golfing golf sport swing club ball green fairway",
};

const ALL_STICKERS = STICKER_CATEGORIES.flatMap((c) => c.stickers.map((s) => ({ emoji: s, category: c.name })));

// ── Sticker size when added to canvas ─────────────────────────────────────────
const STICKER_SIZE = 200; // px in canvas coordinates

export function StickersPanel() {
  const { getActiveSet, getActiveScreen, addLayer } = useEditorStore();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const activeSet = getActiveSet();
  const activeScreen = getActiveScreen();

  const categories = ["All", ...STICKER_CATEGORIES.map((c) => c.name)];

  const filtered = useMemo(() => {
    let items = activeCategory === "All"
      ? ALL_STICKERS
      : ALL_STICKERS.filter((s) => s.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter((s) => {
        const matchesCategory = s.category.toLowerCase().includes(q);
        const keywords = EMOJI_KEYWORDS[s.emoji] || "";
        const matchesKeywords = keywords.toLowerCase().includes(q);
        return matchesCategory || matchesKeywords;
      });
    }
    return items;
  }, [query, activeCategory]);

  const handleAddSticker = (emoji: string) => {
    if (!activeSet || !activeScreen) return;
    // Place sticker in center of canvas
    const x = Math.round((activeScreen.width - STICKER_SIZE) / 2);
    const y = Math.round((activeScreen.height - STICKER_SIZE) / 2);
    addLayer(activeSet.id, activeScreen.id, {
      type: "text",
      content: emoji,
      x,
      y,
      width: STICKER_SIZE,
      height: STICKER_SIZE,
      fontSize: 160,
      fontFamily: "system-ui",
      fontWeight: 400,
      color: "#ffffff",
      align: "center",
      lineHeight: 1,
      letterSpacing: 0,
      rotation: 0,
      opacity: 1,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/70 border border-border/30">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search stickers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b border-border/30 px-2 py-1 bg-card/40">
        <HorizontalScrollRail>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                setActiveCategory(cat);
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95"
              )}
            >
              {cat}
            </button>
          ))}
        </HorizontalScrollRail>
      </div>

      {/* No active screen warning */}
      {(!activeSet || !activeScreen) && (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 p-4 text-center">
          <span className="text-4xl">🎨</span>
          <p className="text-xs text-muted-foreground">Select a screen to add stickers</p>
        </div>
      )}

      {/* Sticker grid */}
      {activeSet && activeScreen && (
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 grid grid-cols-5 gap-1.5">
            {filtered.map((s, i) => (
              <button
                key={`${s.emoji}-${i}`}
                type="button"
                onClick={() => handleAddSticker(s.emoji)}
                title={`Add ${s.emoji} — ${s.category}`}
                className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-secondary transition-colors hover:scale-110 active:scale-95"
              >
                {s.emoji}
              </button>
            ))}
          </div>
          <div className="pb-4 text-center text-[10px] text-muted-foreground/50">
            Click any sticker to add it to the canvas
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
