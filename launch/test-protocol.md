# Pre-launch test protocol

Use this protocol on the exact commit intended for production. Do not change DNS
while running it.

## 1. Repository state

1. Confirm the working tree is clean and record the commit SHA.
2. Count every HTML page outside `legacy-site/`.
3. Check every local `href`, `src`, and `poster` target for a matching file.
4. Confirm that canonical URLs match their repository paths.
5. Confirm that `sitemap.xml` contains every indexable page and excludes
   `404.html` and the noindexed newsletter placeholder.
6. Confirm that `CNAME` contains `justonelook.org` and that `robots.txt` names
   the same canonical hostname.

## 2. Publication safety

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/Test-LegacyPublication.ps1
```

Before DNS cutover, obtain the exact GitHub Pages build artifact and rerun the
script with `-PublishedDirectory`. The published artifact must not contain
`legacy-site/` or any PHP files.

## 3. Browser and responsive checks

Serve the repository locally and visit every reachable non-legacy page at:

- desktop: 1440 x 900;
- mobile: 390 x 844.

For every page, check:

- a non-empty title, language, viewport declaration, and one main heading;
- no horizontal overflow;
- no broken images or failed audio/video elements;
- working internal navigation and a readable, usable layout.

Manually sample the homepage, Library, Blog, Podcast, ebook/PDF, Articles,
Videos, legal pages, newsletter placeholder, and custom 404 page.

## 4. External destinations

Check every unique external destination. Use a normal browser GET when a HEAD
request is blocked; a 403 or 503 response to an automated HEAD request alone
does not prove that a user-facing link is broken.

At minimum verify:

- all 41 Internet Archive podcast audio URLs;
- the Forum;
- both ChatGPT instructors;
- YouTube videos and channel;
- external academic and licensing references;
- any commercial links retained in historical material.

## 5. Exact GitHub Pages deployment

Before DNS cutover, test the deployed Pages artifact or staging URL—not only a
local server. Confirm:

- the intended `main`/root Pages source and a successful deployment;
- `legacy-site/` and representative `.php` URLs return 404 or 410;
- an unknown URL returns the custom page with HTTP status 404;
- representative HTML, image, PDF, audio, video, Forum, legal, and newsletter
  destinations work from the deployed site.

## 6. DNS and HTTPS cutover

After the repository and deployed artifact pass, the person controlling DNS
must verify the apex, `www`, and `forum` records; preserve the external Forum;
change the apex and `www` records as approved; wait for certificate issuance;
enable HTTPS enforcement; and then rerun the public-site checks on both hostnames
and over HTTP and HTTPS.

## Refinement history

Version 2 adds full responsive traversal, explicit structural checks, all
external destinations, and browser fallback for services that reject automated
HEAD requests. It also separates local checks from checks that require the exact
Pages artifact, DNS, or TLS configuration.
