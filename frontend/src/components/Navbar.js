
import { useEffect, useState } from 'react'
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
    setMenuOpen(false)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const handleNavClick = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      <nav style={styles.nav} className="spendsmart-navbar">
        <Link
          to="/dashboard"
          style={styles.logo}
          onClick={handleNavClick}
        >
          <Logo size={28} />
          <span>SpendSmart</span>
        </Link>

        {/* Desktop navigation */}
        <div style={styles.links} className="nav-links">
          <Link
            to="/dashboard"
            style={isActive('/dashboard') ? styles.linkActive : styles.link}
          >
            Dashboard
          </Link>

          <Link
            to="/expenses"
            style={isActive('/expenses') ? styles.linkActive : styles.link}
          >
            Expenses
          </Link>

          <Link
            to="/budgets"
            style={isActive('/budgets') ? styles.linkActive : styles.link}
          >
            Budgets
          </Link>

          <Link
            to="/about"
            style={isActive('/about') ? styles.linkActive : styles.link}
          >
            About
          </Link>
        </div>

        {/* User and mobile menu button */}
        <div style={styles.userSection}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>

            <span style={styles.userName} className="user-name">
              {user.name || 'Mohit Kumar'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutBtn}
            className="logout-btn"
          >
            Logout
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            style={styles.hamburger}
            className={`hamburger-btn ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="spendsmart-mobile-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile navigation drawer */}
      {menuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={handleNavClick}
        >
          <aside
            id="spendsmart-mobile-menu"
            className="mobile-menu"
            onClick={(event) => event.stopPropagation()}
            aria-label="Mobile navigation"
          >
            <div className="mobile-menu-header">
              <div className="mobile-menu-title">
                <Logo size={30} />

                <div>
                  <strong>SpendSmart</strong>
                  <small>Your money, organized.</small>
                </div>
              </div>

              <button
                type="button"
                className="mobile-menu-close"
                onClick={handleNavClick}
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>

            <div className="mobile-menu-section">
              <span className="mobile-menu-label">MENU</span>

              {[
                {
                  path: '/dashboard',
                  icon: '📊',
                  label: 'Dashboard',
                },
                {
                  path: '/expenses',
                  icon: '📝',
                  label: 'Expenses',
                },
                {
                  path: '/budgets',
                  icon: '🎯',
                  label: 'Budgets',
                },
                {
                  path: '/about',
                  icon: 'ℹ️',
                  label: 'About',
                },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`mobile-menu-item ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                  aria-current={
                    isActive(item.path) ? 'page' : undefined
                  }
                >
                  <span className="mobile-menu-icon">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  {isActive(item.path) && (
                    <span className="mobile-menu-indicator" />
                  )}
                </Link>
              ))}
            </div>

            <div className="mobile-menu-footer">
              <div className="mobile-menu-account">
                <div className="mobile-menu-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </div>

                <div className="mobile-menu-user-details">
                  <strong>{user.name || 'Mohit Kumar'}</strong>
                  <small>SpendSmart account</small>
                </div>
              </div>

              <button
                type="button"
                className="mobile-menu-logout"
                onClick={handleLogout}
              >
                <span>↪</span>
                Log out
              </button>
            </div>
          </aside>
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
    gap: '12px',
    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },

  logo: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#534AB7',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },

  links: {
    display: 'flex',
    alignItems: 'center',
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
    flexShrink: 0,
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
    width: '44px',
    height: '44px',
    padding: 0,
    background: 'linear-gradient(145deg, #21143f, #39216a)',
    border: '1px solid rgba(167, 139, 250, 0.65)',
    borderRadius: '13px',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 12px rgba(139, 92, 246, 0.18)',
    transition: 'all 0.25s ease',
  },
}

export default Navbar
