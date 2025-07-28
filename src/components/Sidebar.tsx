'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { name: 'Beranda', path: '/user/dashboard' },
    { name: 'Soal', path: '/user/soal' },
    { name: 'Hasil', path: '/user/hasil' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/authentication/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-xl font-bold mb-10">E-Test</h1>
      <nav className="flex flex-col gap-4">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`py-2 px-4 rounded hover:bg-gray-700 ${pathname === item.path ? 'bg-gray-700' : ''}`}
          >
            {item.name}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="mt-10 bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Keluar
        </button>
      </nav>
    </div>
  );
}
