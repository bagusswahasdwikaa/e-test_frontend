'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiBarChart2, FiLogOut, FiMenu } from 'react-icons/fi';
import React, { Dispatch, SetStateAction } from 'react';

interface UserSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function UserSidebar({ isCollapsed, setIsCollapsed }: UserSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Beranda', href: '/user/dashboard', icon: <FiHome /> },
    { label: 'Soal', href: '/user/soal', icon: <FiFileText /> },
    { label: 'Hasil', href: '/user/hasil', icon: <FiBarChart2 /> },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen z-50">
      <aside
        className={`bg-gray-900 text-white h-full flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header & Toggle Button */}
        <div className="flex items-center justify-between px-4 py-6">
          {!isCollapsed && <span className="text-xl font-bold select-none">Menu</span>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white p-2 rounded hover:bg-gray-800 transition"
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <FiMenu />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col gap-2 px-2 flex-1">
          {menuItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition
                  ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}
                `}
              >
                <span className="text-lg">{icon}</span>
                {!isCollapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          className="mt-auto mx-2 mb-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition flex items-center justify-center gap-2"
          onClick={() => {
            // Tambahkan logout logic di sini
            alert('Logout dipanggil');
          }}
        >
          <FiLogOut />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </aside>
    </div>
  );
}
