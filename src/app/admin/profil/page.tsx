'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';

type UserProfile = {
  nama: string;
  email: string;
  fotoUrl?: string;
  bio: string;
};

export default function AdminProfilPage() {
  const [profile, setProfile] = useState<UserProfile>({
    nama: '',
    email: '',
    fotoUrl: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Gagal mengambil data profil.');
        const data = await res.json();
        const fullName = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim();
        setProfile({
          nama: fullName,
          email: data.email,
          fotoUrl: data.photo_url || '',
          bio: data.bio || '',
        });
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat profil.');
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
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.nama,
          email: profile.email,
          bio: profile.bio,
          photo_url: profile.fotoUrl,
        }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan perubahan profil.');
      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    window.location.reload();
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-600">Memuat profil...</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-6">
          <div
            className="w-36 h-36 rounded-full overflow-hidden border-4 shadow-md"
            style={{ borderColor: '#2F80ED' /* Warna dari palet Anda */ }}
          >
            {profile.fotoUrl ? (
              <img
                src={profile.fotoUrl}
                alt="Foto Profil"
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 text-6xl font-bold">
                ?
              </div>
            )}
          </div>

          {!isEditing ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">{profile.nama || 'Nama Belum Tersedia'}</h1>
              <p className="text-gray-700 text-lg">{profile.email || 'Email Belum Tersedia'}</p>
              <p className="text-gray-500 text-center">{profile.bio || 'Bio belum ditambahkan.'}</p>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setError(null);
                  setSuccess(null);
                }}
                className="mt-5 px-6 py-2 rounded transition-shadow shadow bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 cursor-pointer"
              >
                Edit Profil
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!saving) onSave();
              }}
              className="w-full space-y-6"
            >
              {(error || success) && (
                <div
                  className={`p-4 rounded-lg ${
                    error ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
                  }`}
                >
                  {error || success}
                </div>
              )}

              <div>
                <label className="block font-medium mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={profile.nama}
                  onChange={(e) => onChange('nama', e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring focus:ring-[#56CCF2]"
                  placeholder="Masukkan Nama Lengkap"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring focus:ring-[#56CCF2]"
                  placeholder="Masukkan Email"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  maxLength={250}
                  onChange={(e) => onChange('bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded resize-none focus:ring focus:ring-[#56CCF2]"
                  placeholder="Tambahkan bio singkat tentang dirimu"
                />
                <p className="text-gray-500 text-right text-sm">{profile.bio.length}/250</p>
              </div>

              <div className="flex flex-col items-start">
                <label
                  htmlFor="uploadFoto"
                  className="font-medium cursor-pointer text-[#2F80ED] hover:underline"
                >
                  Unggah Foto Baru
                </label>
                <input
                  type="file"
                  id="uploadFoto"
                  accept="image/*"
                  onChange={onFotoChange}
                  className="hidden"
                />
                {profile.fotoUrl && (
                  <img
                    src={profile.fotoUrl}
                    alt="Preview Foto Profil"
                    className="w-20 h-20 mt-2 rounded-full border shadow-md object-cover"
                  />
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-300">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onReset()}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-60 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
