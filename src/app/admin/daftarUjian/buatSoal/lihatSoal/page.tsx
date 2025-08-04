'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type RawJawaban = {
  jawaban: string;
  is_correct: boolean | number | string;
};

type RawSoal = {
  pertanyaan: string;
  media_type: 'none' | 'image' | 'video';
  media_path: string | null;
  jawabans: RawJawaban[];
};

type NormalizedJawaban = {
  jawaban: string;
  is_correct: boolean;
};

type Soal = {
  pertanyaan: string;
  media_type: 'none' | 'image' | 'video';
  media_path: string | null;
  jawabans: NormalizedJawaban[];
};

export default function LihatSoalPage() {
  const [soals, setSoals] = useState<Soal[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const ujianId = searchParams.get('ujian_id');

  useEffect(() => {
    if (!ujianId) return;

    fetch(`http://localhost:8000/api/soals/by-ujian/${ujianId}`)
      .then((res) => res.json())
      .then((data: RawSoal[]) => {
        const normalizedData: Soal[] = data.map((soal) => ({
          pertanyaan: soal.pertanyaan,
          media_type: soal.media_type,
          media_path: soal.media_path,
          jawabans: soal.jawabans.map((j) => ({
            jawaban: j.jawaban,
            is_correct:
              j.is_correct === true ||
              j.is_correct === 1 ||
              j.is_correct === '1' ||
              j.is_correct === 'true',
          })),
        }));

        setSoals(normalizedData);
      })
      .catch((err) => console.error('Gagal mengambil soal:', err));
  }, [ujianId]);

  const renderMedia = (mediaType: string, mediaPath: string | null) => {
    if (!mediaPath) return null;

    const fullUrl = `http://localhost:8000/storage/${mediaPath}`;

    if (mediaType === 'image') {
      return (
        <img
          src={fullUrl}
          alt="Media Gambar Soal"
          className="max-w-full max-h-64 rounded my-4"
        />
      );
    }

    if (mediaType === 'video') {
      return (
        <video controls className="w-full max-h-64 rounded my-4">
          <source src={fullUrl} type="video/mp4" />
          Browser Anda tidak mendukung video.
        </video>
      );
    }

    return null;
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Daftar Soal Ujian</h1>

        {soals.length === 0 ? (
          <p>Memuat soal...</p>
        ) : (
          soals.map((soal, idx) => (
            <div
              key={idx}
              className="mb-6 p-4 border rounded bg-gray-50 shadow-sm"
            >
              <h2 className="font-semibold mb-2">Soal {idx + 1}:</h2>
              <p className="mb-2 text-gray-800">{soal.pertanyaan}</p>

              {/* Tampilkan media jika ada */}
              {renderMedia(soal.media_type, soal.media_path)}

              <ul className="space-y-2 mt-3">
                {soal.jawabans.map((j, i) => {
                  const label = String.fromCharCode(65 + i);
                  return (
                    <li
                      key={i}
                      className={`p-2 rounded border ${
                        j.is_correct
                          ? 'bg-green-100 text-green-800 font-semibold border-green-400'
                          : 'bg-red-50 text-red-600 border-red-300'
                      }`}
                    >
                      {label}. {j.jawaban}
                      {j.is_correct ? ' ✅ (Jawaban Benar)' : ' ❌'}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push('/admin/daftarUjian')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
