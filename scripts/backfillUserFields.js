/**
 * backfillUserFields.js
 *
 * One-time backfill for every document in the "users" collection:
 *   - usernameLower (lowercased username, used for case-insensitive mention search)
 *   - cfbCrootSubscriptionBenefit, cbbCrootSubscriptionBenefit,
 *     chlCrootSubscriptionBenefit,
 *     newCFBUserCustomCrootBenefit, newCBBUserCustomCrootBenefit,
 *     newCHLUserCustomCrootBenefit (booleans, default false)
 *
 * Existing values are never overwritten; only missing/incorrect fields are written.
 *
 * Prerequisites:
 *   - scripts/serviceAccountKey.json present (never commit this file)
 *   - node scripts/backfillUserFields.js
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

const BOOLEAN_FIELDS = [
  "cfbCrootSubscriptionBenefit",
  "cbbCrootSubscriptionBenefit",
  "chlCrootSubscriptionBenefit",
  "newCFBUserCustomCrootBenefit",
  "newCBBUserCustomCrootBenefit",
  "newCHLUserCustomCrootBenefit",
];

const BATCH_SIZE = 400;

async function main() {
  const snap = await db.collection("users").get();
  console.log(`Found ${snap.size} user documents.`);

  let batch = db.batch();
  let pending = 0;
  let updated = 0;
  let unchanged = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const updates = {};

    if (typeof data.username === "string" && data.username.length > 0) {
      const lower = data.username.toLowerCase();
      if (data.usernameLower !== lower) updates.usernameLower = lower;
    } else {
      console.warn(`  ⚠  ${docSnap.id} has no username; skipping usernameLower.`);
    }

    for (const field of BOOLEAN_FIELDS) {
      if (typeof data[field] !== "boolean") updates[field] = false;
    }

    if (Object.keys(updates).length === 0) {
      unchanged++;
      continue;
    }

    batch.update(docSnap.ref, updates);
    pending++;
    updated++;

    if (pending >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
      console.log(`  …committed ${updated} updates so far`);
    }
  }

  if (pending > 0) await batch.commit();

  console.log(`\nDone. ${updated} user(s) updated, ${unchanged} already current.`);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
