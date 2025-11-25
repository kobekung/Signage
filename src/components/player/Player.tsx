'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/lib/types';
import WidgetRenderer from '@/components/widgets/WidgetRenderer';
import { useEditorStore } from '@/stores';

interface PlayerProps {
  layout: Layout;
}

export default function Player({ layout }: PlayerProps) {
  const togglePreviewMode = useEditorStore(state => state.togglePreviewMode);

  const exitPreview = () => {
    togglePreviewMode();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitPreview();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const aspectRatio = layout.width / layout.height;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 hover:text-white z-50"
        onClick={exitPreview}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Exit Preview</span>
      </Button>

      <div
        className="relative bg-white"
        style={{
          width: '100vw',
          height: `calc(100vw / ${aspectRatio})`,
          maxHeight: '100vh',
          maxWidth: `calc(100vh * ${aspectRatio})`,
          backgroundColor: layout.backgroundColor,
        }}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `scale(min(calc(100vw / ${layout.width}), calc(100vh / ${layout.height})))`,
            transformOrigin: 'top left',
          }}
        >
          {layout.widgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                position: 'absolute',
                left: widget.x,
                top: widget.y,
                width: widget.width,
                height: widget.height,
                zIndex: widget.zIndex,
              }}
            >
              <WidgetRenderer widget={widget} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
