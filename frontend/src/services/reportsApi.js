import api from './api'

export const getCategories = () => api.get('/categories/')
export const getReports = (params) => api.get('/reports/', { params })
export const getReport = (id) => api.get(`/reports/${id}/`)
export const createReport = (data) => api.post('/reports/', data)
export const getMyReports = () => api.get('/reports/', { params: { reported_by: 'me' } })