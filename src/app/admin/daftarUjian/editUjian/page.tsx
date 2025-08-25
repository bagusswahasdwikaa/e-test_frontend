'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type StatusType = 'Aktif' | 'Non Aktif';

interface UjianData {
  id_ujian: number;
  nama_ujian: string;
  tanggal: string;       // YYYY-MM-DD
  waktu_mulai: string;   // HH:mm
  waktu_selesai: string; // HH:mm
  durasi: number;
  jumlah_soal: number;
  kode_soal: string;
  status: StatusType;
}

export default function EditUjianPage() {
  const router = useRouter();
  const params = useSearchParams();
  const ujianId = params.get('ujian_id');

  const [ujian, setUjian] = useState<UjianData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Ambil data ujian dari backend
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

        const mulai = new Date(data.tanggal_mulai);
        const akhir = new Date(data.tanggal_akhir);

        setUjian({
          id_ujian: data.id_ujian,
          nama_ujian: data.nama_ujian,
          tanggal: data.tanggal_mulai.slice(0, 10),
          waktu_mulai: mulai.toTimeString().slice(0, 5),   // HH:mm
          waktu_selesai: akhir.toTimeString().slice(0, 5), // HH:mm
          durasi: data.durasi,
          jumlah_soal: data.jumlah_soal,
          kode_soal: data.kode_soal,
          status: data.status as StatusType,
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

  const handleChange = (field: keyof Omit<UjianData, 'id_ujian'>, value: any) => {
    if (!ujian) return;
    setUjian({ ...ujian, [field]: value });
  };

  // 🔹 Kirim perubahan ke backend
  const handleSubmit = async () => {
    if (!ujian) return;
    setSaving(true);

    try {
      const tanggalMulai = `${ujian.tanggal} ${ujian.waktu_mulai}:00`;
      const tanggalAkhir = `${ujian.tanggal} ${ujian.waktu_selesai}:00`;

      const payload: Record<string, any> = {
        nama_ujian: ujian.nama_ujian,
        tanggal_mulai: tanggalMulai,
        tanggal_akhir: tanggalAkhir,
        durasi: ujian.durasi,
        jumlah_soal: ujian.jumlah_soal,
        kode_soal: ujian.kode_soal,
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

      router.push(`/admin/daftarUjian/editUjian/editSoal?ujian_id=${ujian.id_ujian}`);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Memuat data ujian...</p>;
  if (!ujian) return <p className="p-6 text-center">Ujian tidak ditemukan.</p>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 mt-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-bold">Edit Ujian</h1>

        {/* Nama Ujian */}
        <div>
          <label className="block mb-1 font-semibold">Nama Ujian</label>
          <input
            type="text"
            value={ujian.nama_ujian}
            onChange={e => handleChange('nama_ujian', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Tanggal */}
        <div>
          <label className="block mb-1 font-semibold">Tanggal Ujian</label>
          <input
            type="date"
            value={ujian.tanggal}
            onChange={e => handleChange('tanggal', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Waktu Mulai */}
        <div>
          <label className="block mb-1 font-semibold">Waktu Mulai</label>
          <input
            type="time"
            value={ujian.waktu_mulai}
            onChange={e => handleChange('waktu_mulai', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Waktu Selesai */}
        <div>
          <label className="block mb-1 font-semibold">Waktu Selesai</label>
          <input
            type="time"
            value={ujian.waktu_selesai}
            onChange={e => handleChange('waktu_selesai', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Durasi */}
        <div>
          <label className="block mb-1 font-semibold">Durasi (menit)</label>
          <input
            type="number"
            min={1}
            value={ujian.durasi}
            onChange={e => handleChange('durasi', Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Jumlah Soal */}
        <div>
          <label className="block mb-1 font-semibold">Jumlah Soal</label>
          <input
            type="number"
            min={1}
            value={ujian.jumlah_soal}
            onChange={e => handleChange('jumlah_soal', Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Kode Soal */}
        <div>
          <label className="block mb-1 font-semibold">Kode Soal</label>
          <input
            type="text"
            value={ujian.kode_soal}
            onChange={e => handleChange('kode_soal', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => router.push('/admin/daftarUjian')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
            disabled={saving}
          >
            Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Selanjutnya'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
