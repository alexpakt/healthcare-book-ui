import type { Appointment } from '../types/parent';
import { isNotInFuture } from './dateTime';

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const SLOT_MINUTES = 30;
export const DAYS_PER_PAGE = 5;

const pad = (n: number) => String(n).padStart(2, '0');

export function generateDaySlots(): string[] {
  const slots: string[] = [];
  for (let minutes = DAY_START_HOUR * 60; minutes < DAY_END_HOUR * 60; minutes += SLOT_MINUTES) {
    slots.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
  }
  return slots;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function getWorkDays(start: Date, count: number): Date[] {
  const days: Date[] = [];
  let day = start;
  while (days.length < count) {
    if (!isWeekend(day)) days.push(day);
    day = addDays(day, 1);
  }
  return days;
}

export function toSlotValue(day: Date, time: string): string {
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T${time}`;
}

export function isSlotInPast(day: Date, time: string): boolean {
  return isNotInFuture(toSlotValue(day, time));
}

export function getBookedSlots(appointments: Appointment[] | null | undefined, doctorId: number): Set<string> {
  const booked = new Set<string>();
  for (const appointment of appointments ?? []) {
    if (appointment.doctorId !== doctorId) continue;
    if (appointment.status !== 'REQUESTED' && appointment.status !== 'SCHEDULED') continue;
    booked.add(appointment.appointmentDate.slice(0, 16));
  }
  return booked;
}
