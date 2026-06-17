import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  PawPrint,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order, Provider, Pet } from '@/types';
import { useAppStore } from '@/store';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
  eachMinuteOfInterval,
  isWithinInterval,
  addMinutes,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getServiceLabel } from '@/utils/format';

interface CalendarBoardProps {
  orders: Order[];
  providers: Provider[];
}

const STATUS_BG: Record<string, string> = {
  pending_confirm: 'bg-amber-100 border-amber-300 text-amber-800',
  confirmed: 'bg-blue-100 border-blue-300 text-blue-800',
  in_service: 'bg-forest-100 border-forest-300 text-forest-800',
  pending_balance: 'bg-purple-100 border-purple-300 text-purple-800',
  completed: 'bg-gray-100 border-gray-300 text-gray-700',
  cancelled: 'bg-red-100 border-red-300 text-red-700',
};

const HOUR_HEIGHT = 60;
const START_HOUR = 8;
const END_HOUR = 20;

export default function CalendarBoard({
  orders,
  providers,
}: CalendarBoardProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const { pets } = useAppStore();

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const hours = useMemo(() => {
    const start = new Date();
    start.setHours(START_HOUR, 0, 0, 0);
    const end = new Date();
    end.setHours(END_HOUR, 0, 0, 0);
    return eachMinuteOfInterval(
      { start, end },
      { step: 60 }
    );
  }, []);

  const getPetById = (petId: string): Pet | undefined => {
    return pets.find((p) => p.id === petId);
  };

  const getOrdersForDay = (day: Date) => {
    return orders.filter((order) => {
      const start = parseISO(order.startDate);
      const end = parseISO(order.endDate);
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        if (isSameDay(d, day)) return true;
      }
      return false;
    });
  };

  const goToPrevWeek = () => setCurrentDate(addDays(weekStart, -7));
  const goToNextWeek = () => setCurrentDate(addDays(weekStart, 7));
  const goToToday = () => setCurrentDate(today);

  const hasAnyOrders = orders.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">预约日历</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(weekStart, 'yyyy年M月d日', { locale: zhCN })} -{' '}
              {format(addDays(weekStart, 6), 'M月d日', { locale: zhCN })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium',
              isSameDay(currentDate, today)
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Sun className="w-4 h-4" />
            今日
          </button>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={goToPrevWeek}
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextWeek}
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {!hasAnyOrders ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-brand-400" />
          </div>
          <h4 className="text-base font-medium text-gray-700 mb-1">暂无预约</h4>
          <p className="text-sm text-gray-400">
            还没有任何预约订单，等待客户下单吧~
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <div
            className="min-w-[800px]"
            style={{
              display: 'grid',
              gridTemplateColumns: '72px repeat(7, 1fr)',
            }}
          >
            <div className="col-span-8">
              <div
                className="grid"
                style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}
              >
                <div className="py-2" />
                {weekDays.map((day, idx) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'py-2 text-center border-b border-gray-100',
                        isToday ? 'bg-brand-50/50' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'text-xs text-gray-400',
                          isToday ? 'text-brand-500 font-medium' : ''
                        )}
                      >
                        {format(day, 'EEE', { locale: zhCN })}
                      </div>
                      <div
                        className={cn(
                          'w-8 h-8 mx-auto mt-1 rounded-full flex items-center justify-center text-sm font-medium',
                          isToday
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                            : 'text-gray-700'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-span-8 relative">
              <div
                className="grid relative"
                style={{
                  gridTemplateColumns: '72px repeat(7, 1fr)',
                  height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,
                }}
              >
                <div className="border-r border-gray-100">
                  {hours.map((hour, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-end pr-2 text-xs text-gray-400 font-medium"
                      style={{
                        height: HOUR_HEIGHT,
                        marginTop: idx === 0 ? 0 : 0,
                        transform: 'translateY(-6px)',
                      }}
                    >
                      {format(hour, 'HH:mm')}
                    </div>
                  ))}
                </div>

                {weekDays.map((day, dayIdx) => {
                  const dayOrders = getOrdersForDay(day);
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        'relative border-r border-gray-100',
                        isToday ? 'bg-brand-50/30' : ''
                      )}
                    >
                      {hours.map((_, hourIdx) => (
                        <div
                          key={hourIdx}
                          className="absolute left-0 right-0 border-b border-gray-50"
                          style={{
                            top: (hourIdx + 1) * HOUR_HEIGHT,
                          }}
                        />
                      ))}

                      <div className="p-1.5 space-y-1 relative h-full">
                        {dayOrders.map((order, orderIdx) => {
                          const pet = getPetById(order.petId);
                          const startTime = START_HOUR * 60 + 30;
                          const duration = 120;
                          const top =
                            ((startTime - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                          const height = (duration / 60) * HOUR_HEIGHT;

                          return (
                            <div
                              key={order.id}
                              className={cn(
                                'absolute left-1.5 right-1.5 rounded-lg border-l-4 px-2 py-1.5 overflow-hidden',
                                'cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all',
                                STATUS_BG[order.status] || STATUS_BG.confirmed
                              )}
                              style={{
                                top: Math.min(
                                  top + orderIdx * (height + 4),
                                  (END_HOUR - START_HOUR) * HOUR_HEIGHT -
                                    height -
                                    8
                                ),
                                height: Math.min(height, HOUR_HEIGHT * 2),
                              }}
                            >
                              <div className="flex items-center gap-1 text-xs font-semibold truncate">
                                <PawPrint className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {pet?.name || '宠物'}
                                </span>
                              </div>
                              <div className="text-[10px] opacity-80 truncate mt-0.5">
                                {getServiceLabel(order.serviceType)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
