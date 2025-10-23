'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaKey,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
} from 'react-icons/fa';

export default function ChangePasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ Ubah nilai input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset error untuk field ini
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Toggle visibilitas password
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ✅ Validasi sederhana di sisi frontend
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.current_password) newErrors.current_password = 'Password lama wajib diisi.';
    if (!formData.new_password) newErrors.new_password = 'Password baru wajib diisi.';
    else if (formData.new_password.length < 8)
      newErrors.new_password = 'Password baru minimal 8 karakter.';
    if (!formData.new_password_confirmation)
      newErrors.new_password_confirmation = 'Konfirmasi password wajib diisi.';
    else if (formData.new_password !== formData.new_password_confirmation)
      newErrors.new_password_confirmation = 'Konfirmasi password tidak cocok.';
    if (
      formData.current_password &&
      formData.new_password &&
      formData.current_password === formData.new_password
    )
      newErrors.new_password = 'Password baru harus berbeda dari password lama.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit ubah password ke backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // 🔥 GUNAKAN TOKEN LOGIN YANG BENAR
      if (!token) {
        router.push('/authentication/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: formData.current_password,
            new_password: formData.new_password,
            new_password_confirmation: formData.new_password_confirmation,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Password berhasil diubah.');
        setFormData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
        setErrors({});
        // Redirect otomatis setelah 2 detik
        setTimeout(() => {
          router.push('/user/profil');
        }, 2000);
      } else {
        // Tampilkan error dari backend
        if (data.errors) setErrors(data.errors);
        setErrorMessage(data.message || 'Gagal mengubah password.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cek kekuatan password baru
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Sangat Lemah', color: 'bg-red-500' },
      { strength: 2, label: 'Lemah', color: 'bg-orange-500' },
      { strength: 3, label: 'Sedang', color: 'bg-yellow-500' },
      { strength: 4, label: 'Kuat', color: 'bg-blue-500' },
      { strength: 5, label: 'Sangat Kuat', color: 'bg-green-500' },
    ];
    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  // ✅ UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Tombol kembali */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform cursor-pointer" />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Kartu utama */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaKey className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Ubah Kata Sandi</h1>
                <p className="text-blue-100 mt-1">Perbarui kata sandi akun Anda</p>
              </div>
            </div>
          </div>

          {/* Pesan sukses */}
          {successMessage && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <FaCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Berhasil!</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Pesan error */}
          {errorMessage && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <FaExclamationCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Gagal!</h3>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Input password lama */}
            <PasswordField
              label="Kata Sandi Lama"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              show={showPasswords.current}
              onToggle={() => togglePasswordVisibility('current')}
              error={errors.current_password}
              icon={<FaLock />}
              placeholder="Masukkan kata sandi lama"
            />

            {/* Input password baru */}
            <PasswordField
              label="Kata Sandi Baru"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              show={showPasswords.new}
              onToggle={() => togglePasswordVisibility('new')}
              error={errors.new_password}
              icon={<FaKey />}
              placeholder="Masukkan kata sandi baru"
            />

            {/* Indikator kekuatan password */}
            {formData.new_password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
                </div>
              </div>
            )}

            {/* Konfirmasi password baru */}
            <PasswordField
              label="Konfirmasi Kata Sandi Baru"
              name="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              show={showPasswords.confirm}
              onToggle={() => togglePasswordVisibility('confirm')}
              error={errors.new_password_confirmation}
              icon={<FaLock />}
              placeholder="Masukkan ulang kata sandi baru"
            />

            {/* Tombol aksi */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-400 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
              >
                {loading ? 'Memproses...' : 'Ubah Kata Sandi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ✅ Komponen Field Password reusable
function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  error,
  icon,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  show: boolean;
  onToggle: () => void;
  error?: string;
  icon: React.ReactElement;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-3 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
