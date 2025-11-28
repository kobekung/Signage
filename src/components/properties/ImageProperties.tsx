'use client';
import { Widget, ImageWidgetProperties, PlaylistItem } from '@/lib/types';
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Upload, Loader2 } from 'lucide-react'; // เพิ่ม Loader2
import { useDebouncedCallback } from 'use-debounce';
import { useRef, useState } from 'react'; // เพิ่ม useState
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ImagePropertiesProps {
  widget: Widget<ImageWidgetProperties>;
}

// URL ของ API Upload (ชี้ไปที่ Backend ของคุณ)
const API_UPLOAD_URL = 'https://api-signage.lab.bussing.app/api/upload'; 

export default function ImageProperties({ widget }: ImagePropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  const { playlist } = widget.properties;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false); // สถานะกำลังอัปโหลด

  const debouncedUpdate = useDebouncedCallback((newProps: Partial<ImageWidgetProperties>) => {
    updateWidgetProperties({
      id: widget.id,
      properties: { ...widget.properties, ...newProps },
    });
  }, 300);

  const updateProperties = (newProps: Partial<ImageWidgetProperties>) => {
    Object.assign(widget.properties, newProps);
    debouncedUpdate(newProps);
  };
  
  const updatePlaylist = (newPlaylist: PlaylistItem[]) => {
    updateProperties({ playlist: newPlaylist });
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
        alert("Unsupported file type");
        return;
    }

    setIsUploading(true); // เริ่มหมุนติ้วๆ

    try {
        // 1. สร้าง Form Data เพื่อส่งไฟล์
        const formData = new FormData();
        formData.append('file', file);

        // 2. ส่งไฟล์ไปที่ Backend
        const response = await fetch(API_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        
        // 3. รับ URL จริงกลับมา (เช่น http://localhost:5000/uploads/abc.jpg)
        const data = await response.json();
        const realUrl = data.url; 

        let duration = 10; 
        if (fileType === 'video') {
            duration = 30; 
            try {
                // หาความยาววิดีโอ (ใช้ blob ชั่วคราวเพื่อความเร็วในการอ่าน meta)
                const tempUrl = URL.createObjectURL(file);
                const videoDuration = await getVideoDuration(tempUrl); 
                duration = Math.round(videoDuration);
                URL.revokeObjectURL(tempUrl);
            } catch (e) { console.error("Duration error:", e); }
        }
        
        // 4. เพิ่มลง Playlist ด้วย URL จริง
        const newItem: PlaylistItem = {
            id: `media-${Date.now()}`,
            url: realUrl, // [สำคัญ] เก็บ URL จริง ไม่ใช่ blob
            type: fileType,
            duration: duration,
        };

        updatePlaylist([...playlist, newItem]);

    } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload file. Please check Backend connection.");
    } finally {
        setIsUploading(false); // หยุดหมุน
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
          value={widget.properties.fitMode || 'fill'}
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

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
            <div className="space-y-2">
              <Label htmlFor={`url-${item.id}`}>URL</Label>
              <Input
                id={`url-${item.id}`}
                value={item.url}
                readOnly // ให้ Read-only เพราะเป็น URL จาก Server แก้เองไม่ได้ (ต้องลบลงใหม่)
                className="bg-muted text-muted-foreground"
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