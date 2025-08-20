'use client';

import { useEffect, useState } from 'react';
import axios from '@/services/axios';
import { useSearchParams } from 'next/navigation';

interface Jawaban {
  jawaban: string;
  is_correct: boolean;
}

interface Soal {
  id: number;
  pertanyaan: string;
  media_type: string;
  media_path: string | null;
  jawabans: Record<'A' | 'B' | 'C' | 'D', Jawaban>;
}

export default function SoalPage() {
  const searchParams = useSearchParams();
  const ujianId = searchParams.get('ujian_id'); // ambil dari query param
  const [soals, setSoals] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!ujianId) return;

    const fetchSoals = async () => {
      try {
        const response = await axios.get(`/soals/by-ujian/${ujianId}`);
        setSoals(response.data.data);
      } catch (error) {
        console.error('Gagal ambil soal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoals();
  }, [ujianId]);

  if (loading) {
    return <p className="p-4">Memuat soal...</p>;
  }

  if (soals.length === 0) {
    return <p className="p-4">Tidak ada soal tersedia.</p>;
  }

  const currentSoal = soals[currentIndex];

  const handleNext = () => {
    setSelectedAnswer(null);
    if (currentIndex < soals.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setSelectedAnswer(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Soal {currentIndex + 1}:</h1>
      <div className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto">
        <p className="mb-4">{currentSoal.pertanyaan}</p>

        {currentSoal.media_type === 'image' && currentSoal.media_path && (
          <img
            src={`http://localhost:8000/storage/${currentSoal.media_path}`}
            alt="Gambar soal"
            className="mb-4 max-h-64 object-contain"
          />
        )}

        {currentSoal.media_type === 'video' && currentSoal.media_path && (
          <video
            controls
            className="mb-4 w-full max-h-64 object-contain"
            src={`http://localhost:8000/storage/${currentSoal.media_path}`}
          />
        )}

        <div className="space-y-2">
          {(['A', 'B', 'C', 'D'] as const).map((key) => (
            <label
              key={key}
              className={`block px-4 py-2 border rounded cursor-pointer ${
                selectedAnswer === key
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-100'
              }`}
            >
              <input
                type="radio"
                name={`soal-${currentSoal.id}`}
                value={key}
                checked={selectedAnswer === key}
                onChange={() => setSelectedAnswer(key)}
                className="mr-2"
              />
              {key}. {currentSoal.jawabans[key].jawaban}
            </label>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === soals.length - 1}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
}
