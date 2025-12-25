'use client';

import { Widget, WidgetProperties, PlaylistItem } from '@/lib/types';
import { useEditorStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Trash2, Plus, Upload, Loader2, MapPin, Maximize, 
  GripVertical, PlayCircle, ImageIcon, Film, Clock, Settings2
} from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { useRef, useState } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- DND Kit Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImagePropertiesProps {
  widget: Widget;
}

const BASE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CLEAN_BASE_API = BASE_API.replace(/\/$/, ''); 
const API_UPLOAD_URL = `${CLEAN_BASE_API}/upload`;

// --- Thumbnail Component ---
const MediaThumbnail = ({ url, type }: { url: string; type: 'image' | 'video' }) => {
  if (type === 'video') {
    return (
      <div className="relative w-full h-full bg-black group select-none">
        {/* เทคนิค: ใส่ #t=0.5 เพื่อดึงเฟรมที่ 0.5 วินาทีมาแสดงเป็นปก */}
        <video 
          src={`${url}#t=0.5`} 
          className="w-full h-full object-cover opacity-80"
          preload="metadata"
          muted 
          playsInline
          disablePictureInPicture
          style={{ pointerEvents: 'none' }} 
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-1">
             <PlayCircle size={12} className="text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt="thumbnail" 
      className="w-full h-full object-cover select-none" 
      loading="lazy"
    />
  );
};

// --- Sortable Item Component ---
interface SortableItemProps {
  item: PlaylistItem;
  index: number;
  onDelete: (id: string) => void;
  onChange: (id: string, field: keyof PlaylistItem, value: any) => void;
}

function SortablePlaylistItem({ item, index, onDelete, onChange }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-2 border rounded-lg transition-all shadow-sm ${
        isDragging ? 'bg-blue-50 border-blue-200' : 'bg-background hover:border-primary/50'
      }`}
    >
      {/* 1. Grip Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:text-primary text-muted-foreground flex-shrink-0 touch-none p-1"
      >
        <GripVertical size={16} />
      </div>

      {/* 2. Thumbnail */}
      <div className="w-16 h-9 bg-slate-100 rounded overflow-hidden border shrink-0 relative">
        <MediaThumbnail url={item.url} type={item.type} />
      </div>

      {/* 3. Info & Quick Settings */}
      <div className="flex-1 min-w-0 grid gap-1">
          {/* Type Label */}
          <div className="flex items-center gap-2">
            {item.type === 'video' 
                ? <Film size={12} className="text-blue-500" /> 
                : <ImageIcon size={12} className="text-green-500" />
            }
            <span className="text-xs font-medium truncate text-muted-foreground">
                {item.type === 'video' ? 'Video' : 'Image'} {index + 1}
            </span>
          </div>

          {/* Duration Input */}
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-muted-foreground" />
            <div className="flex items-center gap-1">
                <Input
                    type="number"
                    className="h-5 w-14 text-[11px] px-1 text-right focus-visible:ring-1"
                    value={item.duration || 10}
                    onChange={(e) => onChange(item.id, 'duration', Number(e.target.value))}
                    onKeyDown={(e) => e.stopPropagation()} // ป้องกัน event ชนกับ dnd
                    onPointerDown={(e) => e.stopPropagation()}
                />
                <span className="text-[10px] text-muted-foreground">sec</span>
            </div>
          </div>
      </div>

      {/* 4. Actions (Settings Popover & Delete) */}
      <div className="flex items-center gap-1">
        {/* Advanced Settings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <Settings2 size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-3">
              <h5 className="font-medium text-xs text-muted-foreground flex items-center gap-2">
                <Settings2 size={12} /> Advanced Settings
              </h5>
              
              {/* URL Display */}
              <div className="space-y-1">
                <Label className="text-[10px]">Source URL</Label>
                <Input 
                  value={item.url} 
                  readOnly 
                  className="h-7 text-xs bg-muted text-muted-foreground" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 {/* Location ID */}
                 <div className="space-y-1">
                    <Label className="text-[10px] flex items-center gap-1">
                      <MapPin size={10} /> Location ID
                    </Label>
                    <Input 
                      className="h-7 text-xs" 
                      placeholder="e.g. 100"
                      value={item.locationId || ''}
                      onChange={(e) => onChange(item.id, 'locationId', e.target.value)}
                    />
                 </div>
                 
                 {/* Fullscreen Toggle */}
                 <div className="space-y-1 flex flex-col items-start">
                    <Label className="text-[10px] flex items-center gap-1 mb-1.5">
                      <Maximize size={10} /> Fullscreen
                    </Label>
                    <Switch 
                      className="scale-75 origin-left"
                      checked={item.fullscreen || false}
                      onCheckedChange={(val) => onChange(item.id, 'fullscreen', val)}
                    />
                 </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Delete Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50" 
          onClick={() => onDelete(item.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function ImageProperties({ widget }: ImagePropertiesProps) {
  const updateWidgetProperties = useEditorStore(state => state.updateWidgetProperties);
  
  const properties = widget.properties;
  const { playlist = [] } = properties;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, 
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = playlist.findIndex((item) => item.id === active.id);
      const newIndex = playlist.findIndex((item) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
          const newPlaylist = arrayMove(playlist, oldIndex, newIndex);
          updatePlaylist(newPlaylist);
      }
    }
  };

  const handleItemChange = (itemId: string, field: keyof PlaylistItem, value: any) => {
    const newPlaylist = playlist.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    updatePlaylist(newPlaylist);
  };
  
  const handleAddItemByUrl = () => {
    const newItem: PlaylistItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url: 'https://picsum.photos/400/300',
      type: 'image',
      duration: 10,
    };
    updatePlaylist([...playlist, newItem]);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
        const newPlaylist = playlist.filter(item => item.id !== itemToDelete);
        updatePlaylist(newPlaylist);
        setItemToDelete(null); 
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  return (
    <div className="space-y-4">
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

      {/* Playlist Items with Drag & Drop */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={playlist.map(item => item.id)} 
            strategy={verticalListSortingStrategy}
          >
            {playlist.map((item, index) => (
              <SortablePlaylistItem 
                key={item.id} 
                item={item} 
                index={index} 
                onDelete={(id) => setItemToDelete(id)}
                onChange={handleItemChange}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {playlist.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No items in playlist</p>
                <p className="text-xs opacity-70">Add URL or Upload Media</p>
            </div>
        )}
      </div>

      {/* AlertDialog */}
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
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}