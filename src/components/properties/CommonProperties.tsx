'use client';

import { Widget, WidgetType } from '@/lib/types';
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, Image as ImageIcon, Clock, Globe, Newspaper, ArrowRightLeft } from 'lucide-react';

interface CommonPropertiesProps {
  widget: Widget;
}

export default function CommonProperties({ widget }: CommonPropertiesProps) {
  const { updateWidgetPosition, updateWidgetSize, changeWidgetType, isWidgetLoading } = useEditorStore();

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateWidgetPosition({ ...widget, id: widget.id, [name]: Number(value) });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateWidgetSize({ ...widget, id: widget.id, [name]: Number(value) });
  };

  const handleTypeChange = (newType: string) => {
    if (newType !== widget.type) {
        changeWidgetType(widget.id, newType as WidgetType);
    }
  };

  return (
    <div className="space-y-6">
        {/* Widget Type Selector */}
        <div className="space-y-2 p-3 bg-accent/20 rounded-lg border border-accent/50">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-accent-foreground">
                <ArrowRightLeft size={16} />
                <span>Widget Type</span>
            </div>
            <Select 
                value={widget.type} 
                onValueChange={handleTypeChange} 
                disabled={isWidgetLoading}
            >
                <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="text"><div className="flex items-center gap-2"><Type size={14}/> Text</div></SelectItem>
                    <SelectItem value="image"><div className="flex items-center gap-2"><ImageIcon size={14}/> Image/Video</div></SelectItem>
                    <SelectItem value="clock"><div className="flex items-center gap-2"><Clock size={14}/> Clock</div></SelectItem>
                    <SelectItem value="ticker"><div className="flex items-center gap-2"><Newspaper size={14}/> Ticker</div></SelectItem>
                    <SelectItem value="webview"><div className="flex items-center gap-2"><Globe size={14}/> Web Page</div></SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* [REMOVED] Location Trigger Section ออกจากตรงนี้ */}

        {/* Dimensions & Position */}
        <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Dimensions & Position</h4>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label htmlFor="x" className="text-xs">X</Label>
                    <Input id="x" name="x" type="number" value={Math.round(widget.x)} onChange={handlePositionChange} className="h-8" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="y" className="text-xs">Y</Label>
                    <Input id="y" name="y" type="number" value={Math.round(widget.y)} onChange={handlePositionChange} className="h-8" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="width" className="text-xs">W</Label>
                    <Input id="width" name="width" type="number" value={Math.round(widget.width)} onChange={handleSizeChange} className="h-8" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="height" className="text-xs">H</Label>
                    <Input id="height" name="height" type="number" value={Math.round(widget.height)} onChange={handleSizeChange} className="h-8" />
                </div>
            </div>
        </div>
    </div>
  );
}