// src/lib/types.ts

export type WidgetType = 'text' | 'clock' | 'image' | 'video' | 'ticker' | 'webview';

export interface PlaylistItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  duration: number;
  // [NEW] ย้ายมาอยู่ที่นี่
  locationId?: string;
  fullscreen?: boolean;
}

export interface WidgetProperties {
    // [REMOVE] ลบ fullscreen และ locationId ออกจากตรงกลาง
    // (เหลือไว้แค่ props ทั่วไป)
    playlist?: PlaylistItem[];
    content?: string;
    text?: string;
    url?: string;
    color?: string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    speed?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    fitMode?: 'cover' | 'contain' | 'fill';
    showSeconds?: boolean;
    format?: '12h' | '24h';
    timezone?: string;
    
    [key: string]: any;
}

export interface Widget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  properties: WidgetProperties;
}

export interface Layout {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  backgroundColor: string;
  widgets: Widget[];
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TemplateType = 'blank' | 'split-horizontal' | 'split-vertical' | 'sidebar-left' | 'quad-grid' | 'three-cols' | 'three-rows' | 'header-sidebar';

export interface Bus {
  id: number;
  name: string;
  device_id: string;
  company_id: number;
  current_layout_id: number | null;
  current_layout?: Layout; 
  updated_at?: string;
}