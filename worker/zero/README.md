# Zero service

This small Cloudflare Worker connects the Look At Yourself and Self-Directed Attention Exercise guides to OpenAI. It contains no conversation database and does not intentionally log message content.

For day-to-day access, interpretation, privacy, and maintenance of the unified private traffic and outcome dashboard, see [DASHBOARD-GUIDE.md](DASHBOARD-GUIDE.md).

For the short internal note telling the JOL team where to test without affecting production measurements, see [TEAM-TESTING.md](TEAM-TESTING.md).

For the privacy-first website traffic section, event definitions, and maintenance boundaries, see [TRAFFIC-DASHBOARD-GUIDE.md](TRAFFIC-DASHBOARD-GUIDE.md).

The service code includes separate anonymous measurement layers for Looking Zero, Self-Directed Attention Zero, and the feature-gated unified prototype. The deployed configuration enables measurement for allowed production origins after the corresponding database migrations are applied. `OUTCOME_MEASUREMENT_ENABLED` supports three explicit modes: `"false"` disables collection, `"test"` permits only the exact `OUTCOME_TEST_ORIGIN`, and `"true"` permits allowed production origins. The unified endpoint itself remains unavailable unless `UNIFIED_ZERO_ENABLED` is explicitly set to `"true"`.

## Before the Zero service can run

The site owner needs a Cloudflare account and a separate OpenAI API project with a low monthly budget alert.

From this folder, the person setting up the service must:

1. Install the listed development dependency with `pnpm install`.
2. Sign in to Cloudflare with `pnpm exec wrangler login`.
3. Add the Looking guide's OpenAI project key with `pnpm exec wrangler secret put OPENAI_API_KEY`.
4. Add the SDA guide's OpenAI project key with `pnpm exec wrangler secret put OPENAI_SDA_API_KEY`.
5. Check the Worker package with `pnpm run check`. This automatically packages the canonical instruction file.
6. Publish it with `pnpm run deploy` only after explicit approval.
7. Confirm that both guide pages use the published Worker address.

Never put either API key in a repository file or paste it into a webpage.

## Run only on this computer

After `.dev.vars` contains both API keys, run `pnpm run local` from this folder. Then open `http://127.0.0.1:8000/try-it/` or `http://127.0.0.1:8000/self-directed-attention/`. The local server holds the keys and serves both endpoints and webpages. Closing the local server stops access.

## Privacy and limits

- OpenAI requests use `store: false`.
- The browser sends no more than 24 recent messages.
- Each message is limited to 600 characters.
- The Worker rejects more than eight requests per minute for one browser session.
- A second overall limit allows no more than 60 requests per minute per Cloudflare location.
- Worker observability is disabled so message bodies are not intentionally recorded in Worker logs.
- No automatic API retry is made.

## Zero measurement

The measurement layer records what happened in an anonymous Looking Zero session, never who used it. The browser-generated session ID is HMAC-hashed before storage. D1 stores timestamps, whether a complete invitation and a later response occurred, the highest conservative attempt-report signal, and message counts; it never stores conversation text, IP addresses, user agents, names, accounts, or cross-session identifiers.

Each guide experience has a separate database table. Looking and SDA keep their historical classifiers; unified Zero uses one combined classifier for its inward-looking and attention-guidance milestones. The classifiers receive temporary active conversation context through a separate OpenAI project and return strict structured data. They use `store: false`, default to `gpt-5.6-luna`, and cannot affect the user-visible Zero response. Measurement errors are deliberately ignored by the guide path.

SDA measurement records only observable delivery milestones: direction to the Look At Yourself guide, formal exercise guidance, daily-life guidance, a response after guidance, and natural completion. It does not classify whether the exercise worked or whether attention skills improved.

Unified measurement retains the conservative inward-look report categories and the attention-guidance delivery milestones in one separately scoped session record. It does not write into or reinterpret either historical table. The full design and cutover boundaries are documented in [`../../docs/UNIFIED-ZERO-MEASUREMENT.md`](../../docs/UNIFIED-ZERO-MEASUREMENT.md).

