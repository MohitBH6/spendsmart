import { useState, useEffect } from 'react'
import { Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement
} from 'chart.js'
import Navbar from '../components/Navbar'
import API from '../api/axios'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement)

function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expRes, budRes] = await Promise.all([
        API.get('/api/expenses/'),
        API.get('/api/budgets/')
      ])
      setExpenses(expRes.data)
      setBudgets(budRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // calculate total spent this month
  const now = new Date()
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthly_limit, 0)
  const totalRemaining = totalBudget - totalSpent

  // category breakdown for pie chart
  const categoryTotals = {}
  thisMonthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: ['#534AB7', '#1D9E75', '#EF9F27', '#E24B4A', '#3B82F6', '#8B5CF6', '#F59E0B'],
      borderWidth: 0,
    }]
  }

  // anomaly detection — find categories spending more than usual
  const anomalies = []
  budgets.forEach(b => {
    if (b.percentage > 80) {
      anomalies.push({
        category: b.category,
        percentage: b.percentage,
        spent: b.spent,
        limit: b.monthly_limit
      })
    }
  })

  // last 6 expenses for recent list
  const recentExpenses = expenses.slice(0, 5)

  const categoryEmoji = {
    Food: '🍔', Transport: '🚌', Shopping: '🛍️',
    Entertainment: '🎬', Education: '📚', Health: '💊', Other: '📌'
  }

  const categoryColors = {
    Food: '#EEEDFE', Transport: '#E1F5EE', Shopping: '#FAEEDA',
    Entertainment: '#FCEBEB', Education: '#E6F1FB', Health: '#E1F5EE', Other: '#f5f5f5'
  }

  if (loading) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
          Loading your dashboard...
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Welcome */}
        <div style={styles.welcome}>
          <div>
            <h1 style={styles.welcomeTitle}>Good day, {user.name?.split(' ')[0]}! 👋</h1>
            <p style={styles.welcomeSub}>Here's your spending overview for this month</p>
          </div>
        </div>

        {/* Anomaly Alert */}
        {anomalies.length > 0 && (
          <div style={styles.alertBox}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>
              <div style={styles.alertTitle}>Spending Alert</div>
              {anomalies.map(a => (
                <div key={a.category} style={styles.alertText}>
                  Your <strong>{a.category}</strong> spend (₹{a.spent}) is at {a.percentage}% of your ₹{a.limit} budget
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Spent</div>
            <div style={styles.metricVal}>₹{totalSpent.toFixed(0)}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>this month</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Budget Remaining</div>
            <div style={{ ...styles.metricVal, color: totalRemaining < 0 ? '#A32D2D' : '#1D9E75' }}>
              ₹{totalRemaining.toFixed(0)}
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>of ₹{totalBudget}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Transactions</div>
            <div style={styles.metricVal}>{thisMonthExpenses.length}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>this month</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Avg per Day</div>
            <div style={styles.metricVal}>
              ₹{now.getDate() > 0 ? (totalSpent / now.getDate()).toFixed(0) : 0}
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>daily average</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={styles.chartsGrid}>

          {/* Pie Chart */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Spending by Category</h3>
            {Object.keys(categoryTotals).length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px' }}>No expenses this month yet</p>
            ) : (
              <div style={{ maxWidth: '260px', margin: '0 auto' }}>
                <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
              </div>
            )}
          </div>

          {/* Budget Progress */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Budget Progress</h3>
            {budgets.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px' }}>No budgets set yet</p>
            ) : (
              budgets.map(b => (
                <div key={b.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                      {categoryEmoji[b.category]} {b.category}
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: '500',
                      color: b.percentage >= 90 ? '#A32D2D' : b.percentage >= 70 ? '#BA7517' : '#3B6D11'
                    }}>
                      {b.percentage}%
                    </span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      width: `${Math.min(b.percentage, 100)}%`,
                      background: b.percentage >= 90 ? '#E24B4A' : b.percentage >= 70 ? '#EF9F27' : '#1D9E75'
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
                    ₹{b.spent} / ₹{b.monthly_limit}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recent Transactions</h3>
          {recentExpenses.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No transactions yet</p>
          ) : (
            recentExpenses.map(exp => (
              <div key={exp.id} style={styles.expRow}>
                <div style={{
                  ...styles.expIcon,
                  background: categoryColors[exp.category] || '#f5f5f5'
                }}>
                  {categoryEmoji[exp.category] || '📌'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>
                    {exp.description || exp.category}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {exp.category} · {exp.date}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#A32D2D' }}>
                  -₹{exp.amount}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

const styles = {
  welcome: {
    marginBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  welcomeSub: {
    fontSize: '14px',
    color: '#888',
  },
  alertBox: {
    background: '#FAEEDA',
    border: '1px solid #FAC775',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  alertTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#633806',
    marginBottom: '4px',
  },
  alertText: {
    fontSize: '13px',
    color: '#854F0B',
    marginTop: '2px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  metricCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricVal: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  barTrack: {
    height: '7px',
    background: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  expRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  expIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
}

export default Dashboard