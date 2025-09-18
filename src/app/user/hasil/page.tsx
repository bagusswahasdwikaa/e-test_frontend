'use client';

import React, { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import axios from '@/services/axios'; // pastikan axios sudah dikonfigurasi

interface RingkasanHasil {
  nama_ujian: string;
  hasil: {
    nilai: number;
    status: string;
    waktu_selesai: string | null; // format 'd-m-Y H:i:s'
  } | null;
}

export default function HasilPage() {
  const [hasilList, setHasilList] = useState<RingkasanHasil[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // parsing tanggal backend format d-m-Y H:i:s ke Date
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

  // Pagination tanpa filter dan sorting
  const totalPages = Math.ceil(hasilList.length / itemsPerPage);
  const paginatedData = hasilList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <UserLayout>
      <main className="p-6 bg-gray-100 min-h-screen">
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
                    <th className="px-4 py-3">Nama Ujian</th>
                    <th className="px-4 py-3">Waktu Selesai</th>
                    <th className="px-4 py-3 text-center">Nilai</th>
                    <th className="px-4 py-3 text-center">Status</th>
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
                          <td className="px-4 py-2 text-center">{formatDateTime(item.hasil?.waktu_selesai || null)}</td>
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
