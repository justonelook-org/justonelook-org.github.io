import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const instructionsUrl = new URL("../../../zero/unified/instructions.md", import.meta.url);
const productionLookingUrl = new URL("../../../zero/look-at-yourself/instructions.md", import.meta.url);
const productionSdaUrl = new URL("../../../zero/self-directed-attention-exercise/instructions.md", import.meta.url);
const localServerUrl = new URL("../scripts/local-server.mjs", import.meta.url);
const liveProbeUrl = new URL("../scripts/test-live.mjs", import.meta.url);
const evaluatorUrl = new URL("../scripts/evaluate-unified.mjs", import.meta.url);
const localPageUrl = new URL("../scripts/local-unified-page.mjs", import.meta.url);
const sharedGuideScriptUrl = new URL("../../../assets/js/zero-guide.js", import.meta.url);

const instructions = await readFile(instructionsUrl, "utf8");
const productionLooking = await readFile(productionLookingUrl, "utf8");
const productionSda = await readFile(productionSdaUrl, "utf8");
const localServer = await readFile(localServerUrl, "utf8");
const liveProbe = await readFile(liveProbeUrl, "utf8");
const evaluator = await readFile(evaluatorUrl, "utf8");
const localPage = await readFile(localPageUrl, "utf8");
const sharedGuideScript = await readFile(sharedGuideScriptUrl, "utf8");

test("keeps the unified instructor explicitly non-production", () => {
  assert.match(instructions, /Non-production team-test prototype/);
  assert.match(instructions, /one meaningful instruction at a time/i);
  assert.match(instructions, /Do not deliver the complete inward look and the complete formal exercise in one response/i);
  assert.match(instructions, /Do not sound like a routing system/i);
});

test("preserves the inward look as the pivotal first act", () => {
  assert.ok(instructions.includes("feeling of being “you”—what the visitor would call “me.”"));
  assert.match(instructions, /This inward look has priority/i);
  assert.match(instructions, /does not replace the inward look or reduce it to an ordinary attention exercise/i);
  assert.match(instructions, /Do not automatically advance merely because an inward-looking invitation was delivered/i);
  assert.match(instructions, /Nothing special has to happen/);
  assert.match(instructions, /Conceptual understanding does not show that the visitor tried/i);
  assert.match(instructions, /Do not recite a catalog of exclusions/i);
  assert.match(instructions, /brief [“"]okay[”"].*does not require a confirmation question/is);
  assert.match(instructions, /Use one clear formulation at a time/i);
  assert.match(instructions, /the one you call yourself.*lighter conversational reminder/i);
  assert.match(instructions, /Do not combine both formulations in one sentence/i);
  assert.match(instructions, /do not shorten the object to.*the feeling of me/is);
  assert.match(instructions, /being present here as yourself.*immediate feeling that you exist as this person/is);
  assert.match(instructions, /ordinary ability they already have/i);
  assert.match(instructions, /For the first reply.*begin with a brief friendly greeting.*something interesting about attention/is);
  assert.match(instructions, /warmth, lightness, and curiosity/i);
  assert.match(instructions, /begin with one short, welcoming sentence that conveys genuine curiosity/i);
  assert.match(instructions, /Do not sound solemn, promotional, mystical, guru-like/i);
});

test("routes an SDA request through one non-evaluative prerequisite", () => {
  assert.match(instructions, /have not said whether they tried the inward look, ask one brief, natural question/i);
  assert.match(instructions, /accept the report.*Do not test them/is);
  assert.match(instructions, /Do not test them, ask for proof, or decide whether it worked/i);
  assert.match(instructions, /Do not send them elsewhere/i);
  assert.match(instructions, /same ability to direct attention that the visitor just used when looking at themselves/i);
  assert.match(instructions, /working with attention has two connected forms/i);
  assert.match(instructions, /formal exercise is training for everyday use/i);
  assert.match(instructions, /not confront them with another choice/i);
  assert.match(instructions, /offer to guide it.*complete instructions when they accept/is);
  assert.match(instructions, /confirmation that they tried the inward look.*is not also acceptance/is);
  assert.match(instructions, /Do not respond to an effects question only by asking whether they have looked/i);
  assert.match(instructions, /Do not add formal-exercise or daily-life guidance.*unless the visitor also asks how to continue/is);
  assert.match(instructions, /Treat the starter [“"]I have looked\. Then what\?[”"] as an exploratory entrance/i);
  assert.ok(instructions.includes("Did you try looking directly at the feeling of being you—what you would call ‘me’?"));
  assert.match(instructions, /Keep track of what the visitor was asking before you asked a clarifying question/i);
  assert.match(instructions, /after [“"]I have looked\. Then what\?[”"].*a yes.*best next step is working with attention/is);
  assert.match(instructions, /do not call it a teaching/i);
});

