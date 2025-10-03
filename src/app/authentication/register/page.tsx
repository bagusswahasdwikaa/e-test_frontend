'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    id: '',
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

    const { id, firstName, lastName, email, password, password_confirmation } = form;

    // Validasi input
    if (!id || !firstName || !lastName || !email || !password || !password_confirmation) {
      alert('Semua kolom harus diisi.');
      return;
    }

    if (!/^\d+$/.test(id)) {
      alert('ID harus berupa angka.');
      return;
    }

    if (password !== password_confirmation) {
      alert('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(id, 10),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
          password_confirmation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registrasi berhasil!');
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        window.location.href = '/authentication/login';
      } else {
        const errors = data.errors
          ? Object.values(data.errors).flat().join('\n')
          : data.message || 'Terjadi kesalahan saat registrasi.';
        alert(errors);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan koneksi ke server.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#5E7798] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Rectangles */}
      <div className="absolute bottom-20 right-16 w-24 h-24 bg-[#404040] opacity-40 rotate-45 rounded-lg z-0"></div>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row items-center max-w-5xl w-full relative z-20">
        {/* Left Image */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0 flex justify-center">
          <Image
            src="/assets/img/pic1.png"
            alt="Ilustrasi"
            width={350}
            height={350}
            className="object-contain relative z-10"
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 flex flex-col items-center px-4 md:px-8">
          <div className="w-full backdrop-blur-md bg-white/30 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-center text-white mb-9">Daftar P-TEST</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full">
              <input
                type="number"
                name="id"
                placeholder="ID"
                value={form.id}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <input
                type="text"
                name="firstName"
                placeholder="Nama Depan"
                value={form.firstName}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                pattern="[A-Za-z]+"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Nama Belakang"
                value={form.lastName}
                onChange={handleChange}
                className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                pattern="[A-Za-z]+"
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
                className="w-full bg-[#02030E] text-white font-semibold py-2 rounded-xl hover:opacity-90 transition cursor-pointer"
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
