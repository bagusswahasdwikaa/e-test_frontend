'use client';

import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

  // Load state sidebar dari localStorage
  useEffect(() => {
    const storedSidebarState = localStorage.getItem('sidebar-collapsed');
    if (storedSidebarState !== null) {
      setIsSidebarCollapsed(storedSidebarState === 'true');
    }
  }, []);

  // Simpan state sidebar ke localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  // Cek autentikasi admin
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
        style={{ backgroundColor: '#D1D1D1', color: '#1F2937' }}
      >
        Memeriksa akses...
      </div>
    );
  }

  if (!isAuthorized) return null;

  // ukuran dinamis
  const sidebarWidth = isSidebarCollapsed ? 80 : 260; // 260px = w-64
  const headerHeight = 56; // sesuai AdminHeader.tsx (h-14)

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#E5E5E5', color: '#1F2932' }}
    >
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Header */}
      <AdminHeader
        searchTerm={searchTerm ?? ''}
        setSearchTerm={setSearchTerm ?? (() => {})}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Konten dengan animasi geser */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="p-6 min-w-0"
        style={{ paddingTop: headerHeight + 16 }} // header + margin top
      >
        {children}
      </motion.main>
    </div>
  );
}
