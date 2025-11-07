'use client';

import React, { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import axios from '@/services/axios';

interface RingkasanHasil {
  nama_ujian: string;
  jenis_ujian: string;
  id_ujian: number;
  hasil: {
    nilai: number;
    status: string;
    waktu_selesai: string | null;
    sertifikat_id?: number | null;
  } | null;
}

type SortField = 'nama_ujian' | 'waktu_selesai' | 'nilai' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function HasilPage() {
  const [hasilList, setHasilList] = useState<RingkasanHasil[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [loadingView, setLoadingView] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    async function fetchHasil() {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMsg('Token tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/hasil-ujian', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasilList(res.data.data || []);
      } catch (err: any) {
        console.error('Error fetching hasil:', err);
        setErrorMsg(err.response?.data?.message || 'Gagal memuat hasil ujian.');
      } finally {
        setLoading(false);
      }
    }
    fetchHasil();
  }, []);

  function parseBackendDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    if ([day, month, year, hour, minute, second].some(isNaN)) return null;
    return new Date(year, month - 1, day, hour, minute, second);
  }

  const formatDateTime = (dateStr: string | null) => {
    const d = parseBackendDate(dateStr);
    if (!d) return '-';
    return d.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Fungsi view sertifikat di modal
  const handleViewSertifikat = async (sertifikatId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      return;
    }

    setLoadingView(true);
    try {
      const response = await axios.get(`/sertifikat/${sertifikatId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf'
        },
        responseType: 'blob',
      });

      // Pastikan response adalah blob PDF
      if (response.data.type !== 'application/pdf') {
        throw new Error('Response bukan file PDF yang valid');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setViewingPdf(url);
    } catch (err: any) {
      console.error('Error viewing sertifikat:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat sertifikat';
      
      // Jika response adalah blob, parse sebagai JSON
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const jsonError = JSON.parse(text);
          alert(jsonError.message || 'Gagal memuat sertifikat');
        } catch {
          alert(errorMessage);
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoadingView(false);
    }
  };

  // Fungsi download sertifikat
  const handleDownloadSertifikat = async (sertifikatId: number, namaUjian: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      return;
    }

    setDownloadingId(sertifikatId);
    try {
      const response = await axios.get(`/sertifikat/${sertifikatId}/download`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf'
        },
        responseType: 'blob',
      });

      // Pastikan response adalah blob PDF
      if (response.data.type !== 'application/pdf') {
        throw new Error('Response bukan file PDF yang valid');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate nama file yang lebih deskriptif
      const filename = `Sertifikat_${namaUjian.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Tampilkan notifikasi sukses
      alert('Sertifikat berhasil diunduh!');
    } catch (err: any) {
      console.error('Error downloading sertifikat:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal mengunduh sertifikat';
      
      // Jika response adalah blob, parse sebagai JSON
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const jsonError = JSON.parse(text);
          alert(jsonError.message || 'Gagal mengunduh sertifikat');
        } catch {
          alert(errorMessage);
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setDownloadingId(null);
    }
  };

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

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="ml-1 text-gray-400">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }
    if (sortDirection === 'asc') {
      return (
        <span className="ml-1">
          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </span>
      );
    }
    return (
      <span className="ml-1">
        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    );
  };

  const sortedData = [...hasilList].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'nama_ujian':
        aValue = a.nama_ujian.toLowerCase();
        bValue = b.nama_ujian.toLowerCase();
        break;
      case 'waktu_selesai':
        aValue = parseBackendDate(a.hasil?.waktu_selesai || null);
        bValue = parseBackendDate(b.hasil?.waktu_selesai || null);
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        aValue = aValue.getTime();
        bValue = bValue.getTime();
        break;
      case 'nilai':
        aValue = a.hasil?.nilai ?? -1;
        bValue = b.hasil?.nilai ?? -1;
        break;
      case 'status':
        aValue = a.hasil?.status || 'Belum Dikerjakan';
        bValue = b.hasil?.status || 'Belum Dikerjakan';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <UserLayout>
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

      {/* Modal View PDF dengan Loading */}
      {(viewingPdf || loadingView) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg w-11/12 h-5/6 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">Preview Sertifikat</h3>
              <button
                onClick={() => {
                  if (viewingPdf) {
                    window.URL.revokeObjectURL(viewingPdf);
                    setViewingPdf(null);
                  }
                  setLoadingView(false);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loadingView}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {loadingView ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin w-12 h-12 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Memuat sertifikat...</p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={viewingPdf || ''}
                  className="w-full h-full"
                  title="Sertifikat PDF"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <main className="p-6 min-h-screen">
        <h1 className="text-2xl font-semibold mb-6">Hasil Ujian</h1>
        {loading ? (
          <p className="text-gray-600">Memuat hasil ujian...</p>
        ) : errorMsg ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMsg}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
              <table className="min-w-full text-gray-800 text-xs border-collapse">
                <thead className="bg-blue-900 text-white text-xs">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">No</th>
                    <th 
                      className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                      onClick={() => handleSort('nama_ujian')}
                    >
                      <div className="flex items-center justify-center">
                        Nama Ujian
                        {renderSortIcon('nama_ujian')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                      onClick={() => handleSort('waktu_selesai')}
                    >
                      <div className="flex items-center justify-center">
                        Waktu Selesai
                        {renderSortIcon('waktu_selesai')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                      onClick={() => handleSort('nilai')}
                    >
                      <div className="flex items-center justify-center">
                        Nilai
                        {renderSortIcon('nilai')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center justify-center">
                        Status
                        {renderSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        Data tidak ditemukan
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => {
                      const status = item.hasil?.status || 'Belum Dikerjakan';
                      const statusColor =
                        status === 'Sudah Dikerjakan'
                          ? 'bg-green-200 text-green-800'
                          : status === 'Belum Dikerjakan'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-green-200 text-green-800';
                      
                      const isPostTest = item.jenis_ujian === 'POSTEST';
                      const hasSertifikat = item.hasil?.sertifikat_id;
                      const showSertifikatButtons = isPostTest && status === 'Sudah Dikerjakan' && hasSertifikat;

                      return (
                        <tr
                          key={`${item.nama_ujian}-${idx}`}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2 text-center">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="px-4 py-2 text-center">{item.nama_ujian}</td>
                          <td className="px-4 py-2 text-center">
                            {formatDateTime(item.hasil?.waktu_selesai || null)}
                          </td>
                          <td className="px-4 py-2 text-center">{item.hasil?.nilai ?? '-'}</td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {showSertifikatButtons ? (
                              <div className="flex gap-2 justify-center">
                                {/* Tombol View */}
                                <button
                                  onClick={() => handleViewSertifikat(item.hasil!.sertifikat_id!)}
                                  disabled={loadingView}
                                  className={`${
                                    loadingView
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-green-600 hover:bg-green-700'
                                  } text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1`}
                                  title="Lihat Sertifikat"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Lihat
                                </button>

                                {/* Tombol Download */}
                                <button
                                  onClick={() => handleDownloadSertifikat(item.hasil!.sertifikat_id!, item.nama_ujian)}
                                  disabled={downloadingId === item.hasil!.sertifikat_id}
                                  className={`${
                                    downloadingId === item.hasil!.sertifikat_id
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  } text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1`}
                                  title="Download Sertifikat"
                                >
                                  {downloadingId === item.hasil!.sertifikat_id ? (
                                    <>
                                      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span className="hidden sm:inline">Downloading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Download
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : isPostTest && status === 'Sudah Dikerjakan' ? (
                              <span className="text-yellow-600 text-xs flex items-center justify-center gap-1" title="Sertifikat sedang diproses oleh sistem">
                                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sedang diproses
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center px-2 py-4 text-sm text-gray-600 mt-3">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } px-3 py-1 rounded transition-colors`}
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
                  } px-3 py-1 rounded transition-colors`}
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </UserLayout>
  );
}