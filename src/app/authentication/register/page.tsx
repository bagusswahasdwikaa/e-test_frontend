'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi kolom tidak boleh kosong
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.password_confirmation
    ) {
      alert('Kolom tidak boleh kosong');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });

      // Cek response dari API
      if (response.ok) {
        const result = await response.json();
        alert('Daftar berhasil!');
        localStorage.setItem('token', result.token); // Simpan token ke localStorage
        window.location.href = '/authentication/login'; // Arahkan ke halaman login
      } else {
        const error = await response.json();

        // Tampilkan pesan jika email sudah terdaftar
        if (error.message === 'Email sudah terdaftar') {
          alert('Email sudah terdaftar');
        } else if (
          error.errors &&
          error.errors.password &&
          error.errors.password.includes('The password field confirmation does not match.')
        ) {
          // Tampilkan pesan jika password tidak sesuai
          alert('Password atau kata sandi tidak sesuai');
        } else {
          alert('Registrasi gagal, periksa konsol untuk detail.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan, coba lagi nanti.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#5E7798] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Rectangles */}
      <div className="absolute bottom-20 right-16 w-24 h-24 bg-[#404040] opacity-40 rotate-45 rounded-lg z-0"></div>

      {/* Content Container */}
      <div className="flex flex-col md:flex-row items-center max-w-5xl w-full relative z-20">
        {/* Image Section */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0 flex justify-center">
          <Image
            src="/assets/img/pic1.png"
            alt="Ilustrasi"
            width={350}
            height={350}
            className="object-contain relative z-10"
          />
        </div>

        {/* Decorative Rectangles */}
        <div className="absolute top-[-1200px] left-12 translate-x-[-50%] w-70 h-350 bg-[#979797] opacity-100 rounded-3xl rotate-355 z-1"></div>
        <div className="absolute top-[-1200px] left-26 translate-x-[-50%] w-70 h-355 bg-[#404040] opacity-100 rounded-3xl z-5"></div>

        {/* Form Section with Blur */}
        <div className="w-full md:w-1/2 flex flex-col items-center px-4 md:px-8">
          <div className="w-full backdrop-blur-md bg-white/30 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-center text-white mb-9">
              Daftar E-Test
            </h2>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center justify-center space-y-6 w-full"
            >
              <input
                type="text"
                name="firstName"
                placeholder="Nama Depan"
                value={form.firstName}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Nama Belakang"
                value={form.lastName}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Kata Sandi"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <input
                type="password"
                name="password_confirmation"
                placeholder="Konfirmasi Kata Sandi"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#02030E] text-white font-semibold py-2 rounded-xl hover:opacity-90 transition"
              >
                Daftar
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-white">
              Sudah punya akun?{' '}
              <Link href="/authentication/login" className="underline hover:text-gray-300">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
