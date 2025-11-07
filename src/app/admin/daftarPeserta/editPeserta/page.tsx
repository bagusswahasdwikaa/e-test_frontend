'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function EditPesertaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    instansi: '',
    password: '',
    password_confirmation: '',
    status: 'aktif', // default value
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPeserta = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Gagal memuat data peserta');

        // Pisah nama lengkap jadi first_name dan last_name
        const fullName = (data.data['Nama Lengkap'] || '').split(' ');
        const first_name = fullName[0] || '';
        const last_name = fullName.slice(1).join(' ') || '';

        // Pastikan status sesuai value yang valid untuk backend
        let status = data.data.Status || 'aktif';
        if (status !== 'aktif' && status !== 'non aktif') {
          status = 'aktif'; // fallback jika data tidak valid
        }

        setFormData({
          id: data.data.ID_Peserta || '',
          first_name,
          last_name,
          instansi: data.data.instansi || '',
          email: data.data.Email || '',
          password: '',
          password_confirmation: '',
          status,
        });
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data peserta');
      }
    };

    fetchPeserta();
  }, [id]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validasi hanya huruf untuk input "first_name"
    if (name === "first_name" || name === "last_name") {
      const alphabetOnly = /^[A-Za-z\s]*$/; // huruf dan spasi
      if (!alphabetOnly.test(value)) return; // tolak input jika mengandung karakter non-huruf
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!id) {
      setError('ID peserta tidak ditemukan.');
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    // Validasi status hanya boleh 'aktif' atau 'non aktif'
    if (formData.status !== 'aktif' && formData.status !== 'non aktif') {
      setError('Status yang dipilih tidak valid.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memperbarui peserta.');
      }

      setSuccess('Peserta berhasil diperbarui.');
      setTimeout(() => router.push('/admin/daftarPeserta'), 1000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Edit Peserta</h2>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">NIK</label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 16) {
                  handleChange(e);
                }
              }}
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
            <label className="block text-sm font-medium">Kata Sandi (opsional)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
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
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            >
              <option value="aktif">Aktif</option>
              <option value="non aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/daftarPeserta')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer text-sm"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer text-sm"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
