export const DEFAULT_TIMEZONE = 'America/Tijuana';

export function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: DEFAULT_TIMEZONE
  });
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: DEFAULT_TIMEZONE
  });
}

export function getDayName(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    timeZone: DEFAULT_TIMEZONE
  });
}

export function getDateNumber(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    timeZone: DEFAULT_TIMEZONE
  }).format(date);
}

export function getHourInTimezone(dateStr: string) {
  const date = new Date(dateStr);
  return parseInt(new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: DEFAULT_TIMEZONE
  }).format(date));
}

export function getDayOfWeekInTimezone(dateStr: string) {
  const date = new Date(dateStr);
  const dayName = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: DEFAULT_TIMEZONE
  }).format(date);
  
  const dayMap: Record<string, number> = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };
  return dayMap[dayName];
}
