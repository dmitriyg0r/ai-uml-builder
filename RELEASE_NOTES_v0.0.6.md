# 🚀 Release Notes v0.0.6 - Tauri Migration

## 🎯 Major Changes

### ⚡ Complete Migration to Tauri 2.0

We've completely migrated from Electron to Tauri, resulting in **massive improvements**:

#### 📦 Size Reduction
- **Before (Electron)**: 130 MB
- **After (Tauri)**: 4.9 MB DMG
- **Reduction**: 96% smaller! 🎉

#### 🚀 Performance Improvements
- **Faster startup** - Native Rust backend
- **Lower memory usage** - ~50-70% less RAM
- **Better security** - Smaller attack surface
- **Native feel** - Uses system WebView

### 🏗️ Technical Changes

#### Removed
- ❌ Electron dependencies (~358 packages removed)
- ❌ `electron/` directory
- ❌ `dist-electron/` build output
- ❌ Heavy Chromium bundle

#### Added
- ✅ Tauri 2.0 with Rust backend
- ✅ `src-tauri/` directory structure
- ✅ Optimized build pipeline
- ✅ GitHub Actions workflow for multi-platform builds

### 📋 Build Targets

- **macOS**: ARM64 (Apple Silicon) - 4.9 MB DMG
- **Windows**: x64 - MSI/EXE installer
- **Linux**: x64 - AppImage/DEB package

### 🔧 Developer Experience

#### New Commands
```bash
npm run dev          # Start Tauri dev app
npm run build        # Build for current platform
npm run build:mac    # Build macOS ARM64
npm run build:win    # Build Windows x64
npm run build:linux  # Build Linux x64
```

#### Requirements
- Node.js (LTS)
- Rust toolchain (installed via Homebrew or rustup)

### 📝 Configuration Changes

- **Bundle ID**: Changed from `com.ai-uml-builder.app` to `com.aiumlbuilder.desktop`
- **Build system**: Vite → Tauri build pipeline
- **Icons**: Moved to `src-tauri/icons/`

### 🐛 Bug Fixes

- Fixed recursive build command issue
- Fixed bundle identifier warning on macOS
- Improved .gitignore for Tauri artifacts

### 📚 Documentation

- Updated README.md with Tauri information
- Added BUILD.md with detailed build instructions
- Added GitHub Actions workflow for CI/CD

## 🎁 What's Next

- [ ] Dark/light theme toggle
- [ ] More diagram templates
- [ ] Diagram versioning
- [ ] Additional language support

## 📥 Download

Get the latest release for your platform:
- 🍎 [macOS ARM64 (4.9 MB)](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
- 🪟 [Windows x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
- 🐧 [Linux x64](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)

## 🔧 Fixes in v0.0.6

- Fixed GitHub Actions permissions for automatic release creation
- Added `permissions: contents: write` to workflow

## 🙏 Acknowledgments

Special thanks to the Tauri team for creating such an amazing framework!

---

**Full Changelog**: https://github.com/dmitriyg0r/ai-uml-builder/compare/v0.0.4-alpha...v0.0.6
