'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type RawJawabanObj = {
  [key: string]: {
    jawaban: string;
    is_correct: boolean | number | string;
  };
};

type RawSoal = {
  pertanyaan: string;
  media_type: 'none' | 'image';
  media_path: string | null;
  media_url: string | null;
  jawabans: RawJawabanObj;
};

type NormalizedJawaban = {
  jawaban: string;
  is_correct: boolean;
};

type Soal = {
  pertanyaan: string;
  media_type: 'none' | 'image';
  media_path: string | null;
  media_url: string | null;
  jawabans: NormalizedJawaban[];
};

export default function LihatSoalPage() {
  const [soals, setSoals] = useState<Soal[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const ujianId = searchParams.get('ujian_id');

  useEffect(() => {
    if (!ujianId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/soals/by-ujian/${ujianId}`)
      .then((res) => res.json())
      .then(({ data }: { data: RawSoal[] }) => {
        const normalizedData: Soal[] = data.map((soal) => {
          const keys = ['A', 'B', 'C', 'D'];
          const normalizedJawabans: NormalizedJawaban[] = keys.map((key) => {
            const jaw = soal.jawabans[key];
            return {
              jawaban: jaw?.jawaban || '',
              is_correct:
                jaw?.is_correct === true ||
                jaw?.is_correct === 1 ||
                jaw?.is_correct === '1' ||
                jaw?.is_correct === 'true' ||
                false,
            };
          });

          const mediaUrl =
            soal.media_type === 'image' && soal.media_path
              ? `http://localhost:8000/storage/${soal.media_path}`
              : null;

          return {
            pertanyaan: soal.pertanyaan,
            media_type: soal.media_type,
            media_path: soal.media_path,
            media_url: mediaUrl,
            jawabans: normalizedJawabans,
          };
        });

        setSoals(normalizedData);
      })
      .catch((err) => {
        console.error('Gagal mengambil soal:', err);
        alert('Gagal memuat soal.');
      });
  }, [ujianId]);

  /**
   * ✅ Render hanya untuk gambar (tidak ada video)
   */
  const renderMedia = (mediaType: string, mediaUrl: string | null) => {
    if (!mediaUrl || mediaType !== 'image') return null;

     return (
      <img
        src={mediaUrl}
        alt="Gambar Soal"
        className="max-w-full max-h-64 rounded my-4 border"
      />
    );
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
              <p className="mb-2 text-gray-800 whitespace-pre-line">
                {soal.pertanyaan}
              </p>

              {/* ✅ Hanya tampilkan gambar */}
              {renderMedia(soal.media_type, soal.media_url)}

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
                      {label}. {j.jawaban}{' '}
                      {j.is_correct ? '✅ (Benar)' : '❌'}
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
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
