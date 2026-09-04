import { Classroom, Reservation, User, Notification } from '../types';

export const CLASSROOM_RULES = [
  "No se permite comida ni bebidas",
  "Mantén el ruido en un nivel apropiado",
  "Cuida los equipos (TV, pizarrón, mesas)",
  "Respeta el horario de tu reserva",
  "Deja el aula limpia y ordenada",
  "Reporta cualquier daño al personal"
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

export const mockReservations: Reservation[] = [];

export const mockUsers: User[] = [
  { id: '1', studentId: '2021001001', email: 'user1@university.edu', name: 'Usuario 1', faculty: 'Ingeniería', role: 'student', blocked: false },
  { id: '2', studentId: '2021001002', email: 'user2@university.edu', name: 'Usuario 2', faculty: 'Medicina', role: 'student', blocked: false },
  { id: '3', studentId: '2021001003', email: 'user3@university.edu', name: 'Usuario 3', faculty: 'Derecho', role: 'student', blocked: false },
  { id: '4', studentId: '2021001004', email: 'user4@university.edu', name: 'Usuario 4', faculty: 'Arquitectura', role: 'student', blocked: false },
  { id: '5', studentId: '2021001005', email: 'user5@university.edu', name: 'Usuario 5', faculty: 'Psicología', role: 'student', blocked: false },
  { id: '6', studentId: '2021001006', email: 'user6@university.edu', name: 'Usuario 6', faculty: 'Ciencias Económicas', role: 'student', blocked: false },
  { id: '7', studentId: '9999999999', email: 'admin@university.edu', name: 'Admin', faculty: 'Administración', role: 'admin', blocked: false }
];

export const mockNotifications: Notification[] = [];

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