import api from './api'

export const getSalas = () => api.get('/salas/')
export const getSala = (id) => api.get(`/salas/${id}/`)
export const createSala = (data) => api.post('/salas/', data)
export const updateSala = (id, data) => api.put(`/salas/${id}/`, data)
export const deleteSala = (id) => api.delete(`/salas/${id}/`)
