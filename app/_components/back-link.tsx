'use client';

// "← 検索結果に戻る" link. Three behaviors layered so each degrades cleanly:
//   - JS off          → <a href="/"> takes the browser to the search top
//   - JS on + history → router.back() restores the exact prior URL
//                       (q, page, scroll position) — better UX than rebuilding
//                       the search URL from scratch
//   - JS on, no history (deep link / new tab) → href fallback to "/"

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function BackLink({ children, className }: Props) {
  const router = useRouter();
  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      {children}
    </Link>
  );
}
