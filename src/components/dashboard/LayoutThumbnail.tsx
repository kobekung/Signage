'use client';

import React from 'react';
import { Widget } from '@/lib/types';
import WidgetRenderer from '../widgets/WidgetRenderer';
import { LayoutTemplate, Image as ImageIcon } from 'lucide-react';

interface LayoutThumbnailProps {
  width: number;
  height: number;
  widgets: Widget[];
  scale?: number;
  thumbnailUrl?: string; // [NEW] รับ URL รูปภาพมาโชว์แทนได้
}

export default function LayoutThumbnail({ width, height, widgets, scale, thumbnailUrl }: LayoutThumbnailProps) {
  const aspectRatio = width / height;

  // กรณี 1: ไม่มี Widgets แต่มีรูป Thumbnail (จากระบบบันทึกภาพ)
  if ((!widgets || widgets.length === 0) && thumbnailUrl) {
      return (
          <div className="w-full h-full bg-slate-100 relative">
              <img src={thumbnailUrl} alt="Layout Preview" className="w-full h-full object-cover" />
          </div>
      );
  }

  // กรณี 2: ไม่มีทั้ง Widgets และรูป -> แสดง Placeholder สวยๆ
  if (!widgets || widgets.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 gap-2 border border-dashed select-none">
        <LayoutTemplate size={32} strokeWidth={1.5} />
        <span className="text-[10px] font-medium uppercase tracking-wider">No Preview Data</span>
      </div>
    );
  }

  // กรณี 3: มี Widgets -> แสดงผล Live Preview (เหมือนเดิม)
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-200 overflow-hidden relative select-none">
      <div 
        className="relative bg-white shadow-sm"
        style={{
          width: '100%',
          paddingBottom: `${(1 / aspectRatio) * 100}%`,
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left overflow-hidden"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${scale || 0.2})`, 
          }}
        >
          {widgets.map((widget) => (
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
                className="border border-dashed border-gray-400/30 bg-gray-50/50" // ใส่พื้นหลังจางๆ ให้เห็นตำแหน่ง
             >
                <div className="w-full h-full pointer-events-none opacity-80">
                    <WidgetRenderer widget={widget} />
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}