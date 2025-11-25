'use client';
import { useEditorStore } from '@/stores';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Plus, Tv, Clock, Image as ImageIcon, Loader2, Newspaper } from 'lucide-react';
import { WidgetType } from '@/lib/types';

export default function Header() {
  const { layout, addNewWidget, isWidgetLoading, togglePreviewMode } = useEditorStore();

  const handleAddWidget = (type: WidgetType) => {
    addNewWidget(type);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b bg-card">
      <div>
        <h2 className="text-lg font-semibold">{layout?.name || 'Loading...'}</h2>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={isWidgetLoading}>
              {isWidgetLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus />
              )}
              Add Widget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleAddWidget('text')}>
              <Tv />
              <span>Text</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('clock')}>
              <Clock />
              <span>Clock</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('image')}>
              <ImageIcon />
              <span>Image</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('ticker')}>
              <Newspaper />
              <span>Ticker</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={togglePreviewMode}
        >
          <Eye />
          Preview
        </Button>
      </div>
    </header>
  );
}
