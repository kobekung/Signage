import { Layout } from '@/lib/types';
import { mockLayout } from '@/lib/mock-data';

// This is a mock API. In a real application, these functions would
// make network requests to a backend service.

/**
 * Fetches all available layouts.
 * @returns A promise that resolves to an array of layouts.
 */
export const getLayouts = async (): Promise<Layout[]> => {
  console.log('API: Fetching all layouts');
  // In a real app, you might fetch from '/api/layouts'
  return new Promise(resolve => setTimeout(() => resolve([mockLayout]), 500));
};

/**
 * Fetches a single layout by its ID.
 * @param layoutId The ID of the layout to fetch.
 * @returns A promise that resolves to the layout, or null if not found.
 */
export const getLayout = async (layoutId: string): Promise<Layout | null> => {
  console.log(`API: Fetching layout with id ${layoutId}`);
  // In a real app, this would be `/api/layouts/${layoutId}`
  if (layoutId === mockLayout.id) {
    return new Promise(resolve => setTimeout(() => resolve(mockLayout), 500));
  }
  return Promise.resolve(null);
};

/**
 * Saves a layout.
 * @param layout The layout object to save.
 * @returns A promise that resolves when the save is complete.
 */
export const saveLayout = async (layout: Layout): Promise<void> => {
  console.log('API: Saving layout', layout);
  // In a real app, this would be a POST or PUT to `/api/layouts/${layout.id}`
  // Here we just log it and resolve.
  return new Promise(resolve => setTimeout(() => resolve(), 500));
};

/**
 * Creates a new layout.
 * @param layout The initial layout data.
 * @returns A promise that resolves to the created layout (with a new ID).
 */
export const createLayout = async (layout: Omit<Layout, 'id'>): Promise<Layout> => {
    console.log('API: Creating new layout', layout);
    const newLayout = {
        ...layout,
        id: `layout-${Date.now()}`
    };
    // In a real app, you would POST to `/api/layouts` and get the new object back.
    return new Promise(resolve => setTimeout(() => resolve(newLayout), 500));
}
