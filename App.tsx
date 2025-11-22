import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { generateMermaidCode } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useDiagramExport } from './hooks/useDiagramExport';

const MermaidRenderer = React.lazy(() => import('./components/MermaidRenderer'));
const Editor = React.lazy(() => import('./components/Editor').then(module => ({ default: module.Editor })));

// Icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <rect x="6" y="6" width="12" height="12" rx="2" />
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

const CollapseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75A2.25 2.25 0 0 1 11.25 15H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5h-6.75A2.25 2.25 0 0 0 9 6.75v6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25H5.25A2.25 2.25 0 0 0 3 10.5v6.75A2.25 2.25 0 0 0 5.25 19.5H12a2.25 2.25 0 0 0 2.25-2.25v-1.5" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75v6.75M14.25 9.75v6.75M6 6.75h12m-10.5 0V5.25A1.5 1.5 0 0 1 9 3.75h6a1.5 1.5 0 0 1 1.5 1.5v1.5m-9 0h9m-1.5 0v11.25A1.5 1.5 0 0 1 14.25 21h-4.5A1.5 1.5 0 0 1 8.25 18V6.75" />
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6 3.75 12l6 6M14.25 6l6 6-6 6" />
  </svg>
);

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

type SidebarTab = 'chat' | 'code';

