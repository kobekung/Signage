'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutGrid, 
  RectangleVertical, 
  RectangleHorizontal, 
  PanelLeft, 
  Square, 
  Columns, 
  Rows, 
  PanelTop 
} from 'lucide-react';
import { TemplateType } from '@/lib/types';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onSelect: (template: TemplateType) => void;
  onClose: () => void;
}

const templates = [
  { id: 'blank', name: 'Blank Canvas', icon: <Square size={32} /> },
  { id: 'split-horizontal', name: '2 Columns', icon: <Columns size={32} /> },
  { id: 'split-vertical', name: '2 Rows', icon: <Rows size={32} /> },
  { id: 'three-cols', name: '3 Columns', icon: <RectangleVertical  size={32} /> }, // ใหม่
  { id: 'three-rows', name: '3 Rows', icon: <RectangleHorizontal size={32} /> },       // ใหม่
  { id: 'sidebar-left', name: 'Sidebar Left', icon: <PanelLeft size={32} /> },
  { id: 'header-sidebar', name: 'Header & Side', icon: <PanelTop size={32} /> }, // ใหม่
  { id: 'quad-grid', name: '4 Grid', icon: <LayoutGrid size={32} /> },
];

export default function TemplateSelectionModal({ isOpen, onSelect, onClose }: TemplateSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Choose a Layout Template</DialogTitle>
          <DialogDescription>Select a starting point.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-center"
              onClick={() => onSelect(template.id as TemplateType)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2 h-full">
                <div className="text-primary/80">{template.icon}</div>
                <span className="text-xs font-medium">{template.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}