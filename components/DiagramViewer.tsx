import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useTranslation } from 'react-i18next';
import { ZoomInIcon, ZoomOutIcon, ResetIcon } from './Icons';

interface DiagramViewerProps {
  svg: string;
  resetKey: number;
  initialScale: number;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ svg, resetKey, initialScale }) => {
  const { t } = useTranslation();
  const [scaleInitialized, setScaleInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scale initialization when resetKey changes
  useEffect(() => {
    setScaleInitialized(false);
  }, [resetKey]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <TransformWrapper
        key={resetKey}
        initialScale={initialScale}
        minScale={0.1}
        maxScale={5}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.05 }}
        onTransformed={() => {
          if (!scaleInitialized) {
            setScaleInitialized(true);
          }
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10 shadow-lg rounded-lg bg-white p-1 border border-slate-100">
              <button
                onClick={() => zoomIn()}
                className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors"
                title={t('diagram.zoomIn')}
              >
                <ZoomInIcon />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors"
                title={t('diagram.zoomOut')}
              >
                <ZoomOutIcon />
              </button>
              <div className="h-px bg-slate-100 mx-2"></div>
              <button
                onClick={() => resetTransform()}
                className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors flex justify-center items-center"
                title={t('diagram.resetZoom')}
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