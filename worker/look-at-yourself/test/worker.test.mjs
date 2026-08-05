import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/index.js";

const allowedOrigin = "http://localhost:8000";
const baseEnv = {
  ALLOWED_ORIGINS: allowedOrigin,
  OPENAI_API_KEY: "test-openai-key",
  OPENAI_SDA_API_KEY: "test-sda-key",
  PILOT_ACCESS_CODE: "test-pilot-code",
  SESSION_RATE_LIMITER: { limit: async () => ({ success: true }) },
  PILOT_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

function request(body, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Origin": options.origin || allowedOrigin
  };
  if (!options.omitAuthorization) headers.Authorization = `Bearer ${options.accessCode || "test-pilot-code"}`;
  return new Request(`https://pilot-api.example${options.path || "/api/look-at-yourself"}`, {
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

test("keeps the private SDA guide behind its invitation code", async () => {
  const response = await worker.fetch(request(validBody(), { path: "/api/self-directed-attention", accessCode: "wrong" }), baseEnv);
  assert.equal(response.status, 401);
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

test("keeps the SDA pilot at five responses for now", async () => {
  const body = validBody();
  body.turnCount = 6;
  const response = await worker.fetch(request(body, { path: "/api/self-directed-attention" }), baseEnv);
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
    assert.match(openAIBody.instructions, /PILOT-SPECIFIC BOUNDARIES/);
    assert.match(openAIBody.instructions, /teaches Step One only/);
    assert.match(openAIBody.instructions, /Continue to the Just One Look website/);
    assert.match(openAIBody.instructions, /link to the Just One Look homepage/);
    assert.match(openAIBody.instructions, /Do not send the visitor directly to another AI guide or a specific resource page/);
    assert.match(openAIBody.instructions, /Do not turn the inward look into a numbered list/);
    assert.match(openAIBody.instructions, /Do not tell them to suppress, remove, ignore/);
    assert.match(openAIBody.instructions, /turn your attention toward/);
    assert.match(openAIBody.instructions, /not the stress—just that feeling/);
    assert.match(openAIBody.instructions, /not looking with the eyes/);
    assert.match(openAIBody.instructions, /asks what they should look at/);
    assert.match(openAIBody.instructions, /felt sense of being themselves/);
    assert.match(openAIBody.instructions, /Do not answer them with the same explanation/);
    assert.match(openAIBody.instructions, /Markdown bold sparingly/);
    assert.match(openAIBody.instructions, /not response templates/i);
    assert.match(openAIBody.instructions, /do not repeat a complete sentence or full sequence/i);
    assert.match(openAIBody.instructions, /do not automatically repeat the entire thoughts\/emotions\/body\/story contrast/i);
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
    assert.match(openAIBody.instructions, /Self-Directed Attention Exercise/);
    assert.match(openAIBody.instructions, /Step Two only/i);
    assert.match(openAIBody.instructions, /Never blend the two guides/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
