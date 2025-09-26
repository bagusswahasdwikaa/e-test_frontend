'use client';

import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

  // Cek autentikasi user
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

  // Ukuran dinamis yang disesuaikan dengan komponen yang diperbarui
  const sidebarWidth = isSidebarCollapsed ? 80 : 280; // Disesuaikan dengan enhanced sidebar
  const headerHeight = 72; // Disesuaikan dengan enhanced header

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#E5E5E5', color: '#1F2932' }}
    >
      {/* Sidebar */}
      <UserSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Header */}
      <UserHeader
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