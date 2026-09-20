import {
  listClasses,
  listClassSessions,
  type ClassSession,
  type ClassSummary,
} from "@/lib/api/class-sessions";
import {
  formatDateInHcm,
  formatSessionTimeRange,
  sessionKindLabel,
} from "@/lib/schedule/week";

/** Mentor QR applies to in-person / live sessions — not assignment windows. */
export function isCheckInEligibleKind(
  kind: ClassSession["sessionKind"],
): boolean {
  return kind === "Offline" || kind === "LiveOnline";
}

/** BE query example: `15/06/2026 14:30:00`. */
export function formatBeDateTime(isoDate: string, time: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return `${isoDate} ${time}`;
  return `${day}/${month}/${year} ${time}`;
}

export function parseBeDateTime(raw: string): Date | null {
  const trimmed = raw.trim();
  const match = trimmed.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/,
  );
  if (match) {
    const [, dd, mm, yyyy, hh, min, ss] = match;
    return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}+07:00`);
  }
  // ISO-8601 / RFC3339 from some BE responses
  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/,
  );
  if (isoMatch) {
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }
  const fallback = Date.parse(trimmed);
  if (!Number.isNaN(fallback)) return new Date(fallback);
  return null;
}

export type MentorDaySession = ClassSession & {
  className?: string | null;
  classCode?: string | null;
};

function sessionSortKey(session: ClassSession): number {
  return parseBeDateTime(session.startTime)?.getTime() ?? 0;
}

/**
 * Discover today's check-in-eligible sessions for a mentor:
 * classes by mentorId → sessions in today's HCM window.
 */
export async function getMentorSessionsForDay(
  mentorUserId: string,
  day: Date = new Date(),
): Promise<MentorDaySession[]> {
  const isoDay = formatDateInHcm(day);
  const from = formatBeDateTime(isoDay, "00:00:00");
  const to = formatBeDateTime(isoDay, "23:59:59");

  const classesValue = await listClasses({
    mentorId: mentorUserId,
    page: 1,
    pageSize: 50,
  });
  const classes = (classesValue.data?.items ?? []).filter(
    (item): item is ClassSummary => Boolean(item?.id),
  );

  const activeClasses = classes.filter((item) => {
    const status = item.status;
    return status === "InProgress" || status === "Open" || !status;
  });

  const results: MentorDaySession[] = [];

  await Promise.all(
    activeClasses.map(async (klass) => {
      try {
        const sessionsValue = await listClassSessions({
          classId: klass.id,
          from,
          to,
          page: 1,
          pageSize: 50,
          sortBy: "startTime",
          isDescending: false,
        });
        const sessions = sessionsValue.data?.items ?? [];
        for (const session of sessions) {
          if (!session?.id) continue;
          if (session.status === "Cancelled") continue;
          if (!isCheckInEligibleKind(session.sessionKind)) continue;
          results.push({
            ...session,
            className: klass.name,
            classCode: klass.code,
          });
        }
      } catch {
        // Skip classes that fail to load sessions — surface others.
      }
    }),
  );

  return results.sort((a, b) => sessionSortKey(a) - sessionSortKey(b));
}

export function mentorSessionTitle(session: MentorDaySession): string {
  return (
    session.title?.trim() ||
    session.className?.trim() ||
    session.classCode?.trim() ||
    "Buổi học"
  );
}

export function mentorSessionSubtitle(session: MentorDaySession): string {
  const kind = sessionKindLabel(session.sessionKind);
  const time = formatSessionTimeRange(session.startTime, session.endTime);
  return `${kind} · ${time}`;
}

export function secondsUntil(
  expiresAt: string,
  now: Date = new Date(),
): number | null {
  const end = parseBeDateTime(expiresAt);
  if (!end) return null;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 1000));
}
