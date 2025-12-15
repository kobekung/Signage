'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Widget } from '@/lib/types';
import WidgetRenderer from '../widgets/WidgetRenderer';
import { X } from 'lucide-react'; // [4] Import Icon

interface PlayerProps {
  layout: Layout;
  onExit?: () => void; // [5] รับ prop เพื่อออกจาก Preview
}

const BUS_API_URL = 'https://public.bussing.app/bus-info/busround-active?busno=10&com_id=1';

export default function Player({ layout, onExit }: PlayerProps) {
  const [activeTrigger, setActiveTrigger] = useState<{ 
      widget: Widget;
      isFullscreen: boolean;
  } | null>(null);

  const [lastProcessedLocation, setLastProcessedLocation] = useState<number | null>(null);

  useEffect(() => {
    const checkLocation = async () => {
      try {
        const res = await fetch(BUS_API_URL);
        if (!res.ok) return;
        const json = await res.json();
        
        if (json.status && json.data) {
            const currentLocationId = json.data.busround_location_now_id;
            
            if (currentLocationId && currentLocationId !== lastProcessedLocation) {
                console.log("Bus reached location:", currentLocationId);
                setLastProcessedLocation(currentLocationId);

                let foundMatch = false;

                for (const widget of layout.widgets) {
                    if (widget.properties.playlist && Array.isArray(widget.properties.playlist)) {
                        const playlist = widget.properties.playlist;
                        const matchItem = playlist.find(item => 
                            item.locationId && item.locationId.toString() === currentLocationId.toString()
                        );

                        if (matchItem) {
                            console.log("Found Match Item:", matchItem.id);
                            foundMatch = true;

                            const triggerWidget: Widget = {
                                ...widget,
                                properties: {
                                    ...widget.properties,
                                    playlist: [matchItem]
                                }
                            };

                            setActiveTrigger({
                                widget: triggerWidget,
                                isFullscreen: matchItem.fullscreen === true
                            });
                            
                            break;
                        }
                    }
                }
                
                if (!foundMatch) {
                    console.log("No matching item for location:", currentLocationId);
                }
            }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    checkLocation();
    const interval = setInterval(checkLocation, 30000);
    return () => clearInterval(interval);
  }, [layout.widgets, lastProcessedLocation]);

  const handleTriggerFinished = () => {
      console.log("Trigger finished.");
      setActiveTrigger(null);
  };

  return (
    // [6] เพิ่ม group class เพื่อใช้กับ hover effect
    <div className="relative w-screen h-screen bg-black overflow-hidden group">
      
      {/* [7] ปุ่ม Exit Preview */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute top-4 right-4 z-[9999] p-2 bg-black/30 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all duration-300 opacity-50 hover:opacity-100"
          title="Exit Preview"
        >
          <X size={24} />
        </button>
      )}

      {/* Normal Layer */}
      <div className="absolute inset-0 w-full h-full">
         <div 
            className="relative origin-top-left"
            style={{
                width: layout.width,
                height: layout.height,
                backgroundColor: layout.backgroundColor,
                transform: `scale(${typeof window !== 'undefined' ? Math.min(window.innerWidth / layout.width, window.innerHeight / layout.height) : 1})`
            }}
         >
            {layout.widgets.map((widget) => (
                <div
                    key={widget.id}
                    className="absolute overflow-hidden"
                    style={{
                        left: widget.x,
                        top: widget.y,
                        width: widget.width,
                        height: widget.height,
                        zIndex: widget.zIndex
                    }}
                >
                    <WidgetRenderer widget={widget} />
                </div>
            ))}
         </div>
      </div>

      {/* Trigger Overlay Layer */}
      {activeTrigger && (
          <div className="absolute inset-0 z-[9990] flex items-center justify-center bg-black/80">
              
              {activeTrigger.isFullscreen ? (
                  <div className="w-full h-full">
                      <WidgetRenderer 
                          widget={activeTrigger.widget} 
                          onFinished={handleTriggerFinished} 
                          isTriggerMode={true} 
                      />
                  </div>
              ) : (
                  <div 
                    className="relative bg-black border-2 border-white shadow-2xl"
                    style={{
                        width: '80%',
                        height: '80%',
                    }}
                  >
                      <WidgetRenderer 
                          widget={activeTrigger.widget} 
                          onFinished={handleTriggerFinished} 
                          isTriggerMode={true}
                      />
                      <button 
                        onClick={handleTriggerFinished}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700"
                      >
                        ✕
                      </button>
                  </div>
              )}
          </div>
      )}
    </div>
  );
}