# Just One Look

This is the production repository for the [Just One Look website](https://justonelook.org).

The site presents the invitation to **Look at Yourself** first, followed by guidance on what to do next and a library of books, articles, blog posts, podcast episodes, audio reports, and videos.

## Publishing

GitHub Pages publishes the site from the `main` branch and the repository root.

- Production domain: `justonelook.org`
- GitHub Pages repository: `justonelook-org/justonelook-org.github.io`
- `CNAME` assigns the production domain to this repository.
- DNS is managed externally and must not be changed as part of ordinary content work.

## Repository structure

- `index.html` — homepage
- `what-now.html`, `about.html`, and other root HTML files — primary site pages
- `library/` — books, articles, blog posts, podcasts, audio reports, and videos
- `assets/` — shared images, styles, and other site assets
- `bots/` — source instructions for the two external ChatGPT guides
- `scripts/` — maintenance and launch-checking utilities
- `launch/` — launch protocol, reports, and supporting records
- `legacy-site/` — preserved historical source material

The `legacy-site/` directory is excluded from GitHub Pages publication by `_config.yml`. Do not edit or publish it as part of routine site maintenance.

## Podcasts and external services

Podcast episode pages are maintained in this repository. The preserved podcast audio collection is hosted by [Internet Archive](https://archive.org/details/the-john-sherman-podcast).

Community conversation takes place on the external [Just One Look Forum](https://forum.justonelook.org). The forum is not hosted or maintained in this repository.

Other explicitly linked external services include YouTube and the two ChatGPT guides.

## Maintenance workflow

1. Create a focused branch for one concern.
2. Make the smallest necessary change.
3. Check internal links, assets, canonical URLs, metadata, sitemap coverage, and the custom 404 page when relevant.
4. Test representative desktop and mobile widths.
5. Open a pull request for review.
6. Merge only after the change has been verified.

Large audio or video files should not be added without first confirming the intended storage and preservation arrangement.

## Copyright and licensing

See the website’s [Copyright and Licensing](https://justonelook.org/legal.html#copyright) section. Item-specific notices and the rights of historical material take precedence. No separate repository-wide license is asserted here while future rights arrangements remain under review.
