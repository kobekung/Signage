import { Layout, Widget, Bus } from '@/lib/types';

// เปลี่ยน URL Backend ให้ถูกต้อง
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// [NEW] Hardcode Company ID ไว้ก่อน (ในอนาคตอาจดึงจาก Login Token)
const COMPANY_ID = 1;

// Helper สำหรับ Headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-company-id': COMPANY_ID.toString(),
});

// --- Mapper Functions (เดิม) ---
const mapToLayout = (data: any): Layout => ({
  id: data.id,
  name: data.name,
  description: data.description || '',
  width: data.width,
  height: data.height,
  backgroundColor: data.background_color || '#ffffff',
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  widgets: (data.widgets || []).map(mapToWidget),
  thumbnail: data.thumbnail_url
});

const mapToWidget = (data: any): Widget => {
    let props = data.properties;
    if (typeof props === 'string') {
        try { props = JSON.parse(props); } catch {}
    }
    return {
        id: data.id,
        type: data.type,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        zIndex: data.z_index ?? data.zIndex ?? 1,
        properties: props || {}
    };
};

// --- Layout APIs (อัปเดตให้ส่ง Headers) ---

export const getLayouts = async (): Promise<Layout[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/layouts?company_id=${COMPANY_ID}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch layouts');
    const data = await res.json();
    return data.map(mapToLayout);
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const getLayout = async (id: string): Promise<Layout | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/layouts/${id}`, { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return mapToLayout(data);
  } catch (error) {
    return null;
  }
};

export const createLayout = async (layout: any): Promise<Layout> => { // แก้ type เป็น any ชั่วคราวเพื่อให้ง่าย
    const payload = {
      ...layout,
      // [4] ใส่ company_id ลงไปใน Body ด้วย (สำคัญมาก!)
      company_id: COMPANY_ID, 
      widgets: layout.widgets.map((w: any) => ({ ...w, z_index: w.zIndex }))
    };

    const res = await fetch(`${API_BASE_URL}/layouts`, {
        method: 'POST',
        headers: getHeaders(), // ใส่ Header
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to create layout');
    const result = await res.json(); 
    
    return {
        ...layout,
        id: result.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export const saveLayout = async (layout: Layout): Promise<void> => {
  const payload = {
      name: layout.name,
      description: layout.description,
      width: layout.width,
      height: layout.height,
      background_color: layout.backgroundColor,
      widgets: layout.widgets.map(w => ({ ...w, z_index: w.zIndex }))
  };

  const res = await fetch(`${API_BASE_URL}/layouts/${layout.id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save layout');
};

export const deleteLayout = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/layouts/${id}`, { 
      method: 'DELETE',
      headers: getHeaders() 
  });
  if (!res.ok) throw new Error('Failed to delete layout');
};

// --- [NEW] Buses APIs ---

export const getBuses = async (): Promise<Bus[]> => {
  const res = await fetch(`${API_BASE_URL}/buses?company_id=${COMPANY_ID}`, {
      headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch buses');
  return await res.json();
};

export const createBus = async (name: string, deviceId: string): Promise<Bus> => {
  const res = await fetch(`${API_BASE_URL}/buses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
          name, 
          device_id: deviceId, 
          company_id: COMPANY_ID 
      }),
  });
  if (!res.ok) throw new Error('Failed to create bus');
  return await res.json();
};

export const assignBusLayout = async (busId: number, layoutId: number | null) => {
  const res = await fetch(`${API_BASE_URL}/buses/${busId}/assign`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ layout_id: layoutId }),
  });
  if (!res.ok) throw new Error('Failed to assign layout');
  return await res.json();
};