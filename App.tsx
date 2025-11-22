import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateMermaidCode } from './services/geminiService';
import MermaidRenderer from './components/MermaidRenderer';
import { Editor } from './components/Editor';
import { LoadingSpinner } from './components/LoadingSpinner';

// Icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 3v13.5M7.5 12l4.5 4.5 4.5-4.5" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 animate-spin">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // `currentCode` is the raw text in the editor
  const [currentCode, setCurrentCode] = useState<string>('');
  // `renderedCode` is what gets passed to Mermaid (debounced)
  const [renderedCode, setRenderedCode] = useState<string>('');
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce Logic: Update renderedCode only when user stops typing for 1s
  useEffect(() => {
    if (currentCode === renderedCode) {
        setIsDebouncing(false);
        return;
    }

    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setRenderedCode(currentCode);
      setIsDebouncing(false);
    }, 1000); // 1 second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [currentCode, renderedCode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: prompt
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      // Pass currentCode to enable iterative updates
      // Use renderedCode here to ensure we send valid/stable code context if user was typing
      const mermaidCode = await generateMermaidCode(userMessage.text, renderedCode || currentCode);
      
      // Update both immediately to bypass debounce when AI generates
      setCurrentCode(mermaidCode);
      setRenderedCode(mermaidCode);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: renderedCode ? 'Диаграмма обновлена.' : 'Диаграмма создана.'
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error(err);
      setError('Не удалось сгенерировать диаграмму.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Извините, произошла ошибка при генерации.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  const handleDownloadSvg = useCallback(() => {
    const svgElement = document.querySelector('#diagram-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, []);

  const handleDownloadPng = useCallback(() => {
    const svgElement = document.querySelector('#diagram-container svg');
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('width', rect.width.toString());
    svgClone.setAttribute('height', rect.height.toString());
    
    const svgData = new XMLSerializer().serializeToString(svgClone);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 2; 
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `diagram-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      setShowExportMenu(false);
    };

    img.onerror = () => {
      setError('Ошибка при экспорте в PNG. Попробуйте SVG.');
      setShowExportMenu(false);
    };

    img.src = url;
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 overflow-hidden">
      {/* Sidebar / Chat Area */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col border-r border-slate-200 bg-white z-10 shadow-lg h-full">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI UML Builder
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gemini 2.5 • Iterative Mode</p>
        </div>

        {/* Chat History */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="text-center mt-10 text-slate-400 text-sm px-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon />
              </div>
              <p>Опишите желаемую диаграмму, чтобы начать.</p>
              <p className="mt-2 text-xs">Например: "Схема регистрации пользователя"</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {msg.role === 'user' ? <UserIcon /> : <SparklesIcon />}
                </div>
                <div className={`p-3 rounded-lg text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-none' 
                    : 'bg-blue-50 border border-blue-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex max-w-[85%] items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                  <SparklesIcon />
                </div>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg rounded-tl-none shadow-sm">
                   <LoadingSpinner />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Editor (Collapsed/Mini) */}
        <div className="h-64 border-t border-b border-slate-200 shrink-0 flex flex-col">
           {/* Pass currentCode to Editor, updating it instantly triggers useEffect debounce */}
           <Editor value={currentCode} onChange={setCurrentCode} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white shrink-0">
          <div className="relative">
            <textarea
              id="prompt"
              className="w-full p-3 pr-12 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm text-sm leading-relaxed min-h-[80px]"
              placeholder={currentCode ? "Добавьте кэширование..." : "Опишите диаграмму..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={`
                absolute bottom-3 right-3 p-2 rounded-lg text-white transition-all transform active:scale-90
                ${isLoading || !prompt.trim() 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                }
              `}
              title="Отправить (Ctrl + Enter)"
            >
              <SendIcon />
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">
            Используйте <kbd className="font-sans bg-slate-100 px-1 rounded border border-slate-200">Ctrl + Enter</kbd> для отправки
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-slate-50 relative flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Холст</span>
            {isDebouncing && (
                 <div className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
                     <RefreshIcon />
                     <span>Синхронизация...</span>
                 </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 relative" ref={exportMenuRef}>
             <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={!renderedCode}
                className="px-3 py-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                title="Экспорт диаграммы"
             >
               <DownloadIcon />
               <span className="text-sm font-medium">Экспорт</span>
             </button>

             {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <button 
                        onClick={handleDownloadSvg} 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 group"
                    >
                        <div className="w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] font-mono text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-200">SVG</div>
                        <span>Векторный</span>
                    </button>
                    <button 
                        onClick={handleDownloadPng} 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 group"
                    >
                        <div className="w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] font-mono text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-200">PNG</div>
                        <span>Изображение</span>
                    </button>
                </div>
             )}
          </div>
        </div>

        {/* Diagram Container */}
        <div className="flex-1 overflow-hidden p-0 flex items-center justify-center relative" id="diagram-container">
           {/* Background Grid Pattern */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
                style={{
                  backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
                  backgroundSize: '24px 24px'
                }}
           ></div>
           
           <div className="w-full h-full relative z-10">
             {/* Pass renderedCode (debounced) to renderer */}
             <MermaidRenderer 
                code={renderedCode} 
                onError={(err) => setError(err)}
             />
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;