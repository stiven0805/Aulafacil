import api from './api'

export const getReservations = () => api.get('/reservations/')
export const getReservation = (id) => api.get(`/reservations/${id}/`)
export const createReservation = (data) => api.post('/reservations/', data)
export const updateReservation = (id, data) => api.put(`/reservations/${id}/`, data)
export const deleteReservation = (id) => api.delete(`/reservations/${id}/`)
