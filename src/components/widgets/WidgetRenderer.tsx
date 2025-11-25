'use client';

import { Widget } from '@/lib/types';
import TextWidget from './TextWidget';
import ClockWidget from './ClockWidget';
import MediaPlaylistWidget from './ImageWidget';

interface WidgetRendererProps {
  widget: Widget<any>;
}

export default function WidgetRenderer({ widget }: WidgetRendererProps) {
  switch (widget.type) {
    case 'text':
      return <TextWidget properties={widget.properties} />;
    case 'clock':
      return <ClockWidget properties={widget.properties} />;
    case 'image':
    case 'video':
      return <MediaPlaylistWidget properties={widget.properties} />;
    default:
      return (
        <div className="w-full h-full bg-red-200 flex items-center justify-center">
          <p>Unknown widget type: {widget.type}</p>
        </div>
      );
  }
}
