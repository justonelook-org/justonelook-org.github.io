# Repository instructions

## Purpose and structure

This is the production repository for the static Just One Look website at `justonelook.org`.

- `ai/` contains Zero's public webpages. Its directory paths are public URLs and should remain stable.
- `zero/` contains the canonical instructions for Zero's two guides.
- `worker/zero/` contains the shared Cloudflare Worker backend for both Zero guides.
- `library/` and the root HTML files contain the published site content.
- `legacy-site/` is preserved historical material. Do not change or publish it during routine maintenance.

## Working rules

- Preserve existing public URLs unless a requested migration includes redirects and link updates.
- Keep the Look At Yourself and Self-Directed Attention Exercise guides behaviorally separate.
- Treat the Markdown instruction files under `zero/` as the source of truth. Generated instruction modules are temporary and ignored by Git.
- Never commit API keys, `.dev.vars`, credentials, or other secrets.
- Do not deploy the Worker, change DNS, or publish external changes without explicit approval.
- Preserve unrelated user changes and keep each change focused.

## Validation

- After changing Zero's instructions or Worker code, run `pnpm test` from `worker/zero/`.
- Run `pnpm run check` from `worker/zero/` when validating a deployable Worker bundle.
- For website changes, check affected internal links, assets, metadata, sitemap coverage, and representative desktop and mobile layouts as relevant.
