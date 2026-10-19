
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Expense
from datetime import datetime

expenses_bp = Blueprint('expenses', __name__)


# Helper: Get the logged-in user's ID as an integer
def get_current_user_id():
    return int(get_jwt_identity())


# GET ALL EXPENSES — GET /api/expenses/
@expenses_bp.route('/', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_current_user_id()

    expenses = (
        Expense.query
        .filter_by(user_id=user_id)
        .order_by(Expense.date.desc())
        .all()
    )

    result = []
    for e in expenses:
        result.append({
            'id': e.id,
            'amount': e.amount,
            'category': e.category,
            'description': e.description,
            'date': e.date.strftime('%Y-%m-%d')
        })

    return jsonify(result), 200


# ADD EXPENSE — POST /api/expenses/add
@expenses_bp.route('/add', methods=['POST'])
@jwt_required()
def add_expense():
    user_id = get_current_user_id()
    data = request.get_json()

    if not data:
        return jsonify({'message': 'Request body must contain JSON'}), 400

    required_fields = ['amount', 'category', 'date']
    missing_fields = [
        field for field in required_fields if field not in data
    ]

    if missing_fields:
        return jsonify({
            'message': 'Missing required fields',
            'fields': missing_fields
        }), 400

    try:
        expense_date = datetime.strptime(
            data['date'], '%Y-%m-%d'
        ).date()
        amount = float(data['amount'])
    except (ValueError, TypeError):
        return jsonify({
            'message': 'Invalid amount or date format'
        }), 400

    new_expense = Expense(
        amount=amount,
        category=data['category'],
        description=data.get('description', ''),
        date=expense_date,
        user_id=user_id
    )

    try:
        db.session.add(new_expense)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({
        'message': 'Expense added!',
        'id': new_expense.id
    }), 201


# EDIT EXPENSE — PUT /api/expenses/edit/<id>
@expenses_bp.route('/edit/<int:expense_id>', methods=['PUT'])
@jwt_required()
def edit_expense(expense_id):
    user_id = get_current_user_id()

    expense = Expense.query.filter_by(
        id=expense_id,
        user_id=user_id
    ).first()

    if not expense:
        return jsonify({'message': 'Expense not found'}), 404

    data = request.get_json()

    if not data:
        return jsonify({'message': 'Request body must contain JSON'}), 400

    try:
        if 'amount' in data:
            expense.amount = float(data['amount'])

        if 'date' in data:
            expense.date = datetime.strptime(
                data['date'], '%Y-%m-%d'
            ).date()
    except (ValueError, TypeError):
        return jsonify({
            'message': 'Invalid amount or date format'
        }), 400

    if 'category' in data:
        expense.category = data['category']

    if 'description' in data:
        expense.description = data['description']

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({'message': 'Expense updated!'}), 200


# DELETE EXPENSE — DELETE /api/expenses/delete/<id>
@expenses_bp.route('/delete/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    user_id = get_current_user_id()

    expense = Expense.query.filter_by(
        id=expense_id,
        user_id=user_id
    ).first()

    if not expense:
        return jsonify({'message': 'Expense not found'}), 404

    try:
        db.session.delete(expense)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({'message': 'Expense deleted!'}), 200
