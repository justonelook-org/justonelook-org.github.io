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

const instructions = await readFile(instructionsUrl, "utf8");
const productionLooking = await readFile(productionLookingUrl, "utf8");
const productionSda = await readFile(productionSdaUrl, "utf8");
const localServer = await readFile(localServerUrl, "utf8");
const liveProbe = await readFile(liveProbeUrl, "utf8");
const evaluator = await readFile(evaluatorUrl, "utf8");
const localPage = await readFile(localPageUrl, "utf8");

test("keeps the unified instructor explicitly non-production", () => {
  assert.match(instructions, /Non-production team-test prototype/);
  assert.match(instructions, /one instruction at a time/i);
  assert.match(instructions, /Do not give both complete practices in one response/i);
});

test("preserves the inward look as the pivotal first act", () => {
  assert.match(instructions, /feeling of being [“\"]you[”\"]—what the visitor would call [“\"]me[”\"]/);
  assert.match(instructions, /not merely another attention exercise/i);
  assert.match(instructions, /does not automatically trigger the next part of the method/i);
  assert.match(instructions, /Nothing special has to happen/);
  assert.match(instructions, /understand the concept.*ask simply whether they tried looking/i);
  assert.match(instructions, /do not recite the whole catalog of contrasts/i);
  assert.match(instructions, /responds only with a brief acknowledgment.*Do not ask whether they tried/is);
});

test("routes an SDA request through one non-evaluative prerequisite", () => {
  assert.match(instructions, /prior experience is unknown, first ask one brief, natural question/i);
  assert.match(instructions, /accept the report without testing it/i);
  assert.match(instructions, /Do not ask visitors to prove that they looked/);
  assert.match(instructions, /Do not send them to another guide/i);
  assert.match(instructions, /asks only [“"]what next\?[”"].*best thing they can do next is start working with their attention/i);
  assert.match(instructions, /simple attention exercise can help them learn to direct it deliberately/i);
  assert.match(instructions, /mentioning an [“"]attention exercise[”"].*effects question/is);
  assert.match(instructions, /do not answer an effects question merely by asking whether they have looked/i);
  assert.match(instructions, /first introduction.*simple attention exercise for learning to direct attention deliberately/is);
  assert.match(instructions, /Do not introduce it merely as [“"]the formal exercise/is);
  assert.match(instructions, /working with attention has two connected forms/i);
  assert.match(instructions, /formal exercise is training for that everyday use/i);
  assert.match(instructions, /do not ask them to choose between formal practice and daily-life use/i);
  assert.match(instructions, /offer to explain or guide the exercise when they are ready/i);
});

test("retains the complete formal exercise and its daily-life distinction", () => {
  for (const requiredMeaning of [
    /breath moving in and out through the nostrils/i,
    /Count each outbreath silently from 1 through 10/i,
    /restart the count at 1/i,
    /about 10 minutes a day/i,
    /not continuous control, monitoring, or supervision/i,
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
  assert.match(localPage, /Nothing here is measured or saved/);
  assert.match(localPage, /Anonymous guidance milestones are measured; conversation text is not stored/);
  assert.match(localPage, /website-test-zero\.pages\.dev/);
  assert.match(localPage, /\/api\/unified-zero/);
  assert.match(localPage, /crypto\.randomUUID\(\)/);
  assert.match(localPage, /node\.textContent=content/);
  assert.doesNotMatch(localPage, /localStorage|sessionStorage|document\.cookie|indexedDB/);
  assert.doesNotMatch(localPage, /analytics|\/api\/traffic/);
  for (const starter of ["Try looking at yourself", "Try the attention exercise"]) {
    assert.match(localPage, new RegExp(`data-starter="${starter.replace(/[?]/g, "\\?")}"`));
  }
  for (const removedStarter of ["Guide me", "How do I look with attention?", "How do I look at myself?", "Learn the attention exercise", "What do I look at?", "I’ve looked. Then what?"]) {
    assert.doesNotMatch(localPage, new RegExp(`data-starter="${removedStarter.replace(/[?]/g, "\\?")}"`));
  }
  assert.doesNotMatch(localPage, />Teach me the formal exercise</);
});
