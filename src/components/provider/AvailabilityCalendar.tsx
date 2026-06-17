import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Provider } from '@/types';
import { generateCalendarDays, isSameDay, formatDate, type CalendarDay } from '@/utils/date';
import { cn } from '@/lib/utils';

interface SelectedRange {
  start?: string;
  end?: string;
}

interface AvailabilityCalendarProps {
  provider: Provider;
  selectedRange?: SelectedRange;
  onSelectRange?: (range: SelectedRange) => void;
}

export default function AvailabilityCalendar({
  provider,
  selectedRange,
  onSelectRange,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [rangeStart, setRangeStart] = useState<string | undefined>(selectedRange?.start);
  const [hoveredDate, setHoveredDate] = useState<string | undefined>();

  const calendarDays = useMemo(
    () => generateCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getAvailabilityInfo = (dateStr: string) => {
    const avail = provider.availability.find(
      (a) => a.date === dateStr && a.capacity > 0
    );
    if (!avail) return { capacity: 0, booked: 0, left: 0 };
    return {
      capacity: avail.capacity,
      booked: avail.booked,
      left: avail.capacity - avail.booked,
    };
  };

  const isDateDisabled = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return true;
    const dateOnly = new Date(day.date);
    dateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date();
    todayOnly.setHours(0, 0, 0, 0);
    if (dateOnly < todayOnly) return true;
    const info = getAvailabilityInfo(day.dateStr);
    return info.left <= 0;
  };

  const isInRange = (dateStr: string): boolean => {
    if (!rangeStart) return false;
    const end = hoveredDate || selectedRange?.end;
    if (!end) return isSameDay(dateStr, rangeStart);
    const start = rangeStart <= end ? rangeStart : end;
    const realEnd = rangeStart <= end ? end : rangeStart;
    return dateStr >= start && dateStr <= realEnd;
  };

  const isRangeEdge = (dateStr: string): 'start' | 'end' | null => {
    if (rangeStart && isSameDay(dateStr, rangeStart)) return 'start';
    const end = selectedRange?.end;
    if (end && isSameDay(dateStr, end)) return 'end';
    return null;
  };

  const handleDayClick = (day: CalendarDay) => {
    if (isDateDisabled(day)) return;

    if (!rangeStart) {
      setRangeStart(day.dateStr);
      onSelectRange?.({ start: day.dateStr });
    } else {
      if (isSameDay(day.dateStr, rangeStart)) {
        setRangeStart(undefined);
        onSelectRange?.({});
        return;
      }

      const start = day.dateStr < rangeStart ? day.dateStr : rangeStart;
      const end = day.dateStr < rangeStart ? rangeStart : day.dateStr;
      setRangeStart(undefined);
      onSelectRange?.({ start, end });
    }
  };

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDayClasses = (day: CalendarDay) => {
    const info = getAvailabilityInfo(day.dateStr);
    const disabled = isDateDisabled(day);
    const inRange = isInRange(day.dateStr);
    const edge = isRangeEdge(day.dateStr);

    const base =
      'relative h-11 w-11 flex items-center justify-center text-sm font-medium rounded-xl transition-all duration-150';

    if (!day.isCurrentMonth) {
      return cn(base, 'text-gray-300');
    }

    if (disabled) {
      const dateOnly = new Date(day.date);
      dateOnly.setHours(0, 0, 0, 0);
      const todayOnly = new Date();
      todayOnly.setHours(0, 0, 0, 0);
      const isPast = dateOnly < todayOnly;
      if (isPast) {
        return cn(base, 'text-gray-300 cursor-not-allowed');
      }
      return cn(
        base,
        'bg-red-50 text-red-400 line-through cursor-not-allowed'
      );
    }

    const isTight = info.left <= 2;

    if (edge === 'start' || edge === 'end') {
      return cn(
        base,
        'bg-brand-500 text-white shadow-md cursor-pointer hover:bg-brand-600 z-10',
        edge === 'start' && 'rounded-r-none',
        edge === 'end' && 'rounded-l-none'
      );
    }

    if (inRange) {
      return cn(
        base,
        'bg-brand-100 text-brand-700 rounded-none cursor-pointer hover:bg-brand-200'
      );
    }

    if (day.isToday) {
      return cn(
        base,
        'ring-2 ring-brand-500 ring-offset-2 cursor-pointer',
        isTight
          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'bg-forest-50 text-forest-700 border-2 border-forest-300 hover:border-forest-400'
      );
    }

    if (isTight) {
      return cn(
        base,
        'bg-amber-50 text-amber-700 cursor-pointer hover:bg-amber-100'
      );
    }

    return cn(
      base,
      'bg-green-50 text-forest-700 border-2 border-forest-200 cursor-pointer hover:border-forest-400 hover:shadow-soft'
    );
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goToPrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {currentYear}年{currentMonth}月
        </h3>
        <button
          onClick={goToNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div
            key={d}
            className="h-9 flex items-center justify-center text-xs font-medium text-gray-400"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => (
          <button
            key={day.dateStr}
            onClick={() => handleDayClick(day)}
            onMouseEnter={() =>
              rangeStart && !isDateDisabled(day) && setHoveredDate(day.dateStr)
            }
            onMouseLeave={() => setHoveredDate(undefined)}
            disabled={isDateDisabled(day)}
            className={getDayClasses(day)}
          >
            {day.day}
          </button>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-md bg-green-50 border-2 border-forest-200" />
            <span>可预约</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-md bg-amber-50" />
            <span>紧张</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-md bg-red-50" />
            <span>已满</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-md bg-brand-500" />
            <span>已选择</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-md ring-2 ring-brand-500 ring-offset-1" />
            <span>今天</span>
          </div>
        </div>
      </div>

      {selectedRange?.start && selectedRange?.end && (
        <div className="mt-4 rounded-2xl bg-brand-50 p-3 text-center">
          <span className="text-sm text-brand-700">
            已选择：{formatDate(selectedRange.start, 'MM月dd日')} - {formatDate(selectedRange.end, 'MM月dd日')}
          </span>
        </div>
      )}
    </div>
  );
}
