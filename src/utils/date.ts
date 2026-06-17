import {
  format,
  formatDistanceToNow,
  differenceInDays,
  isSameDay as _isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  isValid,
  addDays as _addDays,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

type DateInput = Date | string | number;

const toDate = (date: DateInput): Date => {
  if (date instanceof Date) return date;
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    if (isValid(parsed)) return parsed;
    return new Date(date);
  }
  return new Date(date);
};

export const formatDate = (date: DateInput, pattern: string = 'yyyy-MM-dd'): string => {
  const d = toDate(date);
  if (!isValid(d)) return '';
  return format(d, pattern, { locale: zhCN });
};

export const formatDateTime = (date: DateInput): string => {
  const d = toDate(date);
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const getDaysBetween = (start: DateInput, end: DateInput): number => {
  const s = toDate(start);
  const e = toDate(end);
  if (!isValid(s) || !isValid(e)) return 0;
  const diff = differenceInDays(e, s);
  return diff >= 0 ? diff + 1 : 0;
};

export const isSameDay = (d1: DateInput, d2: DateInput): boolean => {
  const date1 = toDate(d1);
  const date2 = toDate(d2);
  if (!isValid(date1) || !isValid(date2)) return false;
  return _isSameDay(date1, date2);
};

export interface CalendarDay {
  date: Date;
  dateStr: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  return days.map((date) => ({
    date,
    dateStr: format(date, 'yyyy-MM-dd'),
    day: date.getDate(),
    isCurrentMonth: date.getMonth() === month - 1,
    isToday: _isSameDay(date, today),
  }));
};

export const formatRelative = (date: DateInput): string => {
  const d = toDate(date);
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, {
    locale: zhCN,
    addSuffix: true,
  });
};

export const addDays = (date: DateInput, amount: number): Date => {
  const d = toDate(date);
  return _addDays(d, amount);
};
