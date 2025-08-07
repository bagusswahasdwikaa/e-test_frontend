'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';

type UserProfile = {
  nama: string;
  email: string;
  fotoUrl?: string;
  bio: string; // jadikan wajib, bukan optional
};

export default function AdminProfilPage() {
  const [profile, setProfile] = useState<UserProfile>({
    nama: '',
    email: '',
    fotoUrl: '',
    bio: '', // harus ada nilai default string
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await new Promise((r) => setTimeout(r, 800));
        const data: UserProfile = {
          nama: 'Admin User',
          email: 'admin@example.com',
          fotoUrl: 'https://i.pravatar.cc/150?img=12',
          bio: 'Administrator sistem dengan pengalaman lebih dari 5 tahun.',
        };
        setProfile(data);
      } catch {
        setError('Gagal memuat data profil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const onFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, fotoUrl: reader.result as string }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess('Profil berhasil diperbarui!');
    } catch {
      setError('Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setTimeout(() => {
      setProfile({
        nama: 'Admin User',
        email: 'admin@example.com',
        fotoUrl: 'https://i.pravatar.cc/150?img=12',
        bio: 'Administrator sistem dengan pengalaman lebih dari 5 tahun.',
      });
      setLoading(false);
    }, 500);
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-600">Memuat profil...</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg transition-shadow hover:shadow-2xl duration-300">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">
          Profil Saya
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md font-medium">
            {success}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Foto Profil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-lg border-4 border-blue-600">
              {profile.fotoUrl ? (
                <img
                  src={profile.fotoUrl}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-6xl font-bold">
                  ?
                </div>
              )}
            </div>
            <label
              htmlFor="uploadFoto"
              className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800"
              title="Upload foto profil"
            >
              Ubah Foto Profil
            </label>
            <input
              type="file"
              id="uploadFoto"
              accept="image/*"
              onChange={onFotoChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Format: JPG, PNG. Maks 2MB.
            </p>
          </div>

          {/* Form Profil */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!saving) onSave();
            }}
            className="flex-1 w-full max-w-md space-y-6"
          >
            <div>
              <label
                htmlFor="nama"
                className="block mb-1 font-semibold text-gray-700"
              >
                Nama Lengkap
              </label>
              <input
                id="nama"
                type="text"
                required
                value={profile.nama}
                onChange={(e) => onChange('nama', e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-1 font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={profile.email}
                onChange={(e) => onChange('email', e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Masukkan email"
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email ini digunakan untuk login dan komunikasi.
              </p>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block mb-1 font-semibold text-gray-700"
              >
                Bio Singkat
              </label>
              <textarea
                id="bio"
                rows={4}
                maxLength={250}
                value={profile.bio}
                onChange={(e) => onChange('bio', e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Ceritakan tentang diri Anda"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">
                {profile.bio.length}/250
              </p>
            </div>

            {/* Tombol aksi */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onReset}
                disabled={saving}
                className="px-5 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
