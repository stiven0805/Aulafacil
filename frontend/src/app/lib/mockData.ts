import { Classroom, Reservation, User, Notification } from '../types';

export const CLASSROOM_RULES = [
  "No está permitido comer",
  "No hacer ruido excesivo",
  "Cuida el equipo (TV, pizarrón)",
  "Respeta el horario reservado"
];

export const classrooms: Classroom[] = [
  {
    id: '1',
    name: 'Aula 1',
    capacity: 12,
    hasTV: true,
    hasWhiteboard: true,
    status: 'available'
  },
  {
    id: '2',
    name: 'Aula 2',
    capacity: 12,
    hasTV: true,
    hasWhiteboard: true,
    status: 'available'
  },
  {
    id: '3',
    name: 'Aula 3',
    capacity: 12,
    hasTV: true,
    hasWhiteboard: true,
    status: 'available'
  },
  {
    id: '4',
    name: 'Aula 4',
    capacity: 12,
    hasTV: true,
    hasWhiteboard: false,
    status: 'available'
  }
];

export const mockReservations: Reservation[] = [
  {
    id: '1',
    classroomId: '1',
    classroomName: 'Aula 1',
    userId: '1',
    userName: 'Juan Pérez',
    faculty: 'Ingeniería',
    numberOfPeople: 8,
    date: '2026-03-22',
    startTime: '10:00',
    endTime: '12:00',
    duration: 2,
    status: 'active',
    createdAt: '2026-03-20T08:30:00Z'
  },
  {
    id: '2',
    classroomId: '3',
    classroomName: 'Aula 3',
    userId: '1',
    userName: 'Juan Pérez',
    faculty: 'Ingeniería',
    numberOfPeople: 5,
    date: '2026-03-18',
    startTime: '14:00',
    endTime: '16:00',
    duration: 2,
    status: 'completed',
    createdAt: '2026-03-15T10:00:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    studentId: '2021301456',
    email: 'student@university.edu',
    name: 'Juan Pérez',
    faculty: 'Ingeniería',
    role: 'student',
    blocked: false,
  },
  {
    id: '2',
    studentId: '0000000000',
    email: 'admin@university.edu',
    name: 'Admin User',
    faculty: 'Administración',
    role: 'admin',
    blocked: false,
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Reserva Confirmada',
    message: 'Tu reserva para Aula 1 el 22 de marzo ha sido confirmada.',
    type: 'success',
    read: false,
    createdAt: '2026-03-20T08:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    title: 'Próxima Reserva',
    message: 'Tienes una reserva para Aula 1 mañana a las 10:00 AM.',
    type: 'info',
    read: false,
    createdAt: '2026-03-21T09:00:00Z'
  }
];

export const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

export const FACULTIES = [
  'Ingeniería',
  'Medicina',
  'Derecho',
  'Ciencias Económicas',
  'Arquitectura',
  'Psicología',
  'Ciencias Exactas',
  'Filosofía y Letras'
];