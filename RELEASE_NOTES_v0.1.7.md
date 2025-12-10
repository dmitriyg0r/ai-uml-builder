# Release Notes v0.1.7

FIX
- Updater: latest.json now points to the correct release tag (app-vX.Y.Z) and is generated reliably by finding signature files.
- Release workflow publishes releases (no drafts) and merges latest.json across macOS/Windows jobs to keep updater assets consistent.
