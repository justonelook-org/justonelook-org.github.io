import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scenarios = JSON.parse(await readFile(new URL("../evals/self-directed-attention.json", import.meta.url), "utf8"));
const sdaPage = await readFile(new URL("../../../ai/self-directed-attention/index.html", import.meta.url), "utf8");

test("covers SDA Zero's natural completion boundaries without exact reply templates", () => {
  assert.deepEqual(scenarios.map(({ id }) => id), [
    "acknowledgment-stays-open",
    "explicit-completion-closes",
    "do-not-close-with-open-question",
    "what-next-closes",
    "distraction-is-not-failure"
  ]);
  for (const scenario of scenarios) {
    assert.ok(Array.isArray(scenario.messages) && scenario.messages.length > 0);
    assert.ok(Array.isArray(scenario.should) && scenario.should.length >= 2);
    assert.ok(Array.isArray(scenario.should_not) && scenario.should_not.length >= 2);
    assert.equal("expected_reply" in scenario, false);
  }
});

test("presents the four SDA starters in the intended order without fixed answers", () => {
  const starterMessages = [...sdaPage.matchAll(/data-starter="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(starterMessages, [
    "What is the Self-Directed Attention Exercise?",
    "What is Self-Directed Attention in daily life?",
    "Can you guide me through the formal exercise?",
    "Why do I keep getting distracted?"
  ]);
});

test("invites SDA visitors to write in any language", () => {
  assert.match(sdaPage, /write in your own words—in any language/);
  assert.doesNotMatch(sdaPage, /ask in your own words/);
});
