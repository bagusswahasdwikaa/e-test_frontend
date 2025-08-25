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

function Hamburger({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className="
        flex flex-col justify-center items-center cursor-pointer
        w-9 h-9 rounded-md
        transition duration-300
        hover:bg-gray-700 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]
      "
      aria-label="Hamburger menu"
    >
      {/* Bar 1 */}
      <span
        className={`block h-[2px] w-6 bg-white rounded transition-all duration-300 ease-in-out
        ${isOpen ? 'rotate-45 translate-y-2' : ''}`}
      />
      {/* Bar 2 */}
      <span
        className={`block h-[2px] w-6 bg-white rounded transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-0' : 'opacity-100'} my-1`}
      />
      {/* Bar 3 */}
      <span
        className={`block h-[2px] w-6 bg-white rounded transition-all duration-300 ease-in-out
        ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
      />
    </div>
  );
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

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsCollapsed(true);
  };

  return (
    <div className="fixed top-0 left-0 h-screen z-50">
      <aside
        className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full flex flex-col transition-all duration-300 shadow-lg ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 box-border">
            {!isCollapsed && (
              <span className="text-xl font-bold text-white tracking-wide select-none">
                Menu
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-gray-700 transition"
              aria-label="Toggle Sidebar"
            >
              <Hamburger isOpen={!isCollapsed} />
            </button>
          </div>

          {/* Garis tipis bawah hamburger */}
          <div className="border-b border-gray-700 mx-2 mt-[-12]" />
        </div>

        {/* Menu List */}
        <nav className="flex flex-col px-2 py-7 gap-2 flex-1">
          {menuItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            const baseClasses = `relative group flex items-center ${
              isCollapsed ? 'justify-center' : ''
            } gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gray-400 text-white shadow'
                : 'hover:bg-gray-700 text-gray-300'
            }`;

            if (isCollapsed) {
              return (
                <div key={href} className={baseClasses}>
                  <Link href={href}>
                    <span className="flex items-center justify-center w-6 h-6 text-lg leading-none">
                      {icon}
                      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 transition duration-300 whitespace-nowrap shadow-lg pointer-events-none">
                        {label}
                      </span>
                    </span>
                  </Link>
                </div>
              );
            } else {
              return (
                <button
                  key={href}
                  onClick={() => handleNavigation(href)}
                  className={baseClasses}
                >
                  <span className="text-lg flex items-center justify-center w-6 h-6 min-w-[24px]">
                    {icon}
                  </span>
                  <span className="whitespace-nowrap cursor-pointer">{label}</span>
                </button>
              );
            }
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-2 mt-auto mb-4">
          <div className="relative group flex justify-center">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
            >
              <FiLogOut />
              {!isCollapsed && <span>Keluar</span>}
            </button>

            {isCollapsed && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-max opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 transition duration-300 whitespace-nowrap shadow-lg pointer-events-none">
                Keluar
              </span>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
