export interface DaySchedule {
  enabled: boolean;
  timeRange?: [string, string];
}

export interface ParsedSchedule {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
  timezone: string;
}

const DAY_NAMES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayName = (typeof DAY_NAMES)[number];

function isValidTime(time: string): boolean {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function parseDayConfig(dayConfig: string): { dayName: DayName; schedule: DaySchedule } {
  const match = dayConfig.match(/^([a-z]+)\[(.+)\]$/i);
  if (!match) {
    throw new Error(`Invalid day config format: expected 'day[value]', got: ${dayConfig}`);
  }

  const dayName = match[1].toLowerCase() as DayName;
  if (!DAY_NAMES.includes(dayName)) {
    throw new Error(`Invalid day name: ${match[1]}. Must be one of: ${DAY_NAMES.join(', ')}`);
  }

  const value = match[2].toLowerCase();
  if (value === 'off') {
    return { dayName, schedule: { enabled: false } };
  }
  if (value === 'all') {
    return { dayName, schedule: { enabled: true } };
  }

  const timeMatch = match[2].match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!timeMatch) {
    throw new Error(`Invalid time range format: expected 'HH:MM-HH:MM' or 'all', got: ${match[2]}`);
  }

  const [, startTime, endTime] = timeMatch;
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    throw new Error(`Invalid time format: ${startTime} or ${endTime}. Must be HH:MM (00:00-23:59)`);
  }

  return { dayName, schedule: { enabled: true, timeRange: [startTime, endTime] } };
}

export function parseSchedulePattern(pattern: string): ParsedSchedule {
  if (!pattern?.trim()) {
    throw new Error('Schedule pattern cannot be empty');
  }

  const parts = pattern.split('|');
  if (parts.length !== 2) {
    throw new Error(`Invalid pattern format: expected 'TZ=<timezone>|<day-configs>', got: ${pattern}`);
  }

  const timezoneMatch = parts[0].match(/^TZ=([+-]\d{2}:\d{2})$/);
  if (!timezoneMatch) {
    throw new Error(`Invalid timezone format: expected 'TZ=+HH:MM' or 'TZ=-HH:MM', got: ${parts[0]}`);
  }

  const schedule: ParsedSchedule = {
    mon: { enabled: true },
    tue: { enabled: true },
    wed: { enabled: true },
    thu: { enabled: true },
    fri: { enabled: true },
    sat: { enabled: true },
    sun: { enabled: true },
    timezone: timezoneMatch[1],
  };

  const dayConfigs = parts[1].trim();
  if (!dayConfigs) {
    return schedule;
  }

  for (const config of dayConfigs.split(',').filter(Boolean)) {
    const { dayName, schedule: daySchedule } = parseDayConfig(config.trim());
    schedule[dayName] = daySchedule;
  }

  return schedule;
}
