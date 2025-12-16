'use client';
import { useEditorStore } from '@/stores';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Canvas from './Canvas';
import Player from '@/components/player/Player';
import { useEffect, useState, useRef, useCallback, MouseEvent, TouchEvent } from 'react';
import { PanelLeftClose, PanelRightClose, PanelLeft, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ZoomControls from './ZoomControls';
import TemplateSelectionModal from './TemplateSelectionModal';
import { Layout, TemplateType } from '@/lib/types'; // [1] Import Types

export default function EditorLayout() {
  const { 
    isPreviewMode, 
    layout, 
    applyTemplate,
    viewState,
    setViewState,
    fitToScreen,
    deleteWidget,
    selectedWidgetId,
    hasInitialized,
    togglePreviewMode,
    savedLayouts, // [2] ดึง savedLayouts มาใช้
    fetchLayouts  // [2] ดึง fetchLayouts มาใช้ (เผื่อต้องโหลดข้อมูล)
  } = useEditorStore(state => ({
    isPreviewMode: state.isPreviewMode,
    layout: state.layout,
    applyTemplate: state.applyTemplate,
    viewState: state.viewState,
    setViewState: state.setViewState,
    fitToScreen: state.fitToScreen,
    deleteWidget: state.deleteWidget,
    selectedWidgetId: state.selectedWidgetId,
    hasInitialized: state.hasInitialized,
    togglePreviewMode: state.togglePreviewMode,
    savedLayouts: state.savedLayouts, 
    fetchLayouts: state.fetchLayouts
  }));

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastTouchPos = useRef<{x: number, y: number} | null>(null);

  // Detect Mobile & Auto-close Right Sidebar (Initial Load)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsRightSidebarOpen(false);
    }
    
    // [3] โหลด Saved Layouts ถ้ายังไม่มี (เพื่อให้ Modal มีข้อมูลแสดง)
    if (savedLayouts.length === 0) {
        fetchLayouts(1);
    }
  }, []);

  // Auto-open Right Sidebar when a widget is selected (Mobile Friendly)
  useEffect(() => {
    if (selectedWidgetId) {
      setIsRightSidebarOpen(true);
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsLeftSidebarOpen(false);
      }
    }
  }, [selectedWidgetId]);

  useEffect(() => {
    if (layout && layout.widgets.length === 0 && !hasInitialized) {
      setIsTemplateModalOpen(true);
    }
  }, [layout, hasInitialized]);
  
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleResize = () => {
      if (canvasContainerRef.current) {
        const { width, height } = canvasContainerRef.current.getBoundingClientRect();
        fitToScreen(width, height);
      }
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize(); 

    return () => resizeObserver.unobserve(container);
  }, [layout, fitToScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWidgetId) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement).isContentEditable) {
          return; 
        }
        e.preventDefault();
        deleteWidget(selectedWidgetId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedWidgetId, deleteWidget]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button === 2 || (e.button === 0 && e.nativeEvent.altKey)) {
      e.preventDefault();
      isPanning.current = true;
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isPanning.current) {
      setViewState({
        panX: viewState.panX + e.movementX,
        panY: viewState.panY + e.movementY,
      });
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    if (isPanning.current) {
      isPanning.current = false;
      e.currentTarget.style.cursor = 'grab';
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
        isPanning.current = true;
        lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isPanning.current && lastTouchPos.current && e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - lastTouchPos.current.x;
        const dy = touch.clientY - lastTouchPos.current.y;

        setViewState({
            panX: viewState.panX + dx,
            panY: viewState.panY + dy,
        });

        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = () => {
    isPanning.current = false;
    lastTouchPos.current = null;
  };
  
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation(); 
      
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(viewState.scale + delta, 0.1), 5);
      
      setViewState({ scale: newScale });
    }
  }, [viewState.scale, setViewState]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // [4] แก้ไข handleTemplateSelect ให้รองรับทั้ง Template และ Layout
  const handleTemplateSelect = (selection: TemplateType | Layout) => {
    if (typeof selection === 'string') {
        // กรณีเลือก Template ปกติ
        applyTemplate(selection as TemplateType);
    } else {
        // กรณีเลือก Copy Layout (ตอนนี้ใน Editor อาจจะยังไม่รองรับการ Replace Widgets 
        // แต่ใส่กันไว้ไม่ให้แอป Crash หรืออาจจะแจ้งเตือน)
        console.log("Copy layout feature inside editor is under construction:", selection);
        // ถ้าต้องการให้ Copy ได้จริง ต้องเพิ่ม Action ใน Store เช่น replaceWidgets(selection.widgets)
    }
    setIsTemplateModalOpen(false);
  };

  if (!layout) return null; 

  if (isPreviewMode) {
    return <Player layout={layout} onExit={togglePreviewMode} />;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen bg-background font-body overflow-hidden relative">
        
        {/* Left Sidebar */}
        {isLeftSidebarOpen && (
            <>
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                    onClick={() => setIsLeftSidebarOpen(false)}
                />
                <div className="absolute top-0 left-0 h-full z-50 md:static md:z-0 shadow-xl md:shadow-none bg-background transition-transform">
                    <LeftSidebar />
                </div>
            </>
        )}

        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex flex-1 min-h-0 relative">
            
            <div 
              ref={canvasContainerRef}
              className="flex-1 relative bg-muted/40 overflow-hidden cursor-grab touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="absolute top-2 left-2 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    >
                      {isLeftSidebarOpen ? <PanelLeftClose /> : <PanelLeft />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{isLeftSidebarOpen ? 'Collapse' : 'Expand'} Left Sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Canvas />
              
               <div className="absolute top-2 right-2 z-10">
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    >
                      {isRightSidebarOpen ? <PanelRightClose /> : <PanelRight />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{isRightSidebarOpen ? 'Collapse' : 'Expand'} Right Sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ZoomControls />
            </div>

            {/* Right Sidebar */}
            {isRightSidebarOpen && (
                <>
                      <div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                        onClick={() => setIsRightSidebarOpen(false)}
                    />
                    <div className="absolute top-0 right-0 h-full z-50 md:static md:z-0 shadow-xl md:shadow-none bg-background border-l">
                        <RightSidebar />
                    </div>
                </>
            )}

          </main>
        </div>
        
        {/* [5] ส่ง existingLayouts เข้าไป */}
        <TemplateSelectionModal
          isOpen={isTemplateModalOpen}
          onSelect={handleTemplateSelect}
          onClose={() => setIsTemplateModalOpen(false)}
          existingLayouts={savedLayouts} 
        />
      </div>
    </TooltipProvider>
  );
}