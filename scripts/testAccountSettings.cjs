const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const ts = require("typescript");

const source = readFileSync("src/_services/accountSettings.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup({ profileEmail = "old@example.com", authEmail = "old@example.com", reauthError, writeError } = {}) {
  const events = [];
  const user = {
    uid: "user-1",
    email: authEmail,
    getIdToken: async (force) => events.push(["token", force]),
  };
  const auth = { currentUser: user };
  const modules = {
    "firebase/auth": {
      getAuth: () => auth,
      reload: async () => events.push(["reload"]),
      EmailAuthProvider: {
        credential: (email, password) => ({ email, password }),
      },
      reauthenticateWithCredential: async (_, credential) => {
        events.push(["reauth", credential]);
        if (reauthError) throw reauthError;
      },
      verifyBeforeUpdateEmail: async (_, email) => events.push(["verify", email]),
    },
    "firebase/firestore": {
      doc: (_, collection, uid) => `${collection}/${uid}`,
      getDocFromServer: async (ref) => {
        events.push(["read", ref]);
        return { exists: () => true, data: () => ({ email: profileEmail }) };
      },
      updateDoc: async (ref, fields) => {
        events.push(["write", ref, fields]);
        if (writeError) throw writeError;
      },
    },
    "../firebase/firebase": { firestore: {} },
  };
  const exports = {};
  new Function("require", "exports", compiled)((name) => {
    if (!(name in modules)) throw new Error(`Unexpected import: ${name}`);
    return modules[name];
  }, exports);
  return { ...exports, events, auth };
}

test("email change reauthenticates before sending verification without changing the profile", async () => {
  const s = setup();
  await s.requestEmailChange("user-1", "new@example.com", "password");
  assert.deepEqual(s.events, [
    ["reauth", { email: "old@example.com", password: "password" }],
    ["verify", "new@example.com"],
  ]);
});

test("failed reauthentication or a different account cannot request a change", async () => {
  const s = setup({ reauthError: new Error("incorrect password") });
  await assert.rejects(s.requestEmailChange("user-1", "new@example.com", "bad"));
  assert.deepEqual(s.events.map((event) => event[0]), ["reauth"]);
  await assert.rejects(s.requestEmailChange("another-user", "new@example.com", "bad"));
  assert.deepEqual(s.events.map((event) => event[0]), ["reauth"]);
});

test("refresh updates the profile only after Firebase reports a different email", async () => {
  const same = setup();
  assert.equal(await same.refreshAccountEmail("user-1"), "old@example.com");
  assert.deepEqual(same.events.map((event) => event[0]), ["reload", "read"]);

  const changed = setup({ authEmail: "new@example.com" });
  assert.equal(await changed.refreshAccountEmail("user-1"), "new@example.com");
  assert.deepEqual(changed.events, [
    ["reload"], ["read", "users/user-1"], ["token", true],
    ["write", "users/user-1", { email: "new@example.com" }],
  ]);
});

test("profile sync errors are surfaced and another user's profile is never updated", async () => {
  const s = setup({ authEmail: "new@example.com", writeError: new Error("write failed") });
  await assert.rejects(s.refreshAccountEmail("user-1"), /write failed/);
  const wrongUser = setup();
  await assert.rejects(wrongUser.refreshAccountEmail("another-user"));
  assert.deepEqual(wrongUser.events, []);
});

test("a session change during reauthentication does not send a verification email", async () => {
  const s = setup();
  const original = s.auth.currentUser;
  Object.defineProperty(s.auth, "currentUser", {
    get() {
      return s.events.some((event) => event[0] === "reauth")
        ? { uid: "other", email: "other@example.com" }
        : original;
    },
  });
  await assert.rejects(s.requestEmailChange("user-1", "new@example.com", "password"));
  assert.deepEqual(s.events.map((event) => event[0]), ["reauth"]);
});

test("login reports profile sync failure without misreporting a successful login", async () => {
  const loginSource = readFileSync("src/_services/auth.tsx", "utf8");
  const loginCompiled = ts.transpileModule(loginSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
  }).outputText;
  const events = [];
  const modules = {
    "firebase/app": { initializeApp: () => ({}) },
    "firebase/auth": {
      getAuth: () => ({}),
      signInWithEmailAndPassword: async () => ({ user: { uid: "user-1" } }),
    },
    "firebase/firestore": { getFirestore: () => ({}) },
    "../firebase-config": { firebaseConfig: {} },
    "./accountSettings": {
      refreshAccountEmail: async (uid) => {
        events.push(uid);
        throw new Error("sync failed");
      },
    },
  };
  const exports = {};
  const storage = { setItem: (key, value) => events.push([key, value]) };
  new Function("require", "exports", "localStorage", "console", loginCompiled)(
    (name) => {
      if (!(name in modules)) throw new Error(`Unexpected import: ${name}`);
      return modules[name];
    },
    exports,
    storage,
    { error: () => {} },
  );
  const result = await exports.AuthService.login("old@example.com", "password");
  assert.equal(result.status, true);
  assert.match(result.message, /could not be synchronized/);
  assert.deepEqual(events, [["userId", "user-1"], "user-1"]);
});
