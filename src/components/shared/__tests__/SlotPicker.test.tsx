import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/render';
import { SlotPicker } from '../SlotPicker';

// Monday 2 Nov 2026, 10:00 -> first page is 02/11/2026 – 06/11/2026
describe('SlotPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 10, 2, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('selects a future slot', async () => {
    const onChange = vi.fn();
    renderWithProviders(<SlotPicker value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 08:30/ }));
    expect(onChange).toHaveBeenCalledWith('2026-11-03T08:30');
  });

  it('renders past slots as blank cells and disables booked slots', () => {
    renderWithProviders(<SlotPicker value="" onChange={vi.fn()} disabledSlots={new Set(['2026-11-03T09:00'])} />);
    expect(screen.queryByRole('button', { name: /Δευτέρα 2 Νοεμβρίου, 09:00/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Δευτέρα 2 Νοεμβρίου, 10:30/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 09:00/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 09:30/ })).toBeEnabled();
  });

  it('shows five weekday columns', () => {
    renderWithProviders(<SlotPicker value="" onChange={vi.fn()} />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
  });

  it('navigates between pages and keeps the selection', async () => {
    renderWithProviders(<SlotPicker value="2026-11-03T08:30" onChange={vi.fn()} />);
    const previous = screen.getByRole('button', { name: 'Προηγούμενη εβδομάδα' });
    expect(previous).toBeDisabled();
    expect(screen.getByText('02/11/2026 – 06/11/2026')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Επόμενη εβδομάδα' }));
    expect(screen.getByText('09/11/2026 – 13/11/2026')).toBeInTheDocument();
    expect(previous).toBeEnabled();

    await userEvent.click(previous);
    expect(screen.getByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 08:30/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('starts from the next weekday when today has no available slots', () => {
    vi.setSystemTime(new Date(2026, 10, 2, 19, 45));
    renderWithProviders(<SlotPicker value="" onChange={vi.fn()} />);
    expect(screen.getByText('03/11/2026 – 09/11/2026')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Δευτέρα 2 Νοεμβρίου/ })).not.toBeInTheDocument();
  });

  it('starts from the next weekday when the remaining slots today are all booked', () => {
    vi.setSystemTime(new Date(2026, 10, 2, 19, 0));
    renderWithProviders(<SlotPicker value="" onChange={vi.fn()} disabledSlots={new Set(['2026-11-02T19:30'])} />);
    expect(screen.getByText('03/11/2026 – 09/11/2026')).toBeInTheDocument();
  });

  it('starts on Monday when today is a weekend or Friday evening', () => {
    vi.setSystemTime(new Date(2026, 9, 31, 10, 0));
    const { unmount } = renderWithProviders(<SlotPicker value="" onChange={vi.fn()} />);
    expect(screen.getByText('02/11/2026 – 06/11/2026')).toBeInTheDocument();
    unmount();

    vi.setSystemTime(new Date(2026, 10, 6, 19, 45));
    renderWithProviders(<SlotPicker value="" onChange={vi.fn()} />);
    expect(screen.getByText('09/11/2026 – 13/11/2026')).toBeInTheDocument();
  });
});
