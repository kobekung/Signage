// 'use server'; // <--- ลบบรรทัดนี้ออก (ห้ามมี use server ใน static export)

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { WidgetType } from '@/lib/types';

// ลบ import ที่เกี่ยวกับ AI ออกให้หมด เพราะ Static Web รัน Genkit ไม่ได้
// import { suggestWidgetDefaults } from '@/ai/flows/intelligent-widget-defaults'; 

export async function getWidgetDefaults(widgetType: WidgetType) {
  // Logic แบบ Manual Fallback (ทำงานได้บน Browser)
  
  if (widgetType === 'text') {
    return { content: 'New Text', color: '#000000', fontSize: 24 };
  }
  
  if (widgetType === 'clock') {
    return { showSeconds: true, format: '24h', color: '#000000', fontSize: 48 };
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
          text: 'Welcome to Digital Signage',
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