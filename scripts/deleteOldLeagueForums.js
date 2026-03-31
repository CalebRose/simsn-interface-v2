/**
 * deleteOldLeagueForums.js
 *
 * One-time cleanup script that deletes the now-deprecated per-league top-level
 * forum documents and their subforum documents from the `forums` collection.
 *
 * Run ONLY after:
 *   1. seedForums.js  — new forum structure is in place
 *   2. migrateToMediaForum.js — all threads/posts have been moved
 *   3. You have verified the new media subforums look correct in the app
 *
 * Forums removed (top-level + subforums):
 *   simcfb, simcfb-news, simcfb-daily, simcfb-postgame
 *   simnfl, simnfl-news, simnfl-daily, simnfl-postgame
 *   simcbb, simcbb-news, simcbb-daily, simcbb-postgame
 *   simnba, simnba-news, simnba-daily, simnba-postgame
 *   simchl, simchl-news, simchl-daily, simchl-postgame
 *   simphl, simphl-news, simphl-daily, simphl-postgame
 *   simcbl, simcbl-news, simcbl-daily, simcbl-postgame
 *   simmlb, simmlb-news, simmlb-daily, simmlb-postgame
 *
 * Usage:
 *   node scripts/deleteOldLeagueForums.js
 *   node scripts/deleteOldLeagueForums.js --dry-run   ← lists docs without deleting
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

const DRY_RUN = process.argv.includes("--dry-run");

// ─── All forum document IDs to delete ────────────────────────────────────────

const LEAGUES = [
  "simcfb",
  "simnfl",
  "simcbb",
  "simnba",
  "simchl",
  "simphl",
  "simcbl",
  "simmlb",
];

const SUBFORUM_SUFFIXES = ["news", "daily", "postgame"];

const FORUM_IDS_TO_DELETE = [
  ...LEAGUES, // top-level league forums
  ...LEAGUES.flatMap((league) =>
    SUBFORUM_SUFFIXES.map((suffix) => `${league}-${suffix}`),
  ),
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  if (DRY_RUN) {
    console.log("=== DRY RUN — no documents will be deleted ===\n");
  }

  console.log(`Checking ${FORUM_IDS_TO_DELETE.length} forum documents...\n`);

  const toDelete = [];

  for (const id of FORUM_IDS_TO_DELETE) {
    const snap = await db.collection("forums").doc(id).get();
    if (snap.exists) {
      toDelete.push(id);
      console.log(`  FOUND     ${id}`);
    } else {
      console.log(`  NOT FOUND ${id} (skipping)`);
    }
  }

  if (toDelete.length === 0) {
    console.log("\nNothing to delete. Exiting.");
    process.exit(0);
  }

  console.log(
    `\n${DRY_RUN ? "Would delete" : "Deleting"} ${toDelete.length} document(s)...`,
  );

  if (DRY_RUN) {
    console.log("\nRe-run without --dry-run to perform the deletion.");
    process.exit(0);
  }

  // Delete in a single batch (≤ 500 ops; we have at most 8 + 24 = 32 docs)
  const batch = db.batch();
  for (const id of toDelete) {
    batch.delete(db.collection("forums").doc(id));
  }
  await batch.commit();

  console.log(`\nDeleted ${toDelete.length} forum document(s). Done.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
