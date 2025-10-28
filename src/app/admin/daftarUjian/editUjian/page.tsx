'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type StatusType = 'Aktif' | 'Non Aktif';

interface UjianData {
  id_ujian: number;
  nama_ujian: string;
  tanggal_mulai: string; // 'YYYY-MM-DDTHH:mm'
  tanggal_akhir: string;
  durasi: number;
  jumlah_soal: number;
  kode_soal: string;
  status: StatusType;
  jenis_ujian: 'PRETEST' | 'POSTEST';
  standar_minimal_nilai?: number | null;
}

export default function EditUjianPage() {
  const router = useRouter();
  const params = useSearchParams();
  const ujianId = params.get('ujian_id');

  const [ujian, setUjian] = useState<UjianData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fungsi untuk format tanggal dari backend ke datetime-local input
  const formatToDateTimeLocal = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    
    // Parse tanggal dari backend (format: YYYY-MM-DD HH:mm:ss atau ISO)
    const date = new Date(isoDateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    // Format ke YYYY-MM-DDTHH:mm untuk datetime-local input
    // Gunakan local timezone, bukan UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fungsi untuk format tanggal dari datetime-local input ke format backend
  const formatToBackend = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return '';
    // Tambahkan :00 untuk detik
    return dateTimeLocal.replace('T', ' ') + ':00';
  };

  useEffect(() => {
    if (!ujianId) {
      router.push('/admin/daftarUjian');
      return;
    }

    const fetchUjian = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/ujians/${ujianId}`, {
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        const data = json.data;

        setUjian({
          id_ujian: data.id_ujian,
          nama_ujian: data.nama_ujian,
          tanggal_mulai: formatToDateTimeLocal(data.tanggal_mulai),
          tanggal_akhir: formatToDateTimeLocal(data.tanggal_akhir),
          durasi: data.durasi,
          jumlah_soal: data.jumlah_soal,
          kode_soal: data.kode_soal,
          status: data.status as StatusType,
          jenis_ujian: data.jenis_ujian,
          standar_minimal_nilai: data.standar_minimal_nilai ?? null,
        });
      } catch (error) {
        console.error('Fetch error:', error);
        alert('Gagal memuat data ujian.');
        router.push('/admin/daftarUjian');
      } finally {
        setLoading(false);
      }
    };

    fetchUjian();
  }, [ujianId, router]);

  const handleChange = (field: keyof UjianData, value: any) => {
    if (!ujian) return;
    if (field === 'jenis_ujian' && value === 'PRETEST') {
      setUjian({ ...ujian, [field]: value, standar_minimal_nilai: null });
    } else {
      setUjian({ ...ujian, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (!ujian) return;
    setSaving(true);

    try {
      const mulaiDate = new Date(ujian.tanggal_mulai);
      const akhirDate = new Date(ujian.tanggal_akhir);

      if (mulaiDate >= akhirDate) {
        alert('Tanggal Mulai harus lebih awal dari Tanggal Akhir.');
        setSaving(false);
        return;
      }

      if (ujian.jumlah_soal < 1) {
        alert('Jumlah soal minimal 1.');
        setSaving(false);
        return;
      }

      if (
        ujian.jenis_ujian === 'POSTEST' &&
        (ujian.standar_minimal_nilai == null || isNaN(ujian.standar_minimal_nilai!))
      ) {
        alert('Standar minimal nilai wajib diisi untuk POSTEST.');
        setSaving(false);
        return;
      }

      if (
        ujian.jenis_ujian === 'PRETEST' &&
        ujian.standar_minimal_nilai !== null
      ) {
        alert('Standar minimal nilai tidak boleh diisi untuk PRETEST.');
        setSaving(false);
        return;
      }

      const payload = {
        nama_ujian: ujian.nama_ujian,
        tanggal_mulai: formatToBackend(ujian.tanggal_mulai),
        tanggal_akhir: formatToBackend(ujian.tanggal_akhir),
        durasi: ujian.durasi,
        jumlah_soal: ujian.jumlah_soal,
        kode_soal: ujian.kode_soal,
        jenis_ujian: ujian.jenis_ujian,
        standar_minimal_nilai: ujian.jenis_ujian === 'POSTEST' ? ujian.standar_minimal_nilai : null,
      };

      const res = await fetch(`http://localhost:8000/api/ujians/${ujian.id_ujian}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Error response:', errData);
        alert('Gagal memperbarui data ujian.');
        return;
      }

      alert('Ujian berhasil diperbarui!');
      router.push(
        `/admin/daftarUjian/editUjian/editSoal?ujian_id=${ujian.id_ujian}&jumlah_soal=${ujian.jumlah_soal}`
      );
    } catch (error) {
      console.error('Submit error:', error);
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-35 h-35">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/assets/logo/panasonic-logo.png"
                alt="Logo Panasonic"
                className="w-25 h-25 object-contain"
              />
            </div>
            <div className="absolute inset-0 animate-spin rounded-full border-t-7 border-white border-solid"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!ujian) {
    return (
      <AdminLayout>
        <p className="p-6 text-center text-red-600 font-semibold">Ujian tidak ditemukan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 mt-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Edit Ujian</h1>

        {/* Nama Ujian */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Nama Ujian</label>
          <input
            type="text"
            value={ujian.nama_ujian}
            onChange={e => handleChange('nama_ujian', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama ujian"
          />
        </div>

        {/* Kode Soal */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Kode Soal</label>
          <input
            type="text"
            value={ujian.kode_soal}
            onChange={e => handleChange('kode_soal', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan kode soal"
            maxLength={12}
          />
        </div>

        {/* Jumlah Soal */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Jumlah Soal</label>
          <input
            type="number"
            min={1}
            value={ujian.jumlah_soal}
            onChange={e => handleChange('jumlah_soal', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan jumlah soal"
          />
        </div>

        {/* Tanggal Mulai */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Tanggal Mulai</label>
          <input
            type="datetime-local"
            value={ujian.tanggal_mulai}
            onChange={e => handleChange('tanggal_mulai', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tanggal Akhir */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Tanggal Akhir</label>
          <input
            type="datetime-local"
            value={ujian.tanggal_akhir}
            onChange={e => handleChange('tanggal_akhir', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Durasi */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Durasi (menit)</label>
          <input
            type="number"
            min={1}
            value={ujian.durasi}
            onChange={e => handleChange('durasi', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan durasi dalam menit"
          />
        </div>

        {/* Jenis Ujian */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Jenis Ujian</label>
          <select
            value={ujian.jenis_ujian}
            onChange={e => handleChange('jenis_ujian', e.target.value as 'PRETEST' | 'POSTEST')}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PRETEST">Pre Test</option>
            <option value="POSTEST">Post Test</option>
          </select>
        </div>

        {/* Standar Minimal Nilai (hanya jika POSTEST) */}
        {ujian.jenis_ujian === 'POSTEST' && (
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Standar Minimal Nilai <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={ujian.standar_minimal_nilai ?? ''}
              onChange={e =>
                handleChange(
                  'standar_minimal_nilai',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 75"
            />
            <p className="text-xs text-gray-500 mt-1">Nilai minimal untuk lulus ujian (0-100)</p>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <button
            onClick={() => router.push('/admin/daftarUjian')}
            className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
            disabled={saving}
          >
            Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Selanjutnya'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}