import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Health', 'Other']

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [budgetAlert, setBudgetAlert] = useState('')

  // date helpers
  const today = new Date().toISOString().split('T')[0]
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: today
  })

  useEffect(() => {
    fetchExpenses()
    fetchBudgets()
  }, [])

  // auto clear success after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // auto clear budget alert after 5 seconds
  useEffect(() => {
    if (budgetAlert) {
      const timer = setTimeout(() => setBudgetAlert(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [budgetAlert])

  const fetchExpenses = async () => {
    try {
      const res = await API.get('/api/expenses/')
      setExpenses(res.data)
    } catch (err) {
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgets = async () => {
    try {
      const res = await API.get('/api/budgets/')
      setBudgets(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // check if adding this expense exceeds budget
  const checkBudgetAlert = (category, amount) => {
    const budget = budgets.find(b => b.category === category)
    if (!budget || budget.monthly_limit === 0) return null

    const newSpent = budget.spent + amount
    if (newSpent > budget.monthly_limit) {
      const extra = (newSpent - budget.monthly_limit).toFixed(0)
      return `⚠️ Budget exceeded for ${category}! You are ₹${extra} over your ₹${budget.monthly_limit} budget.`
    }
    if (newSpent / budget.monthly_limit > 0.8) {
      const remaining = (budget.monthly_limit - newSpent).toFixed(0)
      return `⚠️ You're close to your ${category} budget limit! Only ₹${remaining} remaining.`
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBudgetAlert('')

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('⚠️ Please enter a valid amount greater than 0')
      return
    }

    // date validation
    if (formData.date > today) {
      setError('⚠️ Cannot add expense for a future date')
      return
    }
    if (formData.date < oneWeekAgo) {
      setError('⚠️ Cannot add expense older than 7 days')
      return
    }

    setAdding(true)
    try {
      await API.post('/api/expenses/add', { ...formData, amount })
      setSuccess('✅ Expense added successfully!')

      // check budget after adding
      const alert = checkBudgetAlert(formData.category, amount)
      if (alert) setBudgetAlert(alert)

      setFormData({ amount: '', category: 'Food', description: '', date: today })
      fetchExpenses()
      fetchBudgets()
    } catch (err) {
      setError('Failed to add expense')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/expenses/delete/${id}`)
      fetchExpenses()
      fetchBudgets()
    } catch (err) {
      setError('Failed to delete expense')
    }
  }

  const categoryColors = {
    Food: '#EEEDFE', Transport: '#E1F5EE', Shopping: '#FAEEDA',
    Entertainment: '#FCEBEB', Education: '#E6F1FB', Health: '#E1F5EE', Other: '#f5f5f5'
  }

  const categoryEmoji = {
    Food: '🍔', Transport: '🚌', Shopping: '🛍️',
    Entertainment: '🎬', Education: '📚', Health: '💊', Other: '📌'
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '40px 48px', maxWidth: '1300px', margin: '0 auto' }} className="page-container">

        <div style={styles.pageHeader} className="page-header">
          <div>
            <h1 style={styles.pageTitle}>Expenses</h1>
            <p style={styles.pageSub}>Track and manage your daily spending</p>
          </div>
          <div style={styles.totalBadge}>
            <div style={styles.totalLabel}>Total Spent</div>
            <div style={styles.totalVal}>₹{totalSpent.toFixed(0)}</div>
            <div style={styles.totalSub}>{expenses.length} transactions</div>
          </div>
        </div>

        {/* Budget exceeded alert */}
        {budgetAlert && (
          <div style={styles.budgetAlertBox}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={styles.budgetAlertText}>{budgetAlert}</div>
            </div>
            <button onClick={() => setBudgetAlert('')} style={styles.closeBtn}>✕</button>
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>➕ Add New Expense</h2>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid} className="form-grid">
              <div style={styles.inputGroup}>
                <label style={styles.label}>Amount (₹)</label>
                <input
                  style={{
                    ...styles.input,
                    borderColor: formData.amount && parseFloat(formData.amount) <= 0 ? '#E24B4A' : '#e0e0e0'
                  }}
                  type='number'
                  name='amount'
                  placeholder='0.00'
                  value={formData.amount}
                  onChange={handleChange}
                  min='0.01'
                  step='0.01'
                  required
                />
                {formData.amount && parseFloat(formData.amount) <= 0 && (
                  <span style={styles.fieldError}>⚠️ Amount must be greater than 0</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select style={styles.input} name='category' value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{categoryEmoji[cat]} {cat}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <input
                  style={styles.input}
                  type='text'
                  name='description'
                  placeholder='What did you spend on?'
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Date</label>
                <input
                  style={styles.input}
                  type='date'
                  name='date'
                  value={formData.date}
                  onChange={handleChange}
                  min={oneWeekAgo}
                  max={today}
                  required
                />
                <span style={styles.dateHint}>Only last 7 days allowed</span>
              </div>
            </div>

            <button style={adding ? styles.btnDisabled : styles.btn} type='submit' disabled={adding}>
              {adding ? '⏳ Adding...' : '+ Add Expense'}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h2 style={styles.cardTitle}>Recent Transactions</h2>
            <span style={styles.countBadge}>{expenses.length} total</span>
          </div>

          {loading ? (
            <p style={{ color: '#888', fontSize: '15px' }}>Loading...</p>
          ) : expenses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#444' }}>No expenses yet</div>
              <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>Add your first expense above!</div>
            </div>
          ) : (
            expenses.map(exp => (
              <div key={exp.id} style={styles.expenseRow}>
                <div style={{ ...styles.expIcon, background: categoryColors[exp.category] || '#f5f5f5' }}>
                  {categoryEmoji[exp.category] || '📌'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.expName}>{exp.description || exp.category}</div>
                  <div style={styles.expMeta}>
                    <span style={styles.categoryTag}>{exp.category}</span>
                    <span>·</span>
                    <span>{exp.date}</span>
                  </div>
                </div>
                <div style={styles.expAmount}>-₹{exp.amount}</div>
                <button onClick={() => handleDelete(exp.id)} style={styles.deleteBtn} title='Delete'>🗑️</button>
              </div>
            ))
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
  totalBadge: { background: '#fff', borderRadius: '16px', padding: '20px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', textAlign: 'right' },
  totalLabel: { fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  totalVal: { fontSize: '28px', fontWeight: '700', color: '#534AB7' },
  totalSub: { fontSize: '13px', color: '#aaa', marginTop: '4px' },
  budgetAlertBox: {
    background: '#FCEBEB', border: '1px solid #F5A5A5', borderRadius: '12px',
    padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center',
    marginBottom: '20px',
  },
  budgetAlertText: { fontSize: '14px', color: '#791F1F', fontWeight: '500' },
  closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888', padding: '0 4px' },
  card: { background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' },
  listHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  countBadge: { fontSize: '13px', background: '#EEEDFE', color: '#534AB7', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#444' },
  input: { padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '15px', outline: 'none', color: '#333', background: '#fff' },
  fieldError: { fontSize: '12px', color: '#E24B4A', fontWeight: '500' },
  dateHint: { fontSize: '11px', color: '#aaa' },
  btn: { padding: '12px 32px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
  btnDisabled: { padding: '12px 32px', background: '#a9a4d8', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'not-allowed' },
  error: { background: '#FCEBEB', color: '#791F1F', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' },
  success: { background: '#E1F5EE', color: '#085041', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' },
  expenseRow: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f5f5f5' },
  expIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
  expName: { fontSize: '15px', fontWeight: '500', color: '#1a1a1a' },
  expMeta: { fontSize: '13px', color: '#888', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' },
  categoryTag: { background: '#f5f5f5', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', color: '#666' },
  expAmount: { fontSize: '16px', fontWeight: '600', color: '#A32D2D' },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px', borderRadius: '8px' },
  emptyState: { textAlign: 'center', padding: '48px 0' },
}

export default Expenses