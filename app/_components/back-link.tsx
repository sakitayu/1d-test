'use client';

// 「← 検索結果に戻る」リンク。3 段階の挙動を重ねて段階的に劣化させる:
//   - JS off          → <a href="/"> でブラウザが検索トップへ遷移
//   - JS on + 履歴あり → router.back() で直前の URL (q / page /
//                        スクロール位置) を完全復元。検索 URL を組み直すより UX が良い
//   - JS on, 履歴なし (深いリンク / 新規タブ) → href の "/" へフォールバック

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
