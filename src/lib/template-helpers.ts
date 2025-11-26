import { Layout, TemplateType, Widget } from "./types";

export function createLayoutFromTemplate(baseLayout: Layout, template: TemplateType): Layout {
  const { width, height } = baseLayout;
  let widgets: Widget[] = [];

  // If the template is blank, just return the base layout with empty widgets
  if (template === 'blank') {
    return { ...baseLayout, widgets: [] };
  }

  const createWidget = (
    type: 'webview' | 'image',
    x: number,
    y: number,
    w: number,
    h: number,
    zIndex: number
  ): Widget => ({
    id: `widget-${Date.now()}-${zIndex}`,
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
            id: `media-${Date.now()}`,
            url: 'https://picsum.photos/seed/image-placeholder/800/600',
            type: 'image',
            duration: 10,
          }],
          fitMode: 'cover',
        },
  });

  switch (template) {
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

    case 'blank':
    default:
      // This is now handled at the top, but we keep it here as a fallback.
      widgets = [];
      break;
  }

  return { ...baseLayout, widgets };
}
