'use client';

import Sidebar from '@/components/Sidebar';
import useAuthRedirect from '@/middleware/auth';

export default function SoalPage() {
  useAuthRedirect();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-10 bg-gray-200">
        <h1 className="text-2xl font-bold mb-4">Halaman Soal</h1>
        <p>Daftar soal akan muncul di sini.</p>
      </div>
    </div>
  );
}
