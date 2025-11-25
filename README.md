# 🎨 AI UML Builder

<div align="center">
  <img src="logoname.png" alt="Dream AI Logo" width="600"/>
</div>

> Transform your ideas into professional UML diagrams using the power of AI

AI UML Builder is a modern React application that converts natural language descriptions into beautiful UML diagrams. Simply describe your system architecture, class structure, or workflow in plain text, and watch as AI generates precise Mermaid diagrams for you.

![Demo](demo.gif)

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Latest-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)



## ✨ Features

- 🤖 **AI-Powered Generation** - Leverages DeepSeek AI through Polza API to understand your descriptions
- 📊 **Multiple Diagram Types** - Supports class diagrams, sequence diagrams, flowcharts, and more
- 🎯 **Instant Visualization** - Real-time rendering with Mermaid.js
- ✏️ **Live Editor** - Edit generated Mermaid code directly in the browser
- 💾 **Auto-Save** - Your work is automatically saved to localStorage
- 🇷🇺 **GOST Standards** - Follows GOST R 52573-2006 for Russian language prompts
- 🌓 **Modern UI** - Clean, responsive interface built with Tailwind CSS
- 🔄 **Iterative Updates** - Refine your diagrams by describing changes

## 🚀 Getting Started

### 💻 Desktop App (Recommended)

**Download the latest release for your platform:**

👉 **[Download from Releases](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)**

- **Windows**: `AI UML Builder.exe` (x64)
- **macOS**: 
  - Apple Silicon (M1/M2/M3): `mac-arm64`
  - Intel: `mac`
- **Linux**: `linux` (x64)

> 💡 The desktop app comes with the API key pre-configured, so you can start using it immediately!

### 🛠️ Development Setup

If you want to run from source or contribute:

<details>
<summary>Click to expand development instructions</summary>

#### Prerequisites

- Node.js (LTS version recommended)

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dmitriyg0r/ai-uml-builder.git
   cd ai-uml-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your Polza API Key**
   
   Register on Polza.ai to get your API key:
   
   👉 **[Register on Polza.ai](https://polza.ai?referral=mJw7p6k3Jg)** (with bonus credits)
   
   Steps:
   - Create an account
   - Top up your balance
   - Get your API key from the dashboard

4. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_POLZA_API_KEY=your_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

</details>

## 📖 Usage

1. **Enter a Description**: Type your system description in natural language
   ```
   Create a class diagram for an e-commerce system with User, Product, Order, and Payment classes
   ```

2. **Generate**: Click the generate button and watch AI create your diagram

3. **Edit & Refine**: Use the built-in editor to make manual adjustments or ask AI to update the diagram

4. **Export**: Copy the Mermaid code or take a screenshot of your diagram

## 🏗️ Architecture

```
ai-uml-builder/
├── src/
│   ├── components/        # React components
│   │   ├── MermaidRenderer.tsx
│   │   ├── Editor.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── services/          # API integrations
│   │   └── aisetService.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useLocalStorageState.ts
│   └── App.tsx           # Main application
└── dist/                 # Production build
```

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Desktop**: Electron
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Diagrams**: Mermaid.js
- **AI**: DeepSeek (via Polza API)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build web + Electron for all platforms |
| `npm run build:mac` | Build for macOS (ARM64 + Intel) |
| `npm run build:win` | Build for Windows (x64) |
| `npm run build:linux` | Build for Linux (x64) |
| `npm run build:all` | Build for all platforms |
| `npm run preview` | Preview production build |

## 🤝 Support the Project

If you find this project helpful, please consider supporting its development!

### ☕ Buy me a coffee

Every contribution helps me dedicate more time to improving this tool and creating new features.

**[💝 Support via DonationAlerts](https://www.donationalerts.com/r/dmitriygor)**

Your support means the world to me and keeps this project alive and growing! 🙏

## 🎯 Roadmap

- [ ] Support for more diagram types
- [ ] Export to PNG/SVG
- [ ] Collaborative editing
- [ ] Custom theme support
- [ ] Integration with popular design tools

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙌 Acknowledgments

- Built with [Mermaid.js](https://mermaid.js.org/)
- API provided by [Polza AI](https://polza.ai/)

---

<div align="center">

**Made with ❤️ by DreamSoftware**

If this project helped you, [consider buying me a coffee](https://www.donationalerts.com/r/dmitriygor) ☕

</div>
