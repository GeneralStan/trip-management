'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/shipments');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
