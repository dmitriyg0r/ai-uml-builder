import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { LoadingSpinner } from './LoadingSpinner';
import { DiagramViewer } from './DiagramViewer';
import { ZoomInIcon, ZoomOutIcon, ResetIcon } from './Icons'; // Using shared icons
import { useTranslation } from 'react-i18next';

interface MermaidRendererProps {
  code: string;
  onError?: (error: string) => void;
  theme: 'light' | 'dark';
}

const MermaidRenderer: React.FC<MermaidRendererProps> = React.memo(({ code, onError, theme }) => {
  const { t } = useTranslation();
  const [svg, setSvg] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'neutral',
      themeVariables: theme === 'dark'
        ? {
            background: '#0b1220',
            primaryColor: '#1f2937',
            primaryTextColor: '#f8fafc',
            secondaryColor: '#111827',
            tertiaryColor: '#0f172a',
            lineColor: '#94a3b8',
            edgeLabelBackground: '#0b1220',
            noteBkgColor: '#111827',
            noteTextColor: '#f8fafc',
          }
        : {},
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      logLevel: 'error',
    });
  }, [theme]);

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
          // Check if it's a known Mermaid error and provide more helpful message
          const errorMessage = err instanceof Error && err.message.includes('No diagram type detected')
            ? t('diagram.failed') + ': Invalid diagram syntax - missing diagram type declaration'
            : t('diagram.renderError');
          onError?.(errorMessage);
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
  }, [code, onError, t, theme]);

  if (isRendering) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <LoadingSpinner />
        <span className="mt-2 text-sm">{t('diagram.rendering')}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="diagram-surface w-full h-full relative overflow-hidden bg-white rounded-lg">
      {!svg ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-lg p-4 text-center m-4">
          {code ? t('diagram.failed') : t('diagram.placeholder')}
        </div>
      ) : (
        <DiagramViewer
          svg={svg}
          resetKey={resetKey}
          initialScale={initialScale}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if code or theme actually changed
  return prevProps.code === nextProps.code && prevProps.theme === nextProps.theme;
});

MermaidRenderer.displayName = 'MermaidRenderer';

export default MermaidRenderer;
