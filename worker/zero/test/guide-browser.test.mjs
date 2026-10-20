import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../../../", import.meta.url);

test("the canonical unified guide uses the shared browser assets and the retired SDA route redirects", async () => {
  const lookPage = await readFile(new URL("try-it/index.html", repositoryRoot), "utf8");
  const sdaPage = await readFile(new URL("self-directed-attention/index.html", repositoryRoot), "utf8");
  assert.match(lookPage, /assets\/css\/zero-guide\.css\?v=20260829-1/);
  assert.match(lookPage, /assets\/js\/zero-guide\.js\?v=20260829-1/);
  assert.doesNotMatch(lookPage, /look-at-yourself\.(?:css|js)/);
  assert.match(lookPage, /data-(?:api|local)-endpoint="[^"]*\/api\/unified-zero"/);
  assert.match(lookPage, /How do I look at myself\?/);
  assert.match(lookPage, /I have looked\. Then what\?/);
  assert.doesNotMatch(lookPage, /api\/look-at-yourself/);
  assert.match(sdaPage, /http-equiv="refresh" content="0; url=\/try-it\/"/i);
  assert.match(sdaPage, /location\.replace\('\/try-it\/'\)/);
  assert.match(sdaPage, /rel="canonical" href="https:\/\/justonelook\.org\/try-it\/"/);
  assert.doesNotMatch(sdaPage, /api\/self-directed-attention/);
});

test("the public unified page explains its combined private measurement", async () => {
  const page = await readFile(new URL("try-it/index.html", repositoryRoot), "utf8");
  assert.match(page, /anonymous guidance milestones/i);
  assert.match(page, /does not decide whether the inward look occurred or succeeded/i);
  assert.match(page, /whether attention skills improved/i);
  assert.match(page, /provides practical guidance in the Just One Look Method/i);
});

test("What Now and the retired SDA route return visitors to canonical unified Zero", async () => {
  const page = await readFile(new URL("what-now.html", repositoryRoot), "utf8");
  const sdaPage = await readFile(new URL("self-directed-attention/index.html", repositoryRoot), "utf8");
  assert.match(page, /href="try-it\/"[^>]*>Continue with Zero</i);
  assert.doesNotMatch(page, /href="self-directed-attention\/"/i);
  assert.match(sdaPage, /location\.replace\('\/try-it\/'\)/);
});

test("SDA handoff and the safe renderer allow only the two approved internal links", async () => {
  const sdaInstructions = await readFile(new URL("zero/self-directed-attention-exercise/instructions.md", repositoryRoot), "utf8");
  const script = await readFile(new URL("assets/js/zero-guide.js", repositoryRoot), "utf8");
  assert.match(sdaInstructions, /\[Look At Yourself guide\]\(https:\/\/justonelook\.org\/try-it\/\)/);
  assert.match(script, /href: "https:\/\/justonelook\.org\/", label: "Just One Look website"/);
  assert.match(script, /href: "https:\/\/justonelook\.org\/try-it\/", label: "Look At Yourself guide"/);
  assert.doesNotMatch(script, /href\s*=\s*(?:token|match|text|approvedLink\.url)/);
  assert.equal((script.match(/href: "/g) || []).length, 2);
});

test("the retired SDA route and shared browser script contain no Step One tracking memory", async () => {
  const sdaPage = await readFile(new URL("self-directed-attention/index.html", repositoryRoot), "utf8");
  const script = await readFile(new URL("assets/js/zero-guide.js", repositoryRoot), "utf8");
  assert.doesNotMatch(sdaPage + script, /confirmsStepOne|remembers-step-one|stepOneConfirmed|localStorage|jol-sda-step-one-confirmed/);
});
