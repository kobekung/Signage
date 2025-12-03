'use client';

import { create } from 'zustand';
import { Layout, Widget, WidgetType, TemplateType } from '@/lib/types';
import { getWidgetDefaults } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createLayoutFromTemplate } from '@/lib/template-helpers';
// Import API functions
import { 
    getLayouts, 
    getLayout as apiGetLayout, // [NEW] Import เพิ่ม
    createLayout as apiCreateLayout, 
    saveLayout as apiSaveLayout, 
    deleteLayout as apiDeleteLayout 
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
// ใช้ temporary ID generator สำหรับ widget ใหม่ที่ยังไม่ลง DB
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

  layout: Layout | null;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isWidgetLoading: boolean;
  hasInitialized: boolean;
  viewState: ViewState;
  userInfo: UserInfo;
  setUserInfo: (info: Partial<UserInfo>) => void;
  logout: () => void;
  
  // Actions
  fetchLayouts: () => Promise<void>; // [NEW]
  createLayout: (name: string, template: TemplateType) => Promise<void>; // [Async]
  editLayout: (id: string) => void;
  deleteLayout: (id: string) => Promise<void>; // [Async]
  saveCurrentLayout: () => Promise<void>; // [Async]
  backToDashboard: () => void;
  navigateToBuses: () => void;

  // ... Editor actions (เหมือนเดิม) ...
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

// Default empty layout config (สำหรับตอนเริ่มสร้าง)
const defaultLayoutConfig = {
    name: 'Untitled Layout',
    width: 1920,
    height: 1080,
    backgroundColor: '#FFFFFF',
    widgets: []
};

export const useEditorStore = create<EditorState>((set, get) => ({
  currentView: 'dashboard',
  savedLayouts: [], // เริ่มต้นว่างเปล่า รอ fetch
  
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

  // [NEW] Actions for User Info
  setUserInfo: (info) => {
      console.log("🔒 Store: Updating User Info", info); // Debug
      set((state) => ({
        userInfo: { ...state.userInfo, ...info }
      }));
  },

  logout: () => {
    // ลบ Token จาก Storage ด้วย
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
    // Reset State
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
        // อาจจะ reset view ด้วยถ้าต้องการ
        currentView: 'dashboard',
        layout: null
    }));
  },

  // [NEW] Fetch Layouts from Backend
  fetchLayouts: async () => {
      const layouts = await getLayouts();
      set({ savedLayouts: layouts });
  },

  createLayout: async (name, template) => {
    // 1. Prepare basic layout data
    const newLayoutBase: any = {
        ...defaultLayoutConfig,
        name: name || 'Untitled Layout',
    };
    
    // 2. Apply template (client-side logic to generate widgets)
    const layoutWithWidgets = createLayoutFromTemplate(newLayoutBase, template);
    
    // 3. Send to Backend
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
        // Handle error (show toast etc.)
    }
  },

 editLayout: async (id) => {
    set({ isWidgetLoading: true }); // แสดง Loading (ถ้ามี UI รองรับ)
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
        set(state => ({
            savedLayouts: state.savedLayouts.filter(l => l.id !== id)
        }));
    } catch (error) {
        console.error("Failed to delete layout", error);
    }
  },
  

  saveCurrentLayout: async () => {
    const currentLayout = get().layout;
    if (!currentLayout) return;
    
    try {
        // Update timestamp
        const updatedLayout = { ...currentLayout, updatedAt: new Date().toISOString() };
        
        // Call API
        await apiSaveLayout(updatedLayout);
        
        // Update local list
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
      get().fetchLayouts(); // Refresh ข้อมูลเมื่อกลับมา
      set({ currentView: 'dashboard', layout: null, hasInitialized: false });
  },

  // ... (ส่วน Editor Actions อื่นๆ เหมือนเดิม แต่ใช้ generateTempId สำหรับ widget ใหม่) ...

  addNewWidget: async (type) => {
    set({ isWidgetLoading: true });
    try {
      const properties = await getWidgetDefaults(type);
      const state = get();
      
      // [NEW LOGIC] หาว่ามี Widget ไหนที่ "ถูกเลือกอยู่" (Selected) หรือไม่?
      // ถ้ามีการเลือกช่องอยู่ ให้ "แทนที่ (Replace)" Widget นั้นไปเลย
      // นี่คือวิธีที่ Figma หรือเครื่องมือแต่งเว็บทำกัน คือเลือกกล่อง -> กดเปลี่ยน Content
      
      if (state.selectedWidgetId) {
         const selectedWidget = state.layout?.widgets.find(w => w.id === state.selectedWidgetId);
         if (selectedWidget) {
             // อัปเดต Widget เดิมให้กลายเป็น Type ใหม่ (รักษาตำแหน่งและขนาดเดิมไว้)
             await state.changeWidgetType(state.selectedWidgetId, type);
             set({ isWidgetLoading: false });
             return; // จบการทำงาน ไม่ต้องสร้างใหม่
         }
      }

      // --- ถ้าไม่ได้เลือกช่องไหนไว้ ก็สร้างใหม่ตรงกลาง (Logic เดิม) ---
      
      const newWidget: Widget = {
        id: generateTempId(),
        type,
        x: 100, y: 100, // Default Position
        width: type === 'webview' ? 600 : 400,
        height: type === 'ticker' ? 100 : 200,
        zIndex: (state.layout?.widgets.length || 0) + 1,
        properties: { ...properties },
      };

      // ... (Playlist setup logic) ...
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

  // ... (Copy ฟังก์ชันอื่นๆ loadLayout, selectWidget, etc. จากไฟล์เดิมมาใส่ต่อได้เลย) ...
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