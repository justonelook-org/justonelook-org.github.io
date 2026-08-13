import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scenarios = JSON.parse(await readFile(new URL("../evals/self-directed-attention.json", import.meta.url), "utf8"));
const sdaPage = await readFile(new URL("../../../ai/self-directed-attention/index.html", import.meta.url), "utf8");

test("covers SDA Zero's natural completion boundaries without exact reply templates", () => {
  assert.deepEqual(scenarios.map(({ id }) => id), [
    "completion-after-formal-instruction",
    "do-not-close-with-open-question",
    "completion-after-daily-life-clarification"
  ]);
  for (const scenario of scenarios) {
    assert.ok(Array.isArray(scenario.messages) && scenario.messages.length > 0);
    assert.ok(Array.isArray(scenario.should) && scenario.should.length >= 2);
    assert.ok(Array.isArray(scenario.should_not) && scenario.should_not.length >= 2);
    assert.equal("expected_reply" in scenario, false);
  }
});

test("invites SDA visitors to write in any language", () => {
  assert.match(sdaPage, /write in your own words—in any language/);
  assert.doesNotMatch(sdaPage, /ask in your own words/);
});
