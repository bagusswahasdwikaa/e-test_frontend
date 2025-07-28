'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/axios';
import useAuthRedirect from '@/middleware/auth';
import Sidebar from '@/components/Sidebar';

export default function UserDashboard() {
  useAuthRedirect();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/me');
        setUser(res.data);
      } catch (err) {
        console.error('Gagal mengambil data user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-10">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-200">
      <Sidebar />
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-4">Selamat Datang di Dashboard</h1>
        <p className="mb-8">Halo, <strong>{user?.first_name} {user?.last_name}</strong> 👋</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((ujian) => (
            <div key={ujian} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-lg font-bold mb-2">Ujian {ujian}</h2>
              <p>Waktu: 60 Menit</p>
              <p>Jumlah Soal: 50</p>
              <button
                className="mt-4 w-full py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                onClick={() => router.push(`/user/ujian/${ujian}`)}
              >
                Mulai
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
