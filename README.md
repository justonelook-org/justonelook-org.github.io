# Just One Look

This is the production repository for the [Just One Look website](https://justonelook.org), including its static content and Zero, the site's AI guide.

The site presents the invitation to **Look at Yourself** first, followed by guidance on what to do next and a library of books, articles, blog posts, podcast episodes, audio reports, and videos. Zero provides two deliberately separate guides for Step One and Step Two of the Just One Look Method.

## Production and publishing

GitHub Pages publishes the site from the `main` branch and the repository root.

- Production domain: `justonelook.org`
- GitHub Pages repository: `justonelook-org/justonelook-org.github.io`
- `CNAME` assigns the production domain to this repository.
- DNS is managed externally and must not be changed as part of ordinary content work.
- The Zero backend is a separately deployed Cloudflare Worker. Pushing this repository does not deploy the Worker.

## Repository structure

- `index.html` — homepage
- `what-now.html`, `about.html`, and other root HTML files — primary site pages
- `library/` — books, articles, blog posts, podcasts, audio reports, and videos
- `assets/` — shared images, styles, and other site assets
- `try-it/` and `self-directed-attention/` — canonical public webpages for Zero's two guides
- `try-it/x/` — the currently published X road to Zero
- `zero/` — canonical instructions for Zero's two guides
- `worker/zero/` — Cloudflare Worker backend shared by both Zero guides
- `AGENTS.md` — repository instructions for coding agents that maintain the site
- `scripts/` — maintenance and launch-checking utilities
- `legacy-site/` — preserved historical source material

The `legacy-site/` directory is excluded from GitHub Pages publication by `_config.yml`. Do not edit or publish it as part of routine site maintenance.

## How Zero is organized

Zero has two companion guides:

- **Look At Yourself** guides the inward look, Step One.
- **Self-Directed Attention Exercise** guides Step Two and assumes Step One has already been performed.

The two guides share infrastructure but must remain behaviorally separate. Their repository flow is:

```text
zero/                  Canonical behavior and teaching instructions
   ↓
worker/zero/           Generates runtime modules and serves both API routes
   ↓
try-it/ and self-directed-attention/
                       Canonical public browser interfaces
ai/                    Compatibility redirects for former guide URLs
```

The public pages call separate Worker routes:

```text
/api/look-at-yourself
/api/self-directed-attention
```

The Worker keeps separate instructions, API keys, model settings, and guide-specific behavior for those routes. Its deployed Cloudflare name remains `look-at-yourself-api` for compatibility with the existing public endpoint.

The only currently published Road to Zero is `/try-it/x/`. It records an anonymous aggregate X source count and immediately continues to `/try-it/`. Additional source routes should be added only when a corresponding public link is ready to use.

The Markdown files under `zero/` are the source of truth. Worker preparation generates temporary JavaScript instruction modules from them; those generated files are ignored by Git and should not be edited directly. Corresponding custom GPTs in ChatGPT should be kept in sync manually when their instructions change.

## Podcasts and external services

Podcast episode pages are maintained in this repository. The preserved podcast audio collection is hosted by [Internet Archive](https://archive.org/details/the-john-sherman-podcast).

Community conversation takes place on the external [Just One Look Forum](https://forum.justonelook.org). The forum is not hosted or maintained in this repository.

Other explicitly linked external services include YouTube, OpenAI, Cloudflare, and any corresponding custom GPTs in ChatGPT.

## Working on the repository

All work should follow the same basic process:

1. Create a focused branch for one concern.
2. Make the smallest necessary change.
3. Run the checks appropriate to the affected part of the repository.
4. Review the diff for accidental URL, generated-file, credential, or historical-content changes.
5. Open a pull request for review.
6. Merge only after the change has been verified.

Large audio or video files should not be added without first confirming the intended storage and preservation arrangement.

### Website content or interface changes

- Edit the root HTML files, `library/`, `assets/`, or the canonical public Zero pages as appropriate.
- Preserve existing public paths unless the change includes a planned redirect and all affected link updates.
- Check relevant internal links, assets, canonical URLs, metadata, sitemap coverage, and the custom 404 page.
- Test representative desktop and mobile widths when layout or styling changes.

### Zero instruction changes

- Edit the canonical Markdown files under `zero/`; do not edit generated instruction modules.
- Preserve the separation between the Step One and Step Two guides.
- From `worker/zero/`, run:

```text
pnpm test
```

- Review both the canonical change and its behavior before deploying the Worker.
- Manually update corresponding custom GPT instructions when they are intended to remain equivalent.

### Worker changes

The Worker package and detailed setup instructions live in `worker/zero/`. Common commands from that directory are:

```text
pnpm install       Install the development dependency
pnpm run local     Serve both guides locally using keys from .dev.vars
pnpm test          Generate instructions and run the test suite
pnpm run check     Build a dry-run deployment bundle
pnpm run deploy    Deploy only with explicit approval
```

Never commit `.dev.vars`, API keys, Cloudflare credentials, or other secrets. A normal GitHub Pages update does not require Worker deployment.

## Instructions for coding agents

Repository-specific instructions for Codex and compatible coding agents live in `AGENTS.md`. Keep that file concise and operational. It is for agents maintaining the repository; it is separate from Zero's end-user instructions under `zero/`.

## Copyright and licensing

See the website’s [Copyright and Licensing](https://justonelook.org/legal.html#copyright) section. Item-specific notices and the rights of historical material take precedence. No separate repository-wide license is asserted here while future rights arrangements remain under review.
