# Pre-launch test report

Tested commit: `96d2009923bd002f8e118846fea371429bc86344`

## Passed repository checks

- Clean `main` matching `origin/main`.
- 97 HTML pages outside `legacy-site/`.
- Zero missing internal links or assets.
- Zero canonical URL mismatches among the 95 indexable pages.
- `sitemap.xml` contains exactly those 95 pages.
- No PHP files outside `legacy-site/`.
- `CNAME` is `justonelook.org`; robots and sitemap use the same host.
- Repository publication guardrails pass: Jekyll excludes `legacy-site/` and
  `.nojekyll` is absent.

## Passed browser checks

- 99 reachable route forms were checked at 1440 x 900 and 390 x 844: 198 page
  checks in total.
- No horizontal overflow, broken images, failed embedded media, missing titles,
  missing language/viewport metadata, empty links, or incorrect main-heading
  counts were found.

## Passed external checks

- All 41 Internet Archive podcast audio URLs returned HTTP 200.
- YouTube, the academic reference, the Creative Commons license, and both
  ChatGPT URLs returned HTTP 200.
- The Forum rejected an automated HEAD request but opened normally in a browser
  as **Just One Look Forum**.
- The two obsolete Amazon affiliate links found during the first pass were
  removed from the historical blog post.

## Repository decisions still needed

1. Confirm immediately before launch that the privacy, terms, and copyright
   wording still matches the services and rights holders then in effect.

The service owner confirmed the intended chatbot destinations:

- Looking instructor: `https://chatgpt.com/g/g-69e2310032ec8191a886a5811372695c-look-at-yourself`
- Self-Directed Attention instructor: `https://chatgpt.com/g/g-6a65d178d40481918ffbe64c5807e124-self-directed-attention-exercise`

## External work required before DNS cutover

1. Confirm GitHub Pages publishes from `main` and the repository root with the
   standard Jekyll build.
2. Inspect the exact Pages artifact and prove that `legacy-site/` and PHP files
   are absent.
3. On the deployed Pages site, verify that legacy and unknown paths return the
   expected HTTP status and custom 404 page.
4. Confirm the Pages custom domain is `justonelook.org`, domain verification is
   complete, and certificate provisioning can proceed.
5. Record the exact approved DNS records: apex to GitHub Pages, `www` as the
   alias, and `forum.justonelook.org` unchanged.
6. Only after the preceding checks pass, perform the DNS change, wait for TLS,
   enable HTTPS enforcement, and rerun the public-site protocol.

No DNS or external hosting settings were changed during this test.
