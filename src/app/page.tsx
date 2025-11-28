'use client';
import { useEditorStore } from '@/stores';
import EditorLayout from '@/components/editor/EditorLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import BusManagement from '@/components/dashboard/BusManagement'; // [NEW]

export default function Home() {
  const currentView = useEditorStore(state => state.currentView);

  // [NEW]
  if (currentView === 'buses') {
    return <BusManagement />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard />;
  }

  return <EditorLayout />;
}