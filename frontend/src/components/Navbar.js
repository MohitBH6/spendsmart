import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // helper to check active page
  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      {/* Logo */}
    <Link to='/dashboard' style={styles.logo}>
  <Logo size={28} />
  <span>SpendSmart</span>
</Link>
      {/* Nav Links */}
   <div style={styles.links} className="nav-links">
        <Link to='/dashboard' style={isActive('/dashboard') ? styles.linkActive : styles.link}>
          Dashboard
        </Link>
        <Link to='/expenses' style={isActive('/expenses') ? styles.linkActive : styles.link}>
          Expenses
        </Link>
        <Link to='/budgets' style={isActive('/budgets') ? styles.linkActive : styles.link}>
          Budgets
        </Link>
        <Link to='/about' style={isActive('/about') ? styles.linkActive : styles.link}>
          About
        </Link>
      </div>

      {/* User chip + logout */}
      <div style={styles.userSection}>
        <div style={styles.userChip}>
          <div style={styles.avatar}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <span style={styles.userName}>{user.name || 'Mohit Kumar'}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#ffffff',
    padding: '0 32px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
logo: {
  fontSize: '18px',
  fontWeight: '600',
  color: '#534AB7',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
},
  links: {
    display: 'flex',
    gap: '4px',
  },
  link: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#666',
    textDecoration: 'none',
    fontWeight: '400',
  },
  linkActive: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#534AB7',
    textDecoration: 'none',
    fontWeight: '500',
    background: '#EEEDFE',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px 4px 4px',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    background: '#f9f9f9',
  },
  avatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#534AB7',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#333',
  },
  logoutBtn: {
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#666',
    cursor: 'pointer',
  },
}

export default Navbar