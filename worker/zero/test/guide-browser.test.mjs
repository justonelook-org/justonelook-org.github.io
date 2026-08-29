import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../../../", import.meta.url);

test("both public guides load the shared renamed assets with one JavaScript version", async () => {
  const lookPage = await readFile(new URL("try-it/index.html", repositoryRoot), "utf8");
  const sdaPage = await readFile(new URL("self-directed-attention/index.html", repositoryRoot), "utf8");
  for (const page of [lookPage, sdaPage]) {
    assert.match(page, /assets\/css\/zero-guide\.css\?v=20260829-1/);
    assert.match(page, /assets\/js\/zero-guide\.js\?v=20260829-1/);
    assert.doesNotMatch(page, /look-at-yourself\.(?:css|js)/);
  }
  assert.match(lookPage, /data-(?:api|local)-endpoint="[^"]*\/api\/look-at-yourself"/);
  assert.match(sdaPage, /data-(?:api|local)-endpoint="[^"]*\/api\/self-directed-attention"/);
});

test("SDA handoff and the safe renderer allow only the two approved internal links", async () => {
  const sdaInstructions = await readFile(new URL("zero/self-directed-attention-exercise/instructions.md", repositoryRoot), "utf8");
  const script = await readFile(new URL("assets/js/zero-guide.js", repositoryRoot), "utf8");
  assert.match(sdaInstructions, /\[Look At Yourself guide\]\(https:\/\/justonelook\.org\/try-it\/\)/);
  assert.match(script, /href: "\/try-it\/", label: "Look At Yourself guide"/);
  assert.match(script, /href: "\/", label: "Just One Look website"/);
  assert.doesNotMatch(script, /href\s*=\s*(?:token|match|text|approvedLink\.url)/);
  assert.equal((script.match(/href: "/g) || []).length, 2);
});

test("SDA browser requests contain no Step One tracking memory", async () => {
  const sdaPage = await readFile(new URL("self-directed-attention/index.html", repositoryRoot), "utf8");
  const script = await readFile(new URL("assets/js/zero-guide.js", repositoryRoot), "utf8");
  assert.doesNotMatch(sdaPage + script, /confirmsStepOne|remembers-step-one|stepOneConfirmed|localStorage|jol-sda-step-one-confirmed/);
});
