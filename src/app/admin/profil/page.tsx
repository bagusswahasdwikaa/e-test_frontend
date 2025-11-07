'use client';

import React, { useState, useEffect, ChangeEvent, useCallback, useRef } from 'react';
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

type Point = {
  x: number;
  y: number;
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

  // Image crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'admin') {
        router.replace('/authentication/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
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
        setImageToCrop(result);
        setShowCropModal(true);
        setCrop({ x: 0, y: 0 });
        setZoom(0.8);
        
        // Load image untuk mendapatkan dimensi
        const img = new Image();
        img.onload = () => {
          setImageElement(img);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setCrop({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getCroppedImg = async (): Promise<string> => {
    if (!imageElement || !containerRef.current) return '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context tidak tersedia');

    const cropSize = 500; // Size of circle crop area (increased from 240)
    canvas.width = cropSize;
    canvas.height = cropSize;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Calculate the source coordinates on the original image
    const scaledWidth = imageElement.width * zoom;
    const scaledHeight = imageElement.height * zoom;
    
    // Position of top-left corner of the image in the container
    const imgX = centerX + crop.x - (scaledWidth / 2);
    const imgY = centerY + crop.y - (scaledHeight / 2);
    
    // Calculate which part of the image is in the crop circle
    const cropCenterX = centerX;
    const cropCenterY = centerY;
    const cropRadius = cropSize / 2;
    
    // Map back to original image coordinates
    const sourceX = (cropCenterX - cropRadius - imgX) / zoom;
    const sourceY = (cropCenterY - cropRadius - imgY) / zoom;
    const sourceSize = cropSize / zoom;

    // Create circular clip
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw the cropped portion
    ctx.drawImage(
      imageElement,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      cropSize,
      cropSize
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve('');
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop) return;

    try {
      const croppedImage = await getCroppedImg();
      if (croppedImage) {
        setProfile((prev) => ({
          ...prev,
          fotoUrl: croppedImage,
          fotoBase64: croppedImage,
        }));
        setShowCropModal(false);
        setImageToCrop(null);
        setImageElement(null);
      }
    } catch (e) {
      console.error('Error cropping image:', e);
      setError('Gagal memotong gambar');
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setImageElement(null);
    setCrop({ x: 0, y: 0 });
    setZoom(0.8);
  };

  const onDeletePhoto = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/photo`, {
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
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus foto.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token tidak ditemukan. Silakan login kembali.');
      setSaving(false);
      return;
    }

    const full_name = `${profile.firstName} ${profile.lastName}`.trim();

    try {
      const payload: any = {
        full_name,
        email: profile.email,
        bio: profile.bio,
      };

      // Hanya kirim photo_url jika ada perubahan (fotoBase64 tidak null)
      if (profile.fotoBase64) {
        payload.photo_url = profile.fotoBase64;
      }

      console.log('Sending payload:', { ...payload, photo_url: payload.photo_url ? '[BASE64_DATA]' : 'null' });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Gagal memperbarui profil' }));
        throw new Error(errData.message || 'Gagal memperbarui profil.');
      }

      const data = await res.json();
      console.log('Response dari server:', data);

      setSuccess(data.message || 'Profil berhasil diperbarui!');
      setIsEditing(false);

      // Update localStorage
      localStorage.setItem('first_name', profile.firstName);
      localStorage.setItem('last_name', profile.lastName);
      
      if (data.photo_url) {
        const absolutePhotoUrl = data.photo_url.startsWith('http')
          ? data.photo_url
          : `http://localhost:8000${data.photo_url}`;
        
        localStorage.setItem('profile_picture', data.photo_url);
        
        setProfile((prev) => ({
          ...prev,
          fotoUrl: absolutePhotoUrl,
          fotoBase64: null,
        }));
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    window.location.reload();
  };

  return (
    <AdminLayout>
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

      <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center gap-6">
          <div
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 cursor-pointer hover:opacity-80 transition"
            onClick={() => profile.fotoUrl && !isEditing && setPreviewOpen(true)}
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
              <p className="text-sm text-gray-500 text-center max-w-md">{profile.bio || 'Belum ada bio.'}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
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
                <div className={`p-3 rounded-lg ${error ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {error || success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Depan</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profile.firstName}
                    onChange={(e) => onChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profile.lastName}
                    onChange={(e) => onChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profile.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => onChange('bio', e.target.value)}
                  placeholder="Ceritakan tentang diri Anda..."
                />
              </div>

              <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label htmlFor="photo-upload" className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
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
                  <div className="flex items-center gap-4 mt-3">
                    <img src={profile.fotoUrl} className="w-16 h-16 rounded-full object-cover border-2 border-gray-300" alt="Current" />
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

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer transition"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '⏳ Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Preview Modal */}
        {previewOpen && profile.fotoUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <div className="bg-white p-4 rounded-lg shadow-xl max-w-2xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-700 text-2xl hover:text-gray-900 w-8 h-8 flex items-center justify-center bg-white rounded-full"
                onClick={() => setPreviewOpen(false)}
              >
                &times;
              </button>
              <img src={profile.fotoUrl} className="w-full h-auto rounded" alt="Preview Besar" />
            </div>
          </div>
        )}

        {/* Crop Modal */}
        {showCropModal && imageToCrop && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Sesuaikan Foto Profil</h2> 
              
              {/* Crop Area */}
              <div 
                ref={containerRef}
                className="relative w-full h-[650px] bg-gray-900 rounded-lg overflow-hidden mb-4 cursor-move"
                onMouseDown={handleMouseDown}
                style={{ userSelect: 'none' }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {imageToCrop && (
                    <img
                      src={imageToCrop}
                      alt="To crop"
                      style={{
                        transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                        maxWidth: 'none',
                        maxHeight: 'none',
                        pointerEvents: 'none',
                      }}
                      className="absolute"
                      draggable={false}
                    />
                  )}
                  {/* Crop circle overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full">
                      <defs>
                        <mask id="cropMask">
                          <rect width="100%" height="100%" fill="white" />
                          <circle cx="50%" cy="50%" r="300" fill="black" />
                        </mask>
                      </defs>
                      <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#cropMask)" />
                      <circle cx="50%" cy="50%" r="300" fill="none" stroke="white" strokeWidth="3" strokeDasharray="8,4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Zoom Control */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Zoom
                  </label>
                  <span className="text-sm font-semibold text-blue-600">
                    {zoom.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>1.5x</span>
                  <span>2x</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCropCancel}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  Gunakan Foto Ini
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}