### Production setup and maintenance

1. Create a D1 database named `looking-zero-outcomes`.
2. Add its `OUTCOME_DB` binding to `wrangler.jsonc` using the database ID returned by Wrangler.
3. Apply `migrations/0001_looking_outcomes.sql` to that database.
   Apply all subsequent numbered migrations in order. `0005_zero_sources.sql` adds anonymous daily source and optional campaign aggregates without visitor-level records. `0006_sda_measurement.sql` adds the separate SDA session and daily aggregate tables. `0007_unified_zero_measurement.sql` adds separate unified session and daily aggregate tables without changing historical data.
4. Add the outcome project's OpenAI key with `pnpm exec wrangler secret put OPENAI_OUTCOME_API_KEY`.
5. Generate a long random HMAC secret and add it with `pnpm exec wrangler secret put OUTCOME_SESSION_SECRET`.
6. Generate a separate random private-dashboard password and add it with `pnpm exec wrangler secret put ANALYTICS_ACCESS_TOKEN`.
7. Confirm that the private dashboard's HTTP Basic authentication and private-route rate limiting are working. Cloudflare Access can be added later as a stronger outer authentication layer.
8. Open `/private/looking-zero` and sign in with username `analytics` and the private-dashboard password.
9. Use `OUTCOME_MEASUREMENT_ENABLED: "test"` with the exact controlled `OUTCOME_TEST_ORIGIN` when a limited evaluation is needed. Use `"false"` to disable collection and `"true"` only for approved production measurement.

The daily Cron Trigger archives session rows after 90 days into anonymous daily totals, then deletes the session rows. Historical aggregates remain available; median-message calculations cover only retained session rows.

Do not place any of these secrets in `.dev.vars` unless local API testing is specifically needed. Never commit or paste them into a webpage or conversation.

### Measurement definitions

- `invitation_delivered`: Zero gave a complete, actionable invitation containing both the correct object and the act of directing attention.
- `post_invitation_response`: the visitor sent a message after that invitation.
- `none`: no indication or explicit report of trying in the visitor's words.
- `attempt_indicated`: the visitor's response weakly or ambiguously implies an attempt.
- `attempt_explicitly_reported`: the visitor explicitly says they tried or describes trying the canonical act.

Attempt signals are monotonic: a session retains its highest report level. They do not classify success. A visitor may perform the inward look without recognizing, understanding, evaluating, or reporting it, so no attempt report must never be presented as evidence that the inward look did not occur.

SDA milestones are also monotonic and may overlap. Formal and daily-life guidance can both occur in one session. `post_guidance_response` means only that a later visitor message followed actionable guidance; `natural_completion` means that the visitor clearly finished and the guide closed naturally. Neither is an effectiveness judgment.

Unified milestones are monotonic and overlapping. They combine only the same observable inward-look reports and attention-guidance delivery milestones within a unified session. The scoped `unified:` hash input prevents collision with the historical guide tables; it does not create a reusable visitor identity or link separate sessions.

Cloudflare's rate-limit counters are approximate and location-based. Before wider public access, review actual usage and add stronger daily cost protection if the service demonstrates a need for it.

The deployed `PILOT_RATE_LIMITER` binding retains its historical external name to avoid an unnecessary Cloudflare resource migration. In code and documentation it is the guide-level rate limit.

## Source of truth

The preparation script reads both canonical files in `zero/` whenever the Worker is checked, tested, or published. It creates temporary generated modules that Git ignores. This keeps each guide's repository instruction file as its source of truth. The shared runtime instructions in `src/index.js` contain only response concision, AI transparency, and the narrow emergency exception. Teaching behavior and guide-specific website handoffs live in the canonical Markdown files.

The deployed Worker retains the historical `look-at-yourself-api` name because its workers.dev address is used by both public guide pages.
