// Rolling 7-day window: today through today+6, recomputed on every call.
// No stored "week" concept — this is what makes past days disappear automatically.
export function getRollingWindowDates(referenceDate: Date = new Date()): string[] {
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
  const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
  const monthDay = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${weekday} ${monthDay}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date());
}
