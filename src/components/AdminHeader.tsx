'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { FaUserCircle, FaSearch } from 'react-icons/fa';

interface AdminHeaderProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function AdminHeader({ searchTerm, setSearchTerm }: AdminHeaderProps) {
  return (
    <header className="bg-blue-900 text-white flex items-center justify-between px-6 py-3">
      <div className="text-lg font-semibold">Admin Dashboard</div>

      {/* Search input */}
      <div className="relative w-1/3 max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Cari"
          className="w-full pl-10 pr-4 py-2 rounded-md text-gray border border-white focus:outline-none focus:ring-0 focus:border-3 focus:border-blue-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Profil Icon */}
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="hidden sm:inline">Admin</span>
        <FaUserCircle size={28} />
      </div>
    </header>
  );
}
