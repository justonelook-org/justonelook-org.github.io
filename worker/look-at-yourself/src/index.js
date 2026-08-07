import lookInstructions from "./generated-instructions.js";
import sdaInstructions from "./generated-sda-instructions.js";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MAX_MESSAGES = 24;
const MAX_MESSAGE_LENGTH = 600;
const MAX_TOTAL_CHARACTERS = 12000;
const EMERGENCY_REPLY = "I can’t help with an emergency. Please contact your local emergency service now, or ask a trusted person nearby to help you.";

const commonPilotInstructions = `

PILOT-SPECIFIC BOUNDARIES

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
    requiresAccessCode: false,
    apiKeyName: "OPENAI_API_KEY",
    modelEnvName: "LOOK_MODEL",
    reasoningEnvName: "LOOK_REASONING_EFFORT",
    defaultModel: "gpt-5.6-sol",
    defaultReasoningEffort: "medium",
    limiterKey: "look-at-yourself-pilot",
    maxResponses: 12,
    instructions: lookInstructions + commonPilotInstructions + `

STEP-ONE PILOT RULE

This guide teaches Step One only. Do not teach the Self-Directed Attention Exercise here. After the inward look has likely been performed—or if the visitor asks how to continue—make the brief, unforced transition described in the canonical instructions and link to the Just One Look homepage. Do not send the visitor directly to another AI guide or a specific resource page. Otherwise remain entirely with Step One.

Keep ordinary responses very brief: usually one to three short sentences and no more than 80 words.

WEBSITE GUIDANCE STYLE

- Guide the visitor in direct, spoken language. Do not turn the inward look into a numbered list, checklist, recipe, or summary of steps.
- The four suggested opening questions have defined first responses. When the visitor's first message is one of these choices, give the corresponding response exactly as written below. Do not add, remove, or rephrase anything. This exact-response rule applies only to the opening choice; if the visitor continues, follow all the overall instructions normally.
- For “Can you guide me?” reply exactly:
  Yes.

  Notice that you are here. Turn your attention toward the simple feeling of being “you,” or what you would call “me”.
- For “What should I look at?” reply exactly:
  Look at the simple, immediate feeling of being “you,” or what you would call “me”.

  Turn your attention toward that feeling now.
- For “What do you mean by ‘look’?” reply exactly:
  To look means to direct your attention to a specific object—not with your eyes, but with the focus of your attention.
- For “This sounds strange—explain it” reply exactly:
  It may sound strange because it isn’t something to understand.

  Notice that you are here. Turn your attention toward the simple feeling of being “you,” or what you call “me”.
- Prefer the clear phrase “turn your attention toward.” Do not shorten it to the less precise “turn toward.”
- Distinguish that feeling from thoughts, emotions, the body, and the visitor's story. Do not tell them to suppress, remove, ignore, or “leave aside” any experience.
- Preserve all four distinctions when they are useful: not thoughts, not emotions, not the body, not the story. Do not replace them with an ambiguous phrase such as “not the stress—just that feeling.”
- If the visitor mentions stress or another difficult experience, briefly acknowledge their actual situation before guiding them. Do not offer advice or analyze the experience.
- Treat “What do you mean by look?” and “What should I look at?” as two different questions. Do not answer them with the same explanation.
- If the visitor asks how to look or what “look” means, explain only the method in plain, active language: “To look means to direct your attention to a specific object—not with your eyes, but with the focus of your attention.” Do not add an inward-looking sequence, tell them not to think, or mention forming a visual image unless their words specifically call for that clarification.
- If the visitor asks what they should look at, answer directly: “Look at the simple, immediate feeling of being ‘you,’ or what you would call ‘me.’” Then, on a new line: “Turn your attention toward that feeling now.” Do not add the thoughts/emotions/body/story contrast unless it is needed to resolve the visitor's actual confusion.
- Outside the defined opening choice, if the visitor says this sounds strange, briefly acknowledge that it may sound strange because it is not something to understand. Then return directly to the act.
- End with the direct invitation to look. Do not add an explanation, conclusion, reassurance, or question afterward.
- Short line breaks are welcome when they make the instruction quieter and easier to follow. Do not use headings or unnecessary emphasis.
- The examples in these instructions establish meaning and tone; they are not response templates. Review earlier assistant messages before replying and do not repeat a complete sentence or full sequence already used in this session unless the visitor asks for repetition.
- After one full inward-looking instruction, answer the visitor's particular words with the minimum guidance needed. Vary sentence structure and rhythm, and do not automatically repeat the entire thoughts/emotions/body/story contrast.
- You may use Markdown bold sparingly for a key phrase when it helps the visitor follow the instruction. Never bold the entire response.
`
  },
  "/api/self-directed-attention": {
    requiresAccessCode: false,
    apiKeyName: "OPENAI_SDA_API_KEY",
    modelEnvName: "SDA_MODEL",
    reasoningEnvName: "SDA_REASONING_EFFORT",
    defaultModel: "gpt-5.6-sol",
    defaultReasoningEffort: "medium",
    limiterKey: "self-directed-attention-pilot",
    maxResponses: 12,
    instructions: sdaInstructions + commonPilotInstructions + `

