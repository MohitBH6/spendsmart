from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Expense
from datetime import datetime, timedelta
import numpy as np

analytics_bp = Blueprint('analytics', __name__)


# ANOMALY DETECTION — GET /api/analytics/anomalies
@analytics_bp.route('/anomalies', methods=['GET'])
@jwt_required()
def detect_anomalies():
    user_id = get_jwt_identity()
    now = datetime.utcnow()

    # get last 90 days of expenses
    since = now - timedelta(days=90)
    expenses = Expense.query.filter(
        Expense.user_id == user_id,
        Expense.date >= since.date()
    ).all()

    if not expenses:
        return jsonify({'anomalies': [], 'message': 'Not enough data yet'}), 200

    # group expenses by category and week
    category_weeks = {}
    for e in expenses:
        cat = e.category
        # get week number
        week = e.date.isocalendar()[1]
        key = f"{cat}_{week}"

        if cat not in category_weeks:
            category_weeks[cat] = {}
        if week not in category_weeks[cat]:
            category_weeks[cat][week] = 0
        category_weeks[cat][week] += e.amount

    anomalies = []
    current_week = now.isocalendar()[1]

    for category, weeks in category_weeks.items():
        weekly_amounts = list(weeks.values())

        # need at least 3 weeks of data for meaningful anomaly detection
        if len(weekly_amounts) < 2:
            continue

        current_week_spend = weeks.get(current_week, 0)
        if current_week_spend == 0:
            continue

        # calculate mean and standard deviation
        mean = np.mean(weekly_amounts[:-1])  # exclude current week
        std = np.std(weekly_amounts[:-1])

        if std == 0:
            continue

        # z-score — how many standard deviations away from mean
        z_score = (current_week_spend - mean) / std

        # if z-score > 1.5, it's an anomaly
        if z_score > 1.5:
            anomalies.append({
                'category': category,
                'current_week_spend': round(current_week_spend, 2),
                'average_weekly_spend': round(mean, 2),
                'z_score': round(z_score, 2),
                'message': f"Your {category} spend this week (₹{round(current_week_spend)}) is {round(z_score, 1)}x above your weekly average of ₹{round(mean)}"
            })

    return jsonify({
        'anomalies': anomalies,
        'total_anomalies': len(anomalies)
    }), 200


# MONTHLY SUMMARY — GET /api/analytics/summary
@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def monthly_summary():
    user_id = get_jwt_identity()
    now = datetime.utcnow()

    # get this month's expenses
    expenses = Expense.query.filter(
        Expense.user_id == user_id,
        Expense.date >= datetime(now.year, now.month, 1).date()
    ).all()

    if not expenses:
        return jsonify({'message': 'No expenses this month yet'}), 200

    amounts = [e.amount for e in expenses]
    categories = {}

    for e in expenses:
        categories[e.category] = categories.get(e.category, 0) + e.amount

    # find top spending category
    top_category = max(categories, key=categories.get)

    # find biggest single expense
    biggest = max(expenses, key=lambda e: e.amount)

    return jsonify({
        'total_spent': round(sum(amounts), 2),
        'total_transactions': len(expenses),
        'average_transaction': round(np.mean(amounts), 2),
        'top_category': top_category,
        'top_category_amount': round(categories[top_category], 2),
        'biggest_expense': {
            'amount': biggest.amount,
            'description': biggest.description,
            'category': biggest.category,
            'date': biggest.date.strftime('%Y-%m-%d')
        },
        'daily_average': round(sum(amounts) / now.day, 2)
    }), 200