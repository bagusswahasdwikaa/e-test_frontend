'use client';

import React from 'react';
import SidebarAdmin from '@/components/AdminSidebar';

const examData = [
  { id: '001', name: 'Andi Wijaya', date: '2024-04-01', score: 85, exam: 'Matematika', status: 'Selesai' },
  { id: '002', name: 'Budi Santoso', date: '2024-04-02', score: 78, exam: 'Bahasa Inggris', status: 'Selesai' },
  { id: '003', name: 'Citra Dewi', date: '2024-04-03', score: null, exam: 'Fisika', status: 'Belum' },
  { id: '004', name: 'Dewi Lestari', date: '2024-04-04', score: 92, exam: 'Kimia', status: 'Selesai' },
  { id: '005', name: 'Eko Prasetyo', date: '2024-04-05', score: 67, exam: 'Biologi', status: 'Selesai' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SidebarAdmin />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semi-bold mb-5 text-gray-800">Daftar Nilai Peserta Ujian</h1>

        <div className="bg-white shadow rounded-lg overflow-auto">
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
              {examData.map((item) => (
                <tr key={item.id} className="border-t border-gray-200 text-center hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap">{item.id}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.date}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.score ?? '-'}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.exam}</td>
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
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M9 3a1 1 0 112 0v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 10.586V3z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M3 14a1 1 0 011 1v2h12v-2a1 1 0 112 0v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Unduh Semua Nilai
          </button>
        </div>
      </main>
    </div>
  );
}
