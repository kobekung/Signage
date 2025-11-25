'use client';
import { Widget, ClockWidgetProperties } from '@/lib/types';
import { useEditorStore } from '@/stores';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';
import { useDebouncedCallback } from 'use-debounce';

interface ClockPropertiesProps {
  widget: Widget<ClockWidgetProperties>;
}

export default function ClockProperties({ widget }: ClockPropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  
  const debouncedUpdate = useDebouncedCallback((newProps: Partial<ClockWidgetProperties>) => {
    updateWidgetProperties({
      id: widget.id,
      properties: { ...widget.properties, ...newProps },
    });
  }, 300);

  const updateProperties = (newProps: Partial<ClockWidgetProperties>) => {
    // Optimistic UI update
    Object.assign(widget.properties, newProps);
    // Debounced state update
    debouncedUpdate(newProps);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-md">Clock Options</h4>
      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <Label htmlFor="showSeconds">Show Seconds</Label>
        <Switch
          id="showSeconds"
          checked={widget.properties.showSeconds}
          onCheckedChange={(checked) => updateProperties({ showSeconds: checked })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="format">Time Format</Label>
        <Select
          value={widget.properties.format}
          onValueChange={(value: '12h' | '24h') => updateProperties({ format: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12h">12-Hour</SelectItem>
            <SelectItem value="24h">24-Hour</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue={widget.properties.color}
                    onChange={(e) => updateProperties({ color: e.target.value })}
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
