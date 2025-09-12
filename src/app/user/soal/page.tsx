'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/axios';
import UserLayout from '@/components/UserLayout';

interface Jawaban {
  id: number;
  jawaban: string;
}

interface Soal {
  soal_id: number;
  pertanyaan: string;
  media_url?: string | null;
  media_type?: string | null;
  jawabans: Jawaban[];
  jawaban_terpilih?: number | null;
}

export default function SoalPage() {
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ujianId, setUjianId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nilai, setNilai] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function mulaiDanAmbilSoal() {
      const token = localStorage.getItem('token');
      const ujian_id = localStorage.getItem('ujian_id');
      const kode_soal = localStorage.getItem('kode_soal');

      if (!token || !ujian_id || !kode_soal) {
        alert('Ujian tidak valid. Silakan mulai dari dashboard.');
        router.push('/user/dashboard');
        return;
      }

      const parsedUjianId = parseInt(ujian_id);
      if (isNaN(parsedUjianId)) {
        setErrorMsg('ID ujian tidak valid.');
        setLoading(false);
        return;
      }

      setUjianId(parsedUjianId);

      try {
        await axios.post(
          `/user/ujians/${parsedUjianId}/kerjakan`,
          { kode_soal },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const soalRes = await axios.get(`/user/ujians/${parsedUjianId}/soal`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawSoal = soalRes.data?.data ?? [];
        if (!Array.isArray(rawSoal) || rawSoal.length === 0) {
          setErrorMsg('Tidak ada soal tersedia.');
          setLoading(false);
          return;
        }

        setSoalList(
          rawSoal.map((item: any) => ({
            soal_id: item.soal_id,
            pertanyaan: item.pertanyaan,
            media_url: item.media_url,
            media_type: item.media_type,
            jawabans: item.jawabans,
            jawaban_terpilih: typeof item.jawaban_user === 'number' ? item.jawaban_user : null,
          }))
        );
      } catch (error: any) {
        console.error('Error mengambil soal:', error);
        setErrorMsg(error.response?.data?.message ?? `Gagal memuat soal: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    mulaiDanAmbilSoal();
  }, [router]);

  const handlePilihJawaban = (jawabanId: number) => {
    setSoalList((prev) =>
      prev.map((s, idx) =>
        idx === currentIndex ? { ...s, jawaban_terpilih: jawabanId } : s
      )
    );
  };

  const handleNext = () => {
    if (currentIndex < soalList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    if (!ujianId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const jawabanObj: Record<string, number> = {};
    soalList.forEach((s) => {
      if (typeof s.jawaban_terpilih === 'number') {
        jawabanObj[s.soal_id.toString()] = s.jawaban_terpilih;
      }
    });

    if (Object.keys(jawabanObj).length === 0) {
      alert('Anda belum memilih jawaban apapun.');
      return;
    }

    if (Object.keys(jawabanObj).length < soalList.length) {
      const lanjut = confirm('Masih ada soal yang belum dijawab. Tetap submit?');
      if (!lanjut) return;
    }

    const konfirmasi = confirm('Apakah Anda yakin ingin mengakhiri dan mengirim ujian ini?');
    if (!konfirmasi) return;

    setSubmitLoading(true);

    try {
      const res = await axios.post(
        `/user/ujians/${ujianId}/submit`,
        { jawaban: jawabanObj },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && typeof res.data.nilai === 'number') {
        setNilai(res.data.nilai);
        localStorage.removeItem('ujian_id');
        localStorage.removeItem('kode_soal');
      } else {
        alert('Ujian berhasil disubmit, tapi nilai tidak tersedia.');
      }
    } catch (error: any) {
      console.error('Gagal submit ujian:', error);
      alert('Gagal submit ujian. Silakan coba lagi.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const soal = soalList[currentIndex];

  return (
    <UserLayout>
      <main className="p-6 bg-gray-100 min-h-screen">
        {loading ? (
          <p>Memuat soal...</p>
        ) : errorMsg ? (
          <p className="text-red-500">{errorMsg}</p>
        ) : nilai !== null ? (
          <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow text-center">
            <h2 className="text-2xl font-bold mb-4">Ujian Selesai</h2>
            <p className="text-lg mb-2">
              Nilai Anda: <span className="font-semibold">{nilai}</span>
            </p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => router.push('/user/hasil')}
            >
              Lihat Hasil Ujian
            </button>
          </div>
        ) : soalList.length === 0 ? (
          <p>Tidak ada soal tersedia.</p>
        ) : (
          <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Soal {currentIndex + 1} dari {soalList.length}
            </h2>
            <p className="mb-4 whitespace-pre-line">{soal.pertanyaan}</p>

            {soal.media_url && (
              <div className="mb-4">
                {soal.media_type === 'image' ? (
                  <img
                    src={soal.media_url}
                    alt="Media soal"
                    className="w-full max-h-64 object-contain rounded"
                  />
                ) : (
                  <video controls className="w-full rounded">
                    <source src={soal.media_url} type="video/mp4" />
                    Browser tidak mendukung video.
                  </video>
                )}
              </div>
            )}

            <div className="space-y-2">
              {soal.jawabans.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`jawaban-${option.id}`}
                    name={`jawaban-${soal.soal_id}`}
                    value={option.id}
                    checked={soal.jawaban_terpilih === option.id}
                    onChange={() => handlePilihJawaban(option.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`jawaban-${option.id}`}>{option.jawaban}</label>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Sebelumnya
              </button>

              {currentIndex === soalList.length - 1 ? (
                <button
                  className={`text-white px-4 py-2 rounded hover:bg-blue-700 ${
                    submitLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600'
                  }`}
                  onClick={handleSubmit}
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Mengirim...' : 'Selesai Ujian'}
                </button>
              ) : (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={handleNext}
                >
                  Selanjutnya
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </UserLayout>
  );
}
