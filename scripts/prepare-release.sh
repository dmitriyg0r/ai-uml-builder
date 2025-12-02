#!/bin/bash

# AI UML Builder - Release Preparation Script
# Usage: ./scripts/prepare-release.sh v0.0.4-alpha

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: Version number required"
    echo "Usage: ./scripts/prepare-release.sh v0.0.4-alpha"
    exit 1
fi

echo "🚀 Preparing release $VERSION"
echo ""

# Check if we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on main branch (current: $BRANCH)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    git status -s
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Building application for all platforms..."
echo ""

# Build for all platforms
npm run build:all

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Build artifacts location: ./release/"
echo ""

# List build artifacts
echo "📦 Generated files:"
ls -lh release/ | grep -E '\.(dmg|exe|AppImage|deb)$' || echo "No build artifacts found"

echo ""
echo "📝 Next steps:"
echo ""
echo "1. Test the builds on each platform"
echo "2. Create GitHub release:"
echo "   gh release create $VERSION \\"
echo "     --title \"$VERSION - Multi-Language Support 🌍\" \\"
echo "     --notes-file RELEASE_NOTES_$VERSION.md \\"
echo "     --prerelease \\"
echo "     release/*"
echo ""
echo "3. Or use GitHub web interface:"
echo "   https://github.com/dmitriyg0r/ai-uml-builder/releases/new"
echo ""
echo "✨ Release preparation complete!"
