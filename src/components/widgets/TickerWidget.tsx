'use client';

import { TickerWidgetProperties } from '@/lib/types';
import Marquee from 'react-fast-marquee';
import { useEffect, useState } from 'react';

interface TickerWidgetProps {
  properties: TickerWidgetProperties;
}

export default function TickerWidget({ properties }: TickerWidgetProps) {
  const { text, direction, speed, textColor, backgroundColor, fontSize } = properties;

  // เช็คว่าเป็นแนวตั้งหรือไม่ เพื่อปรับ CSS
  const isVertical = direction === 'up' || direction === 'down';
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // รอให้ Layout คำนวณขนาดเสร็จก่อนเริ่มวิ่ง
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
      return (
        <div 
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor, color: textColor, fontSize: `${fontSize}px` }}
        >
           {/* Loading State */}
        </div>
      );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        fontSize: `${fontSize}px`,
      }}
    >
      <Marquee
        // Key ช่วย Reset Animation เมื่อค่าเปลี่ยน
        key={`${direction}-${speed}-${text}`} 
        
        direction={direction} 
        speed={speed}
        gradient={false}
        play={true}
        loop={0}
        autoFill={true} // ฟีเจอร์นี้ต้องใช้ v6+
        className="w-full h-full"
        // ❌ ไม่ต้องใส่ vertical={isVertical} แล้วใน v6 (มันดูจาก direction เอง)
      >
        <div style={{ 
            whiteSpace: isVertical ? 'normal' : 'nowrap',
            wordBreak: isVertical ? 'break-word' : 'keep-all', 
            padding: isVertical ? '20px 0' : '0 50px',
            width: isVertical ? '100%' : 'auto',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {text}
        </div>
      </Marquee>
    </div>
  );
}