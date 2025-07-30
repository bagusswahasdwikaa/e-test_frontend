'use client';

import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';
import UserSidebar from '@/components/UserSidebar';
import axios from '@/services/axios';

interface Ujian {
  id: number;
  nama: string;
  waktu: number; // menit
  jumlah_soal: number;
}

export default function UserDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('User');
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(true);

  // State sidebar collapsed/expanded
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchUserAndUjian = async () => {
      try {
        const userRes = await axios.get('/me');
        if (userRes.data) {
          setUserName(
            `${userRes.data.first_name ?? ''} ${userRes.data.last_name ?? ''}`
              .trim() || 'User'
          );
        }
        const ujianRes = await axios.get('/ujian'); // Endpoint ujian
        setUjianList(ujianRes.data || []);
      } catch (error) {
        setUserName('User');
        setUjianList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndUjian();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <UserSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main className="flex-1 p-8 bg-gray-100">Memuat data...</main>
      </div>
    );
  }

  // Filter ujian berdasarkan searchTerm (nama ujian)
  const filteredUjian = ujianList.filter((ujian) =>
    ujian.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar dengan kontrol collapsed */}
      <UserSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Header */}
        <UserHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          userName={userName}
          isSidebarCollapsed={isSidebarCollapsed} // pastikan UserHeader menerima props ini
        />

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-2xl font-semibold mb-6">User Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredUjian.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                Tidak ada ujian ditemukan.
              </div>
            )}

            {filteredUjian.map(({ id, nama, waktu, jumlah_soal }) => (
              <div
                key={id}
                className="bg-white rounded-lg shadow p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold mb-2">{nama}</h2>
                  <p>Waktu: {waktu} Menit</p>
                  <p>Jumlah Soal: {jumlah_soal}</p>
                </div>
                <button
                  className="mt-6 bg-black text-white rounded-md py-2 font-semibold hover:bg-gray-800 transition"
                  onClick={() => alert(`Mulai ujian: ${nama}`)}
                >
                  Mulai
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
