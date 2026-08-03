# Final hosting and DNS handoff

The new site is in `justonelook-org/website-test`. Repository preparation and
local testing are documented in `test-protocol.md` and
`pre-launch-test-report.md`.

## Decisions already made

- The canonical hostname is `justonelook.org`.
- `www.justonelook.org` will be an alias.
- `forum.justonelook.org` is an independent external service and must remain
  unchanged.
- The old server will be taken offline when the primary DNS record moves.
- No legacy content or old-server redirects will be published by the new
  GitHub Pages site.
- Do not alter `legacy-site/` in the repository.

## Before changing DNS

1. In GitHub Settings > Pages, confirm that the publishing source is `main`
   from the repository root using the standard Jekyll build.
2. Confirm the latest Pages deployment succeeded and record its testable URL or
   download the exact published artifact.
3. Run the artifact check described in `test-protocol.md`. It must prove that
   `legacy-site/` and PHP files are absent.
4. On the deployed Pages site, confirm that representative `/legacy-site/...`,
   `.php`, and unknown URLs return 404 or 410, never archived content or source
   code. An unknown path must use the custom 404 page with HTTP status 404.
5. Confirm the Pages custom domain is `justonelook.org`, domain verification is
   complete, and report the current certificate and **Enforce HTTPS** status.
6. Record the current and proposed DNS records for the apex and `www`. Record
   the `forum` record separately and leave it unchanged.
7. Review `pre-launch-test-report.md` and resolve its remaining repository or
   service-owner decisions.

## Cutover plan to prepare

Return the exact, ordered commands or provider actions for:

1. lowering DNS TTL if still useful;
2. changing the apex record to GitHub Pages;
3. configuring `www` as the approved alias;
4. verifying that `forum.justonelook.org` is unchanged;
5. waiting for GitHub Pages certificate provisioning;
6. enabling HTTPS enforcement;
7. running the public-site portion of `test-protocol.md` over HTTP and HTTPS on
   both the apex and `www` hostnames;
8. rolling back the DNS records if the deployment or certificate fails.

Do not perform the DNS cutover until this evidence and plan have been reviewed.
