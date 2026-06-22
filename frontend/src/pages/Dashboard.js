import { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
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
  const [filter, setFilter] = useState('This Month')
  const [customMonth, setCustomMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
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

  const now = new Date()

  const getFilteredExpenses = () => {
    return expenses.filter(e => {
      const d = new Date(e.date)
      if (filter === 'This Week') {
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        return d >= startOfWeek
      }
      if (filter === 'This Month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (filter === 'Last Month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear()
      }
      if (filter === 'Custom Month') {
        const [year, month] = customMonth.split('-').map(Number)
        return d.getMonth() === month - 1 && d.getFullYear() === year
      }
      return true
    })
  }

  const filteredExpenses = getFilteredExpenses()
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthly_limit, 0)
  const totalRemaining = totalBudget - totalSpent

  const categoryTotals = {}
  filteredExpenses.forEach(e => {
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

  const recentExpenses = filteredExpenses.slice(0, 5)

  const categoryEmoji = {
    Food: '🍔', Transport: '🚌', Shopping: '🛍️',
    Entertainment: '🎬', Education: '📚', Health: '💊', Other: '📌'
  }

  const categoryColors = {
    Food: '#EEEDFE', Transport: '#E1F5EE', Shopping: '#FAEEDA',
    Entertainment: '#FCEBEB', Education: '#E6F1FB', Health: '#E1F5EE', Other: '#f5f5f5'
  }

  const filterLabel = {
    'This Week': 'this week',
    'This Month': 'this month',
    'Last Month': 'last month',
    'All Time': 'all time',
    'Custom Month': customMonth,
  }

  if (loading) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '16px' }}>
          Loading your dashboard...
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '40px 48px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Welcome + Filter */}
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.welcomeTitle}>Good day, {user.name?.split(' ')[0]}! 👋</h1>
            <p style={styles.welcomeSub}>Here's your spending overview</p>
          </div>
          <div style={styles.filterSection}>
            <div style={styles.filterBar}>
              {['This Week', 'This Month', 'Last Month', 'All Time', 'Custom Month'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={filter === f ? styles.filterBtnActive : styles.filterBtn}
                >
                  {f}
                </button>
              ))}
            </div>
            {filter === 'Custom Month' && (
              <input
                type='month'
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
                style={styles.monthPicker}
              />
            )}
          </div>
        </div>

        {/* Anomaly Alert */}
        {anomalies.length > 0 && (
          <div style={styles.alertBox}>
            <span style={{ fontSize: '22px' }}>⚠️</span>
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
            <div style={styles.metricSub}>{filterLabel[filter]}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Budget Remaining</div>
            <div style={{ ...styles.metricVal, color: totalRemaining < 0 ? '#A32D2D' : '#1D9E75' }}>
              ₹{totalRemaining.toFixed(0)}
            </div>
            <div style={styles.metricSub}>of ₹{totalBudget}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Transactions</div>
            <div style={styles.metricVal}>{filteredExpenses.length}</div>
            <div style={styles.metricSub}>{filterLabel[filter]}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Avg per Day</div>
            <div style={styles.metricVal}>
              ₹{now.getDate() > 0 ? (totalSpent / now.getDate()).toFixed(0) : 0}
            </div>
            <div style={styles.metricSub}>daily average</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={styles.chartsGrid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Spending by Category</h3>
            {Object.keys(categoryTotals).length === 0 ? (
              <p style={{ color: '#888', fontSize: '15px' }}>No expenses for this period</p>
            ) : (
              <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                <Pie data={pieData} options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { font: { size: 13 }, padding: 16 }
                    }
                  }
                }} />
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Budget Progress</h3>
            {budgets.length === 0 ? (
              <p style={{ color: '#888', fontSize: '15px' }}>No budgets set yet</p>
            ) : (
              budgets.map(b => (
                <div key={b.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>
                      {categoryEmoji[b.category]} {b.category}
                    </span>
                    <span style={{
                      fontSize: '14px', fontWeight: '600',
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
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                    ₹{b.spent} / ₹{b.monthly_limit}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            Recent Transactions
            <span style={{ fontSize: '14px', fontWeight: '400', color: '#888', marginLeft: '10px' }}>
              ({filteredExpenses.length} total for {filterLabel[filter]})
            </span>
          </h3>
          {recentExpenses.length === 0 ? (
            <p style={{ color: '#888', fontSize: '15px' }}>No transactions for this period</p>
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
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>
                    {exp.description || exp.category}
                  </div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                    {exp.category} · {exp.date}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#A32D2D' }}>
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
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
  },
  filterBar: {
    display: 'flex',
    gap: '4px',
    background: '#fff',
    padding: '6px',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  filterBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#666',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: '400',
  },
  filterBtnActive: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#534AB7',
    background: '#EEEDFE',
    cursor: 'pointer',
    fontWeight: '600',
  },
  monthPicker: {
    padding: '8px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#333',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '6px',
  },
  welcomeSub: {
    fontSize: '16px',
    color: '#888',
  },
  alertBox: {
    background: '#FAEEDA',
    border: '1px solid #FAC775',
    borderRadius: '14px',
    padding: '16px 20px',
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  alertTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#633806',
    marginBottom: '6px',
  },
  alertText: {
    fontSize: '14px',
    color: '#854F0B',
    marginTop: '4px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  metricCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  },
  metricLabel: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: '500',
  },
  metricVal: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 1.1,
  },
  metricSub: {
    fontSize: '13px',
    color: '#aaa',
    marginTop: '6px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '20px',
  },
  barTrack: {
    height: '9px',
    background: '#f0f0f0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  expRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  expIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
}

export default Dashboard