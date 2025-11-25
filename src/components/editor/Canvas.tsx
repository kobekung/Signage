'use client';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '@/stores';
import WidgetRenderer from '@/components/widgets/WidgetRenderer';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function Canvas() {
  const { layout, selectedWidgetId, selectWidget, updateWidgetPosition, updateWidgetSize } = useEditorStore();
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  useEffect(() => {
    if (layout) {
      setAspectRatio(layout.width / layout.height);
    }
  }, [layout]);

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
    <div className="w-full h-full p-8 overflow-auto flex items-center justify-center">
      <div
        id="canvas-scaler"
        className="relative shadow-lg"
        style={{
          width: '100%',
          aspectRatio: `${aspectRatio}`,
          maxWidth: `${layout.width}px`,
        }}
      >
        <div
          id="canvas"
          className="absolute inset-0"
          style={{
            transformOrigin: 'top left',
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
              onResizeStop={(_e, _direction, ref, _delta, position) =>
                handleResizeStop(widget.id, ref, position)
              }
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
