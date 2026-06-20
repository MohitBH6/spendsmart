import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000'
})

// attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// auto logout if token expires (401 response)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // clear expired token
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API