export const AULAS_INIT = [
  { id: 1, name: "Aula 1", capacity: 12, tv: true, pizarron: true, enabled: true },
  { id: 2, name: "Aula 2", capacity: 12, tv: true, pizarron: true, enabled: true },
  { id: 3, name: "Aula 3", capacity: 12, tv: true, pizarron: true, enabled: true },
  { id: 4, name: "Aula 4", capacity: 12, tv: true, pizarron: false, enabled: true },
];

export const USERS_INIT = [
  { id: 1, name: "Juan Pérez", email: "juan@university.edu", code: "2021301456", faculty: "Ingeniería", blocked: false, reservations: 3 },
  { id: 2, name: "María García", email: "maria@university.edu", code: "2022104578", faculty: "Medicina", blocked: false, reservations: 5 },
  { id: 3, name: "Carlos López", email: "carlos@university.edu", code: "2020987654", faculty: "Derecho", blocked: false, reservations: 1 },
  { id: 4, name: "Ana Martínez", email: "ana@university.edu", code: "2023456789", faculty: "Arquitectura", blocked: true, reservations: 0 },
];

export const RESERVATIONS_INIT = [
  { id: 1, aula: "Aula 2", date: "2026-03-22", start: "10:00", end: "14:00", people: 9, faculty: "Medicina", status: "active" },
  { id: 2, aula: "Aula 1", date: "2026-03-21", start: "10:00", end: "12:00", people: 8, faculty: "Ingeniería", status: "active" },
  { id: 3, aula: "Aula 3", date: "2026-03-17", start: "14:00", end: "16:00", people: 5, faculty: "Ingeniería", status: "completed" },
];

export const NOTIFICATIONS_INIT = [
  { id: 1, type: "confirm", title: "Reserva Confirmada", desc: "Tu reserva para Aula 2 el 2026-03-23 ha sido confirmada.", time: "Hace 1 minuto", read: false },
  { id: 2, type: "upcoming", title: "Reserva Próxima", desc: "Tienes una reserva para Aula 1 mañana a las 10:00 AM.", time: "Hace 8 horas", read: false },
  { id: 3, type: "confirm", title: "Reserva Confirmada", desc: "Tu reserva para Aula 1 el 22 de marzo ha sido confirmada.", time: "Hace 1 día", read: false },
];

export const FACULTIES = ["Ingeniería", "Medicina", "Derecho", "Arquitectura", "Economía", "Ciencias"];

export const HOURS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
