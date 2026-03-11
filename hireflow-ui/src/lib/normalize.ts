import type { Application, ApplicationStats } from '../types';

// Normalizes a raw API application object to match the Application frontend type.
// The .NET backend uses: jobTitle, salaryRange, jobUrl, Capitalized status/priority values,
// and wraps lists in { items: [], totalCount: N } via ApplicationListResponse.
export function normalizeApplication(raw: Record<string, unknown>): Application {
  return {
    id: raw.id as number,
    userId: (raw.userId as number) ?? 0,
    company: (raw.company as string) ?? '',
    role: (raw.jobTitle as string) ?? (raw.role as string) ?? '',
    status: ((raw.status as string) ?? 'saved').toLowerCase() as Application['status'],
    salary: (raw.salaryRange as string) ?? (raw.salary as string) ?? undefined,
    location: (raw.location as string) ?? undefined,
    source: (raw.source as string) ?? undefined,
    url: (raw.jobUrl as string) ?? (raw.url as string) ?? undefined,
    notes: (raw.notes as string) ?? undefined,
    priority: ((raw.priority as string) ?? 'medium').toLowerCase() as Application['priority'],
    appliedDate: (raw.appliedDate as string) ?? (raw.createdAt as string) ?? new Date().toISOString(),
    followUpDate: (raw.followUpDate as string) ?? undefined,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? (raw.lastActivityDate as string) ?? new Date().toISOString(),
  };
}

// Extracts an array of applications from various API response shapes.
// The .NET ApplicationListResponse wraps results in { items: [], totalCount: N }.
// Also handles { applications: [] }, { data: [] }, and bare arrays.
export function extractApplications(data: unknown): Application[] {
  if (Array.isArray(data)) return data.map((item) => normalizeApplication(item as Record<string, unknown>));
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    // .NET ApplicationListResponse uses "items" as the array key
    const items = d.items ?? d.applications ?? d.data;
    if (Array.isArray(items)) return items.map((item) => normalizeApplication(item as Record<string, unknown>));
  }
  return [];
}

// Normalizes the stats API response to the ApplicationStats frontend type.
// The .NET ApplicationStatsDto uses { byStatus: { Applied: N, ... }, totalApplications: N, responseRate: N }.
export function normalizeStats(raw: unknown): ApplicationStats {
  if (!raw || typeof raw !== 'object') {
    return { total: 0, applied: 0, interviews: 0, offers: 0, rejected: 0, ghosted: 0, saved: 0, responseRate: 0, byStatus: {}, sources: [], followups: [] };
  }
  const d = raw as Record<string, unknown>;

  // Handle both the nested { byStatus: { Applied: N } } shape and the flat { applied: N } shape
  const byStatus = (d.byStatus as Record<string, number>) ?? {};

  const applied = (d.applied as number) ?? byStatus['Applied'] ?? byStatus['applied'] ?? 0;
  const interviews = (d.interviews as number) ?? byStatus['Interview'] ?? byStatus['interview'] ?? 0;
  const offers = (d.offers as number) ?? byStatus['Offer'] ?? byStatus['offer'] ?? 0;
  const rejected = (d.rejected as number) ?? byStatus['Rejected'] ?? byStatus['rejected'] ?? 0;
  const ghosted = (d.ghosted as number) ?? byStatus['Ghosted'] ?? byStatus['ghosted'] ?? 0;
  const saved = (d.saved as number) ?? byStatus['Saved'] ?? byStatus['saved'] ?? 0;
  const total = (d.total as number) ?? (d.totalApplications as number) ?? (applied + interviews + offers + rejected + ghosted + saved);
  const responseRate = (d.responseRate as number) ?? 0;

  // Pass through sources, followups, and byStatus for dashboard charts
  const sources = Array.isArray(d.sources) ? (d.sources as Array<{ source: string; cnt: number }>) : [];
  const followups = Array.isArray(d.followups) ? (d.followups as Array<{ id: number; company: string; role: string; followup: string }>) : [];
  const resolvedByStatus: Record<string, number> = {
    Applied: applied,
    Interview: interviews,
    Offer: offers,
    Rejected: rejected,
    Ghosted: ghosted,
    Saved: saved,
    ...byStatus,
  };

  return { total, applied, interviews, offers, rejected, ghosted, saved, responseRate, byStatus: resolvedByStatus, sources, followups };
}
