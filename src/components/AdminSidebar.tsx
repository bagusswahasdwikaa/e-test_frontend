'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Ujian', path: '/admin/ujian' },
    { name: 'Peserta', path: '/admin/peserta' },
    { name: 'Hasil', path: '/admin/hasil' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token lokal
    router.push('/authentication/login'); // Redirect ke halaman login
  };

  return (
    <aside className="w-64 min-h-screen p-6 bg-gray-800 text-white flex flex-col">
      <h1 className="text-2xl font-bold mb-10">E‑Test Admin</h1>
      <nav className="flex flex-col gap-4 flex-grow">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`py-2 px-4 rounded transition-colors ${
              pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="bg-red-600 py-2 rounded hover:bg-red-700 transition-colors"
      >
        Keluar
      </button>
    </aside>
  );
}