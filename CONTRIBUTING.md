# Contributing to AI UML Builder

Thank you for your interest in contributing to AI UML Builder! We welcome all contributions.

## How to Contribute

### Report an Issue

If you found a bug or have a feature request:

1. Check if a similar issue already exists in [Issues](../../issues)
2. If not, create a new issue using the appropriate template
3. Provide detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - App version and OS

### Submit Changes

1. **Fork** the repository
2. Create a **branch** for your changes:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes and **commit**:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a **Pull Request**

## Code Requirements

### Code Style

- Use TypeScript for all new files
- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic

### Component Structure

```typescript
// Use functional components with hooks
import React, { useState, useCallback } from 'react';

interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ value, onChange }) => {
  // ... component logic
};
```

### Commits

Use clear commit messages:

- `feat: add new feature`
- `fix: fix bug`
- `docs: update documentation`
- `style: code formatting`
- `refactor: code refactoring`
- `test: add tests`
- `chore: update dependencies`

## Development Setup

### Requirements

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-uml-builder.git
   cd ai-uml-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   VITE_POLZA_API_KEY=your_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. Run dev server:
   ```bash
   npm run dev
   ```

### Build

```bash
# Build for all platforms
npm run build

# Web version only
npm run build:web
```

## Testing

Before submitting a Pull Request:

1. Make sure the app builds without errors
2. Test main functionality:
   - Diagram generation
   - Code editing
   - Export to SVG/PNG
   - Authentication (if modified)

## Development Priorities

### Welcome

- UI/UX improvements
- Bug fixes
- Performance optimization
- Adding new Mermaid diagram types
- Documentation improvements
- Localization (translation to other languages)

### Require Discussion

- Significant architecture changes
- Adding new dependencies
- API changes
- Major new features

For such changes, please create an Issue for discussion first.

## Questions?

If you have questions, create a [Discussion](../../discussions) or write in an Issue.

Thank you for your contribution! 🎉
