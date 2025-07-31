'use client';

import { FiMenu, FiLogOut, FiHome, FiList, FiUsers, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
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
        className={`bg-gray-900 text-white h-full flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-6">
          {!isCollapsed && <span className="text-xl font-bold select-none">Admin</span>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white p-2 rounded hover:bg-gray-800 transition"
            aria-label="Toggle Sidebar"
          >
            <FiMenu />
          </button>
        </div>

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

        <button
          className="mt-auto mx-2 mb-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <FiLogOut />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </aside>
    </div>
  );
}
