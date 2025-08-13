'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUserCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
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
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const firstName = localStorage.getItem('first_name');
      const lastName = localStorage.getItem('last_name');
      const profilePic = localStorage.getItem('profile_picture');

      if (firstName || lastName) {
        setUserName(`${firstName ?? ''} ${lastName ?? ''}`.trim());
      }

      if (profilePic) {
        const absoluteUrl = profilePic.startsWith('http')
          ? profilePic
          : `http://localhost:8000${profilePic}`;
        setProfilePicture(absoluteUrl);
      }
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

  return (
    <header
      className="bg-blue-900 text-white flex items-center justify-between px-6 py-3 sticky top-0 z-30 transition-all duration-300"
      style={{
        left: isSidebarCollapsed ? 80 : 256,
        right: 0,
        position: 'sticky',
      }}
    >
      <div className="text-lg font-semibold select-none">User Dashboard</div>

      {/* Search input */}
      <div className="relative w-1/3 max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Cari"
          className="w-full pl-10 pr-4 py-2 rounded-md text-gray-100 border border-white focus:outline-none focus:ring-0 focus:border-blue-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Profile section with dropdown */}
      <div className="relative flex items-center gap-2 cursor-pointer select-none">
        <span className="hidden sm:inline text-sm font-medium">{userName}</span>
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border"
            />
          ) : (
            <FaUserCircle size={28} />
          )}

          {isDropdownOpen ? (
            <FaChevronDown size={14} className="text-gray-300" />
          ) : (
            <FaChevronUp size={14} className="text-gray-300" />
          )}
        </div>

        {isDropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-lg z-40"
            style={{ top: '100%' }}
          >
            <ul className="p-2">
              <li
                className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
                onClick={handleProfile}
              >
                <div className="flex items-center gap-2">
                  <FaUserCircle />
                  Profil
                </div>
              </li>
              <li
                className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-2">
                  <FaSignOutAlt />
                  Log out
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
