/**
 * Backend timestamps arrive in two shapes: ISO (`/api/parent/links` → `2026-08-02T16:56:55Z`)
 * and `dd/MM/yyyy HH:mm:ss` (progression DTOs). `new Date()` only handles the first.
 */
const DAY_FIRST_PATTERN =
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

export const EMPTY_DATE_LABEL = "—";

export function parseApiDate(value?: string | null): Date | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const dayFirst = DAY_FIRST_PATTERN.exec(trimmed);
  if (dayFirst) {
    const [, day, month, year, hour, minute, second] = dayFirst;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hour ? Number(hour) : 0,
      minute ? Number(minute) : 0,
      second ? Number(second) : 0,
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function apiDateToMillis(value?: string | null): number | null {
  return parseApiDate(value)?.getTime() ?? null;
}

export function formatDateVi(value?: string | null): string {
  const date = parseApiDate(value);
  if (!date) return EMPTY_DATE_LABEL;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateTimeVi(value?: string | null): string {
  const date = parseApiDate(value);
  if (!date) return EMPTY_DATE_LABEL;
  return `${formatDateVi(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "Vừa xong" / "12 phút trước" / "Hôm qua" / "5 ngày trước" / "02/08/2026". */
export function formatRelativeVi(value?: string | null): string {
  const date = parseApiDate(value);
  if (!date) return EMPTY_DATE_LABEL;

  const elapsed = Date.now() - date.getTime();
  if (elapsed < 0) return formatDateVi(value);
  if (elapsed < MS_PER_MINUTE) return "Vừa xong";
  if (elapsed < MS_PER_HOUR) {
    return `${Math.floor(elapsed / MS_PER_MINUTE)} phút trước`;
  }

  const days = calendarDaysAgo(date);
  if (days === 0) return `${Math.floor(elapsed / MS_PER_HOUR)} giờ trước`;
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  return formatDateVi(value);
}

/** Calendar-day difference, so 23:00 → 01:00 counts as yesterday rather than "1 giờ". */
function calendarDaysAgo(date: Date): number {
  const startOfDay = (input: Date) =>
    new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();
  return Math.round((startOfDay(new Date()) - startOfDay(date)) / MS_PER_DAY);
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}
