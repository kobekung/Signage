'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/stores';
import { Bus, Layout } from '@/lib/types';
import { getBuses, createBus, assignBusLayout, getLayouts, updateBus, deleteBus } from '@/apis'; // [NEW] import update/delete
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Bus as BusIcon, MonitorPlay, Pencil, Trash2 } from 'lucide-react'; // [NEW] icons
import { useToast } from '@/hooks/use-toast';

export default function BusManagement() {
  const { backToDashboard } = useEditorStore();
  const { toast } = useToast();
  
  const [buses, setBuses] = useState<Bus[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  
  // Create State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBusName, setNewBusName] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  
  // Edit State [NEW]
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editBusName, setEditBusName] = useState('');
  const [editDeviceId, setEditDeviceId] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [busesData, layoutsData] = await Promise.all([getBuses(), getLayouts()]);
      setBuses(busesData);
      setLayouts(layoutsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBus = async () => {
    if (!newBusName || !newDeviceId) return;
    setIsLoading(true);
    try {
      await createBus(newBusName, newDeviceId);
      toast({ title: "Success", description: "Bus created successfully" });
      setIsCreateOpen(false);
      setNewBusName('');
      setNewDeviceId('');
      loadData();
    } catch (e) {
      toast({ title: "Error", description: "Failed to create bus", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // [NEW] เปิด Modal แก้ไข
  const openEditModal = (bus: Bus) => {
    setEditingBus(bus);
    setEditBusName(bus.bus_name);
    setEditDeviceId(bus.bus_device_id);
    setIsEditOpen(true);
  };

  // [NEW] บันทึกการแก้ไข
  const handleUpdateBus = async () => {
    if (!editingBus || !editBusName || !editDeviceId) return;
    setIsLoading(true);
    try {
      await updateBus(editingBus.bus_id, editBusName, editDeviceId);
      toast({ title: "Success", description: "Bus updated successfully" });
      setIsEditOpen(false);
      setEditingBus(null);
      loadData();
    } catch (e) {
      toast({ title: "Error", description: "Failed to update bus", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // [NEW] ลบรถ
  const handleDeleteBus = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bus?")) return;
    try {
      await deleteBus(id);
      toast({ title: "Deleted", description: "Bus deleted successfully" });
      loadData();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete bus", variant: "destructive" });
    }
  };

  const handleAssignLayout = async (busId: number, layoutIdString: string) => {
    const layoutId = layoutIdString === 'none' ? null : Number(layoutIdString);
    try {
      await assignBusLayout(busId, layoutId);
      toast({ title: "Updated", description: "Layout assigned successfully" });
      
      setBuses(prev => prev.map(b => 
        b.bus_id === busId ? { ...b, current_layout_id: layoutId } : b
      ));
    } catch (e) {
      toast({ title: "Error", description: "Failed to assign layout", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={backToDashboard}>
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bus Management</h1>
              <p className="text-muted-foreground">Manage your fleet and assign ads.</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus size={20} /> Add Bus
          </Button>
        </div>

        {/* Bus List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BusIcon className="w-5 h-5" /> All Buses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus Name</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Current Layout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead> {/* เพิ่มช่อง Actions */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.bus_id}>
                    <TableCell className="font-medium">{bus.bus_name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{bus.bus_device_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MonitorPlay size={16} className="text-muted-foreground"/>
                        <Select 
                            value={bus.current_layout_id?.toString() || 'none'} 
                            onValueChange={(val) => handleAssignLayout(bus.bus_id, val)}
                        >
                            <SelectTrigger className="w-[200px] h-8">
                                <SelectValue placeholder="Select Layout" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" className="text-muted-foreground">-- Stop Playing --</SelectItem>
                                {layouts.map(l => (
                                    <SelectItem key={l.id} value={l.id.toString()}>
                                        {l.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${bus.current_layout_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {bus.current_layout_id ? 'Active' : 'Idle'}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(bus)}>
                                <Pencil size={16} className="text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBus(bus.bus_id)}>
                                <Trash2 size={16} className="text-red-600" />
                            </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
                {buses.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No buses found. Add one to get started.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Bus Name</label>
                <Input value={newBusName} onChange={e => setNewBusName(e.target.value)} placeholder="e.g. Bus 101" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Device ID</label>
                <Input value={newDeviceId} onChange={e => setNewDeviceId(e.target.value)} placeholder="Unique ID from Android Box" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBus} disabled={isLoading}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* [NEW] Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Bus Name</label>
                <Input value={editBusName} onChange={e => setEditBusName(e.target.value)} placeholder="e.g. Bus 101" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Device ID</label>
                <Input value={editDeviceId} onChange={e => setEditDeviceId(e.target.value)} placeholder="Unique ID" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateBus} disabled={isLoading}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}