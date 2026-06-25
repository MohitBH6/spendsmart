const BACKEND_URL = 'https://spendsmart-backend-jmwb.onrender.com'

export const startKeepAlive = () => {
  // ping immediately
  fetch(`${BACKEND_URL}/api/health`).catch(() => {})
  
  // ping every 10 minutes to prevent sleep
  setInterval(() => {
    fetch(`${BACKEND_URL}/api/health`).catch(() => {})
  }, 10 * 60 * 1000)
}