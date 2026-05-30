export interface UtmData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export function getUtmData(): UtmData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('utm');
    if (!raw) return null;
    return JSON.parse(raw) as UtmData;
  } catch {
    return null;
  }
}

export function buildRegisterPayload<T extends Record<string, unknown>>(base: T): T & Partial<UtmData> {
  const utm = getUtmData();
  if (!utm) return base;
  const merged: T & Partial<UtmData> = { ...base };
  if (utm.utm_source) merged.utm_source = utm.utm_source;
  if (utm.utm_medium) merged.utm_medium = utm.utm_medium;
  if (utm.utm_campaign) merged.utm_campaign = utm.utm_campaign;
  return merged;
}
