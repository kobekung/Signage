'use client';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '@/stores';
import WidgetRenderer from '@/components/widgets/WidgetRenderer';
import { cn } from '@/lib/utils';
import React from 'react';

export default function Canvas() {
  const { layout, selectedWidgetId, selectWidget, updateWidgetPosition, updateWidgetSize, viewState } = useEditorStore();

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
    <div
      id="canvas-parent"
      className="absolute"
      style={{
        transform: `translate(${viewState.panX}px, ${viewState.panY}px) scale(${viewState.scale})`,
        transformOrigin: 'top left',
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
          // ถ้าคลิกที่พื้นหลัง Canvas (ไม่ได้คลิก Widget) ให้ยกเลิกการเลือก
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
            onClick={(e: any) => {
              e.stopPropagation();
              selectWidget(widget.id);
            }}
            scale={viewState.scale}
          >
            <div className="w-full h-full overflow-hidden relative">
              {/* [FIX] Transparent Overlay: บังหน้า Widget ไว้เพื่อให้คลิกเลือก/ลากได้เสมอ (แก้ปัญหา Iframe ขโมยคลิก) */}
              <div className="absolute inset-0 z-10 bg-transparent" />
              
              {/* ตัว Widget ของจริง */}
              <WidgetRenderer widget={widget} />
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
}