import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Health', 'Other']

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  // read ?category= from the URL (e.g. coming from a "Set budget →" link on the Dashboard)
  // falls back to 'Food' if no valid category is present
  const [formData, setFormData] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    return { category: CATEGORIES.includes(cat) ? cat : 'Food', monthly_limit: '' }
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchBudgets() }, [])

  // ✅ FIX: Success message auto-disappears after 1 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 1000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // ✅ FIX: Error message auto-disappears after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 2000)
      return () => clearTimeout(timer)
    }
  }, [error])

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

    // ✅ FIX: Prevent negative or zero budget
    const limit = parseFloat(formData.monthly_limit)
    if (isNaN(limit) || limit <= 0) {
      setError('⚠️ Please enter a valid budget amount greater than 0')
      return
    }

    try {
      await API.post('/api/budgets/set', {
        category: formData.category,
        monthly_limit: limit
      })
      setSuccess(`✅ Budget set for ${formData.category}!`)
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

  const getBarColor = (pct) => pct >= 100 ? '#E24B4A' : pct >= 70 ? '#EF9F27' : '#1D9E75'
  const getPercentageColor = (pct) => pct >= 100 ? '#A32D2D' : pct >= 70 ? '#BA7517' : '#3B6D11'
  const categoryEmoji = {
    Food: '🍔', Transport: '🚌', Shopping: '🛍️',
    Entertainment: '🎬', Education: '📚', Health: '💊', Other: '📌'
  }

  const totalLimit = budgets.reduce((sum, b) => sum + b.monthly_limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalPct = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : 0
  const totalExtra = totalSpent > totalLimit ? (totalSpent - totalLimit).toFixed(0) : 0

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '40px 48px', maxWidth: '1300px', margin: '0 auto' }} className="page-container">

        <div style={styles.pageHeader} className="page-header">
          <div>
            <h1 style={styles.pageTitle}>Budgets</h1>
            <p style={styles.pageSub}>Set and track your monthly spending limits</p>
          </div>
          {budgets.length > 0 && (
            <div style={styles.summaryBadge}>
              <div style={styles.summaryBadgeLabel}>Monthly Budget</div>
              <div style={styles.summaryBadgeVal}>
                ₹{totalSpent.toFixed(0)}
                <span style={{ fontSize: '18px', fontWeight: '400', color: '#888' }}> / ₹{totalLimit.toFixed(0)}</span>
              </div>
              <div style={{ ...styles.summaryBadgeSub, color: totalSpent > totalLimit ? '#A32D2D' : '#aaa' }}>
                {totalSpent > totalLimit
                  ? `₹${totalExtra} over budget!`
                  : `${totalPct}% used`
                }
              </div>
            </div>
          )}
        </div>

        {/* Set Budget Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎯 Set Monthly Budget</h2>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.formRow} className="form-grid">
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
                style={{
                  ...styles.input,
                  borderColor: formData.monthly_limit && parseFloat(formData.monthly_limit) <= 0 ? '#E24B4A' : '#e0e0e0'
                }}
                type='number'
                placeholder='e.g. 5000'
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                min='1'
                step='1'
                required
              />
              {/* ✅ FIX: Inline warning for negative/zero */}
              {formData.monthly_limit && parseFloat(formData.monthly_limit) <= 0 && (
                <span style={styles.fieldError}>⚠️ Amount must be greater than 0</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button style={styles.btn} type='submit'>Set Budget</button>
            </div>
          </form>
        </div>

        {/* Overall Summary */}
        {budgets.length > 0 && (
          <div style={styles.card}>
            <div style={styles.summaryRow}>
              <div>
                <div style={styles.summaryLabel}>Overall Budget Used This Month</div>
                <div style={styles.summaryVal}>
                  ₹{totalSpent.toFixed(0)}
                  <span style={{ color: '#888', fontWeight: '400', fontSize: '20px' }}> / ₹{totalLimit.toFixed(0)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={styles.summaryLabel}>
                  {totalSpent > totalLimit ? 'Over by' : 'Remaining'}
                </div>
                <div style={{ ...styles.summaryVal, color: totalSpent > totalLimit ? '#A32D2D' : '#1D9E75' }}>
                  {totalSpent > totalLimit
                    ? `₹${totalExtra}`
                    : `₹${(totalLimit - totalSpent).toFixed(0)}`
                  }
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
            <div style={{ fontSize: '13px', color: totalSpent > totalLimit ? '#A32D2D' : '#888', marginTop: '8px' }}>
              {totalSpent > totalLimit
                ? `⚠️ You have exceeded your total monthly budget by ₹${totalExtra}`
                : `${totalPct}% of total budget used this month`
              }
            </div>
          </div>
        )}

        {/* Budget Goals List */}
        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h2 style={styles.cardTitle}>Budget Goals — This Month</h2>
            {budgets.length > 0 && (
              <span style={styles.countBadge}>{budgets.length} categories</span>
            )}
          </div>

          {loading ? (
            <p style={{ color: '#888', fontSize: '15px' }}>Loading...</p>
          ) : budgets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#444' }}>No budgets set yet</div>
              <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>Add your first budget goal above!</div>
            </div>
          ) : (
            budgets.map(b => {
              const extra = b.spent > b.monthly_limit
                ? (b.spent - b.monthly_limit).toFixed(0)
                : 0
              return (
                <div key={b.id} style={styles.budgetRow}>
                  <div style={styles.budgetTop}>
                    <div style={styles.budgetLeft}>
                      <div style={styles.budgetIconWrap}>
                        <span style={{ fontSize: '22px' }}>{categoryEmoji[b.category] || '📌'}</span>
                      </div>
                      <span style={styles.budgetName}>{b.category}</span>
                    </div>
                    <div style={styles.budgetRight}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: getPercentageColor(b.percentage) }}>
                        {b.percentage}%
                      </span>
                      <span style={{ fontSize: '14px', color: '#888' }}>
                        ₹{b.spent} / ₹{b.monthly_limit}
                      </span>
                      <button onClick={() => handleDelete(b.id)} style={styles.deleteBtn}>🗑️</button>
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
                    <span style={{ color: b.percentage >= 100 ? '#A32D2D' : '#888', fontSize: '13px' }}>
                      {b.percentage >= 100
                        ? `₹${extra} over budget!`
                        : `₹${b.remaining} remaining`
                      }
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {b.percentage >= 90 && b.percentage < 100 && (
                        <span style={styles.alertBadge}>⚠️ Almost over budget!</span>
                      )}
                      {b.percentage >= 100 && (
                        <span style={{ ...styles.alertBadge, background: '#FCEBEB', color: '#791F1F' }}>
                          🚨 ₹{extra} over budget!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  pageTitle: { fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' },
  pageSub: { fontSize: '16px', color: '#888' },
  summaryBadge: { background: '#fff', borderRadius: '16px', padding: '20px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', textAlign: 'right' },
  summaryBadgeLabel: { fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  summaryBadgeVal: { fontSize: '28px', fontWeight: '700', color: '#534AB7' },
  summaryBadgeSub: { fontSize: '13px', color: '#aaa', marginTop: '4px' },
  card: { background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '0' },
  listHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  countBadge: { fontSize: '13px', background: '#EEEDFE', color: '#534AB7', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#444' },
  input: { padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '15px', outline: 'none', color: '#333', background: '#fff' },
  fieldError: { fontSize: '12px', color: '#E24B4A', fontWeight: '500' },
  btn: { padding: '12px 32px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { background: '#FCEBEB', color: '#791F1F', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' },
  success: { background: '#E1F5EE', color: '#085041', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  summaryLabel: { fontSize: '13px', color: '#888', marginBottom: '6px' },
  summaryVal: { fontSize: '28px', fontWeight: '700', color: '#1a1a1a' },
  barTrack: { height: '10px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '5px', transition: 'width 0.3s ease' },
  budgetRow: { marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f5f5f5' },
  budgetTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  budgetLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  budgetIconWrap: { width: '42px', height: '42px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  budgetName: { fontSize: '16px', fontWeight: '500', color: '#1a1a1a' },
  budgetRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  budgetMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  alertBadge: { background: '#FAEEDA', color: '#633806', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px 8px', borderRadius: '8px' },
  emptyState: { textAlign: 'center', padding: '48px 0' },
}

export default Budgets