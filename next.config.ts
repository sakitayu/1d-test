import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 親ディレクトリにロックファイルがある環境で出る
  // 「multiple lockfiles detected」警告を抑制するため、本リポジトリの
  // ディレクトリを turbopack の root として明示する。
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
