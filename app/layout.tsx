import { MarkGithubIcon } from '@primer/octicons-react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'GitHub Repository Search',
    template: '%s · GitHub Repository Search',
  },
  description:
    'GitHub の公開リポジトリをキーワードで検索し、Star / Watcher / Fork / Issue を確認できる検索アプリ。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas text-zinc-900 dark:text-zinc-100">
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-accent-bg focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white"
        >
          メインコンテンツへスキップ
        </a>
        <header className="border-b border-zinc-200 bg-overlay dark:border-zinc-800">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md text-base font-semibold text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bg focus-visible:ring-offset-2 dark:text-zinc-100"
            >
              <MarkGithubIcon size={20} aria-hidden="true" />
              <span>Repository Search</span>
            </Link>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-zinc-200 bg-overlay py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            データ提供:{' '}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
