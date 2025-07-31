'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

export default function BuatSoalPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    durasi: '',
    status: false,
    kode: '',
    jumlahSoal: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (
      !formData.nama ||
      !formData.kode ||
      !formData.jumlahSoal ||
      !formData.tanggal ||
      !formData.durasi
    ) {
      alert('Mohon lengkapi semua data terlebih dahulu.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/ujians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama_ujian: formData.nama,
          tanggal: formData.tanggal,
          durasi: parseInt(formData.durasi),
          jumlah_soal: parseInt(formData.jumlahSoal),
          kode_soal: formData.kode,
          status: formData.status ? 'Aktif' : 'Non Aktif',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gagal menyimpan ujian:', errorData);
        alert('Gagal menyimpan ujian.');
        return;
      }

      const data = await response.json();

      alert('Ujian berhasil dibuat!');

      // Navigasi ke form input soal, kirim jumlah soal juga
      router.push(
        `/admin/daftarUjian/buatSoal/soal/soal?ujian_id=${data.data.id_ujian}&jumlah_soal=${formData.jumlahSoal}`
      );
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      alert('Terjadi kesalahan saat menyimpan ujian.');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-2xl font-semibold mb-4">Form Buat Ujian</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Ujian */}
          <div>
            <label className="block font-medium mb-1">Nama Ujian</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: Ujian Akhir"
            />
          </div>

          {/* Kode Soal */}
          <div>
            <label className="block font-medium mb-1">Kode Soal</label>
            <input
              type="text"
              name="kode"
              value={formData.kode}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: UJ001"
            />
          </div>

          {/* Jumlah Soal */}
          <div>
            <label className="block font-medium mb-1">Jumlah Soal</label>
            <input
              type="number"
              name="jumlahSoal"
              value={formData.jumlahSoal}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: 20"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block font-medium mb-1">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Durasi */}
          <div>
            <label className="block font-medium mb-1">Durasi (menit)</label>
            <input
              type="number"
              name="durasi"
              value={formData.durasi}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: 90"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <label className="text-sm">Aktifkan ujian?</label>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
