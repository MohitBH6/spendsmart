import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budgets from './pages/Budgets'
import About from './pages/About'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={token ? <Navigate to='/dashboard' /> : <Navigate to='/login' />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Protected routes — must be logged in */}
        <Route path='/dashboard' element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path='/expenses' element={
          <PrivateRoute><Expenses /></PrivateRoute>
        } />
        <Route path='/budgets' element={
          <PrivateRoute><Budgets /></PrivateRoute>
        } />

        {/* About is public — anyone can see it */}
        <Route path='/about' element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App