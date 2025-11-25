'use client';
import { Widget, ImageWidgetProperties, PlaylistItem } from '@/lib/types';
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Upload } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { useRef } from 'react';

interface ImagePropertiesProps {
  widget: Widget<ImageWidgetProperties>;
}

export default function ImageProperties({ widget }: ImagePropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  const { playlist } = widget.properties;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedDispatch = useDebouncedCallback((newPlaylist: PlaylistItem[]) => {
    updateWidgetProperties({
      id: widget.id,
      properties: { ...widget.properties, playlist: newPlaylist },
    });
  }, 300);

  const updatePlaylist = (newPlaylist: PlaylistItem[]) => {
    // Optimistic UI update
    widget.properties.playlist = newPlaylist;
    // Debounced state update
    debouncedDispatch(newPlaylist);
  };

  const handleItemChange = (itemId: string, field: 'url' | 'duration', value: string | number) => {
    const newPlaylist = playlist.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    updatePlaylist(newPlaylist);
  };
  
  const handleAddItemByUrl = () => {
    const newItem: PlaylistItem = {
      id: `media-${Date.now()}`,
      url: 'https://picsum.photos/400/300',
      type: 'image',
      duration: 10,
    };
    updatePlaylist([...playlist, newItem]);
  };

  const handleDeleteItem = (itemId: string) => {
    const newPlaylist = playlist.filter(item => item.id !== itemId);
    updatePlaylist(newPlaylist);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : null);
    if (!fileType) {
        // Optionally, show a toast or alert for unsupported file type
        console.error("Unsupported file type");
        return;
    }
    
    const localUrl = URL.createObjectURL(file);

    let duration = 10; // Default for images

    if (fileType === 'video') {
        duration = 30; // Fallback for video
        try {
            const videoDuration = await getVideoDuration(file);
            duration = Math.round(videoDuration);
        } catch (error) {
            console.error("Could not get video duration", error);
        }
    }
    
    const newItem: PlaylistItem = {
        id: `media-${Date.now()}`,
        url: localUrl,
        type: fileType,
        duration: duration,
    };

    updatePlaylist([...playlist, newItem]);
    
    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        video.onerror = () => {
            reject("Error loading video metadata.");
        };
        video.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-md">Playlist Manager</h4>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddItemByUrl}>
                <Plus className="mr-2" /> URL
            </Button>
            <Button size="sm" onClick={handleUploadClick}>
                <Upload className="mr-2" /> Upload
            </Button>
            <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileChange}
            />
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {playlist.map((item, index) => (
          <div key={item.id} className="p-3 border rounded-lg space-y-3 bg-muted/20">
            <div className="flex justify-between items-center">
                <Label className="font-semibold truncate pr-2">Item {index + 1}: {item.url.startsWith('blob:') ? 'Local File' : 'Web URL'}</Label>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`url-${item.id}`}>URL</Label>
              <Input
                id={`url-${item.id}`}
                defaultValue={item.url}
                onChange={(e) => handleItemChange(item.id, 'url', e.target.value)}
                disabled={item.url.startsWith('blob:')}
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
