import type { BookingInput, Equipment, User } from './model.ts';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export function fail(status: number, code: string, message: string): never {
  throw new ApiError(status, code, message);
}
export function staff(user: User) {
  if (user.role !== 'staff')
    fail(403, 'FORBIDDEN', 'Staff permission required.');
}
export function text(
  value: unknown,
  field: string,
  max = 200,
  required = true
): string {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (required && !value.trim())
  )
    fail(400, 'VALIDATION', `Invalid ${field}.`);
  return value.trim();
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(400, 'VALIDATION', 'JSON object required.');
  return value as Record<string, unknown>;
}
export function localClock(now: Date, timezone = 'Europe/Istanbul') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (key: string) => parts.find((p) => p.type === key)!.value;
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
  };
}
export function booking(
  value: unknown,
  now = new Date(),
  timezone = 'Europe/Istanbul'
): BookingInput {
  const b = object(value);
  const equipmentId = text(b.equipmentId, 'equipmentId', 64);
  const date = text(b.date, 'date', 10);
  const { startHour, endHour } = b;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    fail(400, 'VALIDATION', 'Use a valid YYYY-MM-DD date.');
  if (
    typeof startHour !== 'number' ||
    typeof endHour !== 'number' ||
    !Number.isInteger(startHour) ||
    !Number.isInteger(endHour) ||
    startHour < 9 ||
    endHour > 17 ||
    endHour <= startHour ||
    endHour - startHour > 3
  )
    fail(
      400,
      'VALIDATION',
      'Choose 1 to 3 consecutive whole hours between 09:00 and 17:00.'
    );
  const current = localClock(now, timezone);
  if (
    date < current.date ||
    (date === current.date && startHour <= current.hour)
  )
    fail(400, 'PAST_SLOT', 'The selected slot has already started.');
  return { equipmentId, date, startHour, endHour };
}
export function equipmentInput(value: unknown, id?: string): Equipment {
  const b = object(value);
  const status = b.status === undefined ? 'available' : b.status;
  if (
    typeof status !== 'string' ||
    !['available', 'borrowed', 'maintenance'].includes(status)
  )
    fail(400, 'VALIDATION', 'Invalid equipment status.');
  return {
    id: id ?? text(b.id, 'id', 64),
    name: text(b.name, 'name', 120),
    category: text(b.category, 'category', 80),
    lab: text(b.lab, 'lab', 80),
    location: text(b.location, 'location', 120),
    description: text(b.description ?? '', 'description', 2000, false),
    status: status as Equipment['status'],
  };
}
export function overlaps(a: BookingInput, b: BookingInput) {
  return (
    a.equipmentId === b.equipmentId &&
    a.date === b.date &&
    a.startHour < b.endHour &&
    b.startHour < a.endHour
  );
}
