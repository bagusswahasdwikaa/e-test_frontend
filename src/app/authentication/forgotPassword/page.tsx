'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Jika validasi gagal, data.errors biasanya ada
        if (data.errors && data.errors.email) {
          throw new Error(data.errors.email[0]);
        }
        // Pesan error umum
        throw new Error(data.message || 'Gagal mengirim link reset password.');
      }

      setSuccess(data.message || 'Link reset password telah dikirim ke email Anda.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim link reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#5E7798] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md backdrop-blur-md bg-white/30 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Lupa Kata Sandi</h2>
        <p className="text-white mb-6 text-center">
          Masukkan email Anda, dan kami akan mengirimkan tautan untuk mereset kata sandi.
        </p>

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

          {error && (
            <div className="text-red-200 bg-red-500/30 p-2 rounded text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-200 bg-green-600/30 p-2 rounded text-sm">{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#02030E] text-white font-semibold py-2 rounded-xl hover:opacity-90 transition"
          >
            {loading ? 'Memproses...' : 'Kirim Link Reset'}
          </button>
        </form>

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
