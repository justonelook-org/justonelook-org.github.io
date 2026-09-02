# Zero

This directory contains the canonical instruction sets for Zero, the Just One Look AI guide.

The guides are designed as companion guides:

- **Look At Yourself** guides Step One of the Just One Look Method.
- **Self-Directed Attention Exercise** guides Step Two.

Each guide has a single responsibility and intentionally avoids performing the role of the other. Changes to these instructions should preserve that separation.

The shared backend in `worker/zero/` reads these files when it is checked, tested, or deployed. Any corresponding GPTs in ChatGPT should also be kept in sync with these canonical versions.

Zero's canonical public webpages are `/try-it/` for Look At Yourself and `/self-directed-attention/` for the Self-Directed Attention Exercise. The published X source-entry route is `/try-it/x/`.
