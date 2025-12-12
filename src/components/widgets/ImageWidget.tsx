'use client';
import { Widget, WidgetProperties } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface ImageWidgetProps {
  widget: Widget;
  properties: WidgetProperties;
  onFinished?: () => void;
  isTriggerMode?: boolean;
}

export default function ImageWidget({ properties, onFinished, isTriggerMode }: ImageWidgetProps) {
  const { playlist = [], fitMode = 'cover' } = properties;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // ฟังก์ชันสำหรับสั่งเล่นวีดีโอแบบปลอดภัย (ดัก Error ให้)
  const playVideo = () => {
    if (videoRef.current) {
        // รีเซ็ตเวลาเป็น 0 เพื่อความชัวร์
        videoRef.current.currentTime = 0;
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                // ดัก Error กรณีวีดีโอถูกขัดจังหวะ (เช่น เปลี่ยนหน้าเร็วๆ) ไม่ให้ App แครช
                if (error.name !== 'AbortError') {
                    console.log("Video playback interrupted (handled):", error);
                }
            });
        }
    }
  };

  useEffect(() => {
    if (playlist.length === 0) return;

    const currentItem = playlist[currentIndex];
    let timer: NodeJS.Timeout;

    const goNext = () => {
        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // จบ Playlist
            if (isTriggerMode && onFinished) {
                onFinished();
            } else {
                setCurrentIndex(0);
                
                // [FIX] กรณีมีวีดีโอเดียวใน Playlist แล้ว Loop
                // ค่า currentIndex ไม่เปลี่ยน (0 -> 0) React จะไม่ Re-render 
                // เราต้องสั่ง Play ใหม่เอง
                if (playlist.length === 1 && currentItem.type === 'video') {
                     playVideo();
                }
            }
        }
    };

    if (currentItem.type === 'image') {
      const duration = (currentItem.duration || 10) * 1000;
      timer = setTimeout(goNext, duration);
    } else if (currentItem.type === 'video') {
        // [FIX] สั่งเล่นวีดีโอเมื่อ Component ถูก Mount หรือเปลี่ยน Index
        playVideo();
    }

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
          key={currentItem.id} // สำคัญ! ให้ React สร้าง Element ใหม่เมื่อเปลี่ยนวีดีโอ
          src={currentItem.url}
          className="w-full h-full"
          style={{ objectFit: fitMode }}
          // [FIX] เอา autoPlay ออก แล้วใช้ useEffect สั่ง play แทนเพื่อดัก error
          muted={isMuted}
          playsInline
          onEnded={() => {
              if (currentIndex < playlist.length - 1) {
                  setCurrentIndex(prev => prev + 1);
              } else {
                  if (isTriggerMode && onFinished) {
                      onFinished();
                  } else {
                      setCurrentIndex(0);
                      // [FIX] สั่งเล่นซ้ำกรณี Loop วีดีโอเดิม
                      if (playlist.length === 1) playVideo();
                  }
              }
          }}
          onError={(e) => {
              console.error("Video load error, skipping...", e);
              // [FIX] ถ้าวีดีโอเสีย ให้ข้ามไปตัวถัดไปเลย ไม่ให้ค้าง
              if (currentIndex < playlist.length - 1) {
                  setCurrentIndex(prev => prev + 1);
              } else {
                   if (isTriggerMode && onFinished) onFinished();
                   else setCurrentIndex(0);
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