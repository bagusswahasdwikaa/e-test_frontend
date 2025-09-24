'use client';

import {
  FiLogOut,
  FiHome,
  FiList,
  FiUser,
  FiBarChart2, 
  FiFileText,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Komponen Popup Logout
function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiAlertTriangle className="text-xl" />
                    <h3 className="text-lg font-semibold">Konfirmasi Keluar</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="hover:bg-red-600 rounded-full p-1 transition-colors cursor-pointer"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-center mb-6">
                  Apakah Anda yakin ingin keluar dari sistem?
                  <br />
                  <span className="text-sm text-gray-500">
                    Anda akan diarahkan ke halaman login.
                  </span>
                </p>

                {/* Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-gray-400 border border-gray-400 text-black-900 hover:bg-gray-50 transition-colors font-medium cursor-pointer flex items-center gap-2"
                  >
                    Batal
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <FiLogOut className="text-sm" />
                    Ya, Keluar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function UserSidebar({
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    setShowLogoutModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsCollapsed(true);
  };

  return (
    <>
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

                  {/* Tooltip untuk collapsed state */}
                  {isCollapsed && (
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 rounded-md 
                      bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-700 
                      text-yellow-300 text-xs shadow-xl backdrop-blur-md 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      whitespace-nowrap z-50">
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-2 mt-auto mb-4">
            <div className="relative group flex justify-center">
              <button
                onClick={handleLogoutClick}
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

                {/* Tooltip untuk logout button saat collapsed */}
                {isCollapsed && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 rounded-md 
                    bg-gradient-to-br from-red-600 to-red-700 
                    text-white text-xs shadow-xl backdrop-blur-md 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    whitespace-nowrap z-50">
                    Keluar
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}