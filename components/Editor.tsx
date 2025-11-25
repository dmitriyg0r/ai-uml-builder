import React, { useState, useCallback, useRef, useEffect } from 'react';
import SimpleCodeEditor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';

// Define Mermaid syntax highlighting for Prism
if (typeof window !== 'undefined' && !Prism.languages.mermaid) {
  Prism.languages.mermaid = {
    comment: /%%[^\n]*/,
    string: /"(?:\\.|""|[^"\n])*"/,
    keyword: /\b(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|C4Context|mindmap|timeline|quadrantChart|requirementDiagram|subgraph|end|participant|actor|note|loop|alt|else|opt|par|and|rect|activate|deactivate|autonumber|over|left of|right of|TB|TD|BT|RL|LR)\b/,
    operator: /-->|---|===>|==>|->|-->>|<<--|\|\||&&|[\-=]\)|\(\[|\]\)|\[\[|\]\]|\{\{|\}\}|>|<|\||&/,
    property: /\b[A-Z][a-zA-Z0-9_]*(?=:)/,
    function: /\b[a-z_][a-zA-Z0-9_]*(?=\()/,
    punctuation: /[{}[\]();:,]/,
    number: /\b\d+(?:\.\d+)?\b/,
  };
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Icons
const FormatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Validate Mermaid syntax
  useEffect(() => {
    if (!value.trim()) {
      setValidationStatus(null);
      return;
    }

    // Basic validation - check for common Mermaid keywords
    const hasValidStart = /^\s*(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|requirementDiagram)/m.test(value);
    
    if (hasValidStart) {
      setValidationStatus('valid');
    } else {
      setValidationStatus('invalid');
    }
  }, [value]);

  // Format code (basic indentation)
  const handleFormat = useCallback(() => {
    const lines = value.split('\n');
    let indentLevel = 0;
    const formatted = lines.map((line) => {
      const trimmed = line.trim();
      
      // Decrease indent for 'end'
      if (trimmed === 'end') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indented = '  '.repeat(indentLevel) + trimmed;
      
      // Increase indent after 'subgraph' or other block starts
      if (/^(?:subgraph|loop|alt|opt|par|rect)\b/.test(trimmed)) {
        indentLevel++;
      }
      
      return indented;
    });
    
    onChange(formatted.join('\n'));
  }, [value, onChange]);

  // Handle Tab key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after inserted spaces
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }, [value, onChange]);

  // Highlight function for Prism
  const highlight = useCallback((code: string) => {
    return Prism.highlight(code, Prism.languages.mermaid, 'mermaid');
  }, []);

  const lineCount = value.split('\n').length;

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-[#282a36]">
      {/* Toolbar */}
      <div className="bg-slate-900 text-slate-400 text-xs px-3 py-1.5 font-mono flex justify-between items-center border-b border-slate-800 select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-60"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 opacity-60"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-60"></span>
            <span className="ml-1 font-semibold text-slate-300 text-[10px]">MERMAID</span>
          </div>
          
          {/* Validation indicator */}
          {validationStatus && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
              validationStatus === 'valid' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {validationStatus === 'valid' ? <CheckIcon /> : <AlertIcon />}
              <span>{validationStatus === 'valid' ? 'Valid' : 'Check syntax'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] opacity-40">{lineCount} строк</span>
          
          {/* Format button */}
          <button
            onClick={handleFormat}
            disabled={!value.trim()}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Форматировать код"
          >
            <FormatIcon />
            <span className="text-[9px]">Формат</span>
          </button>
          
          <span className="text-[9px] opacity-40 border-l border-slate-700 pl-2">LIVE</span>
        </div>
      </div>
      
      {/* Editor with line numbers */}
      <div ref={editorRef} className="flex-1 overflow-hidden flex">
        {/* Line numbers */}
        <div className="bg-slate-900 text-slate-600 text-right pr-2 pl-3 py-3 select-none shrink-0 border-r border-slate-800 overflow-hidden"
             style={{
               fontFamily: '"Fira Code", "Fira Mono", Consolas, Monaco, monospace',
               fontSize: '13px',
               lineHeight: '1.6',
             }}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="leading-[1.6]">{i + 1}</div>
          ))}
        </div>
        
        {/* Code editor */}
        <div className="flex-1 overflow-auto">
          <SimpleCodeEditor
            value={value}
            onValueChange={onChange}
            highlight={highlight}
            padding={12}
            onKeyDown={handleKeyDown as any}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", Consolas, Monaco, monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              backgroundColor: '#282a36',
              color: '#f8f8f2',
              minHeight: '100%',
              whiteSpace: 'pre',
              wordBreak: 'normal',
            }}
            textareaClassName="focus:outline-none"
            placeholder="// Введите Mermaid код здесь...\n// Например:\ngraph TD\n    A[Start] --> B[Process]\n    B --> C[End]"
          />
        </div>
      </div>
    </div>
  );
};

// Export alias for backward compatibility
export { CodeEditor as Editor };
