# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

# AI UML Builder

A React application that generates UML diagrams from natural language descriptions using AI (DeepSeek via Polza API) and renders them with Mermaid.js.

## Development

### Prerequisite
- Node.js (LTS recommended)
- API Key for Polza AI set as `VITE_POLZA_API_KEY` or `POLZA_API_KEY` in `.env`.

### Common Commands

- **Install Dependencies**:
  ```bash
  npm install
  ```

- **Start Development Server**:
  ```bash
  npm run dev
  ```
  Starts the local server at `http://localhost:3000`.

- **Build for Production**:
  ```bash
  npm run build
  ```
  Outputs static files to `dist/`.

- **Preview Production Build**:
  ```bash
  npm run preview
  ```

## Architecture

### Tech Stack
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (inferred from `index.css` usage pattern and class names like `bg-slate-100`)
- **Diagrams**: Mermaid.js
- **AI Integration**: Polza AI (DeepSeek model)

### Key Components

- **`App.tsx`**: The main application controller. Manages global state (prompt, code, messages), handles AI generation requests, and orchestrates the UI layout (Sidebar, Toolbar, Canvas).
- **`services/aisetService.ts`**: Handles interactions with the AI API.
  - Contains the `SYSTEM_INSTRUCTION` which defines the persona (Software Architect) and strict rules for Mermaid syntax generation.
  - Enforces GOST R 52573-2006 standards for Russian language prompts.
  - Uses the Polza API (`api.polza.ai`) with the `deepseek/deepseek-chat` model.
- **`components/MermaidRenderer.tsx`**: Responsible for rendering the Mermaid code string into a visual diagram.
- **`components/Editor.tsx`**: Provides a code editor interface for viewing and manually editing the generated Mermaid code.
- **`hooks/useLocalStorageState.ts`**: Custom hook for persisting state (like chat history and current diagram code) to `localStorage`.

### Data Flow
1.  User enters a prompt in the Sidebar.
2.  `App.tsx` calls `generateMermaidCode` from `aisetService.ts`.
3.  The service constructs a prompt (including existing code if updating) and calls the AI API.
4.  The returned Mermaid code is cleaned and returned to `App.tsx`.
5.  `App.tsx` updates the state, which triggers `MermaidRenderer` to draw the diagram.
6.  State is automatically saved to `localStorage`.

### Directory Structure
- `components/`: React UI components.
- `hooks/`: Custom React hooks.
- `services/`: API integration and business logic.
- `dist/`: Production build output.
