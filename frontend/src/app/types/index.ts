export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  hasTV: boolean;
  hasWhiteboard: boolean;
  status: 'available' | 'occupied' | 'disabled';
}

export interface Reservation {
  id: string;
  classroomId: string;
  classroomName: string;
  userId: string;
  userName: string;
  faculty: string;
  numberOfPeople: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  studentId: string;       // Código estudiantil
  email: string;
  name: string;
  faculty: string;
  role: 'student' | 'admin';
  blocked?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  classroomId: string;
  available: boolean;
  reservationId?: string;
}