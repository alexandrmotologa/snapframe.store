import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { anonymizeName } from "@/lib/anonymize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface ReviewItem {
  id: string;
  userId: string;
  authorAnonymized: string;
  authorRole: string;
  rating: number;
  title: string;
  body: string;
  createdAt: number;
  status: "pending" | "approved" | "rejected";
  isVerifiedUser: boolean;
  beta_user?: boolean;
}

export interface SeedUser {
  uid: string;
  displayName: string;
  email: string;
  isPro: boolean;
  plan: string;
  subscriptionStatus: string;
  aiCredits: number;
  usedAiCredits: number;
  createdAt: number;
  beta_user: boolean;
  review: {
    authorRole: string;
    rating: number;
    title: string;
    body: string;
  };
  projects: Array<{
    id: string;
    name: string;
    templateId: string;
    createdAt: number;
  }>;
}

export const SEED_COMMUNITY_USERS: SeedUser[] = [
  {
    uid: "user-beta-marcus-01",
    displayName: "Marcus Lindqvist",
    email: "marcus.lindqvist.dev@gmail.com",
    isPro: true,
    plan: "pro_annual",
    subscriptionStatus: "active",
    aiCredits: 100,
    usedAiCredits: 18,
    createdAt: 1735689600000,
    beta_user: true,
    review: {
      authorRole: "Indie iOS Dev · 2 Apps Live",
      rating: 5,
      title: "Saved me hours of Figma tweaking",
      body: "Used to spend half my Sunday exporting 6.9\" and 6.5\" frames in Figma. With SnapFrame, I dropped my raw screenshots in and had all localized ZIP bundles ready in 5 minutes.",
    },
    projects: [
      { id: "proj-marcus-1", name: "HabitPulse - Minimal Habit Tracker", templateId: "niche-mind-meditation", createdAt: 1735700000000 },
      { id: "proj-marcus-2", name: "FocusFlow - Pomodoro Studio", templateId: "template-28", createdAt: 1735800000000 },
      { id: "proj-marcus-3", name: "TempoRun - GPS Fitness Pace", templateId: "niche-minimalist-oled", createdAt: 1735900000000 },
    ],
  },
  {
    uid: "user-beta-sarah-02",
    displayName: "Sarah Kim",
    email: "sarah.kim.design@outlook.com",
    isPro: true,
    plan: "pro_monthly",
    subscriptionStatus: "active",
    aiCredits: 100,
    usedAiCredits: 34,
    createdAt: 1736294400000,
    beta_user: true,
    review: {
      authorRole: "Freelance UI Designer",
      rating: 4.5,
      title: "The panoramic continuous frames are brilliant",
      body: "My clients love split-device layouts across two slides. SnapFrame aligns the canvas offset automatically with zero clipping issues. The 3D device renders look super crisp.",
    },
    projects: [
      { id: "proj-sarah-1", name: "Zenith - Meditation & Sleep Sounds", templateId: "niche-mind-meditation", createdAt: 1736300000000 },
      { id: "proj-sarah-2", name: "Nourish - Macro Recipe Planner", templateId: "niche-food-recipes", createdAt: 1736400000000 },
    ],
  },
  {
    uid: "user-beta-alex-03",
    displayName: "Alexandre Rodriguez",
    email: "alexandre.rodriguez.mobile@gmail.com",
    isPro: true,
    plan: "pro_annual",
    subscriptionStatus: "active",
    aiCredits: 100,
    usedAiCredits: 22,
    createdAt: 1736899200000,
    beta_user: true,
    review: {
      authorRole: "Flutter Developer @ IndieSquad",
      rating: 5.0,
      title: "No paywall to preview & Fastlane export is great",
      body: "I love that you can test everything with Ctrl+V before paying anything. The organized Fastlane folder structure made our release pipeline so much easier.",
    },
    projects: [
      { id: "proj-alex-1", name: "CryptoVault - Multi-Chain Wallet", templateId: "niche-minimalist-oled", createdAt: 1736900000000 },
      { id: "proj-alex-2", name: "Delivero - Courier Dispatch", templateId: "template-31", createdAt: 1737000000000 },
      { id: "proj-alex-3", name: "RetroWave - 80s Synth Player", templateId: "niche-music-streaming", createdAt: 1737100000000 },
    ],
  },
  {
    uid: "user-beta-elena-04",
    displayName: "Elena Vance",
    email: "elena.vance.saas@gmail.com",
    isPro: true,
    plan: "pro_annual",
    subscriptionStatus: "active",
    aiCredits: 100,
    usedAiCredits: 15,
    createdAt: 1737200000000,
    beta_user: true,
    review: {
      authorRole: "Solo SaaS Founder",
      rating: 4.5,
      title: "Localized our App Store listing in seconds",
      body: "We translated all 5 screenshot slides to German and Spanish in one click with matching typography. Saved us from delaying our EU launch.",
    },
    projects: [
      { id: "proj-elena-1", name: "LinguaSnap - Flashcard Master", templateId: "niche-education-learning", createdAt: 1737210000000 },
      { id: "proj-elena-2", name: "DocuSigner - PDF Scanner Pro", templateId: "template-29", createdAt: 1737220000000 },
    ],
  },
  {
    uid: "user-beta-daisuke-05",
    displayName: "Daisuke Tanaka",
    email: "daisuke.tanaka.tokyo@gmail.com",
    isPro: true,
    plan: "pro_annual",
    subscriptionStatus: "active",
    aiCredits: 100,
    usedAiCredits: 40,
    createdAt: 1737500000000,
    beta_user: true,
    review: {
      authorRole: "SwiftUI Creator",
      rating: 5.0,
      title: "Makes screenshots look like official Apple keynotes",
      body: "The titanium bezels and soft shadows make raw simulator captures look incredible. Several indie devs on X asked what tool I used.",
    },
    projects: [
      { id: "proj-daisuke-1", name: "KanjiDaily - JLPT N1-N5", templateId: "niche-education-learning", createdAt: 1737510000000 },
      { id: "proj-daisuke-2", name: "Tokyo Metro - Realtime Transit", templateId: "niche-smart-mobility", createdAt: 1737520000000 },
      { id: "proj-daisuke-3", name: "Matcha Timer - Tea Brew Assistant", templateId: "niche-mind-meditation", createdAt: 1737530000000 },
    ],
  },
  {
    uid: "user-mateo-06",
    displayName: "Mateo Silva",
    email: "mateo.silva.appdev@gmail.com",
    isPro: false,
    plan: "free",
    subscriptionStatus: "active",
    aiCredits: 3,
    usedAiCredits: 2,
    createdAt: 1738000000000,
    beta_user: false,
    review: {
      authorRole: "Android Developer",
      rating: 4.0,
      title: "Actually gets Google Play tablet sizes right",
      body: "Most tools only care about iPhone. SnapFrame gave me clean, uncompressed sets for both phones and tablets without stretched borders.",
    },
    projects: [
      { id: "proj-mateo-1", name: "FitFuel - Calorie & Workout Tracker", templateId: "niche-minimalist-oled", createdAt: 1738010000000 },
      { id: "proj-mateo-2", name: "BudgetZen - Personal Expense Ledger", templateId: "template-28", createdAt: 1738020000000 },
    ],
  },
  {
    uid: "user-liam-07",
    displayName: "Liam O'Connor",
    email: "liam.oconnor.studio@gmail.com",
    isPro: true,
    plan: "pro_monthly",
    subscriptionStatus: "active",
    aiCredits: 100,
    usedAiCredits: 29,
    createdAt: 1738300000000,
    beta_user: false,
    review: {
      authorRole: "ASO Consultant",
      rating: 5,
      title: "Perfect for rapid A/B screenshot testing",
      body: "We duplicate projects, tweak headlines or gradients, and download ready-to-upload PNGs in 30 seconds. Great utility for growth experiments.",
    },
    projects: [
      { id: "proj-liam-1", name: "PocketCFO - Freelance Invoice Tool", templateId: "template-31", createdAt: 1738310000000 },
      { id: "proj-liam-2", name: "SleepWave - Binaural Beats & Ambient", templateId: "niche-music-streaming", createdAt: 1738320000000 },
    ],
  },
  {
    uid: "user-amira-08",
    displayName: "Amira El-Sayed",
    email: "amira.elsayed.mobile@gmail.com",
    isPro: true,
    plan: "pro_annual",
    subscriptionStatus: "active",
    aiCredits: 100,
    usedAiCredits: 14,
    createdAt: 1738600000000,
    beta_user: false,
    review: {
      authorRole: "Product Lead",
      rating: 5,
      title: "Zero learning curve, flawless submission",
      body: "Our marketing intern created our full App Store set on her first morning. Preset store sizes ensure Connect never rejects the uploads.",
    },
    projects: [
      { id: "proj-amira-1", name: "MindSpace - Journal & Daily Gratitude", templateId: "niche-mind-meditation", createdAt: 1738610000000 },
      { id: "proj-amira-2", name: "PetCare - Vet & Vaccine Tracker", templateId: "template-30", createdAt: 1738620000000 },
      { id: "proj-amira-3", name: "AuraCast - Weather & Air Quality", templateId: "niche-smart-mobility", createdAt: 1738630000000 },
    ],
  },
];

