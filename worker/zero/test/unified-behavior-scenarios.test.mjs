import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scenarios = JSON.parse(await readFile(new URL("../evals/unified-zero.json", import.meta.url), "utf8"));

test("defines the approved unified Zero routing scenarios without exact replies", () => {
  assert.equal(scenarios.length, 25);
  assert.equal(new Set(scenarios.map(({ id }) => id)).size, scenarios.length);
  for (const scenario of scenarios) {
    assert.match(scenario.id, /^[a-z0-9-]+$/);
    assert.equal(typeof scenario.expected_focus, "string");
    assert.ok(Array.isArray(scenario.messages) && scenario.messages.length > 0, `${scenario.id} needs conversation input`);
    assert.equal(scenario.messages.at(-1)?.role, "user", `${scenario.id} must end with a visitor turn`);
    assert.ok(Array.isArray(scenario.should) && scenario.should.length >= 2, `${scenario.id} needs positive criteria`);
    assert.ok(Array.isArray(scenario.should_not) && scenario.should_not.length >= 2, `${scenario.id} needs boundary criteria`);
    assert.equal("expected_reply" in scenario, false, `${scenario.id} must evaluate behavior rather than exact wording`);
  }
});

test("covers every internal decision focus needed by the first unified prototype", () => {
  const focuses = new Set(scenarios.map(({ expected_focus }) => expected_focus));
  assert.deepEqual(focuses, new Set([
    "inward_look", "attention_clarification", "prerequisite_question", "space_after_invitation",
    "transition_to_sda", "formal_exercise", "daily_life", "website_handoff",
    "conversation_open", "completion"
  ]));
});

test("protects one-instruction-at-a-time and the non-evaluative transition", () => {
  const allBoundaries = scenarios.flatMap(({ should_not }) => should_not).join(" ");
  assert.match(allBoundaries, /both complete practices|both complete instructions|entire formal and daily-life program/i);
  assert.match(allBoundaries, /prove|proof|demand certainty|ask whether it worked/i);
  assert.match(allBoundaries, /Automatically introduce SDA|Advance to SDA|Start SDA/i);
});

test("allows experienced visitors to bypass unnecessary introductory guidance", () => {
  const directFormal = scenarios.find(({ id }) => id === "formal-exercise-prior-look-reported");
  const refresh = scenarios.find(({ id }) => id === "experienced-formal-refresh");
  const daily = scenarios.find(({ id }) => id === "reported-look-direct-daily-life-request");
  assert.match(directFormal.should.join(" "), /Accept the report without testing/i);
  assert.match(refresh.should.join(" "), /concise refresher/i);
  assert.match(daily.should_not.join(" "), /Require the formal exercise first/i);
});

test("protects the two-starter routing and bridges attention without rushing", () => {
  const lookingStarter = scenarios.find(({ id }) => id === "direct-guidance-new-visitor");
  const attentionStarter = scenarios.find(({ id }) => id === "formal-exercise-prerequisite-unknown");
  const bridge = scenarios.find(({ id }) => id === "general-attention-request-after-prerequisite-yes");
  assert.equal(lookingStarter.messages[0].content, "How do I look at myself?");
  assert.equal(attentionStarter.messages[0].content, "Try the attention exercise");
  assert.match(attentionStarter.should.join(" "), /Before explaining.*ask/i);
  assert.match(bridge.should.join(" "), /connected formal and daily-life forms/i);
  assert.match(bridge.should.join(" "), /formal exercise as training/i);
  assert.match(bridge.should.join(" "), /when the visitor is ready/i);
  assert.match(bridge.should_not.join(" "), /choose again/i);
  assert.match(bridge.should_not.join(" "), /confirmation.*permission/i);
  assert.match(bridge.should_not.join(" "), /directly into the complete formal exercise/i);
});
