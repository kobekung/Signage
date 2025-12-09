'use client';

import { Widget, WidgetProperties, PlaylistItem } from '@/lib/types';
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Upload, Loader2, MapPin, Maximize } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ImagePropertiesProps {
  widget: Widget;
}

const BASE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CLEAN_BASE_API = BASE_API.replace(/\/$/, ''); 
const API_UPLOAD_URL = `${CLEAN_BASE_API}/upload`;

export default function ImageProperties({ widget }: ImagePropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  
  const properties = widget.properties;
  const { playlist = [] } = properties;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // เพิ่ม State สำหรับเก็บ ID ตัวที่จะลบ (ใช้คุม Dialog)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const debouncedUpdate = useDebouncedCallback((newProps: Partial<WidgetProperties>) => {
    updateWidgetProperties({
      id: widget.id,
      properties: { ...widget.properties, ...newProps },
    });
  }, 300);

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
    // สร้าง ID แบบสุ่มป้องกัน Key ซ้ำ ซึ่งเป็นสาเหตุหนึ่งของ Error
    const newItem: PlaylistItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url: 'https://picsum.photos/400/300',
      type: 'image',
      duration: 10,
    };
    updatePlaylist([...playlist, newItem]);
  };

  // ฟังก์ชันลบอย่างปลอดภัย (Safe Delete)
  const confirmDelete = () => {
    if (itemToDelete) {
        // ใช้การ filter แทนการ splice เพื่อความปลอดภัยของ React State
        const newPlaylist = playlist.filter(item => item.id !== itemToDelete);
        updatePlaylist(newPlaylist);
        setItemToDelete(null); // ปิด Dialog และเคลียร์ค่า
    }
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
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

      {/* Playlist Items */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {playlist.map((item, index) => (
          <div key={item.id} className="p-3 border rounded-lg space-y-3 bg-muted/20">
            <div className="flex justify-between items-center">
                <Label className="font-semibold truncate pr-2">
                    Item {index + 1}: {item.type}
                </Label>
                {/* เปลี่ยนปุ่มลบให้เรียก setItemToDelete เพื่อเปิด Dialog */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 flex-shrink-0 hover:bg-red-100 hover:text-red-600" 
                    onClick={() => setItemToDelete(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
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
            <p className="text-center text-muted-foreground p-4 text-sm">No items in playlist.</p>
        )}
      </div>

      {/* AlertDialog สำหรับยืนยันการลบ */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to remove this item from the playlist? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Confirm deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}