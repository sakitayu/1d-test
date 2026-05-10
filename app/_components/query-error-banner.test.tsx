import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QueryErrorBanner } from './query-error-banner';

describe('<QueryErrorBanner />', () => {
  it('exposes itself as an alert and explains the 256-char limit', () => {
    render(<QueryErrorBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/256 文字/)).toBeInTheDocument();
  });
});
