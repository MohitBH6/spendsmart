import axios from 'axios'

const API = axios.create({
  baseURL: 'https://spendsmart-backend-jmwb.onrender.com',
  timeout: 60000  // wait 60 seconds before giving up
})

// attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// auto logout if token expires
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API