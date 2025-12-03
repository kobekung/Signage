'use client';
import { Widget, WidgetProperties } from '@/lib/types'; // [FIX] ใช้ WidgetProperties
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useDebouncedCallback } from 'use-debounce';

interface TickerPropertiesProps {
  widget: Widget; // [FIX] ไม่ต้อง Generic
}

export default function TickerProperties({ widget }: TickerPropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  
  const debouncedDispatch = useDebouncedCallback((newProps: Partial<WidgetProperties>) => {
    updateWidgetProperties({
      id: widget.id,
      properties: { ...widget.properties, ...newProps },
    });
  }, 300);

  const updateProperties = (newProps: Partial<WidgetProperties>) => {
    Object.assign(widget.properties, newProps);
    debouncedDispatch(newProps);
  };

  return (
    <div className="space-y-4">
        <h4 className="font-medium text-md">Ticker Options</h4>
        <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea
                id="text"
                name="text"
                // [FIX] ใส่ || '' กัน undefined
                defaultValue={widget.properties.text || ''}
                onChange={(e) => updateProperties({ text: e.target.value })}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select
                // [FIX] ใส่ || 'left'
                value={widget.properties.direction || 'left'}
                onValueChange={(value: 'left' | 'right' | 'up' | 'down') => updateProperties({ direction: value })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="up">Up</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label>Speed: {widget.properties.speed || 50}px/s</Label>
            <Slider
                // [FIX] ใส่ || 50 กัน undefined (แก้ Error ที่คุณเจอตรงนี้)
                defaultValue={[widget.properties.speed || 50]}
                min={10}
                max={200}
                step={10}
                onValueChange={(value) => updateProperties({ speed: value[0] })}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <Input
                    id="textColor"
                    name="textColor"
                    type="color"
                    // [FIX] ใส่ Default Color
                    defaultValue={widget.properties.textColor || '#000000'}
                    onChange={(e) => updateProperties({ textColor: e.target.value })}
                    className="p-1"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background</Label>
                <Input
                    id="backgroundColor"
                    name="backgroundColor"
                    type="color"
                    // [FIX] ใส่ Default Color
                    defaultValue={widget.properties.backgroundColor || '#ffffff'}
                    onChange={(e) => updateProperties({ backgroundColor: e.target.value })}
                    className="p-1"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                    id="fontSize"
                    name="fontSize"
                    type="number"
                    // [FIX] ใส่ Default Size
                    defaultValue={widget.properties.fontSize || 24}
                    onChange={(e) => updateProperties({ fontSize: Number(e.target.value) })}
                />
            </div>
        </div>
    </div>
  );
}