import {
  listClasses,
  listClassSessions,
  type ClassSession,
  type ClassSummary,
} from "@/lib/api/class-sessions";
import { getProgramById } from "@/lib/api/programs";
import {
  formatDateInHcm,
  formatSessionTimeRange,
  sessionKindLabel,
} from "@/lib/schedule/week";

/** Mentor QR / capture apply to Offline; LiveOnline is list-only on mobile. */
export function isCheckInEligibleKind(
  kind: ClassSession["sessionKind"],
): boolean {
  return kind === "Offline" || kind === "LiveOnline";
}

export function isOfflineSession(
  kind: ClassSession["sessionKind"],
): boolean {
  return kind === "Offline";
}

/**
 * Query-string DateTime for ASP.NET `[FromQuery] DateTime?`.
 * `dd/MM/yyyy` only works in JSON bodies (FlexibleDateTimeConverter) — query
 * binding rejects day>12 (e.g. 21/09/…). Prefer ISO with Vietnam offset.
 */
export function formatBeDateTime(isoDate: string, time: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return `${isoDate}T${time}+07:00`;
  return `${year}-${month}-${day}T${time}+07:00`;
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
  programId?: string | null;
  programName?: string | null;
};

export type MentorProgramGroup = {
  programId: string | null;
  programName: string;
  sessions: MentorDaySession[];
};

function sessionSortKey(session: ClassSession): number {
  return parseBeDateTime(session.startTime)?.getTime() ?? 0;
}

async function resolveProgramNames(
  programIds: string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  await Promise.all(
    programIds.map(async (id) => {
      try {
        const value = await getProgramById({ id });
        const name = value.data?.name?.trim() || value.data?.code?.trim();
        if (name) names.set(id, name);
      } catch {
        // Keep fallback label from class name below.
      }
    }),
  );
  return names;
}

/**
 * Discover today's check-in-eligible sessions for a mentor:
 * classes by mentorId → sessions in today's HCM window → program labels.
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
            programId: klass.programId ?? null,
          });
        }
      } catch {
        // Skip classes that fail to load sessions — surface others.
      }
    }),
  );

  const programIds = [
    ...new Set(
      results
        .map((s) => s.programId?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const programNames = await resolveProgramNames(programIds);

  for (const session of results) {
    const id = session.programId?.trim();
    if (id && programNames.has(id)) {
      session.programName = programNames.get(id) ?? null;
    }
  }

  return results.sort((a, b) => sessionSortKey(a) - sessionSortKey(b));
}

/** Group today's sessions under program section headers. */
export function groupMentorSessionsByProgram(
  sessions: MentorDaySession[],
): MentorProgramGroup[] {
  const order: string[] = [];
  const map = new Map<string, MentorProgramGroup>();

  for (const session of sessions) {
    const key = session.programId?.trim() || `class:${session.classId}`;
    let group = map.get(key);
    if (!group) {
      const programName =
        session.programName?.trim() ||
        session.className?.trim() ||
        session.classCode?.trim() ||
        "Chương trình";
      group = {
        programId: session.programId ?? null,
        programName,
        sessions: [],
      };
      map.set(key, group);
      order.push(key);
    }
    group.sessions.push(session);
  }

  return order.map((key) => map.get(key)!);
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
  const classLabel = session.className?.trim() || session.classCode?.trim();
  if (classLabel) return `${kind} · ${time} · ${classLabel}`;
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
