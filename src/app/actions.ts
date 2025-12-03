// 'use server';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { WidgetType, WidgetProperties } from '@/lib/types'; // [1] เพิ่ม WidgetProperties

// [2] กำหนด Return Type เป็น Promise<WidgetProperties>
export async function getWidgetDefaults(widgetType: WidgetType): Promise<WidgetProperties> {
  
  if (widgetType === 'text') {
    return { content: 'New Text', color: '#000000', fontSize: 24 };
  }
  
  if (widgetType === 'clock') {
    return { 
        showSeconds: true, 
        format: '24h', // ตอนนี้ TS จะรู้แล้วว่านี่คือ Type "24h" ไม่ใช่ string
        color: '#000000', 
        fontSize: 48 
    };
  }
  
  if (widgetType === 'image' || widgetType === 'video') {
    const defaultImage = PlaceHolderImages.find(img => img.id === 'default-image-widget');
    return { 
      fitMode: 'fill',
      playlist: [{
        id: `media-${Date.now()}`,
        url: defaultImage?.imageUrl || 'https://picsum.photos/seed/10/400/300',
        type: 'image',
        duration: 10
      }]
    };
  }
  
  if (widgetType === 'ticker') {
      return {
          text: 'This is a sample scrolling text. Change it in the properties panel!',
          direction: 'left',
          speed: 50,
          textColor: '#000000',
          backgroundColor: '#FFFFFF',
          fontSize: 48,
      }
  }
  
  if (widgetType === 'webview') {
      return { url: 'https://www.google.com' };
  }
  
  return {};
}