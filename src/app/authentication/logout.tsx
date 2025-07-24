'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/axios';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await axios.post('/logout');
      } catch {}
      localStorage.removeItem('token');
      router.push('/authentication/login');
    };
    doLogout();
  }, []);

  return <div className="p-10">Sedang logout...</div>;
}
