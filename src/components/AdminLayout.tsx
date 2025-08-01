'use client';

import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  searchTerm?: string;
  setSearchTerm?: Dispatch<SetStateAction<string>>;
}

export default function AdminLayout({
  children,
  searchTerm,
  setSearchTerm,
}: AdminLayoutProps) {
  // ✅ Sidebar default tertutup (collapsed)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.replace('/authentication/login');
    } else {
      setIsAuthorized(true);
    }

    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-600">
        Memeriksa akses...
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <AdminHeader
          searchTerm={searchTerm ?? ''}
          setSearchTerm={setSearchTerm ?? (() => {})}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
