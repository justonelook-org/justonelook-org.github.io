# Repository instructions

## Purpose and structure

This is the production repository for the static Just One Look website at `justonelook.org`.

- `try-it/` and `self-directed-attention/` contain Zero's canonical public webpages.
- `try-it/x/` is the only social source-entry route currently published for Zero.
- `zero/` contains the canonical instructions for Zero's two guides.
- `worker/zero/` contains the shared Cloudflare Worker backend for both Zero guides.
- `library/` and the root HTML files contain the published site content.
- `legacy-site/` is preserved historical material. Do not change or publish it during routine maintenance.

## Working rules

- Keep public Zero links limited to the canonical guide routes and explicitly published source-entry routes.
- Keep the Look At Yourself and Self-Directed Attention Exercise guides behaviorally separate.
- Treat the Markdown instruction files under `zero/` as the source of truth. Generated instruction modules are temporary and ignored by Git.
- Never commit API keys, `.dev.vars`, credentials, or other secrets.
- Do not deploy the Worker, change DNS, or publish external changes without explicit approval.
- Preserve unrelated user changes and keep each change focused.

## Validation

- After changing Zero's instructions or Worker code, run `pnpm test` from `worker/zero/`.
- Run `pnpm run check` from `worker/zero/` when validating a deployable Worker bundle.
- For website changes, check affected internal links, assets, metadata, sitemap coverage, and representative desktop and mobile layouts as relevant.
