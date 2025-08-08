'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type StatusType = 'Aktif' | 'Non Aktif';

interface UjianData {
  id_ujian: number;
  nama_ujian: string;
  tanggal: string; // YYYY-MM-DD format
  durasi: number;
  jumlah_soal: number;
  nilai?: number | null;
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

  useEffect(() => {
    if (!ujianId) {
      router.push('/admin/daftarUjian');
      return;
    }

    const fetchUjian = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/ujians/${ujianId}`, {
          headers: {
            Accept: 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setUjian(data);
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

  const handleSubmit = async () => {
    if (!ujian) return;

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${ujian.id_ujian}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          nama_ujian: ujian.nama_ujian,
          tanggal: ujian.tanggal,
          durasi: ujian.durasi,
          jumlah_soal: ujian.jumlah_soal,
          nilai: ujian.nilai ?? null,
          kode_soal: ujian.kode_soal,
          status: ujian.status,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Error response:', errData);
        alert('Gagal memperbarui data ujian.');
        setSaving(false);
        return;
      }

      // Berhasil simpan data ujian, langsung ke halaman edit soal
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

        <div>
          <label className="block mb-1 font-semibold">Nama Ujian</label>
          <input
            type="text"
            value={ujian.nama_ujian}
            onChange={e => handleChange('nama_ujian', e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Tanggal</label>
          <input
            type="date"
            value={ujian.tanggal.slice(0, 10)}
            onChange={e => handleChange('tanggal', e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Durasi (menit)</label>
          <input
            type="number"
            min={1}
            value={ujian.durasi}
            onChange={e => handleChange('durasi', Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Jumlah Soal</label>
          <input
            type="number"
            min={1}
            value={ujian.jumlah_soal}
            onChange={e => handleChange('jumlah_soal', Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Nilai (opsional)</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={ujian.nilai ?? ''}
            onChange={e =>
              handleChange('nilai', e.target.value === '' ? null : Number(e.target.value))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Kode Soal</label>
          <input
            type="text"
            value={ujian.kode_soal}
            onChange={e => handleChange('kode_soal', e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Status</label>
          <select
            value={ujian.status}
            onChange={e => handleChange('status', e.target.value as StatusType)}
            className="w-full border rounded px-3 py-2 cursor-pointer"
            required
          >
            <option value="Aktif">Aktif</option>
            <option value="Non Aktif">Non Aktif</option>
          </select>
        </div>

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
