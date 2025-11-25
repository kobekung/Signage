import type { Layout } from './types';
import { PlaceHolderImages } from './placeholder-images';

const initialImage = PlaceHolderImages.find(img => img.id === 'mock-image-1');

export const mockLayout: Layout = {
  id: 'layout-1',
  name: 'Sample Layout',
  width: 1920,
  height: 1080,
  backgroundColor: '#FFFFFF',
  widgets: [
    {
      id: 'widget-1',
      type: 'text',
      x: 50,
      y: 50,
      width: 600,
      height: 100,
      zIndex: 2,
      properties: {
        content: 'Welcome to Signage Canvas!',
        color: '#000000',
        fontSize: 48,
      },
    },
    {
      id: 'widget-2',
      type: 'clock',
      x: 1470,
      y: 50,
      width: 400,
      height: 150,
      zIndex: 1,
      properties: {
        showSeconds: true,
        format: '24h',
        color: '#000000',
        fontSize: 72,
      },
    },
    {
      id: 'widget-3',
      type: 'image',
      x: 50,
      y: 200,
      width: 640,
      height: 360,
      zIndex: 1,
      properties: {
        playlist: [
          { id: 'media-1', url: 'https://picsum.photos/seed/101/640/360', type: 'image', duration: 5 },
          { id: 'media-2', url: 'https://picsum.photos/seed/102/640/360', type: 'image', duration: 10 },
          { id: 'media-3', url: 'https://picsum.photos/seed/103/640/360', type: 'image', duration: 5 },
        ]
      },
    },
  ],
};
