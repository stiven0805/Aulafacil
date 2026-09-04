import { User, Reservation, Notification } from "../types";

import {
  mockUsers,
  mockReservations,
} from "./mockData";

// ============================================================================
// CLAVES DE LOCALSTORAGE
// ============================================================================
//
// Todas las claves utilizadas por AulaFácil para guardar información
// temporal/localmente en el navegador.
// ============================================================================

const STORAGE_KEYS = {
  USER: "aulafacil_user",
  RESERVATIONS: "aulafacil_reservations",
  NOTIFICATIONS: "aulafacil_notifications",
  CLASSROOM_STATES: "aulafacil_classroom_states",
  USERS: "aulafacil_users",
};

// ============================================================================
// AUTENTICACIÓN DEL USUARIO
// ============================================================================

/**
 * Obtiene el usuario actualmente autenticado.
 *
 * El usuario se guarda en localStorage después de iniciar sesión.
 *
 * @returns Usuario actual o null si no existe una sesión.
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);

  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Guarda el usuario actual en localStorage.
 *
 * @param user Usuario que inició sesión.
 */
export const setCurrentUser = (user: User) => {
  localStorage.setItem(
    STORAGE_KEYS.USER,
    JSON.stringify(user)
  );
};

/**
 * Cierra la sesión del usuario actual.
 */
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Realiza un inicio de sesión local.
 *
 * Primero busca al usuario entre los usuarios almacenados.
 * Si no lo encuentra, utiliza los usuarios de prueba.
 *
 * @param email Correo electrónico.
 * @param password Contraseña.
 *
 * @returns Usuario encontrado o null.
 */
export const login = (
  email: string,
  password: string
): User | null => {
  // La contraseña se mantiene como parámetro porque forma
  // parte del flujo actual de autenticación del frontend.
  // La autenticación real se realiza actualmente mediante el backend/JWT.
  void password;

  const allUsers = getAllUsers();

  const user = allUsers.find(
    (u) => u.email === email
  );

  if (user) {
    // Los usuarios bloqueados no pueden iniciar sesión.
    if (user.blocked) {
      return null;
    }

    setCurrentUser(user);

    return user;
  }

  // Fallback para usuarios de prueba.
  const mockUser = mockUsers.find(
    (u) => u.email === email
  );

  if (mockUser) {
    setCurrentUser(mockUser);

    return mockUser;
  }

  return null;
};

/**
 * Registra un nuevo usuario localmente.
 *
 * @param email Correo electrónico.
 * @param password Contraseña.
 * @param name Nombre completo.
 * @param faculty Facultad.
 * @param studentId Identificación del estudiante.
 *
 * @returns Usuario creado.
 */
export const register = (
  email: string,
  password: string,
  name: string,
  faculty: string,
  studentId: string
): User => {
  // La contraseña se mantiene en la firma para conservar
  // compatibilidad con el flujo actual.
  void password;

  const newUser: User = {
    id: Date.now().toString(),
    studentId,
    email,
    name,
    faculty,
    role: "student",
    blocked: false,
  };

  // Obtiene los usuarios existentes.
  const users = getAllUsers();

  // Evita registrar dos veces el mismo correo.
  if (!users.find((u) => u.email === email)) {
    users.push(newUser);

    localStorage.setItem(
      STORAGE_KEYS.USERS,
      JSON.stringify(users)
    );
  }

  // Establece al nuevo usuario como usuario actual.
  setCurrentUser(newUser);

  return newUser;
};

// ============================================================================
// GESTIÓN DE USUARIOS
// ============================================================================

/**
 * Obtiene todos los usuarios disponibles.
 *
 * Combina los usuarios guardados en localStorage con
 * los usuarios mock que todavía no estén registrados.
 */
export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem(
    STORAGE_KEYS.USERS
  );

  const storedUsers: User[] = usersStr
    ? JSON.parse(usersStr)
    : [...mockUsers];

  // Conjunto de IDs para evitar usuarios duplicados.
  const ids = new Set(
    storedUsers.map((u) => u.id)
  );

  const merged = [...storedUsers];

  // Agrega usuarios mock que todavía no existan.
  for (const mockUser of mockUsers) {
    if (!ids.has(mockUser.id)) {
      merged.push(mockUser);
    }
  }

  return merged;
};

/**
 * Bloquea o desbloquea un usuario.
 *
 * @param userId Identificador del usuario.
 * @param blocked true = bloqueado, false = desbloqueado.
 */
