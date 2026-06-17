import { Sun, Sunset, Clock, CalendarDays } from 'lucide-react';
import type { Provider } from '@/types';
import { formatDate, getDaysBetween } from '@/utils/date';
import { cn } from '@/lib/utils';
import AvailabilityCalendar from '../provider/AvailabilityCalendar';

interface SelectedRange {
  start?: string;
  end?: string;
}

export type TimeSlot = 'morning' | 'afternoon' | 'fullday';

const timeSlotOptions: {
  value: TimeSlot;
  label: string;
  time: string;
  icon: typeof Sun;
  desc: string;
}[] = [
  {
    value: 'morning',
    label: '上午',
    time: '09:00 - 12:00',
    icon: Sun,
    desc: '适合送托/上门早间服务',
  },
  {
    value: 'afternoon',
    label: '下午',
    time: '14:00 - 18:00',
    icon: Sunset,
    desc: '适合接回/上门晚间服务',
  },
  {
    value: 'fullday',
    label: '全天',
    time: '09:00 - 18:00',
    icon: Clock,
    desc: '全日托管/寄养服务',
  },
];

interface DateTimePickerProps {
  provider: Provider;
  startDate?: string;
  endDate?: string;
  onDateChange: (range: SelectedRange) => void;
  selectedSlot?: TimeSlot;
  onSlotChange?: (slot: TimeSlot) => void;
}

export default function DateTimePicker({
  provider,
  startDate,
  endDate,
  onDateChange,
  selectedSlot,
  onSlotChange,
}: DateTimePickerProps) {
  const selectedRange: SelectedRange = { start: startDate, end: endDate };
  const daysCount = startDate && endDate ? getDaysBetween(startDate, endDate) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">选择日期</h3>
        <p className="text-sm text-gray-500 mb-4">点击日历选择入住和离店日期</p>
        <AvailabilityCalendar
          provider={provider}
          selectedRange={selectedRange}
          onSelectRange={onDateChange}
        />
      </div>

      {startDate && endDate && daysCount > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-brand-50 to-cream-50 p-5 border border-brand-100">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5 text-brand-500" />
            <span className="font-semibold text-gray-900">已选日期范围</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">入住日期</div>
              <div className="text-lg font-bold text-gray-900">
                {formatDate(startDate, 'MM月dd日')}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {formatDate(startDate, 'EEEE')}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-brand-500">{daysCount}</div>
              <div className="text-xs text-gray-500">天</div>
              <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">离店日期</div>
              <div className="text-lg font-bold text-gray-900">
                {formatDate(endDate, 'MM月dd日')}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {formatDate(endDate, 'EEEE')}
              </div>
            </div>
          </div>
        </div>
      )}

      {onSlotChange && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">选择时段</h3>
          <p className="text-sm text-gray-500 mb-4">选择您方便的服务时段</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {timeSlotOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedSlot === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onSlotChange(option.value)}
                  className={cn(
                    'p-4 rounded-2xl border-2 text-left transition-all duration-200',
                    isSelected
                      ? 'border-brand-500 bg-brand-50 shadow-float'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-soft'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        isSelected ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div
                        className={cn(
                          'font-semibold',
                          isSelected ? 'text-brand-700' : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">{option.time}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 pl-1">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