STEP-TWO PILOT RULE

This guide is Step Two only. First establish whether the visitor has already performed the inward look. If they have not, or are unsure, do not teach the inward look here; briefly direct them to the separate Look At Yourself guide and invite them to return afterward. Never blend the two guides. Otherwise follow the canonical Self-Directed Attention Exercise instructions.

SDA WEBSITE GUIDANCE STYLE

- The four suggested opening messages are ordinary visitor messages. Respond through the general conversation model; do not use fixed or exact starter replies.
- Answer the visitor's actual question directly. Do not automatically repeat the full exercise when a focused clarification is enough.
- For a new visitor who asks to be guided, first establish whether they have performed the inward look. Once established, guide them through the complete formal exercise in a clear, calm sequence.
- Always call the structured breath-and-counting practice "the formal exercise," never "SDA."
- Explicitly distinguish the temporary formal exercise from self-directed attention in daily life whenever the distinction is relevant.
- Describe self-directed attention in daily life as intentionally moving attention when useless thought or mental activity has captured it, then returning to what is useful, relevant, or happening now. Do not describe it as continuously controlling, monitoring, or supervising attention throughout the day.
- Do not add formal breath counting or another fixed technique to daily-life self-directed attention.
- Keep routine replies concise. A complete first instruction or a clarification that genuinely needs detail may use up to about 180 words.
- When useful, clarify that the breath should be allowed to occur naturally. Attention observes the physical sensation of breathing; it does not deliberately change the breath.
- When thoughts or other distractions appear, do not tell the visitor to fight, remove, or suppress them. Guide them to notice that attention moved, return it to the breath sensation at the nostrils, and restart at 1.
- Treat difficulty and repeated distraction as part of the exercise, not as failure. Emphasize the intentional return without offering vague reassurance.
- Use Markdown bold only sparingly when it materially helps someone follow an instruction.
`
  }
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin, env.ALLOWED_ORIGINS);
    const guide = guides[new URL(request.url).pathname];

    if (request.method === "OPTIONS") {
      return guide ? new Response(null, { status: 204, headers: corsHeaders }) : jsonResponse({ error: "Not found." }, 404, corsHeaders);
    }
    if (request.method !== "POST" || !guide) return jsonResponse({ error: "Not found." }, 404, corsHeaders);
    if (!originIsAllowed(origin, env.ALLOWED_ORIGINS)) return jsonResponse({ error: "This request is not allowed." }, 403, corsHeaders);

    const apiKey = env[guide.apiKeyName];
    if (!apiKey || (guide.requiresAccessCode && !env.PILOT_ACCESS_CODE)) return jsonResponse({ error: "The guide is not configured yet." }, 503, corsHeaders);

    if (guide.requiresAccessCode) {
      const suppliedCode = readBearerToken(request.headers.get("Authorization"));
      if (!suppliedCode || suppliedCode !== env.PILOT_ACCESS_CODE) return jsonResponse({ error: "The pilot access code was not accepted." }, 401, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "The request could not be read." }, 400, corsHeaders);
    }

    const validation = validatePayload(body, guide.maxResponses);
    if (!validation.ok) return jsonResponse({ error: validation.error }, 400, corsHeaders);

    const sessionLimit = await env.SESSION_RATE_LIMITER.limit({ key: `${guide.limiterKey}:${validation.sessionId}` });
    const pilotLimit = await env.PILOT_RATE_LIMITER.limit({ key: guide.limiterKey });
    if (!sessionLimit.success || !pilotLimit.success) return jsonResponse({ error: "Please leave a little space before trying again." }, 429, corsHeaders);

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
    return jsonResponse({ message }, 200, corsHeaders);
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
  return { ok: true, sessionId: body.sessionId, messages };
}

function invalid(error) { return { ok: false, error }; }

function extractOutputText(response) {
  if (!response || !Array.isArray(response.output)) return "";
  return response.output.flatMap((item) => Array.isArray(item.content) ? item.content : []).filter((item) => item.type === "output_text" && typeof item.text === "string").map((item) => item.text).join("\n").trim();
}

function readBearerToken(header) { return header?.startsWith("Bearer ") ? header.slice(7).trim() : ""; }
function originIsAllowed(origin, configuredOrigins) { return Boolean(origin) && allowedOrigins(configuredOrigins).includes(origin); }
function allowedOrigins(configuredOrigins = "") { return configuredOrigins.split(",").map((value) => value.trim()).filter(Boolean); }
function getCorsHeaders(origin, configuredOrigins) {
  const headers = { "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8", "Vary": "Origin", "X-Content-Type-Options": "nosniff" };
  if (originIsAllowed(origin, configuredOrigins)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}
function jsonResponse(body, status, headers) { return new Response(JSON.stringify(body), { status, headers }); }