export const SEED_APPROVED_REVIEWS: ReviewItem[] = SEED_COMMUNITY_USERS.map((u) => ({
  id: u.uid,
  userId: u.uid,
  authorAnonymized: anonymizeName(u.displayName),
  authorRole: u.review.authorRole,
  rating: u.review.rating,
  title: u.review.title,
  body: u.review.body,
  createdAt: u.createdAt,
  status: "approved",
  isVerifiedUser: true,
  beta_user: u.beta_user,
}));

/**
 * Ensures Firestore database contains the 8 seed users with realistic profiles,
 * beta flags, projects subcollections, and approved reviews.
 */
async function ensureSeedDataInFirestore(db: import("firebase-admin/firestore").Firestore) {
  try {
    const reviewsSnapshot = await db.collection("reviews").limit(1).get();
    if (!reviewsSnapshot.empty) {
      return; // Already populated
    }

    const batch = db.batch();

    for (const seedUser of SEED_COMMUNITY_USERS) {
      // 1. Create User Document
      const userRef = db.collection("users").doc(seedUser.uid);
      batch.set(
        userRef,
        {
          uid: seedUser.uid,
          displayName: seedUser.displayName,
          email: seedUser.email,
          isPro: seedUser.isPro,
          plan: seedUser.plan,
          subscriptionStatus: seedUser.subscriptionStatus,
          aiCredits: seedUser.aiCredits,
          usedAiCredits: seedUser.usedAiCredits,
          createdAt: seedUser.createdAt,
          beta_user: seedUser.beta_user,
        },
        { merge: true }
      );

      // 2. Create Projects for User
      for (const proj of seedUser.projects) {
        const projRef = db
          .collection("users")
          .doc(seedUser.uid)
          .collection("projects")
          .doc(proj.id);

        batch.set(
          projRef,
          {
            id: proj.id,
            name: proj.name,
            templateId: proj.templateId,
            createdAt: proj.createdAt,
            updatedAt: proj.createdAt + 3600000,
            screenSets: [],
          },
          { merge: true }
        );
      }

      // 3. Create Review Document
      const reviewRef = db.collection("reviews").doc(seedUser.uid);
      batch.set(
        reviewRef,
        {
          id: seedUser.uid,
          userId: seedUser.uid,
          authorAnonymized: anonymizeName(seedUser.displayName),
          authorRole: seedUser.review.authorRole,
          rating: seedUser.review.rating,
          title: seedUser.review.title,
          body: seedUser.review.body,
          createdAt: seedUser.createdAt,
          status: "approved",
          isVerifiedUser: true,
          beta_user: seedUser.beta_user,
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (err: any) {
    console.error("[Reviews API] Firestore seeding note:", err?.message || err);
  }
}

/**
 * GET /api/reviews
 * Returns all approved reviews from Firestore, with fallback to seed reviews.
 * If ?mine=true is provided with Authorization Bearer header, returns the user's review.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isMine = searchParams.get("mine") === "true";
    const { db, app } = getFirebaseAdmin();

    if (isMine) {
      const authHeader = req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.split("Bearer ")[1];
      if (!app || !db) {
        return NextResponse.json({ review: null });
      }

      const { getAuth } = await import("firebase-admin/auth");
      const decoded = await getAuth(app).verifyIdToken(token);
      const uid = decoded.uid;

      const userReviewDoc = await db.collection("reviews").doc(uid).get();
      if (!userReviewDoc.exists) {
        return NextResponse.json({ review: null });
      }

      const data = userReviewDoc.data() as ReviewItem;
      return NextResponse.json({ review: { ...data, id: userReviewDoc.id } });
    }

    // Public list: Approved reviews
    if (!db) {
      return NextResponse.json({
        reviews: SEED_APPROVED_REVIEWS,
        totalCount: SEED_APPROVED_REVIEWS.length,
        averageRating: 4.8,
      });
    }

    // Try auto-seeding if empty
    await ensureSeedDataInFirestore(db);

    const snapshot = await db
      .collection("reviews")
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        reviews: SEED_APPROVED_REVIEWS,
        totalCount: SEED_APPROVED_REVIEWS.length,
        averageRating: 4.8,
      });
    }

    const reviews: ReviewItem[] = [];
    let totalScore = 0;

    snapshot.forEach((doc) => {
      const data = doc.data() as ReviewItem;
      reviews.push({ ...data, id: doc.id });
      totalScore += data.rating || 5;
    });

    const averageRating = Number((totalScore / reviews.length).toFixed(1));

    return NextResponse.json({
      reviews,
      totalCount: reviews.length,
      averageRating,
    });
  } catch (error: any) {
    console.error("[Reviews API] GET error:", error?.message || error);
    // Graceful fallback to seed reviews
    return NextResponse.json({
      reviews: SEED_APPROVED_REVIEWS,
      totalCount: SEED_APPROVED_REVIEWS.length,
      averageRating: 4.8,
    });
  }
}

/**
 * POST /api/reviews
 * Allows an authenticated user to submit a review with privacy anonymization.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required to submit a review" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const { app, db } = getFirebaseAdmin();

    if (!app || !db) {
      return NextResponse.json(
        { error: "Review database is temporarily unavailable" },
        { status: 503 }
      );
    }

    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth(app).verifyIdToken(token);
    const uid = decoded.uid;

    if (!uid) {
      return NextResponse.json({ error: "Invalid user token" }, { status: 401 });
    }

    const body = await req.json();
    const { rating, title, reviewText, role } = body;

    // Validation (supports 0.5 half-star increments: 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
    const rawRating = Number(rating) || 5;
    const numericRating = Math.min(5, Math.max(1, Math.round(rawRating * 2) / 2));
    const cleanTitle = String(title || "").trim().slice(0, 120);
    const cleanBody = String(reviewText || "").trim().slice(0, 1000);
    const cleanRole = String(role || "Verified Creator").trim().slice(0, 60);

    if (!cleanBody || cleanBody.length < 10) {
      return NextResponse.json(
        { error: "Review comment must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Anonymize author name: e.g. "Ale***** Mot*****"
    const rawName = decoded.name || decoded.displayName || "App Creator";
    const authorAnonymized = anonymizeName(rawName);

    const reviewDocRef = db.collection("reviews").doc(uid);
    const existingDoc = await reviewDocRef.get();

    // Check user beta_user flag in Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    const isBetaUser = Boolean(userDoc.exists && userDoc.data()?.beta_user);

    const reviewItem: ReviewItem = {
      id: uid,
      userId: uid,
      authorAnonymized,
      authorRole: cleanRole,
      rating: numericRating,
      title: cleanTitle || "Great screenshot design studio",
      body: cleanBody,
      createdAt: existingDoc.exists ? (existingDoc.data()?.createdAt || Date.now()) : Date.now(),
      status: "approved",
      isVerifiedUser: true,
      beta_user: isBetaUser,
    };

    await reviewDocRef.set(reviewItem, { merge: true });

    return NextResponse.json({
      success: true,
      review: reviewItem,
      message: "Thank you! Your verified review has been published.",
    });
  } catch (error: any) {
    console.error("[Reviews API] POST error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
