'use server';

import { suggestWidgetDefaults, SuggestWidgetDefaultsInput } from '@/ai/flows/intelligent-widget-defaults';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export async function getWidgetDefaults(widgetType: SuggestWidgetDefaultsInput['widgetType']) {
  try {
    const result = await suggestWidgetDefaults({ widgetType });
    return result.properties;
  } catch (error) {
    console.error('Error fetching widget defaults from AI, using fallback:', error);
    
    // Return sensible fallback defaults
    if (widgetType === 'text') {
      return { content: 'New Text', color: '#000000', fontSize: 24 };
    }
    if (widgetType === 'clock') {
      return { showSeconds: true, format: '24h', color: '#000000', fontSize: 48 };
    }
    // [FIX] Handle 'video' same as 'image'
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
}