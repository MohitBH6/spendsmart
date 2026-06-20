from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Budget, Expense
from datetime import datetime

budgets_bp = Blueprint('budgets', __name__)


# GET ALL BUDGETS — GET /api/budgets/
@budgets_bp.route('/', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()

    # get current month and year automatically
    now = datetime.utcnow()

    budgets = Budget.query.filter_by(
        user_id=user_id,
        month=now.month,
        year=now.year
    ).all()

    result = []
    for b in budgets:

        # calculate how much already spent in this category this month
        spent = db.session.query(db.func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            Expense.category == b.category,
            db.extract('month', Expense.date) == now.month,
            db.extract('year', Expense.date) == now.year
        ).scalar() or 0  # if no expenses, return 0

        result.append({
            'id': b.id,
            'category': b.category,
            'monthly_limit': b.monthly_limit,
            'spent': round(spent, 2),
            'remaining': round(b.monthly_limit - spent, 2),
            'percentage': round((spent / b.monthly_limit) * 100, 1)
        })

    return jsonify(result), 200


# SET BUDGET — POST /api/budgets/set
@budgets_bp.route('/set', methods=['POST'])
@jwt_required()
def set_budget():
    user_id = get_jwt_identity()
    data = request.get_json()
    now = datetime.utcnow()

    # check if budget already exists for this category this month
    existing = Budget.query.filter_by(
        user_id=user_id,
        category=data['category'],
        month=now.month,
        year=now.year
    ).first()

    if existing:
        # just update the limit
        existing.monthly_limit = data['monthly_limit']
        db.session.commit()
        return jsonify({'message': 'Budget updated!'}), 200

    # create new budget
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


# DELETE BUDGET — DELETE /api/budgets/delete/<id>
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