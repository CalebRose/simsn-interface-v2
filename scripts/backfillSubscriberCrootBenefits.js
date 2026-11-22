/**
 * backfillSubscriberCrootBenefits.js
 *
 * For every document in the "users" collection where IsSubscribed === true,
 * sets cfbCrootSubscriptionBenefit, cbbCrootSubscriptionBenefit and
 * chlCrootSubscriptionBenefit to true.
 *
 * Prerequisites:
 *   - scripts/serviceAccountKey.json present (never commit this file)
 *   - node scripts/backfillSubscriberCrootBenefits.js
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

const BENEFIT_FIELDS = [
  "cfbCrootSubscriptionBenefit",
  "cbbCrootSubscriptionBenefit",
  "chlCrootSubscriptionBenefit",
];

const BATCH_SIZE = 400;

async function main() {
  const snap = await db.collection("users").get();
  console.log(`Found ${snap.size} user documents.`);

  let batch = db.batch();
  let pending = 0;
  let updated = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();

    if (data.IsSubscribed !== true) {
      skipped++;
      continue;
    }

    const updates = {};
    for (const field of BENEFIT_FIELDS) {
      if (data[field] !== true) updates[field] = true;
    }

    if (Object.keys(updates).length === 0) {
      skipped++;
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

  console.log(
    `\nDone. ${updated} subscriber(s) updated, ${skipped} skipped (not subscribed or already current).`,
  );
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
