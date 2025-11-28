// src/lib/types.ts

export type WidgetType = 'text' | 'clock' | 'image' | 'video' | 'ticker' | 'webview';

export interface PlaylistItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  duration: number;
}
export interface Bus {
  id: number;
  name: string;
  device_id: string;
  company_id: number;
  current_layout_id: number | null;
  current_layout?: Layout; 
  updated_at?: string;
}

// -- Widget Specific Properties --
export interface TextWidgetProperties {
  content: string;
  color: string;
  fontSize: number;
}

export interface ImageWidgetProperties {
  playlist: PlaylistItem[];
  fitMode: 'cover' | 'contain' | 'fill';
}

export interface ClockWidgetProperties {
  showSeconds: boolean;
  format: '12h' | '24h';
  color: string;
  fontSize: number;
}

export interface TickerWidgetProperties {
  text: string;
  direction: 'left' | 'right' | 'up' | 'down';
  speed: number;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
}

export interface WebviewWidgetProperties {
  url: string;
}

// Union Type for all properties
export type WidgetProperties = 
  | TextWidgetProperties 
  | ImageWidgetProperties 
  | ClockWidgetProperties 
  | TickerWidgetProperties 
  | WebviewWidgetProperties
  | Record<string, any>; 

export interface Widget<T extends WidgetProperties = any> {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  properties: T; 
}

// -- Database Like Structure --
export interface Layout {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  backgroundColor: string;
  widgets: Widget[];
  thumbnail?: string; // For dashboard preview
  createdAt: string;  // ISO Date
  updatedAt: string;  // ISO Date
}

export type TemplateType = 
  | 'blank' 
  | 'split-horizontal' 
  | 'split-vertical' 
  | 'sidebar-left' 
  | 'quad-grid'
  | 'three-cols'      // NEW
  | 'three-rows'      // NEW
  | 'header-sidebar'; // NEW