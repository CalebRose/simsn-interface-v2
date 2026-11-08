/**
 * One-time fix: renames the "Subscriber's Lounge" forum to "Subscribers' Lounge".
 * Same prerequisites as seedForums.js. Usage: node scripts/fixSubscribersLoungeName.js
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "serviceAccountKey.json"), "utf8"),
);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const snap = await db
  .collection("forums")
  .where("slug", "==", "subscribers-lounge")
  .get();

for (const doc of snap.docs) {
  await doc.ref.update({
    name: "Subscribers' Lounge",
    updatedAt: admin.firestore.Timestamp.now(),
  });
  console.log(`Updated ${doc.id}`);
}
console.log(`Done (${snap.size} document(s)).`);
