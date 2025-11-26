'use client';
import { useEditorStore } from '@/stores';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Plus, Tv, Clock, Image as ImageIcon, Loader2, Newspaper, Globe, ArrowLeft, Save } from 'lucide-react';
import { WidgetType } from '@/lib/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useDebouncedCallback } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const { 
    layout, 
    addNewWidget, 
    isWidgetLoading, 
    togglePreviewMode, 
    updateLayoutDimensions,
    backToDashboard,
    saveCurrentLayout
  } = useEditorStore();
  const { toast } = useToast();

  const handleAddWidget = (type: WidgetType) => {
    addNewWidget(type);
  };

  const handleSave = () => {
    saveCurrentLayout();
    toast({
        title: "Layout Saved",
        description: "Your changes have been saved successfully.",
    });
  };
  
  const debouncedUpdate = useDebouncedCallback((newDims: {width?: number, height?: number}) => {
    if (!layout) return;
    updateLayoutDimensions({
      width: newDims.width ?? layout.width,
      height: newDims.height ?? layout.height,
    });
  }, 500);

  return (
    <header className="h-16 flex items-center justify-between px-4 border-b bg-card shrink-0 shadow-sm z-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={backToDashboard} title="Back to Dashboard">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col">
            <h2 className="text-sm font-bold leading-tight">{layout?.name || 'Loading...'}</h2>
            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                    <Label htmlFor="canvas-width" className="text-[10px] uppercase font-bold">W</Label>
                    <Input
                        id="canvas-width"
                        type="number"
                        defaultValue={layout?.width}
                        key={`w-${layout?.width}`}
                        onChange={(e) => debouncedUpdate({ width: Number(e.target.value) })}
                        className="w-14 h-5 text-xs px-1 py-0 border-muted-foreground/20"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Label htmlFor="canvas-height" className="text-[10px] uppercase font-bold">H</Label>
                    <Input
                        id="canvas-height"
                        type="number"
                        defaultValue={layout?.height}
                        key={`h-${layout?.height}`}
                        onChange={(e) => debouncedUpdate({ height: Number(e.target.value) })}
                        className="w-14 h-5 text-xs px-1 py-0 border-muted-foreground/20"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSave} className="gap-2 hidden sm:flex">
            <Save size={16} /> Save
        </Button>

        <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={isWidgetLoading} size="sm">
              {isWidgetLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Widget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAddWidget('text')}>
              <Tv className="mr-2 h-4 w-4" /> Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('clock')}>
              <Clock className="mr-2 h-4 w-4" /> Clock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('image')}>
              <ImageIcon className="mr-2 h-4 w-4" /> Image/Video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('ticker')}>
              <Newspaper className="mr-2 h-4 w-4" /> Ticker
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('webview')}>
              <Globe className="mr-2 h-4 w-4" /> Web Page
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="secondary" size="sm" onClick={togglePreviewMode} className="gap-2">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </div>
    </header>
  );
}