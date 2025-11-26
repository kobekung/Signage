'use client';

import { create } from 'zustand';
import { Layout, Widget, WidgetType, TemplateType } from '@/lib/types';
import { getWidgetDefaults } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { mockDatabase, defaultLayoutConfig } from '@/lib/mock-data';
import { createLayoutFromTemplate } from '@/lib/template-helpers';

// Helper to generate IDs
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type ViewState = {
  scale: number;
  panX: number;
  panY: number;
};

type AppView = 'dashboard' | 'editor';

type EditorState = {
  // --- Global App State ---
  currentView: AppView;
  savedLayouts: Layout[]; // Mock Database in Memory

  // --- Editor State ---
  layout: Layout | null;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isWidgetLoading: boolean;
  hasInitialized: boolean;
  viewState: ViewState;
  
  // --- Actions ---
  // Dashboard
  createLayout: (name: string, template: TemplateType) => void;
  editLayout: (id: string) => void;
  deleteLayout: (id: string) => void;
  saveCurrentLayout: () => void;
  backToDashboard: () => void;

  // Editor
  loadLayout: (layout: Layout) => void;
  selectWidget: (widgetId: string | null) => void;
  updateWidgetPosition: (payload: { id: string; x: number; y: number }) => void;
  updateWidgetSize: (payload: { id: string; width: number; height: number }) => void;
  updateWidgetProperties: (payload: { id: string; properties: any }) => void;
  updateLayoutDimensions: (payload: { width: number; height: number }) => void;
  addWidget: (widget: Widget) => void;
  addNewWidget: (type: WidgetType) => Promise<void>;
  deleteWidget: (widgetId: string) => void;
  togglePreviewMode: () => void;
  setWidgetLoading: (isLoading: boolean) => void;
  
  // View Control
  setViewState: (viewState: Partial<ViewState>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: (viewportWidth: number, viewportHeight: number) => void;
  resetView: (viewportWidth: number, viewportHeight: number) => void;
  applyTemplate: (template: TemplateType) => void;
  changeWidgetType: (id: string, newType: WidgetType) => Promise<void>;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  currentView: 'dashboard', // Start at dashboard
  savedLayouts: mockDatabase,
  
  layout: null,
  selectedWidgetId: null,
  isPreviewMode: false,
  isWidgetLoading: false,
  hasInitialized: false,
  viewState: { scale: 1, panX: 0, panY: 0 },

  // --- Dashboard Logic ---
  createLayout: (name, template) => {
    const newLayoutBase: Layout = {
        ...defaultLayoutConfig,
        id: generateId(),
        name: name || 'Untitled Layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    const layoutWithWidgets = createLayoutFromTemplate(newLayoutBase, template);
    
    set(state => ({
        savedLayouts: [...state.savedLayouts, layoutWithWidgets],
        layout: layoutWithWidgets,
        currentView: 'editor',
        hasInitialized: true,
        viewState: { scale: 1, panX: 0, panY: 0 }
    }));
  },

  editLayout: (id) => {
    const layoutToEdit = get().savedLayouts.find(l => l.id === id);
    if (layoutToEdit) {
        // Deep copy to prevent mutating store directly
        const layoutCopy = JSON.parse(JSON.stringify(layoutToEdit));
        set({ 
            layout: layoutCopy,
            currentView: 'editor',
            selectedWidgetId: null,
            hasInitialized: true,
            viewState: { scale: 1, panX: 0, panY: 0 }
        });
    }
  },

  deleteLayout: (id) => set(state => ({
    savedLayouts: state.savedLayouts.filter(l => l.id !== id)
  })),

  saveCurrentLayout: () => set(state => {
    if (!state.layout) return {};
    const updatedLayout = { ...state.layout, updatedAt: new Date().toISOString() };
    
    const updatedList = state.savedLayouts.map(l => 
        l.id === updatedLayout.id ? updatedLayout : l
    );

    // If it's a new layout not in list (edge case), add it
    const exists = state.savedLayouts.some(l => l.id === updatedLayout.id);
    const finalList = exists ? updatedList : [...state.savedLayouts, updatedLayout];

    return { savedLayouts: finalList, layout: updatedLayout };
  }),

  backToDashboard: () => {
      set({ currentView: 'dashboard', layout: null, hasInitialized: false });
  },

  // --- Editor Logic ---
  loadLayout: (layout) => set({ layout, hasInitialized: true }),

  selectWidget: (widgetId) => set({ selectedWidgetId: widgetId }),

  updateWidgetPosition: (payload) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: state.layout.widgets.map((w) => w.id === payload.id ? { ...w, ...payload } : w),
      },
    };
  }),

  updateWidgetSize: (payload) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: state.layout.widgets.map((w) => w.id === payload.id ? { ...w, ...payload } : w),
      },
    };
  }),

  updateWidgetProperties: (payload) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: state.layout.widgets.map((w) => w.id === payload.id ? { ...w, properties: payload.properties } : w),
      },
    };
  }),
  
  updateLayoutDimensions: (payload) => set(state => {
    if (!state.layout) return {};
    return { layout: { ...state.layout, width: payload.width, height: payload.height } };
  }),

  addWidget: (widget) => set(state => {
    if (!state.layout) return {};
    return { layout: { ...state.layout, widgets: [...state.layout.widgets, widget] } };
  }),
  
  deleteWidget: (widgetId) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: state.layout.widgets.filter(w => w.id !== widgetId),
      },
      selectedWidgetId: null,
    };
  }),

  addNewWidget: async (type) => {
    set({ isWidgetLoading: true });
    try {
      const properties = await getWidgetDefaults(type);
      const state = get();
      
      const newWidget: Widget = {
        id: generateId(),
        type,
        x: 100, y: 100,
        width: type === 'webview' ? 600 : 400,
        height: type === 'ticker' ? 100 : 200,
        zIndex: (state.layout?.widgets.length || 0) + 1,
        properties: { ...properties },
      };

      if (type === 'image') {
        newWidget.properties.fitMode = 'fill';
        if (!newWidget.properties.playlist) {
            const defaultImage = PlaceHolderImages.find(img => img.id === 'default-image-widget');
            newWidget.properties.playlist = [{
                id: generateId(),
                url: defaultImage?.imageUrl || 'https://picsum.photos/seed/10/400/300',
                type: 'image',
                duration: 10
            }];
        }
      }

      set(state => ({
        layout: state.layout ? {
          ...state.layout,
          widgets: [...state.layout.widgets, newWidget],
        } : null,
        selectedWidgetId: newWidget.id,
      }));

    } catch (e) {
      console.error("Failed to add widget:", e);
    } finally {
      set({ isWidgetLoading: false });
    }
  },

  togglePreviewMode: () => set(state => ({ isPreviewMode: !state.isPreviewMode, selectedWidgetId: null })),
  setWidgetLoading: (isLoading) => set({ isWidgetLoading: isLoading }),
  setViewState: (newViewState) => set(state => ({ viewState: { ...state.viewState, ...newViewState } })),
  zoomIn: () => set(state => ({ viewState: { ...state.viewState, scale: state.viewState.scale + 0.1 } })),
  zoomOut: () => set(state => ({ viewState: { ...state.viewState, scale: Math.max(0.1, state.viewState.scale - 0.1) } })),

  fitToScreen: (viewportWidth, viewportHeight) => {
    const layout = get().layout;
    if (!layout) return;
    const padding = 50;
    const scale = Math.min((viewportWidth - padding * 2) / layout.width, (viewportHeight - padding * 2) / layout.height);
    const panX = (viewportWidth - layout.width * scale) / 2;
    const panY = (viewportHeight - layout.height * scale) / 2;
    set({ viewState: { scale, panX, panY } });
  },

  resetView: (viewportWidth, viewportHeight) => {
    const layout = get().layout;
    if (!layout) return;
    const scale = 1;
    const panX = (viewportWidth - layout.width * scale) / 2;
    const panY = (viewportHeight - layout.height * scale) / 2;
    set({ viewState: { scale, panX, panY } });
  },
  
  applyTemplate: (template) => set(state => {
    if (!state.layout) return {}; 
    const newLayout = createLayoutFromTemplate(state.layout, template);
    return { layout: newLayout, selectedWidgetId: null };
  }),
  changeWidgetType: async (id: string, newType: WidgetType) => {
    set({ isWidgetLoading: true });
    try {
      // 1. โหลดค่าเริ่มต้นของ Widget ประเภทใหม่ (เช่น ถ้าเปลี่ยนเป็น Clock ก็ไปเอาค่า setting ของนาฬิกามา)
      const defaultProps = await getWidgetDefaults(newType);
      
      set(state => {
        if (!state.layout) return {};
        
        // 2. อัปเดต Widget ใน List
        const updatedWidgets = state.layout.widgets.map(w => {
          if (w.id === id) {
            return {
              ...w,
              type: newType,       // เปลี่ยน Type
              properties: defaultProps // ใส่ค่าเริ่มต้นใหม่เข้าไป
            };
          }
          return w;
        });

        return { 
            layout: { ...state.layout, widgets: updatedWidgets },
            // อัปเดต selectedWidgetId ให้ UI รู้ว่ายังเลือกตัวเดิมอยู่ (แม้ไส้ในจะเปลี่ยนแล้ว)
            selectedWidgetId: id 
        };
      });
    } catch (error) {
      console.error("Failed to change widget type:", error);
    } finally {
      set({ isWidgetLoading: false });
    }
  },
}));