'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface PesertaDetail {
  ID_Peserta: number;
  Nama_Lengkap: string;
  Email: string;
  Status: 'aktif' | 'non-aktif';
  bio?: string;
  photo_url?: string | null;
}

export default function LihatPesertaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');

  const [peserta, setPeserta] = useState<PesertaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeserta() {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'admin') {
        router.push('/authentication/login');
        return;
      }

      if (!id || isNaN(Number(id))) {
        setError('ID peserta tidak valid atau tidak ditemukan.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/api/peserta/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (!res.ok || !json.data) {
          throw new Error(json.message || 'Gagal memuat data peserta.');
        }

        const p = json.data;
        const rawPhoto = p.photo_url || '';
        const fullPhotoUrl = rawPhoto.startsWith('http')
          ? rawPhoto
          : rawPhoto
          ? `http://localhost:8000${rawPhoto}`
          : '';

        setPeserta({
          ID_Peserta: p.ID_Peserta,
          Nama_Lengkap: p['Nama Lengkap'] || '-',
          Email: p.Email || '-',
          Status: (p.Status ?? '').toLowerCase() === 'aktif' ? 'aktif' : 'non-aktif',
          bio: p.bio || '-',
          photo_url: fullPhotoUrl || null,
        });
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data.');
      } finally {
        setLoading(false);
      }
    }

    fetchPeserta();
  }, [id, router]);

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
          <div className="bg-red-100 text-red-700 p-4 rounded text-center font-medium">{error}</div>
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
                    e.currentTarget.src = ''; // remove broken image
                  }}
                />
              ) : (
                <DefaultUserIcon />
              )}
            </div>

            {/* Detail Peserta */}
            <div className="flex-grow">
              <Info label="ID Peserta" value={peserta.ID_Peserta} />
              <Info label="Nama Lengkap" value={peserta.Nama_Lengkap} />
              <Info label="Email" value={peserta.Email} />
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
                <p className="text-gray-800 whitespace-pre-line max-h-40 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                  {peserta.bio && peserta.bio !== '-' ? peserta.bio : 'Bio tidak tersedia.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">Data peserta tidak ditemukan.</p>
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

// ✅ Default user icon component (SVG inline)
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
