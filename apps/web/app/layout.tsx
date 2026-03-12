import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AI Agent Orchestration',
    template: '%s | AI Agent Orchestration',
  },
  description: 'Production-ready AI-powered application with multi-agent coordination',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AI Agent Orchestration',
    description: 'Production-ready AI-powered application with multi-agent coordination',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Orchestration',
    description: 'Production-ready AI-powered application with multi-agent coordination',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
