'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUserCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaBell,
  FaGlobe,
} from 'react-icons/fa';

interface UserHeaderProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  isSidebarCollapsed: boolean;
}

export default function UserHeader({
  searchTerm,
  setSearchTerm,
  isSidebarCollapsed,
}: UserHeaderProps) {
  const [userName, setUserName] = useState('User');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const router = useRouter();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Ambil info profil dari localStorage
  const loadUserInfo = () => {
    const firstName = localStorage.getItem('first_name');
    const lastName = localStorage.getItem('last_name');
    const profilePic = localStorage.getItem('profile_picture');

    const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    setUserName(name || 'User');

    if (profilePic) {
      const absoluteUrl = profilePic.startsWith('http')
        ? profilePic
        : `http://localhost:8000${profilePic}`;
      setProfilePicture(absoluteUrl);
    } else {
      setProfilePicture(null);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadUserInfo();

      // Optional: pantau storage jika diubah dari tab lain
      const handleStorageChange = () => {
        loadUserInfo();
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/authentication/login');
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    router.push('/user/profil');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lebar sidebar, 80px kalau collapse, 280px kalau terbuka (sesuai dengan sidebar baru)
  const sidebarWidth = isSidebarCollapsed ? 80 : 280;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header
      className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-between px-6 py-4 shadow-xl backdrop-blur-sm border-b border-white/10 transition-all duration-300"
      style={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        right: 0,
        height: 72, // tinggi header yang lebih proporsional
        width: `calc(100% - ${sidebarWidth}px)`,
        zIndex: 40,
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

      {/* Left Section - Brand */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
              P-TEST
            </h1>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-2xl mx-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Cari ujian, peserta, atau data lainnya..."
            className="w-full pl-12 pr-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-white/15"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </div>

      {/* Right Section - Time & Profile */}
      <div className="flex items-center gap-6 relative z-10">
        {/* Time Display */}
        <div className="hidden md:flex flex-col items-end">
          <div className="text-lg font-bold text-blue-200">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-blue-200/70 -mt-1">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative dropdown-container">
          <div
            className="flex items-center gap-3 cursor-pointer select-none bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 transition-all duration-200 hover:scale-105 group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Profile Picture */}
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaUserCircle className="text-white text-lg" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white/20"></div>
            </div>

            {/* User Info */}
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                {userName}
              </div>
              <div className="text-xs text-blue-200/70 -mt-0.5">
                Peserta
              </div>
            </div>

            {/* Dropdown Icon */}
            <div className="text-gray-400 group-hover:text-white transition-colors">
              {isDropdownOpen ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md text-gray-900 rounded-2xl shadow-2xl border border-gray-200/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <FaUserCircle className="text-white text-xl" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{userName}</div>
                    <div className="text-sm text-gray-600">Peserta</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 rounded-xl transition-colors cursor-pointer group"
                  onClick={handleProfile}
                >
                  <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                    <FaUserCircle className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Profil Saya</div>
                    <div className="text-xs text-gray-500">Kelola profil dan pengaturan</div>
                  </div>
                </button>

                <div className="my-2 border-t border-gray-100"></div>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 rounded-xl transition-colors cursor-pointer group"
                  onClick={handleLogout}
                >
                  <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                    <FaSignOutAlt className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Keluar</div>
                    <div className="text-xs text-gray-500">Keluar dari sistem Peserta</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}