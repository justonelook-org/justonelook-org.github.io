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
- **Try It clicks:** clicks on the homepage link leading to Looking Zero.
- **Looking Zero opened:** loads of the Looking Zero page.
- **Looking Zero sessions started:** first messages sent in Looking Zero, including a new first message after an intentional restart on the same open page.

The first dashboard section shows aggregate ratios between these action counts. They are directional estimates, not records of linked personal journeys. The Looking Zero outcome section appears beneath it and keeps its existing cards and definitions.

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

Because people are not identified, repeated page loads are repeated views. The dashboard must never label them as unique visitors.

## Storage

The D1 table `website_daily_traffic` contains one row per UTC day and four integer counters. Browser events increment those totals directly; there are no event-level traffic records to archive.

`TRAFFIC_MEASUREMENT_ENABLED` supports:

- `"false"`: no traffic counting.
- `"test"`: count only the exact `TRAFFIC_TEST_ORIGIN`.
- `"true"`: count approved production origins while excluding the exact team-test origin.

Team activity at `https://website-test-zero.pages.dev` is excluded in production mode.

## Interpretation

Use the figures to ask whether the website is helping people reach and begin Looking Zero. Do not infer how many distinct people visited or claim that an identified visitor moved through every step.

The Looking Zero outcome section remains the source for invitation delivery and conversational reports of trying. Although both sections share one page and date selector, traffic and outcomes must still be discussed as separate aggregate layers.

## Maintenance

Before changing an event definition, update this guide, the public privacy disclosure, and the automated tests. Test changes with `TRAFFIC_MEASUREMENT_ENABLED` set to `"test"`, remove synthetic daily totals, and only then enable production.
