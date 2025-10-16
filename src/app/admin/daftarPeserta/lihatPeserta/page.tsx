'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface PesertaDetail {
  ID_Peserta: number;
  Nama_Lengkap: string;
  Email: string;
  instansi: string;
  Status: 'aktif' | 'non-aktif';
  bio?: string;
  photo_url?: string | null;
}

interface ExamResult {
  nama_ujian: string;
  nilai: number | null;
  status: string;
  waktu_selesai: string | null;
}

export default function LihatPesertaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');

  const [peserta, setPeserta] = useState<PesertaDetail | null>(null);
  const [riwayatUjian, setRiwayatUjian] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPesertaAndRiwayat() {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'admin') {
        router.push('/authentication/login');
        return;
      }

      if (!id || isNaN(Number(id))) {
        setError('ID peserta tidak valid.');
        setLoading(false);
        return;
      }

      try {
        // === Ambil detail peserta ===
        const pesertaRes = await fetch(`http://localhost:8000/api/peserta/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!pesertaRes.ok) {
          const errText = await pesertaRes.text();
          throw new Error(`Fetch peserta gagal: status ${pesertaRes.status}. Respon: ${errText}`);
        }

        const pesertaJson = await pesertaRes.json();
        if (!pesertaJson.data) {
          throw new Error(pesertaJson.message || 'Respons peserta tidak memiliki data.');
        }
        const p = pesertaJson.data;

        const rawPhoto = p.photo_url || '';
        const fullPhotoUrl = rawPhoto.startsWith('http')
          ? rawPhoto
          : rawPhoto
          ? `http://localhost:8000${rawPhoto}`
          : null;

        setPeserta({
          ID_Peserta: p.ID_Peserta,
          Nama_Lengkap: p['Nama Lengkap'] ?? p.Nama_Lengkap ?? '-',
          Email: p.Email ?? '-',
          instansi: p.instansi ?? '-',
          Status: (p.Status ?? '').toLowerCase() === 'aktif' ? 'aktif' : 'non-aktif',
          bio: p.bio ?? '-',
          photo_url: fullPhotoUrl,
        });

        // === Ambil riwayat ujian peserta berdasarkan id user ===
        // Pastikan URL ini sesuai dengan route Anda di backend
        const riwayatUrl = `http://localhost:8000/api/nilai-peserta/peserta/${id}`;
        console.log('Mengambil riwayat dari URL:', riwayatUrl);

        const nilaiRes = await fetch(riwayatUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Status fetch riwayat:', nilaiRes.status);
        const rawText = await nilaiRes.clone().text();
        console.log('Raw response riwayat:', rawText);

        if (!nilaiRes.ok) {
          console.warn(`Fetch riwayat gagal dengan status ${nilaiRes.status}`);
        } else {
          const nilaiJson = await nilaiRes.json();
          console.log('Nilai JSON:', nilaiJson);

          if (Array.isArray(nilaiJson.data)) {
            const arr: ExamResult[] = nilaiJson.data.map((it: any) => ({
              nama_ujian: it.nama_ujian ?? it.namaUjian ?? '-',
              nilai: it.nilai != null ? it.nilai : null,
              status: it.status ?? 'Belum Dikerjakan',
              waktu_selesai: it.waktu_selesai ?? it.tanggal ?? null,
            }));
            setRiwayatUjian(arr);
          } else {
            console.warn('Riwayat ujian data bukan array:', nilaiJson);
          }
        }
      } catch (err: any) {
        console.error('Error fetchPesertaAndRiwayat:', err);
        setError(err.message || 'Terjadi kesalahan mengambil data.');
      } finally {
        setLoading(false);
      }
    }

    fetchPesertaAndRiwayat();
  }, [id, router]);

  function parseBackendDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split(' ');
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const [day, month, year] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      if ([day, month, year, hour, minute, second].every((v) => !isNaN(v))) {
        return new Date(year, month - 1, day, hour, minute, second);
      }
    }
    // Fallback ke parsing standar ISO
    const d2 = new Date(dateStr);
    return isNaN(d2.getTime()) ? null : d2;
  }

  const formatDateTime = (waktu: string | null) => {
    const d = parseBackendDate(waktu);
    if (!d) return '-';
    return d.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8 max-w-4xl mx-auto p-6 bg-white rounded shadow">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-block text-blue-600 hover:underline text-sm font-medium cursor-pointer"
        >
          ← Kembali ke daftar peserta
        </button>

        <h1 className="text-3xl font-bold mb-8 text-gray-900">Detail Peserta</h1>

        {loading ? (
          <p className="text-gray-600 text-center">Memuat data peserta...</p>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded text-center">{error}</div>
        ) : peserta ? (
          <div className="flex flex-col md:flex-row gap-10">
            {/* Foto Peserta */}
            <div className="flex-shrink-0 w-full md:w-48 h-48 rounded overflow-hidden border border-gray-300 shadow-sm bg-gray-50 flex items-center justify-center">
              {peserta.photo_url ? (
                <img
                  src={peserta.photo_url}
                  alt={`Foto ${peserta.Nama_Lengkap}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '';
                  }}
                />
              ) : (
                <DefaultUserIcon />
              )}
            </div>

            {/* Detail & Riwayat */}
            <div className="flex-grow">
              <Info label="ID Peserta" value={peserta.ID_Peserta} />
              <Info label="Nama Lengkap" value={peserta.Nama_Lengkap} />
              <Info label="Email" value={peserta.Email} />
              <Info label="Instansi" value={peserta.instansi} />
              <Info
                label="Status"
                value={
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      peserta.Status === 'aktif'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {peserta.Status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                }
              />
              <div className="mt-6">
                <label className="block font-semibold text-gray-700 mb-2">Bio:</label>
                <p className="text-gray-400 whitespace-pre-line max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded p-3">
                  {peserta.bio && peserta.bio !== '-' ? peserta.bio : 'Bio belum tersedia.'}
                </p>
              </div>

              {/* Riwayat Ujian */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Ujian</h2>
                {riwayatUjian.length === 0 ? (
                  <p className="text-gray-500">Belum ada riwayat ujian.</p>
                ) : (
                  <ul className="list-decimal ml-6 space-y-2 text-gray-800 text-sm">
                    {riwayatUjian.map((ujian, idx) => (
                      <li key={`${ujian.nama_ujian}-${idx}`}>
                        <div className="mb-1">
                          <span className="font-semibold">{ujian.nama_ujian}</span> —{' '}
                          {formatDateTime(ujian.waktu_selesai)} — Nilai:{' '}
                          {ujian.nilai !== null ? ujian.nilai : '-'} — Status:{' '}
                          <span
                            className={`font-semibold ${
                              ujian.status === 'Sudah Dikerjakan'
                                ? 'text-green-700'
                                : 'text-red-700'
                            }`}
                          >
                            {ujian.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">Peserta tidak ditemukan.</p>
        )}
      </div>
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-1">{label}:</label>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function DefaultUserIcon() {
  return (
    <svg
      className="w-24 h-24 text-gray-300"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M12 2a6 6 0 100 12 6 6 0 000-12zM4 20a8 8 0 0116 0H4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
