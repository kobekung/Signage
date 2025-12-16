'use client';

import { useEditorStore } from '@/stores';
import PropertiesPanel from '@/components/properties/PropertiesPanel';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function RightSidebar() {
  const { selectedWidgetId, layout, deleteWidget } = useEditorStore(state => ({
    selectedWidgetId: state.selectedWidgetId,
    layout: state.layout,
    deleteWidget: state.deleteWidget
  }));

  const selectedWidget = layout?.widgets.find(w => w.id === selectedWidgetId);

  const handleDelete = () => {
    if (selectedWidgetId) {
      deleteWidget(selectedWidgetId);
    }
  };

  // [FIX] เพิ่ม h-full เพื่อให้ Sidebar สูงเต็มจอและ ScrollArea ทำงานได้ถูกต้อง
  return (
    <aside className="w-80 border-l bg-card flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
        <h3 className="font-semibold text-lg">Properties</h3>
        {selectedWidget && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Widget</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {/* flex-1 จะทำงานได้เมื่อ parent (aside) มีความสูงที่แน่นอน (h-full) */}
      <ScrollArea className="flex-1">
        {selectedWidget ? (
          <PropertiesPanel widget={selectedWidget} key={selectedWidget.id} />
        ) : (
          <div className="p-4 text-center text-muted-foreground mt-8">
            <p>Select a widget to see its properties.</p>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}