from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)

# Initialize all extensions
db.init_app(app)
CORS(app)
jwt = JWTManager(app)

# Import and register route files (we'll create these next)
from auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')

from expenses import expenses_bp
app.register_blueprint(expenses_bp, url_prefix='/api/expenses')

# Import and register budgets blueprint
from budgets import budgets_bp
app.register_blueprint(budgets_bp, url_prefix='/api/budgets')

from analytics import analytics_bp
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

# Create all database tables on first run
with app.app_context():
    db.create_all()
    print("Database tables created!")

if __name__ == '__main__':
    app.run(debug=True)