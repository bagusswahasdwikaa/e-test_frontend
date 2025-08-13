'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '@/components/UserLayout';

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  fotoUrl?: string;
  bio: string;
};

export default function UserProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
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
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'user') {
        router.replace('/authentication/login');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error('Gagal mengambil data profil.');

        const data = await res.json();

        const fullName = data.full_name || `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim();
        const parts = fullName.split(' ');
        const firstName = parts.shift() || '';
        const lastName = parts.join(' ') || '';
        const rawPhotoUrl = data.photo_url || '';
        const absolutePhotoUrl = rawPhotoUrl.startsWith('http')
        ? rawPhotoUrl
        : `http://localhost:8000${rawPhotoUrl}`;

        setProfile({
          firstName,
          lastName,
          email: data.email,
          fotoUrl: absolutePhotoUrl,
          bio: data.bio || '',
        });

        // Simpan ke localStorage untuk konsistensi dengan UserHeader
        localStorage.setItem('first_name', firstName);
        localStorage.setItem('last_name', lastName);
        if (data.photo_url) {
          localStorage.setItem('profile_picture', data.photo_url);
        }

      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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
      const full_name = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();

      if (!full_name) {
        setError('Nama lengkap harus diisi.');
        setSaving(false);
        return;
      }

      const res = await fetch('http://localhost:8000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          full_name,
          email: profile.email,
          bio: profile.bio,
          photo_url: profile.fotoUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Gagal menyimpan perubahan profil.');
      }

      // ✅ Update localStorage
      localStorage.setItem('first_name', profile.firstName);
      localStorage.setItem('last_name', profile.lastName);
      if (profile.fotoUrl) {
        localStorage.setItem('profile_picture', profile.fotoUrl);
      }

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

  if (loading) {
    return (
      <UserLayout>
        <div className="p-6 text-center text-gray-600">Memuat profil...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-6">
          {/* Foto Profil */}
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 shadow-md" style={{ borderColor: '#2F80ED' }}>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {`${profile.firstName} ${profile.lastName}`.trim() || 'Nama Belum Tersedia'}
              </h1>
              <p className="text-gray-700 text-lg">{profile.email || 'Email Belum Tersedia'}</p>
              <p className="text-gray-500 text-center">{profile.bio || 'Bio belum ditambahkan.'}</p>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setError(null);
                  setSuccess(null);
                }}
                className="mt-5 px-6 py-2 rounded transition-shadow shadow bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
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
                <div className={`p-4 rounded-lg ${error ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                  {error || success}
                </div>
              )}

              <div>
                <label className="block font-medium mb-2">Nama Depan</label>
                <input
                  type="text"
                  required
                  value={profile.firstName}
                  onChange={(e) => onChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring focus:ring-[#56CCF2]"
                  placeholder="Masukkan Nama Depan"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Nama Belakang</label>
                <input
                  type="text"
                  required
                  value={profile.lastName}
                  onChange={(e) => onChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring focus:ring-[#56CCF2]"
                  placeholder="Masukkan Nama Belakang"
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
                  maxLength={250}
                  value={profile.bio}
                  onChange={(e) => onChange('bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded resize-none focus:ring focus:ring-[#56CCF2]"
                  placeholder="Tambahkan bio singkat tentang dirimu"
                />
                <p className="text-right text-sm text-gray-500">{profile.bio.length}/250</p>
              </div>

              <div className="flex flex-col items-start">
                <label htmlFor="uploadFoto" className="font-medium text-[#2F80ED] hover:underline cursor-pointer">
                  Unggah Foto Baru
                </label>
                <input type="file" id="uploadFoto" accept="image/*" onChange={onFotoChange} className="hidden" />
                {profile.fotoUrl && (
                  <img
                    src={profile.fotoUrl}
                    alt="Preview Foto"
                    className="w-20 h-20 mt-2 rounded-full border shadow object-cover"
                  />
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-300">
                <button
                  type="button"
                  disabled={saving}
                  onClick={onReset}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-60 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
