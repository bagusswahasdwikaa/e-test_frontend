'use client';

import useAuthRedirect from '@/middleware/auth';
import axios from '@/services/axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  useAuthRedirect();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/me'); // Pastikan endpoint ini tersedia di backend
        setUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem('token');
      router.push('/authentication/login');
    } catch (err) {
      console.error('Logout gagal', err);
    }
  };

  if (loading) return <div className="p-10">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Selamat Datang di Dashboard</h1>
        <p>Halo, <strong>{user?.first_name} {user?.last_name}</strong> 👋</p>

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
