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
  jawaban_terpilih?: number | string | null;
}

export default function SoalPage() {
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ujianId, setUjianId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nilai, setNilai] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [timer, setTimer] = useState<number>(0);
  const [allowRetry, setAllowRetry] = useState(false); // ✅ tambahkan state baru
  const [action, setAction] = useState<string | null>(null); // ✅ tambahkan state baru

  const router = useRouter();
  const timerActiveRef = useRef(true);

  // === Simpan jawaban sementara ke backend ===
  const saveJawaban = async (soalId: number, jawabanId: number | string) => {
    if (!ujianId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(
        `/user/ujians/${ujianId}/jawaban`,
        { jawaban: { [soalId]: jawabanId } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Gagal simpan jawaban sementara:', err);
    }
  };

  // === Submit ujian ===
  const handleSubmit = async (auto = false) => {
    if (!ujianId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('Sesi anda sudah habis. Silakan login ulang.');
      router.push('/login');
      return;
    }

    if (submitLoading) return;

    timerActiveRef.current = false;
    setSubmitLoading(true);

    const jawabanObj: Record<string, number | string> = {};
    soalList.forEach((s) => {
      if (s.jawaban_terpilih !== null && s.jawaban_terpilih !== undefined) {
        jawabanObj[s.soal_id.toString()] = s.jawaban_terpilih;
      }
    });

    try {
      const res = await axios.post(
        `/user/ujians/${ujianId}/submit`,
        { jawaban: jawabanObj },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setNilai(res.data.nilai);
        setAllowRetry(res.data.allow_retry ?? false); // ✅ ambil dari backend
        setAction(res.data.action ?? null); // ✅ ambil dari backend

        localStorage.removeItem('ujian_id');
        localStorage.removeItem('kode_soal');
        localStorage.removeItem('started_at');
        localStorage.removeItem('end_time');
      } else {
        setErrorMsg(res.data?.message || 'Submit gagal.');
      }
    } catch (error: any) {
      console.error('Gagal submit ujian:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrorMsg('Sesi anda sudah habis. Ujian otomatis diselesaikan.');
        setNilai(0);
      } else {
        setErrorMsg(
          error.response?.data?.message || 'Gagal submit ujian. Ujian dianggap selesai.'
        );
        setNilai(0);
      }
      localStorage.removeItem('ujian_id');
      localStorage.removeItem('kode_soal');
      localStorage.removeItem('started_at');
      localStorage.removeItem('end_time');
    } finally {
      setSubmitLoading(false);
    }
  };

  // === Ulang Ujian ===
  const handleUlangUjian = () => {
    localStorage.removeItem('ujian_id');
    localStorage.removeItem('kode_soal');
    localStorage.removeItem('started_at');
    localStorage.removeItem('end_time');
    router.push('/user/dashboard'); // arahkan kembali ke dashboard
  };

  // === Ambil soal & timer dari backend ===
  useEffect(() => {
    async function loadSoal() {
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
        let startedAt: string | null = localStorage.getItem('started_at');
        let endTime: string | null = localStorage.getItem('end_time');

        if (!startedAt || !endTime) {
          const startRes = await axios.post(
            `/user/ujians/${parsedUjianId}/kerjakan`,
            { kode_soal },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!startRes.data.success) {
            setErrorMsg(startRes.data.message || 'Gagal mulai ujian.');
            setLoading(false);
            return;
          }

          startedAt = startRes.data.started_at as string;
          endTime = startRes.data.end_time as string;

          localStorage.setItem('started_at', startedAt);
          localStorage.setItem('end_time', endTime);
        }

        if (!endTime) {
          setErrorMsg('Data waktu ujian tidak valid.');
          setLoading(false);
          return;
        }

        const end = new Date(endTime).getTime();
        const now = Date.now();
        const sisa = Math.floor((end - now) / 1000);

        if (sisa <= 0) {
          await handleSubmit(true);
          setLoading(false);
          return;
        }

        setTimer(sisa);

        const soalRes = await axios.get(`/user/ujians/${parsedUjianId}/soal`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!soalRes.data?.success) {
          setErrorMsg(soalRes.data.message || 'Gagal ambil soal.');
          setLoading(false);
          return;
        }

        const rawSoal = soalRes.data.data ?? [];
        setSoalList(
          rawSoal.map((item: any) => ({
            soal_id: item.soal_id,
            pertanyaan: item.pertanyaan,
            media_url: item.media_url,
            media_type: item.media_type,
            jawabans: item.jawabans,
            jawaban_terpilih: item.jawaban_user ?? null, // ambil jawaban lama dari backend
          }))
        );
      } catch (error: any) {
        console.error('Error mengambil soal:', error);
        setErrorMsg(error.response?.data?.message || 'Gagal memuat soal.');
      } finally {
        setLoading(false);
      }
    }

    loadSoal();
  }, [router]);

  // === Timer countdown ===
  useEffect(() => {
    if (timer <= 0 || !timerActiveRef.current) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (timerActiveRef.current) {
            alert('Waktu ujian habis, ujian akan disubmit otomatis.');
            handleSubmit(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // === Navigasi soal & simpan jawaban ===
  const handlePilihJawaban = (jawabanId: number | string) => {
    const soalSekarang = soalList[currentIndex];
    setSoalList((prev) =>
      prev.map((s, idx) =>
        idx === currentIndex ? { ...s, jawaban_terpilih: jawabanId } : s
      )
    );

    if (soalSekarang) {
      saveJawaban(soalSekarang.soal_id, jawabanId);
    }
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
  const progress = soalList.length > 0 ? ((currentIndex + 1) / soalList.length) * 100 : 0;
  const answeredCount = soalList.filter(
    (s) => s.jawaban_terpilih !== null && s.jawaban_terpilih !== undefined
  ).length;

  const getTimerColor = () => {
    if (timer > 600) return 'text-green-600';
    if (timer > 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <UserLayout>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Memuat soal ujian...</p>
                <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full border-l-4 border-red-500">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
                <p className="text-red-600 mb-4">{errorMsg}</p>
                <button
                  onClick={() => router.push('/user/dashboard')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          ) : nilai !== null ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-lg w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ujian Selesai!</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                  <p className="text-lg text-gray-700 mb-2">Nilai Anda:</p>
                  <p className="text-4xl font-bold text-blue-600">{nilai ?? 'Belum tersedia'}</p>
                </div>

                {allowRetry ? (
                  <>
                    <p className="text-red-600 font-medium mb-6">
                      Nilai Anda belum memenuhi standar minimal. Silakan ulang ujian.
                    </p>
                    <button
                      onClick={handleUlangUjian}
                      className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Ulang Ujian
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6">
                      Selamat! Anda telah menyelesaikan ujian dengan baik.
                    </p>
                    <button
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={() => router.push('/user/hasil')}
                    >
                      Lihat Detail Hasil Ujian
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header with Timer and Progress */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Soal {currentIndex + 1} dari {soalList.length}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {answeredCount} dari {soalList.length} soal terjawab
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <div className={`text-3xl font-mono font-bold ${getTimerColor()}`}>
                      {formatTime(timer)}
                    </div>
                    <p className="text-sm text-gray-500">Waktu tersisa</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-1">
                      {currentIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line">
                        {soal.pertanyaan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Media */}
                {soal.media_url && (
                  <div className="mb-8">
                    <div className="bg-gray-50 rounded-xl p-4">
                      {soal.media_type === 'image' ? (
                        <img
                          src={soal.media_url}
                          alt="Media soal"
                          className="w-full max-h-80 object-contain rounded-lg mx-auto"
                        />
                      ) : (
                        <video controls className="w-full max-h-80 rounded-lg">
                          <source src={soal.media_url} type="video/mp4" />
                          Browser tidak mendukung video.
                        </video>
                      )}
                    </div>
                  </div>
                )}

                {/* Answer Options */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih jawaban:</h3>
                  {soal.jawabans.map((option, index) => (
                    <div
                      key={option.id}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        soal.jawaban_terpilih === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                      onClick={() => handlePilihJawaban(option.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          soal.jawaban_terpilih === option.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {soal.jawaban_terpilih === option.id && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            soal.jawaban_terpilih === option.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className={`text-base ${
                            soal.jawaban_terpilih === option.id
                              ? 'text-blue-900 font-medium'
                              : 'text-gray-700'
                          }`}>
                            {option.jawaban}
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        id={`jawaban-${option.id}`}
                        name={`jawaban-${soal.soal_id}`}
                        value={option.id}
                        checked={soal.jawaban_terpilih === option.id}
                        onChange={() => handlePilihJawaban(option.id)}
                        className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center">
                  <button
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Sebelumnya
                  </button>

                  <div className="flex items-center gap-2">
                    {soalList.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 ${
                          index === currentIndex
                            ? 'bg-blue-500 text-white shadow-lg'
                            : soalList[index].jawaban_terpilih !== null && soalList[index].jawaban_terpilih !== undefined
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {currentIndex === soalList.length - 1 ? (
                    <button
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform hover:scale-105 ${
                        submitLoading
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
                      }`}
                      onClick={() => handleSubmit(false)}
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Selesai Ujian
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      onClick={handleNext}
                    >
                      Selanjutnya
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </UserLayout>
  );
}
