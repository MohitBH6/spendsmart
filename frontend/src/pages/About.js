
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'

function About() {
  return (
    <div style={styles.page}>
      <Navbar />

      <main className="page-container" style={styles.container}>
        {/* About SpendSmart */}
        <section style={styles.card}>
          <div style={styles.appHeader}>
            <div style={styles.appLogo}>
              <Logo size={48} />
            </div>

            <div style={styles.appInfo}>
              <h1 style={styles.appName}>SpendSmart</h1>
              <p style={styles.appTagline}>Personal Finance Tracker</p>
            </div>
          </div>

          <p style={styles.appDesc}>
            SpendSmart helps you log daily expenses, set monthly budgets per
            category, and get smart insights about your spending patterns.
            It automatically detects when you're approaching your budget
            limits and alerts you before you overspend.
          </p>
        </section>

        {/* Key Features */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>✨ Key Features</h2>

          <div style={styles.featGrid} className="feat-grid">
            {[
              {
                icon: '📊',
                title: 'Visual Dashboard',
                desc: 'Pie chart category breakdown, budget progress bars, and key spending metrics at a glance.',
              },
              {
                icon: '⚠️',
                title: 'Smart Alerts',
                desc: 'Automatic alerts when any budget category crosses 80% — so you never overspend unknowingly.',
              },
              {
                icon: '🎯',
                title: 'Budget Goals',
                desc: 'Set monthly spending limits per category. Color-coded progress bars turn red as you approach limits.',
              },
              {
                icon: '📝',
                title: 'Expense Tracking',
                desc: 'Add, edit, view, and delete expenses with amount, category, description, and date.',
              },
              {
                icon: '🔒',
                title: 'Secure Login',
                desc: 'JWT-based authentication ensures your data is completely private and isolated to your account.',
              },
              {
                icon: '📅',
                title: 'Monthly Insights',
                desc: 'Tracks spending month-wise. See total spent, remaining budget, and daily averages automatically.',
              },
            ].map((feature) => (
              <div key={feature.title} style={styles.featItem}>
                <div style={styles.featIcon}>{feature.icon}</div>

                <div style={styles.flexContent}>
                  <div style={styles.featTitle}>{feature.title}</div>
                  <div style={styles.featDesc}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>📋 How to Use</h2>

          <div style={styles.stepsGrid} className="steps-grid">
            {[
              {
                step: 1,
                title: 'Register / Login',
                desc: 'Create your account or sign in. All your data stays completely private to you.',
              },
              {
                step: 2,
                title: 'Set Your Budgets',
                desc: 'Go to the Budgets page and set a monthly spending limit for each category.',
              },
              {
                step: 3,
                title: 'Log Expenses',
                desc: 'Every time you spend, add it in the Expenses page with amount, category, and description.',
              },
              {
                step: 4,
                title: 'Monitor Dashboard',
                desc: 'See your spending breakdown, pie chart, budget progress, and spending alerts.',
              },
              {
                step: 5,
                title: 'Stay on Track',
                desc: "Green is safe, orange is a warning, red means you're almost over budget.",
              },
            ].map((item) => (
              <div key={item.step} style={styles.stepRow}>
                <div style={styles.stepNum}>{item.step}</div>

                <div style={styles.flexContent}>
                  <div style={styles.stepTitle}>{item.title}</div>
                  <div style={styles.stepDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Developer */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>👨‍💻 Developer</h2>

          <div style={styles.devCard} className="about-dev-card">
            <div style={styles.devAvatar}>MK</div>

            <div style={styles.devInfo} className="about-dev-info">
              <h3 style={styles.devName}>Mohit Kumar</h3>

              <div style={styles.devDeg}>
                BE (Computer Science & Engineering)
              </div>

              <div style={styles.devCollege}>
                Panjab University, Chandigarh
              </div>

              <div style={styles.devLinks} className="about-dev-links">
                <a
                  href="mailto:mohitpegowal293@gmail.com"
                  style={styles.devLink}
                  className="about-dev-link about-email"
                >
                  <span>📧 </span>
                  <span>mohitpegowal293@gmail.com</span>
                </a>

                <a
                  href="https://github.com/MohitBH6"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.devLink}
                  className="about-dev-link"
                >
                  🐙 GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

const styles = {
  page: {
    background: '#f0f2f5',
    minHeight: '100vh',
  },

  container: {
    width: '100%',
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '40px 48px',
  },

  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    minWidth: 0,
  },

  appHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    minWidth: 0,
  },

  appLogo: {
    flexShrink: 0,
  },

  appInfo: {
    minWidth: 0,
  },

  appName: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#534AB7',
    margin: 0,
  },

  appTagline: {
    fontSize: '15px',
    color: '#888',
    margin: 0,
  },

  appDesc: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.8',
    overflowWrap: 'anywhere',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 0,
    marginBottom: '20px',
  },

  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
  },

  featItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '16px',
    minWidth: 0,
  },

  featIcon: {
    fontSize: '24px',
    flexShrink: 0,
    marginTop: '2px',
  },

  featTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
  },

  featDesc: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
    overflowWrap: 'anywhere',
  },

  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
  },

  stepRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '16px',
    minWidth: 0,
  },

  stepNum: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#534AB7',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  stepTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
  },

  stepDesc: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
    overflowWrap: 'anywhere',
  },

  flexContent: {
    flex: 1,
    minWidth: 0,
  },

  devCard: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '24px',
    minWidth: 0,
    maxWidth: '100%',
  },

  devAvatar: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    background: '#534AB7',
    color: '#fff',
    fontSize: '23px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  devInfo: {
    flex: 1,
    minWidth: 0,
  },

  devName: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 6px',
    overflowWrap: 'anywhere',
  },

  devDeg: {
    fontSize: '14px',
    color: '#534AB7',
    fontWeight: '500',
    marginBottom: '4px',
    overflowWrap: 'anywhere',
  },

  devCollege: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '16px',
    overflowWrap: 'anywhere',
  },

  devLinks: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    minWidth: 0,
  },

  devLink: {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: '4px',
    maxWidth: '100%',
    minWidth: 0,
    fontSize: '14px',
    color: '#534AB7',
    textDecoration: 'none',
    fontWeight: '500',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
}

export default About
