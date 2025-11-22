import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-[#282a36]">
      <div className="bg-slate-900 text-slate-400 text-xs px-4 py-2 font-mono flex justify-between items-center border-b border-slate-800 select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 opacity-60"></span>
          <span className="w-2 h-2 rounded-full bg-yellow-500 opacity-60"></span>
          <span className="w-2 h-2 rounded-full bg-green-500 opacity-60"></span>
          <span className="ml-2 font-semibold text-slate-300">MERMAID</span>
        </div>
        <span className="text-[10px] opacity-50">LIVE EDIT</span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full bg-transparent text-[#f8f8f2] resize-none focus:outline-none border-none p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50"
        style={{
          fontFamily: '"Fira Code", "Fira Mono", Consolas, Monaco, monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          tabSize: 2,
          MozTabSize: 2,
        }}
        placeholder="// Введите Mermaid код здесь..."
      />
    </div>
  );
};

// Export alias for backward compatibility
export { CodeEditor as Editor };
