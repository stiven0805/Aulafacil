import axios from 'axios';

const API_BASE_URL = '/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_AUTH_PATHS = ['token/', 'token/refresh/', 'register/'];

// Interceptor to add JWT token to requests
api.interceptors.request.use((config) => {
  const requestUrl = String(config.url || '');
  const isPublicAuthRoute = PUBLIC_AUTH_PATHS.some((path) => requestUrl.endsWith(path));

  if (!isPublicAuthRoute) {
    const token = localStorage.getItem('aulafacil_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;

export const authApi = {
  login: (credentials: any) => api.post('token/', credentials),
  register: (data: any) => api.post('register/', data),
  refresh: (refresh: string) => api.post('token/refresh/', { refresh }),
};

export const salasApi = {
  getAll: () => api.get('salas/'),
  getOne: (id: string) => api.get(`salas/${id}/`),
};

export const reservationsApi = {
  getAll: () => api.get('reservations/'),
  create: (data: any) => api.post('reservations/', data),
  cancel: (id: string) => api.post(`reservations/${id}/cancel/`),
  getUserReservations: () => api.get('reservations/me/'),
};

export const usersApi = {
  getAll: () => api.get('users/'),
};

export const mapReservationFromApi = (reservation: any) => ({
  id: String(reservation.id),
  classroomId: String(reservation.sala),
  classroomName: reservation.classroomName || 'Aula',
  userId: String(reservation.userId || ''),
  userName: reservation.userName || '',
  faculty: reservation.faculty || '',
  numberOfPeople: reservation.numberOfPeople ?? 1,
  date: reservation.date,
  startTime: reservation.startTime,
  endTime: reservation.endTime,
  duration: reservation.duration ?? 2,
  status: reservation.status || 'active',
  createdAt: reservation.created_at || new Date().toISOString(),
});

