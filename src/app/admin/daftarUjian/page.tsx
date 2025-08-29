'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { ShareIcon } from '@heroicons/react/24/outline';

interface Ujian {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  durasi: number;
  status: 'Aktif' | 'Non Aktif';
  kode: string;
  jumlahSoal: number;
}

interface Peserta {
  ID_Peserta: number;
  Nama_Lengkap: string;
  Email: string;
  Status?: string;
  photo_url?: string | null;
}

type SortDirection = 'asc' | 'desc';

export default function DaftarUjianPage() {
  const router = useRouter();
  const [dataUjian, setDataUjian] = useState<Ujian[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null);
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return '-';
    const d = new Date(tanggal);
    if (isNaN(d.getTime())) return '-';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const hitungStatus = (mulai: string, akhir: string): 'Aktif' | 'Non Aktif' => {
    const now = Date.now();
    const mulaiTime = new Date(mulai).getTime();
    const akhirTime = new Date(akhir).getTime();
    if (isNaN(mulaiTime) || isNaN(akhirTime)) return 'Non Aktif';
    return now >= mulaiTime && now <= akhirTime ? 'Aktif' : 'Non Aktif';
  };

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/ujians')
      .then(async (res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok || !contentType?.includes('application/json')) {
          throw new Error('API response is not JSON.');
        }
        return res.json();
      })
      .then((resJson) => {
        if (Array.isArray(resJson.data)) {
          const mapped = resJson.data.map((item: any): Ujian => ({
            id: item.id_ujian,
            nama: item.nama_ujian,
            tanggal_mulai: item.tanggal_mulai,
            tanggal_akhir: item.tanggal_akhir,
            durasi: Number(item.durasi) || 0,
            status: hitungStatus(item.tanggal_mulai, item.tanggal_akhir),
            kode: item.kode_soal,
            jumlahSoal: Number(item.jumlah_soal) || 0,
          }));
          setDataUjian(mapped);
        } else {
          throw new Error('Data format tidak valid.');
        }
      })
      .catch((err) => {
        console.error('Gagal memuat ujian:', err);
        alert('Gagal memuat daftar ujian.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDataUjian((prev) =>
        prev.map((u) => ({ ...u, status: hitungStatus(u.tanggal_mulai, u.tanggal_akhir) }))
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSort = () =>
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));

  const filteredData = dataUjian.filter((u) =>
    u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aTime = new Date(a.tanggal_mulai).getTime();
      const bTime = new Date(b.tanggal_mulai).getTime();
      if (isNaN(aTime) || isNaN(bTime)) return 0;
      return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }, [filteredData, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginated = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus ujian ini?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setDataUjian((prev) => prev.filter((u) => u.id !== id));
      alert('Ujian dihapus.');
    } catch (err) {
      console.error(err);
      alert('Gagal hapus ujian.');
    }
  };

  const openBagikanModal = async (ujian: Ujian) => {
    try {
      const res = await fetch('http://localhost:8000/api/peserta');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: Peserta[] = json.data.map((p: any) => ({
        ID_Peserta: p.ID_Peserta,
        Nama_Lengkap: p['Nama Lengkap'] ?? '—',
        Email: p.Email ?? '-',
        Status: p.Status?.toLowerCase(),
        photo_url: p['Photo URL'] ?? null,
      }));
      setPesertaList(list);
      setSelectedEmails([]);
      setSelectedUjian(ujian);
      setShowModal(true);
    } catch (err: any) {
      console.error('Error fetch peserta:', err);
      alert(`Gagal mengambil daftar peserta: ${err.message}`);
    }
  };

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const kirim = async () => {
    if (!selectedUjian || selectedEmails.length === 0) return;
    const ids = pesertaList
      .filter((p) => selectedEmails.includes(p.Email))
      .map((p) => p.ID_Peserta);

    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${selectedUjian.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: ids }),
      });
      if (!res.ok) throw new Error('Gagal assign peserta');
      alert('Dikirim notifikasi.');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal kirim notifikasi.');
    }
  };

  const SortArrow = () => (
    <button
      onClick={handleToggleSort}
      aria-label="Toggle sort"
      className="select-none text-white text-xs"
    >
      {sortDirection === 'asc' ? '▲' : '▼'}
    </button>
  );

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Ujian</h1>
        <button
          onClick={() => router.push('/admin/daftarUjian/buatSoal')}
          className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors duration-200 text-sm font-medium cursor-pointer whitespace-nowrap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Buat Soal
        </button>
      </div>

      {loading ? (
        <p className="text-center py-6 text-gray-600">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg mb-4 border border-gray-200">
            <table className="min-w-full text-gray-800 text-sm border-collapse">
              <thead className="bg-blue-900 text-white uppercase text-xs font-semibold">
                <tr className="border-b border-black">
                  <th className="px-4 py-3 text-center w-12">
                    <div className="flex items-center justify-center gap-1">
                      <SortArrow /> No
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center">Kode</th>
                  <th className="px-4 py-3 text-center">Nama Ujian</th>
                  <th className="px-4 py-3 text-center">Mulai</th>
                  <th className="px-4 py-3 text-center">Akhir</th>
                  <th className="px-4 py-3 text-center">Durasi</th>
                  <th className="px-4 py-3 text-center">Soal</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">
                      Belum ada ujian
                    </td>
                  </tr>
                ) : (
                  paginated.map((u, idx) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors duration-150 border-b border-black last:border-b-0"
                    >
                      <td className="text-center py-2 font-medium">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="text-center">{u.kode}</td>
                      <td className="text-center">{u.nama}</td>
                      <td className="text-center">{formatTanggal(u.tanggal_mulai)}</td>
                      <td className="text-center">{formatTanggal(u.tanggal_akhir)}</td>
                      <td className="text-center">{u.durasi} menit</td>
                      <td className="text-center">{u.jumlahSoal}</td>
                      <td className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.status === 'Aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="text-center py-2">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/daftarUjian/lihatSoal?ujian_id=${u.id}`)
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-xs"
                          >
                            Lihat
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/daftarUjian/editUjian?ujian_id=${u.id}`)
                            }
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition text-xs"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => openBagikanModal(u)}
                            className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded flex items-center gap-1 transition text-xs"
                          >
                            <ShareIcon className="w-4 h-4" />
                            Bagikan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center text-gray-600 text-sm mt-4">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Sebelumnya
            </button>
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages || totalPages === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Selanjutnya
            </button>
          </div>
        </>
      )}

      {/* Modal Bagikan */}
      {showModal && selectedUjian && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">
              Bagikan Ujian:{' '}
              <span className="text-blue-700">{selectedUjian.nama}</span>
            </h2>
            <div className="mb-4 text-sm text-gray-600">Pilih peserta:</div>
            <div className="border border-gray-300 rounded max-h-64 overflow-y-auto p-2 mb-4">
              {pesertaList.length === 0 ? (
                <p className="text-center text-gray-600">
                  Tidak ada peserta tersedia
                </p>
              ) : (
                pesertaList.map((p) => (
                  <label
                    key={p.ID_Peserta}
                    className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(p.Email)}
                      onChange={() => toggleEmail(p.Email)}
                      className="w-5 h-5 cursor-pointer accent-blue-600"
                    />
                    <span className="select-none">
                      {p.Nama_Lengkap} —{' '}
                      <span className="text-gray-500">{p.Email}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition"
              >
                Batal
              </button>
              <button
                onClick={kirim}
                disabled={selectedEmails.length === 0}
                className={`px-4 py-2 rounded text-white ${
                  selectedEmails.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Bagikan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
