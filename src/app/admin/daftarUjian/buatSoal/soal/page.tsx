'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  mediaFile: File | null;
  mediaPreviewUrl: string | null;
  mediaType: 'none' | 'image';
  jawaban: JawabanOptions;
  jawabanBenar: keyof JawabanOptions;
};

export default function SoalBulkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const jumlahSoalParam = searchParams.get('jumlah_soal');
  const jumlahSoal = jumlahSoalParam ? parseInt(jumlahSoalParam, 10) : 0;

  const [soals, setSoals] = useState<SingleSoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ujianData, setUjianData] = useState<any>(null);

  // Auto-resize textarea
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    Object.values(textareaRefs.current).forEach(autoResizeTextarea);
  }, [soals]);

  // Inisialisasi: ambil data ujian dari sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('ujianData');
    
    if (!storedData || jumlahSoal <= 0) {
      alert('Data ujian tidak ditemukan. Silakan isi form ujian terlebih dahulu.');
      router.push('/admin/daftarUjian/buatSoal');
      return;
    }

    const parsedData = JSON.parse(storedData);
    setUjianData(parsedData);

    // Cek apakah ada soal yang sudah tersimpan di sessionStorage
    const storedSoals = sessionStorage.getItem('soalsData');
    
    if (storedSoals) {
      // Restore soal yang sudah diisi sebelumnya
      const parsedSoals = JSON.parse(storedSoals);
      setSoals(parsedSoals);
    } else {
      // Inisialisasi soal kosong
      const initialSoals: SingleSoal[] = Array.from({ length: jumlahSoal }, () => ({
        pertanyaan: '',
        mediaFile: null,
        mediaPreviewUrl: null,
        mediaType: 'none',
        jawaban: { A: '', B: '', C: '', D: '' },
        jawabanBenar: 'A',
      }));
      setSoals(initialSoals);
    }
  }, [jumlahSoal, router]);

  // Simpan soal ke sessionStorage setiap kali ada perubahan
  useEffect(() => {
    if (soals.length > 0) {
      // Simpan soals tanpa file (karena File object tidak bisa di-stringify)
      const soalsToStore = soals.map(s => ({
        ...s,
        mediaFile: null, // File akan hilang, tapi preview URL tetap ada
      }));
      sessionStorage.setItem('soalsData', JSON.stringify(soalsToStore));
    }
  }, [soals]);

  const handlePertanyaanChange = (index: number, value: string) => {
    const updated = [...soals];
    updated[index].pertanyaan = value;
    setSoals(updated);
  };

  const handleMediaChange = (index: number, file: File | null) => {
    const updated = [...soals];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar (PNG, JPG, JPEG) yang diperbolehkan.');
        return;
      }

      updated[index].mediaFile = file;
      updated[index].mediaPreviewUrl = URL.createObjectURL(file);
      updated[index].mediaType = 'image';
    } else {
      updated[index].mediaFile = null;
      updated[index].mediaPreviewUrl = null;
      updated[index].mediaType = 'none';
    }
    setSoals(updated);
  };

  const handleRemoveMedia = (index: number) => {
    const updated = [...soals];
    if (updated[index].mediaPreviewUrl) {
      URL.revokeObjectURL(updated[index].mediaPreviewUrl!);
    }
    updated[index].mediaFile = null;
    updated[index].mediaPreviewUrl = null;
    updated[index].mediaType = 'none';
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

  const formatDateTime = (value: string) => {
    return value ? value.replace('T', ' ') + ':00' : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ujianData) {
      alert('Data ujian tidak ditemukan.');
      return;
    }

    // Validasi isi soal
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

    setIsSubmitting(true);

    try {
      // Step 1: Buat ujian terlebih dahulu
      const ujianPayload = {
        nama_ujian: ujianData.nama_ujian,
        kode_soal: ujianData.kode_soal,
        jumlah_soal: ujianData.jumlah_soal,
        durasi: ujianData.durasi,
        tanggal_mulai: formatDateTime(ujianData.tanggal_mulai),
        tanggal_akhir: formatDateTime(ujianData.tanggal_akhir),
        jenis_ujian: ujianData.jenis_ujian,
        ...(ujianData.standar_minimal_nilai && {
          standar_minimal_nilai: ujianData.standar_minimal_nilai
        })
      };

      const ujianResponse = await fetch('http://localhost:8000/api/ujians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(ujianPayload),
      });

      if (!ujianResponse.ok) {
        const error = await ujianResponse.json();
        console.error('Gagal menyimpan ujian:', error);
        alert('Gagal menyimpan ujian: ' + (error.message || 'Terjadi kesalahan.'));
        return;
      }

      const ujianResult = await ujianResponse.json();
      const ujianId = ujianResult.data.id_ujian;

      // Step 2: Simpan semua soal dengan FormData
      const formData = new FormData();
      formData.append('ujian_id', ujianId.toString());

      soals.forEach((s, idx) => {
        formData.append(`soals[${idx}][pertanyaan]`, s.pertanyaan);
        formData.append(`soals[${idx}][media_type]`, s.mediaType);
        if (s.mediaFile) {
          formData.append(`soals[${idx}][media_file]`, s.mediaFile);
        }
        ['A', 'B', 'C', 'D'].forEach((key) => {
          formData.append(`soals[${idx}][jawabans][${key}][jawaban]`, s.jawaban[key as keyof JawabanOptions]);
          formData.append(
            `soals[${idx}][jawabans][${key}][is_correct]`,
            (key === s.jawabanBenar ? '1' : '0')
          );
        });
      });

      const soalResponse = await fetch('http://localhost:8000/api/soals/bulk', {
        method: 'POST',
        body: formData,
      });

      if (!soalResponse.ok) {
        const err = await soalResponse.json();
        console.error('Gagal menyimpan soal:', err);
        alert('Gagal menyimpan soal. Periksa console.');
        return;
      }

      // Hapus data dari sessionStorage setelah berhasil
      sessionStorage.removeItem('ujianData');
      sessionStorage.removeItem('soalsData');

      setShowModal(true);
    } catch (error) {
      console.error('Error saat fetch:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Kembali ke form sebelumnya tanpa menghapus data
    router.push('/admin/daftarUjian/buatSoal');
  };

  if (soals.length === 0) {
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

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Buat Soal Ujian</h1>
          <p className="text-sm text-gray-600 mt-1">
            Jumlah Soal: <span className="font-semibold">{jumlahSoal}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {soals.map((s, idx) => (
            <div key={idx} className="border border-gray-300 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-lg font-semibold text-blue-900">Soal {idx + 1}</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {s.pertanyaan.length} karakter
                </span>
              </div>

              {/* Input Pertanyaan - Auto-resize Textarea */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={(el) => {
                    textareaRefs.current[idx] = el;
                    autoResizeTextarea(el);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden transition-all"
                  placeholder="Tuliskan pertanyaan soal di sini..."
                  value={s.pertanyaan}
                  onChange={(e) => {
                    handlePertanyaanChange(idx, e.target.value);
                    autoResizeTextarea(e.target);
                  }}
                  rows={3}
                  style={{ minHeight: '80px' }}
                  required
                />
              </div>

              {/* Upload Gambar */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block font-medium text-gray-700 mb-2">
                  Upload Gambar (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleMediaChange(idx, e.target.files ? e.target.files[0] : null)
                  }
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Format yang didukung: PNG, JPG, JPEG
                </p>

                {/* Preview Gambar */}
                {s.mediaPreviewUrl && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-300">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview Gambar:</p>
                    <img
                      src={s.mediaPreviewUrl}
                      alt={`Preview soal ${idx + 1}`}
                      className="max-w-full max-h-64 rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                      🗑️ Hapus Gambar
                    </button>
                  </div>
                )}
              </div>

              {/* Jawaban Pilihan */}
              <div>
                <label className="block font-medium text-gray-700 mb-3">
                  Pilihan Jawaban <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map((k) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-8 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                        {k}
                      </span>
                      <input
                        type="text"
                        name={k}
                        value={s.jawaban[k]}
                        onChange={(e) => handleJawabanChange(idx, k, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Jawaban ${k}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pilih Jawaban Benar */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block font-medium text-gray-700 mb-2">
                  Kunci Jawaban <span className="text-red-500">*</span>
                </label>
                <select
                  value={s.jawabanBenar}
                  onChange={(e) =>
                    handleJawabanBenarChange(idx, e.target.value as keyof JawabanOptions)
                  }
                  className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer bg-white"
                  required
                >
                  {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map((k) => (
                    <option key={k} value={k}>
                      Opsi {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-600 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Menyimpan...
                </>
              ) : (
                'Simpan Semua Data'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal konfirmasi sukses */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Berhasil!</h2>
              <p className="text-gray-600">Ujian dan soal berhasil disimpan.</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => router.push('/admin/daftarUjian')}
                className="bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-400 transition cursor-pointer order-2 sm:order-1"
              >
                Kembali ke Daftar Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}