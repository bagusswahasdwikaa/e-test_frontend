'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type JawabanOptions = { A: string; B: string; C: string; D: string };
type SoalData = {
  id: number | null;  // Bisa null untuk soal baru yang belum punya id
  pertanyaan: string;
  mediaType: 'none' | 'image' | 'video';
  jawaban: JawabanOptions;
  jawabanBenar: keyof JawabanOptions;
};

type UjianData = {
  id_ujian: number;
  jumlah_soal: number;
};

export default function EditSoalPage() {
  const router = useRouter();
  const params = useSearchParams();
  const ujianId = params.get('ujian_id');

  const [soals, setSoals] = useState<SoalData[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Record<number | string, File | null>>({});
  const [previews, setPreviews] = useState<Record<number | string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ujian, setUjian] = useState<UjianData | null>(null);

  useEffect(() => {
    if (!ujianId) {
      router.push('/admin/daftarUjian');
      return;
    }

    // Fetch data ujian dulu untuk jumlah_soal
    const fetchUjian = async () => {
      try {
        const resUjian = await fetch(`http://localhost:8000/api/ujians/${ujianId}`);
        if (!resUjian.ok) throw new Error('Gagal fetch ujian');
        const ujianData: UjianData = await resUjian.json();
        setUjian(ujianData);
      } catch (error) {
        console.error(error);
        alert('Gagal memuat data ujian.');
        router.push('/admin/daftarUjian');
      }
    };

    // Fetch soal terkait ujian
    const fetchSoal = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/ujians/${ujianId}/soals`);
        if (!res.ok) throw new Error('Gagal fetch soal');
        const json = await res.json();
        const arr = Array.isArray(json.data) ? json.data : [];

        const soalList = arr.map((item: any) => {
          const jaw = item.jawabans || {};
          const jawOps: JawabanOptions = {
            A: jaw.A?.jawaban || '',
            B: jaw.B?.jawaban || '',
            C: jaw.C?.jawaban || '',
            D: jaw.D?.jawaban || '',
          };

          const correctAnswerKey = (['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[])
            .find(k => {
              const val = jaw[k]?.is_correct;
              return val === true || val === '1' || val === 1 || val === 'true';
            }) || 'A';

          return {
            id: item.id,
            pertanyaan: item.pertanyaan,
            mediaType: item.media_type,
            jawaban: jawOps,
            jawabanBenar: correctAnswerKey,
          } as SoalData;
        });

        // Jika soal yang didapat kurang dari jumlah_soal, tambahkan soal kosong
        if (ujian && ujian.jumlah_soal > soalList.length) {
          const kurang = ujian.jumlah_soal - soalList.length;
          for (let i = 0; i < kurang; i++) {
            soalList.push({
              id: null, // null karena soal baru belum ada di DB
              pertanyaan: '',
              mediaType: 'none',
              jawaban: { A: '', B: '', C: '', D: '' },
              jawabanBenar: 'A',
            });
          }
        } else if (ujian && ujian.jumlah_soal < soalList.length) {
          // Jika soal lebih banyak dari jumlah_soal, potong saja
          soalList.splice(ujian.jumlah_soal);
        }

        setSoals(soalList);

        // Set preview media
        arr.forEach((item: any) => {
          if (item.media_path) {
            setPreviews(prev => ({
              ...prev,
              [item.id]: `http://localhost:8000/storage/${item.media_path}`
            }));
          } else {
            setPreviews(prev => ({
              ...prev,
              [item.id]: null
            }));
          }
        });
      } catch (error) {
        console.error(error);
        alert('Gagal memuat soal.');
        router.push('/admin/daftarUjian');
      } finally {
        setLoading(false);
      }
    };

    (async () => {
      await fetchUjian();
      await fetchSoal();
    })();

  }, [ujianId, router, ujian?.jumlah_soal]);

  const onChangeSoal = (
    id: number | null,
    field: keyof Omit<SoalData, 'id' | 'jawaban'> | 'jawabanBenar',
    val: any
  ) => {
    setSoals(prev =>
      prev.map(s =>
        s.id === id ? { ...s, [field]: val } : s
      )
    );
  };

  const onChangeJawaban = (id: number | null, k: keyof JawabanOptions, val: string) => {
    setSoals(prev =>
      prev.map(s =>
        s.id === id ? { ...s, jawaban: { ...s.jawaban, [k]: val } } : s
      )
    );
  };

  const onMediaChange = (id: number | null, file: File | null) => {
    if (id === null) return; // soal baru belum bisa upload media (optional)

    setMediaFiles(prev => ({ ...prev, [id]: file }));
    setPreviews(prev => ({
      ...prev,
      [id]: file ? URL.createObjectURL(file) : null
    }));

    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'none';
      onChangeSoal(id, 'mediaType', type);
    } else {
      onChangeSoal(id, 'mediaType', 'none');
    }
  };

  const submitAll = async () => {
    setSaving(true);
    try {
      // Submit soal satu per satu
      for (const s of soals) {
        const form = new FormData();
        form.append('pertanyaan', s.pertanyaan);
        form.append('media_type', s.mediaType);

        form.append('_method', 'PUT');

        if (s.id && mediaFiles[s.id]) {
          form.append('media_file', mediaFiles[s.id]!);
        }

        (['A', 'B', 'C', 'D'] as (keyof JawabanOptions)[]).forEach((k, i) => {
          form.append(`jawabans[${i}][jawaban]`, s.jawaban[k]);
          form.append(`jawabans[${i}][is_correct]`, k === s.jawabanBenar ? '1' : '0');
        });

        let url = '';
        let method = '';
        if (s.id) {
          // Soal sudah ada, update
          url = `http://localhost:8000/api/soals/${s.id}`;
          method = 'POST'; // POST + _method=PUT override
        } else {
          // Soal baru, buat baru
          url = `http://localhost:8000/api/ujians/${ujianId}/soals`;
          method = 'POST';
        }

        const res = await fetch(url, {
          method,
          body: form,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Error response:', errData);
          alert(`Gagal memperbarui soal`);
          setSaving(false);
          return;
        }
      }

      alert('Semua soal berhasil diperbarui');

      // Setelah berhasil simpan, redirect ke daftarUjian
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
          <div key={s.id ?? `new-${idx}`} className="border p-4 rounded bg-gray-50 space-y-4">
            <h2 className="font-medium">Soal : {idx + 1}</h2>
            <textarea
              className="w-full border rounded p-2"
              value={s.pertanyaan}
              onChange={e => onChangeSoal(s.id, 'pertanyaan', e.target.value)}
              required
            />
            <div>
              <input
                type="file"
                accept="image/*,video/*"
                disabled={s.id === null} // Nonaktifkan upload media untuk soal baru
                onChange={e => onMediaChange(s.id, e.target.files?.[0] ?? null)}
              />
              {previews[s.id ?? `new-${idx}`] && (
                s.mediaType === 'image' ? (
                  <img
                    src={previews[s.id ?? `new-${idx}`]!}
                    className="max-w-full max-h-48 mt-2 rounded"
                    alt="Preview media soal"
                  />
                ) : s.mediaType === 'video' ? (
                  <video
                    src={previews[s.id ?? `new-${idx}`]!}
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
                    onChange={e => onChangeJawaban(s.id, k, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="mr-2">Jawaban Benar:</label>
              <select
                value={s.jawabanBenar}
                onChange={e => onChangeSoal(s.id, 'jawabanBenar', e.target.value as keyof JawabanOptions)}
                className="border rounded px-2 py-1"
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
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            disabled={saving}
          >
            Kembali
          </button>
          <button
            onClick={submitAll}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
