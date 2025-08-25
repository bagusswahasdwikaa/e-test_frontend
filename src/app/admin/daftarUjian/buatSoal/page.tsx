'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

export default function BuatSoalPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    jumlahSoal: '',
    tanggalMulai: '',
    tanggalAkhir: '',
    durasi: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateTime = (value: string) => {
    // Input datetime-local -> format Y-m-d H:i:s
    return value ? value.replace('T', ' ') + ':00' : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { nama, kode, jumlahSoal, tanggalMulai, tanggalAkhir, durasi } = formData;

    if (!nama || !kode || !jumlahSoal || !tanggalMulai || !tanggalAkhir || !durasi) {
      alert('Mohon lengkapi semua data terlebih dahulu.');
      return;
    }

    try {
      const payload = {
        nama_ujian: nama,
        kode_soal: kode,
        jumlah_soal: parseInt(jumlahSoal),
        durasi: parseInt(durasi),
        tanggal_mulai: formatDateTime(tanggalMulai),
        tanggal_akhir: formatDateTime(tanggalAkhir),
        // status & nilai otomatis di backend
      };

      const response = await fetch('http://localhost:8000/api/ujians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Gagal menyimpan:', error);
        alert('Gagal menyimpan ujian: ' + (error.message || 'Terjadi kesalahan.'));
        return;
      }

      const result = await response.json();
      alert('Ujian berhasil dibuat!');

      // Arahkan ke halaman tambah soal
      router.push(
        `/admin/daftarUjian/buatSoal/soal/?ujian_id=${result.data.id_ujian}&jumlah_soal=${jumlahSoal}`
      );
    } catch (err) {
      console.error('Error:', err);
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
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: Ujian Akhir Semester"
              required
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
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: UJ001"
              required
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
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block font-medium mb-1">Tanggal Mulai</label>
            <input
              type="datetime-local"
              name="tanggalMulai"
              value={formData.tanggalMulai}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block font-medium mb-1">Tanggal Akhir</label>
            <input
              type="datetime-local"
              name="tanggalAkhir"
              value={formData.tanggalAkhir}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
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
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: 90"
              required
            />
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
