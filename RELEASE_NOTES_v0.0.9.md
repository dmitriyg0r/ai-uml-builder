# 🚀 Release Notes v0.0.9 - Windows/Linux WebView Fix

## 🐛 Critical Fixes

### Fixed White Screen on Windows and Linux (Real Fix!)
- **Removed import maps** - Windows WebView2 and Linux WebKitGTK don't support them
- **Removed CDN dependencies** - Tailwind CSS now bundled via PostCSS
- **Using npm packages** - All dependencies now properly bundled by Vite
- **Proper font loading** - Fonts now loaded via CSS imports

### Technical Changes
- Migrated from Tailwind CDN to PostCSS + Tailwind
- Removed ESM import maps (not supported on Windows/Linux WebView)
- All external dependencies now bundled in the app
- Added Tailwind config for proper purging

## 📦 Build Targets

- **macOS**: ARM64 (Apple Silicon) - DMG
- **Windows**: x64 - MSI/EXE installer ✅ SHOULD WORK NOW
- **Linux**: x64 - AppImage/DEB package ✅ SHOULD WORK NOW

## 📥 Download

- 🍎 [macOS ARM64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
- 🪟 [Windows x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
- 🐧 [Linux x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)

---

**Full Changelog**: https://github.com/dmitriyg0r/ai-uml-builder/compare/v0.0.8...v0.0.9
