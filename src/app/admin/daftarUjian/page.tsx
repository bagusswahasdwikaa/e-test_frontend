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
  NamaLengkap: string;
  Email: string;
}

type SortDirection = 'asc' | 'desc';

export default function DaftarUjianPage() {
  const router = useRouter();
  const [dataUjian, setDataUjian] = useState<Ujian[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [showModal, setShowModal] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null);
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Format tanggal ke dd-mm-yyyy hh:mm
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
    const now = new Date().getTime();
    const mulaiTime = new Date(mulai).getTime();
    const akhirTime = new Date(akhir).getTime();
    if (isNaN(mulaiTime) || isNaN(akhirTime)) return 'Non Aktif';
    return now >= mulaiTime && now <= akhirTime ? 'Aktif' : 'Non Aktif';
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/ujians')
      .then(async (res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok || !contentType?.includes('application/json')) {
          throw new Error('Respon bukan JSON.');
        }
        return res.json();
      })
      .then((resJson) => {
        if (Array.isArray(resJson?.data)) {
          const mapped: Ujian[] = resJson.data.map((item: any) => ({
            id: item.id_ujian,
            nama: item.nama_ujian,
            tanggal_mulai: item.tanggal_mulai,
            tanggal_akhir: item.tanggal_akhir,
            durasi: parseInt(item.durasi) || 0,
            status: hitungStatus(item.tanggal_mulai, item.tanggal_akhir),
            kode: item.kode_soal,
            jumlahSoal: parseInt(item.jumlah_soal) || 0,
          }));
          setDataUjian(mapped);
        } else {
          throw new Error('Format data API tidak sesuai.');
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data ujian:', err);
        alert('Gagal memuat daftar ujian. Periksa API backend Anda.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDataUjian((prev) =>
        prev.map((u) => ({
          ...u,
          status: hitungStatus(u.tanggal_mulai, u.tanggal_akhir),
        }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const filteredData = dataUjian.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.nama.toLowerCase().includes(term) ||
      item.kode.toLowerCase().includes(term)
    );
  });

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aDate = new Date(a.tanggal_mulai).getTime();
      const bDate = new Date(b.tanggal_mulai).getTime();
      if (isNaN(aDate) || isNaN(bDate)) return 0;
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    });
  }, [filteredData, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus ujian ini?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      alert('Ujian berhasil dihapus.');
      setDataUjian((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  const openBagikanModal = async (ujian: Ujian) => {
    try {
      const res = await fetch('http://localhost:8000/api/peserta');
      if (!res.ok) throw new Error('Gagal ambil peserta');
      const json = await res.json();
      if (!Array.isArray(json?.data)) throw new Error('Format peserta tidak valid');
      const list: Peserta[] = json.data.map((p: any) => ({
        ID_Peserta: p.ID_Peserta,
        NamaLengkap: p['Nama Lengkap'] || p.Nama_Lengkap,
        Email: p.Email,
      }));
      setPesertaList(list);
      setSelectedEmails([]);
      setSelectedUjian(ujian);
      setShowModal(true);
    } catch (error) {
      console.error('Gagal mengambil daftar peserta:', error);
      alert('Gagal memuat peserta.');
    }
  };

  const toggleEmailSelection = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const kirimNotifikasi = async () => {
    if (!selectedUjian || selectedEmails.length === 0) return;
    try {
      const res = await fetch('http://localhost:8000/api/kirim-ujian-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: selectedEmails,
          nama_ujian: selectedUjian.nama,
          tanggal_mulai: selectedUjian.tanggal_mulai,
          tanggal_akhir: selectedUjian.tanggal_akhir,
          kode_soal: selectedUjian.kode,
        }),
      });
      if (!res.ok) throw new Error('Gagal kirim notifikasi');
      alert('Notifikasi berhasil dikirim ke peserta.');
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim notifikasi.');
    }
  };

  const SortArrow = () => (
    <button onClick={handleToggleSort} aria-label="Toggle sort tanggal" className="select-none" type="button">
      {sortDirection === 'asc' ? '▲' : '▼'}
    </button>
  );

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Daftar Ujian</h1>
        <button
          className="bg-black text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          onClick={() => router.push('/admin/daftarUjian/buatSoal')}
          type="button"
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
          <span className="text-sm font-medium">Buat Soal</span>
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-600">Memuat data ujian...</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-sm text-gray-800 table-fixed">
              <thead className="bg-blue-900 text-white text-center">
                <tr>
                  <th className="px-4 py-3" style={{ width: 70 }}>
                    <div className="flex items-center justify-center gap-2">
                      <SortArrow />
                      <span>No</span>
                    </div>
                  </th>
                  <th className="px-4 py-3" style={{ width: 120 }}>Kode Soal</th>
                  <th className="px-4 py-3" style={{ width:115 }}>Nama Ujian</th>
                  <th className="px-4 py-3" style={{ width: 150 }}>Tanggal Mulai</th>
                  <th className="px-4 py-3" style={{ width: 150 }}>Tanggal Akhir</th>
                  <th className="px-4 py-3" style={{ width: 90 }}>Durasi</th>
                  <th className="px-4 py-3" style={{ width: 110 }}>Butir Soal</th>
                  <th className="px-4 py-3" style={{ width: 120 }}>Status</th>
                  <th className="px-4 py-3" style={{ width: 230 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((ujian, idx) => (
                    <tr key={ujian.id} className="text-center border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-4 py-2">{ujian.kode}</td>
                      <td className="px-4 py-2">{ujian.nama}</td>
                      <td className="px-4 py-2">{formatTanggal(ujian.tanggal_mulai)}</td>
                      <td className="px-4 py-2">{formatTanggal(ujian.tanggal_akhir)}</td>
                      <td className="px-4 py-2">{ujian.durasi} menit</td>
                      <td className="px-4 py-2">{ujian.jumlahSoal}</td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ujian.status === 'Aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {ujian.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs cursor-pointer" onClick={() => router.push(`/admin/daftarUjian/lihatSoal?ujian_id=${ujian.id}`)}>Lihat</button>
                          <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xbs cursor-pointer" onClick={() => router.push(`/admin/daftarUjian/editUjian?ujian_id=${ujian.id}`)}>Edit</button>
                          <button className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs cursor-pointer" onClick={() => handleDelete(ujian.id)}>Hapus</button>
                          <button className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-xs flex items-center gap-1 cursor-pointer" onClick={() => openBagikanModal(ujian)}>
                            <ShareIcon className="w-4 h-4" /> Bagikan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-4">
                      Belum ada ujian yang dibuat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-2 py-1 text-sm text-gray-600 mt-3">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} px-3 py-1 rounded`}
            >
              Sebelumnya
            </button>
            <span>Halaman {currentPage} dari {totalPages}</span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} px-3 py-1 rounded`}
            >
              Selanjutnya
            </button>
          </div>
        </>
      )}

      {showModal && selectedUjian && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg shadow-md p-6 w-full max-w-md mx-4 border border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">
              Bagikan Ujian: <span className="text-blue-800">{selectedUjian.nama}</span>
            </h2>

            <div className="max-h-64 overflow-y-auto mb-6 bg-white border rounded-md p-3">
              {pesertaList.length > 0 ? (
                pesertaList.map((peserta) => (
                  <label key={peserta.ID_Peserta} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-blue-100 rounded-md px-2">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(peserta.Email)}
                      onChange={() => toggleEmailSelection(peserta.Email)}
                      className="h-5 w-5 text-blue-600 border-gray-400 rounded focus:ring-blue-400 bg-white"
                    />
                    <div className="text-gray-700 text-sm">
                      <div className="font-medium">{peserta.NamaLengkap}</div>
                      <div className="text-gray-500">{peserta.Email}</div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-center text-gray-500">Belum ada peserta tersedia.</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold cursor-pointer">
                Batal
              </button>
              <button
                onClick={kirimNotifikasi}
                disabled={selectedEmails.length === 0}
                className={`${selectedEmails.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-300 text-gray-100 cursor-not-allowed'} px-5 py-2 rounded-md font-semibold`}
              >
                Kirim Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
