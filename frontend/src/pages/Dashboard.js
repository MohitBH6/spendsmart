import { useState, useEffect, useCallback } from 'react'
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

  // get month and year based on current filter
  // wrapped in useCallback so its identity only changes when filter/customMonth change
  const getMonthYear = useCallback(() => {
    const now = new Date()
    if (filter === 'This Month') return { month: now.getMonth() + 1, year: now.getFullYear() }
    if (filter === 'Last Month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return { month: last.getMonth() + 1, year: last.getFullYear() }
    }
    if (filter === 'Custom Month') {
      const [year, month] = customMonth.split('-').map(Number)
      return { month, year }
    }
    // This Week / All Time — use current month
    return { month: now.getMonth() + 1, year: now.getFullYear() }
  }, [filter, customMonth])

  // wrapped in useCallback so it only changes identity when getMonthYear changes
  // (which itself only changes when filter/customMonth change) — prevents infinite loop
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { month, year } = getMonthYear()
      const [expRes, budRes] = await Promise.all([
        API.get('/api/expenses/'),
        API.get(`/api/budgets/?month=${month}&year=${year}`)
      ])
      setExpenses(expRes.data)
      setBudgets(budRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [getMonthYear])

  // refetch when fetchData's identity changes (i.e. when filter/customMonth change)
  useEffect(() => {
    fetchData()
  }, [fetchData])

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
      if (filter === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
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

  // category totals for pie chart
  const categoryTotals = {}
  filteredExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })

  // budgeted categories with period spending
  const budgetProgress = budgets.map(b => {
    const spentInPeriod = filteredExpenses
      .filter(e => e.category === b.category)
      .reduce((sum, e) => sum + e.amount, 0)
    const pct = b.monthly_limit > 0
      ? parseFloat(((spentInPeriod / b.monthly_limit) * 100).toFixed(1))
      : 0
    const extra = spentInPeriod > b.monthly_limit
      ? (spentInPeriod - b.monthly_limit).toFixed(0)
      : 0
    return {
      ...b,
      spentInPeriod,
      pct,
      extra,
      remaining: (b.monthly_limit - spentInPeriod).toFixed(0),
      hasBudget: true
    }
  })

  // categories with expenses but NO budget set for this period
  const unbudgetedCategories = Object.keys(categoryTotals)
    .filter(cat => !budgets.find(b => b.category === cat))
    .map(cat => ({
      id: `no-budget-${cat}`,
      category: cat,
      monthly_limit: 0,
      spentInPeriod: categoryTotals[cat],
      pct: 0,
      extra: categoryTotals[cat],
      remaining: 0,
      hasBudget: false
    }))

  // all categories combined
  const allCategoryProgress = [...budgetProgress, ...unbudgetedCategories]

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthly_limit, 0)
  const totalRemaining = totalBudget - totalSpent

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: ['#534AB7', '#1D9E75', '#EF9F27', '#E24B4A', '#3B82F6', '#8B5CF6', '#F59E0B'],
      borderWidth: 0,
    }]
  }

  // anomalies — only from budgeted categories
  const anomalies = budgetProgress.filter(b => b.pct > 80)

  const recentExpenses = filteredExpenses.slice(0, 5)

  const categoryEmoji = { Food: '🍔', Transport: '🚌', Shopping: '🛍️', Entertainment: '🎬', Education: '📚', Health: '💊', Other: '📌' }
  const categoryColors = { Food: '#EEEDFE', Transport: '#E1F5EE', Shopping: '#FAEEDA', Entertainment: '#FCEBEB', Education: '#E6F1FB', Health: '#E1F5EE', Other: '#f5f5f5' }
  const filterLabel = { 'This Week': 'this week', 'This Month': 'this month', 'Last Month': 'last month', 'All Time': 'all time', 'Custom Month': customMonth }

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
      <div style={{ padding: '40px 48px', maxWidth: '1300px', margin: '0 auto' }} className="page-container">

        {/* Welcome + Filter */}
        <div style={styles.welcomeRow} className="welcome-row">
          <div>
            <h1 style={styles.welcomeTitle}>Good day, {user.name?.split(' ')[0]}! 👋</h1>
            <p style={styles.welcomeSub}>Here's your spending overview</p>
          </div>
          <div style={styles.filterSection}>
            <div style={styles.filterBar} className="filter-bar">
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

        {/* Spending Alert */}
        {anomalies.length > 0 && (
          <div style={styles.alertBox}>
            <span style={{ fontSize: '22px' }}>⚠️</span>
            <div>
              <div style={styles.alertTitle}>Spending Alert — {filterLabel[filter]}</div>
              {anomalies.map(a => (
                <div key={a.category} style={styles.alertText}>
                  {a.pct >= 100
                    ? <>Your <strong>{a.category}</strong> spend (₹{a.spentInPeriod}) exceeded budget by <strong style={{ color: '#A32D2D' }}>₹{a.extra}</strong> over your ₹{a.monthly_limit} limit 🚨</>
                    : <>Your <strong>{a.category}</strong> spend (₹{a.spentInPeriod}) is at {a.pct}% of your ₹{a.monthly_limit} budget — only ₹{a.remaining} remaining</>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div style={styles.metricsGrid} className="metrics-grid">
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Spent</div>
            <div style={styles.metricVal}>₹{totalSpent.toFixed(0)}</div>
            <div style={styles.metricSub}>{filterLabel[filter]}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Budget Remaining</div>
            <div style={{ ...styles.metricVal, color: totalBudget === 0 ? '#888' : totalRemaining < 0 ? '#A32D2D' : '#1D9E75' }}>
              {totalBudget === 0
                ? 'N/A'
                : totalRemaining < 0
                  ? `-₹${Math.abs(totalRemaining).toFixed(0)}`
                  : `₹${totalRemaining.toFixed(0)}`
              }
            </div>
            <div style={styles.metricSub}>
              {totalBudget === 0 ? 'no budget set' : `of ₹${totalBudget}`}
            </div>
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
        <div style={styles.chartsGrid} className="charts-grid">

          {/* Pie Chart */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Spending by Category</h3>
            {Object.keys(categoryTotals).length === 0 ? (
              <p style={{ color: '#888', fontSize: '15px' }}>No expenses for this period</p>
            ) : (
              <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                <Pie data={pieData} options={{
                  plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 13 }, padding: 16 } }
                  }
                }} />
              </div>
            )}
          </div>

          {/* Budget Progress — period specific */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Budget Progress — {filterLabel[filter]}</h3>

            {allCategoryProgress.length === 0 ? (
              <p style={{ color: '#888', fontSize: '15px' }}>No expenses or budgets for this period</p>
            ) : (
              allCategoryProgress.map(b => (
                <div key={b.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '500' }}>
                        {categoryEmoji[b.category]} {b.category}
                      </span>
                      {!b.hasBudget && (
                        <span style={{ fontSize: '11px', color: '#aaa', background: '#f5f5f5', padding: '2px 6px', borderRadius: '10px' }}>
                          no budget
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: '14px', fontWeight: '600',
                      color: !b.hasBudget ? '#888' : b.pct >= 100 ? '#A32D2D' : b.pct >= 70 ? '#BA7517' : '#3B6D11'
                    }}>
                      {b.hasBudget
                        ? <>
                          {b.pct}%
                          {b.pct >= 100 && <span style={{ fontSize: '12px', marginLeft: '6px', color: '#A32D2D' }}>+₹{b.extra} over</span>}
                        </>
                        : `₹${b.spentInPeriod} spent`
                      }
                    </span>
                  </div>

                  {b.hasBudget ? (
                    <>
                      <div style={styles.barTrack}>
                        <div style={{
                          ...styles.barFill,
                          width: `${Math.min(b.pct, 100)}%`,
                          background: b.pct >= 100 ? '#E24B4A' : b.pct >= 70 ? '#EF9F27' : '#1D9E75'
                        }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>₹{b.spentInPeriod} / ₹{b.monthly_limit}</span>
                        {b.pct < 100
                          ? <span style={{ color: '#3B6D11' }}>₹{b.remaining} left</span>
                          : <span style={{ color: '#A32D2D' }}>₹{b.extra} over budget!</span>
                        }
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ ...styles.barTrack, background: '#f5f5f5' }}>
                        <div style={{ ...styles.barFill, width: '100%', background: '#e0e0e0' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>No budget set</span>
                        <span
                          onClick={() => window.location.href = '/budgets'}
                          style={{ color: '#534AB7', cursor: 'pointer', fontWeight: '500' }}
                        >
                          Set budget →
                        </span>
                      </div>
                    </>
                  )}
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
                <div style={{ ...styles.expIcon, background: categoryColors[exp.category] || '#f5f5f5' }}>
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
  welcomeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  filterSection: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },
  filterBar: { display: 'flex', gap: '4px', background: '#fff', padding: '6px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  filterBtn: { padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#666', background: 'transparent', cursor: 'pointer', fontWeight: '400' },
  filterBtnActive: { padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#534AB7', background: '#EEEDFE', cursor: 'pointer', fontWeight: '600' },
  monthPicker: { padding: '8px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', color: '#333', outline: 'none', background: '#fff', cursor: 'pointer' },
  welcomeTitle: { fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' },
  welcomeSub: { fontSize: '16px', color: '#888' },
  alertBox: {
    background: '#FAEEDA', border: '1px solid #FAC775', borderRadius: '14px',
    padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '24px'
  },
  alertTitle: { fontSize: '15px', fontWeight: '700', color: '#633806', marginBottom: '6px' },
  alertText: { fontSize: '14px', color: '#854F0B', marginTop: '4px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' },
  metricCard: { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
  metricLabel: { fontSize: '13px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' },
  metricVal: { fontSize: '36px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.1 },
  metricSub: { fontSize: '13px', color: '#aaa', marginTop: '6px' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' },
  barTrack: { height: '9px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '5px', transition: 'width 0.3s ease' },
  expRow: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f5f5f5' },
  expIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
}

export default Dashboard