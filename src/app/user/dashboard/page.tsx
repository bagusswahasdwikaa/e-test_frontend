'use client';

import { useEffect, useState, useCallback } from 'react';
import UserLayout from '@/components/UserLayout';
import axios from '@/services/axios';
import { useRouter } from 'next/navigation';

interface Ujian {
  ujian_id: number;
  nama: string;
  durasi: number;
  jumlah_soal: number;
  status: string;
  kode_soal: string;
  status_peserta: string;
  started_at?: string | null;
  end_time?: string | null;
  jenis_ujian: 'PRETEST' | 'POSTEST';
  standar_minimal_nilai?: number | null;
}

export default function UserDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('User');
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null);
  const [kodeInput, setKodeInput] = useState('');
  const [kodeError, setKodeError] = useState('');

  const fetchUjian = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/authentication/login');
        return;
      }

      const response = await axios.get('/user/ujians', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawData = response.data?.data ?? [];
      const mapped: Ujian[] = rawData.map((item: any) => {
        const ujian = item.ujian || item;
        return {
          ujian_id: ujian.id_ujian ?? ujian.id ?? item.ujian_id,
          nama: ujian.nama_ujian ?? ujian.nama ?? 'Ujian',
          durasi: ujian.durasi ?? 0,
          jumlah_soal: ujian.jumlah_soal ?? 0,
          status: ujian.status ?? 'Tidak Diketahui',
          kode_soal: ujian.kode_soal ?? '',
          status_peserta: item.status_peserta,
          started_at: item.started_at ?? null,
          end_time: item.end_time ?? null,
          jenis_ujian: ujian.jenis_ujian ?? 'PRETEST',
          standar_minimal_nilai: ujian.standar_minimal_nilai ?? null,
        };
      });

      setUjianList(mapped);
    } catch (error: any) {
      console.error('Gagal memuat data ujian:', error);
      if (error.response?.status === 401) {
        router.push('/authentication/login');
      } else {
        setErrorMsg(
          error.response?.data?.message ||
            `Gagal mengambil data. (${error.response?.status})`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const firstName = localStorage.getItem('first_name');
    if (firstName) setUserName(firstName);

    fetchUjian();

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'ujian_submitted') {
        fetchUjian();
        localStorage.removeItem('ujian_submitted');
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [fetchUjian]);

  const filteredUjian = ujianList.filter((ujian) =>
    ujian.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMulaiClick = (ujian: Ujian) => {
    setSelectedUjian(ujian);
    setKodeInput('');
    setKodeError('');
    setShowModal(true);
  };

  const handleVerifikasiKode = async () => {
    if (!selectedUjian) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/authentication/login');
        return;
      }

      const response = await axios.post(
        `/user/ujians/${selectedUjian.ujian_id}/kerjakan`,
        { kode_soal: kodeInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        localStorage.setItem('ujian_id', selectedUjian.ujian_id.toString());
        localStorage.setItem('kode_soal', kodeInput);
        localStorage.setItem('started_at', response.data.started_at);
        localStorage.setItem('end_time', response.data.end_time);
        localStorage.setItem('ujian_submitted', 'pending');

        router.push('/user/soal');
      } else {
        setKodeError(response.data.message || 'Kode soal salah.');
      }
    } catch (error: any) {
      let message = 'Kode soal salah.';
      if (error.response?.data?.errors?.kode_soal) {
        message = error.response.data.errors.kode_soal[0];
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      setKodeError(message);
    }
  };

  return (
    <UserLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-35 h-35">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/assets/logo/panasonic-logo.png"
                alt="Logo Panasonic"
                className="w-25 h-25 object-contain"
              />
            </div>
            <div className="absolute inset-0 animate-spin rounded-full border-t-7 border-white border-solid"></div>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 sm:p-8 overflow-auto min-h-screen">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Selamat datang, {userName}!
        </h1>

        {loading ? (
          <p className="text-center text-gray-600 py-10">Memuat data ujian...</p>
        ) : errorMsg ? (
          <div className="text-center text-red-500 py-10">{errorMsg}</div>
        ) : filteredUjian.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Tidak ada ujian yang dibagikan kepada Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUjian.map((ujian) => {
              const statusPeserta = ujian.status_peserta || 'Belum Dikerjakan';
              const statusPesertaColor =
                statusPeserta === 'Sudah Dikerjakan'
                  ? 'text-blue-600'
                  : 'text-red-600';

              return (
                <div
                  key={ujian.ujian_id}
                  className="bg-white shadow rounded-lg p-6 flex flex-col justify-between border border-gray-200"
                >
                  <div>
                    <h2 className="text-xl font-bold mb-3">{ujian.nama}</h2>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex">
                        <span className="w-32">Jenis Ujian</span>
                        <span>: {ujian.jenis_ujian === 'PRETEST' ? 'Pre Test' : 'Post Test'}</span>
                      </div>

                      {ujian.jenis_ujian === 'POSTEST' && ujian.standar_minimal_nilai != null && (
                        <div className="flex">
                          <span className="w-32">Standar Nilai</span>
                          <span>: {ujian.standar_minimal_nilai}</span>
                        </div>
                      )}

                      <div className="flex">
                        <span className="w-32">Waktu</span>
                        <span>: {ujian.durasi} Menit</span>
                      </div>
                      <div className="flex">
                        <span className="w-32">Jumlah Soal</span>
                        <span>: {ujian.jumlah_soal}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32">Status Peserta</span>
                        <span>
                          :{' '}
                          <span className={`font-semibold ${statusPesertaColor}`}>
                            {statusPeserta}
                          </span>
                        </span>
                      </div>
                      <div className="flex mt-5">
                        <span className="w-32">Status Ujian</span>
                        <span>
                          :{' '}
                          <span
                            className={`font-semibold ${
                              ujian.status === 'Aktif'
                                ? 'text-green-600'
                                : ujian.status === 'Selesai'
                                ? 'text-gray-500'
                                : 'text-red-500'
                            }`}
                          >
                            {ujian.status === 'Selesai' ? 'Berakhir' : ujian.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`mt-6 py-2 rounded-full text-sm font-semibold transition ${
                      ujian.status === 'Aktif' &&
                      statusPeserta !== 'Sudah Dikerjakan'
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={
                      !(
                        ujian.status === 'Aktif' &&
                        statusPeserta !== 'Sudah Dikerjakan'
                      )
                    }
                    onClick={() => handleMulaiClick(ujian)}
                  >
                    {statusPeserta === 'Sudah Dikerjakan'
                      ? 'Sudah Dikerjakan'
                      : ujian.status === 'Aktif'
                      ? 'Mulai'
                      : ujian.status === 'Selesai'
                      ? 'Berakhir'
                      : 'Tidak Aktif'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showModal && selectedUjian && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                Masukkan Kode Soal untuk &quot;{selectedUjian.nama}&quot;
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
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
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
