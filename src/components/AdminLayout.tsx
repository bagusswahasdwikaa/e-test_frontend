'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      // Jika tidak ada token atau bukan admin, redirect ke login
      router.replace('/authentication/login');
    } else {
      setIsAuthorized(true);
    }

    setCheckingAuth(false);
  }, [router]);

  // Tampilkan loading UI saat sedang cek otorisasi
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-600">
        Memeriksa akses...
      </div>
    );
  }

  // Jangan render konten jika tidak authorized (redirect akan berjalan)
  if (!isAuthorized) return null;

  // ✅ Konten Layout yang dirender jika sudah valid
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
