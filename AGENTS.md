# Repository instructions

## Purpose and structure

This is the production repository for the static Just One Look website at `justonelook.org`.

- `try-it/` contains the canonical public webpage for unified Zero.
- `self-directed-attention/` is a compatibility redirect to the canonical unified guide.
- `try-it/x/`, `try-it/bluesky/`, `try-it/reddit/`, `try-it/tiktok/`, `try-it/tumblr/`, and `try-it/pinterest/` are the social source-entry routes currently published for Zero.
- `zero/` contains the canonical instructions for unified Zero and the retained historical guides.
- `worker/zero/` contains the Cloudflare Worker backend for unified Zero and the retained compatibility routes.
- `library/` and the root HTML files contain the published site content.
- `legacy-site/` is preserved historical material. Do not change or publish it during routine maintenance.

## Working rules

- Treat unified Zero at `/try-it/` as the only canonical public guide. It gives the inward look priority and may continue into formal or daily-life attention guidance only after a reported look and a relevant visitor request.
- Keep public Zero links limited to `/try-it/` and explicitly published source-entry routes. Preserve `/self-directed-attention/` only as a redirect unless a separately approved transition changes that decision.
- Retain the former Looking Zero and Self-Directed Attention instructions and API routes only for compatibility, rollback, and historical interpretation. Do not present them as separate current guides.
- Keep unified measurement separate from the historical Looking Zero and Self-Directed Attention datasets. Do not relabel, backfill, or link historical and unified sessions. A dashboard overview may add only compatible inward-looking milestones as aggregate counts while preserving each detailed section's original definitions.
- Preserve the measurement privacy model: no conversation text, visitor IDs, cookies, fingerprints, profiles, raw referrers, or linked journeys. Session metadata is converted to anonymous daily totals after 90 days.
- Treat the Markdown instruction files under `zero/` as the source of truth. Generated instruction modules are temporary and ignored by Git.
- Never commit API keys, `.dev.vars`, credentials, or other secrets.
- Do not deploy the Worker, change DNS, or publish external changes without explicit approval.
- Preserve unrelated user changes and keep each change focused.

## Validation

- After changing Zero's instructions or Worker code, run `pnpm test` from `worker/zero/`.
- Run `pnpm run check` from `worker/zero/` when validating a deployable Worker bundle.
- For website changes, check affected internal links, redirects, assets, metadata, sitemap coverage, and representative desktop and mobile layouts as relevant.
