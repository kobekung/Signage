'use client';

import { create } from 'zustand';
import { Layout, Widget, WidgetType, TemplateType } from '@/lib/types';
import { getWidgetDefaults } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createLayoutFromTemplate } from '@/lib/template-helpers';
// Import API functions
import { 
    getLayouts, 
    getLayout as apiGetLayout, 
    createLayout as apiCreateLayout, 
    saveLayout as apiSaveLayout, 
    deleteLayout as apiDeleteLayout, 
    getLayoutSelect
} from '@/apis';

interface UserInfo {
  token: string | null;
  com_id: number | null;
  account_id: number | null;
  account_role: string | null;
  account_name: string | null;
  account_username: string | null;
  translation: string;
}

const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type ViewState = {
  scale: number;
  panX: number;
  panY: number;
};
type AppView = 'dashboard' | 'editor' | 'buses';

type EditorState = {
  currentView: AppView;
  savedLayouts: Layout[];
  savedLayoutSelected: Layout[];

  layout: Layout | null;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isWidgetLoading: boolean;
  isLayoutsLoading: boolean;
  hasInitialized: boolean;
  viewState: ViewState;
  userInfo: UserInfo;
  
  // [NEW] Pagination State
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };

  setUserInfo: (info: Partial<UserInfo>) => void;
  logout: () => void;
  
  // Actions
  fetchLayouts: (page?: number) => Promise<void>; // [MODIFIED] รับ page ได้
  fetchSelectedLayout: () => Promise<void>; // [NEW]
  createLayout: (name: string, template: TemplateType) => Promise<void>;
  editLayout: (id: string) => void;
  deleteLayout: (id: string) => Promise<void>;
  saveCurrentLayout: () => Promise<void>;
  backToDashboard: () => void;
  navigateToBuses: () => void;

  // Editor actions
  loadLayout: (layout: Layout) => void;
  selectWidget: (widgetId: string | null) => void;
  updateWidgetPosition: (payload: { id: string; x: number; y: number }) => void;
  updateWidgetSize: (payload: { id: string; width: number; height: number }) => void;
  updateWidgetProperties: (payload: { id: string; properties: any }) => void;
  updateLayoutDimensions: (payload: { width: number; height: number }) => void;
  addWidget: (widget: Widget) => void;
  addNewWidget: (type: WidgetType) => Promise<void>;
  deleteWidget: (widgetId: string) => void;
  changeWidgetType: (id: string, newType: WidgetType) => Promise<void>;
  togglePreviewMode: () => void;
  setWidgetLoading: (isLoading: boolean) => void;
  setViewState: (viewState: Partial<ViewState>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: (viewportWidth: number, viewportHeight: number) => void;
  resetView: (viewportWidth: number, viewportHeight: number) => void;
  applyTemplate: (template: TemplateType) => void;
};

const defaultLayoutConfig = {
    name: 'Untitled Layout',
    width: 1920,
    height: 1080,
    backgroundColor: '#FFFFFF',
    widgets: []
};

