import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { Chat, ChatMessage } from '../types';

interface LocalChat {
  id: string;
  name: string;
  messages: ChatMessage[];
  code: string;
  createdAt: number;
  updatedAt: number;
}

// Миграция старых данных из localStorage в Supabase
const migrateLocalStorageData = async (userId: string): Promise<void> => {
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
        name: 'Новый чат',
        messages,
        code,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Загружаем чаты в Supabase
    if (chatsToMigrate.length > 0) {
      const migratedChats = chatsToMigrate.map((chat) => ({
        id: crypto.randomUUID(), // Новый ID для Supabase
        user_id: userId,
        name: chat.name,
        messages: chat.messages,
        code: chat.code,
        created_at: new Date(chat.createdAt).toISOString(),
        updated_at: new Date(chat.updatedAt).toISOString(),
      }));
      
      await supabase.from('chats').insert(migratedChats);
      
      // Очищаем localStorage
      localStorage.removeItem('chats:state');
      localStorage.removeItem('uml:code');
      localStorage.removeItem('uml:messages');
      
      console.log(`Migrated ${migratedChats.length} chats to Supabase`);
    }
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
  }
};

export const useChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  // Загрузка чатов при монтировании
  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChatId(null);
      setLoading(false);
      return;
    }

    const loadChats = async () => {
      try {
        setLoading(true);
        
        // Мигрируем данные из localStorage (если есть)
        await migrateLocalStorageData(user.id);
        
        // Загружаем чаты
        const { data, error: fetchError } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        if (data && data.length > 0) {
          setChats(data);
          setActiveChatId(data[0].id);
        } else {
          // Создаем первый чат
          const { data: newChatData, error: createError } = await supabase
            .from('chats')
            .insert({
              user_id: user.id,
              name: 'Новый чат',
              messages: [],
              code: '',
            })
            .select()
            .single();
          
          if (createError) throw createError;
          if (newChatData) {
            setChats([newChatData]);
            setActiveChatId(newChatData.id);
          }
        }
      } catch (err) {
        console.error('Error loading chats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    
    loadChats();
  }, [user]);

  const createChat = useCallback(async (customName?: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          name: customName || 'Новый чат',
          messages: [],
          code: '',
        })
        .select()
        .single();
      
      if (error) throw error;
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
  }, [user]);

  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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
  }, [user, chats, activeChatId, createChat]);

  const renameChat = useCallback(async (chatId: string, newName: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ name: newName })
        .eq('id', chatId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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
  }, [user]);

  const updateChatMessages = useCallback(async (chatId: string, messages: ChatMessage[]) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ messages })
        .eq('id', chatId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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
  }, [user]);

  const updateChatCode = useCallback(async (chatId: string, code: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ code })
        .eq('id', chatId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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
  }, [user]);

  const clearCurrentChat = useCallback(async () => {
    if (!activeChat || !user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ messages: [], code: '' })
        .eq('id', activeChat.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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
  };
};
