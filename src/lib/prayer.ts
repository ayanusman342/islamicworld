export type Coords = { lat: number; lon: number };

export type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type PrayerTimingsResponse = {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: {
      date: string;
      day: string;
      month: { en: string; ar: string; number: number };
      year: string;
      weekday: { en: string; ar: string };
    };
    gregorian: { date: string; weekday: { en: string } };
  };
  meta: { timezone: string; method: { name: string } };
};

const PRAYER_ORDER: (keyof PrayerTimes)[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

export async function fetchPrayerTimes(
  { lat, lon }: Coords,
  date = new Date(),
): Promise<PrayerTimingsResponse> {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Prayer times unavailable");
  const json = await res.json();
  return json.data as PrayerTimingsResponse;
}

export function nextPrayer(timings: PrayerTimes, now = new Date()) {
  const today = new Date(now);
  for (const name of PRAYER_ORDER) {
    if (name === "Sunrise") continue;
    const [h, m] = timings[name].split(":").map(Number);
    const t = new Date(today);
    t.setHours(h, m, 0, 0);
    if (t > now) return { name, time: t };
  }
  const [h, m] = timings.Fajr.split(":").map(Number);
  const t = new Date(today);
  t.setDate(t.getDate() + 1);
  t.setHours(h, m, 0, 0);
  return { name: "Fajr" as const, time: t };
}

export function formatCountdown(ms: number) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useBrowserCoords(): Coords | null {
  if (typeof window === "undefined") return null;
  return null;
}

export const PRAYER_LABELS: Record<keyof PrayerTimes, string> = {
  Fajr: "Fajr",
  Sunrise: "Sunrise",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

export function computeQiblaBearing({ lat, lon }: Coords): number {
  // Kaaba coords
  const kLat = 21.4225;
  const kLon = 39.8262;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat);
  const φ2 = toRad(kLat);
  const Δλ = toRad(kLon - lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function distanceToKaabaKm({ lat, lon }: Coords): number {
  const kLat = 21.4225;
  const kLon = 39.8262;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(kLat - lat);
  const dLon = toRad(kLon - lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(kLat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
