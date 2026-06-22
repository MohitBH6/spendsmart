# 💰 SpendSmart — Personal Finance Tracker

A full-stack web application to track daily expenses, set monthly budgets, and get smart spending insights with anomaly detection.

![Dashboard](https://via.placeholder.com/800x400?text=SpendSmart+Dashboard)

## 🚀 Live Demo
- Frontend: [Live Demo](https://spendsmart-swart.vercel.app)
- Backend API: [https://spendsmart-backend-jmwb.onrender.com](https://spendsmart-backend-jmwb.onrender.com)

---

## ✨ Features

- **📊 Visual Dashboard** — Pie chart category breakdown, budget progress bars, and key spending metrics
- **⚠️ Smart Anomaly Alerts** — Automatically detects unusual spending using Z-score statistical analysis
- **🎯 Budget Goals** — Set monthly limits per category with color-coded progress bars (green → orange → red)
- **📝 Expense Tracking** — Add, view, and delete expenses with category, description, and date
- **📅 Date Filters** — Filter dashboard by This Week / This Month / Last Month / All Time / Custom Month
- **🔒 Secure Authentication** — JWT-based login with Werkzeug password hashing
- **📈 Monthly Insights** — Total spent, remaining budget, transaction count, and daily averages

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Chart.js + react-chartjs-2
- React Router DOM
- Axios

### Backend
- Python
- Flask
- Flask-JWT-Extended
- Flask-CORS
- SQLAlchemy ORM

### Database
- SQLite (development)

### Analytics
- NumPy (Z-score anomaly detection)
- Pandas

---

## 📁 Project Structure

spendsmart/

├── backend/

│   ├── app.py          # Flask entry point

│   ├── config.py       # Configuration & DB settings

│   ├── models.py       # Database models (User, Expense, Budget)

│   ├── auth.py         # Register & Login API routes

│   ├── expenses.py     # Expense CRUD API routes

│   ├── budgets.py      # Budget goals API routes

│   ├── analytics.py    # Anomaly detection & monthly summary

│   └── requirements.txt

├── frontend/

│   └── src/

│       ├── pages/

│       │   ├── Dashboard.js

│       │   ├── Expenses.js

│       │   ├── Budgets.js

│       │   ├── Login.js

│       │   ├── Register.js

│       │   └── About.js

│       ├── components/

│       │   ├── Navbar.js

│       │   └── PrivateRoute.js

│       └── api/

│           └── axios.js

└── README.md

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- Git

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/spendsmart.git
cd spendsmart/backend

# Install dependencies
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors werkzeug numpy

# Run Flask server
python app.py
# Server runs at http://localhost:5000
```

### Frontend Setup

```bash
cd spendsmart/frontend

# Install dependencies
npm install

# Start React app
npm start
# App runs at http://localhost:3000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/` | Get all expenses |
| POST | `/api/expenses/add` | Add new expense |
| PUT | `/api/expenses/edit/<id>` | Edit expense |
| DELETE | `/api/expenses/delete/<id>` | Delete expense |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets/` | Get all budgets with spending |
| POST | `/api/budgets/set` | Set or update budget |
| DELETE | `/api/budgets/delete/<id>` | Delete budget |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/anomalies` | Detect spending anomalies |
| GET | `/api/analytics/summary` | Monthly spending summary |

---

## 📊 How Anomaly Detection Works

SpendSmart uses **Z-score statistical analysis** to detect unusual spending:

1. Groups your expenses by category and week for the last 90 days
2. Calculates the **mean** and **standard deviation** of weekly spending per category
3. Computes the **Z-score** for the current week's spending
4. If Z-score > 1.5 → flags it as an anomaly with a detailed alert message

```python
z_score = (current_week_spend - mean) / std
if z_score > 1.5:
    # trigger alert
```

---

## 👨‍💻 Developer

**Mohit Kumar**
BE (Computer Science & Engineering) — Panjab University, Chandigarh

- 📧 mohitpegowal293@gmail.com
- 🐙 [GitHub](https://github.com/MohitBH6)
---

