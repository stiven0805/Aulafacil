import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Info, Lock, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { classrooms } from '../lib/mockData';
import { getReservations } from '../lib/storage';
import {
  isBlockedDay,
  isSunday,
  isHoliday,
  isSaturday,
  getHolidayName,
  getTimeSlotsForDate,
  formatHour,
  getEndTime,
  toDateStr,
} from '../lib/colombianHolidays';
import type { Reservation } from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

function getDayLabel(date: Date): string {
  if (isSunday(date)) return 'Domingo';
  if (isHoliday(date)) return getHolidayName(date) ?? 'Festivo';
  if (isSaturday(date)) return 'Sábado · 8:00 AM – 12:00 PM';
  return 'Lunes–Viernes · 7:00 AM – 7:00 PM';
}

const WEEKDAY_HEADERS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ─── sub-components ─────────────────────────────────────────────────────────

function MonthCalendar({
  year, month, selectedDate, reservations,
  onSelectDate, onPrevMonth, onNextMonth,
}: {
  year: number; month: number; selectedDate: Date; reservations: Reservation[];
  onSelectDate: (d: Date) => void; onPrevMonth: () => void; onNextMonth: () => void;
}) {
  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const blanks = Array(firstDayOfWeek).fill(null);

  function hasReservation(date: Date): boolean {
    const ds = toDateStr(date);
    return reservations.some(r => r.date === ds && r.status === 'active');
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2563eb] text-white">
        <button
          onClick={onPrevMonth}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-sm tracking-wide">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAY_HEADERS.map(d => (
          <div
            key={d}
            className={`text-center text-xs py-2 font-semibold ${d === 'Dom' ? 'text-red-400' : 'text-gray-400'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 p-2 gap-0.5">
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {days.map(date => {
          const blocked = isBlockedDay(date);
          const sat = isSaturday(date);
          const selected = isSameDay(date, selectedDate);
          const today = isToday(date);
          const hasRes = hasReservation(date);
          const holiday = isHoliday(date);

          return (
            <button
              key={toDateStr(date)}
              onClick={() => !blocked && onSelectDate(date)}
              disabled={blocked}
              title={blocked ? getDayLabel(date) : undefined}
              className={`
                relative flex flex-col items-center justify-center rounded-lg
                w-full aspect-square text-xs font-medium transition-all
                ${selected
                  ? 'bg-[#2563eb] text-white shadow-md scale-105'
                  : blocked
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : sat
                      ? 'hover:bg-blue-50 text-blue-700 cursor-pointer'
                      : 'hover:bg-blue-50 text-gray-700 cursor-pointer'
                }
                ${today && !selected ? 'ring-2 ring-[#2563eb] ring-offset-1' : ''}
                ${holiday && !selected ? 'text-orange-500' : ''}
              `}
            >
              {date.getDate()}
              {/* Dot for reservations */}
              {hasRes && !blocked && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${selected ? 'bg-white' : 'bg-[#2563eb]'}`} />
              )}
              {/* Holiday marker */}
              {holiday && !selected && (
                <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-orange-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-[#2563eb] inline-block" />
          Con reserva
        </div>
        <div className="flex items-center gap-2 text-xs text-orange-500">
          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
          Festivo colombiano
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />
          Domingo / sin servicio
        </div>
      </div>
    </div>
  );
}

// ─── Day schedule panel ──────────────────────────────────────────────────────

function DaySchedule({
  date, reservations,
}: { date: Date; reservations: Reservation[] }) {
  const blocked = isBlockedDay(date);
  const slots = getTimeSlotsForDate(date);
  const holiday = isHoliday(date);

  const dateStr = toDateStr(date);
  const dayName = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function isReserved(classroomId: string, time: string): boolean {
    return reservations.some(r =>
      r.classroomId === classroomId &&
      r.date === dateStr &&
      r.status === 'active' &&
      time >= r.startTime &&
      time < r.endTime
    );
  }

  function getReservation(classroomId: string, time: string): Reservation | undefined {
    return reservations.find(r =>
      r.classroomId === classroomId &&
      r.date === dateStr &&
      r.status === 'active' &&
      time >= r.startTime &&
      time < r.endTime
    );
  }

  // Availability summary
  const totalSlots = slots.length * classrooms.length;
  const occupiedSlots = classrooms.reduce((acc, cls) =>
    acc + slots.filter(t => isReserved(cls.id, t)).length, 0
  );
  const availableSlots = totalSlots - occupiedSlots;

  if (blocked) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Día seleccionado</p>
          <h2 className="font-bold text-gray-800 capitalize">{dayName}</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isSunday(date) ? 'bg-gray-100' : 'bg-orange-50'
          }`}>
            <Lock className={`w-7 h-7 ${isSunday(date) ? 'text-gray-400' : 'text-orange-400'}`} />
          </div>
          <h3 className={`font-bold mb-2 ${isSunday(date) ? 'text-gray-500' : 'text-orange-600'}`}>
            {isSunday(date) ? 'Domingo — Sin servicio' : `Festivo: ${getHolidayName(date)}`}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            {isSunday(date)
              ? 'Los domingos no hay servicio de reserva de aulas.'
              : 'Este día es festivo en Colombia. No hay reservas disponibles.'
            }
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Horarios disponibles</p>
            <p>🗓 Lunes a Viernes: 7:00 AM – 7:00 PM</p>
            <p>🗓 Sábados: 8:00 AM – 12:00 PM</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Disponibilidad del día</p>
            <h2 className="font-bold text-gray-800 capitalize">{dayName}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {isSaturday(date) ? '8:00 AM – 12:00 PM' : '7:00 AM – 7:00 PM'}
              </span>
              {isSaturday(date) && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-50 text-blue-600 rounded font-medium">Sábado</span>
              )}
            </div>
          </div>
          {/* Summary pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-700">{availableSlots} libres</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-semibold text-red-600">{occupiedSlots} ocupados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Classroom headers */}
          <div className="grid border-b border-gray-100 bg-gray-50"
            style={{ gridTemplateColumns: `80px repeat(${classrooms.length}, 1fr)` }}
          >
            <div className="px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Hora</div>
            {classrooms.map(cls => (
              <div key={cls.id} className="px-2 py-2.5 text-center">
                <p className="text-xs font-bold text-gray-700">{cls.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {cls.hasWhiteboard ? '📋 TV + Pizarrón' : '📺 Solo TV'}
                </p>
              </div>
            ))}
          </div>

          {/* Time rows */}
          <div className="divide-y divide-gray-50">
            {slots.map((time, idx) => {
              const endTime = getEndTime(time);
              const isLunchBreak = time === '12:00' && !isSaturday(date);

              return (
                <div
                  key={time}
                  className={`grid items-stretch ${isLunchBreak ? 'bg-amber-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  style={{ gridTemplateColumns: `80px repeat(${classrooms.length}, 1fr)` }}
                >
                  {/* Time label */}
                  <div className="px-3 py-2 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-gray-600">{formatHour(time)}</span>
                    <span className="text-xs text-gray-300">–{formatHour(endTime)}</span>
                    {isLunchBreak && (
                      <span className="text-xs text-amber-500 mt-0.5">Almuerzo</span>
                    )}
                  </div>

                  {/* Classroom cells */}
                  {classrooms.map(cls => {
                    const reserved = isReserved(cls.id, time);
                    const res = getReservation(cls.id, time);
                    const isStart = res && res.startTime === time;

                    return (
                      <div
                        key={cls.id}
                        className="px-1.5 py-1.5 flex items-center justify-center"
                        title={reserved
                          ? `Reservado por ${res?.userName} (${res?.startTime}–${res?.endTime})`
                          : `${cls.name} disponible a las ${formatHour(time)}`
                        }
                      >
                        <div
                          className={`w-full rounded-lg px-2 py-2 text-center transition-all ${
                            reserved
                              ? 'bg-red-100 border border-red-200'
                              : 'bg-green-50 border border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {reserved ? (
                            <div>
                              <div className="text-xs">🔒</div>
                              {isStart && (
                                <div className="text-xs text-red-600 mt-0.5 leading-tight truncate max-w-full">
                                  {res?.userName?.split(' ')[0]}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-green-600">✓</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer legend */}
      <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
          <span className="text-xs text-gray-500">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
          <span className="text-xs text-gray-500">Reservado</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Info className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400">Pasa el cursor sobre una celda para más detalles</span>
        </div>
      </div>
    </div>
  );
}

// ─── Week overview strip ─────────────────────────────────────────────────────

function WeekStrip({
  baseDate, selectedDate, reservations, onSelectDate,
}: {
  baseDate: Date; selectedDate: Date; reservations: Reservation[];
  onSelectDate: (d: Date) => void;
}) {
  // Build Mon–Sun of the week containing baseDate
  const monday = (() => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  })();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  function dayOccupancy(date: Date): { total: number; occupied: number } {
    const slots = getTimeSlotsForDate(date);
    if (slots.length === 0) return { total: 0, occupied: 0 };
    const ds = toDateStr(date);
    const occupied = classrooms.reduce((acc, cls) =>
      acc + slots.filter(t =>
        reservations.some(r =>
          r.classroomId === cls.id && r.date === ds && r.status === 'active' &&
          t >= r.startTime && t < r.endTime
        )
      ).length, 0
    );
    return { total: slots.length * classrooms.length, occupied };
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold px-1 mb-2">Semana actual</p>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(date => {
          const blocked = isBlockedDay(date);
          const selected = isSameDay(date, selectedDate);
          const today = isToday(date);
          const { total, occupied } = dayOccupancy(date);
          const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
          const dayInitial = date.toLocaleDateString('es-ES', { weekday: 'short' });

          return (
            <button
              key={toDateStr(date)}
              onClick={() => !blocked && onSelectDate(date)}
              disabled={blocked}
              className={`
                flex flex-col items-center rounded-lg px-1 py-2 transition-all text-center
                ${selected ? 'bg-[#2563eb] text-white shadow-md' : ''}
                ${!selected && !blocked ? 'hover:bg-blue-50 cursor-pointer' : ''}
                ${!selected && blocked ? 'opacity-40 cursor-not-allowed' : ''}
                ${today && !selected ? 'ring-2 ring-[#2563eb] ring-offset-1' : ''}
              `}
            >
              <span className={`text-xs font-semibold ${selected ? 'text-blue-100' : 'text-gray-400'}`}>
                {dayInitial.substring(0, 3)}
              </span>
              <span className={`text-sm font-bold mt-0.5 ${selected ? 'text-white' : blocked ? 'text-gray-300' : 'text-gray-700'}`}>
                {date.getDate()}
              </span>
              {!blocked && total > 0 ? (
                <div className={`mt-1.5 w-full rounded-full h-1 ${selected ? 'bg-blue-300' : 'bg-gray-200'}`}>
                  <div
                    className={`h-1 rounded-full ${pct > 70 ? 'bg-red-400' : pct > 30 ? 'bg-amber-400' : 'bg-green-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : (
                <div className="mt-1.5 w-full h-1" />
              )}
              {!blocked && (
                <span className={`text-xs mt-1 ${selected ? 'text-blue-100' : pct > 70 ? 'text-red-500' : 'text-green-500'}`}>
                  {pct}%
                </span>
              )}
              {blocked && <span className="text-xs mt-1 text-gray-300">🔒</span>}
            </button>
          );
        })}
      </div>

      {/* Occupancy bar legend */}
      <div className="flex items-center gap-3 mt-3 px-1 flex-wrap">
        <span className="text-xs text-gray-400">Ocupación:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-500">Baja</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-500">Media</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-full bg-red-400" />
          <span className="text-xs text-gray-500">Alta</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CalendarView() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    setReservations(getReservations());
  }, []);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setCalYear(date.getFullYear());
    setCalMonth(date.getMonth());
  }

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#2563eb]/10 rounded-xl">
          <CalendarDays className="w-6 h-6 text-[#2563eb]" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900" style={{ fontSize: '1.5rem' }}>Calendario de Aulas</h1>
          <p className="text-sm text-gray-500">Consulta la disponibilidad por día · Domingos y festivos no tienen servicio</p>
        </div>
      </div>

      {/* Schedule info banner */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span><strong>Lun–Vie:</strong> 7:00 AM – 7:00 PM</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span><strong>Sábados:</strong> 8:00 AM – 12:00 PM</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>Domingos y festivos colombianos bloqueados</span>
        </div>
      </div>

      {/* Week strip */}
      <WeekStrip
        baseDate={selectedDate}
        selectedDate={selectedDate}
        reservations={reservations}
        onSelectDate={handleSelectDate}
      />

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        {/* Left: month calendar */}
        <MonthCalendar
          year={calYear}
          month={calMonth}
          selectedDate={selectedDate}
          reservations={reservations}
          onSelectDate={handleSelectDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

        {/* Right: day schedule */}
        <DaySchedule
          date={selectedDate}
          reservations={reservations}
        />
      </div>
    </div>
  );
}
