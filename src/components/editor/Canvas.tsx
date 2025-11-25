'use client';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '@/stores';
import WidgetRenderer from '@/components/widgets/WidgetRenderer';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

export default function Canvas() {
  const { layout, selectedWidgetId, selectWidget, updateWidgetPosition, updateWidgetSize } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && layout) {
        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
        if (layout.width > 0 && layout.height > 0) {
            const scaleX = containerWidth / layout.width;
            const scaleY = containerHeight / layout.height;
            setScale(Math.min(scaleX, scaleY) * 0.9); // Use 90% of available space
        }
      }
    };
    
    // Run on mount and when layout changes
    resizeCanvas();
    
    // Add event listener for window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [layout, useEditorStore.getState().layout?.width, useEditorStore.getState().layout?.height]); // Re-run on sidebar toggle


  if (!layout) {
    return <div className="flex items-center justify-center h-full">Loading Canvas...</div>;
  }

  const handleDragStop = (id: string, d: any) => {
    updateWidgetPosition({ id, x: d.x, y: d.y });
  };

  const handleResizeStop = (id: string, ref: any, position: any) => {
    updateWidgetSize({
      id,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    updateWidgetPosition({ id, x: position.x, y: position.y });
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
        <div
          id="canvas"
          className="relative shadow-lg bg-background"
          style={{
            width: layout.width,
            height: layout.height,
            backgroundColor: layout.backgroundColor,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              selectWidget(null);
            }
          }}
        >
          {layout.widgets.map((widget) => (
            <Rnd
              key={widget.id}
              size={{ width: widget.width, height: widget.height }}
              position={{ x: widget.x, y: widget.y }}
              onDragStop={(_e, d) => handleDragStop(widget.id, d)}
              onResizeStop={(_e, _direction, ref, _delta, position) => {
                handleResizeStop(widget.id, ref, position)
              }}
              bounds="parent"
              className={cn(
                'group focus:outline-none',
                selectedWidgetId === widget.id ? 'ring-2 ring-primary ring-offset-2 z-20' : `z-${widget.zIndex}`
              )}
              onClick={(e) => {
                e.stopPropagation();
                selectWidget(widget.id);
              }}
              scale={scale}
            >
              <div className="w-full h-full overflow-hidden relative">
                <WidgetRenderer widget={widget} />
              </div>
            </Rnd>
          ))}
        </div>
    </div>
  );
}
