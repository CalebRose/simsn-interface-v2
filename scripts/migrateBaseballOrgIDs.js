/**
 * migrateBaseballOrgIDs.js
 *
 * One-time migration script: fetches all baseball organizations from the API,
 * then for each organization with a real (non-AI) user assigned, finds that
 * user in Firestore and writes the correct CollegeBaseballOrgID or MLBOrgID.
 *
 * Prerequisites:
 *   - scripts/serviceAccountKey.json present (never commit this file)
 *   - node scripts/migrateBaseballOrgIDs.js
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

const BASEBALL_API = "https://simbaseballapi-production.up.railway.app/api/v1/";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true if the username represents a real person (not AI / empty). */
function isRealUser(name) {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed === "" || trimmed.toLowerCase() === "ai") return false;
  return true;
}

/**
 * Finds a user document by username and writes updateData to it.
 * Logs the result; does not throw on missing users.
 */
async function updateUserByUsername(username, updateData) {
  const snap = await db
    .collection("users")
    .where("username", "==", username)
    .get();

  if (snap.empty) {
    console.warn(`  ⚠  No Firestore user found for username: "${username}"`);
    return;
  }

  const updates = snap.docs.map((d) => d.ref.update(updateData));
  await Promise.all(updates);
  console.log(`  ✓  Updated "${username}" →`, JSON.stringify(updateData));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching all baseball organizations from API…");
  const res = await fetch(`${BASEBALL_API}org_report/`);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  /** @type {Array<{id: number, league: "mlb"|"college", owner_name?: string, gm_name?: string, manager_name?: string, scout_name?: string, coach?: string}>} */
  const orgs = await res.json();
  console.log(`Fetched ${orgs.length} organizations.\n`);

  let processed = 0;
  let skipped = 0;

  for (const org of orgs) {
    const orgId = org.id;

    if (org.league === "college") {
      // ── College org ──────────────────────────────────────────────
      const coach = org.coach;
      if (!isRealUser(coach)) {
        console.log(`[College org ${orgId}] No real coach — skipping.`);
        skipped++;
        continue;
      }
      console.log(`[College org ${orgId}] coach="${coach}"`);
      await updateUserByUsername(coach, { CollegeBaseballOrgID: orgId });
      processed++;
    } else if (org.league === "mlb") {
      // ── MLB org ───────────────────────────────────────────────────
      const roles = {
        owner_name: org.owner_name,
        gm_name: org.gm_name,
        manager_name: org.manager_name,
        scout_name: org.scout_name,
      };

      const realUsers = Object.entries(roles).filter(([, name]) =>
        isRealUser(name),
      );

      if (realUsers.length === 0) {
        console.log(`[MLB org ${orgId}] No real users assigned — skipping.`);
        skipped++;
        continue;
      }

      console.log(
        `[MLB org ${orgId}] users: ${realUsers.map(([r, n]) => `${r}="${n}"`).join(", ")}`,
      );
      for (const [, username] of realUsers) {
        await updateUserByUsername(username, { MLBOrgID: orgId });
        processed++;
      }
    } else {
      console.log(`[org ${orgId}] Unknown league "${org.league}" — skipping.`);
      skipped++;
    }
  }

  console.log(
    `\nDone. ${processed} user(s) updated, ${skipped} org(s) skipped.`,
  );
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
