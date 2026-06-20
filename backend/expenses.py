from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Expense
from datetime import datetime

expenses_bp = Blueprint('expenses', __name__)


# GET ALL EXPENSES — GET /api/expenses/
@expenses_bp.route('/', methods=['GET'])
@jwt_required()  # only logged-in users can access this
def get_expenses():
    user_id = get_jwt_identity()  # gets the user id from the JWT token

    # fetch only THIS user's expenses, newest first
    expenses = Expense.query.filter_by(user_id=user_id)\
                            .order_by(Expense.date.desc()).all()

    # convert each expense object to a dictionary so we can send as JSON
    result = []
    for e in expenses:
        result.append({
            'id': e.id,
            'amount': e.amount,
            'category': e.category,
            'description': e.description,
            'date': e.date.strftime('%Y-%m-%d')  # format date as string
        })

    return jsonify(result), 200


# ADD EXPENSE — POST /api/expenses/add
@expenses_bp.route('/add', methods=['POST'])
@jwt_required()
def add_expense():
    user_id = get_jwt_identity()
    data = request.get_json()

    new_expense = Expense(
        amount=data['amount'],
        category=data['category'],
        description=data.get('description', ''),  # optional field
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        user_id=user_id
    )

    db.session.add(new_expense)
    db.session.commit()

    return jsonify({'message': 'Expense added!', 'id': new_expense.id}), 201


# EDIT EXPENSE — PUT /api/expenses/edit/<id>
@expenses_bp.route('/edit/<int:expense_id>', methods=['PUT'])
@jwt_required()
def edit_expense(expense_id):
    user_id = get_jwt_identity()

    # find the expense — must belong to this user
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({'message': 'Expense not found'}), 404

    data = request.get_json()

    # update only fields that were sent
    expense.amount = data.get('amount', expense.amount)
    expense.category = data.get('category', expense.category)
    expense.description = data.get('description', expense.description)
    if 'date' in data:
        expense.date = datetime.strptime(data['date'], '%Y-%m-%d').date()

    db.session.commit()

    return jsonify({'message': 'Expense updated!'}), 200


# DELETE EXPENSE — DELETE /api/expenses/delete/<id>
@expenses_bp.route('/delete/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    user_id = get_jwt_identity()

    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({'message': 'Expense not found'}), 404

    db.session.delete(expense)
    db.session.commit()

    return jsonify({'message': 'Expense deleted!'}), 200