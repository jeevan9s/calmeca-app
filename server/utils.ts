export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

export const formatEventDate = (start: string | Date) => {
  const startDate = start instanceof Date ? start : new Date(start);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(startDate, today)) {
    return startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } else if (isSameDay(startDate, tomorrow)) {
    const weekday = startDate.toLocaleDateString("en-US", { weekday: "short" });
    return `Tomorrow, ${weekday}`;
  } else {
    return startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
};

export const colorPalette = [
  "#8B0000", // Dark Red
  "#2F4F4F", // Dark Slate Gray
  "#191970", // Midnight Blue
  "#006400", // Dark Green
  "#8B4513", // Saddle Brown
  "#4B0082", // Indigo
  "#2E8B57", // Sea Green
  "#B8860B", // Dark Goldenrod
  "#800080", // Purple
  "#1E90FF", // Dodger Blue
  "#CD853F", // Peru
  "#228B22", // Forest Green
];








