import { User, Reservation, Notification } from '../types';
import { mockUsers, mockReservations, mockNotifications } from './mockData';

const STORAGE_KEYS = {
  USER: 'aulafacil_user',
  RESERVATIONS: 'aulafacil_reservations',
  NOTIFICATIONS: 'aulafacil_notifications',
  CLASSROOM_STATES: 'aulafacil_classroom_states',
  USERS: 'aulafacil_users',
};

// ─── User authentication ────────────────────────────────────────────────────

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const login = (email: string, password: string): User | null => {
  const allUsers = getAllUsers();
  const user = allUsers.find(u => u.email === email);
  if (user) {
    if (user.blocked) return null; // blocked users cannot login
    setCurrentUser(user);
    return user;
  }
  // fallback to mockUsers
  const mockUser = mockUsers.find(u => u.email === email);
  if (mockUser) {
    setCurrentUser(mockUser);
    return mockUser;
  }
  return null;
};

export const register = (email: string, password: string, name: string, faculty: string, studentId: string): User => {
  const newUser: User = {
    id: Date.now().toString(),
    studentId,
    email,
    name,
    faculty,
    role: 'student',
    blocked: false,
  };
  // persist in users list
  const users = getAllUsers();
  if (!users.find(u => u.email === email)) {
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  setCurrentUser(newUser);
  return newUser;
};

// ─── User management (admin) ────────────────────────────────────────────────

export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  const storedUsers: User[] = usersStr ? JSON.parse(usersStr) : [...mockUsers];
  // Merge with mock users to always include defaults
  const ids = new Set(storedUsers.map(u => u.id));
  const merged = [...storedUsers];
  for (const mu of mockUsers) {
    if (!ids.has(mu.id)) merged.push(mu);
  }
  return merged;
};

export const blockUser = (userId: string, blocked: boolean): void => {
  const users = getAllUsers();
  const updated = users.map(u => u.id === userId ? { ...u, blocked } : u);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
};

// ─── Reservations ───────────────────────────────────────────────────────────

export const getReservations = (): Reservation[] => {
  const reservationsStr = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
  return reservationsStr ? JSON.parse(reservationsStr) : mockReservations;
};

export const addReservation = (reservation: Omit<Reservation, 'id' | 'createdAt'>): Reservation => {
  const reservations = getReservations();
  const newReservation: Reservation = {
    ...reservation,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  reservations.push(newReservation);
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  return newReservation;
};

export const cancelReservation = (id: string): void => {
  const reservations = getReservations();
  const updated = reservations.map(r =>
    r.id === id ? { ...r, status: 'cancelled' as const } : r
  );
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
};

export const getUserReservations = (userId: string): Reservation[] => {
  const reservations = getReservations();
  return reservations.filter(r => r.userId === userId);
};

export const getActiveReservations = (userId: string): Reservation[] => {
  const reservations = getUserReservations(userId);
  return reservations.filter(r => r.status === 'active');
};

// ─── Classroom state management (admin) ────────────────────────────────────

export const getClassroomStates = (): Record<string, boolean> => {
  const str = localStorage.getItem(STORAGE_KEYS.CLASSROOM_STATES);
  return str ? JSON.parse(str) : {};
};

export const setClassroomDisabled = (classroomId: string, disabled: boolean): void => {
  const states = getClassroomStates();
  states[classroomId] = disabled;
  localStorage.setItem(STORAGE_KEYS.CLASSROOM_STATES, JSON.stringify(states));
};

export const isClassroomDisabled = (classroomId: string): boolean => {
  const states = getClassroomStates();
  return states[classroomId] === true;
};

// ─── Notifications ──────────────────────────────────────────────────────────

export const getNotifications = (userId: string): Notification[] => {
  const notificationsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications = notificationsStr ? JSON.parse(notificationsStr) : mockNotifications;
  return notifications.filter((n: Notification) => n.userId === userId);
};

export const markNotificationAsRead = (id: string): void => {
  const notificationsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications = notificationsStr ? JSON.parse(notificationsStr) : mockNotifications;
  const updated = notifications.map((n: Notification) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
};

export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
  const notificationsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications = notificationsStr ? JSON.parse(notificationsStr) : mockNotifications;
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  notifications.push(newNotification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

// ─── Availability check ─────────────────────────────────────────────────────

export const isClassroomAvailable = (
  classroomId: string,
  date: string,
  startTime: string,
  endTime: string
): boolean => {
  if (isClassroomDisabled(classroomId)) return false;

  const reservations = getReservations();
  const activeReservations = reservations.filter(
    r => r.classroomId === classroomId &&
         r.date === date &&
         r.status === 'active'
  );

  for (const reservation of activeReservations) {
    if (
      (startTime >= reservation.startTime && startTime < reservation.endTime) ||
      (endTime > reservation.startTime && endTime <= reservation.endTime) ||
      (startTime <= reservation.startTime && endTime >= reservation.endTime)
    ) {
      return false;
    }
  }

  return true;
};