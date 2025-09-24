'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { FiUpload } from 'react-icons/fi';

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  fotoUrl: string | null;
  bio: string;
  fotoBase64?: string | null;
};

export default function AdminProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    fotoUrl: null,
    bio: '',
    fotoBase64: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'admin') {
        router.replace('/authentication/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error('Gagal mengambil data profil.');

        const data = await res.json();

        const fullName = data.full_name || `${data.first_name} ${data.last_name}`.trim();
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ') || '';
        const rawPhotoUrl = data.photo_url || '';
        const absolutePhotoUrl = rawPhotoUrl.startsWith('http')
          ? rawPhotoUrl
          : `http://localhost:8000${rawPhotoUrl}`;

        setProfile({
          firstName,
          lastName,
          email: data.email,
          fotoUrl: rawPhotoUrl ? absolutePhotoUrl : null,
          bio: data.bio || '',
          fotoBase64: null,
        });

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
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setProfile((prev) => ({
          ...prev,
          fotoUrl: result,
          fotoBase64: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const onDeletePhoto = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8000/api/profile/photo', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Gagal menghapus foto profil.');

      setProfile((prev) => ({ ...prev, fotoUrl: null, fotoBase64: null }));
      localStorage.removeItem('profile_picture');
      setSuccess('Foto profil berhasil dihapus.');
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus foto.');
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) return;

    const full_name = `${profile.firstName} ${profile.lastName}`.trim();

    try {
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
          photo_url: profile.fotoBase64 || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal memperbarui profil.');
      }

      const data = await res.json();

      setSuccess(data.message || 'Profil berhasil diperbarui');
      setIsEditing(false);
      setProfile((prev) => ({
        ...prev,
        fotoUrl: data.photo_url || prev.fotoUrl,
        fotoBase64: null,
      }));
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    window.location.reload();
  };

  // if (loading) {
  //   return (
  //     <AdminLayout>
  //       <div className="p-6 text-center text-gray-600">Memuat profil...</div>
  //     </AdminLayout>
  //   );
  // }

  return (
    <AdminLayout>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
          {/* Logo diam di tengah */}
          <div className="relative w-35 h-35">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/assets/logo/panasonic-logo.png"
                alt="Logo Panasonic"
                className="w-25 h-25 object-contain"
              />
            </div>

            {/* Spinner berputar di belakang logo */}
            <div className="absolute inset-0 animate-spin rounded-full border-t-7 border-white border-solid"></div>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center gap-6">
          <div
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 cursor-pointer"
            onClick={() => profile.fotoUrl && setPreviewOpen(true)}
          >
            {profile.fotoUrl ? (
              <img src={profile.fotoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200 text-4xl text-gray-500">?</div>
            )}
          </div>

          {!isEditing ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500 text-center">{profile.bio || 'Belum ada bio.'}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition"
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
                <div className={`p-3 rounded ${error ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {error || success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label>Nama Depan</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={profile.firstName}
                    onChange={(e) => onChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label>Nama Belakang</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={profile.lastName}
                    onChange={(e) => onChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={profile.email}
                  onChange={(e) => onChange('email', e.target.value)}
                />
              </div>

              <div>
                <label>Bio</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => onChange('bio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="photo-upload" className="flex items-center gap-2 text-blue-600 cursor-pointer">
                  <FiUpload />
                  Unggah Foto Baru
                </label>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={onFotoChange}
                  className="hidden"
                />
                {profile.fotoUrl && (
                  <div className="flex items-center gap-4">
                    <img src={profile.fotoUrl} className="w-16 h-16 rounded-full object-cover" />
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline cursor-pointer"
                      onClick={onDeletePhoto}
                    >
                      Hapus Foto
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
        </div>

        {previewOpen && profile.fotoUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setPreviewOpen(false)}
          >
            <div className="bg-white p-4 rounded shadow-lg max-w-xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-700 text-xl"
                onClick={() => setPreviewOpen(false)}
              >
                &times;
              </button>
              <img src={profile.fotoUrl} className="w-full h-auto rounded" alt="Preview Besar" />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
