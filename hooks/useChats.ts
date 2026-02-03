import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { Chat, ChatMessage } from '../types';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../services/apiClient';

interface LocalChat {
  id: string;
  name: string;
  messages: ChatMessage[];
  code: string;
  createdAt: number;
  updatedAt: number;
}

const LOCAL_STORAGE_KEY = 'chats:state';
const createGuestId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(36);

const toChat = (chat: LocalChat): Chat => ({
  id: chat.id,
  user_id: 'guest',
  name: chat.name,
  messages: chat.messages,
  code: chat.code,
  created_at: new Date(chat.createdAt).toISOString(),
  updated_at: new Date(chat.updatedAt).toISOString(),
});

const toLocalChat = (chat: Chat): LocalChat => ({
  id: chat.id,
  name: chat.name,
  messages: chat.messages,
  code: chat.code,
  createdAt: new Date(chat.created_at).getTime(),
  updatedAt: new Date(chat.updated_at).getTime(),
});

const persistGuestState = (chats: LocalChat[], activeChatId: string | null) => {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      chats,
      activeChatId,
    })
  );
};

const loadGuestState = (defaultName: string): { chats: Chat[]; activeChatId: string | null } => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.chats) && parsed.chats.length > 0) {
        // Update default chat names to current language
        const updatedChats = parsed.chats.map((c: LocalChat) => {
          // Check if this is a default chat name (in any language)
          const isDefaultName = c.name === 'New chat' || c.name === 'Новый чат';
          // Only update if it's a default name and has no messages (hasn't been used yet)
          if (isDefaultName && c.messages.length === 0) {
            return { ...c, name: defaultName };
          }
          return c;
        });
        
        // Persist updated names
        if (JSON.stringify(updatedChats) !== JSON.stringify(parsed.chats)) {
          persistGuestState(updatedChats, parsed.activeChatId);
        }
        
        return {
          chats: updatedChats.map((c: LocalChat) => toChat(c)),
          activeChatId: parsed.activeChatId || updatedChats[0].id,
        };
      }
    } catch (err) {
      console.error('Failed to parse guest chats from localStorage', err);
    }
  }

  // Only create fallback chat if localStorage is truly empty
  // This prevents creating duplicate chats on every app restart
  const fallbackChat: LocalChat = {
    id: createGuestId(),
    name: defaultName,
    messages: [],
    code: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  persistGuestState([fallbackChat], fallbackChat.id);

  return {
    chats: [toChat(fallbackChat)],
    activeChatId: fallbackChat.id,
  };
};

