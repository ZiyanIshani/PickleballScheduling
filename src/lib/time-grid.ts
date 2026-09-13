// Fixed daily grid: 6:00am to 9:00pm in 30-minute slots (see CLAUDE.md "Time grid").
export const GRID_START_MINUTES = 6 * 60; // 6:00am
export const GRID_END_MINUTES = 21 * 60; // 9:00pm
export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = (GRID_END_MINUTES - GRID_START_MINUTES) / SLOT_MINUTES;

export function slotIndexToTime(index: number): string {
  const totalMinutes = GRID_START_MINUTES + index * SLOT_MINUTES;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export function timeToSlotIndex(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h * 60 + m - GRID_START_MINUTES) / SLOT_MINUTES;
}

export function formatSlotLabel(index: number): string {
  const totalMinutes = GRID_START_MINUTES + index * SLOT_MINUTES;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return minutes === 0 ? `${hours12}${period}` : `${hours12}:${String(minutes).padStart(2, "0")}${period}`;
}

export const SLOT_INDICES = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i);
