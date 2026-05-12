import axios from 'axios';

const API_BASE_URL = '/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aulafacil_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  cancel: (id: string) => api.delete(`reservations/${id}/`),
  getUserReservations: () => api.get('reservations/me/'), // Assume endpoint exists or adjust
};
