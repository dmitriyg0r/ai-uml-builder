import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';

// Define a custom robust Mermaid grammar for Prism
// We define it locally to ensure it works without external loader dependencies
Prism.languages.mermaid = {
  'comment': {
    pattern: /%%.*/,
    greedy: true
  },
  'string': {
    pattern: /"[^"]*"|'[^']*'/,
    greedy: true
  },
  'keyword': {
    pattern: /\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|gantt|pie|mindmap|requirementDiagram|gitGraph|journey|timeline|c4Context|c4Container|c4Component|c4Dynamic|c4Deployment)\b/,
    greedy: true
  },
  'class-name': {
    pattern: /\b([A-Z][a-zA-Z0-9_]*)\b/,
    lookbehind: true
  },
  'function': {
    pattern: /\b(subgraph|end|class|participant|actor|style|linkStyle|click|callback)\b/,
    greedy: true
  },
  'arrow': {
    pattern: /-->|---|--|==>|==|-.->|-\.-|\.\.|\sx\b|\so\b|\s\+\b/,
    greedy: true
  },
  'variable': {
    pattern: /\[.*?\]|\(.*?\)|\{.*?\}|\{\{.*?\}\}|>.*?\]/,
    greedy: true
  },
  'operator': /:|;|\||<|>/
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  
  const highlight = (code: string) => {
    return Prism.highlight(code, Prism.languages.mermaid, 'mermaid');
  };

  return (
    <div className="relative h-full flex flex-col group">
      <div className="bg-slate-900 text-slate-400 text-xs px-4 py-2 font-mono flex justify-between items-center border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 opacity-60"></span>
          <span className="w-2 h-2 rounded-full bg-yellow-500 opacity-60"></span>
          <span className="w-2 h-2 rounded-full bg-green-500 opacity-60"></span>
          <span className="ml-2 font-semibold text-slate-300">MERMAID</span>
        </div>
        <span className="text-[10px] opacity-50">LIVE EDIT</span>
      </div>
      
      <div className="flex-1 overflow-auto bg-[#282a36] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlight}
          padding={16}
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 13,
            backgroundColor: '#282a36', 
            minHeight: '100%',
            color: '#f8f8f2'
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
    </div>
  );
};

// Export alias for backward compatibility if needed, but App imports it as Named
export { CodeEditor as Editor };