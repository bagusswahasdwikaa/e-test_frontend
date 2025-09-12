'use client';

import { useEffect, useState } from 'react';
import axios from '@/services/axios';
import UserLayout from '@/components/UserLayout';
import { useRouter } from 'next/navigation';

interface RingkasanHasil {
  id: number;
  nama: string;
  submitted_at: string;
  nilai: number;
  status: 'Sudah Dikerjakan' | 'Belum Dikerjakan';
}

interface DetailHasil {
  soal_id: number;
  pertanyaan: string;
  jawaban_peserta: string;
  jawaban_benar: string | null;
  is_correct: boolean;
}

export default function HasilPage() {
  const [hasilList, setHasilList] = useState<RingkasanHasil[]>([]);
  const [detail, setDetail] = useState<DetailHasil[] | null>(null);
  const [selectedUjian, setSelectedUjian] = useState<RingkasanHasil | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchHasil() {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMsg('Token tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/user/ujians/hasil', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasilList(res.data.data || []);
      } catch (err: any) {
        console.error('Gagal memuat hasil ujian:', err);
        setErrorMsg('Terjadi kesalahan saat memuat hasil ujian.');
      } finally {
        setLoading(false);
      }
    }

    fetchHasil();
  }, []);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const lihatDetail = async (ujian: RingkasanHasil) => {
    setSelectedUjian(ujian);
    setDetailLoading(true);
    setErrorMsg(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('Token tidak ditemukan.');
      setDetailLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/user/ujians/${ujian.id}/hasil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetail(res.data.detail_jawaban);
    } catch (err: any) {
      console.error('Gagal memuat detail hasil:', err);
      setErrorMsg('Gagal memuat detail hasil ujian.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <UserLayout>
      <main className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Hasil Ujian</h1>

        {loading ? (
          <p>Memuat hasil ujian...</p>
        ) : errorMsg ? (
          <p className="text-red-500">{errorMsg}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded shadow-md">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="px-4 py-2">ID Ujian</th>
                    <th className="px-4 py-2">Nama Ujian</th>
                    <th className="px-4 py-2">Waktu Selesai</th>
                    <th className="px-4 py-2">Nilai</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {hasilList.map((h) => (
                    <tr key={h.id} className="border-b">
                      <td className="px-4 py-2">{h.id}</td>
                      <td className="px-4 py-2">{h.nama}</td>
                      <td className="px-4 py-2">
                        {h.submitted_at ? formatDateTime(h.submitted_at) : '-'}
                      </td>
                      <td className="px-4 py-2">{h.nilai}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            h.status === 'Sudah Dikerjakan'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                          onClick={() => lihatDetail(h)}
                          disabled={h.status !== 'Sudah Dikerjakan'}
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                  {hasilList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Belum ada ujian yang diselesaikan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Detail Hasil */}
            {selectedUjian && selectedUjian.status === 'Sudah Dikerjakan' && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                  Detail Jawaban: {selectedUjian.nama}
                </h2>
                {detailLoading ? (
                  <p>Memuat detail hasil...</p>
                ) : detail && detail.length > 0 ? (
                  <div className="space-y-4">
                    {detail.map((d) => (
                      <div
                        key={d.soal_id}
                        className={`p-4 border rounded ${
                          d.is_correct
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <p>
                          <strong>Pertanyaan:</strong> {d.pertanyaan}
                        </p>
                        <p>
                          <strong>Jawaban Anda:</strong> {d.jawaban_peserta}
                        </p>
                        <p>
                          <strong>Jawaban Benar:</strong> {d.jawaban_benar || '-'}
                        </p>
                        <p>
                          <strong>Status:</strong> {d.is_correct ? 'Benar' : 'Salah'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada detail hasil tersedia.</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </UserLayout>
  );
}
