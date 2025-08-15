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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // ✅ Ambil status sidebar dari localStorage saat pertama kali load
  useEffect(() => {
    const storedSidebarState = localStorage.getItem('sidebar-collapsed');
    if (storedSidebarState !== null) {
      setIsSidebarCollapsed(storedSidebarState === 'true');
    }
  }, []);

  // ✅ Simpan perubahan status sidebar ke localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  // ✅ Cek autentikasi admin
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
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: '#E5E5E5', color: '#1F2932' }}
    >
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
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
