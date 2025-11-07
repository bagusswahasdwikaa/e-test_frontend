'use client';

import { useEffect, useState } from 'react';
import axios from '@/services/axios';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface RankData {
  rank: number;
  user_id: number;
  nama_lengkap: string;
  nilai: number;
  status: string;
  waktu_selesai: string;
}

interface Ujian {
  id_ujian: number;
  nama_ujian: string;
}

export default function PeringkatPesertaPage() {
  const [data, setData] = useState<RankData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState<string>('');
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Ambil daftar ujian untuk dropdown
  useEffect(() => {
    const fetchUjianList = async () => {
      try {
        const res = await axios.get('/ujians');
        setUjianList(res.data.data || []);
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat daftar ujian');
      }
    };
    fetchUjianList();
  }, []);

  // Ambil ranking berdasarkan ujian
  const fetchRanking = async (ujianId: string) => {
    if (!ujianId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get(`/ujians/ranking/${ujianId}`);
      const rankingData = res.data?.data || [];

      if (rankingData.length === 0) {
        setErrorMsg('Belum ada peserta yang mengikuti ujian ini atau data nilai belum tersedia.');
      }
      setData(rankingData);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 404) {
        // Jika backend kirim 404 saat data kosong
        setErrorMsg('Belum ada peserta yang mengikuti ujian ini atau data nilai belum tersedia.');
        setData([]);
      } else {
        toast.error(error.response?.data?.message || 'Gagal memuat data ranking');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            📊 Peringkat Peserta Ujian
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Dropdown Pilih Ujian */}
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-600">Pilih Ujian:</label>
            <Select
              onValueChange={(value) => {
                setSelectedUjian(value);
                fetchRanking(value);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih ujian..." />
              </SelectTrigger>
              <SelectContent>
                {ujianList.length > 0 ? (
                  ujianList.map((ujian) => (
                    <SelectItem
                      key={ujian.id_ujian}
                      value={ujian.id_ujian.toString()}
                    >
                      {ujian.nama_ujian}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Tidak ada ujian
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tabel Ranking */}
          {loading ? (
            <div className="flex justify-center py-10 text-gray-500">
              <Loader2 className="animate-spin mr-2" /> Memuat data...
            </div>
          ) : data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-center w-16">Rank</TableHead>
                    <TableHead>Nama Peserta</TableHead>
                    <TableHead className="text-center w-24">Nilai</TableHead>
                    <TableHead className="text-center w-32">Status</TableHead>
                    <TableHead className="text-center w-48">Waktu Selesai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell className="text-center font-bold">{item.rank}</TableCell>
                      <TableCell>{item.nama_lengkap}</TableCell>
                      <TableCell className="text-center">{item.nilai}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status?.toLowerCase() === 'lulus'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{item.waktu_selesai}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : selectedUjian ? (
            <div className="text-center text-gray-500 py-8">
              {errorMsg || 'Belum ada peserta yang mengikuti ujian ini.'}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Silakan pilih ujian untuk melihat ranking peserta.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
