'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button"; // ใช้ Button ธรรมดาแทน TabsTrigger
import { 
  LayoutGrid, 
  RectangleVertical, 
  RectangleHorizontal, 
  PanelLeft, 
  Square, 
  Columns, 
  Rows, 
  PanelTop,
  Copy,
  LayoutTemplate
} from 'lucide-react';
import { TemplateType, Layout } from '@/lib/types';
import LayoutThumbnail from '../dashboard/LayoutThumbnail'; 

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onSelect: (selection: TemplateType | Layout) => void;
  onClose: () => void;
  existingLayouts: Layout[];
}

const templates = [
  { id: 'blank', name: 'Blank Canvas', icon: <Square size={32} /> },
  { id: 'split-horizontal', name: '2 Columns', icon: <Columns size={32} /> },
  { id: 'split-vertical', name: '2 Rows', icon: <Rows size={32} /> },
  { id: 'three-cols', name: '3 Columns', icon: <RectangleVertical  size={32} /> },
  { id: 'three-rows', name: '3 Rows', icon: <RectangleHorizontal size={32} /> },
  { id: 'sidebar-left', name: 'Sidebar Left', icon: <PanelLeft size={32} /> },
  { id: 'header-sidebar', name: 'Header & Side', icon: <PanelTop size={32} /> },
  { id: 'quad-grid', name: '4 Grid', icon: <LayoutGrid size={32} /> },
];

export default function TemplateSelectionModal({ isOpen, onSelect, onClose, existingLayouts }: TemplateSelectionModalProps) {
  // [FIXED] ใช้ State แทน Tabs เพื่อความชัวร์และลด Error เรื่อง Component
  const [activeTab, setActiveTab] = useState<'templates' | 'copy'>('templates');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        
        {/* Header ส่วนบน */}
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>Create New Layout</DialogTitle>
            <DialogDescription>Start from a template or copy an existing layout.</DialogDescription>
          </DialogHeader>

          {/* Custom Tabs Switcher (ไม่ต้องใช้ Shadcn Tabs) */}
          <div className="flex p-1 bg-muted rounded-lg mt-4 w-full">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'templates' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-background/50'
              }`}
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Use Template
            </button>
            <button
              onClick={() => setActiveTab('copy')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'copy' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-background/50'
              }`}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Existing Layout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-6 pt-2">
          
          {/* TAB 1: Templates */}
          {activeTab === 'templates' && (
             <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4">
                    {templates.map((template) => (
                        <Card
                        key={template.id}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-center border-muted"
                        onClick={() => onSelect(template.id as TemplateType)}
                        >
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3 min-h-[140px]">
                            <div className="text-primary/80">{template.icon}</div>
                            <span className="text-sm font-medium">{template.name}</span>
                        </CardContent>
                        </Card>
                    ))}
                </div>
             </ScrollArea>
          )}

          {/* TAB 2: Copy Existing */}
          {activeTab === 'copy' && (
            <div className="h-full">
                {existingLayouts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
                        <Copy size={48} className="mb-2 opacity-20"/>
                        <p>No existing layouts to copy.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-full pr-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
                            {existingLayouts.map((layout) => (
                                <Card
                                    key={layout.id}
                                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all overflow-hidden group relative border-muted"
                                    onClick={() => onSelect(layout)}
                                >
                                    {/* [FIXED] pointer-events-none เพื่อป้องกัน Click blocking */}
                                    <div className="aspect-video bg-slate-100 relative border-b overflow-hidden pointer-events-none">
                                        {/* เช็คความปลอดภัยก่อน Render LayoutThumbnail */}
                                        {layout && (
                                            <LayoutThumbnail
                                                width={layout.width || 1920}
                                                height={layout.height || 1080}
                                                widgets={layout.widgets || []}
                                                thumbnailUrl={layout.thumbnail}
                                                scale={0.15} 
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-sm truncate">{layout.name || 'Untitled'}</CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {layout.width}x{layout.height}
                                        </p>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}