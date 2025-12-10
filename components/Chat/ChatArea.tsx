import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { UserIcon, SparklesIcon, SendIcon, StopIcon, RefreshIcon } from '../Icons';

interface ChatAreaProps {
  messages: ChatMessage[];
  user: any;
  isLoading: boolean;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  error: string | null;
  guestRequestCount: number;
  guestRequestLimit: number;
  onShowAuth: () => void;
  currentCode: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  user,
  isLoading,
  prompt,
  onPromptChange,
  onSend,
  onStop,
  error,
  guestRequestCount,
  guestRequestLimit,
  onShowAuth,
  currentCode,
}) => {
  const { t } = useTranslation();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const guestRequestsLeft = Math.max(0, guestRequestLimit - guestRequestCount);
  const isGuestLimitReached = !user && guestRequestCount >= guestRequestLimit;
  const isGuest = !user;
  const inputDisabled = isGuestLimitReached;

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
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
                onClick={onShowAuth}
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
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isLoading ? (
            <button
              onClick={onStop}
              className="absolute bottom-3 right-3 p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all transform active:scale-90"
              title={t('input.stopTitle')}
              aria-label={t('input.stopTitle')}
            >
              <StopIcon />
            </button>
          ) : (
            <button
              onClick={onSend}
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
  );
};
