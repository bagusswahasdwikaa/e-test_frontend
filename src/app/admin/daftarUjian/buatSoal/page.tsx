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
    jenisUjian: '',
    standarMinimalNilai: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateTime = (value: string) => {
    return value ? value.replace('T', ' ') + ':00' : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      nama,
      kode,
      jumlahSoal,
      tanggalMulai,
      tanggalAkhir,
      durasi,
      jenisUjian,
      standarMinimalNilai,
    } = formData;

    // Validasi frontend
    if (!nama || !kode || !jumlahSoal || !tanggalMulai || !tanggalAkhir || !durasi || !jenisUjian) {
      alert('Mohon lengkapi semua data yang wajib diisi.');
      return;
    }

    if (jenisUjian === 'POSTEST' && !standarMinimalNilai) {
      alert('Standar minimal nilai wajib diisi untuk Post Test.');
      return;
    }

    if (jenisUjian === 'PRETEST' && standarMinimalNilai) {
      alert('Standar minimal nilai tidak boleh diisi untuk Pre Test.');
      return;
    }

    try {
      const payload: Record<string, any> = {
        nama_ujian: nama,
        kode_soal: kode,
        jumlah_soal: parseInt(jumlahSoal),
        durasi: parseInt(durasi),
        tanggal_mulai: formatDateTime(tanggalMulai),
        tanggal_akhir: formatDateTime(tanggalAkhir),
        jenis_ujian: jenisUjian,
      };

      if (jenisUjian === 'POSTEST') {
        payload.standar_minimal_nilai = parseInt(standarMinimalNilai);
      }

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

          {/* Jenis Ujian */}
          <div>
            <label className="block font-medium mb-1">Jenis Ujian</label>
            <select
              name="jenisUjian"
              value={formData.jenisUjian}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">-- Pilih Jenis Ujian --</option>
              <option value="PRETEST">Pre Test</option>
              <option value="POSTEST">Post Test</option>
            </select>
          </div>

          {/* Standar Minimal Nilai (hanya untuk POSTEST) */}
          {formData.jenisUjian === 'POSTEST' && (
            <div>
              <label className="block font-medium mb-1">Standar Minimal Nilai</label>
              <input
                type="number"
                name="standarMinimalNilai"
                value={formData.standarMinimalNilai}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Contoh: 70"
                min={0}
                max={100}
                required={formData.jenisUjian === 'POSTEST'}
              />
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