// Миграция старых данных из localStorage в API
const migrateLocalStorageData = async (): Promise<void> => {
  try {
    const chatsStateRaw = localStorage.getItem('chats:state');
    const oldCode = localStorage.getItem('uml:code');
    const oldMessages = localStorage.getItem('uml:messages');
    
    const chatsToMigrate: LocalChat[] = [];
    
    // Проверяем новый формат (chats:state)
    if (chatsStateRaw) {
      const chatsState = JSON.parse(chatsStateRaw);
      if (chatsState.chats && Array.isArray(chatsState.chats)) {
        chatsToMigrate.push(...chatsState.chats);
      }
    }
    // Проверяем старый формат (uml:code, uml:messages)
    else if (oldCode !== null || oldMessages !== null) {
      const code = oldCode ? JSON.parse(oldCode) : '';
      const messages = oldMessages ? JSON.parse(oldMessages) : [];
      chatsToMigrate.push({
        id: crypto.randomUUID(),
        name: 'New chat',
        messages,
        code,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Загружаем чаты в API
    if (chatsToMigrate.length > 0) {
      const migratedChats = chatsToMigrate.map((chat) => ({
        name: chat.name,
        messages: chat.messages,
        code: chat.code,
        created_at: new Date(chat.createdAt).toISOString(),
        updated_at: new Date(chat.updatedAt).toISOString(),
      }));

      await apiFetch('/chats/import', {
        method: 'POST',
        body: JSON.stringify({ chats: migratedChats }),
      });
      
      // Очищаем localStorage
      localStorage.removeItem('chats:state');
      localStorage.removeItem('uml:code');
      localStorage.removeItem('uml:messages');
      
      console.log(`Migrated ${migratedChats.length} chats to API`);
    }
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
  }
};

export const useChats = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedForUserRef = useRef<string | null>(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  // Загрузка чатов при монтировании
  useEffect(() => {
    // Wait for auth state to resolve to avoid creating guest chats for logged-in users
    if (authLoading) {
      return;
    }

    const currentUserKey = user ? user.id : 'guest';
    // Only load once per user, ignore language changes
    if (loadedForUserRef.current === currentUserKey) {
      return;
    }
    loadedForUserRef.current = currentUserKey;

    if (!user) {
      setLoading(true);
      const { chats: guestChats, activeChatId: guestActiveId } = loadGuestState(t('sidebar.newChat'));
      // Only update state if chats actually changed to prevent unnecessary re-renders
      setChats((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(guestChats)) return prev;
        return guestChats;
      });
      setActiveChatId(guestActiveId);
      setLoading(false);
      return;
    }

    const loadChats = async () => {
      try {
        setLoading(true);
        console.log('[useChats] Starting to load chats for user:', user.id);

        // Мигрируем данные из localStorage (если есть)
        await migrateLocalStorageData();
        
        // Загружаем чаты
        const data = await apiFetch('/chats');

        console.log('[useChats] Loaded chats:', data?.length);
        
        if (data && data.length > 0) {
          setChats(data);
          setActiveChatId(data[0].id);
        } else {
          console.log('[useChats] No chats found, creating default.');
          // Создаем первый чат
          const newChatData = await apiFetch('/chats', {
            method: 'POST',
            body: JSON.stringify({
              name: t('sidebar.newChat'),
            }),
          });
          setChats([newChatData]);
          setActiveChatId(newChatData.id);
        }
      } catch (err) {
        console.error('[useChats] Error loading chats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chats');
        // Reset ref to allow retry on next attempt if needed
        loadedForUserRef.current = null;
      } finally {
        setLoading(false);
      }
    };
    
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Only depend on user/auth state, not 't' to prevent re-loading on language change

  const createChat = useCallback(
    async (customName?: string) => {
      if (!user) {
        // В гостевом режиме разрешаем только один чат
        if (chats.length > 0) {
          setActiveChatId(chats[0].id);
          return chats[0].id;
        }

        const newChat: LocalChat = {
          id: createGuestId(),
          name: customName || t('sidebar.newChat'),
          messages: [],
          code: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const chat = toChat(newChat);
        setChats([chat]);
        setActiveChatId(chat.id);
        persistGuestState([newChat], chat.id);
        return chat.id;
      }
      
      try {
        const data = await apiFetch('/chats', {
          method: 'POST',
          body: JSON.stringify({
            name: customName || t('sidebar.newChat'),
          }),
        });
        if (data) {
          setChats((prev) => [data, ...prev]);
          setActiveChatId(data.id);
          return data.id;
        }
      } catch (err) {
        console.error('Error creating chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to create chat');
      }
      return null;
    },
    [user, chats, t]
  );

  const switchChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      if (!user) {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify({
                ...parsed,
                activeChatId: chatId,
              })
            );
          }
        } catch (err) {
          console.error('Failed to persist guest active chat', err);
        }
      }
    },
    [user]
  );

  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) {
      // В гостевом режиме просто сбрасываем чат
      const freshChat: LocalChat = {
        id: createGuestId(),
        name: t('sidebar.newChat'),
        messages: [],
        code: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const chat = toChat(freshChat);
      setChats([chat]);
      setActiveChatId(chat.id);
      persistGuestState([freshChat], chat.id);
      return;
    }
    
    try {
      await apiFetch(`/chats/${chatId}`, { method: 'DELETE' });
      
      const newChats = chats.filter((chat) => chat.id !== chatId);
      setChats(newChats);
      
      // Если удаляем последний чат, создаем новый
      if (newChats.length === 0) {
        await createChat();
      } else if (activeChatId === chatId) {
        // Переключаемся на первый
        setActiveChatId(newChats[0].id);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
    }
  }, [user, chats, activeChatId, createChat, t]);

  const renameChat = useCallback(
    async (chatId: string, newName: string) => {
      if (!user) {
        setChats((prev) => {
          const updated = prev.map((chat) =>
            chat.id === chatId ? { ...chat, name: newName, updated_at: new Date().toISOString() } : chat
          );
          persistGuestState(updated.map(toLocalChat), chatId === activeChatId ? chatId : activeChatId);
          return updated;
        });
        return;
    }
      
    try {
      await apiFetch(`/chats/${chatId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName }),
      });
        
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
              ? { ...chat, name: newName, updated_at: new Date().toISOString() }
              : chat
          )
        );
      } catch (err) {
        console.error('Error renaming chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to rename chat');
      }
    },
    [user, activeChatId]
  );

  const updateChatMessages = useCallback(
    async (chatId: string, messages: ChatMessage[]) => {
      if (!user) {
        setChats((prev) => {
          const targetChat = prev.find((chat) => chat.id === chatId);
          // Only update if messages have actually changed
          if (JSON.stringify(targetChat?.messages) === JSON.stringify(messages)) {
            return prev;
          }

          const updated = prev.map((chat) =>
            chat.id === chatId ? { ...chat, messages, updated_at: new Date().toISOString() } : chat
          );
          persistGuestState(updated.map(toLocalChat), activeChatId);
          return updated;
        });
        return;
      }

      try {
        // Only update if messages have actually changed
        const targetChat = chats.find((chat) => chat.id === chatId);
        if (JSON.stringify(targetChat?.messages) === JSON.stringify(messages)) {
          return;
        }

        await apiFetch(`/chats/${chatId}`, {
          method: 'PATCH',
          body: JSON.stringify({ messages }),
        });

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages, updated_at: new Date().toISOString() }
              : chat
          )
        );
      } catch (err) {
        console.error('Error updating messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to update messages');
      }
    },
    [user, activeChatId, chats]
  );

  const updateChatCode = useCallback(
    async (chatId: string, code: string) => {
      if (!user) {
        setChats((prev) => {
          const targetChat = prev.find((chat) => chat.id === chatId);
          // Only update if code has actually changed
          if (targetChat?.code === code) return prev;

          const updated = prev.map((chat) =>
            chat.id === chatId ? { ...chat, code, updated_at: new Date().toISOString() } : chat
          );
          persistGuestState(updated.map(toLocalChat), activeChatId);
          return updated;
        });
        return;
      }

      try {
        // Only update if code has actually changed
        const targetChat = chats.find((chat) => chat.id === chatId);
        if (targetChat?.code === code) return;

        await apiFetch(`/chats/${chatId}`, {
          method: 'PATCH',
          body: JSON.stringify({ code }),
        });

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, code, updated_at: new Date().toISOString() }
              : chat
          )
        );
      } catch (err) {
        console.error('Error updating code:', err);
        setError(err instanceof Error ? err.message : 'Failed to update code');
      }
    },
    [user, activeChatId, chats]
  );

  const clearCurrentChat = useCallback(async () => {
    if (!activeChat) return;

    if (!user) {
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat.id === activeChat.id
            ? { ...chat, messages: [], code: '', updated_at: new Date().toISOString() }
            : chat
        );
        persistGuestState(updated.map(toLocalChat), activeChat.id);
        return updated;
      });
      return;
    }
    
    try {
      await apiFetch(`/chats/${activeChat.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ messages: [], code: '' }),
      });
      
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? { ...chat, messages: [], code: '', updated_at: new Date().toISOString() }
            : chat
        )
      );
    } catch (err) {
      console.error('Error clearing chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear chat');
    }
  }, [activeChat, user]);

  const updateDefaultChatNames = useCallback(async () => {
    const defaultName = t('sidebar.newChat');
    
    if (!user) {
      // Update guest chats
      setChats((prev) => {
        const updated = prev.map((chat) => {
          const isDefaultName = chat.name === 'New chat' || chat.name === 'Новый чат';
          if (isDefaultName && chat.messages.length === 0) {
            return { ...chat, name: defaultName };
          }
          return chat;
        });
        
        if (JSON.stringify(updated) !== JSON.stringify(prev)) {
          persistGuestState(updated.map(toLocalChat), activeChatId);
        }
        
        return updated;
      });
    } else {
      // Update user chats in database
      try {
        const chatsToUpdate = chats.filter(
          (chat) => (chat.name === 'New chat' || chat.name === 'Новый чат') && chat.messages.length === 0
        );
        
        if (chatsToUpdate.length > 0) {
          const updates = chatsToUpdate.map((chat) =>
            apiFetch(`/chats/${chat.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ name: defaultName }),
            })
          );
          
          await Promise.all(updates);
          
          setChats((prev) =>
            prev.map((chat) => {
              const isDefaultName = chat.name === 'New chat' || chat.name === 'Новый чат';
              if (isDefaultName && chat.messages.length === 0) {
                return { ...chat, name: defaultName };
              }
              return chat;
            })
          );
        }
      } catch (err) {
        console.error('Error updating default chat names:', err);
      }
    }
  }, [user, chats, activeChatId, t]);

  return {
    chats,
    activeChat,
    activeChatId,
    loading,
    error,
    createChat,
    switchChat,
    deleteChat,
    renameChat,
    updateChatMessages,
    updateChatCode,
    clearCurrentChat,
    updateDefaultChatNames,
  };
};
