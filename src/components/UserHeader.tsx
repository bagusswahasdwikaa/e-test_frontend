'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { FaUserCircle, FaSearch } from 'react-icons/fa';

interface UserHeaderProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  userName?: string;
  isSidebarCollapsed: boolean; // tambahkan ini
}

export default function UserHeader({
  searchTerm,
  setSearchTerm,
  userName = 'User',
  isSidebarCollapsed, // terima prop ini
}: UserHeaderProps) {
  return (
    <header className="bg-blue-900 text-white flex items-center justify-between px-6 py-3 sticky top-0 z-30">
      <div className="text-lg font-semibold select-none">User Dashboard</div>

      {/* Search input */}
      <div className="relative w-1/3 max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Cari"
          className="w-full pl-10 pr-4 py-2 rounded-md text-gray-100 border border-white focus:outline-none focus:ring-0 focus:border-3 focus:border-blue-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Profil Icon */}
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <span className="hidden sm:inline text-sm font-medium">{userName}</span>
        <FaUserCircle size={28} />
      </div>
    </header>
  );
}
