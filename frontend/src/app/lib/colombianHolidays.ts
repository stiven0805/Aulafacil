/**
 * Festivos colombianos 2025–2026
 * Ley Emiliani: los festivos que caen entre martes y sábado
 * se corren al lunes siguiente.
 */

export const COLOMBIAN_HOLIDAYS: string[] = [
  // 2025
  '2025-01-01', // Año Nuevo
  '2025-01-06', // Reyes Magos
  '2025-03-24', // San José (lunes siguiente al 19/mar que es miércoles)
  '2025-04-17', // Jueves Santo
  '2025-04-18', // Viernes Santo
  '2025-05-01', // Día del Trabajo
  '2025-06-02', // Ascensión
  '2025-06-23', // Corpus Christi
  '2025-06-30', // Sagrado Corazón
  '2025-06-30', // San Pedro y San Pablo (lunes)
  '2025-07-20', // Independencia
  '2025-08-07', // Batalla de Boyacá
  '2025-08-18', // Asunción (lunes siguiente al 15)
  '2025-10-13', // Día de la Raza (lunes)
  '2025-11-03', // Todos los Santos (lunes)
  '2025-11-17', // Independencia de Cartagena (lunes)
  '2025-12-08', // Inmaculada Concepción
  '2025-12-25', // Navidad

  // 2026
  '2026-01-01', // Año Nuevo
  '2026-01-12', // Reyes Magos (lunes)
  '2026-03-23', // San José (lunes)
  '2026-04-02', // Jueves Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-18', // Ascensión (lunes)
  '2026-06-08', // Corpus Christi (lunes)
  '2026-06-15', // Sagrado Corazón (lunes)
  '2026-06-29', // San Pedro y San Pablo (lunes)
  '2026-07-20', // Independencia
  '2026-08-07', // Batalla de Boyacá
  '2026-08-17', // Asunción (lunes)
  '2026-10-12', // Día de la Raza (lunes)
  '2026-11-02', // Todos los Santos (lunes)
  '2026-11-16', // Independencia de Cartagena (lunes)
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
];

export const HOLIDAY_NAMES: Record<string, string> = {
  // 2026
  '2026-01-01': 'Año Nuevo',
  '2026-01-12': 'Reyes Magos',
  '2026-03-23': 'San José',
  '2026-04-02': 'Jueves Santo',
  '2026-04-03': 'Viernes Santo',
  '2026-05-01': 'Día del Trabajo',
  '2026-05-18': 'Ascensión',
  '2026-06-08': 'Corpus Christi',
  '2026-06-15': 'Sagrado Corazón',
  '2026-06-29': 'San Pedro y San Pablo',
  '2026-07-20': 'Independencia',
  '2026-08-07': 'Batalla de Boyacá',
  '2026-08-17': 'Asunción de la Virgen',
  '2026-10-12': 'Día de la Raza',
  '2026-11-02': 'Todos los Santos',
  '2026-11-16': 'Independencia de Cartagena',
  '2026-12-08': 'Inmaculada Concepción',
  '2026-12-25': 'Navidad',
};

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isHoliday(date: Date): boolean {
  return COLOMBIAN_HOLIDAYS.includes(toDateStr(date));
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

export function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

export function isBlockedDay(date: Date): boolean {
  return isSunday(date) || isHoliday(date);
}

export function getHolidayName(date: Date): string | undefined {
  return HOLIDAY_NAMES[toDateStr(date)];
}

/** Franjas horarias según día */
export function getTimeSlotsForDate(date: Date): string[] {
  if (isBlockedDay(date)) return [];
  if (isSaturday(date)) {
    return ['08:00', '09:00', '10:00', '11:00'];
  }
  // Lunes a viernes: 7:00 a 18:00 (último bloque termina a las 19:00)
  return [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  ];
}

export function getEndTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatHour(time: string): string {
  const [h] = time.split(':').map(Number);
  if (h === 0) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}
