import lookInstructions from "./generated-instructions.js";
import sdaInstructions from "./generated-sda-instructions.js";
import { archiveExpiredSessions, handleAnalyticsRequest } from "./analytics.js";
import { hashSessionId, measureConversation, recordMeasurementError, recordSessionStart } from "./outcome-measurement.js";
import { handleTrafficDashboard, handleTrafficEvent } from "./traffic-analytics.js";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MAX_MESSAGES = 24;
const MAX_MESSAGE_LENGTH = 600;
const MAX_TOTAL_CHARACTERS = 12000;
const EMERGENCY_REPLY = "I can’t help with an emergency. Please contact your local emergency service now, or ask a trusted person nearby to help you.";

const sharedRuntimeInstructions = `

SHARED RUNTIME INSTRUCTIONS

- Keep ordinary responses concise and focused.
- Do not become a general, therapeutic, spiritual, philosophical, medical, or social conversation partner.
- Never try to prolong the interaction. After an instruction, allow space and wait for the user.
- Do not say that you are human. If directly asked, say briefly that you are an AI guide and return to the instruction.

NARROW EMERGENCY EXCEPTION

Only when the user clearly describes an immediate intention to harm themselves or someone else, an immediate threat to someone's safety, or an unmistakable urgent medical emergency, reply with exactly this sentence and nothing else:

${EMERGENCY_REPLY}

Do not trigger this exception for ordinary references to fear, sadness, illness, death, philosophy, difficult experiences, past events, figures of speech, jokes, or hypothetical questions. Do not diagnose, assess risk, counsel, or continue an emergency conversation.
`;

const guides = {
  "/api/look-at-yourself": {
    measuresOutcome: true,
    apiKeyName: "OPENAI_API_KEY",
    modelEnvName: "LOOK_MODEL",
    reasoningEnvName: "LOOK_REASONING_EFFORT",
    defaultModel: "gpt-5.6-sol",
    defaultReasoningEffort: "medium",
    limiterKey: "look-at-yourself-guide",
    maxResponses: 12,
    instructions: lookInstructions + sharedRuntimeInstructions
  },
  "/api/self-directed-attention": {
    measuresOutcome: false,
    apiKeyName: "OPENAI_SDA_API_KEY",
    modelEnvName: "SDA_MODEL",
    reasoningEnvName: "SDA_REASONING_EFFORT",
    defaultModel: "gpt-5.6-sol",
    defaultReasoningEffort: "medium",
    limiterKey: "self-directed-attention-guide",
    maxResponses: 12,
    instructions: sdaInstructions + sharedRuntimeInstructions
  }
};

