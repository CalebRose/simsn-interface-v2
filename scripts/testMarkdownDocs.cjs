const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const Markdown = require("markdown-to-jsx").default;
const ts = require("typescript");

const source = readFileSync("src/_helper/markdownDocsHelper.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const helpers = {};
new Function("require", "exports", compiled)(require, helpers);

function prepare(markdown) {
  return helpers.normalizeMarkdownHeadings(helpers.stripEmbeddedToc(markdown));
}

for (const name of ["SimSN_Football", "SimHCK", "SimBBA"]) {
  test(`${name} sidebar entries match the rendered headings`, () => {
    const markdown = readFileSync(`src/_techdocs/${name}.md`, "utf8");
    const body = prepare(markdown);
    const toc = helpers.parseMarkdownHeadings(body);
    const html = renderToStaticMarkup(React.createElement(Markdown, null, body));
    const ids = [...html.matchAll(/<h[1-4] id="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(toc.length > 0);
    assert.deepEqual(toc.map((entry) => entry.id), ids);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(!toc.some((entry) => entry.text.includes("{#")));
    assert.ok(!toc.some((entry) => entry.text === "Table of Contents"));
  });
}

test("football guide retains its overview and embedded images without its exported TOC", () => {
  const markdown = readFileSync("src/_techdocs/SimSN_Football.md", "utf8");
  const body = prepare(markdown);
  const html = renderToStaticMarkup(React.createElement(Markdown, null, body));
  assert.match(body, /This documentation covers everything/);
  assert.doesNotMatch(body, /\[\*\*Steps for Signing Up\s+5\*\*\]\(#/);
  assert.equal((html.match(/<img src="data:image\/png;base64,/g) || []).length, 5);
  const toc = helpers.parseMarkdownHeadings(body);
  assert.deepEqual(toc.filter((entry) => entry.text === "Personnel").map((entry) => entry.id), [
    "personnel", "personnel-1",
  ]);
  assert.ok(toc.some((entry) => entry.text === "Pistol"));
});

test("heading annotations inside fenced code remain unchanged", () => {
  const markdown = "# Heading {#heading}\n\n```md\n# Example {#example}\n```";
  assert.equal(
    helpers.normalizeMarkdownHeadings(markdown),
    "# Heading\n\n```md\n# Example {#example}\n```",
  );
});

test("both football league selections render the football guide and its sidebar", () => {
  const componentSource = readFileSync("src/components/Documentation/DocumentationMain.tsx", "utf8");
  const componentCompiled = ts.transpileModule(componentSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  for (const league of ["SimCFB", "SimNFL"]) {
    const components = {
      "../../_design/Container": {
        PageContainer: ({ children }) => React.createElement("main", null, children),
      },
      "../../_design/Typography": {
        Text: ({ children }) => React.createElement("span", null, children),
      },
      "../../context/LeagueContext": {
        useLeagueStore: () => ({ selectedLeague: league, setSelectedLeague: () => {} }),
      },
      "../../_design/Select": { SelectDropdown: () => null },
      "./maincontent.json": require("../src/components/Documentation/maincontent.json"),
      "./MarkdownDoc": {
        MarkdownDoc: ({ content }) => React.createElement(Markdown, null, content),
      },
      "./DocTableOfContents": {
        DocTableOfContents: ({ toc }) => React.createElement("nav", { "data-entries": toc.length }),
      },
      "../../_helper/markdownDocsHelper": helpers,
      "../../_techdocs/SimHCK.md?raw": readFileSync("src/_techdocs/SimHCK.md", "utf8"),
      "../../_techdocs/SimBBA.md?raw": readFileSync("src/_techdocs/SimBBA.md", "utf8"),
      "../../_techdocs/SimSN_Football.md?raw": readFileSync("src/_techdocs/SimSN_Football.md", "utf8"),
    };
    const exports = {};
    new Function("require", "exports", componentCompiled)((name) =>
      name in components ? components[name] : require(name), exports);
    const html = renderToStaticMarkup(React.createElement(exports.DocumentationMain));
    assert.ok(html.includes(`${league} Documentation`));
    assert.ok(html.includes("SimSN Football"));
    assert.ok(html.includes('id="simnfl-specific-rules"'));
    assert.match(html, /data-entries="[1-9]\d*"/);
  }
});
