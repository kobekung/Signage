'use client';

import React, { createContext, useReducer, useContext, Dispatch, ReactNode } from 'react';
import { Layout, Widget, WidgetType } from '@/lib/types';
import { mockLayout } from '@/lib/mock-data';
import { getWidgetDefaults } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type State = {
  layout: Layout | null;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isWidgetLoading: boolean;
};

type Action =
  | { type: 'LOAD_LAYOUT'; payload: Layout }
  | { type: 'SELECT_WIDGET'; payload: string | null }
  | { type: 'UPDATE_WIDGET_POSITION'; payload: { id: string; x: number; y: number } }
  | { type: 'UPDATE_WIDGET_SIZE'; payload: { id: string; width: number; height: number } }
  | { type: 'UPDATE_WIDGET_PROPERTIES'; payload: { id: string; properties: any } }
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SET_WIDGET_LOADING', payload: boolean };


const initialState: State = {
  layout: null,
  selectedWidgetId: null,
  isPreviewMode: false,
  isWidgetLoading: false,
};

const EditorReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_LAYOUT':
      return { ...state, layout: action.payload };
    case 'SELECT_WIDGET':
      return { ...state, selectedWidgetId: action.payload };
    case 'UPDATE_WIDGET_POSITION':
    case 'UPDATE_WIDGET_SIZE':
    case 'UPDATE_WIDGET_PROPERTIES':
      if (!state.layout) return state;
      return {
        ...state,
        layout: {
          ...state.layout,
          widgets: state.layout.widgets.map((widget) =>
            widget.id === action.payload.id ? { ...widget, ...action.payload } : widget
          ),
        },
      };
    case 'ADD_WIDGET':
      if (!state.layout) return state;
      return {
        ...state,
        layout: {
          ...state.layout,
          widgets: [...state.layout.widgets, action.payload],
        },
      };
    case 'TOGGLE_PREVIEW_MODE':
      return { ...state, isPreviewMode: !state.isPreviewMode, selectedWidgetId: null };
    case 'SET_WIDGET_LOADING':
      return { ...state, isWidgetLoading: action.payload };
    default:
      return state;
  }
};

const EditorStateContext = createContext<State | undefined>(undefined);
const EditorDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(EditorReducer, initialState);

  return (
    <EditorStateContext.Provider value={state}>
      <EditorDispatchContext.Provider value={dispatch}>
        {children}
      </EditorDispatchContext.Provider>
    </EditorStateContext.Provider>
  );
};

export const useEditorState = () => {
  const context = useContext(EditorStateContext);
  if (context === undefined) {
    throw new Error('useEditorState must be used within a EditorProvider');
  }
  return context;
};

export const useEditorDispatch = () => {
  const context = useContext(EditorDispatchContext);
  if (context === undefined) {
    throw new Error('useEditorDispatch must be used within a EditorProvider');
  }
  return context;
};

export const useEditor = () => {
  const state = useEditorState();
  const dispatch = useEditorDispatch();

  React.useEffect(() => {
    dispatch({ type: 'LOAD_LAYOUT', payload: mockLayout });
  }, [dispatch]);

  const addWidget = async (type: WidgetType) => {
    dispatch({ type: 'SET_WIDGET_LOADING', payload: true });
    try {
      const properties = await getWidgetDefaults(type);
      
      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        type,
        x: 100,
        y: 100,
        width: 400,
        height: 200,
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

      dispatch({ type: 'ADD_WIDGET', payload: newWidget });
      dispatch({ type: 'SELECT_WIDGET', payload: newWidget.id });
    } catch (e) {
      console.error("Failed to add widget:", e);
    } finally {
      dispatch({ type: 'SET_WIDGET_LOADING', payload: false });
    }
  };

  return { ...state, dispatch, addWidget };
};
