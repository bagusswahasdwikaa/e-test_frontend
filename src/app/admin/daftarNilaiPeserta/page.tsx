'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export interface ExamResult {
  user_id: number;
  nama_lengkap: string;
  id_ujian: number | null;
  nama_ujian: string | null;
  tanggal: string | null; // "YYYY-MM-DD HH:mm"
  nilai: number | null;
  status: string;
}

type SortField = 'user_id' | 'nama_lengkap' | 'tanggal' | 'nilai' | 'nama_ujian' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function AdminDashboard() {
  const router = useRouter();
  const [examData, setExamData] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const [monthRange, setMonthRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterStatus, setFilterStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/nilai-peserta`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setExamData(json.data);
        } else {
          throw new Error('Response format tidak sesuai');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [API_BASE_URL]);

  // Fungsi untuk handle klik nama peserta
  const handleNameClick = (userId: number) => {
    router.push(`/admin/daftarPeserta/lihatPeserta?id=${userId}`);
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

  // Validasi maksimal rentang 6 bulan
  const isValidMonthRange = (start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return true;
    const startMonth = start.getMonth() + start.getFullYear() * 12;
    const endMonth = end.getMonth() + end.getFullYear() * 12;
    return endMonth - startMonth <= 5;
  };

  const isSelectableDate = (date: Date) => {
    const [start] = monthRange;
    if (!start) return true;
    const startMonth = start.getMonth() + start.getFullYear() * 12;
    const dateMonth = date.getMonth() + date.getFullYear() * 12;
    return dateMonth >= startMonth && dateMonth <= startMonth + 5;
  };

  const cancelMonthFilter = () => {
    setMonthRange([null, null]);
  };

  // Filtering data
  const filteredData = examData.filter((item) => {
    const matchesSearch =
      item.user_id.toString().includes(searchTerm) ||
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nama_ujian?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const itemDate = item.tanggal ? new Date(item.tanggal) : null;
    const [start, end] = monthRange;
    const matchesMonth =
      !start || !end || !itemDate
        ? true
        : itemDate >= new Date(start.getFullYear(), start.getMonth(), 1) &&
          itemDate <= new Date(end.getFullYear(), end.getMonth() + 1, 0);

    const matchesStatus = filterStatus === '' || item.status === filterStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  // Sorting data
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'user_id':
          aValue = a.user_id;
          bValue = b.user_id;
          break;
        case 'nama_lengkap':
          aValue = a.nama_lengkap.toLowerCase();
          bValue = b.nama_lengkap.toLowerCase();
          break;
        case 'tanggal':
          aValue = a.tanggal ? new Date(a.tanggal).getTime() : 0;
          bValue = b.tanggal ? new Date(b.tanggal).getTime() : 0;
          break;
        case 'nilai':
          aValue = a.nilai ?? -1;
          bValue = b.nilai ?? -1;
          break;
        case 'nama_ujian':
          aValue = (a.nama_ujian || '').toLowerCase();
          bValue = (b.nama_ujian || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
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

  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleExportExcel = () => {
    const exportUrl = `${API_BASE_URL}/nilai-peserta/export`;
    window.open(exportUrl, '_blank');
  };

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Nilai Peserta Ujian</h1>
        <button
          onClick={handleExportExcel}
          className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          type="button"
        >
          <ArrowDownTrayIcon className="h-4 w-4 text-white stroke-2" />
          <span className="text-xs font-semibold">Unduh Excel</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Rentang Bulan:
          </label>
          <DatePicker
            selectsRange
            startDate={monthRange[0]}
            endDate={monthRange[1]}
            onChange={(update) => {
              const [start, end] = update as [Date | null, Date | null];
              if (start && end && !isValidMonthRange(start, end)) {
                alert('Maksimal rentang 6 bulan');
                return;
              }
              setMonthRange([start, end]);
            }}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Pilih rentang bulan"
            className="rounded-md border border-gray-300 bg-gray-100 py-1.5 px-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-44 cursor-pointer"
            onChangeRaw={(event) => event?.preventDefault?.()}
            filterDate={isSelectableDate}
          />
          {(monthRange[0] || monthRange[1]) && (
            <button
              className="ml-2 px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
              onClick={cancelMonthFilter}
              type="button"
            >
              Batal
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <label
            htmlFor="filterStatus"
            className="text-sm font-medium text-gray-700 select-none"
          >
            Filter Status:
          </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-36 rounded-md border border-gray-300 bg-gray-100 py-1.5 px-2 text-xs text-gray-700 shadow-sm
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 ease-in-out cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Sudah Dikerjakan">Sudah Dikerjakan</option>
            <option value="Belum Dikerjakan">Belum Dikerjakan</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg mb-4 border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-gray-800 text-xs">
              <thead className="bg-blue-900 text-white text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('user_id')}
                  >
                    <div className="flex items-center justify-center">
                      NIK
                      {renderSortIcon('user_id')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('nama_lengkap')}
                  >
                    <div className="flex items-center justify-center">
                      Nama Lengkap
                      {renderSortIcon('nama_lengkap')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('tanggal')}
                  >
                    <div className="flex items-center justify-center">
                      Tanggal
                      {renderSortIcon('tanggal')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('nilai')}
                  >
                    <div className="flex items-center justify-center">
                      Nilai
                      {renderSortIcon('nilai')}
                    </div>
                  </th>
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
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr
                      key={`${item.user_id}-${item.id_ujian ?? 'null'}`}
                      className="border-t text-center hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-4 py-2">{item.user_id.toString().padStart(3, '0')}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleNameClick(item.user_id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors"
                          type="button"
                        >
                          {item.nama_lengkap}
                        </button>
                      </td>
                      <td className="px-4 py-2">{item.tanggal ?? '-'}</td>
                      <td className="px-4 py-2">{item.nilai !== null ? item.nilai : '-'}</td>
                      <td className="px-4 py-2">{item.nama_ujian ?? '-'}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Sudah Dikerjakan'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-2 py-4 text-sm text-gray-600 mt-3">
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
        </>
      )}
    </AdminLayout>
  );
}