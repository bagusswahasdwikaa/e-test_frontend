'use client';

import {
  FiMenu,
  FiLogOut,
  FiHome,
  FiList,
  FiUsers,
  FiUser,
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <FiHome /> },
    { label: 'Daftar Ujian', href: '/admin/daftarUjian', icon: <FiList /> },
    { label: 'Daftar Peserta', href: '/admin/daftarPeserta', icon: <FiUsers /> },
    { label: 'Profil', href: '/admin/profil', icon: <FiUser /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/authentication/login');
  };

  return (
    <div className="fixed top-0 left-0 h-screen z-50">
      <aside
        className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full flex flex-col transition-all duration-300 shadow-lg ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-gray-700">
          {!isCollapsed && (
            <span className="text-2xl font-bold text-white-200 tracking-wide select-none">
              Menu
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white p-2 rounded hover:bg-gray-700 transition cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* Menu List */}
        <nav className="flex flex-col px-2 py-4 gap-2 flex-1">
          {menuItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;

            return (
              <Link key={href} href={href}>
                <div
                  className={`relative group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive ? 'bg-gray-400 text-white shadow' : 'hover:bg-gray-700 text-gray-300'}
                  `}
                >
                  <span className="text-lg">{icon}</span>
                  {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}

                  {/* Tooltip */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 w-max opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 transition duration-300 whitespace-nowrap shadow-lg">
                      {label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-2 mt-auto mb-4">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
            >
              <FiLogOut />
              {!isCollapsed && <span>Keluar</span>}
            </button>

            {isCollapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-max opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 transition duration-300 whitespace-nowrap shadow-lg">
                Keluar
              </span>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
