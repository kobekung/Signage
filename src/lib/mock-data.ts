// src/lib/mock-data.ts
import { Layout } from './types';

// Helper for dates
const now = new Date().toISOString();

// จำลอง Database
export const mockDatabase: Layout[] = [
  {
    id: 'layout-demo-1',
    name: 'Main Lobby Display',
    description: 'Welcome screen for the main entrance',
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
    createdAt: now,
    updatedAt: now,
    widgets: [
      {
        id: 'w-1',
        type: 'clock',
        x: 50,
        y: 50,
        width: 400,
        height: 150,
        zIndex: 2,
        properties: { showSeconds: true, format: '24h', color: '#333333', fontSize: 64 }
      },
      {
        id: 'w-2',
        type: 'ticker',
        x: 0,
        y: 980,
        width: 1920,
        height: 100,
        zIndex: 3,
        properties: { 
            text: 'Welcome to our office! Please register at the reception desk.', 
            direction: 'left', 
            speed: 50, 
            textColor: '#ffffff', 
            backgroundColor: '#2563eb', 
            fontSize: 32 
        }
      }
    ]
  },
  {
    id: 'layout-demo-2',
    name: 'Vertical Menu',
    description: 'Cafeteria daily menu',
    width: 1080,
    height: 1920, 
    backgroundColor: '#f8fafc',
    createdAt: now,
    updatedAt: now,
    widgets: []
  }
];

// Default Template for new layouts
export const defaultLayoutConfig: Layout = {
    id: 'temp-new',
    name: 'Untitled Layout',
    width: 1920,
    height: 1080,
    backgroundColor: '#FFFFFF',
    widgets: [],
    createdAt: now,
    updatedAt: now,
};