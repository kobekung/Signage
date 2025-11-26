'use client';

import { useEditorStore } from '@/stores';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Monitor, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import TemplateSelectionModal from '../editor/TemplateSelectionModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { TemplateType } from '@/lib/types';

export default function Dashboard() {
  const { savedLayouts, deleteLayout, editLayout, createLayout } = useEditorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [newLayoutName, setNewLayoutName] = useState('');

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    setIsModalOpen(false);
    setNewLayoutName(`${template.charAt(0).toUpperCase() + template.slice(1)} Layout`);
    setIsNameDialogOpen(true);
  };

  const handleCreateConfirm = () => {
    if (selectedTemplate) {
        createLayout(newLayoutName, selectedTemplate);
        setIsNameDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Layouts</h1>
            <p className="text-muted-foreground mt-1">Manage your digital signage screens.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="lg" className="gap-2">
            <Plus size={20} /> Create New Layout
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedLayouts.map((layout) => (
            <Card key={layout.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden border-muted-foreground/20 cursor-pointer" onClick={() => editLayout(layout.id)}>
              {/* Thumbnail Simulation */}
              <div className="aspect-video bg-slate-100 relative group-hover:opacity-90 transition-opacity border-b">
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Monitor size={48} />
                </div>
                {/* Simple visualization of regions */}
                <div className="absolute inset-0 p-4 opacity-60 pointer-events-none">
                    <div 
                        className="w-full h-full relative bg-white shadow-sm border"
                        style={{ aspectRatio: `${layout.width}/${layout.height}` }}
                    >
                        {layout.widgets.map((w, i) => (
                            <div 
                                key={i} 
                                className="absolute bg-blue-500/20 border border-blue-500/50"
                                style={{
                                    left: `${(w.x / layout.width) * 100}%`,
                                    top: `${(w.y / layout.height) * 100}%`,
                                    width: `${(w.width / layout.width) * 100}%`,
                                    height: `${(w.height / layout.height) * 100}%`,
                                }}
                            />
                        ))}
                    </div>
                </div>
              </div>

              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg truncate">{layout.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="text-xs text-muted-foreground flex flex-col gap-1">
                    <span>Resolution: {layout.width} x {layout.height} px</span>
                    <span>Updated: {formatDistanceToNow(new Date(layout.updatedAt), { addSuffix: true })}</span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 pt-2 border-t bg-muted/5">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); editLayout(layout.id); }}>
                    <Edit size={16} className="mr-2" /> Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); deleteLayout(layout.id); }}>
                    <Trash2 size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {savedLayouts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4 border-2 border-dashed rounded-xl bg-white/50">
                <Monitor size={64} className="opacity-20" />
                <p className="text-lg">No layouts found.</p>
                <Button onClick={() => setIsModalOpen(true)}>Create your first layout</Button>
            </div>
        )}
      </div>

      {/* Template Selection */}
      <TemplateSelectionModal
        isOpen={isModalOpen}
        onSelect={handleTemplateSelect}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Layout Naming Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Name your Layout</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Layout Name</Label>
                    <Input 
                        id="name" 
                        value={newLayoutName} 
                        onChange={(e) => setNewLayoutName(e.target.value)} 
                        placeholder="e.g., Lobby Morning Screen"
                        autoFocus
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNameDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateConfirm} disabled={!newLayoutName.trim()}>Create Layout</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}