const QUICK_PROMPTS: { label: string; text: string }[] = [
  { label: 'Регистрация', text: 'Диаграмма последовательности регистрации пользователя с подтверждением email и отправкой SMS-кода' },
  { label: 'Платеж', text: 'Поток оплаты: выбор товара, выставление счета, оплата картой, webhooks банка, обновление статуса заказа' },
  { label: 'Микросервисы', text: 'Диаграмма контейнеров: API Gateway, Auth, Billing, Catalog, Notification сервисы и PostgreSQL, Redis, Kafka' },
  { label: 'Инцидент', text: 'Блок-схема реагирования на инцидент: обнаружение, triage, уведомление on-call, фиксация RCA' },
];

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('chat');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [currentCode, setCurrentCode] = useLocalStorageState<string>('uml:code', '');
  const { debouncedValue: renderedCode, isDebouncing, flush } = useDebouncedValue(currentCode, 800);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [messages, setMessages] = useLocalStorageState<ChatMessage[]>('uml:messages', []);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const abortControllerRef = useRef<AbortController | null>(null);
  const exportTriggerRef = useRef<HTMLDivElement>(null);
  const exportMenuPortalRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const [exportMenuPos, setExportMenuPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 192,
  });

  const { exportDiagram, isExporting } = useDiagramExport({ setError });

  const hasDiagram = Boolean(renderedCode.trim());
  const hasHistory = messages.length > 0;
  const canReset = Boolean(currentCode || prompt || hasHistory);
  
  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Close export menu when clicking outside
  useEffect(() => {
    if (!showExportMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = exportTriggerRef.current?.contains(target);
      const insideMenu = exportMenuPortalRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showExportMenu]);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    const isUpdate = Boolean(renderedCode.trim() || currentCode.trim());

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    // Create new AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const mermaidCode = await generateMermaidCode(trimmed, renderedCode || currentCode, controller.signal);
      setCurrentCode(mermaidCode);
      flush(mermaidCode);

      const aiMessage: ChatMessage = {
        id: createId(),
        role: 'ai',
        text: isUpdate ? 'Диаграмма обновлена.' : 'Диаграмма создана.',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted');
        return;
      }
      const message = err instanceof Error ? err.message : 'Не удалось сгенерировать диаграмму.';
      console.error(err);
      setError(message);

      const errorMessage: ChatMessage = {
        id: createId(),
        role: 'ai',
        text: 'Извините, произошла ошибка при генерации.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [prompt, isLoading, renderedCode, currentCode, setCurrentCode, flush]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const toggleExportMenu = useCallback(() => {
    if (!hasDiagram) return;
    if (!showExportMenu) {
      const rect = exportButtonRef.current?.getBoundingClientRect();
      const menuWidth = 192;
      const gap = 8;
      setExportMenuPos({
        top: (rect?.bottom || 0) + gap,
        left: (rect ? rect.right - menuWidth : 0),
        width: menuWidth,
      });
    }
    setShowExportMenu((prev) => !prev);
  }, [hasDiagram, showExportMenu]);

  const handleCopyCode = useCallback(async () => {
    const codeToCopy = renderedCode || currentCode;
    if (!codeToCopy.trim()) return;

    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    } catch (err) {
      console.error(err);
      setError('Не удалось скопировать код.');
    }
  }, [renderedCode, currentCode]);

  const confirmReset = useCallback(() => {
    setCurrentCode('');
    flush('');
    setMessages([]);
    setPrompt('');
    setError(null);
    setShowExportMenu(false);
    setCopyState('idle');
    setIsResetModalOpen(false);
  }, [flush, setCurrentCode, setMessages]);

  const handleResetClick = () => {
    if (canReset) {
      setIsResetModalOpen(true);
    }
  };

  const handleCodeChange = useCallback(
    (value: string) => {
      setCurrentCode(value);
      setError(null);
    },
    [setCurrentCode]
  );

  const handleQuickPrompt = useCallback((text: string) => {
    setPrompt(text);
    setActiveSidebarTab('chat');
    requestAnimationFrame(() => {
      promptInputRef.current?.focus();
    });
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 relative overflow-hidden">
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Сбросить всё?"
        message="Это действие удалит текущую диаграмму и историю чата. Отменить это действие нельзя."
        onConfirm={confirmReset}
        onCancel={() => setIsResetModalOpen(false)}
        confirmLabel="Сбросить"
        isDestructive
      />

      {/* Sidebar / Chat Area */}
      <div
        className={`${
          isSidebarOpen ? 'flex' : 'hidden'
        } absolute md:static inset-y-0 left-0 w-full md:w-[340px] lg:w-[380px] flex-col border-r border-slate-200 bg-white shadow-lg h-full z-20 transform transition-transform duration-300`}
      >

        {/* Header */}
        <div className="p-4 border-b border-slate-100 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI UML Builder
              </h1>
              <p className="text-slate-500 text-xs mt-1">Gemini 2.5 • Iterative Mode</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-colors bg-white shadow-sm"
              title="Скрыть панель"
            >
              <CollapseIcon />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveSidebarTab('chat')}
              className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                activeSidebarTab === 'chat'
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <SparklesIcon />
                <span>Чат</span>
              </span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('code')}
              className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                activeSidebarTab === 'code'
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <CodeIcon />
                <span>Код</span>
              </span>
            </button>
          </div>
        </div>

        {/* Tabs content */}
        <div className="flex-1 flex flex-col">
          {activeSidebarTab === 'chat' && (
            <>
              {/* Chat History */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.length === 0 && (
                  <div className="text-center mt-10 text-slate-400 text-sm px-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <SparklesIcon />
                    </div>
                    <p>Выберите быструю подсказку выше или опишите задачу.</p>
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

              {/* Input Area */}
              <div className="p-4 bg-white shrink-0 border-t border-slate-200 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleQuickPrompt(item.text)}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-full bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-colors shadow-sm"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    ref={promptInputRef}
                    id="prompt"
                    className="w-full p-3 pr-12 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm text-sm leading-relaxed min-h-[90px]"
                    placeholder={currentCode ? 'Попросите улучшить диаграмму или добавить детали...' : 'Опишите диаграмму...'}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {isLoading ? (
                    <button
                      onClick={handleStop}
                      className="absolute bottom-3 right-3 p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all transform active:scale-90"
                      title="Остановить генерацию"
                      aria-label="Остановить генерацию"
                    >
                      <StopIcon />
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                      className={`
                        absolute bottom-3 right-3 p-2 rounded-lg text-white transition-all transform active:scale-90
                        ${!prompt.trim() 
                          ? 'bg-slate-300 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                        }
                      `}
                      title="Отправить (Ctrl + Enter)"
                      aria-label="Отправить сообщение"
                    >
                      <SendIcon />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    <kbd className="font-sans bg-slate-100 px-1 rounded border border-slate-200">Ctrl + Enter</kbd> для отправки
                  </span>
                  {isLoading && (
                    <span className="flex items-center gap-1 text-blue-500">
                      <RefreshIcon />
                      <span>Ждём ответ...</span>
                    </span>
                  )}
                </div>
                {error && (
                  <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                    {error}
                  </div>
                )}
              </div>
            </>
          )}

          {activeSidebarTab === 'code' && (
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <div className="h-full border-t border-slate-200 flex flex-col min-h-0 min-w-0">
                 <div className="flex-1 min-h-0 min-w-0">
                   <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
                     <Editor value={currentCode} onChange={handleCodeChange} />
                   </Suspense>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-slate-50 relative flex flex-col h-full overflow-visible">
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-200 bg-white/60 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10 overflow-visible">
          <div className="flex items-center space-x-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
                title="Показать панель"
              >
                Открыть панель
              </button>
            )}
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Холст</span>
            {isDebouncing && (
                 <div className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
                     <RefreshIcon />
                     <span>Синхронизация...</span>
                 </div>
            )}
            {!isDebouncing && hasDiagram && (
              <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                Автообновление
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 relative" ref={exportTriggerRef}>
            <button
              onClick={handleCopyCode}
              disabled={!hasDiagram}
              className="px-3 py-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Скопировать Mermaid код"
            >
              <CopyIcon />
              <span className="text-sm font-medium">
                {copyState === 'copied' ? 'Скопировано' : 'Скопировать'}
              </span>
            </button>

            <div className="flex items-center space-x-2 relative">
              <button 
                ref={exportButtonRef}
                onClick={toggleExportMenu}
                disabled={!hasDiagram}
                className="px-3 py-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                title="Экспорт диаграммы"
              >
                <DownloadIcon />
                <span className="text-sm font-medium">Экспорт</span>
              </button>

              {showExportMenu &&
                createPortal(
                  <div
                    ref={exportMenuPortalRef}
                    className="fixed bg-white rounded-lg shadow-xl border border-slate-100 z-[9999] py-1"
                    style={{
                      top: `${exportMenuPos.top}px`,
                      left: `${exportMenuPos.left}px`,
                      width: `${exportMenuPos.width}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                        onClick={() => exportDiagram('svg')} 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 group"
                    >
                        <div className="w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] font-mono text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-200">SVG</div>
                        <span>Векторный</span>
                    </button>
                    <button 
                        onClick={() => exportDiagram('png')} 
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 group"
                    >
                        <div className="w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] font-mono text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-200">PNG</div>
                        <span>Изображение</span>
                    </button>
                  </div>,
                  document.body
                )
              }
            </div>

            <button
              onClick={handleResetClick}
              disabled={!canReset}
              className="px-3 py-2 text-slate-600 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Сбросить диаграмму и историю"
              aria-label="Сбросить диаграмму и историю"
            >
              <TrashIcon />
              <span className="text-sm font-medium">Сброс</span>
            </button>
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
             <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
               <MermaidRenderer 
                  code={renderedCode} 
                  onError={(err) => setError(err)}
               />
             </Suspense>
           </div>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;
