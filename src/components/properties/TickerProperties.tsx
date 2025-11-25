'use client';
import { Widget, TickerWidgetProperties } from '@/lib/types';
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useDebouncedCallback } from 'use-debounce';

interface TickerPropertiesProps {
  widget: Widget<TickerWidgetProperties>;
}

export default function TickerProperties({ widget }: TickerPropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  
  const debouncedDispatch = useDebouncedCallback((newProps: Partial<TickerWidgetProperties>) => {
    updateWidgetProperties({
      id: widget.id,
      properties: { ...widget.properties, ...newProps },
    });
  }, 300);

  const updateProperties = (newProps: Partial<TickerWidgetProperties>) => {
     // Optimistic UI update
    Object.assign(widget.properties, newProps);
    // Debounced state update
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
                defaultValue={widget.properties.text}
                onChange={(e) => updateProperties({ text: e.target.value })}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select
                value={widget.properties.direction}
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
            <Label>Speed: {widget.properties.speed}px/s</Label>
            <Slider
                defaultValue={[widget.properties.speed]}
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
                    defaultValue={widget.properties.textColor}
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
                    defaultValue={widget.properties.backgroundColor}
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
                    defaultValue={widget.properties.fontSize}
                    onChange={(e) => updateProperties({ fontSize: Number(e.target.value) })}
                />
            </div>
        </div>
    </div>
  );
}
