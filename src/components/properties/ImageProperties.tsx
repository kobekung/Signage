'use client';
import { Widget, ImageWidgetProperties, PlaylistItem } from '@/lib/types';
import { useEditorDispatch } from '@/context/EditorContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface ImagePropertiesProps {
  widget: Widget<ImageWidgetProperties>;
}

export default function ImageProperties({ widget }: ImagePropertiesProps) {
  const dispatch = useEditorDispatch();
  const { playlist } = widget.properties;

  const debouncedDispatch = useDebouncedCallback((payload) => {
    dispatch({ type: 'UPDATE_WIDGET_PROPERTIES', payload });
  }, 300);

  const updatePlaylist = (newPlaylist: PlaylistItem[]) => {
    debouncedDispatch({
      id: widget.id,
      properties: { ...widget.properties, playlist: newPlaylist },
    });
  };

  const handleItemChange = (itemId: string, field: 'url' | 'duration', value: string | number) => {
    const newPlaylist = playlist.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    updatePlaylist(newPlaylist);
  };
  
  const handleAddItem = () => {
    const newItem: PlaylistItem = {
      id: `media-${Date.now()}`,
      url: 'https://picsum.photos/400/300',
      type: 'image',
      duration: 10,
    };
    const newPlaylist = [...playlist, newItem];
    updatePlaylist(newPlaylist);
  };

  const handleDeleteItem = (itemId: string) => {
    const newPlaylist = playlist.filter(item => item.id !== itemId);
    updatePlaylist(newPlaylist);
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-md">Playlist Manager</h4>
        <Button size="sm" onClick={handleAddItem}>
          <Plus className="mr-2" /> Add Item
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {playlist.map((item, index) => (
          <div key={item.id} className="p-3 border rounded-lg space-y-3 bg-muted/20">
            <div className="flex justify-between items-center">
                <Label className="font-semibold">Item {index + 1}</Label>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`url-${item.id}`}>URL</Label>
              <Input
                id={`url-${item.id}`}
                defaultValue={item.url}
                onChange={(e) => handleItemChange(item.id, 'url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`duration-${item.id}`}>Duration (s)</Label>
              <Input
                id={`duration-${item.id}`}
                type="number"
                defaultValue={item.duration}
                onChange={(e) => handleItemChange(item.id, 'duration', Number(e.target.value))}
              />
            </div>
          </div>
        ))}
        {playlist.length === 0 && (
            <p className="text-center text-muted-foreground p-4">The playlist is empty.</p>
        )}
      </div>
    </div>
  );
}
