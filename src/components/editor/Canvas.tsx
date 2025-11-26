'use client';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '@/stores';
import WidgetRenderer from '@/components/widgets/WidgetRenderer';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';

interface CanvasProps {
  containerSize: {
    width: number;
    height: number;
  };
}

export default function Canvas({ containerSize }: CanvasProps) {
  const { layout, selectedWidgetId, selectWidget, updateWidgetPosition, updateWidgetSize } = useEditorStore();
  
  const scale = useMemo(() => {
    if (!layout || containerSize.width === 0 || containerSize.height === 0) {
      return 1;
    }
    const scaleX = containerSize.width / layout.width;
    const scaleY = containerSize.height / layout.height;
    // 0.9 provides some padding
    return Math.min(scaleX, scaleY) * 0.9; 
  }, [layout, containerSize]);

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
    <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
        <div
          id="canvas-parent"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
            <div
              id="canvas"
              className="relative shadow-lg bg-background"
              style={{
                width: layout.width,
                height: layout.height,
                backgroundColor: layout.backgroundColor,
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
                >
                  <div className="w-full h-full overflow-hidden relative">
                    <WidgetRenderer widget={widget} />
                  </div>
                </Rnd>
              ))}
            </div>
        </div>
    </div>
  );
}
