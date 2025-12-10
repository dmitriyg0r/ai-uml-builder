import React, { useMemo, memo } from 'react';
import { TrashIcon } from '../Icons';

type ChatListItemProps = {
  chat: { id: string; name: string; updated_at: string };
  isActive: boolean;
  showDelete: boolean;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  deleteTitle: string;
};

export const ChatListItem = memo<ChatListItemProps>(({ chat, isActive, showDelete, onSwitch, onDelete, deleteTitle }) => {
  const formattedDate = useMemo(
    () =>
      new Date(chat.updated_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [chat.updated_at]
  );

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 ${
        isActive ? 'bg-blue-50' : ''
      }`}
    >
      <button onClick={() => onSwitch(chat.id)} className="flex-1 text-left truncate">
        <div className="font-medium text-slate-700 truncate">{chat.name}</div>
        <div className="text-xs text-slate-400">{formattedDate}</div>
      </button>
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          className="ml-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
          title={deleteTitle}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
});

ChatListItem.displayName = 'ChatListItem';
