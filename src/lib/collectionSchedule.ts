import type { CollectionStatus } from './types';

interface ScheduleInput {
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  repeatYearly?: boolean;
}

export interface ScheduleResult {
  status: CollectionStatus;
  windowStart: Date | null;
  windowEnd: Date | null;
}

function shiftYears(d: Date, years: number): Date {
  const out = new Date(d.getTime());
  out.setUTCFullYear(out.getUTCFullYear() + years);
  return out;
}

/**
 * Resolves when a collection is visible.
 * - No dates: always live (while isActive).
 * - repeatYearly (needs both dates): the same window recurs every year; we pick the current or next occurrence.
 */
export function resolveSchedule(c: ScheduleInput, now: Date = new Date()): ScheduleResult {
  if (!c.isActive) return { status: 'inactive', windowStart: c.startsAt ?? null, windowEnd: c.endsAt ?? null };

  let start = c.startsAt ?? null;
  let end = c.endsAt ?? null;

  if (c.repeatYearly && start && end) {
    const base = now.getUTCFullYear() - start.getUTCFullYear();
    let picked: { s: Date; e: Date } | null = null;
    for (const k of [-1, 0, 1]) {
      const s = shiftYears(start, base + k);
      const e = shiftYears(end, base + k);
      if (e.getTime() >= now.getTime()) {
        picked = { s, e };
        break;
      }
    }
    if (picked) {
      start = picked.s;
      end = picked.e;
    }
  }

  if (start && now.getTime() < start.getTime()) return { status: 'scheduled', windowStart: start, windowEnd: end };
  if (end && now.getTime() > end.getTime()) return { status: 'ended', windowStart: start, windowEnd: end };
  return { status: 'live', windowStart: start, windowEnd: end };
}

const MADRID = 'Europe/Madrid';

/** Offset (minutes east of UTC) of Europe/Madrid at the given instant. */
function madridOffsetMinutes(at: Date): number {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: MADRID, timeZoneName: 'shortOffset' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value; // e.g. "GMT+2"
  const m = part?.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!m) return 0;
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
}

/** "YYYY-MM-DD" (a calendar day in Spain) -> UTC instant at 00:00:00 (start) or 23:59:59 (end) Madrid time. */
export function madridDateToUtc(date: string, endOfDay = false): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, mo, d] = date.split('-').map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0));
  if (Number.isNaN(guess.getTime())) return null;
  return new Date(guess.getTime() - madridOffsetMinutes(guess) * 60000);
}

/** UTC ISO instant -> "YYYY-MM-DD" calendar day in Spain (for <input type="date">). */
export function utcToMadridDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: MADRID, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
