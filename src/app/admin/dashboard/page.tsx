'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout'; // Layout sudah mengatur proteksi dan UI
import { ExamResult } from '@/types/index'; // Optional: buat type terpisah jika sering digunakan

export default function AdminDashboard() {
  const [examData, setExamData] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    <AdminLayout>
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
                  <th className="px-6 py-3">ID Peserta</th>
                  <th className="px-6 py-3">Nama Lengkap</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Hasil Tes</th>
                  <th className="px-6 py-3">Nama Ujian</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={`${item.id_peserta}-${item.nama_ujian}`} className="border-t text-center hover:bg-gray-50">
                    <td className="px-6 py-3">{item.id_peserta.toString().padStart(3, '0')}</td>
                    <td className="px-6 py-3">{item.nama_lengkap}</td>
                    <td className="px-6 py-3">{item.tanggal ?? '-'}</td>
                    <td className="px-6 py-3">{item.hasil_tes ?? '-'}</td>
                    <td className="px-6 py-3">{item.nama_ujian}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${
                        item.status === 'Selesai' ? 'bg-green-600' : 'bg-red-700'
                      }`}>
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
    </AdminLayout>
  );
}
