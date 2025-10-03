'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieLabelRenderProps,
} from 'recharts';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  peserta: {
    aktif: number;
    tidak_aktif: number;
    total: number;
  };
  ujian: {
    aktif: number;
    belum_dimulai: number;
    selesai: number;
    non_aktif: number;
    total: number;
  };
  rata_rata_nilai: {
    id_ujian: number;
    nama_ujian: string;
    status_ujian: string;
    rata_rata_nilai: number;
    jumlah_peserta: number;
    sudah_mengerjakan: number;
    belum_mengerjakan: number;
  }[];
}

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [API_BASE_URL]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'aktif': 'bg-green-100 text-green-800 border-green-200',
      'belum dimulai': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'selesai': 'bg-blue-100 text-blue-800 border-blue-200',
      'non aktif': 'bg-red-100 text-red-800 border-red-200',
      'tidak aktif': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const colorClass = statusColors[status.toLowerCase() as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
        {status}
      </span>
    );
  };

  const getProgressBar = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600 min-w-[3rem]">
          {percentage.toFixed(0)}%
        </span>
      </div>
    );
  };

  return (
    <AdminLayout searchTerm={''} setSearchTerm={() => {}}>
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
      <div className="space-y-8">
        {/* Header dengan desain yang lebih menarik */}
        <header className="mb-8">
          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white shadow-lg">
            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
              <img 
                src="/assets/logo/panasonic-logo.png" 
                alt="Panasonic Logo"
                className="h-4 w-25 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Beranda Admin</h1>
              <p className="text-blue-100 mt-1">Kelola dan pantau sistem ujian online</p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 font-semibold">Error: {error}</div>
          </div>
        ) : !data ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <div className="text-gray-600">Tidak ada data tersedia</div>
          </div>
        ) : (
          <>
            {/* Statistik Cards dengan desain modern */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Peserta Aktif',
                  value: data.peserta.aktif,
                  icon: <UserGroupIcon className="h-8 w-8" />,
                  gradient: 'from-green-500 to-emerald-600',
                  bgPattern: 'bg-green-50',
                },
                {
                  title: 'Peserta Tidak Aktif',
                  value: data.peserta.tidak_aktif,
                  icon: <UserGroupIcon className="h-8 w-8" />,
                  gradient: 'from-red-500 to-pink-600',
                  bgPattern: 'bg-red-50',
                },
                {
                  title: 'Total Peserta',
                  value: data.peserta.total,
                  icon: <UserGroupIcon className="h-8 w-8" />,
                  gradient: 'from-blue-500 to-indigo-600',
                  bgPattern: 'bg-blue-50',
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className={`${card.bgPattern} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {card.title}
                      </h3>
                      <p className="text-4xl font-bold text-gray-900 mt-2">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grafik dengan desain yang diperbaiki */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart - Distribusi Peserta */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <AcademicCapIcon className="h-6 w-6 text-green-600" />
                  </div>
                  Diagram Akun Peserta
                </h2>

                {(data.peserta.aktif === 0 && data.peserta.tidak_aktif === 0) ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <AcademicCapIcon className="h-16 w-16 mb-4" />
                    <p className="text-lg">Tidak ada data peserta</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Aktif', value: data.peserta.aktif },
                          { name: 'Tidak Aktif', value: data.peserta.tidak_aktif },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={60}
                        label={({ value, payload }: PieLabelRenderProps) => {
                          const typedPayload = payload as { name: string };
                          return `${value}`;
                        }}
                        dataKey="value"
                        strokeWidth={3}
                        stroke="#fff"
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value} Peserta`, 'Jumlah']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Bar Chart - Status Ujian */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  Status Ujian
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={[
                      { name: 'Aktif', value: data.ujian.aktif },
                      { name: 'Belum Dimulai', value: data.ujian.belum_dimulai },
                      { name: 'Selesai', value: data.ujian.selesai },
                    ]}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[3]} />
                      <Cell fill={COLORS[2]} />
                      <Cell fill={COLORS[1]} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabel Nilai dengan desain modern */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  Rata-rata Nilai per Ujian
                </h2>
                <p className="text-gray-600 mt-2">Statistik lengkap performa ujian dan partisipasi peserta</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Nama Ujian
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Total Peserta
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Progress Pengerjaan
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Rata-rata Nilai
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.rata_rata_nilai.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <ChartBarIcon className="h-16 w-16 mb-4" />
                            <p className="text-lg font-medium">Data tidak ditemukan</p>
                            <p className="text-sm">Belum ada ujian yang tersedia</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.rata_rata_nilai.map((item, index) => (
                        <tr
                          key={item.id_ujian}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base">
                                  {item.nama_ujian}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ID: {item.id_ujian}
                                </p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5 text-center">
                            {getStatusBadge(item.status_ujian)}
                          </td>
                          
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl font-bold text-gray-900">
                                {item.jumlah_peserta}
                              </span>
                              <span className="text-xs text-gray-500">
                                Peserta
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5">
                            <div className="space-y-2">
                              {getProgressBar(item.sudah_mengerjakan, item.jumlah_peserta)}
                              <div className="flex justify-between text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Selesai: {item.sudah_mengerjakan}
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  Belum: {item.belum_mengerjakan}
                                </span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {item.rata_rata_nilai}
                              </span>
                              <div className="flex">
                                {/* {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= Math.round(item.rata_rata_nilai / 20)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))} */}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}