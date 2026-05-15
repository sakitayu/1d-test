import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QueryErrorBanner } from './query-error-banner';

describe('<QueryErrorBanner />', () => {
  it('role="alert" として 256 文字制限を説明する', () => {
    render(<QueryErrorBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/256 文字/)).toBeInTheDocument();
  });
});
