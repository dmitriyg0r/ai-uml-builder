# 🚀 Release Notes v0.0.8 - Windows/Linux Fix

## 🐛 Critical Fixes

### Fixed White Screen on Windows and Linux
- **Removed restrictive CSP** that was blocking application on Windows/Linux
- **Fixed Vite base path** configuration for proper asset loading
- **Added error handling** and logging to diagnose startup issues
- **Enabled console output** for debugging on all platforms

### Technical Changes
- Disabled Content Security Policy (CSP) to allow external resources
- Removed `base: './'` from Vite config that caused path issues
- Added comprehensive error handling in main entry point
- Enabled DevTools in debug mode for troubleshooting

## 📦 Build Targets

- **macOS**: ARM64 (Apple Silicon) - DMG
- **Windows**: x64 - MSI/EXE installer ✅ FIXED
- **Linux**: x64 - AppImage/DEB package ✅ FIXED

## 📥 Download

Get the latest release for your platform:
- 🍎 [macOS ARM64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
- 🪟 [Windows x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest) - Now working!
- 🐧 [Linux x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest) - Now working!

---

**Full Changelog**: https://github.com/dmitriyg0r/ai-uml-builder/compare/v0.0.7...v0.0.8
