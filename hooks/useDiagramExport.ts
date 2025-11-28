
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseDiagramExportProps {
  setError: (error: string | null) => void;
}

export const useDiagramExport = ({ setError }: UseDiagramExportProps) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const exportDiagram = useCallback(
    (format: 'svg' | 'png') => {
      const svgElement = document.querySelector<SVGSVGElement>('#mermaid-svg-root svg');
      if (!svgElement) {
        setError(t('export.notFound'));
        return;
      }

      setIsExporting(true);

      try {
        const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
        const rect = svgElement.getBoundingClientRect();
        const viewBox = svgElement.getAttribute('viewBox');
        
        // Explicitly set width/height to match rendered size
        // This is crucial for the Image to have correct intrinsic dimensions
        svgClone.setAttribute("width", rect.width.toString());
        svgClone.setAttribute("height", rect.height.toString());
        
        if (!svgClone.getAttribute('xmlns')) {
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        if (!svgClone.getAttribute('xmlns:xlink')) {
          svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        }
        
        // Inline basic styles if possible or needed? 
        // Mermaid usually includes styles in <style> tag inside SVG.
        // We assume it's self-contained enough for now.

        const svgData = new XMLSerializer().serializeToString(svgClone);
        // Use base64 to avoid some blob issues and ensure proper encoding for unicode
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const imageSrc = `data:image/svg+xml;base64,${svgBase64}`;

        if (format === 'svg') {
          const link = document.createElement('a');
          link.href = imageSrc;
          link.download = `diagram-${Date.now()}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setIsExporting(false);
          return;
        }

        const img = new Image();
        
        img.onload = () => {
          // Calculate dimensions based on viewBox or rect
          const [, , vbW, vbH] = viewBox ? viewBox.split(/\s+/).map(Number) : [0, 0, rect.width, rect.height];
          // Use viewBox dimensions if available for higher resolution, otherwise rect
          const width = vbW || rect.width;
          const height = vbH || rect.height;

          // High resolution export
          const scale = 3; 
          const canvas = document.createElement('canvas');
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            setError(t('export.pngUnsupported'));
            setIsExporting(false);
            return;
          }

          // White background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (!blob) {
              setError(t('export.pngError'));
              setIsExporting(false);
              return;
            }

            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `diagram-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
            setIsExporting(false);
          }, 'image/png');
        };

        img.onerror = (e) => {
          console.error('Image loading error', e);
          setError(t('export.pngExternal'));
          setIsExporting(false);
        };

        img.src = imageSrc;
      } catch (error) {
        console.error(error);
        setError(t('export.unexpected'));
        setIsExporting(false);
      }
    },
    [setError, t]
  );

  return { exportDiagram, isExporting };
};
