import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState';
import { Chat, ChatState, ChatMessage } from '../types';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36);

const createNewChat = (index: number): Chat => {
  const now = Date.now();
  return {
    id: createId(),
    name: `Чат ${index}`,
    messages: [],
    code: '',
    createdAt: now,
    updatedAt: now,
  };
};

// Миграция старых данных
const migrateOldData = (): ChatState | null => {
  try {
    const oldCode = localStorage.getItem('uml:code');
    const oldMessages = localStorage.getItem('uml:messages');
    
    if (oldCode !== null || oldMessages !== null) {
      const code = oldCode ? JSON.parse(oldCode) : '';
      const messages = oldMessages ? JSON.parse(oldMessages) : [];
      
      const now = Date.now();
      const migratedChat: Chat = {
        id: createId(),
        name: 'Чат 1',
        messages,
        code,
        createdAt: now,
        updatedAt: now,
      };
      
      // Удаляем старые ключи
      localStorage.removeItem('uml:code');
      localStorage.removeItem('uml:messages');
      
      return {
        chats: [migratedChat],
        activeChatId: migratedChat.id,
      };
    }
  } catch (error) {
    console.error('Error migrating old data:', error);
  }
  
  return null;
};

const getInitialState = (): ChatState => {
  // Проверяем миграцию
  const migrated = migrateOldData();
  if (migrated) {
    return migrated;
  }
  
  // Создаём первый чат по умолчанию
  const firstChat = createNewChat(1);
  return {
    chats: [firstChat],
    activeChatId: firstChat.id,
  };
};

export const useChats = () => {
  const [state, setState] = useLocalStorageState<ChatState>('chats:state', getInitialState());

  const activeChat = state.chats.find((chat) => chat.id === state.activeChatId) || state.chats[0];

  const createChat = useCallback(() => {
    const newIndex = state.chats.length + 1;
    const newChat = createNewChat(newIndex);
    setState((prev) => ({
      chats: [...prev.chats, newChat],
      activeChatId: newChat.id,
    }));
    return newChat.id;
  }, [state.chats.length, setState]);

  const switchChat = useCallback(
    (chatId: string) => {
      setState((prev) => ({
        ...prev,
        activeChatId: chatId,
      }));
    },
    [setState]
  );

  const deleteChat = useCallback(
    (chatId: string) => {
      setState((prev) => {
        const newChats = prev.chats.filter((chat) => chat.id !== chatId);
        
        // Если удаляем последний чат, создаём новый
        if (newChats.length === 0) {
          const newChat = createNewChat(1);
          return {
            chats: [newChat],
            activeChatId: newChat.id,
          };
        }
        
        // Если удаляем активный чат, переключаемся на первый
        const newActiveChatId = prev.activeChatId === chatId ? newChats[0].id : prev.activeChatId;
        
        return {
          chats: newChats,
          activeChatId: newActiveChatId,
        };
      });
    },
    [setState]
  );

  const renameChat = useCallback(
    (chatId: string, newName: string) => {
      setState((prev) => ({
        ...prev,
        chats: prev.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, name: newName, updatedAt: Date.now() }
            : chat
        ),
      }));
    },
    [setState]
  );

  const updateChatMessages = useCallback(
    (chatId: string, messages: ChatMessage[]) => {
      setState((prev) => ({
        ...prev,
        chats: prev.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages, updatedAt: Date.now() }
            : chat
        ),
      }));
    },
    [setState]
  );

  const updateChatCode = useCallback(
    (chatId: string, code: string) => {
      setState((prev) => ({
        ...prev,
        chats: prev.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, code, updatedAt: Date.now() }
            : chat
        ),
      }));
    },
    [setState]
  );

  const clearCurrentChat = useCallback(() => {
    if (!activeChat) return;
    
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, messages: [], code: '', updatedAt: Date.now() }
          : chat
      ),
    }));
  }, [activeChat, setState]);

  return {
    chats: state.chats,
    activeChat,
    activeChatId: state.activeChatId,
    createChat,
    switchChat,
    deleteChat,
    renameChat,
    updateChatMessages,
    updateChatCode,
    clearCurrentChat,
  };
};
