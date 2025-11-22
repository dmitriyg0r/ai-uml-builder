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