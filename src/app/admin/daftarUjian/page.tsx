'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

interface Ujian {
  id: number;
  nama: string;
  tanggal: string;
  durasi: number;
  status: boolean;
}

export default function DaftarUjianPage() {
  const [dataUjian, setDataUjian] = useState<Ujian[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Tambahkan state untuk sidebar collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setDataUjian([
      { id: 1, nama: 'Ujian 1', tanggal: '07 Juli 2025', durasi: 90, status: true },
      { id: 2, nama: 'Ujian 2', tanggal: '07 Juli 2025', durasi: 90, status: false },
      { id: 3, nama: 'Ujian 3', tanggal: '07 Juli 2025', durasi: 60, status: true },
      { id: 4, nama: 'Ujian 4', tanggal: '07 Juli 2025', durasi: 40, status: true },
      { id: 5, nama: 'Ujian 5', tanggal: '07 Juli 2025', durasi: 30, status: false },
      { id: 6, nama: 'Ujian 6', tanggal: '07 Juli 2025', durasi: 90, status: true },
      { id: 7, nama: 'Ujian 7', tanggal: '07 Juli 2025', durasi: 90, status: true },
      { id: 8, nama: 'Ujian 8', tanggal: '07 Juli 2025', durasi: 90, status: false },
      { id: 9, nama: 'Ujian 9', tanggal: '07 Juli 2025', durasi: 90, status: false },
      { id: 10, nama: 'Ujian 10', tanggal: '07 Juli 2025', durasi: 90, status: true },
      { id: 11, nama: 'Ujian 11', tanggal: '07 Juli 2025', durasi: 90, status: false },
    ]);
  }, []);

  const filteredData = dataUjian.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-200">
      {/* Sidebar dengan state collapsed */}
      <SidebarAdmin
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Konten utama dengan margin kiri menyesuaikan sidebar */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <AdminHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-end items-center mb-4">
            <button
              className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors duration-200"
              onClick={() => alert('Navigasi ke form buat soal')}
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

          <h1 className="text-2xl font-semibold mb-6 mt-[-55]">Daftar Ujian</h1>

          <div className="bg-white rounded-lg shadow overflow-auto">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-blue-900 text-white text-center">
                <tr>
                  <th className="px-4 py-3">ID Ujian</th>
                  <th className="px-4 py-3">Nama Ujian</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Durasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((ujian) => (
                    <tr key={ujian.id} className="text-center border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{ujian.id}</td>
                      <td className="px-4 py-2">{ujian.nama}</td>
                      <td className="px-4 py-2">{ujian.tanggal}</td>
                      <td className="px-4 py-2">{ujian.durasi} menit</td>
                      <td className="px-4 py-2">
                        <button
                          className={`inline-flex w-10 h-5 rounded-full items-center transition-colors duration-300 ${
                            ujian.status ? 'bg-green-700' : 'bg-red-900'
                          }`}
                          aria-label={ujian.status ? 'Aktif' : 'Tidak aktif'}
                        >
                          <span
                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
                              ujian.status ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-2 space-x-1">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                          onClick={() => alert(`Lihat Ujian ID ${ujian.id}`)}
                        >
                          Lihat
                        </button>
                        <button
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                          onClick={() => alert(`Edit Ujian ID ${ujian.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs"
                          onClick={() => alert(`Hapus Ujian ID ${ujian.id}`)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
