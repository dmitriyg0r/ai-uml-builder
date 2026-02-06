# AI UML Builder v0.3.4

## Fixes

- Fixed login/network behavior in desktop build by forcing API base URL to `http://46.138.243.148:3010`.
- Added macOS ATS exception domain for `46.138.243.148`.
- Improved API error reporting for network/HTML misrouting cases.
- Added API routes for `/` and `/favicon.ico` on the backend.

## Release Pipeline

- Fixed `latest.json` generation script to find updater signatures in CI target paths, including universal macOS bundles.
