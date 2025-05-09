import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/auth-context';
import AuthGuard from "./middlewares/auth.guard";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PulseChat - Fast, modern messaging',
  description: 'A modern, full-stack messaging application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AuthGuard requireAuth={false}>
              {children}
            </AuthGuard>
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}