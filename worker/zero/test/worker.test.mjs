import assert from "node:assert/strict";
import test from "node:test";
import worker, { outcomeMeasurementAllowed } from "../src/index.js";

const allowedOrigin = "http://localhost:8000";
const baseEnv = {
  ALLOWED_ORIGINS: allowedOrigin,
  OPENAI_API_KEY: "test-openai-key",
  OPENAI_SDA_API_KEY: "test-sda-key",
  OUTCOME_MEASUREMENT_ENABLED: "false",
  SESSION_RATE_LIMITER: { limit: async () => ({ success: true }) },
  PILOT_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

test("keeps outcome measurement disabled unless explicitly enabled", async () => {
  const originalFetch = globalThis.fetch;
  let databaseTouched = false;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const env = {
    ...baseEnv,
    OUTCOME_DB: { prepare() { databaseTouched = true; throw new Error("Measurement should be disabled."); } },
    OUTCOME_SESSION_SECRET: "test-session-secret",
    OPENAI_OUTCOME_API_KEY: "test-outcome-key"
  };
  try {
    const response = await worker.fetch(request(validBody()), env);
    assert.equal(response.status, 200);
    assert.equal(databaseTouched, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("limits test measurement to the exact configured test origin", () => {
  assert.equal(outcomeMeasurementAllowed("false", "https://website-test-zero.pages.dev", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("test", "https://justonelook.org", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("test", "https://website-test-zero.pages.dev", "https://website-test-zero.pages.dev"), true);
  assert.equal(outcomeMeasurementAllowed("test", "https://website-test-zero.pages.dev.evil.example", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("true", "https://justonelook.org", "https://website-test-zero.pages.dev"), true);
  assert.equal(outcomeMeasurementAllowed("true", "https://website-test-zero.pages.dev", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("true", "https://website-test-zero.pages.dev.evil.example", "https://website-test-zero.pages.dev"), true);
});

test("excludes the team test origin from production measurement", async () => {
  const originalFetch = globalThis.fetch;
  let databaseTouched = false;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const teamOrigin = "https://website-test-zero.pages.dev";
  const env = {
    ...baseEnv,
    ALLOWED_ORIGINS: `${allowedOrigin},${teamOrigin}`,
    OUTCOME_MEASUREMENT_ENABLED: "true",
    OUTCOME_TEST_ORIGIN: teamOrigin,
    OUTCOME_DB: { prepare() { databaseTouched = true; throw new Error("Team testing must not be measured."); } },
    OUTCOME_SESSION_SECRET: "test-session-secret",
    OPENAI_OUTCOME_API_KEY: "test-outcome-key"
  };
  try {
    const response = await worker.fetch(request(validBody(), { origin: teamOrigin }), env);
    assert.equal(response.status, 200);
    assert.equal(databaseTouched, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("does not expose the test-only measurement diagnostic to production origins", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  try {
    const response = await worker.fetch(request(validBody(), { origin: allowedOrigin }), {
      ...baseEnv,
      OUTCOME_MEASUREMENT_ENABLED: "test",
      OUTCOME_TEST_ORIGIN: "https://website-test-zero.pages.dev"
    });
    assert.equal(response.headers.get("X-Outcome-Measurement"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function request(body, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Origin": options.origin || allowedOrigin
  };
  return new Request(`https://zero-api.example${options.path || "/api/look-at-yourself"}`, {
    method: options.method || "POST",
    headers,
    body: options.method === "OPTIONS" ? undefined : JSON.stringify(body)
  });
}

function validBody() {
  return {
    sessionId: "12345678-1234-1234-1234-123456789abc",
    turnCount: 1,
    messages: [{ role: "user", content: "Hello" }]
  };
}

test("answers an allowed preflight without contacting OpenAI", async () => {
  const response = await worker.fetch(request(undefined, { method: "OPTIONS" }), baseEnv);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), allowedOrigin);
});

test("rejects an unapproved website origin", async () => {
  const response = await worker.fetch(request(validBody(), { origin: "https://example.com" }), baseEnv);
  assert.equal(response.status, 403);
});

test("allows the public SDA guide without exposing an invitation code", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Have you already performed the inward look?" }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(validBody(), { path: "/api/self-directed-attention", omitAuthorization: true }), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("allows the public Looking guide without exposing an invitation code", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Look directly at that simple feeling of being you." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(validBody(), { omitAuthorization: true }), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects excessive message length before contacting OpenAI", async () => {
  const body = validBody();
  body.messages[0].content = "x".repeat(601);
  const response = await worker.fetch(request(body), baseEnv);
  assert.equal(response.status, 400);
});

test("gives the Looking guide room for twelve responses", async () => {
  const body = validBody();
  body.turnCount = 12;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Look directly at that simple feeling of being you." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(body), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ends the Looking guide after twelve responses", async () => {
  const body = validBody();
  body.turnCount = 13;
  const response = await worker.fetch(request(body), baseEnv);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /session has ended/i);
});

test("gives the SDA guide room for twelve responses", async () => {
  const body = validBody();
  body.turnCount = 12;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Return attention to the breath and restart at 1." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(body, { path: "/api/self-directed-attention", omitAuthorization: true }), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ends the SDA guide after twelve responses", async () => {
  const body = validBody();
  body.turnCount = 13;
  const response = await worker.fetch(request(body, { path: "/api/self-directed-attention", omitAuthorization: true }), baseEnv);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /session has ended/i);
});

test("returns a calm rate-limit response", async () => {
  const env = {
    ...baseEnv,
    SESSION_RATE_LIMITER: { limit: async () => ({ success: false }) }
  };
  const response = await worker.fetch(request(validBody()), env);
  assert.equal(response.status, 429);
  assert.match((await response.json()).error, /leave a little space/i);
});

test("sends temporary context with storage disabled", async () => {
  const originalFetch = globalThis.fetch;
  let openAIBody;
  globalThis.fetch = async (_url, options) => {
    openAIBody = JSON.parse(options.body);
    return new Response(JSON.stringify({
      output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const response = await worker.fetch(request(validBody()), baseEnv);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Notice that you are here." });
    assert.equal(openAIBody.store, false);
    assert.equal(openAIBody.model, "gpt-5.6-sol");
    assert.equal(openAIBody.reasoning.effort, "medium");
    assert.equal(openAIBody.input.length, 1);
    assert.match(openAIBody.instructions, /SHARED RUNTIME INSTRUCTIONS/);
    assert.match(openAIBody.instructions, /Step One of the Just One Look Method/);
    assert.match(openAIBody.instructions, /bring the Looking session to a natural close/i);
    assert.match(openAIBody.instructions, /surrounding message should fit the conversation rather than repeat fixed completion wording/i);
    assert.match(openAIBody.instructions, /surrounding message should fit the conversation rather than repeat fixed completion wording/i);
    assert.doesNotMatch(openAIBody.instructions, /provide this exact response/i);
    assert.match(openAIBody.instructions, /\[Just One Look website\]\(https:\/\/justonelook\.org\/\)/);
    assert.match(openAIBody.instructions, /homepage—not another AI guide or a specific resource page—is the default next step/i);
    assert.match(openAIBody.instructions, /Do not send the user directly to the Self-Directed Attention AI guide/);
    assert.match(openAIBody.instructions, /rather than a numbered list, checklist, recipe, or summary of steps/);
    assert.match(openAIBody.instructions, /do not need to be suppressed, removed, ignored, or fought/i);
    assert.match(openAIBody.instructions, /turn your attention toward/);
    assert.match(openAIBody.instructions, /ordinary user messages/i);
    assert.match(openAIBody.instructions, /do not use fixed, exact, or templated starter replies/i);
    assert.match(openAIBody.instructions, /exact suggested opening message and the first user message/i);
    assert.match(openAIBody.instructions, /What should I look at.*begin with the object.*ordinary feeling of being here, present as themselves/i);
    assert.match(openAIBody.instructions, /What do you mean by ‘look’.*begin with the practical action.*directing attention toward something one chooses/i);
    assert.match(openAIBody.instructions, /first-response emphasis rules apply only to those exact suggested opening messages/i);
    assert.match(openAIBody.instructions, /freely written conversation.*general instructions fluidly/i);
    assert.match(openAIBody.instructions, /Answer the user's actual question first/i);
    assert.match(openAIBody.instructions, /nothing special has to happen/i);
    assert.match(openAIBody.instructions, /does not need certainty that they succeeded/i);
    assert.match(openAIBody.instructions, /Did you try looking at yourself just now\?/);
    assert.match(openAIBody.instructions, /By looking, I mean turning your attention toward the simple feeling of being you—not thinking about yourself\./);
    assert.match(openAIBody.instructions, /not an automatic questionnaire or confirmation flow/i);
    assert.match(openAIBody.instructions, /Do not routinely ask the user to confirm whether the inward look worked/i);
    assert.match(openAIBody.instructions, /up to about 120 words/i);
    assert.doesNotMatch(openAIBody.instructions, /reply exactly/i);
    assert.doesNotMatch(openAIBody.instructions, /defined first responses/i);
    assert.doesNotMatch(openAIBody.instructions, /exact-response rule/i);
    assert.match(openAIBody.instructions, /Markdown bold sparingly/);
    assert.match(openAIBody.instructions, /not as scripts to copy/i);
    assert.match(openAIBody.instructions, /do not repeat a complete sentence or full sequence/i);
    assert.match(openAIBody.instructions, /full thoughts\/emotions\/body\/story distinction unless repetition is genuinely useful/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("keeps the SDA guide on its separate route, key, and instructions", async () => {
  const originalFetch = globalThis.fetch;
  let authorization;
  let openAIBody;
  globalThis.fetch = async (_url, options) => {
    authorization = options.headers.Authorization;
    openAIBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: "Have you already performed the inward look?" }] }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const response = await worker.fetch(request(validBody(), { path: "/api/self-directed-attention" }), baseEnv);
    assert.equal(response.status, 200);
    assert.equal(authorization, "Bearer test-sda-key");
    assert.equal(openAIBody.model, "gpt-5.6-sol");
    assert.equal(openAIBody.reasoning.effort, "medium");
    assert.match(openAIBody.instructions, /Self-Directed Attention Exercise/);
    assert.match(openAIBody.instructions, /Step Two of the Just One Look Method/i);
    assert.match(openAIBody.instructions, /Do not mix the inward look with the Self-Directed Attention Exercise/i);
    assert.match(openAIBody.instructions, /ordinary user messages/i);
    assert.match(openAIBody.instructions, /without fixed or exact starter replies/i);
    assert.match(openAIBody.instructions, /breath should be allowed to occur naturally/i);
    assert.match(openAIBody.instructions, /repeated distraction as part of the exercise/i);
    assert.match(openAIBody.instructions, /Do not infer that the conversation is finished merely because you delivered an instruction or clarification/i);
    assert.match(openAIBody.instructions, /brief thank-you, acknowledgment, or statement of understanding does not by itself mean the user wants to finish/i);
    assert.match(openAIBody.instructions, /bring the conversation to a natural close when the user clearly indicates that they are finished/i);
    assert.match(openAIBody.instructions, /Always call it "the formal exercise," not "SDA/i);
    assert.match(openAIBody.instructions, /does not mean continuously controlling, monitoring, or supervising attention/i);
    assert.match(openAIBody.instructions, /Do not turn self-directed attention in daily life into another formal technique/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

