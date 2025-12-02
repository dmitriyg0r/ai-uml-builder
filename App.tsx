import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { generateMermaidCode, generateChatTitle, fixMermaidCode } from './services/aisetService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useDiagramExport } from './hooks/useDiagramExport';
import { useChats } from './hooks/useChats';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/Auth/AuthModal';
import { ChatMessage } from './types';

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

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5c0-.414.336-.75.75-.75a7.5 7.5 0 0 1 7.5 7.5c0 .414-.336.75-.75.75h-.676a1.5 1.5 0 0 0-1.454 1.106l-.18.65a1.5 1.5 0 0 0 .327 1.376l.478.525a.75.75 0 0 1-.038 1.057l-1.286 1.143a.75.75 0 0 1-1.06-.02l-.48-.514a1.5 1.5 0 0 0-1.364-.422l-.662.15a1.5 1.5 0 0 0-1.124 1.27l-.078.67a.75.75 0 0 1-.744.664H9.75a7.5 7.5 0 0 1-7.5-7.5c0-.414.336-.75.75-.75h.676a1.5 1.5 0 0 0 1.454-1.106l.18-.65a1.5 1.5 0 0 0-.327-1.376l-.478-.525a.75.75 0 0 1 .038-1.057l1.286-1.143a.75.75 0 0 1 1.06.02l.48.514a1.5 1.5 0 0 0 1.364.422l.662-.15a1.5 1.5 0 0 0 1.124-1.27l.078-.67a.75.75 0 0 1 .744-.664H12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
);


