'use client';
import { Widget, WidgetProperties, PlaylistItem } from '@/lib/types'; // [FIX] ใช้ WidgetProperties
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Upload, Loader2, MapPin, Maximize } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ImagePropertiesProps {
  widget: Widget; // [FIX] Widget ไม่ต้องมี Generic <...> แล้ว
}

const API_UPLOAD_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/api/upload`
  : 'http://localhost:5000/api/upload';

export default function ImageProperties({ widget }: ImagePropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  
  // cast properties ให้เป็น WidgetProperties (เผื่อบางที TS งง) แต่จริงๆ widget.properties ก็เป็น type นี้อยู่แล้ว
  const properties = widget.properties;
  const { playlist = [] } = properties;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // [FIX] ใช้ Partial<WidgetProperties> แทน ImageWidgetProperties
  const debouncedUpdate = useDebouncedCallback((newProps: Partial<WidgetProperties>) => {
    updateWidgetProperties({
      id: widget.id,
      properties: { ...widget.properties, ...newProps },
    });
  }, 300);

  // [FIX] ใช้ Partial<WidgetProperties>
  const updateProperties = (newProps: Partial<WidgetProperties>) => {
    Object.assign(widget.properties, newProps);
    debouncedUpdate(newProps);
  };
  
  const updatePlaylist = (newPlaylist: PlaylistItem[]) => {
    updateProperties({ playlist: newPlaylist });
  };

  const handleItemChange = (itemId: string, field: keyof PlaylistItem, value: any) => {
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
        alert("Unsupported file type");
        return;
    }

    setIsUploading(true);

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(API_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        const realUrl = data.url; 

        let duration = 10; 
        if (fileType === 'video') {
            duration = 30; 
            try {
                const tempUrl = URL.createObjectURL(file);
                const videoDuration = await getVideoDuration(tempUrl); 
                duration = Math.round(videoDuration);
                URL.revokeObjectURL(tempUrl);
            } catch (e) { console.error("Duration error:", e); }
        }
        
        const newItem: PlaylistItem = {
            id: `media-${Date.now()}`,
            url: realUrl, 
            type: fileType,
            duration: duration,
        };

        updatePlaylist([...playlist, newItem]);

    } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload file.");
    } finally {
        setIsUploading(false);
    }
    
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => reject("Error loading video metadata.");
        video.src = url;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fit Mode</Label>
         <Select
          value={properties.fitMode || 'fill'}
          onValueChange={(value: 'cover' | 'contain' | 'fill') => updateProperties({ fitMode: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select fit mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fill">Fill (Stretch)</SelectItem>
            <SelectItem value="cover">Cover (No Distortion)</SelectItem>
            <SelectItem value="contain">Contain (Fit Inside)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center">
        <h4 className="font-medium text-md">Playlist Manager</h4>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddItemByUrl} disabled={isUploading}>
                <Plus className="mr-2 h-4 w-4" /> URL
            </Button>
            <Button size="sm" onClick={handleUploadClick} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} 
                Upload
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

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {playlist.map((item, index) => (
          <div key={item.id} className="p-3 border rounded-lg space-y-3 bg-muted/20">
            <div className="flex justify-between items-center">
                <Label className="font-semibold truncate pr-2">
                    Item {index + 1}: {item.type}
                </Label>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                    <Label htmlFor={`url-${item.id}`} className="text-xs">URL</Label>
                    <Input
                        id={`url-${item.id}`}
                        value={item.url}
                        readOnly
                        className="h-8 bg-white"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`duration-${item.id}`} className="text-xs">Sec</Label>
                    <Input
                        id={`duration-${item.id}`}
                        type="number"
                        value={item.duration}
                        onChange={(e) => handleItemChange(item.id, 'duration', Number(e.target.value))}
                        className="h-8"
                    />
                </div>
            </div>

            {/* Trigger Settings */}
            <div className="pt-2 border-t border-muted-foreground/20">
                <div className="flex items-center gap-2 mb-2 text-xs text-blue-600 font-semibold">
                    <MapPin size={12} />
                    <span>Trigger Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-[10px]">Location ID</Label>
                        <Input 
                            className="h-7 text-xs" 
                            placeholder="e.g. 100"
                            value={item.locationId || ''}
                            onChange={(e) => handleItemChange(item.id, 'locationId', e.target.value)}
                        />
                    </div>
                    <div className="flex items-end justify-end pb-1">
                         <div className="flex items-center gap-2">
                            <Label className="text-[10px] flex items-center gap-1">
                                <Maximize size={10} /> Fullscreen
                            </Label>
                            <Switch 
                                className="scale-75"
                                checked={item.fullscreen || false}
                                onCheckedChange={(val) => handleItemChange(item.id, 'fullscreen', val)}
                            />
                        </div>
                    </div>
                </div>
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