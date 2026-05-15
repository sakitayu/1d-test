'use client';

// 検索結果へ戻るリンク (詳細ページから使用)。3 段階の挙動を重ねて
// 段階的に劣化させる:
//   - JS off → <a href="/"> でブラウザが検索トップへ遷移
//   - JS on + 履歴あり (window.history.length > 1) → router.back() で
//     直前ページに戻る (URL とスクロール位置を含む)。検索 URL を組み直す
//     より UX が良い
//   - JS on, 履歴なし (深いリンク / 新規タブ) → href の "/" へフォールバック
//
// 表示テキストやアイコンは呼び出し側 (children prop) で決める。

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
