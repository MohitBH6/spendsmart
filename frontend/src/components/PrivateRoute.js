import { Navigate } from 'react-router-dom'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  
  // if no token, redirect to login
  if (!token) {
    return <Navigate to='/login' />
  }

  // if token exists, show the page
  return children
}

export default PrivateRoute