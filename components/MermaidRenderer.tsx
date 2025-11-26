import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { LoadingSpinner } from './LoadingSpinner';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface MermaidRendererProps {
  code: string;
  onError?: (error: string) => void;
}

// Control Icons
const ZoomInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
);

const ZoomOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
);

const MermaidRenderer: React.FC<MermaidRendererProps> = React.memo(({ code, onError }) => {
  const [svg, setSvg] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      logLevel: 'error',
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      if (!code.trim()) {
        setSvg('');
        onError?.('');
        setIsRendering(false);
        return;
      }

      setIsRendering(true);
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: svgContent } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(svgContent);
          onError?.('');
          
          // Calculate scale to fit diagram
          setTimeout(() => {
            if (containerRef.current) {
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
              const svgElement = svgDoc.querySelector('svg');
              
              if (svgElement) {
                const viewBox = svgElement.getAttribute('viewBox');
                const width = svgElement.getAttribute('width');
                const height = svgElement.getAttribute('height');
                
                let svgWidth = 0;
                let svgHeight = 0;
                
                if (viewBox) {
                  const [, , vw, vh] = viewBox.split(' ').map(Number);
                  svgWidth = vw;
                  svgHeight = vh;
                } else if (width && height) {
                  svgWidth = parseFloat(width);
                  svgHeight = parseFloat(height);
                }
                
                const containerWidth = containerRef.current.clientWidth - 80; // padding
                const containerHeight = containerRef.current.clientHeight - 80;
                
                if (svgWidth && svgHeight) {
                  const scaleX = containerWidth / svgWidth;
                  const scaleY = containerHeight / svgHeight;
                  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
                  
                  setInitialScale(scale);
                  setResetKey(prev => prev + 1);
                }
              }
            }
          }, 50);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (!cancelled) {
          setSvg('');
          onError?.('Ошибка рендеринга диаграммы. Проверьте синтаксис.');
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [code, onError]);

  if (isRendering) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <LoadingSpinner />
        <span className="mt-2 text-sm">Отрисовка...</span>
      </div>
    );
  }

  if (!svg) {
     return (
         <div className="flex items-center justify-center h-full text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-lg p-4 text-center m-4">
             {code ? 'Не удалось построить диаграмму' : 'Диаграмма появится здесь'}
         </div>
     )
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white rounded-lg">
      <TransformWrapper
        key={resetKey}
        initialScale={initialScale}
        minScale={0.1}
        maxScale={5}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.05 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10 shadow-lg rounded-lg bg-white p-1 border border-slate-100">
              <button 
                onClick={() => zoomIn()} 
                className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors"
                title="Приблизить"
              >
                <ZoomInIcon />
              </button>
              <button 
                onClick={() => zoomOut()} 
                className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors"
                title="Отдалить"
              >
                <ZoomOutIcon />
              </button>
              <div className="h-px bg-slate-100 mx-2"></div>
              <button 
                onClick={() => resetTransform()} 
                className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors flex justify-center items-center"
                title="Сбросить масштаб"
              >
                <ResetIcon />
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <div 
                id="mermaid-svg-root"
                className="w-full h-full flex items-center justify-center p-10"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if code actually changed
  return prevProps.code === nextProps.code;
});

MermaidRenderer.displayName = 'MermaidRenderer';

export default MermaidRenderer;
