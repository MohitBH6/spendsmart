import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Health', 'Other']

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ category: 'Food', monthly_limit: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await API.get('/api/budgets/')
      setBudgets(res.data)
    } catch (err) {
      setError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await API.post('/api/budgets/set', {
        category: formData.category,
        monthly_limit: parseFloat(formData.monthly_limit)
      })
      setSuccess(`Budget set for ${formData.category}!`)
      setFormData({ category: 'Food', monthly_limit: '' })
      fetchBudgets()
    } catch (err) {
      setError('Failed to set budget')
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/budgets/delete/${id}`)
      fetchBudgets()
    } catch (err) {
      setError('Failed to delete budget')
    }
  }

  // color based on percentage
  const getBarColor = (pct) => {
    if (pct >= 90) return '#E24B4A'
    if (pct >= 70) return '#EF9F27'
    return '#1D9E75'
  }

  const getPercentageColor = (pct) => {
    if (pct >= 90) return '#A32D2D'
    if (pct >= 70) return '#BA7517'
    return '#3B6D11'
  }

  const categoryEmoji = {
    Food: '🍔', Transport: '🚌', Shopping: '🛍️',
    Entertainment: '🎬', Education: '📚', Health: '💊', Other: '📌'
  }

  // total budget vs total spent
  const totalLimit = budgets.reduce((sum, b) => sum + b.monthly_limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalPct = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : 0

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Set Budget Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Set Monthly Budget</h2>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select
                style={styles.input}
                name='category'
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{categoryEmoji[cat]} {cat}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Monthly Limit (₹)</label>
              <input
                style={styles.input}
                type='number'
                placeholder='e.g. 5000'
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button style={styles.btn} type='submit'>
                Set Budget
              </button>
            </div>
          </form>
        </div>

        {/* Overall Summary */}
        {budgets.length > 0 && (
          <div style={styles.card}>
            <div style={styles.summaryRow}>
              <div>
                <div style={styles.summaryLabel}>Overall Budget Used</div>
                <div style={styles.summaryVal}>
                  ₹{totalSpent.toFixed(0)} 
                  <span style={{ color: '#888', fontWeight: '400' }}> / ₹{totalLimit.toFixed(0)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={styles.summaryLabel}>Remaining</div>
                <div style={{ ...styles.summaryVal, color: '#1D9E75' }}>
                  ₹{(totalLimit - totalSpent).toFixed(0)}
                </div>
              </div>
            </div>
            <div style={styles.barTrack}>
              <div style={{
                ...styles.barFill,
                width: `${Math.min(totalPct, 100)}%`,
                background: getBarColor(totalPct)
              }} />
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
              {totalPct}% of total budget used this month
            </div>
          </div>
        )}

        {/* Budget Goals List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Budget Goals — This Month</h2>

          {loading ? (
            <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
          ) : budgets.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>
              No budgets set yet. Add your first budget goal above!
            </p>
          ) : (
            budgets.map(b => (
              <div key={b.id} style={styles.budgetRow}>
                <div style={styles.budgetTop}>
                  <div style={styles.budgetLeft}>
                    <span style={styles.budgetEmoji}>{categoryEmoji[b.category] || '📌'}</span>
                    <span style={styles.budgetName}>{b.category}</span>
                  </div>
                  <div style={styles.budgetRight}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: getPercentageColor(b.percentage)
                    }}>
                      {b.percentage}% · ₹{b.spent} / ₹{b.monthly_limit}
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      style={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={styles.barTrack}>
                  <div style={{
                    ...styles.barFill,
                    width: `${Math.min(b.percentage, 100)}%`,
                    background: getBarColor(b.percentage)
                  }} />
                </div>

                <div style={styles.budgetMeta}>
                  <span style={{ color: '#888' }}>Remaining: ₹{b.remaining}</span>
                  {b.percentage >= 90 && (
                    <span style={styles.alertBadge}>⚠️ Almost over budget!</span>
                  )}
                  {b.percentage >= 100 && (
                    <span style={{ ...styles.alertBadge, background: '#FCEBEB', color: '#791F1F' }}>
                      🚨 Over budget!
                    </span>
                  )}
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
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '16px',
    alignItems: 'end',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#444',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
    background: '#fff',
  },
  btn: {
    padding: '10px 24px',
    background: '#534AB7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  error: {
    background: '#FCEBEB',
    color: '#791F1F',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  success: {
    background: '#E1F5EE',
    color: '#085041',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '4px',
  },
  summaryVal: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  barTrack: {
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  budgetRow: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f5f5f5',
  },
  budgetTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  budgetLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  budgetEmoji: {
    fontSize: '18px',
  },
  budgetName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  budgetRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  budgetMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
    fontSize: '12px',
  },
  alertBadge: {
    background: '#FAEEDA',
    color: '#633806',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
}

export default Budgets