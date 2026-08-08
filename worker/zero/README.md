# Zero private service

This small Cloudflare Worker connects the Look At Yourself and Self-Directed Attention Exercise guides to OpenAI. It contains no conversation database and does not intentionally log message content.

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

After `.dev.vars` contains both API keys, run `pnpm run local` from this folder. Then open `http://127.0.0.1:8000/ai/look-at-yourself/` or `http://127.0.0.1:8000/ai/self-directed-attention/`. The local server holds the keys and serves both endpoints and webpages. Closing the local server stops access.

## Privacy and limits

- OpenAI requests use `store: false`.
- The browser sends no more than 24 recent messages.
- Each message is limited to 600 characters.
- The Worker rejects more than eight requests per minute for one browser session.
- A second overall limit allows no more than 60 requests per minute per Cloudflare location.
- Worker observability is disabled so message bodies are not intentionally recorded in Worker logs.
- No automatic API retry is made.

Cloudflare's rate-limit counters are approximate and location-based. Before wider public access, review actual usage and add stronger daily cost protection if the pilot demonstrates a need for it.

## Source of truth

The preparation script reads both canonical files in `zero/` whenever the Worker is checked, tested, or published. It creates temporary generated modules that Git ignores. This keeps each guide's repository instruction file as its source of truth. The additional instructions in `src/index.js` contain only website-specific boundaries, response guidance, transparency rules, and the narrow emergency exception.

The deployed Worker retains the historical `look-at-yourself-api` name because its workers.dev address is used by both public guide pages.
