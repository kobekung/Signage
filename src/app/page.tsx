'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useEditorStore } from '@/stores';
import EditorLayout from '@/components/editor/EditorLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import BusManagement from '@/components/dashboard/BusManagement';
import { Loader2 } from 'lucide-react';

// URL ของเว็บแม่ (Login App)
const MASS_APP_URL = process.env.NEXT_PUBLIC_MASS_APP_URL || 'https://mass.bussing.app';

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-white" /></div>}>
      <SignageApp />
    </Suspense>
  );
}

type DecodedToken = {
  com_id: number;
  account_id: number;
  account_role: string;
  account_name?: string;
  account_username?: string;
  exp: number;
  [key: string]: any;
};

function SignageApp() {
  const { currentView, setUserInfo, logout } = useEditorStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ฟังก์ชันสำหรับดีดกลับไปหน้า Login ของเว็บแม่
    const redirectToLogin = () => {
        // [1] หา URL ปัจจุบันแบบ Dynamic (ไม่ว่าจะเป็น localhost หรือ domain จริง)
        // window.location.origin = http://localhost:3000 หรือ https://signage.lab.bussing.app
        // window.location.pathname = / (หรือ path ปัจจุบัน)
        const currentUrl = window.location.origin + window.location.pathname; 
        
        // ส่ง currentUrl ไปเป็น redirect_url
        window.location.href = `${MASS_APP_URL}/?redirect_url=${currentUrl}`;
    };

    const handleAuth = (token: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                throw new Error("Token expired");
            }

            console.log("✅ Decoding Token to UserInfo:", decoded);

            setUserInfo({
                token: token,
                com_id: decoded.com_id, 
                account_id: decoded.account_id,
                account_role: decoded.account_role,
                account_name: decoded.account_name || null, 
                account_username: decoded.account_username || null,
                translation: "EN"
            });
            
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
            
        } catch (e) {
            console.error("Auth Error:", e);
            logout();
            // [2] เรียกใช้ฟังก์ชัน redirect
            redirectToLogin();
        }
    };

    const tokenFromUrl = searchParams.get("token");
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (tokenFromUrl) {
        // กรณี Login สำเร็จและได้ Token กลับมาทาง URL
        handleAuth(tokenFromUrl);
        // ลบ Token ออกจาก URL bar เพื่อความสวยงามและปลอดภัย
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (storedToken) {
        // กรณีมี Token เดิมอยู่แล้ว (Refresh หน้า)
        handleAuth(storedToken);
    } else {
        // [3] กรณีไม่มี Token เลย ให้ดีดไป Login
        redirectToLogin();
    }

  }, [searchParams, setUserInfo, logout]);

  if (!isAuthenticated) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
            <Loader2 className="animate-spin"/> 
            <p>Redirecting to Login...</p>
        </div>
    );
  }

  if (currentView === 'buses') return <BusManagement />;
  if (currentView === 'dashboard') return <Dashboard />;
  return <EditorLayout />;
}