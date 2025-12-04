'use client';

import { LayoutDashboard, Clapperboard, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const navItems = [
  { icon: LayoutDashboard, label: 'Layouts', href: '#' },
  { icon: Clapperboard, label: 'Media', href: '#' },
  { icon: Calendar, label: 'Schedules', href: '#' },
];

export default function LeftSidebar() {
  return (
    <aside className="dark w-64 bg-sidebar text-sidebar-foreground flex flex-col justify-between p-4 border-r border-sidebar-border">
      <div>
        <div className="flex items-center gap-2 mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-primary"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <h1 className="text-xl font-bold text-foreground">Signage Canvas</h1>
        </div>
        {/* <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start gap-3"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav> */}
      </div>
      <div>
        <Button
            variant="ghost"
            className="justify-start gap-3 w-full"
            asChild
          >
            {/* <Link href="#">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link> */}
        </Button>
      </div>
    </aside>
  );
}
