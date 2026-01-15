import { ParsedSchedule } from './schedule-pattern-parser.js';

type DayNameKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const JS_DAY_TO_DAY_NAME: DayNameKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function parseTimezoneOffset(timezone: string): number {
  const match = timezone.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid timezone format: ${timezone}`);
  }
  const sign = match[1] === '+' ? 1 : -1;
  return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isTimeInRange(currentMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isScanEnabled(utcTime: Date, schedule: ParsedSchedule): boolean {
  const offsetMinutes = parseTimezoneOffset(schedule.timezone);
  const localTimeMs = utcTime.getTime() + offsetMinutes * 60 * 1000;
  const localTime = new Date(localTimeMs);

  const dayName = JS_DAY_TO_DAY_NAME[localTime.getUTCDay()];
  const daySchedule = schedule[dayName];
  const currentTimeStr = formatTime(localTime.getUTCHours(), localTime.getUTCMinutes());

  if (!daySchedule.enabled) {
    console.info(`[Schedule] Day: ${dayName}, Time: ${currentTimeStr}, Status: disabled`);
    return false;
  }

  if (!daySchedule.timeRange) {
    console.info(`[Schedule] Day: ${dayName}, Time: ${currentTimeStr}, Status: enabled (all day)`);
    return true;
  }

  const currentMinutes = localTime.getUTCHours() * 60 + localTime.getUTCMinutes();
  const [startTime, endTime] = daySchedule.timeRange;
  const inRange = isTimeInRange(currentMinutes, timeToMinutes(startTime), timeToMinutes(endTime));

  console.info(`[Schedule] Day: ${dayName}, Time: ${currentTimeStr}, Range: ${startTime}-${endTime}, In range: ${inRange}`);

  return inRange;
}
