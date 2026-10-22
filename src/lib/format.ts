/** Formatting helpers. Indian numbering, rupee symbol, readable dates. */

export function formatRupees(amountInr: number): string {
  if (amountInr === 0) return "Free";
  const grouped = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amountInr);
  return `₹${grouped}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export interface DayOption {
  iso: string;
  weekday: string;
  dayNumber: string;
  isToday: boolean;
}

/** The next `count` days, starting today, for the date picker. */
export function upcomingDays(count: number): DayOption[] {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      iso: toISODate(date),
      weekday: index === 0 ? "Today" : WEEKDAYS[date.getDay()] ?? "",
      dayNumber: String(date.getDate()),
      isToday: index === 0,
    };
  });
}

/** "2026-10-12T10:15:00.000Z" -> "12 Oct 2026" */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ""} ${date.getFullYear()}`;
}

/** "2026-10-22T09:30:00" -> "9:30 am" */
export function formatTime(iso: string): string {
  const timePart = iso.includes("T") ? (iso.split("T")[1] ?? "") : iso;
  const [hourText, minuteText] = timePart.split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return iso;
  const suffix = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteText ?? "00"} ${suffix}`;
}

export function capitalise(value: string): string {
  return value.length === 0 ? value : value[0]!.toUpperCase() + value.slice(1);
}
