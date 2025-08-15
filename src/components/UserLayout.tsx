'use client';

import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import UserHeader from '@/components/UserHeader';

interface UserLayoutProps {
  children: React.ReactNode;
  searchTerm?: string;
  setSearchTerm?: Dispatch<SetStateAction<string>>;
}

export default function UserLayout({
  children,
  searchTerm,
  setSearchTerm,
}: UserLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

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
        style={{ backgroundColor: '#D1D1D1', color: '#1F2937' }}
      >
        Memeriksa akses...
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: '#E5E5E5', color: '#1F2932' }}
    >
      {/* Sidebar */}
      <UserSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <UserHeader
          searchTerm={searchTerm ?? ''}
          setSearchTerm={setSearchTerm ?? (() => {})}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
