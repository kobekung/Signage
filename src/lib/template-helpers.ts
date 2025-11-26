import { Layout, TemplateType, Widget } from "./types";

// Helper สร้าง ID สุ่ม
const genId = () => Math.random().toString(36).substr(2, 9);

export function createLayoutFromTemplate(baseLayout: Layout, template: TemplateType): Layout {
  const { width, height } = baseLayout;
  let widgets: Widget[] = [];

  // ฟังก์ชันช่วยสร้าง Widget (ใช้รูป placeholder เป็นค่าเริ่มต้น)
  const createWidget = (
    type: 'webview' | 'image',
    x: number,
    y: number,
    w: number,
    h: number,
    zIndex: number
  ): Widget => ({
    id: `widget-${genId()}`,
    type: type,
    x,
    y,
    width: w,
    height: h,
    zIndex,
    properties: type === 'webview'
      ? { url: 'https://www.google.com/search?igu=1' }
      : {
          playlist: [{
            id: `media-${genId()}`,
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', 
            type: 'image',
            duration: 10,
          }],
          fitMode: 'cover',
        },
  });

  if (template === 'blank') {
    return { ...baseLayout, widgets: [] };
  }

  switch (template) {
    // --- ของเดิม ---
    case 'split-horizontal':
      widgets.push(createWidget('webview', 0, 0, width / 2, height, 1));
      widgets.push(createWidget('image', width / 2, 0, width / 2, height, 2));
      break;

    case 'split-vertical':
      widgets.push(createWidget('webview', 0, 0, width, height / 2, 1));
      widgets.push(createWidget('image', 0, height / 2, width, height / 2, 2));
      break;

    case 'sidebar-left':
      widgets.push(createWidget('webview', 0, 0, width * 0.3, height, 1));
      widgets.push(createWidget('image', width * 0.3, 0, width * 0.7, height, 2));
      break;
    
    case 'quad-grid':
      widgets.push(createWidget('webview', 0, 0, width / 2, height / 2, 1));
      widgets.push(createWidget('image', width / 2, 0, width / 2, height / 2, 2));
      widgets.push(createWidget('image', 0, height / 2, width / 2, height / 2, 3));
      widgets.push(createWidget('webview', width / 2, height / 2, width / 2, height / 2, 4));
      break;

    // --- ของใหม่ที่เพิ่มให้ ---
    
    case 'three-cols': // 3 ส่วนแนวตั้ง
      const colW = width / 3;
      widgets.push(createWidget('image', 0, 0, colW, height, 1));
      widgets.push(createWidget('webview', colW, 0, colW, height, 2));
      widgets.push(createWidget('image', colW * 2, 0, colW, height, 3));
      break;

    case 'three-rows': // 3 ส่วนแนวนอน
      const rowH = height / 3;
      widgets.push(createWidget('image', 0, 0, width, rowH, 1));
      widgets.push(createWidget('webview', 0, rowH, width, rowH, 2));
      widgets.push(createWidget('image', 0, rowH * 2, width, rowH, 3));
      break;

    case 'header-sidebar': // Header บน + เมนูซ้าย + เนื้อหา
      const headerH = height * 0.2; // Header สูง 20%
      const sidebarW = width * 0.25; // Sidebar กว้าง 25%
      
      // Header (ยาวเต็ม)
      widgets.push(createWidget('image', 0, 0, width, headerH, 1));
      // Sidebar (ซ้าย ล่าง Header)
      widgets.push(createWidget('image', 0, headerH, sidebarW, height - headerH, 2));
      // Main Content (ขวา ล่าง Header)
      widgets.push(createWidget('webview', sidebarW, headerH, width - sidebarW, height - headerH, 3));
      break;
  }

  return { ...baseLayout, widgets };
}