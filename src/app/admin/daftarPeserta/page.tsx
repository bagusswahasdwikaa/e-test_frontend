'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { EyeIcon as EyeIconSolid } from '@heroicons/react/24/solid';

interface Peserta {
  ID_Peserta: number;
  Nama_Lengkap: string;
  Email: string;
  Status: 'aktif' | 'non-aktif';
  photo_url?: string | null;
}

type SortDirection = 'asc' | 'desc';

export default function DaftarPesertaPage() {
  const router = useRouter();

  const [dataPeserta, setDataPeserta] = useState<Peserta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Data Peserta
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

      try {
        const res = await fetch('http://localhost:8000/api/peserta', {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || 'Gagal memuat data peserta');
        }

        const pesertaArray = json.data ?? [];

        const transformedData: Peserta[] = pesertaArray.map((p: any) => {
          const rawPhoto = p['Photo URL'] || '';
          const fullPhotoUrl =
            rawPhoto && !rawPhoto.startsWith('http')
              ? `http://localhost:8000${rawPhoto}`
              : rawPhoto || null;

          return {
            ID_Peserta: p.ID_Peserta,
            Nama_Lengkap: p['Nama Lengkap'] || 'Nama tidak tersedia',
            Email: p.Email ?? '-',
            Status: (p.Status ?? '').toLowerCase() === 'aktif' ? 'aktif' : 'non-aktif',
            photo_url: fullPhotoUrl,
          };
        });

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

  // Sorting handler
  const handleToggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Filtering data berdasarkan pencarian
  const filteredData = dataPeserta.filter(({ ID_Peserta, Nama_Lengkap, Email }) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      ID_Peserta.toString().includes(searchTerm) ||
      Nama_Lengkap.toLowerCase().includes(lowerTerm) ||
      Email.toLowerCase().includes(lowerTerm)
    );
  });

  // Sorting data berdasarkan ID
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a.ID_Peserta < b.ID_Peserta) return sortDirection === 'asc' ? -1 : 1;
      if (a.ID_Peserta > b.ID_Peserta) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Sort Arrow component
  const SortArrow = () => (
    <button
      onClick={handleToggleSort}
      aria-label="Toggle sort nomor peserta"
      className="select-none"
      style={{
        fontSize: 12,
        userSelect: 'none',
        lineHeight: 1,
        padding: 0,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#E5E7EB',
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

  // Avatar dengan fallback SVG
  const Avatar = ({ src, alt }: { src?: string | null; alt: string }) => {
    const [imgError, setImgError] = useState(false);

    if (!src || imgError) {
      return <DefaultUserIcon />;
    }

    return (
      <img
        src={src}
        alt={alt}
        className="w-10 h-10 rounded-full mx-auto object-cover"
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      {/* Header */}
      <div className="mb-6">
        {/* Judul */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Daftar Peserta</h1>

        {/* Tombol Tambah Data */}
        <div>
          <button
            onClick={() => router.push('/admin/daftarPeserta/tambahPeserta')}
            className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors duration-200 text-sm font-medium cursor-pointer"
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg mb-4 border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-gray-800 text-sm">
              <thead className="bg-blue-900 text-white uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <div className="flex items-center justify-center gap-1">
                      <SortArrow /> No
                    </div>
                  </th>
              <th className="px-4 py-3 w-24 whitespace-nowrap">ID Peserta</th>
              <th className="px-4 py-3 w-40">Avatar</th>
              <th className="px-4 py-3">Nama Lengkap</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 w-24" style={{ width: 110 }}>Status</th>
              <th className="px-4 py-3 w-40">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((peserta, index) => (
                <tr
                  key={peserta.ID_Peserta}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-center align-middle">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2 text-center align-middle whitespace-nowrap">
                    {peserta.ID_Peserta}
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    <Avatar
                      src={peserta.photo_url}
                      alt={`Avatar ${peserta.Nama_Lengkap}`}
                    />
                  </td>
                  <td
                    className="px-4 py-2 text-center align-middle"
                    style={{
                      maxWidth: '220px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={peserta.Nama_Lengkap}
                  >
                    {peserta.Nama_Lengkap}
                  </td>
                  <td
                    className="px-4 py-2 text-center align-middle"
                    style={{
                      maxWidth: '280px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={peserta.Email}
                  >
                    {peserta.Email}
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
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
                  <td className="py-2">
                    <div className="flex justify-center gap-2">
                      {/* Lihat */}
                      <button
                        onClick={() =>
                          router.push(`/admin/daftarPeserta/lihatPeserta?id=${peserta.ID_Peserta}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 p-2 rounded-md transition cursor-pointer"
                        title="Lihat"
                      >
                        <EyeIconSolid className="w-4 h-4 text-white" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() =>
                          router.push(`/admin/daftarPeserta/editPeserta?id=${peserta.ID_Peserta}`)
                        }
                        className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-md transition cursor-pointer"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-4 h-4 text-white" />
                      </button>

                      {/* Hapus */}
                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus peserta ini?')) {
                            fetch(`http://localhost:8000/api/peserta/${peserta.ID_Peserta}`, {
                              method: 'DELETE',
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                              },
                            })
                              .then((res) => {
                                if (!res.ok) throw new Error('Gagal menghapus peserta');
                                alert('Peserta berhasil dihapus.');
                                setDataPeserta((prev) =>
                                  prev.filter((p) => p.ID_Peserta !== peserta.ID_Peserta)
                                );
                              })
                              .catch(() => alert('Terjadi kesalahan saat menghapus peserta.'));
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-md transition cursor-pointer"
                        title="Hapus"
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center px-2 py-1 text-sm text-gray-600 mt-3">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } px-3 py-1 rounded`}
          type="button"
        >
          Sebelumnya
        </button>
        <span>
          Halaman {currentPage} dari {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } px-3 py-1 rounded`}
          type="button"
        >
          Selanjutnya
        </button>
      </div>
    </AdminLayout>
  );
}

// Default user icon (fallback avatar)
function DefaultUserIcon() {
  return (
    <svg
      className="w-10 h-10 text-gray-300 mx-auto"
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
