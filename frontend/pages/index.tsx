'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      router.replace('/businesses');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
      }}
    >
      Loading...
    </div>
  );
}
