'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function TambahPesertaPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    instansi: '',
    password: '',
    password_confirmation: '',
    status: 'aktif',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validasi konfirmasi password
    if (formData.password !== formData.password_confirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('http://localhost:8000/api/peserta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // Hapus header Authorization jika backend tidak pakai autentikasi
          // 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menambahkan peserta.');
      }

      setSuccess('Peserta berhasil ditambahkan.');

      // Reset form
      setFormData({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        instansi: '',
        password: '',
        password_confirmation: '',
        status: 'aktif',
      });

      // Redirect setelah 1 detik ke daftar peserta
      setTimeout(() => router.push('/admin/daftarPeserta'), 1000);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Tambah Peserta</h2>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">ID Peserta</label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nama Depan</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nama Belakang</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Sekolah/Departemen</label>
            <input
              type="text"
              name="instansi"
              value={formData.instansi}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Kata Sandi</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm cursor-pointer"
              required
            >
              <option value="aktif">Aktif</option>
              <option value="non-aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/daftarPeserta')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
