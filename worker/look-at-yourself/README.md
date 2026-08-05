# Look At Yourself private service

This small Cloudflare Worker is the private connection between the pilot page and OpenAI. It contains no conversation database and does not intentionally log message content.

## Before the pilot can run

The site owner needs a Cloudflare account and a separate OpenAI API project with a low monthly budget alert.

From this folder, the person setting up the service must:

1. Install the listed development dependency with `pnpm install`.
2. Sign in to Cloudflare with `pnpm exec wrangler login`.
3. Add the OpenAI project key with `pnpm exec wrangler secret put OPENAI_API_KEY`.
4. Create a private invitation code with `pnpm exec wrangler secret put PILOT_ACCESS_CODE`.
5. Check the Worker package with `pnpm run check`. This automatically packages the canonical instruction file.
6. Publish it with `pnpm run deploy` only after explicit approval.
7. Replace `YOUR-SUBDOMAIN` in `ai/look-at-yourself/index.html` with the published Worker address.

Never put either secret in a repository file or paste it into the webpage.

## Run only on this computer

After `.dev.vars` contains the two local secrets, run `pnpm run local` from this folder. Then open `http://127.0.0.1:8000/ai/look-at-yourself/`. The local server holds the OpenAI key and serves both the private endpoint and the unpublished webpage. Closing the local server stops access.

## Privacy and limits

- OpenAI requests use `store: false`.
- The browser sends no more than eight recent messages.
- Each message is limited to 600 characters.
- The Worker rejects more than eight requests per minute for one browser session.
- A second overall limit allows no more than 60 requests per minute per Cloudflare location.
- Worker observability is disabled so message bodies are not intentionally recorded in Worker logs.
- No automatic API retry is made.

Cloudflare's rate-limit counters are approximate and location-based. Before wider public access, review actual usage and add stronger daily cost protection if the pilot demonstrates a need for it.

## Source of truth

The preparation script reads `bots/look-at-yourself/instructions.md` whenever the Worker is checked, tested, or published. It creates a temporary generated module that Git ignores. This keeps the repository instruction file as the single source of truth. The additional instructions in `src/index.js` contain only the pilot-specific Step One boundary, response-length rule, transparency rule, and narrow emergency exception.
