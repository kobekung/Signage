'use client';
import { useEditorStore } from '@/stores';
import EditorLayout from '@/components/editor/EditorLayout';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const currentView = useEditorStore(state => state.currentView);

  if (currentView === 'dashboard') {
    return <Dashboard />;
  }

  return <EditorLayout />;
}