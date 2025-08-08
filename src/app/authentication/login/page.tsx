'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cek jika sudah login sebelumnya
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role === 'user') {
      router.replace('/user/dashboard');
    } else if (token && role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal login.');
      }

      const data = await res.json();

      // Simpan token dan role
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role); // <== PENTING
      localStorage.setItem('first_name', data.user.first_name || '');
      localStorage.setItem('last_name', data.user.last_name || '');

      // Redirect berdasarkan role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'user') {
        router.push('/user/dashboard');
      } else {
        throw new Error('Role tidak dikenali.');
      }

    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#5E7798] flex flex-col lg:flex-row items-center justify-between p-6 overflow-hidden">
      {/* Background & Decorative Elements */}
      <div className="absolute right-8 top-16 w-72 h-[700px] lg:w-[20rem] lg:h-[90vh] bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#5E7798] rounded-2xl shadow-2xl backdrop-blur-md opacity-70 animate-pulse z-0"></div>
      <div className="absolute left-10 bottom-20 w-48 h-48 bg-gradient-to-tr from-[#8CA6DB] to-[#B993D6] rounded-xl shadow-lg blur-sm opacity-60 rotate-12 z-0"></div>
      <div className="absolute right-36 top-[30%] w-24 h-24 bg-[#fefefe] rounded-full opacity-40 animate-bounce blur-sm z-0"></div>

      {/* Image */}
      <div className="absolute right-4 lg:right-44 top-36 lg:top-40 z-10">
        <Image
          src="/assets/img/pic2.png"
          alt="Decorative Image"
          width={350}
          height={350}
          className="object-cover rounded-lg"
        />
      </div>

      {/* Form Section */}
      <div className="relative z-30 flex justify-start ml-20 w-full px-6 lg:px-20">
        <div className="w-full max-w-md backdrop-blur-md bg-white/30 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Masuk E-Test</h2>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Kata Sandi"
              value={form.password}
              onChange={handleChange}
              className="bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              required
            />

            <div className="text-right text-sm text-white -mt-2">
              <Link href="/authentication/forgotPassword" className="hover:text-gray-300">
                Lupa Kata Sandi?
              </Link>
            </div>

            {error && (
              <div className="text-red-200 bg-red-500/30 p-2 rounded text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#02030E] text-white font-semibold py-2 rounded-xl hover:opacity-90 transition"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-white">
            Belum punya akun?{' '}
            <Link href="/authentication/register" className="underline hover:text-gray-300">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
