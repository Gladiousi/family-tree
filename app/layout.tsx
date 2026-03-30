import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Семейное Древо',
  description: 'Визуализация семейных историй с мультимедиа',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className="dark"
      style={{ colorScheme: 'dark' }}
    >
      <body className={inter.className}>
        <Providers>
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-[100] -translate-y-20 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-transform"
          >
            Перейти к контенту
          </a>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main id="main-content" className="flex-1 bg-background" tabIndex={-1}>{children}</main>
            <Footer />
            <Toaster position="top-right" richColors />
          </div>
        </Providers>
      </body>
    </html>
  );
}