test("retains the complete formal exercise and its daily-life distinction", () => {
  for (const requiredMeaning of [
    /breath moving in and out through the nostrils/i,
    /Count each outbreath silently from 1 through 10/i,
    /restart the count at 1/i,
    /about 10 minutes a day/i,
    /not continuous control, monitoring, vigilance, or supervision/i,
  ]) {
    assert.match(instructions, requiredMeaning);
  }
});

test("leaves the two production instruction sources unchanged and distinct", () => {
  assert.match(productionLooking, /Do not teach or guide the Self-Directed Attention Exercise yourself/);
  assert.match(productionSda, /do not explain or guide the inward look yourself/);
  assert.doesNotMatch(productionLooking, /Status:\*\* Local prototype draft/);
  assert.doesNotMatch(productionSda, /Status:\*\* Local prototype draft/);
});

test("exposes the unified prototype only through local evaluation tools", () => {
  assert.match(localServer, /UNIFIED_ZERO_ENABLED: "true"/);
  assert.match(localServer, /\/api\/unified-zero/);
  assert.match(liveProbe, /guideArgument === "unified"/);
  assert.match(liveProbe, /UNIFIED_REASONING_EFFORT/);
});

test("provides a credential-safe full behavioral evaluation harness", () => {
  assert.match(evaluator, /evals\/unified-zero\.json/);
  assert.match(evaluator, /process\.env\.OPENAI_UNIFIED_API_KEY/);
  assert.match(evaluator, /OUTCOME_MEASUREMENT_ENABLED: "false"/);
  assert.match(evaluator, /UNIFIED_ZERO_ENABLED: "true"/);
  assert.doesNotMatch(evaluator, /OPENAI_[A-Z_]+\s*[:=]\s*["'][A-Za-z0-9_-]{20,}/);
});

test("keeps the human prototype private, ephemeral, and explicit about test measurement", () => {
  assert.match(localServer, /\/__local\/unified-zero/);
  assert.match(localServer, /X-Robots-Tag.*noindex, nofollow, noarchive/);
  assert.match(localPage, /nothing here is measured or saved/i);
  assert.match(localPage, /Anonymous guidance milestones are measured; conversation text is not stored/);
  assert.match(localPage, /\/api\/unified-zero/);
  assert.match(sharedGuideScript, /crypto\.randomUUID\(\)/);
  assert.match(sharedGuideScript, /createTextNode/);
  assert.doesNotMatch(localPage + sharedGuideScript, /localStorage|sessionStorage|document\.cookie|indexedDB/);
  assert.doesNotMatch(localPage, /analytics|\/api\/traffic/);
  assert.match(localPage, /assets\/css\/zero-guide\.css/);
  assert.match(localPage, /assets\/js\/zero-guide\.js/);
  assert.match(localPage, /assets\/brand\/jol-logo\.jpg/);
  assert.match(localPage, /data-api-endpoint="https:\/\/look-at-yourself-api\.look-at-yourself-worker\.workers\.dev\/api\/unified-zero"/);
  assert.match(localPage, /data-local-endpoint="\/api\/unified-zero"/);
  assert.doesNotMatch(localPage, /anonymous-traffic\.js/);
  for (const starter of ["How do I look at myself?", "I have looked. Then what?"]) {
    assert.match(localPage, new RegExp(`data-starter="${starter.replace(/[?]/g, "\\?")}"`));
  }
  for (const removedStarter of ["Guide me", "How do I look with attention?", "Learn the attention exercise", "Try looking at yourself", "Try the attention exercise", "What do I look at?", "I’ve looked. Then what?"]) {
    assert.doesNotMatch(localPage, new RegExp(`data-starter="${removedStarter.replace(/[?]/g, "\\?")}"`));
  }
  assert.doesNotMatch(localPage, />Teach me the formal exercise</);
});
