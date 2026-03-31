/**
 * migrateToMediaForum.js
 *
 * One-time migration script that moves all threads (and their associated posts)
 * from the old per-league top-level forums (simcfb, simnfl, simcbb, simnba,
 * simchl, simphl, simcbl, simmlb) and their subforums (news, daily, postgame)
 * to the new Media forum structure (media-simcfb, media-simnfl, etc.).
 *
 * Prerequisites:
 *   1. Run seedForums.js first to create the new forum documents.
 *   2. node scripts/migrateToMediaForum.js
 *
 * What it does:
 *   - For every thread in an old league forum or subforum, updates:
 *       thread.forumId  → new media subforum id (e.g. "media-simcfb")
 *       thread.forumPath → ["media", "simcfb"]
 *   - Updates every post in those threads:
 *       post.forumId → new media subforum id
 *   - Recalculates threadCount / postCount on both old and new forum docs.
 *   - Writes a moderation log entry for each moved thread.
 *   - Does NOT delete old forum documents (they can be removed manually
 *     once you verify everything looks correct).
 *
 * Safety:
 *   - Idempotent: skips threads already living in a "media-*" forum.
 *   - Runs in batches of 450 writes to stay within Firestore's 500-op limit.
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

// ─── Mapping: old forum id → new media subforum id ───────────────────────────
//
// All old league top-level forums AND their subforums funnel to the single
// corresponding media subforum for that league.
//
const OLD_TO_NEW = {
  // top-level league forums
  simcfb: "media-simcfb",
  simnfl: "media-simnfl",
  simcbb: "media-simcbb",
  simnba: "media-simnba",
  simchl: "media-simchl",
  simphl: "media-simphl",
  simcbl: "media-simcbl",
  simmlb: "media-simmlb",
  // subforums under the old top-level league forums
  "simcfb-news": "media-simcfb",
  "simcfb-daily": "media-simcfb",
  "simcfb-postgame": "media-simcfb",
  "simnfl-news": "media-simnfl",
  "simnfl-daily": "media-simnfl",
  "simnfl-postgame": "media-simnfl",
  "simcbb-news": "media-simcbb",
  "simcbb-daily": "media-simcbb",
  "simcbb-postgame": "media-simcbb",
  "simnba-news": "media-simnba",
  "simnba-daily": "media-simnba",
  "simnba-postgame": "media-simnba",
  "simchl-news": "media-simchl",
  "simchl-daily": "media-simchl",
  "simchl-postgame": "media-simchl",
  "simphl-news": "media-simphl",
  "simphl-daily": "media-simphl",
  "simphl-postgame": "media-simphl",
  "simcbl-news": "media-simcbl",
  "simcbl-daily": "media-simcbl",
  "simcbl-postgame": "media-simcbl",
  "simmlb-news": "media-simmlb",
  "simmlb-daily": "media-simmlb",
  "simmlb-postgame": "media-simmlb",
};

// New forum path for each media subforum id
const NEW_FORUM_PATH = {
  "media-simcfb": ["media", "simcfb"],
  "media-simnfl": ["media", "simnfl"],
  "media-simcbb": ["media", "simcbb"],
  "media-simnba": ["media", "simnba"],
  "media-simchl": ["media", "simchl"],
  "media-simphl": ["media", "simphl"],
  "media-simcbl": ["media", "simcbl"],
  "media-simmlb": ["media", "simmlb"],
};

const BATCH_SIZE = 450;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function flushBatch(batch, count) {
  if (count === 0) return;
  await batch.commit();
}

/**
 * Commit the current batch and return a fresh one with a reset counter.
 */
async function maybeFlush(batch, count) {
  if (count >= BATCH_SIZE) {
    await batch.commit();
    return { batch: db.batch(), count: 0 };
  }
  return { batch, count };
}

// ─── Main migration ───────────────────────────────────────────────────────────

