'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Peserta {
  ID_Peserta: number;
  Nama_Lengkap: string;
  Email: string;
  Status: 'aktif' | 'non-aktif';
  Aksi: {
    lihat: string;
    edit: string;
    hapus: string;
  };
}

export default function DaftarPesertaPage() {
  const router = useRouter();

  const [dataPeserta, setDataPeserta] = useState<Peserta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeserta() {
      setLoading(true);
      setError(null);

      // Ambil token dari localStorage
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'admin') {
        // Jika tidak ada token atau bukan admin, redirect ke login
        router.push('/authentication/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/peserta', {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`, // pakai token dari localStorage
          },
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || 'Gagal memuat data peserta');
        }

        const pesertaArray = json.data ?? [];

        const transformedData: Peserta[] = pesertaArray.map((p: any) => ({
          ID_Peserta: p.ID_Peserta,
          Nama_Lengkap: p['Nama Lengkap'] || 'Nama tidak tersedia',
          Email: p.Email ?? '-',
          Status: (p.Status ?? '').toLowerCase() === 'aktif' ? 'aktif' : 'non-aktif',
          Aksi: {
            lihat: p.Aksi?.lihat ?? '#',
            edit: p.Aksi?.edit ?? '#',
            hapus: p.Aksi?.hapus ?? '#',
          },
        }));

        setDataPeserta(transformedData);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data peserta.');
        setDataPeserta([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPeserta();
  }, [router]);

  // Filter data berdasarkan ID Peserta, Nama Lengkap, atau Email sesuai searchTerm
  const filteredData = dataPeserta.filter(({ ID_Peserta, Nama_Lengkap, Email }) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      ID_Peserta.toString().includes(searchTerm) || // Pencarian ID_Peserta berdasarkan string
      Nama_Lengkap.toLowerCase().includes(lowerTerm) ||
      Email.toLowerCase().includes(lowerTerm)
    );
  });

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Daftar Peserta</h1>
        <button
          onClick={() => router.push('/admin/daftarPeserta/tambahPeserta')}
          className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Data
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="overflow-auto rounded-lg bg-white shadow">
        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-blue-900 text-white text-center">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">ID Peserta</th>
              <th className="px-4 py-3">Nama Lengkap</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-sm">
                  Memuat data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map((peserta, index) => (
                <tr
                  key={peserta.ID_Peserta}
                  className="border-t hover:bg-gray-50 text-center"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{peserta.ID_Peserta}</td>
                  <td className="px-4 py-2">{peserta.Nama_Lengkap}</td>
                  <td className="px-4 py-2">{peserta.Email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        peserta.Status === 'aktif'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {peserta.Status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-1">
                    <a
                      href={peserta.Aksi.lihat}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs"
                    >
                      Lihat
                    </a>
                    <a
                      href={peserta.Aksi.edit}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded text-xs"
                    >
                      Edit
                    </a>
                    <a
                      href={peserta.Aksi.hapus}
                      className="bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded text-xs"
                    >
                      Hapus
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
