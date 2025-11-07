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
  media_type: 'none' | 'image' | 'video';
  media_path?: string | null;
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
  const [allowRetry, setAllowRetry] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isExamActive, setIsExamActive] = useState(false);

  const router = useRouter();
  const timerActiveRef = useRef(true);

  // Base URL untuk media - sesuaikan dengan backend Laravel Anda
  const MEDIA_BASE_URL = 'http://localhost:8000';

  // Function untuk membentuk URL lengkap dari media_path
  const getMediaUrl = (mediaPath: string | null | undefined): string | null => {
    if (!mediaPath) return null;
    
    // Jika sudah full URL (dimulai dengan http/https), return as-is
    if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
      return mediaPath;
    }
    
    // Backend mengirim path seperti: "soal_media/filename.png"
    // File sebenarnya ada di: "public/storage/soal_media/filename.png"
    // URL yang benar: "http://localhost:8000/storage/soal_media/filename.png"
    
    let cleanPath = mediaPath;
    
    // Hapus 'public/' dari awal path jika ada
    if (cleanPath.startsWith('public/')) {
      cleanPath = cleanPath.replace(/^public\//, '');
    }
    
    // Jika path sudah dimulai dengan 'storage/', langsung gunakan
    if (cleanPath.startsWith('storage/')) {
      return `${MEDIA_BASE_URL}/${cleanPath}`;
    }
    
    // Jika path dimulai dengan 'soal_media/', tambahkan 'storage/' di depannya
    if (cleanPath.startsWith('soal_media/')) {
      return `${MEDIA_BASE_URL}/storage/${cleanPath}`;
    }
    
    // Jika path dimulai dengan /, langsung gabungkan dengan base URL
    if (cleanPath.startsWith('/')) {
      return `${MEDIA_BASE_URL}${cleanPath}`;
    }
    
    // Default: anggap path relatif, tambahkan storage/ di depan
    return `${MEDIA_BASE_URL}/storage/${cleanPath}`;
  };

  // === Prevent navigation during exam ===
  useEffect(() => {
    if (!isExamActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian sedang berlangsung. Yakin ingin meninggalkan halaman?';
      return e.returnValue;
    };

    const handlePopState = (e: PopStateEvent) => {
      if (window.confirm('Ujian sedang berlangsung. Yakin ingin meninggalkan halaman?')) {
        setIsExamActive(false);
        return;
      }
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push initial state to prevent back button
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isExamActive]);

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
    
    // Tampilkan konfirmasi jika bukan auto-submit
    if (!auto) {
      setShowConfirmModal(true);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('Sesi anda sudah habis. Silakan login ulang.');
      setIsExamActive(false);
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
        setAllowRetry(res.data.allow_retry ?? false);
        setAction(res.data.action ?? null);

        localStorage.removeItem('ujian_id');
        localStorage.removeItem('kode_soal');
        localStorage.removeItem('started_at');
        localStorage.removeItem('end_time');
        setIsExamActive(false);
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
      setIsExamActive(false);
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
    setIsExamActive(false);
    router.push('/user/dashboard');
  };

  // === Konfirmasi submit dari modal ===
  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    await handleSubmit(true);
  };

  // === Ambil soal & timer dari backend ===
  useEffect(() => {
    async function loadSoal() {
      const token = localStorage.getItem('token');
      const ujian_id = localStorage.getItem('ujian_id');
      const kode_soal = localStorage.getItem('kode_soal');

      if (!token || !ujian_id || !kode_soal) {
        setShowValidationModal(true);
        setLoading(false);
        return;
      }

      const parsedUjianId = parseInt(ujian_id);
      if (isNaN(parsedUjianId)) {
        setErrorMsg('ID ujian tidak valid.');
        setLoading(false);
        return;
      }

      setUjianId(parsedUjianId);
      setIsExamActive(true);

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
        
        if (rawSoal.length === 0) {
          setErrorMsg('Tidak ada soal yang tersedia.');
          setLoading(false);
          return;
        }

        setSoalList(
          rawSoal.map((item: any) => ({
            soal_id: item.soal_id,
            pertanyaan: item.pertanyaan,
            media_path: item.media_path, // Simpan media_path mentah dari backend
            media_type: item.media_type || 'none',
            jawabans: item.jawabans || [],
            jawaban_terpilih: item.jawaban_user ?? null,
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
      <main className="min-h-screen p-4">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Anda gagal!</h3>
                <p className="text-red-600 mb-4">{errorMsg}</p>
                <button
                  onClick={() => router.push('/user/dashboard')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          ) : nilai !== null ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-lg w-full">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  (action === 'retry' || allowRetry) ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <svg className={`w-10 h-10 ${(action === 'retry' || allowRetry) ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {(action === 'retry' || allowRetry) ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ujian Selesai!</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                  <p className="text-lg text-gray-700 mb-2">Nilai Anda:</p>
                  <p className="text-4xl font-bold text-blue-600">{nilai ?? 'Belum tersedia'}</p>
                </div>

                {action === 'retry' || allowRetry ? (
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
                ) : action === 'redirect_dashboard' ? (
                  <>
                    <p className="text-gray-600 mb-6">
                      Anda akan diarahkan kembali ke dashboard.
                    </p>
                    <button
                      className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={() => router.push('/user/dashboard')}
                    >
                      Kembali ke Dashboard
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
          ) : soal ? (
            <div className="space-y-6">
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

              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Render media jika ada - Menggunakan getMediaUrl untuk membentuk URL lengkap */}
                {soal.media_path && soal.media_type !== 'none' && (
                  <div className="mb-8">
                    <div className="bg-gray-50 rounded-xl p-4">
                      {soal.media_type === 'image' ? (
                        <div className="relative">
                          {/* Debug info - hapus setelah selesai debugging */}
                          <div className="mb-2 text-sm text-gray-600 bg-white p-2 rounded">
                            <div><strong>Perhatikan gambar berikut:</strong></div>
                          </div>
                          
                          <img
                            src={getMediaUrl(soal.media_path) || ''}
                            alt="Media soal"
                            className="w-full max-h-96 object-contain rounded-lg mx-auto"
                            onError={(e) => {
                              // Fallback jika gambar gagal dimuat
                              const target = e.target as HTMLImageElement;
                              const imgContainer = target.parentElement;
                              
                              const mediaPath = soal.media_path;
                              const fullUrl = getMediaUrl(soal.media_path);
                              
                              console.error('=== GAGAL MEMUAT GAMBAR ===');
                              console.error('Media Path:', mediaPath);
                              console.error('Full URL:', fullUrl);
                              console.error('Base URL:', MEDIA_BASE_URL);
                              console.error('Image src:', target.src);
                              console.error('==========================');
                              
                              // Tampilkan pesan error yang lebih informatif
                              if (imgContainer) {
                                imgContainer.innerHTML = `
                                  <div class="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                                    <svg class="w-16 h-16 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p class="text-red-600 font-medium mb-2">Gambar tidak dapat dimuat</p>
                                    <div class="text-left bg-white p-3 rounded text-xs space-y-1">
                                      <div><strong>Media Path:</strong> ${mediaPath || 'null'}</div>
                                      <div><strong>Full URL:</strong> ${fullUrl || 'null'}</div>
                                      <div><strong>Base URL:</strong> ${MEDIA_BASE_URL}</div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-3">Pastikan file ada di: public/storage/${mediaPath}</p>
                                  </div>
                                `;
                              }
                            }}
                            onLoad={() => {
                              console.log('✅ Gambar berhasil dimuat:', getMediaUrl(soal.media_path));
                            }}
                          />
                        </div>
                      ) : soal.media_type === 'video' ? (
                        <video controls className="w-full max-h-96 rounded-lg">
                          <source src={getMediaUrl(soal.media_path) || ''} type="video/mp4" />
                          Browser tidak mendukung video.
                        </video>
                      ) : null}
                    </div>
                  </div>
                )}

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

                  <div className="flex items-center gap-2 overflow-x-auto">
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
          ) : null}
        </div>

        {/* Modal Validation - Belum Masuk Ujian */}
        {showValidationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Akses Ditolak
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Anda belum memulai ujian atau sesi ujian tidak valid. Silakan mulai ujian dari dashboard terlebih dahulu.
                </p>

                <button
                  onClick={() => router.push('/user/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Submit */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Konfirmasi Submit
                </h3>
                
                <p className="text-gray-600 mb-2">
                  Apakah Anda yakin ingin mengakhiri ujian ini?
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{answeredCount}</span> dari{' '}
                    <span className="font-semibold">{soalList.length}</span> soal telah dijawab
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmSubmit}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Ya, Akhiri Ujian
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </UserLayout>
  );
}