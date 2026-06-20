import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "spendsmart_secret_123"
    JWT_SECRET_KEY = "jwt_secret_mohit_456"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'spendsmart.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # token valid for 7 days — no more frequent logouts
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)