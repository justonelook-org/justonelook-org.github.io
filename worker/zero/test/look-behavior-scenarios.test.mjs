import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scenarios = JSON.parse(await readFile(new URL("../evals/look-at-yourself.json", import.meta.url), "utf8"));
const lookingPage = await readFile(new URL("../../../try-it/index.html", import.meta.url), "utf8");
const outcomeScenarios = JSON.parse(await readFile(new URL("../evals/outcome-classification.json", import.meta.url), "utf8"));

test("covers Looking Zero's behavioral evaluation scenarios without exact reply templates", () => {
  assert.equal(scenarios.length, 18);
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
    "conceptual-after-invitation",
    "follow-up-repetition",
    "follow-up-after-starter",
    "step-one-boundary",
    "effects-fear-boundary",
    "effects-benefits-boundary",
    "method-theory-boundary",
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

test("keeps the two exact starter emphases distinct without scripting later conversation", () => {
  const objectStarter = scenarios.find(({ id }) => id === "starter-object");
  const actionStarter = scenarios.find(({ id }) => id === "starter-action");
  const followUp = scenarios.find(({ id }) => id === "follow-up-after-starter");

  assert.match(objectStarter.should.join(" "), /Begin with the object/i);
  assert.match(objectStarter.should.join(" "), /being here, present as oneself/i);
  assert.match(actionStarter.should.join(" "), /Begin with the practical action/i);
  assert.match(actionStarter.should.join(" "), /something one chooses/i);
  assert.match(actionStarter.should.join(" "), /directly invite/i);
  assert.match(followUp.should_not.join(" "), /Continue a starter script/i);
});

test("keeps explanations of effects and wider Just One Look teaching outside Zero's role", () => {
  const boundaryIds = ["effects-fear-boundary", "effects-benefits-boundary", "method-theory-boundary"];
  for (const id of boundaryIds) {
    const scenario = scenarios.find((candidate) => candidate.id === id);
    assert.ok(scenario, `${id} must be covered`);
    assert.match(scenario.should.join(" "), /Just One Look website/i);
  }
});

test("invites Looking visitors to write in any language", () => {
  assert.match(lookingPage, /write in your own words—in any language/);
  assert.doesNotMatch(lookingPage, /ask in your own words/);
});

test("documents conservative outcome-classification boundaries for human and model evals", () => {
  assert.equal(outcomeScenarios.length, 8);
  assert.equal(new Set(outcomeScenarios.map(({ id }) => id)).size, outcomeScenarios.length);
  assert.deepEqual(new Set(outcomeScenarios.map(({ expected }) => expected)), new Set(["none", "attempt_indicated", "attempt_explicitly_reported"]));
  for (const scenario of outcomeScenarios) {
    assert.equal(typeof scenario.invitation_delivered, "boolean");
    assert.ok(scenario.visitor.length > 0);
    assert.ok(scenario.reason.length > 0);
  }
});