export const blockUser = (
  userId: string,
  blocked: boolean
): void => {
  const users = getAllUsers();

  const updated = users.map((user) =>
    user.id === userId
      ? { ...user, blocked }
      : user
  );

  localStorage.setItem(
    STORAGE_KEYS.USERS,
    JSON.stringify(updated)
  );
};

// ============================================================================
// RESERVAS
// ============================================================================

/**
 * Obtiene todas las reservas almacenadas localmente.
 *
 * Si todavía no existen reservas locales, utiliza las reservas
 * de prueba del proyecto.
 */
export const getReservations = (): Reservation[] => {
  const reservationsStr = localStorage.getItem(
    STORAGE_KEYS.RESERVATIONS
  );

  return reservationsStr
    ? JSON.parse(reservationsStr)
    : mockReservations;
};

/**
 * Crea una nueva reserva local.
 *
 * @param reservation Datos de la reserva sin id ni createdAt.
 *
 * @returns Reserva creada.
 */
export const addReservation = (
  reservation: Omit<
    Reservation,
    "id" | "createdAt"
  >
): Reservation => {
  const reservations = getReservations();

  const newReservation: Reservation = {
    ...reservation,

    // Identificador local generado automáticamente.
    id: Date.now().toString(),

    // Fecha y hora reales de creación.
    createdAt: new Date().toISOString(),
  };

  reservations.push(newReservation);

  localStorage.setItem(
    STORAGE_KEYS.RESERVATIONS,
    JSON.stringify(reservations)
  );

  return newReservation;
};

/**
 * Cancela una reserva localmente.
 *
 * @param id Identificador de la reserva.
 */
export const cancelReservation = (
  id: string
): void => {
  const reservations = getReservations();

  const updated = reservations.map((reservation) =>
    reservation.id === id
      ? {
          ...reservation,
          status: "cancelled" as const,
        }
      : reservation
  );

  localStorage.setItem(
    STORAGE_KEYS.RESERVATIONS,
    JSON.stringify(updated)
  );
};

/**
 * Obtiene las reservas pertenecientes a un usuario.
 *
 * @param userId Identificador del usuario.
 */
export const getUserReservations = (
  userId: string
): Reservation[] => {
  const reservations = getReservations();

  return reservations.filter(
    (reservation) =>
      reservation.userId === userId
  );
};

/**
 * Obtiene únicamente las reservas activas de un usuario.
 *
 * @param userId Identificador del usuario.
 */
export const getActiveReservations = (
  userId: string
): Reservation[] => {
  const reservations =
    getUserReservations(userId);

  return reservations.filter(
    (reservation) =>
      reservation.status === "active"
  );
};

// ============================================================================
// ESTADO DE LAS AULAS
// ============================================================================

/**
 * Obtiene el estado de las aulas.
 *
 * El objeto utiliza:
 *
 * {
 *   "id_aula": true
 * }
 *
 * donde true significa que el aula está deshabilitada.
 */
export const getClassroomStates =
  (): Record<string, boolean> => {
    const str = localStorage.getItem(
      STORAGE_KEYS.CLASSROOM_STATES
    );

    return str ? JSON.parse(str) : {};
  };

/**
 * Habilita o deshabilita un aula.
 *
 * @param classroomId Identificador del aula.
 * @param disabled true = deshabilitada.
 */
export const setClassroomDisabled = (
  classroomId: string,
  disabled: boolean
): void => {
  const states = getClassroomStates();

  states[classroomId] = disabled;

  localStorage.setItem(
    STORAGE_KEYS.CLASSROOM_STATES,
    JSON.stringify(states)
  );
};

/**
 * Comprueba si un aula está deshabilitada.
 *
 * @param classroomId Identificador del aula.
 *
 * @returns true si está deshabilitada.
 */
export const isClassroomDisabled = (
  classroomId: string
): boolean => {
  const states = getClassroomStates();

  return states[classroomId] === true;
};

// ============================================================================
// NOTIFICACIONES
// ============================================================================

