'use client';

import Sidebar from '@/components/UserSidebar';
import useAuthRedirect from '@/middleware/auth';

export default function HasilPage() {
  useAuthRedirect();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-10 bg-gray-200">
        <h1 className="text-2xl font-bold mb-4">Hasil Ujian</h1>
        <p>Hasil ujian akan muncul di sini.</p>
      </div>
    </div>
  );
}
