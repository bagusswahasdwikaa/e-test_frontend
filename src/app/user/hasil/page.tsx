'use client';

import React, { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import axios from '@/services/axios';

interface RingkasanHasil {
  nama_ujian: string;
  hasil: {
    nilai: number;
    status: string;
    waktu_selesai: string | null;
  } | null;
}

type SortField = 'nama_ujian' | 'waktu_selesai' | 'nilai' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function HasilPage() {
  const [hasilList, setHasilList] = useState<RingkasanHasil[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        setErrorMsg('Gagal memuat hasil ujian.');
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
    setCurrentPage(1); // Reset ke halaman pertama saat sorting
  };

  // Fungsi untuk render icon sorting
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

  // Sort data
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
        // Handle null dates - push them to the end
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

  // Pagination
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
      <main className="p-6 min-h-screen">
        <h1 className="text-2xl font-semibold mb-6">Hasil Ujian</h1>
        {loading ? (
          <p className="text-gray-600">Memuat hasil ujian...</p>
        ) : errorMsg ? (
          <p className="text-red-600">{errorMsg}</p>
        ) : (
          <>
            <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-gray-800 text-sm table-fixed">
                <thead className="bg-blue-900 text-white uppercase text-xs font-semibold">
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
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
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
                      return (
                        <tr
                          key={`${item.nama_ujian}-${idx}`}
                          className="border-t hover:bg-gray-50"
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-2 py-4 text-sm text-gray-600 mt-3">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } px-3 py-1 rounded`}
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
              >
                Selanjutnya
              </button>
            </div>
          </>
        )}
      </main>
    </UserLayout>
  );
}