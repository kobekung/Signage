// src/lib/types.ts

export type WidgetType = 'text' | 'clock' | 'image' | 'video' | 'ticker' | 'webview';

export interface PlaylistItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  duration: number;
  locationId?: string; // [NEW] ย้ายมาอยู่ที่นี่
  fullscreen?: boolean; // [NEW]
}

// รวม Properties ทุกอย่างไว้ในนี้ เพื่อความยืดหยุ่นของ Database
export interface WidgetProperties {
    // Common / Text / Ticker
    content?: string;
    text?: string;
    color?: string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    speed?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    
    // Media
    url?: string;
    fitMode?: 'cover' | 'contain' | 'fill';
    playlist?: PlaylistItem[];
    
    // Clock
    showSeconds?: boolean;
    format?: '12h' | '24h';
    timezone?: string;
    
    // Others
    [key: string]: any; // อนุญาตให้ใส่ค่าอื่นๆ ได้
}

// [FIX] สร้าง Alias ชื่อเดิม เพื่อให้ไฟล์ Properties อื่นๆ ไม่ Error
export type TextWidgetProperties = WidgetProperties;
export type ClockWidgetProperties = WidgetProperties;
export type ImageWidgetProperties = WidgetProperties;
export type TickerWidgetProperties = WidgetProperties;
export type WebviewWidgetProperties = WidgetProperties;

// Widget Generic
export interface Widget<T = WidgetProperties> {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  properties: T;
}

export interface Layout {
  id: string | number; // รองรับทั้ง String/Int
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
  bus_id: number;
  bus_name: string;
  device_id: string;
  bus_com_id: number;
  current_layout_id: number | null;
  current_layout?: Layout; 
  updated_at?: string;
}