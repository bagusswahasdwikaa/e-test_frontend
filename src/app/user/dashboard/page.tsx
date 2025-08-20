'use client';

import { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import axios from '@/services/axios';
import { useRouter } from 'next/navigation';

interface Ujian {
  id: number;
  nama: string;
  durasi: number;
  jumlah_soal: number;
  status: string;
  kode: string;
}

export default function UserDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('User');
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null);
  const [kodeInput, setKodeInput] = useState('');
  const [kodeError, setKodeError] = useState('');

  useEffect(() => {
    // Ambil nama depan dari localStorage
    const firstName = localStorage.getItem('first_name');
    if (firstName) {
      setUserName(firstName);
    }

    const fetchUjian = async () => {
      try {
        const response = await axios.get('/ujians');
        const rawData = response.data?.data;

        if (Array.isArray(rawData)) {
          const mapped = rawData
            .filter((ujian) => ujian.status === 'Aktif')
            .map((item) => ({
              id: item.id_ujian ?? item.id,
              nama: item.nama_ujian,
              durasi: parseInt(item.durasi),
              jumlah_soal: parseInt(item.jumlah_soal),
              status: item.status,
              kode: item.kode_soal ?? '', // include kode soal
            }));
          setUjianList(mapped);
        } else {
          setUjianList([]);
        }
      } catch (error) {
        console.error('Gagal memuat data:', error);
        setUjianList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUjian();
  }, []);

  const filteredUjian = ujianList.filter((ujian) =>
    ujian.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMulaiClick = (ujian: Ujian) => {
    setSelectedUjian(ujian);
    setKodeInput('');
    setKodeError('');
    setShowModal(true);
  };
  
  const handleVerifikasiKode = () => {
    if (kodeInput === selectedUjian?.kode) {
      // Simpan ujian_id ke localStorage
      localStorage.setItem('ujian_id', selectedUjian.id.toString());

      // Redirect ke halaman soal
      router.push('/user/soal');
    } else {
      setKodeError('Kode soal salah. Coba lagi.');
    }
  };

  return (
    <UserLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <main className="flex-1 p-6 sm:p-8 overflow-auto bg-gray-200 min-h-screen">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Selamat datang, {userName}!
        </h1>

        {loading ? (
          <p className="text-center text-gray-600 py-10">Memuat data ujian...</p>
        ) : filteredUjian.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Tidak ada ujian aktif ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUjian.map((ujian) => (
              <div
                key={ujian.id}
                className="bg-white shadow rounded-lg p-6 flex flex-col justify-between border border-gray-200"
              >
                <div>
                  <h2 className="text-xl font-bold mb-3">{ujian.nama}</h2>
                  <p className="text-sm text-gray-700">Waktu : {ujian.durasi} Menit</p>
                  <p className="text-sm text-gray-700">Jumlah Soal : {ujian.jumlah_soal}</p>
                </div>
                <button
                  className="mt-6 bg-black text-white py-2 rounded-full text-sm font-semibold shadow hover:bg-gray-800 transition cursor-pointer"
                  onClick={() => handleMulaiClick(ujian)}
                >
                  Mulai
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {showModal && selectedUjian && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                Masukkan Kode Soal untuk "{selectedUjian.nama}"
              </h2>
              <input
                type="text"
                placeholder="Kode Soal"
                value={kodeInput}
                onChange={(e) => setKodeInput(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring mb-2"
              />
              {kodeError && (
                <p className="text-red-500 text-sm mb-2">{kodeError}</p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm cursor-pointer"
                  onClick={handleVerifikasiKode}
                >
                  Verifikasi
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </UserLayout>
  );
}
