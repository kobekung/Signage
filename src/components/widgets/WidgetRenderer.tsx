'use client';

import React from 'react';
import { Widget } from '@/lib/types';
import TextWidget from './TextWidget';
import ClockWidget from './ClockWidget';
import ImageWidget from './ImageWidget';
import TickerWidget from './TickerWidget';
import WebviewWidget from './WebviewWidget';

// Map component ตาม type
const WIDGET_MAP: Record<string, React.FC<any>> = {
  text: TextWidget,
  clock: ClockWidget,
  image: ImageWidget,
  video: ImageWidget, // ใช้ ImageWidget เล่นวิดีโอด้วย
  ticker: TickerWidget,
  webview: WebviewWidget,
};

interface WidgetRendererProps {
  widget: Widget;
  onFinished?: () => void; // [NEW] Callback เมื่อเล่นจบ
  isTriggerMode?: boolean; // [NEW] บอกสถานะว่ากำลังถูกแทรกคิว
}

export default function WidgetRenderer({ widget, onFinished, isTriggerMode }: WidgetRendererProps) {
  const Component = WIDGET_MAP[widget.type];

  if (!Component) {
    return <div className="w-full h-full bg-red-100 flex items-center justify-center text-xs text-red-500">Unknown Widget</div>;
  }

  return (
    <Component 
        widget={widget} // ส่ง object widget ทั้งก้อน
        
        // ส่ง Properties แยกออกไปเพื่อให้ใช้ง่าย
        properties={widget.properties} 
        
        // [NEW] ส่ง Callback ไปให้ Widget ภายใน
        onFinished={onFinished}
        isTriggerMode={isTriggerMode}
    />
  );
}