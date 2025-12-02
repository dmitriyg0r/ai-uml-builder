# 🚀 Release Notes v0.0.10 - Windows WebView2 Compatibility

## 🐛 Critical Fixes

### Fixed JavaScript Loading on Windows
- **ES2015 target** - Downgraded from ESNext for WebView2 compatibility
- **Loading fallback** - Added visible message if JavaScript fails to load
- **Build optimization** - Improved Vite build settings for Windows

### Technical Changes
- Set Vite build target to ES2015 for older WebView2 versions
- Added loading indicator in HTML
- Optimized rollup output configuration

## 📦 Build Targets

- **macOS**: ARM64 (Apple Silicon) - DMG
- **Windows**: x64 - MSI/EXE installer ✅ SHOULD WORK NOW
- **Linux**: x64 - AppImage/DEB package

## 📥 Download

- 🍎 [macOS ARM64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
- 🪟 [Windows x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
- 🐧 [Linux x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)

---

**Full Changelog**: https://github.com/dmitriyg0r/ai-uml-builder/compare/v0.0.9...v0.0.10
