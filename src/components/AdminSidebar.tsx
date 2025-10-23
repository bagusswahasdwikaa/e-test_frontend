'use client';

import {
  FiLogOut,
  FiHome,
  FiList,
  FiUsers,
  FiUser,
  FiClipboard,
  FiBarChart2,
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
    'absolute w-6 h-[2px] bg-white rounded-full transition-all duration-300 shadow-sm';

  return (
    <button
      aria-label="Toggle Sidebar"
      className="relative w-10 h-10 flex items-center justify-center group focus:outline-none transition-all hover:scale-110 cursor-pointer rounded-lg hover:bg-white/10 backdrop-blur-sm"
    >
      {/* Top Bar */}
      <motion.span
        className={commonClasses}
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 6 : -6,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
      {/* Middle Bar */}
      <motion.span
        className={commonClasses}
        animate={{
          opacity: isOpen ? 0 : 1,
          scale: isOpen ? 0.8 : 1,
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
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FiAlertTriangle className="text-xl" />
                    </div>
                    <h3 className="text-xl font-bold">Konfirmasi Keluar</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer backdrop-blur-sm"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    Apakah Anda yakin ingin keluar dari sistem?
                  </p>
                  <p className="text-gray-500 text-sm">
                    Anda akan diarahkan ke halaman login dan perlu masuk kembali.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200 font-semibold cursor-pointer flex items-center gap-2 hover:shadow-md transform hover:scale-105"
                  >
                    Batal
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center gap-2 cursor-pointer hover:shadow-lg transform hover:scale-105"
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

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { label: 'Beranda', href: '/admin/dashboard', icon: <FiHome /> },
    { label: 'Daftar Ujian', href: '/admin/daftarUjian', icon: <FiList /> },
    { label: 'Daftar Peserta', href: '/admin/daftarPeserta', icon: <FiUsers /> },
    { label: 'Daftar Nilai Peserta', href: '/admin/daftarNilaiPeserta', icon: <FiClipboard /> }, 
    { label: 'Profil', href: '/admin/profil', icon: <FiUser /> },
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
    // Tidak auto-collapse ketika navigasi untuk memberikan pengalaman yang lebih baik
  };

  // Auto-expand on hover, auto-collapse on mouse leave
  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Auto-collapse langsung ketika mouse meninggalkan sidebar
    setIsCollapsed(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 h-screen z-50">
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 80 : 280 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 text-white h-full flex flex-col shadow-2xl overflow-hidden relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/10 rounded-full -ml-20 -mb-20"></div>
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-4 py-6 border-b border-white/10">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-11 h-11 overflow-hidden shadow-lg">
                  <img
                    src="/assets/logo/p.png"
                    alt="Logo PGLSMID"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                    PGLSMID Menu
                  </h1>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
              >
                <div className="w-9 h-9 overflow-hidden shadow-lg">
                  <img
                    src="/assets/logo/p.png"
                    alt="Logo PGLSMID"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Menu List */}
          <nav className="flex flex-col px-3 py-6 gap-2 flex-1 relative z-10">
            {menuItems.map(({ label, href, icon }, index) => {
              const isActive = pathname === href;
              
              return (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <button
                    onClick={() => handleNavigation(href)}
                    className={`relative group flex items-center ${
                      isCollapsed ? 'justify-center' : 'gap-4'
                    } rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer w-full ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-200 shadow-lg backdrop-blur-sm border border-blue-400/30'
                        : 'hover:bg-white/10 text-gray-300 hover:text-white hover:shadow-md hover:backdrop-blur-sm'
                    }`}
                    title={label}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div className={`flex items-center justify-center w-6 h-6 min-w-[24px] ${
                      isActive ? 'text-blue-300' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {icon}
                    </div>

                    {/* Label */}
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap font-medium"
                      >
                        {label}
                      </motion.span>
                    )}

                    {/* Glow Effect for Active */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl blur-sm -z-10"></div>
                    )}

                    {/* Tooltip untuk collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 rounded-lg 
                        bg-gray-900/90 backdrop-blur-md text-white text-sm shadow-xl border border-gray-700/50
                        opacity-0 group-hover:opacity-100 transition-all duration-200 
                        whitespace-nowrap z-50 pointer-events-none">
                        {label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900/90"></div>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </nav>

          {/* User Section */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-3 border-t border-white/10 relative z-10"
            >
            </motion.div>
          )}

          {/* Logout Button */}
          <div className="px-3 pb-4 relative z-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogoutClick}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              <FiLogOut className="text-lg" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium"
                >
                  Keluar
                </motion.span>
              )}
            </motion.button>
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