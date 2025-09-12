'use client';

import {
  FiLogOut,
  FiHome,
  FiList,
  FiUser,
  FiBarChart2, 
  FiFileText,
} from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

function ElegantHamburger({ isOpen }: { isOpen: boolean }) {
  const commonClasses =
    'absolute w-6 h-[2px] bg-white rounded transition-all duration-300';

  return (
    <button
      aria-label="Toggle Sidebar"
      className="relative w-9 h-9 flex items-center justify-center group focus:outline-none transition-transform hover:scale-105 cursor-pointer"
    >
      {/* Top Bar */}
      <motion.span
        className={commonClasses}
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 6 : -6,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      />
      {/* Middle Bar */}
      <motion.span
        className={commonClasses}
        animate={{
          opacity: isOpen ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Bottom Bar */}
      <motion.span
        className={commonClasses}
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -6 : 6,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      />
    </button>
  );
}

export default function UserSidebar({
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { label: 'Beranda', href: '/user/dashboard', icon: <FiHome /> },
    { label: 'Soal', href: '/user/soal', icon: <FiFileText /> },
    { label: 'Hasil', href: '/user/hasil', icon: <FiBarChart2 /> },
    { label: 'Profil', href: '/user/profil', icon: <FiUser /> },
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
        <div className="flex justify-center py-4">
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wide select-none">
              Menu
            </span>
          )}
          {isCollapsed && (
            <div onClick={() => setIsCollapsed(false)}>
              <ElegantHamburger isOpen={false} />
            </div>
          )}
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
                title={isCollapsed ? label : ''}
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
