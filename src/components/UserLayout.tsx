'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from './UserSidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'user') {
      router.replace('/authentication/login');
    } else {
      setIsAuthorized(true);
    }

    setChecking(false);
  }, [router]);

  if (checking || !isAuthorized) return null;

  return (
    <SidebarProvider>
      <UserLayoutInner>{children}</UserLayoutInner>
    </SidebarProvider>
  );
}

function UserLayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
