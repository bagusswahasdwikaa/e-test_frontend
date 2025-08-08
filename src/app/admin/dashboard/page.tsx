'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ExamResult } from '@/types/index';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AdminDashboard() {
  const [examData, setExamData] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [monthRange, setMonthRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/nilai-peserta')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) setExamData(json);
        else throw new Error('Response format tidak sesuai');
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = () =>
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));

  // Validasi rentang maksimal 6 bulan
  const isValidMonthRange = (start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return true;
    const startMonth = start.getMonth() + start.getFullYear() * 12;
    const endMonth = end.getMonth() + end.getFullYear() * 12;
    return endMonth - startMonth <= 5;
  };

  // Fungsi untuk menentukan apakah tanggal boleh dipilih di datepicker, batasi bulan maksimal 6 dari start jika sudah ada start
  const isSelectableDate = (date: Date) => {
    const [start, end] = monthRange;
    if (!start) return true; // bebas kalau belum mulai pilih
    const startMonth = start.getMonth() + start.getFullYear() * 12;
    const dateMonth = date.getMonth() + date.getFullYear() * 12;
    return dateMonth >= startMonth && dateMonth <= startMonth + 5;
  };

  const filteredData = examData.filter((item) => {
    const matchesSearch =
      item.id_peserta.toString().includes(searchTerm) ||
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_ujian.toLowerCase().includes(searchTerm.toLowerCase());

    const itemDate = item.tanggal ? new Date(item.tanggal) : null;

    const [start, end] = monthRange;

    const matchesMonth =
      (!start || !end || !itemDate)
        ? true
        : itemDate >= new Date(start.getFullYear(), start.getMonth(), 1) &&
          itemDate <= new Date(end.getFullYear(), end.getMonth() + 1, 0);

    const matchesStatus = filterStatus === '' || item.status === filterStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a.id_peserta < b.id_peserta) return sortDirection === 'asc' ? -1 : 1;
      if (a.id_peserta > b.id_peserta) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortDirection]);

  // Fungsi batal reset filter bulan
  const cancelMonthFilter = () => {
    setMonthRange([null, null]);
  };

  const handleExportExcel = () => {
    const exportUrl = 'http://127.0.0.1:8000/api/nilai-peserta/export';
    window.open(exportUrl, '_blank');
  };


  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <h1 className="text-2xl font-semibold mb-5 text-gray-800">
        Daftar Nilai Peserta Ujian
      </h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-6 mb-6 max-w-5xl">
        {/* Filter Bulan Rentang */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700 whitespace-nowrap">
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
              className="rounded-md border border-gray-300 bg-gray-100 py-1.5 px-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-44 cursor-pointer"
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
          {/* Filter Status */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <label
              htmlFor="filterStatus"
              className="font-medium text-gray-700 select-none"
            >
              Filter Status:
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-36 rounded-md border border-gray-300 bg-gray-100 py-1.5 px-2 text-sm text-gray-700 shadow-sm
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 ease-in-out cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Belum Dikerjakan">Belum Dikerjakan</option>
            </select>
          </div>
        </div>
      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Memuat data...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden max-w-full">
          <div className="overflow-auto">
            <table className="min-w-full text-sm text-gray-800 border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white text-center">
                  <th
                    className="px-4 py-3 min-w-[70px] cursor-pointer select-none"
                    onClick={toggleSort}
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      {sortDirection === 'asc' ? '▲' : '▼'} <span>No</span>
                    </span>
                  </th>
                  <th className="px-4 py-3">ID Peserta</th>
                  <th className="px-4 py-3">Nama Lengkap</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Hasil Tes</th>
                  <th className="px-4 py-3">Nama Ujian</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item, idx) => (
                    <tr
                      key={`${item.id_peserta}-${item.nama_ujian}`}
                      className="border-t text-center hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{item.id_peserta.toString().padStart(3, '0')}</td>
                      <td className="px-4 py-2">{item.nama_lengkap}</td>
                      <td className="px-4 py-2">{item.tanggal ?? '-'}</td>
                      <td className="px-4 py-2">{item.hasil_tes ?? '-'}</td>
                      <td className="px-4 py-2">{item.nama_ujian}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Selesai'
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
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 cursor-pointer"
          onClick={handleExportExcel}
        >
          Unduh Excel
        </button>
      </div>
    </AdminLayout>
  );
}
