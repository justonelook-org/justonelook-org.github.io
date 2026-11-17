# Share Just One Look

`/share/` is a static community resource, linked from the homepage footer. The November 2026 design follows the approved visual reference: centered serif title, local blue waves, compact copy rows, equal-sized QR panels, downloadable invitation artwork, alphabetical social cards and a separate YouTube archive link. The existing non-sticky Home navigation, Forum invitation, QR permission note and footer remain.

## Files and maintenance

- `share/index.html`: content, metadata, local icons and download links.
- `assets/css/share.css`: styles scoped to this page; shared navigation CSS is unchanged.
- `assets/js/share.js`: three Clipboard API controls. Each uses its nearest `data-copy-group` for live feedback. If copying is denied/unavailable, the visible destination link is selected and focused for manual copying. Without JavaScript, links and downloads remain usable and copy buttons stay hidden.
- `assets/share/try-it-zero-qr.svg`, `website-qr.svg`: original static QR sources, unchanged.
- Corresponding PNGs: 1110 × 1110 and 990 × 990, with 300 dpi metadata.
- `assets/share/social-invitation.png`: 1080 × 1080 social image.
- `assets/share/printable-invitation.png`: 1800 × 1200 landscape card, 300 dpi (6 × 4 inches / 152.4 × 101.6 mm at 100% print size).
- `assets/share/soft-blue-wave.svg`: original lightweight decorative wave, shared by the webpage and generated materials.
- `assets/share/icons/`: seven locally stored platform icons. No icon CDN or external fonts are loaded at runtime.
- `scripts/build-share-assets.cjs`: reproducible PNG composition using the existing owl and QR sources; development-only `sharp` is required. Set `NODE_PATH` to a local directory containing `sharp`, then run `node scripts/build-share-assets.cjs` from the repository. No new package manifest or runtime dependency is introduced.
- `docs/share-page-review/`: desktop/mobile screenshots for the review PR.

The page uses the exact downloadable images as its previews, scaled with CSS. Keep SVG downloads alongside the easier-to-share PNG files. Copy buttons copy the full HTTPS URL, even when the visible text omits the protocol. Bump the stylesheet/script query version after changes that would otherwise leave returning visitors with stale styling or behavior.

## Artwork provenance and scope

The source owl is `assets/brand/jol-logo.jpg`, the same original illustration used on the homepage (675 × 932 pixels). It is composed without redrawing or AI replacement and is not enlarged beyond its source pixel dimensions in either PNG. The user approved its use in these downloadable invitations in the November 17, 2026 Share design brief and implementation plan. This is specific authorization for these materials, not a new repository-wide copyright license or permission to modify unrelated historical work.

The original QR SVGs were generated with Python qrcode 8.2, error correction M. They encode only `https://justonelook.org/try-it/` and `https://justonelook.org/`. PNG exports preserve opaque white backgrounds and four-module quiet zones. The printable card contains the real Zero QR code, not a pattern copied from the mockup. At intended print size its full QR square is approximately 37.6 mm wide and is kept clear of text and wave artwork.

Platform silhouettes are from [Simple Icons 16.0.0](https://github.com/simple-icons/simple-icons/tree/16.0.0/icons), under [CC0](https://github.com/simple-icons/simple-icons/blob/16.0.0/LICENSE.md), with local fill colors. Files: bluesky.svg, pinterest.svg, reddit.svg, tiktok.svg, tumblr.svg, x.svg, youtube.svg. Brand/trademark rights remain with their owners; the icons identify the linked services and are not part of the downloadable invitation artwork. TikTok uses a simple monochrome silhouette rather than the reference's multicolor treatment. Interface symbols are small inline SVGs created for this page.

The soft wave is a locally authored SVG approximation of the supplied watercolor reference; its texture is intentionally restrained for legibility and small file size. A print PDF is not included: the approved high-resolution PNG meets the initial scope without another document format or dependency.

## Verification and future materials

Test all three copy controls (success, denied permission and unavailable API), keyboard use, the six downloads, no-JavaScript use, local links/assets, canonical metadata and sitemap coverage. Verify exact external destinations; social platforms may block automated checks. Confirm no third-party requests occur on page load. Use desktop, laptop, tablet, 375 × 812 (iPhone 13 mini) and 320px-wide layouts; inspect overflow, artwork, focus indicators and 44px controls.

Decode both QR PNGs and the complete printable image after regeneration, including reduced-resolution exports. Digital decoding cannot certify every printer: the final physical proof should be printed at 100%, checked for adequate contrast, and scanned with a phone before bulk printing. Do not crop the quiet zones or stretch the artwork.

Run `scripts/Test-LegacyPublication.ps1` and `git diff --check`. Worker tests are required only if Worker code/instructions change. Add only finished materials under `assets/share/`, with descriptive names, useful alt text, exact download previews and documented provenance. Preserve clean canonical destinations and privacy. Do not publish new artwork based solely on its presence elsewhere in the repository.

## Review deployment

Use an isolated preview branch of the existing `website-test-zero` Cloudflare Pages project. Build with the existing team-test helper, add the Share directory, and replace the build's homepage with `origin/main:index.html` so unrelated local homepage edits are not published. Add preview-only `noindex, nofollow, noarchive` headers, no-store caching and a disallow-all robots file. Do not commit the temporary build, replace the team's production test branch, deploy the Worker, or publish to justonelook.org. The Share page's canonical URL remains its intended production address.
