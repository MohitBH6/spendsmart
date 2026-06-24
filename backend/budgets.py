from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Budget, Expense
from datetime import datetime

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('/', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    now = datetime.utcnow()

    # ✅ FIX: accept month/year from frontend query params
    month = request.args.get('month', now.month, type=int)
    year = request.args.get('year', now.year, type=int)

    budgets = Budget.query.filter_by(
        user_id=user_id,
        month=month,
        year=year
    ).all()

    result = []
    for b in budgets:
        spent = db.session.query(db.func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            Expense.category == b.category,
            db.extract('month', Expense.date) == month,
            db.extract('year', Expense.date) == year
        ).scalar() or 0

        result.append({
            'id': b.id,
            'category': b.category,
            'monthly_limit': b.monthly_limit,
            'spent': round(spent, 2),
            'remaining': round(b.monthly_limit - spent, 2),
            'percentage': round((spent / b.monthly_limit) * 100, 1) if b.monthly_limit > 0 else 0
        })

    return jsonify(result), 200


@budgets_bp.route('/set', methods=['POST'])
@jwt_required()
def set_budget():
    user_id = get_jwt_identity()
    data = request.get_json()
    now = datetime.utcnow()

    existing = Budget.query.filter_by(
        user_id=user_id,
        category=data['category'],
        month=now.month,
        year=now.year
    ).first()

    if existing:
        existing.monthly_limit = data['monthly_limit']
        db.session.commit()
        return jsonify({'message': 'Budget updated!'}), 200

    new_budget = Budget(
        category=data['category'],
        monthly_limit=data['monthly_limit'],
        month=now.month,
        year=now.year,
        user_id=user_id
    )
    db.session.add(new_budget)
    db.session.commit()
    return jsonify({'message': 'Budget set!', 'id': new_budget.id}), 201


@budgets_bp.route('/delete/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    user_id = get_jwt_identity()
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return jsonify({'message': 'Budget not found'}), 404
    db.session.delete(budget)
    db.session.commit()
    return jsonify({'message': 'Budget deleted!'}), 200