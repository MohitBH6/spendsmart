import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const handleNavClick = () => setMenuOpen(false)

  return (
    <>
      <nav style={styles.nav}>
        {/* Logo */}
        <Link to='/dashboard' style={styles.logo} onClick={handleNavClick}>
          <Logo size={28} />
          <span>SpendSmart</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={styles.links} className="nav-links">
          <Link to='/dashboard' style={isActive('/dashboard') ? styles.linkActive : styles.link}>Dashboard</Link>
          <Link to='/expenses' style={isActive('/expenses') ? styles.linkActive : styles.link}>Expenses</Link>
          <Link to='/budgets' style={isActive('/budgets') ? styles.linkActive : styles.link}>Budgets</Link>
          <Link to='/about' style={isActive('/about') ? styles.linkActive : styles.link}>About</Link>
        </div>

        {/* Right side — user + logout + hamburger */}
        <div style={styles.userSection}>
          {/* User chip — hide name on mobile */}
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <span style={styles.userName} className="user-name">
              {user.name || 'Mohit Kumar'}
            </span>
          </div>

          {/* Logout — desktop only */}
          <button onClick={handleLogout} style={styles.logoutBtn} className="logout-btn">
            Logout
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.hamburger}
            className="hamburger-btn"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          <Link
            to='/dashboard'
            style={isActive('/dashboard') ? styles.mobileLinkActive : styles.mobileLink}
            onClick={handleNavClick}
          >
            📊 Dashboard
          </Link>
          <Link
            to='/expenses'
            style={isActive('/expenses') ? styles.mobileMenuLinkActive : styles.mobileLink}
            onClick={handleNavClick}
          >
            📝 Expenses
          </Link>
          <Link
            to='/budgets'
            style={isActive('/budgets') ? styles.mobileMenuLinkActive : styles.mobileLink}
            onClick={handleNavClick}
          >
            🎯 Budgets
          </Link>
          <Link
            to='/about'
            style={isActive('/about') ? styles.mobileMenuLinkActive : styles.mobileLink}
            onClick={handleNavClick}
          >
            ℹ️ About
          </Link>
          <div style={styles.mobileDivider} />
          <button
            onClick={() => { handleLogout(); handleNavClick() }}
            style={styles.mobileLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </>
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
  hamburger: {
    display: 'none',
    background: 'transparent',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '18px',
    padding: '4px 10px',
    cursor: 'pointer',
    color: '#534AB7',
  },
  mobileMenu: {
    position: 'fixed',
    top: '60px',
    left: 0,
    right: 0,
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    zIndex: 99,
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
  },
  mobileLink: {
    padding: '14px 24px',
    fontSize: '15px',
    color: '#444',
    textDecoration: 'none',
    fontWeight: '400',
    borderBottom: '1px solid #f5f5f5',
  },
  mobileMenuLinkActive: {
    padding: '14px 24px',
    fontSize: '15px',
    color: '#534AB7',
    textDecoration: 'none',
    fontWeight: '600',
    borderBottom: '1px solid #f5f5f5',
    background: '#EEEDFE',
  },
  mobileLogout: {
    padding: '14px 24px',
    fontSize: '15px',
    color: '#A32D2D',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: '500',
  },
  mobileDivider: {
    height: '1px',
    background: '#f0f0f0',
    margin: '4px 0',
  },
}

export default Navbar