import React, { useState, useCallback, useRef, useEffect, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { generateMermaidCode, generateChatTitle, fixMermaidCode } from './services/aisetService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useDiagramExport } from './hooks/useDiagramExport';
import { useChats } from './hooks/useChats';
import { useAuth } from './hooks/useAuth';
import { useUpdater } from './hooks/useUpdater';
import { ChatMessage } from './types';

// New Components
import { LeftPanel } from './components/Layout/LeftPanel';
import { ChatArea } from './components/Chat/ChatArea';
import { DiagramWorkspace } from './components/Diagram/DiagramWorkspace';

const Editor = React.lazy(() => import('./components/Editor').then(module => ({ default: module.Editor })));
const AuthModal = React.lazy(() =>
  import(/* webpackPrefetch: true */ './components/Auth/AuthModal').then((module) => ({
    default: module.AuthModal,
  }))
);

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36);

const EMPTY_MESSAGES: ChatMessage[] = [];
type ThemeMode = 'light' | 'dark';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const storedTheme = localStorage.getItem('ui:theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

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
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  
  const guestRequestLimit = 3;
  const [guestRequestCount, setGuestRequestCount] = useState(() => {
    const stored = localStorage.getItem('guest:ai-requests');
    return stored ? parseInt(stored, 10) || 0 : 0;
  });

  const { user, signOut } = useAuth();
  
  const updater = useUpdater();
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('theme-dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem('ui:theme', theme);
  }, [theme]);

  // Memoize setError to prevent re-renders
  const handleError = useCallback((err: string | null) => {
    setError(err);
  }, []);

  const handleChatSwitch = useCallback(
    (id: string) => {
      switchChat(id);
    },
    [switchChat]
  );

  const handleChatDelete = useCallback((id: string) => {
    setChatToDelete(id);
  }, []);

  const currentCode = useMemo(() => activeChat?.code || '', [activeChat?.id, activeChat?.code]);
  const messages = useMemo(
    () => activeChat?.messages ?? EMPTY_MESSAGES,
    [activeChat?.id, activeChat?.messages]
  );
  const { debouncedValue: renderedCode, isDebouncing, flush } = useDebouncedValue(currentCode);

  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const abortControllerRef = useRef<AbortController | null>(null);

  const { exportDiagram } = useDiagramExport({ setError });

  const hasDiagram = Boolean(renderedCode.trim());
  const hasHistory = messages.length > 0;
  const canReset = Boolean(currentCode || prompt || hasHistory);

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

  // Memoize diagram properties to prevent unnecessary re-renders
  const diagramProps = useMemo(() => ({
    isSidebarOpen,
    onOpenSidebar: () => setIsSidebarOpen(true),
    renderedCode,
    isDebouncing,
    hasDiagram,
    canReset,
    onCopy: handleCopyCode,
    copyState,
    onExport: exportDiagram,
    onReset: () => setIsResetModalOpen(true),
    user,
    onShowAuth: () => setIsAuthModalOpen(true),
    onSignOut: signOut,
    onError: handleError,
    updater,
    theme,
    onToggleTheme: toggleTheme
  }), [
    isSidebarOpen,
    renderedCode,
    isDebouncing,
    hasDiagram,
    canReset,
    handleCopyCode,
    copyState,
    exportDiagram,
    user,
    signOut,
    handleError,
    updater,
    theme,
    toggleTheme
  ]);

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

  const confirmReset = useCallback(() => {
    clearCurrentChat();
    flush('');
    setPrompt('');
    setError(null);
    setCopyState('idle');
    setIsResetModalOpen(false);
  }, [clearCurrentChat, flush]);

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

  // Update default chat names after language change (listener)
  useEffect(() => {
    const handleLangChange = () => {
       setTimeout(() => updateDefaultChatNames(), 100);
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n, updateDefaultChatNames]);


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

      <LeftPanel 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        activeChat={activeChat}
        chatsLoading={chatsLoading}
        onSwitchChat={handleChatSwitch}
        onCreateChat={createChat}
        onDeleteChat={handleChatDelete}
        user={user}
        chatComponent={
          <ChatArea 
            messages={messages}
            user={user}
            isLoading={isLoading}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSend={handleGenerate}
            onStop={handleStop}
            error={error}
            guestRequestCount={guestRequestCount}
            guestRequestLimit={guestRequestLimit}
            onShowAuth={() => setIsAuthModalOpen(true)}
            currentCode={currentCode}
          />
        }
        codeComponent={
           <div className="h-full border-t border-slate-200 flex flex-col min-h-0 min-w-0">
              <div className="flex-1 min-h-0 min-w-0">
                <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
                  <Editor value={currentCode} onChange={handleCodeChange} onFixCode={handleFixCode} />
                </Suspense>
              </div>
            </div>
        }
      />

      <DiagramWorkspace {...diagramProps} />

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Auth Modal */}
      <Suspense fallback={null}>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </Suspense>
    </div>
  );
};

export default App;
