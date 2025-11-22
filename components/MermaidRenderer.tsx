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

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, onError }) => {
  const [svg, setSvg] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      logLevel: 'error',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code) return;

      setIsRendering(true);
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: svgContent } = await mermaid.render(id, code);
        setSvg(svgContent);
        if (onError) onError(''); 
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setSvg(''); 
        if (onError) onError('Ошибка рендеринга диаграммы. Проверьте синтаксис.');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
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
    <div className="w-full h-full relative overflow-hidden bg-white rounded-lg">
      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={5}
        centerOnInit
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
};

export default MermaidRenderer;
