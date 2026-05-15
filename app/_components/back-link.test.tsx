import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const back = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

import { BackLink } from './back-link';

afterEach(() => {
  back.mockReset();
});

describe('<BackLink />', () => {
  it('履歴がある場合は router.back() を呼ぶ (JS on で検索から遷移してきた状況)', async () => {
    Object.defineProperty(window, 'history', { value: { length: 3 }, configurable: true });
    render(<BackLink>戻る</BackLink>);

    await userEvent.click(screen.getByRole('link', { name: '戻る' }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it('履歴が無い場合は href="/" にフォールスルーする (deep link)', async () => {
    Object.defineProperty(window, 'history', { value: { length: 1 }, configurable: true });
    render(<BackLink>戻る</BackLink>);
    const link = screen.getByRole('link', { name: '戻る' });

    expect(link.getAttribute('href')).toBe('/');

    await userEvent.click(link);

    expect(back).not.toHaveBeenCalled();
  });
});
