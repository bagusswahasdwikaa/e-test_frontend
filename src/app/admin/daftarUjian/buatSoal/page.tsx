'use client';

import React, { useState, useEffect } from 'react';
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

  // Restore data dari sessionStorage saat komponen mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('ujianData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData({
        nama: parsedData.nama_ujian || '',
        kode: parsedData.kode_soal || '',
        jumlahSoal: parsedData.jumlah_soal?.toString() || '',
        tanggalMulai: parsedData.tanggal_mulai || '',
        tanggalAkhir: parsedData.tanggal_akhir || '',
        durasi: parsedData.durasi?.toString() || '',
        jenisUjian: parsedData.jenis_ujian || '',
        standarMinimalNilai: parsedData.standar_minimal_nilai?.toString() || '',
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    // Simpan data ke sessionStorage untuk diambil di halaman selanjutnya
    const ujianData = {
      nama_ujian: nama,
      kode_soal: kode,
      jumlah_soal: parseInt(jumlahSoal),
      durasi: parseInt(durasi),
      tanggal_mulai: tanggalMulai,
      tanggal_akhir: tanggalAkhir,
      jenis_ujian: jenisUjian,
      ...(jenisUjian === 'POSTEST' && { standar_minimal_nilai: parseInt(standarMinimalNilai) })
    };

    sessionStorage.setItem('ujianData', JSON.stringify(ujianData));

    // Navigasi ke halaman soal tanpa menyimpan ke database
    router.push(
      `/admin/daftarUjian/buatSoal/soal/?jumlah_soal=${jumlahSoal}`
    );
  };

  const handleCancel = () => {
    // Hapus data dari sessionStorage saat batal
    sessionStorage.removeItem('ujianData');
    sessionStorage.removeItem('soalsData');
    router.push('/admin/daftarUjian');
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-2xl font-semibold mb-4 underline">Form Buat Ujian</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Ujian */}
          <div>
            <label className="block font-semibold mb-1 text-sm">Nama Ujian</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Contoh: Ujian Akhir Semester"
              required
            />
          </div>

          {/* Kode Soal */}
          <div>
            <label className="block font-semibold mb-1 text-sm">Kode Soal</label>
            <input
              type="text"
              name="kode"
              value={formData.kode}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Contoh: UJ001"
              maxLength={12}
              required
            />
          </div>

          {/* Jumlah Soal */}
          <div>
            <label className="block font-semibold mb-1 text-sm">Jumlah Soal</label>
            <input
              type="number"
              name="jumlahSoal"
              value={formData.jumlahSoal}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              min={1}
              max={100}
              required
            />
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block font-semibold mb-1 text-sm">Tanggal Mulai</label>
            <input
              type="datetime-local"
              name="tanggalMulai"
              value={formData.tanggalMulai}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block font-semibold mb-1 text-sm">Tanggal Akhir</label>
            <input
              type="datetime-local"
              name="tanggalAkhir"
              value={formData.tanggalAkhir}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Durasi */}
          <div>
            <label className="block font-semibold mb-1 text-sm">Durasi (menit)</label>
            <input
              type="number"
              name="durasi"
              value={formData.durasi}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Contoh: 90"
              required
            />
          </div>

          {/* Jenis Ujian */}
          <div>
            <label className="block font-semibold mb-1 text-sm">Jenis Ujian</label>
            <select
              name="jenisUjian"
              value={formData.jenisUjian}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
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
              <label className="block font-semibold mb-1 text-sm">Standar Minimal Nilai</label>
              <input
                type="number"
                name="standarMinimalNilai"
                value={formData.standarMinimalNilai}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
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
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded cursor-pointer text-sm"
            >
              Selanjutnya
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}