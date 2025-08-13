'use client';

import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import UserHeader from '@/components/UserHeader';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'user') {
      router.replace('/authentication/login');
    } else {
      setIsAuthorized(true);
    }

    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#D1D1D1', color: '#1F2937' }} // text-gray-800
      >
        Memeriksa akses...
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <SidebarProvider>
      <UserLayoutInner>{children}</UserLayoutInner>
    </SidebarProvider>
  );
}

function UserLayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: '#E5E5E5', color: '#1F2932' }}
    >
      {/* Sidebar */}
      <UserSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
