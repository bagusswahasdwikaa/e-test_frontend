'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [timer, setTimer] = useState<number>(0); // detik tersisa

  const router = useRouter();
  const timerActiveRef = useRef(true); // supaya handleSubmit dari interval tidak ganda

  // Fungsi submit ujian, dipakai manual dan auto-submit waktu habis
  const handleSubmit = async () => {
    if (!ujianId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Cegah submit ganda
    if (submitLoading) return;
    
    timerActiveRef.current = false; // hentikan timer
    setSubmitLoading(true);

    const jawabanObj: Record<string, number> = {};
    soalList.forEach((s) => {
      if (typeof s.jawaban_terpilih === 'number') {
        jawabanObj[s.soal_id.toString()] = s.jawaban_terpilih;
      }
    });

    if (Object.keys(jawabanObj).length === 0) {
      alert('Anda belum memilih jawaban apapun.');
      setSubmitLoading(false);
      return;
    }

    // Kalau ini auto submit (waktu habis), lewati konfirmasi
    // Kalau manual, minta konfirmasi dulu
    // Kita bedakan lewat submitLoading yang sudah dicegah submit ganda di atas

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
        localStorage.removeItem('ujian_start_time');
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

  // Load soal & timer
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
        // Ambil durasi ujian dari API ujian detail
        const ujianRes = await axios.get(`/user/ujians/${parsedUjianId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const durasiMenit = ujianRes.data?.data?.durasi ?? 0;

        // Ambil waktu mulai ujian dari localStorage
        const ujianStartTimeStr = localStorage.getItem('ujian_start_time');
        let ujianStartTime = ujianStartTimeStr ? parseInt(ujianStartTimeStr) : null;

        if (!ujianStartTime) {
          // Kalau belum ada, set waktu mulai sekarang dan simpan
          ujianStartTime = Date.now();
          localStorage.setItem('ujian_start_time', ujianStartTime.toString());
        }

        // Hitung sisa waktu detik
        const durasiDetik = durasiMenit * 60;
        const elapsedDetik = Math.floor((Date.now() - ujianStartTime) / 1000);
        let sisaDetik = durasiDetik - elapsedDetik;

        if (sisaDetik <= 0) {
          // Waktu habis, langsung submit dan return
          alert('Waktu ujian sudah habis.');
          await handleSubmit();
          setLoading(false);
          return;
        }

        setTimer(sisaDetik);

        // Mulai ujian di server
        await axios.post(
          `/user/ujians/${parsedUjianId}/kerjakan`,
          { kode_soal },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Ambil soal
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

  // Timer countdown effect
  useEffect(() => {
    if (timer <= 0) return;
    if (!timerActiveRef.current) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (timerActiveRef.current) {
            alert('Waktu ujian habis, ujian akan disubmit otomatis.');
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Soal {currentIndex + 1} dari {soalList.length}
              </h2>
              <div className="text-xl font-mono text-red-600">{formatTime(timer)}</div>
            </div>

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
