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
    "Subscriber's Lounge",
    0.6,
    "For our supporters",
  ),
  topLevel("daily", "daily", "Daily", 1, "General daily discussion"),
  topLevel(
    "media",
    "media",
    "Media",
    2,
    "Articles, press conferences, rankings, podcasts, and interviews for all leagues",
  ),
  topLevel(
    "postgame-discussions",
    "postgame-discussions",
    "Postgame Discussions",
    2.5,
    "Post-Game threads for all sports leagues. Threads created through automations.",
  ),
  topLevel(
    "offtopic",
    "offtopic",
    "Off-Topic",
    3,
    "Off-topic and general chat",
  ),

  // ── Admin subforums ───────────────────────────────────────────────────────
  subforum(
    "admin-announcements",
    "announcements",
    "Announcements",
    "admin",
    0,
    "SimSN-wide news and press releases",
  ),
  subforum(
    "admin-devdiaries",
    "devdiaries",
    "Dev Diaries",
    "admin",
    0.5,
    "Development updates and behind-the-scenes looks at new features and improvements",
  ),
  subforum(
    "admin-simcfb",
    "simcfb",
    "SimCFB Announcements",
    "admin",
    1,
    "SimCFB league announcements",
    "SimCFB",
  ),
  subforum(
    "admin-simnfl",
    "simnfl",
    "SimNFL Announcements",
    "admin",
    2,
    "SimNFL league announcements",
    "SimNFL",
  ),
  subforum(
    "admin-simcbb",
    "simcbb",
    "SimCBB Announcements",
    "admin",
    3,
    "SimCBB league announcements",
    "SimCBB",
  ),
  subforum(
    "admin-simnba",
    "simnba",
    "SimNBA Announcements",
    "admin",
    4,
    "SimNBA league announcements",
    "SimNBA",
  ),
  subforum(
    "admin-simchl",
    "simchl",
    "SimCHL Announcements",
    "admin",
    5,
    "SimCHL league announcements",
    "SimCHL",
  ),
  subforum(
    "admin-simphl",
    "simphl",
    "SimPHL Announcements",
    "admin",
    6,
    "SimPHL league announcements",
    "SimPHL",
  ),
  subforum(
    "admin-simcbl",
    "simcbl",
    "SimCBL Announcements",
    "admin",
    7,
    "SimCBL league announcements",
    "SimCBL",
  ),
  subforum(
    "admin-simmlb",
    "simmlb",
    "SimMLB Announcements",
    "admin",
    8,
    "SimMLB league announcements",
    "SimMLB",
  ),

  // ── Media subforums (one per league) ──────────────────────────────────────
  subforum(
    "media-simcfb",
    "simcfb",
    "SimCFB",
    "media",
    0,
    "SimCFB articles, press conferences, rankings, podcasts, and interviews",
    "SimCFB",
  ),
  subforum(
    "media-simnfl",
    "simnfl",
    "SimNFL",
    "media",
    1,
    "SimNFL articles, press conferences, rankings, podcasts, and interviews",
    "SimNFL",
  ),
  subforum(
    "media-simcbb",
    "simcbb",
    "SimCBB",
    "media",
    2,
    "SimCBB articles, press conferences, rankings, podcasts, and interviews",
    "SimCBB",
  ),
  subforum(
    "media-simnba",
    "simnba",
    "SimNBA",
    "media",
    3,
    "SimNBA articles, press conferences, rankings, podcasts, and interviews",
    "SimNBA",
  ),
  subforum(
    "media-simchl",
    "simchl",
    "SimCHL",
    "media",
    4,
    "SimCHL articles, press conferences, rankings, podcasts, and interviews",
    "SimCHL",
  ),
  subforum(
    "media-simphl",
    "simphl",
    "SimPHL",
    "media",
    5,
    "SimPHL articles, press conferences, rankings, podcasts, and interviews",
    "SimPHL",
  ),
  subforum(
    "media-simcbl",
    "simcbl",
    "SimCBL",
    "media",
    6,
    "SimCBL articles, press conferences, rankings, podcasts, and interviews",
    "SimCBL",
  ),
  subforum(
    "media-simmlb",
    "simmlb",
    "SimMLB",
    "media",
    7,
    "SimMLB articles, press conferences, rankings, podcasts, and interviews",
    "SimMLB",
  ),

  // ── Results subforums (one per league) ──────────────────────────────────────
  subforum(
    "postgame-discussions-simcfb",
    "simcfb",
    "SimCFB",
    "postgame-discussions",
    0,
    "SimCFB post-game threads. Threads created through automations.",
    "SimCFB",
  ),
  subforum(
    "postgame-discussions-simnfl",
    "simnfl",
    "SimNFL",
    "postgame-discussions",
    1,
    "SimNFL post-game threads. Threads created through automations.",
    "SimNFL",
  ),
  subforum(
    "postgame-discussions-simcbb",
    "simcbb",
    "SimCBB",
    "postgame-discussions",
    2,
    "SimCBB post-game threads. Threads created through automations.",
    "SimCBB",
  ),
  subforum(
    "postgame-discussions-simnba",
    "simnba",
    "SimNBA",
    "postgame-discussions",
    3,
    "SimNBA post-game threads. Threads created through automations.",
    "SimNBA",
  ),
  subforum(
    "postgame-discussions-simchl",
    "simchl",
    "SimCHL",
    "postgame-discussions",
    4,
    "SimCHL post-game threads. Threads created through automations.",
    "SimCHL",
  ),
  subforum(
    "postgame-discussions-simphl",
    "simphl",
    "SimPHL",
    "postgame-discussions",
    5,
    "SimPHL post-game threads. Threads created through automations.",
    "SimPHL",
  ),
  subforum(
    "postgame-discussions-simcbl",
    "simcbl",
    "SimCBL",
    "postgame-discussions",
    6,
    "SimCBL post-game threads. Threads created through automations.",
    "SimCBL",
  ),
  subforum(
    "postgame-discussions-simmlb",
    "simmlb",
    "SimMLB",
    "postgame-discussions",
    7,
    "SimMLB post-game threads. Threads created through automations.",
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
