'use client';

import {
  FiLogOut,
  FiHome,
  FiList,
  FiUsers,
  FiUser,
} from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

function Hamburger({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className="
        flex flex-col justify-center items-center
        w-9 h-9 rounded-md
        transition duration-300
        hover:bg-gray-700 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]
        cursor-pointer
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
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full flex flex-col shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wide select-none">
              Menu
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-gray-700 transition cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Hamburger isOpen={!isCollapsed} />
          </button>
        </div>

        <div className="border-b border-gray-700 mx-2 mt-[-12]" />

        {/* Menu List */}
        <nav className="flex flex-col px-2 py-6 gap-2 flex-1">
          {menuItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            const baseClasses = `relative group flex items-center ${
              isCollapsed ? 'justify-center' : ''
            } gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gray-400 text-white shadow'
                : 'hover:bg-gray-700 text-gray-300'
            }`;

            return (
              <button
                key={href}
                onClick={() => handleNavigation(href)}
                className={baseClasses}
                title={isCollapsed ? label : ''} // tampilkan nama menu ketika hover saat collapse
              >
                <span className="text-lg flex items-center justify-center w-6 h-6 min-w-[24px]">
                  {icon}
                </span>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isCollapsed ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </button>
            );
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
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isCollapsed ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Keluar
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
