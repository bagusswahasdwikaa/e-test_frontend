'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Ujian {
  id: number;
  nama: string;
  tanggal: string;
  durasi: number;
  status: string;
  kode: string;
  jumlahSoal: number;
}

type SortDirection = 'asc' | 'desc';

export default function DaftarUjianPage() {
  const router = useRouter();
  const [dataUjian, setDataUjian] = useState<Ujian[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    fetch('http://localhost:8000/api/ujians')
      .then(async (res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok || !contentType?.includes('application/json')) {
          throw new Error('Respon bukan JSON.');
        }
        return res.json();
      })
      .then((resJson) => {
        if (resJson?.data && Array.isArray(resJson.data)) {
          const mapped = resJson.data.map((item: any) => ({
            id: item.id_ujian,
            nama: item.nama_ujian,
            tanggal: item.tanggal,
            durasi: parseInt(item.durasi),
            status: item.status,
            kode: item.kode_soal,
            jumlahSoal: parseInt(item.jumlah_soal),
          }));
          setDataUjian(mapped);
        } else {
          throw new Error('Format data API tidak sesuai.');
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data ujian:', err);
        alert('Gagal memuat daftar ujian. Periksa API backend Anda.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const filteredData = dataUjian.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.nama || '').toLowerCase().includes(term) ||
      (item.kode || '').toLowerCase().includes(term)
    );
  });

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aDate = new Date(a.tanggal);
      const bDate = new Date(b.tanggal);

      if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1;
      if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortDirection]);

  const SortArrow = () => (
    <button
      onClick={handleToggleSort}
      aria-label="Toggle sort tanggal"
      className="select-none"
      style={{
        fontSize: 12,
        userSelect: 'none',
        lineHeight: 1,
        padding: 0,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#E5E7EB', // abu terang (gray-200)
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        height: 14,
        margin: 0,
      }}
      type="button"
    >
      {sortDirection === 'asc' ? '▲' : '▼'}
    </button>
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus ujian ini?')) return;

    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus.');

      alert('Ujian berhasil dihapus.');
      setDataUjian((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Daftar Ujian</h1>
        <button
          className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          onClick={() => router.push('/admin/daftarUjian/buatSoal')}
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
          <span className="text-sm font-medium">Buat Soal</span>
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-600">Memuat data ujian...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-blue-900 text-white text-center">
              <tr>
                {/* Header No dengan flex container agar ikon dan teks sejajar */}
                <th
                  className="px-4 py-3 whitespace-nowrap text-center"
                  style={{ minWidth: 70, width: 70 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <SortArrow />
                    <span>No</span>
                  </div>
                </th>
                <th className="px-4 py-3">Kode Soal</th>
                <th className="px-4 py-3">Nama Ujian</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Jumlah Soal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((ujian, index) => (
                  <tr key={ujian.id} className="text-center border-t hover:bg-gray-50">
                    {/* Cell No dengan width dan text-center agar sejajar */}
                    <td
                      className="px-4 py-2 text-center"
                      style={{ minWidth: 70, width: 70 }}
                    >
                      {index + 1}
                    </td>
                    <td className="px-4 py-2">{ujian.kode}</td>
                    <td className="px-4 py-2">{ujian.nama}</td>
                    <td className="px-4 py-2">{ujian.tanggal}</td>
                    <td className="px-4 py-2">{ujian.durasi} menit</td>
                    <td className="px-4 py-2">{ujian.jumlahSoal}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          ujian.status === 'Aktif'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {ujian.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-1">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/daftarUjian/lihatSoal?ujian_id=${ujian.id}`)
                        }
                      >
                        Lihat
                      </button>
                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/daftarUjian/editUjian?ujian_id=${ujian.id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs cursor-pointer"
                        onClick={() => handleDelete(ujian.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    Belum ada ujian yang dibuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
