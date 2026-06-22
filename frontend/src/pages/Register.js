import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import Logo from '../components/Logo'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await API.post('/api/auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <Logo size={26} /> SpendSmart
        </div>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Start tracking your expenses today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type='text'
              name='name'
              placeholder='Mohit Kumar'
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type='email'
              name='email'
              placeholder='mohit@test.com'
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type='password'
              name='password'
              placeholder='Create a password'
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            style={loading ? styles.btnDisabled : styles.btn}
            type='submit'
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to='/login' style={styles.link}>Login here</Link>
        </p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#534AB7',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '28px',
  },
  error: {
    background: '#FCEBEB',
    color: '#791F1F',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#444',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#534AB7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
  btnDisabled: {
    width: '100%',
    padding: '12px',
    background: '#a9a4d8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'not-allowed',
    marginTop: '8px',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    marginTop: '20px',
  },
  link: {
    color: '#534AB7',
    textDecoration: 'none',
    fontWeight: '500',
  },
}

export default Register