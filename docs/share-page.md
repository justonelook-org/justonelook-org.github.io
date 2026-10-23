# Share Just One Look

`/share/` is a static community resource for sharing the invitation. It is linked beside Forum in the homepage's secondary footer navigation. The primary link and larger QR code point directly to `https://justonelook.org/try-it/`; the website homepage is secondary.

The Share page uses the normal, non-sticky shared header so it scrolls with the content. It intentionally omits the optional `site-header--sticky` class. The two introduction paragraphs are grouped with a smaller gap, and QR sharing permission appears as a modest note before the footer.

## Files

- `share/index.html`: content, metadata, normal secondary-page navigation and footer links.
- `assets/css/share.css`: page-only styles alongside the shared prose and navigation styles.
- `assets/js/share.js`: Clipboard API enhancement, with visible URL selection and manual-copy guidance when unavailable or denied. Without JavaScript, URLs and downloads remain usable.
- `assets/share/try-it-zero-qr.svg` and `assets/share/website-qr.svg`: static black-and-white downloads with opaque white backgrounds and four-module quiet zones.

## Asset provenance and permissions

The two QR SVGs were generated for this page using Python qrcode 8.2, error correction M, from the two literal public URLs. They encode only those URLs and contain no third-party illustration, font, logo, tracking parameter or embedded content. The page's permission statement is limited to these newly created QR files, as authorized by the sharing-resource brief. It does not license the repository or other site materials.

The existing Zero navigation decoration remains part of the shared site styling; it is not offered as a downloadable sharing illustration. No broader redistribution rights for existing Zero artwork or historical materials have been verified here.

## Adding materials later

Add only finished, approved files under `assets/share/`, with descriptive filenames, preview alternative text, meaningful download labels and any required attribution. Record the rights holder, permission evidence and any usage restrictions here before offering illustrations, text images or PDFs. Do not assume existing site assets are cleared for redistribution or modification. Do not add empty downloads or speculative artwork.

Keep Zero's direct invitation visually primary, preserve clean canonical links and keep the homepage's central invitation unchanged. Generate QR codes during development, never via a runtime provider. Preserve an opaque white background and at least four modules of quiet space; decode the actual rendered SVG after any regeneration. Generation/decoding tools are development-only and are not site dependencies.

## Verification

Serve the repository root locally and visit `/share/`. Check both copy actions (success, unavailable API and denied permission), keyboard focus, downloads, desktop and narrow mobile widths, internal links/assets, canonical/social metadata and sitemap coverage. Decode both SVGs and compare their exact destination strings. The page makes no external requests or analytics calls. Run `scripts/Test-LegacyPublication.ps1` and `git diff --check`. Worker tests are unnecessary unless Worker code or Zero instructions also change.