export default {
  async fetch(request, env, ctx = { waitUntil() {} }) {
    const pathname = new URL(request.url).pathname;
    if (pathname.startsWith("/private/website-traffic")) {
      if (request.method !== "GET") return jsonResponse({ error: "Method not allowed." }, 405, { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" });
      return handleTrafficDashboard(request, env);
    }
    if (pathname.startsWith("/private/looking-zero")) {
      if (request.method !== "GET") return jsonResponse({ error: "Method not allowed." }, 405, { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" });
      return handleAnalyticsRequest(request, env);
    }
    if (pathname === "/api/traffic") return handleTrafficEvent(request, env);
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin, env.ALLOWED_ORIGINS);
    const guide = guides[pathname];

    if (request.method === "OPTIONS") {
      return guide ? new Response(null, { status: 204, headers: corsHeaders }) : jsonResponse({ error: "Not found." }, 404, corsHeaders);
    }
    if (request.method !== "POST" || !guide) return jsonResponse({ error: "Not found." }, 404, corsHeaders);
    if (!originIsAllowed(origin, env.ALLOWED_ORIGINS)) return jsonResponse({ error: "This request is not allowed." }, 403, corsHeaders);

    const apiKey = env[guide.apiKeyName];
    if (!apiKey) return jsonResponse({ error: "The guide is not configured yet." }, 503, corsHeaders);

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "The request could not be read." }, 400, corsHeaders);
    }

    const validation = validatePayload(body, guide.maxResponses);
    if (!validation.ok) return jsonResponse({ error: validation.error }, 400, corsHeaders);

    const sessionLimit = await env.SESSION_RATE_LIMITER.limit({ key: `${guide.limiterKey}:${validation.sessionId}` });
    // PILOT_RATE_LIMITER is the deployed binding name retained for compatibility.
    const guideLimit = await env.PILOT_RATE_LIMITER.limit({ key: guide.limiterKey });
    if (!sessionLimit.success || !guideLimit.success) return jsonResponse({ error: "Please leave a little space before trying again." }, 429, corsHeaders);

    let measurementSessionHash = "";
    const outcomeMeasurementEnabled = outcomeMeasurementAllowed(
      env.OUTCOME_MEASUREMENT_ENABLED, origin, env.OUTCOME_TEST_ORIGIN
    );
    const diagnosticHeaderEnabled = env.OUTCOME_MEASUREMENT_ENABLED === "test" && origin === env.OUTCOME_TEST_ORIGIN;
    let measurementStatus = outcomeMeasurementEnabled ? "eligible" : "disabled";
    let measurementError = "";
    if (guide.measuresOutcome && outcomeMeasurementEnabled && env.OUTCOME_DB && env.OUTCOME_SESSION_SECRET) {
      try {
        measurementSessionHash = await hashSessionId(validation.sessionId, env.OUTCOME_SESSION_SECRET);
        await recordSessionStart(env.OUTCOME_DB, measurementSessionHash, new Date().toISOString(), validation.turnCount);
        if (diagnosticHeaderEnabled) {
          const recorded = await env.OUTCOME_DB.prepare(
            "SELECT COUNT(*) AS count FROM looking_sessions WHERE session_hash = ?"
          ).bind(measurementSessionHash).first();
          measurementStatus = Number(recorded?.count) === 1 ? "session-recorded" : "session-missing";
        } else {
          measurementStatus = "session-recorded";
        }
      } catch (error) {
        measurementSessionHash = "";
        measurementStatus = "session-error";
        if (diagnosticHeaderEnabled) measurementError = sanitizeDiagnostic(error?.message);
        /* Outcome measurement must never interfere with Zero. */
      }
    }

    let openAIResponse;
    try {
      openAIResponse = await fetch(OPENAI_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env[guide.modelEnvName] || guide.defaultModel,
          instructions: guide.instructions,
          input: validation.messages,
          store: false,
          max_output_tokens: 800,
          reasoning: { effort: env[guide.reasoningEnvName] || guide.defaultReasoningEffort },
          text: { verbosity: "low" }
        }),
        signal: AbortSignal.timeout(20000)
      });
    } catch {
      return jsonResponse({ error: "The guide is temporarily unavailable. Please try again shortly." }, 503, corsHeaders);
    }

    if (!openAIResponse.ok) return jsonResponse({ error: "The guide is temporarily unavailable. Please try again shortly." }, 502, corsHeaders);
    const result = await openAIResponse.json();
    const message = extractOutputText(result);
    if (!message || message.length > 1200) return jsonResponse({ error: "The guide could not give a short response. Please try again." }, 502, corsHeaders);
    if (guide.measuresOutcome && outcomeMeasurementEnabled && measurementSessionHash && env.OPENAI_OUTCOME_API_KEY) {
      const measuredMessages = [...validation.messages, { role: "assistant", content: message }];
      const measurement = measureConversation({
        database: env.OUTCOME_DB,
        apiKey: env.OPENAI_OUTCOME_API_KEY,
        model: env.OUTCOME_MODEL || "gpt-5.6-luna",
        sessionHash: measurementSessionHash,
        messages: measuredMessages,
        turnCount: validation.turnCount
      });
      if (diagnosticHeaderEnabled) {
        try {
          const result = await measurement;
          measurementStatus = `${result.skipped ? "skipped" : "classified"}-${measurementStatus}`;
        } catch (error) {
          const code = await recordMeasurementError(env.OUTCOME_DB, measurementSessionHash, error).catch(() => "classifier_status_write_error");
          measurementStatus = `${code}-${measurementStatus}`;
        }
      } else {
        ctx.waitUntil(measurement.catch((error) => recordMeasurementError(env.OUTCOME_DB, measurementSessionHash, error).catch(() => {})));
        measurementStatus = `scheduled-${measurementStatus}`;
      }
    }
    if (diagnosticHeaderEnabled) corsHeaders["X-Outcome-Measurement"] = measurementStatus;
    if (diagnosticHeaderEnabled && measurementError) corsHeaders["X-Outcome-Error"] = measurementError;
    return jsonResponse({ message }, 200, corsHeaders);
  },

  async scheduled(_event, env, ctx = { waitUntil() {} }) {
    if (env.OUTCOME_DB) ctx.waitUntil(archiveExpiredSessions(env.OUTCOME_DB).catch(() => {}));
  }
};

