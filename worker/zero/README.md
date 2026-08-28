# Zero private service

This small Cloudflare Worker connects the Look At Yourself and Self-Directed Attention Exercise guides to OpenAI. It contains no conversation database and does not intentionally log message content.

For day-to-day access, interpretation, privacy, and maintenance of the unified private traffic and outcome dashboard, see [DASHBOARD-GUIDE.md](DASHBOARD-GUIDE.md).

For the short internal note telling the JOL team where to test without affecting production measurements, see [TEAM-TESTING.md](TEAM-TESTING.md).

For the privacy-first website traffic section, event definitions, and maintenance boundaries, see [TRAFFIC-DASHBOARD-GUIDE.md](TRAFFIC-DASHBOARD-GUIDE.md).

The repository also contains an optional, disabled-by-default anonymous outcome-measurement layer for Looking Zero. It does not apply to Self-Directed Attention Zero. It remains inactive unless its dedicated D1 binding and secrets are configured. `OUTCOME_MEASUREMENT_ENABLED` supports three explicit modes: `"false"` disables collection, `"test"` permits only the exact `OUTCOME_TEST_ORIGIN`, and `"true"` permits allowed production origins.

## Before the pilot can run

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

## Looking Zero outcome measurement

The optional measurement layer records what happened in an anonymous Looking Zero session, never who used it. The existing browser UUID is HMAC-hashed before storage. D1 stores timestamps, whether a complete invitation and a later response occurred, the highest conservative attempt-report signal, and message counts; it never stores conversation text, IP addresses, user agents, names, accounts, or cross-session identifiers.

The classifier receives temporary active conversation context through a separate OpenAI project and returns strict structured data. It is called only for Looking Zero, uses `store: false`, defaults to `gpt-5.6-luna`, and cannot affect the user-visible Zero response. Measurement errors are deliberately ignored by the guide path.

### Private setup (do not deploy until reviewed)

1. Create a D1 database named `looking-zero-outcomes`.
2. Add its `OUTCOME_DB` binding to `wrangler.jsonc` using the database ID returned by Wrangler.
3. Apply `migrations/0001_looking_outcomes.sql` to that database.
   Apply all subsequent numbered migrations in order. `0005_zero_sources.sql` adds anonymous daily source and optional campaign aggregates without visitor-level records.
4. Add the outcome project's OpenAI key with `pnpm exec wrangler secret put OPENAI_OUTCOME_API_KEY`.
5. Generate a long random HMAC secret and add it with `pnpm exec wrangler secret put OUTCOME_SESSION_SECRET`.
6. Generate a separate random private-dashboard password and add it with `pnpm exec wrangler secret put ANALYTICS_ACCESS_TOKEN`.
7. Protect `/private/looking-zero*` with Cloudflare Access before production use. The built-in HTTP Basic check is defense in depth and is not a substitute for Access on a public deployment.
8. Open `/private/looking-zero` and sign in with username `analytics` and the private-dashboard password.
9. Keep `OUTCOME_MEASUREMENT_ENABLED` set to `"false"` through the first deployment and private dashboard checks. Use `"test"` with the exact controlled `OUTCOME_TEST_ORIGIN` for the limited evaluation. Set it to `"true"` only after the criteria, privacy disclosure, authentication, and evaluation are approved.

The daily Cron Trigger archives session rows after 90 days into anonymous daily totals, then deletes the session rows. Historical aggregates remain available; median-message calculations cover only retained session rows.

Do not place any of these secrets in `.dev.vars` unless local API testing is specifically needed. Never commit or paste them into a webpage or conversation.

### Measurement definitions

- `invitation_delivered`: Zero gave a complete, actionable invitation containing both the correct object and the act of directing attention.
- `post_invitation_response`: the visitor sent a message after that invitation.
- `none`: no indication or explicit report of trying in the visitor's words.
- `attempt_indicated`: the visitor's response weakly or ambiguously implies an attempt.
- `attempt_explicitly_reported`: the visitor explicitly says they tried or describes trying the canonical act.

Attempt signals are monotonic: a session retains its highest report level. They do not classify success. A visitor may perform the inward look without recognizing, understanding, evaluating, or reporting it, so no attempt report must never be presented as evidence that the inward look did not occur.

Cloudflare's rate-limit counters are approximate and location-based. Before wider public access, review actual usage and add stronger daily cost protection if the pilot demonstrates a need for it.

## Source of truth

The preparation script reads both canonical files in `zero/` whenever the Worker is checked, tested, or published. It creates temporary generated modules that Git ignores. This keeps each guide's repository instruction file as its source of truth. The additional instructions in `src/index.js` contain only website-specific boundaries, response guidance, transparency rules, and the narrow emergency exception.

The deployed Worker retains the historical `look-at-yourself-api` name because its workers.dev address is used by both public guide pages.
