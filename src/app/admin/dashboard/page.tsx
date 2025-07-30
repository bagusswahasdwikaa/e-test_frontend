'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

interface ExamResult {
  id_peserta: number;
  nama_lengkap: string;
  tanggal: string | null;
  hasil_tes: number | null;
  nama_ujian: string;
  status: string;
}

export default function AdminDashboard() {
  const [examData, setExamData] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk kontrol sidebar collapsed / expanded
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/nilai-peserta')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) {
          setExamData(json);
        } else {
          throw new Error('Response format tidak sesuai');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredData = examData.filter(
    (item) =>
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_ujian.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <SidebarAdmin
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <AdminHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-semibold mb-5 text-gray-800">Daftar Nilai Peserta Ujian</h1>

          {loading ? (
            <p className="text-gray-600">Memuat data...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-auto">
                <table className="min-w-full text-sm text-gray-800 border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white text-center">
                      <th className="px-6 py-3 whitespace-nowrap">ID Peserta</th>
                      <th className="px-6 py-3 whitespace-nowrap">Nama Lengkap</th>
                      <th className="px-6 py-3 whitespace-nowrap">Tanggal</th>
                      <th className="px-6 py-3 whitespace-nowrap">Hasil Tes</th>
                      <th className="px-6 py-3 whitespace-nowrap">Nama Ujian</th>
                      <th className="px-6 py-3 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr
                        key={`${item.id_peserta}-${item.nama_ujian}`}
                        className="border-t border-gray-200 text-center hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 whitespace-nowrap">{item.id_peserta.toString().padStart(3, '0')}</td>
                        <td className="px-6 py-3 whitespace-nowrap">{item.nama_lengkap}</td>
                        <td className="px-6 py-3 whitespace-nowrap">{item.tanggal ?? '-'}</td>
                        <td className="px-6 py-3 whitespace-nowrap">{item.hasil_tes ?? '-'}</td>
                        <td className="px-6 py-3 whitespace-nowrap">{item.nama_ujian}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${
                              item.status === 'Selesai' ? 'bg-green-600' : 'bg-red-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          Data tidak ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
              onClick={() => alert('Fitur Unduh belum tersedia')}
            >
              Unduh Semua
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
