'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { EyeIcon as EyeIconSolid } from '@heroicons/react/24/solid';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Peserta {
  ID_Peserta: number;
  Nama_Lengkap: string;
  Email: string;
  instansi: string;
  Status: 'aktif' | 'non-aktif';
  photo_url?: string | null;
}

type SortField = 'ID_Peserta' | 'Nama_Lengkap' | 'Email' | 'instansi' | 'Status';
type SortDirection = 'asc' | 'desc' | null;

export default function DaftarPesertaPage() {
  const router = useRouter();

  const [dataPeserta, setDataPeserta] = useState<Peserta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta`, {
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
            instansi: p.instansi ?? '-',
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

  // Fungsi untuk handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Fungsi untuk render icon sorting
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="ml-1 text-gray-400">
          <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }
    if (sortDirection === 'asc') {
      return (
        <span className="ml-1">
          <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </span>
      );
    }
    return (
      <span className="ml-1">
        <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    );
  };

  // Filtering data berdasarkan pencarian
  const filteredData = dataPeserta.filter(({ ID_Peserta, Nama_Lengkap, Email, instansi }) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      ID_Peserta.toString().includes(searchTerm) ||
      Nama_Lengkap.toLowerCase().includes(lowerTerm) ||
      Email.toLowerCase().includes(lowerTerm) ||
      instansi.toLowerCase().includes(lowerTerm)
    );
  });

  // Sorting data
  const sortedData = React.useMemo(() => {
    if (!sortField || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'ID_Peserta':
          aValue = a.ID_Peserta;
          bValue = b.ID_Peserta;
          break;
        case 'Nama_Lengkap':
          aValue = a.Nama_Lengkap.toLowerCase();
          bValue = b.Nama_Lengkap.toLowerCase();
          break;
        case 'Email':
          aValue = a.Email.toLowerCase();
          bValue = b.Email.toLowerCase();
          break;
        case 'instansi':
          aValue = a.instansi.toLowerCase();
          bValue = b.instansi.toLowerCase();
          break;
        case 'Status':
          aValue = a.Status;
          bValue = b.Status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

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

  // Hapus peserta
  const handleDelete = async () => {
    if (!selectedPeserta) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/${selectedPeserta.ID_Peserta}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!res.ok) throw new Error('Gagal menghapus peserta');

      setDataPeserta((prev) =>
        prev.filter((p) => p.ID_Peserta !== selectedPeserta.ID_Peserta)
      );

      setShowModal(false);
      setSelectedPeserta(null);
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus peserta.');
    } finally {
      setActionLoading(false);
    }
  };

  // Download template Excel
  const handleDownloadTemplate = () => {
    const headers = [
      'id',
      'first_name',
      'last_name',
      'email',
      'password',
      'status',
      'instansi',
      'bio',
      'photo_url'
    ];

    const exampleData = [
      ['12345', 'Jono', 'Joni', 'jonojoni@example.com', 'password123', 'aktif', 'PT Example', 'Bio singkat', 'https://example.com/photo.jpg'],
      ['67891', 'Cak', 'Doel', 'cakdoel@example.com', '', 'non aktif', 'PT Example IT', '', '']
    ];

    // Gabungkan header dan data contoh
    const worksheetData = [headers, ...exampleData];

    // Buat worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Tambahkan gaya untuk header (bold + border)
    headers.forEach((_, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].s = {
        font: { bold: true },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    });

    // Tambahkan border ke seluruh sel
    for (let R = 1; R < worksheetData.length; R++) {
      for (let C = 0; C < headers.length; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    }

    // Tentukan lebar kolom
    worksheet['!cols'] = headers.map(() => ({ wch: 20 }));

    // Buat workbook dan file
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template User');

    // Simpan sebagai file .xlsx
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Template_User.xlsx');
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
        setImportError('Format file tidak valid. Hanya file Excel (.xlsx, .xls) atau CSV yang diperbolehkan.');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setImportError('Ukuran file terlalu besar. Maksimal 10MB.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setImportError(null);
    }
  };

  // Handle import Excel
  const handleImportExcel = async () => {
    if (!selectedFile) {
      setImportError('Silakan pilih file terlebih dahulu.');
      return;
    }

    setImportLoading(true);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengimpor data peserta.');
      }

      // Refresh data setelah import berhasil
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const refreshJson = await refreshRes.json();
      
      if (refreshRes.ok) {
        const pesertaArray = refreshJson.data ?? [];
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
            instansi: p.instansi ?? '-',
            Status: (p.Status ?? '').toLowerCase() === 'aktif' ? 'aktif' : 'non-aktif',
            photo_url: fullPhotoUrl,
          };
        });
        setDataPeserta(transformedData);
      }

      setShowImportModal(false);
      setSelectedFile(null);
      alert('Data peserta berhasil diimpor!');
    } catch (err: any) {
      setImportError(err.message || 'Terjadi kesalahan saat mengimpor data.');
    } finally {
      setImportLoading(false);
    }
  };

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
      {/* Overlay Loading */}
      {(loading || actionLoading) && (
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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-5">Daftar Peserta</h1>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => router.push('/admin/daftarPeserta/tambahPeserta')}
            className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors duration-200 text-xs font-semibold cursor-pointer"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Data
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="bg-green-600 text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-green-700 transition-colors duration-200 text-xs font-semibold cursor-pointer"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Unduh Template
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-blue-700 transition-colors duration-200 text-xs font-semibold cursor-pointer"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import Excel
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
        <table className="min-w-full divide-y divide-gray-200 text-gray-800 text-xs">
          <thead className="bg-blue-900 text-white text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 text-center w-12">No</th>
              <th 
                className="px-4 py-3 w-24 whitespace-nowrap cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort('ID_Peserta')}
              >
                <div className="flex items-center justify-center">
                  NIK
                  {renderSortIcon('ID_Peserta')}
                </div>
              </th>
              <th className="px-4 py-3 w-40">Avatar</th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort('Nama_Lengkap')}
              >
                <div className="flex items-center justify-center">
                  Nama Lengkap
                  {renderSortIcon('Nama_Lengkap')}
                </div>
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort('Email')}
              >
                <div className="flex items-center justify-center">
                  Email
                  {renderSortIcon('Email')}
                </div>
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort('instansi')}
              >
                <div className="flex items-center justify-center">
                  Sekolah/Departemen
                  {renderSortIcon('instansi')}
                </div>
              </th>
              <th 
                className="px-4 py-3 w-24 cursor-pointer hover:bg-blue-800 transition-colors"
                style={{ width: 110 }}
                onClick={() => handleSort('Status')}
              >
                <div className="flex items-center justify-center">
                  Status
                  {renderSortIcon('Status')}
                </div>
              </th>
              <th className="px-4 py-3 w-40">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((peserta, index) => (
                <tr key={peserta.ID_Peserta} className="border-t hover:bg-gray-50">
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
                  <td className="px-4 py-2 text-center align-middle truncate max-w-xs" title={peserta.Nama_Lengkap}>
                    {peserta.Nama_Lengkap}
                  </td>
                  <td className="px-4 py-2 text-center align-middle truncate max-w-xs" title={peserta.Email}>
                    {peserta.Email}
                  </td>
                  <td className="px-4 py-2 text-center align-middle truncate max-w-xs" title={peserta.instansi}>
                    {peserta.instansi}
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
                      <button
                        onClick={() =>
                          router.push(`/admin/daftarPeserta/lihatPeserta?id=${peserta.ID_Peserta}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 p-2 rounded-md transition cursor-pointer"
                        title="Lihat"
                      >
                        <EyeIconSolid className="w-4 h-4 text-white" />
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/admin/daftarPeserta/editPeserta?id=${peserta.ID_Peserta}`)
                        }
                        className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-md transition cursor-pointer"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-4 h-4 text-white" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPeserta(peserta);
                          setShowModal(true);
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
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`${
            currentPage === totalPages || totalPages === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } px-3 py-1 rounded`}
          type="button"
        >
          Selanjutnya
        </button>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showModal && selectedPeserta && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Konfirmasi Hapus
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Apakah Anda yakin ingin menghapus peserta{' '}
              <span className="font-bold">{selectedPeserta.Nama_Lengkap}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Import Data Peserta
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih File Excel
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: .xlsx, .xls, .csv
              </p>
            </div>

            {selectedFile && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">File dipilih:</span> {selectedFile.name}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Ukuran: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            {importError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{importError}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">Catatan:</span> Pastikan file Anda sesuai format memiliki kolom: 
                id, first_name, last_name, email, password, status, instansi, bio, photo_url.
                Kolom yang tidak boleh kosong adalah [id, first_name, last_name, email, status, instansi], silahkan unduh template.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer"
                disabled={importLoading}
              >
                Batal
              </button>
              <button
                onClick={handleImportExcel}
                disabled={!selectedFile || importLoading}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  !selectedFile || importLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {importLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengimpor...
                  </>
                ) : (
                  'Import'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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