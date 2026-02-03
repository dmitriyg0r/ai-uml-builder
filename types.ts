export interface Diagram {
  id: string;
  prompt: string;
  code: string;
  createdAt: number;
  type: 'sequence' | 'class' | 'flowchart' | 'state' | 'er' | 'gantt' | 'pie' | 'unknown';
}

export interface GenerationResponse {
  code: string;
  explanation?: string;
}

export enum DiagramType {
  FLOWCHART = 'flowchart',
  SEQUENCE = 'sequence',
  CLASS = 'class',
  STATE = 'state',
  ER = 'er',
  GANTT = 'gantt',
  MINDMAP = 'mindmap'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export interface Chat {
  id: string;
  user_id: string;
  name: string;
  messages: ChatMessage[];
  code: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}
