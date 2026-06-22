import Navbar from '../components/Navbar'

function About() {
  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '40px 48px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* What is SpendSmart */}
        <div style={styles.card}>
          <div style={styles.appHeader}>
            <div style={styles.appLogo}>💰</div>
            <div>
              <h1 style={styles.appName}>SpendSmart</h1>
              <p style={styles.appTagline}>Personal Finance Tracker</p>
            </div>
          </div>
          <p style={styles.appDesc}>
            SpendSmart helps you log daily expenses, set monthly budgets per category,
            and get smart insights about your spending patterns. It automatically detects
            when you're approaching your budget limits and alerts you before you overspend.
          </p>
        </div>

        {/* Features — 3 columns */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>✨ Key Features</h2>
          <div style={styles.featGrid}>
            {[
              { icon: '📊', title: 'Visual Dashboard', desc: 'Pie chart category breakdown, budget progress bars, and key spending metrics at a glance.' },
              { icon: '⚠️', title: 'Smart Alerts', desc: 'Automatic alerts when any budget category crosses 80% — so you never overspend unknowingly.' },
              { icon: '🎯', title: 'Budget Goals', desc: 'Set monthly spending limits per category. Color-coded progress bars turn red as you approach limits.' },
              { icon: '📝', title: 'Expense Tracking', desc: 'Add, edit, view, and delete expenses with amount, category, description, and date.' },
              { icon: '🔒', title: 'Secure Login', desc: 'JWT-based authentication ensures your data is completely private and isolated to your account.' },
              { icon: '📅', title: 'Monthly Insights', desc: 'Tracks spending month-wise. See total spent, remaining budget, and daily averages automatically.' },
            ].map((f, i) => (
              <div key={i} style={styles.featItem}>
                <div style={styles.featIcon}>{f.icon}</div>
                <div>
                  <div style={styles.featTitle}>{f.title}</div>
                  <div style={styles.featDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to use — full width */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📋 How to Use</h2>
          <div style={styles.stepsGrid}>
            {[
              { step: 1, title: 'Register / Login', desc: 'Create your account or sign in. All your data stays completely private to you.' },
              { step: 2, title: 'Set Your Budgets', desc: 'Go to the Budgets page and set a monthly spending limit for each category.' },
              { step: 3, title: 'Log Expenses', desc: 'Every time you spend, add it in the Expenses page with amount, category, and description.' },
              { step: 4, title: 'Monitor Dashboard', desc: 'See your spending breakdown, pie chart, budget progress, and spending alerts.' },
              { step: 5, title: 'Stay on Track', desc: "Green is safe, orange is a warning, red means you're almost over budget." },
            ].map((s) => (
              <div key={s.step} style={styles.stepRow}>
                <div style={styles.stepNum}>{s.step}</div>
                <div>
                  <div style={styles.stepTitle}>{s.title}</div>
                  <div style={styles.stepDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>👨‍💻 Developer</h2>
          <div style={styles.devCard}>
            <div style={styles.devAvatar}>MK</div>
            <div style={{ flex: 1 }}>
              <div style={styles.devName}>Mohit Kumar</div>
              <div style={styles.devDeg}>BE (Computer Science & Engineering)</div>
              <div style={styles.devCollege}>Panjab University, Chandigarh</div>
              <div style={styles.devLinks}>
                <a href='mailto:mohitpegowal293@gmail.com' style={styles.devLink}>
                  📧 mohitpegowal293@gmail.com
                </a>
                <a href='https://github.com/MohitBH6' target='_blank' rel='noreferrer' style={styles.devLink}>
                  🐙 GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  },
  appHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  appLogo: { fontSize: '40px' },
  appName: { fontSize: '26px', fontWeight: '700', color: '#534AB7', margin: 0 },
  appTagline: { fontSize: '15px', color: '#888', margin: 0 },
  appDesc: { fontSize: '15px', color: '#555', lineHeight: '1.8' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' },
  featGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
  },
  featItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '16px',
  },
  featIcon: { fontSize: '24px', flexShrink: 0, marginTop: '2px' },
  featTitle: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' },
  featDesc: { fontSize: '13px', color: '#666', lineHeight: '1.5' },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  stepRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '16px',
  },
  stepNum: {
    width: '30px', height: '30px', borderRadius: '50%',
    background: '#534AB7', color: '#fff', fontSize: '14px', fontWeight: '600',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepTitle: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' },
  stepDesc: { fontSize: '13px', color: '#666', lineHeight: '1.5' },
  devCard: {
    display: 'flex', gap: '20px', alignItems: 'flex-start',
    background: '#f9f9f9', borderRadius: '12px', padding: '24px',
  },
  devAvatar: {
    width: '60px', height: '60px', borderRadius: '50%',
    background: '#534AB7', color: '#fff', fontSize: '20px', fontWeight: '600',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  devName: { fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' },
  devDeg: { fontSize: '14px', color: '#534AB7', fontWeight: '500', marginBottom: '2px' },
  devCollege: { fontSize: '14px', color: '#888', marginBottom: '14px' },
  devLinks: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  devLink: { fontSize: '13px', color: '#534AB7', textDecoration: 'none', fontWeight: '500' },
}

export default About