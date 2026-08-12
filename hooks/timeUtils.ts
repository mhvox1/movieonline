export const HOURS_PER_DAY = 24;

export const daysToHours = (days: number): number => {
  if (!Number.isFinite(days)) return 0;
  return Math.max(0, Math.ceil(days * HOURS_PER_DAY));
};

export const msToHours = (milliseconds: number): number => {
  if (!Number.isFinite(milliseconds)) return 0;
  return Math.max(0, Math.ceil(milliseconds / (60 * 60 * 1000)));
};
