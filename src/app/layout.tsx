import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { StoreProvider } from '@/lib/store';

const inter = Inter({ variable: '--font-sans', subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PGDAS Manager',
  description: 'Apuração automática do Simples Nacional',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-slate-50">
        <StoreProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