/**
 * Obtiene las notificaciones de un usuario.
 *
 * IMPORTANTE:
 * Si no existen notificaciones en localStorage, se devuelve
 * una lista vacía.
 *
 * Antes se utilizaba mockNotifications como fallback, lo que
 * provocaba que aparecieran fechas antiguas de los datos de prueba,
 * por ejemplo "20 de mar" o "21 de mar".
 *
 * Ahora las notificaciones reales empiezan vacías y solamente
 * se agregan cuando el sistema crea una nueva notificación.
 *
 * @param userId Identificador del usuario.
 *
 * @returns Lista de notificaciones del usuario.
 */
export const getNotifications = (
  userId: string
): Notification[] => {
  const notificationsStr =
    localStorage.getItem(
      STORAGE_KEYS.NOTIFICATIONS
    );

  // Si no existen notificaciones guardadas,
  // comenzamos con una lista vacía.
  const notifications: Notification[] =
    notificationsStr
      ? JSON.parse(notificationsStr)
      : [];

  // Devuelve únicamente las notificaciones
  // correspondientes al usuario solicitado.
  return notifications.filter(
    (notification: Notification) =>
      notification.userId === userId
  );
};

/**
 * Marca una notificación como leída.
 *
 * @param id Identificador de la notificación.
 */
export const markNotificationAsRead = (
  id: string
): void => {
  const notificationsStr =
    localStorage.getItem(
      STORAGE_KEYS.NOTIFICATIONS
    );

  // No utilizamos mockNotifications aquí.
  // Solo trabajamos con las notificaciones reales
  // almacenadas en el navegador.
  const notifications: Notification[] =
    notificationsStr
      ? JSON.parse(notificationsStr)
      : [];

  const updated = notifications.map(
    (notification: Notification) =>
      notification.id === id
        ? {
            ...notification,
            read: true,
          }
        : notification
  );

  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(updated)
  );
};

/**
 * Crea una nueva notificación.
 *
 * La fecha de creación se genera automáticamente
 * utilizando la fecha y hora actuales del navegador.
 *
 * Esto permite que Notifications.tsx pueda mostrar:
 *
 * "Justo ahora"
 * "Hace 5 min"
 * "Hace 2 h"
 * "Hace 3 días"
 * etc.
 *
 * @param notification Datos de la notificación sin id ni createdAt.
 */
export const addNotification = (
  notification: Omit<
    Notification,
    "id" | "createdAt"
  >
): void => {
  const notificationsStr =
    localStorage.getItem(
      STORAGE_KEYS.NOTIFICATIONS
    );

  // Si todavía no existen notificaciones,
  // comenzamos con una lista vacía.
  const notifications: Notification[] =
    notificationsStr
      ? JSON.parse(notificationsStr)
      : [];

  const newNotification: Notification = {
    ...notification,

    // Genera un ID único basado en la hora actual.
    id: Date.now().toString(),

    // IMPORTANTE:
    // Guarda la fecha y hora exactas en las que
    // se creó esta notificación.
    createdAt: new Date().toISOString(),
  };

  notifications.push(newNotification);

  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(notifications)
  );
};

// ============================================================================
// COMPROBACIÓN DE DISPONIBILIDAD
// ============================================================================

/**
 * Comprueba si un aula está disponible para una fecha y horario.
 *
 * @param classroomId Identificador del aula.
 * @param date Fecha de la reserva.
 * @param startTime Hora de inicio.
 * @param endTime Hora de finalización.
 *
 * @returns true si el aula está disponible.
 */
export const isClassroomAvailable = (
  classroomId: string,
  date: string,
  startTime: string,
  endTime: string
): boolean => {
  // Un aula deshabilitada no está disponible.
  if (isClassroomDisabled(classroomId)) {
    return false;
  }

  const reservations = getReservations();

  // Obtiene únicamente reservas activas
  // para el aula y la fecha seleccionada.
  const activeReservations =
    reservations.filter(
      (reservation) =>
        reservation.classroomId === classroomId &&
        reservation.date === date &&
        reservation.status === "active"
    );

  // Comprueba si existe algún solapamiento de horario.
  for (const reservation of activeReservations) {
    if (
      // La nueva reserva comienza dentro
      // de una reserva existente.
      (startTime >= reservation.startTime &&
        startTime < reservation.endTime) ||

      // La nueva reserva termina dentro
      // de una reserva existente.
      (endTime > reservation.startTime &&
        endTime <= reservation.endTime) ||

      // La nueva reserva contiene completamente
      // a una reserva existente.
      (startTime <= reservation.startTime &&
        endTime >= reservation.endTime)
    ) {
      return false;
    }
  }

  return true;
};
