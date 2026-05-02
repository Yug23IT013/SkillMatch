import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data)
}

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  uploadResume: (form) => api.post('/student/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  parseResume: (form) => api.post('/student/parse-resume', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addSkill: (data) => api.post('/student/skills', data),
  removeSkill: (data) => api.delete('/student/skills', { data }),
  getDashboard: () => api.get('/student/dashboard'),
  bookmarkJob: (jobId) => api.post(`/student/bookmarks/${jobId}`),
  getBookmarks: () => api.get('/student/bookmarks')
}

export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getApplicants: (id) => api.get(`/jobs/${id}/applicants`)
}

export const recommendationAPI = {
  getRecommendations: (studentId) => api.get(`/recommendations/${studentId}`),
  getMissingSkills: () => api.get('/recommendations/missing-skills'),
  getMarketSkills: () => api.get('/recommendations/market-skills'),
  getResumeRecommendations: () => api.get('/recommendations/from-resume')
}

export const applicationAPI = {
  apply: (data) => api.post('/applications/apply', data),
  getMyApplications: () => api.get('/applications/my'),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id) => api.delete(`/applications/${id}/withdraw`)
}

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllJobs: () => api.get('/admin/jobs')
}
