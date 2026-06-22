import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Health', 'Other']

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await API.post('/api/expenses/add', {
        ...formData,
        amount: parseFloat(formData.amount)
      })
      setSuccess('✅ Expense added successfully!')
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchExpenses()
    } catch (err) {
      setError('Failed to add expense')
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/expenses/delete/${id}`)
      fetchExpenses()
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
      <div style={{ padding: '40px 48px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={styles.pageHeader}>
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

        {/* Add Expense Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>➕ Add New Expense</h2>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Amount (₹)</label>
                <input
                  style={styles.input}
                  type='number'
                  name='amount'
                  placeholder='0.00'
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.input}
                  name='category'
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {categoryEmoji[cat]} {cat}
                    </option>
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
                  required
                />
              </div>
            </div>

            <button style={styles.btn} type='submit'>
              + Add Expense
            </button>
          </form>
        </div>

        {/* Expenses List */}
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
                <div style={{
                  ...styles.expIcon,
                  background: categoryColors[exp.category] || '#f5f5f5'
                }}>
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

                <button
                  onClick={() => handleDelete(exp.id)}
                  style={styles.deleteBtn}
                  title='Delete expense'
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '6px',
  },
  pageSub: {
    fontSize: '16px',
    color: '#888',
  },
  totalBadge: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px 28px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
  },
  totalVal: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#534AB7',
  },
  totalSub: {
    fontSize: '13px',
    color: '#aaa',
    marginTop: '4px',
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
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  countBadge: {
    fontSize: '13px',
    background: '#EEEDFE',
    color: '#534AB7',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '500',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#444',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    color: '#333',
    background: '#fff',
  },
  btn: {
    padding: '12px 32px',
    background: '#534AB7',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  error: {
    background: '#FCEBEB',
    color: '#791F1F',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  success: {
    background: '#E1F5EE',
    color: '#085041',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  expenseRow: {
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
  expName: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  expMeta: {
    fontSize: '13px',
    color: '#888',
    marginTop: '3px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  categoryTag: {
    background: '#f5f5f5',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#666',
  },
  expAmount: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#A32D2D',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 0',
  },
}

export default Expenses