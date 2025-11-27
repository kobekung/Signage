import { Layout, Widget } from '@/lib/types';

// URL ของ Backend (เปลี่ยน port ตามที่คุณตั้งไว้ เช่น 5000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- Mapper Functions (แปลงข้อมูลให้ตรงกัน) ---

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
    // ถ้า Backend ส่งมาเป็น String JSON ให้แปลงเป็น Object
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

// --- API Methods ---

export const getLayouts = async (): Promise<Layout[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/layouts`);
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
    const res = await fetch(`${API_BASE_URL}/layouts/${id}`);
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch layout');
    }
    const data = await res.json();
    return mapToLayout(data);
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

export const saveLayout = async (layout: Layout): Promise<void> => {
  // ส่งข้อมูลทั้งหมดไปอัปเดต (รวม Widgets)
  const payload = {
      name: layout.name,
      description: layout.description,
      width: layout.width,
      height: layout.height,
      background_color: layout.backgroundColor,
      // แปลง widget กลับเป็น format ที่ backend เข้าใจ
      widgets: layout.widgets.map(w => ({
          ...w,
          z_index: w.zIndex, 
          // properties จะถูกจัดการโดย JSON.stringify ของ fetch body เอง หรือ backend ต้องรับ object ได้
      }))
  };

  const res = await fetch(`${API_BASE_URL}/layouts/${layout.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to save layout');
};

export const createLayout = async (layout: Omit<Layout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Layout> => {
    const payload = {
      name: layout.name,
      description: layout.description,
      width: layout.width,
      height: layout.height,
      background_color: layout.backgroundColor,
      widgets: layout.widgets.map(w => ({
          ...w,
          z_index: w.zIndex
      }))
    };

    const res = await fetch(`${API_BASE_URL}/layouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to create layout');
    const result = await res.json(); 
    
    // คืนค่า Layout พร้อม ID จริงจาก Database
    return {
        ...layout,
        id: result.id, // ใช้ ID ที่ได้จาก DB
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export const deleteLayout = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/layouts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete layout');
};