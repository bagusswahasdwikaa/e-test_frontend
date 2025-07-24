'use client';

import React from 'react';

const examData = [
  { id: 1, name: 'Surya Ihsan', date: '07 Juli 2025', score: 80, exam: 'Ujian 1', status: 'Selesai' },
  { id: 2, name: 'Surya Ihsan', date: '07 Juli 2025', score: 80, exam: 'Ujian 2', status: 'Selesai' },
  { id: 3, name: 'Surya Ihsan', date: '07 Juli 2025', score: 80, exam: 'Ujian 4', status: 'Selesai' },
  { id: 4, name: 'Surya Ihsan', date: '07 Juli 2025', score: null, exam: 'Ujian 1', status: 'Belum Dikerjakan' },
  { id: 5, name: 'Surya Ihsan', date: '07 Juli 2025', score: null, exam: 'Ujian 2', status: 'Belum Dikerjakan' },
  { id: 6, name: 'Surya Ihsan', date: '07 Juli 2025', score: 80, exam: 'Ujian 1', status: 'Selesai' },
  { id: 7, name: 'Surya Ihsan', date: '07 Juli 2025', score: 80, exam: 'Ujian 1', status: 'Selesai' },
  { id: 8, name: 'Surya Ihsan', date: '07 Juli 2025', score: null, exam: 'Ujian 4', status: 'Belum Dikerjakan' },
  { id: 9, name: 'Surya Ihsan', date: '07 Juli 2025', score: 80, exam: 'Ujian 2', status: 'Selesai' },
  { id: 10, name: 'Surya Ihsan', date: '07 Juli 2025', score: null, exam: 'Ujian 3', status: 'Belum Dikerjakan' },
  { id: 11, name: 'Surya Ihsan', date: '07 Juli 2025', score: 80, exam: 'Ujian 3', status: 'Selesai' },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-gray-800 text-white flex flex-col items-center py-4 space-y-6">
        <button className="w-6 h-6" aria-label="Back">
          <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.707 14.707a1 1 0 01-1.414 0L3.586 10l4.707-4.707a1 1 0 011.414 1.414L6.414 10l3.293 3.293a1 1 0 010 1.414z"/></svg>
        </button>
        <div className="w-6 h-6">
          <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 01.894.553l6 12A1 1 0 0116 16H4a1 1 0 01-.894-1.447l6-12A1 1 0 0110 2zm0 3.618L5.618 14h8.764L10 5.618z"/></svg>
        </div>
        <div className="w-6 h-6">
          <svg fill="currentColor" viewBox="0 0 20 20"><path d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z"/></svg>
        </div>
        <div className="w-6 h-6">
          <svg fill="currentColor" viewBox="0 0 20 20"><path d="M13 7H7v6h6V7z" /><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0-2h10a4 4 0 014 4v10a4 4 0 01-4 4H5a4 4 0 01-4-4V5a4 4 0 014-4z" /></svg>
        </div>
        <div className="w-6 h-6">
          <svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h8a1 1 0 110 2H5v10h7a1 1 0 110 2H4a1 1 0 01-1-1V4z"/><path d="M13.293 9.293a1 1 0 011.414 0L18 12.586l-3.293 3.293a1 1 0 01-1.414-1.414L15.586 13H9a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z"/></svg>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Cari"
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button className="px-3 py-2 bg-gray-200 rounded-lg text-sm">Pilih Filter</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Admin</span>
            <div className="w-6 h-6 bg-black rounded-full" />
          </div>
        </div>

        {/* Table Title */}
        <h1 className="text-xl font-semibold mb-4">Daftar Nilai Peserta Ujian</h1>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-2">ID Peserta</th>
                <th className="px-4 py-2">Nama Lengkap</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Hasil Tes</th>
                <th className="px-4 py-2">Nama Ujian</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {examData.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">{item.score !== null ? item.score : '-'}</td>
                  <td className="px-4 py-2">{item.exam}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-medium ${
                        item.status === 'Selesai' ? 'bg-green-600' : 'bg-red-800'
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

        {/* Download Button */}
        <div className="mt-4 flex justify-end">
          <button className="bg-blue-900 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 14a1 1 0 011 1v2h12v-2a1 1 0 112 0v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a1 1 0 011-1z"/>
              <path d="M7 10a1 1 0 012 0v3h2v-3a1 1 0 112 0v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"/>
              <path d="M10 2a1 1 0 011 1v8h-2V3a1 1 0 011-1z"/>
            </svg>
            Unduh Excel
          </button>
        </div>
      </div>
    </div>
  );
}
