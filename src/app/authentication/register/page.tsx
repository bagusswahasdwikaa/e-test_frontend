'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    id: '',
    firstName: '',
    lastName: '',
    instansi: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { id, firstName, lastName, email, instansi, password, password_confirmation } = form;

    // Validasi input
    if (!id || !firstName || !lastName || !email || !instansi ||!password || !password_confirmation) {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        alert('Nama hanya boleh berisi huruf dan spasi.');
        return;
      }
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
          id: id.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          instansi: instansi.trim(),
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
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/logo/bg-panasonic.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Overlay untuk membuat teks lebih terbaca */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Form Container - Centered */}
      <div className="w-full max-w-md relative z-20">
        <div className="w-full backdrop-blur-md bg-white/30 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center text-white mb-9">Daftar PGLSMID e-test</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full">
            <input
              type="number"
              name="id"
              placeholder="NIK"
              value={form.id}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 16) {
                  handleChange(e);
                }
              }}
              className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <input
              type="text"
              name="firstName"
              placeholder="Nama Depan"
              value={form.firstName}
              onChange={handleChange}
              onBeforeInput={(e) => {
                if (!/^[A-Za-z\s]+$/.test(e.data || '')) {
                  e.preventDefault();
                }
              }}
              className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              pattern="[A-Za-z\s]+"
              maxLength={60}
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Nama Belakang"
              value={form.lastName}
              onChange={handleChange}
              onBeforeInput={(e) => {
                if (!/^[A-Za-z\s]+$/.test(e.data || '')) {
                  e.preventDefault();
                }
              }}
              className="w-full bg-white border border-white text-black placeholder-[#979797] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              pattern="[A-Za-z\s]+"
              maxLength={60}
              required
            />
            <input
              type="instansi"
              name="instansi"
              placeholder="Sekolah/Departemen"
              value={form.instansi}
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
  );
}