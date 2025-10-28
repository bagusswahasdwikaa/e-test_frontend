'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { v4 as uuidv4 } from 'uuid';

type JawabanOptions = { A: string; B: string; C: string; D: string };

type SoalData = {
  id: number | null;
  localId: string;
  pertanyaan: string;
  mediaType: 'none' | 'image' | 'video';
  jawaban: JawabanOptions;
  jawabanBenar: keyof JawabanOptions;
  hasMedia: boolean;
};

type UjianData = {
  id_ujian: number;
  jumlah_soal: number;
};

type JawabanItem = {
  jawaban: string;
  is_correct: boolean | number | string;
};

type SoalApiItem = {
  id: number;
  pertanyaan: string;
  media_type: 'none' | 'image' | 'video';
  media_path: string | null;
  jawabans: {
    A?: JawabanItem;
    B?: JawabanItem;
    C?: JawabanItem;
    D?: JawabanItem;
  };
};

export default function EditSoalPage() {
  const router = useRouter();
  const params = useSearchParams();
  const ujianId = params.get('ujian_id');

  const [soals, setSoals] = useState<SoalData[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [removeFlags, setRemoveFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ujian, setUjian] = useState<UjianData | null>(null);

  // Auto-resize textarea
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    // Auto-resize semua textarea saat soals berubah
    Object.values(textareaRefs.current).forEach(autoResizeTextarea);
  }, [soals]);

  useEffect(() => {
    if (!ujianId) {
      router.push('/admin/daftarUjian');
      return;
    }

    const jumlahSoalParam = parseInt(params.get('jumlah_soal') || '', 10);

    const fetchUjian = async () => {
      try {
        const resUjian = await fetch(`http://127.0.0.1:8000/api/ujians/${ujianId}`);
        if (!resUjian.ok) throw new Error('Gagal fetch ujian');
        const ujianData: UjianData = await resUjian.json();

        const jumlahSoal = !isNaN(jumlahSoalParam) && jumlahSoalParam > 0
          ? jumlahSoalParam
          : ujianData.jumlah_soal;

        setUjian({ ...ujianData, jumlah_soal: jumlahSoal });
        return { ...ujianData, jumlah_soal: jumlahSoal };
      } catch (error) {
        console.error(error);
        alert('Gagal memuat data ujian.');
        router.push('/admin/daftarUjian');
        return null;
      }
    };

    const fetchSoal = async (jumlahSoal: number) => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/ujians/${ujianId}/soals`);
        if (!res.ok) throw new Error('Gagal fetch soal');
        const json = await res.json();
        const arr: SoalApiItem[] = Array.isArray(json.data) ? json.data : [];

        const soalList: SoalData[] = arr.map((item) => {
          const jaw = item.jawabans || {};
          const jawOps: JawabanOptions = {
            A: jaw.A?.jawaban || '',
            B: jaw.B?.jawaban || '',
            C: jaw.C?.jawaban || '',
            D: jaw.D?.jawaban || '',
          };

          const correctAnswerKey =
            (['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).find(
              (k) => jaw[k]?.is_correct === true || jaw[k]?.is_correct === 1 || jaw[k]?.is_correct === '1'
            ) || 'A';

          const localId = uuidv4();

          return {
            id: item.id,
            localId,
            pertanyaan: item.pertanyaan,
            mediaType: item.media_type,
            jawaban: jawOps,
            jawabanBenar: correctAnswerKey,
            hasMedia: !!item.media_path,
          };
        });

        if (jumlahSoal > soalList.length) {
          const kurang = jumlahSoal - soalList.length;
          for (let i = 0; i < kurang; i++) {
            soalList.push({
              id: null,
              localId: uuidv4(),
              pertanyaan: '',
              mediaType: 'none',
              jawaban: { A: '', B: '', C: '', D: '' },
              jawabanBenar: 'A',
              hasMedia: false,
            });
          }
        }

        const newPreviews: Record<string, string | null> = {};
        soalList.forEach((s, i) => {
          const mediaPath = arr[i]?.media_path;
          newPreviews[s.localId] = mediaPath
            ? `http://127.0.0.1:8000/storage/${mediaPath}`
            : null;
        });

        setSoals(soalList);
        setPreviews(newPreviews);
      } catch (error) {
        console.error(error);
        alert('Gagal memuat soal.');
        router.push('/admin/daftarUjian');
      } finally {
        setLoading(false);
      }
    };

    (async () => {
      const ujianData = await fetchUjian();
      if (ujianData) {
        await fetchSoal(ujianData.jumlah_soal);
      }
    })();
  }, [ujianId, router, params]);

  const onChangeSoal = (
    localId: string,
    field: keyof Omit<SoalData, 'id' | 'jawaban' | 'localId'> | 'jawabanBenar',
    val: any
  ) => {
    setSoals(prev =>
      prev.map(s =>
        s.localId === localId ? { ...s, [field]: val } : s
      )
    );
  };

  const onChangeJawaban = (localId: string, k: keyof JawabanOptions, val: string) => {
    setSoals(prev =>
      prev.map(s =>
        s.localId === localId ? { ...s, jawaban: { ...s.jawaban, [k]: val } } : s
      )
    );
  };

  const onMediaChange = (localId: string, id: number | null, file: File | null) => {
    if (id === null) {
      alert('Media hanya bisa di-upload untuk soal yang sudah tersimpan.');
      return;
    }

    setMediaFiles(prev => ({ ...prev, [localId]: file }));
    setPreviews(prev => ({
      ...prev,
      [localId]: file ? URL.createObjectURL(file) : prev[localId] || null,
    }));

    if (file) {
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'none';
      onChangeSoal(localId, 'mediaType', type);
    }
  };

  const onRemoveMedia = (localId: string) => {
    if (!confirm('Hapus media ini?')) return;
    setRemoveFlags(prev => ({ ...prev, [localId]: true }));
    setPreviews(prev => ({ ...prev, [localId]: null }));
  };

  const submitAll = async () => {
    setSaving(true);

    try {
      const requests = soals.map(async (s) => {
        if (!s.pertanyaan.trim()) return null;

        const form = new FormData();
        form.append('pertanyaan', s.pertanyaan);
        form.append('media_type', s.mediaType);

        if (removeFlags[s.localId]) form.append('remove_media', 'true');

        if (s.id && mediaFiles[s.localId]) {
          form.append('media_file', mediaFiles[s.localId]!);
        }

        (['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).forEach((k, i) => {
          form.append(`jawabans[${i}][jawaban]`, s.jawaban[k]);
          form.append(`jawabans[${i}][is_correct]`, k === s.jawabanBenar ? '1' : '0');
        });

        let url = '';
        let method: 'POST' | 'PUT' = 'POST';

        if (s.id) {
          url = `http://127.0.0.1:8000/api/soals/${s.id}`;
          method = 'POST';
          form.append('_method', 'PUT');
        } else {
          url = `http://127.0.0.1:8000/api/soals`;
          form.append('ujian_id', ujianId ?? '');
          method = 'POST';
        }

        const res = await fetch(url, {
          method,
          body: form,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(JSON.stringify(errData));
        }

        return res.json();
      });

      await Promise.all(requests);

      alert('Semua soal berhasil diperbarui');
      router.push('/admin/daftarUjian');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan soal.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

  if (!soals.length) {
    return (
      <AdminLayout>
        <p className="p-6 text-center text-gray-600">Belum ada soal.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto bg-white p-6 mt-6 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Edit Soal Ujian</h1>
          <p className="text-sm text-gray-600 mt-1">
            Jumlah Soal: <span className="font-semibold">{soals.length}</span>
          </p>
        </div>

        {soals.map((s, idx) => (
          <div key={s.localId} className="border border-gray-300 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-semibold text-blue-900">Soal {idx + 1}</h2>
            </div>

            {/* Pertanyaan - Auto-resize Textarea */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Pertanyaan <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={(el) => {
                  textareaRefs.current[s.localId] = el;
                  autoResizeTextarea(el);
                }}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden transition-all"
                value={s.pertanyaan}
                onChange={e => {
                  onChangeSoal(s.localId, 'pertanyaan', e.target.value);
                  autoResizeTextarea(e.target);
                }}
                placeholder="Masukkan pertanyaan soal di sini..."
                rows={3}
                style={{ minHeight: '80px' }}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {s.pertanyaan.length} karakter
              </p>
            </div>

            {/* Upload Media */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block font-medium text-gray-700 mb-2">
                Upload Media (Opsional)
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                disabled={s.id === null}
                onChange={(e) => onMediaChange(s.localId, s.id, e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {s.id === null && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Simpan soal terlebih dahulu untuk mengupload media
                </p>
              )}

              {/* Preview Media */}
              {previews[s.localId] && !removeFlags[s.localId] && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-300">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview Media:</p>
                  {s.mediaType === 'image' ? (
                    <img
                      src={previews[s.localId]!}
                      className="max-w-full max-h-64 rounded-lg border border-gray-200 shadow-sm"
                      alt="Preview media soal"
                    />
                  ) : (
                    <video
                      src={previews[s.localId]!}
                      controls
                      className="max-w-full max-h-64 rounded-lg border border-gray-200 shadow-sm"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveMedia(s.localId)}
                    className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                  >
                    🗑️ Hapus Media
                  </button>
                </div>
              )}
            </div>

            {/* Pilihan Jawaban */}
            <div>
              <label className="block font-medium text-gray-700 mb-3">
                Pilihan Jawaban <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map(k => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-8 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {k}
                    </span>
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={s.jawaban[k]}
                      onChange={e => onChangeJawaban(s.localId, k, e.target.value)}
                      placeholder={`Jawaban ${k}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Jawaban Benar */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <label className="block font-medium text-gray-700 mb-2">
                Kunci Jawaban <span className="text-red-500">*</span>
              </label>
              <select
                value={s.jawabanBenar}
                onChange={e => onChangeSoal(s.localId, 'jawabanBenar', e.target.value as keyof JawabanOptions)}
                className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer bg-white"
              >
                {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map(k => (
                  <option key={k} value={k}>Opsi {k}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <button
            onClick={() => router.push(`/admin/daftarUjian/editUjian?ujian_id=${ujianId}`)}
            className="bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
            disabled={saving}
          >
            Kembali
          </button>
          <button
            onClick={submitAll}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Menyimpan...
              </>
            ) : (
              'Simpan Semua'
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}