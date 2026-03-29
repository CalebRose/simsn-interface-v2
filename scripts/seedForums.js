/**
 * seedForums.js
 *
 * One-time script to seed the `forums` collection in Firestore.
 *
 * Prerequisites:
 *   1. npm install --save-dev firebase-admin
 *   2. Download your service account key from Firebase Console:
 *        Project Settings → Service Accounts → Generate new private key
 *      Save it as: scripts/serviceAccountKey.json  (never commit this file)
 *   3. node scripts/seedForums.js
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "serviceAccountKey.json"), "utf8"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const now = admin.firestore.Timestamp.now();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function topLevel(id, slug, name, sortOrder, description, sportKey = null) {
  return {
    id,
    slug,
    name,
    type: "top_level",
    parentForumId: null,
    description,
    sortOrder,
    visibility: "members",
    isLocked: false,
    threadCount: 0,
    postCount: 0,
    latestThreadId: null,
    latestPostId: null,
    latestActivityAt: null,
    latestActivityBy: null,
    sportKey,
    createdAt: now,
    updatedAt: now,
  };
}

function subforum(
  id,
  slug,
  name,
  parentForumId,
  sortOrder,
  description,
  sportKey = null,
) {
  return {
    id,
    slug,
    name,
    type: "subforum",
    parentForumId,
    description,
    sortOrder,
    visibility: "members",
    isLocked: false,
    threadCount: 0,
    postCount: 0,
    latestThreadId: null,
    latestPostId: null,
    latestActivityAt: null,
    latestActivityBy: null,
    sportKey,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Forum Data ───────────────────────────────────────────────────────────────

const forums = [
  // ── Top-level ──────────────────────────────────────────────────────────────
  topLevel(
    "admin",
    "admin",
    "Admin",
    0,
    "League administration and announcements",
  ),
  topLevel("daily", "daily", "Daily", 1, "General daily discussion"),
  topLevel("simcfb", "simcfb", "SimCFB", 2, "SimCFB discussions", "SimCFB"),
  topLevel("simnfl", "simnfl", "SimNFL", 3, "SimNFL discussions", "SimNFL"),
  topLevel("simcbb", "simcbb", "SimCBB", 4, "SimCBB discussions", "SimCBB"),
  topLevel("simnba", "simnba", "SimNBA", 5, "SimNBA discussions", "SimNBA"),
  topLevel("simchl", "simchl", "SimCHL", 6, "SimCHL discussions", "SimCHL"),
  topLevel("simphl", "simphl", "SimPHL", 7, "SimPHL discussions", "SimPHL"),
  topLevel("simcbl", "simcbl", "SimCBL", 8, "SimCBL discussions", "SimCBL"),
  topLevel("simmlb", "simmlb", "SimMLB", 9, "SimMLB discussions", "SimMLB"),
  topLevel(
    "offtopic",
    "offtopic",
    "OffTopic",
    10,
    "Off-topic and general chat",
  ),
  // sortOrder 0.5 → appears between Admin (0) and Daily (1)
  topLevel(
    "welcome",
    "welcome",
    "Welcome",
    0.5,
    "New members, introductions, job applications, and league proposals",
  ),
  topLevel(
    "subscribers-lounge",
    "subscribers-lounge",
    "Subscribers's Lounge",
    0.6,
    "For our supporters",
  ),
  // ── Admin subforums ───────────────────────────────────────────────────────
  subforum(
    "admin-announcements",
    "announcements",
    "Announcements",
    "admin",
    0,
    "SimSN news and press releases",
  ),
  // ── SimCFB subforums ───────────────────────────────────────────────────────
  subforum(
    "simcfb-news",
    "news",
    "News / Press",
    "simcfb",
    0,
    "SimCFB news and press releases",
    "SimCFB",
  ),
  subforum(
    "simcfb-daily",
    "daily",
    "Daily",
    "simcfb",
    1,
    "SimCFB daily discussion",
    "SimCFB",
  ),

  // ── SimNFL subforums ───────────────────────────────────────────────────────
  subforum(
    "simnfl-news",
    "news",
    "News / Press",
    "simnfl",
    0,
    "SimNFL news and press releases",
    "SimNFL",
  ),
  subforum(
    "simnfl-daily",
    "daily",
    "Daily",
    "simnfl",
    1,
    "SimNFL daily discussion",
    "SimNFL",
  ),

  // ── SimCBB subforums ───────────────────────────────────────────────────────
  subforum(
    "simcbb-news",
    "news",
    "News / Press",
    "simcbb",
    0,
    "SimCBB news and press releases",
    "SimCBB",
  ),
  subforum(
    "simcbb-daily",
    "daily",
    "Daily",
    "simcbb",
    1,
    "SimCBB daily discussion",
    "SimCBB",
  ),

  // ── SimNBA subforums ───────────────────────────────────────────────────────
  subforum(
    "simnba-news",
    "news",
    "News / Press",
    "simnba",
    0,
    "SimNBA news and press releases",
    "SimNBA",
  ),
  subforum(
    "simnba-daily",
    "daily",
    "Daily",
    "simnba",
    1,
    "SimNBA daily discussion",
    "SimNBA",
  ),

  // ── SimCHL subforums ───────────────────────────────────────────────────────
  subforum(
    "simchl-news",
    "news",
    "News / Press",
    "simchl",
    0,
    "SimCHL news and press releases",
    "SimCHL",
  ),
  subforum(
    "simchl-daily",
    "daily",
    "Daily",
    "simchl",
    1,
    "SimCHL daily discussion",
    "SimCHL",
  ),

  // ── SimPHL subforums ───────────────────────────────────────────────────────
  subforum(
    "simphl-news",
    "news",
    "News / Press",
    "simphl",
    0,
    "SimPHL news and press releases",
    "SimPHL",
  ),
  subforum(
    "simphl-daily",
    "daily",
    "Daily",
    "simphl",
    1,
    "SimPHL daily discussion",
    "SimPHL",
  ),

  // ── SimCBL subforums ───────────────────────────────────────────────────────
  subforum(
    "simcbl-news",
    "news",
    "News / Press",
    "simcbl",
    0,
    "SimCBL news and press releases",
    "SimCBL",
  ),
  subforum(
    "simcbl-daily",
    "daily",
    "Daily",
    "simcbl",
    1,
    "SimCBL daily discussion",
    "SimCBL",
  ),

  // ── SimMLB subforums ───────────────────────────────────────────────────────
  subforum(
    "simmlb-news",
    "news",
    "News / Press",
    "simmlb",
    0,
    "SimMLB news and press releases",
    "SimMLB",
  ),
  subforum(
    "simmlb-daily",
    "daily",
    "Daily",
    "simmlb",
    1,
    "SimMLB daily discussion",
    "SimMLB",
  ),

  // ── Welcome subforums ──────────────────────────────────────────────────────
  subforum(
    "welcome-intro-help",
    "intro-help",
    "Intro / Help",
    "welcome",
    0,
    "Introduce yourself and get help getting started",
  ),
  subforum(
    "welcome-job-applications",
    "job-applications",
    "Job Applications",
    "welcome",
    1,
    "Apply for open positions within the league",
  ),
  subforum(
    "welcome-league-proposals",
    "league-proposals",
    "League Proposals",
    "welcome",
    2,
    "Propose new leagues or major league changes",
  ),
  subforum(
    "welcome-suggestions-fixes",
    "suggestions-fixes",
    "Suggestions / Fixes",
    "welcome",
    3,
    "Submit suggestions, bug reports, and fix requests",
  ),

  // ── Postgame Discussion subforums (one per league) ─────────────────────────
  subforum(
    "simcfb-postgame",
    "postgame",
    "Postgame Discussions",
    "simcfb",
    2,
    "SimCFB postgame discussion threads",
    "SimCFB",
  ),
  subforum(
    "simnfl-postgame",
    "postgame",
    "Postgame Discussions",
    "simnfl",
    2,
    "SimNFL postgame discussion threads",
    "SimNFL",
  ),
  subforum(
    "simcbb-postgame",
    "postgame",
    "Postgame Discussions",
    "simcbb",
    2,
    "SimCBB postgame discussion threads",
    "SimCBB",
  ),
  subforum(
    "simnba-postgame",
    "postgame",
    "Postgame Discussions",
    "simnba",
    2,
    "SimNBA postgame discussion threads",
    "SimNBA",
  ),
  subforum(
    "simchl-postgame",
    "postgame",
    "Postgame Discussions",
    "simchl",
    2,
    "SimCHL postgame discussion threads",
    "SimCHL",
  ),
  subforum(
    "simphl-postgame",
    "postgame",
    "Postgame Discussions",
    "simphl",
    2,
    "SimPHL postgame discussion threads",
    "SimPHL",
  ),
  subforum(
    "simcbl-postgame",
    "postgame",
    "Postgame Discussions",
    "simcbl",
    2,
    "SimCBL postgame discussion threads",
    "SimCBL",
  ),
  subforum(
    "simmlb-postgame",
    "postgame",
    "Postgame Discussions",
    "simmlb",
    2,
    "SimMLB postgame discussion threads",
    "SimMLB",
  ),
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding ${forums.length} forum documents...`);
  const batch = db.batch();

  for (const forum of forums) {
    const ref = db.collection("forums").doc(forum.id);
    const snap = await ref.get();
    if (snap.exists) {
      console.log(`  SKIP  ${forum.id} (already exists)`);
    } else {
      batch.set(ref, forum);
      console.log(`  QUEUE ${forum.id}`);
    }
  }

  await batch.commit();
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
