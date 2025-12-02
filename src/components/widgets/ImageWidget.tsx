'use client';
import { Widget, WidgetProperties, PlaylistItem } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Volume2, VolumeX } from 'lucide-react';

interface ImageWidgetProps {
  widget: Widget; // รับ Widget เต็มๆ
  properties: WidgetProperties;
  onFinished?: () => void; // [NEW]
  isTriggerMode?: boolean; // [NEW]
}

export default function ImageWidget({ properties, onFinished, isTriggerMode }: ImageWidgetProps) {
  const { playlist = [], fitMode = 'cover' } = properties;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Default muted for autoplay
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Logic การเล่น Playlist
  useEffect(() => {
    if (playlist.length === 0) return;

    const currentItem = playlist[currentIndex];
    let timer: NodeJS.Timeout;

    // ฟังก์ชันเปลี่ยนรายการถัดไป
    const goNext = () => {
        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // จบ Playlist แล้ว
            if (isTriggerMode && onFinished) {
                onFinished(); // [สำคัญ] แจ้ง Player ว่าจบแล้วให้ปิด Overlay
            } else {
                setCurrentIndex(0); // Loop ปกติ
            }
        }
    };

    if (currentItem.type === 'image') {
      // รูปภาพ: ตั้งเวลาตาม duration แล้วเปลี่ยน
      const duration = (currentItem.duration || 10) * 1000;
      timer = setTimeout(goNext, duration);
    } 
    // วิดีโอ: จะจัดการด้วย event onEnded ของ <video> เอง

    return () => clearTimeout(timer);
  }, [currentIndex, playlist, isTriggerMode, onFinished]);


  if (!playlist || playlist.length === 0) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Media</div>;
  }

  const currentItem = playlist[currentIndex];

  return (
    <div className="w-full h-full relative bg-black">
      {currentItem.type === 'video' ? (
        <video
          ref={videoRef}
          key={currentItem.id} // สำคัญ! เปลี่ยน key เพื่อให้ React สร้าง video ใหม่
          src={currentItem.url}
          className="w-full h-full"
          style={{ objectFit: fitMode }}
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={() => {
              // เมื่อวิดีโอจบ ให้ไปตัวถัดไป
              if (currentIndex < playlist.length - 1) {
                  setCurrentIndex(prev => prev + 1);
              } else {
                  // จบ Playlist
                  if (isTriggerMode && onFinished) {
                      onFinished();
                  } else {
                      setCurrentIndex(0);
                  }
              }
          }}
        />
      ) : (
        <img
          src={currentItem.url}
          alt="content"
          className="w-full h-full"
          style={{ objectFit: fitMode }}
        />
      )}
      
      {/* ปุ่มเปิดเสียงเฉพาะวิดีโอ */}
      {currentItem.type === 'video' && (
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-50 hover:opacity-100 transition"
          >
            {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
          </button>
      )}
    </div>
  );
}