async function migrate() {
  const oldForumIds = Object.keys(OLD_TO_NEW);
  console.log(
    `\nMigrating threads from ${oldForumIds.length} old forum(s) to Media subforums…\n`,
  );

  // Counters used to patch forum threadCount / postCount at the end
  const oldForumDelta = {}; // forumId → { threads: -n, posts: -n }
  const newForumDelta = {}; // forumId → { threads: +n, posts: +n }

  let batch = db.batch();
  let opCount = 0;
  let totalThreadsMoved = 0;
  let totalPostsUpdated = 0;

  for (const oldForumId of oldForumIds) {
    const newForumId = OLD_TO_NEW[oldForumId];
    const newPath = NEW_FORUM_PATH[newForumId];

    // Fetch all non-deleted threads in this old forum
    const threadsSnap = await db
      .collection("threads")
      .where("forumId", "==", oldForumId)
      .where("isDeleted", "==", false)
      .get();

    if (threadsSnap.empty) {
      console.log(`  ${oldForumId}: no threads to migrate`);
      continue;
    }

    console.log(
      `  ${oldForumId} → ${newForumId}: ${threadsSnap.size} thread(s)`,
    );

    for (const threadDoc of threadsSnap.docs) {
      const threadData = threadDoc.data();

      // Skip if already in a media forum (idempotency)
      if (threadData.forumId.startsWith("media-")) {
        console.log(`    SKIP thread ${threadDoc.id} (already migrated)`);
        continue;
      }

      const threadRef = db.collection("threads").doc(threadDoc.id);

      // Update thread
      batch.update(threadRef, {
        forumId: newForumId,
        forumPath: newPath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      opCount++;
      ({ batch, count: opCount } = await maybeFlush(batch, opCount));

      // Write a moderation log entry for the move
      const logRef = db.collection("moderationLogs").doc();
      batch.set(logRef, {
        targetType: "thread",
        targetId: threadDoc.id,
        action: "move",
        performedBy: { uid: "system", username: "migration-script" },
        reason: `Migrated from ${oldForumId} to ${newForumId}`,
        previousState: { forumId: oldForumId, forumPath: threadData.forumPath },
        nextState: { forumId: newForumId, forumPath: newPath },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      opCount++;
      ({ batch, count: opCount } = await maybeFlush(batch, opCount));

      // Track deltas for forum counter adjustment
      const postCount = (threadData.replyCount ?? 0) + 1; // posts = replies + first post
      oldForumDelta[oldForumId] = oldForumDelta[oldForumId] ?? {
        threads: 0,
        posts: 0,
      };
      oldForumDelta[oldForumId].threads -= 1;
      oldForumDelta[oldForumId].posts -= postCount;

      newForumDelta[newForumId] = newForumDelta[newForumId] ?? {
        threads: 0,
        posts: 0,
      };
      newForumDelta[newForumId].threads += 1;
      newForumDelta[newForumId].posts += postCount;

      totalThreadsMoved++;

      // Update all posts in this thread
      const postsSnap = await db
        .collection("posts")
        .where("threadId", "==", threadDoc.id)
        .get();

      for (const postDoc of postsSnap.docs) {
        const postRef = db.collection("posts").doc(postDoc.id);
        batch.update(postRef, {
          forumId: newForumId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        opCount++;
        ({ batch, count: opCount } = await maybeFlush(batch, opCount));
        totalPostsUpdated++;
      }
    }
  }

  // Flush any remaining writes
  await flushBatch(batch, opCount);
  batch = db.batch();
  opCount = 0;

  // ── Update forum counters ──────────────────────────────────────────────────
  console.log("\nUpdating forum counters…");

  for (const [forumId, delta] of Object.entries(oldForumDelta)) {
    const ref = db.collection("forums").doc(forumId);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log(`  SKIP counter update for ${forumId} (forum not found)`);
      continue;
    }
    batch.update(ref, {
      threadCount: admin.firestore.FieldValue.increment(delta.threads),
      postCount: admin.firestore.FieldValue.increment(delta.posts),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    opCount++;
    ({ batch, count: opCount } = await maybeFlush(batch, opCount));
    console.log(`  ${forumId}: threads ${delta.threads}, posts ${delta.posts}`);
  }

  for (const [forumId, delta] of Object.entries(newForumDelta)) {
    const ref = db.collection("forums").doc(forumId);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log(
        `  SKIP counter update for ${forumId} (new forum not found — run seedForums.js first)`,
      );
      continue;
    }
    batch.update(ref, {
      threadCount: admin.firestore.FieldValue.increment(delta.threads),
      postCount: admin.firestore.FieldValue.increment(delta.posts),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    opCount++;
    ({ batch, count: opCount } = await maybeFlush(batch, opCount));
    console.log(
      `  ${forumId}: threads +${delta.threads}, posts +${delta.posts}`,
    );
  }

  await flushBatch(batch, opCount);

  console.log(`
Migration complete.
  Threads moved : ${totalThreadsMoved}
  Posts updated : ${totalPostsUpdated}

Old forum documents were NOT deleted. Verify the migration looks correct
in the Firebase Console, then you can manually delete the old forum docs
(simcfb, simnfl, simcbb, simnba, simchl, simphl, simcbl, simmlb and their
subforums) or run a cleanup script.
`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
