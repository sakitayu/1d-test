import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RateLimitBanner } from './rate-limit-banner';

describe('<RateLimitBanner />', () => {
  it('検索 API ラベル / 絶対 reset 時刻 / 残り分数を表示する', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T12:00:00Z'));
    const reset = Math.floor(new Date('2026-05-09T12:05:00Z').getTime() / 1000);

    render(<RateLimitBanner reset={reset} resource="search" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/検索 API/)).toBeInTheDocument();
    expect(screen.getByText(/残り約 5 分/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('reset が過去の場合は "まもなく解除" にフォールバックする', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T12:00:00Z'));
    const reset = Math.floor(new Date('2026-05-09T11:55:00Z').getTime() / 1000);

    render(<RateLimitBanner reset={reset} resource="core" />);

    expect(screen.getByText(/まもなく解除/)).toBeInTheDocument();
    expect(screen.getByText(/GitHub REST API/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
