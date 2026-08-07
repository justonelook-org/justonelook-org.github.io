import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scenarios = JSON.parse(await readFile(new URL("../evals/look-at-yourself.json", import.meta.url), "utf8"));

test("covers Looking Zero's behavioral evaluation scenarios without exact reply templates", () => {
  assert.equal(scenarios.length, 14);
  assert.equal(new Set(scenarios.map(({ id }) => id)).size, scenarios.length);

  const requiredIds = [
    "starter-guide-me",
    "starter-object",
    "starter-action",
    "starter-strange",
    "misunderstanding-thoughts",
    "misunderstanding-body",
    "misunderstanding-visualization",
    "misunderstanding-suppression",
    "no-special-result",
    "uncertain-success",
    "follow-up-repetition",
    "follow-up-after-starter",
    "step-one-boundary",
    "completion-transition"
  ];

  assert.deepEqual(scenarios.map(({ id }) => id), requiredIds);
  for (const scenario of scenarios) {
    assert.ok(Array.isArray(scenario.messages) && scenario.messages.length > 0, `${scenario.id} needs conversation input`);
    assert.ok(Array.isArray(scenario.should) && scenario.should.length >= 2, `${scenario.id} needs positive criteria`);
    assert.ok(Array.isArray(scenario.should_not) && scenario.should_not.length >= 2, `${scenario.id} needs boundary criteria`);
    assert.equal("expected_reply" in scenario, false, `${scenario.id} must evaluate meaning rather than exact wording`);
  }
});
