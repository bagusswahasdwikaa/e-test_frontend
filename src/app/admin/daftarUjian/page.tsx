'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { ShareIcon, PencilSquareIcon, TrashIcon, DocumentDuplicateIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { EyeIcon as EyeIconSolid } from '@heroicons/react/24/solid';

interface Ujian {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  durasi: number;
  status: 'Aktif' | 'Tidak Aktif';
  kode: string;
  jumlahSoal: number;
  jenis_ujian: string;
}

interface Peserta {
  ID_Peserta: number;
  Nama_Lengkap: string;
  Email: string;
  Status?: string;
  photo_url?: string | null;
}

interface PesertaList {
  belum: Peserta[];
  sudah: Peserta[];
}

type SortField = 'id' | 'nama' | 'kode' | 'jenis_ujian' | 'tanggal_mulai' | 'tanggal_akhir' | 'durasi' | 'jumlahSoal' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface ColumnFilters {
  kode: string;
  nama: string;
  status: string;
  durasi: string;
  jumlahSoal: string;
  jenis_ujian: string;
}

export default function DaftarUjianPage() {
  const router = useRouter();
  const [dataUjian, setDataUjian] = useState<Ujian[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPeserta, setSearchPeserta] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [pesertaList, setPesertaList] = useState<PesertaList>({
    belum: [],
    sudah: [],
  });
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null);
  
  const [showBagikanModal, setShowBagikanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showCloneModal, setShowCloneModal] = useState(false);
  const [selectedCloneId, setSelectedCloneId] = useState<number | ''>('');
  const [kodeSoalBaru, setKodeSoalBaru] = useState('');
  const [loadingClone, setLoadingClone] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    kode: '',
    nama: '',
    jenis_ujian: '',
    status: '',
    durasi: '',
    jumlahSoal: '',
  });

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

  const hitungStatus = (mulai: string, akhir: string): 'Aktif' | 'Tidak Aktif' => {
    const now = Date.now();
    const mulaiTime = new Date(mulai).getTime();
    const akhirTime = new Date(akhir).getTime();
    if (isNaN(mulaiTime) || isNaN(akhirTime)) return 'Tidak Aktif';
    return now >= mulaiTime && now <= akhirTime ? 'Aktif' : 'Tidak Aktif';
  };

  const fetchUjians = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/ujians');
      const contentType = res.headers.get('Content-Type');
      if (!res.ok || !contentType?.includes('application/json')) {
        throw new Error('API response is not JSON or not OK.');
      }
      const resJson = await res.json();
      if (Array.isArray(resJson.data)) {
        const mapped = resJson.data.map((item: any): Ujian => ({
          id: item.id_ujian,
          nama: item.nama_ujian,
          tanggal_mulai: item.tanggal_mulai,
          tanggal_akhir: item.tanggal_akhir,
          durasi: Number(item.durasi) || 0,
          status: hitungStatus(item.tanggal_mulai, item.tanggal_akhir),
          kode: item.kode_soal,
          jenis_ujian: item.jenis_ujian || '—',
          jumlahSoal: Number(item.jumlah_soal) || 0,
        }));
        setDataUjian(mapped);
      } else {
        throw new Error('Data format tidak valid.');
      }
    } catch (err) {
      console.error('Gagal memuat ujian:', err);
      alert('Gagal memuat daftar ujian. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUjians();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDataUjian((prev) =>
        prev.map((u) => ({ ...u, status: hitungStatus(u.tanggal_mulai, u.tanggal_akhir) }))
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Fungsi untuk render icon sorting
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="ml-1 text-gray-400">
          <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }
    if (sortDirection === 'asc') {
      return (
        <span className="ml-1">
          <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </span>
      );
    }
    return (
      <span className="ml-1">
        <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    );
  };

  const resetFilters = () => {
    setColumnFilters({
      kode: '',
      nama: '',
      status: '',
      durasi: '',
      jumlahSoal: '',
      jenis_ujian: '',
    });
  };

  const hasActiveFilters = Object.values(columnFilters).some(val => val !== '');

  const filteredData = dataUjian.filter((u) => {
    const matchSearch = u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.kode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchSearch) return false;

    if (columnFilters.kode && !u.kode.toLowerCase().includes(columnFilters.kode.toLowerCase())) {
      return false;
    }
    
    if (columnFilters.nama && !u.nama.toLowerCase().includes(columnFilters.nama.toLowerCase())) {
      return false;
    }
    
    if (columnFilters.status && u.status !== columnFilters.status) {
      return false;
    }
    
    if (columnFilters.durasi && u.durasi.toString() !== columnFilters.durasi) {
      return false;
    }
    
    if (columnFilters.jumlahSoal && u.jumlahSoal.toString() !== columnFilters.jumlahSoal) {
      return false;
    }

    if (columnFilters.jenis_ujian && u.jenis_ujian.toString() !== columnFilters.jenis_ujian) {
      return false;
    }

    return true;
  });

  const filterPeserta = (list: Peserta[]) => {
    const term = searchPeserta.toLowerCase();
    return list.filter(
      (p) =>
        p.Nama_Lengkap.toLowerCase().includes(term) ||
        p.Email.toLowerCase().includes(term)
    );
  };

  const pesertaBelumFiltered = filterPeserta(pesertaList.belum);
  const pesertaSudahFiltered = filterPeserta(pesertaList.sudah);

  // Sorting data
  const sortedData = React.useMemo(() => {
    if (!sortField || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'nama':
          aValue = a.nama.toLowerCase();
          bValue = b.nama.toLowerCase();
          break;
        case 'kode':
          aValue = a.kode.toLowerCase();
          bValue = b.kode.toLowerCase();
          break;
        case 'jenis_ujian':
          aValue = a.jenis_ujian.toLowerCase();
          bValue = b.jenis_ujian.toLowerCase();
          break;
        case 'tanggal_mulai':
          aValue = new Date(a.tanggal_mulai).getTime();
          bValue = new Date(b.tanggal_mulai).getTime();
          break;
        case 'tanggal_akhir':
          aValue = new Date(a.tanggal_akhir).getTime();
          bValue = new Date(b.tanggal_akhir).getTime();
          break;
        case 'durasi':
          aValue = a.durasi;
          bValue = b.durasi;
          break;
        case 'jumlahSoal':
          aValue = a.jumlahSoal;
          bValue = b.jumlahSoal;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginated = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleDelete = (ujianId: number) => {
    const ujianToDelete = dataUjian.find(u => u.id === ujianId);
    if (!ujianToDelete) return;

    setSelectedUjian(ujianToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUjian) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${selectedUjian.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!res.ok) throw new Error('Gagal menghapus ujian');

      setDataUjian((prev) =>
        prev.filter((p) => p.id !== selectedUjian.id)
      );

      setShowDeleteModal(false);
      setSelectedUjian(null);
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus ujian.');
    } finally {
      setActionLoading(false);
    }
  };

  const openCloneModal = () => {
    setSelectedCloneId('');
    setKodeSoalBaru('');
    setShowCloneModal(true);
  };

  const handleClone = async () => {
    if (!selectedCloneId) {
      alert('Silakan pilih ujian yang ingin dikloning.');
      return;
    }
    if (!kodeSoalBaru.trim()) {
      alert('Silakan isi kode soal baru.');
      return;
    }

    setLoadingClone(true);

    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${selectedCloneId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ kode_soal: kodeSoalBaru.trim() }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const msg = data?.message || (typeof data === 'string' ? data : 'Gagal mengkloning ujian.');
        throw new Error(msg);
      }

      alert('Ujian berhasil dikloning.');
      setShowCloneModal(false);
      setKodeSoalBaru('');
      setSelectedCloneId('');
      await fetchUjians();
    } catch (err: any) {
      console.error('Terjadi kesalahan saat kloning:', err);
      const msg = err?.message || String(err);
      alert(`Terjadi kesalahan saat kloning: ${msg}`);

      if (msg === 'Failed to fetch') {
        alert(
          'Catatan: "Failed to fetch" sering berarti backend tidak dapat dijangkau atau ada masalah CORS. ' +
          'Periksa bahwa backend berjalan di http://localhost:8000 dan konfigurasi CORS pada Laravel (config/cors.php) mengizinkan origin frontend.'
        );
      }
    } finally {
      setLoadingClone(false);
    }
  };

  const openBagikanModal = async (ujian: Ujian) => {
    try {
      const res = await fetch('http://localhost:8000/api/list-peserta');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const semuaPeserta: Peserta[] = json.data.map((p: any) => ({
        ID_Peserta: p.ID_Peserta,
        Nama_Lengkap: p['Nama Lengkap'] ?? '—',
        Email: p.Email ?? '-',
        Status: p.Status?.toLowerCase() ?? null,
        photo_url: p['Photo URL'] ?? null,
      }));

      const pesertaAktif = semuaPeserta.filter(p => p.Status === 'aktif');

      const res2 = await fetch(`http://localhost:8000/api/ujians/${ujian.id}/users`);
      if (!res2.ok) throw new Error(`HTTP ${res2.status} (assignedUsers)`);
      const json2 = await res2.json();

      const pesertaSudah: Peserta[] = json2.assigned_users.map((p: any) => ({
        ID_Peserta: p.id,
        Nama_Lengkap: p.name,
        Email: p.email,
        Status: 'aktif',
        photo_url: null,
      }));

      const pesertaSudahEmails = new Set(pesertaSudah.map(p => p.Email));
      const pesertaBelum = pesertaAktif.filter(p => !pesertaSudahEmails.has(p.Email));

      setPesertaList({
        belum: pesertaBelum,
        sudah: pesertaSudah,
      });

      setSelectedEmails([]);
      setSelectedUjian(ujian);
      setShowBagikanModal(true);
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

    const semuaPeserta = [...pesertaList.belum, ...pesertaList.sudah];

    const ids = semuaPeserta
      .filter((p) => selectedEmails.includes(p.Email))
      .map((p) => p.ID_Peserta);

    try {
      const res = await fetch(`http://localhost:8000/api/ujians/${selectedUjian.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: ids }),
      });
      if (!res.ok) throw new Error('Gagal assign peserta');
      alert('Ujian Berhasil di bagikan.');
      setShowBagikanModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal kirim notifikasi.');
    }
  };

  const uniqueStatuses = Array.from(new Set(dataUjian.map(u => u.status)));
  const uniqueDurasi = Array.from(new Set(dataUjian.map(u => u.durasi))).sort((a, b) => a - b);
  const uniqueJumlahSoal = Array.from(new Set(dataUjian.map(u => u.jumlahSoal))).sort((a, b) => a - b);
  const uniqueJenisUjian = Array.from(new Set(dataUjian.map(u => u.jenis_ujian)));

  return (
    <AdminLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      {loading && (
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
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-5">Daftar Ujian</h1>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={openCloneModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md flex items-center gap-1.5 transition text-sm font-medium cursor-pointer"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
            Kloning
          </button>

          <button
            onClick={() => router.push('/admin/daftarUjian/buatSoal')}
            className="bg-black text-white px-3 py-2 rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition text-sm font-medium cursor-pointer"
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

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition text-sm font-medium cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-500 text-white hover:bg-gray-700'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filter {hasActiveFilters && `(${Object.values(columnFilters).filter(v => v !== '').length})`}
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-1.5 transition text-sm font-medium cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
              Reset Filter
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Filter Kolom</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kode Ujian</label>
                <input
                  type="text"
                  value={columnFilters.kode}
                  onChange={(e) => setColumnFilters({ ...columnFilters, kode: e.target.value })}
                  placeholder="Cari kode..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Ujian</label>
                <input
                  type="text"
                  value={columnFilters.nama}
                  onChange={(e) => setColumnFilters({ ...columnFilters, nama: e.target.value })}
                  placeholder="Cari nama..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Ujian</label>
                <select
                  value={columnFilters.jenis_ujian}
                  onChange={(e) => setColumnFilters({ ...columnFilters, jenis_ujian: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Jenis Ujian</option>
                  {uniqueJenisUjian.map(jenis_ujian => (
                    <option key={jenis_ujian} value={jenis_ujian}>{jenis_ujian}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={columnFilters.status}
                  onChange={(e) => setColumnFilters({ ...columnFilters, status: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durasi (menit)</label>
                <select
                  value={columnFilters.durasi}
                  onChange={(e) => setColumnFilters({ ...columnFilters, durasi: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Durasi</option>
                  {uniqueDurasi.map(durasi => (
                    <option key={durasi} value={durasi}>{durasi} menit</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Soal</label>
                <select
                  value={columnFilters.jumlahSoal}
                  onChange={(e) => setColumnFilters({ ...columnFilters, jumlahSoal: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Jumlah</option>
                  {uniqueJumlahSoal.map(jumlah => (
                    <option key={jumlah} value={jumlah}>{jumlah} soal</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-center py-6 text-gray-600">Loading...</p>
      ) : (
        <>
          {hasActiveFilters && (
            <div className="mb-3 text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{filteredData.length}</span> dari <span className="font-semibold">{dataUjian.length}</span> ujian
            </div>
          )}

          <div className="overflow-x-auto bg-white shadow rounded-lg mb-4 border border-gray-200">
            <table className="min-w-full text-gray-800 text-sm border-collapse">
              <thead className="bg-blue-900 text-white uppercase text-xs font-semibold">
                <tr className="border-b border-black">
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('nama')}
                  >
                    <div className="flex items-center justify-center">
                      Nama Ujian
                      {renderSortIcon('nama')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('kode')}
                  >
                    <div className="flex items-center justify-center">
                      Kode Ujian
                      {renderSortIcon('kode')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('jenis_ujian')}
                  >
                    <div className="flex items-center justify-center">
                      Jenis Ujian
                      {renderSortIcon('jenis_ujian')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('tanggal_mulai')}
                  >
                    <div className="flex items-center justify-center">
                      Mulai
                      {renderSortIcon('tanggal_mulai')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('tanggal_akhir')}
                  >
                    <div className="flex items-center justify-center">
                      Akhir
                      {renderSortIcon('tanggal_akhir')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('durasi')}
                  >
                    <div className="flex items-center justify-center">
                      Durasi
                      {renderSortIcon('durasi')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('jumlahSoal')}
                  >
                    <div className="flex items-center justify-center">
                      Soal
                      {renderSortIcon('jumlahSoal')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center">
                      Status
                      {renderSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-gray-500">
                      {hasActiveFilters ? 'Tidak ada ujian yang sesuai dengan filter' : 'Belum ada ujian'}
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
                      <td className="text-center">{u.nama}</td>
                      <td className="text-center">{u.kode}</td>
                      <td className="text-center">{u.jenis_ujian === 'PRETEST' ? 'Pre Test' : 'Post Test'}</td>
                      <td className="text-center">{formatTanggal(u.tanggal_mulai)}</td>
                      <td className="text-center">{formatTanggal(u.tanggal_akhir)}</td>
                      <td className="text-center">{u.durasi} menit</td>
                      <td className="text-center">{u.jumlahSoal}</td>
                      <td className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.status === 'Aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="text-center py-2">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/daftarUjian/lihatSoal?ujian_id=${u.id}`)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition cursor-pointer"
                            title="Lihat Soal"
                          >
                            <EyeIconSolid className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => router.push(`/admin/daftarUjian/editUjian?ujian_id=${u.id}`)}
                            className="p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded transition cursor-pointer"
                            title="Edit Ujian"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(u.id);
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition cursor-pointer"
                            title="Hapus Ujian"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openBagikanModal(u)}
                            className="p-2 bg-green-700 hover:bg-green-800 text-white rounded transition cursor-pointer"
                            title="Bagikan Ujian"
                          >
                            <ShareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
              Halaman {currentPage} dari {totalPages || 1}
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
      {showBagikanModal && selectedUjian && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">
              Bagikan Ujian: <span className="text-blue-700">{selectedUjian.nama}</span>
            </h2>

            <input
              type="text"
              placeholder="Cari peserta berdasarkan nama atau email..."
              value={searchPeserta}
              onChange={(e) => setSearchPeserta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            <div className="mb-2 text-sm text-gray-600">Peserta Belum Dibagikan:</div>
            <div className="border border-gray-300 rounded max-h-40 overflow-y-auto p-2 mb-4">
              {pesertaBelumFiltered.length === 0 ? (
                <p className="text-center text-gray-600">Tidak ada peserta tersedia</p>
              ) : (
                pesertaBelumFiltered.map((p) => (
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
                      {p.Nama_Lengkap} — <span className="text-gray-500">{p.Email}</span>
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="mb-2 text-sm text-gray-600">Peserta Sudah Dibagikan:</div>
            <div className="border border-gray-300 rounded max-h-40 overflow-y-auto p-2 mb-4 bg-gray-50">
              {pesertaSudahFiltered.length === 0 ? (
                <p className="text-center text-gray-600">Belum ada peserta yang dibagikan</p>
              ) : (
                pesertaSudahFiltered.map((p) => (
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
                      {p.Nama_Lengkap} — <span className="text-gray-500">{p.Email}</span>
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBagikanModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={kirim}
                disabled={selectedEmails.length === 0}
                className={`px-4 py-2 rounded text-white transition cursor-pointer ${
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

      {/* Modal Kloning */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Kloning Ujian</h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Ujian</label>
            <select
              value={selectedCloneId}
              onChange={(e) => setSelectedCloneId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">-- Pilih ujian --</option>
              {dataUjian.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.kode})
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Soal Baru</label>
            <input
              type="text"
              value={kodeSoalBaru}
              onChange={(e) => setKodeSoalBaru(e.target.value)}
              placeholder="Masukkan kode soal baru"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCloneModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleClone}
                disabled={loadingClone}
                className={`px-4 py-2 rounded text-white transition cursor-pointer ${
                  loadingClone ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loadingClone ? 'Mengkloning...' : 'Kloning'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && selectedUjian && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Konfirmasi Hapus
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Apakah Anda yakin ingin menghapus ujian{' '}
              <span className="font-bold">{selectedUjian.nama}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className={`px-4 py-2 rounded text-white cursor-pointer ${
                  actionLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}