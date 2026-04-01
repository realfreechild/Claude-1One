import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { SearchBar } from '@/components/layout/SearchBar';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ReadLater',
  description: 'Your personal reading list',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
              <Suspense>
                <SearchBar />
              </Suspense>
            </header>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
