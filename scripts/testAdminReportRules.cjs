const assert = require("node:assert/strict");
const { initializeApp, deleteApp } = require("firebase/app");
const {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  terminate,
  updateDoc,
} = require("firebase/firestore");

const projectId = process.env.GCLOUD_PROJECT || "demo-simfba-admin-reports";
const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host) throw new Error("Run this test with the Firestore emulator.");
const [hostname, port] = host.split(":");
const base = `http://${host}/v1/projects/${projectId}/databases/(default)/documents`;
const fields = (data) => Object.fromEntries(
  Object.entries(data).map(([key, value]) => [
    key,
    typeof value === "number" ? { integerValue: String(value) } : { stringValue: value },
  ]),
);

async function seed(path, data) {
  const response = await fetch(`${base}/${path}`, {
    method: "PATCH",
    headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
    body: JSON.stringify({ fields: fields(data) }),
  });
  assert.equal(response.status, 200, await response.text());
}

function client(uid) {
  const app = initializeApp({ projectId }, uid || "anonymous");
  const db = getFirestore(app);
  connectFirestoreEmulator(
    db,
    hostname,
    Number(port),
    uid ? { mockUserToken: { sub: uid, user_id: uid } } : {},
  );
  return { app, db };
}

async function denied(promise, label) {
  await assert.rejects(promise, (error) => error.code === "permission-denied", label);
}

async function main() {
  await seed("users/coach", {
    username: "test-coach", roleID: "Member", teamId: 11, NFLTeamID: 12,
    cbb_id: 13, NBATeamID: 14, CHLTeamID: 15, PHLTeamID: 16,
  });
  await seed("users/admin", { username: "admin", roleID: "Admin" });
  const coach = client("coach");
  const admin = client("admin");
  const newUser = client("new-user");
  const anonymous = client(null);
  try {
    const report = {
      League: "SimCFB", TeamID: 11, ReportType: "team_resignation",
      Message: "test-coach resigned from their team.", ResponseType: 0,
      Status: "pending", CreatedAt: serverTimestamp(), UpdatedAt: null,
      AdminResponse: null, ResolvedBy: null, ResolvedAt: null,
      Phase: null, WeekID: null, ReportedBy: "coach",
    };
    const create = (id, data) => setDoc(doc(coach.db, "adminReports", id), data);
    for (const [league, teamID] of [
      ["SimCFB", 11], ["SimNFL", 12], ["SimCBB", 13], ["SimNBA", 14],
      ["SimCHL", 15], ["SimPHL", 16], ["SimCLAX", 17],
    ]) {
      await create(league, { ...report, League: league, TeamID: teamID });
    }
    await denied(create("wrong-team", { ...report, TeamID: 99 }), "wrong team");
    await denied(create("wrong-user", { ...report, ReportedBy: "other" }), "wrong reporter");
    await denied(create("wrong-status", { ...report, Status: "resolved" }), "forged status");
    await denied(create("wrong-message", { ...report, Message: "forged" }), "forged message");
    await denied(setDoc(doc(anonymous.db, "adminReports", "anonymous"), report), "anonymous create");
    await denied(getDoc(doc(coach.db, "adminReports", "SimCFB")), "member read");
    assert.equal((await getDoc(doc(admin.db, "adminReports", "SimCFB"))).exists(), true);
    await denied(updateDoc(doc(admin.db, "adminReports", "SimCFB"), { Status: "resolved" }), "client report update");
    await updateDoc(doc(coach.db, "users", "coach"), { cbb_id: 0 });
    await denied(updateDoc(doc(coach.db, "users", "coach"), { cbb_id: 77 }), "assign own team");
    await denied(updateDoc(doc(coach.db, "users", "coach"), { roleID: "Admin" }), "change own role");
    await denied(updateDoc(doc(coach.db, "users", "admin"), { roleID: "Member" }), "change another user");
    await updateDoc(doc(coach.db, "users", "admin"), { forumReactionCount: 1 });
    await setDoc(doc(newUser.db, "users", "new-user"), {
      username: "new-user", email: "new-user@example.test", createdAt: new Date(),
    });
    console.log("Admin report and resignation Firestore rules passed.");
  } finally {
    await Promise.all([terminate(coach.db), terminate(admin.db), terminate(newUser.db), terminate(anonymous.db)]);
    await Promise.all([deleteApp(coach.app), deleteApp(admin.app), deleteApp(newUser.app), deleteApp(anonymous.app)]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
