// North Hills Park's local timezone. "Today" is always computed relative to
// this fixed zone (not the server's or the browser's ambient timezone) so
// that server-rendered pages and client hydration always agree — otherwise
// a Vercel server (UTC) and a visitor's browser (e.g. US Eastern) disagree
// about the current date for several hours every evening, which breaks
// React hydration on date-driven pages.
const APP_TIMEZONE = "America/New_York";

function todayInAppTimezone(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return new Date(Number(map.year), Number(map.month) - 1, Number(map.day));
}

// Rolling 7-day window: today through today+6, recomputed on every call.
// No stored "week" concept — this is what makes past days disappear automatically.
export function getRollingWindowDates(referenceDate: Date = todayInAppTimezone()): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + i);
    dates.push(toDateString(d));
  }
  return dates;
}

export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${weekday} ${monthDay}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(todayInAppTimezone());
}
