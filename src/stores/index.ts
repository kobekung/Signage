'use client';

import create from 'zustand';
import { Layout, Widget, WidgetType } from '@/lib/types';
import { getWidgetDefaults } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { mockLayout } from '@/lib/mock-data';

type EditorState = {
  layout: Layout | null;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isWidgetLoading: boolean;
  
  // Actions
  loadLayout: (layout: Layout) => void;
  selectWidget: (widgetId: string | null) => void;
  updateWidgetPosition: (payload: { id: string; x: number; y: number }) => void;
  updateWidgetSize: (payload: { id: string; width: number; height: number }) => void;
  updateWidgetProperties: (payload: { id: string; properties: any }) => void;
  addWidget: (widget: Widget) => void;
  addNewWidget: (type: WidgetType) => Promise<void>;
  togglePreviewMode: () => void;
  setWidgetLoading: (isLoading: boolean) => void;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  layout: null,
  selectedWidgetId: null,
  isPreviewMode: false,
  isWidgetLoading: false,

  loadLayout: (layout) => set({ layout }),

  selectWidget: (widgetId) => set({ selectedWidgetId: widgetId }),

  updateWidgetPosition: (payload) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: state.layout.widgets.map((widget) =>
          widget.id === payload.id ? { ...widget, ...payload } : widget
        ),
      },
    };
  }),

  updateWidgetSize: (payload) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: state.layout.widgets.map((widget) =>
          widget.id === payload.id ? { ...widget, ...payload } : widget
        ),
      },
    };
  }),

  updateWidgetProperties: (payload) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: state.layout.widgets.map((widget) =>
          widget.id === payload.id ? { ...widget, ...payload } : widget
        ),
      },
    };
  }),

  addWidget: (widget) => set(state => {
    if (!state.layout) return {};
    return {
      layout: {
        ...state.layout,
        widgets: [...state.layout.widgets, widget],
      },
    };
  }),

  addNewWidget: async (type: WidgetType) => {
    set({ isWidgetLoading: true });
    try {
      const properties = await getWidgetDefaults(type);
      const state = get();
      
      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        type,
        x: 100,
        y: 100,
        width: 400,
        height: (type === 'ticker') ? 100 : 200,
        zIndex: (state.layout?.widgets.length || 0) + 1,
        properties: { ...properties },
      };

      if (type === 'image' && !newWidget.properties.playlist) {
        const defaultImage = PlaceHolderImages.find(img => img.id === 'default-image-widget');
        newWidget.properties.playlist = [{
          id: `media-${Date.now()}`,
          url: defaultImage?.imageUrl || 'https://picsum.photos/seed/10/400/300',
          type: 'image',
          duration: 10
        }];
      }

      if (type === 'ticker') {
        if (!newWidget.properties.text) {
            newWidget.properties = {
                text: 'This is a sample scrolling text. Change it in the properties panel!',
                direction: 'left',
                speed: 50,
                textColor: '#000000',
                backgroundColor: '#FFFFFF',
                fontSize: 48,
            }
        }
      }

      set(state => ({
        layout: state.layout ? {
          ...state.layout,
          widgets: [...state.layout.widgets, newWidget],
        } : state.layout,
        selectedWidgetId: newWidget.id,
      }));

    } catch (e) {
      console.error("Failed to add widget:", e);
    } finally {
      set({ isWidgetLoading: false });
    }
  },

  togglePreviewMode: () => set(state => ({ 
    isPreviewMode: !state.isPreviewMode, 
    selectedWidgetId: null 
  })),
  
  setWidgetLoading: (isLoading) => set({ isWidgetLoading: isLoading }),
}));

// Initialize the store with mock data
useEditorStore.getState().loadLayout(mockLayout);
