import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GrowthMeasurementForm } from '../GrowthMeasurementForm';
import { renderWithProviders } from '../../../test/render';

const toIsoDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function setDate(dateInput: HTMLInputElement, date: Date) {
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setValue.call(dateInput, toIsoDate(date));
  dateInput.dispatchEvent(new Event('input', { bubbles: true }));
  dateInput.dispatchEvent(new Event('change', { bubbles: true }));
}

function renderForm(onSubmit = vi.fn(async (_data: unknown) => {})) {
  renderWithProviders(
    <GrowthMeasurementForm
      opened
      onClose={() => {}}
      childId={7}
      childName="Νίκος"
      onSubmit={onSubmit}
    />
  );
  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
  const submit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
  return { onSubmit, dateInput, submit };
}

function inTimezone(tz: string, body: () => void | Promise<void>) {
  return async () => {
    const original = process.env.TZ;
    process.env.TZ = tz;
    try {
      await body();
    } finally {
      process.env.TZ = original;
    }
  };
}

describe('GrowthMeasurementForm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('defaults the measurement date to today', () => {
    const { dateInput } = renderForm();
    expect(dateInput.value).toBe('2026-10-21');
  });

  it('submits the entered height with the child id and today’s date', async () => {
    const user = userEvent.setup();
    const { onSubmit, submit } = renderForm();

    await user.type(screen.getByLabelText('Ύψος (cm)'), '82.5');
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ childId: 7, heightCm: 82.5, measurementDate: '2026-10-21' });
  });

  it('does not submit when no measurement value is entered', async () => {
    const user = userEvent.setup();
    const { onSubmit, submit } = renderForm();

    await user.click(submit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit a measurement dated in the future', async () => {
    const user = userEvent.setup();
    const { onSubmit, dateInput, submit } = renderForm();

    await user.type(screen.getByLabelText('Βάρος (kg)'), '9');
    setDate(dateInput, new Date(2026, 9, 22));
    await user.click(submit);

    expect(dateInput.checkValidity()).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe('timezone handling', () => {
    it(
      'accepts a measurement dated today in Athens',
      inTimezone('Europe/Athens', async () => {
        vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0));
        const user = userEvent.setup();
        const { onSubmit, submit } = renderForm();
        await user.type(screen.getByLabelText('Βάρος (kg)'), '9');
        await user.click(submit);
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit.mock.calls[0][0]).toMatchObject({ measurementDate: '2026-10-21' });
      })
    );

    it(
      'defaults the date to the local date in Athens just after midnight',
      inTimezone('Europe/Athens', () => {
        vi.setSystemTime(new Date(2026, 9, 21, 0, 30, 0));
        const { dateInput } = renderForm();
        expect(dateInput.value).toBe('2026-10-21');
      })
    );

    it(
      'does not reject today as a future date in Athens just after midnight',
      inTimezone('Europe/Athens', () => {
        vi.setSystemTime(new Date(2026, 9, 21, 0, 30, 0));
        const { dateInput } = renderForm();
        expect(dateInput.max).toBe('2026-10-21');
        expect(dateInput.checkValidity()).toBe(true);
      })
    );
  });
});
