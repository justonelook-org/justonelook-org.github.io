import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scenarios = JSON.parse(await readFile(new URL("../evals/self-directed-attention.json", import.meta.url), "utf8"));
const sdaPage = await readFile(new URL("../../../self-directed-attention/index.html", import.meta.url), "utf8");
const compatibilityPage = await readFile(new URL("../../../ai/self-directed-attention/index.html", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../../../sitemap.xml", import.meta.url), "utf8");
const whatNowPage = await readFile(new URL("../../../what-now.html", import.meta.url), "utf8");

test("uses the canonical public SDA route and retains the former route as a redirect", () => {
  assert.match(sdaPage, /<link rel="canonical" href="https:\/\/justonelook\.org\/self-directed-attention\/">/);
  assert.match(sdaPage, /<meta property="og:url" content="https:\/\/justonelook\.org\/self-directed-attention\/">/);
  assert.match(compatibilityPage, /<meta name="robots" content="noindex">/);
  assert.match(compatibilityPage, /<link rel="canonical" href="https:\/\/justonelook\.org\/self-directed-attention\/">/);
  assert.match(compatibilityPage, /url=\.\.\/\.\.\/self-directed-attention\//);
  assert.match(compatibilityPage, /window\.location\.replace\("\.\.\/\.\.\/self-directed-attention\/" \+ window\.location\.search \+ window\.location\.hash\)/);
  assert.match(whatNowPage, /href="self-directed-attention\/"/);
  assert.match(sitemap, /<loc>https:\/\/justonelook\.org\/self-directed-attention\/<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/justonelook\.org\/ai\/self-directed-attention\/<\/loc>/);
});

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
