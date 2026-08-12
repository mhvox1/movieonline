export const HOURS_PER_DAY = 24;

export const daysToHours = (days: number): number => {
  if (!Number.isFinite(days)) return 0;
  return Math.max(0, Math.ceil(days * HOURS_PER_DAY));
};

export const msToHours = (milliseconds: number): number => {
  if (!Number.isFinite(milliseconds)) return 0;
  return Math.max(0, Math.ceil(milliseconds / (60 * 60 * 1000)));
};

export const formatHoursAndMinutes = (hours: number): string => {
  if (!Number.isFinite(hours)) return '0:00';

  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
};