export const useEditorStore = create<EditorState>((set, get) => ({
  currentView: 'dashboard',
  savedLayouts: [],
  savedLayoutSelected: [],
  
  layout: null,
  selectedWidgetId: null,
  isPreviewMode: false,
  isWidgetLoading: false,
  hasInitialized: false,
  viewState: { scale: 1, panX: 0, panY: 0 },

  userInfo: {
    token: null,
    com_id: null,
    account_id: null,
    account_role: null,
    account_name: null,
    account_username: null,
    translation: 'EN',
  },

  // [NEW] Initialize Pagination
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0
  },

  setUserInfo: (info) => {
      console.log("🔒 Store: Updating User Info", info);
      set((state) => ({
        userInfo: { ...state.userInfo, ...info }
      }));
  },

  logout: () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
    set((state) => ({
        userInfo: {
            token: null,
            com_id: null,
            account_id: null,
            account_role: null,
            account_name: null,
            account_username: null,
            translation: 'EN',
        },
        currentView: 'dashboard',
        layout: null
    }));
  },
  
  isLayoutsLoading: true,

  // [MODIFIED] Fetch Layouts with Pagination
  fetchLayouts: async (page = 1) => {
      set({ isLayoutsLoading: true });
      try {
          // เรียก API แบบใหม่ที่ส่ง page ไปด้วย
/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Create a new layout based on the given template and name.
   * 
   * 1. Prepare basic layout data (using defaultLayoutConfig).
   * 2. Apply template (client-side logic to generate widgets).
   * 3. Send to Backend and update state accordingly.
   * 
   * @param {string} name - The name of the new layout.
   * @param {TemplateType} template - The template to use for generating widgets.
   */
/*******  97850fe2-8aa8-4c39-aa15-34e813a46393  *******/          // ซึ่ง API getLayouts ใน src/apis/index.ts ควร return { data, pagination }
          const response: any = await getLayouts(page);
          
          // ตรวจสอบโครงสร้างข้อมูลที่ได้จาก API
          // กรณี API ส่งมาเป็น { data: [...], pagination: {...} }
          const layouts = response.data || []; 
          const paginationData = response.pagination || { page: 1, totalPages: 1, totalItems: 0 };

          set({ 
            savedLayouts: layouts,
            pagination: paginationData
          });

      } catch (error) {
          console.error("Fetch Error:", error);
          set({ savedLayouts: [] });
      } finally {
          set({ isLayoutsLoading: false });
      }
  },
  fetchSelectedLayout: async () => {
      const layouts = await getLayoutSelect();
      set({ savedLayoutSelected: layouts });
  },

  createLayout: async (name, template) => {
    // ... (logic เดิม)
    const newLayoutBase: any = {
        ...defaultLayoutConfig,
        name: name || 'Untitled Layout',
    };
    
    const layoutWithWidgets = createLayoutFromTemplate(newLayoutBase, template);
    
    try {
        const createdLayout = await apiCreateLayout(layoutWithWidgets);
        
        set(state => ({
            savedLayouts: [createdLayout, ...state.savedLayouts],
            layout: createdLayout,
            currentView: 'editor',
            hasInitialized: true,
            viewState: { scale: 1, panX: 0, panY: 0 }
        }));
    } catch (error) {
        console.error("Failed to create layout", error);
        throw error; // [FIX] เพิ่มบรรทัดนี้ เพื่อส่ง error กลับไปให้ Dashboard รู้ตัว
    }
  },

 editLayout: async (id) => {
    set({ isWidgetLoading: true });
    try {
        const layoutData = await apiGetLayout(id);
        
        if (layoutData) {
            set({ 
                layout: layoutData,
                currentView: 'editor',
                selectedWidgetId: null,
                hasInitialized: true,
                viewState: { scale: 1, panX: 0, panY: 0 }
            });
        } else {
            console.error("Layout not found");
        }
    } catch (error) {
        console.error("Failed to fetch layout:", error);
    } finally {
        set({ isWidgetLoading: false });
    }
  },

  deleteLayout: async (id) => {
    try {
        await apiDeleteLayout(id);
        // หลังจากลบ ให้ดึงข้อมูลใหม่หน้าเดิม เพื่ออัปเดต List และ Pagination
        const currentPage = get().pagination.page;
        await get().fetchLayouts(currentPage);
    } catch (error) {
        console.error("Failed to delete layout", error);
    }
  },

  saveCurrentLayout: async () => {
    const currentLayout = get().layout;
    if (!currentLayout) return;
    
    try {
        const updatedLayout = { ...currentLayout, updatedAt: new Date().toISOString() };
        await apiSaveLayout(updatedLayout);
        
        set(state => ({
            layout: updatedLayout,
            savedLayouts: state.savedLayouts.map(l => 
                l.id === updatedLayout.id ? updatedLayout : l
            )
        }));
    } catch (error) {
        console.error("Failed to save layout", error);
    }
  },

  navigateToBuses: () => {
      set({ currentView: 'buses', selectedWidgetId: null });
  },
  
  backToDashboard: () => {
      // เมื่อกลับมาหน้า Dashboard ให้โหลดหน้า 1 ใหม่เสมอ หรือจะใช้หน้าล่าสุดก็ได้
      get().fetchLayouts(1); 
      set({ currentView: 'dashboard', layout: null, hasInitialized: false });
  },

  addNewWidget: async (type) => {
    set({ isWidgetLoading: true });
    try {
      const properties = await getWidgetDefaults(type);
      const state = get();
      
      if (state.selectedWidgetId) {
         const selectedWidget = state.layout?.widgets.find(w => w.id === state.selectedWidgetId);
         if (selectedWidget) {
             await state.changeWidgetType(state.selectedWidgetId, type);
             set({ isWidgetLoading: false });
             return;
         }
      }

      const newWidget: Widget = {
        id: generateTempId(),
        type,
        x: 100, y: 100,
        width: type === 'webview' ? 600 : 400,
        height: type === 'ticker' ? 100 : 200,
        zIndex: (state.layout?.widgets.length || 0) + 1,
        properties: { ...properties },
      };

      if (type === 'image' || type === 'video') {
        newWidget.properties.fitMode = 'fill';
        if (!newWidget.properties.playlist) {
            const defaultImage = PlaceHolderImages.find(img => img.id === 'default-image-widget');
            newWidget.properties.playlist = [{
                id: generateTempId(),
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

  loadLayout: (layout) => set({ layout, hasInitialized: true }),
  selectWidget: (widgetId) => set({ selectedWidgetId: widgetId }),
  updateWidgetPosition: (payload) => set(state => {
    if (!state.layout) return {};
    return { layout: { ...state.layout, widgets: state.layout.widgets.map((w) => w.id === payload.id ? { ...w, ...payload } : w) } };
  }),
  updateWidgetSize: (payload) => set(state => {
    if (!state.layout) return {};
    return { layout: { ...state.layout, widgets: state.layout.widgets.map((w) => w.id === payload.id ? { ...w, ...payload } : w) } };
  }),
  updateWidgetProperties: (payload) => set(state => {
    if (!state.layout) return {};
    return { layout: { ...state.layout, widgets: state.layout.widgets.map((w) => w.id === payload.id ? { ...w, properties: payload.properties } : w) } };
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
    return { layout: { ...state.layout, widgets: state.layout.widgets.filter(w => w.id !== widgetId) }, selectedWidgetId: null };
  }),
  changeWidgetType: async (id, newType) => {
      set({ isWidgetLoading: true });
      try {
        const defaultProps = await getWidgetDefaults(newType);
        set(state => {
          if (!state.layout) return {};
          const updatedWidgets = state.layout.widgets.map(w => {
            if (w.id === id) return { ...w, type: newType, properties: defaultProps };
            return w;
          });
          return { layout: { ...state.layout, widgets: updatedWidgets }, selectedWidgetId: id };
        });
      } catch (error) { console.error(error); } finally { set({ isWidgetLoading: false }); }
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
}));