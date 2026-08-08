# Zero

This directory contains the canonical instruction sets for Zero, the Just One Look AI guide.

The guides are designed as companion guides:

- **Look At Yourself** guides Step One of the Just One Look Method.
- **Self-Directed Attention Exercise** guides Step Two.

Each guide has a single responsibility and intentionally avoids performing the role of the other. Changes to these instructions should preserve that separation.

The shared backend in `worker/zero/` reads these files when it is checked, tested, or deployed. Any corresponding GPTs in ChatGPT should also be kept in sync with these canonical versions.

Zero's public webpages live under `ai/` so their established public URLs remain stable.
