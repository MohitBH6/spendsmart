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

  // fetch expenses when page loads
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
      setSuccess('Expense added!')
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchExpenses() // refresh list
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
    Food: '#EEEDFE',
    Transport: '#E1F5EE',
    Shopping: '#FAEEDA',
    Entertainment: '#FCEBEB',
    Education: '#E6F1FB',
    Health: '#E1F5EE',
    Other: '#f5f5f5'
  }

  const categoryEmoji = {
    Food: '🍔', Transport: '🚌', Shopping: '🛍️',
    Entertainment: '🎬', Education: '📚', Health: '💊', Other: '📌'
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Add Expense Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add New Expense</h2>

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
                    <option key={cat} value={cat}>{cat}</option>
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
          <h2 style={styles.cardTitle}>Recent Transactions</h2>

          {loading ? (
            <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
          ) : expenses.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No expenses yet. Add your first one above!</p>
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
                  <div style={styles.expMeta}>{exp.category} · {exp.date}</div>
                </div>

                <div style={styles.expAmount}>-₹{exp.amount}</div>

                <button
                  onClick={() => handleDelete(exp.id)}
                  style={styles.deleteBtn}
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
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
  expenseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
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
  expName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  expMeta: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px',
  },
  expAmount: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#A32D2D',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
}

export default Expenses 