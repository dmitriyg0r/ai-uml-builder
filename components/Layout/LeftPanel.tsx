import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../LoadingSpinner';
import { ChatListItem } from '../Chat/ChatListItem';
import { 
  CollapseIcon, ChatIcon, ChevronDownIcon, PlusIcon, 
  SparklesIcon, CodeIcon 
} from '../Icons';

interface LeftPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chats: any[];
  activeChat: any;
  chatsLoading: boolean;
  onSwitchChat: (id: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (id: string) => void;
  user: any;
  chatComponent: React.ReactNode;
  codeComponent: React.ReactNode;
}

type SidebarTab = 'chat' | 'code';

export const LeftPanel: React.FC<LeftPanelProps> = ({
  isOpen,
  onClose,
  chats,
  activeChat,
  chatsLoading,
  onSwitchChat,
  onCreateChat,
  onDeleteChat,
  user,
  chatComponent,
  codeComponent,
}) => {
  const { t } = useTranslation();
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('chat');
  const [isChatsDropdownOpen, setIsChatsDropdownOpen] = useState(false);

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

  const handleChatSwitch = (id: string) => {
    onSwitchChat(id);
    setIsChatsDropdownOpen(false);
  };

  const handleCreateChat = () => {
    onCreateChat();
    setIsChatsDropdownOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    onDeleteChat(id);
    // Don't close dropdown here as the confirmation modal will appear
    setIsChatsDropdownOpen(false); 
  };

  return (
    <div
      className={`${isOpen ? 'flex' : 'hidden'} absolute md:static inset-y-0 left-0 w-full md:w-[380px] flex-col border-r border-slate-200 bg-white shadow-lg h-full z-20 shrink-0 relative`}
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
            onClick={onClose}
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
                    onClick={handleCreateChat}
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
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChat?.id}
                    showDelete={chats.length > 1}
                    onSwitch={handleChatSwitch}
                    onDelete={handleDeleteChat}
                    deleteTitle={t('sidebar.deleteChat')}
                  />
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
        <div className={`flex-1 flex flex-col min-h-0 ${activeSidebarTab === 'chat' ? 'flex' : 'hidden'}`}>
          {chatComponent}
        </div>

        <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${activeSidebarTab === 'code' ? 'flex' : 'hidden'}`}>
          {codeComponent}
        </div>
      </div>
    </div>
  );
};