type SidebarTab = 'chat' | 'code';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36);

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    chats,
    activeChat,
    loading: chatsLoading,
    createChat,
    switchChat,
    deleteChat,
    renameChat,
    updateChatMessages,
    updateChatCode,
    clearCurrentChat,
    updateDefaultChatNames,
  } = useChats();

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('chat');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isChatsDropdownOpen, setIsChatsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const guestRequestLimit = 3;
  const [guestRequestCount, setGuestRequestCount] = useState(() => {
    const stored = localStorage.getItem('guest:ai-requests');
    return stored ? parseInt(stored, 10) || 0 : 0;
  });

  const { user, signOut } = useAuth();

  // Memoize setError to prevent MermaidRenderer re-renders
  const handleError = useCallback((err: string | null) => {
    setError(err);
  }, []);

  const currentCode = activeChat?.code || '';
  const messages = activeChat?.messages || [];
  const { debouncedValue: renderedCode, isDebouncing, flush } = useDebouncedValue(currentCode, 300);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const abortControllerRef = useRef<AbortController | null>(null);
  const exportTriggerRef = useRef<HTMLDivElement>(null);
  const exportMenuPortalRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [exportMenuPos, setExportMenuPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 192,
  });

  const { exportDiagram, isExporting } = useDiagramExport({ setError });
  const guestRequestsLeft = Math.max(0, guestRequestLimit - guestRequestCount);
  const isGuestLimitReached = !user && guestRequestCount >= guestRequestLimit;
  const isGuest = !user;
  const inputDisabled = isGuestLimitReached;
  const languages = React.useMemo(
    () => [
      { code: 'en', label: t('languages.en') },
      { code: 'ru', label: t('languages.ru') },
    ],
    [t]
  );

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

  // Close chats dropdown when clicking outside
  useEffect(() => {
    if (!isChatsDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chats-dropdown')) {
        setIsChatsDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isChatsDropdownOpen]);

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideButton = profileButtonRef.current?.contains(target);
      const insideMenu = profileMenuRef.current?.contains(target);
      if (!insideButton && !insideMenu) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      setIsSettingsOpen(false);
    }
  }, [isProfileMenuOpen]);

  // Синхронизация лимита запросов для гостя
  useEffect(() => {
    if (user) {
      setGuestRequestCount(0);
      localStorage.removeItem('guest:ai-requests');
      return;
    }
    const stored = localStorage.getItem('guest:ai-requests');
    setGuestRequestCount(stored ? parseInt(stored, 10) || 0 : 0);
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest:ai-requests', guestRequestCount.toString());
    }
  }, [guestRequestCount, user]);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading || !activeChat) return;

    if (!user && guestRequestCount >= guestRequestLimit) {
      setError(t('chat.guestLimit'));
      setIsAuthModalOpen(true);
      return;
    }
    const isUpdate = Boolean(renderedCode.trim() || currentCode.trim());

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      text: trimmed,
    };

    const newMessages = [...messages, userMessage];
    updateChatMessages(activeChat.id, newMessages);
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
      updateChatCode(activeChat.id, mermaidCode);
      flush(mermaidCode);

      const aiMessage: ChatMessage = {
        id: createId(),
        role: 'ai',
        text: isUpdate ? t('chat.aiUpdate') : t('chat.aiCreate'),
      };
      updateChatMessages(activeChat.id, [...newMessages, aiMessage]);

      // Генерируем название чата только для первого сообщения
      if (messages.length === 0 && activeChat.name === t('sidebar.newChat')) {
        generateChatTitle(trimmed, controller.signal)
          .then((title) => {
            renameChat(activeChat.id, title);
          })
          .catch((err) => {
            console.error('Failed to generate chat title:', err);
          });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted');
        return;
      }
      const message = err instanceof Error ? err.message : t('chat.generateError');
      console.error(err);
      setError(message);

      const errorMessage: ChatMessage = {
        id: createId(),
        role: 'ai',
        text: t('chat.errorMessage'),
      };
      updateChatMessages(activeChat.id, [...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
    if (!user) {
      const nextCount = guestRequestCount + 1;
      setGuestRequestCount(nextCount);
      if (nextCount >= guestRequestLimit) {
        // Небольшая задержка, чтобы пользователь увидел результат перед модалкой
        setTimeout(() => setIsAuthModalOpen(true), 150);
      }
    }
  }, [prompt, isLoading, renderedCode, currentCode, messages, activeChat, updateChatMessages, updateChatCode, flush, user, renameChat, guestRequestCount, guestRequestLimit, t]);

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
      setError(t('chat.copyError'));
    }
  }, [renderedCode, currentCode, t]);

  const confirmReset = useCallback(() => {
    clearCurrentChat();
    flush('');
    setPrompt('');
    setError(null);
    setShowExportMenu(false);
    setCopyState('idle');
    setIsResetModalOpen(false);
  }, [clearCurrentChat, flush]);

  const handleResetClick = () => {
    if (canReset) {
      setIsResetModalOpen(true);
    }
  };

  const handleCodeChange = useCallback(
    (value: string) => {
      if (activeChat) {
        updateChatCode(activeChat.id, value);
        setError(null);
      }
    },
    [activeChat, updateChatCode]
  );

  const handleFixCode = useCallback(async (code: string): Promise<string> => {
    try {
      const fixedCode = await fixMermaidCode(code);
      return fixedCode;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : t('chat.generateError');
      setError(message);
      throw err;
    }
  }, [t]);

  const confirmDeleteChat = useCallback(() => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setChatToDelete(null);
    }
  }, [chatToDelete, deleteChat]);

  const handleLanguageChange = useCallback(
    (lng: string) => {
      if (i18n.language === lng) return;
      i18n.changeLanguage(lng);
      // Update default chat names after language change
      setTimeout(() => updateDefaultChatNames(), 100);
    },
    [i18n, updateDefaultChatNames]
  );

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 relative overflow-hidden">
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title={t('modal.resetTitle')}
        message={t('modal.resetMessage')}
        onConfirm={confirmReset}
        onCancel={() => setIsResetModalOpen(false)}
        confirmLabel={t('modal.resetConfirm')}
        isDestructive
      />

      <ConfirmationModal
        isOpen={chatToDelete !== null}
        title={t('modal.deleteChatTitle')}
        message={t('modal.deleteChatMessage')}
        onConfirm={confirmDeleteChat}
        onCancel={() => setChatToDelete(null)}
        confirmLabel={t('modal.deleteChatConfirm')}
        isDestructive
      />

      {/* Sidebar / Chat Area */}
      <div
        className={`${isSidebarOpen ? 'flex' : 'hidden'
          } absolute md:static inset-y-0 left-0 w-full md:w-[380px] flex-col border-r border-slate-200 bg-white shadow-lg h-full z-20 shrink-0 relative`}
      >
        {chatsLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner />
              <span className="text-sm text-slate-600">{t('sidebar.loadingChats')}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-slate-100 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="./logo.png" alt="Dream AI Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dream AI
                </h1>
                <p className="text-slate-500 text-xs mt-1">UML Generator & Code</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-colors bg-white shadow-sm"
              title={t('sidebar.hidePanel')}
            >
              <CollapseIcon />
            </button>
          </div>

          {/* Chats Selector */}
          <div className="relative chats-dropdown">
            <button
              onClick={() => setIsChatsDropdownOpen(!isChatsDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-700 truncate">
                <ChatIcon />
                <span className="truncate">{activeChat?.name || t('sidebar.selectChat')}</span>
              </div>
              <ChevronDownIcon />
            </button>

            {isChatsDropdownOpen && (
              <div className="chats-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-30">
                <div className="p-2">
                  {user ? (
                    <button
                      onClick={() => {
                        createChat();
                        setIsChatsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PlusIcon />
                      <span>{t('sidebar.newChat')}</span>
                    </button>
                  ) : (
                    <div className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                      {t('sidebar.guestRestriction')}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 ${chat.id === activeChat?.id ? 'bg-blue-50' : ''
                        }`}
                    >
                      <button
                        onClick={() => {
                          switchChat(chat.id);
                          setIsChatsDropdownOpen(false);
                        }}
                        className="flex-1 text-left truncate"
                      >
                        <div className="font-medium text-slate-700 truncate">{chat.name}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(chat.updated_at).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </button>
                      {chats.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatToDelete(chat.id);
                            setIsChatsDropdownOpen(false);
                          }}
                          className="ml-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title={t('sidebar.deleteChat')}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveSidebarTab('chat')}
              className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${activeSidebarTab === 'chat'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <SparklesIcon />
                <span>{t('sidebar.tabChat')}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('code')}
              className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${activeSidebarTab === 'code'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <CodeIcon />
                <span>{t('sidebar.tabCode')}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Tabs content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`flex-1 flex flex-col min-h-0 ${activeSidebarTab === 'chat' ? 'flex' : 'hidden'
            }`}>
            {/* Chat History */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.length === 0 && !user && (
                <div className="text-center mt-10 text-slate-600 text-sm px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a3 3 0 110 6 3 3 0 010-6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-4.97 0-9 3.134-9 7 0 2.092 1.178 3.954 3.054 5.196.399.268.664.712.664 1.2v1.479c0 .856.92 1.4 1.666.97l1.89-1.09a2.25 2.25 0 011.125-.3h1.395c4.97 0 9-3.134 9-7s-4.03-7-9-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('sidebar.guestTitle')}</h3>
                  <p className="text-slate-500 mb-3">
                    {t('sidebar.guestUsage', { remaining: guestRequestsLeft, limit: guestRequestLimit })}
                  </p>
                  <p className="text-slate-500 mb-4">{t('sidebar.guestSaved')}</p>
                  <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                      <UserIcon />
                      <span>{t('sidebar.guestCta')}</span>
                    </button>
                    <span className="text-xs text-slate-400">{t('sidebar.guestHint')}</span>
                  </div>
                </div>
              )}
              {messages.length === 0 && user && (
                <div className="text-center mt-10 text-slate-400 text-sm px-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <SparklesIcon />
                  </div>
                  <p>{t('sidebar.emptyPrompt')}</p>
                  <p className="mt-2 text-xs">{t('sidebar.emptyHint')}</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                      {msg.role === 'user' ? <UserIcon /> : <SparklesIcon />}
                    </div>
                    <div className={`p-3 rounded-lg text-sm shadow-sm ${msg.role === 'user'
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
              <div className="relative">
                <textarea
                  ref={promptInputRef}
                  id="prompt"
                  disabled={inputDisabled}
                  className={`w-full p-3 pr-12 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm text-sm leading-relaxed min-h-[90px] ${inputDisabled ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50'
                    }`}
                  placeholder={
                    isGuest
                      ? isGuestLimitReached
                        ? t('input.limitReached')
                        : t('input.guestPlaceholder', { remaining: guestRequestsLeft, limit: guestRequestLimit })
                      : currentCode
                        ? t('input.improvePlaceholder')
                        : t('input.defaultPlaceholder')
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {isLoading ? (
                  <button
                    onClick={handleStop}
                    className="absolute bottom-3 right-3 p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all transform active:scale-90"
                    title={t('input.stopTitle')}
                    aria-label={t('input.stopTitle')}
                  >
                    <StopIcon />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || inputDisabled}
                    className={`
                        absolute bottom-3 right-3 p-2 rounded-lg text-white transition-all transform active:scale-90
                        ${!prompt.trim() || inputDisabled
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                      }
                      `}
                    title={isGuestLimitReached ? t('chat.guestLimitReached') : t('input.sendTitle')}
                    aria-label={t('input.send')}
                  >
                    <SendIcon />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  <kbd className="font-sans bg-slate-100 px-1 rounded border border-slate-200">Ctrl + Enter</kbd> {t('input.sendShortcut')}
                </span>
                {isLoading && (
                  <span className="flex items-center gap-1 text-blue-500">
                    <RefreshIcon />
                    <span>{t('input.waiting')}</span>
                  </span>
                )}
              </div>
              {error && (
                <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${activeSidebarTab === 'code' ? 'flex' : 'hidden'
            }`}>
            <div className="h-full border-t border-slate-200 flex flex-col min-h-0 min-w-0">
              <div className="flex-1 min-h-0 min-w-0">
                <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
                  <Editor value={currentCode} onChange={handleCodeChange} onFixCode={handleFixCode} />
                </Suspense>
              </div>
            </div>
          </div>
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
                title={t('toolbar.showPanel')}
              >
                {t('toolbar.openPanel')}
              </button>
            )}
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t('toolbar.canvas')}</span>
            {isDebouncing && (
              <div className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
                <RefreshIcon />
                <span>{t('toolbar.syncing')}</span>
              </div>
            )}
            {!isDebouncing && hasDiagram && (
              <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                {t('toolbar.autoUpdate')}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 relative" ref={exportTriggerRef}>
            <button
              onClick={handleCopyCode}
              disabled={!hasDiagram}
              className="px-3 py-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title={t('toolbar.copyTitle')}
            >
              <CopyIcon />
              <span className="text-sm font-medium">
                {copyState === 'copied' ? t('toolbar.copied') : t('toolbar.copy')}
              </span>
            </button>

            <div className="flex items-center space-x-2 relative">
              <button
                ref={exportButtonRef}
                onClick={toggleExportMenu}
                disabled={!hasDiagram}
                className="px-3 py-2 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                title={t('toolbar.exportTitle')}
              >
                <DownloadIcon />
                <span className="text-sm font-medium">{t('toolbar.export')}</span>
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
                      <span>{t('toolbar.exportVector')}</span>
                    </button>
                    <button
                      onClick={() => exportDiagram('png')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 group"
                    >
                      <div className="w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] font-mono text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-200">PNG</div>
                      <span>{t('toolbar.exportImage')}</span>
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
              title={t('toolbar.resetTitle')}
              aria-label={t('toolbar.resetTitle')}
            >
              <TrashIcon />
              <span className="text-sm font-medium">{t('toolbar.reset')}</span>
            </button>

            {/* Profile Button */}
            <div className="relative">
              {user ? (
                <button
                  ref={profileButtonRef}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-2 shadow-sm"
                  title={t('toolbar.profile')}
                >
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon />
                  </div>
                  <span className="font-medium">{user.email?.split('@')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  title={t('toolbar.signIn')}
                >
                  <UserIcon />
                  <span className="text-sm font-medium">{t('toolbar.signIn')}</span>
                </button>
              )}

              {/* Profile Menu */}
              {user && isProfileMenuOpen && createPortal(
                <div
                  ref={profileMenuRef}
                  className="fixed bg-white rounded-lg shadow-xl border border-slate-200 z-[9999] min-w-[240px]"
                  style={{
                    top: `${profileButtonRef.current?.getBoundingClientRect().bottom! + 8}px`,
                    right: `${window.innerWidth - profileButtonRef.current?.getBoundingClientRect().right!}px`,
                  }}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 truncate">{user.email?.split('@')[0]}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => setIsSettingsOpen((prev) => !prev)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <SettingsIcon />
                      <span className="flex-1">{t('toolbar.settings')}</span>
                    </button>
                    {isSettingsOpen && (
                      <div className="px-4 pb-3 space-y-2">
                        <div className="text-xs text-slate-400">{t('settings.language')}</div>
                        <div className="flex flex-wrap gap-2">
                          {languages.map((lang) => {
                            const isActive = i18n.language.startsWith(lang.code);
                            return (
                              <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${isActive
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700'
                                  }`}
                                aria-pressed={isActive}
                              >
                                {lang.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">{t('settings.languageHint')}</div>
                      </div>
                    )}
                  </div>

                  <div className="py-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      <span>{t('toolbar.signOut')}</span>
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>
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
                onError={handleError}
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

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default App;
