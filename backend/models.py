from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# TABLE 1: Users
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # stored as hash

    # One user has many expenses and budgets
    expenses = db.relationship('Expense', backref='user', lazy=True)
    budgets = db.relationship('Budget', backref='user', lazy=True)

# TABLE 2: Expenses
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Food, Transport etc
    description = db.Column(db.String(200))
    date = db.Column(db.Date, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# TABLE 3: Budget Goals
class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    monthly_limit = db.Column(db.Float, nullable=False)
    month = db.Column(db.Integer, nullable=False)   # 1-12
    year = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)