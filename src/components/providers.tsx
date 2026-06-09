'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/stores/auth.store';

function generateSessionId() {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

function AuthInit() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  useEffect(() => {
    generateSessionId();
    fetchMe();
  }, [fetchMe]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }));

  return (
    <QueryClientProvider client={qc}>
      <AuthInit />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
