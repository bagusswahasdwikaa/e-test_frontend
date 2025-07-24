// user/layout.tsx
'use client';

import useAuthRedirect from '@/middleware/auth';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  useAuthRedirect();
  return <>{children}</>;
}
