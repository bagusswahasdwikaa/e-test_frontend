'use client';

import React, { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ujian, setUjian] = useState<UjianData | null>(null);

  // Fetch ujian terlebih dahulu, lalu fetch soal
  useEffect(() => {
    if (!ujianId) {
      router.push('/admin/daftarUjian');
      return;
    }

    const fetchUjian = async () => {
      try {
        const resUjian = await fetch(`http://127.0.0.1:8000/api/ujians/${ujianId}`);
        if (!resUjian.ok) throw new Error('Gagal fetch ujian');
        const ujianData: UjianData = await resUjian.json();
        setUjian(ujianData);
        return ujianData;
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

        let soalList: SoalData[] = arr.map((item: SoalApiItem) => {
          const jaw = item.jawabans || {};
          const jawOps: JawabanOptions = {
            A: jaw.A?.jawaban || '',
            B: jaw.B?.jawaban || '',
            C: jaw.C?.jawaban || '',
            D: jaw.D?.jawaban || '',
          };

          const correctAnswerKey = (['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).find(k => {
            const val = jaw[k]?.is_correct;
            return val === true || val === '1' || val === 1 || val === 'true';
          }) || 'A';

          return {
            id: item.id,
            localId: uuidv4(),
            pertanyaan: item.pertanyaan,
            mediaType: item.media_type,
            jawaban: jawOps,
            jawabanBenar: correctAnswerKey,
          };
        });

        // Tambahkan soal kosong jika kurang dari jumlah ujian
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
            });
          }
        } else if (jumlahSoal < soalList.length) {
          soalList.splice(jumlahSoal);
        }

        setSoals(soalList);

        // Set preview media soal berdasarkan soal yg ada
        const newPreviews: Record<string, string | null> = {};
        arr.forEach(item => {
          newPreviews[item.id] = item.media_path ? `http://127.0.0.1:8000/storage/${item.media_path}` : null;
        });
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

  }, [ujianId, router]);

  // Update field soal by localId
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
      [localId]: file ? URL.createObjectURL(file) : null,
    }));

    if (file) {
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'none';
      onChangeSoal(localId, 'mediaType', type);
    } else {
      onChangeSoal(localId, 'mediaType', 'none');
    }
  };

  const submitAll = async () => {
    setSaving(true);
    try {
      for (const s of soals) {
        if (!s.pertanyaan.trim()) continue;

        const form = new FormData();
        form.append('pertanyaan', s.pertanyaan);
        form.append('media_type', s.mediaType);

        if (s.id) {
          form.append('_method', 'PUT');
        }

        if (s.id && mediaFiles[s.localId]) {
          form.append('media_file', mediaFiles[s.localId]!);
        }

        (['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).forEach((k, i) => {
          form.append(`jawabans[${i}][jawaban]`, s.jawaban[k]);
          form.append(`jawabans[${i}][is_correct]`, k === s.jawabanBenar ? '1' : '0');
        });

        let url = '';
        let method = 'POST';

        if (s.id) {
          url = `http://127.0.0.1:8000/api/soals/${s.id}`;
        } else {
          url = `http://127.0.0.1:8000/api/soals`;
          form.append('ujian_id', ujianId ?? '');
        }

        const res = await fetch(url, {
          method,
          body: form,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Error response:', errData);
          alert('Gagal memperbarui soal');
          setSaving(false);
          return;
        }
      }

      alert('Semua soal berhasil diperbarui');
      router.push('/admin/daftarUjian');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Memuat soal...</p>;
  if (!soals.length) return <p className="p-6 text-center">Belum ada soal.</p>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 mt-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Edit Soal Ujian</h1>
        {soals.map((s, idx) => (
          <div key={s.localId} className="border p-4 rounded bg-gray-50 space-y-4">
            <h2 className="font-medium">Soal : {idx + 1}</h2>
            <textarea
              className="w-full border rounded p-2"
              value={s.pertanyaan}
              onChange={e => onChangeSoal(s.localId, 'pertanyaan', e.target.value)}
              required
            />
            <div>
              <input
                type="file"
                accept="image/*,video/*"
                disabled={s.id === null}
                onChange={e => onMediaChange(s.localId, s.id, e.target.files?.[0] ?? null)}
              />
              {previews[s.localId] && (
                s.mediaType === 'image' ? (
                  <img
                    src={previews[s.localId]!}
                    className="max-w-full max-h-48 mt-2 rounded"
                    alt="Preview media soal"
                  />
                ) : s.mediaType === 'video' ? (
                  <video
                    src={previews[s.localId]!}
                    controls
                    className="max-w-full max-h-48 mt-2 rounded"
                  />
                ) : null
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map(k => (
                <div key={k}>
                  <label>{k}.</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                    value={s.jawaban[k]}
                    onChange={e => onChangeJawaban(s.localId, k, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="mr-2">Jawaban Benar:</label>
              <select
                value={s.jawabanBenar}
                onChange={e => onChangeSoal(s.localId, 'jawabanBenar', e.target.value as keyof JawabanOptions)}
                className="border rounded px-2 py-1 cursor-pointer"
              >
                {(['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => router.push(`/admin/daftarUjian/editUjian?ujian_id=${ujianId}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
            disabled={saving}
          >
            Kembali
          </button>
          <button
            onClick={submitAll}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
