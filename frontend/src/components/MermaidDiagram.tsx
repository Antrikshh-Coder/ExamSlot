import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#2563eb',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#3b82f6',
    lineColor: '#64748b',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e293b',
  },
});

interface Props {
  chart: string;
  id: string;
}

export const MermaidDiagram: React.FC<Props> = ({ chart, id }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
      try {
        mermaid.render(`mermaid-${id}-${Date.now()}`, chart).then(res => {
          if (containerRef.current) {
            containerRef.current.innerHTML = res.svg;
          }
        });
      } catch (e) {
        console.error('Mermaid render error:', e);
      }
    }
  }, [chart, id]);

  return (
    <div className="w-full overflow-x-auto p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-center">
      <div ref={containerRef} className="mermaid" id={id}>
        {chart}
      </div>
    </div>
  );
};
