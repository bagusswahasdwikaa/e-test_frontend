'use client';

import { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import axios from '@/services/axios';

interface Ujian {
  id: number;
  nama: string;
  waktu: number;
  jumlah_soal: number;
}

export default function UserSoalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('User');
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndUjian = async () => {
      try {
        const userRes = await axios.get('/me');
        if (userRes.data) {
          setUserName(
            `${userRes.data.first_name ?? ''} ${userRes.data.last_name ?? ''}`.trim() || 'User'
          );
        }

        const ujianRes = await axios.get('/ujian');
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

  const filteredUjian = ujianList.filter((ujian) =>
    ujian.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UserLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-semibold mb-5 text-gray-800">
          Selamat datang, {userName}!
        </h1>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredUjian.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                Belum ada ujian yang di mulai.
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
        )}
      </main>
    </UserLayout>
  );
}
