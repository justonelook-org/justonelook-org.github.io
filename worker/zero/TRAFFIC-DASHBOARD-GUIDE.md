# Anonymous website traffic dashboard guide

This guide describes the privacy-first website traffic section of the unified measurement dashboard. It complements, but does not alter, the Looking Zero outcome section.

## Private dashboard

Dashboard: <https://look-at-yourself-api.look-at-yourself-worker.workers.dev/private/looking-zero>

The former `/private/website-traffic` address redirects to this unified page so existing bookmarks continue to work.

Use the same private credentials as the Looking Zero outcome dashboard:

- Username: `analytics`
- Password: the value stored in Cloudflare as `ANALYTICS_ACCESS_TOKEN`

## What is counted

- **Homepage views:** loads of the Just One Look homepage.
- **Homepage entrances:** direct or external arrivals at the homepage, excluding ordinary reloads and navigation from another Just One Look page. This is a storage-free estimate, not a visit or unique person.
- **Try It clicks:** clicks on the homepage link leading to Looking Zero.
- **Looking Zero opened:** loads of the Looking Zero page.
- **Looking Zero sessions started:** browser-recorded first-message events in Looking Zero, including a new first message after an intentional restart on the same open page. This independent event can differ slightly from the Worker-recorded sessions in Outcome Measurement.
- **Roads to Zero:** arrivals through implemented clean source paths. X uses `/try-it/x/`, with `/x/` retained for compatibility; YouTube and Bluesky currently use `/youtube/` and `/bluesky/`. Each path records one approved source count and immediately continues to canonical `/try-it/`.

The first dashboard section shows aggregate ratios between these independent action counts. They are directional estimates, not a linked visitor funnel or records of personal journeys. The Looking Zero outcome section appears beneath it and keeps its existing cards and definitions.

## What is deliberately not collected

The system does not use or retain:

- analytics cookies
- local-storage or session-storage identifiers
- unique visitor identifiers
- browser fingerprinting
- IP addresses in the analytics database
- user-agent strings
- raw referrer URLs or campaign query strings
- browsing histories
- links between traffic actions and individual Zero outcome records

The browser checks only the current page's navigation type and whether its referrer is from the same site. It sends the fixed `homepage_entrance` event when the arrival is direct or external and is not an ordinary reload. The referrer itself is never sent or stored.

Clean source paths send only a fixed approved source slug and, when implemented later, an optional lowercase campaign slug from the path. They do not send or store a referrer. Source and campaign totals are not joined to page openings, sessions, conversations, or outcomes. `/try-it/` remains the canonical Looking Zero URL, and source-entry pages are excluded from search indexing.

Because people are not identified, homepage entrances must never be labelled as visits or unique visitors. The same person returning later or using another device can create additional entrances, and some browser behavior may undercount or overcount them.

## Storage

The D1 table `website_daily_traffic` contains one row per UTC day and five integer counters. The `zero_source_daily` table contains only UTC day, approved source slug, optional campaign slug, and aggregate count. Browser events increment these totals directly; there are no event-level traffic records to archive. Homepage-entrance measurement began on August 11, 2026, so its comparisons exclude earlier Try It clicks.

`TRAFFIC_MEASUREMENT_ENABLED` supports:

- `"false"`: no traffic counting.
- `"test"`: count only the exact `TRAFFIC_TEST_ORIGIN`.
- `"true"`: count approved production origins while excluding the exact team-test origin.

Team activity at `https://website-test-zero.pages.dev` is excluded in production mode.

## Interpretation

Use the figures to ask whether the website is helping people reach and begin Looking Zero. Homepage entrances reduce inflation from ordinary reloads without recognizing browsers, but they do not measure visits or distinct people. Do not claim that an identified visitor moved through every step.

Source counts answer only which clean roads were opened. They do not show whether those arrivals became Zero openings, sessions, invitations, or indications of trying. Optional campaign paths such as `/youtube/zero-short-01/` can be added later by publishing a source-entry page using the same shared script; the Worker and storage schema already support the campaign slug without linking it to a visitor.

The Looking Zero outcome section remains the source for invitation delivery and conversational reports of trying. Although both sections share one page and date selector, traffic and outcomes must still be discussed as separate aggregate layers.

## Maintenance

Before changing an event definition, update this guide, the public privacy disclosure, and the automated tests. Test changes with `TRAFFIC_MEASUREMENT_ENABLED` set to `"test"`, remove synthetic daily totals, and only then enable production.
