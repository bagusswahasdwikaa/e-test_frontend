'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useSearchParams, useRouter } from 'next/navigation';

type JawabanOptions = {
  A: string;
  B: string;
  C: string;
  D: string;
};

type SingleSoal = {
  pertanyaan: string;
  jawaban: JawabanOptions;
  jawabanBenar: keyof JawabanOptions;
};

export default function SoalBulkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ujianIdParam = searchParams.get('ujian_id');
  const jumlahSoalParam = searchParams.get('jumlah_soal');

  const ujianId = ujianIdParam ? parseInt(ujianIdParam, 10) : null;
  const jumlahSoal = jumlahSoalParam ? parseInt(jumlahSoalParam, 10) : 0;

  const [soals, setSoals] = useState<SingleSoal[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!ujianId || jumlahSoal <= 0) {
      alert('Parameter ujian_id atau jumlah_soal tidak valid.');
      router.push('/admin/daftarUjian');
      return;
    }

    const initialSoals: SingleSoal[] = Array.from({ length: jumlahSoal }, () => ({
      pertanyaan: '',
      jawaban: { A: '', B: '', C: '', D: '' },
      jawabanBenar: 'A',
    }));
    setSoals(initialSoals);
  }, [ujianId, jumlahSoal, router]);

  const handlePertanyaanChange = (index: number, value: string) => {
    const updated = [...soals];
    updated[index].pertanyaan = value;
    setSoals(updated);
  };

  const handleJawabanChange = (
    index: number,
    key: keyof JawabanOptions,
    value: string
  ) => {
    const updated = [...soals];
    updated[index].jawaban[key] = value;
    setSoals(updated);
  };

  const handleJawabanBenarChange = (
    index: number,
    value: keyof JawabanOptions
  ) => {
    const updated = [...soals];
    updated[index].jawabanBenar = value;
    setSoals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ujianId) {
      alert('ID ujian tidak ditemukan.');
      return;
    }

    for (let i = 0; i < soals.length; i++) {
      const s = soals[i];
      if (!s.pertanyaan.trim()) {
        alert(`Pertanyaan Soal ${i + 1} belum diisi.`);
        return;
      }
      for (const k of ['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]) {
        if (!s.jawaban[k].trim()) {
          alert(`Jawaban ${k} pada soal ${i + 1} belum diisi.`);
          return;
        }
      }
    }

    const payload = {
      ujian_id: ujianId,
      soals: soals.map((s) => ({
        pertanyaan: s.pertanyaan,
        media_type: 'none',
        media_path: null,
        jawabans: (['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map((k) => ({
          jawaban: s.jawaban[k],
          is_correct: k === s.jawabanBenar,
        })),
      })),
    };

    try {
      const response = await fetch('http://localhost:8000/api/soals/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Gagal menyimpan soal:', err);
        alert('Gagal menyimpan soal. Periksa console.');
        return;
      }

      setShowModal(true); // Tampilkan modal setelah berhasil
    } catch (error) {
      console.error('Error saat fetch:', error);
      alert('Terjadi kesalahan saat menyimpan soal.');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-2xl font-semibold mb-6">
          Tambah {jumlahSoal} Soal untuk Ujian #{ujianId}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {soals.map((s, idx) => (
            <div key={idx} className="border p-4 rounded bg-gray-50">
              <h2 className="font-medium mb-2">Soal {idx + 1}</h2>
              <textarea
                className="w-full border rounded p-2 mb-3"
                placeholder="Tuliskan pertanyaan"
                value={s.pertanyaan}
                onChange={(e) => handlePertanyaanChange(idx, e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4 mb-3">
                {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map((k) => (
                  <div key={k}>
                    <label className="block font-sm mb-1">{k}.</label>
                    <input
                      type="text"
                      name={k}
                      value={s.jawaban[k]}
                      onChange={(e) => handleJawabanChange(idx, k, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Jawaban Benar:</label>
                <select
                  value={s.jawabanBenar}
                  onChange={(e) => handleJawabanBenarChange(idx, e.target.value as any)}
                  className="border rounded px-3 py-2"
                  required
                >
                  {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Simpan Semua Soal
            </button>
          </div>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Berhasil!</h2>
            <p className="mb-6">Soal berhasil disimpan. Ingin melihat preview soal?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => router.push(`/admin/daftarUjian/buatSoal/lihatSoal/?ujian_id=${ujianId}`)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Lihat Soal
              </button>
              <button
                onClick={() => router.push('/admin/daftarUjian')}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
