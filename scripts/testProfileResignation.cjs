const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const ts = require("typescript");

const source = readFileSync("src/components/Profile/useProfileResignation.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup({ failRemoval = false, failReport = false, failProfile = false } = {}) {
  const events = [];
  let user = { id: "coach", username: "Coach", cbb_id: 13 };
  const modules = {
    react: {
      useRef: (value) => ({ current: value }),
      useState: (value) => [value, () => {}],
    },
    "notistack": { enqueueSnackbar: (message, options) => events.push(["notice", message, options.variant]) },
    "firebase/firestore": {
      doc: (_, collection, id) => `${collection}/${id}`,
      updateDoc: async (ref, fields) => {
        events.push(["profile", ref, fields]);
        if (failProfile) throw new Error("profile failed");
      },
    },
    "../../context/AuthContext": {
      useAuthStore: () => ({
        currentUser: user,
        setCurrentUser: (update) => { user = update(user); },
      }),
    },
    "../../firebase/firebase": { firestore: {} },
    "../../_services/adminReportService": {
      createResignationReport: async (report) => {
        events.push(["report", report]);
        if (failReport) throw new Error("report failed");
      },
    },
  };
  const exports = {};
  new Function("require", "exports", compiled)((name) => {
    if (!(name in modules)) throw new Error(`Unexpected import: ${name}`);
    return modules[name];
  }, exports);
  const { resign } = exports.useProfileResignation();
  const input = {
    league: "SimCBB", teamID: 13, phase: 2, weekID: 42,
    remove: async (teamID) => {
      events.push(["remove", teamID]);
      if (failRemoval) throw new Error("removal failed");
    },
    clearFields: { cbb_id: 0 },
    onComplete: () => events.push(["complete"]),
  };
  return { events, resign: () => resign(input), user: () => user };
}

test("reports only after successful removal, then clears the profile", async () => {
  const scenario = setup();
  await scenario.resign();
  assert.deepEqual(scenario.events.map((event) => event[0]), ["remove", "report", "profile", "complete"]);
  assert.deepEqual(scenario.events[1][1], {
    league: "SimCBB", teamID: 13, userID: "coach", username: "Coach", phase: 2, weekID: 42,
  });
  assert.equal(scenario.user().cbb_id, 0);
});

test("failed removal does not create a report or clear the profile", async () => {
  const scenario = setup({ failRemoval: true });
  await scenario.resign();
  assert.deepEqual(scenario.events.map((event) => event[0]), ["remove", "notice"]);
  assert.equal(scenario.events[1][2], "error");
  assert.equal(scenario.user().cbb_id, 13);
});

test("failed report or profile write warns after a successful resignation", async () => {
  for (const failure of [{ failReport: true }, { failProfile: true }]) {
    const scenario = setup(failure);
    await scenario.resign();
    assert.equal(scenario.events.find((event) => event[0] === "notice")[2], "warning");
    assert.equal(scenario.events.at(-1)[0], "complete");
    assert.equal(scenario.user().cbb_id, 0);
  }
});
