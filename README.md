# 🎨 AI UML Builder

<div align="center">
  <img src="logoname.png" alt="AI UML Builder Logo" width="600"/>
  
  <p align="center">
    <strong>Transform your ideas into professional diagrams with AI</strong>
  </p>
  
  <p align="center">
    <a href="#-key-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-demo">Demo</a> •
    <a href="#-documentation">Docs</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  ![React](https://img.shields.io/badge/React-19-blue?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
  ![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron)
  ![License](https://img.shields.io/badge/License-Proprietary-red)
  [![GitHub stars](https://img.shields.io/github/stars/dmitriyg0r/ai-uml-builder?style=social)](https://github.com/dmitriyg0r/ai-uml-builder/stargazers)

</div>

---

## 💡 What is AI UML Builder?

AI UML Builder is a **powerful desktop application** that converts natural language descriptions into beautiful, professional diagrams. No more struggling with complex diagramming tools—just describe what you need in plain English (or Russian!), and let AI do the heavy lifting.

**Perfect for:**
- 👨‍💻 Software developers documenting architecture
- 📚 Students learning UML and system design
- 🏢 Technical writers creating documentation
- 👥 Teams collaborating on system design

![Demo](demo.gif)

### 🆕 Latest Updates

**v0.0.4** - Multi-Language Support
- 🌍 Full interface localization (English & Russian)
- 🤖 AI-generated chat titles from your first prompt
- 🔄 Automatic chat name translation when switching languages
- 🎯 Smart language detection based on browser settings
- 📝 Improved user experience for international users



## 🎯 Key Features

### 🤖 AI-Powered Intelligence
- **Natural Language Processing** - Describe your diagram in plain English or Russian
- **Context-Aware Generation** - AI understands complex system architectures
- **Iterative Refinement** - Ask for changes and improvements naturally
- **Smart Formatting** - Auto-formats code for readability
- **Auto-Generated Titles** - AI creates meaningful chat names from your first prompt

### 📊 Comprehensive Diagram Support
- **Class Diagrams** - Model object-oriented systems
- **Sequence Diagrams** - Visualize interactions and workflows
- **Flowcharts** - Map out processes and decision trees
- **ER Diagrams** - Design database schemas
- **State Diagrams** - Model system states and transitions
- **And many more!** - Full Mermaid.js support

### 💻 Desktop-First Experience
- **Cross-Platform** - Works on Windows, macOS (Intel & Apple Silicon), and Linux
- **Offline Editing** - Edit diagrams without internet (generation requires API)
- **Native Performance** - Built with Electron for smooth experience
- **User Authentication** - Save and sync your diagrams with Supabase
- **Multi-Language Interface** - Full support for English and Russian (auto-detected)

### 🎨 Professional Editing Tools
- **Syntax Highlighting** - Color-coded Mermaid editor
- **Live Preview** - See changes instantly with debounced rendering
- **Manual Control** - Run button for precise control over updates
- **Zoom & Pan** - Navigate large diagrams easily
- **Export Options** - Save as SVG or PNG

### 🔐 Privacy & Security
- **Guest Mode** - Try without registration (3 AI requests)
- **Secure Auth** - Optional Supabase authentication
- **Local Storage** - Your data stays on your device in guest mode
- **API Key Safety** - Environment variables for sensitive data
- **Data Migration** - Seamless migration from guest to authenticated mode

## 🚀 Quick Start

### 📥 Download (Recommended)

**Get the latest release for your platform:**

<div align="center">

[![Download for macOS](https://img.shields.io/badge/Download-macOS-black?style=for-the-badge&logo=apple)](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
[![Download for Windows](https://img.shields.io/badge/Download-Windows-blue?style=for-the-badge&logo=windows)](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)
[![Download for Linux](https://img.shields.io/badge/Download-Linux-orange?style=for-the-badge&logo=linux)](https://github.com/dmitriyg0r/ai-uml-builder/releases/latest)

</div>

**Platform-specific builds:**
- 🍎 **macOS**: Apple Silicon (`mac-arm64`) and Intel (`mac`)
- 🪟 **Windows**: x64 installer
- 🐧 **Linux**: x64 AppImage/deb

> 💡 **No setup required!** The desktop app comes ready to use immediately.

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

## 📖 How to Use

### Basic Workflow

1. **🌍 Choose Your Language**
   - Interface automatically detects your browser language
   - Manually switch between English and Russian in Settings
   - Chat names update automatically when changing language

2. **💬 Describe Your Diagram**
   ```text
   Create a class diagram for an e-commerce system with User, Product, 
   Order, and Payment classes. Users can place orders containing products.
   ```
   Or in Russian:
   ```text
   Создай диаграмму классов для системы электронной коммерции с классами 
   Пользователь, Товар, Заказ и Платёж
   ```

3. **✨ Generate with AI**
   - Click the send button (or press Ctrl+Enter)
   - Watch as AI creates your diagram
   - AI automatically generates a meaningful chat title
   - Guest users get 3 free AI requests

4. **✏️ Edit the Code**
   - Switch to the "Code" tab
   - Make manual adjustments to the Mermaid code
   - Click the green "Run" button to update the diagram

5. **🎨 Refine with AI**
   ```text
   Add a shopping cart class that connects users and products
   ```

6. **💾 Export Your Work**
   - **SVG**: Vector format for documentation
   - **PNG**: Raster image for presentations
   - **Copy Code**: Use in other Mermaid tools

### 🌍 Language Support

The interface automatically detects your browser language and supports:
- 🇬🇧 **English** - Full interface translation
- 🇷🇺 **Russian** - Полный перевод интерфейса

**Features:**
- Auto-detection based on browser settings
- Manual language switching in Settings menu
- Chat names automatically update when changing language
- Seamless experience in both languages

### Example Prompts

<details>
<summary>📝 Class Diagrams</summary>

**English:**
```text
Create a class diagram for a library management system with 
Book, Member, Loan, and Librarian classes
```

**Russian:**
```text
Создай диаграмму классов для системы управления библиотекой 
с классами Книга, Читатель, Выдача и Библиотекарь
```
</details>

<details>
<summary>🔄 Sequence Diagrams</summary>

**English:**
```text
Sequence diagram for user authentication: user enters credentials,
system validates, checks database, returns token
```

**Russian:**
```text
Диаграмма последовательности для аутентификации: пользователь вводит данные,
система проверяет, обращается к базе данных, возвращает токен
```
</details>

<details>
<summary>📊 Flowcharts</summary>

**English:**
```text
Flowchart for order processing: receive order, check inventory,
if available then process payment and ship, else notify customer
```

**Russian:**
```text
Блок-схема обработки заказа: получить заказ, проверить наличие,
если есть - обработать платёж и отправить, иначе уведомить клиента
```
</details>

## 🏗️ Project Structure

```
ai-uml-builder/
├── components/           # React components
│   ├── Auth/            # Authentication UI
│   ├── Editor.tsx       # Code editor with syntax highlighting
│   ├── MermaidRenderer.tsx  # Diagram rendering
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx     # Authentication state
│   ├── useChats.ts     # Chat/diagram management
│   └── useDebouncedValue.ts
├── services/            # External integrations
│   ├── aisetService.ts # Polza AI API
│   └── supabaseClient.ts # Database connection
├── electron/            # Electron main process
├── i18n.ts             # Internationalization (i18n) configuration
└── types.ts            # TypeScript definitions
```

## 🛠️ Tech Stack

### Core Technologies
- ⚛️ **React 19** - Modern UI framework with hooks
- 📘 **TypeScript** - Type-safe development
- ⚡ **Vite** - Lightning-fast build tool
- 🖥️ **Electron** - Cross-platform desktop app

### Key Libraries
- 🎨 **Tailwind CSS** - Utility-first styling
- 📊 **Mermaid.js** - Diagram rendering engine
- 🎯 **Prism.js** - Syntax highlighting
- 🔍 **react-zoom-pan-pinch** - Diagram navigation
- 🌍 **react-i18next** - Internationalization framework

### Backend Services
- 🤖 **Polza AI** - DeepSeek AI integration
- 🗄️ **Supabase** - Authentication and database
- 🔐 **Row Level Security** - Data protection

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

## 🤝 Contributing

We welcome contributions from the community! Whether it's:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🔧 Code contributions

**Get started:**
1. Read our [Contributing Guide](CONTRIBUTING.md)
2. Check out [open issues](https://github.com/dmitriyg0r/ai-uml-builder/issues)
3. Join [Discussions](https://github.com/dmitriyg0r/ai-uml-builder/discussions)

### 🌟 Show Your Support

If you find AI UML Builder helpful:

- ⭐ **Star this repository** - It helps others discover the project!
- 🐦 **Share on social media** - Spread the word
- ☕ **[Buy me a coffee](https://www.donationalerts.com/r/dmitriygor)** - Support development
- 📝 **Write a blog post** - Share your experience

Every star, share, and contribution helps make this project better! 🙏

## 🗺️ Roadmap

### ✅ Completed
- [x] AI-powered diagram generation
- [x] Multi-chat support with history
- [x] User authentication (Supabase)
- [x] Export to PNG/SVG
- [x] Syntax-highlighted code editor
- [x] Guest mode (3 free requests)
- [x] Auto-scaling diagrams
- [x] Desktop apps (Win/Mac/Linux)
- [x] Multi-language interface (EN/RU)
- [x] Auto-generated chat titles
- [x] Language-aware chat names

### 🚧 In Progress
- [ ] Dark/light theme toggle
- [ ] More diagram templates
- [ ] Diagram versioning
- [ ] Additional language support

### 💭 Planned
- [ ] Collaborative real-time editing
- [ ] Custom AI model selection
- [ ] Integration with GitHub/GitLab
- [ ] Plugin system for extensions
- [ ] Mobile companion app
- [ ] Cloud diagram storage
- [ ] Team workspaces

**Have ideas?** Open a [feature request](https://github.com/dmitriyg0r/ai-uml-builder/issues/new?template=feature_request.md)!

## 📝 License

This project is licensed under a **Proprietary License**.

**You may:**
- ✅ Use for personal, non-commercial purposes
- ✅ View and study the source code
- ✅ Modify for personal use
- ✅ Contribute via pull requests

**You may NOT:**
- ❌ Distribute the software or modified versions
- ❌ Use for commercial purposes without permission
- ❌ Sell or redistribute binaries

For commercial licensing, please contact **dmitriyg0r@yandex.ru**

See the [LICENSE](LICENSE) file for full details.

## 🙌 Acknowledgments

- Built with [Mermaid.js](https://mermaid.js.org/)
- API provided by [Polza AI](https://polza.ai/)

---

<div align="center">

**Made with ❤️ by DreamSoftware**

If this project helped you, [consider buying me a coffee](https://www.donationalerts.com/r/dmitriygor) ☕

</div>
