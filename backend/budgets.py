from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Budget, Expense
from datetime import datetime

budgets_bp = Blueprint('budgets', __name__)


# Helper: Get the logged-in user's ID as an integer
def get_current_user_id():
    return int(get_jwt_identity())


# GET ALL BUDGETS — GET /api/budgets/
@budgets_bp.route('/', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_current_user_id()
    now = datetime.utcnow()

    # Accept month/year from frontend query parameters
    month = request.args.get('month', now.month, type=int)
    year = request.args.get('year', now.year, type=int)

    if not 1 <= month <= 12:
        return jsonify({'message': 'Month must be between 1 and 12'}), 400

    if year < 1:
        return jsonify({'message': 'Invalid year'}), 400

    budgets = Budget.query.filter_by(
        user_id=user_id,
        month=month,
        year=year
    ).all()

    result = []

    for b in budgets:
        spent = db.session.query(
            db.func.sum(Expense.amount)
        ).filter(
            Expense.user_id == user_id,
            Expense.category == b.category,
            db.extract('month', Expense.date) == month,
            db.extract('year', Expense.date) == year
        ).scalar() or 0

        spent = float(spent)

        result.append({
            'id': b.id,
            'category': b.category,
            'monthly_limit': float(b.monthly_limit),
            'spent': round(spent, 2),
            'remaining': round(float(b.monthly_limit) - spent, 2),
            'percentage': (
                round((spent / float(b.monthly_limit)) * 100, 1)
                if float(b.monthly_limit) > 0 else 0
            )
        })

    return jsonify(result), 200


# SET OR UPDATE BUDGET — POST /api/budgets/set
@budgets_bp.route('/set', methods=['POST'])
@jwt_required()
def set_budget():
    user_id = get_current_user_id()
    data = request.get_json(silent=True)

    if not data:
        return jsonify({'message': 'Request body must contain JSON'}), 400

    category = data.get('category')
    monthly_limit = data.get('monthly_limit')

    if not category or monthly_limit is None:
        return jsonify({
            'message': 'Category and monthly_limit are required'
        }), 400

    try:
        monthly_limit = float(monthly_limit)
    except (ValueError, TypeError):
        return jsonify({
            'message': 'Monthly limit must be a valid number'
        }), 400

    if monthly_limit <= 0:
        return jsonify({
            'message': 'Monthly limit must be greater than zero'
        }), 400

    now = datetime.utcnow()

    existing = Budget.query.filter_by(
        user_id=user_id,
        category=category,
        month=now.month,
        year=now.year
    ).first()

    try:
        if existing:
            existing.monthly_limit = monthly_limit
            db.session.commit()

            return jsonify({'message': 'Budget updated!'}), 200

        new_budget = Budget(
            category=category,
            monthly_limit=monthly_limit,
            month=now.month,
            year=now.year,
            user_id=user_id
        )

        db.session.add(new_budget)
        db.session.commit()

        return jsonify({
            'message': 'Budget set!',
            'id': new_budget.id
        }), 201

    except Exception:
        db.session.rollback()
        raise


# DELETE BUDGET — DELETE /api/budgets/delete/<id>
@budgets_bp.route('/delete/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    user_id = get_current_user_id()

    budget = Budget.query.filter_by(
        id=budget_id,
        user_id=user_id
    ).first()

    if not budget:
        return jsonify({'message': 'Budget not found'}), 404

    try:
        db.session.delete(budget)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({'message': 'Budget deleted!'}), 200
