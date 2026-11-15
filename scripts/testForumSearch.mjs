import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "vite";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { connectFirestoreEmulator, terminate } from "firebase/firestore";

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host) throw new Error("Run this test with the Firestore emulator.");
const [hostname, port] = host.split(":");
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const { firestore } = await vite.ssrLoadModule("/src/firebase/firebase.tsx");
connectFirestoreEmulator(firestore, hostname, Number(port), {
  mockUserToken: { sub: "forum-search-tester", user_id: "forum-search-tester" },
});
const { ForumService } = await vite.ssrLoadModule("/src/_services/forumService.tsx");
const adminApp = initializeApp({ projectId: firestore.app.options.projectId });
const db = getAdminFirestore(adminApp);
const prefix = `forum-search-test-${randomUUID()}`;
const refs = [];

try {
  const batch = db.batch();
  for (const [id, data] of Object.entries({
    author: { username: `${prefix}Coach`, usernameLower: `${prefix}coach` },
    legacy: { username: `${prefix}LegacyCoach` },
    duplicate: { username: `${prefix}COACH`, usernameLower: `${prefix}coach` },
    other: { username: `${prefix}Other`, usernameLower: `${prefix}other` },
  })) {
    const ref = db.collection("users").doc(`${prefix}-${id}`);
    refs.push(ref);
    batch.set(ref, data);
  }
  for (const [id, author, deleted, time] of [
    ["newest", "author", false, 3000],
    ["older", "author", false, 2000],
    ["deleted", "author", true, 4000],
    ["other", "other", false, 5000],
  ]) {
    const ref = db.collection("threads").doc(`${prefix}-${id}`);
    refs.push(ref);
    batch.set(ref, {
      author: { uid: `${prefix}-${author}` },
      isDeleted: deleted,
      latestActivityAt: new Date(time),
      title: id,
      forumId: "forum",
    });
  }
  await batch.commit();

  assert.deepEqual(
    (await ForumService.FindUsersByUsername(`${prefix}coach`)).map((u) => u.uid).sort(),
    [`${prefix}-author`, `${prefix}-duplicate`],
  );
  assert.deepEqual(await ForumService.FindUsersByUsername(`${prefix}LegacyCoach`), [
    { uid: `${prefix}-legacy`, username: `${prefix}LegacyCoach` },
  ]);
  assert.deepEqual(await ForumService.FindUsersByUsername(`${prefix}OTHER`), [
    { uid: `${prefix}-other`, username: `${prefix}Other` },
  ]);
  assert.deepEqual(await ForumService.FindUsersByUsername(`${prefix}missing`), []);
  const first = await ForumService.SearchThreads({ authorUid: `${prefix}-author`, pageSize: 1 });
  assert.deepEqual(first.threads.map((thread) => thread.id), [`${prefix}-newest`]);
  assert.ok(first.lastDoc);
  const second = await ForumService.SearchThreads(
    { authorUid: `${prefix}-author`, pageSize: 1 },
    first.lastDoc,
  );
  assert.deepEqual(second.threads.map((thread) => thread.id), [`${prefix}-older`]);
  const missing = await ForumService.SearchThreads({ authorUid: `${prefix}-legacy` });
  assert.deepEqual(missing.threads, []);
  console.log("Forum username and thread search tests passed.");
} finally {
  const cleanup = db.batch();
  for (const ref of refs) cleanup.delete(ref);
  await cleanup.commit();
  await terminate(firestore);
  await deleteApp(adminApp);
  await vite.close();
}
