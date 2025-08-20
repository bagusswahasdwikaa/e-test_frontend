'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { ShareIcon } from '@heroicons/react/24/outline';

interface Ujian {
  id: number;
  nama: string;
  tanggal: string;
  durasi: number;
  status: string;
  kode: string;
  jumlahSoal: number;
}

interface Peserta {
  ID_Peserta: number;
  Nama_Lengkap: string;
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
        if (resJson?.data && Array.isArray(resJson.data)) {
          const mapped = resJson.data.map((item: any) => ({
            id: item.id_ujian,
            nama: item.nama_ujian,
            tanggal: item.tanggal,
            durasi: parseInt(item.durasi),
            status: item.status,
            kode: item.kode_soal,
            jumlahSoal: parseInt(item.jumlah_soal),
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

  const handleToggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const filteredData = dataUjian.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.nama || '').toLowerCase().includes(term) ||
      (item.kode || '').toLowerCase().includes(term)
    );
  });

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aDate = new Date(a.tanggal);
      const bDate = new Date(b.tanggal);

      if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1;
      if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortDirection]);

  const SortArrow = () => (
    <button
      onClick={handleToggleSort}
      aria-label="Toggle sort tanggal"
      className="select-none"
      style={{
        fontSize: 12,
        userSelect: 'none',
        lineHeight: 1,
        padding: 0,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#E5E7EB',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        height: 14,
        margin: 0,
      }}
      type="button"
    >
      {sortDirection === 'asc' ? '▲' : '▼'}
    </button>
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus ujian ini?')) return;

    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${id}`, {
        method: 'DELETE',
      });

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
      const json = await res.json();
      const list: Peserta[] = json.data.map((p: any) => ({
        ID_Peserta: p.ID_Peserta,
        Nama_Lengkap: p['Nama Lengkap'],
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: selectedEmails,
          nama_ujian: selectedUjian.nama,
          tanggal: selectedUjian.tanggal,
          kode_soal: selectedUjian.kode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Notifikasi berhasil dikirim ke peserta.');
        setShowModal(false);
      } else {
        alert('Gagal mengirim notifikasi: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim notifikasi.');
    }
  };

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Daftar Ujian</h1>
        <button
          className="bg-black text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors duration-200 cursor-pointer select-none"
          onClick={() => router.push('/admin/daftarUjian/buatSoal')}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-6 h-6"
            aria-hidden="true"
            focusable="false"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium leading-none">Buat Soal</span>
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-600">Memuat data ujian...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800 table-fixed">
            <thead className="bg-blue-900 text-white text-center">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap" style={{ width: 70 }}>
                  <div className="flex items-center justify-center gap-1">
                    <SortArrow />
                    <span>No</span>
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap" style={{ width: 120 }}>
                  Kode Soal
                </th>
                <th className="px-4 py-3 w-24 whitespace-nowrap">Nama Ujian</th>
                <th className="px-4 py-3 whitespace-nowrap" style={{ width: 130 }}>
                  Tanggal
                </th>
                <th className="px-4 py-3 whitespace-nowrap" style={{ width: 90 }}>
                  Durasi
                </th>
                <th className="px-4 py-3 whitespace-nowrap" style={{ width: 110 }}>
                  Butir Soal
                </th>
                <th className="px-4 py-3 whitespace-nowrap" style={{ width: 95 }}>
                  Status
                </th>
                <th className="px-4 py-3 whitespace-nowrap" style={{ width: 200 }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((ujian, index) => (
                  <tr key={ujian.id} className="text-center border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{ujian.kode}</td>
                    <td className="px-4 py-2">{ujian.nama}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{ujian.tanggal}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{ujian.durasi} menit</td>
                    <td className="px-4 py-2 whitespace-nowrap">{ujian.jumlahSoal}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          ujian.status === 'Aktif'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {ujian.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs min-w-[55px] transition-colors duration-200 cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/daftarUjian/lihatSoal?ujian_id=${ujian.id}`)
                          }
                          type="button"
                        >
                          Lihat
                        </button>
                        <button
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs min-w-[55px] transition-colors duration-200 cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/daftarUjian/editUjian?ujian_id=${ujian.id}`)
                          }
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs min-w-[55px] transition-colors duration-200 cursor-pointer"
                          onClick={() => handleDelete(ujian.id)}
                          type="button"
                        >
                          Hapus
                        </button>
                        <button
                          className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-xs min-w-[75px] transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer"
                          onClick={() => openBagikanModal(ujian)}
                          type="button"
                          aria-label="Bagikan ujian"
                        >
                          <ShareIcon className="w-4 h-4" />
                          Bagikan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    Belum ada ujian yang dibuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Bagikan */}
      {/* Modal Bagikan */}
{showModal && selectedUjian && (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div className="bg-gray-100 rounded-lg shadow-md p-6 w-full max-w-md mx-4 border border-gray-300">
      <h2
        id="modal-title"
        className="text-xl font-semibold text-gray-800 mb-5 border-b border-gray-400 pb-3"
      >
        Bagikan Ujian:{' '}
        <span className="text-blue-800 font-semibold">{selectedUjian.nama}</span>
      </h2>

      <div className="max-h-64 overflow-y-auto mb-6 border border-gray-300 rounded-md p-3 bg-white scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {pesertaList.length > 0 ? (
          pesertaList.map((peserta) => (
            <label
              key={peserta.ID_Peserta}
              className="flex items-center gap-3 py-2 cursor-pointer hover:bg-blue-100 rounded-md px-2 transition-colors duration-150"
            >
              <input
                type="checkbox"
                checked={selectedEmails.includes(peserta.Email)}
                onChange={() => toggleEmailSelection(peserta.Email)}
                className="h-5 w-5 text-blue-600 border-gray-400 rounded focus:ring-blue-400 bg-white"
              />
              <div className="text-gray-700 text-sm select-none">
                <div className="font-medium">{peserta.Nama_Lengkap}</div>
                <div className="text-gray-500">{peserta.Email}</div>
              </div>
            </label>
          ))
        ) : (
          <p className="text-center text-gray-500">Belum ada peserta tersedia.</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors duration-200"
          type="button"
        >
          Batal
        </button>
        <button
          onClick={kirimNotifikasi}
          disabled={selectedEmails.length === 0}
          className={`px-5 py-2 rounded-md font-semibold transition-colors duration-200 ${
            selectedEmails.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-300 cursor-not-allowed text-gray-100'
          }`}
          type="button"
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