function validatePayload(body, maxResponses) {
  if (!body || typeof body !== "object") return invalid("The request is incomplete.");
  if (!Number.isInteger(body.turnCount) || body.turnCount < 1 || body.turnCount > maxResponses) return invalid("This session has ended. Please return later if needed.");
  if (typeof body.sessionId !== "string" || !/^[a-f0-9-]{20,64}$/i.test(body.sessionId)) return invalid("The session is not valid. Please restart the guide.");
  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) return invalid("The conversation is too long. Please restart the guide.");

  let totalCharacters = 0;
  const messages = [];
  for (const message of body.messages) {
    if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string") return invalid("The conversation could not be read.");
    const content = message.content.trim();
    const roleLimit = message.role === "user" ? MAX_MESSAGE_LENGTH : 1200;
    if (!content || content.length > roleLimit) return invalid(message.role === "user" ? `Each message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` : "The previous guide response is too long. Please restart the guide.");
    totalCharacters += content.length;
    messages.push({ role: message.role, content });
  }

  if (messages[messages.length - 1].role !== "user") return invalid("The last message must be from the visitor.");
  if (totalCharacters > MAX_TOTAL_CHARACTERS) return invalid("The conversation is too long. Please restart the guide.");
  return { ok: true, sessionId: body.sessionId, turnCount: body.turnCount, messages };
}

function invalid(error) { return { ok: false, error }; }

function extractOutputText(response) {
  if (!response || !Array.isArray(response.output)) return "";
  return response.output.flatMap((item) => Array.isArray(item.content) ? item.content : []).filter((item) => item.type === "output_text" && typeof item.text === "string").map((item) => item.text).join("\n").trim();
}

function originIsAllowed(origin, configuredOrigins) { return Boolean(origin) && allowedOrigins(configuredOrigins).includes(origin); }
function allowedOrigins(configuredOrigins = "") { return configuredOrigins.split(",").map((value) => value.trim()).filter(Boolean); }
function getCorsHeaders(origin, configuredOrigins) {
  const headers = { "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8", "Vary": "Origin", "X-Content-Type-Options": "nosniff" };
  if (originIsAllowed(origin, configuredOrigins)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}
function jsonResponse(body, status, headers) { return new Response(JSON.stringify(body), { status, headers }); }
export function outcomeMeasurementAllowed(mode, origin, testOrigin) {
  if (mode === "true") return !testOrigin || origin !== testOrigin;
  return mode === "test" && Boolean(testOrigin) && origin === testOrigin;
}
function sanitizeDiagnostic(value = "") {
  return String(value).replace(/[^a-z0-9 _.:(),-]/gi, "?").slice(0, 180) || "unknown";
}
