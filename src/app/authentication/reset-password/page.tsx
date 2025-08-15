'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token tidak ditemukan. Silakan periksa kembali tautan reset password Anda.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Token tidak tersedia.');
      return;
    }

    if (!email) {
      setError('Email wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          throw new Error(
            typeof firstError === 'string' ? firstError : (firstError as string[])[0]
          );
        }
        throw new Error(data.message || 'Gagal mereset kata sandi.');
      }

      setSuccess(data.message || 'Kata sandi berhasil direset.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat mereset kata sandi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#5E7798] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md backdrop-blur-md bg-white/30 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Kata Sandi</h2>

        {error && (
          <div className="text-red-200 bg-red-500/30 p-2 rounded text-sm mb-4">{error}</div>
        )}

        {success ? (
          <div className="text-green-200 bg-green-600/30 p-2 rounded text-sm text-center">
            {success}
            <p className="mt-4">
              <Link href="/authentication/login" className="underline hover:text-gray-300">
                Kembali ke Halaman Masuk
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Kata Sandi Baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-[#02030E] text-white font-semibold py-2 rounded-xl hover:opacity-90 transition cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Reset Kata Sandi'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white">
          Kembali ke{' '}
          <Link href="/authentication/login" className="underline hover:text-gray-300">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
