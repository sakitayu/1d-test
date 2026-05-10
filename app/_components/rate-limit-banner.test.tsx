import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RateLimitBanner } from './rate-limit-banner';

describe('<RateLimitBanner />', () => {
  it('shows search-api label, absolute reset time, and remaining minutes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T12:00:00Z'));
    const reset = Math.floor(new Date('2026-05-09T12:05:00Z').getTime() / 1000);

    render(<RateLimitBanner reset={reset} resource="search" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/検索 API/)).toBeInTheDocument();
    expect(screen.getByText(/残り約 5 分/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('falls back to "まもなく解除" when reset is in the past', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T12:00:00Z'));
    const reset = Math.floor(new Date('2026-05-09T11:55:00Z').getTime() / 1000);

    render(<RateLimitBanner reset={reset} resource="core" />);
    expect(screen.getByText(/まもなく解除/)).toBeInTheDocument();
    expect(screen.getByText(/GitHub REST API/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
