import axios from 'axios'

const API_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  // No X-User-ID here - the gateway derives it from the verified token itself
  // (Phase 3) and ignores whatever a client sends, so sending it would be theater.
  return config
})

export const getActivities = () => api.get('/activities')
export const addActivity = (activity) => api.post('/activities', activity)
export const getActivity = (id) => api.get(`/activities/${id}`)
export const getActivityRecommendation = (activityId) =>
  api.get(`/recommendations/activity/${activityId}`)

export default api
