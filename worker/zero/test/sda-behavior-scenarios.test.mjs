import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scenarios = JSON.parse(await readFile(new URL("../evals/self-directed-attention.json", import.meta.url), "utf8"));
const sdaPage = await readFile(new URL("../../../self-directed-attention/index.html", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../../../sitemap.xml", import.meta.url), "utf8");
const whatNowPage = await readFile(new URL("../../../what-now.html", import.meta.url), "utf8");

test("redirects the former SDA route to canonical unified Zero", () => {
  assert.match(sdaPage, /<link rel="canonical" href="https:\/\/justonelook\.org\/try-it\/">/);
  assert.match(sdaPage, /http-equiv="refresh" content="0; url=\/try-it\/"/i);
  assert.match(sdaPage, /location\.replace\('\/try-it\/'\)/);
  assert.match(whatNowPage, /href="try-it\/"[^>]*>Continue with Zero</i);
  assert.doesNotMatch(whatNowPage, /href="self-directed-attention\/"/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/justonelook\.org\/self-directed-attention\/<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/justonelook\.org\/ai\/self-directed-attention\/<\/loc>/);
});

test("does not retain former AI guide entry pages", async () => {
  for (const formerPath of ["ai/look-at-yourself/index.html", "ai/self-directed-attention/index.html"]) {
    await assert.rejects(
      () => readFile(new URL(`../../../${formerPath}`, import.meta.url), "utf8"),
      { code: "ENOENT" }
    );
  }
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

test("the retired SDA page no longer exposes a separate guide interface", () => {
  assert.doesNotMatch(sdaPage, /data-starter=/);
  assert.doesNotMatch(sdaPage, /data-api-endpoint=/);
  assert.doesNotMatch(sdaPage, /assets\/js\/zero-guide\.js/);
});
