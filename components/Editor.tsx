import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  onRun?: () => void;
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

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const CodeEditor: React.FC<CodeEditorProps> = React.memo(({ value, onChange, onRun }) => {
  const [localValue, setLocalValue] = useState(value);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Sync with external value changes
  useEffect(() => {
    if (value !== localValue && !hasChanges) {
      setLocalValue(value);
    }
  }, [value, localValue, hasChanges]);

  // Validate Mermaid syntax
  useEffect(() => {
    if (!localValue.trim()) {
      setValidationStatus(null);
      return;
    }

    // Basic validation - check for common Mermaid keywords
    const hasValidStart = /^\s*(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|requirementDiagram)/m.test(localValue);
    
    if (hasValidStart) {
      setValidationStatus('valid');
    } else {
      setValidationStatus('invalid');
    }
  }, [localValue]);

  const handleRun = useCallback(() => {
    onChange(localValue);
    setHasChanges(false);
    if (onRun) onRun();
  }, [localValue, onChange, onRun]);

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
    setHasChanges(newValue !== value);
  }, [value]);

  // Format code (basic indentation)
  const handleFormat = useCallback(() => {
    const lines = localValue.split('\n');
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
    
    const formattedCode = formatted.join('\n');
    setLocalValue(formattedCode);
    setHasChanges(formattedCode !== value);
  }, [localValue, value]);

  // Handle textarea scroll synchronization
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Handle Tab key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = localValue.substring(0, start) + '  ' + localValue.substring(end);
      handleChange(newValue);
      
      // Set cursor position after inserted spaces
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  }, [localValue, handleChange]);

  // Get highlighted HTML
  const highlightedCode = React.useMemo(() => {
    if (!localValue) return '';
    return Prism.highlight(localValue, Prism.languages.mermaid, 'mermaid');
  }, [localValue]);

  const lineCount = localValue.split('\n').length;

  // Memoize line numbers to avoid re-rendering
  const lineNumbers = React.useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => (
      <div key={i + 1} className="leading-[1.6]">{i + 1}</div>
    ));
  }, [lineCount]);

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-slate-50 text-slate-600 text-xs px-3 py-1.5 font-mono flex justify-between items-center border-b border-slate-200 select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="ml-1 font-semibold text-slate-700 text-[10px]">MERMAID</span>
          </div>
          
          {/* Validation indicator */}
          {validationStatus && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] shrink-0 ${
              validationStatus === 'valid' 
                ? 'bg-emerald-500/20 text-emerald-600' 
                : 'bg-amber-500/20 text-amber-600'
            }`}>
              {validationStatus === 'valid' ? <CheckIcon /> : <AlertIcon />}
              <span>{validationStatus === 'valid' ? 'Valid' : 'Check syntax'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] opacity-40">{lineCount} строк</span>
          
          {/* Unsaved indicator */}
          {hasChanges && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Есть несохранённые изменения"></div>
          )}
          
          {/* Format button */}
          <button
            onClick={handleFormat}
            disabled={!localValue.trim()}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Форматировать код"
          >
            <FormatIcon />
            <span className="text-[9px]">Формат</span>
          </button>
          
          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!hasChanges}
            className="flex items-center justify-center w-6 h-6 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            title={hasChanges ? 'Запустить (применить изменения)' : 'Нет изменений'}
          >
            <PlayIcon />
          </button>
        </div>
      </div>
      
      {/* Editor with line numbers */}
      <div ref={editorRef} className="flex-1 overflow-hidden flex">
        {/* Line numbers */}
        <div className="bg-slate-50 text-slate-400 text-right pr-2 pl-3 py-3 select-none shrink-0 border-r border-slate-200 overflow-hidden"
             style={{
               fontFamily: '"Fira Code", "Fira Mono", Consolas, Monaco, monospace',
               fontSize: '13px',
               lineHeight: '1.6',
             }}>
          {lineNumbers}
        </div>
        
        {/* Code editor */}
        <div className="flex-1 relative overflow-hidden code-editor-scroll">
          <div className="absolute inset-0 overflow-auto" style={{ padding: '12px' }}>
            {/* Syntax highlighting layer */}
            <div
              ref={highlightRef}
              className="absolute inset-0 overflow-auto pointer-events-none"
              style={{
                padding: '12px',
                fontFamily: '"Fira Code", "Fira Mono", Consolas, Monaco, monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                whiteSpace: 'pre',
                wordBreak: 'keep-all',
                overflowWrap: 'normal',
                color: '#1e293b',
              }}
            >
              <pre
                className="m-0 p-0 text-slate-800"
                dangerouslySetInnerHTML={{ __html: highlightedCode || '<span style="color: #94a3b8;">// Введите Mermaid код здесь...\n// Например:\ngraph TD\n    A[Start] --> B[Process]\n    B --> C[End]</span>' }}
              />
            </div>
            
            {/* Textarea layer */}
            <textarea
              ref={textareaRef}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="absolute inset-0 m-0 resize-none focus:outline-none bg-transparent"
              style={{
                padding: '12px',
                fontFamily: '"Fira Code", "Fira Mono", Consolas, Monaco, monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'transparent',
                caretColor: '#1e293b',
                whiteSpace: 'pre',
                wordBreak: 'keep-all',
                overflowWrap: 'normal',
                WebkitTextFillColor: 'transparent',
              }}
              placeholder=""
            />
          </div>
        </div>
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

// Export alias for backward compatibility
export { CodeEditor as Editor };
