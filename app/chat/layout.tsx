"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/use-notification';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { supported, permission, requestPermission } = useNotifications();

  useEffect(() => {
    if (supported && permission === 'default') {
      // Ask for notification permission when the user enters the chat
      requestPermission();
    }
  }, [supported, permission, requestPermission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}