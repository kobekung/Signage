'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // อย่าลืม npm install jwt-decode
import { useEditorStore } from '@/stores'; // เรียก Store ที่แก้แล้ว
import EditorLayout from '@/components/editor/EditorLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import BusManagement from '@/components/dashboard/BusManagement';
import { Loader2 } from 'lucide-react';

// URL ของเว็บแม่
const MASS_APP_URL = process.env.NEXT_PUBLIC_MASS_APP_URL || 'https://mass.bussing.app';

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-white" /></div>}>
      <SignageApp />
    </Suspense>
  );
}

// [กำหนด Type ให้ตรงกับ Token ที่ได้จาก Mass]
// *ถ้า Token ไม่มี field ไหน ค่าใน Store จะเป็น null ตาม default
type DecodedToken = {
  com_id: number;
  account_id: number;
  account_role: string;
  account_name?: string;     // Optional: ถ้าใน Token มีแนบมา
  account_username?: string; // Optional: ถ้าใน Token มีแนบมา
  exp: number;
  [key: string]: any; // เผื่อมี field อื่นๆ
};

function SignageApp() {
  const { currentView, setUserInfo, logout } = useEditorStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleAuth = (token: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                throw new Error("Token expired");
            }

            console.log("✅ Decoding Token to UserInfo:", decoded);

            // [FIX] Map ข้อมูลเข้า UserInfo ตาม Interface ที่กำหนด
            setUserInfo({
                token: token,
                com_id: decoded.com_id, 
                account_id: decoded.account_id,
                account_role: decoded.account_role,
                // ถ้า Token มีชื่อแนบมาให้ใช้ ถ้าไม่มีให้เป็น null (หรือค่า Default)
                account_name: decoded.account_name || null, 
                account_username: decoded.account_username || null,
                translation: "EN" // Default
            });
            
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
            
        } catch (e) {
            console.error("Auth Error:", e);
            logout();
            window.location.href = `${MASS_APP_URL}/?signage=true`;
        }
    };

    const tokenFromUrl = searchParams.get("token");
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (tokenFromUrl) {
        handleAuth(tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (storedToken) {
        handleAuth(storedToken);
    } else {
        window.location.href = `${MASS_APP_URL}/?signage=true`;
    }

  }, [searchParams, setUserInfo, logout]);

  if (!isAuthenticated) {
    return <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4"><Loader2 className="animate-spin"/> Authenticating...</div>;
  }

  if (currentView === 'buses') return <BusManagement />;
  if (currentView === 'dashboard') return <Dashboard />;
  return <EditorLayout />;
}